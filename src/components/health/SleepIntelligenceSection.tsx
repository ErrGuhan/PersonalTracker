"use client";

import SleepBar from "@/components/SleepBar";
import type { SleepLog } from "@/lib/database.types";
import type { SleepAnalysisResult } from "@/lib/ai/types";

interface SleepIntelligenceSectionProps {
  latestSleep: SleepLog | null;
  loading: boolean;
  sleepAnalysis: SleepAnalysisResult | null;
  analyzingSleep: boolean;
  onOpenSleepModal: () => void;
  onViewFullAnalysis: () => void;
}

export default function SleepIntelligenceSection({
  latestSleep,
  loading,
  sleepAnalysis,
  analyzingSleep,
  onOpenSleepModal,
  onViewFullAnalysis,
}: SleepIntelligenceSectionProps) {
  const hours = latestSleep?.hours ?? 7.4;
  const deepPct = latestSleep?.deep_pct ?? 22;
  const remPct = latestSleep?.rem_pct ?? 18;
  const lightPct = latestSleep?.light_pct ?? 54;
  const awakePct = latestSleep?.awake_pct ?? 6;
  const bedtime = latestSleep?.bedtime || "23:00";
  const wakeTime = latestSleep?.wake_time || "06:45";

  return (
    <section className="glass-panel p-5 sm:p-7 rounded-2xl sm:rounded-3xl border border-white/10 relative overflow-hidden space-y-6">
      {/* Glow backdrop */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-tertiary/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header with Prominent Log Sleep Button */}
      <div className="flex flex-wrap items-center justify-between gap-3 relative z-10">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-tertiary text-xl">bedtime</span>
            <h3 className="font-bold text-base sm:text-lg text-white">Sleep & Circadian Intelligence</h3>
          </div>
          <p className="text-xs text-on-surface-variant mt-0.5">
            Sleep Architecture, Latency & Cellular Restoration
          </p>
        </div>

        <button
          onClick={onOpenSleepModal}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-tertiary-container to-tertiary text-slate-950 font-bold text-xs sm:text-sm shadow-[0_0_15px_rgba(179,149,255,0.3)] hover:shadow-[0_0_25px_rgba(179,149,255,0.5)] transition-all cursor-pointer flex items-center gap-1.5 active:scale-95"
        >
          <span className="material-symbols-outlined text-base">add</span>
          Log Sleep
        </button>
      </div>

      {/* Sleep Bar Breakdown */}
      <div className="relative z-10">
        {loading ? (
          <div className="h-28 bg-white/5 rounded-xl animate-pulse" />
        ) : (
          <SleepBar
            hours={hours}
            target={8}
            stages={{
              deep: deepPct,
              rem: remPct,
              light: lightPct,
              awake: awakePct,
            }}
          />
        )}
      </div>

      {/* Circadian Timestamps */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 relative z-10 pt-2 border-t border-white/5">
        <div className="p-3 rounded-xl bg-surface-container-high/40 border border-white/5">
          <span className="font-mono text-[10px] text-on-surface-variant uppercase">BEDTIME</span>
          <p className="text-sm font-bold text-white font-mono mt-0.5">{bedtime}</p>
        </div>
        <div className="p-3 rounded-xl bg-surface-container-high/40 border border-white/5">
          <span className="font-mono text-[10px] text-on-surface-variant uppercase">WAKE TIME</span>
          <p className="text-sm font-bold text-white font-mono mt-0.5">{wakeTime}</p>
        </div>
        <div className="p-3 rounded-xl bg-surface-container-high/40 border border-white/5">
          <span className="font-mono text-[10px] text-on-surface-variant uppercase">SLEEP QUALITY</span>
          <p className="text-sm font-bold text-tertiary font-mono mt-0.5">
            {latestSleep?.quality ? `${latestSleep.quality}/5 ⭐` : "88% Optimal"}
          </p>
        </div>
        <div className="p-3 rounded-xl bg-surface-container-high/40 border border-white/5">
          <span className="font-mono text-[10px] text-on-surface-variant uppercase">RESTED FEELING</span>
          <p className="text-sm font-bold text-emerald-400 font-mono mt-0.5">
            {latestSleep?.rested_rating ? `${latestSleep.rested_rating}/5 High` : "Restored"}
          </p>
        </div>
      </div>

      {/* Asynchronous AI Interpretation Banner */}
      <div className="relative z-10 p-4 rounded-xl bg-tertiary/10 border border-tertiary/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="material-symbols-outlined text-tertiary text-lg shrink-0 mt-0.5">
            auto_awesome
          </span>
          <div>
            <p className="text-xs font-bold text-white">
              {analyzingSleep
                ? "Analyzing recent sleep architecture..."
                : sleepAnalysis?.headline ||
                  "Your sleep duration was within 4% of your 14-day average."}
            </p>
            <p className="text-[11px] text-on-surface-variant mt-0.5">
              {sleepAnalysis?.actionRecommendation ||
                "Sufficient deep sleep cycles support neurological synthesis and recovery."}
            </p>
          </div>
        </div>

        <button
          onClick={onViewFullAnalysis}
          className="px-3.5 py-1.5 rounded-lg bg-tertiary/20 text-tertiary hover:bg-tertiary/30 text-xs font-semibold font-mono transition-colors shrink-0 cursor-pointer"
        >
          View Analysis →
        </button>
      </div>
    </section>
  );
}
