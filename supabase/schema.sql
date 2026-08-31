-- ============================================================
-- LifeSync OS — Supabase Schema
-- Run this in your Supabase SQL Editor to set up all tables.
-- ============================================================

-- Enable UUID generation
create extension if not exists "pgcrypto";

-- ─── HEALTH METRICS ─────────────────────────────────────────
create table if not exists public.health_metrics (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null,
  recorded_at     timestamptz not null default now(),
  heart_rate      int,
  steps           int,
  hydration_pct   int,
  spo2            numeric(4,1),
  body_temp       numeric(4,1),
  hrv_ms          int,
  stress_pct      int,
  vo2_max         int,
  calories_burned int,
  recovery_score  int,
  created_at      timestamptz not null default now()
);

create index if not exists health_metrics_user_date
  on public.health_metrics (user_id, recorded_at desc);

-- ─── WORKOUTS ───────────────────────────────────────────────
create table if not exists public.workouts (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null,
  name            text not null,
  type            text not null default 'cardio',
  duration_min    int  not null default 0,
  calories        int  not null default 0,
  avg_heart_rate  int,
  distance_km     numeric(6,2),
  notes           text,
  workout_date    date not null default current_date,
  created_at      timestamptz not null default now()
);

create index if not exists workouts_user_date
  on public.workouts (user_id, workout_date desc);

-- ─── STUDY SESSIONS ─────────────────────────────────────────
create table if not exists public.study_sessions (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null,
  subject         text not null,
  duration_min    int  not null default 25,
  focus_score     int,
  session_date    date not null default current_date,
  created_at      timestamptz not null default now()
);

create index if not exists study_sessions_user_date
  on public.study_sessions (user_id, session_date desc);

-- ─── MOOD LOGS ──────────────────────────────────────────────
create table if not exists public.mood_logs (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null,
  score           int  not null check (score between 1 and 5),
  energy_pct      int,
  anxiety_pct     int,
  motivation_pct  int,
  logged_at       timestamptz not null default now(),
  created_at      timestamptz not null default now()
);

create index if not exists mood_logs_user_date
  on public.mood_logs (user_id, logged_at desc);

-- ─── SLEEP LOGS ─────────────────────────────────────────────
create table if not exists public.sleep_logs (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null,
  hours           numeric(4,1) not null,
  deep_pct        int not null default 22,
  rem_pct         int not null default 18,
  light_pct       int not null default 54,
  awake_pct       int not null default 6,
  sleep_date      date not null default current_date,
  created_at      timestamptz not null default now()
);

create index if not exists sleep_logs_user_date
  on public.sleep_logs (user_id, sleep_date desc);

