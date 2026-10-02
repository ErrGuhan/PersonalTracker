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
  Dumbbell, BookOpen, Moon, Activity, Utensils, Flame, Clock,
  ChevronRight, Heart, ShieldCheck,
} from "lucide-react";

const Sk = ({ w = "w-12", h = "h-5" }: { w?: string; h?: string }) => (
  <span className={`ion-skeleton inline-block rounded ${w} ${h}`} />
);

export default function DashboardView() {
  const router = useRouter();
  const { openWorkoutModal, openStudyModal, openSleepModal, openVitalsModal, openNutritionModal } = useModals();

  const { metrics, loading: mLoading }          = useHealthMetrics();
  const { data: weeklyStats, loading: wLoading } = useWeeklyWorkoutStats();
  const { data: studyStats, loading: sLoading }  = useStudyStats();
  const { data: sleepData, loading: slLoading }  = useLatestSleep();
  const { workouts, loading: wListLoading }       = useRecentWorkouts(3);
  const { submitMood, moodScore }                 = useLatestMood();
  const [activeWorkout, setActiveWorkout]         = useState<Workout | null>(null);

  const recoveryScore = metrics?.recovery_score ?? 78;
  const studyMins     = studyStats?.todayMinutes ?? 0;
  const calsBurned    = metrics?.calories_burned ?? weeklyStats?.totalCalories ?? 0;
  const sleepHrs      = sleepData?.hours ?? 0;

  // Ring fill fractions (0–1)
  const studyFrac   = Math.min(studyMins / 240, 1);
  const burnFrac    = Math.min((calsBurned ?? 0) / 2500, 1);
  const sleepFrac   = Math.min(sleepHrs / 8, 1);

  // Recovery status
  const rLabel = recoveryScore >= 80 ? "Optimal" : recoveryScore >= 60 ? "Balanced" : "Recovery";
  const rColor = recoveryScore >= 80 ? "text-cyan-400" : recoveryScore >= 60 ? "text-emerald-400" : "text-amber-400";
  const rBg    = recoveryScore >= 80 ? "bg-cyan-400/10 border-cyan-400/25" : recoveryScore >= 60 ? "bg-emerald-400/10 border-emerald-400/25" : "bg-amber-400/10 border-amber-400/25";

  // Quick-log items
  const quickLogs = [
    { label: "Workout", icon: Dumbbell, color: "text-amber-400", bg: "bg-amber-500/12 border-amber-500/20", fn: openWorkoutModal },
    { label: "Study",   icon: BookOpen, color: "text-cyan-400",  bg: "bg-cyan-500/12 border-cyan-500/20",   fn: openStudyModal   },
    { label: "Sleep",   icon: Moon,     color: "text-violet-300",bg: "bg-violet-500/12 border-violet-500/20",fn: openSleepModal   },
    { label: "Vitals",  icon: Activity, color: "text-rose-400",  bg: "bg-rose-500/12 border-rose-500/20",    fn: openVitalsModal  },
    { label: "Meal",    icon: Utensils, color: "text-emerald-400",bg:"bg-emerald-500/12 border-emerald-500/20",fn:openNutritionModal},
  ];

  return (
    <>
      <AnimatePresence>
        {activeWorkout && (
          <WorkoutDetailModal workout={activeWorkout} onClose={() => setActiveWorkout(null)} />
        )}
      </AnimatePresence>

      <div className="flex flex-col gap-5 w-full pt-3">

        {/* ── Recovery + Rings Hero ── */}
        <section className="m3-surface-glass rounded-2xl p-5 relative overflow-hidden">
          {/* Ambient glows */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/[0.06] rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-violet-500/[0.04] rounded-full blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-center">
            {/* Triple rings */}
            <div className="flex flex-col items-center gap-3">
              <div className="relative w-44 h-44 sm:w-52 sm:h-52 flex items-center justify-center">
                {/* Outer: Study/cyan */}
                <svg className="absolute inset-0 w-full h-full m3-ring" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="44" fill="none" className="m3-ring-track" strokeWidth="5" />
                  <circle
                    className="m3-ring-cyan"
                    cx="50" cy="50" r="44" fill="none" strokeWidth="5"
                    strokeDasharray="276.5"
                    strokeDashoffset={276.5 - studyFrac * 276.5}
                    strokeLinecap="round"
                  />
                </svg>
                {/* Middle: Burn/orange */}
                <svg className="absolute inset-3.5 w-[calc(100%-1.75rem)] h-[calc(100%-1.75rem)] m3-ring" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="44" fill="none" className="m3-ring-track" strokeWidth="5" />
                  <circle
                    className="m3-ring-orange"
                    cx="50" cy="50" r="44" fill="none" strokeWidth="5"
                    strokeDasharray="276.5"
                    strokeDashoffset={276.5 - burnFrac * 276.5}
                    strokeLinecap="round"
                  />
                </svg>
                {/* Inner: Sleep/violet */}
                <svg className="absolute inset-7 w-[calc(100%-3.5rem)] h-[calc(100%-3.5rem)] m3-ring" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="44" fill="none" className="m3-ring-track" strokeWidth="5" />
                  <circle
                    className="m3-ring-violet"
                    cx="50" cy="50" r="44" fill="none" strokeWidth="5"
                    strokeDasharray="276.5"
                    strokeDashoffset={276.5 - sleepFrac * 276.5}
                    strokeLinecap="round"
                  />
                </svg>
                {/* Center badge */}
                <div className="z-10 flex flex-col items-center text-center bg-[#0f131c]/85 backdrop-blur-md rounded-full w-24 h-24 justify-center border border-white/10">
                  {mLoading ? <Sk w="w-10" h="h-7" /> : (
                    <span className="text-3xl font-black text-white leading-none">{recoveryScore}</span>
                  )}
                  <span className="text-[9px] font-mono text-cyan-400 font-bold uppercase tracking-widest mt-0.5">Recovery</span>
                </div>
              </div>

              {/* Ring legend */}
              <div className="flex items-center gap-4 text-[10px] font-mono text-slate-400">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_5px_#4cd7f6]" />Study {studyMins}m</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-orange-500 shadow-[0_0_5px_#ec6a06]" />Burn {calsBurned}k</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-violet-400 shadow-[0_0_5px_#b395ff]" />Sleep {sleepHrs}h</span>
              </div>
            </div>

            {/* Vitals summary */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <span className={`m3-chip ${rBg} ${rColor} text-[11px]`}>{rLabel}</span>
                <span className="m3-chip text-[11px]">Day Readiness</span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {[
                  { icon: Heart,       label: "HR",   value: metrics?.heart_rate ?? 68, unit: "bpm", col: "text-rose-400" },
                  { icon: Activity,    label: "HRV",  value: metrics?.hrv_ms ?? 54,    unit: "ms",  col: "text-cyan-400" },
                  { icon: ShieldCheck, label: "SpO₂", value: metrics?.spo2 ?? 98,      unit: "%",   col: "text-emerald-400" },
                ].map(({ icon: Icon, label, value, unit, col }) => (
                  <div key={label} className="m3-surface-inset p-3 flex flex-col gap-0.5">
                    <div className="flex items-center gap-1 text-slate-400">
                      <Icon className={`w-3 h-3 ${col}`} />
                      <span className="text-[9px] font-mono uppercase tracking-wider">{label}</span>
                    </div>
                    {mLoading ? <Sk w="w-10" h="h-5" /> : (
                      <span className="text-base font-bold text-white font-mono">
                        {value}<span className="text-[9px] text-slate-400 font-normal ml-0.5">{unit}</span>
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Quick Log Chips ── */}
        <section>
          <div className="flex items-center gap-2 flex-wrap">
            {quickLogs.map(({ label, icon: Icon, color, bg, fn }) => (
              <button
                key={label}
                onClick={fn}
                className={`m3-chip ${bg} ${color} m3-interactive`}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </button>
            ))}
          </div>
        </section>

        {/* ── KPI Row ── */}
        <section className="grid grid-cols-3 gap-3">
          {[
            { icon: Clock,  value: studyMins,  unit: "m",    label: "Focus",    loading: sLoading,  color: "text-cyan-400",   bg: "bg-cyan-400/10"   },
            { icon: Flame,  value: calsBurned, unit: "kcal", label: "Burned",   loading: wLoading,  color: "text-amber-400",  bg: "bg-amber-400/10"  },
            { icon: Moon,   value: sleepHrs,   unit: "h",    label: "Sleep",    loading: slLoading, color: "text-violet-300", bg: "bg-violet-400/10" },
          ].map(({ icon: Icon, value, unit, label, loading, color, bg }) => (
            <div key={label} className="ion-kpi-tile">
              <div className={`w-7 h-7 rounded-xl ${bg} flex items-center justify-center ${color}`}>
                <Icon className="w-3.5 h-3.5" />
              </div>
              {loading ? <Sk w="w-10" h="h-6" /> : (
                <span className="text-xl font-black text-white font-mono">
                  {value}<span className="text-[10px] font-normal text-slate-400 ml-0.5">{unit}</span>
                </span>
              )}
              <span className="text-[9px] font-mono uppercase tracking-wider text-slate-400">{label}</span>
            </div>
          ))}
        </section>

        {/* ── Habits + Hydration ── */}
        <div className="grid grid-cols-1 lg:grid-cols-7 gap-4">
          <div className="lg:col-span-4"><HabitTrackerWidget /></div>
          <div className="lg:col-span-3"><HydrationWidget /></div>
        </div>

        {/* ── Recent Workouts ── */}
        <section className="m3-surface-glass rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-amber-500/15 flex items-center justify-center text-amber-400">
                <Dumbbell className="w-3.5 h-3.5" />
              </div>
              <h3 className="font-semibold text-sm text-white">Recent Workouts</h3>
            </div>
            <button
              onClick={() => router.push("/fit")}
              className="flex items-center gap-0.5 text-xs text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer font-medium"
            >
              All <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <ul className="space-y-2">
            {wListLoading ? (
              [0,1,2].map(i => (
                <li key={i} className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.04] flex items-center gap-3">
                  <Sk w="w-9" h="h-9" />
                  <div className="flex-1 flex flex-col gap-1.5"><Sk w="w-32" h="h-3.5" /><Sk w="w-20" h="h-3" /></div>
                </li>
              ))
            ) : workouts.length === 0 ? (
              <li className="py-8 text-center text-xs text-slate-500">No workouts logged yet.</li>
            ) : (
              workouts.map(w => (
                <li
                  key={w.id}
                  onClick={() => setActiveWorkout(w)}
                  className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.04] hover:border-cyan-400/20 cursor-pointer transition-all group"
                >
                  <div className="w-8 h-8 rounded-lg bg-amber-500/15 flex items-center justify-center text-amber-400 shrink-0 group-hover:scale-105 transition-transform">
                    <Dumbbell className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{w.name}</p>
                    <p className="text-[10px] text-slate-400 font-mono">{w.duration_min}min · {w.calories}kcal</p>
                  </div>
                  <span className="text-[10px] text-amber-400 font-mono font-semibold shrink-0">{w.workout_date}</span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 transition-colors shrink-0" />
                </li>
              ))
            )}
          </ul>
        </section>

        {/* ── Mood Check-In ── */}
        <section className="m3-surface-glass rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm text-white">Mood</h3>
            {moodScore && (
              <span className="m3-chip m3-chip-selected text-[10px] py-0.5 px-2">
                {moodScore}/5
              </span>
            )}
          </div>
          <MoodSelector initialScore={moodScore ?? undefined} onSelect={submitMood} />
        </section>

      </div>
    </>
  );
}
