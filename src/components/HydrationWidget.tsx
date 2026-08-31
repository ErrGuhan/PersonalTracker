"use client";

import { motion } from "framer-motion";
import { useHydration } from "@/hooks/useSupabase";

export default function HydrationWidget() {
  const { hydration, addWater } = useHydration();

  const pct = Math.min(100, Math.round((hydration.amountMl / hydration.targetMl) * 100));

  return (
    <div className="glass-panel rounded-2xl p-4 sm:p-6 flex flex-col justify-between h-full border-t-2 border-primary/40">
      <div>
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
              water_drop
            </span>
            <h3 className="font-bold text-sm sm:text-base text-on-surface">Hydration Tracker</h3>
          </div>
          <span className="font-mono text-xs text-primary font-bold bg-primary/10 px-2 py-0.5 rounded border border-primary/30">
            {pct}% Target
          </span>
        </div>

        {/* Big Numeric Counter */}
        <div className="flex items-baseline gap-2 my-2">
          <span className="text-2xl sm:text-3xl font-extrabold text-on-surface">{hydration.amountMl}</span>
          <span className="text-xs text-on-surface-variant font-mono">/ {hydration.targetMl} ml</span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-surface-container-highest h-3 rounded-full overflow-hidden my-3">
          <motion.div
            className="bg-gradient-to-r from-primary-container to-primary h-full rounded-full shadow-[0_0_12px_rgba(76,215,246,0.6)]"
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      {/* Quick Add Buttons */}
      <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-white/5">
        <button
          onClick={() => addWater(250)}
          className="flex flex-col items-center justify-center p-2 rounded-xl bg-primary/10 border border-primary/30 text-primary hover:bg-primary/20 transition active:scale-95 cursor-pointer"
        >
          <span className="text-xs font-bold">+250 ml</span>
          <span className="text-[9px] text-on-surface-variant font-mono">Glass</span>
        </button>

        <button
          onClick={() => addWater(500)}
          className="flex flex-col items-center justify-center p-2 rounded-xl bg-primary/10 border border-primary/30 text-primary hover:bg-primary/20 transition active:scale-95 cursor-pointer"
        >
          <span className="text-xs font-bold">+500 ml</span>
          <span className="text-[9px] text-on-surface-variant font-mono">Bottle</span>
        </button>

        <button
          onClick={() => addWater(750)}
          className="flex flex-col items-center justify-center p-2 rounded-xl bg-primary/10 border border-primary/30 text-primary hover:bg-primary/20 transition active:scale-95 cursor-pointer"
        >
          <span className="text-xs font-bold">+750 ml</span>
          <span className="text-[9px] text-on-surface-variant font-mono">Thermos</span>
        </button>
      </div>
    </div>
  );
}
