import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const isSupabaseReady = !!(supabaseUrl && supabaseAnonKey)

// Public client — used for submitting unlock requests, bookings, promo redemption.
// The anon key is designed to be public; row-level security policies protect the data.
export const supabase = isSupabaseReady
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

// All admin operations (viewing/approving requests, managing promo codes and bookings)
// go through this server-side API route. The Supabase service_role key and the admin
// password live ONLY on the server (Vercel serverless function env vars) and are never
// bundled into the browser JavaScript.
export async function adminApi(password, action, payload = {}) {
  const res = await fetch('/api/admin', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password, action, payload }),
  })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(json.error || 'Request failed')
  return json.data
}

export default supabase
