"use client";

import { motion } from "framer-motion";

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
  cyan: { text: "text-cyan-400", bg: "bg-cyan-500/10", border: "border-cyan-500/20" },
  orange: { text: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/20" },
  violet: { text: "text-indigo-400", bg: "bg-indigo-500/10", border: "border-indigo-500/20" },
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
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      className="bg-[#0F172A]/40 backdrop-blur-xl border border-white/[0.05] shadow-[0_8px_30px_rgb(0,0,0,0.12)] p-6 rounded-2xl flex flex-col justify-between transition-all"
    >
      <div className="flex items-center justify-between mb-3">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-base ${c.bg} border ${c.border}`}>
          {icon}
        </div>
        {delta && (
          <span className={`text-[10px] font-mono font-bold ${deltaUp ? "text-emerald-400" : "text-rose-400"}`}>
            {deltaUp ? "↑" : "↓"} {delta}
          </span>
        )}
      </div>

      <div>
        <div className="flex items-baseline gap-1.5">
          <span className={`text-3xl font-extrabold tracking-tight text-white`}>
            {value}
          </span>
          {unit && (
            <span className="text-xs font-mono text-slate-500 uppercase tracking-widest">
              {unit}
            </span>
          )}
        </div>
        <p className="text-xs text-slate-500 font-medium mt-1">{label}</p>
      </div>
    </motion.div>
  );
}
