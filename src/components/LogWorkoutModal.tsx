"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLogWorkout } from "@/hooks/useSupabase";
import { generateWorkoutAction, type AiWorkoutResult, type ExerciseItem } from "@/app/actions/generateWorkout";

interface LogWorkoutModalProps {
  onClose: () => void;
  onSaved: () => void;
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

export default function LogWorkoutModal({ onClose, onSaved }: LogWorkoutModalProps) {
  const { logWorkout, saving } = useLogWorkout();
  const [mode, setMode] = useState<"ai" | "manual">("ai");

  // State Machine for AI Flow: 'prompt' | 'generating' | 'proposed'
  const [aiState, setAiState] = useState<"prompt" | "generating" | "proposed">("prompt");
  const [userPrompt, setUserPrompt] = useState("");
  const [aiResult, setAiResult] = useState<AiWorkoutResult | null>(null);
  const [saved, setSaved] = useState(false);

  // Manual Form State
  const [manualForm, setManualForm] = useState({
    name: "",
    type: "strength",
    duration_min: 45,
    calories: 400,
    distance_km: "",
    avg_heart_rate: "",
    notes: "",
    workout_date: new Date().toISOString().split("T")[0],
  });

  /* ─────────────────────────────────────────────────────────
     1. AI WORKOUT GENERATION HANDLER
     ───────────────────────────────────────────────────────── */
  const handleGenerate = async (promptText?: string) => {
    const query = promptText || userPrompt;
    if (!query.trim()) return;

    setAiState("generating");

    // Call Next.js Server Action with Gemini API
    const result = await generateWorkoutAction(query);

    setAiResult(result);
    setAiState("proposed");
  };

  /* ─────────────────────────────────────────────────────────
     2. SUPABASE INSERT (ACCEPT & TRACK WORKOUT)
     ───────────────────────────────────────────────────────── */
  const handleAcceptAndTrack = async () => {
    if (!aiResult) return;

    const exercisesNotes = aiResult.exercises
      .map((e) => `${e.exercise_name}: ${e.sets}x${e.reps} (${e.notes})`)
      .join("\n");

    // Supabase mutation inserting workout_logs row
    await logWorkout({
      name: aiResult.workout_name,
      type: "strength",
      duration_min: aiResult.duration_min,
      calories: aiResult.total_estimated_kcal,
      avg_heart_rate: 145,
      distance_km: null,
      notes: `AI Generated Workout Routine:\n${exercisesNotes}`,
      workout_date: new Date().toISOString().split("T")[0],
    });

    setSaved(true);
    setTimeout(() => {
      onSaved();
      onClose();
    }, 600);
  };

  /* ─────────────────────────────────────────────────────────
     3. MANUAL SUBMIT HANDLER
     ───────────────────────────────────────────────────────── */
  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await logWorkout({
      name: manualForm.name || "Custom Workout",
      type: manualForm.type,
      duration_min: Number(manualForm.duration_min),
      calories: Number(manualForm.calories),
      avg_heart_rate: manualForm.avg_heart_rate ? Number(manualForm.avg_heart_rate) : null,
      distance_km: manualForm.distance_km ? Number(manualForm.distance_km) : null,
      notes: manualForm.notes || null,
      workout_date: manualForm.workout_date,
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
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: "spring", stiffness: 350, damping: 26 }}
        className="w-full max-w-lg rounded-2xl bg-gradient-to-b from-surface-container-high/95 to-surface-dim/98 border border-white/15 backdrop-blur-2xl p-5 sm:p-6 shadow-[0_20px_50px_rgba(0,0,0,0.8)] text-on-surface space-y-5 overflow-hidden relative"
      >
        {/* Top Header & Mode Toggle */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                fitness_center
              </span>
              <h2 className="text-lg sm:text-xl font-extrabold text-white">Log Activity</h2>
            </div>
            <p className="font-mono text-[10px] text-secondary tracking-wider uppercase mt-0.5">
              {mode === "ai" ? "GEMINI AI WORKOUT GENERATOR" : "FITNESS · MANUAL LOGGER"}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Mode Toggle Switch */}
            <div className="flex bg-surface-container-low p-1 rounded-xl border border-white/10">
              <button
                type="button"
                onClick={() => {
                  setMode("ai");
                  setAiState("prompt");
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                  mode === "ai"
                    ? "bg-secondary text-slate-950 shadow-[0_0_10px_rgba(236,106,6,0.5)]"
                    : "text-on-surface-variant hover:text-white"
                }`}
              >
                ✨ AI
              </button>
              <button
                type="button"
                onClick={() => setMode("manual")}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                  mode === "manual"
                    ? "bg-primary text-slate-950 shadow-[0_0_10px_rgba(76,215,246,0.5)]"
                    : "text-on-surface-variant hover:text-white"
                }`}
              >
                📝 Manual
              </button>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:text-white hover:bg-white/10 transition"
            >
              ✕
            </button>
          </div>
        </div>

        {/* ─────────────────────────────────────────────────────────
            AI WORKOUT GENERATOR FLOW (STATE 1, 2 & 3)
            ───────────────────────────────────────────────────────── */}
        {mode === "ai" && (
          <AnimatePresence mode="wait">
            {/* STATE 1: PROMPT INPUT */}
            {aiState === "prompt" && (
              <motion.div
                key="state-prompt"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-4"
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

                {/* Preset Chips */}
                <div>
                  <label className="block font-mono text-[10px] text-on-surface-variant uppercase tracking-wider mb-2">
                    Quick Suggestions
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {PRESET_PROMPTS.map((prompt) => (
                      <button
                        key={prompt}
                        type="button"
                        onClick={() => {
                          setUserPrompt(prompt);
                          handleGenerate(prompt);
                        }}
                        className="text-xs px-3 py-1.5 rounded-full bg-white/5 border border-white/10 hover:border-secondary/50 hover:bg-secondary/15 hover:text-secondary transition text-on-surface-variant text-left"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  disabled={!userPrompt.trim()}
                  onClick={() => handleGenerate()}
                  className="w-full py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-secondary-container via-secondary to-amber-500 text-slate-950 shadow-[0_0_25px_rgba(236,106,6,0.5)] hover:shadow-[0_0_35px_rgba(236,106,6,0.7)] transition active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-lg">auto_awesome</span>
                  Generate AI Workout Routine
                </button>
              </motion.div>
            )}

            {/* STATE 2: GENERATING SKELETON LOADER */}
            {aiState === "generating" && (
              <motion.div
                key="state-generating"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                className="py-8 flex flex-col items-center justify-center gap-5 text-center"
              >
                <div className="relative w-20 h-20 flex items-center justify-center">
                  <div className="absolute inset-0 bg-secondary/20 rounded-full blur-xl animate-ping" />
                  <div className="w-16 h-16 rounded-full border-2 border-secondary/40 border-t-secondary animate-spin flex items-center justify-center">
                    <span className="material-symbols-outlined text-secondary text-2xl">auto_awesome</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <h3 className="font-bold text-base text-white">Gemini AI Synthesizing Routine</h3>
                  <p className="font-mono text-xs text-secondary animate-pulse">
                    Calculating hypertrophy set ranges & estimated kcal burn…
                  </p>
                </div>

                {/* Pulsing Skeleton Rows */}
                <div className="w-full space-y-2.5 mt-2">
                  {[0, 1, 3].map((idx) => (
                    <motion.div
                      key={idx}
                      className="p-3.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between"
                      animate={{ opacity: [0.4, 0.8, 0.4] }}
                      transition={{ duration: 1.2, repeat: Infinity, delay: idx * 0.15 }}
                    >
                      <div className="h-4 w-1/2 bg-white/20 rounded" />
                      <div className="h-4 w-1/4 bg-white/10 rounded" />
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* STATE 3: PROPOSED WORKOUT RESULT */}
            {aiState === "proposed" && aiResult && (
              <motion.div
                key="state-proposed"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-4"
              >
                {/* Header Summary */}
                <div className="p-4 rounded-xl bg-gradient-to-r from-secondary-container/30 to-surface-container border border-secondary/40 flex justify-between items-center shadow-lg">
                  <div>
                    <h3 className="font-extrabold text-base text-white">{aiResult.workout_name}</h3>
                    <p className="text-xs text-on-surface-variant font-mono">
                      Estimated Duration: {aiResult.duration_min} mins
                    </p>
                  </div>
                  <div className="px-3 py-1.5 rounded-lg bg-secondary/20 border border-secondary text-secondary font-mono font-extrabold text-sm shadow-[0_0_10px_rgba(236,106,6,0.4)]">
                    🔥 {aiResult.total_estimated_kcal} kcal
                  </div>
                </div>

                {/* Exercise List Mapping */}
                <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                  {aiResult.exercises.map((item: ExerciseItem, idx: number) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-surface-container-low/90 border border-white/10 flex items-start justify-between gap-3 text-xs"
                    >
                      <div className="space-y-0.5">
                        <p className="font-bold text-white text-xs sm:text-sm">{item.exercise_name}</p>
                        <p className="text-on-surface-variant font-mono text-[11px]">{item.notes}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="font-extrabold text-secondary font-mono">{item.sets} Sets</span>
                        <span className="block text-[10px] text-on-surface-variant font-mono">× {item.reps}</span>
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
                    disabled={saving || saved}
                    onClick={handleAcceptAndTrack}
                    className={`flex-[2] py-3 rounded-xl font-bold text-xs sm:text-sm transition-all duration-200 shadow-[0_0_20px_rgba(236,106,6,0.4)] active:scale-[0.98] ${
                      saved
                        ? "bg-emerald-500 text-white"
                        : "bg-gradient-to-r from-secondary-container via-secondary to-amber-500 text-slate-950 hover:shadow-[0_0_30px_rgba(236,106,6,0.6)]"
                    }`}
                  >
                    {saved ? "✓ Tracked to Supabase!" : saving ? "Saving to Supabase…" : "Accept & Track Workout"}
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
          <form onSubmit={handleManualSubmit} className="space-y-4">
            <div>
              <label className="block font-mono text-xs text-on-surface-variant uppercase tracking-wider mb-2">
                Modality
              </label>
              <div className="flex flex-wrap gap-2">
                {WORKOUT_TYPES.map((t) => (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => setManualForm((f) => ({ ...f, type: t.value }))}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition ${
                      manualForm.type === t.value
                        ? "border-primary bg-primary/20 text-primary shadow-[0_0_12px_rgba(76,215,246,0.4)]"
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
                className="w-full bg-surface-container/60 border-b-2 border-white/10 text-white text-sm px-3 py-2 outline-none focus:border-primary transition"
                placeholder="e.g. Heavy Bench & Core"
                value={manualForm.name}
                onChange={(e) => setManualForm((f) => ({ ...f, name: e.target.value }))}
              />
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
                  className="w-full bg-surface-container/60 border-b-2 border-white/10 text-white text-sm px-3 py-2 outline-none focus:border-primary"
                  value={manualForm.duration_min}
                  onChange={(e) => setManualForm((f) => ({ ...f, duration_min: Number(e.target.value) }))}
                />
              </div>
              <div>
                <label className="block font-mono text-xs text-on-surface-variant uppercase tracking-wider mb-1">
                  Calories (kcal)
                </label>
                <input
                  type="number"
                  min={0}
                  className="w-full bg-surface-container/60 border-b-2 border-white/10 text-white text-sm px-3 py-2 outline-none focus:border-primary"
                  value={manualForm.calories}
                  onChange={(e) => setManualForm((f) => ({ ...f, calories: Number(e.target.value) }))}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={saving || saved}
              className="w-full py-3.5 rounded-xl font-bold text-xs sm:text-sm bg-primary text-slate-950 shadow-[0_0_20px_rgba(76,215,246,0.4)] hover:bg-primary/90 transition cursor-pointer"
            >
              {saved ? "✓ Saved!" : saving ? "Saving…" : "Save Workout Entry"}
            </button>
          </form>
        )}
      </motion.div>
    </motion.div>
  );
}
