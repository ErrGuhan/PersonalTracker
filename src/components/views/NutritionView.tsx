"use client";

import { motion, type Variants } from "framer-motion";
import HydrationWidget from "@/components/HydrationWidget";
import EmptyState from "@/components/EmptyState";
import { useModals } from "@/context/ModalContext";
import { useNutrition } from "@/hooks/useSupabase";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, scale: 0.97, y: 12 },
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
      className="flex flex-col gap-6 w-full pb-32 lg:pb-16"
    >
      <motion.div variants={itemVariants} className="flex justify-between items-end">
        <div>
          <h2 className="text-xl sm:text-3xl font-extrabold text-white tracking-tight">Hydration & Fuel</h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">Fuel your body with hydration & balanced nutrition.</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.95 }}
          onClick={openNutritionModal}
          className="px-4 py-2.5 rounded-xl bg-secondary text-slate-950 font-extrabold text-xs shadow-[0_0_20px_rgba(236,106,6,0.4)] hover:bg-secondary/90 transition cursor-pointer"
        >
          + Log Meal
        </motion.button>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6">
          <HydrationWidget />
        </div>

        <div className="lg:col-span-6 bg-[#0F172A]/60 backdrop-blur-xl border border-white/10 shadow-2xl rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-extrabold text-base text-white tracking-tight flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>
                  pie_chart
                </span>
                Daily Macro Totals
              </h3>
              <span className="font-mono text-xs text-secondary font-extrabold bg-secondary/15 px-2.5 py-1 rounded-xl border border-secondary/30">
                Today&apos;s Intake
              </span>
            </div>

            {/* Oversized Typography for Macro Metrics */}
            <div className="grid grid-cols-4 gap-3 text-center my-4">
              <div className="bg-slate-900/70 p-3 rounded-xl border border-white/5 shadow-inner">
                <span className="text-xl sm:text-2xl font-extrabold text-secondary tracking-tight">{stats.totalCalories}</span>
                <span className="block text-[10px] uppercase tracking-widest text-slate-400 font-mono mt-0.5">KCAL</span>
              </div>
              <div className="bg-slate-900/70 p-3 rounded-xl border border-white/5 shadow-inner">
                <span className="text-xl sm:text-2xl font-extrabold text-primary tracking-tight">{stats.totalProtein}g</span>
                <span className="block text-[9px] uppercase tracking-widest text-slate-400 font-mono mt-0.5">PROTEIN</span>
              </div>
              <div className="bg-slate-900/70 p-3 rounded-xl border border-white/5 shadow-inner">
                <span className="text-xl sm:text-2xl font-extrabold text-tertiary tracking-tight">{stats.totalCarbs}g</span>
                <span className="block text-[10px] uppercase tracking-widest text-slate-400 font-mono mt-0.5">CARBS</span>
              </div>
              <div className="bg-slate-900/70 p-3 rounded-xl border border-white/5 shadow-inner">
                <span className="text-xl sm:text-2xl font-extrabold text-secondary tracking-tight">{stats.totalFats}g</span>
                <span className="block text-[10px] uppercase tracking-widest text-slate-400 font-mono mt-0.5">FATS</span>
              </div>
            </div>
          </div>

          {/* Staggered Logged Meals List */}
          <div className="space-y-2.5 mt-4 pt-4 border-t border-white/10">
            <h4 className="font-mono text-[10px] uppercase tracking-widest text-slate-400">Logged Meals</h4>
            {meals.length === 0 ? (
              <EmptyState
                icon="restaurant"
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
                className="space-y-2 max-h-48 overflow-y-auto pr-1"
              >
                {meals.map((m) => (
                  <motion.div
                    key={m.id}
                    variants={{
                      hidden: { opacity: 0, y: 8 },
                      show: { opacity: 1, y: 0 },
                    }}
                    className="flex justify-between items-center p-3 rounded-xl bg-slate-900/60 border border-white/5 text-xs hover:border-white/20 transition"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white capitalize text-xs sm:text-sm">{m.name}</span>
                      <span className="text-[10px] text-slate-400 font-mono uppercase bg-white/5 px-2 py-0.5 rounded border border-white/10">
                        {m.mealType}
                      </span>
                    </div>
                    <span className="font-mono font-extrabold text-secondary text-xs">{m.calories} kcal</span>
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
