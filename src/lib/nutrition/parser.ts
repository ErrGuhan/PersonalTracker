// ─── LifeSync OS — Natural Language Food & Portion Parser ────────────
// Tokenizes multi-item meals, extracts quantities, recognizes units,
// and maps to curated ReferenceFoodItems with explicit portion assumptions.

import { FOOD_DATABASE, type ReferenceFoodItem } from "./database";

export interface ParsedFoodItem {
  rawText: string;
  matchedFood: ReferenceFoodItem | null;
  foodName: string;
  quantity: number;
  unit: string;
  weightGrams?: number;
  portionAssumption: boolean;
  notes?: string;
}

const NUMBER_WORDS: Record<string, number> = {
  half: 0.5,
  "1/2": 0.5,
  a: 1,
  an: 1,
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
  ten: 10,
  single: 1,
  double: 2,
  triple: 3,
  couple: 2,
};

// Recognized units and canonical form
const UNIT_SYNONYMS: Record<string, string> = {
  g: "g",
  gm: "g",
  gms: "g",
  gram: "g",
  grams: "g",
  ml: "ml",
  milliliter: "ml",
  milliliters: "ml",
  l: "liter",
  liter: "liter",
  liters: "liter",
  piece: "piece",
  pieces: "piece",
  pc: "piece",
  pcs: "piece",
  slice: "piece",
  slices: "piece",
  plate: "plate",
  plates: "plate",
  bowl: "bowl",
  bowls: "bowl",
  cup: "cup",
  cups: "cup",
  glass: "glass",
  glasses: "glass",
  tbsp: "tablespoon",
  tbsps: "tablespoon",
  tablespoon: "tablespoon",
  tablespoons: "tablespoon",
  tsp: "teaspoon",
  tsps: "teaspoon",
  teaspoon: "teaspoon",
  teaspoons: "teaspoon",
  serving: "serving",
  servings: "serving",
};

/**
 * Splits a composite meal description into separate food tokens without
 * breaking known composite dishes like "coffee with milk and sugar" or "curd rice".
 */
export function splitMealDescription(text: string): string[] {
  if (!text || !text.trim()) return [];

  const lower = text.toLowerCase().trim();

  // Guard against splitting known composite phrases
  const preservedPhrases = [
    "coffee with milk and sugar",
    "tea with milk and sugar",
    "tea with milk",
    "coffee with milk",
    "curd rice",
    "chicken biryani",
    "masala dosa",
    "peanut butter",
    "coconut chutney",
    "peanut chutney",
  ];

  for (const phrase of preservedPhrases) {
    if (lower === phrase) {
      return [text.trim()];
    }
  }

  // Split on commas, "+", "&", and connective words "with", "and", "along with"
  // But ensure we don't split phrases like "coffee with milk" if part of the whole text
  const rawSegments = text
    .split(/[,+&]|\band\b|\balong with\b|\bplus\b/i)
    .map((s) => s.trim())
    .filter(Boolean);

  // If a segment contains "with", check if it should split (e.g., "2 dosa with sambar")
  const result: string[] = [];
  for (const seg of rawSegments) {
    const segLower = seg.toLowerCase();
    if (
      segLower.includes(" with ") &&
      !segLower.includes("coffee with milk") &&
      !segLower.includes("tea with milk")
    ) {
      const parts = seg.split(/\bwith\b/i).map((p) => p.trim()).filter(Boolean);
      result.push(...parts);
    } else {
      result.push(seg);
    }
  }

  return result.length > 0 ? result : [text.trim()];
}

/**
 * Finds the best reference food item matching the given text snippet.
 * Prioritizes multi-word matches ("masala dosa" > "dosa").
 */
export function findMatchingFood(text: string): ReferenceFoodItem | null {
  const clean = text.toLowerCase().trim().replace(/[.,!?;:()]/g, " ");
  const tokens = clean.split(/\s+/).filter(Boolean);

  let bestMatch: ReferenceFoodItem | null = null;
  let maxMatchedLength = 0;

  for (const food of FOOD_DATABASE) {
    for (const alias of food.aliases) {
      const aliasStr = alias.toLowerCase();

      // Check if text strictly includes the full alias phrase
      const regex = new RegExp(`(^|\\s)${aliasStr.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}($|\\s)`, "i");
      if (regex.test(clean)) {
        if (aliasStr.length > maxMatchedLength) {
          maxMatchedLength = aliasStr.length;
          bestMatch = food;
        }
      }
    }
  }

  // Secondary search: token containment
  if (!bestMatch) {
    for (const food of FOOD_DATABASE) {
      for (const alias of food.aliases) {
        if (tokens.some((t) => t === alias.toLowerCase())) {
          return food;
        }
      }
    }
  }

  return bestMatch;
}

