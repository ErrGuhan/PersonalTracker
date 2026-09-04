"use client";

import { motion, type Variants } from "framer-motion";
import HydrationWidget from "@/components/HydrationWidget";
import EmptyState from "@/components/EmptyState";
import { useModals } from "@/context/ModalContext";
import { useNutrition } from "@/hooks/useSupabase";
import { PieChart, Utensils, Plus, Sparkles } from "lucide-react";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, scale: 0.98, y: 10 },
  show: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: "spring", stiffness: 350, damping: 26 },
  },
};

export default function NutritionView() {
  const { openNutritionModal } = useModals();
  const { meals, stats } = useNutrition();

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="flex flex-col gap-6 w-full pb-28 lg:pb-12"
    >
      {/* Page Header */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-amber-400/10 text-amber-300 border border-amber-400/20">
              Fuel & Hydration
            </span>
          </div>
          <h2 className="text-xl sm:text-3xl font-extrabold text-white tracking-tight">Hydration & Fuel</h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">Fuel your body with hydration & balanced nutrition.</p>
        </div>
        <button
          onClick={openNutritionModal}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 font-bold text-xs shadow-[0_0_15px_rgba(236,106,6,0.35)] hover:brightness-110 active:scale-95 transition cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Log Meal</span>
        </button>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6">
          <HydrationWidget />
        </div>

        <div className="lg:col-span-6 liquid-glass rounded-3xl p-5 sm:p-6 flex flex-col justify-between border border-white/[0.08] shadow-2xl">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-base text-white tracking-tight flex items-center gap-2">
                <PieChart className="w-4 h-4 text-amber-400" />
                <span>Daily Macro Totals</span>
              </h3>
              <span className="font-mono text-xs text-amber-300 font-bold bg-amber-500/15 px-2.5 py-1 rounded-full border border-amber-500/25">
                Today&apos;s Intake
              </span>
            </div>

            {/* Macro Metrics Grid */}
            <div className="grid grid-cols-4 gap-2.5 my-4">
              <div className="liquid-glass-subtle p-3 rounded-2xl border border-white/[0.06] text-center">
                <span className="text-lg sm:text-2xl font-black text-amber-300 font-mono tracking-tight">{stats.totalCalories}</span>
                <span className="block text-[9.5px] uppercase tracking-wider text-slate-400 font-mono mt-0.5">KCAL</span>
              </div>
              <div className="liquid-glass-subtle p-3 rounded-2xl border border-white/[0.06] text-center">
                <span className="text-lg sm:text-2xl font-black text-cyan-400 font-mono tracking-tight">{stats.totalProtein}g</span>
                <span className="block text-[9.5px] uppercase tracking-wider text-slate-400 font-mono mt-0.5">PROTEIN</span>
              </div>
              <div className="liquid-glass-subtle p-3 rounded-2xl border border-white/[0.06] text-center">
                <span className="text-lg sm:text-2xl font-black text-purple-300 font-mono tracking-tight">{stats.totalCarbs}g</span>
                <span className="block text-[9.5px] uppercase tracking-wider text-slate-400 font-mono mt-0.5">CARBS</span>
              </div>
              <div className="liquid-glass-subtle p-3 rounded-2xl border border-white/[0.06] text-center">
                <span className="text-lg sm:text-2xl font-black text-amber-400 font-mono tracking-tight">{stats.totalFats}g</span>
                <span className="block text-[9.5px] uppercase tracking-wider text-slate-400 font-mono mt-0.5">FATS</span>
              </div>
            </div>
          </div>

          {/* Staggered Logged Meals List */}
          <div className="space-y-2.5 mt-4 pt-4 border-t border-white/[0.06]">
            <h4 className="font-mono text-[10px] uppercase tracking-widest text-slate-400 font-bold">Logged Meals</h4>
            {meals.length === 0 ? (
              <EmptyState
                icon={Utensils}
                title="No Meals Logged Today"
                description="Fuel your body with intention. Log your meals to track calories, protein, carbs, and fats."
                actionLabel="Log First Meal"
                onAction={openNutritionModal}
              />
            ) : (
              <motion.div
                variants={{
                  hidden: { opacity: 0 },
                  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
                }}
                initial="hidden"
                animate="show"
                className="space-y-2 max-h-56 overflow-y-auto pr-1 no-scrollbar"
              >
                {meals.map((m) => (
                  <motion.div
                    key={m.id}
                    variants={{
                      hidden: { opacity: 0, y: 6 },
                      show: { opacity: 1, y: 0 },
                    }}
                    className="flex justify-between items-center p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.05] text-xs transition"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400">
                        <Utensils className="w-3.5 h-3.5" />
                      </div>
                      <span className="font-bold text-white capitalize text-xs sm:text-sm">{m.name}</span>
                      <span className="text-[10px] text-slate-400 font-mono uppercase bg-white/[0.04] px-2 py-0.5 rounded border border-white/[0.08]">
                        {m.mealType}
                      </span>
                    </div>
                    <span className="font-mono font-extrabold text-amber-400 text-xs">{m.calories} kcal</span>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
