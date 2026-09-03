// ─── LifeSync OS — Macronutrient & Calorie Mathematical Validator ──────
// Enforces the Atwater general factor system:
//   Calories = (Protein × 4) + (Carbohydrates × 4) + (Fat × 9)
// Provides deterministic consistency checks, tolerance enforcement, and harmonization.

export interface MacroValidationInput {
  calories: number;
  proteinG: number;
  carbsG: number;
  fatsG: number;
}

export interface MacroValidationResult {
  isValid: boolean;
  reportedCalories: number;
  calculatedMacroCalories: number;
  discrepancyKcal: number;
  toleranceKcal: number;
  harmonizedCalories: number;
  proteinG: number;
  carbsG: number;
  fatsG: number;
  recalculated: boolean;
  notes: string;
}

/**
 * Calculates theoretical caloric content from macronutrient quantities
 * using the standard Atwater general system:
 * - Protein: 4 kcal/g
 * - Carbohydrates: 4 kcal/g
 * - Dietary Fat: 9 kcal/g
 */
export function calculateMacroCalories(proteinG: number, carbsG: number, fatsG: number): number {
  const p = Math.max(0, proteinG);
  const c = Math.max(0, carbsG);
  const f = Math.max(0, fatsG);
  return Math.round(p * 4 + c * 4 + f * 9);
}

/**
 * Computes allowable tolerance for calorie/macro differences.
 *
 * RATIONALE:
 * - Regulatory labeling (FDA, FSSAI, ICMR) allows rounding macros to the nearest 1g
 *   and calories to the nearest 5-10 kcal.
 * - Insoluble dietary fiber contributes ~0-2 kcal/g rather than 4 kcal/g.
 * - Three macros rounded down by 0.49g can accumulate up to 8.4 kcal rounding variance.
 *
 * FORMULA:
 *   tolerance = max(15 kcal, round(reportedCalories * 0.08))
 *
 * Examples:
 * - 100 kcal meal: tolerance is 15 kcal (±15%)
 * - 500 kcal meal: tolerance is 40 kcal (±8%)
 * - 1000 kcal meal: tolerance is 80 kcal (±8%)
 */
export function getCalorieTolerance(reportedCalories: number): number {
  const safeCalories = Math.max(0, reportedCalories);
  return Math.max(15, Math.round(safeCalories * 0.08));
}

/**
 * Validates reported calories against macronutrients.
 * If discrepancy exceeds tolerance, harmonizes calories to calculated macro calories.
 */
export function validateMacroConsistency(input: MacroValidationInput): MacroValidationResult {
  const proteinG = Math.max(0, Math.round(input.proteinG || 0));
  const carbsG = Math.max(0, Math.round(input.carbsG || 0));
  const fatsG = Math.max(0, Math.round(input.fatsG || 0));
  const reportedCalories = Math.max(0, Math.round(input.calories || 0));

  const calculatedMacroCalories = calculateMacroCalories(proteinG, carbsG, fatsG);
  const discrepancyKcal = Math.abs(reportedCalories - calculatedMacroCalories);
  const toleranceKcal = getCalorieTolerance(reportedCalories);

  // If reported calories is 0 but macros exist, harmonize directly
  if (reportedCalories === 0 && calculatedMacroCalories > 0) {
    return {
      isValid: false,
      reportedCalories,
      calculatedMacroCalories,
      discrepancyKcal,
      toleranceKcal,
      harmonizedCalories: calculatedMacroCalories,
      proteinG,
      carbsG,
      fatsG,
      recalculated: true,
      notes: "Calories were zero; derived deterministically from macronutrients.",
    };
  }

  // If reported calories is within acceptable scientific tolerance
  if (discrepancyKcal <= toleranceKcal) {
    return {
      isValid: true,
      reportedCalories,
      calculatedMacroCalories,
      discrepancyKcal,
      toleranceKcal,
      harmonizedCalories: reportedCalories,
      proteinG,
      carbsG,
      fatsG,
      recalculated: false,
      notes: `Mathematically consistent (discrepancy ${discrepancyKcal} kcal is within allowable ±${toleranceKcal} kcal tolerance).`,
    };
  }

  // Discrepancy exceeds tolerance: harmonize calories to Atwater sum
  return {
    isValid: false,
    reportedCalories,
    calculatedMacroCalories,
    discrepancyKcal,
    toleranceKcal,
    harmonizedCalories: calculatedMacroCalories,
    proteinG,
    carbsG,
    fatsG,
    recalculated: true,
    notes: `Discrepancy of ${discrepancyKcal} kcal exceeded tolerance (±${toleranceKcal} kcal). Calorie total harmonized to macro sum.`,
  };
}
