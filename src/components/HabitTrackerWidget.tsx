"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useHabits } from "@/hooks/useSupabase";
import { Plus, Sparkles, Shield, X, CheckCircle2, Calendar } from "lucide-react";
import EmptyState from "@/components/EmptyState";
import SwipeableHabitCard from "@/components/SwipeableHabitCard";
import { HabitCardSkeleton } from "@/components/Skeletons";
import type { Habit } from "@/lib/database.types";

interface HabitTrackerWidgetProps {
  loading?: boolean;
  error?: string | null;
}

export default function HabitTrackerWidget({ loading = false, error = null }: HabitTrackerWidgetProps) {
  const { habits, freezeTokens, completeHabit, freezeHabit, toggleHabit, addHabit, updateHabit, deleteHabit } = useHabits();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingHabitId, setEditingHabitId] = useState<string | null>(null);

  // Delete Confirmation Modal State
  const [habitToDeleteId, setHabitToDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form State
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<"health" | "fitness" | "focus" | "mindset">("health");

  // Sorted Habits: Incomplete habits first, completed habits move to bottom
  const sortedHabits = useMemo(() => {
    return [...habits].sort((a, b) => {
      if (a.completedToday === b.completedToday) return 0;
      return a.completedToday ? 1 : -1;
    });
  }, [habits]);

  const completedCount = habits.filter((h) => h.completedToday).length;
  const totalCount = habits.length;

  // Safe percentage calculation preventing NaN% or division by zero
  const completionPct = totalCount > 0 ? Math.min(100, Math.round((completedCount / totalCount) * 100)) : 0;
  const isAllCompleted = totalCount > 0 && completedCount === totalCount;

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
    <div className="glass-primary p-5 sm:p-6 flex flex-col gap-6 relative overflow-hidden">
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
            <p className="text-xs text-slate-400 mt-0.5">Forgiving streaks, swipe gestures & auto-ordering.</p>
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
            <span className="text-xs text-slate-400 font-mono uppercase tracking-widest">/ {totalCount} COMPLETED</span>
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
            className="bg-[#0F172A]/90 backdrop-blur-xl border border-cyan-500/30 rounded-2xl p-5 overflow-hidden flex flex-col gap-4 shadow-xl"
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

      {/* 4 DISTINCT HABIT LIST DATA STATES */}
      {loading ? (
        // 1. LOADING STATE
        <div className="space-y-3">
          <HabitCardSkeleton />
          <HabitCardSkeleton />
          <HabitCardSkeleton />
        </div>
      ) : totalCount === 0 ? (
        // 2. NO HABITS CONFIGURED STATE
        <EmptyState
          icon={Sparkles}
          title="No habits configured yet"
          description="Start building your daily personal system by adding your first health, fitness, or focus habit."
          actionLabel="Create First Habit"
          onAction={handleOpenAdd}
        />
      ) : isAllCompleted ? (
        // 3. ALL HABITS COMPLETED TODAY CELEBRATION STATE
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-br from-emerald-500/15 via-teal-500/10 to-cyan-500/15 border border-emerald-500/40 rounded-2xl p-6 flex flex-col items-center justify-center text-center gap-3 shadow-[0_0_25px_rgba(16,185,129,0.25)]"
        >
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300 shadow-inner">
            <CheckCircle2 className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div className="flex flex-col gap-1">
            <h4 className="text-base font-extrabold text-white tracking-tight">✓ All done for today!</h4>
            <p className="text-xs text-slate-300 max-w-xs">
              You've completed every scheduled habit routine for today. Great consistency!
            </p>
          </div>
        </motion.div>
      ) : (
        // 4. HABITS AVAILABLE STATE
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {sortedHabits.map((habit) => (
              <motion.div
                key={habit.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ type: "spring", stiffness: 350, damping: 25 }}
              >
                <SwipeableHabitCard
                  habit={habit}
                  freezeTokens={freezeTokens}
                  onComplete={(id) => completeHabit(id)}
                  onFreeze={(id) => freezeHabit(id)}
                  onToggle={(id) => toggleHabit(id)}
                  onEdit={(h) => handleOpenEdit(h)}
                  onDelete={(id) => setHabitToDeleteId(id)}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
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
