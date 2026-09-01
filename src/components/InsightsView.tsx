"use client";

import { motion } from "framer-motion";
import { Brain, Award, Sparkles, TrendingUp, CheckCircle2, ArrowRight } from "lucide-react";
import InsightsEngine from "@/components/InsightsEngine";
import HabitHeatmap from "@/components/HabitHeatmap";
import type { SleepLog, HabitLog, Habit } from "@/lib/database.types";

interface InsightsViewProps {
  habits: Habit[];
  habitLogs: HabitLog[];
  sleepData: SleepLog | null;
  studyMinutes: number;
  workoutCount: number;
  recoveryScore: number;
}

export default function InsightsView({
  habits,
  habitLogs,
  sleepData,
  studyMinutes,
  workoutCount,
  recoveryScore,
}: InsightsViewProps) {
  const maxStreak = habits.reduce((max, h) => Math.max(max, h.streak), 0);

  return (
    <div className="flex flex-col gap-6 w-full pb-16">
      {/* WEEKLY REVIEW SIGNATURE FEATURE */}
      <div className="glass-primary p-6 sm:p-7 rounded-3xl flex flex-col gap-5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-slate-950 font-bold shadow-[0_0_15px_rgba(6,182,212,0.4)]">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-black text-lg sm:text-xl text-white tracking-tight">Your Signature Weekly Review</h2>
              <p className="text-xs text-slate-400">Automated performance summary and consistency breakdown.</p>
            </div>
          </div>

          <span className="text-xs font-mono font-bold bg-cyan-500/10 text-cyan-400 px-3 py-1.5 rounded-xl border border-cyan-500/20 self-start sm:self-auto">
            Overall Consistency: 84%
          </span>
        </div>

        {/* Weekly Wins & Improvements Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Wins */}
          <div className="glass-secondary p-4.5 rounded-2xl flex flex-col gap-2 border-emerald-500/30">
            <span className="text-xs font-extrabold uppercase font-mono text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" /> Weekly Wins
            </span>
            <ul className="text-xs text-slate-300 space-y-1.5 mt-1">
              <li>• Completed 11 study sessions</li>
              <li>• Maintained 4 active workout days</li>
              <li>• 32 daily habit routine completions</li>
            </ul>
          </div>

          {/* Improved Areas */}
          <div className="glass-secondary p-4.5 rounded-2xl flex flex-col gap-2 border-cyan-500/30">
            <span className="text-xs font-extrabold uppercase font-mono text-cyan-400 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4" /> Areas Improved
            </span>
            <ul className="text-xs text-slate-300 space-y-1.5 mt-1">
              <li>• Study focus time +18% vs last week</li>
              <li>• Daily hydration target +11%</li>
              <li>• Rest Day tokens preserved</li>
            </ul>
          </div>

          {/* Next Week Focus */}
          <div className="glass-secondary p-4.5 rounded-2xl flex flex-col gap-2 border-purple-500/30">
            <span className="text-xs font-extrabold uppercase font-mono text-purple-400 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" /> Next Week Focus
            </span>
            <p className="text-xs text-slate-300 leading-relaxed mt-1">
              Maintain consistent sleep times and complete evening study sessions before 9:00 PM.
            </p>
          </div>
        </div>
      </div>

      {/* RULE-BASED INSIGHTS ENGINE */}
      <InsightsEngine
        sleepData={sleepData}
        studyMinutes={studyMinutes}
        workoutCount={workoutCount}
        recoveryScore={recoveryScore}
        logs={habitLogs}
        maxStreak={maxStreak}
      />

      {/* 30-DAY RELIABILITY HEATMAP */}
      <HabitHeatmap habits={habits} logs={habitLogs} />
    </div>
  );
}
