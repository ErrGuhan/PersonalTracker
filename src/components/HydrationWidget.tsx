"use client";

import { motion } from "framer-motion";
import { useHydration } from "@/hooks/useSupabase";
import { Droplet } from "lucide-react";

export default function HydrationWidget() {
  const { hydration, addWater } = useHydration();

  const pct = Math.min(100, Math.round((hydration.amountMl / hydration.targetMl) * 100));

  return (
    <div className="bg-[#0F172A]/60 backdrop-blur-xl border border-white/10 shadow-2xl rounded-2xl p-6 flex flex-col justify-between h-full relative overflow-hidden">
      {/* Background Ambient Fluid Glow */}
      <div className="absolute -top-12 -right-12 w-36 h-36 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

      <div>
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.3)]">
              <Droplet className="w-4 h-4 fill-cyan-400/40" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white tracking-tight">Hydration Tracker</h3>
              <p className="text-[10px] uppercase tracking-widest text-slate-400 font-mono">Daily Fluid Intake</p>
            </div>
          </div>

          <span className="font-mono text-xs text-cyan-400 font-extrabold bg-cyan-500/15 px-2.5 py-1 rounded-xl border border-cyan-500/30 shadow-[0_0_10px_rgba(6,182,212,0.2)]">
            {pct}% Reached
          </span>
        </div>

        {/* Oversized Bold Numeric Counter */}
        <div className="flex items-baseline gap-2.5 my-3">
          <span className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white">{hydration.amountMl}</span>
          <span className="text-xs text-slate-400 font-mono uppercase tracking-widest">/ {hydration.targetMl} ML</span>
        </div>

        {/* Animated Fluid Progress Bar */}
        <div className="w-full bg-slate-900/80 h-3.5 rounded-full overflow-hidden my-4 p-0.5 border border-white/5">
          <motion.div
            className="bg-gradient-to-r from-cyan-500 via-teal-400 to-blue-500 h-full rounded-full shadow-[0_0_15px_rgba(6,182,212,0.6)]"
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
          />
        </div>
      </div>

      {/* Tactile Quick Add Buttons */}
      <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-white/10">
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.92 }}
          onClick={() => addWater(250)}
          className="flex flex-col items-center justify-center p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 transition cursor-pointer shadow-lg"
        >
          <span className="text-xs font-extrabold text-white">+250 ml</span>
          <span className="text-[10px] uppercase tracking-widest text-slate-400 font-mono mt-0.5">Glass</span>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.92 }}
          onClick={() => addWater(500)}
          className="flex flex-col items-center justify-center p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 transition cursor-pointer shadow-lg"
        >
          <span className="text-xs font-extrabold text-white">+500 ml</span>
          <span className="text-[10px] uppercase tracking-widest text-slate-400 font-mono mt-0.5">Bottle</span>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.92 }}
          onClick={() => addWater(750)}
          className="flex flex-col items-center justify-center p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 transition cursor-pointer shadow-lg"
        >
          <span className="text-xs font-extrabold text-white">+750 ml</span>
          <span className="text-[10px] uppercase tracking-widest text-slate-400 font-mono mt-0.5">Thermos</span>
        </motion.button>
      </div>
    </div>
  );
}
