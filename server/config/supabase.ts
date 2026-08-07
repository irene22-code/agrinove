import { createClient } from '@supabase/supabase-js';

let adminSupabaseInstance: any | null = null;

/**
 * Returns an admin-level Supabase client for backend operations.
 * Uses the Service Role Key which bypasses Row Level Security (RLS).
 * NEVER expose this key to the frontend.
 */
export const getAdminSupabaseClient = () => {
  if (adminSupabaseInstance) return adminSupabaseInstance as any;

  // We read from process.env in the Node.js backend
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey || supabaseUrl === 'YOUR_SUPABASE_URL') {
    console.warn('Backend Supabase credentials are not configured. Please update your environment variables.');
    throw new Error('Supabase Admin Client is not configured yet. Check your backend environment setup.');
  }

  adminSupabaseInstance = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
  
  return adminSupabaseInstance as any;
};
