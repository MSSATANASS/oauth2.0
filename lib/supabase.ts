import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  // Use console.warn in development or testing if env not set
  if (process.env.NODE_ENV !== 'test') {
    console.warn('Missing Supabase environment variables');
  }
}

// Fallback for tests if env vars missing
const url = supabaseUrl || 'https://mock.supabase.co';
const key = supabaseKey || 'mock-key';

export const supabase = createClient(url, key);

// Export a mock query function for backward compatibility with tests if needed, 
// but primarily we should use `supabase` client directly.
// We remove `query` export to force refactoring to use Supabase client.