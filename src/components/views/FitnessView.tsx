"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import {
  Dumbbell,
  Flame,
  Clock,
  Navigation,
  ChevronLeft,
  ChevronRight,
  Check,
  Plus,
  Sparkles,
  Calendar,
  Layers,
  Heart,
  RotateCcw,
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
import type { Workout, WorkoutExercise } from "@/lib/database.types";
import { todayStr, calculateProgramActiveDay } from "@/lib/db";

const SkeletonCard = () => (
  <div className="p-5 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 shadow-xl overflow-hidden relative h-[100px] flex flex-col gap-3">
    <motion.div
      className="h-5 w-3/4 bg-white/20 rounded-lg"
      animate={{ opacity: [0.4, 0.8, 0.4] }}
      transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
    />
    <div className="flex flex-col gap-2">
      <motion.div
        className="h-3 w-full bg-white/10 rounded-md"
        animate={{ opacity: [0.4, 0.8, 0.4] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.1 }}
      />
    </div>
  </div>
);

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, scale: 0.98, y: 10 },
  show: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: "spring", stiffness: 350, damping: 26 },
  },
};

export default function FitnessView() {
  const { workouts, loading: wLoading, refetch: refetchWorkouts } = useRecentWorkouts(15);
  const { data: weeklyStats, loading: wsLoading, refetch: refetchWeekly } = useWeeklyWorkoutStats();
  const { program, loading: pLoading, saveProgram, deleteProgram } = useWorkoutProgram();
  const { deleteWorkout } = useUpdateWorkout();

  const [activeWorkout, setActiveWorkout] = useState<Workout | null>(null);
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [prefilledWorkoutData, setPrefilledWorkoutData] = useState<{
    name?: string;
    type?: "strength" | "run" | "hiit" | "cardio" | "yoga";
    duration_min?: number;
    intensity?: "low" | "moderate" | "high";
    notes?: string;
    exercises?: Array<{ name: string; sets?: number; reps?: string }>;
  } | undefined>(undefined);

  // Day Navigation & Progression State
  const today = todayStr();
  const [selectedDayNumber, setSelectedDayNumber] = useState<number | null>(null);

  // Compute active day according to calendar elapsed days
  const activeDayCalculation = useMemo(() => {
    if (!program) return null;
    return calculateProgramActiveDay(program, today);
  }, [program, today]);

  const currentProgramDay = useMemo(() => {
    if (!program || !program.days || program.days.length === 0) return null;

    const targetDayNumber = selectedDayNumber !== null
      ? selectedDayNumber
      : (activeDayCalculation?.dayNumber || 1);

    // Look for day matching dayNumber, or modulo match if repeating microcycle
    const exactDay = program.days.find((d) => d.dayNumber === targetDayNumber);
    if (exactDay) return exactDay;

    const moduloIndex = (targetDayNumber - 1) % program.days.length;
    return program.days[moduloIndex] || program.days[0];
  }, [program, selectedDayNumber, activeDayCalculation]);

  // Completions are strictly keyed by local calendar date (YYYY-MM-DD)
  const { completions, toggleCompletion, refetch: refetchCompletions } = useWorkoutCompletions(today);

  const completedExerciseIds = useMemo(() => {
    return new Set(
      completions.filter((c) => c.completed).map((c) => c.exerciseId)
    );
  }, [completions]);

  const exercises = currentProgramDay?.exercises || [];
  const totalExercises = exercises.length;
  const completedCount = exercises.filter((ex) => completedExerciseIds.has(ex.id)).length;
  const progressPercent = totalExercises > 0
    ? Math.round((completedCount / totalExercises) * 100)
    : (currentProgramDay?.isRestDay ? 100 : 0);

  const isViewingToday = selectedDayNumber === null || selectedDayNumber === (activeDayCalculation?.dayNumber || 1);

  // Bridge TODO -> Workout Log Modal
  const handleFinishAndLog = () => {
    if (!currentProgramDay) return;

    const completedExercisesList = exercises
      .filter((e) => completedExerciseIds.has(e.id))
      .map((e) => ({
        name: e.name,
        sets: e.sets || 3,
        reps: e.reps || "10-12",
      }));

    const exercisesToLog = completedExercisesList.length > 0
      ? completedExercisesList
      : exercises.map((e) => ({
          name: e.name,
          sets: e.sets || 3,
          reps: e.reps || "10-12",
        }));

    const plannedDuration = exercises.reduce((acc, curr) => acc + (curr.durationMin || 0), 0);
    const duration = plannedDuration > 0 ? plannedDuration : 45;

    setPrefilledWorkoutData({
      name: currentProgramDay.title,
      type: currentProgramDay.focus.includes("run") ? "run" : currentProgramDay.focus.includes("hiit") ? "hiit" : "strength",
      duration_min: duration,
      intensity: "moderate",
      exercises: exercisesToLog,
      notes: `Logged from ${program?.name || "Daily Plan"} — ${currentProgramDay.title}`,
    });

    setIsLogModalOpen(true);
  };

  const handleSavedWorkout = () => {
    refetchWorkouts();
    refetchWeekly();
    refetchCompletions();
    setPrefilledWorkoutData(undefined);
  };

  const handleDeleteWorkout = async (id: string) => {
    await deleteWorkout(id);
    refetchWorkouts();
    refetchWeekly();
  };

  return (
    <>
      {/* View/Edit Modal */}
      <AnimatePresence>
        {activeWorkout && (
          <WorkoutDetailModal
            workout={activeWorkout}
            onClose={() => setActiveWorkout(null)}
            onDelete={handleDeleteWorkout}
          />
        )}
      </AnimatePresence>

      {/* Plan Creation / AI Program Architect Modal */}
      <CreatePlanModal
        isOpen={isPlanModalOpen}
        onClose={() => setIsPlanModalOpen(false)}
        onSave={saveProgram}
      />

      {/* Log Workout Session Modal */}
      {isLogModalOpen && (
        <LogWorkoutModal
          initialValues={prefilledWorkoutData}
          onClose={() => {
            setIsLogModalOpen(false);
            setPrefilledWorkoutData(undefined);
          }}
          onSaved={handleSavedWorkout}
        />
      )}

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="flex flex-col gap-6 w-full pb-32 lg:pb-16"
      >
        {/* Header Section */}
        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3">
          <div>
            <h2 className="text-xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
              Fitness Hub
            </h2>
            <p className="text-xs sm:text-sm text-on-surface-variant mt-0.5">
              Structured daily planning · Real actual workout logs · Scientific MET calorie tracking
            </p>
          </div>
          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              onClick={() => setIsPlanModalOpen(true)}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-white font-semibold text-xs sm:text-sm transition flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-4 h-4 text-cyan-400" />
              {program ? "Manage Plan" : "Create Plan"}
            </button>
            <button
              onClick={() => {
                setPrefilledWorkoutData(undefined);
                setIsLogModalOpen(true);
              }}
              className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-secondary text-slate-950 font-bold text-xs sm:text-sm shadow-[0_0_20px_rgba(236,106,6,0.4)] hover:bg-secondary/90 transition cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              Log Workout
            </button>
          </div>
        </motion.div>

        {/* ─────────────────────────────────────────────────────────
            PRIORITY 1: TODAY'S WORKOUT / DAILY PLAN TODO CARD
            ───────────────────────────────────────────────────────── */}
        <motion.section variants={itemVariants} className="w-full">
          {!program ? (
            <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-white/10 relative overflow-hidden bg-gradient-to-r from-[#0e1626] to-[#121c2e]">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1 max-w-xl">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                      System A · Workout TODO
                    </span>
                    <span className="text-xs text-[var(--muted-foreground)]">No active training plan</span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-white">
                    Start Your Next Training Program
                  </h3>
                  <p className="text-xs sm:text-sm text-on-surface-variant">
                    Build a structured Day 1 → Day N workout routine with specific daily exercises, sets, reps, and scheduled recovery days.
                  </p>
                </div>
                <button
                  onClick={() => setIsPlanModalOpen(true)}
                  className="px-5 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-slate-950 font-bold text-xs sm:text-sm shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:opacity-90 transition shrink-0 flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  Create First Plan
                </button>
              </div>
            </div>
          ) : (
            <div className="glass-panel rounded-2xl p-5 sm:p-6 border border-cyan-500/30 shadow-xl shadow-cyan-950/20 relative overflow-hidden bg-gradient-to-b from-[#0f172a]/95 to-[#0b1120]/98">
              {/* Card Top: Program Info & Day Navigation */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-400/40">
                      {isViewingToday ? "TODAY'S WORKOUT" : "HISTORICAL DAY"}
                    </span>
                    <span className="text-xs text-[var(--muted-foreground)] font-medium truncate">
                      {program.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <h3 className="text-base sm:text-xl font-extrabold text-white truncate">
                      {currentProgramDay?.title || `Day ${selectedDayNumber || activeDayCalculation?.dayNumber || 1}`}
                    </h3>
                    {currentProgramDay?.isRestDay ? (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        Active Recovery
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                        {currentProgramDay?.focus || "Training"}
                      </span>
                    )}
                  </div>
                </div>

                {/* Day Stepper Selector */}
                <div className="flex items-center gap-1.5 self-end sm:self-auto bg-white/5 p-1 rounded-xl border border-white/10">
                  <button
                    onClick={() => {
                      const cur = selectedDayNumber !== null ? selectedDayNumber : (activeDayCalculation?.dayNumber || 1);
                      if (cur > 1) setSelectedDayNumber(cur - 1);
                    }}
                    disabled={(selectedDayNumber !== null ? selectedDayNumber : (activeDayCalculation?.dayNumber || 1)) <= 1}
                    className="p-1 rounded-lg text-white hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none transition"
                    title="Previous day"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <span className="px-2 text-xs font-mono font-bold text-cyan-400">
                    Day {selectedDayNumber !== null ? selectedDayNumber : (activeDayCalculation?.dayNumber || 1)} / {program.durationDays}
                  </span>

                  <button
                    onClick={() => {
                      const cur = selectedDayNumber !== null ? selectedDayNumber : (activeDayCalculation?.dayNumber || 1);
                      if (cur < program.durationDays) setSelectedDayNumber(cur + 1);
                    }}
                    disabled={(selectedDayNumber !== null ? selectedDayNumber : (activeDayCalculation?.dayNumber || 1)) >= program.durationDays}
                    className="p-1 rounded-lg text-white hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none transition"
                    title="Next day"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>

                  {!isViewingToday && (
                    <button
                      onClick={() => setSelectedDayNumber(null)}
                      className="ml-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 border border-cyan-500/30 transition flex items-center gap-1"
                    >
                      <RotateCcw className="w-3 h-3" /> Today
                    </button>
                  )}
                </div>
              </div>

              {/* Progress Bar */}
              <div className="py-3">
                <div className="flex items-center justify-between text-xs mb-1.5 font-mono">
                  <span className="text-[var(--muted-foreground)]">
                    {currentProgramDay?.isRestDay
                      ? "Rest & Central Nervous System Recovery"
                      : `${completedCount} of ${totalExercises} exercises completed`}
                  </span>
                  <span className="font-bold text-cyan-400">{progressPercent}% Complete</span>
                </div>
                <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-white/5">
                  <motion.div
                    className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full rounded-full shadow-[0_0_12px_rgba(6,182,212,0.6)]"
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercent}%` }}
                    transition={{ type: "spring", stiffness: 120, damping: 20 }}
                  />
                </div>
              </div>

              {/* Exercise Checklist or Rest Day Banner */}
              {currentProgramDay?.isRestDay ? (
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 my-2 flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-amber-500/20 text-amber-300 shrink-0 mt-0.5">
                    <Heart className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-amber-200">Designated Recovery Day</h4>
                    <p className="text-xs text-on-surface-variant mt-0.5 leading-relaxed">
                      Rest and restorative sleep are when muscle fibers rebuild, glycogen replenishes, and the nervous system adapts.
                      Light walking, mobility drills, or stretching are encouraged.
                    </p>
                  </div>
                </div>
              ) : exercises.length === 0 ? (
                <div className="py-6 text-center text-xs text-[var(--muted-foreground)]">
                  No exercises configured for this day.
                </div>
              ) : (
                <div className="space-y-2.5 my-2">
                  {exercises.map((ex) => {
                    const isDone = completedExerciseIds.has(ex.id);
                    return (
                      <div
                        key={ex.id}
                        className={`p-3 rounded-xl border transition-all duration-200 flex items-center justify-between gap-3 ${
                          isDone
                            ? "bg-cyan-950/20 border-cyan-500/30 opacity-75"
                            : "bg-white/[0.03] border-white/10 hover:border-white/20"
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          {/* Interactive Checkbox with data-no-swipe to avoid swipe conflict */}
                          <button
                            type="button"
                            data-no-swipe
                            onClick={() => currentProgramDay && toggleCompletion(ex.id, currentProgramDay.id)}
                            className={`w-6 h-6 rounded-lg border flex items-center justify-center text-xs transition-all duration-200 shrink-0 ${
                              isDone
                                ? "bg-cyan-400 border-cyan-400 text-slate-950 shadow-[0_0_10px_rgba(6,182,212,0.8)]"
                                : "border-white/30 text-transparent hover:border-cyan-400 bg-white/5"
                            }`}
                            aria-label={`Mark ${ex.name} as ${isDone ? "incomplete" : "completed"}`}
                          >
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </button>

                          <div className="min-w-0 flex-1">
                            <p
                              className={`text-xs sm:text-sm font-bold text-white transition-all truncate ${
                                isDone ? "line-through text-slate-400" : ""
                              }`}
                            >
                              {ex.name}
                            </p>
                            <div className="flex items-center gap-2 text-[11px] text-[var(--muted-foreground)] font-mono truncate">
                              <span>
                                {ex.sets || 3} Sets × {ex.reps || "10-12"}
                              </span>
                              {ex.durationMin ? <span>• {ex.durationMin}m</span> : null}
                              {ex.notes ? <span className="text-slate-400">• {ex.notes}</span> : null}
                            </div>
                          </div>
                        </div>

                        <span className="text-[10px] font-mono px-2 py-0.5 rounded uppercase bg-white/5 text-slate-400 border border-white/5 shrink-0">
                          {ex.type}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Action Bar */}
              <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="text-[11px] text-[var(--muted-foreground)] flex items-center gap-1.5 font-mono">
                  <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                  <span>
                    Started: {program.startDate} · Local completions preserved historically
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleFinishAndLog}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-950 font-bold text-xs sm:text-sm shadow-[0_0_15px_rgba(6,182,212,0.4)] transition flex items-center justify-center gap-1.5"
                >
                  <Dumbbell className="w-4 h-4" />
                  Finish & Log Workout
                </button>
              </div>
            </div>
          )}
        </motion.section>

        {/* ─────────────────────────────────────────────────────────
            PRIORITY 2: THIS WEEK METRICS (ACTUAL LOGGED SESSIONS)
            ───────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 flex flex-col gap-6">
            <motion.div variants={containerVariants} className="grid grid-cols-3 gap-3">
              <motion.div variants={itemVariants} className="glass-panel p-4 rounded-2xl flex flex-col items-center text-center">
                <span className="material-symbols-outlined text-secondary text-xl mb-1">local_fire_department</span>
                <span className="text-xl font-extrabold text-white">
                  {wsLoading ? "…" : (weeklyStats?.totalCalories ?? 0).toLocaleString()}
                </span>
                <span className="text-[10px] text-on-surface-variant font-mono uppercase mt-0.5">Weekly kcal</span>
                <span className="text-[9px] text-cyan-400 font-mono mt-0.5">MET Verified</span>
              </motion.div>

              <motion.div variants={itemVariants} className="glass-panel p-4 rounded-2xl flex flex-col items-center text-center">
                <span className="material-symbols-outlined text-secondary text-xl mb-1">timer</span>
                <span className="text-xl font-extrabold text-white">
                  {wsLoading ? "…" : (weeklyStats?.totalMinutes ?? 0)}
                </span>
                <span className="text-[10px] text-on-surface-variant font-mono uppercase mt-0.5">Active Mins</span>
                <span className="text-[9px] text-[var(--muted-foreground)] font-mono mt-0.5">Last 7 Days</span>
              </motion.div>

              <motion.div variants={itemVariants} className="glass-panel p-4 rounded-2xl flex flex-col items-center text-center">
                <span className="material-symbols-outlined text-secondary text-xl mb-1">distance</span>
                <span className="text-xl font-extrabold text-white">
                  {wsLoading ? "…" : (weeklyStats?.totalDistance ?? 0).toFixed(1)}
                </span>
                <span className="text-[10px] text-on-surface-variant font-mono uppercase mt-0.5">Distance km</span>
                <span className="text-[9px] text-[var(--muted-foreground)] font-mono mt-0.5">Logged Total</span>
              </motion.div>
            </motion.div>

            {/* ─────────────────────────────────────────────────────────
                PRIORITY 3: WORKOUT LOGS LIST
                ───────────────────────────────────────────────────────── */}
            <motion.section variants={itemVariants} className="glass-panel rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-sm sm:text-base text-white flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary">history</span>
                  Workout Logs
                </h3>
                <span className="text-xs text-[var(--muted-foreground)] font-mono">
                  {workouts.length} {workouts.length === 1 ? "session" : "sessions"}
                </span>
              </div>

              {wLoading ? (
                <div className="space-y-3">
                  {[0, 1, 2].map((idx) => <SkeletonCard key={`skel-fit-${idx}`} />)}
                </div>
              ) : workouts.length === 0 ? (
                <EmptyState
                  icon="fitness_center"
                  title="No Workouts Logged Yet"
                  description="Your athletic journey starts here. Execute today's plan and log your completed workout session."
                  actionLabel="Log First Workout"
                  onAction={() => {
                    setPrefilledWorkoutData(undefined);
                    setIsLogModalOpen(true);
                  }}
                />
              ) : (
                <ul className="space-y-2.5">
                  {workouts.map((w) => (
                    <motion.li
                      key={w.id}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => setActiveWorkout(w)}
                      className="flex items-center gap-3.5 p-3.5 rounded-xl bg-surface-container-low/80 border border-white/5 hover:border-cyan-500/40 hover:shadow-[0_0_15px_rgba(6,182,212,0.15)] transition-all cursor-pointer"
                    >
                      <div className="w-10 h-10 rounded-full bg-secondary/15 flex items-center justify-center border border-secondary/30 text-secondary shrink-0">
                        <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>
                          fitness_center
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-xs sm:text-sm font-bold text-white truncate">{w.name}</p>
                          {w.calorie_source && (
                            <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-white/5 text-cyan-400 border border-white/5">
                              {w.calorie_source}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-on-surface-variant font-mono mt-0.5">
                          {w.workout_date} · {w.duration_min} min {w.distance_km ? `· ${w.distance_km} km` : ""}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs sm:text-sm font-extrabold text-secondary">{w.calories} kcal</span>
                        <span className="material-symbols-outlined text-xs text-slate-500">chevron_right</span>
                      </div>
                    </motion.li>
                  ))}
                </ul>
              )}
            </motion.section>
          </div>

          {/* ─────────────────────────────────────────────────────────
              PRIORITY 4: 52-WEEK OUTPUT HEATMAP (REAL WORKOUT DATA)
              ───────────────────────────────────────────────────────── */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <motion.section variants={itemVariants} className="glass-panel rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold text-sm sm:text-base text-white">52-Week Output Heatmap</h3>
                  <p className="text-xs text-[var(--muted-foreground)]">Calculated from actual workout sessions</p>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                  Real Telemetry
                </span>
              </div>
              <FitnessHeatmap />
            </motion.section>
          </div>
        </div>
      </motion.div>
    </>
  );
}
