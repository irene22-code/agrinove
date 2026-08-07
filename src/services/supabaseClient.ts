import { createClient } from '@supabase/supabase-js';

// We use a getter function to implement lazy initialization.
// This prevents the application from crashing on startup if the API keys are missing,
// while still providing a clear error when a component actually tries to use the database.
let supabaseInstance: any = null;

export const getSupabaseClient = () => {
  if (supabaseInstance) return supabaseInstance;

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey || supabaseUrl === 'YOUR_SUPABASE_URL') {
    console.warn('Supabase credentials are not configured. Please update your environment variables.');
    throw new Error('Supabase is not configured yet. Check your environment setup.');
  }

  supabaseInstance = createClient<any>(supabaseUrl, supabaseAnonKey);
  return supabaseInstance;
};
