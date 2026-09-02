"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useLogSleep } from "@/hooks/useSupabase";
import type { SleepLog } from "@/lib/database.types";

interface LogSleepModalProps {
  onClose: () => void;
  onSaved: (record?: Omit<SleepLog, "id" | "user_id" | "created_at">) => void;
}

export default function LogSleepModal({ onClose, onSaved }: LogSleepModalProps) {
  const { logSleep, saving } = useLogSleep();
  const [form, setForm] = useState({
    bedtime: "23:00",
    wake_time: "07:15",
    hours: 8.2,
    quality: 4,
    rested_rating: 4,
    deep_pct: 22,
    rem_pct: 20,
    light_pct: 50,
    awake_pct: 8,
    notes: "",
    sleep_date: new Date().toISOString().split("T")[0],
  });
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Recalculate duration automatically when bedtime or wake time change
  const handleTimeChange = (type: "bedtime" | "wake_time", val: string) => {
    const updated = { ...form, [type]: val };
    try {
      const [bHours, bMins] = updated.bedtime.split(":").map(Number);
      const [wHours, wMins] = updated.wake_time.split(":").map(Number);

      let diffMinutes = wHours * 60 + wMins - (bHours * 60 + bMins);
      if (diffMinutes < 0) {
        diffMinutes += 24 * 60; // crossed midnight
      }

      const calculatedHours = Number((diffMinutes / 60).toFixed(1));
      if (calculatedHours > 0 && calculatedHours <= 18) {
        updated.hours = calculatedHours;
      }
    } catch {
      // Keep existing manual hours if parsing fails
    }
    setForm(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.hours <= 0 || form.hours > 18) {
      setError("Please enter a valid sleep duration between 1 and 18 hours.");
      return;
    }

    const payload = {
      hours: Number(form.hours),
      deep_pct: Number(form.deep_pct),
      rem_pct: Number(form.rem_pct),
      light_pct: Number(form.light_pct),
      awake_pct: Number(form.awake_pct),
      sleep_date: form.sleep_date,
      bedtime: form.bedtime,
      wake_time: form.wake_time,
      quality: Number(form.quality),
      rested_rating: Number(form.rested_rating),
      notes: form.notes.trim() || null,
    };

    await logSleep(payload);
    setSaved(true);
    setTimeout(() => {
      onSaved(payload);
      onClose();
    }, 600);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-[120] flex items-center justify-center bg-black/70 backdrop-blur-md p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="w-full max-w-md max-h-[85vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [scrollbar-width:none] rounded-2xl sm:rounded-3xl bg-surface-dim/95 border border-white/15 backdrop-blur-2xl p-5 sm:p-6 shadow-2xl text-on-surface space-y-5"
      >
        <div className="flex items-center justify-between border-b border-white/5 pb-3">
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold text-white">Log Sleep Session</h2>
            <p className="font-mono text-xs text-tertiary tracking-wider uppercase mt-0.5">
              CIRCADIAN RHYTHM · RECOVERY
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-error/15 border border-error/30 text-error text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Bedtime and Wake Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-mono text-[10px] text-on-surface-variant uppercase tracking-wider mb-1">
                Bedtime
              </label>
              <input
                type="time"
                required
                className="w-full bg-surface-container-high/60 border border-white/10 rounded-xl text-white text-sm px-3 py-2 outline-none focus:border-tertiary transition-colors font-mono"
                value={form.bedtime}
                onChange={(e) => handleTimeChange("bedtime", e.target.value)}
              />
            </div>

            <div>
              <label className="block font-mono text-[10px] text-on-surface-variant uppercase tracking-wider mb-1">
                Wake Time
              </label>
              <input
                type="time"
                required
                className="w-full bg-surface-container-high/60 border border-white/10 rounded-xl text-white text-sm px-3 py-2 outline-none focus:border-tertiary transition-colors font-mono"
                value={form.wake_time}
                onChange={(e) => handleTimeChange("wake_time", e.target.value)}
              />
            </div>
          </div>

          {/* Total Duration */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="font-mono text-[10px] text-on-surface-variant uppercase tracking-wider">
                Total Sleep Duration (Hours)
              </label>
              <span className="text-xs font-bold text-tertiary font-mono">
                {form.hours} hrs
              </span>
            </div>
            <input
              type="number"
              step={0.1}
              min={1}
              max={18}
              required
              className="w-full bg-surface-container-high/60 border border-white/10 rounded-xl text-white text-base px-3 py-2 outline-none focus:border-tertiary transition-colors font-bold"
              value={form.hours}
              onChange={(e) => setForm({ ...form, hours: Number(e.target.value) })}
            />
          </div>

          {/* Quality and Rested Feeling Ratings */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-mono text-[10px] text-on-surface-variant uppercase tracking-wider mb-1">
                Sleep Quality
              </label>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setForm({ ...form, quality: star })}
                    className={`flex-1 py-1.5 rounded-lg font-mono text-xs font-bold transition-all cursor-pointer ${
                      form.quality >= star
                        ? "bg-tertiary text-slate-950 shadow-[0_0_8px_rgba(179,149,255,0.4)]"
                        : "bg-surface-container-high/40 text-on-surface-variant hover:bg-white/10"
                    }`}
                  >
                    {star}★
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block font-mono text-[10px] text-on-surface-variant uppercase tracking-wider mb-1">
                Rested Feeling
              </label>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setForm({ ...form, rested_rating: lvl })}
                    className={`flex-1 py-1.5 rounded-lg font-mono text-xs font-bold transition-all cursor-pointer ${
                      form.rested_rating >= lvl
                        ? "bg-emerald-400 text-slate-950 shadow-[0_0_8px_rgba(52,211,153,0.4)]"
                        : "bg-surface-container-high/40 text-on-surface-variant hover:bg-white/10"
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Sleep Stages (Collapsible or compact) */}
          <div className="p-3 rounded-xl bg-surface-container/40 border border-white/5 space-y-2">
            <span className="font-mono text-[10px] text-on-surface-variant uppercase tracking-wider block">
              ESTIMATED STAGE BREAKDOWN (%)
            </span>
            <div className="grid grid-cols-4 gap-2">
              <div>
                <span className="text-[10px] font-mono text-on-surface-variant">Deep</span>
                <input
                  type="number"
                  min={0}
                  max={100}
                  className="w-full bg-surface-container-high/80 rounded-lg text-white text-xs px-2 py-1 font-mono outline-none border border-white/5"
                  value={form.deep_pct}
                  onChange={(e) => setForm({ ...form, deep_pct: Number(e.target.value) })}
                />
              </div>
              <div>
                <span className="text-[10px] font-mono text-on-surface-variant">REM</span>
                <input
                  type="number"
                  min={0}
                  max={100}
                  className="w-full bg-surface-container-high/80 rounded-lg text-white text-xs px-2 py-1 font-mono outline-none border border-white/5"
                  value={form.rem_pct}
                  onChange={(e) => setForm({ ...form, rem_pct: Number(e.target.value) })}
                />
              </div>
              <div>
                <span className="text-[10px] font-mono text-on-surface-variant">Light</span>
                <input
                  type="number"
                  min={0}
                  max={100}
                  className="w-full bg-surface-container-high/80 rounded-lg text-white text-xs px-2 py-1 font-mono outline-none border border-white/5"
                  value={form.light_pct}
                  onChange={(e) => setForm({ ...form, light_pct: Number(e.target.value) })}
                />
              </div>
              <div>
                <span className="text-[10px] font-mono text-on-surface-variant">Awake</span>
                <input
                  type="number"
                  min={0}
                  max={100}
                  className="w-full bg-surface-container-high/80 rounded-lg text-white text-xs px-2 py-1 font-mono outline-none border border-white/5"
                  value={form.awake_pct}
                  onChange={(e) => setForm({ ...form, awake_pct: Number(e.target.value) })}
                />
              </div>
            </div>
          </div>

          {/* Optional Notes */}
          <div>
            <label className="block font-mono text-[10px] text-on-surface-variant uppercase tracking-wider mb-1">
              Optional Notes (Caffeine, Stress, Environment)
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Cold room, no screen time before bed, woke up feeling refreshed."
              className="w-full bg-surface-container-high/60 border border-white/10 rounded-xl text-white text-xs px-3 py-2 outline-none focus:border-tertiary transition-colors resize-none placeholder-on-surface-variant/50"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </div>

          {/* Date */}
          <div>
            <label className="block font-mono text-[10px] text-on-surface-variant uppercase tracking-wider mb-1">
              Sleep Date
            </label>
            <input
              type="date"
              className="w-full bg-surface-container-high/60 border border-white/10 rounded-xl text-white text-xs px-3 py-2 outline-none focus:border-tertiary transition-colors font-mono"
              value={form.sleep_date}
              onChange={(e) => setForm({ ...form, sleep_date: e.target.value })}
            />
          </div>

          <button
            type="submit"
            disabled={saving || saved}
            className={`w-full py-3.5 rounded-xl font-semibold text-sm transition-all duration-200 shadow-[0_0_20px_rgba(179,149,255,0.3)] active:scale-[0.98] cursor-pointer ${
              saved
                ? "bg-emerald-500 text-white"
                : "bg-gradient-to-r from-tertiary-container to-tertiary text-slate-950 font-bold hover:shadow-[0_0_30px_rgba(179,149,255,0.5)]"
            }`}
          >
            {saved ? "✓ Sleep Session Saved!" : saving ? "Saving & Recalculating Recovery..." : "Save Sleep Log"}
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
}
