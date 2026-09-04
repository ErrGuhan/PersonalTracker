"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useHydration } from "@/hooks/useSupabase";
import { Droplet, Plus } from "lucide-react";

export default function HydrationWidget() {
  const { hydration, addWater } = useHydration();
  const [isAdding, setIsAdding] = useState(false);

  // Calculate actual percentage
  const pct = hydration.targetMl > 0 ? Math.round((hydration.amountMl / hydration.targetMl) * 100) : 0;
  const barWidthPct = Math.min(100, Math.max(0, pct));

  const handleAddWater = (amount: number) => {
    if (isAdding) return;
    setIsAdding(true);
    addWater(amount);
    setTimeout(() => setIsAdding(false), 250);
  };

  return (
    <div className="liquid-glass rounded-3xl p-5 sm:p-6 flex flex-col justify-between h-full relative overflow-hidden border border-white/[0.08] shadow-2xl">
      {/* Background Ambient Fluid Glow */}
      <div className="absolute -top-12 -right-12 w-40 h-40 bg-cyan-500/[0.08] rounded-full blur-3xl pointer-events-none" />

      <div>
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/15 border border-cyan-500/25 flex items-center justify-center text-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.25)]">
              <Droplet className="w-4 h-4 fill-cyan-400/30" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-white tracking-tight">Hydration Tracker</h3>
              <p className="text-[10px] uppercase tracking-wider text-slate-400 font-mono">Daily Fluid Intake</p>
            </div>
          </div>

          <span className="font-mono text-[11px] text-cyan-300 font-bold bg-cyan-500/15 px-2.5 py-1 rounded-full border border-cyan-500/25 shadow-[0_0_10px_rgba(6,182,212,0.15)]">
            {pct}% Reached
          </span>
        </div>

        {/* Counter Display */}
        <div className="flex items-baseline gap-2 my-3">
          <span className="text-3xl sm:text-4xl font-black tracking-tight text-white font-mono">{hydration.amountMl}</span>
          <span className="text-xs text-slate-400 font-mono uppercase tracking-wider">/ {hydration.targetMl} ML</span>
        </div>

        {/* Fluid Progress Bar */}
        <div className="w-full bg-black/40 h-3 rounded-full overflow-hidden my-4 p-0.5 border border-white/[0.06]">
          <motion.div
            className="bg-gradient-to-r from-cyan-500 via-teal-400 to-blue-500 h-full rounded-full shadow-[0_0_12px_rgba(6,182,212,0.5)]"
            initial={{ width: 0 }}
            animate={{ width: `${barWidthPct}%` }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
          />
        </div>
      </div>

      {/* Tactile Quick Add Buttons */}
      <div className="grid grid-cols-3 gap-2.5 mt-3 pt-3 border-t border-white/[0.06]">
        <button
          type="button"
          disabled={isAdding}
          onClick={() => handleAddWater(250)}
          className="liquid-glass-subtle hover:bg-cyan-500/10 active:scale-95 border border-white/[0.06] hover:border-cyan-500/30 rounded-xl p-2.5 flex flex-col items-center justify-center transition-all cursor-pointer disabled:opacity-50 group"
        >
          <span className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors">+250 ml</span>
          <span className="text-[9px] uppercase tracking-wider text-slate-400 font-mono mt-0.5">Glass</span>
        </button>

        <button
          type="button"
          disabled={isAdding}
          onClick={() => handleAddWater(500)}
          className="liquid-glass-subtle hover:bg-cyan-500/10 active:scale-95 border border-white/[0.06] hover:border-cyan-500/30 rounded-xl p-2.5 flex flex-col items-center justify-center transition-all cursor-pointer disabled:opacity-50 group"
        >
          <span className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors">+500 ml</span>
          <span className="text-[9px] uppercase tracking-wider text-slate-400 font-mono mt-0.5">Bottle</span>
        </button>

        <button
          type="button"
          disabled={isAdding}
          onClick={() => handleAddWater(750)}
          className="liquid-glass-subtle hover:bg-cyan-500/10 active:scale-95 border border-white/[0.06] hover:border-cyan-500/30 rounded-xl p-2.5 flex flex-col items-center justify-center transition-all cursor-pointer disabled:opacity-50 group"
        >
          <span className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors">+750 ml</span>
          <span className="text-[9px] uppercase tracking-wider text-slate-400 font-mono mt-0.5">Flask</span>
        </button>
      </div>
    </div>
  );
}
