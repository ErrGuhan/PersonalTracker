import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
  const host = url.replace(/^https?:\/\//, "").replace(/\/.*$/, "") || "none";

  if (!url || url.includes("placeholder-project")) {
    return NextResponse.json({
      ok: false,
      status: "unconfigured",
      host,
      message: "No Supabase URL configured. Running in offline/local storage mode.",
    });
  }

  const start = performance.now();
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3500);

    const res = await fetch(`${url.replace(/\/$/, "")}/auth/v1/health`, {
      method: "GET",
      signal: controller.signal,
      headers: { apikey: key },
    });
    clearTimeout(timeout);

    const latencyMs = Math.round(performance.now() - start);

    if (res.ok || res.status === 401 || res.status === 403) {
      return NextResponse.json({
        ok: true,
        status: "connected",
        host,
        latencyMs,
        message: `Connected successfully to Supabase backend (${latencyMs}ms)`,
      });
    }

    return NextResponse.json({
      ok: false,
      status: "unreachable",
      host,
      latencyMs,
      message: `Supabase host responded with HTTP status ${res.status}`,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({
      ok: false,
      status: "offline",
      host,
      message: `Database host '${host}' is currently unreachable (paused or invalid DNS). Application runs in resilient offline local mode.`,
      error: errorMsg,
    });
  }
}
