import { createClient } from '@supabase/supabase-js'

// Safe environment variable access
const getEnvVar = (key, fallback = '') => {
  try {
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      return import.meta.env[key] || fallback;
    }
    return fallback;
  } catch (error) {
    console.warn('Environment variable access failed:', error);
    return fallback;
  }
};

// Demo credentials for fallback
const DEMO_SUPABASE_URL = 'https://nyvphlwjznuyutpmgkvm.supabase.co';
const DEMO_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im55dnBobHdqem51eXV0cG1na3ZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE0ODYyNzgsImV4cCI6MjA2NzA2MjI3OH0.qb92P1Jkh8lxg2ONm8FYXqvoHdtTatepc4K0AsncTrw';

const SUPABASE_URL = getEnvVar('VITE_SUPABASE_URL', DEMO_SUPABASE_URL);
const SUPABASE_ANON_KEY = getEnvVar('VITE_SUPABASE_ANON_KEY', DEMO_SUPABASE_ANON_KEY);

// Create mock client for fallback
const createMockClient = () => ({
  from: () => ({
    select: () => Promise.resolve({ data: [], error: null }),
    insert: () => Promise.resolve({ data: [], error: null }),
    update: () => Promise.resolve({ data: [], error: null }),
    delete: () => Promise.resolve({ data: [], error: null }),
    upsert: () => Promise.resolve({ data: [], error: null }),
    eq: function() { return this; },
    neq: function() { return this; },
    single: function() { return this; },
    order: function() { return this; },
    limit: function() { return this; }
  }),
  channel: () => ({
    on: function() { return this; },
    subscribe: () => ({ unsubscribe: () => {} })
  }),
  removeChannel: () => {},
  auth: {
    getSession: () => Promise.resolve({ data: { session: null }, error: null }),
    signIn: () => Promise.resolve({ data: null, error: null }),
    signOut: () => Promise.resolve({ error: null })
  }
});

// Initialize Supabase client with error handling
let supabase;
try {
  if (SUPABASE_URL && SUPABASE_ANON_KEY && SUPABASE_URL !== 'your_supabase_url_here') {
    supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false
      },
      global: {
        headers: {
          'X-Client-Info': 'allfun-escape-room'
        }
      }
    });
  } else {
    console.warn('Using mock Supabase client - database features disabled');
    supabase = createMockClient();
  }
} catch (error) {
  console.warn('Failed to initialize Supabase client, using mock client:', error);
  supabase = createMockClient();
}

export { supabase };
export default supabase;