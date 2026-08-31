import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://zhinczakcuzygovajtab.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable__qCF8gEhXBJMWt8iiFJaHw_-1lKwYlY";

export function createClient() {
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