-- ─── GOALS ──────────────────────────────────────────────────
create table if not exists public.goals (
  id                   uuid primary key default gen_random_uuid(),
  user_id              uuid not null,
  title                text not null,
  category             text not null default 'FITNESS',
  icon                 text not null default '🎯',
  progress             int  not null default 0 check (progress between 0 and 100),
  target_description   text not null default '',
  detail               text not null default '',
  accent               text not null default 'cyan',
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

create index if not exists goals_user
  on public.goals (user_id, created_at desc);

-- ─── ROW LEVEL SECURITY ──────────────────────────────────────
-- Users can only see their own rows.
-- (Enable RLS in the Supabase dashboard or via the commands below)

alter table public.health_metrics enable row level security;
alter table public.workouts        enable row level security;
alter table public.study_sessions  enable row level security;
alter table public.mood_logs       enable row level security;
alter table public.sleep_logs      enable row level security;
alter table public.goals           enable row level security;

-- Public (anon) read/write — DEMO ONLY.
-- Replace with auth.uid() = user_id policies once auth is configured.
create policy "anon full access health_metrics" on public.health_metrics for all using (true) with check (true);
create policy "anon full access workouts"        on public.workouts        for all using (true) with check (true);
create policy "anon full access study_sessions"  on public.study_sessions  for all using (true) with check (true);
create policy "anon full access mood_logs"       on public.mood_logs       for all using (true) with check (true);
create policy "anon full access sleep_logs"      on public.sleep_logs      for all using (true) with check (true);
create policy "anon full access goals"           on public.goals           for all using (true) with check (true);

-- ─── SEED DATA ───────────────────────────────────────────────
-- Demo user UUID matches DEMO_USER_ID in src/lib/db.ts
do $$
declare
  uid uuid := '00000000-0000-0000-0000-000000000001';
begin

  -- Health Metrics (last 7 days)
  insert into public.health_metrics
    (user_id, recorded_at, heart_rate, steps, hydration_pct, spo2, body_temp, hrv_ms, stress_pct, vo2_max, calories_burned, recovery_score)
  values
    (uid, now() - interval '6 days', 68, 7200, 78, 98.0, 36.5, 62, 32, 76, 1980, 81),
    (uid, now() - interval '5 days', 71, 9100, 80, 98.2, 36.6, 65, 28, 76, 2100, 83),
    (uid, now() - interval '4 days', 74, 6300, 72, 97.9, 36.7, 58, 38, 77, 1720, 78),
    (uid, now() - interval '3 days', 70, 8800, 82, 98.3, 36.5, 70, 25, 77, 2280, 87),
    (uid, now() - interval '2 days', 72, 7500, 79, 98.1, 36.6, 66, 30, 78, 2050, 84),
    (uid, now() - interval '1 day',  69, 8200, 81, 98.4, 36.5, 68, 26, 78, 2200, 86),
    (uid, now(),                      72, 8420, 82, 98.0, 36.6, 68, 28, 78, 2340, 87)
  on conflict do nothing;

  -- Workouts (last 7 days)
  insert into public.workouts
    (user_id, name, type, duration_min, calories, avg_heart_rate, distance_km, workout_date)
  values
    (uid, 'Morning Run',     'run',      45, 520, 148, 6.2,  current_date),
    (uid, 'Upper Body Lift', 'strength', 60, 380, 132, null, current_date - 1),
    (uid, 'Yoga & Stretch',  'yoga',     30, 180, 95,  null, current_date - 2),
    (uid, 'HIIT Circuit',    'hiit',     40, 480, 162, null, current_date - 3),
    (uid, 'Cycling',         'cardio',   55, 420, 138, 18.4, current_date - 4),
    (uid, 'Swimming',        'swim',     45, 500, 144, 1.8,  current_date - 6)
  on conflict do nothing;

  -- Study Sessions (last 14 days, spread across subjects)
  insert into public.study_sessions
    (user_id, subject, duration_min, focus_score, session_date)
  values
    (uid, 'Computer Science',       50, 92, current_date),
    (uid, 'Advanced Mathematics',   45, 88, current_date),
    (uid, 'Advanced Mathematics',   50, 90, current_date - 1),
    (uid, 'Physics & Mechanics',    40, 80, current_date - 1),
    (uid, 'Computer Science',       55, 94, current_date - 2),
    (uid, 'Economics',              35, 75, current_date - 2),
    (uid, 'Advanced Mathematics',   60, 91, current_date - 3),
    (uid, 'Computer Science',       45, 89, current_date - 4),
    (uid, 'Physics & Mechanics',    50, 82, current_date - 4),
    (uid, 'Economics',              40, 78, current_date - 5),
    (uid, 'Advanced Mathematics',   55, 87, current_date - 6),
    (uid, 'Computer Science',       50, 93, current_date - 7)
  on conflict do nothing;

  -- Mood Logs
  insert into public.mood_logs
    (user_id, score, energy_pct, anxiety_pct, motivation_pct, logged_at)
  values
    (uid, 4, 74, 22, 86, now() - interval '6 days'),
    (uid, 5, 88, 15, 92, now() - interval '5 days'),
    (uid, 3, 60, 35, 70, now() - interval '4 days'),
    (uid, 4, 76, 25, 84, now() - interval '3 days'),
    (uid, 4, 72, 20, 80, now() - interval '2 days'),
    (uid, 5, 90, 18, 94, now() - interval '1 day'),
    (uid, 4, 74, 22, 86, now())
  on conflict do nothing;

  -- Sleep Logs
  insert into public.sleep_logs
    (user_id, hours, deep_pct, rem_pct, light_pct, awake_pct, sleep_date)
  values
    (uid, 7.0, 20, 17, 57, 6,  current_date - 7),
    (uid, 6.4, 18, 16, 60, 6,  current_date - 6),
    (uid, 7.4, 22, 18, 54, 6,  current_date - 5),
    (uid, 5.6, 15, 14, 65, 6,  current_date - 4),
    (uid, 6.8, 21, 17, 56, 6,  current_date - 3),
    (uid, 7.6, 24, 20, 50, 6,  current_date - 2),
    (uid, 7.5, 22, 18, 54, 6,  current_date - 1)
  on conflict do nothing;

  -- Goals
  insert into public.goals
    (user_id, title, category, icon, progress, target_description, detail, accent)
  values
    (uid, 'Run 10K in under 50min', 'FITNESS', '🏃', 72, 'Goal: Sub-50 pace',   'Current best: 52:14',        'orange'),
    (uid, 'Achieve 4.0 GPA',        'STUDY',   '📚', 98, 'Current: 3.92 GPA',   '2 exams remaining',           'cyan'),
    (uid, 'Improve HRV to 80ms',    'HEALTH',  '💜', 85, 'Current: 68ms',        'On track — +4ms/week',       'violet'),
    (uid, 'Hydration Consistency',  'HABIT',   '💧', 60, '3.0L daily',           'Missing weekends',            'cyan')
  on conflict do nothing;

end $$;
