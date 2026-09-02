// ─── LifeSync OS — Deterministic Health Computation Engine ──────────
// STRICT ARCHITECTURAL RULE:
// All numerical calculations, statistical baselines, probabilities,
// and scoring MUST be executed here deterministically.
// LLMs NEVER perform arithmetic or invent scores.

import type {
  HealthMetric,
  SleepLog,
  Workout,
  Habit,
  StudySession,
} from "@/lib/database.types";
import type { StudyStats } from "@/lib/db";
import type {
  DataAvailabilityStatus,
  ConfidenceLevel,
  DailyCapacityResult,
  WorkloadEstimate,
  CompletionProbabilityItem,
  HealthTrendPoint,
  RecoveryIntelligenceResult,
} from "./types";

/**
 * Calculates Recovery Score (0–100) deterministically.
 */
export function calculateDeterministicRecovery(
  metrics: HealthMetric | null,
  sleep: SleepLog | null
): number {
  if (!metrics && !sleep) return 0;

  const sleepHrs = sleep?.hours ?? 0;
  const hydrationPct = metrics?.hydration_pct ?? 0;
  const hrv = metrics?.hrv_ms ?? 0;
  const stress = metrics?.stress_pct ?? 0;
  const spo2 = Number(metrics?.spo2 ?? 0);

  // If all metrics are default/empty zero-state
  if (
    sleepHrs === 0 &&
    hydrationPct === 0 &&
    hrv === 0 &&
    (metrics?.steps ?? 0) === 0 &&
    (metrics?.calories_burned ?? 0) === 0
  ) {
    return 0;
  }

  // Weightings:
  // Sleep (35%): 8h target
  // Hydration (20%): 100% target
  // HRV (25%): 75ms target
  // Stress (10%): inverse stress
  // SpO2 (10%): normalized above 92%
  const sleepComponent = Math.min(sleepHrs / 8, 1.1) * 35;
  const hydrationComponent = (Math.min(hydrationPct, 100) / 100) * 20;
  const hrvComponent = (Math.min(hrv, 85) / 85) * 25;
  const stressComponent = ((100 - Math.min(stress, 100)) / 100) * 10;
  const spo2Component = spo2 > 0 ? (Math.max(0, Math.min(spo2 - 90, 10)) / 10) * 10 : 8;

  const total = Math.round(
    sleepComponent + hydrationComponent + hrvComponent + stressComponent + spo2Component
  );
  return Math.min(100, Math.max(0, total));
}

/**
 * Calculates 14-day rolling average baseline for Recovery.
 */
export function calculateRecoveryBaseline(history: HealthMetric[]): {
  baselineScore: number;
  confidence: ConfidenceLevel;
  daysEvaluated: number;
} {
  const valid = history.filter((h) => (h.recovery_score ?? 0) > 0);
  if (valid.length === 0) {
    return { baselineScore: 80, confidence: "INSUFFICIENT", daysEvaluated: 0 };
  }

  const sum = valid.reduce((acc, curr) => acc + (curr.recovery_score ?? 0), 0);
  const baseline = Math.round(sum / valid.length);

  const confidence: ConfidenceLevel =
    valid.length >= 14 ? "HIGH" : valid.length >= 4 ? "MEDIUM" : "LOW";

  return {
    baselineScore: baseline,
    confidence,
    daysEvaluated: valid.length,
  };
}

/**
 * Calculates detailed recovery factor breakdown (0–100 each).
 */
