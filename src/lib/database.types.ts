// ─── LifeSync OS — Supabase Database Types ───────────────
// Auto-sync these with your Supabase schema.
// Run: npx supabase gen types typescript --project-id <id> > src/lib/database.types.ts

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      health_metrics: {
        Row: {
          id: string;
          user_id: string;
          recorded_at: string;
          heart_rate: number | null;
          steps: number | null;
          hydration_pct: number | null;
          spo2: number | null;
          body_temp: number | null;
          hrv_ms: number | null;
          stress_pct: number | null;
          vo2_max: number | null;
          calories_burned: number | null;
          recovery_score: number | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["health_metrics"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["health_metrics"]["Insert"]>;
      };
      workouts: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          type: string;
          duration_min: number;
          calories: number;
          avg_heart_rate: number | null;
          distance_km: number | null;
          notes: string | null;
          plan?: Json;
          workout_date: string;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["workouts"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["workouts"]["Insert"]>;
      };
      study_sessions: {
        Row: {
          id: string;
          user_id: string;
          subject: string;
          duration_min: number;
          focus_score: number | null;
          session_date: string;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["study_sessions"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["study_sessions"]["Insert"]>;
      };
      mood_logs: {
        Row: {
          id: string;
          user_id: string;
          score: number;  // 1–5
          energy_pct: number | null;
          anxiety_pct: number | null;
          motivation_pct: number | null;
          logged_at: string;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["mood_logs"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["mood_logs"]["Insert"]>;
      };
      sleep_logs: {
        Row: {
          id: string;
          user_id: string;
          hours: number;
          deep_pct: number;
          rem_pct: number;
          light_pct: number;
          awake_pct: number;
          sleep_date: string;
          created_at: string;
          bedtime?: string | null;
          wake_time?: string | null;
          quality?: number | null;
          rested_rating?: number | null;
          notes?: string | null;
        };
        Insert: Omit<Database["public"]["Tables"]["sleep_logs"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["sleep_logs"]["Insert"]>;
      };
      goals: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          category: string;
          icon: string;
          progress: number;  // 0–100
          target_description: string;
          detail: string;
          accent: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["goals"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["goals"]["Insert"]>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}

// ─── Convenience row types ─────────────────────────────────
export type HealthMetric   = Database["public"]["Tables"]["health_metrics"]["Row"];
export type Workout        = Database["public"]["Tables"]["workouts"]["Row"];
export type StudySession   = Database["public"]["Tables"]["study_sessions"]["Row"];
export type MoodLog        = Database["public"]["Tables"]["mood_logs"]["Row"];
export type SleepLog       = Database["public"]["Tables"]["sleep_logs"]["Row"];
export type Goal           = Database["public"]["Tables"]["goals"]["Row"];

export interface Habit {
  id: string;
  title: string;
  category: "health" | "fitness" | "focus" | "mindset";
  streak: number;
  completedToday: boolean;
  frequency: string;
  targetCount: number;
  icon: string;
}

export interface HydrationLog {
  amountMl: number;
  targetMl: number;
  lastUpdated: string;
}

export interface MealLog {
  id: string;
  name: string;
  mealType: "breakfast" | "lunch" | "dinner" | "snack";
  calories: number;
  proteinG: number;
  carbsG: number;
  fatsG: number;
  loggedAt: string;
}

export interface AiUserProfile {
  goals: string[];
  preferredWakeTime: string;       // e.g. "06:30"
  preferredSleepTime: string;      // e.g. "23:00"
  availableDailyTimeMinutes: number; // e.g. 180
  preferredWorkoutStyle: "strength" | "hiit" | "cardio" | "yoga" | "hybrid";
  planningStyle: "structured" | "flexible" | "minimalist";
  motivationStyle: "direct" | "encouraging" | "analytical";
  difficultyPreference: "gradual" | "challenging" | "moderate";
  preferredSessionDurationMin: number;
  schedulePreferences: string;
  currentPriorities: string[];
  personalizationEnabled: boolean;
}

