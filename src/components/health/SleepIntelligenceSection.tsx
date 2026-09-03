"use client";

import SleepBar from "@/components/SleepBar";
import type { SleepLog } from "@/lib/database.types";
import type { SleepAnalysisResult } from "@/lib/ai/types";

interface SleepIntelligenceSectionProps {
  latestSleep: SleepLog | null;
  loading: boolean;
  sleepAnalysis: SleepAnalysisResult | null;
  analyzingSleep: boolean;
  baselineSleepHours?: number | null;
  onOpenSleepModal: () => void;
  onViewFullAnalysis?: () => void;
}

export default function SleepIntelligenceSection({
  latestSleep,
  loading,
  sleepAnalysis,
  analyzingSleep,
  baselineSleepHours,
  onOpenSleepModal,
  onViewFullAnalysis,
}: SleepIntelligenceSectionProps) {
  const hasSleep = latestSleep !== null && latestSleep.hours !== null && Number(latestSleep.hours) > 0;
  const hours = hasSleep ? Number(latestSleep!.hours) : null;

  // Only consider stages valid if they exist and are non-zero
  const hasValidStages = Boolean(
    hasSleep &&
      latestSleep?.deep_pct !== null &&
      latestSleep?.deep_pct !== undefined &&
      latestSleep.deep_pct > 0 &&
      latestSleep?.rem_pct !== null &&
      latestSleep?.rem_pct !== undefined &&
      latestSleep.rem_pct > 0
  );

  const deepPct = hasValidStages ? latestSleep!.deep_pct : 0;
  const remPct = hasValidStages ? latestSleep!.rem_pct : 0;
  const lightPct = hasValidStages ? latestSleep!.light_pct : 0;
  const awakePct = hasValidStages ? latestSleep!.awake_pct : 0;

  // Baseline difference calculation
  let baselineDiffText: string | null = null;
  if (hours !== null && baselineSleepHours !== undefined && baselineSleepHours !== null && baselineSleepHours > 0) {
    const diff = Number((hours - baselineSleepHours).toFixed(1));
    if (diff > 0) {
      baselineDiffText = `+${diff}h vs personal baseline (${baselineSleepHours}h)`;
    } else if (diff < 0) {
      baselineDiffText = `${diff}h vs personal baseline (${baselineSleepHours}h)`;
    } else {
      baselineDiffText = `Matches your personal baseline (${baselineSleepHours}h)`;
    }
  }

  return (
    <section className="glass-panel p-5 sm:p-7 rounded-2xl sm:rounded-3xl border border-white/10 relative overflow-hidden space-y-5 bg-gradient-to-br from-surface-container/70 via-surface-container-low/60 to-surface-dim/80">
      {/* Ambient Glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-tertiary/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header with Log Sleep Action */}
      <div className="flex flex-wrap items-center justify-between gap-3 relative z-10">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-tertiary text-xl">bedtime</span>
            <h3 className="font-bold text-base sm:text-lg text-white">Sleep Intelligence</h3>
          </div>
          <p className="text-xs text-on-surface-variant mt-0.5">
            Restorative Duration, Sleep Architecture & Circadian Rhythm
          </p>
        </div>

        <button
          onClick={onOpenSleepModal}
          className="px-4 py-2 rounded-xl bg-tertiary/20 hover:bg-tertiary/30 border border-tertiary/30 text-tertiary font-bold text-xs sm:text-sm transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 shadow-sm"
        >
          <span className="material-symbols-outlined text-base">add</span>
          {hasSleep ? "Update Sleep" : "Log Sleep"}
        </button>
      </div>

      {loading ? (
        <div className="h-28 bg-white/5 rounded-xl animate-pulse" />
      ) : hasSleep ? (
        <div className="space-y-4 relative z-10">
          {/* Main Duration & Baseline Comparison Row */}
          <div className="p-4 rounded-xl bg-surface-container-high/40 border border-white/5 flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="font-mono text-[10px] text-on-surface-variant uppercase tracking-wider">
                LAST NIGHT&apos;S DURATION
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl sm:text-4xl font-extrabold text-white">
                  {hours!.toFixed(1)}
                </span>
                <span className="text-sm text-on-surface-variant font-mono">hours</span>
              </div>
              {baselineDiffText && (
                <p className="text-xs text-primary font-mono mt-1 flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs">tune</span>
                  {baselineDiffText}
                </p>
              )}
            </div>

            {/* Quality & Rested Feeling Tiles */}
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-white/5 border border-white/5 text-center min-w-[100px]">
                <span className="font-mono text-[10px] text-on-surface-variant uppercase">QUALITY</span>
                <p className="text-sm font-bold text-tertiary font-mono mt-0.5">
                  {latestSleep?.quality ? `${latestSleep.quality}/5 ⭐` : "Not rated"}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-white/5 border border-white/5 text-center min-w-[100px]">
                <span className="font-mono text-[10px] text-on-surface-variant uppercase">RESTED</span>
                <p className="text-sm font-bold text-emerald-400 font-mono mt-0.5">
                  {latestSleep?.rested_rating ? `${latestSleep.rested_rating}/5` : "Not rated"}
                </p>
              </div>
            </div>
          </div>

          {/* Conditional Sleep Stage Architecture — ONLY displayed when valid stages exist */}
          {hasValidStages && (
            <div className="p-4 rounded-xl bg-surface-container-high/30 border border-white/5 space-y-2">
              <span className="font-mono text-[10px] text-on-surface-variant uppercase tracking-wider">
                MEASURED SLEEP STAGES
              </span>
              <SleepBar
                hours={hours!}
                target={8}
                stages={{
                  deep: deepPct,
                  rem: remPct,
                  light: lightPct,
                  awake: awakePct,
                }}
              />
            </div>
          )}

          {/* Optional Analysis or Insights */}
          {(sleepAnalysis || analyzingSleep) && (
            <div className="p-3.5 rounded-xl bg-tertiary/10 border border-tertiary/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <span className="material-symbols-outlined text-tertiary text-base shrink-0 mt-0.5">
                  auto_awesome
                </span>
                <div>
                  <p className="text-xs font-bold text-white">
                    {analyzingSleep ? "Analyzing sleep architecture..." : sleepAnalysis?.headline}
                  </p>
                  {sleepAnalysis?.actionRecommendation && (
                    <p className="text-[11px] text-on-surface-variant mt-0.5">
                      {sleepAnalysis.actionRecommendation}
                    </p>
                  )}
                </div>
              </div>

              {onViewFullAnalysis && (
                <button
                  onClick={onViewFullAnalysis}
                  className="px-3 py-1 rounded-lg bg-tertiary/20 text-tertiary hover:bg-tertiary/30 text-xs font-semibold font-mono transition-colors shrink-0 cursor-pointer"
                >
                  View Details →
                </button>
              )}
            </div>
          )}
        </div>
      ) : (
        /* Empty State: Clean guidance to log sleep */
        <div className="p-6 sm:p-8 rounded-xl bg-surface-container-high/20 border border-dashed border-white/10 text-center space-y-3 relative z-10">
          <div className="w-12 h-12 rounded-full bg-tertiary/10 border border-tertiary/20 flex items-center justify-center mx-auto text-tertiary">
            <span className="material-symbols-outlined text-2xl">bedtime</span>
          </div>
          <div>
            <h4 className="text-sm sm:text-base font-bold text-white">No Sleep Logged for Last Night</h4>
            <p className="text-xs text-on-surface-variant mt-1 max-w-md mx-auto">
              Logging your sleep duration unlocks your recovery calculation, readiness metrics, and personalized daily recommendations.
            </p>
          </div>
          <button
            onClick={onOpenSleepModal}
            className="px-4 py-2 rounded-xl bg-tertiary text-slate-950 font-bold text-xs sm:text-sm hover:opacity-90 transition-all cursor-pointer inline-flex items-center gap-1.5 active:scale-95"
          >
            <span className="material-symbols-outlined text-base">add</span>
            Log Sleep Duration
          </button>
        </div>
      )}
    </section>
  );
}
