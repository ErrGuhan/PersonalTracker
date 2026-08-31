"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useHabits } from "@/hooks/useSupabase";
import { Check, Plus, Flame, Sparkles, MoreVertical, Pencil, Trash2, X } from "lucide-react";
import EmptyState from "@/components/EmptyState";
import type { Habit } from "@/lib/database.types";

export default function HabitTrackerWidget() {
  const { habits, toggleHabit, addHabit, updateHabit, deleteHabit } = useHabits();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingHabitId, setEditingHabitId] = useState<string | null>(null);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<"health" | "fitness" | "focus" | "mindset">("health");

  const completedCount = habits.filter((h) => h.completedToday).length;
  const completionPct = habits.length > 0 ? Math.round((completedCount / habits.length) * 100) : 0;

  const handleOpenAdd = () => {
    setEditingHabitId(null);
    setTitle("");
    setCategory("health");
    setShowAddForm(true);
  };

  const handleOpenEdit = (habit: Habit) => {
    setEditingHabitId(habit.id);
    setTitle(habit.title);
    setCategory(habit.category as "health" | "fitness" | "focus" | "mindset");
    setMenuOpenId(null);
    setShowAddForm(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (editingHabitId) {
      updateHabit(editingHabitId, {
        title: title.trim(),
        category,
      });
      setEditingHabitId(null);
    } else {
      addHabit({
        title: title.trim(),
        category,
        frequency: "Daily",
        targetCount: 1,
        icon: "check_circle",
      });
    }

    setTitle("");
    setShowAddForm(false);
  };

  const handleDelete = (id: string) => {
    setMenuOpenId(null);
    deleteHabit(id);
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
            <p className="text-xs text-slate-400 mt-0.5">Track your daily wins and build compounding habits.</p>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => (showAddForm ? setShowAddForm(false) : handleOpenAdd())}
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

      {/* Seamless Add / Edit Habit Form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            onSubmit={handleFormSubmit}
            className="bg-slate-900/80 p-4 rounded-xl border border-cyan-500/30 flex flex-col gap-3.5 overflow-hidden shadow-inner"
          >
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-cyan-400 uppercase font-mono tracking-wider">
                {editingHabitId ? "Edit Habit Routine" : "Create New Habit"}
              </span>
              <button type="button" onClick={() => setShowAddForm(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <input
              type="text"
              placeholder="What habit do you want to build? (e.g., Read 20 mins)"
              required
              className="w-full bg-transparent border-b border-white/20 text-sm px-2 py-2 text-white outline-none focus:border-cyan-400 placeholder:text-slate-500 transition"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <div className="flex justify-between items-center pt-1">
              <div className="flex gap-1.5">
                {(["health", "fitness", "focus", "mindset"] as const).map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={`px-2.5 py-1 rounded-lg capitalize text-[10px] font-mono border transition ${
                      category === cat
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
                {editingHabitId ? "Update Habit" : "Save Habit"}
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Zero-Data Empty State or Staggered Habit Checklist */}
      {habits.length === 0 ? (
        <EmptyState
          icon={Sparkles}
          title="Your Journey Starts Here"
          description="Build compounding streak momentum by tracking your first daily health, fitness, or focus habit."
          actionLabel="Create First Habit"
          onAction={handleOpenAdd}
        />
      ) : (
        <motion.ul className="space-y-3">
          <AnimatePresence mode="popLayout">
            {habits.map((habit) => (
              <motion.li
                key={habit.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className={`relative flex items-center justify-between p-3.5 rounded-xl border transition-all ${
                  habit.completedToday
                    ? "bg-cyan-500/10 border-cyan-500/40 text-slate-400"
                    : "bg-slate-900/60 border-white/5 text-white hover:border-white/20"
                }`}
              >
                <div
                  className="flex items-center gap-3.5 min-w-0 flex-1 cursor-pointer"
                  onClick={() => toggleHabit(habit.id)}
                >
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

                {/* Progressive Disclosure Action Menu (Vertical Ellipsis) */}
                <div className="relative shrink-0 ml-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setMenuOpenId((prev) => (prev === habit.id ? null : habit.id));
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
                    aria-label="Actions"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>

                  <AnimatePresence>
                    {menuOpenId === habit.id && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -4 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -4 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-8 z-30 w-32 bg-slate-900/95 backdrop-blur-xl border border-white/15 p-1 rounded-xl shadow-2xl"
                      >
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenEdit(habit);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-white/10 rounded-lg transition"
                        >
                          <Pencil className="w-3.5 h-3.5 text-cyan-400" />
                          Edit
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(habit.id);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                          Delete
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.li>
            ))}
          </AnimatePresence>
        </motion.ul>
      )}
    </div>
  );
}
