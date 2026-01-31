-- 1. Profiles Table (ユーザー基本情報)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL UNIQUE, -- anon_... IDを許容するためTEXT型
    gender TEXT,
    height NUMERIC,
    weight NUMERIC,
    age INTEGER,
    activity_level TEXT,
    goal TEXT,
    diet_mode TEXT, -- 'carnivore', 'animal_based', 'ketovore'
    metabolic_status TEXT,
    
    -- Subscription Info
    subscription_status TEXT DEFAULT 'free',
    subscription_id TEXT,
    subscription_end_date TIMESTAMPTZ,
    trial_start_date TIMESTAMPTZ,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Daily Logs Table (毎日の記録)
CREATE TABLE IF NOT EXISTS public.daily_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL,
    date DATE NOT NULL,
    
    -- Status
    status JSONB DEFAULT '{}'::jsonb, -- 睡眠、便通など
    
    -- Validation Data
    weight NUMERIC,
    body_fat_percentage NUMERIC,
    
    -- Calculated Metrics (検索用キャッシュ)
    calculated_metrics JSONB DEFAULT '{}'::jsonb,
    
    -- Fuel & Diary
    fuel JSONB[] DEFAULT '{}',
    diary TEXT,
    
    -- Recovery Protocol
    recovery_protocol JSONB,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(user_id, date)
);

-- 3. Streaks Table (継続日数管理)
CREATE TABLE IF NOT EXISTS public.streaks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL UNIQUE,
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    last_log_date DATE,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create Indexes
CREATE INDEX IF NOT EXISTS idx_daily_logs_user_date ON public.daily_logs(user_id, date);
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_streaks_user_id ON public.streaks(user_id);

-- Enable RLS (Row Level Security) - 安全のため
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.streaks ENABLE ROW LEVEL SECURITY;

-- Policies (匿名認証のため、一時的に全開放またはuser_id一致で許可)
-- 開発中のため、一旦パブリックアクセスを許可（本番前に厳格化推奨）
CREATE POLICY "Public profiles access" ON public.profiles FOR ALL USING (true);
CREATE POLICY "Public daily_logs access" ON public.daily_logs FOR ALL USING (true);
CREATE POLICY "Public streaks access" ON public.streaks FOR ALL USING (true);
