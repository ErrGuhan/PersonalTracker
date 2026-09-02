"use client";

import { motion } from "framer-motion";
import type { DailyCapacityResult } from "@/lib/ai/types";

interface DailyCapacityCardProps {
  capacity: DailyCapacityResult | null;
  loading?: boolean;
}

export default function DailyCapacityCard({
  capacity,
  loading = false,
}: DailyCapacityCardProps) {
  const score = capacity?.score ?? 81;
  const level = capacity?.level ?? "HIGH";
  const interpretation =
    capacity?.interpretation ||
    "Strong physiological capacity allows for up to 3 hours of concentrated deep work and moderate physical training. Schedule challenging cognitive tasks before late afternoon.";

  const deepWork = capacity?.deepWorkAllocation ?? 85;
  const exercise = capacity?.exerciseAllocation ?? 72;
  const learning = capacity?.learningAllocation ?? 80;
  const recovery = capacity?.recoveryAllocation ?? 65;

  const allocations = [
    { label: "Deep Work", value: deepWork, color: "#4cd7f6" },
    { label: "Exercise", value: exercise, color: "#ec6a06" },
    { label: "Learning", value: learning, color: "#4cd7f6" },
    { label: "Recovery", value: recovery, color: "#b395ff" },
  ];

  return (
    <section className="glass-panel p-5 sm:p-7 rounded-2xl sm:rounded-3xl border border-white/10 relative overflow-hidden space-y-6">
      {/* Glow */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 relative z-10">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-xl">battery_charging_full</span>
            <h3 className="font-bold text-base sm:text-lg text-white">Today&apos;s Daily Capacity</h3>
          </div>
          <p className="text-xs text-on-surface-variant mt-0.5">
            Deterministic Output Budget & Energy Allocation
          </p>
        </div>

        <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-primary/15 border border-primary/30 text-primary font-bold">
          DETERMINISTIC BASELINE
        </span>
      </div>

      {/* Capacity Score & Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center relative z-10">
        {/* Score Tile */}
        <div className="md:col-span-4 p-5 rounded-2xl bg-surface-container-high/40 border border-white/5 flex flex-col items-center justify-center text-center">
          <span className="font-mono text-[10px] text-on-surface-variant uppercase tracking-wider">
            CAPACITY SCORE
          </span>
          <span className="text-5xl font-extrabold text-primary mt-1 tracking-tight">
            {score}%
          </span>
          <span className="text-xs font-mono font-bold text-white uppercase tracking-widest mt-1">
            {level}
          </span>
          <span className="text-[10px] text-on-surface-variant mt-2 font-mono">
            {capacity?.recommendedFocusMinutes ?? 180} mins optimal focus
          </span>
        </div>

        {/* Breakdown Bars */}
        <div className="md:col-span-8 space-y-3">
          <span className="font-mono text-[10px] text-on-surface-variant uppercase tracking-wider block mb-2">
            RECOMMENDED OUTPUT ALLOCATION
          </span>

          <div className="space-y-2.5">
            {allocations.map((item) => (
              <div key={item.label} className="space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-mono text-white font-semibold">{item.label}</span>
                  <span className="font-mono text-on-surface-variant font-bold">{item.value}%</span>
                </div>
                <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${item.value}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AI Interpretation */}
      <div className="p-4 rounded-xl bg-surface-container-high/60 border border-white/5 relative z-10 space-y-1">
        <div className="flex items-center gap-1.5 text-xs font-mono text-primary font-bold">
          <span className="material-symbols-outlined text-sm">lightbulb</span>
          AI ALLOCATION GUIDANCE
        </div>
        {loading ? (
          <div className="h-4 bg-white/10 rounded animate-pulse w-3/4" />
        ) : (
          <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
            {interpretation}
          </p>
        )}
      </div>
    </section>
  );
}
