"use client";

import { motion, type Variants } from "framer-motion";
import FocusTimer from "@/components/FocusTimer";
import StudyHeatmap from "@/components/StudyHeatmap";
import { useModals } from "@/context/ModalContext";
import { useStudyStats } from "@/hooks/useSupabase";
import { Clock, Flame, CheckSquare, Award, Plus, BookOpen } from "lucide-react";

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
      className="flex flex-col gap-6 w-full pb-28 lg:pb-12"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-cyan-400/10 text-cyan-300 border border-cyan-400/20">
              Cognitive Focus
            </span>
          </div>
          <h2 className="text-xl sm:text-3xl font-extrabold text-white tracking-tight">Study Studio</h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">Deep focus mode, pomodoro intervals & cognitive consistency.</p>
        </div>
        <button
          onClick={openStudyModal}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-cyan-500 text-slate-950 font-bold text-xs shadow-[0_0_15px_rgba(76,215,246,0.35)] hover:brightness-110 active:scale-95 transition cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Log Session</span>
        </button>
      </motion.div>

      {/* Focus Timer Hero */}
      <motion.div variants={itemVariants} className="liquid-glass p-6 sm:p-8 rounded-3xl flex justify-center border border-white/[0.08] shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-36 bg-cyan-500/[0.07] rounded-full blur-3xl pointer-events-none" />
        <FocusTimer initialMinutes={25} onSessionComplete={refetch} />
      </motion.div>

      {/* Metrics Row */}
      <motion.div variants={containerVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <motion.div variants={itemVariants} className="liquid-glass p-4 rounded-2xl text-center border border-white/[0.06]">
          <div className="w-8 h-8 rounded-xl bg-cyan-400/10 flex items-center justify-center text-cyan-400 mx-auto mb-1.5">
            <Clock className="w-4 h-4" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-white font-mono">{loading ? "…" : `${todayHours}h`}</p>
          <p className="text-[10px] text-slate-400 font-mono uppercase tracking-wider mt-1">Today&apos;s Focus</p>
        </motion.div>

        <motion.div variants={itemVariants} className="liquid-glass p-4 rounded-2xl text-center border border-white/[0.06]">
          <div className="w-8 h-8 rounded-xl bg-amber-400/10 flex items-center justify-center text-amber-400 mx-auto mb-1.5">
            <Flame className="w-4 h-4" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-white font-mono">{loading ? "…" : streakDays}</p>
          <p className="text-[10px] text-slate-400 font-mono uppercase tracking-wider mt-1">Streak Days</p>
        </motion.div>

        <motion.div variants={itemVariants} className="liquid-glass p-4 rounded-2xl text-center border border-white/[0.06]">
          <div className="w-8 h-8 rounded-xl bg-purple-400/10 flex items-center justify-center text-purple-300 mx-auto mb-1.5">
            <CheckSquare className="w-4 h-4" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-white font-mono">{loading ? "…" : totalSessions}</p>
          <p className="text-[10px] text-slate-400 font-mono uppercase tracking-wider mt-1">Total Sessions</p>
        </motion.div>

        <motion.div variants={itemVariants} className="liquid-glass p-4 rounded-2xl text-center border border-white/[0.06]">
          <div className="w-8 h-8 rounded-xl bg-cyan-400/10 flex items-center justify-center text-cyan-400 mx-auto mb-1.5">
            <Award className="w-4 h-4" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-cyan-300 font-mono">Active</p>
          <p className="text-[10px] text-slate-400 font-mono uppercase tracking-wider mt-1">Studio Status</p>
        </motion.div>
      </motion.div>

      {/* Heatmap Section */}
      <motion.section variants={itemVariants} className="liquid-glass p-5 sm:p-6 rounded-3xl border border-white/[0.08] shadow-2xl">
        <div className="flex items-center gap-2 mb-4">
          <BookOpen className="w-4 h-4 text-cyan-400" />
          <h3 className="font-bold text-sm sm:text-base text-white">Study Consistency Heatmap (16 Weeks)</h3>
        </div>
        <StudyHeatmap data={studyStats?.heatmapData} />
      </motion.section>
    </motion.div>
  );
}
