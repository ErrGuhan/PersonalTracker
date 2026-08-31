"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useLogSleep } from "@/hooks/useSupabase";

interface LogSleepModalProps {
  onClose: () => void;
  onSaved: () => void;
}

export default function LogSleepModal({ onClose, onSaved }: LogSleepModalProps) {
  const { logSleep, saving } = useLogSleep();
  const [form, setForm] = useState({
    hours: 7.5,
    deep_pct: 22,
    rem_pct: 20,
    light_pct: 50,
    awake_pct: 8,
    sleep_date: new Date().toISOString().split("T")[0],
  });
  const [saved, setSaved] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await logSleep({
      hours: Number(form.hours),
      deep_pct: Number(form.deep_pct),
      rem_pct: Number(form.rem_pct),
      light_pct: Number(form.light_pct),
      awake_pct: Number(form.awake_pct),
      sleep_date: form.sleep_date,
    });
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
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 sm:p-6 bg-black/75 backdrop-blur-md"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: "spring", stiffness: 350, damping: 25 }}
        className="w-full max-w-lg rounded-2xl bg-gradient-to-b from-surface-container-high/90 to-surface-dim/95 border-t border-white/10 border-b border-black/40 backdrop-blur-2xl p-5 sm:p-6 shadow-2xl text-on-surface space-y-5"
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold text-on-surface">Log Sleep Session</h2>
            <p className="font-mono text-xs text-tertiary tracking-wider uppercase mt-0.5">CIRCADIAN RHYTHM · RECOVERY</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-white/10 transition-colors"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-mono text-xs text-on-surface-variant uppercase tracking-wider mb-1">
              Total Sleep Duration (Hours)
            </label>
            <input
              type="number"
              step={0.1}
              min={1}
              max={16}
              required
              className="w-full bg-surface-container/60 border-b-2 border-white/10 border-t-0 border-x-0 focus:border-tertiary text-on-surface text-base px-3 py-2.5 outline-none transition-colors font-bold"
              value={form.hours}
              onChange={(e) => setForm({ ...form, hours: Number(e.target.value) })}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-mono text-xs text-on-surface-variant uppercase tracking-wider mb-1">
                Deep Sleep (%)
              </label>
              <input
                type="number"
                min={0}
                max={100}
                className="w-full bg-surface-container/60 border-b-2 border-white/10 border-t-0 border-x-0 focus:border-tertiary text-on-surface text-sm px-3 py-2 outline-none transition-colors"
                value={form.deep_pct}
                onChange={(e) => setForm({ ...form, deep_pct: Number(e.target.value) })}
              />
            </div>
            <div>
              <label className="block font-mono text-xs text-on-surface-variant uppercase tracking-wider mb-1">
                REM Sleep (%)
              </label>
              <input
                type="number"
                min={0}
                max={100}
                className="w-full bg-surface-container/60 border-b-2 border-white/10 border-t-0 border-x-0 focus:border-tertiary text-on-surface text-sm px-3 py-2 outline-none transition-colors"
                value={form.rem_pct}
                onChange={(e) => setForm({ ...form, rem_pct: Number(e.target.value) })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-mono text-xs text-on-surface-variant uppercase tracking-wider mb-1">
                Light Sleep (%)
              </label>
              <input
                type="number"
                min={0}
                max={100}
                className="w-full bg-surface-container/60 border-b-2 border-white/10 border-t-0 border-x-0 focus:border-tertiary text-on-surface text-sm px-3 py-2 outline-none transition-colors"
                value={form.light_pct}
                onChange={(e) => setForm({ ...form, light_pct: Number(e.target.value) })}
              />
            </div>
            <div>
              <label className="block font-mono text-xs text-on-surface-variant uppercase tracking-wider mb-1">
                Awake (%)
              </label>
              <input
                type="number"
                min={0}
                max={100}
                className="w-full bg-surface-container/60 border-b-2 border-white/10 border-t-0 border-x-0 focus:border-tertiary text-on-surface text-sm px-3 py-2 outline-none transition-colors"
                value={form.awake_pct}
                onChange={(e) => setForm({ ...form, awake_pct: Number(e.target.value) })}
              />
            </div>
          </div>

          <div>
            <label className="block font-mono text-xs text-on-surface-variant uppercase tracking-wider mb-1">
              Sleep Date
            </label>
            <input
              type="date"
              className="w-full bg-surface-container/60 border-b-2 border-white/10 border-t-0 border-x-0 focus:border-tertiary text-on-surface text-sm px-3 py-2.5 outline-none transition-colors"
              value={form.sleep_date}
              onChange={(e) => setForm({ ...form, sleep_date: e.target.value })}
            />
          </div>

          <button
            type="submit"
            disabled={saving || saved}
            className={`w-full py-3.5 rounded-xl font-semibold text-sm transition-all duration-200 shadow-[0_0_20px_rgba(179,149,255,0.3)] active:scale-[0.98] ${
              saved
                ? "bg-emerald-500 text-white"
                : "bg-gradient-to-r from-tertiary-container to-tertiary text-slate-950 font-bold hover:shadow-[0_0_30px_rgba(179,149,255,0.5)]"
            }`}
          >
            {saved ? "✓ Sleep Session Saved!" : saving ? "Saving…" : "Save Sleep Log"}
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
}
