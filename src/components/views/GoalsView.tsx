"use client";

import { useState } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import EmptyState from "@/components/EmptyState";
import CreateGoalModal from "@/components/CreateGoalModal";
import UpdateProgressModal from "@/components/goals/UpdateProgressModal";
import DeleteGoalModal from "@/components/goals/DeleteGoalModal";
import { useGoals } from "@/hooks/useSupabase";
import type { Goal } from "@/lib/database.types";

const SkeletonCard = () => (
  <div className="p-5 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 shadow-xl overflow-hidden relative h-[160px] flex flex-col justify-between">
    <div className="flex justify-between items-start">
      <div className="flex items-center gap-3">
        <motion.div
          className="w-10 h-10 rounded-full bg-white/20"
          animate={{ opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        />
        <div className="space-y-1.5">
          <motion.div
            className="h-4 w-32 bg-white/20 rounded-md"
            animate={{ opacity: [0.4, 0.8, 0.4] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.1 }}
          />
          <motion.div
            className="h-2.5 w-16 bg-white/10 rounded-md"
            animate={{ opacity: [0.4, 0.8, 0.4] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
          />
        </div>
      </div>
      <motion.div
        className="h-5 w-12 bg-white/20 rounded-md"
        animate={{ opacity: [0.4, 0.8, 0.4] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
    <motion.div
      className="h-2 w-full bg-white/10 rounded-full"
      animate={{ opacity: [0.4, 0.8, 0.4] }}
      transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.15 }}
    />
    <div className="flex justify-between">
      <motion.div className="h-3 w-24 bg-white/10 rounded" />
      <motion.div className="h-3 w-20 bg-white/10 rounded" />
    </div>
  </div>
);

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, scale: 0.97, y: 12 },
  show: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: "spring", stiffness: 350, damping: 26 },
  },
};

