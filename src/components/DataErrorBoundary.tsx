"use client";

import { AlertTriangle, RefreshCw, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

interface DataErrorBoundaryProps {
  loading?: boolean;
  error?: string | null;
  isEmpty?: boolean;
  onRetry?: () => void;
  skeleton?: React.ReactNode;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyActionLabel?: string;
  onEmptyAction?: () => void;
  children: React.ReactNode;
}

export default function DataErrorBoundary({
  loading = false,
  error = null,
  isEmpty = false,
  onRetry,
  skeleton,
  emptyTitle = "No data recorded yet",
  emptyDescription = "Start building your daily system by logging your first record.",
  emptyActionLabel,
  onEmptyAction,
  children,
}: DataErrorBoundaryProps) {
  // 1. LOADING STATE
  if (loading) {
    return <>{skeleton || <div className="glass-secondary p-6 rounded-2xl animate-pulse h-32" />}</>;
  }

  // 2. ERROR STATE
  if (error) {
    return (
      <div className="glass-secondary p-5 sm:p-6 rounded-2xl border border-rose-500/30 bg-rose-950/20 flex flex-col items-center justify-center text-center gap-3 relative overflow-hidden">
        <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400">
          <AlertTriangle className="w-5 h-5" />
        </div>

        <div className="flex flex-col gap-1 max-w-sm">
          <h4 className="font-bold text-sm text-white">Unable to load data</h4>
          <p className="text-xs text-slate-400 line-clamp-2">
            {error || "Something went wrong while retrieving your records."}
          </p>
        </div>

        {onRetry && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onRetry}
            className="mt-1 px-4 py-2 rounded-xl text-xs font-semibold bg-rose-500/20 border border-rose-500/40 text-rose-300 hover:bg-rose-500/30 transition flex items-center gap-2 cursor-pointer shadow-sm"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Try Again
          </motion.button>
        )}
      </div>
    );
  }

  // 3. EMPTY STATE
  if (isEmpty) {
    return (
      <div className="glass-secondary p-6 sm:p-8 rounded-2xl flex flex-col items-center justify-center text-center gap-3.5 relative overflow-hidden">
        <div className="w-12 h-12 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-inner">
          <Sparkles className="w-6 h-6" />
        </div>

        <div className="flex flex-col gap-1 max-w-sm">
          <h4 className="font-extrabold text-base text-white tracking-tight">{emptyTitle}</h4>
          <p className="text-xs text-slate-400 leading-relaxed">{emptyDescription}</p>
        </div>

        {emptyActionLabel && onEmptyAction && (
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={onEmptyAction}
            className="mt-2 px-5 py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:opacity-90 transition cursor-pointer shadow-[0_0_15px_rgba(6,182,212,0.3)]"
          >
            {emptyActionLabel}
          </motion.button>
        )}
      </div>
    );
  }

  // 4. SUCCESS / DATA AVAILABLE
  return <>{children}</>;
}
