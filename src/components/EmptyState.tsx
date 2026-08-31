"use client";

import { motion } from "framer-motion";
import { Plus, Sparkles } from "lucide-react";
import type { ComponentType } from "react";

interface EmptyStateProps {
  icon?: ComponentType<{ className?: string }> | string;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export default function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, type: "spring", stiffness: 260, damping: 22 }}
      className="w-full bg-[#0F172A]/50 backdrop-blur-xl border border-white/10 shadow-2xl rounded-2xl p-8 sm:p-10 flex flex-col items-center justify-center text-center gap-4 relative overflow-hidden my-4"
    >
      {/* Background Ambient Glow */}
      <div className="absolute -top-20 -left-20 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -right-20 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Icon Badge */}
      <div className="relative flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500/20 via-blue-600/20 to-indigo-600/20 border border-cyan-500/30 text-cyan-400 shadow-[0_0_25px_rgba(6,182,212,0.25)]">
        {typeof Icon === "string" ? (
          <span className="material-symbols-outlined text-2xl">{Icon}</span>
        ) : Icon ? (
          <Icon className="w-7 h-7 stroke-[2]" />
        ) : (
          <Sparkles className="w-7 h-7" />
        )}
      </div>

      {/* Copy */}
      <div className="max-w-md space-y-1.5">
        <h3 className="font-extrabold text-lg sm:text-xl text-white tracking-tight">{title}</h3>
        <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">{description}</p>
      </div>

      {/* Optional Primary CTA Button */}
      {actionLabel && onAction && (
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          onClick={onAction}
          className="mt-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 via-teal-400 to-blue-500 text-slate-950 font-extrabold text-xs shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:shadow-[0_0_30px_rgba(6,182,212,0.6)] transition cursor-pointer flex items-center gap-2"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>{actionLabel}</span>
        </motion.button>
      )}
    </motion.div>
  );
}
