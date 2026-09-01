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
            exercise_name: line,
            sets: 3,
            reps: "10-12",
            notes: "Maintain proper form & control cadence",
          });
        }
      }
      if (parsedFromNotes.length > 0) return parsedFromNotes;
    }
  }

  // 3. Fallback demo routine items based on workout title / type
  const lowerTitle = workout.name.toLowerCase();
  if (lowerTitle.includes("upper") || lowerTitle.includes("bench")) {
    return [
      { exercise_name: "Incline Barbell Bench Press", sets: 4, reps: "8-10", notes: "Focus on upper chest contraction" },
      { exercise_name: "Lat Pulldown (Wide Grip)", sets: 4, reps: "10-12", notes: "Squeeze lats at bottom position" },
      { exercise_name: "Seated Dumbbell Shoulder Press", sets: 3, reps: "10", notes: "Keep core engaged" },
      { exercise_name: "Cable Bicep Curls / Tricep Pushdowns", sets: 3, reps: "12-15", notes: "Superset for arm pump" },
    ];
  }

  if (lowerTitle.includes("leg") || lowerTitle.includes("squat")) {
    return [
      { exercise_name: "Barbell Back Squat", sets: 4, reps: "6-8", notes: "Drive through heels, maintain bracing" },
      { exercise_name: "Romanian Deadlift (RDL)", sets: 4, reps: "8-10", notes: "Hinge at hips, stretch hamstrings" },
      { exercise_name: "Leg Press & Calf Raises", sets: 3, reps: "12-15", notes: "Controlled eccentric tempo" },
    ];
  }

  if (lowerTitle.includes("hiit") || lowerTitle.includes("cardio") || lowerTitle.includes("run")) {
    return [
      { exercise_name: "High Intensity Interval Sprint", sets: 5, reps: "45s Work / 15s Rest", notes: "85%+ Max Heart Rate effort" },
      { exercise_name: "Kettlebell Swings", sets: 4, reps: "20 reps", notes: "Explosive hip drive" },
      { exercise_name: "Core Hanging Leg Raises", sets: 3, reps: "15 reps", notes: "Strict control without swinging" },
    ];
  }

  return [
    { exercise_name: "Barbell Compound Lift", sets: 4, reps: "8-10", notes: "Primary strength movement" },
    { exercise_name: "Dumbbell Accessory Movement", sets: 3, reps: "10-12", notes: "Target secondary muscle groups" },
    { exercise_name: "Bodyweight Finisher", sets: 3, reps: "15-20", notes: "Metabolic burnout phase" },
  ];
}

export default function WorkoutDetailModal({ workout, onClose }: WorkoutDetailModalProps) {
  const exercises = parseWorkoutPlan(workout);
  const [completedIndices, setCompletedIndices] = useState<number[]>([]);

  const toggleExercise = (index: number) => {
    setCompletedIndices((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const totalCount = exercises.length;
  const completedCount = completedIndices.length;
  const progressPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

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
        className="w-full max-w-md max-h-[85vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [scrollbar-width:none] rounded-3xl bg-[#0F172A]/90 border border-white/10 p-6 shadow-2xl relative text-white"
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-white/10 pb-4 mb-4">
          <div className="min-w-0 flex-1 pr-2">
            <div className="flex items-center gap-2 mb-1">
              <Dumbbell className="w-5 h-5 text-cyan-400 shrink-0" />
              <h3 className="font-extrabold text-lg sm:text-xl text-white truncate">{workout.name}</h3>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-400 font-mono flex-wrap">
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
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Dynamic Progress Bar Tracker */}
        <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-white/5 mb-5 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-mono text-[10px] text-slate-400 uppercase tracking-wider">
              Routine Progression
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

        {/* Trackable Exercises List */}
        <div className="space-y-1">
          <h4 className="font-mono text-[11px] uppercase tracking-wider text-slate-400 mb-2">
            Trackable Routine Exercises
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
                className={`bg-white/5 border border-white/5 rounded-xl p-4 mb-3 transition-all cursor-pointer flex items-start gap-3.5 ${
                  isCompleted
                    ? "opacity-50 border-cyan-500/30 bg-cyan-500/5"
                    : "hover:border-white/20 hover:bg-white/[0.07]"
                }`}
              >
                {/* Circular Checkbox */}
                <div
                  className={`w-6 h-6 rounded-full border flex items-center justify-center text-xs transition-all duration-300 shrink-0 mt-0.5 ${
                    isCompleted
                      ? "bg-cyan-400 border-cyan-400 text-slate-950 shadow-[0_0_12px_rgba(6,182,212,0.8)]"
                      : "border-white/30 text-transparent hover:border-cyan-400"
                  }`}
                >
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline gap-2">
                    <h5
                      className={`font-bold text-sm text-white transition-all ${
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
                    <p className="text-xs text-slate-400 font-mono mt-1 leading-relaxed">
                      {item.notes}
                    </p>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </motion.div>
  );
}
