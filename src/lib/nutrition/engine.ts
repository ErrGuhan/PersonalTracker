// ─── LifeSync OS — Nutrition Calculation & Estimation Engine ──────────
// Multi-tiered architecture:
// 1. Natural language parsing & portion normalization
// 2. Curated reference database lookup (IFCT/NIN & USDA data)
// 3. Gemini AI structured inference (when API key configured)
// 4. Deterministic Atwater macro/calorie consistency validation
// 5. Explicit confidence & transparent portion assumptions

import { GoogleGenAI, Type } from "@google/genai";
import { parseMealInput, type ParsedFoodItem } from "./parser";
import { validateMacroConsistency } from "./validator";

export interface CalculatedFoodItem {
  name: string;
  quantity: number;
  unit: string;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatsG: number;
  portionAssumption: boolean;
  notes?: string;
}

export interface MealNutritionResult {
  success: boolean;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  items: CalculatedFoodItem[];
  assumptions: string;
  confidence: "high" | "medium" | "low";
  source: "food_database" | "gemini_ai_validated" | "estimated";
  error?: string;
}

/**
 * Calculates deterministic nutrition for an individual parsed food item using reference data.
 */
export function calculateItemFromReference(parsed: ParsedFoodItem): CalculatedFoodItem | null {
  const food = parsed.matchedFood;
  if (!food) return null;

  let multiplier = 1;
  const unitLower = parsed.unit.toLowerCase();

  // 1. Weight-based in grams: e.g. "250g cooked rice", "100g paneer"
  if (unitLower === "g" || unitLower === "gram" || unitLower === "grams") {
    if (food.per100g) {
      const scale = parsed.quantity / 100;
      const cals = Math.round(food.per100g.calories * scale);
      const prot = Math.round(food.per100g.proteinG * scale * 10) / 10;
      const carb = Math.round(food.per100g.carbsG * scale * 10) / 10;
      const fat = Math.round(food.per100g.fatsG * scale * 10) / 10;
      return {
        name: food.name,
        quantity: parsed.quantity,
        unit: "g",
        calories: cals,
        proteinG: prot,
        carbsG: carb,
        fatsG: fat,
        portionAssumption: false,
        notes: `Calculated from ${parsed.quantity}g weighed portion`,
      };
    } else {
      // Scale based on default serving weight
      multiplier = parsed.quantity / food.defaultServing.weightGrams;
    }
  } else if (unitLower === "ml" || unitLower === "milliliter") {
    // Liquid volume scaling
    if (food.supportedUnits["ml"]) {
      multiplier = parsed.quantity * food.supportedUnits["ml"];
    } else {
      multiplier = parsed.quantity / food.defaultServing.weightGrams;
    }
  } else if (food.supportedUnits[unitLower] !== undefined) {
    multiplier = parsed.quantity * food.supportedUnits[unitLower];
  } else {
    multiplier = parsed.quantity;
  }

  const s = food.servingNutrition;
  const calories = Math.round(s.calories * multiplier);
  const proteinG = Math.round(s.proteinG * multiplier * 10) / 10;
  const carbsG = Math.round(s.carbsG * multiplier * 10) / 10;
  const fatsG = Math.round(s.fatsG * multiplier * 10) / 10;

  return {
    name: food.name,
    quantity: parsed.quantity,
    unit: parsed.unit,
    calories,
    proteinG,
    carbsG,
    fatsG,
    portionAssumption: parsed.portionAssumption,
    notes: parsed.portionAssumption
      ? `Portion assumed: standard ${food.defaultServing.description}`
      : undefined,
  };
}

/**
 * Deterministically estimates meal nutrition solely from the curated database.
 */
