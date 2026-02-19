import { createBrowserClient } from '@supabase/ssr'
// Sesuaikan path import ini dengan lokasi file types kamu
import { Database } from '@/types/supabase' 

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}