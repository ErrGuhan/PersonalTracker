"use client";

import { useState, useMemo } from "react";
import type { HealthTrendPoint, AiInsightItem } from "@/lib/ai/types";

interface HealthTrendsSectionProps {
  trendData: HealthTrendPoint[];
  insights?: AiInsightItem[];
  loading?: boolean;
  onOpenSleepModal?: () => void;
  onOpenVitalsModal?: () => void;
}

type Timeframe = 7 | 30;
type MetricTab = "recovery" | "sleep" | "hrv";

export default function HealthTrendsSection({
  trendData,
  insights = [],
  loading = false,
  onOpenSleepModal,
  onOpenVitalsModal,
}: HealthTrendsSectionProps) {
  const [timeframe, setTimeframe] = useState<Timeframe>(7);
  const [selectedMetric, setSelectedMetric] = useState<MetricTab>("recovery");

  // Count days with actual recorded telemetry
  const recordedDaysCount = useMemo(() => {
    if (!trendData || trendData.length === 0) return 0;
    return trendData.filter((p) => p.hasData).length;
  }, [trendData]);

  // Check if minimum history threshold is met
  const hasSufficientHistory = recordedDaysCount >= 3;

  // Active points for the selected timeframe
  const activePoints = useMemo(() => {
    if (!trendData || trendData.length === 0) return [];
    return trendData.slice(-timeframe);
  }, [trendData, timeframe]);

  // Compute high-signal trend indicators
  const trendSummary = useMemo(() => {
    if (!hasSufficientHistory) return null;

    const validRecovery = activePoints
      .map((p) => p.recoveryScore)
      .filter((v): v is number => v !== null && v > 0);

    const validSleep = activePoints
      .map((p) => p.sleepHours)
      .filter((v): v is number => v !== null && v > 0);

    const avgRec =
      validRecovery.length > 0
        ? Math.round(validRecovery.reduce((s, r) => s + r, 0) / validRecovery.length)
        : null;

    const avgSl =
      validSleep.length > 0
        ? Number((validSleep.reduce((s, r) => s + r, 0) / validSleep.length).toFixed(1))
        : null;

    let recoveryTrajectory = "Steady";
    if (validRecovery.length >= 2) {
      const recent = validRecovery[validRecovery.length - 1];
      const prior = validRecovery[0];
      if (recent - prior >= 4) recoveryTrajectory = "Trending Upward ↑";
      else if (recent - prior <= -4) recoveryTrajectory = "Trending Downward ↓";
    }

    return { avgRecovery: avgRec, avgSleep: avgSl, recoveryTrajectory };
  }, [activePoints, hasSufficientHistory]);

  // Chart coordinates
  const chartHeight = 120;
  const chartWidth = 500;

  const pointsFormatted = useMemo(() => {
    if (!hasSufficientHistory || activePoints.length === 0) return [];

    let values: (number | null)[] = [];
    if (selectedMetric === "recovery") {
      values = activePoints.map((p) => p.recoveryScore);
    } else if (selectedMetric === "sleep") {
      values = activePoints.map((p) => p.sleepHours);
    } else {
      values = activePoints.map((p) => p.hrvMs);
    }

    // Filter valid values to find bounds
    const numericVals = values.filter((v): v is number => v !== null);
    if (numericVals.length === 0) return [];

    const min = Math.min(...numericVals, 0);
    const max = Math.max(...numericVals, selectedMetric === "sleep" ? 9 : 100);
    const range = max - min || 1;

    const stepX = chartWidth / Math.max(values.length - 1, 1);

    return values
      .map((val, idx) => {
        if (val === null) return null;
        const x = idx * stepX;
        const y = chartHeight - ((val - min) / range) * (chartHeight - 20) - 10;
        return { x, y, val, date: activePoints[idx]?.date || "" };
      })
      .filter((pt): pt is { x: number; y: number; val: number; date: string } => pt !== null);
  }, [activePoints, selectedMetric, hasSufficientHistory]);

  const pathD = useMemo(() => {
    if (pointsFormatted.length < 2) return "";
    return pointsFormatted.reduce((acc, pt, i) => {
      if (i === 0) return `M ${pt.x} ${pt.y}`;
      return `${acc} L ${pt.x} ${pt.y}`;
    }, "");
  }, [pointsFormatted]);

  const strokeColor =
    selectedMetric === "recovery"
      ? "#b395ff"
      : selectedMetric === "sleep"
      ? "#d0bcff"
      : "#4cd7f6";

  return (
    <section className="glass-panel p-5 sm:p-7 rounded-2xl sm:rounded-3xl border border-white/10 relative overflow-hidden space-y-5 bg-gradient-to-br from-surface-container/70 via-surface-container-low/60 to-surface-dim/80">
      {/* Header & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 relative z-10">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-xl">query_stats</span>
            <h3 className="font-bold text-base sm:text-lg text-white">Trends & Insights</h3>
          </div>
          <p className="text-xs text-on-surface-variant mt-0.5">
            High-Signal Trajectory & Verified Patterns
          </p>
        </div>

        {hasSufficientHistory && (
          <div className="flex items-center gap-1 p-1 rounded-xl bg-surface-container-high/60 border border-white/10 text-xs font-mono">
            {([7, 30] as Timeframe[]).map((t) => (
              <button
                key={t}
                onClick={() => setTimeframe(t)}
                className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer font-bold ${
                  timeframe === t
                    ? "bg-primary text-slate-950 shadow-[0_0_10px_rgba(76,215,246,0.4)]"
                    : "text-on-surface-variant hover:text-white"
                }`}
              >
                {t}D
              </button>
            ))}
          </div>
        )}
      </div>

      {loading ? (
        <div className="h-36 bg-white/5 rounded-2xl animate-pulse" />
      ) : !hasSufficientHistory ? (
        /* Clean Insufficient History Card (Phase 2 & 5 Requirement) */
        <div className="p-6 sm:p-8 rounded-xl bg-surface-container-high/20 border border-dashed border-white/10 text-center space-y-4 relative z-10">
          <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto text-primary">
            <span className="material-symbols-outlined text-2xl">timeline</span>
          </div>

          <div className="space-y-1">
            <h4 className="text-sm sm:text-base font-bold text-white">
              Not enough data to determine trends yet
            </h4>
            <p className="text-xs text-on-surface-variant max-w-md mx-auto leading-relaxed">
              Tracking for at least 7 days reveals personal biometric baselines, circadian rhythms, and recovery patterns.
            </p>
          </div>

          {/* Progress to baseline calibration */}
          <div className="max-w-xs mx-auto space-y-1.5 pt-1">
            <div className="flex justify-between text-[11px] font-mono text-on-surface-variant">
              <span>Calibration Progress</span>
              <span className="font-bold text-primary">{recordedDaysCount}/7 days tracked</span>
            </div>
            <div className="h-2 rounded-full bg-white/5 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary-container to-primary rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, Math.round((recordedDaysCount / 7) * 100))}%` }}
              />
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 pt-2">
            {onOpenSleepModal && (
              <button
                onClick={onOpenSleepModal}
                className="px-4 py-2 rounded-xl bg-surface-container-highest border border-white/10 text-white font-bold text-xs sm:text-sm hover:bg-white/10 transition-all cursor-pointer inline-flex items-center gap-1.5 active:scale-95"
              >
                <span className="material-symbols-outlined text-base text-primary">bedtime</span>
                Log Sleep
              </button>
            )}
            {onOpenVitalsModal && (
              <button
                onClick={onOpenVitalsModal}
                className="px-4 py-2 rounded-xl bg-surface-container-highest border border-white/10 text-white font-bold text-xs sm:text-sm hover:bg-white/10 transition-all cursor-pointer inline-flex items-center gap-1.5 active:scale-95"
              >
                <span className="material-symbols-outlined text-base text-tertiary">vital_signs</span>
                Log Vitals
              </button>
            )}
          </div>
        </div>
      ) : (
        /* High-Signal Verified Trends Content */
        <div className="space-y-4 relative z-10">
          {/* Key Trend Highlights Row */}
          {trendSummary && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-surface-container-high/40 border border-white/5">
                <span className="font-mono text-[10px] text-on-surface-variant uppercase">
                  RECOVERY TRAJECTORY
                </span>
                <p className="text-sm font-bold text-tertiary font-mono mt-0.5">
                  {trendSummary.recoveryTrajectory}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-surface-container-high/40 border border-white/5">
                <span className="font-mono text-[10px] text-on-surface-variant uppercase">
                  AVG RECOVERY ({timeframe}D)
                </span>
                <p className="text-sm font-bold text-white font-mono mt-0.5">
                  {trendSummary.avgRecovery !== null ? `${trendSummary.avgRecovery}%` : "—"}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-surface-container-high/40 border border-white/5">
                <span className="font-mono text-[10px] text-on-surface-variant uppercase">
                  AVG SLEEP ({timeframe}D)
                </span>
                <p className="text-sm font-bold text-white font-mono mt-0.5">
                  {trendSummary.avgSleep !== null ? `${trendSummary.avgSleep} hours` : "—"}
                </p>
              </div>
            </div>
          )}

          {/* Metric Selector Tabs */}
          <div className="flex flex-wrap items-center gap-2 border-b border-white/5 pb-2">
            {[
              { id: "recovery", label: "Recovery", icon: "vital_signs" },
              { id: "sleep", label: "Sleep Duration", icon: "bedtime" },
              { id: "hrv", label: "HRV Biometric", icon: "ecg_heart" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedMetric(tab.id as MetricTab)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  selectedMetric === tab.id
                    ? "bg-white/10 text-white border border-white/20 shadow-sm"
                    : "text-on-surface-variant hover:text-white hover:bg-white/5"
                }`}
              >
                <span className="material-symbols-outlined text-xs">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Chart Display */}
          {pointsFormatted.length >= 2 ? (
            <div className="w-full overflow-x-auto no-scrollbar pt-1">
              <svg
                viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                className="w-full h-32 sm:h-36 overflow-visible"
                preserveAspectRatio="none"
              >
                <line x1="0" y1={chartHeight * 0.33} x2={chartWidth} y2={chartHeight * 0.33} stroke="rgba(255,255,255,0.05)" strokeDasharray="4 4" />
                <line x1="0" y1={chartHeight * 0.66} x2={chartWidth} y2={chartHeight * 0.66} stroke="rgba(255,255,255,0.05)" strokeDasharray="4 4" />

                {pathD && (
                  <path
                    d={pathD}
                    fill="none"
                    stroke={strokeColor}
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}

                {pointsFormatted.map((pt, i) => (
                  <circle
                    key={i}
                    cx={pt.x}
                    cy={pt.y}
                    r="3.5"
                    fill="#0f131c"
                    stroke={strokeColor}
                    strokeWidth="2"
                  />
                ))}
              </svg>
              <div className="flex justify-between items-center text-[10px] font-mono text-on-surface-variant pt-2 border-t border-white/5">
                <span>{timeframe} Days Ago</span>
                <span>Today</span>
              </div>
            </div>
          ) : (
            <p className="text-center py-6 text-xs text-on-surface-variant font-mono">
              Not enough points recorded for {selectedMetric} trend yet.
            </p>
          )}

          {/* Verified Insights (Only shown if genuinely generated from 3+ days) */}
          {insights.length > 0 && (
            <div className="pt-2 border-t border-white/5 space-y-2">
              <span className="font-mono text-[10px] text-on-surface-variant uppercase tracking-wider block">
                VERIFIED PATTERNS
              </span>
              <div className="grid grid-cols-1 gap-2">
                {insights.map((ins) => (
                  <div
                    key={ins.id}
                    className="p-3 rounded-xl bg-surface-container-high/40 border border-white/5 space-y-1"
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-white">{ins.title}</span>
                      <span className="text-[10px] font-mono text-primary">{ins.evidence}</span>
                    </div>
                    <p className="text-xs text-on-surface-variant">{ins.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
