// ─── LifeSync OS — Context Building Layer ──────────────────────────
// STRICT ARCHITECTURAL RULE:
// Do NOT send the entire database to the LLM.
// Select ONLY the concise, privacy-conscious summary required for the task.

import type {
  HealthMetric,
  SleepLog,
  Workout,
  Habit,
  StudySession,
  AiUserProfile,
} from "@/lib/database.types";
import {
  calculateDeterministicRecovery,
  calculateRecoveryBaseline,
  evaluateDataAvailability,
} from "./deterministic";
import type { DataAvailabilityStatus } from "./types";

export interface HealthContextBundle {
  dataAvailability: DataAvailabilityStatus;
  todaySummary: {
    recoveryScore: number | null;
    sleepHours: number | null;
    heartRate: number | null;
    hrvMs: number | null;
    spo2: number | null;
    stressPct: number | null;
    hydrationPct: number | null;
    caloriesBurned: number | null;
    focusMinutes: number;
  };
  sevenDaySummary: {
    avgRecovery: number | null;
    avgSleepHours: number | null;
    avgHrvMs: number | null;
    totalWorkoutMinutes: number;
    totalFocusMinutes: number;
    trackedDaysCount: number;
  };
  habitSummary: {
    totalHabits: number;
    completedToday: number;
    averageStreak: number;
    strongestHabit: string;
  };
  profileSummary?: Partial<AiUserProfile>;
}

/**
 * Builds standard concise context for Health AI capabilities.
 */
export function buildHealthContextBundle(
  metrics: HealthMetric | null,
  latestSleep: SleepLog | null,
  healthHistory: HealthMetric[],
  sleepHistory: SleepLog[],
  workouts: Workout[],
  studySessions: StudySession[],
  habits: Habit[],
  profile?: AiUserProfile
): HealthContextBundle {
  const currentRecovery = calculateDeterministicRecovery(metrics, latestSleep);
  const { baselineScore, daysEvaluated } = calculateRecoveryBaseline(healthHistory);

  const recent7Sleep = sleepHistory.slice(0, 7);
  const avgSleepHours =
    recent7Sleep.length > 0
      ? Number(
          (
            recent7Sleep.reduce((s, r) => s + Number(r.hours), 0) /
            recent7Sleep.length
          ).toFixed(1)
        )
      : latestSleep?.hours != null && Number(latestSleep.hours) > 0
      ? Number(latestSleep.hours)
      : null;

  const validHrvs = healthHistory.filter((h) => h.hrv_ms != null && h.hrv_ms > 0);
  const avgHrvMs =
    validHrvs.length > 0
      ? Math.round(validHrvs.reduce((s, h) => s + (h.hrv_ms || 0), 0) / validHrvs.length)
      : metrics?.hrv_ms != null && metrics.hrv_ms > 0
      ? metrics.hrv_ms
      : null;

  const recent7Workouts = workouts.slice(0, 7);
  const totalWorkoutMinutes = recent7Workouts.reduce(
    (s, w) => s + (w.duration_min || 0),
    0
  );

  const recent7Study = studySessions.slice(0, 7);
  const totalFocusMinutes = recent7Study.reduce(
    (s, st) => s + (st.duration_min || 0),
    0
  );

  const completedHabits = habits.filter((h) => h.completedToday).length;
  const avgStreak =
    habits.length > 0
      ? Math.round(habits.reduce((s, h) => s + h.streak, 0) / habits.length)
      : 0;

  const sortedHabits = [...habits].sort((a, b) => b.streak - a.streak);
  const strongestHabit = sortedHabits[0]?.title ?? "None";

  const trackedDaysCount = Math.max(daysEvaluated, recent7Sleep.length);
  const dataAvailability = evaluateDataAvailability(metrics, latestSleep, trackedDaysCount);

  return {
    dataAvailability,
    todaySummary: {
      recoveryScore: currentRecovery,
      sleepHours: latestSleep?.hours != null && Number(latestSleep.hours) > 0 ? Number(latestSleep.hours) : null,
      heartRate: metrics?.heart_rate != null && metrics.heart_rate > 0 ? metrics.heart_rate : null,
      hrvMs: metrics?.hrv_ms != null && metrics.hrv_ms > 0 ? metrics.hrv_ms : null,
      spo2: metrics?.spo2 != null && Number(metrics.spo2) > 0 ? Number(metrics.spo2) : null,
      stressPct: metrics?.stress_pct != null && metrics.stress_pct > 0 ? metrics.stress_pct : null,
      hydrationPct: metrics?.hydration_pct != null && metrics.hydration_pct > 0 ? metrics.hydration_pct : null,
      caloriesBurned: metrics?.calories_burned != null && metrics.calories_burned > 0 ? metrics.calories_burned : null,
      focusMinutes: studySessions
        .filter(
          (s) =>
            s.session_date === new Date().toISOString().split("T")[0]
        )
        .reduce((sum, s) => sum + s.duration_min, 0),
    },
    sevenDaySummary: {
      avgRecovery: baselineScore,
      avgSleepHours,
      avgHrvMs,
      totalWorkoutMinutes,
      totalFocusMinutes,
      trackedDaysCount,
    },
    habitSummary: {
      totalHabits: habits.length,
      completedToday: completedHabits,
      averageStreak: avgStreak,
      strongestHabit,
    },
    profileSummary: profile?.personalizationEnabled
      ? {
          goals: profile.goals,
          preferredWakeTime: profile.preferredWakeTime,
          preferredSleepTime: profile.preferredSleepTime,
          preferredWorkoutStyle: profile.preferredWorkoutStyle,
          planningStyle: profile.planningStyle,
          currentPriorities: profile.currentPriorities,
        }
      : undefined,
  };
}

