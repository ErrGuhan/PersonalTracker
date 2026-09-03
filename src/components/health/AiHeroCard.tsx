"use client";

import type { HeroHealthIntelligence } from "@/lib/ai/types";

interface AiHeroCardProps {
  heroData: HeroHealthIntelligence | null;
  loading: boolean;
  onOpenSleepModal: () => void;
  onOpenVitalsModal?: () => void;
  onAskAi: () => void;
  onBuildDay?: () => void;
}

export default function AiHeroCard({
  heroData,
  loading,
  onOpenSleepModal,
  onOpenVitalsModal,
  onAskAi,
  onBuildDay,
}: AiHeroCardProps) {
  const hasRecovery = heroData?.recoveryScore != null;
  const hasSleep = heroData?.sleepDurationHours != null;
  const recovery = heroData?.recoveryScore;
  const sleep = heroData?.sleepDurationHours;
  const capacityLevel = heroData?.capacityLevel ?? "INSUFFICIENT";
  const headline = heroData?.headline ?? (hasRecovery ? "Today's Readiness" : "No Health Data Recorded Yet");
  const interpretation =
    heroData?.interpretation ??
    "Log your first sleep session or vitals to unlock your personalized recovery intelligence and daily readiness score.";
  const trend = heroData?.trendIndicator ?? "unknown";

  return (
    <section
      className="animate-fadeIn glass-panel rounded-2xl sm:rounded-3xl p-5 sm:p-7 relative overflow-hidden border border-white/10 shadow-2xl bg-gradient-to-br from-surface-container/90 via-surface-container-low/80 to-surface-dim/95"
    >
      {/* Ambient Glows */}
      <div className="absolute -top-20 -right-20 w-72 h-72 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-20 w-72 h-72 bg-tertiary/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Tagline */}
      <div className="flex items-center justify-between gap-3 mb-5 relative z-10 flex-wrap">
        <div className="flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-primary shadow-[0_0_8px_#4cd7f6] opacity-80" />
          <span className="font-mono text-[11px] sm:text-xs text-primary font-bold tracking-widest uppercase">
            HEALTH STATUS OVERVIEW
          </span>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] font-mono text-on-surface-variant">
          <span className="material-symbols-outlined text-xs text-primary">verified_user</span>
          <span>{heroData?.confidence ?? "AWAITING DATA"} CONFIDENCE</span>
        </div>
      </div>

      {/* Headline & Natural Language Summary */}
      <div className="mb-6 relative z-10 space-y-2">
        <div className="flex items-center gap-2 flex-wrap">
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            {heroData?.greeting ?? "Welcome"}
          </h2>
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

      {/* Overview Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6 relative z-10">
        {/* 1. Recovery / Readiness Score */}
        <div className="p-4 rounded-xl bg-surface-container-high/60 border border-white/5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] text-on-surface-variant uppercase tracking-wider">
              OVERALL READINESS
            </span>
            <span className="material-symbols-outlined text-tertiary text-base">vital_signs</span>
          </div>
          <div className="mt-2">
            {hasRecovery ? (
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-extrabold text-tertiary">
                  {recovery}%
                </span>
                <span
                  className={`text-xs font-mono font-bold ${
                    trend === "up" ? "text-emerald-400" : trend === "down" ? "text-rose-400" : "text-slate-400"
                  }`}
                >
                  {trend === "up" ? "↑ Rising" : trend === "down" ? "↓ Dipping" : "— Steady"}
                </span>
              </div>
            ) : (
              <div>
                <span className="text-lg font-bold text-slate-400">Not recorded</span>
                <p className="text-[10px] text-on-surface-variant/70 font-mono mt-0.5">
                  Log sleep or vitals to calculate
                </p>
              </div>
            )}
          </div>
        </div>

        {/* 2. Sleep Duration */}
        <div className="p-4 rounded-xl bg-surface-container-high/60 border border-white/5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] text-on-surface-variant uppercase tracking-wider">
              TODAY&apos;S SLEEP
            </span>
            <span className="material-symbols-outlined text-white text-base">bedtime</span>
          </div>
          <div className="mt-2">
            {hasSleep ? (
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl sm:text-3xl font-extrabold text-white">
                  {sleep!.toFixed(1)}
                </span>
                <span className="text-xs text-on-surface-variant font-mono">hours logged</span>
              </div>
            ) : (
              <div>
                <span className="text-lg font-bold text-slate-400">No sleep logged</span>
                <p className="text-[10px] text-on-surface-variant/70 font-mono mt-0.5">
                  Record last night&apos;s rest
                </p>
              </div>
            )}
          </div>
        </div>

        {/* 3. Daily Capacity */}
        <div className="p-4 rounded-xl bg-surface-container-high/60 border border-white/5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] text-on-surface-variant uppercase tracking-wider">
              DAILY CAPACITY
            </span>
            <span className="material-symbols-outlined text-primary text-base">bolt</span>
          </div>
          <div className="mt-2">
            {capacityLevel !== "INSUFFICIENT" ? (
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl sm:text-2xl font-extrabold text-primary">
                  {capacityLevel}
                </span>
                <span className="text-[11px] text-on-surface-variant font-mono">readiness</span>
              </div>
            ) : (
              <div>
                <span className="text-lg font-bold text-slate-400">Pending</span>
                <p className="text-[10px] text-on-surface-variant/70 font-mono mt-0.5">
                  Awaiting biometric telemetry
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Action Buttons (Phase 2 Requirement) */}
      <div className="flex flex-wrap items-center gap-3 relative z-10 pt-3 border-t border-white/5">
        <button
          onClick={onOpenSleepModal}
          className="px-4 py-2.5 rounded-xl bg-surface-container-highest/80 hover:bg-white/10 border border-white/10 text-white font-bold text-xs sm:text-sm transition-all cursor-pointer flex items-center gap-2 active:scale-95 shadow-sm"
        >
          <span className="material-symbols-outlined text-base text-primary">bedtime</span>
          Log Sleep
        </button>

        {onOpenVitalsModal && (
          <button
            onClick={onOpenVitalsModal}
            className="px-4 py-2.5 rounded-xl bg-surface-container-highest/80 hover:bg-white/10 border border-white/10 text-white font-bold text-xs sm:text-sm transition-all cursor-pointer flex items-center gap-2 active:scale-95 shadow-sm"
          >
            <span className="material-symbols-outlined text-base text-tertiary">vital_signs</span>
            Log Vitals
          </button>
        )}

        <button
          onClick={onAskAi}
          className="px-4 py-2.5 rounded-xl bg-primary text-slate-950 font-extrabold text-xs sm:text-sm shadow-[0_0_20px_rgba(76,215,246,0.35)] hover:shadow-[0_0_30px_rgba(76,215,246,0.55)] transition-all cursor-pointer flex items-center gap-2 active:scale-95"
        >
          <span className="material-symbols-outlined text-base">smart_toy</span>
          Ask AI
        </button>

        {onBuildDay && (
          <button
            onClick={onBuildDay}
            className="px-4 py-2.5 rounded-xl bg-tertiary/15 border border-tertiary/40 text-tertiary font-bold text-xs sm:text-sm hover:bg-tertiary/25 hover:border-tertiary/60 transition-all cursor-pointer flex items-center gap-2 active:scale-95 sm:ml-auto"
          >
            <span className="material-symbols-outlined text-base">auto_awesome</span>
            Build My Day
          </button>
        )}
      </div>
    </section>
  );
}
