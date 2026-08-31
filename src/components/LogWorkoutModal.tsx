"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useLogWorkout } from "@/hooks/useSupabase";

interface LogWorkoutModalProps {
  onClose: () => void;
  onSaved: () => void;
}

const WORKOUT_TYPES = [
  { value: "run",      label: "🏃 Run"      },
  { value: "strength", label: "🏋️ Strength"  },
  { value: "hiit",     label: "⚡ HIIT"      },
  { value: "cardio",   label: "🚴 Cardio"    },
  { value: "swim",     label: "🏊 Swim"      },
  { value: "yoga",     label: "🧘 Yoga"      },
  { value: "other",    label: "🎯 Other"     },
];

export default function LogWorkoutModal({ onClose, onSaved }: LogWorkoutModalProps) {
  const { logWorkout, saving } = useLogWorkout();
  const [form, setForm] = useState({
    name: "",
    type: "run",
    duration_min: 30,
    calories: 300,
    distance_km: "",
    avg_heart_rate: "",
    notes: "",
    workout_date: new Date().toISOString().split("T")[0],
  });
  const [saved, setSaved] = useState(false);

  const set = (k: string, v: string | number) =>
    setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await logWorkout({
      name: form.name || (WORKOUT_TYPES.find((t) => t.value === form.type)?.label.split(" ")[1] ?? "Workout"),
      type: form.type,
      duration_min: Number(form.duration_min),
      calories: Number(form.calories),
      avg_heart_rate: form.avg_heart_rate ? Number(form.avg_heart_rate) : null,
      distance_km: form.distance_km ? Number(form.distance_km) : null,
      notes: form.notes || null,
      workout_date: form.workout_date,
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
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 sm:p-6 bg-black/70 backdrop-blur-md"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: "spring", stiffness: 350, damping: 25 }}
        className="w-full max-w-lg rounded-2xl bg-gradient-to-b from-surface-container-high/90 to-surface-dim/95 border-t border-white/10 border-b border-black/40 backdrop-blur-2xl p-5 sm:p-6 shadow-[0_16px_48px_rgba(0,0,0,0.6)] text-on-surface space-y-5"
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold text-on-surface">Log Activity</h2>
            <p className="font-mono text-xs text-secondary tracking-wider uppercase mt-0.5">FITNESS · NEW ENTRY</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-white/10 transition-colors"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Modality Chips */}
          <div>
            <label className="block font-mono text-xs text-on-surface-variant uppercase tracking-wider mb-2">
              Modality
            </label>
            <div className="flex flex-wrap gap-2">
              {WORKOUT_TYPES.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => set("type", t.value)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                    form.type === t.value
                      ? "border-secondary bg-secondary/15 text-secondary shadow-[0_0_12px_rgba(236,106,6,0.3)]"
                      : "border-white/10 bg-white/5 text-on-surface-variant hover:border-white/20 hover:text-on-surface"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="block font-mono text-xs text-on-surface-variant uppercase tracking-wider mb-1">
              Title (Optional)
            </label>
            <input
              className="w-full bg-surface-container/60 border-b-2 border-white/10 border-t-0 border-x-0 focus:border-secondary focus:ring-0 text-on-surface text-sm px-3 py-2.5 outline-none transition-colors"
              placeholder="e.g. Morning Run"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
            />
          </div>

          {/* Duration & Calories */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-mono text-xs text-on-surface-variant uppercase tracking-wider mb-1">
                Duration (min)
              </label>
              <input
                type="number"
                min={1}
                required
                className="w-full bg-surface-container/60 border-b-2 border-white/10 border-t-0 border-x-0 focus:border-secondary focus:ring-0 text-on-surface text-sm px-3 py-2.5 outline-none transition-colors"
                value={form.duration_min}
                onChange={(e) => set("duration_min", e.target.value)}
              />
            </div>
            <div>
              <label className="block font-mono text-xs text-on-surface-variant uppercase tracking-wider mb-1">
                Calories (kcal)
              </label>
              <input
                type="number"
                min={0}
                className="w-full bg-surface-container/60 border-b-2 border-white/10 border-t-0 border-x-0 focus:border-secondary focus:ring-0 text-on-surface text-sm px-3 py-2.5 outline-none transition-colors"
                value={form.calories}
                onChange={(e) => set("calories", e.target.value)}
              />
            </div>
          </div>

          {/* Distance & Heart Rate */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-mono text-xs text-on-surface-variant uppercase tracking-wider mb-1">
                Distance (km)
              </label>
              <input
                type="number"
                min={0}
                step={0.1}
                className="w-full bg-surface-container/60 border-b-2 border-white/10 border-t-0 border-x-0 focus:border-secondary focus:ring-0 text-on-surface text-sm px-3 py-2.5 outline-none transition-colors"
                placeholder="—"
                value={form.distance_km}
                onChange={(e) => set("distance_km", e.target.value)}
              />
            </div>
            <div>
              <label className="block font-mono text-xs text-on-surface-variant uppercase tracking-wider mb-1">
                Avg HR (bpm)
              </label>
              <input
                type="number"
                min={0}
                className="w-full bg-surface-container/60 border-b-2 border-white/10 border-t-0 border-x-0 focus:border-secondary focus:ring-0 text-on-surface text-sm px-3 py-2.5 outline-none transition-colors"
                placeholder="—"
                value={form.avg_heart_rate}
                onChange={(e) => set("avg_heart_rate", e.target.value)}
              />
            </div>
          </div>

          {/* Date */}
          <div>
            <label className="block font-mono text-xs text-on-surface-variant uppercase tracking-wider mb-1">
              Workout Date
            </label>
            <input
              type="date"
              className="w-full bg-surface-container/60 border-b-2 border-white/10 border-t-0 border-x-0 focus:border-secondary focus:ring-0 text-on-surface text-sm px-3 py-2.5 outline-none transition-colors"
              value={form.workout_date}
              onChange={(e) => set("workout_date", e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={saving || saved}
            className={`w-full py-3.5 rounded-xl font-semibold text-sm transition-all duration-200 shadow-[0_0_20px_rgba(236,106,6,0.3)] active:scale-[0.98] ${
              saved
                ? "bg-emerald-500 text-white"
                : "bg-gradient-to-r from-secondary-container to-secondary text-white hover:shadow-[0_0_30px_rgba(236,106,6,0.5)]"
            }`}
          >
            {saved ? "✓ Workout Saved!" : saving ? "Saving to Supabase…" : "Save Workout"}
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
}
