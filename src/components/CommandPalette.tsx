"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Dumbbell,
  Activity,
  Utensils,
  BookOpen,
  CalendarCheck,
  Target,
  Moon,
  PlusCircle,
  Download,
  RotateCcw,
  Droplet,
  Search,
} from "lucide-react";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectNav: (tab: string) => void;
  onOpenWorkoutModal: () => void;
  onOpenStudyModal: () => void;
  onOpenSleepModal: () => void;
  onOpenVitalsModal: () => void;
  onOpenNutritionModal: () => void;
  onOpenGoalModal: () => void;
  onExportData: () => void;
  onResetData: () => void;
  onShowToast: (msg: string) => void;
}

export default function CommandPalette({
  isOpen,
  onClose,
  onSelectNav,
  onOpenWorkoutModal,
  onOpenStudyModal,
  onOpenSleepModal,
  onOpenVitalsModal,
  onOpenNutritionModal,
  onOpenGoalModal,
  onExportData,
  onResetData,
  onShowToast,
}: CommandPaletteProps) {
  const [query, setQuery] = useState("");

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (isOpen) onClose();
        else setQuery("");
      }
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const COMMANDS = [
    { id: "dashboard", label: "Go to Main Dashboard", category: "NAVIGATION", icon: LayoutDashboard, action: () => { onSelectNav("/"); onClose(); } },
    { id: "health", label: "Open Health Analytics", category: "NAVIGATION", icon: Activity, action: () => { onSelectNav("/health"); onClose(); } },
    { id: "study", label: "Open Study Studio", category: "NAVIGATION", icon: BookOpen, action: () => { onSelectNav("/study"); onClose(); } },
    { id: "fitness", label: "Open Fitness Hub", category: "NAVIGATION", icon: Dumbbell, action: () => { onSelectNav("/fit"); onClose(); } },
    { id: "routines", label: "Open Routines & Habits", category: "NAVIGATION", icon: CalendarCheck, action: () => { onSelectNav("/habits"); onClose(); } },
    { id: "nutrition", label: "Open Hydration & Nutrition", category: "NAVIGATION", icon: Utensils, action: () => { onSelectNav("/fuel"); onClose(); } },
    { id: "goals", label: "View Milestones & Goals", category: "NAVIGATION", icon: Target, action: () => { onSelectNav("/goals"); onClose(); } },

    { id: "log-workout", label: "Log Workout Activity", category: "LOGGING", icon: Dumbbell, action: () => { onClose(); onOpenWorkoutModal(); } },
    { id: "log-study", label: "Log Study Session", category: "LOGGING", icon: BookOpen, action: () => { onClose(); onOpenStudyModal(); } },
    { id: "log-sleep", label: "Log Sleep & Circadian Stage", category: "LOGGING", icon: Moon, action: () => { onClose(); onOpenSleepModal(); } },
    { id: "log-vitals", label: "Log Health Vitals & HR/HRV", category: "LOGGING", icon: Activity, action: () => { onClose(); onOpenVitalsModal(); } },
    { id: "log-meal", label: "Log Meal & Macros", category: "LOGGING", icon: Utensils, action: () => { onClose(); onOpenNutritionModal(); } },
    { id: "create-goal", label: "Create Milestone Goal", category: "LOGGING", icon: Target, action: () => { onClose(); onOpenGoalModal(); } },

    { id: "export-data", label: "Export Full Personal Data Backup (JSON)", category: "SYSTEM", icon: Download, action: () => { onClose(); onExportData(); } },
    { id: "reset-data", label: "Reset Baseline Demo Dataset", category: "SYSTEM", icon: RotateCcw, action: () => { onClose(); onResetData(); } },
    { id: "log-water", label: "Quick Hydration Boost (+500ml)", category: "ACTIONS", icon: Droplet, action: () => { onClose(); onShowToast("💧 Hydration logged: +500ml water!"); } },
  ];

  const filtered = COMMANDS.filter(
    (c) =>
      c.label.toLowerCase().includes(query.toLowerCase()) ||
      c.category.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/80 backdrop-blur-xl"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -16 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          className="w-full max-w-xl rounded-3xl liquid-glass border border-white/[0.12] shadow-[0_24px_64px_rgba(0,0,0,0.85)] overflow-hidden"
        >
          {/* Input Header */}
          <div className="flex items-center gap-3 px-4 py-3.5 border-b border-white/[0.08] bg-white/[0.02]">
            <Search className="w-4 h-4 text-cyan-400 shrink-0" />
            <input
              autoFocus
              className="w-full bg-transparent text-white text-sm placeholder-slate-400 outline-none font-medium"
              placeholder="Search actions, views, logs (e.g. Workout, Sleep, Meal, Goals)..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <span className="text-[10px] font-mono text-slate-400 bg-white/[0.06] px-2 py-0.5 rounded-md border border-white/[0.08]">
              ESC
            </span>
          </div>

          {/* Command List */}
          <div className="max-h-80 overflow-y-auto p-2 space-y-1">
            {filtered.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-8 font-mono">No matching commands found.</p>
            ) : (
              filtered.map((cmd) => {
                const IconComponent = cmd.icon;
                return (
                  <button
                    key={cmd.id}
                    onClick={cmd.action}
                    className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl hover:bg-cyan-500/10 hover:border-cyan-500/20 border border-transparent transition-all text-left group cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg bg-white/[0.04] group-hover:bg-cyan-500/20 flex items-center justify-center text-slate-400 group-hover:text-cyan-300 transition-colors">
                        <IconComponent className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-xs sm:text-sm font-medium text-white group-hover:text-cyan-300 transition-colors">
                        {cmd.label}
                      </span>
                    </div>
                    <span className="text-[9px] font-mono uppercase text-slate-400 bg-white/[0.04] px-2 py-0.5 rounded-md group-hover:border-cyan-500/30 border border-transparent transition-colors">
                      {cmd.category}
                    </span>
                  </button>
                );
              })
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
