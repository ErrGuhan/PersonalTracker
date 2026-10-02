"use client";

import HabitTrackerWidget from "@/components/HabitTrackerWidget";

export default function RoutinesView() {
  return (
    <div className="flex flex-col gap-5 w-full pt-3">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="m3-chip m3-chip-selected text-[10px]">Habits</span>
        </div>
        <h2 className="text-xl font-extrabold text-white tracking-tight">Routines & Habits</h2>
      </div>
      <HabitTrackerWidget />
    </div>
  );
}
