"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useLogStudySession } from "@/hooks/useSupabase";

interface LogStudyModalProps {
  onClose: () => void;
  onSaved: () => void;
}

const SUBJECTS = [
  "Advanced Mathematics",
  "Computer Science",
  "Physics & Mechanics",
  "Economics",
  "Literature",
  "History",
  "Other",
];

export default function LogStudyModal({ onClose, onSaved }: LogStudyModalProps) {
  const { logSession, saving } = useLogStudySession();
  const [subject, setSubject] = useState("Computer Science");
  const [durationMin, setDurationMin] = useState(25);
  const [focusScore, setFocusScore] = useState(85);
  const [saved, setSaved] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await logSession(subject, durationMin, focusScore);
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
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 sm:p-6 bg-black/70 backdrop-blur-md"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: "spring", stiffness: 350, damping: 25 }}
        className="w-full max-w-lg rounded-2xl bg-gradient-to-b from-surface-container-high/90 to-surface-dim/95 border-t border-white/10 border-b border-black/40 backdrop-blur-2xl p-5 sm:p-6 shadow-[0_16px_48px_rgba(0,0,0,0.6)] text-on-surface space-y-5"
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold text-on-surface">Log Study Session</h2>
            <p className="font-mono text-xs text-primary tracking-wider uppercase mt-0.5">STUDY STUDIO · NEW ENTRY</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-white/10 transition-colors"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Subject */}
          <div>
            <label className="block font-mono text-xs text-on-surface-variant uppercase tracking-wider mb-2">
              Subject Module
            </label>
            <div className="flex flex-wrap gap-2">
              {SUBJECTS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSubject(s)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                    subject === s
                      ? "border-primary bg-primary/15 text-primary shadow-[0_0_12px_rgba(76,215,246,0.3)]"
                      : "border-white/10 bg-white/5 text-on-surface-variant hover:border-white/20 hover:text-on-surface"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Duration */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="font-mono text-xs text-on-surface-variant uppercase tracking-wider">
                Duration (mins)
              </label>
              <span className="font-bold text-sm text-primary">{durationMin} mins</span>
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
            <div className="flex justify-between text-[10px] text-on-surface-variant mt-1 font-mono">
              <span>5m</span>
              <span>60m</span>
              <span>120m</span>
              <span>240m</span>
            </div>
          </div>

          {/* Focus Score */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="font-mono text-xs text-on-surface-variant uppercase tracking-wider">
                Focus Intensity
              </label>
              <span className="font-bold text-sm text-primary">{focusScore}%</span>
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
          </div>

          <button
            type="submit"
            disabled={saving || saved}
            className={`w-full py-3.5 rounded-xl font-semibold text-sm transition-all duration-200 shadow-[0_0_20px_rgba(76,215,246,0.3)] active:scale-[0.98] ${
              saved
                ? "bg-emerald-500 text-white"
                : "bg-gradient-to-r from-primary-container to-primary text-on-primary font-bold hover:shadow-[0_0_30px_rgba(76,215,246,0.5)]"
            }`}
          >
            {saved ? "✓ Session Logged!" : saving ? "Saving to Supabase…" : "Save Study Session"}
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
}
