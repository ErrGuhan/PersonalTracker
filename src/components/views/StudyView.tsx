"use client";

import { motion, type Variants } from "framer-motion";
import FocusTimer from "@/components/FocusTimer";
import StudyHeatmap from "@/components/StudyHeatmap";
import { useModals } from "@/context/ModalContext";
import { useStudyStats } from "@/hooks/useSupabase";

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

export default function StudyView() {
  const { openStudyModal } = useModals();
  const { data: studyStats, loading, refetch } = useStudyStats();

  const todayHours = (((studyStats?.todayMinutes || 0) / 60)).toFixed(1);
  const streakDays = studyStats?.streakDays ?? 0;
  const totalSessions = studyStats?.totalSessions ?? 0;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="flex flex-col gap-6 w-full pb-32 lg:pb-16"
    >
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3">
        <div>
          <h2 className="text-xl sm:text-3xl font-extrabold text-white tracking-tight">Study Studio</h2>
          <p className="text-xs sm:text-sm text-on-surface-variant mt-0.5">Deep focus mode & knowledge acquisition.</p>
        </div>
        <button
          onClick={openStudyModal}
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
          <p className="text-xl font-extrabold text-white">{loading ? "…" : `${todayHours}h`}</p>
          <p className="text-[10px] text-on-surface-variant font-mono uppercase mt-1">Today&apos;s Focus</p>
        </motion.div>

        <motion.div variants={itemVariants} className="glass-panel p-4 rounded-2xl text-center">
          <span className="material-symbols-outlined text-primary text-xl mb-1">local_fire_department</span>
          <p className="text-xl font-extrabold text-white">{loading ? "…" : streakDays}</p>
          <p className="text-[10px] text-on-surface-variant font-mono uppercase mt-1">Streak Days</p>
        </motion.div>

        <motion.div variants={itemVariants} className="glass-panel p-4 rounded-2xl text-center">
          <span className="material-symbols-outlined text-primary text-xl mb-1">checklist</span>
          <p className="text-xl font-extrabold text-white">{loading ? "…" : totalSessions}</p>
          <p className="text-[10px] text-on-surface-variant font-mono uppercase mt-1">Total Sessions</p>
        </motion.div>

        <motion.div variants={itemVariants} className="glass-panel p-4 rounded-2xl text-center">
          <span className="material-symbols-outlined text-primary text-xl mb-1">workspace_premium</span>
          <p className="text-xl font-extrabold text-primary">Active</p>
          <p className="text-[10px] text-on-surface-variant font-mono uppercase mt-1">Studio Status</p>
        </motion.div>
      </motion.div>

      <motion.section variants={itemVariants} className="glass-panel p-5 rounded-2xl">
        <h3 className="font-bold text-sm sm:text-base text-white mb-4">Study Consistency (16 Weeks)</h3>
        <StudyHeatmap data={studyStats?.heatmapData} />
      </motion.section>
    </motion.div>
  );
}
