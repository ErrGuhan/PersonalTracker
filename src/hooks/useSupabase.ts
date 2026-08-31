"use client";
// ─── LifeSync OS — Supabase & Local DB React Hooks ──────────────────
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import {
  getLatestHealthMetrics,
  getHealthMetricHistory,
  getRecentWorkouts,
  getWeeklyWorkoutStats,
  getStudyStats,
  getLatestMood,
  logMood,
  getLatestSleep,
  logSleep,
  getWeeklySleep,
  getGoals,
  updateGoalProgress,
  createGoal,
  logWorkout,
  logStudySession,
  getHabits,
  toggleHabit as toggleHabitDb,
  addHabit as addHabitDb,
  getHydration,
  addWater as addWaterDb,
  getMeals,
  logMeal as logMealDb,
  upsertHealthMetrics,
  DEMO_USER_ID,
  type StudyStats,
} from "@/lib/db";
import type { HealthMetric, Workout, Goal, SleepLog, Habit, HydrationLog, MealLog } from "@/lib/database.types";

// ─────────────────────────────────────────────────────────
// Generic async hook factory with local broadcast listener
// ─────────────────────────────────────────────────────────
function useAsync<T>(fetcher: () => Promise<T>) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const executeFetch = useCallback(() => {
    let isMounted = true;
    fetcher()
      .then((res) => {
        if (isMounted) {
          setData(res);
          setError(null);
        }
      })
      .catch((e) => {
        if (isMounted) setError(e instanceof Error ? e.message : "Unknown error");
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });
    return () => { isMounted = false; };
  }, [fetcher]);

  const refetch = useCallback(() => {
    setLoading(true);
    executeFetch();
  }, [executeFetch]);

  useEffect(() => {
    const cancel = executeFetch();
    const handleLocalUpdate = () => { executeFetch(); };
    if (typeof window !== "undefined") {
      window.addEventListener("lifesync-db-update", handleLocalUpdate);
    }
    return () => {
      cancel();
      if (typeof window !== "undefined") {
        window.removeEventListener("lifesync-db-update", handleLocalUpdate);
      }
    };
  }, [executeFetch]);

  return { data, loading, error, refetch };
}

// ─────────────────────────────────────────────────────────
// HEALTH METRICS & VITALS
// ─────────────────────────────────────────────────────────
export function useHealthMetrics() {
  const { data, loading, error, refetch } = useAsync(getLatestHealthMetrics);

  useEffect(() => {
    const channel = supabase
      .channel("health-realtime")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "health_metrics",
          filter: `user_id=eq.${DEMO_USER_ID}`,
        },
        () => { refetch(); }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [refetch]);

  return { metrics: data, loading, error, refetch };
}

export function useHealthHistory(days = 7) {
  const fetcher = useCallback(() => getHealthMetricHistory(days), [days]);
  return useAsync(fetcher);
}

export function useLogVitals() {
  const [saving, setSaving] = useState(false);
  const save = useCallback(async (vitals: Partial<HealthMetric>) => {
    setSaving(true);
    const result = await upsertHealthMetrics(vitals);
    setSaving(false);
    return result;
  }, []);
  return { logVitals: save, saving };
}

