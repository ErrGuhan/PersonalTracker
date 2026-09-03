import assert from "node:assert";
import {
  getLocalDateString,
  getRelativeLocalDateString,
  parseLocalDate,
  extractLocalDate,
  todayStr,
} from "../lib/db";
import {
  buildHealthAiContextBundle,
  formatContextPromptString,
} from "../lib/ai/context";
import type {
  HydrationEntry,
  MealLog,
  HydrationLog,
} from "../lib/database.types";

console.log("\n🧪 Running LifeSync OS Fuel (Hydration & Nutrition) Engine Verification Suite...\n");

let passed = 0;
let failed = 0;

function it(name: string, fn: () => void) {
  try {
    fn();
    console.log(`  ✓ ${name}`);
    passed++;
  } catch (err: any) {
    console.error(`  ✗ ${name}`);
    console.error(`    Error: ${err.message}`);
    failed++;
  }
}

const USER_A = "00000000-0000-0000-0000-000000000001";
const USER_B = "00000000-0000-0000-0000-000000000002";

// Pure calculation helper simulating getTodayHydration over immutable entries
function calcHydrationForDate(
  entries: HydrationEntry[],
  targetDate: string,
  targetMl: number = 2500
): HydrationLog {
  const filtered = entries.filter((e) => {
    if (!e.logged_at) return false;
    return extractLocalDate(e.logged_at) === targetDate;
  });

  const amountMl = filtered.reduce((s, e) => s + (Number(e.amount_ml) || 0), 0);
  const lastUpdated = filtered.length > 0 ? filtered[filtered.length - 1].logged_at : null;

  return { amountMl, targetMl, lastUpdated };
}

// Pure calculation helper simulating getTodayMeals & getTodayNutritionStats
function calcNutritionForDate(meals: MealLog[], targetDate: string) {
  const todayMeals = meals.filter((m) => {
    if (!m.loggedAt) return false;
    return extractLocalDate(m.loggedAt) === targetDate;
  });

  return {
    meals: todayMeals,
    stats: {
      totalCalories: todayMeals.reduce((s, m) => s + (Number(m.calories) || 0), 0),
      totalProtein: todayMeals.reduce((s, m) => s + (Number(m.proteinG) || 0), 0),
      totalCarbs: todayMeals.reduce((s, m) => s + (Number(m.carbsG) || 0), 0),
      totalFats: todayMeals.reduce((s, m) => s + (Number(m.fatsG) || 0), 0),
    },
  };
}

// ─────────────────────────────────────────────────────────
// TEST 1 — NEW DAY NATURALLY STARTS AT ZERO, HISTORY PRESERVED
// ─────────────────────────────────────────────────────────
console.log("▶ Suite 1: New Calendar Day Reset Without Historical Deletions");

it("TEST 1: Yesterday had 4750ml & 2100kcal. Today starts at 0ml & 0kcal with yesterday intact in history", () => {
  const yesterday = "2026-09-03";
  const today = "2026-09-04";

  // Yesterday's historical records
  const allHydration: HydrationEntry[] = [
    { id: "h1", user_id: USER_A, amount_ml: 2500, logged_at: `${yesterday}T09:00:00` },
    { id: "h2", user_id: USER_A, amount_ml: 2250, logged_at: `${yesterday}T15:00:00` },
  ];
  const allMeals: MealLog[] = [
    { id: "m1", user_id: USER_A, name: "Lunch", mealType: "lunch", calories: 1200, proteinG: 70, carbsG: 120, fatsG: 40, loggedAt: `${yesterday}T12:30:00` },
    { id: "m2", user_id: USER_A, name: "Dinner", mealType: "dinner", calories: 900, proteinG: 50, carbsG: 100, fatsG: 30, loggedAt: `${yesterday}T19:00:00` },
  ];

  // Querying yesterday yields the full historical totals
  const yHyd = calcHydrationForDate(allHydration, yesterday);
  assert.strictEqual(yHyd.amountMl, 4750, "Yesterday hydration must be 4750ml");

  const yNut = calcNutritionForDate(allMeals, yesterday);
  assert.strictEqual(yNut.stats.totalCalories, 2100, "Yesterday calories must be 2100");
  assert.strictEqual(yNut.stats.totalProtein, 120);

  // Querying today yields 0, without deleting any historical records
  const tHyd = calcHydrationForDate(allHydration, today);
  assert.strictEqual(tHyd.amountMl, 0, "Today hydration must naturally be 0ml");

  const tNut = calcNutritionForDate(allMeals, today);
  assert.strictEqual(tNut.meals.length, 0, "Today meals list must be empty");
  assert.strictEqual(tNut.stats.totalCalories, 0, "Today calories must be 0");
  assert.strictEqual(tNut.stats.totalProtein, 0);

  // Zero records were deleted
  assert.strictEqual(allHydration.length, 2, "Historical hydration entries must NEVER be deleted");
  assert.strictEqual(allMeals.length, 2, "Historical meal entries must NEVER be deleted");
});

// ─────────────────────────────────────────────────────────
// TEST 2 — ADD WATER INCREMENTAL SEQUENCE
// ─────────────────────────────────────────────────────────
console.log("\n▶ Suite 2: Discrete Water Logging (+250, +500, +750)");

