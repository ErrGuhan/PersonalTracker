// ─── LifeSync OS — Zero-State Clean Data Engine with Supabase User Scoping ─────
import { supabase } from "./supabase";
import type {
  HealthMetric,
  Workout,
  StudySession,
  MoodLog,
  SleepLog,
  Goal,
  Habit,
  HabitLog,
  HydrationLog,
  MealLog,
} from "./database.types";

export const PRIMARY_USER_EMAIL = "guhan24td0781@svcet.ac.in";
export const DEMO_USER_ID = "guhan-24td0781-svcet-ac-in";

const todayStr = () => new Date().toISOString().split("T")[0];

// Zero-State Initial Baseline Configurations for Brand New User
const INITIAL_HEALTH_METRICS: HealthMetric = {
  id: "hm-initial-1",
  user_id: DEMO_USER_ID,
  recorded_at: new Date().toISOString(),
  heart_rate: 0,
  steps: 0,
  hydration_pct: 0,
  spo2: 0,
  body_temp: 0,
  hrv_ms: 0,
  stress_pct: 0,
  vo2_max: 0,
  calories_burned: 0,
  recovery_score: 0,
  created_at: new Date().toISOString(),
};

const INITIAL_WORKOUTS: Workout[] = [];
const INITIAL_STUDY_SESSIONS: StudySession[] = [];

const INITIAL_MOOD_LOG: MoodLog = {
  id: "ml-initial",
  user_id: DEMO_USER_ID,
  score: 0,
  energy_pct: 0,
  anxiety_pct: 0,
  motivation_pct: 0,
  logged_at: new Date().toISOString(),
  created_at: new Date().toISOString(),
};

const INITIAL_SLEEP_LOG: SleepLog = {
  id: "sl-initial",
  user_id: DEMO_USER_ID,
  hours: 0,
  deep_pct: 0,
  rem_pct: 0,
  light_pct: 0,
  awake_pct: 0,
  sleep_date: todayStr(),
  created_at: new Date().toISOString(),
};

const INITIAL_GOALS: Goal[] = [];
const INITIAL_HABITS: Habit[] = [];

const INITIAL_HYDRATION: HydrationLog = {
  amountMl: 0,
  targetMl: 2500,
  lastUpdated: new Date().toISOString(),
};

const INITIAL_MEALS: MealLog[] = [];

// Helper to calculate Recovery Score dynamically
function calculateDynamicRecovery(metrics: HealthMetric, sleep: SleepLog | null): number {
  const sleepHrs = sleep?.hours ?? 0;
  const hydrationPct = metrics.hydration_pct ?? 0;
  const hrv = metrics.hrv_ms ?? 0;
  const stress = metrics.stress_pct ?? 0;

  if (sleepHrs === 0 && hydrationPct === 0 && hrv === 0 && (metrics.steps ?? 0) === 0 && (metrics.calories_burned ?? 0) === 0) {
    return 0;
  }

  const score =
    (sleepHrs / 8) * 35 +
    (hydrationPct / 100) * 25 +
    (Math.min(hrv, 100) / 100) * 25 +
    ((100 - stress) / 100) * 15;

  return Math.min(100, Math.max(0, Math.round(score)));
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

export async function getActiveUserId(): Promise<string> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user?.id) return user.id;
  } catch {
    // Fallback if not authenticated yet
  }
  return DEMO_USER_ID;
}

// ─────────────────────────────────────────────────────────
// HEALTH METRICS
// ─────────────────────────────────────────────────────────

