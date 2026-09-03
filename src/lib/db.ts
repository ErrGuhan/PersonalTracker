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
  HabitLogStatus,
  HydrationEntry,
  HydrationLog,
  MealLog,
  AiUserProfile,
} from "./database.types";

export const PRIMARY_USER_EMAIL = "guhan24td0781@svcet.ac.in";
export const DEMO_USER_ID = "00000000-0000-0000-0000-000000000001";

/**
 * Canonical local calendar date string (YYYY-MM-DD).
 * Uses local calendar values (getFullYear, getMonth + 1, getDate)
 * to guarantee that frontend, server actions, and DB queries agree on today.
 */
export function getLocalDateString(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getRelativeLocalDateString(daysOffset: number, baseDate: Date = new Date()): string {
  const d = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate() + daysOffset);
  return getLocalDateString(d);
}

export function parseLocalDate(dateStr: string): Date {
  const parts = dateStr.split("-").map(Number);
  return new Date(parts[0], parts[1] - 1, parts[2]);
}

export function extractLocalDate(dateOrIsoStr: string): string {
  if (!dateOrIsoStr) return "";
  if (dateOrIsoStr.length === 10 && !dateOrIsoStr.includes("T")) {
    return dateOrIsoStr;
  }
  const d = new Date(dateOrIsoStr);
  if (isNaN(d.getTime())) {
    return dateOrIsoStr.slice(0, 10);
  }
  return getLocalDateString(d);
}

export const todayStr = () => getLocalDateString();

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
export const INITIAL_HABITS: Habit[] = [];
export const INITIAL_HABIT_LOGS: HabitLog[] = [];

export const INITIAL_HYDRATION_ENTRIES: HydrationEntry[] = [];
export const DEFAULT_HYDRATION_TARGET_ML = 2500;

export const INITIAL_HYDRATION: HydrationLog = {
  amountMl: 0,
  targetMl: DEFAULT_HYDRATION_TARGET_ML,
  lastUpdated: null,
};

export const INITIAL_MEALS: MealLog[] = [];

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

const memoryStore: Record<string, string> = {};

function getLocalKey(key: string, userId?: string): string {
  const uid = userId || getScopedUserId();
  return `lifesync_${uid}_${key}`;
}

export function clearMemoryStore(): void {
  for (const k of Object.keys(memoryStore)) {
    delete memoryStore[k];
  }
}

