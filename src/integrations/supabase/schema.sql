-- User-defined event categories
CREATE TABLE IF NOT EXISTS public.event_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    color_hex TEXT NOT NULL DEFAULT '#3B82F6',
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, name)
);

-- Course management
CREATE TABLE IF NOT EXISTS public.courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    code TEXT,
    instructor TEXT,
    color_hex TEXT DEFAULT '#10B981',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Task management
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    due_date TIMESTAMPTZ,
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    status TEXT DEFAULT 'notdone' CHECK (status IN ('notdone', 'done', 'pending', 'onhold', 'cancelled', 'urgent', 'ambiguous')),
    course_id UUID REFERENCES public.courses(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Update status constraint for existing table
ALTER TABLE public.tasks DROP CONSTRAINT IF EXISTS tasks_status_check;
ALTER TABLE public.tasks ADD CONSTRAINT tasks_status_check CHECK (status IN ('notdone', 'done', 'pending', 'onhold', 'cancelled', 'urgent', 'ambiguous'));

-- Study sessions (for Pomodoro tracking)
CREATE TABLE IF NOT EXISTS public.study_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    duration_minutes INTEGER NOT NULL,
    pomodoros_completed INTEGER DEFAULT 0,
    course_id UUID REFERENCES public.courses(id) ON DELETE SET NULL,
    task_id UUID REFERENCES public.tasks(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Study goals
CREATE TABLE IF NOT EXISTS public.study_goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    target_hours_weekly INTEGER NOT NULL,
    start_date TIMESTAMPTZ NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- User preferences
CREATE TABLE IF NOT EXISTS public.user_preferences (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    theme TEXT DEFAULT 'system' CHECK (theme IN ('light', 'dark', 'system')),
    default_reminder_minutes INTEGER DEFAULT 15,
    pomodoro_work_minutes INTEGER DEFAULT 25,
    pomodoro_short_break_minutes INTEGER DEFAULT 5,
    pomodoro_long_break_minutes INTEGER DEFAULT 15,
    pomodoro_cycles_before_long_break INTEGER DEFAULT 4,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Events table
CREATE TABLE IF NOT EXISTS public.events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    event_type TEXT NOT NULL, -- No check constraint, user-defined types allowed
    description TEXT,
    is_all_day BOOLEAN DEFAULT FALSE,
    series_id UUID,
    recurrence_ends_on TIMESTAMPTZ,
    category_id UUID REFERENCES public.event_categories(id) ON DELETE SET NULL,
    course_id UUID REFERENCES public.courses(id) ON DELETE SET NULL,
    rrule_string TEXT,
    reminder_settings_json JSONB DEFAULT '[]'::jsonb,
    canvas_id TEXT,
    canvas_type TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);
-- Removed event_type_check constraint to allow user-defined event types

-- RLS policies for new tables
ALTER TABLE public.event_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Event categories policies
CREATE POLICY "Users can manage their own categories" ON public.event_categories
FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Courses policies
CREATE POLICY "Users can manage their own courses" ON public.courses
FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Tasks policies
CREATE POLICY "Users can manage their own tasks" ON public.tasks
FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Study sessions policies
CREATE POLICY "Users can manage their own study sessions" ON public.study_sessions
FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Study goals policies
CREATE POLICY "Users can manage their own study goals" ON public.study_goals
FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- User preferences policies
CREATE POLICY "Users can manage their own preferences" ON public.user_preferences
FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Events policies
CREATE POLICY "Users can manage their own events" ON public.events
FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_event_categories_user_id ON public.event_categories(user_id);
CREATE INDEX IF NOT EXISTS idx_courses_user_id ON public.courses(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON public.tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON public.tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_study_sessions_user_id ON public.study_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_study_goals_user_id ON public.study_goals(user_id);

-- Insert default categories for new users
INSERT INTO public.event_categories (user_id, name, color_hex, is_default)
SELECT id, 'Class', '#3B82F6', true FROM auth.users
ON CONFLICT (user_id, name) DO NOTHING;

INSERT INTO public.event_categories (user_id, name, color_hex, is_default)
SELECT id, 'Study', '#10B981', true FROM auth.users
ON CONFLICT (user_id, name) DO NOTHING;

INSERT INTO public.event_categories (user_id, name, color_hex, is_default)
SELECT id, 'Personal', '#8B5CF6', true FROM auth.users
ON CONFLICT (user_id, name) DO NOTHING;

INSERT INTO public.event_categories (user_id, name, color_hex, is_default)
SELECT id, 'Appointment', '#F59E0B', true FROM auth.users
ON CONFLICT (user_id, name) DO NOTHING;

-- === Automatic updated_at triggers ===
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for tables with updated_at
DROP TRIGGER IF EXISTS trg_set_updated_at_event_categories ON public.event_categories;
CREATE TRIGGER trg_set_updated_at_event_categories
BEFORE UPDATE ON public.event_categories
FOR EACH ROW EXECUTE PROCEDURE set_updated_at();

DROP TRIGGER IF EXISTS trg_set_updated_at_courses ON public.courses;
CREATE TRIGGER trg_set_updated_at_courses
BEFORE UPDATE ON public.courses
FOR EACH ROW EXECUTE PROCEDURE set_updated_at();

DROP TRIGGER IF EXISTS trg_set_updated_at_tasks ON public.tasks;
CREATE TRIGGER trg_set_updated_at_tasks
BEFORE UPDATE ON public.tasks
FOR EACH ROW EXECUTE PROCEDURE set_updated_at();

DROP TRIGGER IF EXISTS trg_set_updated_at_study_goals ON public.study_goals;
CREATE TRIGGER trg_set_updated_at_study_goals
BEFORE UPDATE ON public.study_goals
FOR EACH ROW EXECUTE PROCEDURE set_updated_at();

DROP TRIGGER IF EXISTS trg_set_updated_at_user_preferences ON public.user_preferences;
CREATE TRIGGER trg_set_updated_at_user_preferences
BEFORE UPDATE ON public.user_preferences
FOR EACH ROW EXECUTE PROCEDURE set_updated_at();

DROP TRIGGER IF EXISTS trg_set_updated_at_events ON public.events;
CREATE TRIGGER trg_set_updated_at_events
BEFORE UPDATE ON public.events
FOR EACH ROW EXECUTE PROCEDURE set_updated_at();

