// ─── LifeSync OS — Deterministic MET-Based Calorie Estimation Engine ───
// Built on the 2011/2024 Compendium of Physical Activities.
// Formula: Calories = MET × Weight (kg) × (Duration / 60) × Intensity Factor

export type WorkoutType = "strength" | "run" | "hiit" | "cardio" | "yoga" | "swim" | "walk";
export type WorkoutIntensity = "low" | "moderate" | "high";
export type CalorieSource = "USER_PROVIDED" | "CALCULATED" | "ESTIMATED" | "IMPORTED";

export const DEFAULT_REFERENCE_BODY_WEIGHT_KG = 70; // Standard clinical reference weight

// Base MET values from Compendium of Physical Activities
export const BASE_MET_TABLE: Record<WorkoutType, { default: number; low: number; high: number }> = {
  strength: { default: 4.5, low: 3.5, high: 6.0 }, // Weight lifting, free weights, machines
  run:      { default: 9.8, low: 8.0, high: 11.5 }, // Running ~10 km/h (6 mph)
  hiit:     { default: 8.0, low: 6.5, high: 10.0 }, // High intensity interval circuit
  cardio:   { default: 6.8, low: 5.0, high: 8.5 }, // Stationary cycling / elliptical
  yoga:     { default: 3.0, low: 2.2, high: 4.0 }, // Vinyasa / power yoga vs restorative
  swim:     { default: 7.0, low: 5.8, high: 9.0 }, // Moderate freestyle swimming
  walk:     { default: 3.8, low: 3.0, high: 4.5 }, // Brisk walking ~5 km/h
};

export const INTENSITY_FACTORS: Record<WorkoutIntensity, number> = {
  low: 0.85,
  moderate: 1.0,
  high: 1.25,
};

export interface CalorieEstimationInput {
  workoutType: string;
  durationMin: number;
  bodyWeightKg?: number | null;
  intensity?: WorkoutIntensity;
  distanceKm?: number | null;
  userOverrideCalories?: number | null;
  wearableImportedCalories?: number | null;
}

export interface CalorieEstimationResult {
  calories: number;
  met: number;
  bodyWeightKg: number;
  durationMin: number;
  intensity: WorkoutIntensity;
  source: CalorieSource;
  isReferenceWeight: boolean;
  explanation: string;
}

/**
 * Maps arbitrary strings (e.g. "Upper Body", "Leg Day", "Morning Run") to canonical WorkoutType
 */
export function resolveWorkoutType(rawTypeOrName: string): WorkoutType {
  const lower = (rawTypeOrName || "").toLowerCase();
  if (lower.includes("run") || lower.includes("jog") || lower.includes("sprint")) return "run";
  if (lower.includes("hiit") || lower.includes("interval") || lower.includes("circuit") || lower.includes("tabata")) return "hiit";
  if (lower.includes("bike") || lower.includes("cycl") || lower.includes("spin") || lower.includes("cardio") || lower.includes("elliptical")) return "cardio";
  if (lower.includes("yoga") || lower.includes("stretch") || lower.includes("pilates") || lower.includes("mobility")) return "yoga";
  if (lower.includes("swim") || lower.includes("pool") || lower.includes("freestyle") || lower.includes("lap")) return "swim";
  if (lower.includes("walk") || lower.includes("hike")) return "walk";
  return "strength"; // default for gym / resistance / bodyweight
}

/**
 * Deterministically estimates calories burned based on exercise physiology.
 * Respects source hierarchy: IMPORTED > USER_PROVIDED > CALCULATED > ESTIMATED.
 */
export function estimateWorkoutCalories(input: CalorieEstimationInput): CalorieEstimationResult {
  const durationMin = Math.max(1, Math.min(720, Math.round(input.durationMin || 0)));
  const intensity: WorkoutIntensity = input.intensity || "moderate";
  const type = resolveWorkoutType(input.workoutType);

  // 1. Priority 1: Verified Wearable / Imported calories
  if (input.wearableImportedCalories && input.wearableImportedCalories > 0) {
    return {
      calories: Math.round(input.wearableImportedCalories),
      met: BASE_MET_TABLE[type].default,
      bodyWeightKg: input.bodyWeightKg || DEFAULT_REFERENCE_BODY_WEIGHT_KG,
      durationMin,
      intensity,
      source: "IMPORTED",
      isReferenceWeight: !input.bodyWeightKg,
      explanation: "Verified from connected fitness tracker / wearable.",
    };
  }

  // 2. Priority 2: User explicitly provided custom calorie value
  if (input.userOverrideCalories && input.userOverrideCalories > 0) {
    return {
      calories: Math.round(input.userOverrideCalories),
      met: BASE_MET_TABLE[type].default,
      bodyWeightKg: input.bodyWeightKg || DEFAULT_REFERENCE_BODY_WEIGHT_KG,
      durationMin,
      intensity,
      source: "USER_PROVIDED",
      isReferenceWeight: !input.bodyWeightKg,
      explanation: "User entered custom calorie value.",
    };
  }

  // 3. Priority 3 & 4: Deterministic MET calculation
  const weightKg = input.bodyWeightKg && input.bodyWeightKg >= 30 && input.bodyWeightKg <= 300
    ? input.bodyWeightKg
    : DEFAULT_REFERENCE_BODY_WEIGHT_KG;

  const isReferenceWeight = !input.bodyWeightKg;
  const metConfig = BASE_MET_TABLE[type] || BASE_MET_TABLE.strength;

  let baseMet = metConfig.default;
  if (intensity === "low") baseMet = metConfig.low;
  if (intensity === "high") baseMet = metConfig.high;

  // Running speed adjustment if distance is provided
  if (type === "run" && input.distanceKm && input.distanceKm > 0 && durationMin > 0) {
    const speedKmh = (input.distanceKm / durationMin) * 60;
    if (speedKmh <= 8) baseMet = 8.3;
    else if (speedKmh <= 10) baseMet = 9.8;
    else if (speedKmh <= 12) baseMet = 11.5;
    else baseMet = 12.8;
  }

  const intensityMultiplier = INTENSITY_FACTORS[intensity];
  const hours = durationMin / 60;
  const rawCalories = baseMet * weightKg * hours * intensityMultiplier;
  const boundedCalories = Math.max(10, Math.min(3500, Math.round(rawCalories)));

  const source: CalorieSource = isReferenceWeight ? "ESTIMATED" : "CALCULATED";
  const weightNotice = isReferenceWeight ? ` (~${DEFAULT_REFERENCE_BODY_WEIGHT_KG}kg reference weight)` : ` (${weightKg}kg)`;
  const explanation = `Calculated via MET ${baseMet.toFixed(1)} (${type}, ${intensity} intensity)${weightNotice}`;

  return {
    calories: boundedCalories,
    met: baseMet,
    bodyWeightKg: weightKg,
    durationMin,
    intensity,
    source,
    isReferenceWeight,
    explanation,
  };
}
