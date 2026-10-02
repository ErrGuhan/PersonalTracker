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
  LogIn,
  LogOut,
  Radio,
} from "lucide-react";

function getNavIcon(id: string, size = "w-5 h-5") {
  switch (id) {
    case "dashboard":  return <LayoutDashboard className={size} />;
    case "fitness":    return <Dumbbell className={size} />;
    case "health":     return <Activity className={size} />;
    case "nutrition":  return <Utensils className={size} />;
    case "study":      return <BookOpen className={size} />;
    case "routines":   return <CalendarCheck className={size} />;
    case "goals":      return <Target className={size} />;
    default:           return <Zap className={size} />;
  }
}

/* ─── M3 Nav Destination (mobile bottom bar item) ─── */
function NavDest({ item, active }: { item: typeof NAV_ITEMS[number]; active: boolean }) {
  return (
    <Link
      href={item.href}
      className={`relative flex-1 flex flex-col items-center justify-center py-2 gap-0.5 transition-colors
        ${active ? "text-cyan-300" : "text-slate-400 hover:text-slate-200"}`}
      aria-label={item.label}
    >
      {active && (
        <span
          className="absolute top-0.5 left-1/2 -translate-x-1/2 h-8 w-16 rounded-2xl bg-cyan-500/15 pointer-events-none"
          aria-hidden
        />
      )}
      <span className="relative z-10 leading-none">{getNavIcon(item.id, "w-5 h-5")}</span>
      <span className="relative z-10 text-[9px] font-medium leading-none tracking-tight">{item.shortLabel}</span>
    </Link>
  );
}

/* ─── M3 Nav Item (desktop sidebar) ─── */
function SidebarItem({ item, active }: { item: typeof NAV_ITEMS[number]; active: boolean }) {
  return (
    <Link
      href={item.href}
      className={`m3-nav-item ${active ? "m3-nav-item-active" : ""}`}
      aria-current={active ? "page" : undefined}
    >
      <span className={active ? "text-cyan-400" : "text-slate-400"}>
        {getNavIcon(item.id, "w-4 h-4")}
      </span>
      <span>{item.label}</span>
      {active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-cyan-400" aria-hidden />}
    </Link>
  );
}

function AppShellContent({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const mainRef = useRef<HTMLElement | null>(null);
  const { user, isAuthenticated, signOut } = useAuthContext();
  const { openAuthModal, openCommandPalette } = useModals();

  useSwipeNavigation(mainRef);

  const coreNav  = NAV_ITEMS.filter(i => ["dashboard","fitness","health","nutrition"].includes(i.id));
  const studioNav = NAV_ITEMS.filter(i => ["study","routines","goals"].includes(i.id));

  return (
    <div className="flex-1 flex flex-col h-full w-full relative overflow-hidden ion-ambient text-[#DFE2EE]">

      {/* ── M3 NavigationDrawer (desktop ≥ lg) ── */}
      <aside
        aria-label="Main navigation"
        className="m3-nav-drawer hidden lg:flex flex-col fixed left-0 top-0 h-full z-40 w-60"
      >
        {/* Brand */}
        <div className="px-4 py-5 border-b border-white/[0.05]">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center text-slate-950 font-black shadow-[0_0_14px_rgba(76,215,246,0.3)] group-hover:scale-105 transition-transform">
              <Zap className="w-4 h-4 fill-slate-950 stroke-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-sm tracking-tight text-white">LifeSync</span>
                <span className="text-[9px] font-mono font-bold px-1.5 rounded bg-cyan-400/15 text-cyan-300 border border-cyan-400/20">OS</span>
              </div>
              <span className="text-[9px] text-slate-400 font-mono uppercase tracking-widest">90-Day Tracker</span>
            </div>
          </Link>
        </div>

        {/* Nav sections */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 flex flex-col gap-6">
          <div className="flex flex-col gap-0.5">
            <span className="px-4 text-[9px] font-mono uppercase tracking-widest text-slate-500 font-bold mb-1">Body</span>
            {coreNav.map(item => (
              <SidebarItem key={item.id} item={item} active={isRouteActive(pathname, item.href)} />
            ))}
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="px-4 text-[9px] font-mono uppercase tracking-widest text-slate-500 font-bold mb-1">Mind</span>
            {studioNav.map(item => (
              <SidebarItem key={item.id} item={item} active={isRouteActive(pathname, item.href)} />
            ))}
          </div>
        </nav>

        {/* User dock */}
        <div className="p-3 border-t border-white/[0.05]">
          <div className="flex items-center gap-2.5 px-2 py-2">
            <div className="relative">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-500/30 to-cyan-500/30 border border-white/10 flex items-center justify-center font-bold text-xs text-white">
                {isAuthenticated ? (user?.email?.charAt(0).toUpperCase() ?? "U") : "G"}
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-[#0A0E16]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate">
                {isAuthenticated ? (user?.email?.split("@")[0] ?? "User") : "Guest"}
              </p>
              <div className="flex items-center gap-1 text-[9px] text-slate-400 font-mono">
                <Radio className="w-2.5 h-2.5 text-emerald-400" />
                <span>{isAuthenticated ? "Synced" : "Local"}</span>
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

      {/* ── M3 TopAppBar ── */}
      <Header onOpenAuth={openAuthModal} onOpenSearch={openCommandPalette} />

      {/* ── Main Viewport ── */}
      <main
        ref={mainRef}
        className="swipe-container flex-1 w-full overflow-y-auto overflow-x-hidden pb-24 lg:pb-8 touch-pan-y pt-16 px-3 sm:px-5 lg:px-6 lg:ml-60 lg:max-w-[calc(100%-15rem)]"
      >
        <div key={pathname} className="w-full max-w-5xl mx-auto ion-fadein">
          {children}
        </div>
      </main>

      {/* ── M3 NavigationBar (mobile < lg) ── */}
      <nav
        aria-label="Mobile navigation"
        className="m3-nav-bar lg:hidden fixed bottom-0 left-0 right-0 z-50 flex items-center px-2 pb-safe"
        style={{ paddingBottom: "max(env(safe-area-inset-bottom), 8px)" }}
      >
        {NAV_ITEMS.map(item => (
          <NavDest key={item.id} item={item} active={isRouteActive(pathname, item.href)} />
        ))}
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
