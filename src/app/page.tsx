"use client";

import { useState } from "react";
import { motion, AnimatePresence, PanInfo, type Variants } from "framer-motion";
import Header from "@/components/Header";
import EmptyState from "@/components/EmptyState";
import LogWorkoutModal from "@/components/LogWorkoutModal";
import WorkoutDetailModal from "@/components/WorkoutDetailModal";
import LogStudyModal from "@/components/LogStudyModal";
import LogSleepModal from "@/components/LogSleepModal";
import LogVitalsModal from "@/components/LogVitalsModal";
import LogNutritionModal from "@/components/LogNutritionModal";
import CreateGoalModal from "@/components/CreateGoalModal";
import HabitTrackerWidget from "@/components/HabitTrackerWidget";
import HabitHeatmap from "@/components/HabitHeatmap";
import ProgressiveRings from "@/components/ProgressiveRings";
import PredictiveHabitWidget from "@/components/PredictiveHabitWidget";
import QuickStartTemplates from "@/components/QuickStartTemplates";
import HeroTriad from "@/components/HeroTriad";
import MobileBottomNav from "@/components/MobileBottomNav";
import HoldToCommitButton from "@/components/HoldToCommitButton";
import CalendarCarousel from "@/components/CalendarCarousel";
import HydrationWidget from "@/components/HydrationWidget";
import CommandPalette from "@/components/CommandPalette";
import ToastNotification from "@/components/ToastNotification";
import AuthModal from "@/components/AuthModal";
import StudyHeatmap from "@/components/StudyHeatmap";
import MoodSelector from "@/components/MoodSelector";
import FocusTimer from "@/components/FocusTimer";
import SleepBar from "@/components/SleepBar";
import { useAuth } from "@/hooks/useAuth";
import {
  useHealthMetrics,
  useRecentWorkouts,
  useWeeklyWorkoutStats,
  useStudyStats,
  useLatestMood,
  useLatestSleep,
  useGoals,
  useNutrition,
  useHabits,
} from "@/hooks/useSupabase";
import type { Workout } from "@/lib/database.types";
import { exportAllDataJSON, resetBaselineData } from "@/lib/db";

/* ─── Skeleton Card Loader ───── */
const SkeletonCard = () => (
  <div className="p-5 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 shadow-xl overflow-hidden relative h-[130px] flex flex-col gap-3">
    <motion.div
      className="h-6 w-3/4 bg-white/20 rounded-lg"
      animate={{ opacity: [0.4, 0.8, 0.4] }}
      transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
    />
    <div className="flex flex-col gap-2">
      <motion.div
        className="h-3.5 w-full bg-white/10 rounded-md"
        animate={{ opacity: [0.4, 0.8, 0.4] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.1 }}
      />
      <motion.div
        className="h-3.5 w-5/6 bg-white/10 rounded-md"
        animate={{ opacity: [0.4, 0.8, 0.4] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
      />
    </div>
  </div>
);

/* ─── Mobile Swipe Tab Order ───── */
const TABS = ["dashboard", "study", "fitness", "health", "routines", "nutrition", "goals"];

/* ─── Animation Physics ─── */
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, scale: 0.96, y: 16 },
  show: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: "spring", stiffness: 350, damping: 26 },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: { duration: 0.15 },
  },
};

/* ─────────────────────────────────────────────────────────
   1. DASHBOARD VIEW (Sleek Modern HUD)
   ───────────────────────────────────────────────────────── */
