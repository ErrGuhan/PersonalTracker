"use client";

import { motion } from "framer-motion";
import type { HeroHealthIntelligence } from "@/lib/ai/types";

interface AiHeroCardProps {
  heroData: HeroHealthIntelligence | null;
  loading: boolean;
  onBuildDay: () => void;
  onAnalyzeRecovery: () => void;
}

export default function AiHeroCard({
  heroData,
  loading,
  onBuildDay,
  onAnalyzeRecovery,
}: AiHeroCardProps) {
  const recovery = heroData?.recoveryScore ?? 84;
  const sleep = heroData?.sleepDurationHours ?? 7.4;
  const capacityLevel = heroData?.capacityLevel ?? "HIGH";
  const interpretation =
    heroData?.interpretation ??
    "Your recovery is currently above your personal baseline. Autonomic markers indicate high physiological readiness for focused deep work and physical conditioning.";
  const headline = heroData?.headline ?? "Above Baseline Readiness";
  const trend = heroData?.trendIndicator ?? "up";

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="glass-panel rounded-2xl sm:rounded-3xl p-6 sm:p-8 relative overflow-hidden border border-white/10 shadow-2xl bg-gradient-to-br from-surface-container/90 via-surface-container-low/80 to-surface-dim/95"
    >
      {/* Luminous Background Accent Blobs */}
      <div className="absolute -top-16 -right-16 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-tertiary/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Badge */}
      <div className="flex items-center justify-between gap-4 mb-6 relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-primary shadow-[0_0_10px_#4cd7f6] animate-pulse" />
          <span className="font-mono text-[11px] sm:text-xs text-primary font-bold tracking-widest uppercase">
            HEALTH INTELLIGENCE
          </span>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] font-mono text-on-surface-variant">
          <span className="material-symbols-outlined text-xs text-primary">verified_user</span>
          <span>{heroData?.confidence ?? "HIGH"} CONFIDENCE</span>
        </div>
      </div>

      {/* Headline & Interpretation */}
      <div className="mb-6 relative z-10 space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            {heroData?.greeting ?? "Good morning"}
          </span>
          <span className="text-xs sm:text-sm font-semibold text-primary px-2.5 py-0.5 rounded-full bg-primary/10 border border-primary/20">
            {headline}
          </span>
        </div>

        {loading ? (
          <div className="space-y-2 py-1">
            <div className="h-4 bg-white/10 rounded animate-pulse w-5/6" />
            <div className="h-4 bg-white/10 rounded animate-pulse w-3/4" />
          </div>
        ) : (
          <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed font-sans max-w-3xl">
            {interpretation}
          </p>
        )}
      </div>

      {/* Dynamic Key Biometrics Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6 relative z-10">
        {/* Recovery Tile */}
        <div className="p-3.5 rounded-xl bg-surface-container-high/60 border border-white/5 flex flex-col justify-between">
          <span className="font-mono text-[10px] text-on-surface-variant uppercase tracking-wider">
            RECOVERY
          </span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-2xl sm:text-3xl font-extrabold text-tertiary">
              {recovery}%
            </span>
            <span
              className={`text-xs font-mono font-bold ${
                trend === "up" ? "text-emerald-400" : trend === "down" ? "text-rose-400" : "text-slate-400"
              }`}
            >
              {trend === "up" ? "↑ 4%" : trend === "down" ? "↓ 3%" : "—"}
            </span>
          </div>
          <span className="text-[10px] text-on-surface-variant/80 font-mono mt-0.5">
            14D baseline: 80%
          </span>
        </div>

        {/* Sleep Duration */}
        <div className="p-3.5 rounded-xl bg-surface-container-high/60 border border-white/5 flex flex-col justify-between">
          <span className="font-mono text-[10px] text-on-surface-variant uppercase tracking-wider">
            SLEEP
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl sm:text-3xl font-extrabold text-white">
              {sleep.toFixed(1)}
            </span>
            <span className="text-xs text-on-surface-variant">h / 8.0h</span>
          </div>
          <span className="text-[10px] text-on-surface-variant/80 font-mono mt-0.5">
            Stage balance: Good
          </span>
        </div>

        {/* Daily Capacity */}
        <div className="p-3.5 rounded-xl bg-surface-container-high/60 border border-white/5 flex flex-col justify-between">
          <span className="font-mono text-[10px] text-on-surface-variant uppercase tracking-wider">
            CAPACITY
          </span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-xl sm:text-2xl font-extrabold text-primary">
              {capacityLevel}
            </span>
          </div>
          <span className="text-[10px] text-on-surface-variant/80 font-mono mt-0.5">
            Ready for deep work
          </span>
        </div>

        {/* Trend Indicator */}
        <div className="p-3.5 rounded-xl bg-surface-container-high/60 border border-white/5 flex flex-col justify-between">
          <span className="font-mono text-[10px] text-on-surface-variant uppercase tracking-wider">
            TRAJECTORY
          </span>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="material-symbols-outlined text-emerald-400 text-2xl">
              trending_up
            </span>
            <span className="text-sm font-bold text-white">Consistent</span>
          </div>
          <span className="text-[10px] text-on-surface-variant/80 font-mono mt-0.5">
            7-day positive sync
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center gap-3 relative z-10 pt-2 border-t border-white/5">
        <button
          onClick={onBuildDay}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary-container to-primary text-slate-950 font-bold text-xs sm:text-sm shadow-[0_0_20px_rgba(76,215,246,0.35)] hover:shadow-[0_0_30px_rgba(76,215,246,0.55)] transition-all cursor-pointer flex items-center gap-2 active:scale-95"
        >
          <span className="material-symbols-outlined text-base">auto_awesome</span>
          Build My Day
        </button>

        <button
          onClick={onAnalyzeRecovery}
          className="px-5 py-2.5 rounded-xl bg-tertiary/15 border border-tertiary/40 text-tertiary font-bold text-xs sm:text-sm hover:bg-tertiary/25 hover:border-tertiary/60 transition-all cursor-pointer flex items-center gap-2 active:scale-95"
        >
          <span className="material-symbols-outlined text-base">vital_signs</span>
          Analyze Recovery
        </button>
      </div>
    </motion.section>
  );
}
