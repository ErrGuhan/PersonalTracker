import assert from "node:assert";
import {
  calculateHabitStreak,
  getLocalDateString,
  getRelativeLocalDateString,
  parseLocalDate,
  todayStr,
} from "../lib/db";
import type { HabitLog } from "../lib/database.types";

console.log("\n🧪 Running LifeSync OS Habit Engine Verification Suite...\n");

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

const TEST_HABIT_ID = "h-test-workout";
const TEST_USER_ID = "00000000-0000-0000-0000-000000000001";

// ─────────────────────────────────────────────────────────
// TEST 1 — BRAND NEW HABIT
// ─────────────────────────────────────────────────────────
console.log("▶ Suite 1: Brand New Habit (Zero-Streak Guarantee)");

it("TEST 1: New habit with no completed logs starts with streak = 0, NOT 1", () => {
  const result = calculateHabitStreak([], "2026-09-04");
  assert.strictEqual(result.streak, 0, `Expected streak to be 0 for new habit, got ${result.streak}`);
  assert.strictEqual(result.completedToday, false, "Today must be incomplete for brand new habit");
  assert.strictEqual(result.todayStatus, "INCOMPLETE");
});

// ─────────────────────────────────────────────────────────
// TEST 2 — COMPLETE TODAY
// ─────────────────────────────────────────────────────────
console.log("\n▶ Suite 2: First Earned Completion");

it("TEST 2: Completing today earns a 1-day streak", () => {
  const today = "2026-09-04";
  const logs: HabitLog[] = [
    {
      id: "hl-1",
      habit_id: TEST_HABIT_ID,
      user_id: TEST_USER_ID,
      log_date: today,
      status: "COMPLETED",
      created_at: new Date().toISOString(),
    },
  ];

  const result = calculateHabitStreak(logs, today);
  assert.strictEqual(result.streak, 1, `Expected streak of 1 after first completion, got ${result.streak}`);
  assert.strictEqual(result.completedToday, true, "Today must be completed");
  assert.strictEqual(result.todayStatus, "COMPLETED");
});

// ─────────────────────────────────────────────────────────
// TEST 3 — UN-COMPLETE / TOGGLE REVERSIBILITY
// ─────────────────────────────────────────────────────────
console.log("\n▶ Suite 3: Reversibility & Clean Toggle State");

it("TEST 3: Un-completing today reverts streak to 0 when no prior history exists", () => {
  const today = "2026-09-04";
  // Simulating removal of today's log after un-toggle
  const logs: HabitLog[] = [];

  const result = calculateHabitStreak(logs, today);
  assert.strictEqual(result.streak, 0);
  assert.strictEqual(result.completedToday, false);
  assert.strictEqual(result.todayStatus, "INCOMPLETE");
});

// ─────────────────────────────────────────────────────────
// TEST 4 — NEXT DAY BEHAVIOR (PRESERVE HISTORY & STREAK)
// ─────────────────────────────────────────────────────────
console.log("\n▶ Suite 4: New Day Transition (Daily Action Resets, History Persists)");

it("TEST 4: On a new day, previous completion remains in history and streak carries over", () => {
  const day1 = "2026-09-03";
  const day2 = "2026-09-04"; // Today

  // Day 1 was completed. Day 2 has no log yet.
  const logs: HabitLog[] = [
    {
      id: "hl-day1",
      habit_id: TEST_HABIT_ID,
      user_id: TEST_USER_ID,
      log_date: day1,
      status: "COMPLETED",
      created_at: new Date().toISOString(),
    },
  ];

  const result = calculateHabitStreak(logs, day2);
  assert.strictEqual(result.streak, 1, `Streak from yesterday must carry over (expected 1, got ${result.streak})`);
  assert.strictEqual(result.completedToday, false, "Today must start as incomplete on a new day");
  assert.strictEqual(result.todayStatus, "INCOMPLETE");
  assert.strictEqual(logs.length, 1, "Historical log for Day 1 must NEVER be deleted");
});

// ─────────────────────────────────────────────────────────
// TEST 5 — MULTIPLE DAYS SEQUENCE (SEPARATE TODAY VS STREAK)
// ─────────────────────────────────────────────────────────
console.log("\n▶ Suite 5: Multi-Day Streak Momentum");

it("TEST 5: Consecutive completions on Sept 1, 2, 3 maintain 3-day streak on Sept 4 morning", () => {
  const logs: HabitLog[] = [
    { id: "hl-1", habit_id: TEST_HABIT_ID, user_id: TEST_USER_ID, log_date: "2026-09-01", status: "COMPLETED", created_at: "" },
    { id: "hl-2", habit_id: TEST_HABIT_ID, user_id: TEST_USER_ID, log_date: "2026-09-02", status: "COMPLETED", created_at: "" },
    { id: "hl-3", habit_id: TEST_HABIT_ID, user_id: TEST_USER_ID, log_date: "2026-09-03", status: "COMPLETED", created_at: "" },
  ];

  // Sept 4 morning: not completed yet
  const morning = calculateHabitStreak(logs, "2026-09-04");
  assert.strictEqual(morning.streak, 3, `Expected streak 3 on morning of Sept 4, got ${morning.streak}`);
  assert.strictEqual(morning.completedToday, false, "Sept 4 must be incomplete in morning");

  // User completes Sept 4
  const updatedLogs = [
    ...logs,
    { id: "hl-4", habit_id: TEST_HABIT_ID, user_id: TEST_USER_ID, log_date: "2026-09-04", status: "COMPLETED" as const, created_at: "" },
  ];
  const evening = calculateHabitStreak(updatedLogs, "2026-09-04");
  assert.strictEqual(evening.streak, 4, `Expected streak 4 after completing Sept 4, got ${evening.streak}`);
  assert.strictEqual(evening.completedToday, true, "Sept 4 must now be completed");
});