function DashboardView({
  onNav,
  onOpenWorkoutModal,
  onOpenStudyModal,
  onOpenSleepModal,
  onOpenNutritionModal,
}: {
  onNav: (tab: string) => void;
  onOpenWorkoutModal: () => void;
  onOpenStudyModal: () => void;
  onOpenSleepModal: () => void;
  onOpenNutritionModal: () => void;
}) {
  const { metrics, loading: mLoading } = useHealthMetrics();
  const { data: weeklyStats, loading: wLoading } = useWeeklyWorkoutStats();
  const { data: studyStats, loading: sLoading } = useStudyStats();
  const { data: sleepData, loading: slLoading } = useLatestSleep();
  const { workouts, loading: wListLoading } = useRecentWorkouts(3);
  const { submitMood, moodScore } = useLatestMood();
  const { habits, habitLogs, completeHabit, addHabit } = useHabits();
  const [activeWorkout, setActiveWorkout] = useState<Workout | null>(null);
  const [selectedDateStr, setSelectedDateStr] = useState<string>(
    () => new Date().toISOString().split("T")[0]
  );

  const recoveryScore = metrics?.recovery_score ?? 87;
  const studyMins = studyStats?.todayMinutes ?? 50;
  const workoutCals = weeklyStats?.totalCalories ?? 520;
  const sleepHrs = sleepData?.hours ?? 7.5;

  const completedHabitsCount = habits.filter((h) => h.completedToday).length;
  const maxStreakDays = habits.reduce((max, h) => Math.max(max, h.streak), 0);

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

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        exit="exit"
        className="flex flex-col gap-6 sm:gap-8 w-full max-w-full overflow-x-hidden pb-32 lg:pb-16"
      >
        {/* HERO TRIAD — FOCUS / BURN / REST BENTO CARDS */}
        <motion.div variants={itemVariants}>
          <HeroTriad
            studyMins={studyMins}
            caloriesBurned={metrics?.calories_burned ?? workoutCals}
            sleepHours={sleepHrs}
            recoveryScore={recoveryScore}
            onOpenStudy={onOpenStudyModal}
            onOpenWorkout={onOpenWorkoutModal}
            onOpenSleep={onOpenSleepModal}
          />
        </motion.div>

        {/* TIME-AWARE PREDICTIVE SURFACING 1-TAP BANNER */}
        <motion.div variants={itemVariants}>
          <PredictiveHabitWidget habits={habits} onComplete={completeHabit} />
        </motion.div>

        {/* DAILY SCROLL-SNAPPING CALENDAR TIMELINE */}
        <motion.div variants={itemVariants}>
          <CalendarCarousel
            selectedDate={selectedDateStr}
            onSelectDate={(date) => setSelectedDateStr(date)}
          />
        </motion.div>

        {/* BENTO SECTION: PROGRESSIVE RINGS & HABIT ROUTINES */}
        <motion.div variants={containerVariants} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 flex flex-col gap-6">
            <HabitTrackerWidget />
          </div>
          <div className="lg:col-span-4 flex flex-col gap-6">
            <ProgressiveRings
              completedCount={completedHabitsCount}
              totalCount={habits.length}
              streakDays={maxStreakDays}
            />
            <HydrationWidget />
            {/* HOLD-TO-COMMIT 1.5S PRESS BUTTON */}
            <HoldToCommitButton
              label="Hold 1.5s to Commit Day Goals"
              onCommit={() => console.log("Day committed successfully!")}
            />
          </div>
        </motion.div>

        {/* Phase 2: 30-Day Reliability Heatmap */}
        <motion.div variants={itemVariants}>
          <HabitHeatmap habits={habits} logs={habitLogs} />
        </motion.div>

        {/* Phase 4: Quick-Start Preset Templates */}
        <motion.div variants={itemVariants}>
          <QuickStartTemplates onAddTemplate={addHabit} />
        </motion.div>

        {/* Recent Activity */}
        <motion.section variants={itemVariants} className="glass-panel rounded-2xl p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h3 className="font-bold text-sm sm:text-base text-white">Recent Activity Output</h3>
            <button onClick={() => onNav("fitness")} className="text-xs text-primary hover:underline font-semibold cursor-pointer">
              View All
            </button>
          </div>

          <ul className="space-y-3">
            <AnimatePresence mode="popLayout">
              {wListLoading ? (
                [0, 1, 2].map((idx) => <SkeletonCard key={`skel-${idx}`} />)
              ) : workouts.length === 0 ? (
                <p className="text-xs text-center py-8 text-on-surface-variant">No activity logged yet.</p>
              ) : (
                workouts.map((w) => (
                  <motion.li
                    key={w.id}
                    variants={itemVariants}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setActiveWorkout(w)}
                    className="flex items-center gap-4 p-3.5 rounded-xl bg-surface-container-low/80 border border-white/5 shadow-md hover:border-cyan-500/40 cursor-pointer transition-all"
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
                  </motion.li>
                ))
              )}
            </AnimatePresence>
          </ul>
        </motion.section>

        {/* Mood Check-In */}
        <motion.section variants={itemVariants} className="glass-panel rounded-2xl p-5">
          <h3 className="font-bold text-sm sm:text-base text-white mb-3">Daily Mood & Wellness Check-In</h3>
          <MoodSelector initialScore={moodScore ?? undefined} onSelect={submitMood} />
        </motion.section>
      </motion.div>
    </>
  );
}

/* ─────────────────────────────────────────────────────────
   2. FITNESS HUB VIEW
   ───────────────────────────────────────────────────────── */