/**
 * Parses a single item segment (e.g., "7 idly", "chutney", "250g cooked rice", "2 tablespoons peanut butter").
 */
export function parseFoodSegment(segment: string): ParsedFoodItem {
  const rawText = segment.trim();
  const lower = rawText.toLowerCase().replace(/[.,;:()]/g, " ");

  // 1. Check for numeric + unit pattern (e.g., "250g", "250 g", "500ml", "2.5 cups", "1/2 cup")
  let quantity: number | null = null;
  let unit: string = "serving";
  let portionAssumption = false;

  // Regex for "250g", "250 g", "7 pieces", "2 tablespoons", "1.5 bowls"
  const qtyUnitRegex = /^(\d+(?:\.\d+)?|\d+\/\d+)\s*([a-zA-Z]+)?\s*(.*)$/;
  const match = lower.match(qtyUnitRegex);

  let remainderText = lower;

  if (match) {
    const rawNum = match[1];
    const rawUnit = match[2];
    const rest = match[3];

    if (rawNum.includes("/")) {
      const [num, den] = rawNum.split("/").map(Number);
      quantity = den ? num / den : 1;
    } else {
      quantity = parseFloat(rawNum);
    }

    if (rawUnit && UNIT_SYNONYMS[rawUnit]) {
      unit = UNIT_SYNONYMS[rawUnit];
      remainderText = rest || "";
    } else if (rawUnit) {
      // Could be the food name directly, e.g., "7 idly"
      remainderText = `${rawUnit} ${rest || ""}`.trim();
    } else {
      remainderText = rest || "";
    }
  } else {
    // Check for word numbers at start: "two eggs", "one banana", "half plate"
    const words = lower.split(/\s+/).filter(Boolean);
    if (words.length > 0 && NUMBER_WORDS[words[0]] !== undefined) {
      quantity = NUMBER_WORDS[words[0]];
      const nextWord = words[1];
      if (nextWord && UNIT_SYNONYMS[nextWord]) {
        unit = UNIT_SYNONYMS[nextWord];
        remainderText = words.slice(2).join(" ");
      } else {
        remainderText = words.slice(1).join(" ");
      }
    }
  }

  // 2. Portion modifiers: "large", "small", "medium", "little", "lots"
  let sizeMultiplier = 1;
  if (remainderText.includes("large")) {
    sizeMultiplier = 1.3;
    remainderText = remainderText.replace(/\blarge\b/g, "").trim();
  } else if (remainderText.includes("small")) {
    sizeMultiplier = 0.75;
    remainderText = remainderText.replace(/\bsmall\b/g, "").trim();
  } else if (remainderText.includes("very little") || remainderText.includes("little")) {
    sizeMultiplier = 0.5;
    remainderText = remainderText.replace(/\bvery little\b|\blittle\b/g, "").trim();
  } else if (remainderText.includes("lots of") || remainderText.includes("lots")) {
    sizeMultiplier = 1.8;
    remainderText = remainderText.replace(/\blots of\b|\blots\b/g, "").trim();
  } else if (remainderText.includes("medium")) {
    remainderText = remainderText.replace(/\bmedium\b/g, "").trim();
  }

  // 3. Find matching food item
  // First test the remainderText, then fallback to full lower string if needed
  let matchedFood = findMatchingFood(remainderText);
  if (!matchedFood) {
    matchedFood = findMatchingFood(lower);
  }

  // 4. Default quantity & portion assumption resolution
  if (quantity === null || isNaN(quantity) || quantity <= 0) {
    quantity = 1;
    portionAssumption = true; // User didn't specify quantity, e.g. "chutney"
  } else {
    portionAssumption = false;
  }

  // 5. Default unit resolution based on food
  if (matchedFood) {
    if (unit === "serving" && matchedFood.defaultServing.unit !== "serving") {
      unit = matchedFood.defaultServing.unit;
    }
  }

  // Multiply quantity by size modifier if specified
  quantity = quantity * sizeMultiplier;

  const foodName = matchedFood ? matchedFood.name : (remainderText || rawText);

  return {
    rawText,
    matchedFood,
    foodName,
    quantity,
    unit,
    portionAssumption,
    weightGrams: unit === "g" ? quantity : undefined,
  };
}

/**
 * Parses an entire meal string into an array of structured, portion-aware items.
 */
export function parseMealInput(mealDescription: string): ParsedFoodItem[] {
  const segments = splitMealDescription(mealDescription);
  return segments.map(parseFoodSegment);
}
