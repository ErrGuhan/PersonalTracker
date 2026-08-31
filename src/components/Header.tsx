"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";

interface HeaderProps {
  onOpenAuthModal: () => void;
  onOpenCommandPalette: () => void;
  onExportData?: () => void;
  onResetData?: () => void;
}

export default function Header({
  onOpenAuthModal,
  onOpenCommandPalette,
  onExportData,
  onResetData,
}: HeaderProps) {
  const { user, isAuthenticated, signOut } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const userInitial = (user?.email?.[0] || "A").toUpperCase();
  const userName = user?.email ? user.email.split("@")[0] : "Athlete";

  return (
    <header className="fixed top-0 left-0 w-full lg:w-[calc(100%-18rem)] lg:left-72 z-50 bg-black/40 backdrop-blur-xl border-b border-white/10 px-4 sm:px-6 py-3 flex items-center justify-between shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
      {/* Brand Mark & Mobile Title */}
      <div className="flex items-center gap-3">
        {/* Neon Glow Badge */}
        <div className="relative flex items-center justify-center">
          <div className="absolute inset-0 bg-primary/30 rounded-xl blur-md animate-pulse" />
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary/30 to-surface-container border border-primary/40 flex items-center justify-center font-bold text-lg text-primary shadow-[0_0_12px_rgba(76,215,246,0.4)] relative">
            ⚡
          </div>
        </div>

        <div>
          <h1 className="font-extrabold text-base sm:text-lg text-white tracking-tight flex items-center gap-1.5">
            LifeSync <span className="text-gradient-cyan">OS</span>
          </h1>
          <p className="font-mono text-[9px] text-primary/80 tracking-widest uppercase hidden sm:block">
            PERFORMANCE & BIO-SYNC ENGINE
          </p>
        </div>
      </div>

      {/* Middle Command Palette Search Trigger */}
      <motion.button
        whileHover={{ scale: 1.02, borderColor: "rgba(76,215,246,0.5)" }}
        whileTap={{ scale: 0.97 }}
        onClick={onOpenCommandPalette}
        className="hidden md:flex items-center gap-2.5 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-on-surface-variant hover:text-white transition-all text-xs font-medium cursor-pointer shadow-inner"
      >
        <span className="material-symbols-outlined text-primary text-base">search</span>
        <span>Search metrics & commands…</span>
        <span className="font-mono text-[10px] bg-white/10 text-primary font-bold px-2 py-0.5 rounded border border-white/10 ml-3">
          ⌘K
        </span>
      </motion.button>

      {/* Right Side Actions: Auth CTA or Profile Pill */}
      <div className="flex items-center gap-3">
        {/* Mobile Search Icon Button */}
        <button
          onClick={onOpenCommandPalette}
          className="md:hidden p-2 rounded-xl bg-white/5 border border-white/10 text-on-surface-variant hover:text-white active:scale-95 transition"
        >
          <span className="material-symbols-outlined text-lg">search</span>
        </button>

        {/* Auth Condition State */}
        {!isAuthenticated ? (
          /* Creative Multi-Layered Sign In Button */
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={onOpenAuthModal}
            className="relative group p-0.5 rounded-xl overflow-hidden cursor-pointer shadow-[0_0_20px_rgba(76,215,246,0.35)]"
          >
            {/* Animated Shimmer Background */}
            <span className="absolute inset-0 bg-gradient-to-r from-primary via-cyan-300 to-amber-400 opacity-90 group-hover:opacity-100 transition duration-300 animate-pulse" />
            <div className="relative px-4 py-2 rounded-[10px] bg-slate-950 text-white font-bold text-xs flex items-center gap-2 group-hover:bg-opacity-90 transition">
              <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
              <span>Sign In</span>
              <span className="material-symbols-outlined text-sm text-primary group-hover:translate-x-0.5 transition-transform">
                arrow_forward
              </span>
            </div>
          </motion.button>
        ) : (
          /* Authenticated User Profile Avatar Pill with Dropdown */
          <div className="relative" ref={menuRef}>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setDropdownOpen((v) => !v)}
              className="flex items-center gap-2.5 p-1.5 pr-3.5 rounded-full bg-surface-container-high/80 border border-primary/30 hover:border-primary/60 backdrop-blur-md transition shadow-[0_0_15px_rgba(76,215,246,0.2)] cursor-pointer"
            >
              <div className="relative w-8 h-8 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center font-extrabold text-sm text-primary">
                {userInitial}
                {/* Active Online Status Dot */}
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-slate-950" />
              </div>
              <span className="font-bold text-xs text-white max-w-[100px] truncate hidden sm:block">
                {userName}
              </span>
              <span className="material-symbols-outlined text-sm text-on-surface-variant">
                {dropdownOpen ? "expand_less" : "expand_more"}
              </span>
            </motion.button>

            {/* Profile Dropdown Menu */}
            <AnimatePresence>
              {dropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-56 rounded-2xl bg-surface-dim/95 border border-white/15 backdrop-blur-2xl p-2 shadow-[0_16px_40px_rgba(0,0,0,0.8)] text-on-surface space-y-1 z-50"
                >
                  <div className="p-3 border-b border-white/10">
                    <p className="font-bold text-xs text-white truncate">{userName}</p>
                    <p className="font-mono text-[10px] text-on-surface-variant truncate">{user?.email}</p>
                    <span className="inline-block font-mono text-[9px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 mt-1">
                      ● Active Bio-Sync
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      onOpenCommandPalette();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-on-surface-variant hover:text-white hover:bg-white/10 transition text-left cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-sm text-primary">tune</span>
                    Quick Settings (⌘K)
                  </button>

                  {onExportData && (
                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        onExportData();
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-on-surface-variant hover:text-white hover:bg-white/10 transition text-left cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-sm text-secondary">download</span>
                      Export Data Backup
                    </button>
                  )}

                  {onResetData && (
                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        onResetData();
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-on-surface-variant hover:text-error hover:bg-error/10 transition text-left cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-sm text-error">restart_alt</span>
                      Reset Baseline Data
                    </button>
                  )}

                  <div className="border-t border-white/10 pt-1">
                    <button
                      onClick={async () => {
                        setDropdownOpen(false);
                        await signOut();
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-error hover:bg-error/15 transition text-left cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-sm">logout</span>
                      Log Out
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </header>
  );
}
