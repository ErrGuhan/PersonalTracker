import assert from "node:assert";
import { validateMacroConsistency, calculateMacroCalories, getCalorieTolerance } from "../lib/nutrition/validator";
import { estimateMealNutrition } from "../lib/nutrition/engine";

console.log("\n🧪 Running LifeSync OS Nutrition AI & Calculation Verification Suite...\n");

let passed = 0;
const failed = 0;

async function runTests() {
  console.log("▶ Suite 1: Critical Problem Verification ('7 idly, chutney')");
  {
    const res = await estimateMealNutrition("7 idly, chutney");
    assert.strictEqual(res.success, true, "Must succeed");
    
    // Check items recognized
    assert(res.items.length >= 2, "Must recognize 2 distinct items");
    const idliItem = res.items.find((i) => i.name.toLowerCase().includes("idli"));
    const chutneyItem = res.items.find((i) => i.name.toLowerCase().includes("chutney"));
    
    assert(idliItem, "Idli must be recognized");
    assert(chutneyItem, "Chutney must be recognized");
    assert.strictEqual(idliItem!.quantity, 7, "Idli quantity must be 7");
    assert.strictEqual(chutneyItem!.portionAssumption, true, "Chutney portion must be an explicit assumption");
    
    // Nutritional sanity: 7 idlis + chutney CANNOT be 35g protein (which was the bug!)
    assert(res.protein >= 10 && res.protein <= 18, `Protein must be realistic (~12-16g), got ${res.protein}g`);
    assert(res.calories >= 340 && res.calories <= 460, `Calories must be realistic (~370-420), got ${res.calories}`);
    assert(res.carbs >= 50 && res.carbs <= 75, `Carbs must be realistic (~58-68g), got ${res.carbs}g`);
    assert(res.fats >= 5 && res.fats <= 14, `Fats must be realistic (~7-11g), got ${res.fats}g`);

    // Mathematical compatibility check
    const macroCals = calculateMacroCalories(res.protein, res.carbs, res.fats);
    const tol = getCalorieTolerance(res.calories);
    assert(
      Math.abs(res.calories - macroCals) <= tol,
      `Calories (${res.calories}) and macro calories (${macroCals}) must be mathematically compatible within tolerance ±${tol}`
    );
    console.log(`  ✓ TEST 1: '7 idly, chutney' resolved accurately: ${res.calories} kcal, ${res.protein}g P, ${res.carbs}g C, ${res.fats}g F (Eliminated 35g protein bug)`);
    passed++;
  }

  console.log("\n▶ Suite 2: The 12 Standard Required Nutrition Tests");

  // TEST 2: "2 dosa with sambar"
  {
    const res = await estimateMealNutrition("2 dosa with sambar");
    assert.strictEqual(res.success, true);
    assert(res.items.some((i) => i.name.toLowerCase().includes("dosa") && i.quantity === 2));
    assert(res.items.some((i) => i.name.toLowerCase().includes("sambar")));
    const macroCals = calculateMacroCalories(res.protein, res.carbs, res.fats);
    assert(Math.abs(res.calories - macroCals) <= getCalorieTolerance(res.calories));
    console.log(`  ✓ TEST 2: '2 dosa with sambar' -> ${res.calories} kcal, ${res.protein}g P, ${res.carbs}g C, ${res.fats}g F`);
    passed++;
  }

  // TEST 3: "1 masala dosa"
  {
    const res = await estimateMealNutrition("1 masala dosa");
    assert.strictEqual(res.success, true);
    const masalaDosa = res.items.find((i) => i.name.toLowerCase().includes("masala dosa"));
    assert(masalaDosa, "Masala dosa must be recognized distinctly from plain dosa");
    assert.strictEqual(masalaDosa!.quantity, 1);
    // Masala dosa is richer than plain dosa
    assert(res.calories >= 240 && res.calories <= 290);
    const macroCals = calculateMacroCalories(res.protein, res.carbs, res.fats);
    assert(Math.abs(res.calories - macroCals) <= getCalorieTolerance(res.calories));
    console.log(`  ✓ TEST 3: '1 masala dosa' -> ${res.calories} kcal, ${res.protein}g P, ${res.carbs}g C, ${res.fats}g F (Distinguished from plain dosa)`);
    passed++;
  }

  // TEST 4: "2 chapati and dal"
  {
    const res = await estimateMealNutrition("2 chapati and dal");
    assert.strictEqual(res.success, true);
    assert(res.items.some((i) => i.name.toLowerCase().includes("chapati") && i.quantity === 2));
    assert(res.items.some((i) => i.name.toLowerCase().includes("dal")));
    const macroCals = calculateMacroCalories(res.protein, res.carbs, res.fats);
    assert(Math.abs(res.calories - macroCals) <= getCalorieTolerance(res.calories));
    console.log(`  ✓ TEST 4: '2 chapati and dal' -> ${res.calories} kcal, ${res.protein}g P, ${res.carbs}g C, ${res.fats}g F`);
    passed++;
  }

  // TEST 5: "250g cooked rice"
  {
    const res = await estimateMealNutrition("250g cooked rice");
    assert.strictEqual(res.success, true);
    const rice = res.items[0];
    assert.strictEqual(rice.unit, "g");
    assert.strictEqual(rice.quantity, 250);
    // 250g cooked rice at 130 kcal/100g = 325 kcal
    assert(res.calories >= 310 && res.calories <= 340, `Expected ~325 kcal, got ${res.calories}`);
    assert(res.carbs >= 65 && res.carbs <= 75, `Expected ~70g carbs, got ${res.carbs}`);
    const macroCals = calculateMacroCalories(res.protein, res.carbs, res.fats);
    assert(Math.abs(res.calories - macroCals) <= getCalorieTolerance(res.calories));
    console.log(`  ✓ TEST 5: '250g cooked rice' -> ${res.calories} kcal, ${res.protein}g P, ${res.carbs}g C, ${res.fats}g F`);
    passed++;
  }

  // TEST 6: "2 eggs"
  {
    const res = await estimateMealNutrition("2 eggs");
    assert.strictEqual(res.success, true);
    assert(res.items.some((i) => i.name.toLowerCase().includes("egg") && i.quantity === 2));
    // 2 large eggs ~ 140-150 kcal, ~12-13g P, ~9-10g F
    assert(res.calories >= 135 && res.calories <= 160);
    assert(res.protein >= 11 && res.protein <= 14);
    const macroCals = calculateMacroCalories(res.protein, res.carbs, res.fats);
    assert(Math.abs(res.calories - macroCals) <= getCalorieTolerance(res.calories));
    console.log(`  ✓ TEST 6: '2 eggs' -> ${res.calories} kcal, ${res.protein}g P, ${res.carbs}g C, ${res.fats}g F`);
    passed++;
  }

  // TEST 7: "1 banana"
  {
    const res = await estimateMealNutrition("1 banana");
    assert.strictEqual(res.success, true);
    assert(res.items.some((i) => i.name.toLowerCase().includes("banana") && i.quantity === 1));
    assert(res.calories >= 95 && res.calories <= 120);
    const macroCals = calculateMacroCalories(res.protein, res.carbs, res.fats);
    assert(Math.abs(res.calories - macroCals) <= getCalorieTolerance(res.calories));
    console.log(`  ✓ TEST 7: '1 banana' -> ${res.calories} kcal, ${res.protein}g P, ${res.carbs}g C, ${res.fats}g F`);
    passed++;
  }

  // TEST 8: "1 glass milk"
  {
    const res = await estimateMealNutrition("1 glass milk");
    assert.strictEqual(res.success, true);
    assert(res.items.some((i) => i.name.toLowerCase().includes("milk") && i.quantity === 1));
    // 1 glass milk (~250ml) ~ 140-160 kcal, ~7.5-8.5g protein
    assert(res.calories >= 135 && res.calories <= 165);
    assert(res.protein >= 7 && res.protein <= 10);
    const macroCals = calculateMacroCalories(res.protein, res.carbs, res.fats);
    assert(Math.abs(res.calories - macroCals) <= getCalorieTolerance(res.calories));
    console.log(`  ✓ TEST 8: '1 glass milk' -> ${res.calories} kcal, ${res.protein}g P, ${res.carbs}g C, ${res.fats}g F`);
    passed++;
  }

  // TEST 9: "1 plate chicken biryani"
  {
    const res = await estimateMealNutrition("1 plate chicken biryani");
    assert.strictEqual(res.success, true);
    assert(res.items.some((i) => i.name.toLowerCase().includes("chicken biryani")));
    assert(res.calories >= 480 && res.calories <= 560);
    assert(res.protein >= 22 && res.protein <= 30);
    const macroCals = calculateMacroCalories(res.protein, res.carbs, res.fats);
    assert(Math.abs(res.calories - macroCals) <= getCalorieTolerance(res.calories));
    console.log(`  ✓ TEST 9: '1 plate chicken biryani' -> ${res.calories} kcal, ${res.protein}g P, ${res.carbs}g C, ${res.fats}g F`);
    passed++;
  }

  // TEST 10: "100g paneer"
  {
    const res = await estimateMealNutrition("100g paneer");
    assert.strictEqual(res.success, true);
    const paneer = res.items[0];
    assert.strictEqual(paneer.unit, "g");
    assert.strictEqual(paneer.quantity, 100);
    // 100g paneer ~ 250-280 kcal, ~18g protein
    assert(res.calories >= 240 && res.calories <= 280);
    assert(res.protein >= 16 && res.protein <= 20);
    const macroCals = calculateMacroCalories(res.protein, res.carbs, res.fats);
    assert(Math.abs(res.calories - macroCals) <= getCalorieTolerance(res.calories));
    console.log(`  ✓ TEST 10: '100g paneer' -> ${res.calories} kcal, ${res.protein}g P, ${res.carbs}g C, ${res.fats}g F`);
    passed++;
  }

  // TEST 11: "2 tablespoons peanut butter"
  {
    const res = await estimateMealNutrition("2 tablespoons peanut butter");
    assert.strictEqual(res.success, true);
    assert(res.items.some((i) => i.name.toLowerCase().includes("peanut butter")));
    // 2 tbsp peanut butter ~ 180-200 kcal, ~7-9g protein, ~14-17g fat
    assert(res.calories >= 170 && res.calories <= 210);
    assert(res.protein >= 7 && res.protein <= 10);
    assert(res.fats >= 14 && res.fats <= 18);
    const macroCals = calculateMacroCalories(res.protein, res.carbs, res.fats);
    assert(Math.abs(res.calories - macroCals) <= getCalorieTolerance(res.calories));
    console.log(`  ✓ TEST 11: '2 tablespoons peanut butter' -> ${res.calories} kcal, ${res.protein}g P, ${res.carbs}g C, ${res.fats}g F`);
    passed++;
  }

  // TEST 12: "coffee with milk and sugar"
  {
    const res = await estimateMealNutrition("coffee with milk and sugar");
    assert.strictEqual(res.success, true);
    assert(res.items.some((i) => i.name.toLowerCase().includes("coffee")));
    assert(res.calories >= 60 && res.calories <= 85);
    const macroCals = calculateMacroCalories(res.protein, res.carbs, res.fats);
    assert(Math.abs(res.calories - macroCals) <= getCalorieTolerance(res.calories));
    console.log(`  ✓ TEST 12: 'coffee with milk and sugar' -> ${res.calories} kcal, ${res.protein}g P, ${res.carbs}g C, ${res.fats}g F`);
    passed++;
  }

  console.log("\n▶ Suite 3: Edge Cases & Portion Modifiers");

  // Edge Case 1: Empty input
  {
    const res = await estimateMealNutrition("");
    assert.strictEqual(res.success, false);
    assert.strictEqual(res.calories, 0);
    console.log("  ✓ Edge Case 1: Empty input returns success: false with 0 values");
    passed++;
  }

  // Edge Case 2: Unrecognized food
  {
    const res = await estimateMealNutrition("randomnonexistentfooditemxyz");
    assert.strictEqual(res.success, false);
    assert(res.error?.includes("unavailable"), "Should report honest uncertainty");
    console.log("  ✓ Edge Case 2: Completely unknown food reports honest uncertainty");
    passed++;
  }

  // Edge Case 3: Large vs Small portions ("large dosa" vs "small dosa")
  {
    const largeRes = await estimateMealNutrition("large dosa");
    const smallRes = await estimateMealNutrition("small dosa");
    assert(largeRes.calories > smallRes.calories, "Large portion must have more calories than small portion");
    console.log(`  ✓ Edge Case 3: Portion scaling works: Large dosa (${largeRes.calories} kcal) > Small dosa (${smallRes.calories} kcal)`);
    passed++;
  }

  // Edge Case 4: Misspelled & Tamil/regional aliases ("7 idly, chutney" vs "7 idli, chutney")
  {
    const resA = await estimateMealNutrition("7 idly, chutney");
    const resB = await estimateMealNutrition("7 idli, chutney");
    assert.strictEqual(resA.calories, resB.calories);
    assert.strictEqual(resA.protein, resB.protein);
    console.log("  ✓ Edge Case 4: Regional spelling 'idly' equals 'idli'");
    passed++;
  }

  // Edge Case 5: 500 ml milk scaling
  {
    const res1Glass = await estimateMealNutrition("1 glass milk");
    const res500ml = await estimateMealNutrition("500 ml milk");
    assert(res500ml.calories >= res1Glass.calories * 1.8, "500ml milk must scale proportionally (~2 glasses)");
    console.log(`  ✓ Edge Case 5: 500ml milk scaled properly: ${res500ml.calories} kcal`);
    passed++;
  }

  console.log("\n▶ Suite 4: Deterministic Macro Validator Stress & Inconsistency Correction");
  {
    // Absurd test: 550 kcal with 35g P, 50g C, 18g F (the bug from the screenshot)
    const buggyInput = { calories: 550, proteinG: 35, carbsG: 50, fatsG: 18 };
    const fixed = validateMacroConsistency(buggyInput);
    assert.strictEqual(fixed.isValid, false, "Must detect the 48 kcal discrepancy");
    assert.strictEqual(fixed.recalculated, true, "Must flag as recalculated");
    assert.strictEqual(fixed.harmonizedCalories, 502, "Must harmonize 35*4 + 50*4 + 18*9 = 502 kcal");
    console.log("  ✓ Suite 4: Atwater validator caught and harmonized the exact 550/35/50/18 discrepancy to 502 kcal");
    passed++;
  }

  console.log("\n──────────────────────────────────────────────────");
  console.log(`Results: ${passed} passed, ${failed} failed.`);
  if (failed === 0) {
    console.log("✅ All Nutrition Engine test suites passed successfully!\n");
  } else {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
