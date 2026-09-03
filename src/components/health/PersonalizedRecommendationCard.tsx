"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { PersonalizedRecommendation } from "@/lib/ai/types";

interface PersonalizedRecommendationCardProps {
  recommendation: PersonalizedRecommendation | null;
  loading?: boolean;
  onApply: (rec: PersonalizedRecommendation) => void;
  onDismiss: () => void;
}

export default function PersonalizedRecommendationCard({
  recommendation,
  loading = false,
  onApply,
  onDismiss,
}: PersonalizedRecommendationCardProps) {
  const [showWhy, setShowWhy] = useState(false);
  const [applied, setApplied] = useState(false);

  if (!recommendation && !loading) return null;

  const title = recommendation?.title ?? "Calibrating Daily Plan";
  const summary =
    recommendation?.summary ??
    "Analyzing your current biometrics and recent activity volume to generate calibrated daily recommendations.";
  const actions = recommendation?.actions ?? [];
  const whyExplanation =
    recommendation?.whyExplanation ??
    "Derived from comparing your current physiological recovery against your personal baseline and scheduled load.";

  const handleApply = () => {
    if (recommendation) {
      onApply(recommendation);
      setApplied(true);
    }
  };

  return (
    <section className="glass-panel p-5 sm:p-7 rounded-2xl sm:rounded-3xl border border-primary/20 relative overflow-hidden space-y-5 bg-gradient-to-br from-surface-container/90 via-surface-container-low/70 to-surface-dim/95">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-primary animate-ping" />
          <span className="font-mono text-xs text-primary font-bold tracking-widest uppercase">
            TODAY&apos;S RECOMMENDATION
          </span>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-on-surface-variant">
          CONFIDENCE: {recommendation?.confidence ?? "HIGH"}
        </span>
      </div>

      {/* Main Title & Summary */}
      <div className="space-y-1.5">
        <h4 className="text-base sm:text-lg font-bold text-white tracking-tight">
          {title}
        </h4>
        <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
          {summary}
        </p>
      </div>

      {/* Action Items List */}
      <div className="space-y-2 pt-1">
        <span className="font-mono text-[10px] text-on-surface-variant uppercase tracking-wider block">
          PROPOSED SCHEDULE PROTOCOL:
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {actions.map((act) => (
            <div
              key={act.id}
              className="p-3 rounded-xl bg-surface-container-high/50 border border-white/5 flex items-start gap-2.5"
            >
              <span className="material-symbols-outlined text-primary text-base shrink-0 mt-0.5">
                check_circle
              </span>
              <div>
                <p className="text-xs font-bold text-white">{act.label}</p>
                <p className="text-[11px] text-on-surface-variant mt-0.5">{act.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Why Explanation Toggle Drawer */}
      <AnimatePresence>
        {showWhy && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="p-4 rounded-xl bg-surface-container/80 border border-white/10 space-y-2 overflow-hidden"
          >
            <div className="flex items-center gap-2 text-xs font-mono text-tertiary font-bold">
              <span className="material-symbols-outlined text-sm">help</span>
              WHY THIS RECOMMENDATION?
            </div>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              {whyExplanation}
            </p>
            {recommendation?.evidence && (
              <ul className="list-disc list-inside text-[11px] font-mono text-on-surface-variant/80 space-y-0.5">
                {recommendation.evidence.map((ev, i) => (
                  <li key={i}>{ev}</li>
                ))}
              </ul>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-white/5">
        <div className="flex items-center gap-2">
          <button
            onClick={handleApply}
            disabled={applied}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 ${
              applied
                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                : "bg-gradient-to-r from-primary-container to-primary text-slate-950 shadow-[0_0_15px_rgba(76,215,246,0.3)] hover:shadow-[0_0_25px_rgba(76,215,246,0.5)]"
            }`}
          >
            <span className="material-symbols-outlined text-base">
              {applied ? "done_all" : "task_alt"}
            </span>
            {applied ? "Applied to Today's Plan" : "Apply to Today's Plan"}
          </button>

          <button
            onClick={() => setShowWhy(!showWhy)}
            className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-on-surface-variant hover:text-white text-xs font-mono font-semibold transition-colors cursor-pointer"
          >
            {showWhy ? "Hide Why" : "Why?"}
          </button>
        </div>

        <button
          onClick={onDismiss}
          className="text-xs font-mono text-on-surface-variant hover:text-white transition-colors cursor-pointer"
        >
          Dismiss
        </button>
      </div>
    </section>
  );
}
