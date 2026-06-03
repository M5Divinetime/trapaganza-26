import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL  = import.meta.env.VITE_SUPABASE_URL  || ''
const SUPABASE_ANON = import.meta.env.VITE_SUPABASE_ANON || ''

const isConfigured = SUPABASE_URL && SUPABASE_URL.startsWith('http')

// Full no-op fallback client so the app doesn't crash when env vars are missing
function createNoopSupabase() {
  const chainedThen = () => Promise.resolve({ data: null, error: null })

  const builder = {
    select: () => builder,
    insert: () => Promise.resolve({ data: null, error: null }),
    update: () => builder,
    delete: () => builder,
    upsert: () => Promise.resolve({ data: null, error: null }),
    eq: () => builder,
    neq: () => builder,
    order: () => builder,
    limit: () => builder,
    maybeSingle: () => Promise.resolve({ data: null, error: null }),
    single: () => Promise.resolve({ data: null, error: null }),
    then: chainedThen,
    catch: () => builder,
    finally: () => builder,
  }

  return {
    from: () => builder,
    channel: () => ({ on: () => ({ subscribe: () => {} }), subscribe: () => {}, removeChannel: () => {} }),
    auth: {},
  }
}

export const supabase = isConfigured
  ? createClient(SUPABASE_URL, SUPABASE_ANON)
  : createNoopSupabase()
