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
  HydrationLog,
  MealLog,
  AiUserProfile,
} from "./database.types";

export const PRIMARY_USER_EMAIL = "guhan24td0781@svcet.ac.in";
export const DEMO_USER_ID = "00000000-0000-0000-0000-000000000001";

const todayStr = () => new Date().toISOString().split("T")[0];

export const INITIAL_AI_PROFILE: AiUserProfile = {
  goals: ["Improve sleep duration", "Sustain daily focus", "Moderate athletic conditioning"],
  preferredWakeTime: "06:30",
  preferredSleepTime: "22:45",
  availableDailyTimeMinutes: 180,
  preferredWorkoutStyle: "hybrid",
  planningStyle: "structured",
  motivationStyle: "analytical",
  difficultyPreference: "gradual",
  preferredSessionDurationMin: 45,
  schedulePreferences: "Morning deep work sessions, early evening physical training",
  currentPriorities: ["Sleep consistency", "Cognitive output", "Recovery optimization"],
  personalizationEnabled: true,
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

const INITIAL_GOALS: Goal[] = [];
const INITIAL_HABITS: Habit[] = [];

const INITIAL_HYDRATION: HydrationLog = {
  amountMl: 0,
  targetMl: 2500,
  lastUpdated: new Date().toISOString(),
};

const INITIAL_MEALS: MealLog[] = [];

function notifyUpdate() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("lifesync-db-update"));
  }
}

let activeScopedUserId = DEMO_USER_ID;

export function setActiveScopedUserId(id: string): void {
  activeScopedUserId = id;
  if (typeof window !== "undefined") {
    localStorage.setItem("lifesync_active_uid", id);
  }
}

export function getScopedUserId(): string {
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem("lifesync_active_uid");
    if (stored) return stored;
  }
  return activeScopedUserId;
}

function getLocalKey(key: string, userId?: string): string {
  const uid = userId || getScopedUserId();
  return `lifesync_${uid}_${key}`;
}

function getLocal<T>(key: string, fallback: T, userId?: string): T {
  if (typeof window === "undefined") return fallback;
  try {
    const scopedRaw = localStorage.getItem(getLocalKey(key, userId));
    if (scopedRaw !== null) return JSON.parse(scopedRaw);

    // Backward-compatibility fallback for legacy un-scoped data
    const legacyRaw = localStorage.getItem(`lifesync_${key}`);
    if (legacyRaw !== null) return JSON.parse(legacyRaw);

    return fallback;
  } catch (err) {
    console.warn(`[LocalStorage] Read ${key} error:`, err);
    return fallback;
  }
}

function setLocal<T>(key: string, value: T, userId?: string): T {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(getLocalKey(key, userId), JSON.stringify(value));
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
    if (user?.id) {
      setActiveScopedUserId(user.id);
      return user.id;
    }
  } catch {
    // Fallback if not authenticated yet
  }
  return getScopedUserId();
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
  return getLocal<HealthMetric | null>("health_metrics", null, userId);
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

    if (!error && data) return data as HealthMetric[];
  } catch (err) {
    console.warn("[DB] health_metrics history fallback to local:", err);
  }
  const history = getLocal<HealthMetric[]>("health_metrics_history", [], userId);
  return history;
}

export async function upsertHealthMetrics(
  metrics: Partial<HealthMetric>
): Promise<HealthMetric | null> {
  const userId = await getActiveUserId();
  const current = getLocal<HealthMetric | null>("health_metrics", null, userId);
  const now = new Date().toISOString();

  const updated: HealthMetric = {
    id: current?.id || `hm-local-${Date.now()}`,
    user_id: userId,
    recorded_at: now,
    created_at: current?.created_at || now,
    heart_rate: metrics.heart_rate !== undefined ? metrics.heart_rate : current?.heart_rate ?? null,
    steps: metrics.steps !== undefined ? metrics.steps : current?.steps ?? null,
    hydration_pct: metrics.hydration_pct !== undefined ? metrics.hydration_pct : current?.hydration_pct ?? null,
    spo2: metrics.spo2 !== undefined ? metrics.spo2 : current?.spo2 ?? null,
    body_temp: metrics.body_temp !== undefined ? metrics.body_temp : current?.body_temp ?? null,
    hrv_ms: metrics.hrv_ms !== undefined ? metrics.hrv_ms : current?.hrv_ms ?? null,
    stress_pct: metrics.stress_pct !== undefined ? metrics.stress_pct : current?.stress_pct ?? null,
    vo2_max: metrics.vo2_max !== undefined ? metrics.vo2_max : current?.vo2_max ?? null,
    calories_burned: metrics.calories_burned !== undefined ? metrics.calories_burned : current?.calories_burned ?? null,
    recovery_score: metrics.recovery_score !== undefined ? metrics.recovery_score : current?.recovery_score ?? null,
  };

  setLocal("health_metrics", updated, userId);
  const history = getLocal<HealthMetric[]>("health_metrics_history", [], userId);
  const todayDate = now.split("T")[0];
  const filtered = history.filter((h) => !h.recorded_at.startsWith(todayDate));
  setLocal("health_metrics_history", [...filtered, updated], userId);

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
  const currentMetrics = getLocal<HealthMetric | null>("health_metrics", null);
  const updatedBurn = ((currentMetrics?.calories_burned ?? 0) as number) + workout.calories;
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
  return getLocal<SleepLog | null>("sleep_log", null, userId);
}

