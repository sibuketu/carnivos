# Supabase設定ガイド（完全版）

## 📋 手順概要

1. Supabaseプロジェクトを作成
2. 環境変数を取得
3. データベーススキーマを実行
4. ローカルの.envファイルに設定
5. Netlifyの環境変数に設定（既に完了）

---

## 1. Supabaseプロジェクトを作成

1. **[Supabase](https://supabase.com/)** にアクセス
2. 「Start your project」をクリック（アカウントがない場合は作成）
3. 「New Project」をクリック
4. プロジェクト情報を入力：
   - **Name**: `primal-logic` または任意の名前
   - **Database Password**: 強力なパスワードを設定（後で必要）
   - **Region**: 最寄りのリージョンを選択（例: `Northeast Asia (Tokyo)`）
5. 「Create new project」をクリック
6. プロジェクトの作成完了を待つ（1-2分）

---

## 2. 環境変数を取得

1. Supabaseダッシュボードで、左メニューから「Settings」→「API」を開く
2. 以下の値をコピー：
   - **Project URL** → `VITE_SUPABASE_URL`
     - 例: `https://xxxxxxxxxxxxx.supabase.co`
   - **anon public** キー → `VITE_SUPABASE_ANON_KEY`
     - 例: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`（長い文字列）

**重要**: これらの値は後で使用するので、安全な場所に保存してください。

---

## 3. データベーススキーマを実行

1. Supabaseダッシュボードで、左メニューから「SQL Editor」を開く
2. 「New query」をクリック
3. `supabase_schema.sql` ファイルの内容をコピーして貼り付け
4. 「Run」ボタンをクリック（または `Ctrl+Enter`）
5. 成功メッセージが表示されることを確認

**エラーが出た場合**:
- 既にテーブルが存在する場合は、`CREATE TABLE IF NOT EXISTS` によりスキップされます
- ポリシーが既に存在する場合は、エラーが出る可能性がありますが、無視してOKです

---

## 4. ローカルの.envファイルに設定

1. `.env` ファイルを開く（`primal-logic-app/primal-logic-web/.env`）
2. 以下の環境変数を追加（または既存のコメントを外して設定）：

```env
# Supabase（クラウドバックアップを使用する場合）
VITE_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

3. ファイルを保存

**重要**: 
- `=` の前後にスペースを入れない
- 実際の値に置き換える（`https://...` と `eyJ...` の部分）

---

## 5. Netlifyの環境変数に設定（既に完了）

✅ 既にNetlifyの環境変数設定は完了しています。

確認:
- `VITE_SUPABASE_URL` が設定されているか
- `VITE_SUPABASE_ANON_KEY` が設定されているか

---

## 6. 動作確認

### ローカル環境での確認

1. 開発サーバーを再起動：
   ```bash
   cd primal-logic-app/primal-logic-web
   npm run dev
   ```

2. アプリを開いて、以下を確認：
   - エラーが出ないこと
   - データが保存されること
   - ブラウザのコンソールにSupabase関連のエラーが出ないこと

### Netlifyでの確認

1. Netlifyのデプロイが成功しているか確認
2. デプロイされたアプリで、データが保存されることを確認

---

## ❓ よくある質問

### Q: Supabaseは必須ですか？

**A: いいえ、オプションです。**
- 設定されていない場合、`localStorage`のみを使用します
- エラーは出ますが、アプリは動作します
- クラウドバックアップ機能を使いたい場合のみ設定してください

### Q: RLSポリシーエラーが出る

**A: 既にポリシーが存在する場合は、エラーが出ますが無視してOKです。**
- `CREATE POLICY IF NOT EXISTS` はPostgreSQLでは使えないため、手動で削除するか、エラーを無視してください

### Q: 認証機能は使えますか？

**A: はい、使えます。**
- Supabase Authを使用したログイン・登録・パスワードリセット機能が実装されています
- ただし、認証なしでも動作します（ゲストモード）

---

## 🔗 関連ファイル

- `supabase_schema.sql` - データベーススキーマ
- `src/lib/supabaseClient.ts` - Supabaseクライアント設定
- `src/types/supabase.ts` - データベース型定義
- `ENV_SETUP_COMPLETE_GUIDE.md` - 環境変数設定ガイド

