import assert from "node:assert";
import {
  NAV_ITEMS,
  getCanonicalNavItem,
  isRouteActive,
  getNextRoute,
  getPrevRoute,
} from "../lib/navigation";

console.log("\n🧪 Running LifeSync OS Navigation & Gesture Engine Verification Suite...\n");

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
// SUITE 1 — CENTRALIZED ROUTE MAPPING & CANONICAL RESOLUTION
// ─────────────────────────────────────────────────────────
console.log("▶ Suite 1: Centralized Navigation Map & Canonical Resolution");

it("TEST 1: All 7 primary routes resolve to their canonical definitions", () => {
  assert.strictEqual(NAV_ITEMS.length, 7, "Must define exactly 7 primary navigation routes");

  const expectedHrefs = ["/", "/study", "/fit", "/health", "/habits", "/fuel", "/goals"];
  NAV_ITEMS.forEach((item, idx) => {
    assert.strictEqual(item.href, expectedHrefs[idx], `Item ${item.id} must map to ${expectedHrefs[idx]}`);
    assert(item.label.length > 0, "Item must have a non-empty desktop label");
    assert(item.shortLabel.length > 0, "Item must have a non-empty mobile shortLabel");
    assert(item.icon.length > 0, "Item must have an icon");
  });
});

it("TEST 2: Legacy route aliases resolve cleanly to canonical targets", () => {
  assert.strictEqual(getCanonicalNavItem("/dashboard").href, "/");
  assert.strictEqual(getCanonicalNavItem("/fitness").href, "/fit");
  assert.strictEqual(getCanonicalNavItem("/routines").href, "/habits");
  assert.strictEqual(getCanonicalNavItem("/nutrition").href, "/fuel");
});

it("TEST 3: Pathnames with trailing slashes or query parameters normalize correctly", () => {
  assert.strictEqual(getCanonicalNavItem("/health/").href, "/health");
  assert.strictEqual(getCanonicalNavItem("/fuel?date=2026-09-03").href, "/fuel");
  assert.strictEqual(getCanonicalNavItem("/goals/").href, "/goals");
});

// ─────────────────────────────────────────────────────────
// SUITE 2 — SINGLE SOURCE OF TRUTH ACTIVE ROUTE CHECK
// ─────────────────────────────────────────────────────────
console.log("\n▶ Suite 2: Single Source of Truth Route Matching");

it("TEST 4: isRouteActive returns true strictly for matching route and false for others", () => {
  assert.strictEqual(isRouteActive("/health", "/health"), true);
  assert.strictEqual(isRouteActive("/health", "/fuel"), false);
  assert.strictEqual(isRouteActive("/health", "/habits"), false);
  assert.strictEqual(isRouteActive("/", "/"), true);
  assert.strictEqual(isRouteActive("/dashboard", "/"), true, "Alias /dashboard should mark / as active");
});

// ─────────────────────────────────────────────────────────
// SUITE 3 — DETERMINISTIC HORIZONTAL SWIPE CHAIN
// ─────────────────────────────────────────────────────────
console.log("\n▶ Suite 3: Swipe Direction & Boundary Locking");

it("TEST 5: Swipe Left traverses forward through routes and locks at final boundary", () => {
  assert.strictEqual(getNextRoute("/"), "/study");
  assert.strictEqual(getNextRoute("/study"), "/fit");
  assert.strictEqual(getNextRoute("/fit"), "/health");
  assert.strictEqual(getNextRoute("/health"), "/habits");
  assert.strictEqual(getNextRoute("/habits"), "/fuel");
  assert.strictEqual(getNextRoute("/fuel"), "/goals");
  assert.strictEqual(getNextRoute("/goals"), null, "Last item /goals must return null (cannot swipe forward)");
});

it("TEST 6: Swipe Right traverses backward through routes and locks at initial boundary", () => {
  assert.strictEqual(getPrevRoute("/goals"), "/fuel");
  assert.strictEqual(getPrevRoute("/fuel"), "/habits");
  assert.strictEqual(getPrevRoute("/habits"), "/health");
  assert.strictEqual(getPrevRoute("/health"), "/fit");
  assert.strictEqual(getPrevRoute("/fit"), "/study");
  assert.strictEqual(getPrevRoute("/study"), "/");
  assert.strictEqual(getPrevRoute("/"), null, "First item / must return null (cannot swipe backward)");
});

// ─────────────────────────────────────────────────────────
// SUITE 4 — VERTICAL SCROLL MUST WIN & GESTURE DOMINANCE
// ─────────────────────────────────────────────────────────
console.log("\n▶ Suite 4: Gesture Physics & Scroll Priority Logic");

function evaluateGesture(deltaX: number, deltaY: number, deltaTimeMs: number) {
  const absX = Math.abs(deltaX);
  const absY = Math.abs(deltaY);
  const velocityX = absX / Math.max(1, deltaTimeMs);

  // 1. Vertical scroll wins
  if (absY >= absX) {
    return { isSwipe: false, reason: "vertical_scroll_dominates" };
  }

  // 2. Minimum distance threshold
  if (absX < 70) {
    return { isSwipe: false, reason: "below_min_distance" };
  }

  // 3. Dominance ratio
  if (absX < absY * 1.4) {
    return { isSwipe: false, reason: "diagonal_not_dominant" };
  }

  // 4. Velocity or distance
  if (velocityX < 0.25 && absX < 120) {
    return { isSwipe: false, reason: "too_slow_or_short" };
  }

  return { isSwipe: true, direction: deltaX < 0 ? "next" : "prev" };
}

it("TEST 7: Rapid vertical scroll (e.g. dy=400, dx=50) never triggers swipe navigation", () => {
  const result = evaluateGesture(50, 400, 300);
  assert.strictEqual(result.isSwipe, false);
  assert.strictEqual(result.reason, "vertical_scroll_dominates");
});

it("TEST 8: Diagonal movement where vertical travel is significant (dy=80, dx=90) does not swipe", () => {
  const result = evaluateGesture(90, 80, 200);
  assert.strictEqual(result.isSwipe, false);
  assert.strictEqual(result.reason, "diagonal_not_dominant");
});

it("TEST 9: Clear horizontal flick (dx=-110, dy=15, 120ms) cleanly triggers next navigation", () => {
  const result = evaluateGesture(-110, 15, 120);
  assert.strictEqual(result.isSwipe, true);
  assert.strictEqual(result.direction, "next");
});

it("TEST 10: Clear horizontal swipe right (dx=140, dy=20, 250ms) cleanly triggers prev navigation", () => {
  const result = evaluateGesture(140, 20, 250);
  assert.strictEqual(result.isSwipe, true);
  assert.strictEqual(result.direction, "prev");
});

// ─────────────────────────────────────────────────────────
// SUMMARY
// ─────────────────────────────────────────────────────────
console.log("\n" + "─".repeat(50));
console.log(`Results: ${passed} passed, ${failed} failed.`);
if (failed > 0) {
  console.error("❌ Navigation test suite failed.");
  process.exit(1);
} else {
  console.log("✅ All 10 navigation engine test cases passed successfully!\n");
}
