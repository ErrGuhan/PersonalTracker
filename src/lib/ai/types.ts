// ─── LifeSync OS — Health Intelligence & AI Types ───────────────────

export type DataAvailabilityStatus =
  | "AVAILABLE"
  | "PARTIAL"
  | "MISSING"
  | "STALE"
  | "INSUFFICIENT";

export type ConfidenceLevel = "HIGH" | "MEDIUM" | "LOW" | "INSUFFICIENT";

export interface HeroHealthIntelligence {
  greeting: string;
  recoveryScore: number | null;
  sleepDurationHours: number | null;
  capacityScore: number | null;
  capacityLevel: "PEAK" | "HIGH" | "MODERATE" | "LOW" | "RECOVERY" | "INSUFFICIENT";
  trendIndicator: "up" | "down" | "neutral" | "unknown";
  headline: string;
  interpretation: string;
  confidence: ConfidenceLevel;
  availability: DataAvailabilityStatus;
  evidence: string[];
}

export interface RecoveryFactorDetail {
  score: number | null; // 0–100 or null if unrecorded
  isRecorded: boolean;
  rawValue?: number | string | null;
  unit?: string;
  statusText?: string;
}

export interface RecoveryIntelligenceResult {
  score: number | null;
  baseline: number | null;
  trend: "improving" | "declining" | "stable" | "insufficient_data";
  confidence: ConfidenceLevel;
  availability: DataAvailabilityStatus;
  factors: {
    sleep: RecoveryFactorDetail;
    activity: RecoveryFactorDetail;
    hrv: RecoveryFactorDetail;
    spo2: RecoveryFactorDetail;
    workload: RecoveryFactorDetail;
    consistency: RecoveryFactorDetail;
  };
  interpretation: string;
  evidence: string[];
}

export interface DailyCapacityResult {
  score: number | null; // 0–100 or null
  level: "PEAK" | "HIGH" | "MODERATE" | "LOW" | "RECOVERY_NEEDED" | "INSUFFICIENT";
  confidence: ConfidenceLevel;
  deepWorkAllocation: number; // 0–100
  exerciseAllocation: number; // 0–100
  learningAllocation: number; // 0–100
  recoveryAllocation: number; // 0–100
  recommendedFocusMinutes: number;
  recommendedWorkoutIntensity: "high" | "moderate" | "light" | "rest";
  interpretation: string;
  evidence: string[];
}

export interface RecommendationActionItem {
  id: string;
  label: string;
  detail: string;
  category: "focus" | "workout" | "sleep" | "recovery";
}

export interface PersonalizedRecommendation {
  title: string;
  summary: string;
  confidence: ConfidenceLevel;
  evidence: string[];
  actions: RecommendationActionItem[];
  whyExplanation: string;
  applied?: boolean;
}

export interface AiInsightItem {
  id: string;
  title: string;
  text: string;
  correlationText: string;
  evidence: string;
  daysTracked: number;
  confidence: ConfidenceLevel;
  category: "sleep" | "focus" | "workout" | "recovery";
}

export interface HealthTrendPoint {
  date: string;
  sleepHours: number | null;
  recoveryScore: number | null;
  hrvMs: number | null;
  caloriesBurned: number | null;
  focusMinutes: number;
  hasData: boolean;
}

export interface CompletionProbabilityItem {
  habitId: string;
  habitTitle: string;
  probabilityPct: number | null; // null if insufficient historical data (<7 days)
  statusText: string;
  evidence: string;
}

export interface WorkloadEstimate {
  plannedMinutes: number;
  recommendedMinutes: number;
  differencePct: number;
  assessment: "optimal" | "heavy" | "light" | "sustainable";
  explanation: string;
}

export interface PlannedHabitItem {
  title: string;
  frequency: string;
  durationMinutes: number;
  category: "health" | "fitness" | "focus" | "mindset";
  icon: string;
}

export interface PersonalizedPlan {
  id: string;
  goal: string;
  durationWeeks: number;
  dailyCommitmentMinutes: number;
  targetFocusSessions: number;
  habits: PlannedHabitItem[];
  recoveryStrategy: string;
  adaptations?: string[];
}

export interface MorningBriefResult {
  recoveryScore: number | null;
  sleepDuration: string;
  capacityLevel: string;
  headline: string;
  overview: string;
  suggestedPriorities: string[];
}

export interface EveningReviewResult {
  completedHabits: string;
  focusMinutes: number;
  workoutCompleted: boolean;
  sleepLastNight: string;
  summary: string;
  tomorrowRecommendation: string;
}

export interface AssistantMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  evidence?: string[];
  actionChips?: string[];
}

export interface SleepAnalysisResult {
  headline: string;
  durationComparisonPct: number; // e.g. -12% compared to 14D average
  baselineHours: number;
  qualityAnalysis: string;
  actionRecommendation: string;
  confidence: ConfidenceLevel;
  evidence: string[];
}
