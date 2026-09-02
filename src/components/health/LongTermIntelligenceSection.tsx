"use client";


interface LongTermIntelligenceSectionProps {
  daysTracked: number;
  sleepDebtHours?: number;
  resilienceScore?: number;
}

export default function LongTermIntelligenceSection({
  daysTracked = 14,
  sleepDebtHours = 1.4,
  resilienceScore = 86,
}: LongTermIntelligenceSectionProps) {
  return (
    <section className="glass-panel p-5 sm:p-7 rounded-2xl sm:rounded-3xl border border-white/10 relative overflow-hidden space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-tertiary text-xl">all_inclusive</span>
            <h3 className="font-bold text-base sm:text-lg text-white">Long-term Health Intelligence</h3>
          </div>
          <p className="text-xs text-on-surface-variant mt-0.5">
            Macro Behavioral Trajectory & Autonomic Resilience (30–90 Days)
          </p>
        </div>

        <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-surface-container-high border border-white/10 text-on-surface-variant">
          {daysTracked} DAYS TRACKED
        </span>
      </div>

      {/* Grid of Long-Term Indicators */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Sleep Debt Tile */}
        <div className="p-4 rounded-2xl bg-surface-container-high/40 border border-white/5 space-y-2">
          <span className="font-mono text-[10px] text-on-surface-variant uppercase tracking-wider">
            SLEEP DEBT BALANCE
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">
              {sleepDebtHours.toFixed(1)}h
            </span>
            <span className="text-xs font-mono font-bold text-emerald-400">
              Low / Sustainable
            </span>
          </div>
          <p className="text-xs text-on-surface-variant leading-relaxed">
            Your cumulative 14-day sleep debt remains well within restorative recovery boundaries.
          </p>
        </div>

        {/* Resilience Index */}
        <div className="p-4 rounded-2xl bg-surface-container-high/40 border border-white/5 space-y-2">
          <span className="font-mono text-[10px] text-on-surface-variant uppercase tracking-wider">
            SYSTEMIC RESILIENCE
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-tertiary">
              {resilienceScore}%
            </span>
            <span className="text-xs font-mono font-bold text-primary">
              High Elasticity
            </span>
          </div>
          <p className="text-xs text-on-surface-variant leading-relaxed">
            HRV recovers rapidly within 24 hours following high workload output days.
          </p>
        </div>

        {/* Habit-Energy Coupling */}
        <div className="p-4 rounded-2xl bg-surface-container-high/40 border border-white/5 space-y-2">
          <span className="font-mono text-[10px] text-on-surface-variant uppercase tracking-wider">
            ROUTINE COUPLING
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-primary">
              +28%
            </span>
            <span className="text-xs font-mono font-bold text-white">
              Energy Correlation
            </span>
          </div>
          <p className="text-xs text-on-surface-variant leading-relaxed">
            Morning hydration and early study routines correlate with higher overall consistency.
          </p>
        </div>
      </div>
    </section>
  );
}
