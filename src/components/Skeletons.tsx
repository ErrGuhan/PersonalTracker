"use client";

import { motion } from "framer-motion";

const skeletonPulse = {
  opacity: [0.3, 0.7, 0.3],
  transition: { duration: 1.5, repeat: Infinity, ease: "easeInOut" as const },
};

export function MetricCardSkeleton() {
  return (
    <div className="glass-secondary p-4 rounded-2xl flex flex-col gap-3 relative overflow-hidden h-28">
      <motion.div className="h-4 w-1/3 bg-white/10 rounded-md" animate={skeletonPulse} />
      <motion.div className="h-8 w-2/3 bg-white/20 rounded-lg my-1" animate={skeletonPulse} />
      <motion.div className="h-2 w-full bg-white/10 rounded-full" animate={skeletonPulse} />
    </div>
  );
}

export function HabitCardSkeleton() {
  return (
    <div className="glass-secondary p-4 rounded-xl flex items-center justify-between gap-4 h-16">
      <div className="flex items-center gap-3 w-full">
        <motion.div className="w-6 h-6 rounded-full bg-white/20 shrink-0" animate={skeletonPulse} />
        <div className="flex flex-col gap-2 w-full">
          <motion.div className="h-4 w-1/2 bg-white/20 rounded-md" animate={skeletonPulse} />
          <motion.div className="h-3 w-1/4 bg-white/10 rounded-md" animate={skeletonPulse} />
        </div>
      </div>
    </div>
  );
}

export function CalendarSkeleton() {
  return (
    <div className="flex gap-2 overflow-hidden py-2">
      {[1, 2, 3, 4, 5, 6, 7].map((i) => (
        <motion.div
          key={i}
          className="w-14 h-16 rounded-xl bg-white/10 shrink-0"
          animate={skeletonPulse}
        />
      ))}
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-6 w-full max-w-full overflow-hidden animate-pulse">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCardSkeleton />
        <MetricCardSkeleton />
        <MetricCardSkeleton />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 flex flex-col gap-3">
          <HabitCardSkeleton />
          <HabitCardSkeleton />
          <HabitCardSkeleton />
        </div>
        <div className="lg:col-span-4">
          <MetricCardSkeleton />
        </div>
      </div>
    </div>
  );
}
