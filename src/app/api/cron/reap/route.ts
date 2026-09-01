import { NextResponse } from "next/server";
import { getHabits, getHabitLogs, setLocal, getLocal } from "@/lib/db";
import type { HabitLog } from "@/lib/database.types";

export const revalidate = 0;

/**
 * Vercel Cron Daily Reaper Route Handler (/api/cron/reap)
 * Runs daily at midnight to evaluate unlogged habits for yesterday.
 * Idempotent, timezone-safe, and safe against duplicate runs.
 */
export async function GET(request: Request) {
  try {
    // 1. Authorization check
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized cron request" }, { status: 401 });
    }

    // 2. Compute yesterday's calendar date YYYY-MM-DD
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];

    const habits = getHabits();
    const existingLogs = getHabitLogs();
    let freezeTokens = getLocal("freeze_tokens", 1);

    let frozenCount = 0;
    let missedCount = 0;
    let skippedCount = 0;

    const newLogs: HabitLog[] = [];

    // 3. Evaluate each habit for yesterday
    for (const habit of habits) {
      const hasLog = existingLogs.some((l) => l.habit_id === habit.id && l.date === yesterdayStr);

      if (hasLog) {
        skippedCount++;
        continue;
      }

      if (freezeTokens > 0) {
        // FROZEN state: consume Rest Token
        freezeTokens = Math.max(0, freezeTokens - 1);
        frozenCount++;
        newLogs.push({
          id: `log-cron-${habit.id}-${yesterdayStr}`,
          habit_id: habit.id,
          date: yesterdayStr,
          status: "FROZEN",
          logged_at: new Date().toISOString(),
        });
      } else {
        // MISSED state: reset streak
        missedCount++;
        newLogs.push({
          id: `log-cron-${habit.id}-${yesterdayStr}`,
          habit_id: habit.id,
          date: yesterdayStr,
          status: "MISSED",
          logged_at: new Date().toISOString(),
        });
      }
    }

    // Save updated tokens and logs
    setLocal("freeze_tokens", freezeTokens);
    if (newLogs.length > 0) {
      setLocal("habit_logs", [...newLogs, ...existingLogs]);
    }

    return NextResponse.json({
      success: true,
      dateEvaluated: yesterdayStr,
      frozenCount,
      missedCount,
      skippedCount,
      remainingTokens: freezeTokens,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error("[Cron Reaper Error]:", err);
    return NextResponse.json(
      { error: "Cron execution failed", details: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
