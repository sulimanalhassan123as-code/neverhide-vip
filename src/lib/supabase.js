import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
const serviceRoleKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY

export const isSupabaseReady = !!(supabaseUrl && supabaseAnonKey)

// Public client — used for submitting unlock requests
export const supabase = isSupabaseReady
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

// Admin client (service role, bypasses RLS) — used only in the /admin panel
export const supabaseAdmin = (isSupabaseReady && serviceRoleKey)
  ? createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } })
  : supabase

export default supabase