function FitnessView({ onOpenWorkoutModal }: { onOpenWorkoutModal: () => void }) {
  const { workouts, loading: wLoading } = useRecentWorkouts(10);
  const { data: weeklyStats, loading: wsLoading } = useWeeklyWorkoutStats();
  const [activeWorkout, setActiveWorkout] = useState<Workout | null>(null);

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

      <motion.div variants={containerVariants} initial="hidden" animate="show" exit="exit" className="flex flex-col gap-6 w-full">
        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3">
          <div>
            <h2 className="text-xl sm:text-3xl font-extrabold text-white tracking-tight">Fitness Hub</h2>
            <p className="text-xs sm:text-sm text-on-surface-variant mt-0.5">Synchronize output. Elevate athletic performance.</p>
          </div>
          <button
            onClick={onOpenWorkoutModal}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-secondary text-slate-950 font-bold text-xs sm:text-sm shadow-[0_0_20px_rgba(236,106,6,0.4)] hover:bg-secondary/90 transition cursor-pointer"
          >
            + Log Workout
          </button>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 flex flex-col gap-6">
            <motion.div variants={containerVariants} className="grid grid-cols-3 gap-3">
              <motion.div variants={itemVariants} className="glass-panel p-4 rounded-2xl flex flex-col items-center text-center">
                <span className="material-symbols-outlined text-secondary text-xl mb-1">local_fire_department</span>
                <span className="text-xl font-extrabold text-white">
                  {wsLoading ? "…" : (weeklyStats?.totalCalories ?? 0).toLocaleString()}
                </span>
                <span className="text-[10px] text-on-surface-variant font-mono uppercase mt-0.5">Weekly kcal</span>
              </motion.div>

              <motion.div variants={itemVariants} className="glass-panel p-4 rounded-2xl flex flex-col items-center text-center">
                <span className="material-symbols-outlined text-secondary text-xl mb-1">timer</span>
                <span className="text-xl font-extrabold text-white">
                  {wsLoading ? "…" : (weeklyStats?.totalMinutes ?? 0)}
                </span>
                <span className="text-[10px] text-on-surface-variant font-mono uppercase mt-0.5">Active Mins</span>
              </motion.div>

              <motion.div variants={itemVariants} className="glass-panel p-4 rounded-2xl flex flex-col items-center text-center">
                <span className="material-symbols-outlined text-secondary text-xl mb-1">distance</span>
                <span className="text-xl font-extrabold text-white">
                  {wsLoading ? "…" : (weeklyStats?.totalDistance ?? 0).toFixed(1)}
                </span>
                <span className="text-[10px] text-on-surface-variant font-mono uppercase mt-0.5">Distance km</span>
              </motion.div>
            </motion.div>

            <motion.section variants={itemVariants} className="glass-panel rounded-2xl p-5">
              <h3 className="font-bold text-sm sm:text-base text-white mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary">history</span>
                Workout Logs
              </h3>

              {wLoading ? (
                <div className="space-y-3">
                  {[0, 1, 2].map((idx) => <SkeletonCard key={`skel-fit-${idx}`} />)}
                </div>
              ) : workouts.length === 0 ? (
                <EmptyState
                  icon="fitness_center"
                  title="No Workouts Logged Yet"
                  description="Your athletic journey starts here. Generate an AI workout or log a manual session to track performance."
                  actionLabel="Log First Workout"
                  onAction={onOpenWorkoutModal}
                />
              ) : (
                <ul className="space-y-3">
                  {workouts.map((w) => (
                    <motion.li
                      key={w.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setActiveWorkout(w)}
                      className="flex items-center gap-4 p-3.5 rounded-xl bg-surface-container-low/80 border border-white/5 hover:border-cyan-500/40 hover:shadow-[0_0_15px_rgba(6,182,212,0.15)] transition-all cursor-pointer"
                    >
                      <div className="w-10 h-10 rounded-full bg-secondary/15 flex items-center justify-center border border-secondary/30 text-secondary shrink-0">
                        <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>
                          fitness_center
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm font-bold text-white truncate">{w.name}</p>
                        <p className="text-[11px] text-on-surface-variant font-mono">
                          {w.workout_date} · {w.duration_min} min {w.distance_km ? `· ${w.distance_km} km` : ""}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-extrabold text-secondary">{w.calories} kcal</span>
                        <span className="material-symbols-outlined text-xs text-slate-500">chevron_right</span>
                      </div>
                    </motion.li>
                  ))}
                </ul>
              )}
            </motion.section>
          </div>

          <div className="lg:col-span-5 flex flex-col gap-6">
            <motion.section variants={itemVariants} className="glass-panel rounded-2xl p-5">
              <h3 className="font-bold text-sm sm:text-base text-white mb-4">52-Week Output Heatmap</h3>
              <StudyHeatmap />
            </motion.section>
          </div>
        </div>
      </motion.div>
    </>
  );
}

/* ─────────────────────────────────────────────────────────
   3. STUDY STUDIO VIEW
   ───────────────────────────────────────────────────────── */
