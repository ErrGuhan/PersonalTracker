"use server";

import { estimateMealNutrition, type CalculatedFoodItem } from "@/lib/nutrition/engine";

export interface NutritionEstimateResult {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  assumptions: string;
  confidence?: "high" | "medium" | "low";
  source?: "food_database" | "gemini_ai_validated" | "estimated";
  items?: CalculatedFoodItem[];
  success: boolean;
  error?: string;
}

/**
 * Server Action: Estimates macronutrients & calories using Gemini AI and
 * curated nutrition reference database (IFCT/NIN & USDA data).
 * Enforces Atwater macro consistency and explicit portion assumptions.
 */
export async function estimateNutritionAction(
  mealDescription: string
): Promise<NutritionEstimateResult> {
  if (!mealDescription || !mealDescription.trim()) {
    return {
      calories: 0,
      protein: 0,
      carbs: 0,
      fats: 0,
      assumptions: "",
      confidence: "low",
      source: "estimated",
      success: false,
      error: "Empty meal description provided.",
    };
  }

  try {
    const result = await estimateMealNutrition(mealDescription);
    return {
      calories: result.calories,
      protein: result.protein,
      carbs: result.carbs,
      fats: result.fats,
      assumptions: result.assumptions,
      confidence: result.confidence,
      source: result.source,
      items: result.items,
      success: result.success,
      error: result.error,
    };
  } catch (err: unknown) {
    console.error("[estimateNutritionAction] Server action failed:", err);
    return {
      calories: 0,
      protein: 0,
      carbs: 0,
      fats: 0,
      assumptions: "Nutrition estimate unavailable. Please check description or enter values manually.",
      confidence: "low",
      source: "estimated",
      success: false,
      error: "Nutrition estimate unavailable. Please try again.",
    };
  }
}