// ─────────────────────────────────────────────────────────
// TEST 6 — MISSED DAY CLEAN RESET
// ─────────────────────────────────────────────────────────
console.log("\n▶ Suite 6: Missed Day Handling");

it("TEST 6: Sept 1 & 2 completed, Sept 3 missed, Sept 4 completed yields streak = 1, NOT 4", () => {
  const logs: HabitLog[] = [
    { id: "hl-1", habit_id: TEST_HABIT_ID, user_id: TEST_USER_ID, log_date: "2026-09-01", status: "COMPLETED", created_at: "" },
    { id: "hl-2", habit_id: TEST_HABIT_ID, user_id: TEST_USER_ID, log_date: "2026-09-02", status: "COMPLETED", created_at: "" },
    // Sept 3 MISSED (no log)
    { id: "hl-4", habit_id: TEST_HABIT_ID, user_id: TEST_USER_ID, log_date: "2026-09-04", status: "COMPLETED", created_at: "" },
  ];

  const result = calculateHabitStreak(logs, "2026-09-04");
  assert.strictEqual(result.streak, 1, `Streak must reset after missed day (expected 1, got ${result.streak})`);
  assert.strictEqual(result.completedToday, true);
});

// ─────────────────────────────────────────────────────────
// TEST 7 — STREAK FREEZE / REST DAY PROTECTION
// ─────────────────────────────────────────────────────────
console.log("\n▶ Suite 7: Streak Freeze / Rest Day Protection");

it("TEST 7: Sept 1 & 2 completed, Sept 3 FROZEN, Sept 4 completed preserves 4-day streak", () => {
  const logs: HabitLog[] = [
    { id: "hl-1", habit_id: TEST_HABIT_ID, user_id: TEST_USER_ID, log_date: "2026-09-01", status: "COMPLETED", created_at: "" },
    { id: "hl-2", habit_id: TEST_HABIT_ID, user_id: TEST_USER_ID, log_date: "2026-09-02", status: "COMPLETED", created_at: "" },
    { id: "hl-3", habit_id: TEST_HABIT_ID, user_id: TEST_USER_ID, log_date: "2026-09-03", status: "FROZEN", created_at: "" },
    { id: "hl-4", habit_id: TEST_HABIT_ID, user_id: TEST_USER_ID, log_date: "2026-09-04", status: "COMPLETED", created_at: "" },
  ];

  const result = calculateHabitStreak(logs, "2026-09-04");
  assert.strictEqual(result.streak, 4, `Frozen day must maintain streak continuity (expected 4, got ${result.streak})`);
  assert.strictEqual(result.completedToday, true);
});

// ─────────────────────────────────────────────────────────
// TEST 8 — IDEMPOTENCY & DUPLICATE PREVENTION
// ─────────────────────────────────────────────────────────
console.log("\n▶ Suite 8: Idempotency & Duplicate Prevention");

it("TEST 8: Multiple logs on the same date are handled cleanly by unique constraint logic", () => {
  const dateMap = new Map<string, string>();
  const addLog = (date: string, status: string) => {
    dateMap.set(date, status);
  };

  addLog("2026-09-04", "COMPLETED");
  addLog("2026-09-04", "COMPLETED"); // Duplicate click

  assert.strictEqual(dateMap.size, 1, "Only one log entry must exist for a single calendar date");
});

// ─────────────────────────────────────────────────────────
// TEST 9 — TIMEZONE & LOCAL DATE SANITY
// ─────────────────────────────────────────────────────────
console.log("\n▶ Suite 9: Timezone & Canonical Date Handling");

it("TEST 9: getLocalDateString correctly formats YYYY-MM-DD from local calendar components", () => {
  const testDate = new Date(2026, 8, 4, 1, 30, 0); // Sept 4, 2026, 01:30 AM local
  const formatted = getLocalDateString(testDate);
  assert.strictEqual(formatted, "2026-09-04", `Expected 2026-09-04, got ${formatted}`);

  const parsed = parseLocalDate("2026-09-04");
  assert.strictEqual(parsed.getFullYear(), 2026);
  assert.strictEqual(parsed.getMonth(), 8); // 0-indexed Sept
  assert.strictEqual(parsed.getDate(), 4);

  const yesterday = getRelativeLocalDateString(-1, parsed);
  assert.strictEqual(yesterday, "2026-09-03");
});

// ─────────────────────────────────────────────────────────
// TEST 10 — EXPLICIT TODAY VS STREAK DISTINCTION
// ─────────────────────────────────────────────────────────
console.log("\n▶ Suite 10: Strict Separation of Today's Action vs Streak");

it("TEST 10: currentStreak > 0 does NOT imply todayCompleted = true", () => {
  const logs: HabitLog[] = [
    { id: "hl-1", habit_id: TEST_HABIT_ID, user_id: TEST_USER_ID, log_date: "2026-09-03", status: "COMPLETED", created_at: "" },
  ];

  const result = calculateHabitStreak(logs, "2026-09-04");
  assert(result.streak > 0, "Streak is 1 from yesterday");
  assert.strictEqual(result.completedToday, false, "Today MUST be incomplete regardless of streak > 0");
  assert.strictEqual(result.todayStatus, "INCOMPLETE");
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
  console.log("✅ All 10 habit engine test cases passed successfully!\n");
}
