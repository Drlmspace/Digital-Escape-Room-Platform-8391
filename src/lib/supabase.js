import { createClient } from '@supabase/supabase-js'

// Project credentials from Supabase
const SUPABASE_URL = 'https://nyvphlwjznuyutpmgkvm.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im55dnBobHdqem51eXV0cG1na3ZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE0ODYyNzgsImV4cCI6MjA2NzA2MjI3OH0.qb92P1Jkh8lxg2ONm8FYXqvoHdtTatepc4K0AsncTrw'

if(!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

export default supabase;