function getLocal<T>(key: string, fallback: T, userId?: string): T {
  const fullKey = getLocalKey(key, userId);
  if (typeof window === "undefined") {
    if (memoryStore[fullKey] !== undefined) {
      try {
        return JSON.parse(memoryStore[fullKey]);
      } catch {
        return fallback;
      }
    }
    return fallback;
  }
  try {
    const scopedRaw = localStorage.getItem(fullKey);
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
  const fullKey = getLocalKey(key, userId);
  const serialized = JSON.stringify(value);
  if (typeof window === "undefined") {
    memoryStore[fullKey] = serialized;
    return value;
  }
  try {
    localStorage.setItem(fullKey, serialized);
    notifyUpdate();
  } catch (err) {
    console.warn(`[LocalStorage] Write ${key} error:`, err);
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

    if (error) throw error;
    if (data) {
      setLocal("goals", data as Goal[], userId);
      return data as Goal[];
    }
  } catch (err) {
    console.warn("[DB] goals query remote failed, using local user cache:", err);
    return getLocal<Goal[]>("goals", [], userId);
  }
  return [];
}

export async function updateGoalProgress(
  goalId: string,
  progress: number
): Promise<Goal | null> {
  const cleanProgress = Math.round(Number(progress));
  if (isNaN(cleanProgress) || cleanProgress < 0 || cleanProgress > 100) {
    throw new Error(`Invalid goal progress: ${progress}. Must be an integer between 0 and 100.`);
  }

  const userId = await getActiveUserId();
  const current = getLocal<Goal[]>("goals", [], userId);
  const nowIso = new Date().toISOString();

  const updatedList = current.map((g) =>
    g.id === goalId ? { ...g, progress: cleanProgress, updated_at: nowIso } : g
  );
  setLocal("goals", updatedList, userId);
  const fallbackGoal = updatedList.find((g) => g.id === goalId) ?? null;

  try {
    const { data, error } = await supabase
      .from("goals")
      .update({ progress: cleanProgress, updated_at: nowIso } as unknown as never)
      .eq("id", goalId)
      .eq("user_id", userId)
      .select()
      .single();

    if (!error && data) return data as Goal;
    if (error) console.warn("[DB] updateGoalProgress remote error:", error);
  } catch (err) {
    console.warn("[DB] update goal saved to local storage:", err);
  }
  return fallbackGoal;
}

export async function updateGoal(
  goalId: string,
  updates: Partial<Omit<Goal, "id" | "user_id" | "created_at">>
): Promise<Goal | null> {
  const userId = await getActiveUserId();
  const current = getLocal<Goal[]>("goals", [], userId);
  const nowIso = new Date().toISOString();

  // Validate progress if included in updates
  if (updates.progress !== undefined) {
    const p = Math.round(Number(updates.progress));
    if (isNaN(p) || p < 0 || p > 100) {
      throw new Error(`Invalid goal progress: ${updates.progress}. Must be an integer between 0 and 100.`);
    }
    updates.progress = p;
  }

  const cleanUpdates = {
    ...updates,
    updated_at: nowIso,
  };

  const updatedList = current.map((g) =>
    g.id === goalId ? { ...g, ...cleanUpdates } : g
  );
  setLocal("goals", updatedList, userId);
  const fallbackGoal = updatedList.find((g) => g.id === goalId) ?? null;

  try {
    const { data, error } = await supabase
      .from("goals")
      .update(cleanUpdates as unknown as never)
      .eq("id", goalId)
      .eq("user_id", userId)
      .select()
      .single();

    if (!error && data) return data as Goal;
    if (error) console.warn("[DB] updateGoal remote error:", error);
  } catch (err) {
    console.warn("[DB] updateGoal remote call failed, using local:", err);
  }
  return fallbackGoal;
}

export async function deleteGoal(goalId: string): Promise<boolean> {
  const userId = await getActiveUserId();
  const current = getLocal<Goal[]>("goals", [], userId);
  const filtered = current.filter((g) => g.id !== goalId);
  setLocal("goals", filtered, userId);

  try {
    const { error } = await supabase
      .from("goals")
      .delete()
      .eq("id", goalId)
      .eq("user_id", userId);

    if (error) {
      console.warn("[DB] deleteGoal remote error:", error);
    }
    return true;
  } catch (err) {
    console.warn("[DB] deleteGoal remote call failed:", err);
    return true; // Local removal succeeded
  }
}

export async function createGoal(
  goal: Omit<Goal, "id" | "user_id" | "created_at" | "updated_at">
): Promise<Goal | null> {
  if (!goal.title || !goal.title.trim()) {
    throw new Error("Goal title is required");
  }

  const progress = Math.round(Number(goal.progress ?? 0));
  if (isNaN(progress) || progress < 0 || progress > 100) {
    throw new Error("Goal progress must be between 0 and 100");
  }

  const userId = await getActiveUserId();
  const nowIso = new Date().toISOString();
  const newGoal: Goal = {
    ...goal,
    title: goal.title.trim(),
    progress,
    id: `g-local-${Date.now()}`,
    user_id: userId,
    created_at: nowIso,
    updated_at: nowIso,
  };

  const existing = getLocal<Goal[]>("goals", [], userId);
  setLocal("goals", [...existing, newGoal], userId);

  try {
    const { data, error } = await supabase
      .from("goals")
      .insert({
        ...goal,
        title: goal.title.trim(),
        progress,
        user_id: userId,
      } as unknown as never)
      .select()
      .single();

    if (!error && data) {
      const savedGoal = data as Goal;
      const updatedList = existing.map((g) => (g.id === newGoal.id ? savedGoal : g));
      setLocal("goals", updatedList, userId);
      return savedGoal;
    }
    if (error) console.warn("[DB] createGoal remote error:", error);
  } catch (err) {
    console.warn("[DB] create goal saved to local storage:", err);
  }
  return newGoal;
}

// ─────────────────────────────────────────────────────────
// HABITS, HABIT LOGS & STREAK INTELLIGENCE
// ─────────────────────────────────────────────────────────

/**
 * Calculates current active streak and today's completion status for a habit
 * based on immutable historical HabitLog records.
 *
 * Rules:
 * 1. Brand new habit (0 logs) => streak = 0, completedToday = false, todayStatus = 'INCOMPLETE'.
 * 2. Today is COMPLETED or FROZEN => anchor is today; count consecutive completed/frozen days backwards.
 * 3. Today is NOT logged yet => check if yesterday was COMPLETED or FROZEN.
 *    - If yesterday was completed/frozen, streak is preserved intact (e.g. 3-day streak remains 3),
 *      completedToday = false, and the user must complete today's action.
 *    - If yesterday was missed or empty => streak = 0, completedToday = false.
 * 4. A single missed day cleanly resets streak to 0 (or 1 once today is completed).
 * 5. Frozen/rest days maintain streak continuity without breaking.
 */
export function calculateHabitStreak(
  logs: HabitLog[],
  today: string = todayStr()
): { streak: number; completedToday: boolean; todayStatus: HabitLogStatus | "INCOMPLETE" } {
  if (!logs || logs.length === 0) {
    return { streak: 0, completedToday: false, todayStatus: "INCOMPLETE" };
  }

  const statusByDate = new Map<string, HabitLogStatus>();
  for (const log of logs) {
    statusByDate.set(log.log_date, log.status);
  }

  const todayLog = statusByDate.get(today);
  const completedToday = todayLog === "COMPLETED";
  const todayStatus: HabitLogStatus | "INCOMPLETE" = todayLog ?? "INCOMPLETE";

  // If today is explicitly marked MISSED, streak is broken
  if (todayLog === "MISSED") {
    return { streak: 0, completedToday: false, todayStatus: "MISSED" };
  }

  let anchorDate: Date;
  if (todayLog === "COMPLETED" || todayLog === "FROZEN") {
    anchorDate = parseLocalDate(today);
  } else {
    // Today not yet logged. Check yesterday to see if active streak carries over.
    const yesterdayDate = parseLocalDate(today);
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const yesterdayStr = getLocalDateString(yesterdayDate);
    const yesterdayStatus = statusByDate.get(yesterdayStr);

    if (yesterdayStatus === "COMPLETED" || yesterdayStatus === "FROZEN") {
      anchorDate = yesterdayDate;
    } else {
      // Neither today nor yesterday has a completed/frozen log -> streak is 0
      return { streak: 0, completedToday, todayStatus };
    }
  }

  let streak = 0;
  const cursor = new Date(anchorDate.getTime());

  while (true) {
    const dStr = getLocalDateString(cursor);
    const status = statusByDate.get(dStr);

    if (status === "COMPLETED" || status === "FROZEN") {
      streak++;
      cursor.setDate(cursor.getDate() - 1);
    } else {
      break;
    }
  }

  return { streak, completedToday, todayStatus };
}

/**
 * Returns all habit logs (persisted permanently in user-scoped storage).
 * Historical logs are NEVER deleted when a new day arrives.
 */
export function getHabitLogs(habitId?: string): HabitLog[] {
  const allLogs = getLocal<HabitLog[]>("habit_logs", INITIAL_HABIT_LOGS);
  if (habitId) {
    return allLogs.filter((l) => l.habit_id === habitId);
  }
  return allLogs;
}

/**
 * Loads all user habits, joining them with daily HabitLog records
 * to deterministically compute streaks and today's status.
 */
export function getHabits(): Habit[] {
  const rawHabits = getLocal<Habit[]>("habits", INITIAL_HABITS);
  const allLogs = getLocal<HabitLog[]>("habit_logs", INITIAL_HABIT_LOGS);
  const today = todayStr();

  return rawHabits.map((h) => {
    const habitLogs = allLogs.filter((l) => l.habit_id === h.id);
    const { streak, completedToday, todayStatus } = calculateHabitStreak(habitLogs, today);
    return {
      ...h,
      streak,
      completedToday,
      todayStatus,
    };
  });
}

/**
 * Toggles today's completion state for a habit.
 * Idempotent: If completed, un-completes. If incomplete, completes.
 * Never deletes historical logs from previous days.
 */
export function toggleHabit(id: string, dateStr?: string): Habit[] {
  const targetDate = dateStr || todayStr();
  const allLogs = getLocal<HabitLog[]>("habit_logs", INITIAL_HABIT_LOGS);
  const existingLogIndex = allLogs.findIndex(
    (l) => l.habit_id === id && l.log_date === targetDate
  );

  let updatedLogs: HabitLog[];
  if (existingLogIndex >= 0) {
    // Un-complete: remove today's log
    updatedLogs = allLogs.filter((_, i) => i !== existingLogIndex);
  } else {
    // Complete: append new habit log
    const userId = getScopedUserId();
    const newLog: HabitLog = {
      id: `hl-${id}-${targetDate}-${Date.now()}`,
      habit_id: id,
      user_id: userId,
      log_date: targetDate,
      status: "COMPLETED",
      created_at: new Date().toISOString(),
    };
    updatedLogs = [...allLogs, newLog];
  }

  setLocal("habit_logs", updatedLogs);

  // Background sync with Supabase
  syncHabitLogToSupabase(id, targetDate, existingLogIndex < 0);

  return getHabits();
}

/**
 * Sets explicit status for a habit on a given date (COMPLETED, FROZEN, MISSED).
 */
export function setHabitStatus(
  id: string,
  status: HabitLogStatus,
  dateStr?: string
): Habit[] {
  const targetDate = dateStr || todayStr();
  const allLogs = getLocal<HabitLog[]>("habit_logs", INITIAL_HABIT_LOGS);
  const existingLogIndex = allLogs.findIndex(
    (l) => l.habit_id === id && l.log_date === targetDate
  );

  let updatedLogs: HabitLog[];
  const userId = getScopedUserId();
  const log: HabitLog = {
    id: `hl-${id}-${targetDate}-${Date.now()}`,
    habit_id: id,
    user_id: userId,
    log_date: targetDate,
    status,
    created_at: new Date().toISOString(),
  };

  if (existingLogIndex >= 0) {
    updatedLogs = allLogs.map((l, i) => (i === existingLogIndex ? log : l));
  } else {
    updatedLogs = [...allLogs, log];
  }

  setLocal("habit_logs", updatedLogs);
  syncHabitLogToSupabase(id, targetDate, true, status);
  return getHabits();
}

/**
 * Adds a new habit definition.
 * CRITICAL: Streak is ALWAYS initialized to 0. A streak of 1 must be earned.
 */
export function addHabit(
  newHabit: Omit<Habit, "id" | "streak" | "completedToday" | "todayStatus">
): Habit[] {
  const userId = getScopedUserId();
  const habit: Habit = {
    ...newHabit,
    id: `h-local-${Date.now()}`,
    user_id: userId,
    streak: 0, // CRITICAL: NEVER DEFAULT TO 1. Streak starts at 0.
    completedToday: false,
    todayStatus: "INCOMPLETE",
    created_at: new Date().toISOString(),
  };

  const current = getLocal<Habit[]>("habits", INITIAL_HABITS);
  setLocal("habits", [...current, habit]);

  // Background sync habit definition to Supabase
  syncNewHabitToSupabase(habit);

  return getHabits();
}

export function updateHabit(id: string, updatedFields: Partial<Habit>): Habit[] {
  const current = getLocal<Habit[]>("habits", INITIAL_HABITS);
  const updated = current.map((h) => (h.id === id ? { ...h, ...updatedFields } : h));
  setLocal("habits", updated);

  syncHabitUpdateToSupabase(id, updatedFields);
  return getHabits();
}

export function deleteHabit(id: string): Habit[] {
  const current = getLocal<Habit[]>("habits", INITIAL_HABITS);
  const updated = current.filter((h) => h.id !== id);
  setLocal("habits", updated);

  // Also remove associated habit logs (cascade)
  const allLogs = getLocal<HabitLog[]>("habit_logs", INITIAL_HABIT_LOGS);
  const updatedLogs = allLogs.filter((l) => l.habit_id !== id);
  setLocal("habit_logs", updatedLogs);

  syncHabitDeleteToSupabase(id);
  return getHabits();
}

async function syncHabitUpdateToSupabase(id: string, updatedFields: Partial<Habit>) {
  try {
    const userId = await getActiveUserId();
    await supabase
      .from("habits")
      .update({
        title: updatedFields.title,
        category: updatedFields.category,
        frequency: updatedFields.frequency,
      } as unknown as never)
      .eq("id", id)
      .eq("user_id", userId);
  } catch (err) {
    console.warn("[DB] Supabase habit update sync:", err);
  }
}

async function syncHabitDeleteToSupabase(id: string) {
  try {
    const userId = await getActiveUserId();
    await supabase
      .from("habits")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);
  } catch (err) {
    console.warn("[DB] Supabase habit delete sync:", err);
  }
}

