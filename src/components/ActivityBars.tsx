"use client";

interface ActivityBarProps {
  data: number[];    // 0–1 values for each bar
  accent?: "cyan" | "orange" | "violet";
  label?: string;
}

const accentColors = {
  cyan:   { bar: "#4cd7f6", glow: "rgba(76,215,246,0.4)",  dim: "rgba(76,215,246,0.1)"  },
  orange: { bar: "#ffb690", glow: "rgba(236,106,6,0.4)",   dim: "rgba(236,106,6,0.1)"   },
  violet: { bar: "#b395ff", glow: "rgba(179,149,255,0.4)", dim: "rgba(179,149,255,0.1)" },
};

export default function ActivityBars({ data, accent = "cyan", label }: ActivityBarProps) {
  const c = accentColors[accent];

  return (
    <div className="flex flex-col gap-2">
      {label && <p className="label-caps">{label}</p>}
      <div className="flex items-end gap-1" style={{ height: 64 }}>
        {data.map((val, i) => (
          <div
            key={i}
            className="flex-1 rounded-sm transition-all duration-300"
            style={{
              height: `${Math.max(val * 100, 8)}%`,
              background: `linear-gradient(to top, ${c.bar}, ${c.bar}aa)`,
              boxShadow: val > 0.6 ? `0 0 6px ${c.glow}` : "none",
              opacity: 0.5 + val * 0.5,
            }}
          />
        ))}
      </div>
    </div>
  );
}
