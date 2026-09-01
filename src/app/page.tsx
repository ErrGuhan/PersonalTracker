"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import AppShell from "@/components/AppShell";
import HomeCommandCenter from "@/components/HomeCommandCenter";
import TrackView from "@/components/TrackView";
import InsightsView from "@/components/InsightsView";
import GoalsView from "@/components/GoalsView";
import ProfileView from "@/components/ProfileView";
import OnboardingModal from "@/components/OnboardingModal";
import ToastNotification from "@/components/ToastNotification";
import {
  useHealthMetrics,
  useRecentWorkouts,
  useStudyStats,
  useLatestSleep,
  useHabits,
} from "@/hooks/useSupabase";

// Dynamic Imports for Heavy Modals
const LogWorkoutModal = dynamic(() => import("@/components/LogWorkoutModal"), { ssr: false });
const LogStudyModal = dynamic(() => import("@/components/LogStudyModal"), { ssr: false });
const LogSleepModal = dynamic(() => import("@/components/LogSleepModal"), { ssr: false });
const LogVitalsModal = dynamic(() => import("@/components/LogVitalsModal"), { ssr: false });
const LogNutritionModal = dynamic(() => import("@/components/LogNutritionModal"), { ssr: false });
const CreateGoalModal = dynamic(() => import("@/components/CreateGoalModal"), { ssr: false });

export default function Home() {
  const [activeTab, setActiveTab] = useState("home");
  const [showWorkoutModal, setShowWorkoutModal] = useState(false);
  const [showStudyModal, setShowStudyModal] = useState(false);
  const [showSleepModal, setShowSleepModal] = useState(false);
  const [showVitalsModal, setShowVitalsModal] = useState(false);
  const [showNutritionModal, setShowNutritionModal] = useState(false);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const { habits, habitLogs, completeHabit, freezeTokens } = useHabits();
  const { metrics } = useHealthMetrics();
  const { data: studyStats } = useStudyStats();
  const { data: sleepData } = useLatestSleep();
  const { workouts } = useRecentWorkouts(5);

  const showToast = (msg: string) => {
    setToastMsg(msg);
  };

  const renderActiveView = () => {
    switch (activeTab) {
      case "home":
        return (
          <HomeCommandCenter
            habits={habits}
            habitLogs={habitLogs}
            studyMins={studyStats?.todayMinutes ?? 0}
            caloriesBurned={metrics?.calories_burned ?? 0}
            sleepData={sleepData}
            metrics={metrics}
            onCompleteHabit={completeHabit}
            onOpenQuickAction={() => {}}
            onOpenStudyModal={() => setShowStudyModal(true)}
            onOpenWorkoutModal={() => setShowWorkoutModal(true)}
            onOpenSleepModal={() => setShowSleepModal(true)}
          />
        );
      case "track":
        return (
          <TrackView
            habits={habits}
            onOpenWorkoutModal={() => setShowWorkoutModal(true)}
            onOpenStudyModal={() => setShowStudyModal(true)}
            onOpenSleepModal={() => setShowSleepModal(true)}
            onOpenNutritionModal={() => setShowNutritionModal(true)}
          />
        );
      case "insights":
        return (
          <InsightsView
            habits={habits}
            habitLogs={habitLogs}
            sleepData={sleepData}
            studyMinutes={studyStats?.todayMinutes ?? 0}
            workoutCount={workouts.length}
            recoveryScore={metrics?.recovery_score ?? 87}
          />
        );
      case "goals":
        return <GoalsView />;
      case "profile":
        return <ProfileView freezeTokens={freezeTokens} />;
      default:
        return (
          <HomeCommandCenter
            habits={habits}
            habitLogs={habitLogs}
            studyMins={studyStats?.todayMinutes ?? 0}
            caloriesBurned={metrics?.calories_burned ?? 0}
            sleepData={sleepData}
            metrics={metrics}
            onCompleteHabit={completeHabit}
            onOpenQuickAction={() => {}}
            onOpenStudyModal={() => setShowStudyModal(true)}
            onOpenWorkoutModal={() => setShowWorkoutModal(true)}
            onOpenSleepModal={() => setShowSleepModal(true)}
          />
        );
    }
  };

  return (
    <AppShell
      activeTab={activeTab}
      onNav={setActiveTab}
      onSelectQuickAction={(actionType) => {
        if (actionType === "study") setShowStudyModal(true);
        if (actionType === "workout") setShowWorkoutModal(true);
        if (actionType === "sleep") setShowSleepModal(true);
        if (actionType === "vitals") setShowVitalsModal(true);
        if (actionType === "meal") setShowNutritionModal(true);
        if (actionType === "habit") setShowGoalModal(true);
      }}
    >
      <ToastNotification message={toastMsg} onClear={() => setToastMsg(null)} />

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.18 }}
          className="w-full"
        >
          {renderActiveView()}
        </motion.div>
      </AnimatePresence>

      {/* Interactive Modals */}
      <AnimatePresence>
        {showWorkoutModal && (
          <LogWorkoutModal
            key="workout-modal"
            onClose={() => setShowWorkoutModal(false)}
            onSaved={() => showToast("🏃 Workout activity logged!")}
          />
        )}
        {showStudyModal && (
          <LogStudyModal
            key="study-modal"
            onClose={() => setShowStudyModal(false)}
            onSaved={() => showToast("📚 Study session logged!")}
          />
        )}
        {showSleepModal && (
          <LogSleepModal
            key="sleep-modal"
            onClose={() => setShowSleepModal(false)}
            onSaved={() => showToast("🌙 Sleep session logged!")}
          />
        )}
        {showVitalsModal && (
          <LogVitalsModal
            key="vitals-modal"
            onClose={() => setShowVitalsModal(false)}
            onSaved={() => showToast("❤️‍ critical health vitals updated!")}
          />
        )}
        {showNutritionModal && (
          <LogNutritionModal
            key="nutrition-modal"
            onClose={() => setShowNutritionModal(false)}
            onSaved={() => showToast("🥗 Meal & macros logged!")}
          />
        )}
        {showGoalModal && (
          <CreateGoalModal
            key="goal-modal"
            onClose={() => setShowGoalModal(false)}
            onSaved={() => showToast("🎯 New goal created!")}
          />
        )}
        {showOnboarding && (
          <OnboardingModal
            isOpen={showOnboarding}
            onClose={() => setShowOnboarding(false)}
            onCompleteOnboarding={() => showToast("✨ Personalized routine generated!")}
          />
        )}
      </AnimatePresence>
    </AppShell>
  );
}
