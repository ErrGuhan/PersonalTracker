import assert from "node:assert";
import {
  getGoals,
  createGoal,
  updateGoal,
  updateGoalProgress,
  deleteGoal,
  DEMO_USER_ID,
  clearMemoryStore,
} from "../lib/db";
import { buildHealthAiContextBundle, formatContextPromptString } from "../lib/ai/context";
import type { Goal } from "../lib/database.types";

console.log("\n🧪 Running LifeSync OS Goal Engine Verification Suite...\n");

let passed = 0;
let failed = 0;

async function test(name: string, fn: () => Promise<void> | void) {
  try {
    clearMemoryStore();
    if (typeof window !== "undefined" && window.localStorage) {
      window.localStorage.clear();
    }
    await fn();
    console.log(`  ✓ ${name}`);
    passed++;
  } catch (err: any) {
    console.error(`  ✗ ${name}`);
    console.error(`    Error: ${err.message}`);
    failed++;
  }
}

async function runSuite() {
  // ─── TEST 1: NEW USER (0 GOALS -> NO DEMO DATA) ───
  console.log("▶ Suite 1: Brand New User (Zero-Goal Guarantee)");
  await test("TEST 1: Brand new user returns empty array without hardcoded demo goals", async () => {
    const goals = await getGoals();
    assert.strictEqual(Array.isArray(goals), true);
    assert.strictEqual(goals.length, 0);
    const titles = goals.map((g) => g.title.toLowerCase());
    assert.strictEqual(titles.includes("overall fitness"), false);
    assert.strictEqual(titles.includes("big data computing"), false);
    assert.strictEqual(titles.includes("data analytics by novitech tech"), false);
  });

  // ─── TEST 2: CREATE GOAL ───
  console.log("\n▶ Suite 2: Goal Creation & Persistence");
  await test("TEST 2: Creates a persistent strategic goal with valid attributes", async () => {
    const created = await createGoal({
      title: "Big Data Computing",
      category: "Learning",
      icon: "🧠",
      progress: 18,
      target_description: "NPTEL Exam",
      detail: "October 17, 2026",
      accent: "#4cd7f6",
    });

    assert.notStrictEqual(created, null);
    assert.strictEqual(created?.title, "Big Data Computing");
    assert.strictEqual(created?.category, "Learning");
    assert.strictEqual(created?.progress, 18);
    assert.strictEqual(created?.target_description, "NPTEL Exam");
    assert.strictEqual(created?.detail, "October 17, 2026");
    assert.strictEqual(created?.user_id, DEMO_USER_ID);

    const all = await getGoals();
    assert.strictEqual(all.length, 1);
    assert.strictEqual(all[0].id, created?.id);
    assert.strictEqual(all[0].progress, 18);
  });

  // ─── TEST 3: VALIDATE PROGRESS RANGE (REJECT INVALID) ───
  console.log("\n▶ Suite 3: Validation & Error Safety");
  await test("TEST 3: Rejects invalid titles and out-of-range progress values", async () => {
    let err1: any = null;
    try {
      await createGoal({
        title: "   ",
        category: "Learning",
        icon: "🎯",
        progress: 10,
        target_description: "",
        detail: "",
        accent: "#4cd7f6",
      });
    } catch (e) {
      err1 = e;
    }
    assert.notStrictEqual(err1, null, "Should reject empty title");

    let err2: any = null;
    try {
      await createGoal({
        title: "Negative Progress Goal",
        category: "Learning",
        icon: "🎯",
        progress: -5,
        target_description: "",
        detail: "",
        accent: "#4cd7f6",
      });
    } catch (e) {
      err2 = e;
    }
    assert.notStrictEqual(err2, null, "Should reject negative progress");

    let err3: any = null;
    try {
      await createGoal({
        title: "Over 100 Goal",
        category: "Learning",
        icon: "🎯",
        progress: 120,
        target_description: "",
        detail: "",
        accent: "#4cd7f6",
      });
    } catch (e) {
      err3 = e;
    }
    assert.notStrictEqual(err3, null, "Should reject progress > 100");
  });

  // ─── TEST 4: UPDATE PROGRESS PERSISTENCE ───
  console.log("\n▶ Suite 4: Clean Progress Updates");
  await test("TEST 4: Updates progress to arbitrary percentage and persists across reads", async () => {
    const created = await createGoal({
      title: "Marathon Sub-4",
      category: "Fitness",
      icon: "🏃",
      progress: 15,
      target_description: "Sub-4 hours",
      detail: "Dec 2026",
      accent: "#ec6a06",
    });
    assert.notStrictEqual(created, null);
    const id = created!.id;

    const updated = await updateGoalProgress(id, 35);
    assert.strictEqual(updated?.progress, 35);

    const list = await getGoals();
    const found = list.find((g) => g.id === id);
    assert.strictEqual(found?.progress, 35);
  });

  // ─── TEST 5: EDIT GOAL PRESERVES EXISTING PROGRESS ───
  console.log("\n▶ Suite 5: Goal Modification & Field Independence");
  await test("TEST 5: Editing goal title or deadline preserves existing progress level", async () => {
    const created = await createGoal({
      title: "Old Title",
      category: "Learning",
      icon: "📚",
      progress: 42,
      target_description: "Old Target",
      detail: "Old Date",
      accent: "#b395ff",
    });
    const id = created!.id;

    const edited = await updateGoal(id, {
      title: "New Enhanced Title",
      detail: "November 20, 2026",
    });

    assert.strictEqual(edited?.title, "New Enhanced Title");
    assert.strictEqual(edited?.detail, "November 20, 2026");
    assert.strictEqual(edited?.progress, 42, "Progress must remain exactly 42%");

    const list = await getGoals();
    const found = list.find((g) => g.id === id);
    assert.strictEqual(found?.title, "New Enhanced Title");
    assert.strictEqual(found?.progress, 42);
  });

  // ─── TEST 6: DELETE GOAL REMOVES RECORD ───
  console.log("\n▶ Suite 6: Deletion Safety");
  await test("TEST 6: Deletes goal cleanly from storage and cache", async () => {
    const g1 = await createGoal({
      title: "Goal to Keep",
      category: "Fitness",
      icon: "🏋️",
      progress: 20,
      target_description: "",
      detail: "",
      accent: "#ec6a06",
    });

    const g2 = await createGoal({
      title: "Goal to Delete",
      category: "Mindset",
      icon: "🧘",
      progress: 50,
      target_description: "",
      detail: "",
      accent: "#4cd7f6",
    });

    let list = await getGoals();
    assert.strictEqual(list.length, 2);

    const success = await deleteGoal(g2!.id);
    assert.strictEqual(success, true);

    list = await getGoals();
    assert.strictEqual(list.length, 1);
    assert.strictEqual(list[0].id, g1!.id);
    assert.strictEqual(list.find((g) => g.id === g2!.id), undefined);
  });

  // ─── TEST 7: 100% COMPLETION HANDLING ───
  console.log("\n▶ Suite 7: Completion State");
  await test("TEST 7: 100% progress marks goal complete without deleting it", async () => {
    const created = await createGoal({
      title: "Complete 100 Days of Code",
      category: "Learning",
      icon: "💻",
      progress: 99,
      target_description: "100 Days",
      detail: "Final Milestone",
      accent: "#4cd7f6",
    });

    const completed = await updateGoalProgress(created!.id, 100);
    assert.strictEqual(completed?.progress, 100);

    const list = await getGoals();
    const found = list.find((g) => g.id === created!.id);
    assert.notStrictEqual(found, undefined);
    assert.strictEqual(found?.progress, 100);
  });

  // ─── TEST 8: AI TELEMETRY GROUND TRUTH INTEGRATION ───
  console.log("\n▶ Suite 8: AI Context & Grounding");
  await test("TEST 8: AI context bundle grounds assistant in real active goals", () => {
    const mockGoals: Goal[] = [
      {
        id: "g1",
        user_id: DEMO_USER_ID,
        title: "Big Data Computing",
        category: "Learning",
        icon: "🧠",
        progress: 18,
        target_description: "NPTEL Exam",
        detail: "October 17, 2026",
        accent: "#4cd7f6",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: "g2",
        user_id: DEMO_USER_ID,
        title: "Sub-4 Marathon",
        category: "Fitness",
        icon: "🏃",
        progress: 100,
        target_description: "42.2km",
        detail: "Completed",
        accent: "#ec6a06",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];

    const bundle = buildHealthAiContextBundle(
      null,
      null,
      [],
      [],
      [],
      [],
      [],
      undefined,
      null,
      [],
      mockGoals
    );

    assert.notStrictEqual(bundle.goalsSummary, undefined);
    assert.strictEqual(bundle.goalsSummary?.totalGoals, 2);
    assert.strictEqual(bundle.goalsSummary?.completedGoals, 1);
    assert.strictEqual(bundle.goalsSummary?.activeGoals.length, 2);

    const promptText = formatContextPromptString(bundle);
    assert.strictEqual(
      promptText.includes("Active Goals: Big Data Computing (Learning: 18%); Sub-4 Marathon (Fitness: 100%)"),
      true
    );
  });

  console.log("\n──────────────────────────────────────────────────");
  console.log(`Results: ${passed} passed, ${failed} failed.`);
  if (failed > 0) {
    console.error(`❌ ${failed} tests failed.`);
    process.exit(1);
  } else {
    console.log(`✅ All ${passed} goal engine test cases passed successfully!`);
  }
}

runSuite();
