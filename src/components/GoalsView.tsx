"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Target, Plus, CheckCircle2, Award, ArrowRight } from "lucide-react";
import CreateGoalModal from "@/components/CreateGoalModal";

export default function GoalsView() {
  const [showModal, setShowModal] = useState(false);

  const [goals] = useState([
    {
      id: "g1",
      title: "Achieve 8.5 CGPA in Semester 5",
      category: "Academics",
      targetDate: "2026-12-15",
      progress: 68,
      linkedSignals: ["3h Daily Study", "DBMS Unit Revision", "Assignment Check"],
    },
    {
      id: "g2",
      title: "Run 100 Kilometers This Month",
      category: "Fitness",
      targetDate: "2026-09-30",
      progress: 42,
      linkedSignals: ["Cardio Sessions", "30-Min Active Movement", "Hydration Target"],
    },
  ]);

  return (
    <div className="flex flex-col gap-6 w-full pb-16">
      {/* Header */}
      <div className="glass-primary p-6 rounded-2xl flex items-center justify-between gap-4">
        <div>
          <h2 className="font-extrabold text-xl text-white tracking-tight flex items-center gap-2">
            <Target className="w-5 h-5 text-cyan-400" />
            Goals & Milestones Hub
          </h2>
          <p className="text-xs text-slate-400">Connect long-term objectives to active daily routines.</p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="py-2.5 px-4 rounded-xl bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 font-bold text-xs flex items-center gap-1.5 hover:bg-cyan-500/30 transition cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Create Goal
        </button>
      </div>

      {/* Goals List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {goals.map((g) => (
          <motion.div
            key={g.id}
            whileHover={{ scale: 1.01 }}
            className="glass-primary p-6 rounded-2xl flex flex-col justify-between gap-4 border border-white/10"
          >
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase font-bold text-cyan-400 bg-cyan-500/10 px-2.5 py-0.5 rounded border border-cyan-500/20">
                  {g.category}
                </span>
                <span className="text-xs font-mono text-slate-400">Target: {g.targetDate}</span>
              </div>

              <h3 className="font-extrabold text-base text-white mt-1">{g.title}</h3>
            </div>

            {/* Progress Bar */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-300">Goal Progress</span>
                <span className="text-cyan-400 font-mono">{g.progress}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-500"
                  style={{ width: `${g.progress}%` }}
                />
              </div>
            </div>

            {/* Linked Signals */}
            <div className="flex flex-col gap-2 border-t border-white/10 pt-3">
              <span className="text-[11px] font-bold text-slate-400">Linked Daily Routines:</span>
              <div className="flex flex-wrap gap-1.5">
                {g.linkedSignals.map((s, idx) => (
                  <span key={idx} className="text-[10px] bg-white/5 border border-white/10 text-slate-300 px-2 py-0.5 rounded-lg">
                    ✓ {s}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {showModal && <CreateGoalModal onClose={() => setShowModal(false)} onSaved={() => setShowModal(false)} />}
    </div>
  );
}
