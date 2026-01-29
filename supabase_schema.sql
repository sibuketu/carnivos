-- Primal Logic - Supabase Database Schema
-- 
-- このSQLファイルをSupabaseのSQL Editorで実行して、テーブルを作成してください。

-- daily_logs テーブル
CREATE TABLE IF NOT EXISTS daily_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  date DATE NOT NULL,
  status JSONB NOT NULL,
  fuel JSONB NOT NULL,
  calculated_metrics JSONB NOT NULL,
  recovery_protocol JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- profiles テーブル
CREATE TABLE IF NOT EXISTS profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE,
  gender TEXT NOT NULL CHECK (gender IN ('male', 'female')),
  height NUMERIC,
  weight NUMERIC,
  goal TEXT NOT NULL,
  dairy_tolerance BOOLEAN,
  metabolic_status TEXT NOT NULL CHECK (metabolic_status IN ('adapted', 'transitioning')),
  mode TEXT,
  target_carbs NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- streaks テーブル
CREATE TABLE IF NOT EXISTS streaks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE,
  current_streak INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  last_log_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックスを作成（パフォーマンス向上）
CREATE INDEX IF NOT EXISTS idx_daily_logs_user_id ON daily_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_logs_date ON daily_logs(date);
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_streaks_user_id ON streaks(user_id);

-- Row Level Security (RLS) を有効化
ALTER TABLE daily_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE streaks ENABLE ROW LEVEL SECURITY;

-- RLSポリシー: ユーザーは自分のデータのみアクセス可能
CREATE POLICY "Users can view their own daily logs"
  ON daily_logs FOR SELECT
  USING (auth.uid()::text = user_id OR user_id LIKE 'anon_%');

CREATE POLICY "Users can insert their own daily logs"
  ON daily_logs FOR INSERT
  WITH CHECK (auth.uid()::text = user_id OR user_id LIKE 'anon_%');

CREATE POLICY "Users can update their own daily logs"
  ON daily_logs FOR UPDATE
  USING (auth.uid()::text = user_id OR user_id LIKE 'anon_%');

CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid()::text = user_id OR user_id LIKE 'anon_%');

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid()::text = user_id OR user_id LIKE 'anon_%');

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid()::text = user_id OR user_id LIKE 'anon_%');

CREATE POLICY "Users can view their own streak"
  ON streaks FOR SELECT
  USING (auth.uid()::text = user_id OR user_id LIKE 'anon_%');

CREATE POLICY "Users can insert their own streak"
  ON streaks FOR INSERT
  WITH CHECK (auth.uid()::text = user_id OR user_id LIKE 'anon_%');

CREATE POLICY "Users can update their own streak"
  ON streaks FOR UPDATE
  USING (auth.uid()::text = user_id OR user_id LIKE 'anon_%');

-- updated_at を自動更新するトリガー関数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- トリガーを作成
CREATE TRIGGER update_daily_logs_updated_at
  BEFORE UPDATE ON daily_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_streaks_updated_at
  BEFORE UPDATE ON streaks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

