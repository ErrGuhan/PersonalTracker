"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useAuthContext } from "@/context/AuthProvider";
import { 
  Zap, 
  Search, 
  User as UserIcon, 
  LogOut, 
  Sparkles, 
  ChevronDown 
} from "lucide-react";

interface HeaderProps {
  onOpenAuth?: () => void;
  onOpenSearch?: () => void;
}

export default function Header({ onOpenAuth, onOpenSearch }: HeaderProps) {
  const { user, isAuthenticated, signOut } = useAuthContext();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    setMenuOpen(false);
  };

  const userEmail = user?.email;

  // Current formatted date for greeting
  const todayFormatted = new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(new Date());

  return (
    <header className="fixed top-0 left-0 lg:left-64 w-full lg:w-[calc(100%-16rem)] z-30 px-4 sm:px-6 py-3 liquid-glass border-b border-white/[0.08] backdrop-blur-2xl">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Mobile: Brand Logo | Desktop: Date & Greeting */}
        <div className="flex items-center gap-3">
          {/* Mobile Logo */}
          <div className="flex lg:hidden items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center text-slate-950 font-black shadow-[0_0_12px_rgba(76,215,246,0.3)]">
              <Zap className="w-4 h-4 fill-slate-950 stroke-slate-950" />
            </div>
            <span className="text-sm font-bold tracking-tight text-white">
              LifeSync <span className="text-cyan-400 font-mono text-[10px] font-bold px-1 py-0.5 rounded bg-cyan-400/10 border border-cyan-400/20">OS</span>
            </span>
          </div>

          {/* Desktop Greeting & Date */}
          <div className="hidden lg:flex items-center gap-3">
            <span className="text-xs font-semibold text-white tracking-wide">
              {isAuthenticated ? `Welcome back, ${userEmail?.split("@")[0] || "User"}` : "Welcome to LifeSync OS"}
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-xs text-slate-400 font-mono">
              {todayFormatted}
            </span>
          </div>
        </div>

        {/* Right Actions: Search + Auth CTA */}
        <div className="flex items-center gap-2.5">
          {/* Quick Search Trigger */}
          <button
            onClick={onOpenSearch}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-slate-300 transition-colors cursor-pointer text-xs"
            aria-label="Search commands"
          >
            <Search className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline text-slate-400">Search...</span>
            <kbd className="hidden sm:inline px-1.5 py-0.5 text-[9px] font-mono bg-white/[0.06] rounded text-slate-400 border border-white/[0.08]">
              ⌘K
            </kbd>
          </button>

          {!isAuthenticated ? (
            /* Creative Glowing Sign In Button — no animate-pulse on border, static glow */
            <button
              onClick={onOpenAuth}
              className="relative group p-[1px] rounded-xl overflow-hidden focus:outline-none cursor-pointer hover:scale-[1.03] active:scale-[0.97] transition-transform duration-100"
            >
              {/* Static gradient border — removed continuous animate-pulse */}
              <span className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-indigo-500 to-amber-500 rounded-xl opacity-60 group-hover:opacity-90 transition-opacity duration-200" />
              <div className="relative flex items-center gap-2 px-3.5 py-1.5 rounded-[11px] bg-[#0F172A]/90 backdrop-blur-md transition-colors group-hover:bg-[#0F172A]/70">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-xs font-semibold text-white tracking-wide">
                  Sign In
                </span>
              </div>
            </button>
          ) : (
            /* Authenticated User Profile Pill */
            <div className="relative">
              <button
                onClick={() => setMenuOpen((prev) => !prev)}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.1] transition-colors cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
              >
                <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white text-xs font-bold">
                  {userEmail ? userEmail.charAt(0).toUpperCase() : <UserIcon className="w-3.5 h-3.5" />}
                </div>
                <span className="text-xs font-medium text-slate-200 max-w-[90px] truncate hidden sm:inline">
                  {userEmail?.split("@")[0]}
                </span>
                <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform duration-200 ${menuOpen ? "rotate-180" : ""}`} />
              </button>

              {/* Dropdown Menu — keep AnimatePresence here (functional UI, fast) */}
              <AnimatePresence>
                {menuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    transition={{ duration: 0.12 }}
                    className="absolute right-0 mt-2 w-48 rounded-2xl bg-[#0F172A]/95 backdrop-blur-2xl border border-white/[0.12] p-1.5 shadow-2xl shadow-black/80 z-50"
                  >
                    <div className="px-3 py-2 border-b border-white/[0.08] mb-1">
                      <p className="text-[11px] text-slate-400">Signed in as</p>
                      <p className="text-xs font-semibold text-white truncate">{userEmail}</p>
                    </div>

                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
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
