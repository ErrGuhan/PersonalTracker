"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthContext } from "@/context/AuthProvider";
import { 
  Zap, 
  Search, 
  User as UserIcon, 
  LogOut, 
  Sparkles, 
  ChevronDown,
  Download,
  Check
} from "lucide-react";
import { exportUserDataCSV } from "@/app/actions/export";

interface HeaderProps {
  onOpenAuth?: () => void;
  onOpenSearch?: () => void;
}

export default function Header({ onOpenAuth, onOpenSearch }: HeaderProps) {
  const { user, isAuthenticated, signOut } = useAuthContext();
  const [menuOpen, setMenuOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exported, setExported] = useState(false);

  const handleExportCSV = async () => {
    setExporting(true);
    try {
      const res = await exportUserDataCSV();
      if (res.success && res.csvContent) {
        const blob = new Blob([res.csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", res.filename || "lifesync_export.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setExported(true);
        setTimeout(() => setExported(false), 2500);
      }
    } catch (err) {
      console.error("[Export CSV Error]:", err);
    } finally {
      setExporting(false);
    }
  };

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
          <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/30 border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.25)]">
            <Zap className="w-5 h-5 text-cyan-400 fill-cyan-400/30" />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              LifeSync <span className="text-cyan-400 font-semibold text-xs tracking-wider uppercase ml-0.5">OS</span>
            </span>
          </div>
        </div>

        {/* Right Actions: CSV Export + Search + Auth CTA */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Export CSV Server Action Trigger */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleExportCSV}
            disabled={exporting}
            title="Export habit & workout logs as CSV"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 text-xs font-semibold transition-colors cursor-pointer"
          >
            {exported ? (
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Download className="w-3.5 h-3.5 text-cyan-400" />
            )}
            <span className="hidden sm:inline">
              {exporting ? "Exporting..." : exported ? "CSV Exported!" : "Export CSV"}
            </span>
          </motion.button>

          {/* Quick Search Trigger */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onOpenSearch}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] text-slate-300 transition-colors cursor-pointer"
            aria-label="Search"
          >
            <Search className="w-4 h-4" />
          </motion.button>

          <AnimatePresence mode="wait">
            {!isAuthenticated ? (
              /* Creative Glowing Sign In Button */
              <motion.button
                key="signin-btn"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={onOpenAuth}
                className="relative group p-[1px] rounded-xl overflow-hidden focus:outline-none cursor-pointer"
              >
                {/* Animated Gradient Border Glow */}
                <span className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-indigo-500 to-amber-500 rounded-xl opacity-75 group-hover:opacity-100 transition-opacity duration-300 animate-pulse" />

                <div className="relative flex items-center gap-2 px-3.5 py-1.5 rounded-[11px] bg-[#0F172A]/90 backdrop-blur-md transition-colors group-hover:bg-[#0F172A]/70">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                  <span className="text-xs font-semibold text-white tracking-wide">
                    Sign In
                  </span>
                </div>
              </motion.button>
            ) : (
              /* Authenticated User Profile Pill */
              <div className="relative" key="user-menu">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setMenuOpen((prev) => !prev)}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.1] transition-colors cursor-pointer"
                >
                  <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white text-xs font-bold">
                    {userEmail ? userEmail.charAt(0).toUpperCase() : <UserIcon className="w-3.5 h-3.5" />}
                  </div>
                  <span className="text-xs font-medium text-slate-200 max-w-[90px] truncate hidden sm:inline">
                    {userEmail?.split("@")[0]}
                  </span>
                  <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform duration-200 ${menuOpen ? "rotate-180" : ""}`} />
                </motion.button>

                {/* Dropdown Menu */}
                <AnimatePresence>
                  {menuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 6, scale: 0.96 }}
                      transition={{ duration: 0.15 }}
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
          </AnimatePresence>

        </div>
      </div>
    </header>
  );
}
