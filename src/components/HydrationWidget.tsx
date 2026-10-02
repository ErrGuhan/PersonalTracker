"use client";

import { useState } from "react";
import { useHydration } from "@/hooks/useSupabase";
import { Droplet } from "lucide-react";

const QUICK_ADDS = [
  { ml: 250, label: "Glass" },
  { ml: 500, label: "Bottle" },
  { ml: 750, label: "Flask" },
];

export default function HydrationWidget() {
  const { hydration, addWater } = useHydration();
  const [isAdding, setIsAdding] = useState(false);

  const pct        = hydration.targetMl > 0 ? Math.round((hydration.amountMl / hydration.targetMl) * 100) : 0;
  const barWidth   = Math.min(100, Math.max(0, pct));

  const handleAdd = (amount: number) => {
    if (isAdding) return;
    setIsAdding(true);
    addWater(amount);
    setTimeout(() => setIsAdding(false), 250);
  };

  return (
    <div className="m3-surface-glass rounded-2xl p-4 flex flex-col gap-4 h-full relative overflow-hidden">
      {/* Ambient */}
      <div className="absolute -top-8 -right-8 w-32 h-32 bg-cyan-500/[0.06] rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-cyan-500/15 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
            <Droplet className="w-3.5 h-3.5 fill-cyan-400/30" />
          </div>
          <h3 className="font-semibold text-sm text-white">Hydration</h3>
        </div>
        <span className="m3-chip m3-chip-selected text-[10px]">{pct}%</span>
      </div>

      {/* Counter */}
      <div className="flex items-baseline gap-1.5">
        <span className="text-3xl font-black text-white font-mono tracking-tight">{hydration.amountMl}</span>
        <span className="text-xs text-slate-400 font-mono">/ {hydration.targetMl} ml</span>
      </div>

      {/* Progress bar */}
      <div className="m3-progress-track" style={{ height: "6px", borderRadius: "3px" }}>
        <div
          className="m3-progress-bar"
          style={{ width: `${barWidth}%`, height: "6px", borderRadius: "3px", transition: "width 0.5s cubic-bezier(0.2,0,0,1)" }}
        />
      </div>

      {/* Quick-add chips */}
      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/[0.06]">
        {QUICK_ADDS.map(({ ml, label }) => (
          <button
            key={ml}
            type="button"
            disabled={isAdding}
            onClick={() => handleAdd(ml)}
            className="m3-surface-inset hover:bg-cyan-500/10 hover:border-cyan-500/25 active:scale-95 rounded-xl py-2.5 flex flex-col items-center gap-0.5 transition-all cursor-pointer disabled:opacity-50 border border-white/[0.05]"
          >
            <span className="text-xs font-bold text-white">+{ml}ml</span>
            <span className="text-[9px] uppercase tracking-wider text-slate-400 font-mono">{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
