"use client";

import { motion } from "framer-motion";
import { Plus, Sparkles, Droplets, BookOpen, Activity, Heart, Moon } from "lucide-react";
import type { Habit } from "@/lib/database.types";

interface QuickStartTemplatesProps {
  onAddTemplate: (newHabit: Omit<Habit, "id" | "streak" | "completedToday">) => void;
}

const TEMPLATES: Array<{
  title: string;
  category: "health" | "fitness" | "focus" | "mindset";
  icon: string;
  desc: string;
  accent: string;
}> = [
  {
    title: "Drink 1 Glass of Water",
    category: "health",
    icon: "💧",
    desc: "Maintain hydration & peak energy levels.",
    accent: "from-blue-500/20 to-cyan-500/10 border-cyan-500/30 text-cyan-400",
  },
  {
    title: "Read 10 Pages",
    category: "focus",
    icon: "📚",
    desc: "Expand knowledge & maintain focus.",
    accent: "from-indigo-500/20 to-purple-500/10 border-indigo-500/30 text-indigo-400",
  },
  {
    title: "10,000 Daily Steps",
    category: "fitness",
    icon: "🏃",
    desc: "Boost cardiovascular endurance daily.",
    accent: "from-emerald-500/20 to-teal-500/10 border-emerald-500/30 text-emerald-400",
  },
  {
    title: "10-Min Meditation",
    category: "mindset",
    icon: "🧘",
    desc: "Reduce stress & improve mental clarity.",
    accent: "from-purple-500/20 to-pink-500/10 border-purple-500/30 text-purple-400",
  },
];

export default function QuickStartTemplates({ onAddTemplate }: QuickStartTemplatesProps) {
  return (
    <div className="bg-[#0F172A]/70 backdrop-blur-xl border border-white/10 shadow-2xl rounded-2xl p-5 sm:p-6 flex flex-col gap-4 relative overflow-hidden">
      {/* Background Accent */}
      <div className="absolute top-0 left-0 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-cyan-400" />
          <h3 className="font-extrabold text-base sm:text-lg text-white tracking-tight">
            Quick-Start Preset Templates
          </h3>
        </div>
        <span className="text-[11px] font-mono text-slate-400 uppercase tracking-widest bg-slate-900 border border-white/10 px-2.5 py-1 rounded-lg">
          1-Click Seed
        </span>
      </div>

      <p className="text-xs text-slate-400 -mt-1">
        Instantly add popular baseline habits with a single tap. No form entry required.
      </p>

      {/* Grid of Preset Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 mt-1">
        {TEMPLATES.map((tmpl, idx) => (
          <motion.div
            key={tmpl.title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: idx * 0.05 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() =>
              onAddTemplate({
                title: tmpl.title,
                category: tmpl.category,
                frequency: "Daily",
                targetCount: 1,
                icon: tmpl.icon,
              })
            }
            className={`bg-gradient-to-br ${tmpl.accent} border rounded-xl p-4 flex flex-col justify-between gap-3 cursor-pointer hover:shadow-xl transition-all duration-200 group relative overflow-hidden`}
          >
            <div className="flex items-start justify-between">
              <span className="text-2xl">{tmpl.icon}</span>
              <div className="w-7 h-7 rounded-lg bg-white/10 group-hover:bg-cyan-500 group-hover:text-slate-950 transition flex items-center justify-center">
                <Plus className="w-4 h-4 text-white group-hover:text-slate-950" />
              </div>
            </div>

            <div>
              <h4 className="font-bold text-sm text-white group-hover:text-cyan-300 transition">
                {tmpl.title}
              </h4>
              <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-2 leading-tight">
                {tmpl.desc}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
