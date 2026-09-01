"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Sparkles, Shield, Zap, X } from "lucide-react";

export interface RewardToastData {
  id: string;
  title: string;
  subtitle?: string;
  xpGained?: number;
  tokensGained?: number;
  type?: "habit" | "streak" | "levelup" | "token";
}

interface RewardToastProps {
  toast: RewardToastData | null;
  onClose: () => void;
}

export default function RewardToast({ toast, onClose }: RewardToastProps) {
  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          className="fixed top-20 right-4 sm:right-8 z-50 max-w-sm w-full pointer-events-auto"
        >
          <div className="relative overflow-hidden rounded-2xl bg-slate-900/90 backdrop-blur-2xl border border-cyan-500/40 p-4 shadow-[0_0_30px_rgba(6,182,212,0.3)] flex items-center justify-between gap-3">
            {/* Glowing Accent Lines */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 via-indigo-500 to-amber-400" />
            
            <div className="flex items-center gap-3.5">
              {/* Icon Badge */}
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-cyan-500/20 to-indigo-500/20 border border-cyan-400/40 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(6,182,212,0.25)]">
                {toast.type === "levelup" ? (
                  <Trophy className="w-6 h-6 text-amber-400 animate-bounce" />
                ) : toast.type === "token" ? (
                  <Shield className="w-6 h-6 text-amber-400" />
                ) : toast.type === "streak" ? (
                  <Zap className="w-6 h-6 text-cyan-400" />
                ) : (
                  <Sparkles className="w-6 h-6 text-cyan-300" />
                )}
              </div>

              {/* Text Info */}
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-extrabold text-white tracking-tight">
                    {toast.title}
                  </span>
                  {toast.xpGained && (
                    <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-500/15 border border-cyan-500/30 px-2 py-0.5 rounded-lg">
                      +{toast.xpGained} XP
                    </span>
                  )}
                  {toast.tokensGained && (
                    <span className="text-xs font-mono font-bold text-amber-300 bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 rounded-lg">
                      +{toast.tokensGained} Rest Token
                    </span>
                  )}
                </div>
                {toast.subtitle && (
                  <p className="text-xs text-slate-400 mt-0.5">{toast.subtitle}</p>
                )}
              </div>
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer shrink-0"
              aria-label="Dismiss notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
