"use client";

import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useAuthContext } from "@/context/AuthProvider";
import { Zap, Search, User as UserIcon, LogOut, ChevronDown, Database } from "lucide-react";
import { subscribeDbStatus, DbStatusInfo } from "@/lib/dbConnection";

interface HeaderProps {
  onOpenAuth?: () => void;
  onOpenSearch?: () => void;
  onOpenDbModal?: () => void;
}

export default function Header({ onOpenAuth, onOpenSearch, onOpenDbModal }: HeaderProps) {
  const { user, isAuthenticated, signOut } = useAuthContext();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dbStatus, setDbStatus] = useState<DbStatusInfo | null>(null);

  useEffect(() => {
    return subscribeDbStatus(setDbStatus);
  }, []);

  const userEmail = user?.email;
  const userInitial = userEmail ? userEmail.charAt(0).toUpperCase() : "G";
  const userName = userEmail ? userEmail.split("@")[0] : "Guest";

  const todayFormatted = new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(new Date());

  const isConnected = dbStatus?.status === "connected";

  return (
    <header className="m3-top-bar fixed top-0 left-0 lg:left-60 w-full lg:w-[calc(100%-15rem)] z-30 px-4 sm:px-5 py-0">
      <div className="h-14 flex items-center justify-between max-w-5xl mx-auto">

        {/* Left — mobile brand / desktop date */}
        <div className="flex items-center gap-3">
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center text-slate-950 font-black shadow-[0_0_12px_rgba(76,215,246,0.25)]">
              <Zap className="w-3.5 h-3.5 fill-slate-950 stroke-slate-950" />
            </div>
            <span className="text-sm font-bold tracking-tight text-white">
              LifeSync <span className="text-cyan-400 font-mono text-[9px] font-bold px-1 py-0.5 rounded bg-cyan-400/10 border border-cyan-400/20">OS</span>
            </span>
          </div>

          {/* Desktop date */}
          <span className="hidden lg:block text-xs text-slate-400 font-mono">{todayFormatted}</span>
        </div>

        {/* Right — database status + search + auth */}
        <div className="flex items-center gap-2">
          {/* Database connection indicator */}
          <button
            onClick={onOpenDbModal}
            className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-[11px] font-medium transition-colors cursor-pointer border ${
              isConnected
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20"
                : "bg-amber-500/10 text-amber-400 border-amber-500/20 hover:bg-amber-500/20"
            }`}
            title="Database Connection & Cloud Sync Settings"
            aria-label="Database connection status"
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isConnected ? "bg-emerald-400 animate-pulse" : "bg-amber-400"
              }`}
            />
            <span className="hidden sm:inline font-mono">
              {isConnected ? "Cloud Synced" : "Local Mode"}
            </span>
          </button>

          <button
            onClick={onOpenSearch}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.07] text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
            aria-label="Search"
          >
            <Search className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline text-xs text-slate-400">Search</span>
            <kbd className="hidden sm:inline px-1.5 py-0.5 text-[9px] font-mono bg-white/[0.05] rounded text-slate-500 border border-white/[0.07]">⌘K</kbd>
          </button>

          {!isAuthenticated ? (
            <button
              onClick={onOpenAuth}
              className="m3-chip m3-chip-selected text-[11px] py-1.5 px-3"
            >
              Sign In
            </button>
          ) : (
            <div className="relative">
              <button
                onClick={() => setMenuOpen(p => !p)}
                className="flex items-center gap-2 px-2 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.09] border border-white/[0.08] transition-colors cursor-pointer"
                aria-label="Account menu"
                aria-expanded={menuOpen}
              >
                <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                  {userInitial}
                </div>
                <span className="hidden sm:inline text-xs font-medium text-slate-200 max-w-[80px] truncate">{userName}</span>
                <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform duration-150 ${menuOpen ? "rotate-180" : ""}`} />
              </button>

              <AnimatePresence>
                {menuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 4 }}
                    transition={{ duration: 0.12, ease: "easeOut" }}
                    className="absolute right-0 mt-1.5 w-44 rounded-2xl bg-[#1c2028]/98 backdrop-blur-2xl border border-white/[0.1] p-1.5 shadow-xl z-50"
                  >
                    <div className="px-3 py-2 border-b border-white/[0.07] mb-1">
                      <p className="text-[10px] text-slate-500">Signed in as</p>
                      <p className="text-xs font-semibold text-white truncate">{userEmail}</p>
                    </div>
                    <button
                      onClick={async () => { await signOut(); setMenuOpen(false); }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Sign Out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
