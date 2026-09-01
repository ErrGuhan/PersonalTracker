"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Check, Clock, Zap } from "lucide-react";
import type { Habit } from "@/lib/database.types";

interface PredictiveHabitWidgetProps {
  habits: Habit[];
  onComplete: (id: string) => void;
}

export default function PredictiveHabitWidget({ habits, onComplete }: PredictiveHabitWidgetProps) {
  const [completedId, setCompletedId] = useState<string | null>(null);

  const currentHour = new Date().getHours();

  // Find habit scheduled or typically completed near this hour that isn't completed today yet
  const targetHabit = useMemo(() => {
    const pending = habits.filter((h) => !h.completedToday);
    if (pending.length === 0) return null;

    // Matches current hour (+/- 1 hour)
    const matched = pending.find(
      (h) => h.typicalHour !== undefined && Math.abs(h.typicalHour - currentHour) <= 1
    );

    return matched || pending[0];
  }, [habits, currentHour]);

  if (!targetHabit) return null;

  const handleQuickComplete = () => {
    setCompletedId(targetHabit.id);
    onComplete(targetHabit.id);
    setTimeout(() => {
      setCompletedId(null);
    }, 2000);
  };

  const hourFormatted = new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -20, opacity: 0 }}
        className="w-full bg-gradient-to-r from-cyan-950/80 via-indigo-950/70 to-slate-900/90 border border-cyan-500/30 rounded-2xl p-4 sm:p-5 shadow-[0_0_25px_rgba(6,182,212,0.2)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative overflow-hidden backdrop-blur-xl"
      >
        {/* Animated Glow Accent */}
        <div className="absolute top-0 right-1/4 w-32 h-32 bg-cyan-500/15 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center gap-3 sm:gap-4">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center text-2xl shadow-inner shrink-0">
            {targetHabit.icon}
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold font-mono tracking-widest text-cyan-400 uppercase bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20 flex items-center gap-1">
                <Clock className="w-3 h-3" /> {hourFormatted} Routine
              </span>
              <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">
                • Based on historical logging time
              </span>
            </div>

            <h4 className="text-sm sm:text-base font-extrabold text-white tracking-tight mt-0.5">
              Ready for: <span className="text-cyan-300">{targetHabit.title}</span>?
            </h4>
          </div>
        </div>

        {/* 1-Tap Action Button */}
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          onClick={handleQuickComplete}
          disabled={completedId === targetHabit.id}
          className={`px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 cursor-pointer transition-all duration-300 shrink-0 shadow-lg ${
            completedId === targetHabit.id
              ? "bg-emerald-500 text-slate-950 shadow-[0_0_15px_rgba(16,185,129,0.5)]"
              : "bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 hover:from-cyan-300 hover:to-blue-400 shadow-[0_0_18px_rgba(6,182,212,0.4)]"
          }`}
        >
          {completedId === targetHabit.id ? (
            <>
              <Check className="w-4 h-4 text-slate-950 stroke-[3]" />
              Completed!
            </>
          ) : (
            <>
              <Zap className="w-4 h-4 text-slate-950 fill-slate-950" />
              1-Tap Complete
            </>
          )}
        </motion.button>
      </motion.div>
    </AnimatePresence>
  );
}
