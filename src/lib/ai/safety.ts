// ─── LifeSync OS — Health Safety & Medical Guardrails ───────────────
// STRICT ARCHITECTURAL RULE:
// This application is a personal health tracking and optimization tool,
// NOT a medical diagnostic system. Never diagnose, prescribe, or falsely reassure.

import type { HealthMetric } from "@/lib/database.types";

export interface SafetyCheckResult {
  hasRedFlags: boolean;
  warnings: string[];
  disclaimer: string;
}

export const HEALTH_SAFETY_DISCLAIMER =
  "LifeSync OS provides performance and recovery insights based on personal wellness tracking. It does not provide medical diagnoses, treatment recommendations, or prescriptions. If you experience persistent chest discomfort, shortness of breath, or concerning symptoms, seek immediate professional medical care.";

/**
 * Checks for biometric values outside standard non-clinical safety boundaries.
 */
export function evaluateHealthSafetyFlags(metrics: HealthMetric | null): SafetyCheckResult {
  const warnings: string[] = [];

  if (!metrics) {
    return {
      hasRedFlags: false,
      warnings: [],
      disclaimer: HEALTH_SAFETY_DISCLAIMER,
    };
  }

  // Heart Rate Bounds
  if (metrics.heart_rate && (metrics.heart_rate > 125 || (metrics.heart_rate < 38 && metrics.heart_rate > 0))) {
    warnings.push(
      `Resting heart rate (${metrics.heart_rate} bpm) is outside typical resting baseline. Verify sensor placement. If elevated while resting, consult a healthcare professional.`
    );
  }

  // SpO2 Bounds (< 92% is clinical threshold of concern)
  const spo2 = Number(metrics.spo2 ?? 0);
  if (spo2 > 0 && spo2 < 92) {
    warnings.push(
      `Recorded blood oxygen saturation (${spo2}%) is below expected range. If this is not a measurement artifact, seek prompt medical attention.`
    );
  }

  // Body Temperature Bounds
  const temp = Number(metrics.body_temp ?? 0);
  if (temp > 38.3) {
    warnings.push(
      `Elevated body temperature (${temp}°C) indicates potential febrile response. Prioritize hydration and rest; monitor symptoms.`
    );
  } else if (temp > 0 && temp < 35.0) {
    warnings.push(
      `Body temperature (${temp}°C) is low. Re-verify measurement in a controlled environment.`
    );
  }

  return {
    hasRedFlags: warnings.length > 0,
    warnings,
    disclaimer: HEALTH_SAFETY_DISCLAIMER,
  };
}

/**
 * Sanitizes LLM output to ensure no unauthorized medical prescribing language is present.
 */
export function sanitizeMedicalLanguage(text: string): string {
  let cleaned = text;
  cleaned = cleaned.replace(/you have (a disease|an illness|diagnosed with)/gi, "your tracking suggests a pattern associated with");
  cleaned = cleaned.replace(/take (this medication|these drugs|ibuprofen|antibiotics)/gi, "consider consulting your physician regarding");
  return cleaned;
}
