"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useNutrition } from "@/hooks/useSupabase";
import { estimateNutritionAction } from "@/app/actions/nutrition";

interface LogNutritionModalProps {
  onClose: () => void;
  onSaved: () => void;
}

export default function LogNutritionModal({ onClose, onSaved }: LogNutritionModalProps) {
  const router = useRouter();
  const { logMeal } = useNutrition();

  // Form State — Clean zero initial values (no hardcoded nutrition defaults)
  const [mealCategory, setMealCategory] = useState<"breakfast" | "lunch" | "dinner" | "snack">("lunch");
  const [mealDescription, setMealDescription] = useState("");
  const [calories, setCalories] = useState<number>(0);
  const [protein, setProtein] = useState<number>(0);
  const [carbs, setCarbs] = useState<number>(0);
  const [fats, setFats] = useState<number>(0);

  // AI Loading, Assumptions, Errors & Saved States
  const [isEstimating, setIsEstimating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [assumptions, setAssumptions] = useState("");
  const [estimateError, setEstimateError] = useState("");
  const [aiSuccess, setAiSuccess] = useState(false);
  const [saved, setSaved] = useState(false);

  /* ─────────────────────────────────────────────────────────
     1. GEMINI AI ESTIMATION TRIGGER
     ───────────────────────────────────────────────────────── */
  const handleEstimate = async () => {
    if (!mealDescription.trim() || isEstimating) return;

    setIsEstimating(true);
    setAiSuccess(false);
    setAssumptions("");
    setEstimateError("");

    try {
      const result = await estimateNutritionAction(mealDescription);
      if (result.success) {
        setCalories(result.calories);
        setProtein(result.protein);
        setCarbs(result.carbs);
        setFats(result.fats);
        setAssumptions(result.assumptions);
        setAiSuccess(true);
      } else {
        setEstimateError(
          result.error || "Nutrition estimate unavailable. Please enter macros manually."
        );
      }
    } catch (err) {
      console.warn("[LogNutritionModal] AI Estimation failed:", err);
      setEstimateError("Nutrition estimate unavailable. Please try again.");
    } finally {
      setIsEstimating(false);
    }
  };

  /* ─────────────────────────────────────────────────────────
     2. SUBMISSION MUTATION (IDEMPOTENT / DUPLICATE PROTECTED)
     ───────────────────────────────────────────────────────── */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving || saved) return;

    setIsSaving(true);
    try {
      await logMeal({
        name: mealDescription.trim() || `${mealCategory.toUpperCase()} Meal`,
        mealType: mealCategory,
        calories: Math.max(0, Math.round(Number(calories) || 0)),
        proteinG: Math.max(0, Math.round(Number(protein) || 0)),
        carbsG: Math.max(0, Math.round(Number(carbs) || 0)),
        fatsG: Math.max(0, Math.round(Number(fats) || 0)),
      });

      router.refresh();
      setSaved(true);
      onSaved();
      onClose();
    } catch (err) {
      console.error("[Supabase logMeal Error]:", err);
      setIsSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/65 p-0 sm:p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="modal-enter w-full max-w-md max-h-[88vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [scrollbar-width:none] rounded-t-2xl sm:rounded-2xl bg-gradient-to-b from-surface-container-high/95 to-surface-dim/98 border border-white/15 backdrop-blur-2xl p-5 sm:p-6 shadow-[0_20px_50px_rgba(0,0,0,0.8)] text-on-surface space-y-5"
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
            className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:text-white hover:bg-white/10 transition cursor-pointer"
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

          {/* Meal Description Input with AI Estimate Trigger */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block font-mono text-xs text-on-surface-variant uppercase tracking-wider">
                Meal Description
              </label>
              {isEstimating && (
                <span className="font-mono text-[10px] text-secondary animate-pulse flex items-center gap-1">
                  <span className="w-2.5 h-2.5 border-2 border-secondary border-t-transparent rounded-full animate-spin" />
                  Analyzing Macros…
                </span>
              )}
              {aiSuccess && !isEstimating && (
                <span className="font-mono text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                  ✓ AI Auto-filled Macros
                </span>
              )}
            </div>

            <div className="relative">
              <input
                type="text"
                placeholder="e.g. rice, chicken gravy, 250g"
                required
                disabled={isEstimating}
                className="w-full bg-surface-container/70 border border-white/15 rounded-xl text-white text-sm px-3.5 py-3 outline-none focus:border-secondary transition shadow-inner placeholder:text-white/30 pr-28 disabled:opacity-60"
                value={mealDescription}
                onChange={(e) => {
                  setMealDescription(e.target.value);
                  setAiSuccess(false);
                  setEstimateError("");
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey && mealDescription.trim()) {
                    e.preventDefault();
                    handleEstimate();
                  }
                }}
              />
              <button
                type="button"
                onClick={handleEstimate}
                disabled={!mealDescription.trim() || isEstimating}
                className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-lg bg-secondary/20 border border-secondary/40 text-secondary text-xs font-bold hover:bg-secondary/30 transition disabled:opacity-40 flex items-center gap-1.5 cursor-pointer"
              >
                {isEstimating ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-secondary border-t-transparent rounded-full animate-spin" />
                    <span>Estimating…</span>
                  </>
                ) : (
                  <>
                    <span>✨</span>
                    <span>Estimate</span>
                  </>
                )}
              </button>
            </div>

            {/* Dynamic Contextual User Feedback */}
            {isEstimating ? (
              <p className="text-xs text-cyan-400 font-mono mt-1.5 animate-pulse flex items-center gap-1">
                <span>✨ Gemini AI analyzing nutritional profile & portion sizes…</span>
              </p>
            ) : estimateError ? (
              <p className="text-xs text-amber-400 font-mono mt-1.5 flex items-start gap-1">
                <span>⚠️ {estimateError}</span>
              </p>
            ) : assumptions ? (
              <p className="text-xs text-cyan-400 font-mono mt-1.5 flex items-start gap-1">
                <span>💡 {assumptions}</span>
              </p>
            ) : (
              <p className="text-[10px] text-on-surface-variant font-mono mt-1">
                Tip: Enter meal description &amp; click Estimate to auto-calculate macros using Gemini.
              </p>
            )}
          </div>

          {/* Calories Input Field */}
          <div>
            <label className="block font-mono text-xs text-on-surface-variant uppercase tracking-wider mb-1">
              Energy / Calories (kcal)
            </label>
            <div className={`relative rounded-xl transition-all duration-300 ${isEstimating ? "animate-pulse border border-secondary/50 bg-secondary/10" : ""}`}>
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

          {/* Macros Grid (Protein, Carbs, Fats) */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-mono text-xs text-on-surface-variant uppercase tracking-wider mb-1">
                Protein (g)
              </label>
              <div className={`rounded-xl transition-all duration-300 ${isEstimating ? "animate-pulse border border-primary/50 bg-primary/10" : ""}`}>
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
              <div className={`rounded-xl transition-all duration-300 ${isEstimating ? "animate-pulse border border-tertiary/50 bg-tertiary/10" : ""}`}>
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
              <div className={`rounded-xl transition-all duration-300 ${isEstimating ? "animate-pulse border border-secondary/50 bg-secondary/10" : ""}`}>
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
            disabled={saved || isEstimating || isSaving || !mealDescription.trim()}
            className={`w-full py-3.5 rounded-xl font-extrabold text-sm transition-all duration-200 shadow-[0_0_20px_rgba(236,106,6,0.3)] active:scale-[0.98] ${
              saved
                ? "bg-emerald-500 text-white"
                : isSaving
                ? "opacity-70 bg-secondary/60 text-slate-950 cursor-wait"
                : "bg-gradient-to-r from-secondary-container via-secondary to-amber-500 text-slate-950 hover:shadow-[0_0_30px_rgba(236,106,6,0.5)] cursor-pointer"
            }`}
          >
            {saved ? "✓ Meal Tracked to Supabase!" : isSaving ? "Saving Meal…" : "Save & Track Meal"}
          </button>
        </form>
      </div>
    </div>
  );
}
