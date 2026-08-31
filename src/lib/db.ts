// ─── LifeSync OS — Centralized Supabase Data Access Layer ─────
import { supabase } from "./supabase";
import type {
  HealthMetric,
  Workout,
  StudySession,
  MoodLog,
  SleepLog,
  Goal,
} from "./database.types";

export const DEMO_USER_ID = "00000000-0000-0000-0000-000000000001";

// ─────────────────────────────────────────────────────────
// HEALTH METRICS DATA ACCESS
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

    if (error) {
      console.warn("[DB] health_metrics query warning:", error.message);
      return null;
    }
    return (data as HealthMetric | null) ?? null;
  } catch (err) {
    console.error("[DB] health_metrics error:", err);
    return null;
  }
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

    if (error) {
      console.warn("[DB] health_metrics history warning:", error.message);
      return [];
    }
    return (data as HealthMetric[]) ?? [];
  } catch (err) {
    console.error("[DB] health_metrics history error:", err);
    return [];
  }
}

export async function upsertHealthMetrics(
  metrics: Partial<HealthMetric>
): Promise<HealthMetric | null> {
  try {
    const payload = {
      user_id: DEMO_USER_ID,
      recorded_at: new Date().toISOString(),
      ...metrics,
    };
    const { data, error } = await supabase
      .from("health_metrics")
      .insert(payload as unknown as never)
      .select()
      .single();

    if (error) {
      console.error("[DB] upsert health_metrics error:", error.message);
      return null;
    }
    return (data as HealthMetric | null) ?? null;
  } catch (err) {
    console.error("[DB] upsert health_metrics exception:", err);
    return null;
  }
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

    if (error) {
      console.warn("[DB] workouts query warning:", error.message);
      return [];
    }
    return (data as Workout[]) ?? [];
  } catch (err) {
    console.error("[DB] workouts error:", err);
    return [];
  }
}

export async function getWeeklyWorkoutStats(): Promise<{
  totalCalories: number;
  totalMinutes: number;
  totalDistance: number;
  dailyCalories: number[];
}> {
  try {
    const since = new Date();
    since.setDate(since.getDate() - 7);

    const { data, error } = await supabase
      .from("workouts")
      .select("calories, duration_min, distance_km, workout_date")
      .eq("user_id", DEMO_USER_ID)
      .gte("workout_date", since.toISOString().split("T")[0])
      .order("workout_date", { ascending: true });

    if (error) {
      console.warn("[DB] weekly workout stats warning:", error.message);
      return { totalCalories: 0, totalMinutes: 0, totalDistance: 0, dailyCalories: Array(7).fill(0) };
    }

    type Row = { calories: number; duration_min: number; distance_km: number | null; workout_date: string };
    const rows: Row[] = (data as Row[]) ?? [];

    const dailyMap: Record<string, number> = {};
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      dailyMap[d.toISOString().split("T")[0]] = 0;
    }
    rows.forEach((r) => {
      const k = r.workout_date.split("T")[0];
      if (k in dailyMap) dailyMap[k] += r.calories;
    });

    return {
      totalCalories: rows.reduce((s, r) => s + (r.calories || 0), 0),
      totalMinutes: rows.reduce((s, r) => s + (r.duration_min || 0), 0),
      totalDistance: rows.reduce((s, r) => s + (r.distance_km || 0), 0),
      dailyCalories: Object.values(dailyMap),
    };
  } catch (err) {
    console.error("[DB] weekly workout stats error:", err);
    return { totalCalories: 0, totalMinutes: 0, totalDistance: 0, dailyCalories: Array(7).fill(0) };
  }
}

export async function logWorkout(
  workout: Omit<Workout, "id" | "user_id" | "created_at">
): Promise<Workout | null> {
  try {
    const { data, error } = await supabase
      .from("workouts")
      .insert({ ...workout, user_id: DEMO_USER_ID } as unknown as never)
      .select()
      .single();

    if (error) {
      console.error("[DB] log workout error:", error.message);
      return null;
    }
    return (data as Workout | null) ?? null;
  } catch (err) {
    console.error("[DB] log workout error:", err);
    return null;
  }
}

// ─────────────────────────────────────────────────────────
// STUDY SESSIONS DATA ACCESS
// ─────────────────────────────────────────────────────────

export interface StudyStats {
  todayMinutes: number;
  streakDays: number;
  totalSessions: number;
  heatmapData: number[];
}

