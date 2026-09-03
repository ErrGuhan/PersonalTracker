"use client";

import HealthIntelligenceCenter from "@/components/health/HealthIntelligenceCenter";
import { useModals } from "@/context/ModalContext";

export default function HealthView() {
  const { openSleepModal, openVitalsModal, showToast } = useModals();

  return (
    <div className="w-full pb-32 lg:pb-16">
      <HealthIntelligenceCenter
        onOpenSleepModal={openSleepModal}
        onOpenVitalsModal={openVitalsModal}
        onShowToast={showToast}
      />
    </div>
  );
}
