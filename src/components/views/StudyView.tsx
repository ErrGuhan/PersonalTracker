"use client";

import FocusTimer from "@/components/FocusTimer";
import StudyHeatmap from "@/components/StudyHeatmap";
import { useModals } from "@/context/ModalContext";
import { useStudyStats } from "@/hooks/useSupabase";
import { Clock, Flame, CheckSquare, Award, Plus } from "lucide-react";

const Sk = ({ w = "w-12", h = "h-5" }: { w?: string; h?: string }) => (
  <span className={`ion-skeleton inline-block rounded ${w} ${h}`} />
);

export default function StudyView() {
  const { openStudyModal } = useModals();
  const { data: studyStats, loading, refetch } = useStudyStats();

  const todayHours   = ((studyStats?.todayMinutes || 0) / 60).toFixed(1);
  const streakDays   = studyStats?.streakDays ?? 0;
  const totalSessions = studyStats?.totalSessions ?? 0;

  return (
    <div className="flex flex-col gap-5 w-full pt-3">

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="m3-chip m3-chip-selected text-[10px]">Study</span>
          </div>
          <h2 className="text-xl font-extrabold text-white tracking-tight">Study Studio</h2>
        </div>
        <button
          onClick={openStudyModal}
          className="m3-fab m3-fab-small"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          Log
        </button>
      </div>

      {/* ── Focus Timer ── */}
      <section className="m3-surface-glass rounded-2xl p-6 flex justify-center relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-cyan-500/[0.06] rounded-full blur-3xl pointer-events-none" />
        <FocusTimer initialMinutes={25} onSessionComplete={refetch} />
      </section>

      {/* ── KPIs ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { icon: Clock,       value: loading ? null : `${todayHours}h`,       label: "Today",    color: "text-cyan-400",   bg: "bg-cyan-400/10"   },
          { icon: Flame,       value: loading ? null : streakDays,              label: "Streak",   color: "text-amber-400",  bg: "bg-amber-400/10"  },
          { icon: CheckSquare, value: loading ? null : totalSessions,           label: "Sessions", color: "text-violet-300", bg: "bg-violet-400/10" },
          { icon: Award,       value: loading ? null : "Active",                label: "Status",   color: "text-cyan-400",   bg: "bg-cyan-400/10"   },
        ].map(({ icon: Icon, value, label, color, bg }) => (
          <div key={label} className="ion-kpi-tile text-center items-center">
            <div className={`w-7 h-7 rounded-xl ${bg} flex items-center justify-center ${color} mx-auto`}>
              <Icon className="w-3.5 h-3.5" />
            </div>
            {value === null ? <Sk w="w-10" h="h-6" /> : (
              <span className="text-xl font-black text-white font-mono">{value}</span>
            )}
            <span className="text-[9px] font-mono uppercase tracking-wider text-slate-400">{label}</span>
          </div>
        ))}
      </div>

      {/* ── Heatmap ── */}
      <section className="m3-surface-glass rounded-2xl p-4">
        <h3 className="font-semibold text-sm text-white mb-3">16-Week Consistency</h3>
        <StudyHeatmap data={studyStats?.heatmapData} />
      </section>

    </div>
  );
}