export function calculateRecoveryFactors(
  metrics: HealthMetric | null,
  sleep: SleepLog | null,
  workouts: Workout[],
  habits: Habit[]
) {
  // 1. Sleep Factor: hours + stage quality
  const sleepHrs = sleep?.hours ?? 0;
  const deepPct = sleep?.deep_pct ?? 20;
  const remPct = sleep?.rem_pct ?? 18;
  const sleepScore = Math.min(
    100,
    Math.round((sleepHrs / 8) * 70 + (deepPct / 25) * 15 + (remPct / 20) * 15)
  );

  // 2. Activity Factor: calories + steps
  const cals = metrics?.calories_burned ?? 0;
  const steps = metrics?.steps ?? 0;
  const activityScore = Math.min(
    100,
    Math.round(Math.min(cals / 2400, 1) * 50 + Math.min(steps / 9000, 1) * 50)
  );

  // 3. HRV Factor
  const hrv = metrics?.hrv_ms ?? 0;
  const hrvScore = Math.min(100, Math.round((hrv / 75) * 100));

  // 4. SpO2 Factor
  const spo2 = Number(metrics?.spo2 ?? 0);
  const spo2Score = spo2 > 0 ? Math.min(100, Math.round((spo2 / 100) * 100)) : 95;

  // 5. Workload Factor (Inverse of stress & fatigue)
  const stress = metrics?.stress_pct ?? 25;
  const recentWorkoutsCount = workouts.length;
  const fatiguePenalty = Math.min(25, recentWorkoutsCount * 4);
  const workloadScore = Math.max(20, Math.min(100, 100 - stress - fatiguePenalty + 15));

  // 6. Consistency Factor: habit completion rate
  const completedHabits = habits.filter((h) => h.completedToday).length;
  const totalHabits = habits.length;
  const consistencyScore =
    totalHabits > 0
      ? Math.round((completedHabits / totalHabits) * 100)
      : 80;

  return {
    sleep: sleepScore,
    activity: activityScore,
    hrv: hrvScore,
    spo2: spo2Score,
    workload: workloadScore,
    consistency: consistencyScore,
  };
}

/**
 * Calculates Full Recovery Intelligence Result.
 */
export function computeRecoveryIntelligence(
  metrics: HealthMetric | null,
  sleep: SleepLog | null,
  history: HealthMetric[],
  workouts: Workout[],
  habits: Habit[]
): RecoveryIntelligenceResult {
  const currentScore = calculateDeterministicRecovery(metrics, sleep);
  const { baselineScore, confidence, daysEvaluated } = calculateRecoveryBaseline(history);
  const factors = calculateRecoveryFactors(metrics, sleep, workouts, habits);

  const diff = currentScore - baselineScore;
  const trend: "improving" | "declining" | "stable" =
    diff >= 3 ? "improving" : diff <= -3 ? "declining" : "stable";

  const availability: DataAvailabilityStatus =
    !metrics && !sleep
      ? "MISSING"
      : daysEvaluated < 3
      ? "PARTIAL"
      : "AVAILABLE";

  const evidence = [
    `Current recovery calculated at ${currentScore}%`,
    `14-day personal baseline is ${baselineScore}% (${daysEvaluated} tracked days)`,
    `Sleep contribution: ${factors.sleep}/100 based on ${sleep?.hours ?? 0}h sleep`,
    `HRV biometric factor: ${metrics?.hrv_ms ?? 0}ms (${factors.hrv}/100)`,
    `SpO2 oxygen saturation: ${metrics?.spo2 ?? 0}%`,
  ];

  return {
    score: currentScore,
    baseline: baselineScore,
    trend,
    confidence,
    availability,
    factors,
    interpretation: "", // Will be populated by AI or fallback engine
    evidence,
  };
}

/**
 * Calculates Daily Capacity Score (0–100) & recommended breakdown.
 */
