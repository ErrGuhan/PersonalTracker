"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { AnimatePresence } from "framer-motion";
import LogWorkoutModal from "@/components/LogWorkoutModal";
import LogStudyModal from "@/components/LogStudyModal";
import LogSleepModal from "@/components/LogSleepModal";
import LogVitalsModal from "@/components/LogVitalsModal";
import LogNutritionModal from "@/components/LogNutritionModal";
import CreateGoalModal from "@/components/CreateGoalModal";
import AuthModal from "@/components/AuthModal";
import CommandPalette from "@/components/CommandPalette";
import ToastNotification from "@/components/ToastNotification";
import { exportAllDataJSON, resetBaselineData } from "@/lib/db";
import { useRouter } from "next/navigation";

export interface ModalContextType {
  openWorkoutModal: () => void;
  openStudyModal: () => void;
  openSleepModal: () => void;
  openVitalsModal: () => void;
  openNutritionModal: () => void;
  openGoalModal: () => void;
  openAuthModal: () => void;
  openCommandPalette: () => void;
  showToast: (message: string) => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export function ModalProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [showWorkoutModal, setShowWorkoutModal] = useState(false);
  const [showStudyModal, setShowStudyModal] = useState(false);
  const [showSleepModal, setShowSleepModal] = useState(false);
  const [showVitalsModal, setShowVitalsModal] = useState(false);
  const [showNutritionModal, setShowNutritionModal] = useState(false);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  }, []);

  const openWorkoutModal = useCallback(() => setShowWorkoutModal(true), []);
  const openStudyModal = useCallback(() => setShowStudyModal(true), []);
  const openSleepModal = useCallback(() => setShowSleepModal(true), []);
  const openVitalsModal = useCallback(() => setShowVitalsModal(true), []);
  const openNutritionModal = useCallback(() => setShowNutritionModal(true), []);
  const openGoalModal = useCallback(() => setShowGoalModal(true), []);
  const openAuthModal = useCallback(() => setShowAuthModal(true), []);
  const openCommandPalette = useCallback(() => setShowCommandPalette(true), []);

  const handleExportData = useCallback(() => {
    const jsonStr = exportAllDataJSON();
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `lifesync-backup-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    showToast("💾 Exported full personal data backup!");
  }, [showToast]);

  const handleResetData = useCallback(() => {
    if (confirm("Are you sure you want to reset all tracking data to baseline defaults?")) {
      resetBaselineData();
      showToast("🔄 Reset data to baseline defaults!");
      router.refresh();
    }
  }, [showToast, router]);

  const handleSelectNav = useCallback((href: string) => {
    router.push(href);
  }, [router]);

  return (
    <ModalContext.Provider
      value={{
        openWorkoutModal,
        openStudyModal,
        openSleepModal,
        openVitalsModal,
        openNutritionModal,
        openGoalModal,
        openAuthModal,
        openCommandPalette,
        showToast,
      }}
    >
      {children}

      {/* Toast Notification Banner */}
      <ToastNotification message={toastMsg} onClear={() => setToastMsg(null)} />

      {/* Command Palette */}
      <CommandPalette
        isOpen={showCommandPalette}
        onClose={() => setShowCommandPalette(false)}
        onSelectNav={handleSelectNav}
        onOpenWorkoutModal={openWorkoutModal}
        onOpenStudyModal={openStudyModal}
        onOpenSleepModal={openSleepModal}
        onOpenVitalsModal={openVitalsModal}
        onOpenNutritionModal={openNutritionModal}
        onOpenGoalModal={openGoalModal}
        onExportData={handleExportData}
        onResetData={handleResetData}
        onShowToast={showToast}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={showToast}
      />

      {/* Core Action Modals */}
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
            onSaved={() => showToast("❤️‍🔥 Health vitals updated!")}
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
      </AnimatePresence>
    </ModalContext.Provider>
  );
}

export function useModals(): ModalContextType {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error("useModals must be used within a ModalProvider");
  }
  return context;
}
