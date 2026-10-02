import { createClient, SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

// ── Environment Variables & Safe Build-Time Fallbacks ────────────────────────
// In production/local development, values come from .env.local:
//   NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
//   NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_...
// During CI/CD and Next.js static page prerendering (e.g. Vercel build),
// safe placeholder strings prevent `createClient` from throwing `supabaseUrl is required`.
// ─────────────────────────────────────────────────────────────────────────────
const FALLBACK_URL = "https://placeholder-project.supabase.co";
const FALLBACK_KEY = "placeholder-anon-key";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || FALLBACK_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || FALLBACK_KEY;

export const isSupabaseConfigured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

if (!isSupabaseConfigured && typeof window !== "undefined") {
  console.warn(
    "[LifeSync] NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY not set. Running in local-first offline mode."
  );
}

declare global {
  // eslint-disable-next-line no-var
  var __supabase_instance: SupabaseClient<Database> | undefined;
}

/**
 * Centralized, singleton Supabase client instance.
 * Server/Build: stateless per-request client with safe fallback url.
 * Browser: singleton with auto token refresh.
 */
function getSupabaseClient(): SupabaseClient<Database> {
  if (typeof window === "undefined") {
    // Server / Prerender build environment — stateless, per-request client
    return createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false },
    });
  }

  // Browser — retain global singleton across HMR
  if (!globalThis.__supabase_instance) {
    globalThis.__supabase_instance = createClient<Database>(supabaseUrl, supabaseAnonKey, {
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
