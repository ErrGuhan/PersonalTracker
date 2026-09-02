"use client";

import { useState, useMemo } from "react";
import type { HealthTrendPoint } from "@/lib/ai/types";

interface HealthTrendsSectionProps {
  trendData: HealthTrendPoint[];
  loading?: boolean;
}

type Timeframe = 7 | 30 | 90;
type MetricTab = "recovery" | "sleep" | "hrv" | "correlation";

export default function HealthTrendsSection({
  trendData,
  loading = false,
}: HealthTrendsSectionProps) {
  const [timeframe, setTimeframe] = useState<Timeframe>(7);
  const [selectedMetric, setSelectedMetric] = useState<MetricTab>("recovery");

  // Slice based on selected timeframe
  const activePoints = useMemo(() => {
    if (!trendData || trendData.length === 0) return [];
    return trendData.slice(-timeframe);
  }, [trendData, timeframe]);

  // Compute SVG chart coordinates
  const chartHeight = 140;
  const chartWidth = 500;

  const pointsFormatted = useMemo(() => {
    if (activePoints.length === 0) return [];

    let values: number[] = [];
    if (selectedMetric === "recovery") {
      values = activePoints.map((p) => p.recoveryScore);
    } else if (selectedMetric === "sleep") {
      values = activePoints.map((p) => p.sleepHours);
    } else if (selectedMetric === "hrv") {
      values = activePoints.map((p) => p.hrvMs);
    } else {
      // Correlation: focus minutes
      values = activePoints.map((p) => p.focusMinutes);
    }

    const min = Math.min(...values, 0);
    const max = Math.max(...values, selectedMetric === "sleep" ? 10 : 100);
    const range = max - min || 1;

    const stepX = chartWidth / Math.max(values.length - 1, 1);

    return values.map((val, idx) => {
      const x = idx * stepX;
      const y = chartHeight - ((val - min) / range) * (chartHeight - 20) - 10;
      return { x, y, val, date: activePoints[idx]?.date || "" };
    });
  }, [activePoints, selectedMetric]);

  const pathD = useMemo(() => {
    if (pointsFormatted.length === 0) return "";
    return pointsFormatted.reduce((acc, pt, i) => {
      if (i === 0) return `M ${pt.x} ${pt.y}`;
      return `${acc} L ${pt.x} ${pt.y}`;
    }, "");
  }, [pointsFormatted]);

  const areaD = useMemo(() => {
    if (pointsFormatted.length === 0) return "";
    const first = pointsFormatted[0];
    const last = pointsFormatted[pointsFormatted.length - 1];
    return `${pathD} L ${last.x} ${chartHeight} L ${first.x} ${chartHeight} Z`;
  }, [pathD, pointsFormatted, chartHeight]);

  const strokeColor =
    selectedMetric === "recovery"
      ? "#b395ff"
      : selectedMetric === "sleep"
      ? "#d0bcff"
      : selectedMetric === "hrv"
      ? "#4cd7f6"
      : "#ec6a06";

  return (
    <section className="glass-panel p-5 sm:p-7 rounded-2xl sm:rounded-3xl border border-white/10 relative overflow-hidden space-y-5">
      {/* Header & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-xl">query_stats</span>
            <h3 className="font-bold text-base sm:text-lg text-white">Health Trends & Correlation</h3>
          </div>
          <p className="text-xs text-on-surface-variant mt-0.5">
            Multi-Horizon Trajectory Across Recovery, Sleep, and HRV
          </p>
        </div>

        {/* Timeframe selector */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-surface-container-high/60 border border-white/10 text-xs font-mono">
          {([7, 30, 90] as Timeframe[]).map((t) => (
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
      </div>

      {/* Metric Selector Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-white/5 pb-3">
        {[
          { id: "recovery", label: "Recovery Trend", icon: "vital_signs" },
          { id: "sleep", label: "Sleep Architecture", icon: "bedtime" },
          { id: "hrv", label: "HRV Autonomic", icon: "ecg_heart" },
          { id: "correlation", label: "Focus vs Sleep", icon: "compare_arrows" },
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

      {/* Chart Canvas */}
      <div className="w-full relative overflow-hidden pt-2">
        {loading ? (
          <div className="h-36 bg-white/5 rounded-xl animate-pulse" />
        ) : pointsFormatted.length === 0 ? (
          <p className="text-center py-10 text-xs text-on-surface-variant">
            No historical trend records found for this timeframe.
          </p>
        ) : (
          <div className="w-full overflow-x-auto no-scrollbar">
            <svg
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              className="w-full h-36 sm:h-44 overflow-visible"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={strokeColor} stopOpacity="0.35" />
                  <stop offset="100%" stopColor={strokeColor} stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              <line x1="0" y1={chartHeight * 0.25} x2={chartWidth} y2={chartHeight * 0.25} stroke="rgba(255,255,255,0.05)" strokeDasharray="4 4" />
              <line x1="0" y1={chartHeight * 0.5} x2={chartWidth} y2={chartHeight * 0.5} stroke="rgba(255,255,255,0.05)" strokeDasharray="4 4" />
              <line x1="0" y1={chartHeight * 0.75} x2={chartWidth} y2={chartHeight * 0.75} stroke="rgba(255,255,255,0.05)" strokeDasharray="4 4" />

              {/* Gradient Area */}
              <path d={areaD} fill="url(#trendGradient)" />

              {/* Trend Line */}
              <path
                d={pathD}
                fill="none"
                stroke={strokeColor}
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Data points */}
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
          </div>
        )}
      </div>

      {/* Axis & Subtitle Indicators */}
      <div className="flex justify-between items-center text-[10px] font-mono text-on-surface-variant pt-1 border-t border-white/5">
        <span>{timeframe} Days Ago</span>
        <span>Today</span>
      </div>
    </section>
  );
}
