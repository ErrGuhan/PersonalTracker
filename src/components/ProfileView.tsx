"use client";

import { useState } from "react";
import { User, Download, Palette, ShieldAlert, LogOut, FileSpreadsheet, FileCode } from "lucide-react";
import ThemeSelector from "@/components/ThemeSelector";
import { exportUserDataJSON } from "@/app/actions/export";

interface ProfileViewProps {
  freezeTokens: number;
}

export default function ProfileView({ freezeTokens }: ProfileViewProps) {
  const [resetConfirm, setResetConfirm] = useState(false);

  const handleExportJSON = async () => {
    try {
      const res = await exportUserDataJSON();
      if (res.jsonContent) {
        const blob = new Blob([res.jsonContent], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = res.filename || `lifesync-os-export-${new Date().toISOString().split("T")[0]}.json`;
        a.click();
      }
    } catch (err) {
      console.error("Export JSON error:", err);
    }
  };

  const handleResetData = () => {
    localStorage.clear();
    window.location.reload();
  };

  return (
    <div className="flex flex-col gap-6 w-full pb-16">
      {/* Header Profile Info */}
      <div className="glass-primary p-6 rounded-2xl flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-slate-950 font-black text-xl shadow-[0_0_20px_rgba(6,182,212,0.4)]">
            A
          </div>
          <div>
            <h2 className="font-extrabold text-xl text-white">Alex Guhan</h2>
            <p className="text-xs text-slate-400">alex@lifesync.app · Rest Tokens: {freezeTokens}</p>
          </div>
        </div>

        <span className="text-xs font-mono font-bold bg-cyan-500/10 text-cyan-400 px-3 py-1.5 rounded-xl border border-cyan-500/20">
          Pro LifeSync OS
        </span>
      </div>

      {/* Theme Selector */}
      <ThemeSelector maxStreak={14} />

      {/* Data Export & Backup */}
      <div className="glass-primary p-6 rounded-2xl flex flex-col gap-4">
        <h3 className="font-extrabold text-base text-white flex items-center gap-2">
          <Download className="w-4 h-4 text-cyan-400" />
          Data Portability & Full Backup
        </h3>
        <p className="text-xs text-slate-400">Download complete structured copy of your tracked activities.</p>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleExportJSON}
            className="py-2.5 px-4 rounded-xl bg-white/10 border border-white/10 hover:border-cyan-400 text-white font-bold text-xs flex items-center gap-2 transition cursor-pointer"
          >
            <FileCode className="w-4 h-4 text-cyan-400" /> Export Full JSON Backup
          </button>
        </div>
      </div>

      {/* Danger Zone / Data Reset */}
      <div className="glass-primary p-6 rounded-2xl flex flex-col gap-4 border-rose-500/30">
        <h3 className="font-extrabold text-base text-rose-400 flex items-center gap-2">
          <ShieldAlert className="w-4 h-4" /> Reset Local Application Data
        </h3>
        <p className="text-xs text-slate-400">Clear all local storage and restore default routines.</p>

        {!resetConfirm ? (
          <button
            onClick={() => setResetConfirm(true)}
            className="py-2.5 px-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 font-bold text-xs hover:bg-rose-500/20 self-start transition cursor-pointer"
          >
            Reset Local Storage Data
          </button>
        ) : (
          <div className="p-4 rounded-xl bg-rose-950/60 border border-rose-500/40 flex flex-col gap-3">
            <p className="text-xs font-bold text-rose-200">
              Are you sure? This will delete all local habit logs, study sessions, and custom goals.
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleResetData}
                className="py-2 px-4 rounded-xl bg-rose-600 text-white font-bold text-xs hover:bg-rose-500 transition cursor-pointer"
              >
                Yes, Reset Everything
              </button>
              <button
                onClick={() => setResetConfirm(false)}
                className="py-2 px-4 rounded-xl bg-white/10 text-slate-300 font-bold text-xs hover:bg-white/20 transition cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