export async function getStudyStats(): Promise<StudyStats> {
  try {
    const since = new Date();
    since.setDate(since.getDate() - 112);

    const { data, error } = await supabase
      .from("study_sessions")
      .select("session_date, duration_min")
      .eq("user_id", DEMO_USER_ID)
      .gte("session_date", since.toISOString().split("T")[0])
      .order("session_date", { ascending: true });

    if (error) {
      console.warn("[DB] study stats warning:", error.message);
      return { todayMinutes: 0, streakDays: 0, totalSessions: 0, heatmapData: Array(112).fill(0) };
    }

    type Row = { session_date: string; duration_min: number };
    const rows: Row[] = (data as Row[]) ?? [];
    const today = new Date().toISOString().split("T")[0];

    const dailyMap: Record<string, number> = {};
    rows.forEach((r) => {
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
      totalSessions: rows.length,
      heatmapData: heatmap,
    };
  } catch (err) {
    console.error("[DB] study stats error:", err);
    return { todayMinutes: 0, streakDays: 0, totalSessions: 0, heatmapData: Array(112).fill(0) };
  }
}

export async function logStudySession(
  session: Omit<StudySession, "id" | "user_id" | "created_at">
): Promise<StudySession | null> {
  try {
    const { data, error } = await supabase
      .from("study_sessions")
      .insert({ ...session, user_id: DEMO_USER_ID } as unknown as never)
      .select()
      .single();

    if (error) {
      console.error("[DB] log study session error:", error.message);
      return null;
    }
    return (data as StudySession | null) ?? null;
  } catch (err) {
    console.error("[DB] log study session error:", err);
    return null;
  }
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

    if (error) {
      console.warn("[DB] mood logs warning:", error.message);
      return null;
    }
    return (data as MoodLog | null) ?? null;
  } catch (err) {
    console.error("[DB] mood logs error:", err);
    return null;
  }
}

export async function logMood(
  score: number,
  extras?: { energy_pct?: number; anxiety_pct?: number; motivation_pct?: number }
): Promise<MoodLog | null> {
  try {
    const { data, error } = await supabase
      .from("mood_logs")
      .insert({ user_id: DEMO_USER_ID, score, logged_at: new Date().toISOString(), ...extras } as unknown as never)
      .select()
      .single();

    if (error) {
      console.error("[DB] log mood error:", error.message);
      return null;
    }
    return (data as MoodLog | null) ?? null;
  } catch (err) {
    console.error("[DB] log mood error:", err);
    return null;
  }
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

    if (error) {
      console.warn("[DB] sleep logs warning:", error.message);
      return null;
    }
    return (data as SleepLog | null) ?? null;
  } catch (err) {
    console.error("[DB] sleep logs error:", err);
    return null;
  }
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

    if (error) {
      console.warn("[DB] weekly sleep warning:", error.message);
      return [];
    }
    return (data as SleepLog[]) ?? [];
  } catch (err) {
    console.error("[DB] weekly sleep error:", err);
    return [];
  }
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

    if (error) {
      console.warn("[DB] goals query warning:", error.message);
      return [];
    }
    return (data as Goal[]) ?? [];
  } catch (err) {
    console.error("[DB] goals error:", err);
    return [];
  }
}

export async function updateGoalProgress(
  goalId: string,
  progress: number
): Promise<Goal | null> {
  try {
    const { data, error } = await supabase
      .from("goals")
      .update({ progress, updated_at: new Date().toISOString() } as unknown as never)
      .eq("id", goalId)
      .eq("user_id", DEMO_USER_ID)
      .select()
      .single();

    if (error) {
      console.error("[DB] update goal error:", error.message);
      return null;
    }
    return (data as Goal | null) ?? null;
  } catch (err) {
    console.error("[DB] update goal error:", err);
    return null;
  }
}

export async function createGoal(
  goal: Omit<Goal, "id" | "user_id" | "created_at" | "updated_at">
): Promise<Goal | null> {
  try {
    const { data, error } = await supabase
      .from("goals")
      .insert({ ...goal, user_id: DEMO_USER_ID } as unknown as never)
      .select()
      .single();

    if (error) {
      console.error("[DB] create goal error:", error.message);
      return null;
    }
    return (data as Goal | null) ?? null;
  } catch (err) {
    console.error("[DB] create goal error:", err);
    return null;
  }
}
