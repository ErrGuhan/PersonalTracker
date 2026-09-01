"use client";

import { motion } from "framer-motion";
import { Award, Zap } from "lucide-react";

interface ProgressiveRingsProps {
  completedCount: number;
  totalCount: number;
  streakDays: number;
}

export default function ProgressiveRings({
  completedCount,
  totalCount,
  streakDays,
}: ProgressiveRingsProps) {
  const percentage = totalCount > 0 ? Math.min(100, Math.round((completedCount / totalCount) * 100)) : 0;
  
  // Outer Ring (Completion)
  const radiusOuter = 54;
  const circumferenceOuter = 2 * Math.PI * radiusOuter;
  const strokeDashoffsetOuter = circumferenceOuter - (percentage / 100) * circumferenceOuter;

  // Inner Ring (Streak Multiplier / Milestone Progress: milestone out of 7)
  const milestoneProgress = ((streakDays % 7) / 7) * 100;
  const radiusInner = 38;
  const circumferenceInner = 2 * Math.PI * radiusInner;
  const strokeDashoffsetInner = circumferenceInner - (milestoneProgress / 100) * circumferenceInner;

  return (
    <div className="bg-[#0F172A]/70 backdrop-blur-xl border border-white/10 shadow-2xl rounded-2xl p-5 sm:p-6 flex flex-col items-center justify-between relative overflow-hidden h-full min-h-[220px]">
      {/* Background Radial Accent */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

      {/* Header Title */}
      <div className="w-full flex items-center justify-between text-xs text-slate-400 border-b border-white/5 pb-2">
        <span className="font-semibold uppercase tracking-wider flex items-center gap-1.5 text-white">
          <Zap className="w-4 h-4 text-cyan-400" />
          Progressive Rings
        </span>
        <span className="font-mono text-cyan-400 font-bold bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
          Daily Goal
        </span>
      </div>

      {/* SVG Rings Display */}
      <div className="relative my-3 flex items-center justify-center">
        <svg className="w-36 h-36 -rotate-90 transform" viewBox="0 0 140 140">
          <defs>
            {/* Outer Ring Gradient */}
            <linearGradient id="ringCyanGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#06b6d4" />
              <stop offset="100%" stopColor="#3b82f6" />
            </linearGradient>
            {/* Inner Ring Gradient */}
            <linearGradient id="ringPurpleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#a855f7" />
              <stop offset="100%" stopColor="#ec4899" />
            </linearGradient>
          </defs>

          {/* Track Outer */}
          <circle
            cx="70"
            cy="70"
            r={radiusOuter}
            className="stroke-slate-800/80"
            strokeWidth="10"
            fill="transparent"
          />

          {/* Animated Outer Ring */}
          <motion.circle
            cx="70"
            cy="70"
            r={radiusOuter}
            stroke="url(#ringCyanGrad)"
            strokeWidth="10"
            strokeLinecap="round"
            fill="transparent"
            strokeDasharray={circumferenceOuter}
            initial={{ strokeDashoffset: circumferenceOuter }}
            animate={{ strokeDashoffset: strokeDashoffsetOuter }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="drop-shadow-[0_0_8px_rgba(6,182,212,0.6)]"
          />

          {/* Track Inner */}
          <circle
            cx="70"
            cy="70"
            r={radiusInner}
            className="stroke-slate-800/60"
            strokeWidth="8"
            fill="transparent"
          />

          {/* Animated Inner Ring (Milestone to next Freeze Token) */}
          <motion.circle
            cx="70"
            cy="70"
            r={radiusInner}
            stroke="url(#ringPurpleGrad)"
            strokeWidth="8"
            strokeLinecap="round"
            fill="transparent"
            strokeDasharray={circumferenceInner}
            initial={{ strokeDashoffset: circumferenceInner }}
            animate={{ strokeDashoffset: strokeDashoffsetInner }}
            transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
            className="drop-shadow-[0_0_6px_rgba(168,85,247,0.5)]"
          />
        </svg>

        {/* Center Percentage Display */}
        <div className="absolute flex flex-col items-center justify-center text-center">
          <span className="text-2xl font-black text-white font-mono tracking-tight">{percentage}%</span>
          <span className="text-[10px] text-slate-400 uppercase tracking-widest font-mono">Completed</span>
        </div>
      </div>

      {/* Footer Info */}
      <div className="w-full flex items-center justify-between text-xs pt-2 border-t border-white/5">
        <div className="flex items-center gap-1.5 text-cyan-400">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_6px_rgba(6,182,212,0.8)]" />
          <span className="text-[11px] font-medium text-slate-300">Habits: {completedCount}/{totalCount}</span>
        </div>

        <div className="flex items-center gap-1.5 text-purple-400">
          <Award className="w-3.5 h-3.5" />
          <span className="text-[11px] font-medium text-slate-300">Token: {(streakDays % 7)}/7 d</span>
        </div>
      </div>
    </div>
  );
}
