"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Check, ChevronRight, Zap, Target, BookOpen, Flame, Moon, Heart } from "lucide-react";
import type { Habit } from "@/lib/database.types";

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCompleteOnboarding: (starterHabits: Array<Omit<Habit, "id" | "streak" | "completedToday">>) => void;
}

export default function OnboardingModal({ isOpen, onClose, onCompleteOnboarding }: OnboardingModalProps) {
  const [step, setStep] = useState(1);
  const [selectedFocus, setSelectedFocus] = useState<string[]>(["study", "fitness"]);
  const [studyTarget, setStudyTarget] = useState(3);
  const [waterTarget, setWaterTarget] = useState(2500);
  const [sleepTarget, setSleepTarget] = useState(8);

  const handleToggleFocus = (id: string) => {
    setSelectedFocus((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleFinish = () => {
    // Generate starter routines based on selections
    const starterHabits: Array<Omit<Habit, "id" | "streak" | "completedToday">> = [
      { title: "Hydrate: Morning Glass of Water", category: "health", frequency: "Daily", targetCount: 1, icon: "water_drop" },
      { title: `Deep Focus: ${studyTarget} Hours Study`, category: "focus", frequency: "Daily", targetCount: 1, icon: "menu_book" },
      { title: "Active Movement: 30 Min Workout", category: "fitness", frequency: "Daily", targetCount: 1, icon: "fitness_center" },
      { title: "Evening Reflection & Sleep Prep", category: "mindset", frequency: "Daily", targetCount: 1, icon: "bedtime" },
    ];

    onCompleteOnboarding(starterHabits);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-lg">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-[#0F172A] border border-cyan-500/30 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl flex flex-col gap-6 relative overflow-hidden"
          >
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-lg text-white">LifeSync OS Setup</h3>
                  <p className="text-xs text-slate-400">Personalize your life operating system.</p>
                </div>
              </div>

              <span className="text-xs font-mono text-cyan-400 font-bold bg-cyan-500/10 px-2.5 py-1 rounded-xl border border-cyan-500/20">
                Step {step} of 3
              </span>
            </div>

            {/* STEP 1: Focus Selection */}
            {step === 1 && (
              <div className="flex flex-col gap-4">
                <div>
                  <h4 className="text-sm font-bold text-white mb-1">What are you trying to improve?</h4>
                  <p className="text-xs text-slate-400">Select all focus areas that matter to you.</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: "study", label: "Academics / Study", icon: <BookOpen className="w-4 h-4 text-cyan-400" /> },
                    { id: "fitness", label: "Fitness & Strength", icon: <Flame className="w-4 h-4 text-orange-400" /> },
                    { id: "health", label: "Health & Sleep", icon: <Heart className="w-4 h-4 text-purple-400" /> },
                    { id: "mindset", label: "Productivity & Balance", icon: <Target className="w-4 h-4 text-emerald-400" /> },
                  ].map((item) => {
                    const selected = selectedFocus.includes(item.id);
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleToggleFocus(item.id)}
                        className={`p-3.5 rounded-2xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                          selected
                            ? "bg-cyan-500/20 border-cyan-400 text-white shadow-[0_0_12px_rgba(6,182,212,0.25)]"
                            : "bg-white/5 border-white/10 text-slate-400 hover:text-white"
                        }`}
                      >
                        <div className="p-2 rounded-xl bg-white/10">{item.icon}</div>
                        <span className="text-xs font-bold flex-1">{item.label}</span>
                        {selected && <Check className="w-4 h-4 text-cyan-400 shrink-0" />}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => setStep(2)}
                  className="w-full py-3 mt-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 hover:opacity-90 transition cursor-pointer"
                >
                  Continue <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* STEP 2: Targets */}
            {step === 2 && (
              <div className="flex flex-col gap-4">
                <div>
                  <h4 className="text-sm font-bold text-white mb-1">Set your daily target baselines</h4>
                  <p className="text-xs text-slate-400">Configure sensible goals to calculate your Life Score.</p>
                </div>

                <div className="flex flex-col gap-3">
                  <div>
                    <div className="flex justify-between text-xs text-slate-300 font-bold mb-1">
                      <span>Daily Study Target</span>
                      <span className="text-cyan-400 font-mono">{studyTarget} Hours</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="8"
                      value={studyTarget}
                      onChange={(e) => setStudyTarget(Number(e.target.value))}
                      className="w-full accent-cyan-400 cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs text-slate-300 font-bold mb-1">
                      <span>Daily Water Target</span>
                      <span className="text-blue-400 font-mono">{waterTarget} ml</span>
                    </div>
                    <input
                      type="range"
                      min="1500"
                      max="4000"
                      step="250"
                      value={waterTarget}
                      onChange={(e) => setWaterTarget(Number(e.target.value))}
                      className="w-full accent-blue-400 cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs text-slate-300 font-bold mb-1">
                      <span>Daily Sleep Target</span>
                      <span className="text-purple-400 font-mono">{sleepTarget} Hours</span>
                    </div>
                    <input
                      type="range"
                      min="6"
                      max="10"
                      value={sleepTarget}
                      onChange={(e) => setSleepTarget(Number(e.target.value))}
                      className="w-full accent-purple-400 cursor-pointer"
                    />
                  </div>
                </div>

                <div className="flex gap-3 mt-2">
                  <button
                    onClick={() => setStep(1)}
                    className="px-4 py-3 rounded-xl text-xs font-semibold text-slate-300 hover:bg-white/10 transition cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => setStep(3)}
                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 hover:opacity-90 transition cursor-pointer"
                  >
                    Generate Routine <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: Generated Starter Routine */}
            {step === 3 && (
              <div className="flex flex-col gap-4">
                <div>
                  <h4 className="text-sm font-bold text-white mb-1">Your Starter Routine is Ready!</h4>
                  <p className="text-xs text-slate-400">We've configured 4 baseline habit routines tailored for you.</p>
                </div>

                <div className="space-y-2.5">
                  {[
                    "💧 Hydrate: Morning Glass of Water",
                    `📚 Deep Focus: ${studyTarget} Hours Study`,
                    "🔥 Active Movement: 30 Min Workout",
                    "🌙 Evening Reflection & Sleep Prep",
                  ].map((r, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-white/[0.05] border border-cyan-500/30 text-xs font-bold text-white flex items-center justify-between"
                    >
                      <span>{r}</span>
                      <Check className="w-4 h-4 text-emerald-400" />
                    </div>
                  ))}
                </div>

                <button
                  onClick={handleFinish}
                  className="w-full py-3.5 mt-2 rounded-xl bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500 text-white font-black text-xs flex items-center justify-center gap-2 hover:opacity-90 transition cursor-pointer shadow-[0_0_20px_rgba(6,182,212,0.4)]"
                >
                  <Sparkles className="w-4 h-4" /> Launch LifeSync OS
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