/**
 * Background helper to sync habit log changes to Supabase.
 */
async function syncHabitLogToSupabase(
  habitId: string,
  logDate: string,
  isCompleted: boolean,
  status: HabitLogStatus = "COMPLETED"
) {
  try {
    const userId = await getActiveUserId();
    if (isCompleted) {
      await supabase
        .from("habit_logs")
        .upsert(
          {
            habit_id: habitId,
            user_id: userId,
            log_date: logDate,
            status,
          } as unknown as never,
          { onConflict: "habit_id,log_date" }
        );
    } else {
      await supabase
        .from("habit_logs")
        .delete()
        .eq("habit_id", habitId)
        .eq("log_date", logDate)
        .eq("user_id", userId);
    }
  } catch (err) {
    console.warn("[DB] Supabase habit log sync failed:", err);
  }
}

/**
 * Background helper to sync a new habit definition to Supabase.
 */
async function syncNewHabitToSupabase(habit: Habit) {
  try {
    const userId = await getActiveUserId();
    await supabase.from("habits").insert({
      id: habit.id.startsWith("h-local-") ? undefined : habit.id,
      user_id: userId,
      title: habit.title,
      category: habit.category,
      frequency: habit.frequency || "Daily",
      target_count: habit.targetCount || 1,
      icon: habit.icon || "check_circle",
    } as unknown as never);
  } catch (err) {
    console.warn("[DB] Supabase habit insert sync:", err);
  }
}

