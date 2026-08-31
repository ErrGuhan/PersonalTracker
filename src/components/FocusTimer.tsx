"use client";

import { useState, useEffect } from "react";

interface FocusTimerProps {
  initialMinutes?: number;
  onSessionComplete?: () => void;
}

export default function FocusTimer({ initialMinutes = 25, onSessionComplete }: FocusTimerProps) {
  const [total] = useState(initialMinutes * 60);
  const [remaining, setRemaining] = useState(initialMinutes * 60);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running) return;

    const id = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(id);
          setRunning(false);
          onSessionComplete?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(id);
  }, [running, onSessionComplete]);

  const progress = 1 - remaining / total;
  const mins = Math.floor(remaining / 60).toString().padStart(2, "0");
  const secs = (remaining % 60).toString().padStart(2, "0");

  const size = 200;
  const sw = 10;
  const r = (size - sw) / 2;
  const center = size / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - progress * circ;

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="rotate-[-90deg]">
          <defs>
            <linearGradient id="focus-grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#06b6d4" />
              <stop offset="100%" stopColor="#4cd7f6" />
            </linearGradient>
            <filter id="focus-glow">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>
          <circle cx={center} cy={center} r={r + 8} fill="none" stroke="rgba(76,215,246,0.04)" strokeWidth={1} strokeDasharray="4 8" />
          <circle cx={center} cy={center} r={r} fill="none" stroke="rgba(76,215,246,0.1)" strokeWidth={sw} />
          <circle cx={center} cy={center} r={r}
            fill="none" stroke="url(#focus-grad)" strokeWidth={sw} strokeLinecap="round"
            strokeDasharray={circ} strokeDashoffset={offset}
            filter="url(#focus-glow)"
            style={{ transition: "stroke-dashoffset 0.8s ease" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
          <span className="label-caps" style={{ color: "#4cd7f6", fontSize: 10 }}>FOCUS</span>
          <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: 40, fontWeight: 700, color: "#ffffff", lineHeight: 1, letterSpacing: "-0.02em" }}>
            {mins}:{secs}
          </span>
          <span className="label-caps" style={{ fontSize: 9 }}>
            {running ? "SESSION ACTIVE" : remaining === total ? "READY" : "PAUSED"}
          </span>
        </div>
      </div>
      <div className="flex gap-3">
        <button
          className="px-5 py-2 rounded-xl bg-white/5 border border-white/10 text-on-surface-variant hover:text-on-surface text-xs font-semibold transition cursor-pointer"
          onClick={() => { setRemaining(total); setRunning(false); }}
        >
          Reset
        </button>
        <button
          className="px-6 py-2 rounded-xl bg-primary text-on-primary text-xs font-bold shadow-[0_0_15px_rgba(76,215,246,0.4)] hover:bg-primary/90 transition cursor-pointer"
          onClick={() => setRunning((r) => !r)}
        >
          {running ? "Pause" : "Start"}
        </button>
      </div>
    </div>
  );
}
