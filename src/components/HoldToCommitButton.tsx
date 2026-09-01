"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Check, Flame, Sparkles } from "lucide-react";

interface HoldToCommitButtonProps {
  onCommit: () => void;
  label?: string;
  holdDurationMs?: number;
}

export default function HoldToCommitButton({
  onCommit,
  label = "Hold 1.5s to Commit Day",
  holdDurationMs = 1500,
}: HoldToCommitButtonProps) {
  const [progress, setProgress] = useState(0); // 0..100
  const [isPressing, setIsPressing] = useState(false);
  const [isCommitted, setIsCommitted] = useState(false);

  const startTimeRef = useRef<number | null>(null);
  const animFrameRef = useRef<number | null>(null);

  const handlePointerDown = () => {
    if (isCommitted) return;
    setIsPressing(true);
    startTimeRef.current = performance.now();

    const loop = (now: number) => {
      if (!startTimeRef.current) return;
      const elapsed = now - startTimeRef.current;
      const pct = Math.min(100, (elapsed / holdDurationMs) * 100);
      setProgress(pct);

      if (pct >= 100) {
        setIsCommitted(true);
        setIsPressing(false);
        onCommit();
        setTimeout(() => {
          setIsCommitted(false);
          setProgress(0);
        }, 3000);
      } else {
        animFrameRef.current = requestAnimationFrame(loop);
      }
    };

    animFrameRef.current = requestAnimationFrame(loop);
  };

  const handlePointerUp = () => {
    if (isCommitted) return;
    setIsPressing(false);
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
    }
    startTimeRef.current = null;

    // Smoothly reverse progress
    let currentPct = progress;
    const reverseLoop = () => {
      currentPct = Math.max(0, currentPct - 10);
      setProgress(currentPct);
      if (currentPct > 0) {
        animFrameRef.current = requestAnimationFrame(reverseLoop);
      }
    };
    animFrameRef.current = requestAnimationFrame(reverseLoop);
  };

  useEffect(() => {
    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, []);

  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      onPointerCancel={handlePointerUp}
      className={`relative w-full py-4 px-6 rounded-2xl border transition-all duration-300 flex items-center justify-between overflow-hidden cursor-pointer select-none ${
        isCommitted
          ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-300 shadow-[0_0_25px_rgba(16,185,129,0.3)]"
          : isPressing
          ? "bg-cyan-500/20 border-cyan-400/60 text-white shadow-[0_0_30px_rgba(6,182,212,0.4)]"
          : "glass-primary text-white hover:border-cyan-500/40"
      }`}
    >
      {/* Background Fill Bar Progress */}
      <div
        className="absolute inset-0 bg-gradient-to-r from-cyan-500/30 to-blue-500/30 pointer-events-none transition-all duration-75"
        style={{ width: `${progress}%` }}
      />

      <div className="flex items-center gap-3 relative z-10">
        <Sparkles className={`w-5 h-5 ${isCommitted ? "text-emerald-400" : "text-cyan-400"}`} />
        <span className="font-extrabold text-sm tracking-tight">
          {isCommitted ? "✨ Day Successfully Committed!" : label}
        </span>
      </div>

      {/* SVG Circular Progress Ring */}
      <div className="relative w-10 h-10 flex items-center justify-center shrink-0 z-10">
        <svg className="w-10 h-10 -rotate-90 transform" viewBox="0 0 44 44">
          <circle
            cx="22"
            cy="22"
            r={radius}
            className="stroke-slate-800"
            strokeWidth="4"
            fill="transparent"
          />
          <circle
            cx="22"
            cy="22"
            r={radius}
            className={`${isCommitted ? "stroke-emerald-400" : "stroke-cyan-400"} transition-all duration-75`}
            strokeWidth="4"
            strokeLinecap="round"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
          />
        </svg>

        <div className="absolute inset-0 flex items-center justify-center">
          {isCommitted ? (
            <Check className="w-4 h-4 text-emerald-400 stroke-[3]" />
          ) : (
            <span className="text-[10px] font-mono font-extrabold text-slate-300">
              {Math.round(progress)}%
            </span>
          )}
        </div>
      </div>
    </motion.button>
  );
}
