import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  try {
    const schemaPath = path.join(process.cwd(), "supabase", "schema.sql");
    const sql = fs.readFileSync(schemaPath, "utf-8");
    return new NextResponse(sql, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: "Failed to read schema.sql", details: msg }, { status: 500 });
  }
}
