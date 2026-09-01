"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import HabitTrackerWidget from "@/components/HabitTrackerWidget";
import FocusTimer from "@/components/FocusTimer";
import HydrationWidget from "@/components/HydrationWidget";
import { Flame, BookOpen, Heart, Utensils, CheckCircle2, Droplet } from "lucide-react";
import type { Habit } from "@/lib/database.types";

interface TrackViewProps {
  habits: Habit[];
  onOpenWorkoutModal: () => void;
  onOpenStudyModal: () => void;
  onOpenSleepModal: () => void;
  onOpenNutritionModal: () => void;
}

export default function TrackView({
  habits,
  onOpenWorkoutModal,
  onOpenStudyModal,
  onOpenSleepModal,
  onOpenNutritionModal,
}: TrackViewProps) {
  const [subTab, setSubTab] = useState<"habits" | "study" | "fitness" | "fuel">("habits");

  return (
    <div className="flex flex-col gap-6 w-full pb-16">
      {/* Sub-Tab Navigation Header */}
      <div className="glass-primary p-3 rounded-2xl flex items-center justify-around gap-2 overflow-x-auto no-scrollbar">
        {[
          { id: "habits", label: "Habits & Routines", icon: <CheckCircle2 className="w-4 h-4" /> },
          { id: "study", label: "Study Studio", icon: <BookOpen className="w-4 h-4" /> },
          { id: "fitness", label: "Fitness Hub", icon: <Flame className="w-4 h-4" /> },
          { id: "fuel", label: "Fuel & Hydration", icon: <Utensils className="w-4 h-4" /> },
        ].map((item) => {
          const isActive = subTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setSubTab(item.id as typeof subTab)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                isActive
                  ? "bg-cyan-500/20 border border-cyan-400 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.25)]"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Sub-Tab Content rendering */}
      {subTab === "habits" && <HabitTrackerWidget />}
      {subTab === "study" && <FocusTimer />}
      {subTab === "fitness" && (
        <div className="glass-primary p-6 rounded-2xl flex flex-col gap-4">
          <h3 className="font-extrabold text-base text-white">Fitness & Workout Hub</h3>
          <p className="text-xs text-slate-400">Track active workout sessions and calories burned.</p>
          <button
            onClick={onOpenWorkoutModal}
            className="py-3 px-4 bg-gradient-to-r from-orange-400 to-amber-500 text-slate-950 font-bold text-xs rounded-xl self-start hover:opacity-90 transition cursor-pointer"
          >
            + Log New Workout
          </button>
        </div>
      )}
      {subTab === "fuel" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <HydrationWidget />
          <div className="glass-primary p-6 rounded-2xl flex flex-col gap-4 justify-between">
            <div>
              <h3 className="font-extrabold text-base text-white">Meal & Macro Tracker</h3>
              <p className="text-xs text-slate-400">Log meals with automated calorie estimation.</p>
            </div>
            <button
              onClick={onOpenNutritionModal}
              className="py-3 px-4 bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-bold text-xs rounded-xl hover:opacity-90 transition cursor-pointer"
            >
              + Log Meal
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
