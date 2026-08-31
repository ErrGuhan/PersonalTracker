"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useNutrition } from "@/hooks/useSupabase";

interface LogNutritionModalProps {
  onClose: () => void;
  onSaved: () => void;
}

export default function LogNutritionModal({ onClose, onSaved }: LogNutritionModalProps) {
  const { logMeal } = useNutrition();
  const [form, setForm] = useState({
    name: "",
    mealType: "lunch" as "breakfast" | "lunch" | "dinner" | "snack",
    calories: 550,
    proteinG: 40,
    carbsG: 50,
    fatsG: 15,
  });
  const [saved, setSaved] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    logMeal({
      name: form.name || `${form.mealType.toUpperCase()} Meal`,
      mealType: form.mealType,
      calories: Number(form.calories),
      proteinG: Number(form.proteinG),
      carbsG: Number(form.carbsG),
      fatsG: Number(form.fatsG),
    });
    setSaved(true);
    setTimeout(() => {
      onSaved();
      onClose();
    }, 600);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 sm:p-6 bg-black/75 backdrop-blur-md"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: "spring", stiffness: 350, damping: 25 }}
        className="w-full max-w-lg rounded-2xl bg-gradient-to-b from-surface-container-high/90 to-surface-dim/95 border-t border-white/10 border-b border-black/40 backdrop-blur-2xl p-5 sm:p-6 shadow-2xl text-on-surface space-y-5"
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold text-on-surface">Log Meal / Nutrition</h2>
            <p className="font-mono text-xs text-secondary tracking-wider uppercase mt-0.5">FUEL · MACRONUTRIENTS</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-white/10 transition-colors"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-mono text-xs text-on-surface-variant uppercase tracking-wider mb-2">
              Meal Category
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(["breakfast", "lunch", "dinner", "snack"] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setForm({ ...form, mealType: type })}
                  className={`py-2 text-xs font-semibold rounded-xl border transition-colors capitalize ${
                    form.mealType === type
                      ? "border-secondary bg-secondary/15 text-secondary shadow-[0_0_12px_rgba(236,106,6,0.3)]"
                      : "border-white/10 bg-white/5 text-on-surface-variant hover:text-on-surface"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block font-mono text-xs text-on-surface-variant uppercase tracking-wider mb-1">
              Meal Description
            </label>
            <input
              type="text"
              placeholder="e.g. Salmon Quinoa Salad"
              required
              className="w-full bg-surface-container/60 border-b-2 border-white/10 border-t-0 border-x-0 focus:border-secondary text-on-surface text-sm px-3 py-2.5 outline-none"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>

          <div>
            <label className="block font-mono text-xs text-on-surface-variant uppercase tracking-wider mb-1">
              Energy / Calories (kcal)
            </label>
            <input
              type="number"
              min={0}
              required
              className="w-full bg-surface-container/60 border-b-2 border-white/10 border-t-0 border-x-0 focus:border-secondary text-on-surface text-base px-3 py-2.5 outline-none font-extrabold text-secondary"
              value={form.calories}
              onChange={(e) => setForm({ ...form, calories: Number(e.target.value) })}
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-mono text-xs text-on-surface-variant uppercase tracking-wider mb-1">
                Protein (g)
              </label>
              <input
                type="number"
                min={0}
                className="w-full bg-surface-container/60 border-b-2 border-white/10 border-t-0 border-x-0 focus:border-secondary text-on-surface text-sm px-3 py-2 outline-none"
                value={form.proteinG}
                onChange={(e) => setForm({ ...form, proteinG: Number(e.target.value) })}
              />
            </div>

            <div>
              <label className="block font-mono text-xs text-on-surface-variant uppercase tracking-wider mb-1">
                Carbs (g)
              </label>
              <input
                type="number"
                min={0}
                className="w-full bg-surface-container/60 border-b-2 border-white/10 border-t-0 border-x-0 focus:border-secondary text-on-surface text-sm px-3 py-2 outline-none"
                value={form.carbsG}
                onChange={(e) => setForm({ ...form, carbsG: Number(e.target.value) })}
              />
            </div>

            <div>
              <label className="block font-mono text-xs text-on-surface-variant uppercase tracking-wider mb-1">
                Fats (g)
              </label>
              <input
                type="number"
                min={0}
                className="w-full bg-surface-container/60 border-b-2 border-white/10 border-t-0 border-x-0 focus:border-secondary text-on-surface text-sm px-3 py-2 outline-none"
                value={form.fatsG}
                onChange={(e) => setForm({ ...form, fatsG: Number(e.target.value) })}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={saved}
            className={`w-full py-3.5 rounded-xl font-semibold text-sm transition-all duration-200 shadow-[0_0_20px_rgba(236,106,6,0.3)] active:scale-[0.98] ${
              saved
                ? "bg-emerald-500 text-white"
                : "bg-gradient-to-r from-secondary-container to-secondary text-white font-bold hover:shadow-[0_0_30px_rgba(236,106,6,0.5)]"
            }`}
          >
            {saved ? "✓ Meal Logged!" : "Save Meal"}
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
}