export default function GoalsView() {
  const { goals, loading, error, refetch, updateProgress, deleteGoal } = useGoals();

  const [activeMenuGoalId, setActiveMenuGoalId] = useState<string | null>(null);
  const [progressModalGoal, setProgressModalGoal] = useState<Goal | null>(null);
  const [editModalGoal, setEditModalGoal] = useState<Goal | null>(null);
  const [deleteModalGoal, setDeleteModalGoal] = useState<Goal | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleSaveProgress = async (newProgress: number) => {
    if (!progressModalGoal) return;
    await updateProgress(progressModalGoal.id, newProgress);
    showToast(`🎯 Progress updated to ${newProgress}% for "${progressModalGoal.title}"`);
  };

  const handleConfirmDelete = async (goalId: string) => {
    const title = goals.find((g) => g.id === goalId)?.title || "Goal";
    const success = await deleteGoal(goalId);
    if (success) {
      showToast(`🗑️ "${title}" deleted successfully.`);
    }
    return success;
  };

  return (
    <>
      {/* Toast Banner */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-5 left-1/2 -translate-x-1/2 z-[120] px-4 py-2.5 rounded-xl bg-slate-900/95 border border-primary/30 text-white text-xs font-semibold shadow-2xl backdrop-blur-xl flex items-center gap-2"
          >
            <span>{toastMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress Update Modal */}
      <AnimatePresence>
        {progressModalGoal && (
          <UpdateProgressModal
            goal={progressModalGoal}
            onClose={() => setProgressModalGoal(null)}
            onSave={handleSaveProgress}
          />
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteModalGoal && (
          <DeleteGoalModal
            goal={deleteModalGoal}
            onClose={() => setDeleteModalGoal(null)}
            onConfirmDelete={handleConfirmDelete}
          />
        )}
      </AnimatePresence>

      {/* Create / Edit Goal Modal */}
      <AnimatePresence>
        {(showCreateModal || editModalGoal) && (
          <CreateGoalModal
            initialGoal={editModalGoal}
            onClose={() => {
              setShowCreateModal(false);
              setEditModalGoal(null);
            }}
            onSaved={(savedGoal) => {
              refetch();
              if (editModalGoal) {
                showToast(`✏️ "${savedGoal?.title || editModalGoal.title}" updated successfully!`);
              } else {
                showToast(`🎯 New strategic goal created!`);
              }
            }}
          />
        )}
      </AnimatePresence>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="flex flex-col gap-6 w-full pb-32 lg:pb-16"
        onClick={() => setActiveMenuGoalId(null)}
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="flex justify-between items-end">
          <div>
            <h2 className="text-xl sm:text-3xl font-extrabold text-white tracking-tight">
              Milestones & Strategic Goals
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              Track core objectives, exams, and athletic achievements.
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.95 }}
            onClick={(e) => {
              e.stopPropagation();
              setShowCreateModal(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-primary text-slate-950 font-extrabold text-xs shadow-[0_0_20px_rgba(76,215,246,0.4)] hover:bg-primary/90 transition cursor-pointer shrink-0"
          >
            + New Goal
          </motion.button>
        </motion.div>

        {/* ─── State Machine ─── */}

        {/* 1. Loading State */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : error ? (
          /* 2. Error State (Never masquerade as empty state) */
          <motion.div
            variants={itemVariants}
            className="glass-panel p-8 rounded-2xl border border-red-500/20 text-center flex flex-col items-center gap-4 bg-red-950/20"
          >
            <div className="w-12 h-12 rounded-full bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-400">
              <span className="material-symbols-outlined text-2xl">error_outline</span>
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Unable to load strategic goals</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm">{error}</p>
            </div>
            <button
              onClick={() => refetch()}
              className="px-5 py-2 rounded-xl bg-primary/15 border border-primary/30 text-primary text-xs font-bold hover:bg-primary/25 transition flex items-center gap-2 cursor-pointer shadow-[0_0_15px_rgba(76,215,246,0.2)]"
            >
              <span className="material-symbols-outlined text-sm">refresh</span>
              Retry Connection
            </button>
          </motion.div>
        ) : goals.length === 0 ? (
          /* 3. Empty State (Genuinely 0 active goals) */
          <EmptyState
            icon="flag"
            title="No Active Strategic Goals"
            description="Define your high-level milestones in health, learning, or fitness to stay focused on long-term achievement."
            actionLabel="Create First Goal"
            onAction={() => setShowCreateModal(true)}
          />
        ) : (
          /* 4. Active Goals Grid */
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <AnimatePresence mode="popLayout">
              {goals.map((g) => {
                const isComplete = g.progress >= 100;
                const isMenuOpen = activeMenuGoalId === g.id;

                return (
                  <motion.li
                    key={g.id}
                    variants={itemVariants}
                    className="glass-panel p-5 sm:p-6 rounded-2xl flex flex-col gap-4 shadow-xl relative border border-white/10 hover:border-white/20 transition-all"
                  >
                    {/* Top Row: Icon + Title + Status/Percentage */}
                    <div className="flex justify-between items-start gap-3">
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div
                          className="w-11 h-11 rounded-full flex items-center justify-center text-xl shrink-0 border"
                          style={{
                            backgroundColor: `${g.accent || "#4cd7f6"}20`,
                            borderColor: `${g.accent || "#4cd7f6"}40`,
                          }}
                        >
                          {g.icon || "🎯"}
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-extrabold text-sm sm:text-base text-white truncate">
                            {g.title}
                          </h3>
                          <p className="text-[10px] text-primary font-mono uppercase tracking-wider mt-0.5">
                            {g.category}
                          </p>
                        </div>
                      </div>

                      {/* Percentage or Completed Badge */}
                      <div className="shrink-0 text-right">
                        {isComplete ? (
                          <span className="inline-flex items-center gap-1 text-xs font-extrabold text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-1 rounded-full shadow-[0_0_10px_rgba(52,211,153,0.3)]">
                            <span>✓</span>
                            <span>100% Done</span>
                          </span>
                        ) : (
                          <span className="text-xl font-extrabold text-primary font-mono drop-shadow-[0_0_8px_rgba(76,215,246,0.3)]">
                            {g.progress}%
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Thin Progress Bar */}
                    <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden relative">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ease-out ${
                          isComplete
                            ? "bg-emerald-400 shadow-[0_0_10px_#34d399]"
                            : "bg-gradient-to-r from-primary-container to-primary shadow-[0_0_10px_rgba(76,215,246,0.5)]"
                        }`}
                        style={{ width: `${Math.min(100, Math.max(0, g.progress))}%` }}
                      />
                    </div>

                    {/* Target & Deadline Row */}
                    <div className="flex justify-between items-center text-[11px] font-mono text-slate-400 pt-1">
                      <span className="truncate max-w-[60%] text-slate-300">
                        {g.target_description || "Target Milestone"}
                      </span>
                      <span className="text-right truncate max-w-[40%]">
                        {g.detail || "Ongoing"}
                      </span>
                    </div>

                    {/* Bottom Action Row: Primary [Update Progress] + [⋮] Menu */}
                    <div className="flex items-center justify-between pt-3 border-t border-white/5 relative">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setProgressModalGoal(g);
                        }}
                        className="px-4 py-2 rounded-xl bg-primary/10 border border-primary/30 hover:border-primary/60 hover:bg-primary/20 text-primary text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-[0_0_12px_rgba(76,215,246,0.15)] active:scale-95"
                      >
                        <span className="material-symbols-outlined text-sm">tune</span>
                        <span>Update Progress</span>
                      </button>

                      {/* Dropdown Menu Trigger */}
                      <div className="relative">
                        <button
                          type="button"
                          aria-label="Goal actions"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveMenuGoalId(isMenuOpen ? null : g.id);
                          }}
                          className={`w-8 h-8 rounded-lg flex items-center justify-center transition cursor-pointer ${
                            isMenuOpen
                              ? "bg-white/15 text-white"
                              : "text-slate-400 hover:text-white hover:bg-white/5"
                          }`}
                        >
                          <span className="material-symbols-outlined text-lg">more_vert</span>
                        </button>

                        {/* Dropdown Menu Popup */}
                        {isMenuOpen && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: -5 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.12 }}
                            className="absolute right-0 bottom-full mb-1 w-44 rounded-xl bg-[#181C24] border border-white/15 shadow-2xl py-1 z-30 backdrop-blur-2xl"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              type="button"
                              onClick={() => {
                                setActiveMenuGoalId(null);
                                setProgressModalGoal(g);
                              }}
                              className="w-full px-3.5 py-2 text-left text-xs font-medium text-slate-300 hover:text-white hover:bg-white/10 flex items-center gap-2 cursor-pointer"
                            >
                              <span className="material-symbols-outlined text-sm text-primary">tune</span>
                              <span>Update Progress</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setActiveMenuGoalId(null);
                                setEditModalGoal(g);
                              }}
                              className="w-full px-3.5 py-2 text-left text-xs font-medium text-slate-300 hover:text-white hover:bg-white/10 flex items-center gap-2 cursor-pointer"
                            >
                              <span className="material-symbols-outlined text-sm text-cyan-400">edit</span>
                              <span>Edit Goal</span>
                            </button>

                            <div className="h-[1px] bg-white/10 my-1" />

                            <button
                              type="button"
                              onClick={() => {
                                setActiveMenuGoalId(null);
                                setDeleteModalGoal(g);
                              }}
                              className="w-full px-3.5 py-2 text-left text-xs font-medium text-red-400 hover:bg-red-500/15 flex items-center gap-2 cursor-pointer"
                            >
                              <span className="material-symbols-outlined text-sm text-red-400">delete</span>
                              <span>Delete Goal</span>
                            </button>
                          </motion.div>
                        )}
                      </div>
                    </div>
                  </motion.li>
                );
              })}
            </AnimatePresence>
          </ul>
        )}
      </motion.div>
    </>
  );
}