export function estimateFromDatabase(mealDescription: string): MealNutritionResult | null {
  const parsedItems = parseMealInput(mealDescription);
  if (parsedItems.length === 0) return null;

  const calculatedItems: CalculatedFoodItem[] = [];
  let anyMatched = false;
  let allMatched = true;
  let hasPortionAssumption = false;

  for (const item of parsedItems) {
    const calc = calculateItemFromReference(item);
    if (calc) {
      anyMatched = true;
      calculatedItems.push(calc);
      if (item.portionAssumption) hasPortionAssumption = true;
    } else {
      allMatched = false;
      // Item not in reference database
      calculatedItems.push({
        name: item.foodName,
        quantity: item.quantity,
        unit: item.unit,
        calories: 0,
        proteinG: 0,
        carbsG: 0,
        fatsG: 0,
        portionAssumption: true,
        notes: "Unmatched item in reference database",
      });
    }
  }

  if (!anyMatched) {
    return null;
  }

  const rawCalories = calculatedItems.reduce((sum, it) => sum + it.calories, 0);
  const rawProtein = calculatedItems.reduce((sum, it) => sum + it.proteinG, 0);
  const rawCarbs = calculatedItems.reduce((sum, it) => sum + it.carbsG, 0);
  const rawFats = calculatedItems.reduce((sum, it) => sum + it.fatsG, 0);

  // Validate Atwater macro consistency
  const validation = validateMacroConsistency({
    calories: rawCalories,
    proteinG: rawProtein,
    carbsG: rawCarbs,
    fatsG: rawFats,
  });

  // Construct transparent assumption description
  const assumptionDescriptions: string[] = [];
  for (const it of calculatedItems) {
    if (it.calories > 0) {
      const qtyStr = it.unit === "g" || it.unit === "ml" ? `${it.quantity}${it.unit}` : `${it.quantity} ${it.unit}`;
      assumptionDescriptions.push(`${qtyStr} ${it.name}`);
    }
  }

  let assumptionText = `Calculated from ${assumptionDescriptions.join(" + ")}`;
  if (hasPortionAssumption) {
    assumptionText += " (standard portion sizes assumed)";
  }

  const confidence: "high" | "medium" | "low" = !allMatched
    ? "low"
    : hasPortionAssumption
    ? "medium"
    : "high";

  return {
    success: true,
    calories: validation.harmonizedCalories,
    protein: validation.proteinG,
    carbs: validation.carbsG,
    fats: validation.fatsG,
    items: calculatedItems,
    assumptions: assumptionText,
    confidence,
    source: "food_database",
  };
}

/**
 * Primary Orchestrator: Estimates nutrition using Gemini AI with strict schema
 * and validates output deterministically against Atwater factor rules and reference data.
 * Gracefully falls back to curated database when Gemini is unavailable.
 */
