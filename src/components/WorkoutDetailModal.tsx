"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check, X, Dumbbell, Flame, Calendar, Clock } from "lucide-react";
import type { Workout } from "@/lib/database.types";

export interface ExerciseItem {
  exercise_name: string;
  sets: number;
  reps: string | number;
  notes?: string;
}

interface WorkoutDetailModalProps {
  workout: Workout;
  onClose: () => void;
  onDelete?: (id: string) => Promise<void>;
}

export function parseWorkoutPlan(workout: Workout): ExerciseItem[] {
  // 1. If workout.plan exists and is an array or valid JSON
  if (workout.plan) {
    if (Array.isArray(workout.plan)) {
      return workout.plan as unknown as ExerciseItem[];
    }
    if (typeof workout.plan === "string") {
      try {
        const parsed = JSON.parse(workout.plan);
        if (Array.isArray(parsed)) return parsed as unknown as ExerciseItem[];
      } catch {
        // Continue to fallback
      }
    }
  }

  // 2. Parse from workout.notes if formatted with line items
  if (workout.notes) {
    const lines = workout.notes
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l && !l.toLowerCase().includes("routine:"));

    if (lines.length > 0) {
      const parsedFromNotes: ExerciseItem[] = [];
      for (const line of lines) {
        const match = line.match(/^([^:]+):\s*(\d+)x(\d+|\w+)(?:\s*\((.*)\))?$/);
        if (match) {
          parsedFromNotes.push({
            exercise_name: match[1].trim(),
            sets: parseInt(match[2], 10),
            reps: match[3],
            notes: match[4] ? match[4].trim() : undefined,
          });
        } else {
          parsedFromNotes.push({
            exercise_name: line.replace(/^[•\-\*]\s*/, ""),
            sets: 3,
            reps: "10-12",
            notes: "Recorded working set",
          });
        }
      }
      if (parsedFromNotes.length > 0) return parsedFromNotes;
    }
  }

  return [];
}

export default function WorkoutDetailModal({ workout, onClose, onDelete }: WorkoutDetailModalProps) {
  const exercises = parseWorkoutPlan(workout);
  const [completedIndices, setCompletedIndices] = useState<number[]>([]);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const toggleExercise = (index: number) => {
    setCompletedIndices((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const totalCount = exercises.length;
  const completedCount = completedIndices.length;
  const progressPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const handleDelete = async () => {
    if (!onDelete || isDeleting) return;
    setIsDeleting(true);
    try {
      await onDelete(workout.id);
      onClose();
    } catch (err) {
      console.error("Failed to delete workout:", err);
    } finally {
      setIsDeleting(false);
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
        className="w-full max-w-md max-h-[85vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [scrollbar-width:none] rounded-3xl bg-[#0F172A]/90 border border-white/10 p-6 shadow-2xl relative text-white flex flex-col gap-4"
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-white/10 pb-4">
          <div className="min-w-0 flex-1 pr-2">
            <div className="flex items-center gap-2 mb-1">
              <Dumbbell className="w-5 h-5 text-cyan-400 shrink-0" />
              <h3 className="font-extrabold text-lg sm:text-xl text-white truncate">{workout.name}</h3>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400 font-mono flex-wrap">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                {workout.workout_date}
              </span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                {workout.duration_min} min
              </span>
              <span>·</span>
              <span className="flex items-center gap-1 text-secondary font-bold">
                <Flame className="w-3.5 h-3.5 fill-current" />
                {workout.calories} kcal
              </span>
            </div>

            {/* Source & Intensity Badges */}
            <div className="flex items-center gap-2 mt-2">
              {workout.calorie_source && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                  {workout.calorie_source}
                </span>
              )}
              {workout.intensity && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-amber-500/10 text-amber-300 border border-amber-500/20 uppercase">
                  {workout.intensity} Intensity
                </span>
              )}
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Dynamic Progress Bar Tracker (if exercises parsed) */}
        {totalCount > 0 && (
          <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-white/5 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-mono text-[10px] text-slate-400 uppercase tracking-wider">
                Session Breakdown
              </span>
              <span className="font-mono text-xs font-bold text-cyan-400">
                {completedCount} / {totalCount} ({progressPct}%)
              </span>
            </div>
            <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden p-0.5 border border-white/5">
              <motion.div
                className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full rounded-full shadow-[0_0_10px_rgba(6,182,212,0.6)]"
                initial={{ width: 0 }}
                animate={{ width: `${progressPct}%` }}
                transition={{ type: "spring", stiffness: 100, damping: 20 }}
              />
            </div>
          </div>
        )}

        {/* Trackable Exercises List */}
        {totalCount > 0 ? (
          <div className="space-y-1">
            <h4 className="font-mono text-[11px] uppercase tracking-wider text-slate-400 mb-2">
              Routine Exercises
            </h4>

            {exercises.map((item, idx) => {
              const isCompleted = completedIndices.includes(idx);
              return (
                <motion.div
                  key={idx}
                  layout
                  onClick={() => toggleExercise(idx)}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className={`bg-white/5 border border-white/5 rounded-xl p-3 mb-2 transition-all cursor-pointer flex items-start gap-3 ${
                    isCompleted
                      ? "opacity-50 border-cyan-500/30 bg-cyan-500/5"
                      : "hover:border-white/20 hover:bg-white/[0.07]"
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full border flex items-center justify-center text-xs transition-all duration-300 shrink-0 mt-0.5 ${
                      isCompleted
                        ? "bg-cyan-400 border-cyan-400 text-slate-950 shadow-[0_0_12px_rgba(6,182,212,0.8)]"
                        : "border-white/30 text-transparent hover:border-cyan-400"
                    }`}
                  >
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline gap-2">
                      <h5
                        className={`font-bold text-xs sm:text-sm text-white transition-all ${
                          isCompleted ? "line-through text-slate-400" : ""
                        }`}
                      >
                        {item.exercise_name}
                      </h5>
                      <span className="text-xs font-mono font-semibold text-cyan-400 shrink-0">
                        {item.sets} × {item.reps}
                      </span>
                    </div>
                    {item.notes && (
                      <p className="text-[11px] text-slate-400 font-mono mt-0.5 leading-relaxed">
                        {item.notes}
                      </p>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          workout.notes && (
            <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5 text-xs text-slate-300">
              <span className="font-mono text-[10px] text-slate-400 uppercase tracking-wider block mb-1">Session Notes</span>
              <p className="whitespace-pre-wrap font-mono text-xs">{workout.notes}</p>
            </div>
          )
        )}

        {/* Footer with Delete Action */}
        {onDelete && (
          <div className="pt-2 border-t border-white/10 flex items-center justify-between">
            {confirmDelete ? (
              <div className="flex items-center gap-2 w-full justify-between animate-fade-in">
                <span className="text-xs text-rose-400">Permanently delete?</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setConfirmDelete(false)}
                    className="px-3 py-1.5 rounded-lg text-xs bg-white/10 text-white hover:bg-white/15"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="px-3 py-1.5 rounded-lg text-xs bg-rose-500 text-white font-semibold hover:bg-rose-600 disabled:opacity-50"
                  >
                    {isDeleting ? "Deleting..." : "Confirm Delete"}
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setConfirmDelete(true)}
                className="text-xs text-rose-400/80 hover:text-rose-400 hover:underline transition-colors ml-auto"
              >
                Delete Workout Log
              </button>
            )}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
