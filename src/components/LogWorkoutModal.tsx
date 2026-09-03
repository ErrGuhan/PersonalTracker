"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useLogWorkout } from "@/hooks/useSupabase";
import { todayStr } from "@/lib/db";
import { generateWorkoutAction, type AiWorkoutResult, type ExerciseItem } from "@/app/actions/generateWorkout";
import { estimateWorkoutCalories, type WorkoutIntensity, type CalorieSource } from "@/lib/fitness/calorieEngine";

interface LogWorkoutModalProps {
  onClose: () => void;
  onSaved: () => void;
  initialValues?: {
    name?: string;
    type?: "strength" | "run" | "hiit" | "cardio" | "yoga";
    duration_min?: number;
    intensity?: "low" | "moderate" | "high";
    notes?: string;
    exercises?: Array<{ name: string; sets?: number; reps?: string }>;
  };
}

const PRESET_PROMPTS = [
  "Build upper body today (Chest, Back, Arms)",
  "45m Leg Day focus (Quads & Hamstrings)",
  "30m High Intensity HIIT & Core Burner",
  "Full Body Strength & Conditioning",
];

const WORKOUT_TYPES = [
  { value: "strength", label: "🏋️ Strength" },
  { value: "run", label: "🏃 Run" },
  { value: "hiit", label: "⚡ HIIT" },
  { value: "cardio", label: "🚴 Cardio" },
  { value: "yoga", label: "🧘 Yoga" },
];

