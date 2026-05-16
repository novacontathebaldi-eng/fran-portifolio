
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        persistSession: true,
        storageKey: (import.meta as any).env.VITE_APP_STORAGE_KEY || 'fran-siller-auth', // Fallback to avoid logging out existing users, use env for new templates
        autoRefreshToken: true,
        detectSessionInUrl: true,
    }
});