"use client";

import { useState, useEffect, useId } from "react";

interface CircularGaugeProps {
  value: number;       // 0–100
  size?: number;
  strokeWidth?: number;
  color?: "cyan" | "orange" | "violet";
  label?: string;
  sublabel?: string;
  unit?: string;
  animateOnMount?: boolean;
}

const colorMap = {
  cyan: {
    gradient: ["#06b6d4", "#4cd7f6"],
    glow: "rgba(76, 215, 246, 0.5)",
    track: "rgba(76, 215, 246, 0.1)",
  },
  orange: {
    gradient: ["#ec6a06", "#ffb690"],
    glow: "rgba(236, 106, 6, 0.5)",
    track: "rgba(236, 106, 6, 0.1)",
  },
  violet: {
    gradient: ["#5516be", "#b395ff"],
    glow: "rgba(179, 149, 255, 0.5)",
    track: "rgba(179, 149, 255, 0.1)",
  },
};

export default function CircularGauge({
  value,
  size = 140,
  strokeWidth = 12,
  color = "cyan",
  label,
  sublabel,
  unit = "%",
  animateOnMount = true,
}: CircularGaugeProps) {
  const [displayValue, setDisplayValue] = useState(animateOnMount ? 0 : value);
  const [progress, setProgress] = useState(animateOnMount ? 0 : value);
  const rawId = useId();
  const gradId = `grad-${rawId.replace(/:/g, "")}`;
  const filterId = `glow-${rawId.replace(/:/g, "")}`;

  const c = colorMap[color];
  const r = (size - strokeWidth) / 2;
  const center = size / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (progress / 100) * circumference;

  useEffect(() => {
    if (!animateOnMount) return;
    const duration = 1200;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      setProgress(ease * value);
      setDisplayValue(Math.round(ease * value));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [value, animateOnMount]);

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="rotate-[-90deg]">
          <defs>
            <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={c.gradient[0]} />
              <stop offset="100%" stopColor={c.gradient[1]} />
            </linearGradient>
            <filter id={filterId} x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          {/* Background track */}
          <circle
            cx={center} cy={center} r={r}
            fill="none"
            stroke={c.track}
            strokeWidth={strokeWidth}
          />
          {/* Progress arc */}
          <circle
            cx={center} cy={center} r={r}
            fill="none"
            stroke={`url(#${gradId})`}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 0.05s linear", filter: `url(#${filterId})` }}
          />
        </svg>
        {/* Center label */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center"
          style={{ color: c.gradient[1] }}
        >
          <span
            className="font-bold leading-none"
            style={{ fontSize: size * 0.22, fontFamily: "'Inter', sans-serif", fontWeight: 700 }}
          >
            {displayValue}
            <span style={{ fontSize: size * 0.12, fontWeight: 500, color: "#bcc9cd" }}>
              {unit}
            </span>
          </span>
          {sublabel && (
            <span
              className="label-caps mt-1"
              style={{ fontSize: size * 0.09 }}
            >
              {sublabel}
            </span>
          )}
        </div>
      </div>
      {label && (
        <span className="text-sm font-medium" style={{ color: "#dfe2ee" }}>
          {label}
        </span>
      )}
    </div>
  );
}