export async function getLatestHealthMetrics(): Promise<HealthMetric | null> {
  const userId = await getActiveUserId();
  try {
    const { data, error } = await supabase
      .from("health_metrics")
      .select("*")
      .eq("user_id", userId)
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
  const userId = await getActiveUserId();
  try {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const { data, error } = await supabase
      .from("health_metrics")
      .select("*")
      .eq("user_id", userId)
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
  const userId = await getActiveUserId();
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
      .insert({ ...updated, user_id: userId } as unknown as never)
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
  const userId = await getActiveUserId();
  try {
    const { data, error } = await supabase
      .from("workouts")
      .select("*")
      .eq("user_id", userId)
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
  const userId = await getActiveUserId();
  const newWorkout: Workout = {
    ...workout,
    id: `w-local-${Date.now()}`,
    user_id: userId,
    created_at: new Date().toISOString(),
  };

  const existing = getLocal("workouts", INITIAL_WORKOUTS);
  setLocal("workouts", [newWorkout, ...existing]);

  // Update calories in health_metrics
  const currentMetrics = getLocal("health_metrics", INITIAL_HEALTH_METRICS);
  const updatedBurn = (currentMetrics.calories_burned ?? 0) + workout.calories;
  await upsertHealthMetrics({ calories_burned: updatedBurn });

  try {
    const { data, error } = await supabase
      .from("workouts")
      .insert({ ...workout, user_id: userId } as unknown as never)
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
  const userId = await getActiveUserId();
  let sessions: StudySession[] = [];
  try {
    const { data, error } = await supabase
      .from("study_sessions")
      .select("*")
      .eq("user_id", userId)
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
    streakDays: streak,
    totalSessions: sessions.length,
    heatmapData: heatmap,
  };
}

export async function logStudySession(
  session: Omit<StudySession, "id" | "user_id" | "created_at">
): Promise<StudySession | null> {
  const userId = await getActiveUserId();
  const newSession: StudySession = {
    ...session,
    id: `st-local-${Date.now()}`,
    user_id: userId,
    created_at: new Date().toISOString(),
  };

  const existing = getLocal("study_sessions", INITIAL_STUDY_SESSIONS);
  setLocal("study_sessions", [newSession, ...existing]);

  try {
    const { data, error } = await supabase
      .from("study_sessions")
      .insert({ ...session, user_id: userId } as unknown as never)
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
  const userId = await getActiveUserId();
  try {
    const { data, error } = await supabase
      .from("mood_logs")
      .select("*")
      .eq("user_id", userId)
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
  const userId = await getActiveUserId();
  const newMood: MoodLog = {
    id: `ml-local-${Date.now()}`,
    user_id: userId,
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
      .insert({ user_id: userId, score, logged_at: new Date().toISOString(), ...extras } as unknown as never)
      .select()
      .single();

    if (!error && data) return data as MoodLog;
  } catch (err) {
    console.warn("[DB] log mood saved to local storage:", err);
  }
  return newMood;
}

export async function getLatestSleep(): Promise<SleepLog | null> {
  const userId = await getActiveUserId();
  try {
    const { data, error } = await supabase
      .from("sleep_logs")
      .select("*")
      .eq("user_id", userId)
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
  const userId = await getActiveUserId();
  const newSleep: SleepLog = {
    ...sleep,
    id: `sl-local-${Date.now()}`,
    user_id: userId,
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
      .insert({ ...sleep, user_id: userId } as unknown as never)
      .select()
      .single();

    if (!error && data) return data as SleepLog;
  } catch (err) {
    console.warn("[DB] log sleep saved to local storage:", err);
  }
  return newSleep;
}

export async function getWeeklySleep(): Promise<SleepLog[]> {
  const userId = await getActiveUserId();
  try {
    const since = new Date();
    since.setDate(since.getDate() - 7);

    const { data, error } = await supabase
      .from("sleep_logs")
      .select("*")
      .eq("user_id", userId)
      .gte("sleep_date", since.toISOString().split("T")[0])
      .order("sleep_date", { ascending: true });

    if (!error && data && data.length > 0) return data as SleepLog[];
  } catch (err) {
    console.warn("[DB] weekly sleep fallback to local:", err);
  }
  return getLocal<SleepLog[]>("sleep_logs_list", []);
}

// ─────────────────────────────────────────────────────────
// GOALS DATA ACCESS
// ─────────────────────────────────────────────────────────

export async function getGoals(): Promise<Goal[]> {
  const userId = await getActiveUserId();
  try {
    const { data, error } = await supabase
      .from("goals")
      .select("*")
      .eq("user_id", userId)
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
  const userId = await getActiveUserId();
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
      .eq("user_id", userId)
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
  const userId = await getActiveUserId();
  const newGoal: Goal = {
    ...goal,
    id: `g-local-${Date.now()}`,
    user_id: userId,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const existing = getLocal("goals", INITIAL_GOALS);
  setLocal("goals", [...existing, newGoal]);

  try {
    const { data, error } = await supabase
      .from("goals")
      .insert({ ...goal, user_id: userId } as unknown as never)
      .select()
      .single();

    if (!error && data) return data as Goal;
  } catch (err) {
    console.warn("[DB] create goal saved to local storage:", err);
  }
  return newGoal;
}

// ─────────────────────────────────────────────────────────
// HABITS, GAMIFICATION & FORGIVING STREAKS
// ─────────────────────────────────────────────────────────

export const SEED_HABITS: Habit[] = [
  {
    id: "h-hydration-1",
    title: "Hydration Goal (2.5L Water)",
    category: "health",
    streak: 32, // > 30 triggers swipe-to-complete & glassmorphic glow!
    completedToday: false,
    frequency: "Daily",
    targetCount: 1,
    icon: "💧",
    typicalHour: new Date().getHours(), // Matches current hour for predictive surfacing!
  },
  {
    id: "h-meditation-2",
    title: "10-Min Mindfulness Meditation",
    category: "mindset",
    streak: 18, // > 14 triggers glassmorphic glow!
    completedToday: false,
    frequency: "Daily",
    targetCount: 1,
    icon: "🧘",
    typicalHour: (new Date().getHours() + 1) % 24,
  },
  {
    id: "h-reading-3",
    title: "Read 10 Pages of Tech / Philosophy",
    category: "focus",
    streak: 6, // 1 step from 7-day freeze token milestone!
    completedToday: false,
    frequency: "Daily",
    targetCount: 1,
    icon: "📚",
    typicalHour: (new Date().getHours() + 2) % 24,
  },
  {
    id: "h-workout-4",
    title: "30-Min Cardio or Strength Training",
    category: "fitness",
    streak: 12,
    completedToday: true,
    frequency: "Daily",
    targetCount: 1,
    icon: "🏃",
    typicalHour: (new Date().getHours() - 1 + 24) % 24,
  },
];

export function getFreezeTokens(): number {
  return getLocal<number>("freeze_tokens", 2); // Default baseline 2 tokens for demo
}

export function setFreezeTokens(count: number): number {
  return setLocal<number>("freeze_tokens", Math.max(0, count));
}

export function getHabitLogs(): HabitLog[] {
  // Generate sample 30-day logs if none exist yet for full visual heatmap
  const fallbackLogs: HabitLog[] = [];
  const habits = getHabits();

  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];

    habits.forEach((h, idx) => {
      // Create pattern: mostly completed, some frozen, few missed
      if ((i + idx) % 5 === 0) {
        fallbackLogs.push({
          id: `hl-gen-${h.id}-${dateStr}`,
          habit_id: h.id,
          date: dateStr,
          status: "FROZEN",
        });
      } else if ((i + idx) % 7 !== 0) {
        fallbackLogs.push({
          id: `hl-gen-${h.id}-${dateStr}`,
          habit_id: h.id,
          date: dateStr,
          status: "COMPLETED",
        });
      } else {
        fallbackLogs.push({
          id: `hl-gen-${h.id}-${dateStr}`,
          habit_id: h.id,
          date: dateStr,
          status: "MISSED",
        });
      }
    });
  }

  return getLocal<HabitLog[]>("habit_logs", fallbackLogs);
}

export function getHabits(): Habit[] {
  return getLocal("habits", SEED_HABITS);
}

export async function completeHabitGamified(id: string, dateStr?: string): Promise<{ habit: Habit; awardedToken: boolean; newFreezeTokens: number }> {
  const targetDate = dateStr ?? todayStr();
  const currentHabits = getHabits();
  let awardedToken = false;
  let newStreak = 0;

  const updatedHabits = currentHabits.map((h) => {
    if (h.id === id) {
      newStreak = h.completedToday ? h.streak : h.streak + 1;
      return {
        ...h,
        completedToday: true,
        streak: newStreak,
      };
    }
    return h;
  });

  setLocal("habits", updatedHabits);

  // Insert or update COMPLETED log for target date
  const logs = getHabitLogs();
  const existingIdx = logs.findIndex((l) => l.habit_id === id && l.date === targetDate);
  const newLog: HabitLog = {
    id: `hl-${id}-${Date.now()}`,
    habit_id: id,
    date: targetDate,
    status: "COMPLETED",
    logged_at: new Date().toISOString(),
  };

  if (existingIdx >= 0) {
    logs[existingIdx] = newLog;
  } else {
    logs.push(newLog);
  }
  setLocal("habit_logs", logs);

  // Check 7-day milestone: award freeze token if streak is multiple of 7
  let tokens = getFreezeTokens();
  if (newStreak > 0 && newStreak % 7 === 0) {
    tokens += 1;
    setFreezeTokens(tokens);
    awardedToken = true;
  }

  // Attempt RPC call to Supabase in background
  try {
    const userId = await getActiveUserId();
    const { data, error } = await (supabase.rpc as unknown as (fn: string, args: Record<string, unknown>) => Promise<{ data: unknown; error: unknown }>)("complete_habit", {
      p_habit_id: id,
      p_date: targetDate,
    });
    if (!error && data) {
      console.log("[Supabase RPC complete_habit SUCCESS]:", data);
    }
  } catch (err) {
    console.warn("[DB] Supabase RPC complete_habit fallback:", err);
  }

  const updatedHabit = updatedHabits.find((h) => h.id === id)!;
  return { habit: updatedHabit, awardedToken, newFreezeTokens: tokens };
}

export function freezeHabitWithToken(id: string, dateStr?: string): { success: boolean; remainingTokens: number } {
  const tokens = getFreezeTokens();
  if (tokens <= 0) {
    return { success: false, remainingTokens: 0 };
  }

  const targetDate = dateStr ?? todayStr();
  const newTokens = tokens - 1;
  setFreezeTokens(newTokens);

  // Mark habit log as FROZEN without breaking streak
  const logs = getHabitLogs();
  const existingIdx = logs.findIndex((l) => l.habit_id === id && l.date === targetDate);
  const newLog: HabitLog = {
    id: `hl-frozen-${id}-${Date.now()}`,
    habit_id: id,
    date: targetDate,
    status: "FROZEN",
    logged_at: new Date().toISOString(),
  };

  if (existingIdx >= 0) {
    logs[existingIdx] = newLog;
  } else {
    logs.push(newLog);
  }
  setLocal("habit_logs", logs);

  return { success: true, remainingTokens: newTokens };
}

export function toggleHabit(id: string): Habit[] {
  const current = getHabits();
  const target = current.find((h) => h.id === id);
  if (target && !target.completedToday) {
    completeHabitGamified(id);
    return getHabits();
  }
  const updated = current.map((h) => {
    if (h.id === id) {
      return {
        ...h,
        completedToday: false,
        streak: Math.max(0, h.streak - 1),
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
    typicalHour: new Date().getHours(),
  };
  const current = getHabits();
  return setLocal("habits", [...current, habit]);
}

export function updateHabit(id: string, updatedFields: Partial<Habit>): Habit[] {
  const current = getHabits();
  const updated = current.map((h) => (h.id === id ? { ...h, ...updatedFields } : h));
  return setLocal("habits", updated);
}

export function deleteHabit(id: string): Habit[] {
  const current = getHabits();
  const updated = current.filter((h) => h.id !== id);
  return setLocal("habits", updated);
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

export function updateMeal(id: string, updatedFields: Partial<MealLog>): MealLog[] {
  const current = getMeals();
  const updated = current.map((m) => (m.id === id ? { ...m, ...updatedFields } : m));
  return setLocal("meals", updated);
}

export function deleteMeal(id: string): MealLog[] {
  const current = getMeals();
  const updated = current.filter((m) => m.id !== id);
  return setLocal("meals", updated);
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

export function resetAllDataToDefault() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("lifesync_health_metrics");
    localStorage.removeItem("lifesync_workouts");
    localStorage.removeItem("lifesync_study_sessions");
    localStorage.removeItem("lifesync_mood_log");
    localStorage.removeItem("lifesync_sleep_log");
    localStorage.removeItem("lifesync_goals");
    localStorage.removeItem("lifesync_habits");
    localStorage.removeItem("lifesync_hydration");
    localStorage.removeItem("lifesync_meals");
    notifyUpdate();
  }
}

export function resetBaselineData() {
  resetAllDataToDefault();
}