/**
 * Asynchronously fetches habits and habit logs from Supabase
 * and caches them into session-scoped local storage.
 */
export async function fetchHabitsWithLogsAsync(): Promise<Habit[]> {
  try {
    const userId = await getActiveUserId();
    const [habitsRes, logsRes] = await Promise.all([
      supabase.from("habits").select("*").eq("user_id", userId).order("created_at", { ascending: true }),
      supabase.from("habit_logs").select("*").eq("user_id", userId).order("log_date", { ascending: false }),
    ]);

    if (!habitsRes.error && habitsRes.data && habitsRes.data.length > 0) {
      const remoteHabits: Habit[] = habitsRes.data.map((h: any) => ({
        id: h.id,
        user_id: h.user_id,
        title: h.title,
        category: h.category,
        frequency: h.frequency || "Daily",
        targetCount: h.target_count || 1,
        icon: h.icon || "check_circle",
        streak: 0,
        completedToday: false,
        todayStatus: "INCOMPLETE",
        created_at: h.created_at,
      }));
      setLocal("habits", remoteHabits);
    }

    if (!logsRes.error && logsRes.data) {
      const remoteLogs: HabitLog[] = logsRes.data.map((l: any) => ({
        id: l.id,
        habit_id: l.habit_id,
        user_id: l.user_id,
        log_date: l.log_date,
        status: l.status as HabitLogStatus,
        created_at: l.created_at,
      }));
      setLocal("habit_logs", remoteLogs);
    }
  } catch (err) {
    console.warn("[DB] fetchHabitsWithLogsAsync error, using local data:", err);
  }

  return getHabits();
}

