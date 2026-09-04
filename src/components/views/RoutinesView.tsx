"use client";

import { motion, type Variants } from "framer-motion";
import HabitTrackerWidget from "@/components/HabitTrackerWidget";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

export default function RoutinesView() {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="flex flex-col gap-6 w-full pb-28 lg:pb-12"
    >
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] font-mono font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-cyan-400/10 text-cyan-300 border border-cyan-400/20">
            Daily Habits & Wins
          </span>
        </div>
        <h2 className="text-xl sm:text-3xl font-extrabold text-white tracking-tight">Routines & Habits</h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-0.5">Build compound streaks and disciplined daily routines.</p>
      </div>
      <HabitTrackerWidget />
    </motion.div>
  );
}