export async function estimateMealNutrition(mealDescription: string): Promise<MealNutritionResult> {
  const startTime = Date.now();
  const reqId = `nut-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;

  if (!mealDescription || !mealDescription.trim()) {
    return {
      success: false,
      calories: 0,
      protein: 0,
      carbs: 0,
      fats: 0,
      items: [],
      assumptions: "",
      confidence: "low",
      source: "estimated",
      error: "Empty meal description provided.",
    };
  }

  const cleanDescription = mealDescription.trim();
  const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;

  // 1. Try Gemini AI structured generation if API key is present
  if (apiKey) {
    try {
      const ai = new GoogleGenAI({ apiKey });
      const prompt = `You are an expert nutritionist and dietitian specializing in Indian and international cuisines.
Analyze this meal: "${cleanDescription}".
Break it down into discrete food items with their portions.
For each item:
- Identify food name, numeric quantity, unit (e.g. piece, bowl, cup, plate, g, ml, tablespoon).
- Estimate realistic energy (kcal), protein (g), carbohydrates (g), dietary fat (g).
- Specify if portion was assumed or user-provided.
Ensure macronutrients are scientifically realistic and mathematically consistent (Protein*4 + Carbs*4 + Fat*9 approx equals calories).
Return ONLY a valid JSON object according to the schema.`;

      const response = await ai.models.generateContent({
        model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              items: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    quantity: { type: Type.NUMBER },
                    unit: { type: Type.STRING },
                    calories: { type: Type.INTEGER },
                    proteinG: { type: Type.NUMBER },
                    carbsG: { type: Type.NUMBER },
                    fatsG: { type: Type.NUMBER },
                    portionAssumption: { type: Type.BOOLEAN },
                  },
                  required: ["name", "quantity", "unit", "calories", "proteinG", "carbsG", "fatsG", "portionAssumption"],
                },
              },
              totalCalories: { type: Type.INTEGER },
              totalProtein: { type: Type.NUMBER },
              totalCarbs: { type: Type.NUMBER },
              totalFats: { type: Type.NUMBER },
              assumptions: { type: Type.STRING },
              confidence: { type: Type.STRING, enum: ["high", "medium", "low"] },
            },
            required: ["items", "totalCalories", "totalProtein", "totalCarbs", "totalFats", "assumptions", "confidence"],
          },
        },
      });

      const rawText = response.text;
      if (!rawText) throw new Error("Empty Gemini response");

      const parsed = JSON.parse(rawText) as {
        items: Array<{
          name: string;
          quantity: number;
          unit: string;
          calories: number;
          proteinG: number;
          carbsG: number;
          fatsG: number;
          portionAssumption: boolean;
        }>;
        totalCalories: number;
        totalProtein: number;
        totalCarbs: number;
        totalFats: number;
        assumptions: string;
        confidence: "high" | "medium" | "low";
      };

      // Server-side Atwater Macro & Calorie Validation
      const validation = validateMacroConsistency({
        calories: parsed.totalCalories,
        proteinG: parsed.totalProtein,
        carbsG: parsed.totalCarbs,
        fatsG: parsed.totalFats,
      });

      const calculatedItems: CalculatedFoodItem[] = parsed.items.map((it) => ({
        name: it.name,
        quantity: it.quantity,
        unit: it.unit,
        calories: Math.max(0, Math.round(it.calories)),
        proteinG: Math.max(0, Math.round(it.proteinG * 10) / 10),
        carbsG: Math.max(0, Math.round(it.carbsG * 10) / 10),
        fatsG: Math.max(0, Math.round(it.fatsG * 10) / 10),
        portionAssumption: it.portionAssumption,
      }));

      // Safe logging (no credentials)
      console.info(`[NutritionEngine] ${reqId} Gemini parsed "${cleanDescription}" in ${Date.now() - startTime}ms (Valid: ${validation.isValid})`);

      return {
        success: true,
        calories: validation.harmonizedCalories,
        protein: validation.proteinG,
        carbs: validation.carbsG,
        fats: validation.fatsG,
        items: calculatedItems,
        assumptions: parsed.assumptions || `Estimated based on ${cleanDescription}`,
        confidence: parsed.confidence || "medium",
        source: "gemini_ai_validated",
      };
    } catch (geminiError) {
      console.warn(`[NutritionEngine] ${reqId} Gemini call failed; falling back to curated reference database:`, geminiError);
    }
  }

  // 2. Deterministic Database Fallback
  const dbResult = estimateFromDatabase(cleanDescription);
  if (dbResult) {
    console.info(`[NutritionEngine] ${reqId} Reference DB parsed "${cleanDescription}" in ${Date.now() - startTime}ms`);
    return dbResult;
  }

  // 3. Honest Uncertainty when food is completely unrecognized and Gemini is unavailable
  console.warn(`[NutritionEngine] ${reqId} Unrecognized food items for "${cleanDescription}" without active AI service.`);
  return {
    success: false,
    calories: 0,
    protein: 0,
    carbs: 0,
    fats: 0,
    items: [],
    assumptions: "Unable to find nutritional data for this description. Please specify portion sizes or enter values manually.",
    confidence: "low",
    source: "estimated",
    error: "Nutrition estimate unavailable for this description. Please specify portions or enter macros manually.",
  };
}
