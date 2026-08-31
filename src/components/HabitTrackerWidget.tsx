"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useHabits } from "@/hooks/useSupabase";

export default function HabitTrackerWidget() {
  const { habits, toggleHabit, addHabit } = useHabits();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState<"health" | "fitness" | "focus" | "mindset">("health");
  const newIcon = "check_circle";

  const completedCount = habits.filter((h) => h.completedToday).length;
  const completionPct = habits.length > 0 ? Math.round((completedCount / habits.length) * 100) : 0;

  const handleAddHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    addHabit({
      title: newTitle.trim(),
      category: newCategory,
      frequency: "Daily",
      targetCount: 1,
      icon: newIcon,
    });
    setNewTitle("");
    setShowAddForm(false);
  };

  return (
    <div className="glass-panel rounded-2xl p-4 sm:p-6 flex flex-col gap-4">
      {/* Header & Progress Bar */}
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
              published_with_changes
            </span>
            <h3 className="font-bold text-sm sm:text-base text-on-surface">Daily Routines & Habits</h3>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs text-primary font-bold">{completedCount}/{habits.length} Done ({completionPct}%)</span>
            <button
              onClick={() => setShowAddForm((v) => !v)}
              className="text-xs bg-primary/10 border border-primary/30 text-primary px-2.5 py-1 rounded-lg hover:bg-primary/20 transition cursor-pointer font-medium"
            >
              {showAddForm ? "Cancel" : "+ New Habit"}
            </button>
          </div>
        </div>

        {/* Overall Completion Progress */}
        <div className="w-full bg-surface-container-highest h-2 rounded-full overflow-hidden">
          <motion.div
            className="bg-gradient-to-r from-primary-container to-primary h-full rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${completionPct}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      {/* Inline Add Habit Form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleAddHabit}
            className="bg-surface-container/60 p-3.5 rounded-xl border border-primary/30 flex flex-col gap-3 overflow-hidden"
          >
            <input
              type="text"
              placeholder="Habit Title (e.g. Read 20 mins)"
              required
              className="w-full bg-transparent border-b border-white/20 text-xs px-2 py-1.5 text-on-surface outline-none focus:border-primary"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
            />
            <div className="flex justify-between items-center">
              <div className="flex gap-2 text-xs">
                {(["health", "fitness", "focus", "mindset"] as const).map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setNewCategory(cat)}
                    className={`px-2 py-1 rounded capitalize text-[10px] border ${
                      newCategory === cat ? "border-primary bg-primary/20 text-primary" : "border-white/10 text-on-surface-variant"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg bg-primary text-slate-950 font-bold text-xs shadow-md"
              >
                Save
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Habit Items List */}
      <ul className="space-y-2.5">
        {habits.map((habit) => (
          <motion.li
            key={habit.id}
            layout
            whileHover={{ scale: 1.01 }}
            className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
              habit.completedToday
                ? "bg-primary/10 border-primary/40 text-on-surface"
                : "bg-surface-container-low/60 border-white/5 text-on-surface-variant hover:border-white/20"
            }`}
            onClick={() => toggleHabit(habit.id)}
          >
            <div className="flex items-center gap-3 min-w-0">
              <button
                className={`w-6 h-6 rounded-full border flex items-center justify-center text-xs transition-colors shrink-0 ${
                  habit.completedToday
                    ? "bg-primary border-primary text-slate-950 font-bold shadow-[0_0_10px_rgba(76,215,246,0.5)]"
                    : "border-white/30 text-transparent hover:border-primary"
                }`}
              >
                ✓
              </button>
              <div className="min-w-0">
                <p className={`text-xs sm:text-sm font-semibold truncate ${habit.completedToday ? "line-through opacity-80" : ""}`}>
                  {habit.title}
                </p>
                <div className="flex items-center gap-2 text-[10px] text-on-surface-variant font-mono">
                  <span className="uppercase text-primary">{habit.category}</span>
                  <span>·</span>
                  <span>🔥 {habit.streak} day streak</span>
                </div>
              </div>
            </div>

            <span className="material-symbols-outlined text-sm opacity-60 shrink-0">
              {habit.icon || "check_circle"}
            </span>
          </motion.li>
        ))}
      </ul>
    </div>
  );
}
