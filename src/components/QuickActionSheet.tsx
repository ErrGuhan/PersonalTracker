"use client";

import { motion, AnimatePresence } from "framer-motion";
import { 
  X, 
  BookOpen, 
  Flame, 
  Droplet, 
  Utensils, 
  Moon, 
  CheckCircle2, 
  Smile, 
  Activity,
  Plus
} from "lucide-react";

interface QuickActionSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAction: (actionType: string) => void;
}

const QUICK_ACTIONS = [
  { id: "study", label: "Log Study", icon: <BookOpen className="w-5 h-5 text-cyan-400" />, desc: "Focus timer or study log" },
  { id: "workout", label: "Log Workout", icon: <Flame className="w-5 h-5 text-orange-400" />, desc: "Exercise or cardio session" },
  { id: "water", label: "Drink Water", icon: <Droplet className="w-5 h-5 text-blue-400" />, desc: "+250ml quick hydration" },
  { id: "meal", label: "Log Meal", icon: <Utensils className="w-5 h-5 text-amber-400" />, desc: "Track calories & macros" },
  { id: "sleep", label: "Log Sleep", icon: <Moon className="w-5 h-5 text-purple-400" />, desc: "Sleep duration & quality" },
  { id: "habit", label: "Add Habit", icon: <CheckCircle2 className="w-5 h-5 text-emerald-400" />, desc: "New daily routine" },
  { id: "mood", label: "Log Mood", icon: <Smile className="w-5 h-5 text-pink-400" />, desc: "Daily emotional check-in" },
  { id: "vitals", label: "Health Vitals", icon: <Activity className="w-5 h-5 text-rose-400" />, desc: "Heart rate, HRV & vitals" },
];

export default function QuickActionSheet({ isOpen, onClose, onSelectAction }: QuickActionSheetProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/80 backdrop-blur-md">
          {/* Backdrop Tap to Dismiss */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0"
          />

          {/* Quick Action Sheet Container */}
          <motion.div
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", stiffness: 350, damping: 30 }}
            className="relative z-10 w-full sm:max-w-lg bg-[#0F172A] border border-white/10 rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl flex flex-col gap-5 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-white tracking-tight">Quick Action Log</h3>
                  <p className="text-xs text-slate-400">Record any activity in 1–2 taps.</p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/10 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Actions Grid */}
            <div className="grid grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto pr-1">
              {QUICK_ACTIONS.map((act) => (
                <motion.button
                  key={act.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => {
                    if (typeof window !== "undefined" && navigator.vibrate) {
                      navigator.vibrate(30);
                    }
                    onSelectAction(act.id);
                    onClose();
                  }}
                  className="glass-secondary p-3.5 rounded-2xl border border-white/10 hover:border-cyan-500/40 text-left flex flex-col justify-between gap-2 cursor-pointer transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <div className="p-2 rounded-xl bg-white/[0.05] group-hover:bg-white/10 transition">
                      {act.icon}
                    </div>
                    <span className="text-[10px] font-mono text-cyan-400 opacity-0 group-hover:opacity-100 transition">
                      + Log
                    </span>
                  </div>

                  <div>
                    <h4 className="font-bold text-xs text-white group-hover:text-cyan-300 transition">{act.label}</h4>
                    <p className="text-[10px] text-slate-400 line-clamp-1">{act.desc}</p>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