function StudyView({ onOpenStudyModal }: { onOpenStudyModal: () => void }) {
  const { data: studyStats, loading, refetch } = useStudyStats();

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" exit="exit" className="flex flex-col gap-6 w-full">
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3">
        <div>
          <h2 className="text-xl sm:text-3xl font-extrabold text-white tracking-tight">Study Studio</h2>
          <p className="text-xs sm:text-sm text-on-surface-variant mt-0.5">Deep focus mode & knowledge acquisition.</p>
        </div>
        <button
          onClick={onOpenStudyModal}
          className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-primary text-slate-950 font-bold text-xs sm:text-sm shadow-[0_0_20px_rgba(76,215,246,0.4)] flex items-center justify-center gap-2 cursor-pointer"
        >
          + Log Session
        </button>
      </motion.div>

      <motion.div variants={itemVariants} className="glass-panel p-6 rounded-2xl flex justify-center border-t-2 border-primary/40">
        <FocusTimer initialMinutes={25} onSessionComplete={refetch} />
      </motion.div>

      <motion.div variants={containerVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <motion.div variants={itemVariants} className="glass-panel p-4 rounded-2xl text-center">
          <span className="material-symbols-outlined text-primary text-xl mb-1">schedule</span>
          <p className="text-xl font-extrabold text-white">{loading ? "…" : ((studyStats?.todayMinutes ?? 150) / 60).toFixed(1)}h</p>
          <p className="text-[10px] text-on-surface-variant font-mono uppercase mt-1">Today&apos;s Focus</p>
        </motion.div>

        <motion.div variants={itemVariants} className="glass-panel p-4 rounded-2xl text-center">
          <span className="material-symbols-outlined text-primary text-xl mb-1">local_fire_department</span>
          <p className="text-xl font-extrabold text-white">{loading ? "…" : (studyStats?.streakDays ?? 14)}</p>
          <p className="text-[10px] text-on-surface-variant font-mono uppercase mt-1">Streak Days</p>
        </motion.div>

        <motion.div variants={itemVariants} className="glass-panel p-4 rounded-2xl text-center">
          <span className="material-symbols-outlined text-primary text-xl mb-1">checklist</span>
          <p className="text-xl font-extrabold text-white">{loading ? "…" : (studyStats?.totalSessions ?? 42)}</p>
          <p className="text-[10px] text-on-surface-variant font-mono uppercase mt-1">Total Sessions</p>
        </motion.div>

        <motion.div variants={itemVariants} className="glass-panel p-4 rounded-2xl text-center">
          <span className="material-symbols-outlined text-primary text-xl mb-1">grade</span>
          <p className="text-xl font-extrabold text-primary">3.92</p>
          <p className="text-[10px] text-on-surface-variant font-mono uppercase mt-1">GPA Target</p>
        </motion.div>
      </motion.div>

      <motion.div variants={itemVariants} className="glass-panel p-5 rounded-2xl">
        <h3 className="font-bold text-sm sm:text-base text-white mb-4">Study Consistency (16 Weeks)</h3>
        <StudyHeatmap data={studyStats?.heatmapData} />
      </motion.div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────
   4. HEALTH ANALYTICS VIEW
   ───────────────────────────────────────────────────────── */
function HealthView({
  onOpenSleepModal,
  onOpenVitalsModal,
}: {
  onOpenSleepModal: () => void;
  onOpenVitalsModal: () => void;
}) {
  const { metrics, loading: mLoading } = useHealthMetrics();
  const { data: latestSleep, loading: sLoading } = useLatestSleep();
  const { submitMood, moodScore } = useLatestMood();

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" exit="exit" className="flex flex-col gap-6 w-full">
      <motion.div variants={itemVariants} className="flex justify-between items-end">
        <div>
          <h2 className="text-xl sm:text-3xl font-extrabold text-white tracking-tight">Health & Recovery</h2>
          <p className="text-xs sm:text-sm text-on-surface-variant mt-0.5">Circadian Rhythm & Vital Signs Analysis</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onOpenVitalsModal}
            className="px-3.5 py-2 rounded-xl bg-primary/20 border border-primary/40 text-primary font-semibold text-xs hover:bg-primary/30 transition cursor-pointer"
          >
            + Log Vitals
          </button>
          <button
            onClick={onOpenSleepModal}
            className="px-3.5 py-2 rounded-xl bg-tertiary/20 border border-tertiary/40 text-tertiary font-semibold text-xs hover:bg-tertiary/30 transition cursor-pointer"
          >
            + Log Sleep
          </button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div variants={itemVariants} className="glass-panel p-5 sm:p-6 rounded-2xl border-t-2 border-tertiary">
          <h3 className="font-bold text-sm sm:text-base text-white mb-4">Last Night&apos;s Sleep</h3>
          {sLoading ? (
            <div className="h-28 bg-white/10 rounded-xl" />
          ) : (
            <SleepBar
              hours={latestSleep?.hours ?? 7.8}
              target={8}
              stages={
                latestSleep
                  ? {
                      deep: latestSleep.deep_pct,
                      light: latestSleep.light_pct,
                      rem: latestSleep.rem_pct,
                      awake: latestSleep.awake_pct,
                    }
                  : undefined
              }
            />
          )}
        </motion.div>

        <motion.div variants={itemVariants} className="glass-panel p-5 sm:p-6 rounded-2xl border-t-2 border-tertiary flex flex-col items-center justify-center text-center">
          <h3 className="font-bold text-sm sm:text-base text-white mb-4">Body Recovery Score</h3>
          <div className="w-32 h-32 rounded-full bg-surface-container/70 border-2 border-tertiary/50 flex flex-col items-center justify-center shadow-[0_0_30px_rgba(179,149,255,0.3)]">
            <span className="text-3xl font-extrabold text-tertiary">{metrics?.recovery_score ?? 88}%</span>
            <span className="text-[10px] text-on-surface-variant font-mono uppercase">OPTIMAL</span>
          </div>
          <p className="text-xs text-on-surface-variant mt-4">
            System fully restored. High readiness for intensive deep work and output.
          </p>
        </motion.div>
      </div>

      <motion.div variants={containerVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <motion.div variants={itemVariants} className="glass-panel p-4 rounded-2xl text-center">
          <span className="material-symbols-outlined text-tertiary text-xl mb-1">ecg_heart</span>
          <p className="text-lg sm:text-2xl font-extrabold text-white">{mLoading ? "…" : (metrics?.hrv_ms ?? 72)} ms</p>
          <p className="text-[10px] text-on-surface-variant font-mono uppercase mt-1">HRV Score</p>
        </motion.div>

        <motion.div variants={itemVariants} className="glass-panel p-4 rounded-2xl text-center">
          <span className="material-symbols-outlined text-tertiary text-xl mb-1">air</span>
          <p className="text-lg sm:text-2xl font-extrabold text-white">{mLoading ? "…" : (metrics?.spo2 ?? 99)}%</p>
          <p className="text-[10px] text-on-surface-variant font-mono uppercase mt-1">SpO₂ Level</p>
        </motion.div>

        <motion.div variants={itemVariants} className="glass-panel p-4 rounded-2xl text-center">
          <span className="material-symbols-outlined text-tertiary text-xl mb-1">device_thermostat</span>
          <p className="text-lg sm:text-2xl font-extrabold text-white">{mLoading ? "…" : (metrics?.body_temp ?? 36.6)}°C</p>
          <p className="text-[10px] text-on-surface-variant font-mono uppercase mt-1">Body Temp</p>
        </motion.div>

        <motion.div variants={itemVariants} className="glass-panel p-4 rounded-2xl text-center">
          <span className="material-symbols-outlined text-tertiary text-xl mb-1">psychology</span>
          <p className="text-lg sm:text-2xl font-extrabold text-white">{mLoading ? "…" : (metrics?.stress_pct ?? 22)}%</p>
          <p className="text-[10px] text-on-surface-variant font-mono uppercase mt-1">Stress Level</p>
        </motion.div>
      </motion.div>

      <motion.div variants={itemVariants} className="glass-panel p-5 rounded-2xl">
        <h3 className="font-bold text-sm sm:text-base text-white mb-4">Mental Check-In</h3>
        <MoodSelector initialScore={moodScore ?? undefined} onSelect={submitMood} />
      </motion.div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────
   5. ROUTINES & HABITS VIEW
   ───────────────────────────────────────────────────────── */
function RoutinesView() {
  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" exit="exit" className="flex flex-col gap-6 w-full pb-32 lg:pb-12">
      <HabitTrackerWidget />
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────
   6. NUTRITION & HYDRATION VIEW (FUEL SCREEN)
   ───────────────────────────────────────────────────────── */
function NutritionView({ onOpenNutritionModal }: { onOpenNutritionModal: () => void }) {
  const { meals, stats } = useNutrition();

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" exit="exit" className="flex flex-col gap-6 w-full pb-32 lg:pb-12">
      <motion.div variants={itemVariants} className="flex justify-between items-end">
        <div>
          <h2 className="text-xl sm:text-3xl font-extrabold text-white tracking-tight">Hydration & Fuel</h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">Fuel your body with hydration & balanced nutrition.</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.95 }}
          onClick={onOpenNutritionModal}
          className="px-4 py-2.5 rounded-xl bg-secondary text-slate-950 font-extrabold text-xs shadow-[0_0_20px_rgba(236,106,6,0.4)] hover:bg-secondary/90 transition cursor-pointer"
        >
          + Log Meal
        </motion.button>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6">
          <HydrationWidget />
        </div>

        <div className="lg:col-span-6 bg-[#0F172A]/60 backdrop-blur-xl border border-white/10 shadow-2xl rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-extrabold text-base text-white tracking-tight flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>
                  pie_chart
                </span>
                Daily Macro Totals
              </h3>
              <span className="font-mono text-xs text-secondary font-extrabold bg-secondary/15 px-2.5 py-1 rounded-xl border border-secondary/30">
                Today&apos;s Intake
              </span>
            </div>

            {/* Oversized Typography for Macro Metrics */}
            <div className="grid grid-cols-4 gap-3 text-center my-4">
              <div className="bg-slate-900/70 p-3 rounded-xl border border-white/5 shadow-inner">
                <span className="text-xl sm:text-2xl font-extrabold text-secondary tracking-tight">{stats.totalCalories}</span>
                <span className="block text-[10px] uppercase tracking-widest text-slate-400 font-mono mt-0.5">KCAL</span>
              </div>
              <div className="bg-slate-900/70 p-3 rounded-xl border border-white/5 shadow-inner">
                <span className="text-xl sm:text-2xl font-extrabold text-primary tracking-tight">{stats.totalProtein}g</span>
                <span className="block text-[9px] uppercase tracking-widest text-slate-400 font-mono mt-0.5">PROTEIN</span>
              </div>
              <div className="bg-slate-900/70 p-3 rounded-xl border border-white/5 shadow-inner">
                <span className="text-xl sm:text-2xl font-extrabold text-tertiary tracking-tight">{stats.totalCarbs}g</span>
                <span className="block text-[10px] uppercase tracking-widest text-slate-400 font-mono mt-0.5">CARBS</span>
              </div>
              <div className="bg-slate-900/70 p-3 rounded-xl border border-white/5 shadow-inner">
                <span className="text-xl sm:text-2xl font-extrabold text-secondary tracking-tight">{stats.totalFats}g</span>
                <span className="block text-[10px] uppercase tracking-widest text-slate-400 font-mono mt-0.5">FATS</span>
              </div>
            </div>
          </div>

          {/* Staggered Logged Meals List */}
          <div className="space-y-2.5 mt-4 pt-4 border-t border-white/10">
            <h4 className="font-mono text-[10px] uppercase tracking-widest text-slate-400">Logged Meals</h4>
            {meals.length === 0 ? (
              <EmptyState
                icon="restaurant"
                title="No Meals Logged Today"
                description="Fuel your body with intention. Log your meals to track calories, protein, carbs, and fats."
                actionLabel="Log First Meal"
                onAction={onOpenNutritionModal}
              />
            ) : (
              <motion.div
                variants={{
                  hidden: { opacity: 0 },
                  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
                }}
                initial="hidden"
                animate="show"
                className="space-y-2 max-h-48 overflow-y-auto pr-1"
              >
                {meals.map((m) => (
                  <motion.div
                    key={m.id}
                    variants={{
                      hidden: { opacity: 0, y: 8 },
                      show: { opacity: 1, y: 0 },
                    }}
                    className="flex justify-between items-center p-3 rounded-xl bg-slate-900/60 border border-white/5 text-xs hover:border-white/20 transition"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white capitalize text-xs sm:text-sm">{m.name}</span>
                      <span className="text-[10px] text-slate-400 font-mono uppercase bg-white/5 px-2 py-0.5 rounded border border-white/10">
                        {m.mealType}
                      </span>
                    </div>
                    <span className="font-mono font-extrabold text-secondary text-xs">{m.calories} kcal</span>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────
   7. GOALS VIEW
   ───────────────────────────────────────────────────────── */
function GoalsView({
  onShowToast,
  onOpenGoalModal,
}: {
  onShowToast: (msg: string) => void;
  onOpenGoalModal: () => void;
}) {
  const { goals, loading, updating, updateProgress } = useGoals();

  const handleUpdate = async (id: string, newProg: number, title: string) => {
    await updateProgress(id, newProg);
    onShowToast(`🎯 Goal updated: "${title}" is now at ${newProg}%!`);
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" exit="exit" className="flex flex-col gap-6 w-full pb-32 lg:pb-12">
      <motion.div variants={itemVariants} className="flex justify-between items-end">
        <div>
          <h2 className="text-xl sm:text-3xl font-extrabold text-white tracking-tight">Milestones & Strategic Goals</h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">Track core objectives and key achievements.</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.95 }}
          onClick={onOpenGoalModal}
          className="px-4 py-2.5 rounded-xl bg-primary text-slate-950 font-extrabold text-xs shadow-[0_0_20px_rgba(76,215,246,0.4)] hover:bg-primary/90 transition cursor-pointer"
        >
          + New Goal
        </motion.button>
      </motion.div>

      {goals.length === 0 && !loading ? (
        <EmptyState
          icon="flag"
          title="No Active Strategic Goals"
          description="Define your high-level milestones in health, learning, or fitness to stay focused on long-term achievement."
          actionLabel="Create First Goal"
          onAction={onOpenGoalModal}
        />
      ) : (
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <AnimatePresence mode="popLayout">
            {loading ? (
              [0, 1, 2].map((idx) => <SkeletonCard key={`skel-g-${idx}`} />)
            ) : (
              goals.map((g) => (
                <motion.li
                  key={g.id}
                  variants={itemVariants}
                  className="glass-panel p-5 rounded-2xl flex flex-col gap-4 shadow-xl"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-xl shrink-0">
                        {g.icon}
                      </div>
                      <div>
                        <h3 className="font-bold text-sm sm:text-base text-white">{g.title}</h3>
                        <p className="text-[10px] text-primary font-mono uppercase">{g.category}</p>
                      </div>
                    </div>
                    <span className="text-lg font-extrabold text-primary shrink-0">{g.progress}%</span>
                  </div>

                  <div className="w-full bg-surface-container-highest h-2 rounded-full overflow-hidden">
                    <div className="bg-primary h-full rounded-full transition-all duration-500" style={{ width: `${g.progress}%` }} />
                  </div>

                  <div className="flex justify-between items-center text-[11px] text-on-surface-variant">
                    <span>{g.target_description}</span>
                    <span>{g.detail}</span>
                  </div>

                  <div className="flex gap-2 pt-2 border-t border-white/5">
                    {[+5, +10].map((delta) => (
                      <button
                        key={delta}
                        disabled={updating === g.id || g.progress >= 100}
                        onClick={() => handleUpdate(g.id, Math.min(g.progress + delta, 100), g.title)}
                        className="flex-1 text-xs py-2 rounded-lg bg-primary/10 border border-primary/30 text-primary font-semibold hover:bg-primary/20 transition active:scale-95 disabled:opacity-50 cursor-pointer"
                      >
                        +{delta}% Progress
                      </button>
                    ))}
                  </div>
                </motion.li>
              ))
            )}
          </AnimatePresence>
        </ul>
      )}
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────
   MAIN APP ROUTER
   ───────────────────────────────────────────────────────── */
export default function Home() {
  const { user, isAuthenticated, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showWorkoutModal, setShowWorkoutModal] = useState(false);
  const [showStudyModal, setShowStudyModal] = useState(false);
  const [showSleepModal, setShowSleepModal] = useState(false);
  const [showVitalsModal, setShowVitalsModal] = useState(false);
  const [showNutritionModal, setShowNutritionModal] = useState(false);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleExportData = () => {
    const jsonStr = exportAllDataJSON();
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `lifesync-backup-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    showToast("💾 Exported full personal data backup!");
  };

  const handleResetData = () => {
    if (confirm("Are you sure you want to reset all tracking data to baseline demo defaults?")) {
      resetBaselineData();
      showToast("🔄 Reset data to baseline demo defaults!");
    }
  };

  const handleDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const swipeThreshold = 50;
    const currentIndex = TABS.indexOf(activeTab);

    if (info.offset.x < -swipeThreshold && currentIndex < TABS.length - 1) {
      setActiveTab(TABS[currentIndex + 1]);
    } else if (info.offset.x > swipeThreshold && currentIndex > 0) {
      setActiveTab(TABS[currentIndex - 1]);
    }
  };

  const renderActiveView = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <DashboardView
            onNav={setActiveTab}
            onOpenWorkoutModal={() => setShowWorkoutModal(true)}
            onOpenStudyModal={() => setShowStudyModal(true)}
            onOpenSleepModal={() => setShowSleepModal(true)}
            onOpenNutritionModal={() => setShowNutritionModal(true)}
          />
        );
      case "study":
        return <StudyView onOpenStudyModal={() => setShowStudyModal(true)} />;
      case "fitness":
        return <FitnessView onOpenWorkoutModal={() => setShowWorkoutModal(true)} />;
      case "health":
        return (
          <HealthView
            onOpenSleepModal={() => setShowSleepModal(true)}
            onOpenVitalsModal={() => setShowVitalsModal(true)}
          />
        );
      case "routines":
        return <RoutinesView />;
      case "nutrition":
        return <NutritionView onOpenNutritionModal={() => setShowNutritionModal(true)} />;
      case "goals":
        return <GoalsView onShowToast={showToast} onOpenGoalModal={() => setShowGoalModal(true)} />;
      default:
        return (
          <DashboardView
            onNav={setActiveTab}
            onOpenWorkoutModal={() => setShowWorkoutModal(true)}
            onOpenStudyModal={() => setShowStudyModal(true)}
            onOpenSleepModal={() => setShowSleepModal(true)}
            onOpenNutritionModal={() => setShowNutritionModal(true)}
          />
        );
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full w-full relative overflow-hidden bg-background text-on-background">
      {/* Toast Notification Banner */}
      <ToastNotification message={toastMsg} onClear={() => setToastMsg(null)} />

      {/* Command Palette */}
      <CommandPalette
        isOpen={showCommandPalette}
        onClose={() => setShowCommandPalette(false)}
        onSelectNav={setActiveTab}
        onOpenWorkoutModal={() => setShowWorkoutModal(true)}
        onOpenStudyModal={() => setShowStudyModal(true)}
        onOpenSleepModal={() => setShowSleepModal(true)}
        onOpenVitalsModal={() => setShowVitalsModal(true)}
        onOpenNutritionModal={() => setShowNutritionModal(true)}
        onOpenGoalModal={() => setShowGoalModal(true)}
        onExportData={handleExportData}
        onResetData={handleResetData}
        onShowToast={showToast}
      />

      {/* Auth Modal */}
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} onSuccess={showToast} />

      {/* Interactive Modals */}
      <AnimatePresence>
        {showWorkoutModal && (
          <LogWorkoutModal
            key="workout-modal"
            onClose={() => setShowWorkoutModal(false)}
            onSaved={() => showToast("🏃 Workout activity logged!")}
          />
        )}
        {showStudyModal && (
          <LogStudyModal
            key="study-modal"
            onClose={() => setShowStudyModal(false)}
            onSaved={() => showToast("📚 Study session logged!")}
          />
        )}
        {showSleepModal && (
          <LogSleepModal
            key="sleep-modal"
            onClose={() => setShowSleepModal(false)}
            onSaved={() => showToast("🌙 Sleep session logged!")}
          />
        )}
        {showVitalsModal && (
          <LogVitalsModal
            key="vitals-modal"
            onClose={() => setShowVitalsModal(false)}
            onSaved={() => showToast("❤️‍🔥 Health vitals updated!")}
          />
        )}
        {showNutritionModal && (
          <LogNutritionModal
            key="nutrition-modal"
            onClose={() => setShowNutritionModal(false)}
            onSaved={() => showToast("🥗 Meal & macros logged!")}
          />
        )}
        {showGoalModal && (
          <CreateGoalModal
            key="goal-modal"
            onClose={() => setShowGoalModal(false)}
            onSaved={() => showToast("🎯 New goal created!")}
          />
        )}
      </AnimatePresence>

      {/* Desktop Navigation Drawer (LG+) */}
      <nav className="hidden lg:flex flex-col fixed left-0 top-0 h-full z-[60] bg-surface-dim/95 backdrop-blur-2xl w-72 rounded-r-2xl border-r border-white/10 shadow-2xl">
        <div className="p-6 border-b border-white/5">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-full border border-white/10 relative bg-primary/20 flex items-center justify-center font-bold text-xl text-primary shadow-[0_0_15px_rgba(76,215,246,0.3)]">
              ⚡
            </div>
            <div className="min-w-0">
              <h2 className="font-bold text-base text-white truncate">
                {isAuthenticated ? (user?.email?.split("@")[0] || "User") : "Guest User"}
              </h2>
              <p className="text-xs text-on-surface-variant font-mono truncate">
                {isAuthenticated ? user?.email : "Sign in to sync data"}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between bg-surface-container/50 rounded-xl p-3 glass-panel">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>
                local_fire_department
              </span>
              <span className="text-xs text-secondary font-semibold font-mono">
                {isAuthenticated ? "Active Session" : "Offline Mode"}
              </span>
            </div>
            {isAuthenticated ? (
              <button onClick={() => signOut()} className="text-[10px] text-error hover:underline font-mono">
                Sign Out
              </button>
            ) : (
              <button onClick={() => setShowAuthModal(true)} className="text-[10px] text-primary hover:underline font-mono">
                Sign In
              </button>
            )}
          </div>
        </div>

        {/* Desktop Nav Buttons */}
        <div className="flex flex-col gap-1.5 p-4 flex-grow overflow-y-auto">
          {[
            { id: "dashboard", label: "Dashboard", icon: "dashboard" },
            { id: "study", label: "Study Studio", icon: "menu_book" },
            { id: "fitness", label: "Fitness Hub", icon: "fitness_center" },
            { id: "health", label: "Health Analytics", icon: "ecg_heart" },
            { id: "routines", label: "Routines & Habits", icon: "published_with_changes" },
            { id: "nutrition", label: "Hydration & Nutrition", icon: "restaurant" },
            { id: "goals", label: "Milestones", icon: "insights" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`px-4 py-3 flex items-center gap-3.5 rounded-xl transition-colors text-left w-full cursor-pointer ${
                activeTab === item.id
                  ? "bg-primary/15 text-primary border-r-4 border-primary font-bold shadow-[0_0_15px_rgba(76,215,246,0.25)]"
                  : "text-on-surface-variant hover:text-white hover:bg-white/5"
              }`}
            >
              <span className="material-symbols-outlined text-lg">{item.icon}</span>
              <span className="text-xs sm:text-sm font-semibold">{item.label}</span>
            </button>
          ))}
        </div>

        <div className="p-4 border-t border-white/5 flex flex-col gap-2">
          <div className="flex justify-between items-center text-[11px] text-on-surface-variant font-mono">
            <button onClick={handleExportData} className="hover:text-primary transition flex items-center gap-1 cursor-pointer">
              <span className="material-symbols-outlined text-xs">download</span> Export
            </button>
            <button onClick={handleResetData} className="hover:text-error transition flex items-center gap-1 cursor-pointer">
              <span className="material-symbols-outlined text-xs">restart_alt</span> Reset
            </button>
          </div>
          <div className="text-lg tracking-tighter text-primary font-extrabold drop-shadow-[0_0_8px_rgba(76,215,246,0.5)]">
            LifeSync OS
          </div>
        </div>
      </nav>

      {/* Top Glassmorphic Header */}
      <Header
        onOpenAuth={() => setShowAuthModal(true)}
        onOpenSearch={() => setShowCommandPalette(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full overflow-y-auto overflow-x-hidden scroll-smooth pb-24 touch-pan-y relative pt-24 sm:pt-28 px-6 sm:px-12 max-w-[1440px] lg:ml-72">
        <motion.div
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.15}
          onDragEnd={handleDragEnd}
          style={{ touchAction: "pan-y" }}
          className="touch-pan-y w-full"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ type: "spring", stiffness: 350, damping: 28 }}
              className="w-full"
            >
              {renderActiveView()}
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <MobileBottomNav active={activeTab} onNav={(tab) => setActiveTab(tab)} />
    </div>
  );
}
