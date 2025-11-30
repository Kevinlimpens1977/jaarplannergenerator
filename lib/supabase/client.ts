import { createClient } from '@supabase/supabase-js';
import { Database } from '@/lib/types/database';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    'Supabase URL en Anon Key zijn vereist. Zorg ervoor dat je .env.local bestand correct is ingesteld.'
  );
}

// Client voor client-side gebruik
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient<Database>(supabaseUrl, supabaseAnonKey)
  : null as any;

// Voor server-side gebruik (Server Components, API Routes)
export function createServerClient() {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase credentials are not configured');
  }
  return createClient<Database>(supabaseUrl, supabaseAnonKey);
}
