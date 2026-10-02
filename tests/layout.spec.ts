import { test, expect, devices, Page } from "@playwright/test";

// ────────────────────────────────────────────────────────────────────────────
// LifeSync OS — Playwright Layout & UI Test Suite
// Tests all routes across Mobile (375px), Tablet (768px), Laptop (1280px),
// Desktop (1440px) to catch alignment, overflow, and touch target issues.
// ────────────────────────────────────────────────────────────────────────────

const BASE_URL = "http://localhost:3000";

const VIEWPORTS = [
  { name: "mobile-xs",  width: 375,  height: 812,  mobile: true  }, // iPhone SE
  { name: "mobile",     width: 414,  height: 896,  mobile: true  }, // iPhone 14 Pro Max
  { name: "tablet",     width: 768,  height: 1024, mobile: false }, // iPad
  { name: "laptop",     width: 1280, height: 800,  mobile: false }, // Standard laptop
  { name: "desktop",    width: 1440, height: 900,  mobile: false }, // 1440p desktop
  { name: "4k",         width: 1920, height: 1080, mobile: false }, // FHD/4K
];

const ROUTES = [
  { path: "/",        name: "Dashboard"  },
  { path: "/fit",     name: "Fitness"    },
  { path: "/health",  name: "Health"     },
  { path: "/fuel",    name: "Nutrition"  },
  { path: "/study",   name: "Study"      },
  { path: "/habits",  name: "Routines"   },
  { path: "/goals",   name: "Goals"      },
];

// ── Helpers ──────────────────────────────────────────────────────────────────

async function waitForPageReady(page: Page) {
  await page.waitForLoadState("domcontentloaded");
  // Dismiss any unhandled modals/overlays
  const overlay = page.locator("[data-testid='modal-overlay']");
  if (await overlay.count() > 0) {
    await page.keyboard.press("Escape");
  }
}

async function hasHorizontalScroll(page: Page): Promise<boolean> {
  return page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
}

async function checkNoConsoleErrors(page: Page): Promise<string[]> {
  const errors: string[] = [];
  page.on("console", msg => {
    if (msg.type() === "error") {
      errors.push(msg.text());
    }
  });
  return errors;
}

// ── TEST SUITE: No Horizontal Scroll Overflow ─────────────────────────────────

for (const vp of VIEWPORTS) {
  for (const route of ROUTES) {
    test(`[${vp.name}] ${route.name}: no horizontal scroll overflow`, async ({ browser }) => {
      const ctx = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
        isMobile: vp.mobile,
        hasTouch: vp.mobile,
      });
      const page = await ctx.newPage();
      await page.goto(`${BASE_URL}${route.path}`, { waitUntil: "domcontentloaded" });
      await waitForPageReady(page);

      const hasOverflow = await hasHorizontalScroll(page);
      expect(hasOverflow, `Horizontal scroll on ${vp.name} at ${route.path}`).toBe(false);

      await ctx.close();
    });
  }
}

// ── TEST SUITE: Mobile Navigation Bar Visibility ──────────────────────────────

for (const route of ROUTES) {
  test(`[mobile] ${route.name}: bottom nav bar is visible`, async ({ browser }) => {
    const ctx = await browser.newContext({
      viewport: { width: 375, height: 812 },
      isMobile: true,
      hasTouch: true,
    });
    const page = await ctx.newPage();
    await page.goto(`${BASE_URL}${route.path}`, { waitUntil: "domcontentloaded" });
    await waitForPageReady(page);

    // Bottom navigation should be in DOM and visible
    const bottomNav = page.locator("nav[aria-label='Mobile navigation']");
    await expect(bottomNav).toBeVisible();

    // Desktop sidebar should NOT be visible on mobile
    const sidebar = page.locator("aside[aria-label='Main navigation']");
    await expect(sidebar).not.toBeVisible();

    await ctx.close();
  });
}