/**
 * Formats context into a concise Markdown string for prompt injection.
 */
export function formatContextPromptString(bundle: HealthContextBundle): string {
  const recoveryText =
    bundle.todaySummary.recoveryScore !== null
      ? `${bundle.todaySummary.recoveryScore}%`
      : "NOT_RECORDED (no recovery calculation available)";

  const sleepText =
    bundle.todaySummary.sleepHours !== null
      ? `${bundle.todaySummary.sleepHours}h`
      : "NOT_RECORDED (user has not logged last night's sleep)";

  const hrvText =
    bundle.todaySummary.hrvMs !== null
      ? `${bundle.todaySummary.hrvMs}ms`
      : "NOT_RECORDED";

  const spo2Text =
    bundle.todaySummary.spo2 !== null
      ? `${bundle.todaySummary.spo2}%`
      : "NOT_RECORDED";

  const stressText =
    bundle.todaySummary.stressPct !== null
      ? `${bundle.todaySummary.stressPct}%`
      : "NOT_RECORDED";

  const baselineRecoveryText =
    bundle.sevenDaySummary.avgRecovery !== null
      ? `${bundle.sevenDaySummary.avgRecovery}%`
      : `INSUFFICIENT_DATA (only ${bundle.sevenDaySummary.trackedDaysCount} days tracked; requires at least 3 days)`;

  const baselineSleepText =
    bundle.sevenDaySummary.avgSleepHours !== null
      ? `${bundle.sevenDaySummary.avgSleepHours}h`
      : "INSUFFICIENT_DATA";

  return `
[USER CONTEXT - GROUND TRUTH]
Data Availability Status: ${bundle.dataAvailability}
Today Recovery: ${recoveryText}
Today Sleep: ${sleepText}
Today Biometrics: HRV ${hrvText}, SpO2 ${spo2Text}, Stress ${stressText}
Today Focus: ${bundle.todaySummary.focusMinutes}m
7-Day Baseline Recovery: ${baselineRecoveryText}
7-Day Avg Sleep: ${baselineSleepText}
7-Day Workout Total: ${bundle.sevenDaySummary.totalWorkoutMinutes}m
Habits: ${bundle.habitSummary.completedToday}/${bundle.habitSummary.totalHabits} completed today (Top: ${bundle.habitSummary.strongestHabit}, Avg Streak: ${bundle.habitSummary.averageStreak}d)
Tracked Days History: ${bundle.sevenDaySummary.trackedDaysCount} days
${
  bundle.profileSummary
    ? `User Profile: Priorities: ${bundle.profileSummary.currentPriorities?.join(", ") || "General health"}; Planning: ${bundle.profileSummary.planningStyle || "Balanced"}; Workout style: ${bundle.profileSummary.preferredWorkoutStyle || "Hybrid"}`
    : "Personalization: Default baseline mode"
}

IMPORTANT AI REASONING RULES:
- Any metric listed as NOT_RECORDED or INSUFFICIENT_DATA has NOT been measured or logged by the user.
- DO NOT invent, assume, fabricate, or hallucinate values for unrecorded metrics (e.g. do NOT assume 8 hours sleep or 65ms HRV).
- If the user asks about an unrecorded metric, clearly inform them it has not been recorded yet and invite them to log it.
- Keep all summaries concise, evidence-based, and aligned strictly with the Ground Truth above.
`.trim();
}
