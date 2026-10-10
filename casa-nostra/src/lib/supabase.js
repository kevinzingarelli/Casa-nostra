import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// L'app non deve mai crashare se le chiavi non sono ancora impostate su Vercel.
// Mostriamo invece un messaggio chiaro all'utente (ConfigNotice).
export const isSupabaseConfigured = Boolean(url && /^https:\/\//.test(url) && anonKey && anonKey !== '[SENSITIVE]')

export const supabase = isSupabaseConfigured
  ? createClient(url, anonKey, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false },
    })
  : null

export async function checkCloudConnection() {
  if (!isSupabaseConfigured) return false
  try {
    const response = await fetch(`${url}/auth/v1/settings`, { headers: { apikey: anonKey }, signal: AbortSignal.timeout(6000) })
    return response.ok
  } catch { return false }
}
