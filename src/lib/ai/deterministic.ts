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
  RecoveryFactorDetail,
} from "./types";

/**
 * Calculates Recovery Score (0–100) deterministically.
 * Pure function: returns null if no valid metrics or sleep are recorded.
 * Never defaults missing metrics to zero.
 */
export function calculateDeterministicRecovery(
  metrics: HealthMetric | null,
  sleep: SleepLog | null
): number | null {
  const hasSleep = sleep !== null && sleep.hours !== null && Number(sleep.hours) > 0;
  const hasHrv = metrics !== null && metrics.hrv_ms !== null && Number(metrics.hrv_ms) > 0;
  const hasHydration = metrics !== null && metrics.hydration_pct !== null && Number(metrics.hydration_pct) > 0;
  const hasStress = metrics !== null && metrics.stress_pct !== null && Number(metrics.stress_pct) > 0;
  const hasSpo2 = metrics !== null && metrics.spo2 !== null && Number(metrics.spo2) > 0;

  if (!hasSleep && !hasHrv && !hasHydration && !hasStress && !hasSpo2) {
    return null;
  }

  let totalWeight = 0;
  let weightedScore = 0;

  if (hasSleep) {
    const weight = 40;
    const sleepScore = Math.min(Number(sleep.hours) / 8, 1.1) * 100;
    weightedScore += sleepScore * weight;
    totalWeight += weight;
  }

  if (hasHrv) {
    const weight = 30;
    const hrvScore = Math.min(Number(metrics.hrv_ms) / 80, 1.1) * 100;
    weightedScore += hrvScore * weight;
    totalWeight += weight;
  }

  if (hasStress) {
    const weight = 15;
    const stressScore = Math.max(0, 100 - Number(metrics.stress_pct));
    weightedScore += stressScore * weight;
    totalWeight += weight;
  }

  if (hasHydration) {
    const weight = 10;
    const hydScore = Math.min(Number(metrics.hydration_pct), 100);
    weightedScore += hydScore * weight;
    totalWeight += weight;
  }

  if (hasSpo2) {
    const weight = 5;
    const spo2Val = Number(metrics.spo2);
    const spo2Score = Math.min(100, Math.max(0, (spo2Val - 90) * 10));
    weightedScore += spo2Score * weight;
    totalWeight += weight;
  }

  if (totalWeight === 0) return null;
  return Math.min(100, Math.max(10, Math.round(weightedScore / totalWeight)));
}

/**
 * Calculates rolling average baseline for Recovery.
 * Returns baselineScore: null if no history exists (never invents 80).
 */
export function calculateRecoveryBaseline(history: HealthMetric[]): {
  baselineScore: number | null;
  confidence: ConfidenceLevel;
  daysEvaluated: number;
} {
  const valid = history.filter(
    (h) => h.recovery_score !== null && (h.recovery_score ?? 0) > 0
  );
  if (valid.length === 0) {
    return { baselineScore: null, confidence: "INSUFFICIENT", daysEvaluated: 0 };
  }

  const sum = valid.reduce((acc, curr) => acc + (curr.recovery_score ?? 0), 0);
  const baseline = Math.round(sum / valid.length);

  const confidence: ConfidenceLevel =
    valid.length >= 7 ? "HIGH" : valid.length >= 3 ? "MEDIUM" : "LOW";

  return {
    baselineScore: baseline,
    confidence,
    daysEvaluated: valid.length,
  };
}

/**
 * Calculates detailed recovery factor breakdown.
 * Explicitly marks missing factors as isRecorded: false instead of inventing numbers.
 */
