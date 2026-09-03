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
          calorie_source?: "USER_PROVIDED" | "CALCULATED" | "ESTIMATED" | "IMPORTED";
          intensity?: "low" | "moderate" | "high";
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
      habits: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          category: string;
          frequency: string;
          target_count: number;
          icon: string;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["habits"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["habits"]["Insert"]>;
      };
      habit_logs: {
        Row: {
          id: string;
          habit_id: string;
          user_id: string;
          log_date: string;
          status: "COMPLETED" | "FROZEN" | "MISSED";
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["habit_logs"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["habit_logs"]["Insert"]>;
      };
      hydration_logs: {
        Row: {
          id: string;
          user_id: string;
          amount_ml: number;
          logged_at: string;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["hydration_logs"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["hydration_logs"]["Insert"]>;
      };
      meals: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          meal_type: "breakfast" | "lunch" | "dinner" | "snack";
          calories: number;
          protein_g: number;
          carbs_g: number;
          fats_g: number;
          logged_at: string;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["meals"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["meals"]["Insert"]>;
      };
      workout_programs: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          goal: "fat_loss" | "muscle_gain" | "strength" | "endurance" | "mobility" | "general_fitness";
          duration_days: number;
          start_date: string;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["workout_programs"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["workout_programs"]["Insert"]>;
      };
      workout_days: {
        Row: {
          id: string;
          program_id: string;
          day_number: number;
          title: string;
          focus: string;
          is_rest_day: boolean;
          notes: string | null;
        };
        Insert: Omit<Database["public"]["Tables"]["workout_days"]["Row"], "id">;
        Update: Partial<Database["public"]["Tables"]["workout_days"]["Insert"]>;
      };
      workout_exercises: {
        Row: {
          id: string;
          workout_day_id: string;
          name: string;
          type: "strength" | "cardio" | "stretch" | "bodyweight";
          sets: number | null;
          reps: string | null;
          duration_min: number | null;
          distance_km: number | null;
          rest_seconds: number | null;
          order_index: number;
          notes: string | null;
        };
        Insert: Omit<Database["public"]["Tables"]["workout_exercises"]["Row"], "id">;
        Update: Partial<Database["public"]["Tables"]["workout_exercises"]["Insert"]>;
      };
      workout_completions: {
        Row: {
          id: string;
          user_id: string;
          exercise_id: string;
          workout_day_id: string;
          completion_date: string; // YYYY-MM-DD local calendar date
          completed: boolean;
          completed_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["workout_completions"]["Row"], "id">;
        Update: Partial<Database["public"]["Tables"]["workout_completions"]["Insert"]>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}

// ─── Convenience row types ─────────────────────────────────
export type HealthMetric               = Database["public"]["Tables"]["health_metrics"]["Row"];
export type Workout                    = Database["public"]["Tables"]["workouts"]["Row"];
export type WorkoutProgramRow          = Database["public"]["Tables"]["workout_programs"]["Row"];
export type WorkoutDayRow              = Database["public"]["Tables"]["workout_days"]["Row"];
export type WorkoutExerciseRow         = Database["public"]["Tables"]["workout_exercises"]["Row"];
export type WorkoutCompletionRow       = Database["public"]["Tables"]["workout_completions"]["Row"];
export type StudySession               = Database["public"]["Tables"]["study_sessions"]["Row"];
export type MoodLog                    = Database["public"]["Tables"]["mood_logs"]["Row"];
export type SleepLog                   = Database["public"]["Tables"]["sleep_logs"]["Row"];
export type Goal                       = Database["public"]["Tables"]["goals"]["Row"];
export type HabitRow                   = Database["public"]["Tables"]["habits"]["Row"];
export type HabitLogRow                = Database["public"]["Tables"]["habit_logs"]["Row"];
export type HydrationLogRow            = Database["public"]["Tables"]["hydration_logs"]["Row"];
export type MealRow                    = Database["public"]["Tables"]["meals"]["Row"];

export type HabitLogStatus = "COMPLETED" | "FROZEN" | "MISSED";

export interface HabitLog {
  id: string;
  habit_id: string;
  user_id: string;
  log_date: string; // YYYY-MM-DD local calendar date
  status: HabitLogStatus;
  created_at: string;
}

export interface Habit {
  id: string;
  user_id?: string;
  title: string;
  category: "health" | "fitness" | "focus" | "mindset";
  streak: number; // consecutive active streak (starts at 0 for new, earned on completion)
  completedToday: boolean; // whether HabitLog exists for today with status === "COMPLETED"
  todayStatus: HabitLogStatus | "INCOMPLETE"; // "COMPLETED" | "FROZEN" | "MISSED" | "INCOMPLETE"
  frequency: string;
  targetCount: number;
  icon: string;
  created_at?: string;
}

export interface HydrationEntry {
  id: string;
  user_id?: string;
  amount_ml: number;
  logged_at: string; // ISO timestamp
  created_at?: string;
}

export interface HydrationLog {
  amountMl: number;
  targetMl: number;
  lastUpdated: string | null;
}

export interface MealLog {
  id: string;
  user_id?: string;
  name: string;
  mealType: "breakfast" | "lunch" | "dinner" | "snack";
  calories: number;
  proteinG: number;
  carbsG: number;
  fatsG: number;
  loggedAt: string; // ISO timestamp
  created_at?: string;
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

// ─── Workout Program / Daily Plan Domain Interfaces ────────
export interface WorkoutExercise {
  id: string;
  workoutDayId: string;
  name: string;
  type: "strength" | "cardio" | "stretch" | "bodyweight";
  sets?: number | null;
  reps?: string | null;
  durationMin?: number | null;
  distanceKm?: number | null;
  restSeconds?: number | null;
  orderIndex: number;
  notes?: string | null;
}

export interface WorkoutExerciseCompletion {
  id: string;
  userId: string;
  exerciseId: string;
  workoutDayId: string;
  completionDate: string; // YYYY-MM-DD local calendar date
  completed: boolean;
  completedAt: string;
}

export interface WorkoutDay {
  id: string;
  programId: string;
  dayNumber: number;
  title: string;
  focus: string;
  isRestDay: boolean;
  notes?: string | null;
  exercises?: WorkoutExercise[];
}

export interface WorkoutProgram {
  id: string;
  userId: string;
  name: string;
  goal: "fat_loss" | "muscle_gain" | "strength" | "endurance" | "mobility" | "general_fitness";
  durationDays: number;
  startDate: string; // YYYY-MM-DD
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  days?: WorkoutDay[];
}


