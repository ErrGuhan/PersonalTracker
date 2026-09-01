-- ============================================================
-- LifeSync OS — Phase 1: The Gamification Database (Supabase SQL)
-- Forgiving Streak Mechanic & Earning Mutation RPC
-- ============================================================

-- 1. Create Enum Type for Habit Log Status
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'habit_status') THEN
        CREATE TYPE habit_status AS ENUM ('COMPLETED', 'FROZEN', 'MISSED');
    END IF;
END $$;

-- 2. Profiles Table & freeze_tokens Column
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT,
    full_name TEXT,
    freeze_tokens INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Ensure freeze_tokens column is present if profiles existed previously
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS freeze_tokens INT NOT NULL DEFAULT 0;

-- 3. Habits Table (Core table referenced by habit_logs)
CREATE TABLE IF NOT EXISTS public.habits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    title TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'health',
    current_streak INT NOT NULL DEFAULT 0,
    frequency TEXT NOT NULL DEFAULT 'daily',
    target_count INT NOT NULL DEFAULT 1,
    icon TEXT NOT NULL DEFAULT '⚡',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Habit Logs Table with Strict DATE Type & Unique Constraint
CREATE TABLE IF NOT EXISTS public.habit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    habit_id UUID NOT NULL REFERENCES public.habits(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    status habit_status NOT NULL DEFAULT 'COMPLETED',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_habit_date UNIQUE(habit_id, date)
);

-- Indexes for querying performance
CREATE INDEX IF NOT EXISTS idx_habit_logs_habit_date ON public.habit_logs(habit_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_habits_user ON public.habits(user_id);

-- 5. Row Level Security Policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon full access profiles" ON public.profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "anon full access habits" ON public.habits FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "anon full access habit_logs" ON public.habit_logs FOR ALL USING (true) WITH CHECK (true);

-- 6. Supabase RPC Function: Earning Mutation
-- Complete habit, increment streak, and award freeze_token on every 7th consecutive day.
CREATE OR REPLACE FUNCTION public.complete_habit(
    p_habit_id UUID,
    p_date DATE DEFAULT CURRENT_DATE
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_id UUID;
    v_new_streak INT;
    v_freeze_tokens INT := 0;
    v_log_id UUID;
    v_awarded_token BOOLEAN := FALSE;
BEGIN
    -- Retrieve user ID and current streak for the target habit
    SELECT user_id, current_streak INTO v_user_id, v_new_streak
    FROM public.habits
    WHERE id = p_habit_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Habit with ID % not found', p_habit_id;
    END IF;

    -- Insert or update COMPLETED status log for the given strict DATE
    INSERT INTO public.habit_logs (habit_id, date, status)
    VALUES (p_habit_id, p_date, 'COMPLETED'::habit_status)
    ON CONFLICT (habit_id, date) 
    DO UPDATE SET status = 'COMPLETED'::habit_status
    RETURNING id INTO v_log_id;

    -- Increment habit streak
    UPDATE public.habits
    SET current_streak = current_streak + 1,
        updated_at = NOW()
    WHERE id = p_habit_id
    RETURNING current_streak INTO v_new_streak;

    -- Check streak milestone: award +1 freeze_token every 7 days
    IF v_new_streak > 0 AND (v_new_streak % 7 = 0) THEN
        v_awarded_token := TRUE;

        INSERT INTO public.profiles (id, freeze_tokens)
        VALUES (v_user_id, 1)
        ON CONFLICT (id) 
        DO UPDATE SET freeze_tokens = public.profiles.freeze_tokens + 1,
                      updated_at = NOW()
        RETURNING freeze_tokens INTO v_freeze_tokens;
    ELSE
        SELECT freeze_tokens INTO v_freeze_tokens 
        FROM public.profiles 
        WHERE id = v_user_id;
    END IF;

    RETURN jsonb_build_object(
        'success', true,
        'log_id', v_log_id,
        'habit_id', p_habit_id,
        'date', p_date,
        'current_streak', v_new_streak,
        'freeze_tokens', COALESCE(v_freeze_tokens, 0),
        'awarded_freeze_token', v_awarded_token
    );
END;
$$;