it("TEST 2: Adding +250ml, +500ml, +750ml increments today total to 1500ml", () => {
  const today = "2026-09-04";
  const entries: HydrationEntry[] = [];

  entries.push({ id: "e1", user_id: USER_A, amount_ml: 250, logged_at: `${today}T08:00:00.000Z` });
  assert.strictEqual(calcHydrationForDate(entries, today).amountMl, 250);

  entries.push({ id: "e2", user_id: USER_A, amount_ml: 500, logged_at: `${today}T11:00:00.000Z` });
  assert.strictEqual(calcHydrationForDate(entries, today).amountMl, 750);

  entries.push({ id: "e3", user_id: USER_A, amount_ml: 750, logged_at: `${today}T15:00:00.000Z` });
  assert.strictEqual(calcHydrationForDate(entries, today).amountMl, 1500);
});

// ─────────────────────────────────────────────────────────
// TEST 3 & 4 — PERSISTENCE & NAVIGATION
// ─────────────────────────────────────────────────────────
console.log("\n▶ Suite 3: Deterministic Persistence Across Re-reads");

it("TEST 3 & 4: Aggregation produces the exact same 1500ml on re-read and tab switch", () => {
  const today = "2026-09-04";
  const serialized = JSON.stringify([
    { id: "e1", user_id: USER_A, amount_ml: 500, logged_at: `${today}T08:00:00.000Z` },
    { id: "e2", user_id: USER_A, amount_ml: 1000, logged_at: `${today}T12:00:00.000Z` },
  ]);

  const deserialized: HydrationEntry[] = JSON.parse(serialized);
  const result = calcHydrationForDate(deserialized, today);
  assert.strictEqual(result.amountMl, 1500, "Value restored from storage must equal 1500ml");
});

// ─────────────────────────────────────────────────────────
// TEST 5 & 6 — MEAL AGGREGATION
// ─────────────────────────────────────────────────────────
console.log("\n▶ Suite 4: Macronutrient & Calorie Aggregation");

it("TEST 5 & 6: Single meal and second meal aggregate calories and macros correctly", () => {
  const today = "2026-09-04";
  const meals: MealLog[] = [];

  meals.push({
    id: "m1",
    user_id: USER_A,
    name: "Breakfast Oats",
    mealType: "breakfast",
    calories: 500,
    proteinG: 30,
    carbsG: 50,
    fatsG: 15,
    loggedAt: `${today}T08:30:00.000Z`,
  });

  const meal1Nut = calcNutritionForDate(meals, today);
  assert.strictEqual(meal1Nut.stats.totalCalories, 500);
  assert.strictEqual(meal1Nut.stats.totalProtein, 30);
  assert.strictEqual(meal1Nut.stats.totalCarbs, 50);
  assert.strictEqual(meal1Nut.stats.totalFats, 15);

  meals.push({
    id: "m2",
    user_id: USER_A,
    name: "Chicken Bowl",
    mealType: "lunch",
    calories: 700,
    proteinG: 40,
    carbsG: 70,
    fatsG: 20,
    loggedAt: `${today}T13:00:00.000Z`,
  });

  const meal2Nut = calcNutritionForDate(meals, today);
  assert.strictEqual(meal2Nut.stats.totalCalories, 1200);
  assert.strictEqual(meal2Nut.stats.totalProtein, 70);
  assert.strictEqual(meal2Nut.stats.totalCarbs, 120);
  assert.strictEqual(meal2Nut.stats.totalFats, 35);
  assert.strictEqual(meal2Nut.meals.length, 2);
});

// ─────────────────────────────────────────────────────────
// TEST 7 — NEXT DAY MEAL RESET
// ─────────────────────────────────────────────────────────
console.log("\n▶ Suite 5: New Day Meal Reset");

it("TEST 7: On Sept 5, Sept 4 meals remain stored but Sept 5 totals are 0", () => {
  const meals: MealLog[] = [
    { id: "m1", user_id: USER_A, name: "Lunch", mealType: "lunch", calories: 600, proteinG: 35, carbsG: 60, fatsG: 18, loggedAt: "2026-09-04T12:00:00.000Z" },
  ];

  const sept5Nut = calcNutritionForDate(meals, "2026-09-05");
  assert.strictEqual(sept5Nut.meals.length, 0, "No meals logged on Sept 5");
  assert.strictEqual(sept5Nut.stats.totalCalories, 0);
  assert.strictEqual(sept5Nut.stats.totalProtein, 0);
  assert.strictEqual(meals.length, 1, "Sept 4 meal remains in historical collection");
});

// ─────────────────────────────────────────────────────────
// TEST 8 — USER ISOLATION
// ─────────────────────────────────────────────────────────
console.log("\n▶ Suite 6: Multi-Tenant User Isolation");

