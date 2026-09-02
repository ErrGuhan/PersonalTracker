"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import type { PersonalizedPlan } from "@/lib/ai/types";

interface AiWorkflowModalProps {
  isOpen: boolean;
  onClose: () => void;
  workflowType: string;
  data: {
    title: string;
    summary: string;
    details?: string[];
    recommendedAction?: string;
    plan?: PersonalizedPlan;
    morningBrief?: {
      headline: string;
      overview: string;
      suggestedPriorities: string[];
    };
    eveningReview?: {
      completedHabits: string;
      focusMinutes: number;
      summary: string;
      tomorrowRecommendation: string;
    };
    sleepAnalysis?: {
      headline: string;
      qualityAnalysis: string;
      actionRecommendation: string;
    };
  } | null;
  loading: boolean;
  onApplyPlan?: (plan: PersonalizedPlan) => void;
  onShowToast?: (msg: string) => void;
}

export default function AiWorkflowModal({
  isOpen,
  onClose,
  workflowType,
  data,
  loading,
  onApplyPlan,
  onShowToast,
}: AiWorkflowModalProps) {
  const [applied, setApplied] = useState(false);

  if (!isOpen) return null;

  const handleApply = () => {
    if (data?.plan && onApplyPlan) {
      onApplyPlan(data.plan);
      setApplied(true);
      if (onShowToast) onShowToast("🎯 New tailored habits applied to your routines!");
    } else {
      setApplied(true);
      if (onShowToast) onShowToast("✓ Recommendation applied to today's schedule!");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[120] flex items-center justify-center bg-black/70 backdrop-blur-md p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 12 }}
        className="w-full max-w-lg max-h-[85vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [scrollbar-width:none] rounded-2xl sm:rounded-3xl bg-surface-dim/95 border border-white/15 p-6 sm:p-7 shadow-2xl space-y-5 text-on-surface"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-white/5 pb-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-xl">auto_awesome</span>
            <div>
              <h3 className="font-bold text-base sm:text-lg text-white">
                {data?.title || "Health Intelligence Workflow"}
              </h3>
              <p className="text-[11px] font-mono text-primary uppercase tracking-wider">
                {workflowType ? workflowType.replace("_", " ").toUpperCase() : "PERSONALIZED SYNTHESIS"}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Content Body */}
        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center space-y-3">
            <span className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            <p className="text-xs font-mono text-primary animate-pulse">
              Synthesizing telemetry and generating structured recommendation...
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Overview summary */}
            <div className="p-4 rounded-xl bg-surface-container-high/60 border border-white/5 space-y-1.5">
              <span className="font-mono text-[10px] text-on-surface-variant uppercase tracking-wider block">
                INTELLIGENCE SYNTHESIS
              </span>
              <p className="text-xs sm:text-sm text-white leading-relaxed">
                {data?.summary || data?.morningBrief?.overview || data?.eveningReview?.summary}
              </p>
            </div>

            {/* Bullet Details */}
            {data?.details && data.details.length > 0 && (
              <div className="space-y-2">
                <span className="font-mono text-[10px] text-on-surface-variant uppercase tracking-wider block">
                  KEY ACTION PROTOCOLS
                </span>
                <ul className="space-y-2">
                  {data.details.map((item, idx) => (
                    <li
                      key={idx}
                      className="p-3 rounded-xl bg-surface-container/40 border border-white/5 text-xs text-on-surface flex items-start gap-2.5"
                    >
                      <span className="material-symbols-outlined text-primary text-base shrink-0 mt-0.5">
                        arrow_right_alt
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Plan Preview if generated */}
            {data?.plan && (
              <div className="p-4 rounded-xl bg-surface-container/60 border border-primary/20 space-y-3">
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="text-primary font-bold">4-WEEK HABIT BLUEPRINT</span>
                  <span className="text-on-surface-variant">{data.plan.dailyCommitmentMinutes}m / day</span>
                </div>
                <div className="space-y-2">
                  {data.plan.habits.map((h, i) => (
                    <div
                      key={i}
                      className="p-2.5 rounded-lg bg-surface-container-high/80 border border-white/5 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary text-base">
                          {h.icon || "check_circle"}
                        </span>
                        <span className="font-semibold text-white">{h.title}</span>
                      </div>
                      <span className="font-mono text-on-surface-variant text-[11px]">{h.frequency}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Primary Recommended Action */}
            {data?.recommendedAction && (
              <div className="p-3.5 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-base">
                    recommend
                  </span>
                  <span className="text-xs font-semibold text-white">
                    {data.recommendedAction}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Modal Footer Controls */}
        <div className="flex items-center justify-between gap-3 pt-3 border-t border-white/5">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-mono text-on-surface-variant hover:text-white transition-colors cursor-pointer"
          >
            Close
          </button>

          {(data?.plan || data?.recommendedAction) && (
            <button
              onClick={handleApply}
              disabled={applied}
              className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 ${
                applied
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                  : "bg-gradient-to-r from-primary-container to-primary text-slate-950 shadow-[0_0_15px_rgba(76,215,246,0.3)] hover:shadow-[0_0_25px_rgba(76,215,246,0.5)]"
              }`}
            >
              <span className="material-symbols-outlined text-base">
                {applied ? "done_all" : "task_alt"}
              </span>
              {applied ? "Applied" : "Apply to My Schedule"}
            </button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
