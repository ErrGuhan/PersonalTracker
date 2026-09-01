"use client";

import { motion } from "framer-motion";
import { LayoutDashboard, Flame, BookOpen, CheckCircle2, Target } from "lucide-react";

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
}

const NAV_ITEMS: NavItem[] = [
  { id: "overview", label: "Home", icon: <LayoutDashboard className="w-5 h-5" /> },
  { id: "fitness", label: "Fitness", icon: <Flame className="w-5 h-5" /> },
  { id: "study", label: "Study", icon: <BookOpen className="w-5 h-5" /> },
  { id: "routines", label: "Habits", icon: <CheckCircle2 className="w-5 h-5" /> },
  { id: "goals", label: "Goals", icon: <Target className="w-5 h-5" /> },
];

interface MobileBottomNavProps {
  active: string;
  onNav: (id: string) => void;
}

export default function MobileBottomNav({ active, onNav }: MobileBottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-[#0B0F19]/85 backdrop-blur-2xl border-t border-white/10 px-3 py-2 pb-safe shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {NAV_ITEMS.map((item) => {
          const isActive = active === item.id || (active === "dashboard" && item.id === "overview");

          return (
            <button
              key={item.id}
              onClick={() => onNav(item.id)}
              className="relative flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-colors cursor-pointer group"
            >
              {isActive && (
                <motion.div
                  layoutId="mobileNavGlow"
                  className="absolute inset-0 bg-cyan-500/15 border border-cyan-500/30 rounded-xl shadow-[0_0_12px_rgba(6,182,212,0.3)]"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}

              <span className={`relative z-10 transition-transform duration-200 ${isActive ? "text-cyan-400 scale-110" : "text-slate-400 group-hover:text-slate-200"}`}>
                {item.icon}
              </span>

              <span className={`relative z-10 text-[10px] font-mono mt-1 transition-colors ${isActive ? "text-cyan-300 font-bold" : "text-slate-400"}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
