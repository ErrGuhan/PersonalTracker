"use client";

interface NavItem {
  id: string;
  icon: string;
  label: string;
  accent?: "cyan" | "orange" | "violet";
}

const NAV_ITEMS: NavItem[] = [
  { id: "overview",  icon: "⬡",  label: "Overview",  accent: "cyan"   },
  { id: "fitness",   icon: "🔥",  label: "Fitness",   accent: "orange" },
  { id: "study",     icon: "📚",  label: "Study",     accent: "cyan"   },
  { id: "health",    icon: "💜",  label: "Health",    accent: "violet" },
  { id: "goals",     icon: "🎯",  label: "Goals",     accent: "cyan"   },
];

interface SidebarProps {
  active: string;
  onNav: (id: string) => void;
}

export default function Sidebar({ active, onNav }: SidebarProps) {
  return (
    <aside
      className="hidden lg:flex flex-col h-screen sticky top-0 w-64 shrink-0"
      style={{
        background: "rgba(10, 14, 22, 0.9)",
        backdropFilter: "blur(24px)",
        borderRight: "1px solid rgba(255,255,255,0.05)",
        padding: "24px 16px",
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 mb-10 px-2">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold"
          style={{
            background: "linear-gradient(135deg, #06b6d4, #4cd7f6)",
            color: "#003640",
            boxShadow: "0 0 20px rgba(76,215,246,0.4)",
          }}
        >
          ⚡
        </div>
        <div>
          <p className="font-bold text-sm" style={{ color: "#ffffff", letterSpacing: "-0.01em" }}>
            LifeSync OS
          </p>
          <p className="label-caps" style={{ fontSize: 9, color: "#4cd7f6" }}>PERFORMANCE HUB</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-1 flex-1">
        <p className="label-caps px-2 mb-2" style={{ fontSize: 9 }}>DASHBOARD</p>
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => onNav(item.id)}
            className={`nav-pill w-full text-left ${
              active === item.id
                ? item.accent === "orange"
                  ? "active-orange"
                  : item.accent === "violet"
                  ? "active-violet"
                  : "active"
                : ""
            }`}
          >
            <span className="text-base">{item.icon}</span>
            <span className="text-sm">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* User card at bottom */}
      <div
        className="glass-card p-3 mt-4 flex items-center gap-3"
        style={{ borderTop: "1px solid rgba(76,215,246,0.2)" }}
      >
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-base font-bold shrink-0"
          style={{ background: "linear-gradient(135deg, #5516be, #b395ff)", color: "#fff" }}
        >
          A
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold truncate" style={{ color: "#dfe2ee" }}>Alex Morgan</p>
          <p className="label-caps" style={{ fontSize: 9, color: "#4cd7f6" }}>PRO ATHLETE</p>
        </div>
        <div className="badge-live" style={{ padding: "2px 6px", fontSize: 8 }}>
          LIVE
        </div>
      </div>
    </aside>
  );
}
