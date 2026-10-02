"use client";

import { useState, useMemo } from "react";
import { AnimatePresence } from "framer-motion";
import {
  Dumbbell, Flame, Clock, Navigation, ChevronLeft, ChevronRight,
  Check, Plus, Sparkles, Calendar, Heart, RotateCcw,
} from "lucide-react";
import WorkoutDetailModal from "@/components/WorkoutDetailModal";
import FitnessHeatmap from "@/components/fitness/FitnessHeatmap";
import CreatePlanModal from "@/components/fitness/CreatePlanModal";
import LogWorkoutModal from "@/components/LogWorkoutModal";
import EmptyState from "@/components/EmptyState";
import {
  useRecentWorkouts,
  useWeeklyWorkoutStats,
  useWorkoutProgram,
  useWorkoutCompletions,
  useUpdateWorkout,
} from "@/hooks/useSupabase";
import type { Workout } from "@/lib/database.types";
import { todayStr, calculateProgramActiveDay } from "@/lib/db";

const Sk = ({ w = "w-12", h = "h-5" }: { w?: string; h?: string }) => (
  <span className={`ion-skeleton inline-block rounded ${w} ${h}`} />
);

export default function FitnessView() {
  const { workouts, loading: wLoading, refetch: refetchWorkouts } = useRecentWorkouts(15);
  const { data: weeklyStats, loading: wsLoading, refetch: refetchWeekly } = useWeeklyWorkoutStats();
  const { program, loading: pLoading, saveProgram, deleteProgram } = useWorkoutProgram();
  const { deleteWorkout } = useUpdateWorkout();

  const [activeWorkout, setActiveWorkout]         = useState<Workout | null>(null);
  const [isPlanModalOpen, setIsPlanModalOpen]     = useState(false);
  const [isLogModalOpen, setIsLogModalOpen]       = useState(false);
  const [prefilledWorkoutData, setPrefilledWorkoutData] = useState<{
    name?: string; type?: "strength"|"run"|"hiit"|"cardio"|"yoga";
    duration_min?: number; intensity?: "low"|"moderate"|"high";
    notes?: string; exercises?: Array<{ name: string; sets?: number; reps?: string }>;
  } | undefined>(undefined);

  const today = todayStr();
  const [selectedDayNumber, setSelectedDayNumber] = useState<number | null>(null);

  const activeDayCalc = useMemo(() => {
    if (!program) return null;
    return calculateProgramActiveDay(program, today);
  }, [program, today]);

  const currentDay = useMemo(() => {
    if (!program || !program.days || program.days.length === 0) return null;
    const target = selectedDayNumber !== null ? selectedDayNumber : (activeDayCalc?.dayNumber || 1);
    const exact = program.days.find(d => d.dayNumber === target);
    if (exact) return exact;
    const idx = (target - 1) % program.days.length;
    return program.days[idx] || program.days[0];
  }, [program, selectedDayNumber, activeDayCalc]);

  const { completions, toggleCompletion, refetch: refetchCompletions } = useWorkoutCompletions(today);
  const completedIds = useMemo(() => new Set(completions.filter(c => c.completed).map(c => c.exerciseId)), [completions]);

  const exercises      = currentDay?.exercises || [];
  const totalEx        = exercises.length;
  const completedCount = exercises.filter(ex => completedIds.has(ex.id)).length;
  const progressPct    = totalEx > 0 ? Math.round((completedCount / totalEx) * 100) : (currentDay?.isRestDay ? 100 : 0);
  const isViewingToday = selectedDayNumber === null || selectedDayNumber === (activeDayCalc?.dayNumber || 1);

  const displayDay = selectedDayNumber !== null ? selectedDayNumber : (activeDayCalc?.dayNumber || 1);

  const handleFinishAndLog = () => {
    if (!currentDay) return;
    const done = exercises.filter(e => completedIds.has(e.id)).map(e => ({ name: e.name, sets: e.sets || 3, reps: e.reps || "10-12" }));
    const toLog = done.length > 0 ? done : exercises.map(e => ({ name: e.name, sets: e.sets || 3, reps: e.reps || "10-12" }));
    const dur = exercises.reduce((a, c) => a + (c.durationMin || 0), 0) || 45;
    setPrefilledWorkoutData({
      name: currentDay.title,
      type: currentDay.focus.includes("run") ? "run" : currentDay.focus.includes("hiit") ? "hiit" : "strength",
      duration_min: dur, intensity: "moderate", exercises: toLog,
      notes: `${program?.name || "Daily Plan"} — ${currentDay.title}`,
    });
    setIsLogModalOpen(true);
  };

  const handleSaved = () => { refetchWorkouts(); refetchWeekly(); refetchCompletions(); setPrefilledWorkoutData(undefined); };
  const handleDelete = async (id: string) => { await deleteWorkout(id); refetchWorkouts(); refetchWeekly(); };

  return (
    <>
      <AnimatePresence>
        {activeWorkout && <WorkoutDetailModal workout={activeWorkout} onClose={() => setActiveWorkout(null)} onDelete={handleDelete} />}
      </AnimatePresence>
      <CreatePlanModal isOpen={isPlanModalOpen} onClose={() => setIsPlanModalOpen(false)} onSave={saveProgram} />
      {isLogModalOpen && (
        <LogWorkoutModal
          initialValues={prefilledWorkoutData}
          onClose={() => { setIsLogModalOpen(false); setPrefilledWorkoutData(undefined); }}
          onSaved={handleSaved}
        />
      )}

      <div className="flex flex-col gap-5 w-full pt-3">

        {/* ── Header ── */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="m3-chip m3-chip-orange m3-chip-selected text-[10px]">Fitness</span>
            </div>
            <h2 className="text-xl font-extrabold text-white tracking-tight">Fitness Hub</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPlanModalOpen(true)}
              className="m3-chip"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              {program ? "Manage" : "Create Plan"}
            </button>
            <button
              onClick={() => { setPrefilledWorkoutData(undefined); setIsLogModalOpen(true); }}
              className="m3-fab m3-fab-small m3-fab-orange"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              Log
            </button>
          </div>
        </div>

        {/* ── Weekly KPIs ── */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Burned", value: wsLoading ? null : (weeklyStats?.totalCalories ?? 0).toLocaleString(), unit: "kcal", color: "text-amber-400", bg: "bg-amber-400/10", icon: Flame },
            { label: "Active", value: wsLoading ? null : (weeklyStats?.totalMinutes ?? 0), unit: "min", color: "text-cyan-400", bg: "bg-cyan-400/10", icon: Clock },
            { label: "Distance", value: wsLoading ? null : (weeklyStats?.totalDistance ?? 0).toFixed(1), unit: "km", color: "text-violet-300", bg: "bg-violet-400/10", icon: Navigation },
          ].map(({ label, value, unit, color, bg, icon: Icon }) => (
            <div key={label} className="ion-kpi-tile">
              <div className={`w-7 h-7 rounded-xl ${bg} flex items-center justify-center ${color}`}>
                <Icon className="w-3.5 h-3.5" />
              </div>
              {value === null ? <Sk w="w-12" h="h-6" /> : (
                <span className="text-xl font-black text-white font-mono">
                  {value}<span className="text-[10px] font-normal text-slate-400 ml-0.5">{unit}</span>
                </span>
              )}
              <span className="text-[9px] font-mono uppercase tracking-wider text-slate-400">{label}</span>
            </div>
          ))}
        </div>

        {/* ── Today's Plan / Day Card ── */}
        <section className="m3-surface-glass rounded-2xl overflow-hidden">
          {pLoading ? (
            <div className="p-5 flex flex-col gap-3">
              <Sk w="w-40" h="h-5" />
              <Sk w="w-full" h="h-20" />
            </div>
          ) : !program ? (
            /* No plan — prompt to create */
            <div className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="m3-chip">No active plan</span>
                </div>
                <h3 className="text-base font-bold text-white">Start a 90-Day Program</h3>
                <p className="text-xs text-slate-400">Structure your daily workouts with sets, reps, and rest days.</p>
              </div>
              <button
                onClick={() => setIsPlanModalOpen(true)}
                className="m3-fab m3-fab-small shrink-0"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Create Plan
              </button>
            </div>
          ) : (
            /* Active plan day card */
            <div className="p-5">
              {/* Day header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-white/[0.06]">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className={`m3-chip text-[10px] ${isViewingToday ? "m3-chip-selected" : ""}`}>
                      {isViewingToday ? "Today" : "Day View"}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono truncate">{program.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-white truncate">
                      {currentDay?.title || `Day ${displayDay}`}
                    </h3>
                    {currentDay?.isRestDay ? (
                      <span className="m3-chip m3-chip-orange text-[10px]">Rest</span>
                    ) : (
                      <span className="m3-chip m3-chip-selected text-[10px]">{currentDay?.focus || "Training"}</span>
                    )}
                  </div>
                </div>

                {/* Day stepper */}
                <div className="flex items-center gap-1 bg-white/[0.04] p-1 rounded-xl border border-white/[0.07] shrink-0">
                  <button
                    onClick={() => { if (displayDay > 1) setSelectedDayNumber(displayDay - 1); }}
                    disabled={displayDay <= 1}
                    className="p-1.5 rounded-lg text-slate-300 hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none transition"
                    aria-label="Previous day"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <span className="px-2 text-[11px] font-mono font-bold text-cyan-400">
                    Day {displayDay}/{program.durationDays}
                  </span>
                  <button
                    onClick={() => { if (displayDay < program.durationDays) setSelectedDayNumber(displayDay + 1); }}
                    disabled={displayDay >= program.durationDays}
                    className="p-1.5 rounded-lg text-slate-300 hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none transition"
                    aria-label="Next day"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                  {!isViewingToday && (
                    <button
                      onClick={() => setSelectedDayNumber(null)}
                      className="ml-1 p-1.5 rounded-lg text-cyan-400 hover:bg-cyan-500/10 transition"
                      aria-label="Back to today"
                    >
                      <RotateCcw className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>

              {/* Progress */}
              <div className="py-3">
                <div className="flex items-center justify-between text-[10px] font-mono mb-1.5">
                  <span className="text-slate-400">
                    {currentDay?.isRestDay ? "Rest day" : `${completedCount}/${totalEx} exercises`}
                  </span>
                  <span className="font-bold text-cyan-400">{progressPct}%</span>
                </div>
                <div className="m3-progress-track">
                  <div
                    className="m3-progress-bar"
                    style={{ width: `${progressPct}%`, transition: "width 0.6s cubic-bezier(0.2,0,0,1)" }}
                  />
                </div>
              </div>

              {/* Rest day banner */}
              {currentDay?.isRestDay ? (
                <div className="my-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-3">
                  <Heart className="w-4 h-4 text-amber-300 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-amber-200">Rest & Recovery</p>
                    <p className="text-xs text-slate-400 mt-0.5">Light walking, stretching, or mobility work encouraged.</p>
                  </div>
                </div>
              ) : exercises.length === 0 ? (
                <p className="py-6 text-center text-xs text-slate-500">No exercises configured for this day.</p>
              ) : (
                /* Exercise checklist */
                <ul className="space-y-2 my-3">
                  {exercises.map(ex => {
                    const done = completedIds.has(ex.id);
                    return (
                      <li
                        key={ex.id}
                        className={`flex items-center gap-3 p-3 rounded-xl border transition-all
                          ${done ? "bg-cyan-950/15 border-cyan-500/25 opacity-75" : "bg-white/[0.03] border-white/[0.07] hover:border-white/[0.14]"}`}
                      >
                        <button
                          type="button"
                          data-no-swipe
                          onClick={() => currentDay && toggleCompletion(ex.id, currentDay.id)}
                          className={`w-6 h-6 rounded-lg border flex items-center justify-center shrink-0 transition-all
                            ${done ? "bg-cyan-400 border-cyan-400 text-slate-950 shadow-[0_0_8px_rgba(76,215,246,0.5)]" : "border-white/25 text-transparent hover:border-cyan-400 bg-white/5"}`}
                          aria-label={`${done ? "Uncheck" : "Check"} ${ex.name}`}
                        >
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </button>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-semibold text-white truncate ${done ? "line-through text-slate-400" : ""}`}>
                            {ex.name}
                          </p>
                          <p className="text-[10px] text-slate-400 font-mono">
                            {ex.sets || 3} × {ex.reps || "10-12"}
                            {ex.durationMin ? ` · ${ex.durationMin}m` : ""}
                            {ex.notes ? ` · ${ex.notes}` : ""}
                          </p>
                        </div>
                        <span className="text-[9px] font-mono uppercase text-slate-500 bg-white/[0.04] px-2 py-0.5 rounded border border-white/[0.06] shrink-0">
                          {ex.type}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              )}

              {/* Finish & log */}
              {!currentDay?.isRestDay && exercises.length > 0 && (
                <div className="pt-3 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono">
                    <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                    Started {program.startDate}
                  </div>
                  <button
                    type="button"
                    onClick={handleFinishAndLog}
                    className="m3-fab m3-fab-small w-full sm:w-auto justify-center"
                  >
                    <Dumbbell className="w-3.5 h-3.5" />
                    Finish & Log
                  </button>
                </div>
              )}
            </div>
          )}
        </section>

        {/* ── Workout History + Heatmap ── */}
        <div className="grid grid-cols-1 lg:grid-cols-7 gap-5">
          {/* Workout logs */}
          <section className="lg:col-span-4 m3-surface-glass rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-sm text-white">Workout Logs</h3>
              <span className="text-[10px] text-slate-400 font-mono">{workouts.length} sessions</span>
            </div>

            {wLoading ? (
              <div className="space-y-2">
                {[0,1,2].map(i => (
                  <div key={i} className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.04] flex items-center gap-3">
                    <Sk w="w-8" h="h-8" />
                    <div className="flex-1 flex flex-col gap-1.5"><Sk w="w-32" h="h-3.5" /><Sk w="w-20" h="h-3" /></div>
                  </div>
                ))}
              </div>
            ) : workouts.length === 0 ? (
              <EmptyState
                icon={Dumbbell}
                title="No Workouts Logged"
                description="Execute today's plan and log your first session."
                actionLabel="Log Workout"
                onAction={() => { setPrefilledWorkoutData(undefined); setIsLogModalOpen(true); }}
              />
            ) : (
              <ul className="space-y-2">
                {workouts.map(w => (
                  <li
                    key={w.id}
                    onClick={() => setActiveWorkout(w)}
                    className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.04] hover:border-amber-500/25 cursor-pointer transition-all group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-amber-500/15 flex items-center justify-center text-amber-400 shrink-0 group-hover:scale-105 transition-transform">
                      <Dumbbell className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white truncate">{w.name}</p>
                      <p className="text-[10px] text-slate-400 font-mono">{w.workout_date} · {w.duration_min}min</p>
                    </div>
                    <span className="text-sm font-bold text-amber-400 font-mono shrink-0">{w.calories}kcal</span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-amber-400 transition-colors shrink-0" />
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Heatmap */}
          <section className="lg:col-span-3 m3-surface-glass rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-sm text-white">52-Week Heatmap</h3>
              <span className="m3-chip m3-chip-selected text-[9px]">Live</span>
            </div>
            <FitnessHeatmap />
          </section>
        </div>

      </div>
    </>
  );
}
