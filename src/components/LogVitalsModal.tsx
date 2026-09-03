"use client";

import { useState } from "react";
import { useLogVitals } from "@/hooks/useSupabase";

interface LogVitalsModalProps {
  onClose: () => void;
  onSaved: () => void;
}

export default function LogVitalsModal({ onClose, onSaved }: LogVitalsModalProps) {
  const { logVitals, saving } = useLogVitals();
  const [form, setForm] = useState({
    heart_rate: 65,
    hrv_ms: 72,
    spo2: 99,
    body_temp: 36.6,
    stress_pct: 22,
    recovery_score: 88,
  });
  const [saved, setSaved] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await logVitals({
      heart_rate: Number(form.heart_rate),
      hrv_ms: Number(form.hrv_ms),
      spo2: Number(form.spo2),
      body_temp: Number(form.body_temp),
      stress_pct: Number(form.stress_pct),
      recovery_score: Number(form.recovery_score),
    });
    setSaved(true);
    onSaved();
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/65 p-0 sm:p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="modal-enter w-full max-w-md max-h-[88vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [scrollbar-width:none] rounded-t-2xl sm:rounded-2xl bg-gradient-to-b from-surface-container-high/90 to-surface-dim/95 border border-white/15 backdrop-blur-2xl p-5 sm:p-6 shadow-2xl text-on-surface space-y-5"
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold text-on-surface">Log Health Vitals</h2>
            <p className="font-mono text-xs text-primary tracking-wider uppercase mt-0.5">BIOMETRIC SYNC · RECOVERY</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-white/10 transition-colors"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-mono text-xs text-on-surface-variant uppercase tracking-wider mb-1">
                Resting Heart Rate (bpm)
              </label>
              <input
                type="number"
                min={30}
                max={220}
                required
                className="w-full bg-surface-container/60 border-b-2 border-white/10 border-t-0 border-x-0 focus:border-primary text-on-surface text-sm px-3 py-2 outline-none font-bold"
                value={form.heart_rate}
                onChange={(e) => setForm({ ...form, heart_rate: Number(e.target.value) })}
              />
            </div>

            <div>
              <label className="block font-mono text-xs text-on-surface-variant uppercase tracking-wider mb-1">
                HRV (ms)
              </label>
              <input
                type="number"
                min={10}
                max={250}
                required
                className="w-full bg-surface-container/60 border-b-2 border-white/10 border-t-0 border-x-0 focus:border-primary text-on-surface text-sm px-3 py-2 outline-none font-bold"
                value={form.hrv_ms}
                onChange={(e) => setForm({ ...form, hrv_ms: Number(e.target.value) })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-mono text-xs text-on-surface-variant uppercase tracking-wider mb-1">
                SpO₂ Oxygen (%)
              </label>
              <input
                type="number"
                min={80}
                max={100}
                className="w-full bg-surface-container/60 border-b-2 border-white/10 border-t-0 border-x-0 focus:border-primary text-on-surface text-sm px-3 py-2 outline-none"
                value={form.spo2}
                onChange={(e) => setForm({ ...form, spo2: Number(e.target.value) })}
              />
            </div>

            <div>
              <label className="block font-mono text-xs text-on-surface-variant uppercase tracking-wider mb-1">
                Body Temp (°C)
              </label>
              <input
                type="number"
                step={0.1}
                min={35}
                max={42}
                className="w-full bg-surface-container/60 border-b-2 border-white/10 border-t-0 border-x-0 focus:border-primary text-on-surface text-sm px-3 py-2 outline-none"
                value={form.body_temp}
                onChange={(e) => setForm({ ...form, body_temp: Number(e.target.value) })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-mono text-xs text-on-surface-variant uppercase tracking-wider mb-1">
                Stress Level (%)
              </label>
              <input
                type="number"
                min={0}
                max={100}
                className="w-full bg-surface-container/60 border-b-2 border-white/10 border-t-0 border-x-0 focus:border-primary text-on-surface text-sm px-3 py-2 outline-none"
                value={form.stress_pct}
                onChange={(e) => setForm({ ...form, stress_pct: Number(e.target.value) })}
              />
            </div>

            <div>
              <label className="block font-mono text-xs text-on-surface-variant uppercase tracking-wider mb-1">
                Recovery Score (0–100)
              </label>
              <input
                type="number"
                min={0}
                max={100}
                className="w-full bg-surface-container/60 border-b-2 border-white/10 border-t-0 border-x-0 focus:border-primary text-on-surface text-sm px-3 py-2 outline-none font-bold text-primary"
                value={form.recovery_score}
                onChange={(e) => setForm({ ...form, recovery_score: Number(e.target.value) })}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={saving || saved}
            className={`w-full py-3.5 rounded-xl font-semibold text-sm transition-all duration-200 shadow-[0_0_20px_rgba(76,215,246,0.3)] active:scale-[0.98] ${
              saved
                ? "bg-emerald-500 text-white"
                : "bg-gradient-to-r from-primary-container to-primary text-slate-950 font-bold hover:shadow-[0_0_30px_rgba(76,215,246,0.5)]"
            }`}
          >
            {saved ? "✓ Biometrics Saved!" : saving ? "Saving…" : "Save Vital Signs"}
          </button>
        </form>
      </div>
    </div>
  );
}
