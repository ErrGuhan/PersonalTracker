"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { Sparkles, Lock, Brain, Moon, Flame, Zap, ShieldCheck } from "lucide-react";
import { analyzeUserPatterns } from "@/lib/insights";
import type { SleepLog, HabitLog } from "@/lib/database.types";

interface InsightsEngineProps {
  sleepData: SleepLog | null;
  studyMinutes: number;
  workoutCount: number;
  recoveryScore: number;
  logs: HabitLog[];
  maxStreak: number;
}

export default function InsightsEngine({
  sleepData,
  studyMinutes,
  workoutCount,
  recoveryScore,
  logs,
  maxStreak,
}: InsightsEngineProps) {
  const isUnlocked = maxStreak >= 14;

  const patternResults = useMemo(() => {
    return analyzeUserPatterns(sleepData, studyMinutes, workoutCount, recoveryScore, logs);
  }, [sleepData, studyMinutes, workoutCount, recoveryScore, logs]);

  return (
    <div className="glass-primary p-6 sm:p-7 rounded-2xl flex flex-col gap-5 relative overflow-hidden">
      {/* Background Accent */}
      <div className="absolute top-0 right-0 w-56 h-56 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400 shadow-[0_0_12px_rgba(168,85,247,0.3)]">
            <Brain className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-base sm:text-lg text-white tracking-tight flex items-center gap-2">
              Rule-Based Insights Engine
            </h3>
            <p className="text-xs text-slate-400">Statistical correlations from your logged activity history.</p>
          </div>
        </div>

        <span className="text-xs font-mono font-bold bg-purple-500/10 text-purple-300 px-3 py-1 rounded-xl border border-purple-500/20">
          {isUnlocked ? "Unlocked ✦" : `Milestone: ${maxStreak}/14d`}
        </span>
      </div>

      {/* MILESTONE LOCK OVERLAY IF STREAK < 14 DAYS */}
      {!isUnlocked ? (
        <div className="bg-[#0F172A]/80 backdrop-blur-md border border-purple-500/30 rounded-2xl p-6 sm:p-8 flex flex-col items-center justify-center text-center gap-4 relative overflow-hidden">
          <div className="w-14 h-14 rounded-2xl bg-purple-500/20 border border-purple-400/40 flex items-center justify-center text-purple-300 shadow-inner">
            <Lock className="w-7 h-7" />
          </div>

          <div className="flex flex-col gap-1.5 max-w-md">
            <h4 className="text-base font-extrabold text-white tracking-tight">🔒 Advanced Insights Engine Locked</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Track your daily system for <span className="text-purple-400 font-bold font-mono">14 consecutive days</span> to unlock deep pattern correlation analytics.
            </p>
          </div>

          {/* Progress Bar */}
          <div className="w-full max-w-xs bg-slate-900 h-2.5 rounded-full overflow-hidden border border-white/10 mt-1">
            <div
              className="bg-gradient-to-r from-purple-500 to-indigo-500 h-full rounded-full shadow-[0_0_10px_rgba(168,85,247,0.6)] transition-all duration-500"
              style={{ width: `${Math.min(100, (maxStreak / 14) * 100)}%` }}
            />
          </div>
          <span className="text-[11px] font-mono text-purple-300 font-semibold">
            Progress: {maxStreak} / 14 Days Streak
          </span>
        </div>
      ) : !patternResults.hasSufficientData ? (
        // INSUFFICIENT SAMPLE SIZE GUARD (< 7 DAYS DATA)
        <div className="glass-secondary p-6 rounded-2xl flex flex-col items-center justify-center text-center gap-3">
          <Sparkles className="w-8 h-8 text-purple-400" />
          <h4 className="text-sm font-bold text-white">Not enough historical data yet</h4>
          <p className="text-xs text-slate-400 max-w-sm">
            Keep tracking your focus, sleep, and workouts for at least 7 logged days to reveal statistically sound correlations.
          </p>
        </div>
      ) : patternResults.insights.length === 0 ? (
        // NO PATTERNS DETECTED YET
        <div className="glass-secondary p-6 rounded-2xl text-center text-xs text-slate-400">
          No strong pattern deviations detected yet. Continue logging daily routines to build sample depth.
        </div>
      ) : (
        // UNLOCKED INSIGHT CARDS
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {patternResults.insights.map((insight) => (
            <motion.div
              key={insight.id}
              whileHover={{ y: -2 }}
              className="glass-secondary p-5 rounded-2xl border border-purple-500/30 flex flex-col justify-between gap-3 relative overflow-hidden group"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase font-bold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Pattern Detected
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  {insight.confidencePct}% Confidence
                </span>
              </div>

              <div className="flex flex-col gap-1 my-1">
                <h4 className="text-sm font-extrabold text-white">{insight.title}</h4>
                <p className="text-xs text-slate-300 leading-relaxed">{insight.description}</p>
              </div>

              <div className="text-[10px] font-mono text-slate-400 pt-2 border-t border-white/5 flex items-center justify-between">
                <span>Based on {insight.sampleCount} logged days</span>
                <span className="text-cyan-400 font-semibold">Correlation ✓</span>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
