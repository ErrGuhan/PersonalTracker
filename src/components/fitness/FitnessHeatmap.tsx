"use client";

import { useWorkoutHeatmap } from "@/hooks/useSupabase";

const DAYS = ["M", "T", "W", "T", "F", "S", "S"];

interface FitnessHeatmapProps {
  customData?: number[];
}

export default function FitnessHeatmap({ customData }: FitnessHeatmapProps) {
  const { data: serverData, loading } = useWorkoutHeatmap();
  const cells = customData ?? serverData ?? [];

  // Fallback to 112 zeros if loading or empty
  const displayCells = cells.length >= 112
    ? cells.slice(cells.length - 112)
    : cells.concat(new Array(Math.max(0, 112 - cells.length)).fill(0));

  const totalActiveDays = displayCells.filter((c) => c > 0).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-[var(--muted-foreground)]">
          {loading ? "Computing activity..." : `${totalActiveDays} active training days recorded`}
        </span>
      </div>

      <div className="flex gap-1 mb-2">
        {DAYS.map((d, i) => (
          <div key={i} className="label-caps w-5 text-center flex-1 text-[10px] text-[var(--muted-foreground)]">
            {d}
          </div>
        ))}
      </div>

      <div
        className="grid gap-1 overflow-x-auto pb-1"
        style={{
          gridTemplateColumns: "repeat(16, minmax(12px, 1fr))",
          gridTemplateRows: "repeat(7, 1fr)",
          gridAutoFlow: "column",
        }}
      >
        {displayCells.map((tier, i) => {
          const tierLabel = tier === 3
            ? "Vigorous (>500 kcal or >60m)"
            : tier === 2
            ? "Moderate (250–500 kcal or 30–60m)"
            : tier === 1
            ? "Light (<250 kcal or <30m)"
            : "Rest / No logged workout";

          return (
            <div
              key={i}
              title={tierLabel}
              className={`rounded-sm aspect-square transition-all duration-150 ${
                tier === 3
                  ? "bg-cyan-400 shadow-sm shadow-cyan-500/50"
                  : tier === 2
                  ? "bg-cyan-600/80"
                  : tier === 1
                  ? "bg-cyan-950/70 border border-cyan-800/40"
                  : "bg-white/[0.04] border border-white/[0.05]"
              }`}
              style={{ minWidth: 10, minHeight: 10 }}
            />
          );
        })}
      </div>

      <div className="flex items-center gap-2 mt-3 justify-end text-[10px] text-[var(--muted-foreground)]">
        <span className="label-caps text-[10px]">Rest</span>
        <div className="rounded-sm bg-white/[0.04] border border-white/[0.05] w-3 h-3" title="0: Rest / No log" />
        <div className="rounded-sm bg-cyan-950/70 border border-cyan-800/40 w-3 h-3" title="1: Light (<250 kcal)" />
        <div className="rounded-sm bg-cyan-600/80 w-3 h-3" title="2: Moderate (250-500 kcal)" />
        <div className="rounded-sm bg-cyan-400 w-3 h-3" title="3: Vigorous (>500 kcal)" />
        <span className="label-caps text-[10px]">Vigorous</span>
      </div>
    </div>
  );
}
