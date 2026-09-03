"use client";

import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import WorkoutDetailModal from "@/components/WorkoutDetailModal";
import HabitTrackerWidget from "@/components/HabitTrackerWidget";
import HydrationWidget from "@/components/HydrationWidget";
import MoodSelector from "@/components/MoodSelector";
import { useModals } from "@/context/ModalContext";
import {
  useHealthMetrics,
  useRecentWorkouts,
  useWeeklyWorkoutStats,
  useStudyStats,
  useLatestMood,
  useLatestSleep,
} from "@/hooks/useSupabase";
import type { Workout } from "@/lib/database.types";

// Pure CSS shimmer skeleton — no Framer Motion infinite loops
const SkeletonCard = () => (
  <div className="p-5 rounded-2xl bg-white/5 border border-white/10 shadow-xl overflow-hidden relative h-[130px] flex flex-col gap-3">
    <div className="skeleton-shimmer h-6 w-3/4" />
    <div className="flex flex-col gap-2">
      <div className="skeleton-shimmer h-3.5 w-full" />
      <div className="skeleton-shimmer h-3.5 w-5/6" />
    </div>
  </div>
);

export default function DashboardView() {
  const router = useRouter();
  const {
    openWorkoutModal,
    openStudyModal,
    openSleepModal,
    openVitalsModal,
    openNutritionModal,
  } = useModals();

  const { metrics, loading: mLoading } = useHealthMetrics();
  const { data: weeklyStats, loading: wLoading } = useWeeklyWorkoutStats();
  const { data: studyStats, loading: sLoading } = useStudyStats();
  const { data: sleepData, loading: slLoading } = useLatestSleep();
  const { workouts, loading: wListLoading } = useRecentWorkouts(3);
  const { submitMood, moodScore } = useLatestMood();
  const [activeWorkout, setActiveWorkout] = useState<Workout | null>(null);

  const recoveryScore = metrics?.recovery_score ?? 0;
  const studyMins = studyStats?.todayMinutes ?? 0;
  const workoutCals = weeklyStats?.totalCalories ?? 0;
  const sleepHrs = sleepData?.hours ?? 0;
  const calsBurned = metrics?.calories_burned ?? workoutCals;

  return (
    <>
      <AnimatePresence>
        {activeWorkout && (
          <WorkoutDetailModal
            workout={activeWorkout}
            onClose={() => setActiveWorkout(null)}
          />
        )}
      </AnimatePresence>

      {/* Single fast fade-in on mount — no stagger, no spring, no scale */}
      <div className="flex flex-col gap-8 sm:gap-10 w-full max-w-full overflow-x-hidden pb-32 lg:pb-16 animate-fadeIn">

        {/* Hero Sync Ring HUD */}
        <section className="flex flex-col items-center justify-center py-4 relative">
          {/* Static ambient glow — no continuous animation */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-56 h-56 sm:w-72 sm:h-72 bg-primary/8 rounded-full blur-3xl pointer-events-none glow-cyan-active" />

          <div className="relative w-64 h-64 sm:w-72 sm:h-72 lg:w-80 lg:h-80 flex items-center justify-center">
            {/* Outer Ring: Study (Cyan) — data-driven transition only, no continuous animation */}
            <svg className="absolute inset-0 w-full h-full circular-progress" viewBox="0 0 100 100">
              <circle cx="50" cy="50" fill="none" r="45" stroke="rgba(255,255,255,0.06)" strokeWidth="4.5" />
              <circle
                className="living-ring-cyan drop-shadow-[0_0_8px_rgba(76,215,246,0.5)]"
                cx="50" cy="50" fill="none" r="45" strokeWidth="4.5"
                strokeDasharray="282.7"
                strokeDashoffset={282.7 - Math.min(studyMins / 240, 1) * 282.7}
                strokeLinecap="round"
              />
            </svg>

            {/* Middle Ring: Fitness (Orange) */}
            <svg className="absolute inset-3 sm:inset-4 w-[calc(100%-1.5rem)] sm:w-[calc(100%-2rem)] h-[calc(100%-1.5rem)] sm:h-[calc(100%-2rem)] circular-progress" viewBox="0 0 100 100">
              <circle cx="50" cy="50" fill="none" r="40" stroke="rgba(255,255,255,0.06)" strokeWidth="4.5" />
              <circle
                className="living-ring-orange drop-shadow-[0_0_8px_rgba(236,106,6,0.5)]"
                cx="50" cy="50" fill="none" r="40" strokeWidth="4.5"
                strokeDasharray="251.2"
                strokeDashoffset={251.2 - Math.min((calsBurned || 0) / 2500, 1) * 251.2}
                strokeLinecap="round"
              />
            </svg>

            {/* Inner Ring: Sleep (Violet) */}
            <svg className="absolute inset-6 sm:inset-8 w-[calc(100%-3rem)] sm:w-[calc(100%-4rem)] h-[calc(100%-3rem)] sm:h-[calc(100%-4rem)] circular-progress" viewBox="0 0 100 100">
              <circle cx="50" cy="50" fill="none" r="35" stroke="rgba(255,255,255,0.06)" strokeWidth="4.5" />
              <circle
                className="living-ring-violet drop-shadow-[0_0_6px_rgba(179,149,255,0.4)]"
                cx="50" cy="50" fill="none" r="35" strokeWidth="4.5"
                strokeDasharray="219.9"
                strokeDashoffset={219.9 - Math.min(sleepHrs / 8, 1) * 219.9}
                strokeLinecap="round"
              />
            </svg>

            {/* Center Recovery Score Badge — static glow, no box-shadow animation */}
            <div className="flex flex-col items-center justify-center text-center z-10 bg-surface-container/70 backdrop-blur-xl rounded-full w-32 h-32 sm:w-40 sm:h-40 border border-white/15 pulse-center">
              {mLoading ? (
                <div className="skeleton-shimmer w-12 h-8 rounded-md" />
              ) : (
                <span className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight drop-shadow-[0_0_8px_rgba(76,215,246,0.35)]">
                  {recoveryScore}
                </span>
              )}
              <span className="font-mono text-[10px] sm:text-xs text-primary font-bold tracking-widest uppercase mt-0.5">
                RECOVERY SCORE
              </span>
            </div>
          </div>

          {/* Legend Indicators */}
          <div className="flex items-center gap-4 mt-3 text-[11px] font-mono text-on-surface-variant">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-primary shadow-[0_0_6px_#4cd7f6]" />
              <span>Focus</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-secondary shadow-[0_0_6px_#ec6a06]" />
              <span>Burn</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-tertiary shadow-[0_0_6px_#b395ff]" />
              <span>Rest</span>
            </div>
          </div>
        </section>

        {/* Touch-Friendly Bento Actions — plain CSS hover/active, no Framer Motion */}
        <section className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <button
            onClick={openStudyModal}
            className="tilt-card glass-panel relative overflow-hidden rounded-2xl p-4 min-h-[110px] flex flex-col items-start justify-between text-left cursor-pointer border border-primary/20 hover:border-primary/50 hover:scale-[1.02] active:scale-[0.97] transition-transform duration-150"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/15 to-transparent opacity-80" />
            <span className="material-symbols-outlined text-primary text-3xl z-10" style={{ fontVariationSettings: "'FILL' 1" }}>
              menu_book
            </span>
            <span className="font-bold text-sm text-white z-10">Log Study</span>
          </button>

          <button
            onClick={openWorkoutModal}
            className="tilt-card glass-panel relative overflow-hidden rounded-2xl p-4 min-h-[110px] flex flex-col items-start justify-between text-left cursor-pointer border border-secondary/20 hover:border-secondary/50 hover:scale-[1.02] active:scale-[0.97] transition-transform duration-150"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-secondary/15 to-transparent opacity-80" />
            <span className="material-symbols-outlined text-secondary text-3xl z-10" style={{ fontVariationSettings: "'FILL' 1" }}>
              fitness_center
            </span>
            <span className="font-bold text-sm text-white z-10">Log Workout</span>
          </button>

          <button
            onClick={openSleepModal}
            className="tilt-card glass-panel relative overflow-hidden rounded-2xl p-4 min-h-[110px] flex flex-col items-start justify-between text-left cursor-pointer border border-tertiary/20 hover:border-tertiary/50 hover:scale-[1.02] active:scale-[0.97] transition-transform duration-150"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-tertiary/15 to-transparent opacity-80" />
            <span className="material-symbols-outlined text-tertiary text-3xl z-10" style={{ fontVariationSettings: "'FILL' 1" }}>
              bedtime
            </span>
            <span className="font-bold text-sm text-white z-10">Log Sleep</span>
          </button>

          <button
            onClick={openVitalsModal}
            className="tilt-card glass-panel relative overflow-hidden rounded-2xl p-4 min-h-[110px] flex flex-col items-start justify-between text-left cursor-pointer border border-primary/30 hover:border-primary/60 shadow-[0_0_12px_rgba(76,215,246,0.12)] hover:scale-[1.02] active:scale-[0.97] transition-transform duration-150"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent opacity-90" />
            <span className="material-symbols-outlined text-primary text-3xl z-10" style={{ fontVariationSettings: "'FILL' 1" }}>
              ecg_heart
            </span>
            <div>
              <span className="font-bold text-sm text-white z-10 block">Log Vitals</span>
              <span className="text-[10px] font-mono text-primary z-10">HR · HRV · SpO₂</span>
            </div>
          </button>

          <button
            onClick={openNutritionModal}
            className="tilt-card glass-panel relative overflow-hidden rounded-2xl p-4 min-h-[110px] flex flex-col items-start justify-between text-left cursor-pointer border border-secondary/20 hover:border-secondary/50 col-span-2 sm:col-span-1 hover:scale-[1.02] active:scale-[0.97] transition-transform duration-150"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-secondary/15 to-transparent opacity-80" />
            <span className="material-symbols-outlined text-secondary text-3xl z-10" style={{ fontVariationSettings: "'FILL' 1" }}>
              restaurant
            </span>
            <span className="font-bold text-sm text-white z-10">Log Meal</span>
          </button>
        </section>

        {/* KPI Tiles — plain divs, no motion wrappers */}
        <section className="grid grid-cols-3 gap-3">
          <div className="glass-panel rounded-2xl p-4 flex flex-col items-center justify-center text-center">
            <span className="material-symbols-outlined text-primary text-xl mb-1">timer</span>
            <span className="text-xl sm:text-2xl text-white font-extrabold">
              {sLoading ? <span className="skeleton-shimmer inline-block w-8 h-6" /> : studyMins}
              <span className="text-xs font-normal text-on-surface-variant ml-0.5">m</span>
            </span>
            <span className="font-mono text-[10px] text-on-surface-variant uppercase mt-0.5">Focus Today</span>
          </div>

          <div className="glass-panel rounded-2xl p-4 flex flex-col items-center justify-center text-center">
            <span className="material-symbols-outlined text-secondary text-xl mb-1">local_fire_department</span>
            <span className="text-xl sm:text-2xl text-white font-extrabold">
              {wLoading ? <span className="skeleton-shimmer inline-block w-8 h-6" /> : calsBurned}
              <span className="text-xs font-normal text-on-surface-variant ml-0.5">kcal</span>
            </span>
            <span className="font-mono text-[10px] text-on-surface-variant uppercase mt-0.5">Calories Burned</span>
          </div>

          <div className="glass-panel rounded-2xl p-4 flex flex-col items-center justify-center text-center">
            <span className="material-symbols-outlined text-tertiary text-xl mb-1">bedtime</span>
            <span className="text-xl sm:text-2xl text-white font-extrabold">
              {slLoading ? <span className="skeleton-shimmer inline-block w-8 h-6" /> : sleepHrs}
              <span className="text-xs font-normal text-on-surface-variant ml-0.5">h</span>
            </span>
            <span className="font-mono text-[10px] text-on-surface-variant uppercase mt-0.5">Sleep Duration</span>
          </div>
        </section>

        {/* Embedded Widgets */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7">
            <HabitTrackerWidget />
          </div>
          <div className="lg:col-span-5">
            <HydrationWidget />
          </div>
        </div>

        {/* Recent Activity */}
        <section className="glass-panel rounded-2xl p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h3 className="font-bold text-sm sm:text-base text-white">Recent Activity Output</h3>
            <button onClick={() => router.push("/fit")} className="text-xs text-primary hover:underline font-semibold cursor-pointer">
              View All
            </button>
          </div>

          <ul className="space-y-3">
            {wListLoading ? (
              [0, 1, 2].map((idx) => <SkeletonCard key={`skel-${idx}`} />)
            ) : workouts.length === 0 ? (
              <p className="text-xs text-center py-8 text-on-surface-variant">No activity logged yet.</p>
            ) : (
              workouts.map((w) => (
                <li
                  key={w.id}
                  onClick={() => setActiveWorkout(w)}
                  className="flex items-center gap-4 p-3.5 rounded-xl bg-surface-container-low/80 border border-white/5 shadow-md hover:border-cyan-500/40 cursor-pointer transition-colors duration-150 active:scale-[0.99]"
                >
                  <div className="w-10 h-10 rounded-full bg-secondary/15 flex items-center justify-center border border-secondary/30 text-secondary shrink-0">
                    <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>
                      fitness_center
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-bold text-white truncate">{w.name}</p>
                    <p className="text-[11px] text-on-surface-variant font-mono">
                      {w.duration_min} mins · {w.calories} kcal
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-xs text-secondary font-mono font-bold">{w.workout_date}</span>
                    <span className="material-symbols-outlined text-xs text-slate-500">chevron_right</span>
                  </div>
                </li>
              ))
            )}
          </ul>
        </section>

        {/* Mood Check-In */}
        <section className="glass-panel rounded-2xl p-5">
          <h3 className="font-bold text-sm sm:text-base text-white mb-3">Daily Mood & Wellness Check-In</h3>
          <MoodSelector initialScore={moodScore ?? undefined} onSelect={submitMood} />
        </section>
      </div>
    </>
  );
}