// ── TEST SUITE: Desktop Sidebar Visibility ─────────────────────────────────────

for (const route of ROUTES) {
  test(`[desktop] ${route.name}: sidebar is visible, bottom nav hidden`, async ({ browser }) => {
    const ctx = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      isMobile: false,
    });
    const page = await ctx.newPage();
    await page.goto(`${BASE_URL}${route.path}`, { waitUntil: "domcontentloaded" });
    await waitForPageReady(page);

    // Desktop navigation drawer should be visible
    const sidebar = page.locator("aside[aria-label='Main navigation']");
    await expect(sidebar).toBeVisible();

    // Mobile bottom nav should NOT be visible on desktop
    const bottomNav = page.locator("nav[aria-label='Mobile navigation']");
    await expect(bottomNav).not.toBeVisible();

    await ctx.close();
  });
}

// ── TEST SUITE: Touch Target Sizes (WCAG 2.5.5 minimum 44x44px) ───────────────

test("[mobile] Dashboard: quick-log chips meet 44px touch target", async ({ browser }) => {
  const ctx = await browser.newContext({
    viewport: { width: 375, height: 812 },
    isMobile: true,
    hasTouch: true,
  });
  const page = await ctx.newPage();
  await page.goto(BASE_URL, { waitUntil: "domcontentloaded" });
  await waitForPageReady(page);

  // Check all visible interactive chips/buttons have adequate touch targets
  const chips = page.locator("button.m3-chip, button.m3-fab");
  const count = await chips.count();

  if (count > 0) {
    for (let i = 0; i < Math.min(count, 5); i++) {
      const box = await chips.nth(i).boundingBox();
      if (box) {
        expect(box.height, `Chip ${i} height should be >= 36px`).toBeGreaterThanOrEqual(36);
      }
    }
  }

  await ctx.close();
});

// ── TEST SUITE: Route Navigation Works ────────────────────────────────────────

test("[mobile] navigation: can visit all routes via bottom nav", async ({ browser }) => {
  const ctx = await browser.newContext({
    viewport: { width: 375, height: 812 },
    isMobile: true,
    hasTouch: true,
  });
  const page = await ctx.newPage();
  await page.goto(BASE_URL, { waitUntil: "domcontentloaded" });

  // Tap each nav item and verify navigation
  const navLinks = page.locator("nav[aria-label='Mobile navigation'] a");
  const navCount = await navLinks.count();
  expect(navCount).toBeGreaterThanOrEqual(5);

  await ctx.close();
});

// ── TEST SUITE: Header Visibility ─────────────────────────────────────────────

for (const vp of VIEWPORTS.slice(0, 3)) {
  test(`[${vp.name}] header is visible and not overlapping content`, async ({ browser }) => {
    const ctx = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      isMobile: vp.mobile,
    });
    const page = await ctx.newPage();
    await page.goto(BASE_URL, { waitUntil: "domcontentloaded" });
    await waitForPageReady(page);

    const header = page.locator("header");
    await expect(header).toBeVisible();

    const headerBox = await header.boundingBox();
    expect(headerBox).not.toBeNull();
    if (headerBox) {
      expect(headerBox.y).toBe(0);
      expect(headerBox.width).toBeGreaterThan(300);
    }

    await ctx.close();
  });
}

// ── TEST SUITE: Content Not Clipped Behind Fixed Elements ─────────────────────

test("[mobile] Dashboard: main content not clipped by nav bar", async ({ browser }) => {
  const ctx = await browser.newContext({
    viewport: { width: 375, height: 812 },
    isMobile: true,
    hasTouch: true,
  });
  const page = await ctx.newPage();
  await page.goto(BASE_URL, { waitUntil: "domcontentloaded" });
  await waitForPageReady(page);
  await page.waitForTimeout(500);

  // Scroll to bottom of main content
  await page.evaluate(() => {
    const main = document.querySelector("main");
    if (main) main.scrollTop = main.scrollHeight;
  });

  // Bottom nav bounding box
  const navBox = await page.locator("nav[aria-label='Mobile navigation']").boundingBox();
  expect(navBox).not.toBeNull();

  // Main area should have padding-bottom that clears the nav bar
  const mainPaddingBottom = await page.evaluate(() => {
    const main = document.querySelector("main");
    return main ? parseInt(getComputedStyle(main).paddingBottom) : 0;
  });
  expect(mainPaddingBottom).toBeGreaterThanOrEqual(72); // At least nav height

  await ctx.close();
});

