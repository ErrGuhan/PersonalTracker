"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (msg: string) => void;
}

export default function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const { signIn, signUp } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      if (isSignUp) {
        await signUp(email, password);
        onSuccess("🎉 Account created successfully! Please check your email or sign in.");
      } else {
        await signIn(email, password);
        onSuccess("⚡ Welcome back! Authenticated with Supabase.");
      }
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.message || "Authentication failed. Please check credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: "spring", stiffness: 350, damping: 25 }}
        className="w-full max-w-md rounded-2xl bg-gradient-to-b from-surface-container-high/90 to-surface-dim/95 border-t border-white/10 border-b border-black/40 backdrop-blur-2xl p-6 shadow-[0_16px_48px_rgba(0,0,0,0.6)] text-on-surface space-y-5"
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-extrabold text-on-surface">
              {isSignUp ? "Create LifeSync Account" : "Sign In to LifeSync OS"}
            </h2>
            <p className="font-mono text-xs text-primary tracking-wider uppercase mt-0.5">
              SUPABASE AUTHENTICATION
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-white/10 transition-colors"
          >
            ✕
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-error-container/30 border border-error/40 text-error text-xs font-medium flex items-center gap-2">
            <span className="material-symbols-outlined text-base">warning</span>
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-mono text-xs text-on-surface-variant uppercase tracking-wider mb-1">
              Email Address
            </label>
            <input
              type="email"
              required
              className="w-full bg-surface-container/60 border-b-2 border-white/10 border-t-0 border-x-0 focus:border-primary focus:ring-0 text-on-surface text-sm px-3 py-2.5 outline-none transition-colors"
              placeholder="alex@lifesync.os"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block font-mono text-xs text-on-surface-variant uppercase tracking-wider mb-1">
              Password
            </label>
            <input
              type="password"
              required
              minLength={6}
              className="w-full bg-surface-container/60 border-b-2 border-white/10 border-t-0 border-x-0 focus:border-primary focus:ring-0 text-on-surface text-sm px-3 py-2.5 outline-none transition-colors"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-primary text-on-primary font-bold text-sm hover:bg-primary/90 transition shadow-[0_0_20px_rgba(76,215,246,0.4)] flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
          >
            {loading ? (
              <span className="animate-spin text-base">⏳</span>
            ) : isSignUp ? (
              "Sign Up Account"
            ) : (
              "Sign In with Supabase"
            )}
          </button>
        </form>

        <div className="pt-2 border-t border-white/10 text-center">
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-xs text-on-surface-variant hover:text-primary transition font-medium"
          >
            {isSignUp
              ? "Already have an account? Sign In"
              : "Don't have an account? Create one"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
