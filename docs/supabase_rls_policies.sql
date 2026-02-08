-- Supabase RLS ポリシー（Cursor_実装指示書_完全版 S1）
-- 対象: ユーザーごとに自分のデータのみアクセス可能にする
--
-- 注意: daily_logs, profiles, streaks の RLS は supabase_schema.sql で既に有効化済み。
-- 以下のポリシーは、指示書で挙がっているテーブル名を想定したテンプレート。
-- テーブルが存在する場合のみ実行すること（存在しないテーブルへの ALTER はエラーになる）。

-- テーブルごとに user_id カラムで auth.uid() と照合する想定。
-- Supabase Auth 利用時: user_id が UUID の場合は auth.uid()、TEXT の場合は auth.uid()::text を使用。

-- 例: food_entries テーブルが存在する場合
-- ALTER TABLE food_entries ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Users can view own food_entries" ON food_entries FOR SELECT USING (auth.uid()::text = user_id);
-- CREATE POLICY "Users can insert own food_entries" ON food_entries FOR INSERT WITH CHECK (auth.uid()::text = user_id);
-- CREATE POLICY "Users can update own food_entries" ON food_entries FOR UPDATE USING (auth.uid()::text = user_id);
-- CREATE POLICY "Users can delete own food_entries" ON food_entries FOR DELETE USING (auth.uid()::text = user_id);

-- 例: daily_status テーブルが存在する場合
-- ALTER TABLE daily_status ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Users can view own daily_status" ON daily_status FOR SELECT USING (auth.uid() = user_id);
-- CREATE POLICY "Users can insert own daily_status" ON daily_status FOR INSERT WITH CHECK (auth.uid() = user_id);
-- CREATE POLICY "Users can update own daily_status" ON daily_status FOR UPDATE USING (auth.uid() = user_id);
-- CREATE POLICY "Users can delete own daily_status" ON daily_status FOR DELETE USING (auth.uid() = user_id);

-- 例: water_intake テーブルが存在する場合
-- ALTER TABLE water_intake ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Users can view own water_intake" ON water_intake FOR SELECT USING (auth.uid() = user_id);
-- CREATE POLICY "Users can insert own water_intake" ON water_intake FOR INSERT WITH CHECK (auth.uid() = user_id);
-- CREATE POLICY "Users can delete own water_intake" ON water_intake FOR DELETE USING (auth.uid() = user_id);

-- 例: fasting_sessions テーブルが存在する場合
-- ALTER TABLE fasting_sessions ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Users can view own fasting_sessions" ON fasting_sessions FOR SELECT USING (auth.uid() = user_id);
-- CREATE POLICY "Users can insert own fasting_sessions" ON fasting_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
-- CREATE POLICY "Users can update own fasting_sessions" ON fasting_sessions FOR UPDATE USING (auth.uid() = user_id);
-- CREATE POLICY "Users can delete own fasting_sessions" ON fasting_sessions FOR DELETE USING (auth.uid() = user_id);

-- 例: user_trophies / trophies_earned テーブルが存在する場合
-- ALTER TABLE user_trophies ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Users can view own user_trophies" ON user_trophies FOR SELECT USING (auth.uid() = user_id);
-- CREATE POLICY "Users can insert own user_trophies" ON user_trophies FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 例: custom_foods テーブルが存在する場合
-- ALTER TABLE custom_foods ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Users can view own custom_foods" ON custom_foods FOR SELECT USING (auth.uid() = user_id);
-- CREATE POLICY "Users can insert own custom_foods" ON custom_foods FOR INSERT WITH CHECK (auth.uid() = user_id);
-- CREATE POLICY "Users can update own custom_foods" ON custom_foods FOR UPDATE USING (auth.uid() = user_id);
-- CREATE POLICY "Users can delete own custom_foods" ON custom_foods FOR DELETE USING (auth.uid() = user_id);

-- 例: feedback_submissions テーブルが存在する場合
-- ALTER TABLE feedback_submissions ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Users can view own feedback_submissions" ON feedback_submissions FOR SELECT USING (auth.uid() = user_id);
-- CREATE POLICY "Users can insert own feedback_submissions" ON feedback_submissions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- テスト方法（指示書より）:
-- 1. Supabase ダッシュボード > SQL Editor で上記のうち該当テーブル用のブロックのコメントを外して実行
-- 2. 2つの異なるユーザーアカウントでログイン
-- 3. User A がデータを追加
-- 4. User B でログインし、User A のデータが見えないことを確認
