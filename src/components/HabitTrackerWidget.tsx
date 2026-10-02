"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useHabits } from "@/hooks/useSupabase";
import { Check, Plus, Flame, MoreVertical, Pencil, Trash2, X } from "lucide-react";
import EmptyState from "@/components/EmptyState";
import type { Habit } from "@/lib/database.types";

const CATS = ["health", "fitness", "focus", "mindset"] as const;

export default function HabitTrackerWidget() {
  const { habits, toggleHabit, addHabit, updateHabit, deleteHabit } = useHabits();
  const [showForm, setShowForm]           = useState(false);
  const [editId, setEditId]               = useState<string | null>(null);
  const [menuId, setMenuId]               = useState<string | null>(null);
  const [pendingId, setPendingId]         = useState<string | null>(null);
  const [deleteId, setDeleteId]           = useState<string | null>(null);
  const [isDeleting, setIsDeleting]       = useState(false);
  const [title, setTitle]                 = useState("");
  const [category, setCategory]           = useState<typeof CATS[number]>("health");

  const completedCount = habits.filter(h => h.completedToday).length;
  const pct            = habits.length > 0 ? Math.round((completedCount / habits.length) * 100) : 0;

  const handleToggle = (id: string) => {
    if (pendingId === id) return;
    setPendingId(id);
    toggleHabit(id);
    setTimeout(() => setPendingId(null), 300);
  };

  const openAdd = () => { setEditId(null); setTitle(""); setCategory("health"); setShowForm(true); };
  const openEdit = (h: Habit) => { setEditId(h.id); setTitle(h.title); setCategory(h.category as typeof CATS[number]); setMenuId(null); setShowForm(true); };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    if (editId) {
      updateHabit(editId, { title: title.trim(), category });
      setEditId(null);
    } else {
      addHabit({ title: title.trim(), category, frequency: "Daily", targetCount: 1, icon: "check_circle" });
    }
    setTitle("");
    setShowForm(false);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try { deleteHabit(deleteId); }
    catch (e) { console.error(e); }
    finally { setIsDeleting(false); setDeleteId(null); }
  };

  return (
    <div className="m3-surface-glass rounded-2xl p-4 flex flex-col gap-4 relative overflow-hidden">
      {/* Ambient */}
      <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-blue-500/[0.06] rounded-full blur-2xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-sm text-white">Daily Habits</h3>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-2xl font-black text-white font-mono">{completedCount}</span>
            <span className="text-[10px] text-slate-400 font-mono">/ {habits.length}</span>
            <span className="m3-chip m3-chip-selected text-[9px] ml-1">{pct}%</span>
          </div>
        </div>
        <button
          onClick={() => showForm ? setShowForm(false) : openAdd()}
          className={`m3-chip ${showForm ? "" : "m3-chip-selected"} text-[10px]`}
        >
          {showForm ? <X className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
          {showForm ? "Cancel" : "Add"}
        </button>
      </div>

      {/* Progress bar */}
      <div className="m3-progress-track" style={{ height: "4px" }}>
        <div
          className="m3-progress-bar"
          style={{ width: `${pct}%`, height: "4px", borderRadius: "2px", transition: "width 0.5s cubic-bezier(0.2,0,0,1)" }}
        />
      </div>

      {/* Add/Edit form */}
      <AnimatePresence>
        {showForm && (
          <motion.form
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            onSubmit={handleSubmit}
            className="m3-surface-inset rounded-xl p-4 overflow-hidden flex flex-col gap-3"
          >
            <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-bold">
              {editId ? "Edit Habit" : "New Habit"}
            </span>
            <input
              type="text"
              placeholder="Habit name…"
              required
              className="bg-transparent border-b border-white/10 focus:border-cyan-400 transition-colors py-2 w-full outline-none text-sm text-white placeholder:text-slate-500"
              value={title}
              onChange={e => setTitle(e.target.value)}
            />
            <div className="flex flex-wrap gap-1.5">
              {CATS.map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`m3-chip text-[10px] capitalize ${category === cat ? "m3-chip-selected" : ""}`}
                >
                  {cat}
                </button>
              ))}
            </div>
            <button type="submit" className="m3-fab m3-fab-small w-full justify-center">
              {editId ? "Update" : "Save"}
            </button>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Habit list */}
      {habits.length === 0 ? (
        <EmptyState
          icon={Check}
          title="No Habits Yet"
          description="Track daily health, fitness, or focus habits."
          actionLabel="Add Habit"
          onAction={openAdd}
        />
      ) : (
        <ul className="space-y-2" onClick={() => setMenuId(null)}>
          <AnimatePresence mode="popLayout">
            {habits.map(h => (
              <motion.li
                key={h.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                transition={{ duration: 0.18 }}
                className={`relative flex items-center gap-3 p-3 rounded-xl border transition-all
                  ${h.completedToday
                    ? "bg-cyan-500/10 border-cyan-500/30"
                    : "bg-white/[0.03] border-white/[0.06] hover:border-white/[0.14]"
                  }`}
              >
                {/* Checkbox */}
                <button
                  type="button"
                  disabled={pendingId === h.id}
                  onClick={() => handleToggle(h.id)}
                  className={`w-6 h-6 rounded-full border flex items-center justify-center shrink-0 transition-all
                    ${h.completedToday
                      ? "bg-cyan-400 border-cyan-400 text-slate-950 shadow-[0_0_8px_rgba(76,215,246,0.5)]"
                      : "border-white/25 text-transparent hover:border-cyan-400 bg-white/5"
                    }`}
                  aria-label={`Toggle ${h.title}`}
                >
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </button>

                {/* Content */}
                <div className="flex-1 min-w-0 cursor-pointer" onClick={() => handleToggle(h.id)}>
                  <p className={`text-sm font-semibold transition-all truncate ${h.completedToday ? "line-through text-slate-400" : "text-white"}`}>
                    {h.title}
                  </p>
                  <div className="flex items-center gap-2 text-[9px] font-mono text-slate-400 mt-0.5">
                    <span className="uppercase tracking-wider text-cyan-400">{h.category}</span>
                    <span className="flex items-center gap-0.5">
                      <Flame className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />
                      {h.streak}d
                    </span>
                  </div>
                </div>

                {/* Action chip + menu */}
                <div className="flex items-center gap-1 shrink-0" onClick={e => e.stopPropagation()}>
                  <button
                    type="button"
                    disabled={pendingId === h.id}
                    onClick={() => handleToggle(h.id)}
                    className={`m3-chip text-[10px] ${h.completedToday ? "m3-chip-selected" : ""}`}
                  >
                    {h.completedToday ? <><Check className="w-2.5 h-2.5 stroke-[3]" />Done</> : "Complete"}
                  </button>

                  <div className="relative">
                    <button
                      onClick={e => { e.stopPropagation(); setMenuId(menuId === h.id ? null : h.id); }}
                      className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.07] transition cursor-pointer"
                      aria-label="More"
                    >
                      <MoreVertical className="w-3.5 h-3.5" />
                    </button>

                    <AnimatePresence>
                      {menuId === h.id && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95, y: -4 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ duration: 0.1 }}
                          className="absolute right-0 top-8 z-30 w-32 m3-surface-modal py-1 shadow-2xl"
                        >
                          <button
                            onClick={e => { e.stopPropagation(); openEdit(h); }}
                            className="w-full flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-white/10 cursor-pointer"
                          >
                            <Pencil className="w-3 h-3 text-cyan-400" />Edit
                          </button>
                          <button
                            onClick={e => { e.stopPropagation(); setMenuId(null); setDeleteId(h.id); }}
                            className="w-full flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-red-400 hover:bg-red-500/10 cursor-pointer"
                          >
                            <Trash2 className="w-3 h-3" />Delete
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      )}

      {/* Delete confirm modal */}
      <AnimatePresence>
        {deleteId && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setDeleteId(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={e => e.stopPropagation()}
              className="m3-surface-modal p-5 max-w-xs w-full mx-4"
            >
              <h3 className="font-bold text-base text-white mb-1">Delete habit?</h3>
              <p className="text-xs text-slate-400 mb-5">Streak and history will be lost.</p>
              <div className="flex gap-2 justify-end">
                <button type="button" disabled={isDeleting} onClick={() => setDeleteId(null)} className="m3-chip">Cancel</button>
                <button
                  type="button" disabled={isDeleting} onClick={confirmDelete}
                  className="m3-chip border-red-500/30 text-red-400 hover:bg-red-500/10"
                >
                  {isDeleting ? "…" : "Delete"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
