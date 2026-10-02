"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import EmptyState from "@/components/EmptyState";
import CreateGoalModal from "@/components/CreateGoalModal";
import UpdateProgressModal from "@/components/goals/UpdateProgressModal";
import DeleteGoalModal from "@/components/goals/DeleteGoalModal";
import { useGoals } from "@/hooks/useSupabase";
import type { Goal } from "@/lib/database.types";
import { Plus, SlidersHorizontal, MoreVertical, Pencil, Trash2, Check, Target } from "lucide-react";

const Sk = () => (
  <div className="m3-surface-glass rounded-2xl p-4 flex flex-col gap-3">
    <div className="flex items-center gap-3">
      <span className="ion-skeleton w-10 h-10 rounded-xl" />
      <div className="flex flex-col gap-1.5"><span className="ion-skeleton w-32 h-4 rounded" /><span className="ion-skeleton w-16 h-3 rounded" /></div>
    </div>
    <span className="ion-skeleton w-full h-2 rounded-full" />
    <div className="flex justify-between"><span className="ion-skeleton w-24 h-3 rounded" /><span className="ion-skeleton w-16 h-3 rounded" /></div>
  </div>
);

export default function GoalsView() {
  const { goals, loading, error, refetch, updateProgress, deleteGoal } = useGoals();

  const [menuId,    setMenuId]    = useState<string | null>(null);
  const [progGoal,  setProgGoal]  = useState<Goal | null>(null);
  const [editGoal,  setEditGoal]  = useState<Goal | null>(null);
  const [delGoal,   setDelGoal]   = useState<Goal | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [toast,     setToast]     = useState<string | null>(null);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  const handleSaveProgress = async (n: number) => {
    if (!progGoal) return;
    await updateProgress(progGoal.id, n);
    showToast(`Progress → ${n}%`);
  };

  const handleDelete = async (id: string) => {
    const title = goals.find(g => g.id === id)?.title || "Goal";
    const ok = await deleteGoal(id);
    if (ok) showToast(`"${title}" deleted`);
    return ok;
  };

  return (
    <>
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.15 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-[120] px-4 py-2 rounded-xl bg-[#1c2028]/98 border border-cyan-400/25 text-white text-xs font-semibold shadow-2xl backdrop-blur-xl"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modals */}
      <AnimatePresence>
        {progGoal && <UpdateProgressModal goal={progGoal} onClose={() => setProgGoal(null)} onSave={handleSaveProgress} />}
      </AnimatePresence>
      <AnimatePresence>
        {delGoal && <DeleteGoalModal goal={delGoal} onClose={() => setDelGoal(null)} onConfirmDelete={handleDelete} />}
      </AnimatePresence>
      <AnimatePresence>
        {(showCreate || editGoal) && (
          <CreateGoalModal
            initialGoal={editGoal}
            onClose={() => { setShowCreate(false); setEditGoal(null); }}
            onSaved={(saved) => {
              refetch();
              showToast(editGoal ? `"${saved?.title || editGoal.title}" updated` : "Goal created");
            }}
          />
        )}
      </AnimatePresence>

      <div className="flex flex-col gap-5 w-full pt-3" onClick={() => setMenuId(null)}>

        {/* ── Header ── */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="m3-chip m3-chip-selected text-[10px]">Goals</span>
            </div>
            <h2 className="text-xl font-extrabold text-white tracking-tight">Milestones</h2>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); setShowCreate(true); }}
            className="m3-fab m3-fab-small"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            New Goal
          </button>
        </div>

        {/* ── Content ── */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4"><Sk /><Sk /></div>
        ) : error ? (
          <div className="m3-surface-glass rounded-2xl p-6 text-center flex flex-col items-center gap-3 border border-red-500/20">
            <span className="text-2xl">⚠️</span>
            <p className="text-sm text-white font-semibold">Failed to load goals</p>
            <p className="text-xs text-slate-400">{error}</p>
            <button onClick={refetch} className="m3-chip m3-chip-selected text-xs">Retry</button>
          </div>
        ) : goals.length === 0 ? (
          <EmptyState
            icon={Target}
            title="No Milestones Yet"
            description="Set your first goal — fitness, study, or health."
            actionLabel="Create Goal"
            onAction={() => setShowCreate(true)}
          />
        ) : (
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <AnimatePresence mode="popLayout">
              {goals.map(g => {
                const done     = g.progress >= 100;
                const isOpen   = menuId === g.id;
                const accent   = g.accent || "#4cd7f6";

                return (
                  <motion.li
                    key={g.id}
                    layout
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="m3-surface-glass rounded-2xl p-4 flex flex-col gap-3 relative border border-white/[0.07] hover:border-cyan-400/25 transition-all"
                  >
                    {/* Top row */}
                    <div className="flex justify-between items-start gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0 border"
                          style={{ backgroundColor: `${accent}18`, borderColor: `${accent}35` }}
                        >
                          {g.icon || "🎯"}
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-semibold text-sm text-white truncate">{g.title}</h3>
                          <span className="text-[9px] font-mono uppercase tracking-wider text-slate-400">{g.category}</span>
                        </div>
                      </div>
                      {done ? (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/12 border border-emerald-500/25 px-2 py-0.5 rounded-full shrink-0">
                          <Check className="w-3 h-3 stroke-[3]" />Done
                        </span>
                      ) : (
                        <span className="text-xl font-black text-cyan-300 font-mono shrink-0">{g.progress}%</span>
                      )}
                    </div>

                    {/* Progress bar */}
                    <div className="m3-progress-track">
                      <div
                        className={done ? "m3-progress-bar-emerald" : "m3-progress-bar"}
                        style={{ width: `${Math.min(100, Math.max(0, g.progress))}%`, height: "4px", borderRadius: "2px", transition: "width 0.5s cubic-bezier(0.2,0,0,1)" }}
                      />
                    </div>

                    {/* Meta row */}
                    <div className="flex justify-between items-center text-[10px] font-mono text-slate-400">
                      <span className="truncate max-w-[60%] text-slate-300">{g.target_description || "Ongoing"}</span>
                      <span className="truncate max-w-[40%] text-right">{g.detail || ""}</span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-2 border-t border-white/[0.06] relative" onClick={e => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => setProgGoal(g)}
                        className="m3-chip m3-chip-selected text-[10px]"
                      >
                        <SlidersHorizontal className="w-3 h-3" />
                        Update
                      </button>

                      <div className="relative">
                        <button
                          type="button"
                          aria-label="More options"
                          onClick={e => { e.stopPropagation(); setMenuId(isOpen ? null : g.id); }}
                          className={`w-7 h-7 rounded-lg flex items-center justify-center transition cursor-pointer ${isOpen ? "bg-white/15 text-white" : "text-slate-400 hover:text-white hover:bg-white/[0.06]"}`}
                        >
                          <MoreVertical className="w-3.5 h-3.5" />
                        </button>

                        <AnimatePresence>
                          {isOpen && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.95, y: -4 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.95 }}
                              transition={{ duration: 0.1 }}
                              className="absolute right-0 bottom-full mb-1 w-40 m3-surface-modal py-1 shadow-2xl z-30"
                              onClick={e => e.stopPropagation()}
                            >
                              {[
                                { icon: SlidersHorizontal, label: "Update", action: () => { setMenuId(null); setProgGoal(g); }, cls: "text-slate-300" },
                                { icon: Pencil,            label: "Edit",   action: () => { setMenuId(null); setEditGoal(g); }, cls: "text-slate-300" },
                              ].map(({ icon: Icon, label, action, cls }) => (
                                <button key={label} type="button" onClick={action}
                                  className={`w-full px-3 py-2 text-left text-xs font-medium ${cls} hover:text-white hover:bg-white/10 flex items-center gap-2 cursor-pointer`}
                                >
                                  <Icon className="w-3 h-3 text-cyan-400" />{label}
                                </button>
                              ))}
                              <div className="h-px bg-white/[0.07] my-0.5" />
                              <button
                                type="button"
                                onClick={() => { setMenuId(null); setDelGoal(g); }}
                                className="w-full px-3 py-2 text-left text-xs font-medium text-red-400 hover:bg-red-500/10 flex items-center gap-2 cursor-pointer"
                              >
                                <Trash2 className="w-3 h-3" />Delete
                              </button>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </motion.li>
                );
              })}
            </AnimatePresence>
          </ul>
        )}
      </div>
    </>
  );
}
