"use client";

import { motion } from "framer-motion";
import type { RecoveryIntelligenceResult } from "@/lib/ai/types";

interface RecoveryIntelligenceCardProps {
  data: RecoveryIntelligenceResult | null;
  loading: boolean;
}

export default function RecoveryIntelligenceCard({
  data,
  loading,
}: RecoveryIntelligenceCardProps) {
  const score = data?.score ?? 84;
  const baseline = data?.baseline ?? 80;
  const confidence = data?.confidence ?? "HIGH";
  const interpretation =
    data?.interpretation ||
    "Your recovery is currently above your personal baseline, primarily driven by steady sleep architecture and stabilized resting HRV. Physical capacity supports moderate-to-high intensity output today.";

  const factors = data?.factors ?? {
    sleep: 85,
    activity: 78,
    hrv: 82,
    spo2: 98,
    workload: 72,
    consistency: 88,
  };

  const factorItems = [
    { label: "Sleep", value: factors.sleep, color: "#b395ff" },
    { label: "Activity", value: factors.activity, color: "#ec6a06" },
    { label: "HRV", value: factors.hrv, color: "#4cd7f6" },
    { label: "SpO2", value: factors.spo2, color: "#4cd7f6" },
    { label: "Workload", value: factors.workload, color: "#ffb690" },
    { label: "Consistency", value: factors.consistency, color: "#b395ff" },
  ];

  return (
    <section className="glass-panel p-5 sm:p-7 rounded-2xl sm:rounded-3xl border border-white/10 relative overflow-hidden space-y-6">
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
            Deterministic Biometric Synthesis & Nervous System Balance
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-surface-container-high border border-white/10 text-on-surface-variant">
            14D Baseline: {baseline}%
          </span>
          <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-bold">
            {confidence} CONFIDENCE
          </span>
        </div>
      </div>

      {/* Score Hero + Factors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center relative z-10">
        {/* Circular Recovery Centerpiece */}
        <div className="md:col-span-4 flex flex-col items-center justify-center text-center p-4 rounded-2xl bg-surface-container-high/40 border border-white/5">
          <div className="relative w-36 h-36 flex items-center justify-center">
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
                strokeDashoffset={263.9 - (score / 100) * 263.9}
                strokeLinecap="round"
              />
            </svg>
            <div className="flex flex-col items-center">
              <span className="text-4xl font-extrabold text-white tracking-tight">
                {score}%
              </span>
              <span className="font-mono text-[9px] text-tertiary font-bold tracking-widest uppercase mt-0.5">
                {score >= 80 ? "OPTIMAL" : score >= 60 ? "BALANCED" : "STRAINED"}
              </span>
            </div>
          </div>
          <span className="text-[11px] text-on-surface-variant font-mono mt-3">
            {score >= baseline ? `↑ ${score - baseline}% above personal avg` : `↓ ${baseline - score}% below personal avg`}
          </span>
        </div>

        {/* Contributing Factors Breakdown Bars */}
        <div className="md:col-span-8 space-y-3">
          <span className="font-mono text-[10px] text-on-surface-variant uppercase tracking-wider block mb-2">
            CONTRIBUTING FACTORS BREAKDOWN
          </span>

          <div className="space-y-2.5">
            {factorItems.map((f) => (
              <div key={f.label} className="space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-white font-mono">{f.label}</span>
                  <span className="font-mono text-on-surface-variant font-bold">{f.value}%</span>
                </div>
                <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${f.value}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: f.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AI Natural Language Interpretation */}
      <div className="p-4 rounded-xl bg-surface-container-high/60 border border-white/5 relative z-10 space-y-2">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-tertiary text-base">psychology</span>
          <span className="font-mono text-xs text-white font-bold tracking-wider uppercase">
            AI PHYSIOLOGICAL SYNTHESIS
          </span>
        </div>
        {loading ? (
          <div className="h-4 bg-white/10 rounded animate-pulse w-4/5" />
        ) : (
          <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
            {interpretation}
          </p>
        )}
      </div>
    </section>
  );
}
