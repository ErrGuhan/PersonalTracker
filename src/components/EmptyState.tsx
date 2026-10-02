"use client";

import { Plus, Sparkles } from "lucide-react";
import type { ComponentType } from "react";

interface EmptyStateProps {
  icon?: ComponentType<{ className?: string }> | string;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export default function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="w-full m3-surface-inset rounded-2xl p-8 flex flex-col items-center justify-center text-center gap-4 my-2">
      {/* Icon */}
      <div className="w-12 h-12 rounded-2xl bg-cyan-500/15 border border-cyan-500/25 flex items-center justify-center text-cyan-400">
        {typeof Icon === "string" ? (
          <span className="material-symbols-outlined text-2xl">{Icon}</span>
        ) : Icon ? (
          <Icon className="w-6 h-6" />
        ) : (
          <Sparkles className="w-6 h-6" />
        )}
      </div>

      {/* Text */}
      <div className="space-y-1 max-w-xs">
        <h3 className="font-bold text-sm text-white">{title}</h3>
        <p className="text-xs text-slate-400 leading-relaxed">{description}</p>
      </div>

      {/* CTA */}
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="m3-fab m3-fab-small"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          {actionLabel}
        </button>
      )}
    </div>
  );
}
