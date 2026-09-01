"use client";

import { motion } from "framer-motion";
import { BookOpen, Flame, Moon, Sparkles, Activity } from "lucide-react";

interface HeroTriadProps {
  studyMins: number;
  caloriesBurned: number;
  sleepHours: number;
  recoveryScore: number;
  onOpenStudy: () => void;
  onOpenWorkout: () => void;
  onOpenSleep: () => void;
}

export default function HeroTriad({
  studyMins,
  caloriesBurned,
  sleepHours,
  recoveryScore,
  onOpenStudy,
  onOpenWorkout,
  onOpenSleep,
}: HeroTriadProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4 w-full">
      {/* 1. FOCUS CARD */}
      <motion.div
        whileHover={{ y: -3, scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
        onClick={onOpenStudy}
        className="glass-primary p-4 sm:p-5 flex flex-col justify-between gap-3 cursor-pointer relative overflow-hidden group hover:border-cyan-500/40 transition-all duration-300"
      >
        <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/10 rounded-full blur-xl pointer-events-none group-hover:bg-cyan-500/20 transition-all" />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <BookOpen className="w-4 h-4" />
            </div>
            <span className="text-xs font-mono font-bold tracking-widest text-slate-300 uppercase">
              Focus
            </span>
          </div>
          <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
            Deep Work
          </span>
        </div>

        <div className="flex items-baseline gap-1.5 my-1">
          <span className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-gradient-cyan">
            {studyMins}
          </span>
          <span className="text-xs font-mono text-slate-400">mins today</span>
        </div>

        <div className="w-full bg-slate-900/80 h-1.5 rounded-full overflow-hidden border border-white/5">
          <div
            className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full shadow-[0_0_8px_rgba(6,182,212,0.6)]"
            style={{ width: `${Math.min(100, (studyMins / 180) * 100)}%` }}
          />
        </div>
      </motion.div>

      {/* 2. BURN CARD */}
      <motion.div
        whileHover={{ y: -3, scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
        onClick={onOpenWorkout}
        className="glass-primary p-4 sm:p-5 flex flex-col justify-between gap-3 cursor-pointer relative overflow-hidden group hover:border-orange-500/40 transition-all duration-300"
      >
        <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/10 rounded-full blur-xl pointer-events-none group-hover:bg-orange-500/20 transition-all" />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-orange-400">
              <Flame className="w-4 h-4" />
            </div>
            <span className="text-xs font-mono font-bold tracking-widest text-slate-300 uppercase">
              Burn
            </span>
          </div>
          <span className="text-[10px] font-mono text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded border border-orange-500/20">
            Active
          </span>
        </div>

        <div className="flex items-baseline gap-1.5 my-1">
          <span className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-gradient-orange">
            {caloriesBurned}
          </span>
          <span className="text-xs font-mono text-slate-400">kcal burned</span>
        </div>

        <div className="w-full bg-slate-900/80 h-1.5 rounded-full overflow-hidden border border-white/5">
          <div
            className="h-full bg-gradient-to-r from-orange-400 to-amber-500 rounded-full shadow-[0_0_8px_rgba(249,115,22,0.6)]"
            style={{ width: `${Math.min(100, (caloriesBurned / 2200) * 100)}%` }}
          />
        </div>
      </motion.div>

      {/* 3. REST CARD */}
      <motion.div
        whileHover={{ y: -3, scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
        onClick={onOpenSleep}
        className="glass-primary p-4 sm:p-5 flex flex-col justify-between gap-3 cursor-pointer relative overflow-hidden group hover:border-purple-500/40 transition-all duration-300"
      >
        <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full blur-xl pointer-events-none group-hover:bg-purple-500/20 transition-all" />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Moon className="w-4 h-4" />
            </div>
            <span className="text-xs font-mono font-bold tracking-widest text-slate-300 uppercase">
              Rest
            </span>
          </div>
          <span className="text-[10px] font-mono text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
            {recoveryScore}% Rec
          </span>
        </div>

        <div className="flex items-baseline gap-1.5 my-1">
          <span className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-gradient-violet">
            {sleepHours}
          </span>
          <span className="text-xs font-mono text-slate-400">hours sleep</span>
        </div>

        <div className="w-full bg-slate-900/80 h-1.5 rounded-full overflow-hidden border border-white/5">
          <div
            className="h-full bg-gradient-to-r from-purple-400 to-indigo-500 rounded-full shadow-[0_0_8px_rgba(168,85,247,0.6)]"
            style={{ width: `${Math.min(100, (sleepHours / 8) * 100)}%` }}
          />
        </div>
      </motion.div>
    </div>
  );
}
