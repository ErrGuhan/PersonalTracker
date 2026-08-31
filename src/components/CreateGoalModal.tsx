"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useCreateGoal } from "@/hooks/useSupabase";

interface CreateGoalModalProps {
  onClose: () => void;
  onSaved: () => void;
}

const CATEGORIES = [
  { value: "Fitness", icon: "🏋️", accent: "#ec6a06" },
  { value: "Learning", icon: "🧠", accent: "#4cd7f6" },
  { value: "Health", icon: "❤️‍🔥", accent: "#b395ff" },
  { value: "Mindset", icon: "🧘", accent: "#4cd7f6" },
  { value: "Career", icon: "🚀", accent: "#ec6a06" },
];

export default function CreateGoalModal({ onClose, onSaved }: CreateGoalModalProps) {
  const router = useRouter();
  const { createGoal, saving } = useCreateGoal();
  const [form, setForm] = useState({
    title: "",
    category: "Fitness",
    icon: "🏃",
    progress: 10,
    target_description: "",
    detail: "",
    accent: "#4cd7f6",
  });
  const [saved, setSaved] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const catObj = CATEGORIES.find((c) => c.value === form.category);
    try {
      await createGoal({
        title: form.title,
        category: form.category,
        icon: form.icon || catObj?.icon || "🎯",
        progress: Number(form.progress),
        target_description: form.target_description || "Strategic Milestone",
        detail: form.detail || "Active goal tracker",
        accent: catObj?.accent || "#4cd7f6",
      });
      router.refresh();
      setSaved(true);
      setTimeout(() => {
        onSaved();
        onClose();
      }, 600);
    } catch (err) {
      console.error("[Supabase createGoal Error]:", err);
    }
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
            <h2 className="text-lg sm:text-xl font-extrabold text-on-surface">New Milestone Goal</h2>
            <p className="font-mono text-xs text-primary tracking-wider uppercase mt-0.5">STRATEGIC OBJECTIVE</p>
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
            <label className="block font-mono text-xs text-on-surface-variant uppercase tracking-wider mb-2">
              Category
            </label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setForm({ ...form, category: c.value, icon: c.icon, accent: c.accent })}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors flex items-center gap-1.5 ${
                    form.category === c.value
                      ? "border-primary bg-primary/15 text-primary shadow-[0_0_12px_rgba(76,215,246,0.3)]"
                      : "border-white/10 bg-white/5 text-on-surface-variant hover:text-on-surface"
                  }`}
                >
                  <span>{c.icon}</span>
                  <span>{c.value}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block font-mono text-xs text-on-surface-variant uppercase tracking-wider mb-1">
              Goal Title
            </label>
            <input
              type="text"
              placeholder="e.g. Complete Marathon in Sub-4 Hours"
              required
              className="w-full bg-surface-container/60 border-b-2 border-white/10 border-t-0 border-x-0 focus:border-primary text-on-surface text-sm px-3 py-2.5 outline-none font-bold"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-mono text-xs text-on-surface-variant uppercase tracking-wider mb-1">
                Target Description
              </label>
              <input
                type="text"
                placeholder="e.g. Target: 42.2km run"
                className="w-full bg-surface-container/60 border-b-2 border-white/10 border-t-0 border-x-0 focus:border-primary text-on-surface text-xs px-3 py-2 outline-none"
                value={form.target_description}
                onChange={(e) => setForm({ ...form, target_description: e.target.value })}
              />
            </div>

            <div>
              <label className="block font-mono text-xs text-on-surface-variant uppercase tracking-wider mb-1">
                Details / Timeline
              </label>
              <input
                type="text"
                placeholder="e.g. Target Date: Q4"
                className="w-full bg-surface-container/60 border-b-2 border-white/10 border-t-0 border-x-0 focus:border-primary text-on-surface text-xs px-3 py-2 outline-none"
                value={form.detail}
                onChange={(e) => setForm({ ...form, detail: e.target.value })}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="font-mono text-xs text-on-surface-variant uppercase tracking-wider">
                Initial Progress
              </label>
              <span className="font-mono text-xs text-primary font-bold">{form.progress}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              className="w-full accent-primary cursor-pointer"
              value={form.progress}
              onChange={(e) => setForm({ ...form, progress: Number(e.target.value) })}
            />
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
            {saved ? "✓ Goal Created!" : saving ? "Saving…" : "Create Strategic Goal"}
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
}
