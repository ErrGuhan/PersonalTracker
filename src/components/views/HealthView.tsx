"use client";

import HealthIntelligenceCenter from "@/components/health/HealthIntelligenceCenter";
import { useModals } from "@/context/ModalContext";

export default function HealthView() {
  const { openSleepModal, openVitalsModal, showToast } = useModals();

  return (
    <div className="w-full pt-3 pb-24 lg:pb-8">
      <HealthIntelligenceCenter
        onOpenSleepModal={openSleepModal}
        onOpenVitalsModal={openVitalsModal}
        onShowToast={showToast}
      />
    </div>
  );
}
