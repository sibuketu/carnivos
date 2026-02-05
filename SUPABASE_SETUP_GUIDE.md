# Supabaseセットアップ完全ガイド

> **作成日**: 2026-02-01  
> **目的**: Supabaseプロジェクトのセットアップ手順

## 📋 セットアップ手順

### 1. アカウント作成
```
https://supabase.com
```
右上の「Start your project」→ GitHubまたはEmailでサインアップ

### 2. プロジェクト作成
- Name: `carnivos-app`
- Database Password: **必ず保存**
- Region: `Northeast Asia (Tokyo)`
- Plan: `Free`

### 3. APIキー取得
Project Settings → API → 以下をコピー：
- Project URL
- anon public key

### 4. .env ファイル作成
```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbG...
```

### 5. データベーステーブル作成
SQL Editor で実行：

```sql
-- user_profiles
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  weight REAL,
  height REAL,
  activity_level TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users own profile" ON user_profiles
  FOR ALL USING (auth.uid() = user_id);

-- food_logs  
CREATE TABLE food_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  food_name TEXT NOT NULL,
  amount REAL NOT NULL,
  nutrients JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE food_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users own logs" ON food_logs
  FOR ALL USING (auth.uid() = user_id);
```

### 6. 認証設定
Authentication → Providers → Email: ON

### 7. テスト
`npm run dev` → 新規登録 → ログイン

完了！
