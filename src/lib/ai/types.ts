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
  recoveryScore: number;
  sleepDurationHours: number;
  capacityScore: number;
  capacityLevel: "PEAK" | "HIGH" | "MODERATE" | "LOW" | "RECOVERY";
  trendIndicator: "up" | "down" | "neutral";
  headline: string;
  interpretation: string;
  confidence: ConfidenceLevel;
  evidence: string[];
}

export interface RecoveryIntelligenceResult {
  score: number;
  baseline: number;
  trend: "improving" | "declining" | "stable";
  confidence: ConfidenceLevel;
  availability: DataAvailabilityStatus;
  factors: {
    sleep: number;       // 0–100
    activity: number;    // 0–100
    hrv: number;         // 0–100
    spo2: number;        // 0–100
    workload: number;    // 0–100
    consistency: number; // 0–100
  };
  interpretation: string;
  evidence: string[];
}

export interface DailyCapacityResult {
  score: number; // 0–100
  level: "PEAK" | "HIGH" | "MODERATE" | "LOW" | "RECOVERY_NEEDED";
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
  sleepHours: number;
  recoveryScore: number;
  hrvMs: number;
  caloriesBurned: number;
  focusMinutes: number;
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
  recoveryScore: number;
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