export default function LogWorkoutModal({ onClose, onSaved, initialValues }: LogWorkoutModalProps) {
  const router = useRouter();
  const { logWorkout, saving } = useLogWorkout();
  const [mode, setMode] = useState<"ai" | "manual">(initialValues ? "manual" : "ai");

  // State Machine for AI Flow: 'prompt' | 'generating' | 'proposed'
  const [aiState, setAiState] = useState<"prompt" | "generating" | "proposed">("prompt");
  const [userPrompt, setUserPrompt] = useState("");
  const [aiResult, setAiResult] = useState<AiWorkoutResult | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Manual Form State
  const initialDuration = initialValues?.duration_min || 45;
  const initialType = (initialValues?.type || "strength") as "strength" | "run" | "hiit" | "cardio" | "yoga";
  const initialIntensity: WorkoutIntensity = initialValues?.intensity || "moderate";

  const defaultEstimate = estimateWorkoutCalories({
    workoutType: initialType,
    durationMin: initialDuration,
    intensity: initialIntensity,
  });

  const [manualForm, setManualForm] = useState({
    name: initialValues?.name || "",
    type: initialType,
    duration_min: initialDuration,
    intensity: initialIntensity,
    calories: defaultEstimate.calories,
    distance_km: "",
    avg_heart_rate: "",
    notes: initialValues?.notes || (initialValues?.exercises && initialValues.exercises.length > 0
      ? `Completed Exercises:\n` + initialValues.exercises.map((e) => `• ${e.name} (${e.sets || 3} sets × ${e.reps || "10-12"})`).join("\n")
      : ""),
    workout_date: todayStr(),
    calorie_source: defaultEstimate.source as CalorieSource,
  });

  const [isUserCustomCalories, setIsUserCustomCalories] = useState(false);

  // Recompute calories dynamically when duration, type, or intensity changes unless user typed custom calories
  const updateCaloriesDynamically = (type: string, duration: number, intensity: WorkoutIntensity) => {
    if (!isUserCustomCalories) {
      const estimate = estimateWorkoutCalories({
        workoutType: type,
        durationMin: duration,
        intensity,
      });
      setManualForm((f) => ({
        ...f,
        calories: estimate.calories,
        calorie_source: estimate.source,
      }));
    }
  };

  /* ─────────────────────────────────────────────────────────
     1. AI WORKOUT GENERATION HANDLER
     ───────────────────────────────────────────────────────── */
  const handleGenerate = async (promptText?: string) => {
    const query = promptText || userPrompt;
    if (!query.trim()) return;

    setAiState("generating");
    setAiError(null);
    try {
      const result = await generateWorkoutAction(query);
      setAiResult(result);
      setAiState("proposed");
    } catch (err) {
      console.error("[Gemini Action Error]:", err);
      setAiError(err instanceof Error ? err.message : "Failed to generate workout.");
      setAiState("prompt");
    }
  };

  /* ─────────────────────────────────────────────────────────
     2. SUPABASE INSERT (ACCEPT & TRACK WORKOUT)
     ───────────────────────────────────────────────────────── */
  const handleAcceptAndTrack = async () => {
    if (!aiResult || isSubmitting) return;
    setIsSubmitting(true);

    try {
      const exercisesNotes = aiResult.exercises
        .map((e) => `${e.exercise_name}: ${e.sets}x${e.reps} (${e.notes})`)
        .join("\n");

      await logWorkout({
        name: aiResult.workout_name,
        type: "strength",
        duration_min: aiResult.duration_min,
        calories: aiResult.total_estimated_kcal,
        calorie_source: aiResult.calorie_source || "ESTIMATED",
        intensity: "moderate",
        avg_heart_rate: 145,
        distance_km: null,
        notes: `AI Generated Routine:\n${exercisesNotes}`,
        workout_date: todayStr(),
      });

      router.refresh();
      setSaved(true);
      onSaved();
      onClose();
    } catch (err) {
      console.error("[Supabase logWorkout Error]:", err);
      setAiError("Failed to save workout to database.");
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ─────────────────────────────────────────────────────────
     3. MANUAL SUBMIT HANDLER
     ───────────────────────────────────────────────────────── */
  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      await logWorkout({
        name: manualForm.name || "Custom Workout",
        type: manualForm.type,
        duration_min: Number(manualForm.duration_min),
        calories: Number(manualForm.calories),
        calorie_source: manualForm.calorie_source,
        intensity: manualForm.intensity,
        avg_heart_rate: manualForm.avg_heart_rate ? Number(manualForm.avg_heart_rate) : null,
        distance_km: manualForm.distance_km ? Number(manualForm.distance_km) : null,
        notes: manualForm.notes || null,
        workout_date: manualForm.workout_date,
      });

      router.refresh();
      setSaved(true);
      onSaved();
      onClose();
    } catch (err) {
      console.error("[Supabase logWorkout Error]:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/65 p-0 sm:p-4 backdrop-blur-sm"
      data-no-swipe
      role="dialog"
      aria-modal="true"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="modal-enter w-full max-w-md max-h-[90vh] flex flex-col rounded-t-2xl sm:rounded-2xl bg-gradient-to-b from-surface-container-high/95 to-surface-dim/98 border border-white/15 backdrop-blur-2xl p-5 sm:p-6 shadow-[0_20px_50px_rgba(0,0,0,0.8)] text-on-surface overflow-hidden relative"
      >
        {/* Top Header & Mode Toggle with Proper Flex Alignment & Gap */}
        <div className="flex flex-row items-center justify-between gap-4 border-b border-white/10 pb-4 shrink-0">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary text-2xl shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>
                fitness_center
              </span>
              <h2 className="text-base sm:text-xl font-extrabold text-white truncate">Log Workout Session</h2>
            </div>
            <p className="font-mono text-[10px] text-secondary tracking-wider uppercase mt-0.5 truncate">
              {mode === "ai" ? "GEMINI AI WORKOUT GENERATOR" : "FITNESS · ACCURATE MET LOGGER"}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Mode Switcher */}
            <div className="flex bg-surface-container-low p-1 rounded-xl border border-white/10">
              <button
                type="button"
                onClick={() => {
                  setMode("ai");
                  setAiState("prompt");
                }}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                  mode === "ai"
                    ? "bg-secondary text-slate-950 shadow-[0_0_10px_rgba(236,106,6,0.5)] font-bold"
                    : "text-on-surface-variant hover:text-white"
                }`}
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" />
                </svg>
                AI
              </button>
              <button
                type="button"
                onClick={() => setMode("manual")}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                  mode === "manual"
                    ? "bg-primary text-slate-950 shadow-[0_0_10px_rgba(76,215,246,0.5)] font-bold"
                    : "text-on-surface-variant hover:text-white"
                }`}
              >
                <svg className="w-3.5 h-3.5 stroke-current fill-none stroke-2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
                Manual
              </button>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:text-white hover:bg-white/10 transition shrink-0"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Scrollable Container with Hidden Scrollbars */}
        <div className="overflow-y-auto max-h-[65vh] pr-1 pt-4 pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden flex-1">
          {mode === "ai" && (
            <AnimatePresence mode="wait">
              {/* STATE 1: PROMPT INPUT */}
              {aiState === "prompt" && (
                <motion.div
                  key="state-prompt"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="flex flex-col gap-4"
                >
                  <div>
                    <label className="block font-mono text-xs text-on-surface-variant uppercase tracking-wider mb-2">
                      What is your workout focus today?
                    </label>
                    <textarea
                      rows={3}
                      className="w-full bg-surface-container/70 border border-white/15 rounded-xl text-white text-sm p-3.5 outline-none focus:border-secondary transition shadow-inner placeholder:text-white/30"
                      placeholder="e.g., I want to build my upper body today with heavy compound presses and arms..."
                      value={userPrompt}
                      onChange={(e) => setUserPrompt(e.target.value)}
                    />
                  </div>

                  <div>
                    <p className="font-mono text-[10px] text-on-surface-variant uppercase tracking-wider mb-2">
                      Quick Ideas
                    </p>
                    <div className="flex flex-col gap-2">
                      {PRESET_PROMPTS.map((prompt, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => {
                            setUserPrompt(prompt);
                            handleGenerate(prompt);
                          }}
                          className="w-full text-left p-2.5 rounded-xl bg-surface-container-low/70 hover:bg-surface-container-low border border-white/5 hover:border-secondary/40 text-xs text-on-surface transition flex items-center justify-between group"
                        >
                          <span className="group-hover:text-secondary transition">{prompt}</span>
                          <span className="text-secondary opacity-0 group-hover:opacity-100 transition">→</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {aiError && (
                    <div className="p-3 rounded-xl bg-error-container/20 border border-error/30 text-error text-xs">
                      {aiError}
                    </div>
                  )}

                  <button
                    type="button"
                    disabled={!userPrompt.trim()}
                    onClick={() => handleGenerate()}
                    className="w-full py-3.5 rounded-xl font-bold text-xs sm:text-sm bg-gradient-to-r from-secondary-container via-secondary to-amber-500 text-slate-950 shadow-[0_0_20px_rgba(236,106,6,0.4)] hover:shadow-[0_0_30px_rgba(236,106,6,0.6)] transition-all duration-200 disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
                  >
                    Generate AI Workout Routine
                  </button>
                </motion.div>
              )}

              {/* STATE 2: GENERATING SPINNER */}
              {aiState === "generating" && (
                <motion.div
                  key="state-generating"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center py-12 gap-4 text-center"
                >
                  <div className="relative w-14 h-14 flex items-center justify-center">
                    <div className="absolute inset-0 rounded-full border-2 border-secondary/20 animate-ping" />
                    <div className="w-12 h-12 rounded-full border-2 border-secondary border-t-transparent animate-spin" />
                    <span className="material-symbols-outlined text-secondary text-xl">fitness_center</span>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white mb-1">Synthesizing Workout Plan…</h3>
                    <p className="text-xs text-on-surface-variant max-w-[260px]">
                      Gemini is calculating optimal training volume and scientific calorie estimates.
                    </p>
                  </div>
                </motion.div>
              )}

              {/* STATE 3: PROPOSED WORKOUT */}
              {aiState === "proposed" && aiResult && (
                <motion.div
                  key="state-proposed"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col gap-4"
                >
                  {/* Summary Card with Distinct Metrics */}
                  <div className="p-4 rounded-xl bg-surface-container/70 border border-white/10 flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-extrabold text-white text-sm sm:text-base truncate">{aiResult.workout_name}</h3>
                      <p className="font-mono text-xs text-on-surface-variant flex items-center gap-1.5 mt-0.5">
                        <span>⏱️ {aiResult.duration_min} min</span>
                        <span>•</span>
                        <span className="text-cyan-400">MET Estimated</span>
                      </p>
                    </div>
                    <div className="px-3 py-1.5 rounded-lg bg-secondary/20 border border-secondary text-secondary font-mono font-extrabold text-sm shadow-[0_0_10px_rgba(236,106,6,0.4)] shrink-0">
                      🔥 {aiResult.total_estimated_kcal} kcal
                    </div>
                  </div>

                  {/* Standardized Exercise List Mapping */}
                  <div className="flex flex-col gap-3">
                    {aiResult.exercises.map((item: ExerciseItem, idx: number) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-surface-container-low/90 border border-white/10 flex items-center justify-between gap-4 text-xs"
                      >
                        <div className="space-y-0.5 min-w-0 flex-1">
                          <p className="font-bold text-white text-xs sm:text-sm truncate">{item.exercise_name}</p>
                          <p className="text-on-surface-variant font-mono text-[11px] line-clamp-2">{item.notes}</p>
                        </div>
                        <div className="flex flex-col items-end justify-center text-right shrink-0 min-w-[80px]">
                          <span className="font-extrabold text-secondary font-mono text-xs">{item.sets} Sets</span>
                          <span className="text-[10px] text-on-surface-variant font-mono whitespace-nowrap">× {item.reps}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setAiState("prompt")}
                      className="flex-1 py-3 rounded-xl border border-white/20 text-xs font-semibold text-on-surface hover:bg-white/10 transition"
                    >
                      Regenerate
                    </button>

                    <button
                      type="button"
                      disabled={saving || saved || isSubmitting}
                      onClick={handleAcceptAndTrack}
                      className={`flex-[2] py-3.5 rounded-xl font-bold text-xs sm:text-sm transition-all duration-200 shadow-[0_0_20px_rgba(236,106,6,0.4)] active:scale-[0.98] ${
                        saved
                          ? "bg-emerald-500 text-white"
                          : "bg-gradient-to-r from-secondary-container via-secondary to-amber-500 text-slate-950 hover:shadow-[0_0_30px_rgba(236,106,6,0.6)] cursor-pointer"
                      }`}
                    >
                      {saved ? "✓ Tracked to Supabase!" : (saving || isSubmitting) ? "Saving to Supabase…" : "Accept & Track Workout"}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          )}

          {/* ─────────────────────────────────────────────────────────
              MANUAL LOGGER FLOW
              ───────────────────────────────────────────────────────── */}
          {mode === "manual" && (
            <form onSubmit={handleManualSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block font-mono text-xs text-on-surface-variant uppercase tracking-wider mb-2">
                  Workout Type
                </label>
                <div className="flex flex-wrap gap-2">
                  {WORKOUT_TYPES.map((t) => (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => {
                        const newType = t.value as "strength" | "run" | "hiit" | "cardio" | "yoga";
                        setManualForm((f) => ({ ...f, type: newType }));
                        updateCaloriesDynamically(newType, manualForm.duration_min, manualForm.intensity);
                      }}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition ${
                        manualForm.type === t.value
                          ? "border-primary bg-primary/20 text-primary shadow-[0_0_12px_rgba(76,215,246,0.4)] font-bold"
                          : "border-white/10 bg-white/5 text-on-surface-variant hover:border-white/20"
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-mono text-xs text-on-surface-variant uppercase tracking-wider mb-1">
                  Workout Title
                </label>
                <input
                  className="w-full bg-surface-container/60 border border-white/15 rounded-xl text-white text-sm px-3.5 py-2.5 outline-none focus:border-primary transition"
                  placeholder="e.g. Upper Body Hypertrophy"
                  value={manualForm.name}
                  onChange={(e) => setManualForm((f) => ({ ...f, name: e.target.value }))}
                />
              </div>

              {/* Intensity Selector */}
              <div>
                <label className="block font-mono text-xs text-on-surface-variant uppercase tracking-wider mb-1">
                  Effort Intensity
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(["low", "moderate", "high"] as const).map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => {
                        setManualForm((f) => ({ ...f, intensity: lvl }));
                        updateCaloriesDynamically(manualForm.type, manualForm.duration_min, lvl);
                      }}
                      className={`py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider border transition ${
                        manualForm.intensity === lvl
                          ? "bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-sm shadow-cyan-500/30"
                          : "bg-white/5 border-white/10 text-white/60 hover:border-white/20"
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-mono text-xs text-on-surface-variant uppercase tracking-wider mb-1">
                    Duration (min)
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={720}
                    className="w-full bg-surface-container/60 border border-white/15 rounded-xl text-white text-sm px-3.5 py-2.5 outline-none focus:border-primary"
                    value={manualForm.duration_min}
                    onChange={(e) => {
                      const dur = Number(e.target.value);
                      setManualForm((f) => ({ ...f, duration_min: dur }));
                      updateCaloriesDynamically(manualForm.type, dur, manualForm.intensity);
                    }}
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-mono text-xs text-on-surface-variant uppercase tracking-wider">
                      Calories (kcal)
                    </label>
                    <span className="text-[9px] font-mono text-cyan-400">
                      [{manualForm.calorie_source}]
                    </span>
                  </div>
                  <input
                    type="number"
                    min={0}
                    className="w-full bg-surface-container/60 border border-white/15 rounded-xl text-white text-sm px-3.5 py-2.5 outline-none focus:border-primary"
                    value={manualForm.calories}
                    onChange={(e) => {
                      setIsUserCustomCalories(true);
                      setManualForm((f) => ({
                        ...f,
                        calories: Number(e.target.value),
                        calorie_source: "USER_PROVIDED",
                      }));
                    }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-mono text-xs text-on-surface-variant uppercase tracking-wider mb-1">
                    Distance (km, optional)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min={0}
                    placeholder="e.g. 5.2"
                    className="w-full bg-surface-container/60 border border-white/15 rounded-xl text-white text-sm px-3.5 py-2.5 outline-none focus:border-primary"
                    value={manualForm.distance_km}
                    onChange={(e) => setManualForm((f) => ({ ...f, distance_km: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block font-mono text-xs text-on-surface-variant uppercase tracking-wider mb-1">
                    Avg Heart Rate (bpm)
                  </label>
                  <input
                    type="number"
                    min={40}
                    max={220}
                    placeholder="e.g. 142"
                    className="w-full bg-surface-container/60 border border-white/15 rounded-xl text-white text-sm px-3.5 py-2.5 outline-none focus:border-primary"
                    value={manualForm.avg_heart_rate}
                    onChange={(e) => setManualForm((f) => ({ ...f, avg_heart_rate: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <label className="block font-mono text-xs text-on-surface-variant uppercase tracking-wider mb-1">
                  Notes / Exercises Performed
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Felt strong on sets, increased weight by 2.5kg"
                  className="w-full bg-surface-container/60 border border-white/15 rounded-xl text-white text-sm px-3.5 py-2 outline-none focus:border-primary text-xs"
                  value={manualForm.notes}
                  onChange={(e) => setManualForm((f) => ({ ...f, notes: e.target.value }))}
                />
              </div>

              <button
                type="submit"
                disabled={saving || saved || isSubmitting}
                className="w-full py-3.5 rounded-xl font-bold text-xs sm:text-sm bg-primary text-slate-950 shadow-[0_0_20px_rgba(76,215,246,0.4)] hover:bg-primary/90 transition cursor-pointer mt-2 disabled:opacity-50"
              >
                {saved ? "✓ Saved to Database!" : (saving || isSubmitting) ? "Saving…" : "Save Workout Session"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
