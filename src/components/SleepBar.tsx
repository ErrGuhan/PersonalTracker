"use client";

interface SleepBarProps {
  hours: number;        // e.g. 7.5
  target?: number;      // e.g. 8
  stages?: {
    deep: number;
    light: number;
    rem: number;
    awake: number;
  };
}

export default function SleepBar({ hours, target = 8, stages }: SleepBarProps) {
  const pct = Math.min(hours / target, 1);
  const defaultStages = stages ?? { deep: 22, light: 54, rem: 18, awake: 6 };

  return (
    <div className="flex flex-col gap-4">
      {/* Total hours */}
      <div className="flex items-end gap-2">
        <span style={{ fontFamily: "'Inter'", fontSize: 40, fontWeight: 700, color: "#d0bcff", lineHeight: 1 }}>
          {hours.toFixed(1)}
        </span>
        <span className="text-sm mb-1" style={{ color: "#869397" }}>hrs / {target}</span>
      </div>

      {/* Main bar */}
      <div
        className="rounded-full overflow-hidden"
        style={{ height: 10, background: "rgba(179,149,255,0.12)" }}
      >
        <div
          className="h-full rounded-full"
          style={{
            width: `${pct * 100}%`,
            background: "linear-gradient(90deg, #5516be, #b395ff)",
            boxShadow: "0 0 10px rgba(179,149,255,0.5)",
            transition: "width 1.2s cubic-bezier(0.34,1.56,0.64,1)",
          }}
        />
      </div>

      {/* Sleep stage breakdown */}
      <div>
        <p className="label-caps mb-2">SLEEP STAGES</p>
        <div className="rounded-lg overflow-hidden" style={{ height: 20 }}>
          <div className="flex h-full">
            <div style={{ width: `${defaultStages.deep}%`, background: "#5516be" }} />
            <div style={{ width: `${defaultStages.rem}%`, background: "#7c3aed" }} />
            <div style={{ width: `${defaultStages.light}%`, background: "#b395ff" }} />
            <div style={{ width: `${defaultStages.awake}%`, background: "rgba(179,149,255,0.25)" }} />
          </div>
        </div>
        <div className="flex gap-4 mt-2">
          {[
            { label: "Deep", pct: defaultStages.deep,  color: "#5516be" },
            { label: "REM",  pct: defaultStages.rem,   color: "#7c3aed" },
            { label: "Light",pct: defaultStages.light,  color: "#b395ff" },
            { label: "Awake",pct: defaultStages.awake,  color: "rgba(179,149,255,0.5)" },
          ].map((s) => (
            <div key={s.label} className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-sm" style={{ background: s.color }} />
              <span className="label-caps">{s.label} {s.pct}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