export async function logSleep(
  sleep: Omit<SleepLog, "id" | "user_id" | "created_at">
): Promise<SleepLog | null> {
  const userId = await getActiveUserId();
  const now = new Date().toISOString();
  const newSleep: SleepLog = {
    ...sleep,
    id: `sl-local-${Date.now()}`,
    user_id: userId,
    created_at: now,
  };

  setLocal("sleep_log", newSleep, userId);
  const currentList = getLocal<SleepLog[]>("sleep_logs_list", [], userId);
  const filtered = currentList.filter((s) => s.sleep_date !== newSleep.sleep_date);
  setLocal("sleep_logs_list", [newSleep, ...filtered], userId);

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

    if (!error && data) return data as SleepLog[];
  } catch (err) {
    console.warn("[DB] weekly sleep fallback to local:", err);
  }
  return getLocal<SleepLog[]>("sleep_logs_list", [], userId);
}

export async function getSleepHistory(days = 30): Promise<SleepLog[]> {
  const userId = await getActiveUserId();
  try {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const { data, error } = await supabase
      .from("sleep_logs")
      .select("*")
      .eq("user_id", userId)
      .gte("sleep_date", since.toISOString().split("T")[0])
      .order("sleep_date", { ascending: true });

    if (!error && data) return data as SleepLog[];
  } catch (err) {
    console.warn("[DB] sleep history fallback to local:", err);
  }
  return getLocal<SleepLog[]>("sleep_logs_list", [], userId);
}

// ─────────────────────────────────────────────────────────
// AI USER PROFILE & PREFERENCES
// ─────────────────────────────────────────────────────────

export function getAiProfile(): AiUserProfile {
  return getLocal<AiUserProfile>("ai_profile", INITIAL_AI_PROFILE);
}

export function updateAiProfile(updates: Partial<AiUserProfile>): AiUserProfile {
  const current = getAiProfile();
  const updated = { ...current, ...updates };
  return setLocal<AiUserProfile>("ai_profile", updated);
}

export function clearAiProfile(): AiUserProfile {
  return setLocal<AiUserProfile>("ai_profile", INITIAL_AI_PROFILE);
}

export function setAiPersonalizationEnabled(enabled: boolean): AiUserProfile {
  return updateAiProfile({ personalizationEnabled: enabled });
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
  const currentMetrics = getLocal<HealthMetric | null>("health_metrics", null);
  if (currentMetrics) {
    const tempUpdated = { ...currentMetrics, hydration_pct: pct };
    setLocal("health_metrics", tempUpdated);
  }

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
    healthMetrics: getLocal("health_metrics", null),
    workouts: getLocal("workouts", INITIAL_WORKOUTS),
    studySessions: getLocal("study_sessions", INITIAL_STUDY_SESSIONS),
    moodLog: getLocal("mood_log", INITIAL_MOOD_LOG),
    sleepLog: getLocal("sleep_log", null),
    goals: getLocal("goals", INITIAL_GOALS),
    habits: getLocal("habits", INITIAL_HABITS),
    hydration: getLocal("hydration", INITIAL_HYDRATION),
    meals: getLocal("meals", INITIAL_MEALS),
    aiProfile: getLocal("ai_profile", INITIAL_AI_PROFILE),
  };
  return JSON.stringify(data, null, 2);
}

export function resetAllDataToDefault() {
  if (typeof window !== "undefined") {
    // Clear all lifesync keys (both scoped and legacy)
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith("lifesync_")) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((k) => localStorage.removeItem(k));
    notifyUpdate();
  }
}

export function resetBaselineData() {
  resetAllDataToDefault();
}
