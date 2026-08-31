import { createClient, SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://zhinczakcuzygovajtab.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable__qCF8gEhXBJMWt8iiFJaHw_-1lKwYlY";

declare global {
  // eslint-disable-next-line no-var
  var __supabase_instance: SupabaseClient<Database> | undefined;
}

/**
 * Centralized, singleton Supabase client instance.
 * Ensures a single shared connection across Client Components, Server Components, and HMR reloads.
 */
function getSupabaseClient(): SupabaseClient<Database> {
  if (typeof window === "undefined") {
    // Server environment — create stateless per-request client instance
    return createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false },
    });
  }

  // Browser environment — retain global singleton instance
  if (!globalThis.__supabase_instance) {
    globalThis.__supabase_instance = createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: true, autoRefreshToken: true },
    });
  }
  return globalThis.__supabase_instance;
}

export const supabase = getSupabaseClient();
