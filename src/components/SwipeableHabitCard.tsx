"use client";

import { useState } from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { Check, Flame, Shield, Smartphone, MoreVertical, Pencil, Trash2, Sparkles, RefreshCw } from "lucide-react";
import type { Habit } from "@/lib/database.types";

interface SwipeableHabitCardProps {
  habit: Habit;
  freezeTokens: number;
  onComplete: (id: string) => void;
  onFreeze: (id: string) => void;
  onToggle: (id: string) => void;
  onEdit: (habit: Habit) => void;
  onDelete: (id: string) => void;
}

export default function SwipeableHabitCard({
  habit,
  freezeTokens,
  onComplete,
  onFreeze,
  onToggle,
  onEdit,
  onDelete,
}: SwipeableHabitCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const x = useMotionValue(0);

  // Background reveal color opacity based on drag position
  const bgCompleteOpacity = useTransform(x, [0, 80], [0, 1]);
  const bgFreezeOpacity = useTransform(x, [-80, 0], [1, 0]);

  const isGlassmorphic = habit.streak > 14;
  const hasSwipeGesture = habit.streak > 30;

  const handleDragEnd = (event: unknown, info: { offset: { x: number } }) => {
    if (info.offset.x > 60 && !habit.completedToday) {
      onComplete(habit.id);
    } else if (info.offset.x < -60 && !habit.completedToday && freezeTokens > 0) {
      onFreeze(habit.id);
    }
  };

  return (
    <div className="relative overflow-hidden rounded-xl">
      {/* Swipe Right Reveal Background: Complete */}
      <motion.div
        style={{ opacity: bgCompleteOpacity }}
        className="absolute inset-0 bg-gradient-to-r from-emerald-600/90 to-teal-500/80 rounded-xl flex items-center justify-start px-5 text-white font-bold text-xs gap-2 z-0 shadow-inner"
      >
        <Check className="w-5 h-5 stroke-[3]" />
        <span>Swipe Right → Complete</span>
      </motion.div>

      {/* Swipe Left Reveal Background: Rest Token */}
      <motion.div
        style={{ opacity: bgFreezeOpacity }}
        className="absolute inset-0 bg-gradient-to-l from-amber-600/90 to-orange-500/80 rounded-xl flex items-center justify-end px-5 text-white font-bold text-xs gap-2 z-0 shadow-inner"
      >
        <span>Rest Token ← Swipe Left</span>
        <Shield className="w-5 h-5 text-amber-200" />
      </motion.div>

      {/* Foreground Draggable Habit Card */}
      <motion.div
        style={{ x }}
        drag={!habit.completedToday ? "x" : false}
        dragConstraints={{ left: -100, right: 100 }}
        dragElastic={0.2}
        onDragEnd={handleDragEnd}
        className={`relative z-10 flex items-center justify-between p-4 rounded-xl border transition-all ${
          habit.completedToday
            ? "bg-[#0F172A]/40 border-white/5 opacity-50 backdrop-blur-sm"
            : isGlassmorphic
            ? "bg-gradient-to-r from-cyan-500/20 via-purple-500/15 to-indigo-500/20 border-cyan-400/50 shadow-[0_0_20px_rgba(6,182,212,0.2)] backdrop-blur-2xl"
            : "bg-[#0F172A]/70 border-white/10 text-white hover:border-cyan-500/30"
        }`}
      >
        <div
          className="flex items-center gap-3.5 min-w-0 flex-1 cursor-pointer"
          onClick={() => (habit.completedToday ? onToggle(habit.id) : onComplete(habit.id))}
        >
          {/* Checkbox Circle */}
          <div
            className={`w-6 h-6 rounded-full border flex items-center justify-center text-xs transition-all duration-300 shrink-0 ${
              habit.completedToday
                ? "bg-emerald-400 border-emerald-400 text-slate-950 shadow-[0_0_12px_rgba(16,185,129,0.8)]"
                : "border-white/30 text-transparent hover:border-cyan-400"
            }`}
          >
            <Check className="w-3.5 h-3.5 stroke-[3]" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <p
                className={`text-xs sm:text-sm font-bold transition-all ${
                  habit.completedToday ? "line-through text-slate-500" : "text-white"
                }`}
              >
                {habit.title}
              </p>

              {/* Badges */}
              {isGlassmorphic && !habit.completedToday && (
                <span className="text-[9px] font-extrabold uppercase font-mono px-2 py-0.5 rounded bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 flex items-center gap-1 shadow-sm">
                  <Sparkles className="w-2.5 h-2.5" /> Glass Tier
                </span>
              )}

              {hasSwipeGesture && !habit.completedToday && (
                <span className="text-[9px] font-extrabold uppercase font-mono px-2 py-0.5 rounded bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 flex items-center gap-1">
                  <Smartphone className="w-2.5 h-2.5" /> Swipe Enabled
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 text-[10px] font-mono mt-1">
              <span className="uppercase tracking-widest text-cyan-400 font-semibold">{habit.category}</span>
              <span className="text-slate-600">·</span>
              <span className="flex items-center gap-1 text-slate-300 font-semibold">
                <Flame className="w-3 h-3 text-amber-500 fill-amber-500" />
                {habit.streak} day streak
              </span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 shrink-0 ml-2">
          {!habit.completedToday && freezeTokens > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onFreeze(habit.id);
              }}
              title="Use Rest Token to freeze streak"
              className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-amber-500/15 border border-amber-500/30 text-amber-300 hover:bg-amber-500/30 transition flex items-center gap-1 cursor-pointer"
            >
              <Shield className="w-3 h-3 text-amber-400" />
              <span className="hidden sm:inline">Rest Token</span>
            </button>
          )}

          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition cursor-pointer"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-full mt-1 w-32 bg-slate-900 border border-white/10 rounded-xl shadow-2xl z-30 overflow-hidden py-1">
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    onEdit(habit);
                  }}
                  className="w-full px-3 py-2 text-left text-xs text-slate-300 hover:bg-white/10 hover:text-white flex items-center gap-2 cursor-pointer"
                >
                  <Pencil className="w-3.5 h-3.5" /> Edit
                </button>
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    onDelete(habit.id);
                  }}
                  className="w-full px-3 py-2 text-left text-xs text-rose-400 hover:bg-rose-500/10 flex items-center gap-2 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
