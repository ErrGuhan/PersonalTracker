"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useHabits } from "@/hooks/useSupabase";
import { Check, Plus, Flame, Sparkles, MoreVertical, Pencil, Trash2, X, Shield, Smartphone, Award } from "lucide-react";
import EmptyState from "@/components/EmptyState";
import type { Habit } from "@/lib/database.types";

export default function HabitTrackerWidget() {
  const { habits, freezeTokens, completeHabit, freezeHabit, toggleHabit, addHabit, updateHabit, deleteHabit } = useHabits();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingHabitId, setEditingHabitId] = useState<string | null>(null);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

  // Delete Confirmation Modal State
  const [habitToDeleteId, setHabitToDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

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

  const confirmDelete = async () => {
    if (!habitToDeleteId) return;
    setIsDeleting(true);
    try {
      deleteHabit(habitToDeleteId);
    } catch (err) {
      console.error("[Delete Habit Error]:", err);
    } finally {
      setIsDeleting(false);
      setHabitToDeleteId(null);
    }
  };

  return (
    <div className="bg-[#0F172A]/60 backdrop-blur-xl border border-white/10 shadow-2xl rounded-2xl p-6 flex flex-col gap-6 relative overflow-hidden">
      {/* Background Glow Accent */}
      <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

      {/* Header & Forgiving Token Badge */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap justify-between items-center gap-2">
          <div>
            <h3 className="font-extrabold text-lg sm:text-xl text-white tracking-tight flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-cyan-400" />
              Daily Routines & Habits
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Forgiving streaks with Rest Day tokens & visual unlocks.</p>
          </div>

          <div className="flex items-center gap-2">
            {/* Rest Day Token Badge */}
            <div className="flex items-center gap-1.5 text-xs bg-amber-500/15 border border-amber-500/30 text-amber-300 px-3 py-1.5 rounded-xl font-bold font-mono">
              <Shield className="w-3.5 h-3.5 text-amber-400" />
              <span>{freezeTokens} Rest Tokens</span>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => (showAddForm ? setShowAddForm(false) : handleOpenAdd())}
              className="flex items-center gap-1.5 text-xs bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 px-3.5 py-1.5 rounded-xl hover:bg-cyan-500/25 transition font-semibold cursor-pointer shadow-[0_0_12px_rgba(6,182,212,0.25)]"
            >
              {showAddForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              {showAddForm ? "Cancel" : "New Habit"}
            </motion.button>
          </div>
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

      {/* Add / Edit Habit Form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.form
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            onSubmit={handleFormSubmit}
            className="bg-[#0F172A]/80 backdrop-blur-xl border border-cyan-500/30 rounded-2xl p-5 overflow-hidden flex flex-col gap-4 shadow-xl"
          >
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-cyan-400 uppercase font-mono tracking-wider">
                {editingHabitId ? "Edit Habit Routine" : "Create New Habit"}
              </span>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="text-slate-400 hover:text-white transition cursor-pointer p-1 rounded-lg hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <input
              type="text"
              placeholder="What habit do you want to build? (e.g., Read 20 mins)"
              required
              className="bg-transparent border-b border-white/10 focus:border-cyan-400 transition-colors py-3 w-full outline-none text-white placeholder:text-slate-500"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-2">Category</label>
              <div className="flex flex-wrap gap-2 mb-4">
                {(["health", "fitness", "focus", "mindset"] as const).map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={`px-3 py-1.5 rounded-xl capitalize text-xs font-medium border transition-all cursor-pointer ${
                      category === cat
                        ? "border-cyan-400/60 bg-cyan-500/20 text-cyan-300 font-bold shadow-[0_0_10px_rgba(6,182,212,0.2)]"
                        : "border-white/10 bg-white/5 text-slate-400 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold hover:opacity-90 active:scale-[0.98] transition-all cursor-pointer"
            >
              {editingHabitId ? "Update Habit" : "Save Habit"}
            </button>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Habit Cards with Phase 3 Dynamic Themes & Gestures */}
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
            {habits.map((habit) => {
              const isGlassmorphic = habit.streak > 14;
              const hasSwipeGesture = habit.streak > 30;

              return (
                <motion.li
                  key={habit.id}
                  layout
                  drag={hasSwipeGesture ? "x" : false}
                  dragConstraints={{ left: 0, right: 90 }}
                  onDragEnd={(e, info) => {
                    if (hasSwipeGesture && info.offset.x > 60 && !habit.completedToday) {
                      completeHabit(habit.id);
                    }
                  }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0, marginBottom: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className={`relative flex items-center justify-between p-4 rounded-xl border transition-all ${
                    habit.completedToday
                      ? "bg-cyan-500/10 border-cyan-500/40 text-slate-400"
                      : isGlassmorphic
                      ? "bg-gradient-to-r from-cyan-500/20 via-purple-500/15 to-indigo-500/20 border-cyan-400/60 shadow-[0_0_20px_rgba(6,182,212,0.25)] backdrop-blur-2xl"
                      : "bg-slate-900/60 border-white/5 text-white hover:border-white/20"
                  }`}
                >
                  <div
                    className="flex items-center gap-3.5 min-w-0 flex-1 cursor-pointer"
                    onClick={() => (habit.completedToday ? toggleHabit(habit.id) : completeHabit(habit.id))}
                  >
                    {/* Circle Checkbox */}
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
                      <div className="flex items-center gap-2">
                        <p
                          className={`text-xs sm:text-sm font-bold transition-all ${
                            habit.completedToday ? "line-through text-slate-500" : "text-white"
                          }`}
                        >
                          {habit.title}
                        </p>

                        {/* Visual Unlock Badges */}
                        {isGlassmorphic && (
                          <span className="text-[9px] font-extrabold uppercase font-mono px-2 py-0.5 rounded bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-400/40 text-cyan-300 flex items-center gap-1 shadow-sm">
                            <Sparkles className="w-2.5 h-2.5" /> Glassmorphic
                          </span>
                        )}

                        {hasSwipeGesture && (
                          <span className="text-[9px] font-extrabold uppercase font-mono px-2 py-0.5 rounded bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 flex items-center gap-1">
                            <Smartphone className="w-2.5 h-2.5" /> Swipe Enabled
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-[10px] font-mono mt-1">
                        <span className="uppercase tracking-widest text-cyan-400 font-semibold">{habit.category}</span>
                        <span className="text-slate-600">·</span>
                        <span className="flex items-center gap-1 text-slate-300 font-semibold">
                          <Flame className="w-3 h-3 text-amber-500 fill-amber-500" />
                          {habit.streak} day streak
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions & Rest Token */}
                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    {!habit.completedToday && freezeTokens > 0 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          freezeHabit(habit.id);
                        }}
                        title="Use Rest Token to freeze streak"
                        className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-amber-500/15 border border-amber-500/30 text-amber-300 hover:bg-amber-500/30 transition flex items-center gap-1 cursor-pointer"
                      >
                        <Shield className="w-3 h-3 text-amber-400" />
                        <span className="hidden sm:inline">Rest Token</span>
                      </button>
                    )}

                    <div className="relative">
                      <button
                        onClick={() => setMenuOpenId(menuOpenId === habit.id ? null : habit.id)}
                        className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition cursor-pointer"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>

                      {menuOpenId === habit.id && (
                        <div className="absolute right-0 top-full mt-1 w-32 bg-slate-900 border border-white/10 rounded-xl shadow-xl z-20 overflow-hidden py-1">
                          <button
                            onClick={() => handleOpenEdit(habit)}
                            className="w-full px-3 py-2 text-left text-xs text-slate-300 hover:bg-white/10 hover:text-white flex items-center gap-2 cursor-pointer"
                          >
                            <Pencil className="w-3.5 h-3.5" /> Edit
                          </button>
                          <button
                            onClick={() => {
                              setMenuOpenId(null);
                              setHabitToDeleteId(habit.id);
                            }}
                            className="w-full px-3 py-2 text-left text-xs text-rose-400 hover:bg-rose-500/10 flex items-center gap-2 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.li>
              );
            })}
          </AnimatePresence>
        </motion.ul>
      )}

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {habitToDeleteId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-900 border border-white/10 rounded-2xl p-6 max-w-sm w-full shadow-2xl flex flex-col gap-4"
            >
              <h4 className="text-lg font-bold text-white">Delete Habit?</h4>
              <p className="text-xs text-slate-400">
                Are you sure you want to delete this habit routine? Current streak data will be lost.
              </p>
              <div className="flex gap-3 justify-end mt-2">
                <button
                  onClick={() => setHabitToDeleteId(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-white/10 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={isDeleting}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-500 text-white hover:bg-rose-600 transition cursor-pointer"
                >
                  {isDeleting ? "Deleting..." : "Delete Habit"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
