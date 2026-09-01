"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
  const router = useRouter();
  const { logWorkout, saving } = useLogWorkout();
  const [mode, setMode] = useState<"ai" | "manual">("ai");

  // State Machine for AI Flow: 'prompt' | 'generating' | 'proposed'
  const [aiState, setAiState] = useState<"prompt" | "generating" | "proposed">("prompt");
  const [userPrompt, setUserPrompt] = useState("");
  const [aiResult, setAiResult] = useState<AiWorkoutResult | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  // Manual Form State
  const [manualForm, setManualForm] = useState({
    name: "",
    type: "strength" as "strength" | "run" | "hiit" | "cardio" | "yoga",
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
    if (!aiResult) return;

    try {
      const exercisesNotes = aiResult.exercises
        .map((e) => `${e.exercise_name}: ${e.sets}x${e.reps} (${e.notes})`)
        .join("\n");

      await logWorkout({
        name: aiResult.workout_name,
        type: "strength",
        duration_min: aiResult.duration_min,
        calories: aiResult.total_estimated_kcal,
        avg_heart_rate: 145,
        distance_km: null,
        notes: `AI Generated Routine:\n${exercisesNotes}`,
        workout_date: new Date().toISOString().split("T")[0],
      });

      router.refresh();
      setSaved(true);
      setTimeout(() => {
        onSaved();
        onClose();
      }, 600);
    } catch (err) {
      console.error("[Supabase logWorkout Error]:", err);
      setAiError("Failed to save workout to database.");
    }
  };

  /* ─────────────────────────────────────────────────────────
     3. MANUAL SUBMIT HANDLER
     ───────────────────────────────────────────────────────── */
  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
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

      router.refresh();
      setSaved(true);
      setTimeout(() => {
        onSaved();
        onClose();
      }, 600);
    } catch (err) {
      console.error("[Supabase logWorkout Error]:", err);
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
        className="w-full max-w-md max-h-[85vh] flex flex-col rounded-2xl bg-gradient-to-b from-surface-container-high/95 to-surface-dim/98 border border-white/15 backdrop-blur-2xl p-5 sm:p-6 shadow-[0_20px_50px_rgba(0,0,0,0.8)] text-on-surface overflow-hidden relative"
      >
        {/* Top Header & Mode Toggle with Proper Flex Alignment & Gap */}
        <div className="flex flex-row items-center justify-between gap-4 border-b border-white/10 pb-4 shrink-0">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary text-2xl shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>
                fitness_center
              </span>
              <h2 className="text-base sm:text-xl font-extrabold text-white truncate">Log Activity</h2>
            </div>
            <p className="font-mono text-[10px] text-secondary tracking-wider uppercase mt-0.5 truncate">
              {mode === "ai" ? "GEMINI AI WORKOUT GENERATOR" : "FITNESS · MANUAL LOGGER"}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Mode Switcher with Clean SVG Icons */}
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
                    className="w-full py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-secondary-container via-secondary to-amber-500 text-slate-950 shadow-[0_0_25px_rgba(236,106,6,0.5)] hover:shadow-[0_0_35px_rgba(236,106,6,0.7)] transition active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer mt-2"
                  >
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                      <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" />
                    </svg>
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
                      <svg className="w-6 h-6 fill-current text-secondary" viewBox="0 0 24 24">
                        <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" />
                      </svg>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <h3 className="font-bold text-base text-white">Gemini AI Synthesizing Routine</h3>
                    <p className="font-mono text-xs text-secondary animate-pulse">
                      Calculating hypertrophy set ranges & estimated kcal burn…
                    </p>
                  </div>

                  {/* Pulsing Skeleton Rows */}
                  <div className="w-full flex flex-col gap-3 mt-2">
                    {[0, 1, 2].map((idx) => (
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
                  className="flex flex-col gap-4"
                >
                  {/* Header Summary Card */}
                  <div className="p-4 rounded-xl bg-gradient-to-r from-secondary-container/30 to-surface-container border border-secondary/40 flex justify-between items-center shadow-lg">
                    <div>
                      <h3 className="font-extrabold text-base text-white">{aiResult.workout_name}</h3>
                      <p className="text-xs text-on-surface-variant font-mono">
                        Estimated Duration: {aiResult.duration_min} mins
                      </p>
                    </div>
                    <div className="px-3 py-1.5 rounded-lg bg-secondary/20 border border-secondary text-secondary font-mono font-extrabold text-sm shadow-[0_0_10px_rgba(236,106,6,0.4)] shrink-0">
                      🔥 {aiResult.total_estimated_kcal} kcal
                    </div>
                  </div>

                  {/* Standardized Exercise List Mapping with gap-4 and Vertical Right-Alignment */}
                  <div className="flex flex-col gap-4">
                    {aiResult.exercises.map((item: ExerciseItem, idx: number) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-xl bg-surface-container-low/90 border border-white/10 flex items-center justify-between gap-4 text-xs"
                      >
                        <div className="space-y-1 min-w-0 flex-1">
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
                      disabled={saving || saved}
                      onClick={handleAcceptAndTrack}
                      className={`flex-[2] py-3.5 rounded-xl font-bold text-xs sm:text-sm transition-all duration-200 shadow-[0_0_20px_rgba(236,106,6,0.4)] active:scale-[0.98] ${
                        saved
                          ? "bg-emerald-500 text-white"
                          : "bg-gradient-to-r from-secondary-container via-secondary to-amber-500 text-slate-950 hover:shadow-[0_0_30px_rgba(236,106,6,0.6)] cursor-pointer"
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
            <form onSubmit={handleManualSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block font-mono text-xs text-on-surface-variant uppercase tracking-wider mb-2">
                  Modality
                </label>
                <div className="flex flex-wrap gap-2">
                  {WORKOUT_TYPES.map((t) => (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => setManualForm((f) => ({ ...f, type: t.value as "strength" | "run" | "hiit" | "cardio" | "yoga" }))}
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
                    className="w-full bg-surface-container/60 border border-white/15 rounded-xl text-white text-sm px-3.5 py-2.5 outline-none focus:border-primary"
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
                    className="w-full bg-surface-container/60 border border-white/15 rounded-xl text-white text-sm px-3.5 py-2.5 outline-none focus:border-primary"
                    value={manualForm.calories}
                    onChange={(e) => setManualForm((f) => ({ ...f, calories: Number(e.target.value) }))}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={saving || saved}
                className="w-full py-3.5 rounded-xl font-bold text-xs sm:text-sm bg-primary text-slate-950 shadow-[0_0_20px_rgba(76,215,246,0.4)] hover:bg-primary/90 transition cursor-pointer mt-2"
              >
                {saved ? "✓ Saved!" : saving ? "Saving…" : "Save Workout Entry"}
              </button>
            </form>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
