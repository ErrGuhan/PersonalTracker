"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useNutrition } from "@/hooks/useSupabase";
import { estimateNutritionAction } from "@/app/actions/estimateNutrition";

interface LogNutritionModalProps {
  onClose: () => void;
  onSaved: () => void;
}

export default function LogNutritionModal({ onClose, onSaved }: LogNutritionModalProps) {
  const router = useRouter();
  const { logMeal } = useNutrition();

  // Form State
  const [mealCategory, setMealCategory] = useState<"breakfast" | "lunch" | "dinner" | "snack">("lunch");
  const [mealDescription, setMealDescription] = useState("");
  const [calories, setCalories] = useState<number>(550);
  const [protein, setProtein] = useState<number>(40);
  const [carbs, setCarbs] = useState<number>(50);
  const [fats, setFats] = useState<number>(15);

  // AI Loading & Saved States
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiSuccess, setAiSuccess] = useState(false);
  const [saved, setSaved] = useState(false);

  /* ─────────────────────────────────────────────────────────
     1. ON BLUR AI AUTO-FILL TRIGGER
     ───────────────────────────────────────────────────────── */
  const handleMealBlur = async () => {
    if (!mealDescription.trim() || isAnalyzing) return;

    setIsAnalyzing(true);
    setAiSuccess(false);

    try {
      const result = await estimateNutritionAction(mealDescription);
      if (result.success) {
        setCalories(result.calories);
        setProtein(result.protein);
        setCarbs(result.carbs);
        setFats(result.fats);
        setAiSuccess(true);
      }
    } catch (err) {
      console.warn("[LogNutritionModal] AI Estimation failed:", err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  /* ─────────────────────────────────────────────────────────
     2. SUPABASE SUBMISSION MUTATION
     ───────────────────────────────────────────────────────── */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await logMeal({
        name: mealDescription.trim() || `${mealCategory.toUpperCase()} Meal`,
        mealType: mealCategory,
        calories: Number(calories),
        proteinG: Number(protein),
        carbsG: Number(carbs),
        fatsG: Number(fats),
      });

      router.refresh();
      setSaved(true);
      setTimeout(() => {
        onSaved();
        onClose();
      }, 600);
    } catch (err) {
      console.error("[Supabase logMeal Error]:", err);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="w-full max-w-md max-h-[85vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [scrollbar-width:none] rounded-2xl bg-gradient-to-b from-surface-container-high/95 to-surface-dim/98 border border-white/15 backdrop-blur-2xl p-5 sm:p-6 shadow-[0_20px_50px_rgba(0,0,0,0.8)] text-on-surface space-y-5"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                restaurant
              </span>
              <h2 className="text-lg sm:text-xl font-extrabold text-white">Log Meal / Nutrition</h2>
            </div>
            <p className="font-mono text-[10px] text-secondary tracking-wider uppercase mt-0.5">
              GEMINI AI NUTRITION AUTO-FILL
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:text-white hover:bg-white/10 transition"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Meal Category Selector */}
          <div>
            <label className="block font-mono text-xs text-on-surface-variant uppercase tracking-wider mb-2">
              Meal Category
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(["breakfast", "lunch", "dinner", "snack"] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setMealCategory(type)}
                  className={`py-2 text-xs font-semibold rounded-xl border transition-colors capitalize ${
                    mealCategory === type
                      ? "border-secondary bg-secondary/15 text-secondary shadow-[0_0_12px_rgba(236,106,6,0.3)]"
                      : "border-white/10 bg-white/5 text-on-surface-variant hover:text-white"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Meal Description Input with onBlur AI Auto-Fill */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block font-mono text-xs text-on-surface-variant uppercase tracking-wider">
                Meal Description
              </label>
              {isAnalyzing && (
                <span className="font-mono text-[10px] text-secondary animate-pulse flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs animate-spin">sync</span>
                  Analyzing Macros…
                </span>
              )}
              {aiSuccess && !isAnalyzing && (
                <span className="font-mono text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                  ✓ AI Auto-filled Macros
                </span>
              )}
            </div>

            <div className="relative">
              <input
                type="text"
                placeholder="e.g. Salmon Quinoa Salad with Avocado"
                required
                className="w-full bg-surface-container/70 border border-white/15 rounded-xl text-white text-sm px-3.5 py-3 outline-none focus:border-secondary transition shadow-inner placeholder:text-white/30"
                value={mealDescription}
                onChange={(e) => {
                  setMealDescription(e.target.value);
                  setAiSuccess(false);
                }}
                onBlur={handleMealBlur}
              />
              <button
                type="button"
                onClick={handleMealBlur}
                disabled={!mealDescription.trim() || isAnalyzing}
                className="absolute right-2 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-lg bg-secondary/20 border border-secondary/40 text-secondary text-[11px] font-bold hover:bg-secondary/30 transition disabled:opacity-40"
              >
                ✨ Estimate
              </button>
            </div>
            <p className="text-[10px] text-on-surface-variant font-mono mt-1">
              Tip: Click out or press tab to auto-estimate calories & macros using Gemini.
            </p>
          </div>

          {/* Calories Input Field with Pulsing AI Loading State */}
          <div>
            <label className="block font-mono text-xs text-on-surface-variant uppercase tracking-wider mb-1">
              Energy / Calories (kcal)
            </label>
            <div className={`relative rounded-xl transition-all duration-300 ${isAnalyzing ? "animate-pulse border border-secondary/50 bg-secondary/10" : ""}`}>
              <input
                type="number"
                min={0}
                required
                className="w-full bg-surface-container/60 border border-white/15 rounded-xl text-secondary text-lg font-extrabold px-3.5 py-2.5 outline-none focus:border-secondary transition"
                value={calories}
                onChange={(e) => setCalories(Number(e.target.value))}
              />
            </div>
          </div>

          {/* Macros Grid (Protein, Carbs, Fats) with Pulsing AI Loading State */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-mono text-xs text-on-surface-variant uppercase tracking-wider mb-1">
                Protein (g)
              </label>
              <div className={`rounded-xl transition-all duration-300 ${isAnalyzing ? "animate-pulse border border-primary/50 bg-primary/10" : ""}`}>
                <input
                  type="number"
                  min={0}
                  className="w-full bg-surface-container/60 border border-white/15 rounded-xl text-primary text-sm font-bold px-3 py-2 outline-none focus:border-primary transition"
                  value={protein}
                  onChange={(e) => setProtein(Number(e.target.value))}
                />
              </div>
            </div>

            <div>
              <label className="block font-mono text-xs text-on-surface-variant uppercase tracking-wider mb-1">
                Carbs (g)
              </label>
              <div className={`rounded-xl transition-all duration-300 ${isAnalyzing ? "animate-pulse border border-tertiary/50 bg-tertiary/10" : ""}`}>
                <input
                  type="number"
                  min={0}
                  className="w-full bg-surface-container/60 border border-white/15 rounded-xl text-tertiary text-sm font-bold px-3 py-2 outline-none focus:border-tertiary transition"
                  value={carbs}
                  onChange={(e) => setCarbs(Number(e.target.value))}
                />
              </div>
            </div>

            <div>
              <label className="block font-mono text-xs text-on-surface-variant uppercase tracking-wider mb-1">
                Fats (g)
              </label>
              <div className={`rounded-xl transition-all duration-300 ${isAnalyzing ? "animate-pulse border border-secondary/50 bg-secondary/10" : ""}`}>
                <input
                  type="number"
                  min={0}
                  className="w-full bg-surface-container/60 border border-white/15 rounded-xl text-secondary text-sm font-bold px-3 py-2 outline-none focus:border-secondary transition"
                  value={fats}
                  onChange={(e) => setFats(Number(e.target.value))}
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={saved || isAnalyzing}
            className={`w-full py-3.5 rounded-xl font-extrabold text-sm transition-all duration-200 shadow-[0_0_20px_rgba(236,106,6,0.3)] active:scale-[0.98] ${
              saved
                ? "bg-emerald-500 text-white"
                : "bg-gradient-to-r from-secondary-container via-secondary to-amber-500 text-slate-950 hover:shadow-[0_0_30px_rgba(236,106,6,0.5)]"
            }`}
          >
            {saved ? "✓ Meal Tracked to Supabase!" : "Save & Track Meal"}
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
}
