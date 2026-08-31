"use client";

import { useState } from "react";

const MOODS = [
  { emoji: "🌟", label: "Excellent", score: 5 },
  { emoji: "😊", label: "Good",      score: 4 },
  { emoji: "😐", label: "Neutral",   score: 3 },
  { emoji: "😔", label: "Low",       score: 2 },
  { emoji: "😩", label: "Burnout",   score: 1 },
];

interface MoodSelectorProps {
  onSelect?: (score: number) => void;
  initialScore?: number;
}

export default function MoodSelector({ onSelect, initialScore }: MoodSelectorProps) {
  const [selected, setSelected] = useState<number | null>(initialScore ?? null);

  const handleSelect = (score: number) => {
    setSelected(score);
    onSelect?.(score);
  };

  return (
    <div className="flex items-center justify-between gap-2 px-1">
      {MOODS.map((mood) => (
        <button
          key={mood.score}
          onClick={() => handleSelect(mood.score)}
          title={mood.label}
          className={`mood-item flex-1 aspect-square max-w-[56px] text-2xl select-none ${
            selected === mood.score ? "selected" : ""
          }`}
          style={{ padding: "10px" }}
        >
          {mood.emoji}
        </button>
      ))}
    </div>
  );
}
