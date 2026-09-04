"use client";

import { useRef, ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Header from "@/components/Header";
import { ModalProvider, useModals } from "@/context/ModalContext";
import { useAuthContext } from "@/context/AuthProvider";
import { NAV_ITEMS, isRouteActive } from "@/lib/navigation";
import { useSwipeNavigation } from "@/hooks/useSwipeNavigation";
import {
  LayoutDashboard,
  Dumbbell,
  Activity,
  Utensils,
  BookOpen,
  CalendarCheck,
  Target,
  Zap,
  Search,
  LogIn,
  LogOut,
  Radio,
} from "lucide-react";

function getNavIcon(id: string, className = "w-4 h-4") {
  switch (id) {
    case "dashboard":
      return <LayoutDashboard className={className} />;
    case "fitness":
      return <Dumbbell className={className} />;
    case "health":
      return <Activity className={className} />;
    case "nutrition":
      return <Utensils className={className} />;
    case "study":
      return <BookOpen className={className} />;
    case "routines":
      return <CalendarCheck className={className} />;
    case "goals":
      return <Target className={className} />;
    default:
      return <Zap className={className} />;
  }
}

function AppShellContent({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const mainRef = useRef<HTMLElement | null>(null);
  const { user, isAuthenticated, signOut } = useAuthContext();
  const { openAuthModal, openCommandPalette } = useModals();

  // Deterministic horizontal swipe navigation
  useSwipeNavigation(mainRef);

  // Grouped Navigation for Desktop
  const coreNav = NAV_ITEMS.filter((item) => ["dashboard", "fitness", "health", "nutrition"].includes(item.id));
  const studioNav = NAV_ITEMS.filter((item) => ["study", "routines", "goals"].includes(item.id));

  return (
    <div className="flex-1 flex flex-col h-full w-full relative overflow-hidden bg-[#0A0E16] text-[#DFE2EE]">
      {/* ─── Desktop Modern Liquid Glass Sidebar (LG+) ─── */}
      <aside
        aria-label="Desktop Navigation"
        className="hidden lg:flex flex-col fixed left-0 top-0 h-full z-40 w-64 liquid-glass border-r border-white/[0.07] shadow-2xl"
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-white/[0.06] flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center text-slate-950 font-black shadow-[0_0_15px_rgba(76,215,246,0.35)] group-hover:scale-105 transition-transform">
              <Zap className="w-4 h-4 fill-slate-950 stroke-slate-950" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-sm tracking-tight text-white">LifeSync</span>
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-md bg-cyan-400/15 text-cyan-300 border border-cyan-400/25">
                  OS
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono tracking-wider uppercase">
                Performance Hub
              </span>
            </div>
          </Link>
        </div>

        {/* Quick Command Trigger in Sidebar */}
        <div className="px-3 pt-3">
          <button
            onClick={openCommandPalette}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.06] text-slate-400 hover:text-slate-200 transition-colors text-xs cursor-pointer group"
          >
            <span className="flex items-center gap-2">
              <Search className="w-3.5 h-3.5 text-cyan-400" />
              <span>Search or jump...</span>
            </span>
            <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-white/[0.06] border border-white/[0.1] rounded text-slate-400 group-hover:text-slate-200">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Navigation Sections */}
        <div className="flex flex-col gap-5 p-3 flex-grow overflow-y-auto no-scrollbar">
          {/* Section: Core Overview & Body */}
          <div className="flex flex-col gap-1">
            <span className="px-3 text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold mb-1">
              Tracking & Body
            </span>
            {coreNav.map((item) => {
              const active = isRouteActive(pathname, item.href);
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={`px-3 py-2 rounded-xl flex items-center gap-3 transition-all text-xs font-medium cursor-pointer ${
                    active
                      ? "bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-[0_0_12px_rgba(76,215,246,0.18)] font-bold"
                      : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
                  }`}
                >
                  <span className={active ? "text-cyan-400" : "text-slate-400"}>
                    {getNavIcon(item.id, "w-4 h-4")}
                  </span>
                  <span>{item.label}</span>
                  {active && (
                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_#4cd7f6]" />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Section: Studio & Mind */}
          <div className="flex flex-col gap-1">
            <span className="px-3 text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold mb-1">
              Studio & Mind
            </span>
            {studioNav.map((item) => {
              const active = isRouteActive(pathname, item.href);
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={`px-3 py-2 rounded-xl flex items-center gap-3 transition-all text-xs font-medium cursor-pointer ${
                    active
                      ? "bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-[0_0_12px_rgba(76,215,246,0.18)] font-bold"
                      : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
                  }`}
                >
                  <span className={active ? "text-cyan-400" : "text-slate-400"}>
                    {getNavIcon(item.id, "w-4 h-4")}
                  </span>
                  <span>{item.label}</span>
                  {active && (
                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_#4cd7f6]" />
                  )}
                </Link>
              );
            })}
          </div>
        </div>

        {/* User Account / Status Dock */}
        <div className="p-3 border-t border-white/[0.06]">
          <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="relative">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-500/30 to-cyan-500/30 border border-white/10 flex items-center justify-center font-bold text-xs text-white">
                  {isAuthenticated ? (user?.email?.charAt(0).toUpperCase() || "U") : "G"}
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-[#0F131C]" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-white truncate">
                  {isAuthenticated ? (user?.email?.split("@")[0] || "User") : "Guest User"}
                </p>
                <div className="flex items-center gap-1 text-[10px] text-slate-400 font-mono truncate">
                  <Radio className="w-2.5 h-2.5 text-emerald-400" />
                  <span>{isAuthenticated ? "Synced" : "Local DB"}</span>
                </div>
              </div>
            </div>

            {isAuthenticated ? (
              <button
                type="button"
                onClick={() => signOut()}
                className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                title="Sign Out"
                aria-label="Sign Out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={openAuthModal}
                className="p-1.5 rounded-lg text-cyan-400 hover:bg-cyan-500/10 transition-colors cursor-pointer"
                title="Sign In"
                aria-label="Sign In"
              >
                <LogIn className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* ─── Top Header Bar ─── */}
      <Header onOpenAuth={openAuthModal} onOpenSearch={openCommandPalette} />

      {/* ─── Main Viewport ─── */}
      <main
        ref={mainRef}
        className="swipe-container flex-1 w-full overflow-y-auto overflow-x-hidden scroll-smooth pb-28 lg:pb-12 touch-pan-y relative pt-20 sm:pt-22 px-3 sm:px-6 lg:px-8 max-w-7xl mx-auto lg:ml-64 lg:max-w-[calc(100%-16rem)]"
      >
        <div key={pathname} className="w-full animate-fadeIn">
          {children}
        </div>
      </main>

      {/* ─── Ergonomic Floating Bottom Navigation Bar (Mobile < LG) ─── */}
      <nav
        aria-label="Mobile Navigation"
        className="lg:hidden fixed bottom-3 left-1/2 -translate-x-1/2 w-[95%] max-w-md rounded-2xl liquid-glass border border-white/[0.12] shadow-[0_16px_40px_rgba(0,0,0,0.8)] z-50 flex items-center justify-between p-1.5"
      >
        {NAV_ITEMS.map((item) => {
          const active = isRouteActive(pathname, item.href);
          return (
            <Link
              key={item.id}
              href={item.href}
              className={`flex-1 flex flex-col items-center justify-center py-1.5 px-0.5 rounded-xl transition-all active:scale-90 ${
                active
                  ? "bg-cyan-500/20 text-cyan-300 shadow-[0_0_10px_rgba(76,215,246,0.3)] font-bold"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <span className="leading-none mb-0.5">
                {getNavIcon(item.id, "w-4 h-4")}
              </span>
              <span className="text-[8.5px] tracking-tight leading-none">
                {item.shortLabel}
              </span>
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
