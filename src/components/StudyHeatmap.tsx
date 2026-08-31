"use client";

const DAYS = ["M", "T", "W", "T", "F", "S", "S"];

interface StudyHeatmapProps {
  /** 112 values (0–3 intensity tier), last 16 weeks ordered oldest → newest */
  data?: number[];
}

function generateFallbackData(): number[] {
  const cells: number[] = [];
  for (let i = 0; i < 112; i++) {
    const rand = Math.random();
    cells.push(rand > 0.7 ? 3 : rand > 0.5 ? 2 : rand > 0.3 ? 1 : 0);
  }
  return cells;
}

export default function StudyHeatmap({ data }: StudyHeatmapProps) {
  const cells = data ?? generateFallbackData();

  return (
    <div>
      <div className="flex gap-1 mb-2">
        {DAYS.map((d, i) => (
          <div key={i} className="label-caps w-5 text-center flex-1">{d}</div>
        ))}
      </div>
      <div
        className="grid gap-1"
        style={{
          gridTemplateColumns: "repeat(16, 1fr)",
          gridTemplateRows: "repeat(7, 1fr)",
          gridAutoFlow: "column",
        }}
      >
        {cells.map((tier, i) => (
          <div
            key={i}
            title={`${tier > 0 ? tier * 60 : 0}min studied`}
            className={`rounded-sm aspect-square heatmap-${tier}`}
            style={{ minWidth: 10, minHeight: 10 }}
          />
        ))}
      </div>
      <div className="flex items-center gap-2 mt-3 justify-end">
        <span className="label-caps">Less</span>
        {[0, 1, 2, 3].map((n) => (
          <div key={n} className={`rounded-sm heatmap-${n}`} style={{ width: 12, height: 12 }} />
        ))}
        <span className="label-caps">More</span>
      </div>
    </div>
  );
}
