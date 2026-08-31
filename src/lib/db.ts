// ─── LifeSync OS — Dynamic Data Engine with Real-Time Recovery Calculation ─────
import { supabase } from "./supabase";
import type {
  HealthMetric,
  Workout,
  StudySession,
  MoodLog,
  SleepLog,
  Goal,
  Habit,
  HydrationLog,
  MealLog,
} from "./database.types";

export const DEMO_USER_ID = "00000000-0000-0000-0000-000000000001";

const todayStr = () => new Date().toISOString().split("T")[0];

const INITIAL_HEALTH_METRICS: HealthMetric = {
  id: "hm-initial-1",
  user_id: DEMO_USER_ID,
  recorded_at: new Date().toISOString(),
  heart_rate: 64,
  steps: 8420,
  hydration_pct: 70,
  spo2: 99,
  body_temp: 36.6,
  hrv_ms: 72,
  stress_pct: 22,
  vo2_max: 52,
  calories_burned: 2150,
  recovery_score: 88,
  created_at: new Date().toISOString(),
};

const INITIAL_WORKOUTS: Workout[] = [
  {
    id: "w-1",
    user_id: DEMO_USER_ID,
    name: "Morning Interval Run",
    type: "run",
    duration_min: 45,
    calories: 480,
    avg_heart_rate: 154,
    distance_km: 7.2,
    notes: "Pacing felt smooth. Pushed hard on final 1km hill climb.",
    workout_date: todayStr(),
    created_at: new Date().toISOString(),
  },
  {
    id: "w-2",
    user_id: DEMO_USER_ID,
    name: "Upper Body Hypertrophy",
    type: "strength",
    duration_min: 60,
    calories: 390,
    avg_heart_rate: 128,
    distance_km: null,
    notes: "Bench press 4x8 @ 85kg. Cable flyes finisher.",
    workout_date: new Date(Date.now() - 86400000).toISOString().split("T")[0],
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: "w-3",
    user_id: DEMO_USER_ID,
    name: "HIIT Conditioning",
    type: "hiit",
    duration_min: 30,
    calories: 320,
    avg_heart_rate: 165,
    distance_km: null,
    notes: "Kettlebell swings & burpee sprints 40s work / 20s rest.",
    workout_date: new Date(Date.now() - 86400000 * 2).toISOString().split("T")[0],
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
];

const INITIAL_STUDY_SESSIONS: StudySession[] = [
  {
    id: "st-1",
    user_id: DEMO_USER_ID,
    subject: "Distributed Systems Architecture",
    duration_min: 90,
    focus_score: 95,
    session_date: todayStr(),
    created_at: new Date().toISOString(),
  },
  {
    id: "st-2",
    user_id: DEMO_USER_ID,
    subject: "Machine Learning & Neural Networks",
    duration_min: 60,
    focus_score: 88,
    session_date: todayStr(),
    created_at: new Date().toISOString(),
  },
];

const INITIAL_MOOD_LOG: MoodLog = {
  id: "ml-1",
  user_id: DEMO_USER_ID,
  score: 5,
  energy_pct: 90,
  anxiety_pct: 12,
  motivation_pct: 95,
  logged_at: new Date().toISOString(),
  created_at: new Date().toISOString(),
};

const INITIAL_SLEEP_LOG: SleepLog = {
  id: "sl-1",
  user_id: DEMO_USER_ID,
  hours: 7.8,
  deep_pct: 24,
  rem_pct: 22,
  light_pct: 46,
  awake_pct: 8,
  sleep_date: todayStr(),
  created_at: new Date().toISOString(),
};

const INITIAL_GOALS: Goal[] = [
  {
    id: "g-1",
    user_id: DEMO_USER_ID,
    title: "Sub-45m 10K Run",
    category: "Fitness",
    icon: "🏃",
    progress: 75,
    target_description: "Target pace: 4:30 min/km",
    detail: "Current 10K PR: 47:15 (Target date: Q4)",
    accent: "#ec6a06",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "g-2",
    user_id: DEMO_USER_ID,
    title: "100 Hours Deep Focus",
    category: "Learning",
    icon: "🧠",
    progress: 60,
    target_description: "Focus on AI & System Design",
    detail: "60 hours completed out of 100",
    accent: "#4cd7f6",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "g-3",
    user_id: DEMO_USER_ID,
    title: "Optimize Recovery HRV > 80ms",
    category: "Health",
    icon: "❤️‍🔥",
    progress: 85,
    target_description: "Consistent 8h Sleep + Cold Plunge",
    detail: "7-day avg HRV currently 72ms",
    accent: "#b395ff",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const INITIAL_HABITS: Habit[] = [
  {
    id: "h-1",
    title: "Morning Hydration (500ml)",
    category: "health",
    streak: 14,
    completedToday: true,
    frequency: "Daily",
    targetCount: 1,
    icon: "water_drop",
  },
  {
    id: "h-2",
    title: "10,000 Daily Steps",
    category: "fitness",
    streak: 8,
    completedToday: false,
    frequency: "Daily",
    targetCount: 10000,
    icon: "directions_walk",
  },
  {
    id: "h-3",
    title: "Deep Work Block (50m)",
    category: "focus",
    streak: 21,
    completedToday: true,
    frequency: "Daily",
    targetCount: 2,
    icon: "psychology",
  },
];

const INITIAL_HYDRATION: HydrationLog = {
  amountMl: 1750,
  targetMl: 2500,
  lastUpdated: new Date().toISOString(),
};

const INITIAL_MEALS: MealLog[] = [
  {
    id: "m-1",
    name: "Avocado & Poached Eggs Toast",
    mealType: "breakfast",
    calories: 450,
    proteinG: 24,
    carbsG: 38,
    fatsG: 22,
    loggedAt: new Date().toISOString(),
  },
  {
    id: "m-2",
    name: "Grilled Chicken & Quinoa Bowl",
    mealType: "lunch",
    calories: 620,
    proteinG: 52,
    carbsG: 60,
    fatsG: 16,
    loggedAt: new Date().toISOString(),
  },
];

// Helper to calculate Recovery Score dynamically
function calculateDynamicRecovery(metrics: HealthMetric, sleep: SleepLog | null): number {
  const sleepHrs = sleep?.hours ?? 7.8;
  const hydrationPct = metrics.hydration_pct ?? 70;
  const hrv = metrics.hrv_ms ?? 72;
  const stress = metrics.stress_pct ?? 22;

  const score =
    (sleepHrs / 8) * 35 +
    (hydrationPct / 100) * 25 +
    (Math.min(hrv, 100) / 100) * 25 +
    ((100 - stress) / 100) * 15;

  return Math.min(100, Math.max(35, Math.round(score)));
}

function notifyUpdate() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("lifesync-db-update"));
  }
}

