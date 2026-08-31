"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

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
    { id: "dashboard", label: "Go to Main Dashboard", category: "NAVIGATION", icon: "dashboard", action: () => { onSelectNav("dashboard"); onClose(); } },
    { id: "study", label: "Open Study Studio", category: "NAVIGATION", icon: "menu_book", action: () => { onSelectNav("study"); onClose(); } },
    { id: "fitness", label: "Open Fitness Hub", category: "NAVIGATION", icon: "fitness_center", action: () => { onSelectNav("fitness"); onClose(); } },
    { id: "health", label: "Open Health Analytics", category: "NAVIGATION", icon: "ecg_heart", action: () => { onSelectNav("health"); onClose(); } },
    { id: "routines", label: "Open Routines & Habits", category: "NAVIGATION", icon: "published_with_changes", action: () => { onSelectNav("routines"); onClose(); } },
    { id: "nutrition", label: "Open Hydration & Nutrition", category: "NAVIGATION", icon: "restaurant", action: () => { onSelectNav("nutrition"); onClose(); } },
    { id: "goals", label: "View Milestones & Goals", category: "NAVIGATION", icon: "insights", action: () => { onSelectNav("goals"); onClose(); } },

    { id: "log-workout", label: "Log Workout Activity", category: "LOGGING", icon: "add_task", action: () => { onClose(); onOpenWorkoutModal(); } },
    { id: "log-study", label: "Log Study Session", category: "LOGGING", icon: "local_library", action: () => { onClose(); onOpenStudyModal(); } },
    { id: "log-sleep", label: "Log Sleep & Circadian Stage", category: "LOGGING", icon: "bedtime", action: () => { onClose(); onOpenSleepModal(); } },
    { id: "log-vitals", label: "Log Health Vitals & HR/HRV", category: "LOGGING", icon: "monitor_heart", action: () => { onClose(); onOpenVitalsModal(); } },
    { id: "log-meal", label: "Log Meal & Macros", category: "LOGGING", icon: "lunch_dining", action: () => { onClose(); onOpenNutritionModal(); } },
    { id: "create-goal", label: "Create Milestone Goal", category: "LOGGING", icon: "flag", action: () => { onClose(); onOpenGoalModal(); } },

    { id: "export-data", label: "Export Full Personal Data Backup (JSON)", category: "SYSTEM", icon: "download", action: () => { onClose(); onExportData(); } },
    { id: "reset-data", label: "Reset Baseline Demo Dataset", category: "SYSTEM", icon: "restart_alt", action: () => { onClose(); onResetData(); } },
    { id: "log-water", label: "Quick Hydration Boost (+500ml)", category: "ACTIONS", icon: "water_drop", action: () => { onClose(); onShowToast("💧 Hydration logged: +500ml water!"); } },
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
        className="fixed inset-0 z-[100] flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/75 backdrop-blur-md"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          className="w-full max-w-xl rounded-2xl bg-surface-dim/95 border border-white/15 shadow-[0_16px_48px_rgba(0,0,0,0.8)] overflow-hidden"
        >
          {/* Input Header */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10 bg-surface-container/40">
            <span className="material-symbols-outlined text-primary text-xl">search</span>
            <input
              autoFocus
              className="w-full bg-transparent text-on-surface text-sm placeholder-on-surface-variant outline-none font-medium"
              placeholder="Type a command or search (e.g. Workout, Sleep, Meal, Goals)..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <span className="text-[10px] font-mono text-on-surface-variant bg-white/10 px-2 py-0.5 rounded border border-white/10">
              ESC
            </span>
          </div>

          {/* Command List */}
          <div className="max-h-80 overflow-y-auto p-2 space-y-1">
            {filtered.length === 0 ? (
              <p className="text-xs text-on-surface-variant text-center py-6">No matching commands found.</p>
            ) : (
              filtered.map((cmd) => (
                <button
                  key={cmd.id}
                  onClick={cmd.action}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-primary/10 hover:text-primary transition-all text-left group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary text-lg">
                      {cmd.icon}
                    </span>
                    <span className="text-xs sm:text-sm font-semibold text-on-surface group-hover:text-primary">
                      {cmd.label}
                    </span>
                  </div>
                  <span className="text-[9px] font-mono uppercase text-on-surface-variant bg-white/5 px-2 py-0.5 rounded group-hover:border-primary/30 border border-transparent">
                    {cmd.category}
                  </span>
                </button>
              ))
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
