# P1 / E1 / I1 の説明と Supabase RLS ガイド

## P1・E1・I1 とは（なぜ「リリース後」か）

- **P1** = Priority 1（優先度1）。リリース**直後**に着手する機能群。
- **E1** = 3モードによるUI分け。**I1** = トロフィー機能。Others に配置。
- 「リリース後」= まず P0 でリリース可能にしてから、P1 をすぐ着手するため。

---

## Supabase RLS 適用ガイド

**結論: やることは「URL を開く → SQL を貼る → Run」の 3 つだけ。エクスプローラーでファイルを開くステップは不要。5のSQLを貼って Run だけで完了する。**

- エクスプローラーで supabase_schema.sql を開く意味: **なし（必須ではない）**。どのテーブルがあるか確認したいときだけ任意で開けばよい。
- 貼る SQL は下のコードブロックからコピーすればよい。ローカルファイルを開かなくてよい。

---

### 手順（3 ステップ）

| # | 場所（どの項目か） | 行動 | 場所（位置） | 値・メモ |
|---|-------------------|------|--------------|----------|
| 1 | Supabase SQL Editor | 開く | ブラウザ | 下の URL を開く |

```
https://supabase.com/dashboard/project/msvonymnpyeofznaopre/sql
```

| # | 場所（どの項目か） | 行動 | 場所（位置） | 値・メモ |
|---|-------------------|------|--------------|----------|
| 2 | SQL Editor のクエリ入力欄 | 貼る | 画面中央の編集エリア | 下の SQL をコピーして貼る（New query のタブで） |

**2で貼る内容（daily_logs 用・user_id が TEXT）:**

```sql
ALTER TABLE daily_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own daily_logs" ON daily_logs FOR SELECT USING (auth.uid()::text = user_id);
CREATE POLICY "Users can insert own daily_logs" ON daily_logs FOR INSERT WITH CHECK (auth.uid()::text = user_id);
CREATE POLICY "Users can update own daily_logs" ON daily_logs FOR UPDATE USING (auth.uid()::text = user_id);
CREATE POLICY "Users can delete own daily_logs" ON daily_logs FOR DELETE USING (auth.uid()::text = user_id);
```

**2で貼る内容（profiles 用・user_id が UUID）:**

```sql
CREATE POLICY "Users can view own profiles" ON profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own profiles" ON profiles FOR UPDATE USING (auth.uid() = user_id);
```

| # | 場所（どの項目か） | 行動 | 場所（位置） | 値・メモ |
|---|-------------------|------|--------------|----------|
| 3 | Run ボタン | クリック | クエリ欄の下または右 | 実行。結果でエラーがないことを確認 |

---

### 動作確認（任意）

| # | 場所（どの項目か） | 行動 | 場所（位置） | 値・メモ |
|---|-------------------|------|--------------|----------|
| 4 | アプリ | ログイン | ブラウザ | ユーザーAでデータ追加 → ログアウト → ユーザーBでログイン → Aのデータが見えないこと |

人間に依頼するときの理由の例:「RLS が有効か検証するため。User B で A のデータが見えなければ、ユーザーごとにデータが分離できていると判断できます。」

---

**使用ルール: 5.1, 7.9**
