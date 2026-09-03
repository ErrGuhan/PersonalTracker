// ─── LifeSync OS — Centralized Navigation System ─────────────────────
// SINGLE SOURCE OF TRUTH FOR ALL ROUTES, ICONS, LABELS, AND SWIPE ORDER
// EXACT ORDER: Health -> Study -> Fit -> Home (CENTER) -> Habits -> Fuel -> Goals

export interface NavItem {
  id: string;
  href: string;
  label: string;
  shortLabel: string;
  icon: string;
  aliases?: string[];
}

export const NAV_ITEMS: readonly NavItem[] = [
  {
    id: "health",
    href: "/health",
    label: "Health Analytics",
    shortLabel: "Health",
    icon: "ecg_heart",
  },
  {
    id: "study",
    href: "/study",
    label: "Study Studio",
    shortLabel: "Study",
    icon: "menu_book",
  },
  {
    id: "fitness",
    href: "/fit",
    label: "Fitness Hub",
    shortLabel: "Fit",
    icon: "fitness_center",
    aliases: ["/fitness"],
  },
  {
    id: "dashboard",
    href: "/",
    label: "Dashboard",
    shortLabel: "Home",
    icon: "dashboard",
    aliases: ["/dashboard", "/home"],
  },
  {
    id: "routines",
    href: "/habits",
    label: "Routines & Habits",
    shortLabel: "Habits",
    icon: "published_with_changes",
    aliases: ["/routines"],
  },
  {
    id: "nutrition",
    href: "/fuel",
    label: "Hydration & Fuel",
    shortLabel: "Fuel",
    icon: "restaurant",
    aliases: ["/nutrition"],
  },
  {
    id: "goals",
    href: "/goals",
    label: "Milestones",
    shortLabel: "Goals",
    icon: "insights",
  },
] as const;

/**
 * Returns the canonical Home navigation item.
 */
export const HOME_NAV_ITEM = NAV_ITEMS[3]; // Index 3 is Home ("/")

/**
 * Normalizes any pathname or alias to the canonical NavItem.
 * Defaults to Home ("/") if route is not recognized or root.
 */
export function getCanonicalNavItem(pathname: string): NavItem {
  const cleanPath = pathname.split("?")[0].replace(/\/+$/, "") || "/";

  for (const item of NAV_ITEMS) {
    if (item.href === cleanPath) return item;
    if (item.aliases?.includes(cleanPath)) return item;
  }

  return HOME_NAV_ITEM;
}

/**
 * Checks if a given item is active based on the current pathname.
 */
export function isRouteActive(currentPath: string, itemHref: string): boolean {
  const cleanCurrent = currentPath.split("?")[0].replace(/\/+$/, "") || "/";
  const canonical = getCanonicalNavItem(cleanCurrent);
  return canonical.href === itemHref;
}

/**
 * Returns the next route for swipe left gestures.
 * Sequence: Health -> Study -> Fit -> Home -> Habits -> Fuel -> Goals
 * Returns null if already at the last route (Goals).
 */
export function getNextRoute(currentPath: string): string | null {
  const canonical = getCanonicalNavItem(currentPath);
  const currentIndex = NAV_ITEMS.findIndex((item) => item.href === canonical.href);
  if (currentIndex >= 0 && currentIndex < NAV_ITEMS.length - 1) {
    return NAV_ITEMS[currentIndex + 1].href;
  }
  return null;
}

/**
 * Returns the previous route for swipe right gestures.
 * Sequence: Goals -> Fuel -> Habits -> Home -> Fit -> Study -> Health
 * Returns null if already at the first route (Health).
 */
export function getPrevRoute(currentPath: string): string | null {
  const canonical = getCanonicalNavItem(currentPath);
  const currentIndex = NAV_ITEMS.findIndex((item) => item.href === canonical.href);
  if (currentIndex > 0) {
    return NAV_ITEMS[currentIndex - 1].href;
  }
  return null;
}
