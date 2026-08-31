"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useHabits } from "@/hooks/useSupabase";
import { Check, Plus, Flame, Sparkles } from "lucide-react";

export default function HabitTrackerWidget() {
  const { habits, toggleHabit, addHabit } = useHabits();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState<"health" | "fitness" | "focus" | "mindset">("health");

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
      icon: "check_circle",
    });
    setNewTitle("");
    setShowAddForm(false);
  };

  return (
    <div className="bg-[#0F172A]/60 backdrop-blur-xl border border-white/10 shadow-2xl rounded-2xl p-6 flex flex-col gap-6 relative overflow-hidden">
      {/* Background Glow Accent */}
      <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

      {/* Header & Encouraging Subtitle */}
      <div className="flex flex-col gap-3">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-extrabold text-lg sm:text-xl text-white tracking-tight flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-cyan-400" />
              Daily Routines & Habits
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Track your daily wins and build lasting habits.</p>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAddForm((v) => !v)}
            className="flex items-center gap-1.5 text-xs bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 px-3.5 py-1.5 rounded-xl hover:bg-cyan-500/25 transition font-semibold cursor-pointer shadow-[0_0_12px_rgba(6,182,212,0.25)]"
          >
            <Plus className="w-4 h-4" />
            {showAddForm ? "Cancel" : "New Habit"}
          </motion.button>
        </div>

        {/* Oversized Bold Completion Progress Counter */}
        <div className="flex items-baseline justify-between mt-1">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">{completedCount}</span>
            <span className="text-xs text-slate-400 font-mono uppercase tracking-widest">/ {habits.length} COMPLETED</span>
          </div>
          <span className="font-mono text-xs text-cyan-400 font-extrabold bg-cyan-500/10 px-2.5 py-1 rounded-xl border border-cyan-500/30">
            {completionPct}% Done
          </span>
        </div>

        {/* Animated Energetic Progress Bar */}
        <div className="w-full bg-slate-900/80 h-3 rounded-full overflow-hidden p-0.5 border border-white/5">
          <motion.div
            className="bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 h-full rounded-full shadow-[0_0_15px_rgba(6,182,212,0.6)]"
            initial={{ width: 0 }}
            animate={{ width: `${completionPct}%` }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
          />
        </div>
      </div>

      {/* Seamless Add Habit Form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            onSubmit={handleAddHabit}
            className="bg-slate-900/80 p-4 rounded-xl border border-cyan-500/30 flex flex-col gap-3.5 overflow-hidden shadow-inner"
          >
            <input
              type="text"
              placeholder="What habit do you want to build? (e.g., Read 20 mins)"
              required
              className="w-full bg-transparent border-b border-white/20 text-sm px-2 py-2 text-white outline-none focus:border-cyan-400 placeholder:text-slate-500 transition"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
            />
            <div className="flex justify-between items-center pt-1">
              <div className="flex gap-1.5">
                {(["health", "fitness", "focus", "mindset"] as const).map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setNewCategory(cat)}
                    className={`px-2.5 py-1 rounded-lg capitalize text-[10px] font-mono border transition ${
                      newCategory === cat
                        ? "border-cyan-400 bg-cyan-500/20 text-cyan-400 font-bold"
                        : "border-white/10 text-slate-400 hover:text-white"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg bg-cyan-400 text-slate-950 font-bold text-xs shadow-md hover:bg-cyan-300 transition cursor-pointer"
              >
                Save Habit
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Staggered Habit Checklist */}
      <motion.ul
        variants={{
          hidden: { opacity: 0 },
          show: { opacity: 1, transition: { staggerChildren: 0.08 } },
        }}
        initial="hidden"
        animate="show"
        className="space-y-3"
      >
        {habits.map((habit) => (
          <motion.li
            key={habit.id}
            variants={{
              hidden: { opacity: 0, y: 10 },
              show: { opacity: 1, y: 0 },
            }}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => toggleHabit(habit.id)}
            className={`flex items-center justify-between p-3.5 rounded-xl border transition-all cursor-pointer ${
              habit.completedToday
                ? "bg-cyan-500/10 border-cyan-500/40 text-slate-400"
                : "bg-slate-900/60 border-white/5 text-white hover:border-white/20"
            }`}
          >
            <div className="flex items-center gap-3.5 min-w-0">
              {/* Checkbox circle filled with glowing cyan accent on completion */}
              <div
                className={`w-6 h-6 rounded-full border flex items-center justify-center text-xs transition-all duration-300 shrink-0 ${
                  habit.completedToday
                    ? "bg-cyan-400 border-cyan-400 text-slate-950 shadow-[0_0_12px_rgba(6,182,212,0.8)]"
                    : "border-white/30 text-transparent hover:border-cyan-400"
                }`}
              >
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </div>

              <div className="min-w-0">
                <p
                  className={`text-xs sm:text-sm font-bold transition-all ${
                    habit.completedToday ? "line-through text-slate-500" : "text-white"
                  }`}
                >
                  {habit.title}
                </p>
                <div className="flex items-center gap-2 text-[10px] font-mono mt-0.5">
                  <span className="uppercase tracking-widest text-cyan-400 font-semibold">{habit.category}</span>
                  <span className="text-slate-600">·</span>
                  <span className="flex items-center gap-1 text-slate-400">
                    <Flame className="w-3 h-3 text-amber-500 fill-amber-500" />
                    {habit.streak} day streak
                  </span>
                </div>
              </div>
            </div>
          </motion.li>
        ))}
      </motion.ul>
    </div>
  );
}
