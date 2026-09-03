import assert from "node:assert";
import {
  calculateDeterministicRecovery,
  calculateRecoveryBaseline,
  calculateDeterministicDailyCapacity,
  calculateHealthTrends,
  evaluateDataAvailability,
  computeRecoveryIntelligence,
} from "../lib/ai/deterministic";
import { buildHealthContextBundle, formatContextPromptString } from "../lib/ai/context";
import { DEMO_USER_ID } from "../lib/db";
import type { HealthMetric, SleepLog, Workout, Habit } from "../lib/database.types";

console.log("\n🧪 Running LifeSync OS Health Engine Verification Suite...\n");

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

// ─────────────────────────────────────────────────────────
// 1. DETERMINISTIC RECOVERY CALCULATION
// ─────────────────────────────────────────────────────────
console.log("▶ Suite 1: Pure Deterministic Recovery Calculations");

it("returns null recovery score when 0 biometrics or sleep exist", () => {
  const score = calculateDeterministicRecovery(null, null);
  assert.strictEqual(score, null, "Should be null when no data is recorded");
});

it("computes dynamic recovery when ONLY sleep duration is recorded (e.g. 7.5h)", () => {
  const mockSleep: SleepLog = {
    id: "s1",
    user_id: DEMO_USER_ID,
    hours: 7.5,
    quality: 4,
    deep_pct: 20,
    rem_pct: 20,
    light_pct: 55,
    awake_pct: 5,
    sleep_date: "2026-09-03",
    bedtime: "23:00",
    wake_time: "06:30",
    rested_rating: 4,
    notes: null,
    created_at: new Date().toISOString(),
  };

  const score = calculateDeterministicRecovery(null, mockSleep);
  assert(score !== null, "Recovery score should be computed from sleep");
  assert(score >= 80 && score <= 100, `Expected ~94% score for 7.5h sleep, got ${score}`);
});

it("computes proportionally reduced recovery when sleep duration is low (e.g. 4.0h)", () => {
  const mockSleep: SleepLog = {
    id: "s2",
    user_id: DEMO_USER_ID,
    hours: 4.0,
    quality: 2,
    deep_pct: 10,
    rem_pct: 10,
    light_pct: 70,
    awake_pct: 10,
    sleep_date: "2026-09-03",
    bedtime: "02:00",
    wake_time: "06:00",
    rested_rating: 2,
    notes: null,
    created_at: new Date().toISOString(),
  };

  const score = calculateDeterministicRecovery(null, mockSleep);
  assert(score !== null, "Recovery score should be computed");
  assert(score <= 55, `Expected low recovery for 4h sleep, got ${score}`);
});

it("weights all available telemetry dynamically (sleep, HRV, hydration, stress, SpO2)", () => {
  const mockMetrics: HealthMetric = {
    id: "m1",
    user_id: DEMO_USER_ID,
    recorded_at: new Date().toISOString(),
    hrv_ms: 75,
    spo2: 99,
    heart_rate: 58,
    stress_pct: 20,
    hydration_pct: 90,
    body_temp: 98.4,
    vo2_max: 48,
    recovery_score: null,
    calories_burned: 2000,
    steps: 8500,
    created_at: new Date().toISOString(),
  };

  const mockSleep: SleepLog = {
    id: "s3",
    user_id: DEMO_USER_ID,
    hours: 8.0,
    quality: 5,
    deep_pct: 25,
    rem_pct: 20,
    light_pct: 50,
    awake_pct: 5,
    sleep_date: "2026-09-03",
    bedtime: "22:30",
    wake_time: "06:30",
    rested_rating: 5,
    notes: null,
    created_at: new Date().toISOString(),
  };

  const score = calculateDeterministicRecovery(mockMetrics, mockSleep);
  assert(score !== null, "Recovery score should be computed");
  assert(score >= 85, `Expected high recovery score for prime vitals, got ${score}`);
});

// ─────────────────────────────────────────────────────────
// 2. BASELINES & TRENDS SAFETY
// ─────────────────────────────────────────────────────────
console.log("\n▶ Suite 2: Baseline Calibration & Historical Trends");

it("returns null baseline and INSUFFICIENT confidence when 0 historical days exist", () => {
  const { baselineScore, confidence } = calculateRecoveryBaseline([]);
  assert.strictEqual(baselineScore, null, "Baseline should be null with 0 days of history");
  assert.strictEqual(confidence, "INSUFFICIENT", "Confidence should be INSUFFICIENT with 0 days");
});

it("does NOT backfill untracked days with fake defaults (7.2h sleep or 65ms HRV)", () => {
  const trends = calculateHealthTrends([], [], [], [], 7);
  assert.strictEqual(trends.length, 7, "Should produce 7-day window");

  for (const point of trends) {
    assert.strictEqual(point.hasData, false, "Empty day must have hasData: false");
    assert.strictEqual(point.recoveryScore, null, "Empty day recoveryScore must be null");
    assert.strictEqual(point.sleepHours, null, "Empty day sleepHours must be null");
    assert.strictEqual(point.hrvMs, null, "Empty day hrvMs must be null");
  }
});

