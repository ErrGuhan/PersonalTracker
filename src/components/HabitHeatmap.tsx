"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { Calendar, ShieldCheck, Flame, Info } from "lucide-react";
import type { Habit, HabitLog } from "@/lib/database.types";

interface HabitHeatmapProps {
  habits: Habit[];
  logs: HabitLog[];
  days?: number;
}

export default function HabitHeatmap({ habits, logs, days = 30 }: HabitHeatmapProps) {
  // Compute date array for past N days
  const dateRange = useMemo(() => {
    const list: string[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      list.push(d.toISOString().split("T")[0]);
    }
    return list;
  }, [days]);

  // Map each date YYYY-MM-DD to stats
  const heatmapStats = useMemo(() => {
    return dateRange.map((dateStr) => {
      const dayLogs = logs.filter((l) => l.date === dateStr);
      const completed = dayLogs.filter((l) => l.status === "COMPLETED").length;
      const frozen = dayLogs.filter((l) => l.status === "FROZEN").length;
      const total = habits.length || 0;
      
      const score = total > 0 ? Math.min(100, Math.round(((completed + frozen) / total) * 100)) : 0;
      return {
        date: dateStr,
        completed,
        frozen,
        total,
        score,
        hasActivity: dayLogs.length > 0,
      };
    });
  }, [dateRange, logs, habits]);

  const hasAnyActivity = logs.length > 0;

  // Overall 30-Day Reliability Score
  const reliabilityScore = useMemo(() => {
    if (!hasAnyActivity || habits.length === 0) return null;
    const totalScore = heatmapStats.reduce((acc, curr) => acc + curr.score, 0);
    return Math.round(totalScore / heatmapStats.length);
  }, [heatmapStats, hasAnyActivity, habits]);

  // Helper for cell color based on score/status
  const getCellStyles = (score: number, frozenCount: number, hasActivity: boolean) => {
    if (frozenCount > 0) {
      return "bg-amber-500/30 border-amber-500/50 text-amber-300 shadow-[0_0_8px_rgba(245,158,11,0.3)]";
    }
    if (!hasActivity || score === 0) {
      return "bg-slate-800/40 border-white/5 hover:border-slate-600/50";
    }
    if (score < 40) {
      return "bg-cyan-950/60 border-cyan-800/40 text-cyan-400";
    }
    if (score < 75) {
      return "bg-cyan-600/50 border-cyan-500/60 text-white shadow-[0_0_6px_rgba(6,182,212,0.3)]";
    }
    return "bg-gradient-to-br from-cyan-400 to-blue-500 border-cyan-300 text-slate-950 font-bold shadow-[0_0_12px_rgba(6,182,212,0.6)]";
  };

  return (
    <div className="bg-[#0F172A]/70 backdrop-blur-xl border border-white/10 shadow-2xl rounded-2xl p-5 sm:p-6 flex flex-col gap-5 relative overflow-hidden">
      {/* Glow Accent */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="font-extrabold text-base sm:text-lg text-white tracking-tight flex items-center gap-2">
            <Calendar className="w-5 h-5 text-cyan-400" />
            30-Day Habit Reliability Heatmap
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">Visual accumulation of consistency and rest days.</p>
        </div>

        {/* 30-Day Score Badge */}
        <div className="flex items-center gap-2 bg-slate-900/90 border border-white/10 px-3 py-1.5 rounded-xl self-start sm:self-auto">
          <ShieldCheck className="w-4 h-4 text-cyan-400" />
          <span className="text-xs text-slate-300 font-medium">Reliability Score:</span>
          <span className="text-sm font-extrabold text-cyan-400 font-mono">
            {reliabilityScore !== null ? `${reliabilityScore}%` : "— Not enough data"}
          </span>
        </div>
      </div>

      {/* Contribution Grid */}
      <div className="flex flex-col gap-2">
        <div className="grid grid-cols-6 sm:grid-cols-10 md:grid-cols-15 gap-1.5 sm:gap-2">
          {heatmapStats.map((item, idx) => {
            const dateObj = new Date(item.date);
            const dayLabel = dateObj.toLocaleDateString("en-US", { month: "short", day: "numeric" });

            return (
              <motion.div
                key={item.date}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.2, delay: idx * 0.015 }}
                whileHover={{ scale: 1.15, zIndex: 20 }}
                className={`relative group aspect-square rounded-lg border transition-all duration-200 cursor-pointer flex items-center justify-center ${getCellStyles(
                  item.score,
                  item.frozen,
                  item.hasActivity
                )}`}
              >
                <span className="text-[10px] opacity-75 font-mono select-none">
                  {dateObj.getDate()}
                </span>

                {/* Tooltip */}
                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 hidden group-hover:flex flex-col gap-1 bg-slate-900 border border-cyan-500/30 text-white text-[11px] px-2.5 py-1.5 rounded-lg shadow-xl whitespace-nowrap z-30 pointer-events-none">
                  <span className="font-semibold text-cyan-400">{dayLabel}</span>
                  {item.hasActivity ? (
                    <>
                      <span>{item.completed} completed habit(s)</span>
                      {item.frozen > 0 && <span className="text-amber-400">🛡️ {item.frozen} Rest Day (Frozen)</span>}
                      <span className="text-slate-400 text-[10px] font-mono">{item.score}% reliability</span>
                    </>
                  ) : (
                    <span className="text-slate-400 text-[10px]">No activity recorded</span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Heatmap Legend */}
        <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-400 mt-2 pt-3 border-t border-white/5 gap-2">
          <div className="flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-slate-400" />
            <span>Cyan opacity reflects daily completion score</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <span className="w-3 h-3 rounded bg-slate-800 border border-white/5" />
              <span>0%</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-3 h-3 rounded bg-cyan-950 border border-cyan-800" />
              <span>Low</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-3 h-3 rounded bg-cyan-600 border border-cyan-500" />
              <span>Med</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-3 h-3 rounded bg-cyan-400 border border-cyan-300" />
              <span>100%</span>
            </div>
            <div className="flex items-center gap-1 border-l border-white/10 pl-2">
              <span className="w-3 h-3 rounded bg-amber-500/40 border border-amber-500" />
              <span className="text-amber-300">Rest Token</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