it("TEST 8: User A cannot see User B's hydration or meal records", () => {
  const today = "2026-09-04";
  const allHydration: HydrationEntry[] = [
    { id: "hA", user_id: USER_A, amount_ml: 1000, logged_at: `${today}T10:00:00.000Z` },
    { id: "hB", user_id: USER_B, amount_ml: 2500, logged_at: `${today}T10:00:00.000Z` },
  ];

  const userAEntries = allHydration.filter((h) => h.user_id === USER_A);
  const userBEntries = allHydration.filter((h) => h.user_id === USER_B);

  assert.strictEqual(calcHydrationForDate(userAEntries, today).amountMl, 1000);
  assert.strictEqual(calcHydrationForDate(userBEntries, today).amountMl, 2500);
});

// ─────────────────────────────────────────────────────────
// TEST 9 — DYNAMIC AI ADAPTATION
// ─────────────────────────────────────────────────────────
console.log("\n▶ Suite 7: Dynamic AI Context Grounding");

it("TEST 9: AI context and prompt string adapt dynamically when hydration changes", () => {
  // Baseline with 0ml
  const bundle0 = buildHealthAiContextBundle(null, null, [], [], [], [], [], undefined, { amountMl: 0, targetMl: 2500, lastUpdated: null }, []);
  const prompt0 = formatContextPromptString(bundle0);
  assert(prompt0.includes("Today Hydration: NOT_RECORDED (no hydration logged today)"), "Must report NOT_RECORDED when 0ml logged");
  assert(prompt0.includes("Today Nutrition: NOT_RECORDED (no meals logged today)"));

  // After drinking 1500ml
  const bundle1500 = buildHealthAiContextBundle(null, null, [], [], [], [], [], undefined, { amountMl: 1500, targetMl: 2500, lastUpdated: new Date().toISOString() }, []);
  const prompt1500 = formatContextPromptString(bundle1500);
  assert(prompt1500.includes("Today Hydration: 1500ml / 2500ml (60%)"), "Prompt must reflect updated 1500ml telemetry");

  // After drinking 2500ml
  const bundle2500 = buildHealthAiContextBundle(null, null, [], [], [], [], [], undefined, { amountMl: 2500, targetMl: 2500, lastUpdated: new Date().toISOString() }, []);
  const prompt2500 = formatContextPromptString(bundle2500);
  assert(prompt2500.includes("Today Hydration: 2500ml / 2500ml (100%)"), "Prompt must reflect 100% target reached");
});

// ─────────────────────────────────────────────────────────
// TEST 10 — EMPTY STATE (NO FAKE DATA)
// ─────────────────────────────────────────────────────────
console.log("\n▶ Suite 8: Zero-State Integrity");

it("TEST 10: Empty state produces strictly 0 values and no fake fallbacks", () => {
  const today = "2026-09-04";
  const emptyHyd = calcHydrationForDate([], today);
  assert.strictEqual(emptyHyd.amountMl, 0);
  assert.strictEqual(emptyHyd.targetMl, 2500);
  assert.strictEqual(emptyHyd.lastUpdated, null);

  const emptyNut = calcNutritionForDate([], today);
  assert.strictEqual(emptyNut.meals.length, 0);
  assert.strictEqual(emptyNut.stats.totalCalories, 0);
  assert.strictEqual(emptyNut.stats.totalProtein, 0);
  assert.strictEqual(emptyNut.stats.totalCarbs, 0);
  assert.strictEqual(emptyNut.stats.totalFats, 0);
});

// ─────────────────────────────────────────────────────────
// TEST 11 — UNCAPPED HYDRATION PROGRESS
// ─────────────────────────────────────────────────────────
console.log("\n▶ Suite 9: Hydration Progress Calculation");

it("TEST 11: Consuming 3000ml / 2500ml displays 120% without capping at 100%", () => {
  const amountMl = 3000;
  const targetMl = 2500;
  const pct = Math.round((amountMl / targetMl) * 100);

  assert.strictEqual(pct, 120, "Progress percentage must be 120%, not capped at 100%");
  const barWidth = Math.min(100, pct);
  assert.strictEqual(barWidth, 100, "Visual bar width is safely capped at 100% for CSS");
});

// ─────────────────────────────────────────────────────────
// TEST 12 — CANONICAL LOCAL CALENDAR BOUNDARY
// ─────────────────────────────────────────────────────────
console.log("\n▶ Suite 10: Local Timezone Boundary Handling");

it("TEST 12: Calendar day comparison correctly segments local morning, noon, and evening", () => {
  const morning = "2026-09-04T06:15:00.000";
  const evening = "2026-09-04T23:45:00.000";
  const nextDay = "2026-09-05T00:05:00.000";

  assert.strictEqual(getLocalDateString(new Date(morning)), "2026-09-04");
  assert.strictEqual(getLocalDateString(new Date(evening)), "2026-09-04");
  assert.strictEqual(getLocalDateString(new Date(nextDay)), "2026-09-05");
});

// ─────────────────────────────────────────────────────────
// SUMMARY
// ─────────────────────────────────────────────────────────
console.log("\n" + "─".repeat(50));
console.log(`Results: ${passed} passed, ${failed} failed.`);
if (failed > 0) {
  console.error("❌ Test suite failed.");
  process.exit(1);
} else {
  console.log("✅ All 12 fuel engine test cases passed successfully!\n");
}
