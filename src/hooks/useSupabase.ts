"use client";
// ─── LifeSync OS — Supabase React Hooks ──────────────────
// Custom hooks that fetch data, handle loading/error states,
// and subscribe to realtime changes.

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
  getWeeklySleep,
  getGoals,
  updateGoalProgress,
  logWorkout,
  logStudySession,
  DEMO_USER_ID,
  type StudyStats,
} from "@/lib/db";
import type { HealthMetric, Workout, Goal, SleepLog, MoodLog } from "@/lib/database.types";

// ─────────────────────────────────────────────────────────
// Generic async hook factory
// ─────────────────────────────────────────────────────────
function useAsync<T>(fetcher: () => Promise<T>, deps: React.DependencyList = []) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetcher();
      setData(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => { fetch(); }, [fetch]);
  return { data, loading, error, refetch: fetch };
}

// ─────────────────────────────────────────────────────────
// HEALTH METRICS
// ─────────────────────────────────────────────────────────
export function useHealthMetrics() {
  const { data, loading, error, refetch } = useAsync(getLatestHealthMetrics);

  // Realtime subscription for live metric updates
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
  return useAsync(() => getHealthMetricHistory(days), [days]);
}

// ─────────────────────────────────────────────────────────
// WORKOUTS
// ─────────────────────────────────────────────────────────
export function useRecentWorkouts(limit = 5) {
  const { data, loading, error, refetch } = useAsync(
    () => getRecentWorkouts(limit),
    [limit]
  );

  // Realtime: refresh list on new workout insert
  useEffect(() => {
    const channel = supabase
      .channel("workouts-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "workouts",
          filter: `user_id=eq.${DEMO_USER_ID}` },
        () => { refetch(); }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [refetch]);

  return { workouts: data ?? [], loading, error, refetch };
}

export interface WeeklyWorkoutStats {
  totalCalories: number;
  totalMinutes: number;
  totalDistance: number;
  dailyCalories: number[];
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
// STUDY
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

  // Realtime: refresh goals on update
  useEffect(() => {
    const channel = supabase
      .channel("goals-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "goals",
          filter: `user_id=eq.${DEMO_USER_ID}` },
        () => { refetch(); }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [refetch]);

  return { goals: data ?? [], loading, error, refetch, updateProgress, updating };
}
