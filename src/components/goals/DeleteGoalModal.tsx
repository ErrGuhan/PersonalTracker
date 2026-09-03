"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import type { Goal } from "@/lib/database.types";

interface DeleteGoalModalProps {
  goal: Goal;
  onClose: () => void;
  onConfirmDelete: (goalId: string) => Promise<boolean>;
}

export default function DeleteGoalModal({
  goal,
  onClose,
  onConfirmDelete,
}: DeleteGoalModalProps) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    setDeleting(true);
    setError(null);
    try {
      const success = await onConfirmDelete(goal.id);
      if (success) {
        onClose();
      } else {
        setError("Failed to delete goal. Please retry.");
      }
    } catch (err: any) {
      setError(err?.message || "An error occurred while deleting the goal.");
    } finally {
      setDeleting(false);
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
        className="w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl bg-gradient-to-b from-[#181C24] to-[#0F131C] border border-red-500/20 backdrop-blur-2xl p-6 shadow-2xl text-[#DFE2EE] space-y-5"
      >
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-400 text-2xl shrink-0">
            <span className="material-symbols-outlined text-2xl">delete_forever</span>
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-white">Delete Strategic Goal?</h2>
            <p className="text-xs text-slate-400 mt-1">
              Are you sure you want to delete <span className="text-white font-bold">&quot;{goal.title}&quot;</span>? This action cannot be undone.
            </p>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs text-center font-medium">
            {error}
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={deleting}
            className="flex-1 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 text-xs font-bold transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="flex-1 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-extrabold shadow-[0_0_20px_rgba(239,68,68,0.4)] transition active:scale-[0.98] disabled:opacity-50 cursor-pointer"
          >
            {deleting ? "Deleting…" : "Delete Goal"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
