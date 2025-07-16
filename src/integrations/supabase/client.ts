// src/lib/supabaseClient.ts (Example for Next.js - RECOMMENDED APPROACH)

import { createClient } from '@supabase/supabase-js';

// Get environment variables.
// These variables MUST be prefixed with NEXT_PUBLIC_ for client-side access in Next.js
// If using another framework, adjust the prefix (e.g., REACT_APP_, VITE_)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY; // This typically holds your publishable key

// Basic validation (optional, but good for debugging)
if (!supabaseUrl) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL environment variable!");
  // Consider throwing an error or handling this more gracefully in a real app
}
if (!supabaseAnonKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable!");
}

export const supabase = createClient(supabaseUrl as string, supabaseAnonKey as string);
