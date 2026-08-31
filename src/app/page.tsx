"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence, PanInfo, type Variants } from "framer-motion";
import ConnectionStatus from "@/components/ConnectionStatus";
import LogWorkoutModal from "@/components/LogWorkoutModal";
import LogStudyModal from "@/components/LogStudyModal";
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
} from "@/hooks/useSupabase";

/* ─── Animated Framer Motion Glassmorphic Skeleton Card ───── */
const SkeletonCard = () => {
  return (
    <div className="p-5 sm:p-6 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 shadow-xl overflow-hidden relative h-[130px] sm:h-[140px] flex flex-col gap-4">
      <motion.div
        className="h-6 sm:h-7 w-3/4 bg-white/20 rounded-lg"
        animate={{ opacity: [0.4, 0.8, 0.4] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
      />
      <div className="flex flex-col gap-2">
        <motion.div
          className="h-3.5 sm:h-4 w-full bg-white/10 rounded-md"
          animate={{ opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.1 }}
        />
        <motion.div
          className="h-3.5 sm:h-4 w-5/6 bg-white/10 rounded-md"
          animate={{ opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
        />
      </div>
    </div>
  );
};

/* ─── Mobile Touch Swipe Navigation Order ──────────────────── */
const TABS = ["dashboard", "study", "fitness", "health", "goals"];

/* ─── Advanced Framer Motion Animation Variants ─── */
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, scale: 0.9, y: 20 },
  show: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 24,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.5,
    transition: { duration: 0.2 },
  },
};

/* ─────────────────────────────────────────────────────────
   1. DASHBOARD VIEW
   ───────────────────────────────────────────────────────── */
function DashboardView({
  onNav,
  onOpenWorkoutModal,
  onOpenStudyModal,
}: {
  onNav: (tab: string) => void;
  onOpenWorkoutModal: () => void;
  onOpenStudyModal: () => void;
}) {
  const { metrics, loading: mLoading } = useHealthMetrics();
  const { data: weeklyStats, loading: wLoading } = useWeeklyWorkoutStats();
  const { data: studyStats, loading: sLoading } = useStudyStats();
  const { data: sleepData, loading: slLoading } = useLatestSleep();
  const { workouts, loading: wListLoading } = useRecentWorkouts(3);
  const { submitMood, moodScore } = useLatestMood();

  const recoveryScore = metrics?.recovery_score ?? 84;
  const studyMins = studyStats?.todayMinutes ?? 0;
  const workoutCals = weeklyStats?.totalCalories ?? 0;
  const sleepHrs = sleepData?.hours ?? 7.5;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.1 }}
      exit="exit"
      className="flex flex-col gap-6 w-full max-w-full overflow-hidden"
    >
      {/* Hero Section: Living 3D Sync Ring */}
      <motion.section variants={itemVariants} className="flex flex-col items-center justify-center py-2 sm:py-6 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 sm:w-64 sm:h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none glow-cyan-active" />

        <div className="relative w-56 h-56 sm:w-72 sm:h-72 lg:w-80 lg:h-80 flex items-center justify-center">
          {/* Outer Ring: Study (Cyan) */}
          <svg className="absolute inset-0 w-full h-full circular-progress" viewBox="0 0 100 100">
            <circle cx="50" cy="50" fill="none" r="45" stroke="rgba(255,255,255,0.05)" strokeWidth="5" />
            <circle
              className="living-ring-cyan drop-shadow-[0_0_12px_rgba(76,215,246,0.8)] transition-all duration-1000 ease-out"
              cx="50" cy="50" fill="none" r="45" stroke="#4cd7f6" strokeWidth="5"
              strokeDasharray="282.7"
              strokeDashoffset={282.7 - Math.min(studyMins / 240, 1) * 282.7}
              strokeLinecap="round"
            />
          </svg>

          {/* Middle Ring: Fitness (Orange) */}
          <svg className="absolute inset-3 sm:inset-4 w-[calc(100%-1.5rem)] sm:w-[calc(100%-2rem)] h-[calc(100%-1.5rem)] sm:h-[calc(100%-2rem)] circular-progress" viewBox="0 0 100 100">
            <circle cx="50" cy="50" fill="none" r="40" stroke="rgba(255,255,255,0.05)" strokeWidth="5" />
            <circle
              className="living-ring-orange drop-shadow-[0_0_12px_rgba(236,106,6,0.8)] transition-all duration-1000 ease-out delay-100"
              cx="50" cy="50" fill="none" r="40" stroke="#ec6a06" strokeWidth="5"
              strokeDasharray="251.2"
              strokeDashoffset={251.2 - Math.min((metrics?.calories_burned ?? 0) / 2500, 1) * 251.2}
              strokeLinecap="round"
            />
          </svg>

          {/* Inner Ring: Sleep (Violet) */}
          <svg className="absolute inset-6 sm:inset-8 w-[calc(100%-3rem)] sm:w-[calc(100%-4rem)] h-[calc(100%-3rem)] sm:h-[calc(100%-4rem)] circular-progress" viewBox="0 0 100 100">
            <circle cx="50" cy="50" fill="none" r="35" stroke="rgba(255,255,255,0.05)" strokeWidth="5" />
            <circle
              className="living-ring-violet drop-shadow-[0_0_8px_rgba(179,149,255,0.6)] transition-all duration-1000 ease-out delay-200"
              cx="50" cy="50" fill="none" r="35" stroke="#b395ff" strokeWidth="5"
              strokeDasharray="219.9"
              strokeDashoffset={219.9 - Math.min(sleepHrs / 8, 1) * 219.9}
              strokeLinecap="round"
            />
          </svg>

          {/* Center Score Badge */}
          <div className="flex flex-col items-center justify-center text-center z-10 bg-surface-container/60 backdrop-blur-xl rounded-full w-28 h-28 sm:w-36 sm:h-36 lg:w-40 lg:h-40 border border-white/10 shadow-inner pulse-center">
            {mLoading ? (
              <motion.div animate={{ opacity: [0.4, 0.8, 0.4] }} transition={{ duration: 1.5, repeat: Infinity }} className="w-12 h-8 bg-white/20 rounded-md" />
            ) : (
              <span className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-on-surface tracking-tight">{recoveryScore}</span>
            )}
            <span className="font-mono text-[10px] sm:text-xs text-primary tracking-widest uppercase mt-0.5">Optimal</span>
          </div>
        </div>
      </motion.section>

      {/* Quick Actions Bento Grid */}
      <motion.section variants={containerVariants} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <motion.button
          variants={itemVariants}
          layout
          whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
          whileTap={{ scale: 0.98 }}
          onClick={onOpenStudyModal}
          className="tilt-card glass-panel relative overflow-hidden rounded-2xl p-5 sm:p-6 flex flex-col items-start justify-between h-32 sm:h-36 lg:h-40 text-left w-full cursor-pointer transform-gpu"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-tertiary-container/20 to-surface-container opacity-80" />
          <span className="material-symbols-outlined text-tertiary text-3xl sm:text-4xl relative z-10" style={{ fontVariationSettings: "'FILL' 1" }}>
            menu_book
          </span>
          <span className="font-bold text-base sm:text-lg text-on-surface relative z-10">Log Study</span>
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-tertiary/10 rounded-full blur-3xl pointer-events-none" />
        </motion.button>

        <motion.button
          variants={itemVariants}
          layout
          whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
          whileTap={{ scale: 0.98 }}
          onClick={onOpenWorkoutModal}
          className="tilt-card glass-panel relative overflow-hidden rounded-2xl p-5 sm:p-6 flex flex-col items-start justify-between h-32 sm:h-36 lg:h-40 text-left w-full cursor-pointer transform-gpu"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-secondary-container/20 to-surface-container opacity-80" />
          <span className="material-symbols-outlined text-secondary text-3xl sm:text-4xl relative z-10" style={{ fontVariationSettings: "'FILL' 1" }}>
            fitness_center
          </span>
          <span className="font-bold text-base sm:text-lg text-on-surface relative z-10">Log Workout</span>
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-secondary/10 rounded-full blur-3xl pointer-events-none" />
        </motion.button>

        <motion.button
          variants={itemVariants}
          layout
          whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onNav("health")}
          className="tilt-card glass-panel relative overflow-hidden rounded-2xl p-5 sm:p-6 flex flex-col items-start justify-between h-32 sm:h-36 lg:h-40 text-left w-full cursor-pointer transform-gpu"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary-container/20 to-surface-container opacity-80" />
          <span className="material-symbols-outlined text-primary text-3xl sm:text-4xl relative z-10" style={{ fontVariationSettings: "'FILL' 1" }}>
            mood
          </span>
          <span className="font-bold text-base sm:text-lg text-on-surface relative z-10">Daily Check-in</span>
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        </motion.button>
      </motion.section>

      {/* Summary KPI Cards */}
      <motion.section variants={containerVariants} className="grid grid-cols-3 gap-3 sm:gap-4">
        <motion.div
          variants={itemVariants}
          layout
          whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
          whileTap={{ scale: 0.98 }}
          className="tilt-card glass-panel rounded-xl p-3.5 sm:p-4 flex flex-col items-center justify-center gap-1 sm:gap-2 text-center transform-gpu relative overflow-hidden"
        >
          <span className="material-symbols-outlined text-primary text-lg sm:text-xl relative z-10">timer</span>
          <span className="text-lg sm:text-2xl text-on-surface font-extrabold relative z-10">
            {sLoading ? "…" : studyMins}
            <span className="text-xs font-normal text-on-surface-variant ml-0.5">m</span>
          </span>
          <span className="font-mono text-[10px] sm:text-xs text-on-surface-variant uppercase tracking-wider relative z-10">Study Today</span>
        </motion.div>

        <motion.div
          variants={itemVariants}
          layout
          whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
          whileTap={{ scale: 0.98 }}
          className="tilt-card glass-panel rounded-xl p-3.5 sm:p-4 flex flex-col items-center justify-center gap-1 sm:gap-2 text-center transform-gpu relative overflow-hidden"
        >
          <span className="material-symbols-outlined text-secondary text-lg sm:text-xl relative z-10">local_fire_department</span>
          <span className="text-lg sm:text-2xl text-on-surface font-extrabold relative z-10">
            {wLoading ? "…" : (metrics?.calories_burned ?? workoutCals)}
            <span className="text-xs font-normal text-on-surface-variant ml-0.5">kcal</span>
          </span>
          <span className="font-mono text-[10px] sm:text-xs text-on-surface-variant uppercase tracking-wider relative z-10">Workout</span>
        </motion.div>

        <motion.div
          variants={itemVariants}
          layout
          whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
          whileTap={{ scale: 0.98 }}
          className="tilt-card glass-panel rounded-xl p-3.5 sm:p-4 flex flex-col items-center justify-center gap-1 sm:gap-2 text-center transform-gpu relative overflow-hidden"
        >
          <span className="material-symbols-outlined text-tertiary text-lg sm:text-xl relative z-10">bedtime</span>
          <span className="text-lg sm:text-2xl text-on-surface font-extrabold relative z-10">
            {slLoading ? "…" : sleepHrs}
            <span className="text-xs font-normal text-on-surface-variant ml-0.5">h</span>
          </span>
          <span className="font-mono text-[10px] sm:text-xs text-on-surface-variant uppercase tracking-wider relative z-10">Sleep</span>
        </motion.div>
      </motion.section>

      {/* Activity Feed with PopLayout AnimatePresence */}
      <motion.section variants={itemVariants} className="glass-panel rounded-2xl p-4 sm:p-6 flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-white/5 pb-3">
          <h3 className="font-bold text-sm sm:text-base text-on-surface">Recent Output Activity</h3>
          <button onClick={() => onNav("fitness")} className="text-xs text-primary hover:underline font-medium cursor-pointer">
            View All
          </button>
        </div>

        <ul className="space-y-3">
          <AnimatePresence mode="popLayout">
            {wListLoading ? (
              [0, 1, 2].map((idx) => (
                <motion.div
                  key={`skeleton-activity-${idx}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                >
                  <SkeletonCard />
                </motion.div>
              ))
            ) : workouts.length === 0 ? (
              <motion.div
                key="empty-activity"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-8 text-on-surface-variant opacity-60"
              >
                <span className="material-symbols-outlined text-3xl mb-2">history</span>
                <p className="text-xs sm:text-sm text-center">No activity logged yet today.<br />Time to sync up.</p>
              </motion.div>
            ) : (
              workouts.map((w) => (
                <motion.li
                  key={w.id}
                  variants={itemVariants}
                  exit="exit"
                  layout
                  whileHover={{ scale: 1.01, transition: { duration: 0.2 } }}
                  whileTap={{ scale: 0.99 }}
                  className="flex items-center gap-3 sm:gap-4 p-3.5 rounded-xl bg-surface-container-low/60 border border-white/5 cursor-pointer transform-gpu shadow-lg"
                >
                  <div className="w-10 h-10 rounded-full bg-secondary-container/20 flex items-center justify-center border border-secondary-container/30 shrink-0">
                    <span className="material-symbols-outlined text-secondary text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>
                      fitness_center
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-bold text-on-surface truncate">{w.name}</p>
                    <p className="text-[11px] text-on-surface-variant">
                      {w.duration_min} mins · {w.calories} kcal
                    </p>
                  </div>
                  <span className="text-xs text-secondary font-bold shrink-0">{w.workout_date}</span>
                </motion.li>
              ))
            )}
          </AnimatePresence>
        </ul>
      </motion.section>

      {/* Mood Check-In Widget */}
      <motion.section variants={itemVariants} className="glass-panel rounded-2xl p-4 sm:p-6">
        <h3 className="font-bold text-sm sm:text-base text-on-surface mb-3 sm:mb-4">Daily Mood Check-In</h3>
        <MoodSelector initialScore={moodScore ?? undefined} onSelect={submitMood} />
      </motion.section>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────
   2. FITNESS HUB VIEW
   ───────────────────────────────────────────────────────── */
function FitnessView({ onOpenWorkoutModal }: { onOpenWorkoutModal: () => void }) {
  const { workouts, loading: wLoading } = useRecentWorkouts(10);
  const { data: weeklyStats, loading: wsLoading } = useWeeklyWorkoutStats();

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.1 }}
      exit="exit"
      className="flex flex-col gap-6 w-full max-w-full overflow-hidden"
    >
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3">
        <div>
          <h2 className="text-xl sm:text-3xl font-extrabold text-on-surface">Fitness Hub</h2>
          <p className="text-xs sm:text-sm text-on-surface-variant mt-0.5">Synchronize output. Elevate performance.</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.03, transition: { duration: 0.2 } }}
          whileTap={{ scale: 0.96 }}
          onClick={onOpenWorkoutModal}
          className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-secondary-container text-white font-semibold text-xs sm:text-sm hover:bg-secondary-container/90 transition shadow-[0_0_20px_rgba(236,106,6,0.4)] flex items-center justify-center gap-2 cursor-pointer transform-gpu"
        >
          <span className="material-symbols-outlined text-base">add_task</span>
          Log Activity
        </motion.button>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 flex flex-col gap-6">
          <motion.div variants={containerVariants} className="grid grid-cols-3 gap-3">
            <motion.div variants={itemVariants} layout whileHover={{ scale: 1.02 }} className="glass-panel p-3.5 rounded-xl flex flex-col items-center text-center transform-gpu">
              <span className="material-symbols-outlined text-secondary text-xl mb-1">local_fire_department</span>
              <span className="text-lg sm:text-2xl font-extrabold text-on-surface">
                {wsLoading ? "…" : (weeklyStats?.totalCalories ?? 0).toLocaleString()}
              </span>
              <span className="text-[10px] text-on-surface-variant font-mono uppercase mt-0.5">Weekly kcal</span>
            </motion.div>

            <motion.div variants={itemVariants} layout whileHover={{ scale: 1.02 }} className="glass-panel p-3.5 rounded-xl flex flex-col items-center text-center transform-gpu">
              <span className="material-symbols-outlined text-secondary text-xl mb-1">timer</span>
              <span className="text-lg sm:text-2xl font-extrabold text-on-surface">
                {wsLoading ? "…" : (weeklyStats?.totalMinutes ?? 0)}
              </span>
              <span className="text-[10px] text-on-surface-variant font-mono uppercase mt-0.5">Active Mins</span>
            </motion.div>

            <motion.div variants={itemVariants} layout whileHover={{ scale: 1.02 }} className="glass-panel p-3.5 rounded-xl flex flex-col items-center text-center transform-gpu">
              <span className="material-symbols-outlined text-secondary text-xl mb-1">distance</span>
              <span className="text-lg sm:text-2xl font-extrabold text-on-surface">
                {wsLoading ? "…" : (weeklyStats?.totalDistance ?? 0).toFixed(1)}
              </span>
              <span className="text-[10px] text-on-surface-variant font-mono uppercase mt-0.5">Distance km</span>
            </motion.div>
          </motion.div>

          <motion.section variants={itemVariants} className="glass-panel rounded-2xl p-4 sm:p-6">
            <h3 className="font-bold text-sm sm:text-base text-on-surface mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary">history</span>
              Workout Logs
            </h3>

            <ul className="space-y-3">
              <AnimatePresence mode="popLayout">
                {wLoading ? (
                  [0, 1, 2, 3].map((idx) => (
                    <motion.div
                      key={`skeleton-fitness-${idx}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                    >
                      <SkeletonCard />
                    </motion.div>
                  ))
                ) : workouts.length === 0 ? (
                  <motion.p
                    key="empty-fitness"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-xs sm:text-sm text-center py-8 text-on-surface-variant"
                  >
                    No workout logs found. Click "Log Activity" to start tracking! 💪
                  </motion.p>
                ) : (
                  workouts.map((w) => (
                    <motion.li
                      key={w.id}
                      variants={itemVariants}
                      exit="exit"
                      layout
                      whileHover={{ scale: 1.01, transition: { duration: 0.2 } }}
                      whileTap={{ scale: 0.99 }}
                      className="flex items-center gap-3 sm:gap-4 p-3.5 rounded-xl bg-surface-container-low/60 border border-white/5 hover:border-secondary/30 transition cursor-pointer transform-gpu shadow-lg"
                    >
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-secondary-container/20 flex items-center justify-center border border-secondary-container/30 text-secondary shrink-0">
                        <span className="material-symbols-outlined text-lg sm:text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                          fitness_center
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm font-bold text-on-surface truncate">{w.name}</p>
                        <p className="text-[11px] text-on-surface-variant">
                          {w.workout_date} · {w.duration_min} min
                          {w.distance_km ? ` · ${w.distance_km} km` : ""}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-sm sm:text-base font-extrabold text-secondary">{w.calories}</span>
                        <span className="block text-[9px] text-on-surface-variant font-mono uppercase">KCAL</span>
                      </div>
                    </motion.li>
                  ))
                )}
              </AnimatePresence>
            </ul>
          </motion.section>
        </div>

        <div className="lg:col-span-5 flex flex-col gap-6">
          <motion.section variants={itemVariants} className="glass-panel rounded-2xl p-4 sm:p-6">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary">calendar_month</span>
                <h3 className="font-bold text-sm sm:text-base text-on-surface">52-Week Output</h3>
              </div>
              <span className="text-[10px] text-secondary bg-secondary/10 px-2 py-0.5 rounded-full border border-secondary/30 font-mono">
                284 Active Days
              </span>
            </div>

            <StudyHeatmap />
          </motion.section>

          <motion.section variants={itemVariants} className="glass-panel rounded-2xl p-4 sm:p-6">
            <h3 className="font-bold text-sm sm:text-base text-on-surface mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>
                workspace_premium
              </span>
              Milestones & PRs
            </h3>

            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3 sm:gap-4 bg-surface-container-low p-3.5 rounded-xl border border-white/5">
                <div className="w-9 h-9 rounded-full bg-secondary-container flex items-center justify-center text-white shrink-0">
                  <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>
                    local_fire_department
                  </span>
                </div>
                <div>
                  <p className="text-[10px] text-on-surface-variant font-mono uppercase">Current Streak</p>
                  <p className="text-sm sm:text-base font-bold text-on-surface">12 Days</p>
                </div>
              </div>

              <div className="flex items-center gap-3 sm:gap-4 bg-surface-container-low p-3.5 rounded-xl border border-white/5">
                <div className="w-9 h-9 rounded-full bg-surface-variant flex items-center justify-center text-secondary shrink-0">
                  <span className="material-symbols-outlined text-base">bolt</span>
                </div>
                <div>
                  <p className="text-[10px] text-on-surface-variant font-mono uppercase">YTD Output</p>
                  <p className="text-sm sm:text-base font-bold text-secondary">142,000 <span className="text-xs font-normal text-on-surface-variant">kcal</span></p>
                </div>
              </div>
            </div>
          </motion.section>
        </div>
      </div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────
   3. STUDY STUDIO VIEW
   ───────────────────────────────────────────────────────── */
function StudyView({ onOpenStudyModal }: { onOpenStudyModal: () => void }) {
  const { data: studyStats, loading, refetch } = useStudyStats();

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.1 }}
      exit="exit"
      className="flex flex-col gap-6 w-full max-w-full overflow-hidden"
    >
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3">
        <div>
          <h2 className="text-xl sm:text-3xl font-extrabold text-on-surface">Study Studio</h2>
          <p className="text-xs sm:text-sm text-on-surface-variant mt-0.5">Deep focus mode. Knowledge acquisition.</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.03, transition: { duration: 0.2 } }}
          whileTap={{ scale: 0.96 }}
          onClick={onOpenStudyModal}
          className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-primary text-on-primary font-semibold text-xs sm:text-sm hover:bg-primary/90 transition shadow-[0_0_20px_rgba(76,215,246,0.4)] flex items-center justify-center gap-2 cursor-pointer transform-gpu"
        >
          <span className="material-symbols-outlined text-base">menu_book</span>
          Log Session
        </motion.button>
      </motion.div>

      <motion.div variants={itemVariants} className="glass-panel p-6 sm:p-8 rounded-2xl flex justify-center border-t-2 border-primary/40">
        <FocusTimer initialMinutes={25} onSessionComplete={refetch} />
      </motion.div>

      <motion.div variants={containerVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <motion.div variants={itemVariants} layout whileHover={{ scale: 1.02 }} className="glass-panel p-3.5 sm:p-4 rounded-xl text-center transform-gpu">
          <span className="material-symbols-outlined text-primary text-xl sm:text-2xl mb-1">schedule</span>
          <p className="text-xl sm:text-2xl font-extrabold text-on-surface">{loading ? "…" : ((studyStats?.todayMinutes ?? 0) / 60).toFixed(1)}h</p>
          <p className="text-[10px] text-on-surface-variant font-mono uppercase mt-1">Today's Focus</p>
        </motion.div>

        <motion.div variants={itemVariants} layout whileHover={{ scale: 1.02 }} className="glass-panel p-3.5 sm:p-4 rounded-xl text-center transform-gpu">
          <span className="material-symbols-outlined text-primary text-xl sm:text-2xl mb-1">local_fire_department</span>
          <p className="text-xl sm:text-2xl font-extrabold text-on-surface">{loading ? "…" : (studyStats?.streakDays ?? 0)}</p>
          <p className="text-[10px] text-on-surface-variant font-mono uppercase mt-1">Streak Days</p>
        </motion.div>

        <motion.div variants={itemVariants} layout whileHover={{ scale: 1.02 }} className="glass-panel p-3.5 sm:p-4 rounded-xl text-center transform-gpu">
          <span className="material-symbols-outlined text-primary text-xl sm:text-2xl mb-1">checklist</span>
          <p className="text-xl sm:text-2xl font-extrabold text-on-surface">{loading ? "…" : (studyStats?.totalSessions ?? 0)}</p>
          <p className="text-[10px] text-on-surface-variant font-mono uppercase mt-1">Total Sessions</p>
        </motion.div>

        <motion.div variants={itemVariants} layout whileHover={{ scale: 1.02 }} className="glass-panel p-3.5 sm:p-4 rounded-xl text-center transform-gpu">
          <span className="material-symbols-outlined text-primary text-xl sm:text-2xl mb-1">grade</span>
          <p className="text-xl sm:text-2xl font-extrabold text-primary">3.92</p>
          <p className="text-[10px] text-on-surface-variant font-mono uppercase mt-1">GPA Target</p>
        </motion.div>
      </motion.div>

      <motion.div variants={itemVariants} className="glass-panel p-4 sm:p-6 rounded-2xl">
        <h3 className="font-bold text-sm sm:text-base text-on-surface mb-4">Study Consistency (16 Weeks)</h3>
        <StudyHeatmap data={studyStats?.heatmapData} />
      </motion.div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────
   4. HEALTH ANALYTICS VIEW
   ───────────────────────────────────────────────────────── */
function HealthView() {
  const { metrics, loading: mLoading } = useHealthMetrics();
  const { data: latestSleep, loading: sLoading } = useLatestSleep();
  const { submitMood, moodScore } = useLatestMood();

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.1 }}
      exit="exit"
      className="flex flex-col gap-6 w-full max-w-full overflow-hidden"
    >
      <motion.div variants={itemVariants}>
        <h2 className="text-xl sm:text-3xl font-extrabold text-on-surface">Health & Recovery</h2>
        <p className="text-xs sm:text-sm text-on-surface-variant mt-0.5">Circadian Rhythm & Vital Signs Analysis</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div variants={itemVariants} className="glass-panel p-5 sm:p-6 rounded-2xl border-t-2 border-tertiary">
          <h3 className="font-bold text-sm sm:text-base text-on-surface mb-4">Last Night's Sleep</h3>
          {sLoading ? (
            <motion.div animate={{ opacity: [0.4, 0.8, 0.4] }} transition={{ duration: 1.5, repeat: Infinity }} className="h-28 bg-white/10 rounded-xl" />
          ) : (
            <SleepBar
              hours={latestSleep?.hours ?? 7.5}
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
          <h3 className="font-bold text-sm sm:text-base text-on-surface mb-4">Body Recovery Score</h3>
          <div className="w-32 h-32 sm:w-36 sm:h-36 rounded-full bg-surface-container/60 border-2 border-tertiary/50 flex flex-col items-center justify-center shadow-[0_0_30px_rgba(179,149,255,0.3)]">
            <span className="text-3xl sm:text-4xl font-extrabold text-tertiary">{metrics?.recovery_score ?? 84}%</span>
            <span className="text-[10px] text-on-surface-variant font-mono uppercase mt-0.5">OPTIMAL</span>
          </div>
          <p className="text-xs text-on-surface-variant mt-4">
            System is fully restored. High readiness for intensive output.
          </p>
        </motion.div>
      </div>

      <motion.div variants={containerVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <motion.div variants={itemVariants} layout whileHover={{ scale: 1.02 }} className="glass-panel p-3.5 sm:p-4 rounded-xl text-center transform-gpu">
          <span className="material-symbols-outlined text-tertiary text-xl sm:text-2xl mb-1">ecg_heart</span>
          <p className="text-lg sm:text-2xl font-extrabold text-on-surface">{mLoading ? "…" : (metrics?.hrv_ms ?? 68)} ms</p>
          <p className="text-[10px] text-on-surface-variant font-mono uppercase mt-1">HRV Score</p>
        </motion.div>

        <motion.div variants={itemVariants} layout whileHover={{ scale: 1.02 }} className="glass-panel p-3.5 sm:p-4 rounded-xl text-center transform-gpu">
          <span className="material-symbols-outlined text-tertiary text-xl sm:text-2xl mb-1">air</span>
          <p className="text-lg sm:text-2xl font-extrabold text-on-surface">{mLoading ? "…" : (metrics?.spo2 ?? 98)}%</p>
          <p className="text-[10px] text-on-surface-variant font-mono uppercase mt-1">SpO₂ Level</p>
        </motion.div>

        <motion.div variants={itemVariants} layout whileHover={{ scale: 1.02 }} className="glass-panel p-3.5 sm:p-4 rounded-xl text-center transform-gpu">
          <span className="material-symbols-outlined text-tertiary text-xl sm:text-2xl mb-1">device_thermostat</span>
          <p className="text-lg sm:text-2xl font-extrabold text-on-surface">{mLoading ? "…" : (metrics?.body_temp ?? 36.6)}°C</p>
          <p className="text-[10px] text-on-surface-variant font-mono uppercase mt-1">Body Temp</p>
        </motion.div>

        <motion.div variants={itemVariants} layout whileHover={{ scale: 1.02 }} className="glass-panel p-3.5 sm:p-4 rounded-xl text-center transform-gpu">
          <span className="material-symbols-outlined text-tertiary text-xl sm:text-2xl mb-1">psychology</span>
          <p className="text-lg sm:text-2xl font-extrabold text-on-surface">{mLoading ? "…" : (metrics?.stress_pct ?? 28)}%</p>
          <p className="text-[10px] text-on-surface-variant font-mono uppercase mt-1">Stress Level</p>
        </motion.div>
      </motion.div>

      <motion.div variants={itemVariants} className="glass-panel p-4 sm:p-6 rounded-2xl">
        <h3 className="font-bold text-sm sm:text-base text-on-surface mb-4">Mental Check-In</h3>
        <MoodSelector initialScore={moodScore ?? undefined} onSelect={submitMood} />
      </motion.div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────
   5. GOALS VIEW
   ───────────────────────────────────────────────────────── */
function GoalsView({ onShowToast }: { onShowToast: (msg: string) => void }) {
  const { goals, loading, updating, updateProgress } = useGoals();

  const handleUpdate = async (id: string, newProg: number, title: string) => {
    await updateProgress(id, newProg);
    onShowToast(`🎯 Goal updated: "${title}" is now at ${newProg}%!`);
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.1 }}
      exit="exit"
      className="flex flex-col gap-6 w-full max-w-full overflow-hidden"
    >
      <motion.div variants={itemVariants}>
        <h2 className="text-xl sm:text-3xl font-extrabold text-on-surface">Milestones & Goals</h2>
        <p className="text-xs sm:text-sm text-on-surface-variant mt-0.5">Track strategic objectives and achievements</p>
      </motion.div>

      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        <AnimatePresence mode="popLayout">
          {loading ? (
            [0, 1, 2, 3].map((index) => (
              <motion.div
                key={`skeleton-goal-${index}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
              >
                <SkeletonCard />
              </motion.div>
            ))
          ) : goals.length === 0 ? (
            <motion.p
              key="empty-goals"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="col-span-full text-xs sm:text-sm text-center py-12 text-on-surface-variant"
            >
              No goals found. Execute the database seed to load initial goals! 🎯
            </motion.p>
          ) : (
            goals.map((g) => (
              <motion.li
                key={g.id}
                variants={itemVariants}
                exit="exit"
                layout
                whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
                whileTap={{ scale: 0.98 }}
                className="glass-panel p-4 sm:p-6 rounded-2xl flex flex-col gap-4 transform-gpu relative overflow-hidden shadow-xl"
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-lg sm:text-xl shrink-0">
                      {g.icon}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm sm:text-base text-on-surface">{g.title}</h3>
                      <p className="text-[10px] text-primary font-mono uppercase">{g.category}</p>
                    </div>
                  </div>
                  <span className="text-lg sm:text-xl font-extrabold text-primary shrink-0">{g.progress}%</span>
                </div>

                <div className="w-full bg-surface-container-highest h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-primary h-full rounded-full transition-all duration-500"
                    style={{ width: `${g.progress}%` }}
                  />
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

                <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
              </motion.li>
            ))
          )}
        </AnimatePresence>
      </ul>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────
   MAIN PAGE: SUPABASE AUTH & FULL STACK INTEGRATION
   ───────────────────────────────────────────────────────── */
export default function Home() {
  const { user, isAuthenticated, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showWorkoutModal, setShowWorkoutModal] = useState(false);
  const [showStudyModal, setShowStudyModal] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
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
          />
        );
      case "study":
        return <StudyView onOpenStudyModal={() => setShowStudyModal(true)} />;
      case "fitness":
        return <FitnessView onOpenWorkoutModal={() => setShowWorkoutModal(true)} />;
      case "health":
        return <HealthView />;
      case "goals":
        return <GoalsView onShowToast={showToast} />;
      default:
        return (
          <DashboardView
            onNav={setActiveTab}
            onOpenWorkoutModal={() => setShowWorkoutModal(true)}
            onOpenStudyModal={() => setShowStudyModal(true)}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-background text-on-background relative overflow-x-hidden">
      {/* Toast Notification Banner */}
      <ToastNotification message={toastMsg} onClear={() => setToastMsg(null)} />

      {/* Command Palette (Cmd+K) */}
      <CommandPalette
        isOpen={showCommandPalette}
        onClose={() => setShowCommandPalette(false)}
        onSelectNav={setActiveTab}
        onOpenWorkoutModal={() => setShowWorkoutModal(true)}
        onOpenStudyModal={() => setShowStudyModal(true)}
        onShowToast={showToast}
      />

      {/* Supabase Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={(msg) => showToast(msg)}
      />

      {/* Modals with AnimatePresence */}
      <AnimatePresence>
        {showWorkoutModal && (
          <LogWorkoutModal
            key="workout-modal"
            onClose={() => setShowWorkoutModal(false)}
            onSaved={() => showToast("🏃 Workout activity logged to Supabase!")}
          />
        )}
        {showStudyModal && (
          <LogStudyModal
            key="study-modal"
            onClose={() => setShowStudyModal(false)}
            onSaved={() => showToast("📚 Study session logged to Supabase!")}
          />
        )}
      </AnimatePresence>

      {/* Navigation Drawer (Desktop LG+) */}
      <nav className="hidden lg:flex flex-col fixed left-0 top-0 h-full z-[60] bg-surface-dim/95 backdrop-blur-2xl w-72 rounded-r-2xl border-r border-white/10 shadow-2xl">
        <div className="p-6 border-b border-white/5">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-full overflow-hidden border border-white/10 relative bg-primary/20 flex items-center justify-center font-bold text-xl text-primary">
              ⚡
            </div>
            <div className="min-w-0">
              <h2 className="font-bold text-base text-on-surface truncate">
                {isAuthenticated ? user?.email?.split("@")[0] : "Alex Chen"}
              </h2>
              <p className="text-xs text-on-surface-variant font-mono truncate">
                {isAuthenticated ? user?.email : "Level 24 Performer"}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between bg-surface-container/50 rounded-xl p-3 glass-panel">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>
                local_fire_department
              </span>
              <span className="text-xs text-secondary font-semibold font-mono">12 Day Streak</span>
            </div>
            {isAuthenticated ? (
              <button
                onClick={async () => {
                  await signOut();
                  showToast("Signed out of Supabase session.");
                }}
                className="text-[10px] text-error hover:underline font-mono"
              >
                Sign Out
              </button>
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                className="text-[10px] text-primary hover:underline font-mono"
              >
                Sign In
              </button>
            )}
          </div>
        </div>

        {/* Desktop Nav Buttons */}
        <div className="flex flex-col gap-2 p-4 flex-grow">
          {[
            { id: "dashboard", label: "Dashboard", icon: "dashboard" },
            { id: "study", label: "Study Studio", icon: "menu_book" },
            { id: "fitness", label: "Fitness Hub", icon: "fitness_center" },
            { id: "health", label: "Health Analytics", icon: "ecg_heart" },
            { id: "goals", label: "Milestones", icon: "insights" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`px-5 py-3.5 flex items-center gap-4 rounded-xl transition-colors text-left w-full cursor-pointer ${
                activeTab === item.id
                  ? "bg-primary/10 text-primary border-r-4 border-primary font-bold shadow-[0_0_15px_rgba(76,215,246,0.2)]"
                  : "text-on-surface-variant hover:text-on-surface hover:bg-white/5"
              }`}
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              <span className="text-sm font-semibold">{item.label}</span>
            </button>
          ))}
        </div>

        <div className="p-6 border-t border-white/5 flex items-center justify-between">
          <div className="text-xl tracking-tighter text-primary font-extrabold drop-shadow-[0_0_8px_rgba(76,215,246,0.5)]">
            LifeSync OS
          </div>
          {!isAuthenticated && (
            <button
              onClick={() => setShowAuthModal(true)}
              className="text-xs text-primary bg-primary/10 border border-primary/30 px-3 py-1 rounded-lg font-semibold hover:bg-primary/20 transition"
            >
              Auth
            </button>
          )}
        </div>
      </nav>

      {/* Top Header */}
      <header className="fixed top-0 left-0 w-full lg:w-[calc(100%-18rem)] lg:left-72 z-50 flex justify-between items-center px-4 sm:px-8 h-16 bg-surface/70 backdrop-blur-xl border-b border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.36)]">
        <div className="flex items-center gap-3">
          <div className="lg:hidden w-7 h-7 rounded-lg bg-primary/20 flex items-center justify-center text-primary text-xs font-bold">
            ⚡
          </div>
          <span className="lg:hidden font-bold text-sm text-primary tracking-tight">LifeSync OS</span>

          {/* Command Palette Trigger */}
          <button
            onClick={() => setShowCommandPalette(true)}
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface-container/60 border border-white/10 text-on-surface-variant hover:text-on-surface hover:border-primary/40 transition text-xs font-medium cursor-pointer"
          >
            <span className="material-symbols-outlined text-base text-primary">search</span>
            <span>Search & Commands</span>
            <span className="font-mono text-[10px] bg-white/10 px-1.5 py-0.5 rounded border border-white/10 ml-2">
              ⌘K
            </span>
          </button>
        </div>

        <div className="flex items-center gap-3">
          {!isAuthenticated ? (
            <button
              onClick={() => setShowAuthModal(true)}
              className="px-3 py-1.5 rounded-xl bg-primary/15 border border-primary/40 text-primary text-xs font-bold hover:bg-primary/25 transition cursor-pointer"
            >
              Sign In
            </button>
          ) : (
            <button
              onClick={async () => {
                await signOut();
                showToast("Signed out of Supabase.");
              }}
              className="px-3 py-1.5 rounded-xl bg-surface-container-high border border-white/10 text-on-surface-variant hover:text-error text-xs font-mono transition cursor-pointer"
            >
              Sign Out
            </button>
          )}

          <button
            onClick={() => setShowCommandPalette(true)}
            className="sm:hidden p-2 rounded-xl bg-surface-container/60 border border-white/10 text-on-surface-variant"
          >
            <span className="material-symbols-outlined text-lg">search</span>
          </button>

          <ConnectionStatus />
        </div>
      </header>

      {/* Main Container */}
      <main className="pt-20 sm:pt-24 px-4 sm:px-8 pb-28 sm:pb-12 max-w-[1440px] lg:ml-72 w-full overflow-hidden">
        <motion.div
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.15}
          onDragEnd={handleDragEnd}
          className="touch-pan-y w-full"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="w-full"
            >
              {renderActiveView()}
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </main>

      {/* Bottom Nav Bar (Mobile ONLY) */}
      <nav className="lg:hidden fixed bottom-4 left-1/2 -translate-x-1/2 w-[92%] max-w-md rounded-full bg-surface-container/90 backdrop-blur-2xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.6)] z-50 flex justify-around items-center px-3 py-2">
        {[
          { id: "dashboard", icon: "dashboard" },
          { id: "study", icon: "menu_book" },
          { id: "fitness", icon: "fitness_center" },
          { id: "health", icon: "ecg_heart" },
          { id: "goals", icon: "insights" },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex items-center justify-center p-2.5 rounded-full transition-all active:scale-95 ${
              activeTab === item.id
                ? "bg-primary/20 text-primary shadow-[0_0_15px_rgba(76,215,246,0.4)]"
                : "text-on-surface-variant hover:text-primary"
            }`}
          >
            <span className="material-symbols-outlined text-xl">{item.icon}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