// ─────────────────────────────────────────────────────────
// 3. DAILY CAPACITY ENGINE
// ─────────────────────────────────────────────────────────
console.log("\n▶ Suite 3: Deterministic Daily Capacity");

it("evaluates INSUFFICIENT capacity when recovery score is null and sleep is null", () => {
  const capacity = calculateDeterministicDailyCapacity(null, null, 25, 0, 0);
  assert.strictEqual(capacity.level, "INSUFFICIENT", "Capacity must be INSUFFICIENT without telemetry");
  assert.strictEqual(capacity.confidence, "INSUFFICIENT");
});

it("evaluates HIGH capacity when recovery score is >= 75", () => {
  const capacity = calculateDeterministicDailyCapacity(82, null, 20, 45, 3);
  assert.strictEqual(capacity.level, "HIGH");
  assert(capacity.recommendedFocusMinutes >= 90, `Expected >= 90 focus minutes, got ${capacity.recommendedFocusMinutes}`);
});

// ─────────────────────────────────────────────────────────
// 4. DATA AVAILABILITY EVALUATION
// ─────────────────────────────────────────────────────────
console.log("\n▶ Suite 4: Data Availability Policy");

it("evaluates MISSING when neither metrics nor sleep are recorded", () => {
  const status = evaluateDataAvailability(null, null, 0);
  assert.strictEqual(status, "MISSING");
});

it("evaluates INSUFFICIENT when tracked history is less than 3 days", () => {
  const mockSleep: SleepLog = {
    id: "s-test",
    user_id: DEMO_USER_ID,
    hours: 7.0,
    quality: 3,
    deep_pct: 0,
    rem_pct: 0,
    light_pct: 0,
    awake_pct: 0,
    sleep_date: "2026-09-03",
    bedtime: null,
    wake_time: null,
    rested_rating: null,
    notes: null,
    created_at: new Date().toISOString(),
  };
  const status = evaluateDataAvailability(null, mockSleep, 1);
  assert.strictEqual(status, "INSUFFICIENT");
});

it("evaluates PARTIAL when only sleep is recorded but history has >= 3 days", () => {
  const mockSleep: SleepLog = {
    id: "s-test",
    user_id: DEMO_USER_ID,
    hours: 7.0,
    quality: 3,
    deep_pct: 0,
    rem_pct: 0,
    light_pct: 0,
    awake_pct: 0,
    sleep_date: "2026-09-03",
    bedtime: null,
    wake_time: null,
    rested_rating: null,
    notes: null,
    created_at: new Date().toISOString(),
  };
  const status = evaluateDataAvailability(null, mockSleep, 5);
  assert.strictEqual(status, "PARTIAL");
});

// ─────────────────────────────────────────────────────────
// 5. DATABASE SAFETY & UUID CONSTRAINTS
// ─────────────────────────────────────────────────────────
console.log("\n▶ Suite 5: Database User Scoping & UUID Safety");

it("ensures DEMO_USER_ID is a valid RFC4122 UUID matching Supabase schema seed", () => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  assert(uuidRegex.test(DEMO_USER_ID), `DEMO_USER_ID (${DEMO_USER_ID}) must be a valid UUID`);
  assert.strictEqual(DEMO_USER_ID, "00000000-0000-0000-0000-000000000001");
});

// ─────────────────────────────────────────────────────────
// 6. AI CONTEXT GROUNDING & ANTI-HALLUCINATION
// ─────────────────────────────────────────────────────────
console.log("\n▶ Suite 6: Centralized AI Context Builder & Grounding");

it("generates explicit NOT_RECORDED prompt strings when biometrics are missing", () => {
  const bundle = buildHealthContextBundle(null, null, [], [], [], [], []);
  const promptStr = formatContextPromptString(bundle);

  assert(promptStr.includes("Today Recovery: NOT_RECORDED"), "Must explicitly mark recovery as NOT_RECORDED");
  assert(promptStr.includes("Today Sleep: NOT_RECORDED"), "Must explicitly mark sleep as NOT_RECORDED");
  assert(promptStr.includes("DO NOT invent") && promptStr.includes("hallucinate"), "Must contain anti-hallucination instruction");
});

it("factor breakdown marks unrecorded metrics with isRecorded: false instead of 0s", () => {
  const intel = computeRecoveryIntelligence(null, null, [], [], []);
  assert.strictEqual(intel.score, null, "Empty intel score must be null");
  assert.strictEqual(intel.factors.hrv.isRecorded, false, "HRV factor must be marked unrecorded");
  assert.strictEqual(intel.factors.hrv.statusText, "Not recorded");
  assert.strictEqual(intel.factors.spo2.isRecorded, false, "SpO2 factor must be marked unrecorded");
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
  console.log("✅ All 12 health engine assertions passed successfully!\n");
}
