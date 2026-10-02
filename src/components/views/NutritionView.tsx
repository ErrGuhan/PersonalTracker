"use client";

import HydrationWidget from "@/components/HydrationWidget";
import EmptyState from "@/components/EmptyState";
import { useModals } from "@/context/ModalContext";
import { useNutrition } from "@/hooks/useSupabase";
import { Utensils, Plus } from "lucide-react";

export default function NutritionView() {
  const { openNutritionModal } = useModals();
  const { meals, stats } = useNutrition();

  const macros = [
    { label: "kcal",    value: stats.totalCalories, color: "text-amber-300",  pct: Math.min((stats.totalCalories / 2200) * 100, 100), bar: "m3-progress-bar-orange" },
    { label: "Protein", value: `${stats.totalProtein}g`, color: "text-cyan-400", pct: Math.min((stats.totalProtein / 160) * 100, 100),  bar: "m3-progress-bar" },
    { label: "Carbs",   value: `${stats.totalCarbs}g`,  color: "text-violet-300", pct: Math.min((stats.totalCarbs / 250) * 100, 100),   bar: "m3-progress-bar-violet" },
    { label: "Fats",    value: `${stats.totalFats}g`,   color: "text-amber-400", pct: Math.min((stats.totalFats / 70) * 100, 100),     bar: "m3-progress-bar-orange" },
  ];

  return (
    <div className="flex flex-col gap-5 w-full pt-3">

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="m3-chip m3-chip-orange m3-chip-selected text-[10px]">Fuel</span>
          </div>
          <h2 className="text-xl font-extrabold text-white tracking-tight">Hydration & Fuel</h2>
        </div>
        <button onClick={openNutritionModal} className="m3-fab m3-fab-small m3-fab-orange">
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          Log Meal
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Hydration */}
        <HydrationWidget />

        {/* Macros */}
        <section className="m3-surface-glass rounded-2xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-sm text-white">Today's Macros</h3>
            <span className="m3-chip m3-chip-orange text-[10px]">Live</span>
          </div>

          <div className="space-y-3">
            {macros.map(({ label, value, color, pct, bar }) => (
              <div key={label} className="flex flex-col gap-1">
                <div className="flex justify-between items-center">
                  <span className="text-[11px] text-slate-400 font-mono uppercase tracking-wider">{label}</span>
                  <span className={`text-sm font-bold font-mono ${color}`}>{value}</span>
                </div>
                <div className="m3-progress-track">
                  <div className={`${bar} h-full rounded-sm`} style={{ width: `${pct}%`, height: "4px", borderRadius: "2px", transition: "width 0.6s cubic-bezier(0.2,0,0,1)" }} />
                </div>
              </div>
            ))}
          </div>

          {/* Meal log */}
          <div className="mt-4 pt-4 border-t border-white/[0.06]">
            <h4 className="text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-2">Logged</h4>
            {meals.length === 0 ? (
              <EmptyState
                icon={Utensils}
                title="No Meals Logged"
                description="Log your meals to track macros."
                actionLabel="Log Meal"
                onAction={openNutritionModal}
              />
            ) : (
              <ul className="space-y-1.5 max-h-48 overflow-y-auto">
                {meals.map(m => (
                  <li key={m.id} className="flex justify-between items-center p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.05] text-xs hover:bg-white/[0.05] transition">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-amber-500/12 flex items-center justify-center text-amber-400">
                        <Utensils className="w-3 h-3" />
                      </div>
                      <span className="font-semibold text-white capitalize">{m.name}</span>
                      <span className="text-[9px] text-slate-400 font-mono uppercase bg-white/[0.04] px-1.5 py-0.5 rounded">{m.mealType}</span>
                    </div>
                    <span className="font-bold text-amber-400 font-mono">{m.calories}kcal</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </div>

    </div>
  );
}