// ─────────────────────────────────────────────────────────
// HYDRATION & NUTRITION (FUEL ENGINE)
// ─────────────────────────────────────────────────────────

export function getHydrationTarget(): number {
  return getLocal<number>("hydration_target", DEFAULT_HYDRATION_TARGET_ML);
}

export function setHydrationTarget(targetMl: number): number {
  return setLocal("hydration_target", Math.max(500, targetMl));
}

/**
 * Returns all permanent, historical hydration entries ever logged.
 */
export function getHydrationEntries(): HydrationEntry[] {
  return getLocal<HydrationEntry[]>("hydration_entries", INITIAL_HYDRATION_ENTRIES);
}

/**
 * Calculates today's consumed hydration total strictly from today's entries.
 * Returns { amountMl: 0 } if no entries exist for today.
 */
export function getTodayHydration(targetDate?: string): HydrationLog {
  const date = targetDate || todayStr();
  const allEntries = getHydrationEntries();

  const todayEntries = allEntries.filter((e) => {
    if (!e.logged_at) return false;
    return extractLocalDate(e.logged_at) === date;
  });

  const amountMl = todayEntries.reduce((sum, e) => sum + (Number(e.amount_ml) || 0), 0);
  const lastUpdated = todayEntries.length > 0 ? todayEntries[todayEntries.length - 1].logged_at : null;

  return {
    amountMl,
    targetMl: getHydrationTarget(),
    lastUpdated,
  };
}

