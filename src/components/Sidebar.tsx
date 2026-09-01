"use client";

import { motion } from "framer-motion";
import { Zap, Flame, BookOpen, Heart, Target, LayoutDashboard } from "lucide-react";

interface NavItem {
  id: string;
  icon: React.ReactNode;
  label: string;
  accent?: "cyan" | "orange" | "violet";
}

const NAV_ITEMS: NavItem[] = [
  { id: "overview", icon: <LayoutDashboard className="w-4 h-4" />, label: "Overview", accent: "cyan" },
  { id: "fitness", icon: <Flame className="w-4 h-4" />, label: "Fitness", accent: "orange" },
  { id: "study", icon: <BookOpen className="w-4 h-4" />, label: "Study", accent: "cyan" },
  { id: "health", icon: <Heart className="w-4 h-4" />, label: "Health", accent: "violet" },
  { id: "goals", icon: <Target className="w-4 h-4" />, label: "Goals", accent: "cyan" },
];

interface SidebarProps {
  active: string;
  onNav: (id: string) => void;
}

export default function Sidebar({ active, onNav }: SidebarProps) {
  return (
    <aside className="hidden lg:flex flex-col h-screen sticky top-0 w-64 shrink-0 bg-[#0B0F19]/80 backdrop-blur-2xl border-r border-white/10 p-6 z-40">
      {/* Brand Header */}
      <div className="flex items-center gap-3 mb-8 px-2">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/30 border border-cyan-500/30 flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.3)] text-cyan-400">
          <Zap className="w-5 h-5 fill-cyan-400/30" />
        </div>
        <div>
          <h2 className="font-extrabold text-base tracking-tight text-white">
            LifeSync <span className="text-cyan-400 text-xs font-mono font-semibold">OS</span>
          </h2>
          <p className="text-[10px] font-mono text-cyan-400/80 uppercase tracking-widest">
            PERFORMANCE OS
          </p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex flex-col gap-1.5 flex-1">
        <p className="text-[10px] font-mono text-slate-400 uppercase tracking-widest px-3 mb-1">
          DASHBOARD
        </p>

        {NAV_ITEMS.map((item) => {
          const isActive = active === item.id || (active === "dashboard" && item.id === "overview");

          return (
            <button
              key={item.id}
              onClick={() => onNav(item.id)}
              className={`relative flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-xs transition-all duration-200 cursor-pointer ${
                isActive
                  ? "text-white font-bold bg-white/[0.08] border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.2)]"
                  : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
              }`}
            >
              <span className={isActive ? "text-cyan-400" : "text-slate-400"}>{item.icon}</span>
              <span>{item.label}</span>

              {isActive && (
                <motion.span
                  layoutId="activeSidebarIndicator"
                  className="absolute right-2 w-1.5 h-4 bg-cyan-400 rounded-full shadow-[0_0_8px_#06b6d4]"
                />
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom Profile Badge */}
      <div className="glass-secondary p-3 mt-auto flex items-center gap-3 border border-white/10">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
          A
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-white truncate">Alex Morgan</p>
          <p className="text-[10px] text-cyan-400 font-mono">ATHLETE MODE</p>
        </div>
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_#10b981]" />
      </div>
    </aside>
  );
}
