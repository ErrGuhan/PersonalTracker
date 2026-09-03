"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useCreateGoal } from "@/hooks/useSupabase";
import { updateGoal } from "@/lib/db";
import type { Goal } from "@/lib/database.types";

interface CreateGoalModalProps {
  initialGoal?: Goal | null;
  onClose: () => void;
  onSaved: (goal?: Goal) => void;
}

const CATEGORIES = [
  { value: "Fitness", icon: "🏋️", accent: "#ec6a06" },
  { value: "Learning", icon: "🧠", accent: "#4cd7f6" },
  { value: "Health", icon: "❤️‍🔥", accent: "#b395ff" },
  { value: "Mindset", icon: "🧘", accent: "#4cd7f6" },
  { value: "Career", icon: "🚀", accent: "#ec6a06" },
];

export default function CreateGoalModal({
  initialGoal,
  onClose,
  onSaved,
}: CreateGoalModalProps) {
  const router = useRouter();
  const { createGoal, saving: creating } = useCreateGoal();
  const isEdit = Boolean(initialGoal);

  const [form, setForm] = useState({
    title: initialGoal?.title ?? "",
    category: initialGoal?.category ?? "Fitness",
    icon: initialGoal?.icon ?? "🏃",
    progress: initialGoal?.progress ?? 0,
    target_description: initialGoal?.target_description ?? "",
    detail: initialGoal?.detail ?? "",
    accent: initialGoal?.accent ?? "#4cd7f6",
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) {
      setError("Please provide a goal title.");
      return;
    }

    const catObj = CATEGORIES.find((c) => c.value === form.category);
    setSaving(true);
    setError(null);

    try {
      if (isEdit && initialGoal) {
        const updated = await updateGoal(initialGoal.id, {
          title: form.title.trim(),
          category: form.category,
          icon: form.icon || catObj?.icon || "🎯",
          progress: Number(form.progress),
          target_description: form.target_description || "Strategic Milestone",
          detail: form.detail || "Active goal tracker",
          accent: catObj?.accent || form.accent || "#4cd7f6",
        });
        setSaved(true);
        setTimeout(() => {
          onSaved(updated ?? undefined);
          onClose();
        }, 400);
      } else {
        const created = await createGoal({
          title: form.title.trim(),
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
          onSaved(created ?? undefined);
          onClose();
        }, 400);
      }
    } catch (err: any) {
      console.error("[GoalModal Submit Error]:", err);
      setError(err?.message || "Failed to save goal. Please check your inputs.");
      setSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="w-full max-w-md max-h-[85vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [scrollbar-width:none] rounded-2xl bg-gradient-to-b from-[#181C24] to-[#0F131C] border border-white/15 backdrop-blur-2xl p-5 sm:p-6 shadow-2xl text-[#DFE2EE] space-y-5"
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold text-white">
              {isEdit ? "Edit Strategic Goal" : "New Milestone Goal"}
            </h2>
            <p className="font-mono text-xs text-primary tracking-wider uppercase mt-0.5">
              {isEdit ? "MODIFY OBJECTIVE" : "STRATEGIC OBJECTIVE"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs text-center font-medium">
              {error}
            </div>
          )}

          <div>
            <label className="block font-mono text-xs text-slate-400 uppercase tracking-wider mb-2">
              Category
            </label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setForm({ ...form, category: c.value, icon: c.icon, accent: c.accent })}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors flex items-center gap-1.5 cursor-pointer ${
                    form.category === c.value
                      ? "border-primary bg-primary/15 text-primary shadow-[0_0_12px_rgba(76,215,246,0.3)]"
                      : "border-white/10 bg-white/5 text-slate-400 hover:text-white"
                  }`}
                >
                  <span>{c.icon}</span>
                  <span>{c.value}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block font-mono text-xs text-slate-400 uppercase tracking-wider mb-1">
              Goal Title *
            </label>
            <input
              type="text"
              placeholder="e.g. Big Data Computing / Sub-4 Marathon"
              required
              className="w-full bg-slate-900/60 border-b-2 border-white/10 border-t-0 border-x-0 focus:border-primary text-white text-sm px-3 py-2.5 outline-none font-bold"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-mono text-xs text-slate-400 uppercase tracking-wider mb-1">
                Target / Exam
              </label>
              <input
                type="text"
                placeholder="e.g. NPTEL Exam / 100 pages"
                className="w-full bg-slate-900/60 border-b-2 border-white/10 border-t-0 border-x-0 focus:border-primary text-white text-xs px-3 py-2 outline-none"
                value={form.target_description}
                onChange={(e) => setForm({ ...form, target_description: e.target.value })}
              />
            </div>

            <div>
              <label className="block font-mono text-xs text-slate-400 uppercase tracking-wider mb-1">
                Deadline / Timeline
              </label>
              <input
                type="text"
                placeholder="e.g. October 17, 2026"
                className="w-full bg-slate-900/60 border-b-2 border-white/10 border-t-0 border-x-0 focus:border-primary text-white text-xs px-3 py-2 outline-none"
                value={form.detail}
                onChange={(e) => setForm({ ...form, detail: e.target.value })}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="font-mono text-xs text-slate-400 uppercase tracking-wider">
                {isEdit ? "Progress Level" : "Initial Progress"}
              </label>
              <span className="font-mono text-xs text-primary font-bold">{form.progress}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              className="w-full accent-primary cursor-pointer h-2 bg-white/10 rounded-lg appearance-none"
              value={form.progress}
              onChange={(e) => setForm({ ...form, progress: Number(e.target.value) })}
            />
          </div>

          <button
            type="submit"
            disabled={saving || creating || saved}
            className={`w-full py-3.5 rounded-xl font-semibold text-xs sm:text-sm transition-all duration-200 shadow-[0_0_20px_rgba(76,215,246,0.3)] active:scale-[0.98] cursor-pointer ${
              saved
                ? "bg-emerald-500 text-white"
                : "bg-gradient-to-r from-primary-container to-primary text-slate-950 font-bold hover:shadow-[0_0_30px_rgba(76,215,246,0.5)]"
            }`}
          >
            {saved
              ? isEdit
                ? "✓ Changes Saved!"
                : "✓ Goal Created!"
              : saving || creating
              ? "Saving…"
              : isEdit
              ? "Save Changes"
              : "Create Strategic Goal"}
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
}