/**
 * Backwards-compatible getter for today's hydration summary.
 */
export function getHydration(): HydrationLog {
  return getTodayHydration();
}

/**
 * Logs a new discrete hydration entry with timestamp and persists it permanently.
 */
export function addWater(amountMl: number, dateStr?: string): HydrationLog {
  const targetDate = dateStr || todayStr();
  const newEntry: HydrationEntry = {
    id: `hyd-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    amount_ml: Math.max(1, Math.round(amountMl)),
    logged_at: dateStr ? `${dateStr}T12:00:00` : new Date().toISOString(),
  };

  const current = getHydrationEntries();
  setLocal("hydration_entries", [...current, newEntry]);

  // Sync to Supabase in background
  syncHydrationEntryToSupabase(newEntry);

  const todayHydration = getTodayHydration(targetDate);
  const pct = Math.round((todayHydration.amountMl / todayHydration.targetMl) * 100);
  const currentMetrics = getLocal<HealthMetric | null>("health_metrics", null);
  if (currentMetrics) {
    const tempUpdated = { ...currentMetrics, hydration_pct: Math.min(100, pct) };
    setLocal("health_metrics", tempUpdated);
  }

  return todayHydration;
}

/**
 * Returns all permanent, historical meals ever logged.
 */
export function getAllMeals(): MealLog[] {
  return getLocal<MealLog[]>("meals", INITIAL_MEALS);
}

/**
 * Returns meals logged strictly on targetDate (defaults to today).
 */
export function getTodayMeals(targetDate?: string): MealLog[] {
  const date = targetDate || todayStr();
  const allMeals = getAllMeals();

  return allMeals.filter((m) => {
    if (!m.loggedAt) return false;
    return extractLocalDate(m.loggedAt) === date;
  });
}

/**
 * Backwards-compatible getter for today's meals.
 */
export function getMeals(): MealLog[] {
  return getTodayMeals();
}

/**
 * Computes deterministic macronutrient and calorie totals strictly from today's meals.
 */
export function getTodayNutritionStats(targetDate?: string) {
  const todayMeals = getTodayMeals(targetDate);
  return {
    totalCalories: todayMeals.reduce((s, m) => s + (Number(m.calories) || 0), 0),
    totalProtein: todayMeals.reduce((s, m) => s + (Number(m.proteinG) || 0), 0),
    totalCarbs: todayMeals.reduce((s, m) => s + (Number(m.carbsG) || 0), 0),
    totalFats: todayMeals.reduce((s, m) => s + (Number(m.fatsG) || 0), 0),
  };
}

/**
 * Logs a new discrete meal with timestamp and persists it permanently in history.
 */
export function logMeal(meal: Omit<MealLog, "id" | "loggedAt">, dateStr?: string): MealLog[] {
  const targetDate = dateStr || todayStr();
  const newMeal: MealLog = {
    ...meal,
    id: `m-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    loggedAt: dateStr ? `${dateStr}T12:00:00.000Z` : new Date().toISOString(),
  };

  const current = getAllMeals();
  setLocal("meals", [newMeal, ...current]);

  syncMealToSupabase(newMeal);
  return getTodayMeals(targetDate);
}

export function updateMeal(id: string, updatedFields: Partial<MealLog>): MealLog[] {
  const current = getAllMeals();
  const updated = current.map((m) => (m.id === id ? { ...m, ...updatedFields } : m));
  setLocal("meals", updated);

  syncMealUpdateToSupabase(id, updatedFields);
  return getTodayMeals();
}