export function calculateDeterministicDailyCapacity(
  recoveryScore: number,
  sleep: SleepLog | null,
  stressPct: number,
  studyMinutes: number,
  activeHabitsCount: number
): DailyCapacityResult {
  const sleepAdequacy = Math.min((sleep?.hours ?? 7) / 8, 1);
  const stressDeduction = (stressPct / 100) * 15;
  const loadDeduction = Math.min(studyMinutes / 300, 1) * 10;

  const rawScore =
    recoveryScore * 0.55 +
    sleepAdequacy * 100 * 0.35 +
    10 -
    stressDeduction -
    loadDeduction;

  const score = Math.min(100, Math.max(15, Math.round(rawScore)));

  let level: DailyCapacityResult["level"] = "MODERATE";
  let recommendedFocusMinutes = 120;
  let recommendedWorkoutIntensity: DailyCapacityResult["recommendedWorkoutIntensity"] = "moderate";

  if (score >= 85) {
    level = "PEAK";
    recommendedFocusMinutes = 240;
    recommendedWorkoutIntensity = "high";
  } else if (score >= 70) {
    level = "HIGH";
    recommendedFocusMinutes = 180;
    recommendedWorkoutIntensity = "moderate";
  } else if (score >= 50) {
    level = "MODERATE";
    recommendedFocusMinutes = 120;
    recommendedWorkoutIntensity = "moderate";
  } else if (score >= 35) {
    level = "LOW";
    recommendedFocusMinutes = 60;
    recommendedWorkoutIntensity = "light";
  } else {
    level = "RECOVERY_NEEDED";
    recommendedFocusMinutes = 30;
    recommendedWorkoutIntensity = "rest";
  }

  // Allocations based on capacity score
  const deepWorkAllocation = Math.min(95, Math.round(score * 0.9));
  const exerciseAllocation =
    score >= 70
      ? Math.min(90, Math.round(score * 0.85))
      : Math.max(25, Math.round(score * 0.6));
  const learningAllocation = Math.min(90, Math.round(score * 0.8));
  const recoveryAllocation = Math.max(20, Math.round(100 - score * 0.7));

  const confidence: ConfidenceLevel = recoveryScore > 0 ? "HIGH" : "MEDIUM";

  const evidence = [
    `Recovery input: ${recoveryScore}%`,
    `Sleep duration input: ${sleep?.hours ?? 0}h`,
    `Stress level input: ${stressPct}%`,
    `Active habit load: ${activeHabitsCount} habits`,
  ];

  return {
    score,
    level,
    confidence,
    deepWorkAllocation,
    exerciseAllocation,
    learningAllocation,
    recoveryAllocation,
    recommendedFocusMinutes,
    recommendedWorkoutIntensity,
    interpretation: "",
    evidence,
  };
}

/**
 * Calculates Workload Estimation (planned minutes vs recommended).
 */
export function calculateDeterministicWorkload(
  habits: Habit[],
  workoutsToday: Workout[],
  studyMinutesToday: number,
  capacityScore: number
): WorkloadEstimate {
  // Planned minutes: habits (20m each) + workouts + focus
  const habitMinutes = habits.length * 20;
  const workoutMinutes = workoutsToday.reduce((acc, w) => acc + (w.duration_min || 45), 0);
  const plannedMinutes = habitMinutes + workoutMinutes + studyMinutesToday;

  // Recommended minutes proportional to capacity (scale between 90m and 270m)
  const recommendedMinutes = Math.round(90 + (capacityScore / 100) * 180);
  const diffPct =
    recommendedMinutes > 0
      ? Math.round(((plannedMinutes - recommendedMinutes) / recommendedMinutes) * 100)
      : 0;

  let assessment: WorkloadEstimate["assessment"] = "sustainable";
  if (diffPct > 35) assessment = "heavy";
  else if (diffPct < -30) assessment = "light";
  else if (Math.abs(diffPct) <= 15) assessment = "optimal";

  const explanation =
    diffPct > 0
      ? `Your planned workload (${Math.floor(plannedMinutes / 60)}h ${plannedMinutes % 60}m) is approximately ${diffPct}% higher than today's capacity target (${Math.floor(recommendedMinutes / 60)}h ${recommendedMinutes % 60}m).`
      : `Your planned workload (${Math.floor(plannedMinutes / 60)}h ${plannedMinutes % 60}m) is within your recommended recovery budget (${Math.floor(recommendedMinutes / 60)}h ${recommendedMinutes % 60}m).`;

  return {
    plannedMinutes,
    recommendedMinutes,
    differencePct: diffPct,
    assessment,
    explanation,
  };
}

/**
 * Calculates Completion Probability for habits.
 * Strict rule: If historical data < 7 days, returns null probability and "Not enough history yet."
 */
