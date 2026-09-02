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
import { calculateDeterministicRecovery, calculateRecoveryBaseline } from "./deterministic";

export interface HealthContextBundle {
  todaySummary: {
    recoveryScore: number;
    sleepHours: number;
    heartRate: number;
    hrvMs: number;
    spo2: number;
    stressPct: number;
    hydrationPct: number;
    caloriesBurned: number;
    focusMinutes: number;
  };
  sevenDaySummary: {
    avgRecovery: number;
    avgSleepHours: number;
    avgHrvMs: number;
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
      : latestSleep?.hours ?? 7.0;

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

  return {
    todaySummary: {
      recoveryScore: currentRecovery,
      sleepHours: latestSleep?.hours ?? 0,
      heartRate: metrics?.heart_rate ?? 0,
      hrvMs: metrics?.hrv_ms ?? 0,
      spo2: Number(metrics?.spo2 ?? 0),
      stressPct: metrics?.stress_pct ?? 0,
      hydrationPct: metrics?.hydration_pct ?? 0,
      caloriesBurned: metrics?.calories_burned ?? 0,
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
      avgHrvMs: metrics?.hrv_ms ?? 68,
      totalWorkoutMinutes,
      totalFocusMinutes,
      trackedDaysCount: Math.max(daysEvaluated, recent7Sleep.length),
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
  return `
[USER CONTEXT - GROUND TRUTH]
Today Recovery: ${bundle.todaySummary.recoveryScore}%
Today Sleep: ${bundle.todaySummary.sleepHours}h
Today Biometrics: HRV ${bundle.todaySummary.hrvMs}ms, SpO2 ${bundle.todaySummary.spo2}%, Stress ${bundle.todaySummary.stressPct}%
Today Focus: ${bundle.todaySummary.focusMinutes}m
7-Day Baseline Recovery: ${bundle.sevenDaySummary.avgRecovery}%
7-Day Avg Sleep: ${bundle.sevenDaySummary.avgSleepHours}h
7-Day Workout Total: ${bundle.sevenDaySummary.totalWorkoutMinutes}m
Habits: ${bundle.habitSummary.completedToday}/${bundle.habitSummary.totalHabits} completed today (Top: ${bundle.habitSummary.strongestHabit}, Avg Streak: ${bundle.habitSummary.averageStreak}d)
Tracked Days History: ${bundle.sevenDaySummary.trackedDaysCount} days
${
  bundle.profileSummary
    ? `User Profile: Priorities: ${bundle.profileSummary.currentPriorities?.join(", ")}; Planning: ${bundle.profileSummary.planningStyle}; Workout style: ${bundle.profileSummary.preferredWorkoutStyle}`
    : "Personalization: Default baseline mode"
}
`.trim();
}
