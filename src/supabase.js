import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL  = import.meta.env.VITE_SUPABASE_URL  || ''
const SUPABASE_ANON = import.meta.env.VITE_SUPABASE_ANON || ''

const isConfigured = SUPABASE_URL.startsWith('http')

export const supabase = isConfigured
  ? createClient(SUPABASE_URL, SUPABASE_ANON)
  : { from: () => ({ select: () => Promise.resolve({ data: [], error: null }),
                      insert: () => Promise.resolve({ data: null, error: null }),
                      update: () => ({ eq: () => ({ order: () => ({ limit: () => ({ then: () => {} }) }) }) }),
                    }) }
