"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import type { Goal } from "@/lib/database.types";

interface UpdateProgressModalProps {
  goal: Goal;
  onClose: () => void;
  onSave: (progress: number) => Promise<void>;
}

export default function UpdateProgressModal({
  goal,
  onClose,
  onSave,
}: UpdateProgressModalProps) {
  const [progress, setProgress] = useState<number>(goal.progress ?? 0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setProgress(val);
    setError(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    if (raw === "") {
      setProgress(0);
      return;
    }
    const val = parseInt(raw, 10);
    if (!isNaN(val)) {
      setProgress(Math.min(100, Math.max(0, val)));
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (progress < 0 || progress > 100 || isNaN(progress)) {
      setError("Progress must be between 0% and 100%");
      return;
    }

    setSaving(true);
    try {
      await onSave(progress);
      onClose();
    } catch (err: any) {
      setError(err?.message || "Unable to save progress to database. Please retry.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.96 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl bg-gradient-to-b from-[#181C24] to-[#0F131C] border border-white/15 backdrop-blur-2xl p-6 shadow-2xl text-[#DFE2EE] space-y-6"
      >
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-xl shrink-0">
              {goal.icon || "🎯"}
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-white truncate max-w-[240px]">
                {goal.title}
              </h2>
              <p className="font-mono text-[10px] text-primary tracking-widest uppercase mt-0.5">
                {goal.category} · UPDATE PROGRESS
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Progress Display & Input Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="glass-panel p-5 rounded-xl border border-white/5 flex flex-col items-center justify-center text-center gap-3 bg-slate-900/50">
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
              Current Milestone Progress
            </span>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={0}
                max={100}
                value={progress}
                onChange={handleInputChange}
                className="w-20 text-center text-4xl font-extrabold text-primary bg-white/5 border border-white/10 rounded-xl py-1 outline-none focus:border-primary transition"
              />
              <span className="text-3xl font-extrabold text-primary">%</span>
            </div>

            {/* Slider */}
            <div className="w-full px-2 pt-2">
              <input
                type="range"
                min={0}
                max={100}
                step={1}
                value={progress}
                onChange={handleSliderChange}
                className="w-full accent-[#4cd7f6] cursor-pointer h-2 bg-white/10 rounded-lg appearance-none"
              />
              <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-1">
                <span>0%</span>
                <span>50%</span>
                <span>100%</span>
              </div>
            </div>
          </div>

          {/* Error notice */}
          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs text-center font-medium">
              {error}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="flex-1 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 text-xs font-bold transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-3 rounded-xl bg-gradient-to-r from-primary-container to-primary text-slate-950 text-xs font-extrabold shadow-[0_0_20px_rgba(76,215,246,0.35)] hover:shadow-[0_0_25px_rgba(76,215,246,0.5)] transition active:scale-[0.98] disabled:opacity-50 cursor-pointer"
            >
              {saving ? "Saving…" : "Save Progress"}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
