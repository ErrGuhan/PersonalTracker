import assert from "node:assert";
import {
  estimateWorkoutCalories,
  resolveWorkoutType,
  BASE_MET_TABLE,
  INTENSITY_FACTORS,
  DEFAULT_REFERENCE_BODY_WEIGHT_KG,
} from "../lib/fitness/calorieEngine";
import {
  calculateProgramActiveDay,
  saveWorkoutProgram,
  getWorkoutPrograms,
  toggleWorkoutExerciseCompletion,
  getWorkoutCompletions,
  getWeeklyWorkoutStats,
  logWorkout,
  getWorkoutHeatmapData,
  deleteWorkout,
} from "../lib/db";
import type { WorkoutProgram } from "../lib/database.types";

console.log("\n🧪 Running LifeSync OS Fitness Hub Engine & MET Calorie Verification Suite...\n");

let passed = 0;
let failed = 0;

async function test(name: string, fn: () => void | Promise<void>) {
  try {
    await fn();
    console.log(`  ✓ ${name}`);
    passed++;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`  ✗ ${name}`);
    console.error(`    Error: ${msg}`);
    failed++;
  }
}

async function runAll() {
  console.log("▶ Suite 1: MET Calorie Estimation Engine");

  await test("resolves canonical workout types correctly", () => {
    assert.strictEqual(resolveWorkoutType("Morning 5k Run"), "run");
    assert.strictEqual(resolveWorkoutType("Heavy Bench Press & Arms"), "strength");
    assert.strictEqual(resolveWorkoutType("Tabata HIIT Burner"), "hiit");
    assert.strictEqual(resolveWorkoutType("Stationary Bike Cardio"), "cardio");
    assert.strictEqual(resolveWorkoutType("Vinyasa Flow Yoga"), "yoga");
    assert.strictEqual(resolveWorkoutType("Freestyle Laps"), "swim");
    assert.strictEqual(resolveWorkoutType("Brisk Walk"), "walk");
  });

  await test("calculates strength training calories deterministically for a 75kg person (45 min)", () => {
    // MET for strength default = 4.5
    // 4.5 * 75 * (45/60) * 1.0 = 253.125 -> 253
    const result = estimateWorkoutCalories({
      workoutType: "strength",
      durationMin: 45,
      bodyWeightKg: 75,
      intensity: "moderate",
    });

    assert.strictEqual(result.calories, 253);
    assert.strictEqual(result.met, 4.5);
    assert.strictEqual(result.bodyWeightKg, 75);
    assert.strictEqual(result.source, "CALCULATED");
    assert.strictEqual(result.isReferenceWeight, false);
  });

  await test("calculates high intensity run calories with speed adjustment", () => {
    // 10 km in 50 min = 12 km/h -> baseMet = 11.5
    // 11.5 * 70 * (50/60) * 1.25 = 838.5 -> 839
    const result = estimateWorkoutCalories({
      workoutType: "run",
      durationMin: 50,
      bodyWeightKg: 70,
      distanceKm: 10,
      intensity: "high",
    });

    assert.strictEqual(result.met, 11.5);
    assert.strictEqual(result.calories, 839);
    assert.strictEqual(result.source, "CALCULATED");
  });

  await test("falls back gracefully to standard 70kg clinical reference weight when weight is missing", () => {
    const result = estimateWorkoutCalories({
      workoutType: "hiit",
      durationMin: 30,
      bodyWeightKg: null,
      intensity: "moderate",
    });

    // MET 8.0 * 70 * (30/60) * 1.0 = 280
    assert.strictEqual(result.calories, 280);
    assert.strictEqual(result.bodyWeightKg, DEFAULT_REFERENCE_BODY_WEIGHT_KG);
    assert.strictEqual(result.source, "ESTIMATED");
    assert.strictEqual(result.isReferenceWeight, true);
    assert.ok(result.explanation.includes("reference weight"));
  });

  await test("prioritizes wearable imported calories over calculations", () => {
    const result = estimateWorkoutCalories({
      workoutType: "run",
      durationMin: 45,
      wearableImportedCalories: 485,
    });

    assert.strictEqual(result.calories, 485);
    assert.strictEqual(result.source, "IMPORTED");
  });

  await test("prioritizes user-provided custom calories over estimation", () => {
    const result = estimateWorkoutCalories({
      workoutType: "strength",
      durationMin: 60,
      userOverrideCalories: 550,
    });

    assert.strictEqual(result.calories, 550);
    assert.strictEqual(result.source, "USER_PROVIDED");
  });

  await test("bounds extreme inputs safely without NaN or Infinity", () => {
    const lowResult = estimateWorkoutCalories({
      workoutType: "yoga",
      durationMin: -10,
    });
    assert.ok(lowResult.calories >= 10);
    assert.ok(Number.isFinite(lowResult.calories));

    const highResult = estimateWorkoutCalories({
      workoutType: "run",
      durationMin: 9999,
    });
    assert.ok(highResult.calories <= 3500);
    assert.ok(Number.isFinite(highResult.calories));
  });

  console.log("\n▶ Suite 2: Program Progression & Daily Reset Behavior");

  const sampleProgram: WorkoutProgram = {
    id: "prog-test-1",
    userId: "test-user",
    name: "14-Day Hypertrophy",
    goal: "muscle_gain",
    durationDays: 14,
    startDate: "2026-09-01",
    isActive: true,
    createdAt: "2026-09-01T00:00:00.000Z",
    updatedAt: "2026-09-01T00:00:00.000Z",
    days: [
      {
        id: "day-1",
        programId: "prog-test-1",
        dayNumber: 1,
        title: "Day 1 — Upper Push",
        focus: "push",
        isRestDay: false,
        exercises: [
          { id: "ex-1", workoutDayId: "day-1", name: "Bench Press", type: "strength", sets: 4, reps: "8-10", orderIndex: 1 },
          { id: "ex-2", workoutDayId: "day-1", name: "Incline Dumbbell Press", type: "strength", sets: 3, reps: "10-12", orderIndex: 2 },
        ],
      },
      {
        id: "day-2",
        programId: "prog-test-1",
        dayNumber: 2,
        title: "Day 2 — Lower Body",
        focus: "legs",
        isRestDay: false,
        exercises: [
          { id: "ex-3", workoutDayId: "day-2", name: "Barbell Squats", type: "strength", sets: 4, reps: "6-8", orderIndex: 1 },
        ],
      },
      {
        id: "day-3",
        programId: "prog-test-1",
        dayNumber: 3,
        title: "Day 3 — Rest & Restoration",
        focus: "recovery",
        isRestDay: true,
        exercises: [
          { id: "ex-4", workoutDayId: "day-3", name: "Mobility Stretch", type: "stretch", orderIndex: 1 },
        ],
      },
    ],
  };

  await test("calculates active day progression based on calendar dates", () => {
    const day1 = calculateProgramActiveDay(sampleProgram, "2026-09-01");
    assert.strictEqual(day1.dayNumber, 1);
    assert.strictEqual(day1.workoutDay?.title, "Day 1 — Upper Push");
    assert.strictEqual(day1.isRestDay, false);

    const day2 = calculateProgramActiveDay(sampleProgram, "2026-09-02");
    assert.strictEqual(day2.dayNumber, 2);
    assert.strictEqual(day2.workoutDay?.title, "Day 2 — Lower Body");
    assert.strictEqual(day2.isRestDay, false);

    const day3 = calculateProgramActiveDay(sampleProgram, "2026-09-03");
    assert.strictEqual(day3.dayNumber, 3);
    assert.strictEqual(day3.workoutDay?.title, "Day 3 — Rest & Restoration");
    assert.strictEqual(day3.isRestDay, true);
  });

  await test("preserves historical completions when transitioning between days without mutation", async () => {
    // Simulate completing Day 1 on 2026-09-01
    const comp1 = await toggleWorkoutExerciseCompletion("ex-1", "day-1", "2026-09-01");
    assert.strictEqual(comp1.completed, true);
    assert.strictEqual(comp1.completionDate, "2026-09-01");

    // Check completions on 2026-09-01
    const day1Completions = getWorkoutCompletions("2026-09-01");
    assert.ok(day1Completions.some((c) => c.exerciseId === "ex-1" && c.completed));

    // Check completions on 2026-09-02 (Day 2 starts clean!)
    const day2Completions = getWorkoutCompletions("2026-09-02");
    assert.strictEqual(day2Completions.some((c) => c.exerciseId === "ex-1"), false);

    // Verify Day 1 remains recorded historically
    const recheckDay1 = getWorkoutCompletions("2026-09-01");
    assert.ok(recheckDay1.some((c) => c.exerciseId === "ex-1" && c.completed));

    // Original template exercise remains untouched
    assert.strictEqual(sampleProgram.days?.[0].exercises?.[0].name, "Bench Press");
  });

  console.log("\n▶ Suite 3: Actual Workout Log Integration & Real Heatmap");

  await test("computes weekly stats strictly from actual workout logs", async () => {
    const today = "2026-09-03";
    const w1 = await logWorkout({
      name: "Upper Body Strength",
      type: "strength",
      duration_min: 50,
      calories: 320,
      distance_km: null,
      avg_heart_rate: null,
      notes: null,
      workout_date: today,
    });

    const w2 = await logWorkout({
      name: "Tempo Run",
      type: "run",
      duration_min: 30,
      calories: 310,
      distance_km: 5.0,
      avg_heart_rate: null,
      notes: null,
      workout_date: today,
    });

    const stats = await getWeeklyWorkoutStats();
    assert.ok(stats.totalCalories >= 630);
    assert.ok(stats.totalMinutes >= 80);
    assert.ok(stats.totalDistance >= 5.0);

    // Clean up created workouts
    if (w1?.id) await deleteWorkout(w1.id);
    if (w2?.id) await deleteWorkout(w2.id);
  });

  await test("calculates real heatmap data with deterministic activity tiers (0 to 3)", async () => {
    const heatmap = await getWorkoutHeatmapData(16);
    assert.strictEqual(heatmap.length, 112); // 16 weeks * 7 days
    for (const tier of heatmap) {
      assert.ok([0, 1, 2, 3].includes(tier));
    }
  });

  console.log(`\n──────────────────────────────────────────────────`);
  console.log(`Results: ${passed} passed, ${failed} failed.`);
  if (failed > 0) {
    console.error(`❌ Fitness Hub engine test verification failed!`);
    process.exit(1);
  } else {
    console.log(`✅ All Fitness Hub engine test suites passed successfully!\n`);
  }
}

runAll().catch((err) => {
  console.error("Fatal test execution error:", err);
  process.exit(1);
});
