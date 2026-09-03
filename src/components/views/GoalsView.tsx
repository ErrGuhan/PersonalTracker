"use client";

import { motion, AnimatePresence, type Variants } from "framer-motion";
import EmptyState from "@/components/EmptyState";
import { useModals } from "@/context/ModalContext";
import { useGoals } from "@/hooks/useSupabase";

const SkeletonCard = () => (
  <div className="p-5 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 shadow-xl overflow-hidden relative h-[140px] flex flex-col gap-3">
    <motion.div
      className="h-6 w-3/4 bg-white/20 rounded-lg"
      animate={{ opacity: [0.4, 0.8, 0.4] }}
      transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
    />
    <div className="flex flex-col gap-2">
      <motion.div
        className="h-3.5 w-full bg-white/10 rounded-md"
        animate={{ opacity: [0.4, 0.8, 0.4] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.1 }}
      />
    </div>
  </div>
);

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, scale: 0.97, y: 12 },
  show: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: "spring", stiffness: 350, damping: 26 },
  },
};

export default function GoalsView() {
  const { openGoalModal, showToast } = useModals();
  const { goals, loading, updating, updateProgress } = useGoals();

  const handleUpdate = async (id: string, newProg: number, title: string) => {
    await updateProgress(id, newProg);
    showToast(`🎯 Goal updated: "${title}" is now at ${newProg}%!`);
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="flex flex-col gap-6 w-full pb-32 lg:pb-16"
    >
      <motion.div variants={itemVariants} className="flex justify-between items-end">
        <div>
          <h2 className="text-xl sm:text-3xl font-extrabold text-white tracking-tight">Milestones & Strategic Goals</h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">Track core objectives and key achievements.</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.95 }}
          onClick={openGoalModal}
          className="px-4 py-2.5 rounded-xl bg-primary text-slate-950 font-extrabold text-xs shadow-[0_0_20px_rgba(76,215,246,0.4)] hover:bg-primary/90 transition cursor-pointer"
        >
          + New Goal
        </motion.button>
      </motion.div>

      {goals.length === 0 && !loading ? (
        <EmptyState
          icon="flag"
          title="No Active Strategic Goals"
          description="Define your high-level milestones in health, learning, or fitness to stay focused on long-term achievement."
          actionLabel="Create First Goal"
          onAction={openGoalModal}
        />
      ) : (
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <AnimatePresence mode="popLayout">
            {loading ? (
              [0, 1, 2].map((idx) => <SkeletonCard key={`skel-g-${idx}`} />)
            ) : (
              goals.map((g) => (
                <motion.li
                  key={g.id}
                  variants={itemVariants}
                  className="glass-panel p-5 rounded-2xl flex flex-col gap-4 shadow-xl"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-xl shrink-0">
                        {g.icon}
                      </div>
                      <div>
                        <h3 className="font-bold text-sm sm:text-base text-white">{g.title}</h3>
                        <p className="text-[10px] text-primary font-mono uppercase">{g.category}</p>
                      </div>
                    </div>
                    <span className="text-lg font-extrabold text-primary shrink-0">{g.progress}%</span>
                  </div>

                  <div className="w-full bg-surface-container-highest h-2 rounded-full overflow-hidden">
                    <div className="bg-primary h-full rounded-full transition-all duration-500" style={{ width: `${g.progress}%` }} />
                  </div>

                  <div className="flex justify-between items-center text-[11px] text-on-surface-variant">
                    <span>{g.target_description}</span>
                    <span>{g.detail}</span>
                  </div>

                  <div className="flex gap-2 pt-2 border-t border-white/5">
                    {[+5, +10].map((delta) => (
                      <button
                        key={delta}
                        disabled={updating === g.id || g.progress >= 100}
                        onClick={() => handleUpdate(g.id, Math.min(g.progress + delta, 100), g.title)}
                        className="flex-1 text-xs py-2 rounded-lg bg-primary/10 border border-primary/30 text-primary font-semibold hover:bg-primary/20 transition active:scale-95 disabled:opacity-50 cursor-pointer"
                      >
                        +{delta}% Progress
                      </button>
                    ))}
                  </div>
                </motion.li>
              ))
            )}
          </AnimatePresence>
        </ul>
      )}
    </motion.div>
  );
}
