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
import {
  Dumbbell,
  BookOpen,
  Moon,
  Activity,
  Utensils,
  Flame,
  Clock,
  ChevronRight,
  Heart,
  ShieldCheck,
  TrendingUp,
  Sparkles,
} from "lucide-react";

// Pure CSS shimmer skeleton
const SkeletonCard = () => (
  <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/[0.06] shadow-md overflow-hidden relative h-[90px] flex flex-col gap-2.5">
    <div className="skeleton-shimmer h-4 w-2/5" />
    <div className="skeleton-shimmer h-3 w-4/5" />
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

  const recoveryScore = metrics?.recovery_score ?? 78;
  const studyMins = studyStats?.todayMinutes ?? 0;
  const workoutCals = weeklyStats?.totalCalories ?? 0;
  const sleepHrs = sleepData?.hours ?? 0;
  const calsBurned = metrics?.calories_burned ?? workoutCals;

  // Recovery status classification
  const recoveryStatus =
    recoveryScore >= 80
      ? { label: "Optimal State", color: "text-cyan-400", bg: "bg-cyan-400/10", border: "border-cyan-400/20" }
      : recoveryScore >= 60
      ? { label: "Balanced", color: "text-emerald-400", bg: "bg-emerald-400/10", border: "border-emerald-400/20" }
      : { label: "Recovery Needed", color: "text-amber-400", bg: "bg-amber-400/10", border: "border-amber-400/20" };

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

      <div className="flex flex-col gap-6 sm:gap-8 w-full animate-fadeIn">
        {/* ─── Hero Performance Bento Card ─── */}
        <section className="liquid-glass rounded-3xl p-5 sm:p-7 relative overflow-hidden border border-white/[0.08] shadow-2xl">
          {/* Subtle Ambient Refractive Highlights */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/[0.07] rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 w-60 h-60 bg-purple-500/[0.05] rounded-full blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Left: Interactive Triple Circular Gauge */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center relative">
              <div className="relative w-52 h-52 sm:w-60 sm:h-60 flex items-center justify-center">
                {/* Outer Ring: Focus / Study (Cyan) */}
                <svg className="absolute inset-0 w-full h-full circular-progress" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" fill="none" r="45" stroke="rgba(255,255,255,0.06)" strokeWidth="4" />
                  <circle
                    className="living-ring-cyan drop-shadow-[0_0_8px_rgba(76,215,246,0.4)]"
                    cx="50" cy="50" fill="none" r="45" strokeWidth="4"
                    strokeDasharray="282.7"
                    strokeDashoffset={282.7 - Math.min(studyMins / 240, 1) * 282.7}
                    strokeLinecap="round"
                  />
                </svg>

                {/* Middle Ring: Fitness / Burn (Orange) */}
                <svg className="absolute inset-3 sm:inset-3.5 w-[calc(100%-1.5rem)] sm:w-[calc(100%-1.75rem)] h-[calc(100%-1.5rem)] sm:h-[calc(100%-1.75rem)] circular-progress" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" fill="none" r="40" stroke="rgba(255,255,255,0.06)" strokeWidth="4" />
                  <circle
                    className="living-ring-orange drop-shadow-[0_0_8px_rgba(236,106,6,0.4)]"
                    cx="50" cy="50" fill="none" r="40" strokeWidth="4"
                    strokeDasharray="251.2"
                    strokeDashoffset={251.2 - Math.min((calsBurned || 0) / 2500, 1) * 251.2}
                    strokeLinecap="round"
                  />
                </svg>

                {/* Inner Ring: Rest / Sleep (Violet) */}
                <svg className="absolute inset-6 sm:inset-7 w-[calc(100%-3rem)] sm:w-[calc(100%-3.5rem)] h-[calc(100%-3rem)] sm:h-[calc(100%-3.5rem)] circular-progress" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" fill="none" r="35" stroke="rgba(255,255,255,0.06)" strokeWidth="4" />
                  <circle
                    className="living-ring-violet drop-shadow-[0_0_6px_rgba(179,149,255,0.35)]"
                    cx="50" cy="50" fill="none" r="35" strokeWidth="4"
                    strokeDasharray="219.9"
                    strokeDashoffset={219.9 - Math.min(sleepHrs / 8, 1) * 219.9}
                    strokeLinecap="round"
                  />
                </svg>

                {/* Center Recovery Core Badge */}
                <div className="flex flex-col items-center justify-center text-center z-10 bg-[#101622]/90 backdrop-blur-md rounded-full w-28 h-28 sm:w-32 sm:h-32 border border-white/10 shadow-lg">
                  {mLoading ? (
                    <div className="skeleton-shimmer w-10 h-6 rounded" />
                  ) : (
                    <span className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                      {recoveryScore}
                    </span>
                  )}
                  <span className="font-mono text-[9px] text-cyan-400 font-bold uppercase tracking-widest mt-0.5">
                    RECOVERY
                  </span>
                </div>
              </div>

              {/* Gauge Legend */}
              <div className="flex items-center gap-3.5 mt-3 text-[10px] font-mono text-slate-300">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_6px_#4cd7f6]" />
                  <span>Focus ({studyMins}m)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_6px_#ec6a06]" />
                  <span>Burn ({calsBurned}k)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-purple-300 shadow-[0_0_6px_#b395ff]" />
                  <span>Rest ({sleepHrs}h)</span>
                </div>
              </div>
            </div>

            {/* Right: Daily Readiness & Key Insights */}
            <div className="lg:col-span-7 flex flex-col justify-between gap-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-white/[0.05] border border-white/[0.08] text-slate-300">
                      Daily Readiness
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider ${recoveryStatus.bg} ${recoveryStatus.color} border ${recoveryStatus.border}`}
                    >
                      {recoveryStatus.label}
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                    Body & Mind in Rhythm
                  </h2>
                  <p className="text-xs text-slate-400 mt-1 max-w-md leading-relaxed">
                    Circadian sync is strong today. Your cardiovascular readiness is prepared for high-intensity physical output or deep cognitive focus.
                  </p>
                </div>
              </div>

              {/* Real-time Vitals Readout Bar */}
              <div className="grid grid-cols-3 gap-2.5 pt-3 border-t border-white/[0.06]">
                <div className="liquid-glass-subtle rounded-xl p-2.5 sm:p-3 flex flex-col gap-0.5">
                  <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-mono">
                    <Heart className="w-3 h-3 text-red-400" />
                    <span>RESTING HR</span>
                  </div>
                  <span className="text-base sm:text-lg font-bold text-white font-mono">
                    {metrics?.heart_rate ?? 68} <span className="text-[10px] text-slate-400 font-normal">BPM</span>
                  </span>
                </div>

                <div className="liquid-glass-subtle rounded-xl p-2.5 sm:p-3 flex flex-col gap-0.5">
                  <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-mono">
                    <Activity className="w-3 h-3 text-cyan-400" />
                    <span>HRV SCORE</span>
                  </div>
                  <span className="text-base sm:text-lg font-bold text-white font-mono">
                    {metrics?.hrv_ms ?? 54} <span className="text-[10px] text-slate-400 font-normal">MS</span>
                  </span>
                </div>

                <div className="liquid-glass-subtle rounded-xl p-2.5 sm:p-3 flex flex-col gap-0.5">
                  <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-mono">
                    <ShieldCheck className="w-3 h-3 text-emerald-400" />
                    <span>O₂ SAT</span>
                  </div>
                  <span className="text-base sm:text-lg font-bold text-white font-mono">
                    {metrics?.spo2 ?? 98} <span className="text-[10px] text-slate-400 font-normal">%</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── Quick 1-Tap Action Dock ─── */}
        <section>
          <div className="flex items-center justify-between mb-3 px-1">
            <span className="text-xs font-mono uppercase tracking-widest text-slate-400 font-bold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              Quick Capture
            </span>
            <span className="text-[10px] font-mono text-slate-400">1-Tap Fast Logging</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 sm:gap-3">
            <button
              onClick={openWorkoutModal}
              className="liquid-glass liquid-glass-interactive rounded-2xl p-3.5 flex flex-col items-start justify-between min-h-[96px] text-left border border-white/[0.08] group"
            >
              <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/25 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                <Dumbbell className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-xs text-white block">Log Workout</span>
                <span className="text-[10px] text-slate-400 font-mono">Sets, reps, cals</span>
              </div>
            </button>

            <button
              onClick={openStudyModal}
              className="liquid-glass liquid-glass-interactive rounded-2xl p-3.5 flex flex-col items-start justify-between min-h-[96px] text-left border border-white/[0.08] group"
            >
              <div className="w-8 h-8 rounded-xl bg-cyan-500/15 border border-cyan-500/25 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
                <BookOpen className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-xs text-white block">Log Study</span>
                <span className="text-[10px] text-slate-400 font-mono">Deep work focus</span>
              </div>
            </button>

            <button
              onClick={openSleepModal}
              className="liquid-glass liquid-glass-interactive rounded-2xl p-3.5 flex flex-col items-start justify-between min-h-[96px] text-left border border-white/[0.08] group"
            >
              <div className="w-8 h-8 rounded-xl bg-purple-500/15 border border-purple-500/25 flex items-center justify-center text-purple-300 group-hover:scale-110 transition-transform">
                <Moon className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-xs text-white block">Log Sleep</span>
                <span className="text-[10px] text-slate-400 font-mono">Duration & rest</span>
              </div>
            </button>

            <button
              onClick={openVitalsModal}
              className="liquid-glass liquid-glass-interactive rounded-2xl p-3.5 flex flex-col items-start justify-between min-h-[96px] text-left border border-white/[0.08] group"
            >
              <div className="w-8 h-8 rounded-xl bg-rose-500/15 border border-rose-500/25 flex items-center justify-center text-rose-400 group-hover:scale-110 transition-transform">
                <Activity className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-xs text-white block">Log Vitals</span>
                <span className="text-[10px] text-slate-400 font-mono">HR, HRV, SpO₂</span>
              </div>
            </button>

            <button
              onClick={openNutritionModal}
              className="liquid-glass liquid-glass-interactive rounded-2xl p-3.5 flex flex-col items-start justify-between min-h-[96px] text-left border border-white/[0.08] col-span-2 sm:col-span-1 group"
            >
              <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                <Utensils className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-xs text-white block">Log Meal</span>
                <span className="text-[10px] text-slate-400 font-mono">Macros & fuel</span>
              </div>
            </button>
          </div>
        </section>

        {/* ─── Metric KPI Summary Cards ─── */}
        <section className="grid grid-cols-3 gap-3">
          <div className="liquid-glass rounded-2xl p-4 flex flex-col items-center justify-center text-center">
            <div className="w-8 h-8 rounded-xl bg-cyan-400/10 flex items-center justify-center text-cyan-400 mb-1.5">
              <Clock className="w-4 h-4" />
            </div>
            <span className="text-xl sm:text-2xl text-white font-black font-mono">
              {sLoading ? <span className="skeleton-shimmer inline-block w-8 h-6" /> : studyMins}
              <span className="text-xs font-normal text-slate-400 ml-0.5">m</span>
            </span>
            <span className="font-mono text-[9.5px] text-slate-400 uppercase tracking-wider mt-0.5">
              Focus Today
            </span>
          </div>

          <div className="liquid-glass rounded-2xl p-4 flex flex-col items-center justify-center text-center">
            <div className="w-8 h-8 rounded-xl bg-amber-400/10 flex items-center justify-center text-amber-400 mb-1.5">
              <Flame className="w-4 h-4" />
            </div>
            <span className="text-xl sm:text-2xl text-white font-black font-mono">
              {wLoading ? <span className="skeleton-shimmer inline-block w-8 h-6" /> : calsBurned}
              <span className="text-xs font-normal text-slate-400 ml-0.5">kcal</span>
            </span>
            <span className="font-mono text-[9.5px] text-slate-400 uppercase tracking-wider mt-0.5">
              Calories Burned
            </span>
          </div>

          <div className="liquid-glass rounded-2xl p-4 flex flex-col items-center justify-center text-center">
            <div className="w-8 h-8 rounded-xl bg-purple-400/10 flex items-center justify-center text-purple-300 mb-1.5">
              <Moon className="w-4 h-4" />
            </div>
            <span className="text-xl sm:text-2xl text-white font-black font-mono">
              {slLoading ? <span className="skeleton-shimmer inline-block w-8 h-6" /> : sleepHrs}
              <span className="text-xs font-normal text-slate-400 ml-0.5">h</span>
            </span>
            <span className="font-mono text-[9.5px] text-slate-400 uppercase tracking-wider mt-0.5">
              Sleep Duration
            </span>
          </div>
        </section>

        {/* ─── Embedded Core Widgets (Habits & Hydration) ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7">
            <HabitTrackerWidget />
          </div>
          <div className="lg:col-span-5">
            <HydrationWidget />
          </div>
        </div>

        {/* ─── Recent Activity Log ─── */}
        <section className="liquid-glass rounded-3xl p-5 sm:p-6 flex flex-col gap-4 border border-white/[0.08]">
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-amber-500/15 flex items-center justify-center text-amber-400">
                <Dumbbell className="w-3.5 h-3.5" />
              </div>
              <h3 className="font-bold text-sm sm:text-base text-white">Recent Workout Activity</h3>
            </div>
            <button
              onClick={() => router.push("/fit")}
              className="text-xs text-cyan-400 hover:underline font-semibold cursor-pointer flex items-center gap-0.5"
            >
              <span>View Hub</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <ul className="space-y-2.5">
            {wListLoading ? (
              [0, 1, 2].map((idx) => <SkeletonCard key={`skel-${idx}`} />)
            ) : workouts.length === 0 ? (
              <div className="text-xs text-center py-8 text-slate-400">
                No recent workout activity recorded.
              </div>
            ) : (
              workouts.map((w) => (
                <li
                  key={w.id}
                  onClick={() => setActiveWorkout(w)}
                  className="flex items-center gap-3.5 p-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.05] hover:border-cyan-400/30 cursor-pointer transition-all duration-150 group"
                >
                  <div className="w-9 h-9 rounded-xl bg-amber-500/15 flex items-center justify-center text-amber-400 shrink-0 group-hover:scale-105 transition-transform">
                    <Dumbbell className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-bold text-white truncate">{w.name}</p>
                    <p className="text-[11px] text-slate-400 font-mono">
                      {w.duration_min} mins · {w.calories} kcal
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs text-amber-400 font-mono font-semibold">{w.workout_date}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 transition-colors" />
                  </div>
                </li>
              ))
            )}
          </ul>
        </section>

        {/* ─── Daily Mood & Wellness Check-In ─── */}
        <section className="liquid-glass rounded-3xl p-5 sm:p-6 border border-white/[0.08]">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-bold text-sm sm:text-base text-white">Daily Wellness Check-In</h3>
              <p className="text-xs text-slate-400">Log how you feel right now to calibrate recovery recommendations.</p>
            </div>
            {moodScore && (
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-cyan-400/10 text-cyan-300 border border-cyan-400/20">
                Logged: {moodScore}/5
              </span>
            )}
          </div>
          <MoodSelector initialScore={moodScore ?? undefined} onSelect={submitMood} />
        </section>
      </div>
    </>
  );
}
