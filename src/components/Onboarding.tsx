"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Zap, 
  Sparkles, 
  ShieldCheck, 
  BookOpen, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft, 
  X,
  Trophy,
  Activity
} from "lucide-react";

interface OnboardingStep {
  title: string;
  badge: string;
  description: string;
  icon: React.ReactNode;
  highlights: string[];
}

const STEPS: OnboardingStep[] = [
  {
    title: "Welcome to LifeSync OS",
    badge: "Personal Operating System",
    description: "LifeSync OS is designed to transform how you track habits, focus, health, and goals — built with forgiving streaks and real-time insights.",
    icon: <Zap className="w-8 h-8 text-cyan-400" />,
    highlights: [
      "Track routines without penalty when life gets busy",
      "Unified Bento-box dashboard with dark-mode glass aesthetics",
      "Earn XP, unlock level milestones, and build long-term consistency",
    ],
  },
  {
    title: "Dynamic Recovery & Vitals",
    badge: "Health Intelligence",
    description: "Monitor sleep, hydration, HRV, and stress levels. LifeSync automatically calculates a dynamic Recovery Score to optimize your daily output.",
    icon: <Activity className="w-8 h-8 text-emerald-400" />,
    highlights: [
      "Smart recovery calculation from sleep & hydration",
      "Real-time health vitals tracking with zero data lag",
      "Integrated meal & macro tracker with quick logging",
    ],
  },
  {
    title: "Forgiving Streaks & XP Rewards",
    badge: "Gamified Consistency",
    description: "Consistency matters more than perfection. Earn +25 XP per habit completed and receive Rest Tokens every 7 days to protect your streak.",
    icon: <Trophy className="w-8 h-8 text-amber-400" />,
    highlights: [
      "Use Rest Tokens when taking a rest day without losing your streak",
      "Level up your profile as you accumulate XP",
      "Swipe or tap to log habits in seconds",
    ],
  },
  {
    title: "Study Studio & Focus Timer",
    badge: "Deep Work Center",
    description: "Supercharge your focus using Pomodoro or custom timers, ambient focus audio, and session focus rating logs.",
    icon: <BookOpen className="w-8 h-8 text-indigo-400" />,
    highlights: [
      "Track study hours and focus scores",
      "Built-in ambient sound generator (white noise, rain, waves)",
      "Detailed weekly focus productivity analytics",
    ],
  },
  {
    title: "You're All Set!",
    badge: "Ready to Begin",
    description: "Start taking control of your daily routines and build a life system that works for you.",
    icon: <ShieldCheck className="w-8 h-8 text-cyan-400" />,
    highlights: [
      "Press Ctrl+K / Cmd+K anytime to open the Command Palette",
      "Log workouts, meals, mood, and sleep with Quick Actions",
      "Theme toggle available in the header menu",
    ],
  },
];

export default function Onboarding() {
  const [open, setOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const completed = localStorage.getItem("lifesync_onboarding_completed");
      if (!completed) {
        setOpen(true);
      }
    }
  }, []);

  const handleFinish = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("lifesync_onboarding_completed", "true");
    }
    setOpen(false);
  };

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      handleFinish();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  if (!open) return null;

  const step = STEPS[currentStep];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -15 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="relative w-full max-w-lg rounded-3xl bg-[#0F172A] border border-cyan-500/30 p-6 sm:p-8 shadow-[0_0_50px_rgba(6,182,212,0.2)] overflow-hidden flex flex-col gap-6"
        >
          {/* Top Glow Accent */}
          <div className="absolute -top-16 -right-16 w-36 h-36 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />

          {/* Header Row */}
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-extrabold uppercase tracking-widest text-cyan-400 bg-cyan-500/10 border border-cyan-500/30 px-3 py-1 rounded-full">
              {step.badge}
            </span>
            <button
              onClick={handleFinish}
              className="text-slate-400 hover:text-white transition p-1.5 rounded-xl hover:bg-white/10 cursor-pointer"
              aria-label="Close tutorial"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Step Icon & Title */}
          <div className="flex items-start gap-4">
            <div className="p-3.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 shrink-0">
              {step.icon}
            </div>
            <div className="flex flex-col gap-1">
              <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                {step.title}
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {step.description}
              </p>
            </div>
          </div>

          {/* Highlight Points */}
          <div className="flex flex-col gap-2.5 bg-slate-900/60 border border-white/5 p-4 rounded-2xl">
            {step.highlights.map((point, idx) => (
              <div key={idx} className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <span className="text-xs text-slate-200 font-medium">{point}</span>
              </div>
            ))}
          </div>

          {/* Progress Indicators & Navigation Controls */}
          <div className="flex items-center justify-between pt-2">
            {/* Step Dots */}
            <div className="flex items-center gap-1.5">
              {STEPS.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentStep(idx)}
                  className={`h-2 rounded-full transition-all cursor-pointer ${
                    idx === currentStep
                      ? "w-6 bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.8)]"
                      : "w-2 bg-slate-700 hover:bg-slate-500"
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>

            {/* Buttons */}
            <div className="flex items-center gap-2">
              {currentStep > 0 && (
                <button
                  onClick={handlePrev}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/10 transition cursor-pointer flex items-center gap-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Back
                </button>
              )}

              <button
                onClick={handleNext}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs shadow-[0_0_20px_rgba(6,182,212,0.4)] transition cursor-pointer flex items-center gap-1.5 active:scale-95"
              >
                <span>{currentStep === STEPS.length - 1 ? "Get Started" : "Next"}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
