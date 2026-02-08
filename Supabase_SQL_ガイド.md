# Supabase SQL 実行ガイド

> テーブル作成・RLS・トリガーを一括で実行する手順。やることは **URL を開く → SQL を貼る → Run** の 3 つだけ。

---

## 手順（3 ステップ）

### 1. Supabase SQL Editor を開く

ブラウザで次の URL を開く。

```
https://supabase.com/dashboard/project/msvonymnpyeofznaopre/sql
```

- 未ログインなら Supabase にログインする。
- 左メニューで **SQL Editor** が選ばれていれば、そのままクエリ入力欄が表示される。

---

### 2. SQL を貼る

- 画面中央の **「New query」** の編集エリアをクリックする。
- 下の **「2で貼る SQL（全文）」** をすべてコピーし、編集エリアに貼り付ける。  
  （またはローカルファイル `supabase_schema.sql` の内容をそのままコピーして貼る。）

---

### 3. Run で実行

- 編集エリアの下（または右）の **Run** ボタンをクリックする。
- 結果に **Success** やエラーなしと出れば完了。  
  エラーが出た場合はメッセージをコピーして保存し、必要なら修正してから再実行する。

---

## 2で貼る SQL（全文）

`supabase_schema.sql` と同じ内容。ここからコピーして貼ってもよい。

```sql
-- Primal Logic - Supabase Database Schema
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

-- インデックス
CREATE INDEX IF NOT EXISTS idx_daily_logs_user_id ON daily_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_logs_date ON daily_logs(date);
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_streaks_user_id ON streaks(user_id);

-- RLS 有効化
ALTER TABLE daily_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE streaks ENABLE ROW LEVEL SECURITY;

-- RLS ポリシー（daily_logs）
CREATE POLICY "Users can view their own daily logs"
  ON daily_logs FOR SELECT
  USING (auth.uid()::text = user_id OR user_id LIKE 'anon_%');
CREATE POLICY "Users can insert their own daily logs"
  ON daily_logs FOR INSERT
  WITH CHECK (auth.uid()::text = user_id OR user_id LIKE 'anon_%');
CREATE POLICY "Users can update their own daily logs"
  ON daily_logs FOR UPDATE
  USING (auth.uid()::text = user_id OR user_id LIKE 'anon_%');

-- RLS ポリシー（profiles）
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid()::text = user_id OR user_id LIKE 'anon_%');
CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid()::text = user_id OR user_id LIKE 'anon_%');
CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid()::text = user_id OR user_id LIKE 'anon_%');

-- RLS ポリシー（streaks）
CREATE POLICY "Users can view their own streak"
  ON streaks FOR SELECT
  USING (auth.uid()::text = user_id OR user_id LIKE 'anon_%');
CREATE POLICY "Users can insert their own streak"
  ON streaks FOR INSERT
  WITH CHECK (auth.uid()::text = user_id OR user_id LIKE 'anon_%');
CREATE POLICY "Users can update their own streak"
  ON streaks FOR UPDATE
  USING (auth.uid()::text = user_id OR user_id LIKE 'anon_%');

-- トリガー用関数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- トリガー
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
```

---

## よくあること

| 状況 | 対処 |
|------|------|
| すでにテーブルがある | `CREATE TABLE IF NOT EXISTS` のためスキップされる。RLS やポリシーが未作成なら、RLS 以降のブロックだけを貼って Run する。 |
| ポリシーが重複してエラー | そのポリシーはすでに存在している。該当する `CREATE POLICY` を削除するか、一度 DROP POLICY してから再実行する。 |
| トリガーで EXECUTE FUNCTION がエラーになる | Supabase の Postgres バージョンによっては `EXECUTE PROCEDURE` にする必要がある。該当行を `EXECUTE PROCEDURE` に変えて再実行する。 |

---

## 実行後の確認（任意）

- 左メニュー **Table Editor** で `daily_logs` / `profiles` / `streaks` が表示されていればテーブルは作成済み。
- アプリでログイン → データを追加 → 別ユーザーでログインして、前のユーザーのデータが見えないことを確認すると RLS の動作確認になる。

---

**参照**: ローカルスキーマファイルは `primal-logic-app/primal-logic-web/supabase_schema.sql`。RLS だけ別途やりたい場合は `docs/P1_E1_I1_と_Supabase_ガイド.md` も参照。
