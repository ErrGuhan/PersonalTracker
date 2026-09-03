// ─── LifeSync OS — Centralized Navigation System ─────────────────────
// SINGLE SOURCE OF TRUTH FOR ALL ROUTES, ICONS, LABELS, AND SWIPE ORDER

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
    id: "dashboard",
    href: "/",
    label: "Dashboard",
    shortLabel: "Home",
    icon: "dashboard",
    aliases: ["/dashboard"],
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
    id: "health",
    href: "/health",
    label: "Health Analytics",
    shortLabel: "Health",
    icon: "ecg_heart",
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
 * Normalizes any pathname or alias to the canonical NavItem.
 */
export function getCanonicalNavItem(pathname: string): NavItem {
  const cleanPath = pathname.split("?")[0].replace(/\/+$/, "") || "/";

  for (const item of NAV_ITEMS) {
    if (item.href === cleanPath) return item;
    if (item.aliases?.includes(cleanPath)) return item;
  }

  return NAV_ITEMS[0];
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
 * Returns null if already at the last route.
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
 * Returns null if already at the first route.
 */
export function getPrevRoute(currentPath: string): string | null {
  const canonical = getCanonicalNavItem(currentPath);
  const currentIndex = NAV_ITEMS.findIndex((item) => item.href === canonical.href);
  if (currentIndex > 0) {
    return NAV_ITEMS[currentIndex - 1].href;
  }
  return null;
}