export function calculateCompletionProbabilities(
  habits: Habit[],
  studyStats: StudyStats | null,
  trackedDaysCount: number
): CompletionProbabilityItem[] {
  return habits.map((habit) => {
    // Check minimum threshold
    if (trackedDaysCount < 7) {
      return {
        habitId: habit.id,
        habitTitle: habit.title,
        probabilityPct: null,
        statusText: "Not enough history yet",
        evidence: `Requires 7+ tracked days (currently ${trackedDaysCount} days recorded).`,
      };
    }

    // Deterministic model based on streak and consistency
    let base = 65;
    if (habit.streak >= 14) base = 92;
    else if (habit.streak >= 7) base = 85;
    else if (habit.streak >= 3) base = 75;
    else if (habit.completedToday) base = 88;

    if (studyStats && studyStats.streakDays > 5 && habit.category === "focus") {
      base = Math.min(95, base + 5);
    }

    return {
      habitId: habit.id,
      habitTitle: habit.title,
      probabilityPct: base,
      statusText: `${base}% estimated probability`,
      evidence: `Based on a ${habit.streak}-day streak across ${trackedDaysCount} tracked days.`,
    };
  });
}

/**
 * Aggregates Health Trends over 7D, 30D, or 90D time horizons.
 */
export function calculateHealthTrends(
  healthHistory: HealthMetric[],
  sleepHistory: SleepLog[],
  workouts: Workout[],
  study: StudySession[],
  days: 7 | 30 | 90
): HealthTrendPoint[] {
  const points: HealthTrendPoint[] = [];
  const now = new Date();

  // Map by ISO date string
  const healthMap = new Map<string, HealthMetric>();
  healthHistory.forEach((h) => {
    const key = h.recorded_at.split("T")[0];
    healthMap.set(key, h);
  });

  const sleepMap = new Map<string, SleepLog>();
  sleepHistory.forEach((s) => {
    const key = s.sleep_date.split("T")[0];
    sleepMap.set(key, s);
  });

  const workoutMap = new Map<string, number>();
  workouts.forEach((w) => {
    const key = w.workout_date.split("T")[0];
    workoutMap.set(key, (workoutMap.get(key) || 0) + (w.calories || 0));
  });

  const studyMap = new Map<string, number>();
  study.forEach((st) => {
    const key = st.session_date.split("T")[0];
    studyMap.set(key, (studyMap.get(key) || 0) + (st.duration_min || 0));
  });

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(now.getDate() - i);
    const dateKey = d.toISOString().split("T")[0];

    const h = healthMap.get(dateKey);
    const sl = sleepMap.get(dateKey);
    const cals = workoutMap.get(dateKey) || h?.calories_burned || 0;
    const focusMins = studyMap.get(dateKey) || 0;

    points.push({
      date: dateKey,
      sleepHours: sl ? Number(sl.hours) : h ? 7.2 : 0,
      recoveryScore: h?.recovery_score ?? (sl ? Math.round(Number(sl.hours) * 11) : 0),
      hrvMs: h?.hrv_ms ?? 65,
      caloriesBurned: cals,
      focusMinutes: focusMins,
    });
  }

  return points;
}

/**
 * Determines Data Availability Status based on presence and recency.
 */
export function evaluateDataAvailability(
  metrics: HealthMetric | null,
  sleep: SleepLog | null,
  historyCount: number
): DataAvailabilityStatus {
  if (!metrics && !sleep) return "MISSING";
  if (historyCount === 0) return "INSUFFICIENT";
  if (!metrics || !sleep) return "PARTIAL";

  // Check staleness (if recorded_at is > 48h ago)
  if (metrics.recorded_at) {
    const recordedTime = new Date(metrics.recorded_at).getTime();
    const twoDaysMs = 48 * 60 * 60 * 1000;
    if (Date.now() - recordedTime > twoDaysMs) {
      return "STALE";
    }
  }

  return "AVAILABLE";
}