export function calculateRecoveryFactors(
  metrics: HealthMetric | null,
  sleep: SleepLog | null,
  workouts: Workout[],
  habits: Habit[]
): {
  sleep: RecoveryFactorDetail;
  activity: RecoveryFactorDetail;
  hrv: RecoveryFactorDetail;
  spo2: RecoveryFactorDetail;
  workload: RecoveryFactorDetail;
  consistency: RecoveryFactorDetail;
} {
  // 1. Sleep Factor
  const hasSleep = sleep !== null && sleep.hours !== null && Number(sleep.hours) > 0;
  const sleepFactor: RecoveryFactorDetail = {
    isRecorded: Boolean(hasSleep),
    rawValue: hasSleep ? `${sleep.hours}h` : null,
    unit: "hours",
    score: hasSleep ? Math.min(100, Math.round((Number(sleep.hours) / 8) * 100)) : null,
    statusText: hasSleep ? `${sleep.hours} hrs logged` : "Not recorded",
  };

  // 2. HRV Factor
  const hasHrv = metrics !== null && metrics.hrv_ms !== null && Number(metrics.hrv_ms) > 0;
  const hrvFactor: RecoveryFactorDetail = {
    isRecorded: Boolean(hasHrv),
    rawValue: hasHrv ? `${metrics.hrv_ms}ms` : null,
    unit: "ms",
    score: hasHrv ? Math.min(100, Math.round((Number(metrics.hrv_ms) / 80) * 100)) : null,
    statusText: hasHrv ? `${metrics.hrv_ms} ms` : "Not recorded",
  };

  // 3. SpO2 Factor
  const hasSpo2 = metrics !== null && metrics.spo2 !== null && Number(metrics.spo2) > 0;
  const spo2Factor: RecoveryFactorDetail = {
    isRecorded: Boolean(hasSpo2),
    rawValue: hasSpo2 ? `${metrics.spo2}%` : null,
    unit: "%",
    score: hasSpo2 ? Math.min(100, Math.round(Number(metrics.spo2))) : null,
    statusText: hasSpo2 ? `${metrics.spo2}%` : "Not recorded",
  };

  // 4. Activity Factor
  const hasActivity =
    metrics !== null &&
    ((metrics.steps !== null && metrics.steps > 0) ||
      (metrics.calories_burned !== null && metrics.calories_burned > 0) ||
      workouts.length > 0);
  const steps = metrics?.steps ?? 0;
  const cals = metrics?.calories_burned ?? 0;
  const activityFactor: RecoveryFactorDetail = {
    isRecorded: Boolean(hasActivity),
    rawValue: hasActivity ? `${steps > 0 ? `${steps} steps` : `${cals} kcal`}` : null,
    unit: "steps",
    score: hasActivity
      ? Math.min(100, Math.round(Math.min(cals / 2400, 1) * 50 + Math.min(steps / 9000, 1) * 50))
      : null,
    statusText: hasActivity
      ? `${steps > 0 ? steps.toLocaleString() + " steps" : cals + " kcal"}`
      : "Not recorded",
  };

  // 5. Workload Factor
  const hasStress = metrics !== null && metrics.stress_pct !== null && metrics.stress_pct > 0;
  const hasWorkouts = workouts.length > 0;
  const workloadRecorded = hasStress || hasWorkouts;
  const stress = metrics?.stress_pct ?? 20;
  const fatiguePenalty = Math.min(25, workouts.length * 5);
  const workloadScore = Math.max(20, Math.min(100, 100 - stress - fatiguePenalty + 10));

  const workloadFactor: RecoveryFactorDetail = {
    isRecorded: workloadRecorded,
    rawValue: hasStress ? `Stress ${metrics.stress_pct}%` : hasWorkouts ? `${workouts.length} workouts` : null,
    score: workloadRecorded ? workloadScore : null,
    statusText: workloadRecorded ? (workloadScore >= 70 ? "Optimal load" : "Elevated load") : "No load logged",
  };

  // 6. Consistency Factor
  const totalHabits = habits.length;
  const completedHabits = habits.filter((h) => h.completedToday).length;
  const consistencyFactor: RecoveryFactorDetail = {
    isRecorded: totalHabits > 0,
    rawValue: totalHabits > 0 ? `${completedHabits}/${totalHabits}` : null,
    score: totalHabits > 0 ? Math.round((completedHabits / totalHabits) * 100) : null,
    statusText: totalHabits > 0 ? `${completedHabits}/${totalHabits} routines` : "No routines active",
  };

  return {
    sleep: sleepFactor,
    activity: activityFactor,
    hrv: hrvFactor,
    spo2: spo2Factor,
    workload: workloadFactor,
    consistency: consistencyFactor,
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

  let trend: "improving" | "declining" | "stable" | "insufficient_data" = "insufficient_data";
  if (currentScore !== null && baselineScore !== null) {
    const diff = currentScore - baselineScore;
    trend = diff >= 3 ? "improving" : diff <= -3 ? "declining" : "stable";
  }

  const availability = evaluateDataAvailability(metrics, sleep, daysEvaluated);

  const evidence: string[] = [];
  if (currentScore !== null) {
    evidence.push(`Current recovery calculated at ${currentScore}%`);
  } else {
    evidence.push("No recovery metrics recorded for today");
  }

  if (baselineScore !== null) {
    evidence.push(`14-day personal baseline is ${baselineScore}% (${daysEvaluated} tracked days)`);
  } else {
    evidence.push(`Baseline requires at least 3 tracked days (currently ${daysEvaluated} recorded)`);
  }

  if (factors.sleep.isRecorded && sleep) {
    evidence.push(`Sleep contribution: ${factors.sleep.score}/100 based on ${sleep.hours}h sleep`);
  }
  if (factors.hrv.isRecorded && metrics?.hrv_ms) {
    evidence.push(`HRV biometric factor: ${metrics.hrv_ms}ms`);
  }

  return {
    score: currentScore,
    baseline: baselineScore,
    trend,
    confidence: currentScore !== null ? confidence : "INSUFFICIENT",
    availability,
    factors,
    interpretation: "",
    evidence,
  };
}

/**
 * Calculates Daily Capacity Score (0–100) & recommended breakdown.
 * Returns level: "INSUFFICIENT" if recovery and sleep are missing.
 */
export function calculateDeterministicDailyCapacity(
  recoveryScore: number | null,
  sleep: SleepLog | null,
  stressPct: number,
  studyMinutes: number,
  activeHabitsCount: number
): DailyCapacityResult {
  if (recoveryScore === null && (!sleep || !sleep.hours)) {
    return {
      score: null,
      level: "INSUFFICIENT",
      confidence: "INSUFFICIENT",
      deepWorkAllocation: 0,
      exerciseAllocation: 0,
      learningAllocation: 0,
      recoveryAllocation: 0,
      recommendedFocusMinutes: 0,
      recommendedWorkoutIntensity: "rest",
      interpretation: "Log your sleep or vitals to calculate today's operational capacity.",
      evidence: ["No recovery or sleep data logged for today"],
    };
  }

  const effRecovery =
    recoveryScore ??
    (sleep && sleep.hours ? Math.min(100, Math.round((Number(sleep.hours) / 8) * 100)) : 50);
  const sleepAdequacy =
    sleep && sleep.hours ? Math.min(Number(sleep.hours) / 8, 1) : effRecovery / 100;
  const stressDeduction = (stressPct / 100) * 15;
  const loadDeduction = Math.min(studyMinutes / 300, 1) * 10;

  const rawScore =
    effRecovery * 0.55 +
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

  const deepWorkAllocation = Math.min(95, Math.round(score * 0.9));
  const exerciseAllocation =
    score >= 70
      ? Math.min(90, Math.round(score * 0.85))
      : Math.max(25, Math.round(score * 0.6));
  const learningAllocation = Math.min(90, Math.round(score * 0.8));
  const recoveryAllocation = Math.max(20, Math.round(100 - score * 0.7));

  return {
    score,
    level,
    confidence: recoveryScore !== null ? "HIGH" : "MEDIUM",
    deepWorkAllocation,
    exerciseAllocation,
    learningAllocation,
    recoveryAllocation,
    recommendedFocusMinutes,
    recommendedWorkoutIntensity,
    interpretation: "",
    evidence: [
      `Recovery factor: ${recoveryScore !== null ? `${recoveryScore}%` : "Derived from sleep"}`,
      `Sleep logged: ${sleep?.hours ? `${sleep.hours}h` : "Not recorded"}`,
      `Active routine load: ${activeHabitsCount} habits`,
    ],
  };
}

/**
 * Calculates Workload Estimation (planned minutes vs recommended).
 */
export function calculateDeterministicWorkload(
  habits: Habit[],
  workoutsToday: Workout[],
  studyMinutesToday: number,
  capacityScore: number | null
): WorkloadEstimate {
  const habitMinutes = habits.length * 20;
  const workoutMinutes = workoutsToday.reduce((acc, w) => acc + (w.duration_min || 45), 0);
  const plannedMinutes = habitMinutes + workoutMinutes + studyMinutesToday;

  const effCapacity = capacityScore ?? 65;
  const recommendedMinutes = Math.round(90 + (effCapacity / 100) * 180);
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
    if (trackedDaysCount < 7) {
      return {
        habitId: habit.id,
        habitTitle: habit.title,
        probabilityPct: null,
        statusText: "Not enough history yet",
        evidence: `Requires 7+ tracked days (currently ${trackedDaysCount} days recorded).`,
      };
    }

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
 * Pure deterministic mapping: Never invents fake 7.2h sleep or 65ms HRV.
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
    const cals = workoutMap.get(dateKey) ?? (h?.calories_burned ?? null);
    const focusMins = studyMap.get(dateKey) ?? 0;

    const hasData = Boolean(h || sl || workoutMap.has(dateKey) || studyMap.has(dateKey));

    points.push({
      date: dateKey,
      sleepHours: sl ? Number(sl.hours) : null,
      recoveryScore:
        h?.recovery_score !== undefined && h?.recovery_score !== null
          ? Number(h.recovery_score)
          : sl
          ? Math.min(100, Math.round((Number(sl.hours) / 8) * 100))
          : null,
      hrvMs:
        h?.hrv_ms !== undefined && h?.hrv_ms !== null && Number(h.hrv_ms) > 0
          ? Number(h.hrv_ms)
          : null,
      caloriesBurned: cals !== null && cals > 0 ? cals : null,
      focusMinutes: focusMins,
      hasData,
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
  const hasSleep = sleep !== null && sleep.hours !== null && Number(sleep.hours) > 0;
  const hasVitals =
    metrics !== null &&
    ((metrics.hrv_ms !== null && metrics.hrv_ms > 0) ||
      (metrics.hydration_pct !== null && metrics.hydration_pct > 0) ||
      (metrics.heart_rate !== null && metrics.heart_rate > 0));

  if (!hasSleep && !hasVitals) return "MISSING";
  if (historyCount < 3) return "INSUFFICIENT";
  if (!hasSleep || !hasVitals) return "PARTIAL";

  if (metrics?.recorded_at) {
    const recordedTime = new Date(metrics.recorded_at).getTime();
    const twoDaysMs = 48 * 60 * 60 * 1000;
    if (Date.now() - recordedTime > twoDaysMs) {
      return "STALE";
    }
  }

  return "AVAILABLE";
}
