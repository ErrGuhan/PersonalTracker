export interface ThemeConfig {
  id: string;
  name: string;
  requiredStreak: number;
  primaryColor: string; // Tailwind color or hex
  accentClass: string;
  bgGradient: string;
  description: string;
}

export interface MilestoneUnlock {
  id: string;
  title: string;
  requiredDays: number;
  unlockedItem: string;
  category: "feature" | "theme" | "token";
}

export const MILESTONE_UNLOCKS: MilestoneUnlock[] = [
  { id: "token-7", title: "Rest Day Token Earning", requiredDays: 7, unlockedItem: "1 Rest Day Token", category: "token" },
  { id: "insights-14", title: "Advanced Insights Engine", requiredDays: 14, unlockedItem: "Correlation Insights", category: "feature" },
  { id: "theme-midnight", title: "Midnight Theme", requiredDays: 14, unlockedItem: "Midnight Color Theme", category: "theme" },
  { id: "theme-ocean", title: "Deep Ocean Theme", requiredDays: 30, unlockedItem: "Deep Ocean Theme", category: "theme" },
  { id: "theme-aurora", title: "Aurora Theme", requiredDays: 60, unlockedItem: "Aurora Glow Theme", category: "theme" },
  { id: "theme-emerald", title: "Rare Emerald Theme", requiredDays: 100, unlockedItem: "Rare Emerald Theme", category: "theme" },
];

export const THEMES: ThemeConfig[] = [
  {
    id: "default",
    name: "Default OS",
    requiredStreak: 0,
    primaryColor: "#06b6d4",
    accentClass: "from-cyan-500 to-blue-500",
    bgGradient: "from-cyan-500/10 via-purple-500/5 to-transparent",
    description: "Standard Personal Operating System glass palette.",
  },
  {
    id: "midnight",
    name: "Midnight",
    requiredStreak: 14,
    primaryColor: "#a855f7",
    accentClass: "from-purple-500 to-indigo-600",
    bgGradient: "from-purple-500/15 via-indigo-500/5 to-transparent",
    description: "Deep violet & midnight indigo glass theme.",
  },
  {
    id: "deep-ocean",
    name: "Deep Ocean",
    requiredStreak: 30,
    primaryColor: "#3b82f6",
    accentClass: "from-blue-600 to-cyan-400",
    bgGradient: "from-blue-600/15 via-cyan-500/5 to-transparent",
    description: "Abyssal blue & aquatic glass highlights.",
  },
  {
    id: "aurora",
    name: "Aurora",
    requiredStreak: 60,
    primaryColor: "#14b8a6",
    accentClass: "from-teal-400 to-emerald-500",
    bgGradient: "from-teal-500/15 via-emerald-500/5 to-transparent",
    description: "Nordic northern lights teal & emerald glow.",
  },
  {
    id: "emerald",
    name: "Rare Emerald",
    requiredStreak: 100,
    primaryColor: "#10b981",
    accentClass: "from-emerald-400 to-teal-600",
    bgGradient: "from-emerald-500/20 via-teal-500/10 to-transparent",
    description: "Rare 100-day streak milestone emerald theme.",
  },
];
