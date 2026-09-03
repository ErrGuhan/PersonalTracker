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

  return (
    <header className="fixed top-0 left-0 lg:left-72 w-full lg:w-[calc(100%-18rem)] z-50 px-4 sm:px-6 py-3 bg-[#0B0F17]/70 backdrop-blur-xl border-b border-white/[0.08]">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-2.5">
          <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/30 border border-cyan-500/30 shadow-[0_0_12px_rgba(6,182,212,0.2)]">
            <Zap className="w-5 h-5 text-cyan-400 fill-cyan-400/30" />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              LifeSync <span className="text-cyan-400 font-semibold text-xs tracking-wider uppercase ml-0.5">OS</span>
            </span>
          </div>
        </div>

        {/* Right Actions: Search + Auth CTA */}
        <div className="flex items-center gap-3">
          {/* Quick Search Trigger — CSS-only hover/active, no JS */}
          <button
            onClick={onOpenSearch}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] text-slate-300 transition-colors cursor-pointer hover:scale-105 active:scale-95"
            aria-label="Search"
          >
            <Search className="w-4 h-4" />
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