// ─────────────────────────────────────────────────────────
// WORKOUTS
// ─────────────────────────────────────────────────────────
export function useRecentWorkouts(limit = 5) {
  const fetcher = useCallback(() => getRecentWorkouts(limit), [limit]);
  const { data, loading, error, refetch } = useAsync(fetcher);


  useEffect(() => {
    const channel = supabase
      .channel("workouts-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "workouts", filter: `user_id=eq.${DEMO_USER_ID}` },
        () => { refetch(); }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [refetch]);

  return { workouts: data ?? [], loading, error, refetch };
}

export function useWeeklyWorkoutStats() {
  return useAsync(getWeeklyWorkoutStats);
}

export function useLogWorkout() {
  const [saving, setSaving] = useState(false);
  const save = useCallback(
    async (workout: Omit<Workout, "id" | "user_id" | "created_at">) => {
      setSaving(true);
      const result = await logWorkout(workout);
      setSaving(false);
      return result;
    },
    []
  );
  return { logWorkout: save, saving };
}

// ─────────────────────────────────────────────────────────
// STUDY STUDIO
// ─────────────────────────────────────────────────────────
export function useStudyStats() {
  return useAsync<StudyStats>(getStudyStats);
}

export function useLogStudySession() {
  const [saving, setSaving] = useState(false);
  const save = useCallback(
    async (subject: string, durationMin: number, focusScore?: number) => {
      setSaving(true);
      const result = await logStudySession({
        subject,
        duration_min: durationMin,
        focus_score: focusScore ?? null,
        session_date: new Date().toISOString().split("T")[0],
      });
      setSaving(false);
      return result;
    },
    []
  );
  return { logSession: save, saving };
}

// ─────────────────────────────────────────────────────────
// MOOD
// ─────────────────────────────────────────────────────────
export function useLatestMood() {
  const { data, loading, refetch } = useAsync(getLatestMood);
  const [submitting, setSubmitting] = useState(false);

  const submitMood = useCallback(
    async (score: number) => {
      setSubmitting(true);
      await logMood(score);
      setSubmitting(false);
      refetch();
    },
    [refetch]
  );

  return {
    mood: data,
    loading,
    moodScore: data?.score ?? null,
    submitMood,
    submitting,
  };
}

// ─────────────────────────────────────────────────────────
// SLEEP
// ─────────────────────────────────────────────────────────
export function useLatestSleep() {
  return useAsync(getLatestSleep);
}

export function useWeeklySleep() {
  return useAsync(getWeeklySleep);
}

export function useLogSleep() {
  const [saving, setSaving] = useState(false);
  const save = useCallback(async (sleep: Omit<SleepLog, "id" | "user_id" | "created_at">) => {
    setSaving(true);
    const result = await logSleep(sleep);
    setSaving(false);
    return result;
  }, []);
  return { logSleep: save, saving };
}

// ─────────────────────────────────────────────────────────
// GOALS
// ─────────────────────────────────────────────────────────
export function useGoals() {
  const { data, loading, error, refetch } = useAsync(getGoals);
  const [updating, setUpdating] = useState<string | null>(null);

  const updateProgress = useCallback(
    async (goalId: string, progress: number) => {
      setUpdating(goalId);
      await updateGoalProgress(goalId, progress);
      setUpdating(null);
      refetch();
    },
    [refetch]
  );

  useEffect(() => {
    const channel = supabase
      .channel("goals-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "goals", filter: `user_id=eq.${DEMO_USER_ID}` },
        () => { refetch(); }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [refetch]);

  return { goals: data ?? [], loading, error, refetch, updateProgress, updating };
}

export function useCreateGoal() {
  const [saving, setSaving] = useState(false);
  const save = useCallback(async (goal: Omit<Goal, "id" | "user_id" | "created_at" | "updated_at">) => {
    setSaving(true);
    const result = await createGoal(goal);
    setSaving(false);
    return result;
  }, []);
  return { createGoal: save, saving };
}

// ─────────────────────────────────────────────────────────
// HABITS, HYDRATION & NUTRITION HOOKS
// ─────────────────────────────────────────────────────────
export function useHabits() {
  const [habits, setHabits] = useState<Habit[]>(() => (typeof window !== "undefined" ? getHabits() : []));

  const refresh = useCallback(() => {
    setHabits(getHabits());
  }, []);

  useEffect(() => {
    const handleUpdate = () => refresh();
    if (typeof window !== "undefined") {
      window.addEventListener("lifesync-db-update", handleUpdate);
    }
    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("lifesync-db-update", handleUpdate);
      }
    };
  }, [refresh]);

  const toggle = (id: string) => {
    const updated = toggleHabitDb(id);
    setHabits(updated);
  };

  const add = (newHabit: Omit<Habit, "id" | "streak" | "completedToday">) => {
    const updated = addHabitDb(newHabit);
    setHabits(updated);
  };

  return { habits, toggleHabit: toggle, addHabit: add, refetch: refresh };
}

export function useHydration() {
  const [hydration, setHydration] = useState<HydrationLog>(() =>
    typeof window !== "undefined" ? getHydration() : { amountMl: 1750, targetMl: 2500, lastUpdated: "" }
  );

  const refresh = useCallback(() => {
    setHydration(getHydration());
  }, []);

  useEffect(() => {
    const handleUpdate = () => refresh();
    if (typeof window !== "undefined") {
      window.addEventListener("lifesync-db-update", handleUpdate);
    }
    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("lifesync-db-update", handleUpdate);
      }
    };
  }, [refresh]);

  const addWater = (amountMl: number) => {
    const updated = addWaterDb(amountMl);
    setHydration(updated);
  };

  return { hydration, addWater, refetch: refresh };
}

export function useNutrition() {
  const [meals, setMeals] = useState<MealLog[]>(() => (typeof window !== "undefined" ? getMeals() : []));

  const refresh = useCallback(() => {
    setMeals(getMeals());
  }, []);

  useEffect(() => {
    const handleUpdate = () => refresh();
    if (typeof window !== "undefined") {
      window.addEventListener("lifesync-db-update", handleUpdate);
    }
    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("lifesync-db-update", handleUpdate);
      }
    };
  }, [refresh]);

  const logMeal = (meal: Omit<MealLog, "id" | "loggedAt">) => {
    const updated = logMealDb(meal);
    setMeals(updated);
  };

  const totalCalories = meals.reduce((s, m) => s + m.calories, 0);
  const totalProtein = meals.reduce((s, m) => s + m.proteinG, 0);
  const totalCarbs = meals.reduce((s, m) => s + m.carbsG, 0);
  const totalFats = meals.reduce((s, m) => s + m.fatsG, 0);

  return {
    meals,
    logMeal,
    refetch: refresh,
    stats: { totalCalories, totalProtein, totalCarbs, totalFats },
  };
}

