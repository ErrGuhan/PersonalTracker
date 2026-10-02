import { supabase, isSupabaseConfigured } from "./supabase";

export type DbConnectionStatus = "connected" | "connecting" | "offline" | "unreachable" | "unconfigured";

export interface DbStatusInfo {
  status: DbConnectionStatus;
  host: string;
  latencyMs?: number;
  message: string;
  isLocalOnly: boolean;
  lastChecked: number;
}

const STORAGE_KEY_CUSTOM_URL = "lifesync_custom_supabase_url";
const STORAGE_KEY_CUSTOM_KEY = "lifesync_custom_supabase_key";

let cachedStatus: DbStatusInfo = {
  status: "connecting",
  host: "loading...",
  message: "Initializing connection...",
  isLocalOnly: false,
  lastChecked: 0,
};

let circuitOpen = false;
let checkPromise: Promise<DbStatusInfo> | null = null;
const listeners = new Set<(status: DbStatusInfo) => void>();

function notify(info: DbStatusInfo) {
  cachedStatus = info;
  listeners.forEach((fn) => {
    try { fn(info); } catch {}
  });
}

export function subscribeDbStatus(fn: (status: DbStatusInfo) => void): () => void {
  listeners.add(fn);
  fn(cachedStatus);
  return () => { listeners.delete(fn); };
}

export function getActiveSupabaseConfig(): { url: string; key: string } {
  if (typeof window !== "undefined") {
    const customUrl = localStorage.getItem(STORAGE_KEY_CUSTOM_URL);
    const customKey = localStorage.getItem(STORAGE_KEY_CUSTOM_KEY);
    if (customUrl && customKey) {
      return { url: customUrl.trim(), key: customKey.trim() };
    }
  }
  return {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL || "https://zhinczakcuzygovajtab.supabase.co",
    key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
  };
}

export function canAttemptRemote(): boolean {
  if (circuitOpen) return false;
  if (!isSupabaseConfigured && !hasCustomCredentials()) return false;
  return true;
}

export function hasCustomCredentials(): boolean {
  if (typeof window === "undefined") return false;
  return Boolean(localStorage.getItem(STORAGE_KEY_CUSTOM_URL));
}

export function saveCustomCredentials(url: string, key: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY_CUSTOM_URL, url.trim());
  localStorage.setItem(STORAGE_KEY_CUSTOM_KEY, key.trim());
  circuitOpen = false;
  checkDbHealth();
}

export function clearCustomCredentials() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY_CUSTOM_URL);
  localStorage.removeItem(STORAGE_KEY_CUSTOM_KEY);
  circuitOpen = false;
  checkDbHealth();
}

/**
 * Fast-fail ping to Supabase health endpoint (2500ms max timeout).
 * Prevents DNS stalls and opens circuit breaker if unreachable.
 */
export async function checkDbHealth(targetUrl?: string): Promise<DbStatusInfo> {
  const { url } = targetUrl ? { url: targetUrl } : getActiveSupabaseConfig();
  const host = url.replace(/^https?:\/\//, "").replace(/\/.*$/, "") || "none";

  if (!url || url.includes("placeholder-project")) {
    const info: DbStatusInfo = {
      status: "unconfigured",
      host,
      message: "Supabase credentials not configured. Local persistent engine active.",
      isLocalOnly: true,
      lastChecked: Date.now(),
    };
    circuitOpen = true;
    notify(info);
    return info;
  }

  const start = performance.now();

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    const res = await fetch(`${url.replace(/\/$/, "")}/auth/v1/health`, {
      method: "GET",
      signal: controller.signal,
      headers: { "apikey": getActiveSupabaseConfig().key || "" },
    });
    clearTimeout(timeoutId);

    const latencyMs = Math.round(performance.now() - start);

    if (res.ok || res.status === 401 || res.status === 403) {
      // Host exists and responds (even 401 means endpoint is alive)
      circuitOpen = false;
      const info: DbStatusInfo = {
        status: "connected",
        host,
        latencyMs,
        message: `Connected to Supabase (${latencyMs}ms)`,
        isLocalOnly: false,
        lastChecked: Date.now(),
      };
      notify(info);
      return info;
    } else {
      circuitOpen = true;
      const info: DbStatusInfo = {
        status: "unreachable",
        host,
        latencyMs,
        message: `Project returned HTTP ${res.status}. Falling back to local offline storage.`,
        isLocalOnly: true,
        lastChecked: Date.now(),
      };
      notify(info);
      return info;
    }
  } catch (err: unknown) {
    circuitOpen = true;
    const msg = err instanceof Error ? err.message : String(err);
    const isDnsError = msg.includes("Failed to fetch") || msg.includes("ENOTFOUND") || msg.includes("aborted");

    const info: DbStatusInfo = {
      status: "offline",
      host,
      message: isDnsError
        ? `Host ${host} is unreachable (paused or offline). Data saved safely in local storage.`
        : `Connection error: ${msg}. Running in offline-first local mode.`,
      isLocalOnly: true,
      lastChecked: Date.now(),
    };
    notify(info);
    return info;
  }
}

// Initial health check on module load in browser
if (typeof window !== "undefined") {
  setTimeout(() => { checkDbHealth(); }, 100);
}
