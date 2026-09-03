"use client";

import { useRef, ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import { ModalProvider, useModals } from "@/context/ModalContext";
import { useAuthContext } from "@/context/AuthProvider";
import { NAV_ITEMS, isRouteActive } from "@/lib/navigation";
import { useSwipeNavigation } from "@/hooks/useSwipeNavigation";

function AppShellContent({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const mainRef = useRef<HTMLElement | null>(null);
  const { user, isAuthenticated, signOut } = useAuthContext();
  const { openAuthModal, openCommandPalette } = useModals();

  // Attach deterministic, native horizontal swipe navigation
  useSwipeNavigation(mainRef);

  return (
    <div className="flex-1 flex flex-col h-full w-full relative overflow-hidden bg-[#0F131C] text-[#DFE2EE]">
      {/* ─── Desktop Navigation Drawer (LG+) ─── */}
      <nav
        aria-label="Desktop Navigation"
        className="hidden lg:flex flex-col fixed left-0 top-0 h-full z-[60] bg-[#0F131C]/95 backdrop-blur-2xl w-72 rounded-r-2xl border-r border-white/10 shadow-2xl"
      >
        <div className="p-6 border-b border-white/5">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-full border border-white/10 relative bg-primary/20 flex items-center justify-center font-bold text-xl text-primary shadow-[0_0_15px_rgba(76,215,246,0.3)]">
              ⚡
            </div>
            <div className="min-w-0">
              <h2 className="font-bold text-base text-white truncate">
                {isAuthenticated ? (user?.email?.split("@")[0] || "User") : "Guest User"}
              </h2>
              <p className="text-xs text-slate-400 font-mono truncate">
                {isAuthenticated ? user?.email : "Sign in to sync data"}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between bg-slate-900/50 rounded-xl p-3 glass-panel">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary text-base" style={{ fontVariationSettings: "'FILL' 1" }}>
                local_fire_department
              </span>
              <span className="text-xs text-secondary font-semibold font-mono">
                {isAuthenticated ? "Active Session" : "Offline Mode"}
              </span>
            </div>
            {isAuthenticated ? (
              <button
                type="button"
                onClick={() => signOut()}
                className="text-[10px] text-error hover:underline font-mono cursor-pointer"
              >
                Sign Out
              </button>
            ) : (
              <button
                type="button"
                onClick={openAuthModal}
                className="text-[10px] text-primary hover:underline font-mono cursor-pointer"
              >
                Sign In
              </button>
            )}
          </div>
        </div>

        {/* Desktop Nav Items */}
        <div className="flex flex-col gap-1.5 p-4 flex-grow overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const active = isRouteActive(pathname, item.href);
            return (
              <Link
                key={item.id}
                href={item.href}
                className={`px-4 py-3 flex items-center gap-3.5 rounded-xl transition-all text-left w-full cursor-pointer ${
                  active
                    ? "bg-primary/15 text-primary border-r-4 border-primary font-bold shadow-[0_0_15px_rgba(76,215,246,0.25)]"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <span className="material-symbols-outlined text-lg">{item.icon}</span>
                <span className="text-xs sm:text-sm font-semibold">{item.label}</span>
              </Link>
            );
          })}
        </div>

        <div className="p-4 border-t border-white/5 flex flex-col gap-2">
          <div className="text-lg tracking-tighter text-primary font-extrabold drop-shadow-[0_0_8px_rgba(76,215,246,0.5)]">
            LifeSync OS
          </div>
        </div>
      </nav>

      {/* ─── Top Glassmorphic Header ─── */}
      <Header
        onOpenAuth={openAuthModal}
        onOpenSearch={openCommandPalette}
      />

      {/* ─── Main Viewport ─── */}
      <main
        ref={mainRef}
        className="flex-1 w-full overflow-y-auto overflow-x-hidden scroll-smooth pb-32 lg:pb-16 touch-pan-y relative pt-24 sm:pt-28 px-4 sm:px-8 lg:px-12 max-w-[1440px] lg:ml-72"
      >
        <div key={pathname} className="w-full animate-fadeIn">
          {children}
        </div>
      </main>

      {/* ─── Sleek Floating Bottom Navigation Bar (Mobile & Tablet < LG) ─── */}
      <nav
        aria-label="Mobile Navigation"
        className="lg:hidden fixed bottom-4 left-1/2 -translate-x-1/2 w-[94%] max-w-lg rounded-full bg-[#0F131C]/95 backdrop-blur-2xl border border-white/15 shadow-[0_12px_40px_rgba(0,0,0,0.7)] z-50 flex items-center justify-around px-2 py-1.5 overflow-x-auto no-scrollbar"
      >
        {NAV_ITEMS.map((item) => {
          const active = isRouteActive(pathname, item.href);
          return (
            <Link
              key={item.id}
              href={item.href}
              className={`flex flex-col items-center justify-center min-w-[44px] min-h-[44px] px-2 py-1 rounded-full transition-all active:scale-95 shrink-0 ${
                active
                  ? "bg-primary/20 text-primary shadow-[0_0_12px_rgba(76,215,246,0.4)] font-bold"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <span className="material-symbols-outlined text-lg leading-none">{item.icon}</span>
              <span className="text-[9px] font-semibold mt-0.5 leading-none">{item.shortLabel}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

export default function AppShell({ children }: { children: ReactNode }) {
  return (
    <ModalProvider>
      <AppShellContent>{children}</AppShellContent>
    </ModalProvider>
  );
}
