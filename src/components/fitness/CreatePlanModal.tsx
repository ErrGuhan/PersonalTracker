"use client";

import { useState } from "react";
import { X, Sparkles, Plus, Trash2, Calendar, Target, Dumbbell, Check, ChevronRight } from "lucide-react";
import { generateWorkoutPlanAction, type GeneratedPlanDay } from "@/app/actions/generateWorkout";
import type { WorkoutProgram } from "@/lib/database.types";
import { todayStr } from "@/lib/db";

interface CreatePlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (program: Parameters<typeof import("@/lib/db").saveWorkoutProgram>[0]) => Promise<WorkoutProgram>;
}

export default function CreatePlanModal({ isOpen, onClose, onSave }: CreatePlanModalProps) {
  const [tab, setTab] = useState<"ai" | "manual">("ai");
  const [programName, setProgramName] = useState("30-Day Strength & Conditioning");
  const [goal, setGoal] = useState<"fat_loss" | "muscle_gain" | "strength" | "endurance" | "mobility" | "general_fitness">("muscle_gain");
  const [durationDays, setDurationDays] = useState(30);
  const [daysPerWeek, setDaysPerWeek] = useState(5);
  const [equipment, setEquipment] = useState("Dumbbells & Bodyweight");
  const [aiPrompt, setAiPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewDays, setPreviewDays] = useState<GeneratedPlanDay[] | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  if (!isOpen) return null;

  const handleGenerateAiPlan = async () => {
    setIsGenerating(true);
    setErrorMsg("");
    try {
      const result = await generateWorkoutPlanAction({
        programName,
        goal,
        durationDays,
        daysPerWeek,
        equipment: aiPrompt ? `${equipment}. Notes: ${aiPrompt}` : equipment,
      });

      if (result.success && result.days && result.days.length > 0) {
        setPreviewDays(result.days);
      } else {
        setErrorMsg(result.error || "Could not generate plan. Please try again or create manually.");
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Plan generation failed";
      setErrorMsg(message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSavePlan = async () => {
    if (isSaving) return;
    setIsSaving(true);
    setErrorMsg("");

    try {
      const daysToSave = previewDays && previewDays.length > 0
        ? previewDays.map((d) => ({
            dayNumber: d.dayNumber,
            title: d.title,
            focus: d.focus,
            isRestDay: d.isRestDay,
            notes: d.notes || null,
            exercises: (d.exercises || []).map((ex, idx) => ({
              name: ex.name,
              type: ex.type,
              sets: ex.sets ?? 3,
              reps: ex.reps ?? "10-12",
              durationMin: ex.durationMin ?? null,
              distanceKm: ex.distanceKm ?? null,
              restSeconds: ex.restSeconds ?? 60,
              orderIndex: idx + 1,
              notes: ex.notes ?? null,
            })),
          }))
        : [
            // Default 7-day starter template if user didn't generate preview
            {
              dayNumber: 1,
              title: "Day 1 — Upper Body Strength",
              focus: "upper",
              isRestDay: false,
              notes: "Bench press, pull-ups, overhead press",
              exercises: [
                { name: "Push-ups / Bench Press", type: "strength" as const, sets: 4, reps: "10-12", orderIndex: 1 },
                { name: "Dumbbell Rows", type: "strength" as const, sets: 4, reps: "10-12", orderIndex: 2 },
                { name: "Overhead Shoulder Press", type: "strength" as const, sets: 3, reps: "12", orderIndex: 3 },
                { name: "Plank Hold", type: "bodyweight" as const, sets: 3, reps: "45 sec", orderIndex: 4 },
              ],
            },
            {
              dayNumber: 2,
              title: "Day 2 — Lower Body Power",
              focus: "lower",
              isRestDay: false,
              notes: "Squats, lunges, hamstring work",
              exercises: [
                { name: "Goblet Squats", type: "strength" as const, sets: 4, reps: "10-12", orderIndex: 1 },
                { name: "Walking Lunges", type: "strength" as const, sets: 3, reps: "12/leg", orderIndex: 2 },
                { name: "Romanian Deadlifts", type: "strength" as const, sets: 3, reps: "10", orderIndex: 3 },
              ],
            },
            {
              dayNumber: 3,
              title: "Day 3 — Active Recovery & Mobility",
              focus: "recovery",
              isRestDay: true,
              notes: "Gentle stretching and mobility work",
              exercises: [
                { name: "Hip & Spine Mobility Routine", type: "stretch" as const, sets: 1, reps: "15 min", orderIndex: 1 },
              ],
            },
          ];

      await onSave({
        name: programName,
        goal,
        durationDays,
        startDate: todayStr(),
        isActive: true,
        days: daysToSave,
      });

      onClose();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to save workout program";
      setErrorMsg(message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in"
      data-no-swipe
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full max-w-lg max-h-[90vh] flex flex-col rounded-2xl bg-[#0d131f] border border-cyan-500/20 shadow-2xl shadow-cyan-950/50 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/[0.02]">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Dumbbell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">Create Workout Program</h2>
              <p className="text-xs text-[var(--muted-foreground)]">Day 1 → Day N Structured Training Plan</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[var(--muted-foreground)] hover:text-white hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1 custom-scrollbar">
          {errorMsg && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
              {errorMsg}
            </div>
          )}

          {/* Program Details */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1">
                Program Title
              </label>
              <input
                type="text"
                value={programName}
                onChange={(e) => setProgramName(e.target.value)}
                placeholder="e.g. 30-Day Hypertrophy Split"
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1">
                  Primary Goal
                </label>
                <select
                  value={goal}
                  onChange={(e) => setGoal(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-lg bg-[#141c2e] border border-white/10 text-white text-xs focus:outline-none focus:border-cyan-400"
                >
                  <option value="muscle_gain">Muscle Gain (Hypertrophy)</option>
                  <option value="fat_loss">Fat Loss & Conditioning</option>
                  <option value="strength">Maximum Strength</option>
                  <option value="endurance">Stamina & Aerobic</option>
                  <option value="mobility">Mobility & Longevity</option>
                  <option value="general_fitness">General Health</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1">
                  Total Duration (Days)
                </label>
                <select
                  value={durationDays}
                  onChange={(e) => setDurationDays(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg bg-[#141c2e] border border-white/10 text-white text-xs focus:outline-none focus:border-cyan-400"
                >
                  <option value={7}>7 Days (1 Week Sprint)</option>
                  <option value={14}>14 Days (2 Weeks)</option>
                  <option value={30}>30 Days (1 Month Split)</option>
                  <option value={60}>60 Days (2 Months)</option>
                  <option value={90}>90 Days (Quarterly Program)</option>
                </select>
              </div>
            </div>
          </div>

          {/* AI Generator Section */}
          <div className="p-4 rounded-xl bg-cyan-950/30 border border-cyan-500/20 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-cyan-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> AI Routine Architect
              </span>
              <span className="text-[10px] text-cyan-400/70">Powered by Gemini AI</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] text-[var(--muted-foreground)] mb-1">
                  Equipment
                </label>
                <input
                  type="text"
                  value={equipment}
                  onChange={(e) => setEquipment(e.target.value)}
                  placeholder="e.g. Dumbbells, barbell, gym"
                  className="w-full px-2.5 py-1.5 rounded-lg bg-black/40 border border-white/10 text-white text-xs"
                />
              </div>
              <div>
                <label className="block text-[10px] text-[var(--muted-foreground)] mb-1">
                  Days / Week
                </label>
                <select
                  value={daysPerWeek}
                  onChange={(e) => setDaysPerWeek(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-[#141c2e] border border-white/10 text-white text-xs"
                >
                  <option value={3}>3 Days (Full Body)</option>
                  <option value={4}>4 Days (Upper / Lower)</option>
                  <option value={5}>5 Days (Push Pull Legs Upper Lower)</option>
                  <option value={6}>6 Days (PPL x 2)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[10px] text-[var(--muted-foreground)] mb-1">
                Custom Focus or Physical Constraints (Optional)
              </label>
              <input
                type="text"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="e.g. emphasize shoulders and core, knee-friendly lower body"
                className="w-full px-2.5 py-1.5 rounded-lg bg-black/40 border border-white/10 text-white text-xs"
              />
            </div>

            <button
              type="button"
              onClick={handleGenerateAiPlan}
              disabled={isGenerating}
              className="w-full py-2 px-3 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/40 text-cyan-300 font-medium text-xs flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5" />
              {isGenerating ? "Synthesizing Periodized Plan..." : "Generate AI Routine"}
            </button>
          </div>

          {/* Generated Preview */}
          {previewDays && previewDays.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold text-white flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-cyan-400" /> Generated Plan Preview ({previewDays.length} Days)
                </h3>
                <span className="text-[10px] text-[var(--muted-foreground)]">Review before saving</span>
              </div>

              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {previewDays.slice(0, 7).map((d) => (
                  <div
                    key={d.dayNumber}
                    className="p-2.5 rounded-lg bg-white/[0.03] border border-white/5 flex flex-col gap-1 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-cyan-300">{d.title}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                        d.isRestDay ? "bg-amber-500/20 text-amber-300" : "bg-cyan-500/20 text-cyan-300"
                      }`}>
                        {d.isRestDay ? "Active Rest" : `${d.exercises?.length || 0} exercises`}
                      </span>
                    </div>
                    {d.notes && <p className="text-[11px] text-[var(--muted-foreground)]">{d.notes}</p>}
                    {!d.isRestDay && (
                      <p className="text-[10px] text-white/70 truncate">
                        {(d.exercises || []).map((e) => e.name).join(" • ")}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-white/[0.02] flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs text-[var(--muted-foreground)] hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSavePlan}
            disabled={isSaving}
            className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-semibold text-xs transition-all shadow-md shadow-cyan-500/30 disabled:opacity-50 flex items-center gap-1.5"
          >
            {isSaving ? "Activating Plan..." : "Activate Training Program"}
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