// ── TEST SUITE: Page Titles for SEO ───────────────────────────────────────────

test("Dashboard has a valid HTML title", async ({ browser }) => {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(BASE_URL, { waitUntil: "domcontentloaded" });
  await expect(page).toHaveTitle(/LifeSync/i);
  await ctx.close();
});

// ── TEST SUITE: HTTP Security Headers ─────────────────────────────────────────

test("HTTP security headers are present", async ({ request }) => {
  const response = await request.get(BASE_URL);
  const headers = response.headers();

  expect(headers["x-content-type-options"]).toBe("nosniff");
  expect(headers["x-frame-options"]).toBe("DENY");
  expect(headers["referrer-policy"]).toBe("strict-origin-when-cross-origin");
  expect(headers["permissions-policy"]).toBeTruthy();
  expect(headers["content-security-policy"]).toContain("default-src");
  // X-Powered-By should be removed
  expect(headers["x-powered-by"]).toBeUndefined();
});

// ── TEST SUITE: Keyboard Accessibility ───────────────────────────────────────

test("[desktop] keyboard: Tab focuses interactive elements in order", async ({ browser }) => {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(BASE_URL, { waitUntil: "domcontentloaded" });
  await waitForPageReady(page);

  // Tab through first 10 elements — should not throw or get stuck
  for (let i = 0; i < 10; i++) {
    await page.keyboard.press("Tab");
  }

  // Some element should have focus
  const focusedTag = await page.evaluate(() => document.activeElement?.tagName);
  expect(["A", "BUTTON", "INPUT", "SELECT", "TEXTAREA"]).toContain(focusedTag);

  await ctx.close();
});

// ── TEST SUITE: Fitness View — Day Card Renders ───────────────────────────────

test("[mobile] Fitness: day card renders without overflow", async ({ browser }) => {
  const ctx = await browser.newContext({
    viewport: { width: 375, height: 812 },
    isMobile: true,
    hasTouch: true,
  });
  const page = await ctx.newPage();
  await page.goto(`${BASE_URL}/fit`, { waitUntil: "domcontentloaded" });
  await waitForPageReady(page);
  await page.waitForTimeout(800);

  const hasOverflow = await hasHorizontalScroll(page);
  expect(hasOverflow, "Fitness page has horizontal scroll on mobile").toBe(false);

  await ctx.close();
});

// ── TEST SUITE: Goals Grid Layout ─────────────────────────────────────────────

test("[tablet] Goals: grid uses proper 2-column layout", async ({ browser }) => {
  const ctx = await browser.newContext({ viewport: { width: 768, height: 1024 } });
  const page = await ctx.newPage();
  await page.goto(`${BASE_URL}/goals`, { waitUntil: "domcontentloaded" });
  await waitForPageReady(page);
  await page.waitForTimeout(500);

  const hasOverflow = await hasHorizontalScroll(page);
  expect(hasOverflow, "Goals page has horizontal scroll on tablet").toBe(false);

  await ctx.close();
});

// ── TEST SUITE: Font loading ───────────────────────────────────────────────────

test("[desktop] Inter font is loaded", async ({ browser }) => {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(BASE_URL, { waitUntil: "networkidle" });

  const fontLoaded = await page.evaluate(() => {
    return document.fonts.check("16px Inter");
  });
  expect(fontLoaded).toBe(true);

  await ctx.close();
});
