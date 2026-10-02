import { createClient, SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

// ── Credentials must come from environment variables ────────────────────────
// NEVER hard-code these values here. Set them in .env.local:
//   NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
//   NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_...
// ────────────────────────────────────────────────────────────────────────────
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  // Fail fast at module load time so the missing config is surfaced immediately.
  // This will only throw if BOTH variables are absent (e.g., CI without .env.local).
  if (typeof window !== "undefined") {
    console.error(
      "[LifeSync] NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be set in .env.local"
    );
  }
}

declare global {
  // eslint-disable-next-line no-var
  var __supabase_instance: SupabaseClient<Database> | undefined;
}

/**
 * Centralized, singleton Supabase client instance.
 * Server: stateless per-request (no session persistence).
 * Browser: singleton with auto token refresh.
 */
function getSupabaseClient(): SupabaseClient<Database> {
  const url = supabaseUrl ?? "";
  const key = supabaseAnonKey ?? "";

  if (typeof window === "undefined") {
    // Server environment — stateless, per-request client
    return createClient<Database>(url, key, {
      auth: { persistSession: false },
    });
  }

  // Browser — retain global singleton to avoid re-creating on HMR
  if (!globalThis.__supabase_instance) {
    globalThis.__supabase_instance = createClient<Database>(url, key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storageKey: "lifesync_auth_session",
      },
    });
  }
  return globalThis.__supabase_instance;
}

export const supabase = getSupabaseClient();
