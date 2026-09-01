"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Palette, Lock, Check, Sparkles, Award } from "lucide-react";
import { THEMES, MILESTONE_UNLOCKS } from "@/lib/themes";

interface ThemeSelectorProps {
  maxStreak: number;
}

export default function ThemeSelector({ maxStreak }: ThemeSelectorProps) {
  const [activeThemeId, setActiveThemeId] = useState("default");

  return (
    <div className="glass-primary p-6 sm:p-7 rounded-2xl flex flex-col gap-6 relative overflow-hidden">
      {/* Glow Accent */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="font-extrabold text-base sm:text-lg text-white tracking-tight flex items-center gap-2">
            <Palette className="w-5 h-5 text-cyan-400" />
            Milestone Themes & Unlocks
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">Progressive customization unlocked by consistency milestones.</p>
        </div>

        <div className="flex items-center gap-2 bg-slate-900/90 border border-white/10 px-3 py-1.5 rounded-xl self-start sm:self-auto">
          <Award className="w-4 h-4 text-cyan-400" />
          <span className="text-xs text-slate-300 font-medium">Longest Streak:</span>
          <span className="text-sm font-extrabold text-cyan-400 font-mono">{maxStreak} Days</span>
        </div>
      </div>

      {/* Themes Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {THEMES.map((theme) => {
          const isUnlocked = maxStreak >= theme.requiredStreak;
          const isActive = activeThemeId === theme.id;

          return (
            <motion.button
              key={theme.id}
              whileHover={isUnlocked ? { y: -2, scale: 1.01 } : {}}
              whileTap={isUnlocked ? { scale: 0.98 } : {}}
              onClick={() => isUnlocked && setActiveThemeId(theme.id)}
              disabled={!isUnlocked}
              className={`relative flex flex-col justify-between p-4 rounded-xl border text-left transition-all duration-200 cursor-pointer overflow-hidden ${
                isActive
                  ? "bg-white/[0.08] border-cyan-400/60 shadow-[0_0_20px_rgba(6,182,212,0.25)]"
                  : isUnlocked
                  ? "glass-secondary border-white/10 hover:border-cyan-500/30"
                  : "bg-slate-900/40 border-white/5 opacity-50 cursor-not-allowed"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-4 h-4 rounded-full bg-gradient-to-r ${theme.accentClass} shadow-sm`}
                  />
                  <span className="font-extrabold text-sm text-white">{theme.name}</span>
                </div>

                {isActive ? (
                  <span className="w-5 h-5 rounded-full bg-cyan-400 text-slate-950 flex items-center justify-center text-xs font-bold">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </span>
                ) : !isUnlocked ? (
                  <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 flex items-center gap-1">
                    <Lock className="w-2.5 h-2.5" /> {theme.requiredStreak}d
                  </span>
                ) : null}
              </div>

              <p className="text-xs text-slate-400 leading-relaxed mb-3">{theme.description}</p>

              <div className="text-[10px] font-mono text-slate-400 pt-2 border-t border-white/5 flex items-center justify-between">
                <span>{theme.requiredStreak === 0 ? "Default" : `Requires ${theme.requiredStreak} days`}</span>
                {isUnlocked && <span className="text-cyan-400 font-semibold">Unlocked ✓</span>}
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Milestones Roadmap List */}
      <div className="pt-4 border-t border-white/10 flex flex-col gap-3">
        <span className="text-xs font-bold font-mono text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          Milestone Progression Roadmap
        </span>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
          {MILESTONE_UNLOCKS.map((m) => {
            const unlocked = maxStreak >= m.requiredDays;

            return (
              <div
                key={m.id}
                className={`p-3 rounded-xl border flex flex-col items-center justify-center text-center gap-1 transition-all ${
                  unlocked
                    ? "bg-cyan-500/10 border-cyan-500/30 text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.15)]"
                    : "bg-white/[0.03] border-white/5 text-slate-500"
                }`}
              >
                <span className="text-[10px] font-mono font-bold uppercase">{m.requiredDays} Days</span>
                <span className="text-xs font-semibold text-white line-clamp-1">{m.unlockedItem}</span>
                <span className="text-[9px] opacity-75">{unlocked ? "Unlocked ✓" : "Locked 🔒"}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
