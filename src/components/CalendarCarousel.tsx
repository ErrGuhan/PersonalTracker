"use client";

import { useMemo, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Calendar as CalendarIcon } from "lucide-react";

interface CalendarCarouselProps {
  selectedDate: string; // YYYY-MM-DD
  onSelectDate: (dateStr: string) => void;
  daysCount?: number;
}

export default function CalendarCarousel({
  selectedDate,
  onSelectDate,
  daysCount = 14,
}: CalendarCarouselProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Safe date label formatter preventing "Invalid Date"
  const formattedDateLabel = useMemo(() => {
    try {
      const d = new Date(selectedDate);
      if (isNaN(d.getTime())) return "Today";
      return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    } catch {
      return "Today";
    }
  }, [selectedDate]);

  // Generate date items for past N days up to today
  const datesList = useMemo(() => {
    const list: Array<{ dateStr: string; dayName: string; dayNum: number; isToday: boolean }> = [];
    const todayStr = new Date().toISOString().split("T")[0];

    for (let i = daysCount - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      const dayName = d.toLocaleDateString("en-US", { weekday: "short" });
      const dayNum = d.getDate();

      list.push({
        dateStr,
        dayName,
        dayNum,
        isToday: dateStr === todayStr,
      });
    }
    return list;
  }, [daysCount]);

  // Center active date on mount
  useEffect(() => {
    if (containerRef.current) {
      const activeEl = containerRef.current.querySelector('[data-selected="true"]');
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
      }
    }
  }, [selectedDate]);

  return (
    <div className="glass-primary p-4 rounded-2xl flex flex-col gap-3 relative overflow-hidden">
      {/* Header Title */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-bold font-mono uppercase tracking-wider text-white">
            Daily Timeline
          </span>
        </div>

        <span className="text-[11px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
          {formattedDateLabel}
        </span>
      </div>

      {/* Horizontal Carousel with CSS Scroll Snapping */}
      <div
        ref={containerRef}
        className="flex items-center gap-2.5 overflow-x-auto snap-x snap-mandatory scrollbar-none py-1.5 px-0.5 cursor-grab active:cursor-grabbing"
      >
        {datesList.map((item) => {
          const isSelected = item.dateStr === selectedDate;

          return (
            <motion.button
              key={item.dateStr}
              data-selected={isSelected}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onSelectDate(item.dateStr)}
              className={`snap-center shrink-0 w-14 h-16 rounded-xl flex flex-col items-center justify-center gap-1 border transition-all duration-200 cursor-pointer ${
                isSelected
                  ? "bg-gradient-to-br from-cyan-400 to-blue-500 border-cyan-300 text-slate-950 font-bold shadow-[0_0_15px_rgba(6,182,212,0.6)]"
                  : item.isToday
                  ? "bg-cyan-950/40 border-cyan-500/40 text-cyan-300"
                  : "bg-white/[0.04] border-white/10 text-slate-400 hover:text-white hover:bg-white/10"
              }`}
            >
              <span className="text-[10px] font-mono uppercase tracking-wider opacity-80">
                {item.dayName}
              </span>
              <span className="text-base font-mono font-extrabold tracking-tight">
                {item.dayNum}
              </span>
              {item.isToday && !isSelected && (
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
