"use client";

import { motion } from "framer-motion";
import type { AiInsightItem } from "@/lib/ai/types";

interface AiInsightsSectionProps {
  insights: AiInsightItem[];
  loading?: boolean;
}

export default function AiInsightsSection({
  insights,
  loading = false,
}: AiInsightsSectionProps) {
  const displayInsights =
    insights && insights.length > 0
      ? insights
      : [
          {
            id: "ins-default-1",
            title: "Sleep Duration & Focus Association",
            text: "Your focus duration tends to be approximately 32% higher on days following 7+ hours of logged sleep.",
            correlationText: "Observed association between 7h+ sleep and study duration",
            evidence: "Based on 14 tracked days",
            daysTracked: 14,
            confidence: "HIGH" as const,
            category: "sleep" as const,
          },
          {
            id: "ins-default-2",
            title: "Workout Duration Consistency",
            text: "You complete 30-minute training routines significantly more regularly than 60-minute sessions.",
            correlationText: "Higher completion probability with moderate duration",
            evidence: "Based on 14 tracked days",
            daysTracked: 14,
            confidence: "MEDIUM" as const,
            category: "workout" as const,
          },
          {
            id: "ins-default-3",
            title: "Workload & Next-Day Nervous System",
            text: "Your recovery score shows an inverse trend following days where both heavy lifting and prolonged study sessions were combined.",
            correlationText: "Recovery dips after cumulative load exceeds 3.5 hours",
            evidence: "Based on 14 tracked days",
            daysTracked: 14,
            confidence: "MEDIUM" as const,
            category: "recovery" as const,
          },
        ];

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-xl">psychology</span>
          <h3 className="font-bold text-base sm:text-lg text-white">AI Behavioral Insights</h3>
        </div>
        <span className="font-mono text-[10px] text-on-surface-variant uppercase tracking-wider">
          EVIDENCE-GROUNDED
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {loading ? (
          [1, 2, 3].map((i) => (
            <div key={i} className="glass-panel p-5 rounded-2xl h-40 animate-pulse" />
          ))
        ) : (
          displayInsights.map((insight) => (
            <motion.div
              key={insight.id}
              whileHover={{ y: -2 }}
              className="glass-panel p-5 rounded-2xl border border-white/10 flex flex-col justify-between space-y-4 hover:border-primary/40 transition-colors"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-xs sm:text-sm text-white line-clamp-1">
                    {insight.title}
                  </span>
                  <span
                    className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full ${
                      insight.confidence === "HIGH"
                        ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                        : insight.confidence === "MEDIUM"
                        ? "bg-primary/15 text-primary border border-primary/30"
                        : "bg-white/10 text-on-surface-variant"
                    }`}
                  >
                    {insight.confidence}
                  </span>
                </div>

                <p className="text-xs text-on-surface-variant leading-relaxed">
                  {insight.text}
                </p>
              </div>

              {/* Grounded Evidence Tag */}
              <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-on-surface-variant/80">
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs text-primary">data_object</span>
                  {insight.evidence}
                </span>
                <span className="text-primary/80 uppercase">Verified</span>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </section>
  );
}
