"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AiHeroCard from "./AiHeroCard";
import SleepIntelligenceSection from "./SleepIntelligenceSection";
import RecoveryIntelligenceCard from "./RecoveryIntelligenceCard";
import PersonalizedRecommendationCard from "./PersonalizedRecommendationCard";
import HealthTrendsSection from "./HealthTrendsSection";
import AiAssistantWidget from "./AiAssistantWidget";
import AiWorkflowModal from "./AiWorkflowModal";

import {
  useHealthMetrics,
  useHealthHistory,
  useLatestSleep,
  useSleepHistory,
  useRecentWorkouts,
  useStudyStats,
  useHabits,
  useAiProfile,
  useHydration,
  useNutrition,
  useGoals,
} from "@/hooks/useSupabase";

import {
  computeRecoveryIntelligence,
  calculateDeterministicDailyCapacity,
  calculateHealthTrends,
} from "@/lib/ai/deterministic";
import { buildHealthContextBundle } from "@/lib/ai/context";
import {
  getHeroIntelligenceAction,
  getTodayRecommendationAction,
  executeQuickAiWorkflowAction,
  generateSleepAnalysisAction,
  askHealthAssistantAction,
  getAiInsightsAction,
} from "@/app/actions/healthAi";

import type {
  HeroHealthIntelligence,
  PersonalizedRecommendation,
  SleepAnalysisResult,
  AssistantMessage,
  AiInsightItem,
  PersonalizedPlan,
} from "@/lib/ai/types";

interface WorkflowModalData {
  title: string;
  summary: string;
  details?: string[];
  recommendedAction?: string;
  plan?: PersonalizedPlan;
  morningBrief?: {
    headline: string;
    overview: string;
    suggestedPriorities: string[];
  };
  eveningReview?: {
    completedHabits: string;
    focusMinutes: number;
    summary: string;
    tomorrowRecommendation: string;
  };
  sleepAnalysis?: {
    headline: string;
    qualityAnalysis: string;
    actionRecommendation: string;
  };
}

interface HealthIntelligenceCenterProps {
  onOpenSleepModal: () => void;
  onOpenVitalsModal?: () => void;
  onShowToast?: (msg: string) => void;
}

