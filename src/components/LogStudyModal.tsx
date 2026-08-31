"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useLogStudySession } from "@/hooks/useSupabase";

interface LogStudyModalProps {
  onClose: () => void;
  onSaved: () => void;
}

const QUICK_CHIPS = [
  "Java Core Concepts",
  "LeetCode Arrays",
  "Quantitative Aptitude",
  "Distributed Systems",
  "DBMS & SQL",
];

export default function LogStudyModal({ onClose, onSaved }: LogStudyModalProps) {
  const { logSession, saving } = useLogStudySession();

  // State Management
  const [subject, setSubject] = useState("");
  const [durationMin, setDurationMin] = useState(45);
  const [focusScore, setFocusScore] = useState(85);
  const [saved, setSaved] = useState(false);

  /* ─────────────────────────────────────────────────────────
     1. SUPABASE MUTATION SUBMISSION
     ───────────────────────────────────────────────────────── */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim()) return;

    // Inserts row into study_sessions / study_logs Supabase table
    await logSession(subject.trim(), durationMin, focusScore);
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
        className="w-full max-w-lg max-h-[85vh] flex flex-col rounded-2xl bg-gradient-to-b from-surface-container-high/95 to-surface-dim/98 border border-white/15 backdrop-blur-2xl p-5 sm:p-6 shadow-[0_20px_50px_rgba(0,0,0,0.8)] text-on-surface overflow-hidden relative"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                menu_book
              </span>
              <h2 className="text-lg sm:text-xl font-extrabold text-white">Log Study Session</h2>
            </div>
            <p className="font-mono text-[10px] text-primary tracking-wider uppercase mt-0.5">
              STUDY STUDIO · DEEP FOCUS ENTRY
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:text-white hover:bg-white/10 transition"
          >
            ✕
          </button>
        </div>

        {/* Scrollable Container with Bottom Padding Fix (pb-8) */}
        <div className="overflow-y-auto pr-1 flex-1 space-y-5 pt-4 pb-8 no-scrollbar">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Controlled Text Input for Subject */}
            <div>
              <label className="block font-mono text-xs text-on-surface-variant uppercase tracking-wider mb-1">
                Subject / Module Name
              </label>
              <input
                type="text"
                required
                placeholder="e.g., Java Core Concepts, LeetCode Arrays, or Quantitative Aptitude"
                className="w-full bg-surface-container/70 border border-white/15 rounded-xl text-white text-sm px-3.5 py-3 outline-none focus:border-primary transition shadow-inner placeholder:text-white/30"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />

              {/* Quick Topic Chips */}
              <div className="flex flex-wrap gap-1.5 mt-2.5">
                {QUICK_CHIPS.map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => setSubject(chip)}
                    className="text-[11px] px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-on-surface-variant hover:border-primary/50 hover:bg-primary/10 hover:text-primary transition"
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>

            {/* Duration Slider */}
            <div className="bg-surface-container-low/60 p-4 rounded-xl border border-white/10 space-y-2">
              <div className="flex items-center justify-between">
                <label className="font-mono text-xs text-on-surface-variant uppercase tracking-wider">
                  Session Duration
                </label>
                <span className="font-bold text-sm text-primary font-mono">{durationMin} mins</span>
              </div>
              <input
                type="range"
                min={5}
                max={240}
                step={5}
                value={durationMin}
                onChange={(e) => setDurationMin(Number(e.target.value))}
                className="w-full accent-primary bg-white/10 h-2 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-on-surface-variant font-mono">
                <span>5m</span>
                <span>45m</span>
                <span>90m</span>
                <span>180m</span>
                <span>240m</span>
              </div>
            </div>

            {/* Focus Intensity Slider */}
            <div className="bg-surface-container-low/60 p-4 rounded-xl border border-white/10 space-y-2">
              <div className="flex items-center justify-between">
                <label className="font-mono text-xs text-on-surface-variant uppercase tracking-wider">
                  Focus Intensity
                </label>
                <span className="font-bold text-sm text-primary font-mono">{focusScore}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                step={1}
                value={focusScore}
                onChange={(e) => setFocusScore(Number(e.target.value))}
                className="w-full accent-primary bg-white/10 h-2 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-on-surface-variant font-mono">
                <span>Low</span>
                <span>Moderate</span>
                <span>Flow State (90%+)</span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={saving || saved || !subject.trim()}
              className={`w-full py-3.5 rounded-xl font-bold text-xs sm:text-sm transition-all duration-200 shadow-[0_0_20px_rgba(76,215,246,0.3)] active:scale-[0.98] disabled:opacity-50 ${
                saved
                  ? "bg-emerald-500 text-white"
                  : "bg-gradient-to-r from-primary-container via-primary to-cyan-400 text-slate-950 hover:shadow-[0_0_30px_rgba(76,215,246,0.5)] cursor-pointer"
              }`}
            >
              {saved ? "✓ Study Session Tracked to Supabase!" : saving ? "Saving to Supabase…" : "Save Study Session"}
            </button>
          </form>
        </div>
      </motion.div>
    </motion.div>
  );
}
