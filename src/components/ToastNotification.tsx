"use client";

import { motion, AnimatePresence } from "framer-motion";

interface ToastNotificationProps {
  message: string | null;
  onClear: () => void;
}

export default function ToastNotification({ message, onClear }: ToastNotificationProps) {
  if (!message) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.9 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        className="fixed top-20 right-4 sm:right-8 z-[110] flex items-center gap-3 px-4 py-3 rounded-xl bg-surface-container-high/90 border border-primary/40 backdrop-blur-xl shadow-[0_8px_25px_rgba(76,215,246,0.3)] text-on-surface text-xs sm:text-sm font-semibold"
      >
        <span className="material-symbols-outlined text-primary text-base">info</span>
        <span>{message}</span>
        <button
          onClick={onClear}
          className="ml-2 text-on-surface-variant hover:text-on-surface text-xs font-mono"
        >
          ✕
        </button>
      </motion.div>
    </AnimatePresence>
  );
}
