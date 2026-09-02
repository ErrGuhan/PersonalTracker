"use client";

import { motion } from "framer-motion";

interface QuickAiActionsProps {
  onTriggerAction: (actionType: string) => void;
}

const ACTIONS = [
  {
    id: "build_day",
    title: "Build My Day",
    desc: "AI energy-matched daily schedule",
    icon: "calendar_month",
    accent: "primary",
    borderGlow: "hover:border-primary/50",
  },
  {
    id: "improve_sleep",
    title: "Improve My Sleep",
    desc: "Stage architecture & wind-down",
    icon: "bedtime",
    accent: "tertiary",
    borderGlow: "hover:border-tertiary/50",
  },
  {
    id: "analyze_recovery",
    title: "Analyze Recovery",
    desc: "Autonomic nervous system deep dive",
    icon: "vital_signs",
    accent: "tertiary",
    borderGlow: "hover:border-tertiary/50",
  },
  {
    id: "why_tired",
    title: "Why Am I Tired?",
    desc: "Telemetry diagnostics & fatigue check",
    icon: "battery_alert",
    accent: "secondary",
    borderGlow: "hover:border-secondary/50",
  },
  {
    id: "review_progress",
    title: "Review My Progress",
    desc: "Habit streaks & 14-day momentum",
    icon: "insights",
    accent: "primary",
    borderGlow: "hover:border-primary/50",
  },
  {
    id: "adjust_plan",
    title: "Adjust My Plan",
    desc: "Adaptive targets based on recovery",
    icon: "tune",
    accent: "secondary",
    borderGlow: "hover:border-secondary/50",
  },
];

export default function QuickAiActions({ onTriggerAction }: QuickAiActionsProps) {
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-sm sm:text-base text-white flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-lg">bolt</span>
          Quick AI Actions
        </h3>
        <span className="font-mono text-[10px] text-on-surface-variant uppercase tracking-wider">
          DEDICATED WORKFLOWS
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {ACTIONS.map((action) => {
          const isCyan = action.accent === "primary";
          const isViolet = action.accent === "tertiary";

          return (
            <motion.button
              key={action.id}
              whileHover={{ y: -3, scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onTriggerAction(action.id)}
              className={`glass-panel p-3.5 rounded-2xl flex flex-col justify-between text-left transition-all border border-white/5 cursor-pointer min-h-[105px] group ${action.borderGlow}`}
            >
              <div className="flex items-center justify-between w-full">
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${
                    isCyan
                      ? "bg-primary/15 text-primary group-hover:bg-primary/25"
                      : isViolet
                      ? "bg-tertiary/15 text-tertiary group-hover:bg-tertiary/25"
                      : "bg-secondary/15 text-secondary group-hover:bg-secondary/25"
                  }`}
                >
                  <span className="material-symbols-outlined text-base">
                    {action.icon}
                  </span>
                </div>
                <span className="material-symbols-outlined text-xs text-on-surface-variant group-hover:text-white transition-colors">
                  arrow_outward
                </span>
              </div>

              <div>
                <p className="font-bold text-xs sm:text-sm text-white group-hover:text-primary transition-colors line-clamp-1">
                  {action.title}
                </p>
                <p className="text-[10px] text-on-surface-variant line-clamp-1 mt-0.5">
                  {action.desc}
                </p>
              </div>
            </motion.button>
          );
        })}
      </div>
    </section>
  );
}