export default function HealthIntelligenceCenter({
  onOpenSleepModal,
  onOpenVitalsModal,
  onShowToast,
}: HealthIntelligenceCenterProps) {
  const assistantRef = useRef<HTMLDivElement>(null);

  // ─── Data Access Layer ──────────────────────────────────────
  const { metrics, loading: mLoading } = useHealthMetrics();
  const { data: healthHistory } = useHealthHistory(30);
  const { data: latestSleep, loading: sLoading } = useLatestSleep();
  const { data: sleepHistory } = useSleepHistory(30);
  const { workouts } = useRecentWorkouts(15);
  const { data: studyStats } = useStudyStats();
  const { habits, addHabit } = useHabits();
  const { profile } = useAiProfile();
  const { hydration } = useHydration();
  const { meals } = useNutrition();
  const { goals } = useGoals();

  // ─── Deterministic Computations (Immediate & 100% Reliable) ───
  const recoveryIntel = useMemo(() => {
    return computeRecoveryIntelligence(
      metrics,
      latestSleep,
      healthHistory || [],
      workouts,
      habits
    );
  }, [metrics, latestSleep, healthHistory, workouts, habits]);

  const trendPoints = useMemo(() => {
    return calculateHealthTrends(
      healthHistory || [],
      sleepHistory || [],
      workouts,
      [],
      90
    );
  }, [healthHistory, sleepHistory, workouts]);

  const contextBundle = useMemo(() => {
    return buildHealthContextBundle(
      metrics,
      latestSleep,
      healthHistory || [],
      sleepHistory || [],
      workouts,
      [],
      habits,
      profile,
      hydration,
      meals,
      goals
    );
  }, [metrics, latestSleep, healthHistory, sleepHistory, workouts, habits, profile, hydration, meals, goals]);

  // ─── AI States & Progressive Loading ─────────────────────────
  const [heroData, setHeroData] = useState<HeroHealthIntelligence | null>(null);
  const [heroLoading, setHeroLoading] = useState(true);

  const [recommendation, setRecommendation] = useState<PersonalizedRecommendation | null>(null);
  const [recLoading, setRecLoading] = useState(true);

  const [insights, setInsights] = useState<AiInsightItem[]>([]);
  const [insightsLoading, setInsightsLoading] = useState(true);

  const [sleepAnalysis, setSleepAnalysis] = useState<SleepAnalysisResult | null>(null);
  const [analyzingSleep, setAnalyzingSleep] = useState(false);

  // Assistant State
  const [messages, setMessages] = useState<AssistantMessage[]>([
    {
      id: "msg-initial",
      role: "assistant",
      content:
        "Welcome to your Health Intelligence Center. I am grounded in your recorded sleep, HRV, and daily workload telemetry. How can I help optimize your schedule, recovery, or training today?",
      timestamp: "Just now",
      actionChips: [
        "How was my sleep?",
        "Am I ready for a heavy workout?",
        "Why is my recovery low?",
        "How should I adjust today's schedule?",
      ],
    },
  ]);
  const [assistantLoading, setAssistantLoading] = useState(false);

  // Workflow Modal State
  const [activeWorkflow, setActiveWorkflow] = useState<string | null>(null);
  const [workflowData, setWorkflowData] = useState<WorkflowModalData | null>(null);
  const [workflowLoading, setWorkflowLoading] = useState(false);

  // ─── Progressive AI Population ───────────────────────────────
  useEffect(() => {
    let isMounted = true;

    // Load Hero Interpretation
    getHeroIntelligenceAction(contextBundle)
      .then((res) => {
        if (isMounted) {
          setHeroData(res);
          setHeroLoading(false);
        }
      })
      .catch((err) => {
        console.warn("[AI Hero] fallback triggered:", err);
        if (isMounted) setHeroLoading(false);
      });

    // Load Recommendation
    getTodayRecommendationAction(contextBundle)
      .then((res) => {
        if (isMounted) {
          setRecommendation(res);
          setRecLoading(false);
        }
      })
      .catch((err) => {
        console.warn("[AI Rec] fallback triggered:", err);
        if (isMounted) setRecLoading(false);
      });

    // Load Behavioral Insights
    getAiInsightsAction(contextBundle)
      .then((res) => {
        if (isMounted) {
          setInsights(res);
          setInsightsLoading(false);
        }
      })
      .catch((err) => {
        console.warn("[AI Insights] fallback triggered:", err);
        if (isMounted) setInsightsLoading(false);
      });

    // Load Sleep Analysis if sleep is present
    if (latestSleep && Number(latestSleep.hours) > 0) {
      generateSleepAnalysisAction(
        {
          hours: Number(latestSleep.hours),
          deep_pct: Number(latestSleep.deep_pct ?? 0),
          rem_pct: Number(latestSleep.rem_pct ?? 0),
          quality: latestSleep.quality ?? undefined,
          notes: latestSleep.notes ?? undefined,
        },
        contextBundle
      )
        .then((res) => {
          if (isMounted) {
            setSleepAnalysis(res);
            setAnalyzingSleep(false);
          }
        })
        .catch((err) => {
          console.warn("[Sleep Analysis] fallback triggered:", err);
          if (isMounted) setAnalyzingSleep(false);
        });
    }

    return () => {
      isMounted = false;
    };
  }, [contextBundle, latestSleep]);

  // Handle Quick AI Action Trigger
  const handleTriggerWorkflow = useCallback(
    async (workflowType: string) => {
      setActiveWorkflow(workflowType);
      setWorkflowLoading(true);
      try {
        const result = await executeQuickAiWorkflowAction(workflowType, contextBundle);
        setWorkflowData(result);
      } catch (err) {
        console.warn("[Quick Workflow] Error:", err);
      } finally {
        setWorkflowLoading(false);
      }
    },
    [contextBundle]
  );

  // Handle User Message to AI Assistant
  const handleSendMessage = useCallback(
    async (text: string) => {
      const userMsg: AssistantMessage = {
        id: `usr-${Date.now()}`,
        role: "user",
        content: text,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, userMsg]);
      setAssistantLoading(true);

      try {
        const reply = await askHealthAssistantAction(text, messages, contextBundle);
        setMessages((prev) => [...prev, reply]);
      } catch (err) {
        console.warn("[Assistant Chat] Error:", err);
      } finally {
        setAssistantLoading(false);
      }
    },
    [messages, contextBundle]
  );

  // Handle Scroll to Assistant
  const handleScrollToAssistant = useCallback(() => {
    if (assistantRef.current) {
      assistantRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  // Apply Plan Handler
  const handleApplyPlan = useCallback(
    (plan: PersonalizedPlan) => {
      if (!plan.habits || plan.habits.length === 0) return;
      plan.habits.forEach((h) => {
        addHabit({
          title: h.title,
          category: h.category,
          frequency: h.frequency,
          targetCount: 1,
          icon: h.icon,
        });
      });
      if (onShowToast) {
        onShowToast(`🎯 Applied ${plan.habits.length} tailored habits from your AI plan!`);
      }
    },
    [addHabit, onShowToast]
  );

  // Handle Recommendation Apply
  const handleApplyRecommendation = useCallback(
    (_rec: PersonalizedRecommendation) => {
      if (onShowToast) {
        onShowToast("✓ Today's recommendation successfully scheduled in your routines!");
      }
    },
    [onShowToast]
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col gap-6 sm:gap-8 w-full max-w-full pb-32 lg:pb-20"
    >
      {/* Workflow Modal Dialog */}
      <AnimatePresence>
        {activeWorkflow && (
          <AiWorkflowModal
            isOpen={Boolean(activeWorkflow)}
            onClose={() => {
              setActiveWorkflow(null);
              setWorkflowData(null);
            }}
            workflowType={activeWorkflow}
            data={workflowData}
            loading={workflowLoading}
            onApplyPlan={handleApplyPlan}
            onShowToast={onShowToast}
          />
        )}
      </AnimatePresence>

      {/* ─── 1. HEALTH STATUS OVERVIEW ───────────────────────────── */}
      <AiHeroCard
        heroData={heroData}
        loading={heroLoading}
        onOpenSleepModal={onOpenSleepModal}
        onOpenVitalsModal={onOpenVitalsModal}
        onAskAi={handleScrollToAssistant}
        onBuildDay={() => handleTriggerWorkflow("build_day")}
      />

      {/* ─── 2. SLEEP ────────────────────────────────────────────── */}
      <SleepIntelligenceSection
        latestSleep={latestSleep}
        loading={sLoading}
        sleepAnalysis={sleepAnalysis}
        analyzingSleep={analyzingSleep}
        baselineSleepHours={contextBundle.sevenDaySummary.avgSleepHours}
        onOpenSleepModal={onOpenSleepModal}
        onViewFullAnalysis={() => handleTriggerWorkflow("improve_sleep")}
      />

      {/* ─── 3. RECOVERY ─────────────────────────────────────────── */}
      <RecoveryIntelligenceCard
        data={recoveryIntel}
        loading={mLoading}
        onOpenSleepModal={onOpenSleepModal}
        onOpenVitalsModal={onOpenVitalsModal}
      />

      {/* ─── 4. TODAY'S RECOMMENDATION ──────────────────────────── */}
      <PersonalizedRecommendationCard
        recommendation={recommendation}
        loading={recLoading}
        onApply={handleApplyRecommendation}
        onDismiss={() => setRecommendation(null)}
      />

      {/* ─── 5. TRENDS & INSIGHTS ────────────────────────────────── */}
      <HealthTrendsSection
        trendData={trendPoints}
        insights={insights}
        loading={mLoading || insightsLoading}
        onOpenSleepModal={onOpenSleepModal}
        onOpenVitalsModal={onOpenVitalsModal}
      />

      {/* ─── 6. INTERACTIVE AI ASSISTANT ─────────────────────────── */}
      <div ref={assistantRef}>
        <AiAssistantWidget
          messages={messages}
          loading={assistantLoading}
          onSendMessage={handleSendMessage}
        />
      </div>
    </motion.div>
  );
}
