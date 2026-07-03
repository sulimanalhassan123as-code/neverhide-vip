-- ============================================
-- Never Hide VIP Access Hub — full migration
-- Run this entire script once in Supabase SQL Editor
-- ============================================

create table if not exists public.unlock_requests (
  id uuid primary key default gen_random_uuid(),
  site_key text not null,
  site_name text not null,
  full_name text not null,
  phone text not null,
  momo_ref text,
  promo_code text,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  approved_at timestamptz,
  expires_at timestamptz
);

alter table public.unlock_requests enable row level security;

drop policy if exists "Anyone can submit unlock requests" on public.unlock_requests;
create policy "Anyone can submit unlock requests"
  on public.unlock_requests for insert
  to public
  with check (true);

-- ============================================
-- Promo codes
-- ============================================

create table if not exists public.promo_codes (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  note text,
  max_uses int,
  uses_count int not null default 0,
  active boolean not null default true,
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.promo_codes enable row level security;
-- No direct public access — only reachable through the redeem_promo_code() function below,
-- and through the admin panel (which uses the service role key).

create or replace function public.redeem_promo_code(
  p_code text,
  p_site_key text,
  p_site_name text,
  p_full_name text,
  p_phone text
) returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_promo record;
begin
  select * into v_promo from public.promo_codes where lower(code) = lower(trim(p_code)) for update;

  if not found then
    return json_build_object('success', false, 'message', 'Invalid promo code');
  end if;

  if not v_promo.active then
    return json_build_object('success', false, 'message', 'This promo code is no longer active');
  end if;

  if v_promo.expires_at is not null and v_promo.expires_at < now() then
    return json_build_object('success', false, 'message', 'This promo code has expired');
  end if;

  if v_promo.max_uses is not null and v_promo.uses_count >= v_promo.max_uses then
    return json_build_object('success', false, 'message', 'This promo code has reached its usage limit');
  end if;

  update public.promo_codes set uses_count = uses_count + 1 where id = v_promo.id;

  insert into public.unlock_requests (site_key, site_name, full_name, phone, promo_code, status, approved_at, expires_at)
  values (p_site_key, p_site_name, p_full_name, p_phone, v_promo.code, 'approved', now(), now() + interval '24 hours');

  return json_build_object('success', true, 'message', 'Promo code accepted! VIP access is active for 24 hours.');
end;
$$;

grant execute on function public.redeem_promo_code(text, text, text, text, text) to anon;

-- ============================================
-- Service bookings (Book a Custom Service)
-- ============================================

create table if not exists public.service_bookings (
  id uuid primary key default gen_random_uuid(),
  service_key text not null,
  service_label text not null,
  full_name text not null,
  phone text not null,
  details text,
  status text not null default 'new',
  created_at timestamptz not null default now()
);

alter table public.service_bookings enable row level security;

drop policy if exists "Anyone can submit bookings" on public.service_bookings;
create policy "Anyone can submit bookings"
  on public.service_bookings for insert
  to public
  with check (true);
