
import { createClient } from '@supabase/supabase-js';

// Get environment variables for Vite.
// These variables MUST be prefixed with VITE_ for client-side access in Vite.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Basic validation (optional, but good for debugging)
if (!supabaseUrl) {
  console.error("Missing VITE_SUPABASE_URL environment variable!");
}
if (!supabaseAnonKey) {
  console.error("Missing VITE_SUPABASE_ANON_KEY environment variable!");
}

export const supabase = createClient(supabaseUrl as string, supabaseAnonKey as string);
