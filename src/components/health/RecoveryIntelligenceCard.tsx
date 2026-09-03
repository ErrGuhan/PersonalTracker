"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { RecoveryIntelligenceResult } from "@/lib/ai/types";

interface RecoveryIntelligenceCardProps {
  data: RecoveryIntelligenceResult | null;
  loading: boolean;
  onOpenVitalsModal?: () => void;
  onOpenSleepModal?: () => void;
}

export default function RecoveryIntelligenceCard({
  data,
  loading,
  onOpenVitalsModal,
  onOpenSleepModal,
}: RecoveryIntelligenceCardProps) {
  const [showDetails, setShowDetails] = useState(false);

  const hasScore = data?.score !== null && data?.score !== undefined;
  const score = data?.score ?? null;
  const baseline = data?.baseline ?? null;
  const confidence = data?.confidence ?? "INSUFFICIENT";
  const trend = data?.trend ?? "insufficient_data";

  const interpretation =
    data?.interpretation ||
    (hasScore
      ? `Your recovery score is calculated at ${score}%. ${
          baseline !== null
            ? `It is currently ${score! >= baseline ? "above" : "below"} your personal baseline (${baseline}%).`
            : "Continue tracking for 3+ days to establish your personal baseline."
        }`
      : "Recovery metrics have not been recorded yet today. Log your sleep or vitals to calculate your recovery readiness.");

  const factors = data?.factors;

  const factorList = [
    { key: "sleep", label: "Sleep Duration", factor: factors?.sleep, color: "#b395ff", onLog: onOpenSleepModal },
    { key: "hrv", label: "Heart Rate Variability (HRV)", factor: factors?.hrv, color: "#4cd7f6", onLog: onOpenVitalsModal },
    { key: "spo2", label: "Oxygen Saturation (SpO2)", factor: factors?.spo2, color: "#4cd7f6", onLog: onOpenVitalsModal },
    { key: "activity", label: "Physical Activity", factor: factors?.activity, color: "#ec6a06", onLog: onOpenVitalsModal },
    { key: "workload", label: "Autonomic Workload", factor: factors?.workload, color: "#ffb690", onLog: onOpenVitalsModal },
    { key: "consistency", label: "Habit Consistency", factor: factors?.consistency, color: "#b395ff", onLog: undefined },
  ];

  return (
    <section className="glass-panel p-5 sm:p-7 rounded-2xl sm:rounded-3xl border border-white/10 relative overflow-hidden space-y-5 bg-gradient-to-br from-surface-container/70 via-surface-container-low/60 to-surface-dim/80">
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-64 h-64 bg-tertiary/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 relative z-10">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-tertiary text-xl">vital_signs</span>
            <h3 className="font-bold text-base sm:text-lg text-white">Recovery Intelligence</h3>
          </div>
          <p className="text-xs text-on-surface-variant mt-0.5">
            Deterministic Biometric Readiness & Autonomic Balance
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {baseline !== null ? (
            <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-surface-container-high border border-white/10 text-on-surface-variant">
              Baseline: {baseline}%
            </span>
          ) : (
            <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-surface-container-high border border-white/10 text-slate-400">
              Baseline: Needs 3+ days
            </span>
          )}
          <span
            className={`text-[10px] font-mono px-2.5 py-1 rounded-full border font-bold ${
              confidence === "HIGH"
                ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-300"
                : confidence === "MEDIUM"
                ? "bg-primary/15 border-primary/30 text-primary"
                : "bg-surface-container-high border-white/10 text-slate-400"
            }`}
          >
            {confidence} CONFIDENCE
          </span>
        </div>
      </div>

      {loading ? (
        <div className="h-36 bg-white/5 rounded-2xl animate-pulse" />
      ) : hasScore ? (
        <div className="space-y-5 relative z-10">
          {/* Score & Trajectory Hero */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
            {/* Circular Progress Gauge */}
            <div className="md:col-span-4 flex flex-col items-center justify-center text-center p-4 rounded-2xl bg-surface-container-high/40 border border-white/5">
              <div className="relative w-32 h-32 flex items-center justify-center">
                <svg className="absolute inset-0 w-full h-full circular-progress" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" fill="none" r="42" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
                  <circle
                    className="drop-shadow-[0_0_12px_rgba(179,149,255,0.6)] transition-all duration-1000 ease-out"
                    cx="50"
                    cy="50"
                    fill="none"
                    r="42"
                    stroke="#b395ff"
                    strokeWidth="6"
                    strokeDasharray="263.9"
                    strokeDashoffset={263.9 - (score! / 100) * 263.9}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="flex flex-col items-center">
                  <span className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                    {score}%
                  </span>
                  <span className="font-mono text-[9px] text-tertiary font-bold tracking-widest uppercase mt-0.5">
                    {score! >= 80 ? "OPTIMAL" : score! >= 60 ? "BALANCED" : "STRAINED"}
                  </span>
                </div>
              </div>

              <span className="text-[11px] text-on-surface-variant font-mono mt-2">
                {baseline !== null
                  ? score! >= baseline
                    ? `↑ ${score! - baseline}% above baseline`
                    : `↓ ${baseline - score!}% below baseline`
                  : "Calibrating personal baseline..."}
              </span>
            </div>

            {/* Quick Synthesis & Factor Highlights */}
            <div className="md:col-span-8 space-y-3">
              <div className="p-3.5 rounded-xl bg-surface-container-high/40 border border-white/5 space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-white font-mono">
                  <span className="material-symbols-outlined text-tertiary text-sm">psychology</span>
                  RECOVERY ASSESSMENT
                </div>
                <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
                  {interpretation}
                </p>
              </div>

              {/* Toggle Factor Details Button */}
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="w-full py-2 px-3 rounded-xl bg-surface-container-high/30 hover:bg-white/5 border border-white/5 text-xs font-mono text-on-surface-variant hover:text-white transition-all flex items-center justify-between cursor-pointer"
              >
                <span>{showDetails ? "Hide Factor Breakdown" : "View Contributing Factor Breakdown"}</span>
                <span className="material-symbols-outlined text-sm">
                  {showDetails ? "expand_less" : "expand_more"}
                </span>
              </button>
            </div>
          </div>

          {/* Expandable Factor Details Breakdown (Phase 2 Requirement) */}
          <AnimatePresence>
            {showDetails && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden pt-2 border-t border-white/5 space-y-3"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {factorList.map(({ key, label, factor, color, onLog }) => {
                    const isRecorded = factor?.isRecorded ?? false;
                    const val = factor?.score;

                    return (
                      <div
                        key={key}
                        className="p-3 rounded-xl bg-surface-container-high/40 border border-white/5 space-y-2"
                      >
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-semibold text-white font-mono text-[11px]">
                            {label}
                          </span>
                          {isRecorded && val !== null ? (
                            <span className="font-mono text-tertiary font-bold text-xs">
                              {factor?.rawValue ? `${factor.rawValue} (${val}%)` : `${val}%`}
                            </span>
                          ) : (
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono text-slate-400 text-[10px]">
                                Not recorded
                              </span>
                              {onLog && (
                                <button
                                  onClick={onLog}
                                  className="text-[10px] font-mono text-primary hover:underline cursor-pointer"
                                >
                                  [Log]
                                </button>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Progress Bar only if recorded */}
                        <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                          {isRecorded && val !== null ? (
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${val}%` }}
                              transition={{ duration: 0.6, ease: "easeOut" }}
                              className="h-full rounded-full"
                              style={{ backgroundColor: color }}
                            />
                          ) : (
                            <div className="h-full w-0" />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ) : (
        /* Empty State */
        <div className="p-6 sm:p-8 rounded-xl bg-surface-container-high/20 border border-dashed border-white/10 text-center space-y-3 relative z-10">
          <div className="w-12 h-12 rounded-full bg-tertiary/10 border border-tertiary/20 flex items-center justify-center mx-auto text-tertiary">
            <span className="material-symbols-outlined text-2xl">vital_signs</span>
          </div>
          <div>
            <h4 className="text-sm sm:text-base font-bold text-white">Recovery Score Not Recorded</h4>
            <p className="text-xs text-on-surface-variant mt-1 max-w-md mx-auto">
              Recovery is calculated deterministically from your sleep duration, resting HRV, and hydration. Log your sleep or vitals to unlock your recovery intelligence.
            </p>
          </div>
          <div className="flex items-center justify-center gap-2 pt-1">
            {onOpenSleepModal && (
              <button
                onClick={onOpenSleepModal}
                className="px-4 py-2 rounded-xl bg-tertiary text-slate-950 font-bold text-xs sm:text-sm hover:opacity-90 transition-all cursor-pointer inline-flex items-center gap-1.5 active:scale-95"
              >
                <span className="material-symbols-outlined text-base">bedtime</span>
                Log Sleep
              </button>
            )}
            {onOpenVitalsModal && (
              <button
                onClick={onOpenVitalsModal}
                className="px-4 py-2 rounded-xl bg-surface-container-highest border border-white/10 text-white font-bold text-xs sm:text-sm hover:bg-white/10 transition-all cursor-pointer inline-flex items-center gap-1.5 active:scale-95"
              >
                <span className="material-symbols-outlined text-base text-primary">vital_signs</span>
                Log Vitals
              </button>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