export function deleteMeal(id: string): MealLog[] {
  const current = getAllMeals();
  const updated = current.filter((m) => m.id !== id);
  setLocal("meals", updated);

  syncMealDeleteToSupabase(id);
  return getTodayMeals();
}

// ─── Fuel Background Supabase Sync Helpers ───────────────────

async function syncHydrationEntryToSupabase(entry: HydrationEntry) {
  try {
    const userId = await getActiveUserId();
    await supabase.from("hydration_logs").insert({
      user_id: userId,
      amount_ml: entry.amount_ml,
      logged_at: entry.logged_at,
    } as unknown as never);
  } catch (err) {
    console.warn("[DB] Supabase hydration insert sync:", err);
  }
}

async function syncMealToSupabase(meal: MealLog) {
  try {
    const userId = await getActiveUserId();
    await supabase.from("meals").insert({
      user_id: userId,
      name: meal.name,
      meal_type: meal.mealType,
      calories: meal.calories,
      protein_g: meal.proteinG,
      carbs_g: meal.carbsG,
      fats_g: meal.fatsG,
      logged_at: meal.loggedAt,
    } as unknown as never);
  } catch (err) {
    console.warn("[DB] Supabase meal insert sync:", err);
  }
}

async function syncMealUpdateToSupabase(id: string, updatedFields: Partial<MealLog>) {
  try {
    const userId = await getActiveUserId();
    await supabase
      .from("meals")
      .update({
        name: updatedFields.name,
        meal_type: updatedFields.mealType,
        calories: updatedFields.calories,
        protein_g: updatedFields.proteinG,
        carbs_g: updatedFields.carbsG,
        fats_g: updatedFields.fatsG,
      } as unknown as never)
      .eq("id", id)
      .eq("user_id", userId);
  } catch (err) {
    console.warn("[DB] Supabase meal update sync:", err);
  }
}

async function syncMealDeleteToSupabase(id: string) {
  try {
    const userId = await getActiveUserId();
    await supabase
      .from("meals")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);
  } catch (err) {
    console.warn("[DB] Supabase meal delete sync:", err);
  }
}

/**
 * Asynchronously pulls hydration entries and meals from Supabase
 * and caches them into session-scoped local storage.
 */
export async function fetchFuelDataAsync(): Promise<{ hydration: HydrationLog; meals: MealLog[] }> {
  try {
    const userId = await getActiveUserId();
    const [hydRes, mealsRes] = await Promise.all([
      supabase.from("hydration_logs").select("*").eq("user_id", userId).order("logged_at", { ascending: true }),
      supabase.from("meals").select("*").eq("user_id", userId).order("logged_at", { ascending: false }),
    ]);

    if (!hydRes.error && hydRes.data && hydRes.data.length > 0) {
      const remoteHydration: HydrationEntry[] = hydRes.data.map((h: any) => ({
        id: h.id,
        user_id: h.user_id,
        amount_ml: h.amount_ml,
        logged_at: h.logged_at,
        created_at: h.created_at,
      }));
      setLocal("hydration_entries", remoteHydration);
    }

    if (!mealsRes.error && mealsRes.data && mealsRes.data.length > 0) {
      const remoteMeals: MealLog[] = mealsRes.data.map((m: any) => ({
        id: m.id,
        user_id: m.user_id,
        name: m.name,
        mealType: m.meal_type as any,
        calories: m.calories,
        proteinG: m.protein_g,
        carbsG: m.carbs_g,
        fatsG: m.fats_g,
        loggedAt: m.logged_at,
        created_at: m.created_at,
      }));
      setLocal("meals", remoteMeals);
    }
  } catch (err) {
    console.warn("[DB] fetchFuelDataAsync error, using local data:", err);
  }

  return {
    hydration: getTodayHydration(),
    meals: getTodayMeals(),
  };
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
    habitLogs: getLocal("habit_logs", INITIAL_HABIT_LOGS),
    hydration: getLocal("hydration", INITIAL_HYDRATION),
    hydrationEntries: getLocal("hydration_entries", INITIAL_HYDRATION_ENTRIES),
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
