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
  getSleepHistory,
  getAiProfile,
  updateAiProfile as updateAiProfileDb,
  setAiPersonalizationEnabled as setAiPersonalizationDb,
  getGoals,
  updateGoalProgress,
  updateGoal,
  deleteGoal,
  createGoal,
  logWorkout,
  logStudySession,
  getHabits,
  toggleHabit as toggleHabitDb,
  setHabitStatus as setHabitStatusDb,
  addHabit as addHabitDb,
  updateHabit as updateHabitDb,
  deleteHabit as deleteHabitDb,
  fetchHabitsWithLogsAsync,
  getHydration,
  addWater as addWaterDb,
  getMeals,
  getTodayMeals,
  getAllMeals,
  logMeal as logMealDb,
  updateMeal as updateMealDb,
  deleteMeal as deleteMealDb,
  fetchFuelDataAsync,
  upsertHealthMetrics,
  getActiveUserId,
  DEMO_USER_ID,
  todayStr,
  type StudyStats,
  getActiveWorkoutProgram,
  saveWorkoutProgram,
  deleteWorkoutProgram,
  getWorkoutCompletions,
  toggleWorkoutExerciseCompletion,
  getWorkoutHeatmapData,
  updateWorkout as updateWorkoutDb,
  deleteWorkout as deleteWorkoutDb,
} from "@/lib/db";
import type { 
  HealthMetric, 
  Workout, 
  Goal, 
  SleepLog, 
  Habit, 
  HydrationLog, 
  MealLog, 
  AiUserProfile,
  WorkoutProgram,
  WorkoutExerciseCompletion,
} from "@/lib/database.types";

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
    let channel: ReturnType<typeof supabase.channel> | null = null;
    getActiveUserId().then((uid) => {
      channel = supabase
        .channel(`health-realtime-${uid}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "health_metrics",
            filter: `user_id=eq.${uid}`,
          },
          () => { refetch(); }
        )
        .subscribe();
    });
    return () => {
      if (channel) supabase.removeChannel(channel);
    };
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
    let channel: ReturnType<typeof supabase.channel> | null = null;
    getActiveUserId().then((uid) => {
      channel = supabase
        .channel(`workouts-realtime-${uid}`)
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "workouts", filter: `user_id=eq.${uid}` },
          () => { refetch(); }
        )
        .subscribe();
    });
    return () => {
      if (channel) supabase.removeChannel(channel);
    };
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

export function useUpdateWorkout() {
  const [saving, setSaving] = useState(false);
  const update = useCallback(async (id: string, updates: Partial<Workout>) => {
    setSaving(true);
    const result = await updateWorkoutDb(id, updates);
    setSaving(false);
    return result;
  }, []);

  const remove = useCallback(async (id: string) => {
    setSaving(true);
    const result = await deleteWorkoutDb(id);
    setSaving(false);
    return result;
  }, []);

  return { updateWorkout: update, deleteWorkout: remove, saving };
}

export function useWorkoutProgram() {
  const [program, setProgram] = useState<WorkoutProgram | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      const active = await getActiveWorkoutProgram();
      setProgram(active);
    } catch (err) {
      console.warn("[useWorkoutProgram] fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
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

  const save = async (data: Parameters<typeof saveWorkoutProgram>[0]) => {
    const saved = await saveWorkoutProgram(data);
    setProgram(saved);
    return saved;
  };

  const remove = async (id: string) => {
    await deleteWorkoutProgram(id);
    setProgram(null);
  };

  return { program, loading, refetch: refresh, saveProgram: save, deleteProgram: remove };
}

export function useWorkoutCompletions(dateStr?: string) {
  const [completions, setCompletions] = useState<WorkoutExerciseCompletion[]>(() =>
    typeof window !== "undefined" ? getWorkoutCompletions(dateStr) : []
  );

  const refresh = useCallback(() => {
    setCompletions(getWorkoutCompletions(dateStr));
  }, [dateStr]);

  useEffect(() => {
    refresh();
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

  const toggle = async (exerciseId: string, workoutDayId: string) => {
    const updated = await toggleWorkoutExerciseCompletion(exerciseId, workoutDayId, dateStr);
    refresh();
    return updated;
  };

  return { completions, toggleCompletion: toggle, refetch: refresh };
}

export function useWorkoutHeatmap() {
  return useAsync(getWorkoutHeatmapData);
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
        session_date: todayStr(),
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
  const { data, loading, error, refetch } = useAsync(getLatestSleep);

  useEffect(() => {
    let channel: ReturnType<typeof supabase.channel> | null = null;
    getActiveUserId().then((uid) => {
      channel = supabase
        .channel(`sleep-realtime-${uid}`)
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "sleep_logs", filter: `user_id=eq.${uid}` },
          () => { refetch(); }
        )
        .subscribe();
    });
    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, [refetch]);

  return { data, loading, error, refetch };
}

export function useWeeklySleep() {
  return useAsync(getWeeklySleep);
}

export function useSleepHistory(days = 30) {
  const fetcher = useCallback(() => getSleepHistory(days), [days]);
  return useAsync(fetcher);
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

export function useAiProfile() {
  const [profile, setProfile] = useState<AiUserProfile>(() =>
    typeof window !== "undefined" ? getAiProfile() : {
      goals: [],
      preferredWakeTime: "06:30",
      preferredSleepTime: "22:45",
      availableDailyTimeMinutes: 180,
      preferredWorkoutStyle: "hybrid",
      planningStyle: "structured",
      motivationStyle: "analytical",
      difficultyPreference: "gradual",
      preferredSessionDurationMin: 45,
      schedulePreferences: "",
      currentPriorities: [],
      personalizationEnabled: true,
    }
  );

  const refresh = useCallback(() => {
    setProfile(getAiProfile());
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

  const update = useCallback((updates: Partial<AiUserProfile>) => {
    const updated = updateAiProfileDb(updates);
    setProfile(updated);
    return updated;
  }, []);

  const togglePersonalization = useCallback((enabled: boolean) => {
    const updated = setAiPersonalizationDb(enabled);
    setProfile(updated);
    return updated;
  }, []);

  return { profile, updateProfile: update, togglePersonalization, refetch: refresh };
}

// ─────────────────────────────────────────────────────────
// GOALS
// ─────────────────────────────────────────────────────────
export function useGoals() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);

  const fetchGoals = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getGoals();
      setGoals(data);
    } catch (err: any) {
      console.warn("[useGoals] Query error:", err);
      setError(err?.message || "Unable to load strategic goals from database.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  const updateProgress = useCallback(
    async (goalId: string, progress: number) => {
      const cleanProgress = Math.round(Number(progress));
      if (isNaN(cleanProgress) || cleanProgress < 0 || cleanProgress > 100) {
        throw new Error("Progress must be between 0 and 100");
      }

      // Optimistic update
      const previousGoals = [...goals];
      setGoals((prev) =>
        prev.map((g) => (g.id === goalId ? { ...g, progress: cleanProgress } : g))
      );
      setUpdating(goalId);

      try {
        const result = await updateGoalProgress(goalId, cleanProgress);
        if (!result) throw new Error("Database returned null when saving progress");
        setGoals((prev) =>
          prev.map((g) => (g.id === goalId ? result : g))
        );
      } catch (err: any) {
        // Rollback optimistic update
        setGoals(previousGoals);
        throw err;
      } finally {
        setUpdating(null);
      }
    },
    [goals]
  );

  const editGoal = useCallback(
    async (goalId: string, updates: Partial<Omit<Goal, "id" | "user_id" | "created_at">>) => {
      setUpdating(goalId);
      try {
        const result = await updateGoal(goalId, updates);
        if (result) {
          setGoals((prev) =>
            prev.map((g) => (g.id === goalId ? result : g))
          );
        }
        return result;
      } finally {
        setUpdating(null);
      }
    },
    []
  );

  const removeGoal = useCallback(
    async (goalId: string) => {
      setUpdating(goalId);
      try {
        const success = await deleteGoal(goalId);
        if (success) {
          setGoals((prev) => prev.filter((g) => g.id !== goalId));
        }
        return success;
      } finally {
        setUpdating(null);
      }
    },
    []
  );

  useEffect(() => {
    let channel: ReturnType<typeof supabase.channel> | null = null;
    getActiveUserId().then((uid) => {
      channel = supabase
        .channel(`goals-realtime-${uid}`)
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "goals", filter: `user_id=eq.${uid}` },
          () => { fetchGoals(); }
        )
        .subscribe();
    });
    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, [fetchGoals]);

  return {
    goals,
    loading,
    error,
    refetch: fetchGoals,
    updateProgress,
    editGoal,
    deleteGoal: removeGoal,
    updating,
  };
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
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(() => {
    setHabits(getHabits());
  }, []);

  useEffect(() => {
    // Initial remote background sync with Supabase tables
    let isMounted = true;
    setLoading(true);
    fetchHabitsWithLogsAsync()
      .then((data) => {
        if (isMounted) {
          setHabits(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.warn("[useHabits] Remote sync error, keeping local habits:", err);
        if (isMounted) setLoading(false);
      });

    const handleUpdate = () => refresh();
    if (typeof window !== "undefined") {
      window.addEventListener("lifesync-db-update", handleUpdate);
    }
    return () => {
      isMounted = false;
      if (typeof window !== "undefined") {
        window.removeEventListener("lifesync-db-update", handleUpdate);
      }
    };
  }, [refresh]);

  const toggle = (id: string, dateStr?: string) => {
    const previous = [...habits];
    try {
      setError(null);
      const updated = toggleHabitDb(id, dateStr);
      setHabits(updated);
    } catch (err: any) {
      console.error("[useHabits] Toggle failed, rolling back:", err);
      setHabits(previous);
      setError("Couldn't save your progress. Please retry.");
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("lifesync-toast", {
            detail: { message: "Couldn't save your progress. Please retry.", type: "error" },
          })
        );
      }
    }
  };

  const setStatus = (id: string, status: "COMPLETED" | "FROZEN" | "MISSED", dateStr?: string) => {
    const previous = [...habits];
    try {
      setError(null);
      const updated = setHabitStatusDb(id, status, dateStr);
      setHabits(updated);
    } catch (err: any) {
      console.error("[useHabits] SetStatus failed, rolling back:", err);
      setHabits(previous);
      setError("Couldn't save your progress. Please retry.");
    }
  };

  const add = (newHabit: Omit<Habit, "id" | "streak" | "completedToday" | "todayStatus">) => {
    const updated = addHabitDb(newHabit);
    setHabits(updated);
  };

  const update = (id: string, updatedFields: Partial<Habit>) => {
    const updated = updateHabitDb(id, updatedFields);
    setHabits(updated);
  };

  const remove = (id: string) => {
    const updated = deleteHabitDb(id);
    setHabits(updated);
  };

  return {
    habits,
    loading,
    error,
    toggleHabit: toggle,
    setHabitStatus: setStatus,
    addHabit: add,
    updateHabit: update,
    deleteHabit: remove,
    refetch: refresh,
  };
}

export function useHydration() {
  const [hydration, setHydration] = useState<HydrationLog>(() =>
    typeof window !== "undefined"
      ? getHydration()
      : { amountMl: 0, targetMl: 2500, lastUpdated: null }
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(() => {
    setHydration(getHydration());
  }, []);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    fetchFuelDataAsync()
      .then((data) => {
        if (isMounted) {
          setHydration(data.hydration);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.warn("[useHydration] Remote sync error:", err);
        if (isMounted) setLoading(false);
      });

    const handleUpdate = () => refresh();
    if (typeof window !== "undefined") {
      window.addEventListener("lifesync-db-update", handleUpdate);
    }
    return () => {
      isMounted = false;
      if (typeof window !== "undefined") {
        window.removeEventListener("lifesync-db-update", handleUpdate);
      }
    };
  }, [refresh]);

  const addWater = (amountMl: number) => {
    const previous = { ...hydration };
    try {
      setError(null);
      const updated = addWaterDb(amountMl);
      setHydration(updated);
    } catch (err) {
      console.error("[useHydration] addWater failed, rolling back:", err);
      setHydration(previous);
      setError("Failed to save hydration. Please retry.");
    }
  };

  return { hydration, addWater, loading, error, refetch: refresh };
}

export function useNutrition() {
  const [meals, setMeals] = useState<MealLog[]>(() =>
    typeof window !== "undefined" ? getTodayMeals() : []
  );
  const [allMeals, setAllMeals] = useState<MealLog[]>(() =>
    typeof window !== "undefined" ? getAllMeals() : []
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(() => {
    setMeals(getTodayMeals());
    setAllMeals(getAllMeals());
  }, []);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    fetchFuelDataAsync()
      .then((data) => {
        if (isMounted) {
          setMeals(data.meals);
          setAllMeals(getAllMeals());
          setLoading(false);
        }
      })
      .catch((err) => {
        console.warn("[useNutrition] Remote sync error:", err);
        if (isMounted) setLoading(false);
      });

    const handleUpdate = () => refresh();
    if (typeof window !== "undefined") {
      window.addEventListener("lifesync-db-update", handleUpdate);
    }
    return () => {
      isMounted = false;
      if (typeof window !== "undefined") {
        window.removeEventListener("lifesync-db-update", handleUpdate);
      }
    };
  }, [refresh]);

  const logMeal = (meal: Omit<MealLog, "id" | "loggedAt">) => {
    const prevMeals = [...meals];
    const prevAllMeals = [...allMeals];
    try {
      setError(null);
      const updatedToday = logMealDb(meal);
      setMeals(updatedToday);
      setAllMeals(getAllMeals());
    } catch (err) {
      console.error("[useNutrition] logMeal failed, rolling back:", err);
      setMeals(prevMeals);
      setAllMeals(prevAllMeals);
      setError("Failed to log meal. Please retry.");
    }
  };

  const updateMeal = (id: string, updatedFields: Partial<MealLog>) => {
    const prevMeals = [...meals];
    const prevAllMeals = [...allMeals];
    try {
      setError(null);
      const updatedToday = updateMealDb(id, updatedFields);
      setMeals(updatedToday);
      setAllMeals(getAllMeals());
    } catch (err) {
      console.error("[useNutrition] updateMeal failed, rolling back:", err);
      setMeals(prevMeals);
      setAllMeals(prevAllMeals);
      setError("Failed to update meal.");
    }
  };

  const deleteMeal = (id: string) => {
    const prevMeals = [...meals];
    const prevAllMeals = [...allMeals];
    try {
      setError(null);
      const updatedToday = deleteMealDb(id);
      setMeals(updatedToday);
      setAllMeals(getAllMeals());
    } catch (err) {
      console.error("[useNutrition] deleteMeal failed, rolling back:", err);
      setMeals(prevMeals);
      setAllMeals(prevAllMeals);
      setError("Failed to delete meal.");
    }
  };

  const totalCalories = meals.reduce((s, m) => s + (Number(m.calories) || 0), 0);
  const totalProtein = meals.reduce((s, m) => s + (Number(m.proteinG) || 0), 0);
  const totalCarbs = meals.reduce((s, m) => s + (Number(m.carbsG) || 0), 0);
  const totalFats = meals.reduce((s, m) => s + (Number(m.fatsG) || 0), 0);

  return {
    meals,
    allMeals,
    loading,
    error,
    logMeal,
    updateMeal,
    deleteMeal,
    refetch: refresh,
    stats: { totalCalories, totalProtein, totalCarbs, totalFats },
  };
}

