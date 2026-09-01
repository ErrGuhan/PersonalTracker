"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  Zap, 
  Calendar, 
  Plus, 
  BookOpen, 
  Flame, 
  Smile, 
  Award,
  Check,
  RotateCcw
} from "lucide-react";
import HeroTriad from "@/components/HeroTriad";
import ProgressiveRings from "@/components/ProgressiveRings";
import HoldToCommitButton from "@/components/HoldToCommitButton";
import CalendarCarousel from "@/components/CalendarCarousel";
import type { Habit, HabitLog, SleepLog, HealthMetric } from "@/lib/database.types";

interface HomeCommandCenterProps {
  habits: Habit[];
  habitLogs: HabitLog[];
  studyMins: number;
  caloriesBurned: number;
  sleepData: SleepLog | null;
  metrics: HealthMetric | null;
  onCompleteHabit: (id: string) => void;
  onOpenQuickAction: () => void;
  onOpenStudyModal: () => void;
  onOpenWorkoutModal: () => void;
  onOpenSleepModal: () => void;
}

export default function HomeCommandCenter({
  habits,
  habitLogs,
  studyMins,
  caloriesBurned,
  sleepData,
  metrics,
  onCompleteHabit,
  onOpenQuickAction,
  onOpenStudyModal,
  onOpenWorkoutModal,
  onOpenSleepModal,
}: HomeCommandCenterProps) {
  const [selectedDateStr, setSelectedDateStr] = useState<string>(
    () => new Date().toISOString().split("T")[0]
  );

  // Reflection Widget State
  const [mood, setMood] = useState<string | null>(null);
  const [winOfDay, setWinOfDay] = useState("");
  const [reflectionSaved, setReflectionSaved] = useState(false);

  // Priorities State (Top 3 items)
  const [completedPriorities, setCompletedPriorities] = useState<string[]>([]);

  const togglePriority = (id: string) => {
    setCompletedPriorities((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const completedHabitsCount = habits.filter((h) => h.completedToday).length;
  const maxStreakDays = habits.reduce((max, h) => Math.max(max, h.streak), 0);
  const totalHabits = habits.length;

  // Life Score Calculation (0..100) based on alignment with targets
  const lifeScoreResult = useMemo(() => {
    if (totalHabits === 0 && studyMins === 0 && caloriesBurned === 0 && !sleepData) {
      return null; // Not enough data yet
    }

    const habitPct = totalHabits > 0 ? (completedHabitsCount / totalHabits) * 35 : 0;
    const studyPct = Math.min(1, studyMins / 180) * 25;
    const burnPct = Math.min(1, caloriesBurned / 2000) * 25;
    const sleepPct = Math.min(1, (sleepData?.hours ?? 0) / 8) * 15;

    const score = Math.round(habitPct + studyPct + burnPct + sleepPct);
    return Math.min(100, Math.max(0, score));
  }, [totalHabits, completedHabitsCount, studyMins, caloriesBurned, sleepData]);

  // Greeting based on current hour
  const greeting = useMemo(() => {
    const hr = new Date().getHours();
    if (hr < 12) return "Good morning";
    if (hr < 18) return "Good afternoon";
    return "Good evening";
  }, []);

  const dateLabel = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="flex flex-col gap-6 w-full max-w-full pb-16">
      {/* 1. GREETING & LIFE SCORE COMMAND HEADER */}
      <div className="glass-primary p-6 sm:p-7 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col gap-1.5 z-10">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-cyan-400 uppercase font-bold tracking-widest bg-cyan-500/10 px-2.5 py-0.5 rounded-lg border border-cyan-500/20">
              {dateLabel}
            </span>
            <span className="text-xs font-mono text-slate-400">· Consistency 84% this week</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
            {greeting}, <span className="text-gradient-cyan">Alex</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            Your personal operating system is synchronized and tracking active routines.
          </p>
        </div>

        {/* LIFE SCORE BADGE */}
        <div className="glass-secondary p-4 sm:p-5 rounded-2xl border border-white/10 flex items-center gap-4 shrink-0 z-10">
          <div className="flex flex-col items-center justify-center">
            {lifeScoreResult !== null ? (
              <span className="text-3xl sm:text-4xl font-black font-mono text-gradient-cyan">
                {lifeScoreResult}
              </span>
            ) : (
              <span className="text-xl font-bold font-mono text-slate-400">—</span>
            )}
            <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-wider">
              Life Score
            </span>
          </div>

          <div className="h-10 w-px bg-white/10" />

          <div className="flex flex-col gap-1 text-xs">
            <span className="font-bold text-white">
              {lifeScoreResult !== null ? "Alignment: High" : "Not enough data"}
            </span>
            <span className="text-[11px] text-slate-400">
              {lifeScoreResult !== null ? "Goal target performance" : "Log activities to calculate"}
            </span>
          </div>
        </div>
      </div>

      {/* 2. HERO TRIAD BENTO CARDS */}
      <HeroTriad
        studyMins={studyMins}
        caloriesBurned={caloriesBurned}
        sleepHours={sleepData?.hours ?? null}
        recoveryScore={metrics?.recovery_score ?? 87}
        onOpenStudy={onOpenStudyModal}
        onOpenWorkout={onOpenWorkoutModal}
        onOpenSleep={onOpenSleepModal}
      />

      {/* 3. TODAY'S PRIORITIES & NEXT RECOMMENDED ACTION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Today's Priorities */}
        <div className="lg:col-span-7 glass-primary p-5 sm:p-6 rounded-2xl flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div>
              <h3 className="font-extrabold text-base text-white tracking-tight flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                Today's Priorities
              </h3>
              <p className="text-xs text-slate-400">Top 3 high-impact tasks for maximum daily momentum.</p>
            </div>
            <span className="text-xs font-mono text-cyan-400 font-bold bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
              {completedPriorities.length} / 3 Done
            </span>
          </div>

          <div className="flex flex-col gap-2.5">
            {[
              { id: "p1", title: "Complete DBMS Focus Session (30 mins)", cat: "Study" },
              { id: "p2", title: "Active Cardio / 30 Min Workout Session", cat: "Fitness" },
              { id: "p3", title: "Reach 2,500ml Hydration Goal", cat: "Health" },
            ].map((p) => {
              const isDone = completedPriorities.includes(p.id);

              return (
                <motion.div
                  key={p.id}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => togglePriority(p.id)}
                  className={`p-3.5 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
                    isDone
                      ? "bg-slate-900/40 border-white/5 opacity-50 line-through"
                      : "bg-white/[0.04] border-white/10 hover:border-cyan-500/40 text-white"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-5 h-5 rounded-full border flex items-center justify-center text-xs transition-all ${
                        isDone ? "bg-cyan-400 border-cyan-400 text-slate-950" : "border-white/30"
                      }`}
                    >
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                    <span className="text-xs font-bold">{p.title}</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">{p.cat}</span>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Next Action Recommendation */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="glass-primary p-5 sm:p-6 rounded-2xl flex flex-col justify-between gap-4 h-full relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/15 rounded-full blur-2xl pointer-events-none" />

            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-lg border border-cyan-500/20 self-start flex items-center gap-1">
                <Zap className="w-3 h-3" /> Next Suggested Action
              </span>

              <h4 className="text-lg font-black text-white tracking-tight mt-1">
                Start your 25-minute DBMS focus session
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                You complete 24% more study material on days you start focus sessions before 6:00 PM.
              </p>
            </div>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={onOpenStudyModal}
              className="py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 hover:opacity-90 transition cursor-pointer shadow-[0_0_15px_rgba(6,182,212,0.4)]"
            >
              Start Focus Session <ArrowRight className="w-4 h-4" />
            </motion.button>
          </div>
        </div>
      </div>

      {/* 4. DAILY TIMELINE & PROGRESS RINGS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Daily Timeline */}
        <div className="lg:col-span-8 glass-primary p-5 sm:p-6 rounded-2xl flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div>
              <h3 className="font-extrabold text-base text-white tracking-tight flex items-center gap-2">
                <Calendar className="w-4 h-4 text-cyan-400" />
                Chronological Daily Timeline
              </h3>
              <p className="text-xs text-slate-400">Structured log of daily routines & milestones.</p>
            </div>
            <button
              onClick={onOpenQuickAction}
              className="text-xs font-bold text-cyan-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Log Action
            </button>
          </div>

          <div className="flex flex-col gap-3">
            {[
              { time: "08:00 AM", title: "Morning Hydration & Routine", status: "Done", icon: <CheckCircle2 className="w-4 h-4 text-emerald-400" /> },
              { time: "10:30 AM", title: "DBMS Unit 4 Focus Session", status: "Done", icon: <BookOpen className="w-4 h-4 text-cyan-400" /> },
              { time: "05:00 PM", title: "Active 30-Min Cardio Workout", status: "Upcoming", icon: <Flame className="w-4 h-4 text-orange-400" /> },
              { time: "09:30 PM", title: "Evening Reflection & Sleep Prep", status: "Upcoming", icon: <Smile className="w-4 h-4 text-purple-400" /> },
            ].map((t, idx) => (
              <div key={idx} className="flex items-center gap-4 p-3 rounded-xl bg-white/[0.03] border border-white/5">
                <span className="text-xs font-mono text-slate-400 w-20 shrink-0">{t.time}</span>
                <div className="p-1.5 rounded-lg bg-white/5">{t.icon}</div>
                <span className="text-xs font-bold text-white flex-1">{t.title}</span>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                  t.status === "Done" ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" : "bg-white/5 border-white/10 text-slate-400"
                }`}>
                  {t.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Progress Rings & Hold to Commit Button */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <ProgressiveRings
            completedCount={completedHabitsCount}
            totalCount={totalHabits}
            streakDays={maxStreakDays}
          />
          <HoldToCommitButton
            label="Hold 1.5s to Commit Day Goals"
            onCommit={() => console.log("Day committed successfully!")}
          />
        </div>
      </div>

      {/* 5. LIGHTWEIGHT EVENING REFLECTION WIDGET */}
      <div className="glass-primary p-5 sm:p-6 rounded-2xl flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div>
            <h3 className="font-extrabold text-base text-white tracking-tight flex items-center gap-2">
              <Smile className="w-4 h-4 text-purple-400" />
              Lightweight Evening Reflection
            </h3>
            <p className="text-xs text-slate-400">Quick 30-second check-in to close out your day.</p>
          </div>
          {reflectionSaved && (
            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
              <Check className="w-3.5 h-3.5" /> Saved
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-slate-300">How was your mood today?</label>
            <div className="flex gap-2">
              {["😁 Great", "🙂 Good", "😐 Neutral", "😓 Tired"].map((m) => (
                <button
                  key={m}
                  onClick={() => setMood(m)}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                    mood === m
                      ? "bg-purple-500/20 border-purple-400 text-purple-300 font-bold"
                      : "bg-white/5 border-white/10 text-slate-400 hover:text-white"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-slate-300">What went well today? (Optional)</label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. Finished Chapter 4 & stayed hydrated"
                value={winOfDay}
                onChange={(e) => setWinOfDay(e.target.value)}
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-purple-400 transition"
              />
              <button
                onClick={() => setReflectionSaved(true)}
                className="px-4 py-2 bg-purple-500/20 border border-purple-400/40 text-purple-300 font-bold text-xs rounded-xl hover:bg-purple-500/30 transition cursor-pointer"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
