"use client";

import { useState } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import WorkoutDetailModal from "@/components/WorkoutDetailModal";
import StudyHeatmap from "@/components/StudyHeatmap";
import EmptyState from "@/components/EmptyState";
import { useModals } from "@/context/ModalContext";
import { useRecentWorkouts, useWeeklyWorkoutStats } from "@/hooks/useSupabase";
import type { Workout } from "@/lib/database.types";

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
  hidden: { opacity: 0, scale: 0.97, y: 12 },
  show: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: "spring", stiffness: 350, damping: 26 },
  },
};

export default function FitnessView() {
  const { openWorkoutModal } = useModals();
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

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="flex flex-col gap-6 w-full pb-32 lg:pb-16"
      >
        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3">
          <div>
            <h2 className="text-xl sm:text-3xl font-extrabold text-white tracking-tight">Fitness Hub</h2>
            <p className="text-xs sm:text-sm text-on-surface-variant mt-0.5">Synchronize output. Elevate athletic performance.</p>
          </div>
          <button
            onClick={openWorkoutModal}
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
                  onAction={openWorkoutModal}
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
