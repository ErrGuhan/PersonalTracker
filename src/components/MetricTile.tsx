"use client";

interface MetricTileProps {
  icon: string;
  label: string;
  value: string | number;
  unit?: string;
  delta?: string;
  deltaUp?: boolean;
  accent?: "cyan" | "orange" | "violet";
}

const accentColors = {
  cyan:   { text: "#4cd7f6", bg: "rgba(76,215,246,0.1)",  border: "rgba(76,215,246,0.2)"  },
  orange: { text: "#ffb690", bg: "rgba(236,106,6,0.1)",   border: "rgba(236,106,6,0.2)"   },
  violet: { text: "#d0bcff", bg: "rgba(179,149,255,0.1)", border: "rgba(179,149,255,0.2)" },
};

export default function MetricTile({
  icon,
  label,
  value,
  unit,
  delta,
  deltaUp,
  accent = "cyan",
}: MetricTileProps) {
  const c = accentColors[accent];

  return (
    <div
      className="glass-card p-4 flex flex-col gap-2 hover:scale-[1.02] transition-transform duration-200"
      style={{ borderTop: `1px solid ${c.border}` }}
    >
      <div className="flex items-center justify-between">
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center text-lg"
          style={{ background: c.bg, border: `1px solid ${c.border}` }}
        >
          {icon}
        </div>
        {delta && (
          <span
            className="label-caps text-xs"
            style={{ color: deltaUp ? "#4ade80" : "#f87171" }}
          >
            {deltaUp ? "↑" : "↓"} {delta}
          </span>
        )}
      </div>

      <div>
        <div className="flex items-baseline gap-1">
          <span
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: 28,
              fontWeight: 700,
              lineHeight: 1,
              color: c.text,
            }}
          >
            {value}
          </span>
          {unit && (
            <span className="text-sm" style={{ color: "#869397" }}>
              {unit}
            </span>
          )}
        </div>
        <p className="text-xs mt-1" style={{ color: "#bcc9cd" }}>{label}</p>
      </div>
    </div>
  );
}
