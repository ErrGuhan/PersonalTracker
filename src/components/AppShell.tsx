"use client";

import { useState } from "react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import MobileBottomNav from "@/components/MobileBottomNav";
import QuickActionSheet from "@/components/QuickActionSheet";
import AuthModal from "@/components/AuthModal";
import CommandPalette from "@/components/CommandPalette";
import { Plus } from "lucide-react";
import { motion } from "framer-motion";

interface AppShellProps {
  activeTab: string;
  onNav: (tab: string) => void;
  onSelectQuickAction: (actionType: string) => void;
  onOpenAuth?: () => void;
  onOpenSearch?: () => void;
  children: React.ReactNode;
}

export default function AppShell({ activeTab, onNav, onSelectQuickAction, onOpenAuth, onOpenSearch, children }: AppShellProps) {
  const [showQuickAction, setShowQuickAction] = useState(false);

  return (
    <div className="flex h-screen bg-[#0B0F19] text-[#dfe2ee] font-sans antialiased overflow-hidden selection:bg-cyan-500/30 selection:text-cyan-200 relative ambient-canvas">
      {/* Persistent Widescreen Sidebar */}
      <Sidebar active={activeTab} onNav={onNav} />

      {/* Persistent Top Header */}
      <Header
        onOpenAuth={onOpenAuth || (() => {})}
        onOpenSearch={onOpenSearch || (() => {})}
      />

      {/* Main Persistent Content Scroll View */}
      <main className="flex-1 w-full overflow-y-auto overflow-x-hidden scroll-smooth pb-32 sm:pb-24 touch-pan-y relative pt-24 sm:pt-28 px-4 sm:px-12 max-w-[1440px] lg:ml-64">
        {children}
      </main>

      {/* FLOATING QUICK ACTION BUTTON (+ LOG) */}
      <motion.button
        whileHover={{ scale: 1.1, rotate: 90 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setShowQuickAction(true)}
        className="fixed bottom-20 right-6 lg:bottom-8 lg:right-8 z-40 w-14 h-14 rounded-full bg-gradient-to-tr from-cyan-400 via-blue-500 to-indigo-500 text-slate-950 font-black shadow-[0_0_25px_rgba(6,182,212,0.6)] flex items-center justify-center cursor-pointer border border-cyan-300"
        title="Quick Log Action (+)"
      >
        <Plus className="w-7 h-7 stroke-[3]" />
      </motion.button>

      {/* Persistent Mobile Bottom Navigation */}
      <MobileBottomNav active={activeTab} onNav={onNav} />

      {/* Quick Action Bottom Sheet */}
      <QuickActionSheet
        isOpen={showQuickAction}
        onClose={() => setShowQuickAction(false)}
        onSelectAction={onSelectQuickAction}
      />
    </div>
  );
}