function getLocal<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(`lifesync_${key}`);
    return raw ? JSON.parse(raw) : fallback;
  } catch (err) {
    console.warn(`[LocalStorage] Read ${key} error:`, err);
    return fallback;
  }
}

function setLocal<T>(key: string, value: T): T {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(`lifesync_${key}`, JSON.stringify(value));
      notifyUpdate();
    } catch (err) {
      console.warn(`[LocalStorage] Write ${key} error:`, err);
    }
  }
  return value;
}

// ─────────────────────────────────────────────────────────
// HEALTH METRICS
// ─────────────────────────────────────────────────────────

export async function getLatestHealthMetrics(): Promise<HealthMetric | null> {
  try {
    const { data, error } = await supabase
      .from("health_metrics")
      .select("*")
      .eq("user_id", DEMO_USER_ID)
      .order("recorded_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!error && data) return data as HealthMetric;
  } catch (err) {
    console.warn("[DB] health_metrics query fallback to local:", err);
  }
  const current = getLocal("health_metrics", INITIAL_HEALTH_METRICS);
  const sleep = getLocal("sleep_log", INITIAL_SLEEP_LOG);
  const calculatedRec = calculateDynamicRecovery(current, sleep);
  return { ...current, recovery_score: calculatedRec };
}

export async function getHealthMetricHistory(days = 7): Promise<HealthMetric[]> {
  try {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const { data, error } = await supabase
      .from("health_metrics")
      .select("*")
      .eq("user_id", DEMO_USER_ID)
      .gte("recorded_at", since.toISOString())
      .order("recorded_at", { ascending: true });

    if (!error && data && data.length > 0) return data as HealthMetric[];
  } catch (err) {
    console.warn("[DB] health_metrics history fallback to local:", err);
  }
  const current = await getLatestHealthMetrics();
  return current ? [current] : [INITIAL_HEALTH_METRICS];
}

export async function upsertHealthMetrics(
  metrics: Partial<HealthMetric>
): Promise<HealthMetric | null> {
  const current = getLocal("health_metrics", INITIAL_HEALTH_METRICS);
  const sleep = getLocal("sleep_log", INITIAL_SLEEP_LOG);
  const tempUpdated: HealthMetric = { ...current, ...metrics };
  const calcRec = calculateDynamicRecovery(tempUpdated, sleep);

  const updated: HealthMetric = {
    ...tempUpdated,
    recovery_score: calcRec,
    recorded_at: new Date().toISOString(),
  };
  setLocal("health_metrics", updated);

  try {
    const { data, error } = await supabase
      .from("health_metrics")
      .insert({ ...updated, user_id: DEMO_USER_ID } as unknown as never)
      .select()
      .single();

    if (!error && data) return data as HealthMetric;
  } catch (err) {
    console.warn("[DB] upsert health_metrics local fallback:", err);
  }
  return updated;
}

// ─────────────────────────────────────────────────────────
// WORKOUTS DATA ACCESS
// ─────────────────────────────────────────────────────────

export async function getRecentWorkouts(limit = 10): Promise<Workout[]> {
  try {
    const { data, error } = await supabase
      .from("workouts")
      .select("*")
      .eq("user_id", DEMO_USER_ID)
      .order("workout_date", { ascending: false })
      .limit(limit);

    if (!error && data && data.length > 0) return data as Workout[];
  } catch (err) {
    console.warn("[DB] workouts query fallback to local:", err);
  }
  const list = getLocal("workouts", INITIAL_WORKOUTS);
  return list.slice(0, limit);
}

export async function getWeeklyWorkoutStats(): Promise<{
  totalCalories: number;
  totalMinutes: number;
  totalDistance: number;
  dailyCalories: number[];
}> {
  const workouts = await getRecentWorkouts(30);

  const since = new Date();
  since.setDate(since.getDate() - 7);
  const cutoff = since.toISOString().split("T")[0];

  const recent = workouts.filter((w) => w.workout_date >= cutoff);

  const dailyMap: Record<string, number> = {};
  for (let i = 0; i < 7; i++) {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    dailyMap[d.toISOString().split("T")[0]] = 0;
  }

  recent.forEach((r) => {
    const k = r.workout_date.split("T")[0];
    if (k in dailyMap) dailyMap[k] += r.calories;
  });

  return {
    totalCalories: recent.reduce((s, r) => s + (r.calories || 0), 0),
    totalMinutes: recent.reduce((s, r) => s + (r.duration_min || 0), 0),
    totalDistance: recent.reduce((s, r) => s + (r.distance_km || 0), 0),
    dailyCalories: Object.values(dailyMap),
  };
}

export async function logWorkout(
  workout: Omit<Workout, "id" | "user_id" | "created_at">
): Promise<Workout | null> {
  const newWorkout: Workout = {
    ...workout,
    id: `w-local-${Date.now()}`,
    user_id: DEMO_USER_ID,
    created_at: new Date().toISOString(),
  };

  const existing = getLocal("workouts", INITIAL_WORKOUTS);
  setLocal("workouts", [newWorkout, ...existing]);

  // Update calories in health_metrics
  const currentMetrics = getLocal("health_metrics", INITIAL_HEALTH_METRICS);
  const updatedBurn = (currentMetrics.calories_burned ?? 2000) + workout.calories;
  await upsertHealthMetrics({ calories_burned: updatedBurn });

  try {
    const { data, error } = await supabase
      .from("workouts")
      .insert({ ...workout, user_id: DEMO_USER_ID } as unknown as never)
      .select()
      .single();

    if (!error && data) return data as Workout;
  } catch (err) {
    console.warn("[DB] log workout saved to local storage:", err);
  }
  return newWorkout;
}

// ─────────────────────────────────────────────────────────
// STUDY SESSIONS
// ─────────────────────────────────────────────────────────

export interface StudyStats {
  todayMinutes: number;
  streakDays: number;
  totalSessions: number;
  heatmapData: number[];
}

export async function getStudyStats(): Promise<StudyStats> {
  let sessions: StudySession[] = [];
  try {
    const { data, error } = await supabase
      .from("study_sessions")
      .select("*")
      .eq("user_id", DEMO_USER_ID)
      .order("session_date", { ascending: true });

    if (!error && data && data.length > 0) sessions = data as StudySession[];
    else sessions = getLocal("study_sessions", INITIAL_STUDY_SESSIONS);
  } catch (err) {
    console.warn("[DB] study stats fallback to local:", err);
    sessions = getLocal("study_sessions", INITIAL_STUDY_SESSIONS);
  }

  const today = todayStr();
  const dailyMap: Record<string, number> = {};

  sessions.forEach((r) => {
    const k = r.session_date.split("T")[0];
    dailyMap[k] = (dailyMap[k] ?? 0) + r.duration_min;
  });

  const todayMinutes = dailyMap[today] ?? 0;

  let streak = 0;
  const d = new Date();
  while (true) {
    const key = d.toISOString().split("T")[0];
    if (dailyMap[key] && dailyMap[key] > 0) {
      streak++;
      d.setDate(d.getDate() - 1);
    } else {
      break;
    }
  }

  const heatmap: number[] = [];
  for (let i = 111; i >= 0; i--) {
    const dt = new Date();
    dt.setDate(dt.getDate() - i);
    const mins = dailyMap[dt.toISOString().split("T")[0]] ?? 0;
    heatmap.push(mins === 0 ? 0 : mins < 60 ? 1 : mins < 120 ? 2 : 3);
  }

  return {
    todayMinutes,
    streakDays: Math.max(streak, 14),
    totalSessions: sessions.length,
    heatmapData: heatmap,
  };
}

export async function logStudySession(
  session: Omit<StudySession, "id" | "user_id" | "created_at">
): Promise<StudySession | null> {
  const newSession: StudySession = {
    ...session,
    id: `st-local-${Date.now()}`,
    user_id: DEMO_USER_ID,
    created_at: new Date().toISOString(),
  };

  const existing = getLocal("study_sessions", INITIAL_STUDY_SESSIONS);
  setLocal("study_sessions", [newSession, ...existing]);

  try {
    const { data, error } = await supabase
      .from("study_sessions")
      .insert({ ...session, user_id: DEMO_USER_ID } as unknown as never)
      .select()
      .single();

    if (!error && data) return data as StudySession;
  } catch (err) {
    console.warn("[DB] log study session saved to local storage:", err);
  }
  return newSession;
}

// ─────────────────────────────────────────────────────────
// MOOD & SLEEP DATA ACCESS
// ─────────────────────────────────────────────────────────

export async function getLatestMood(): Promise<MoodLog | null> {
  try {
    const { data, error } = await supabase
      .from("mood_logs")
      .select("*")
      .eq("user_id", DEMO_USER_ID)
      .order("logged_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!error && data) return data as MoodLog;
  } catch (err) {
    console.warn("[DB] mood logs fallback to local:", err);
  }
  return getLocal("mood_log", INITIAL_MOOD_LOG);
}

export async function logMood(
  score: number,
  extras?: { energy_pct?: number; anxiety_pct?: number; motivation_pct?: number }
): Promise<MoodLog | null> {
  const newMood: MoodLog = {
    id: `ml-local-${Date.now()}`,
    user_id: DEMO_USER_ID,
    score,
    energy_pct: extras?.energy_pct ?? 85,
    anxiety_pct: extras?.anxiety_pct ?? 15,
    motivation_pct: extras?.motivation_pct ?? 90,
    logged_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
  };

  setLocal("mood_log", newMood);

  try {
    const { data, error } = await supabase
      .from("mood_logs")
      .insert({ user_id: DEMO_USER_ID, score, logged_at: new Date().toISOString(), ...extras } as unknown as never)
      .select()
      .single();

    if (!error && data) return data as MoodLog;
  } catch (err) {
    console.warn("[DB] log mood saved to local storage:", err);
  }
  return newMood;
}

export async function getLatestSleep(): Promise<SleepLog | null> {
  try {
    const { data, error } = await supabase
      .from("sleep_logs")
      .select("*")
      .eq("user_id", DEMO_USER_ID)
      .order("sleep_date", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!error && data) return data as SleepLog;
  } catch (err) {
    console.warn("[DB] sleep logs fallback to local:", err);
  }
  return getLocal("sleep_log", INITIAL_SLEEP_LOG);
}

export async function logSleep(
  sleep: Omit<SleepLog, "id" | "user_id" | "created_at">
): Promise<SleepLog | null> {
  const newSleep: SleepLog = {
    ...sleep,
    id: `sl-local-${Date.now()}`,
    user_id: DEMO_USER_ID,
    created_at: new Date().toISOString(),
  };

  setLocal("sleep_log", newSleep);

  // Recalculate dynamic recovery score
  const currentMetrics = getLocal("health_metrics", INITIAL_HEALTH_METRICS);
  const calcRec = calculateDynamicRecovery(currentMetrics, newSleep);
  setLocal("health_metrics", { ...currentMetrics, recovery_score: calcRec });

  try {
    const { data, error } = await supabase
      .from("sleep_logs")
      .insert({ ...sleep, user_id: DEMO_USER_ID } as unknown as never)
      .select()
      .single();

    if (!error && data) return data as SleepLog;
  } catch (err) {
    console.warn("[DB] log sleep saved to local storage:", err);
  }
  return newSleep;
}

export async function getWeeklySleep(): Promise<SleepLog[]> {
  try {
    const since = new Date();
    since.setDate(since.getDate() - 7);

    const { data, error } = await supabase
      .from("sleep_logs")
      .select("*")
      .eq("user_id", DEMO_USER_ID)
      .gte("sleep_date", since.toISOString().split("T")[0])
      .order("sleep_date", { ascending: true });

    if (!error && data && data.length > 0) return data as SleepLog[];
  } catch (err) {
    console.warn("[DB] weekly sleep fallback to local:", err);
  }
  return [getLocal("sleep_log", INITIAL_SLEEP_LOG)];
}

// ─────────────────────────────────────────────────────────
// GOALS DATA ACCESS
// ─────────────────────────────────────────────────────────

export async function getGoals(): Promise<Goal[]> {
  try {
    const { data, error } = await supabase
      .from("goals")
      .select("*")
      .eq("user_id", DEMO_USER_ID)
      .order("created_at", { ascending: true });

    if (!error && data && data.length > 0) return data as Goal[];
  } catch (err) {
    console.warn("[DB] goals query fallback to local:", err);
  }
  return getLocal("goals", INITIAL_GOALS);
}

export async function updateGoalProgress(
  goalId: string,
  progress: number
): Promise<Goal | null> {
  const current = getLocal("goals", INITIAL_GOALS);
  const updatedList = current.map((g) =>
    g.id === goalId ? { ...g, progress, updated_at: new Date().toISOString() } : g
  );
  setLocal("goals", updatedList);
  const updatedGoal = updatedList.find((g) => g.id === goalId) ?? null;

  try {
    const { data, error } = await supabase
      .from("goals")
      .update({ progress, updated_at: new Date().toISOString() } as unknown as never)
      .eq("id", goalId)
      .eq("user_id", DEMO_USER_ID)
      .select()
      .single();

    if (!error && data) return data as Goal;
  } catch (err) {
    console.warn("[DB] update goal saved to local storage:", err);
  }
  return updatedGoal;
}

export async function createGoal(
  goal: Omit<Goal, "id" | "user_id" | "created_at" | "updated_at">
): Promise<Goal | null> {
  const newGoal: Goal = {
    ...goal,
    id: `g-local-${Date.now()}`,
    user_id: DEMO_USER_ID,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const existing = getLocal("goals", INITIAL_GOALS);
  setLocal("goals", [...existing, newGoal]);

  try {
    const { data, error } = await supabase
      .from("goals")
      .insert({ ...goal, user_id: DEMO_USER_ID } as unknown as never)
      .select()
      .single();

    if (!error && data) return data as Goal;
  } catch (err) {
    console.warn("[DB] create goal saved to local storage:", err);
  }
  return newGoal;
}

// ─────────────────────────────────────────────────────────
// HABITS, HYDRATION & NUTRITION ACCESS
// ─────────────────────────────────────────────────────────

export function getHabits(): Habit[] {
  return getLocal("habits", INITIAL_HABITS);
}

export function toggleHabit(id: string): Habit[] {
  const current = getHabits();
  const updated = current.map((h) => {
    if (h.id === id) {
      const isDone = !h.completedToday;
      return {
        ...h,
        completedToday: isDone,
        streak: isDone ? h.streak + 1 : Math.max(0, h.streak - 1),
      };
    }
    return h;
  });
  return setLocal("habits", updated);
}

export function addHabit(newHabit: Omit<Habit, "id" | "streak" | "completedToday">): Habit[] {
  const habit: Habit = {
    ...newHabit,
    id: `h-local-${Date.now()}`,
    streak: 1,
    completedToday: false,
  };
  const current = getHabits();
  return setLocal("habits", [...current, habit]);
}

export function getHydration(): HydrationLog {
  return getLocal("hydration", INITIAL_HYDRATION);
}

export function addWater(amountMl: number): HydrationLog {
  const current = getHydration();
  const updated: HydrationLog = {
    ...current,
    amountMl: current.amountMl + amountMl,
    lastUpdated: new Date().toISOString(),
  };
  setLocal("hydration", updated);

  const pct = Math.min(100, Math.round((updated.amountMl / updated.targetMl) * 100));
  const currentMetrics = getLocal("health_metrics", INITIAL_HEALTH_METRICS);
  const sleep = getLocal("sleep_log", INITIAL_SLEEP_LOG);

  const tempUpdated = { ...currentMetrics, hydration_pct: pct };
  const calcRec = calculateDynamicRecovery(tempUpdated, sleep);

  setLocal("health_metrics", { ...tempUpdated, recovery_score: calcRec });

  return updated;
}

export function getMeals(): MealLog[] {
  return getLocal("meals", INITIAL_MEALS);
}

export function logMeal(meal: Omit<MealLog, "id" | "loggedAt">): MealLog[] {
  const newMeal: MealLog = {
    ...meal,
    id: `m-local-${Date.now()}`,
    loggedAt: new Date().toISOString(),
  };
  const current = getMeals();
  return setLocal("meals", [newMeal, ...current]);
}

// ─────────────────────────────────────────────────────────
// DATA EXPORT & RESET UTILITIES
// ─────────────────────────────────────────────────────────

export function exportAllDataJSON(): string {
  const data = {
    exportDate: new Date().toISOString(),
    healthMetrics: getLocal("health_metrics", INITIAL_HEALTH_METRICS),
    workouts: getLocal("workouts", INITIAL_WORKOUTS),
    studySessions: getLocal("study_sessions", INITIAL_STUDY_SESSIONS),
    moodLog: getLocal("mood_log", INITIAL_MOOD_LOG),
    sleepLog: getLocal("sleep_log", INITIAL_SLEEP_LOG),
    goals: getLocal("goals", INITIAL_GOALS),
    habits: getLocal("habits", INITIAL_HABITS),
    hydration: getLocal("hydration", INITIAL_HYDRATION),
    meals: getLocal("meals", INITIAL_MEALS),
  };
  return JSON.stringify(data, null, 2);
}

export function resetBaselineData() {
  if (typeof window === "undefined") return;
  localStorage.setItem("lifesync_health_metrics", JSON.stringify(INITIAL_HEALTH_METRICS));
  localStorage.setItem("lifesync_workouts", JSON.stringify(INITIAL_WORKOUTS));
  localStorage.setItem("lifesync_study_sessions", JSON.stringify(INITIAL_STUDY_SESSIONS));
  localStorage.setItem("lifesync_mood_log", JSON.stringify(INITIAL_MOOD_LOG));
  localStorage.setItem("lifesync_sleep_log", JSON.stringify(INITIAL_SLEEP_LOG));
  localStorage.setItem("lifesync_goals", JSON.stringify(INITIAL_GOALS));
  localStorage.setItem("lifesync_habits", JSON.stringify(INITIAL_HABITS));
  localStorage.setItem("lifesync_hydration", JSON.stringify(INITIAL_HYDRATION));
  localStorage.setItem("lifesync_meals", JSON.stringify(INITIAL_MEALS));
  notifyUpdate();
}
