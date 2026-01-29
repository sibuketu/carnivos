# Carnivoreアプリ（primal-logic-web）の環境変数設定ガイド

## 📍 .envファイルの場所

```
C:\Users\susam\Downloads\新しいフォルダー\docs\primal-logic-app\primal-logic-web\.env
```

## ✅ 必須の環境変数

### 1. Gemini APIキー（AIチャット機能に必須）

**エラーが出ている場合**: `VITE_GEMINI_API_KEY` が設定されていません

**設定方法**:

1. **[Google AI Studio](https://aistudio.google.com/app/apikey)** にアクセス
2. 「Create API Key」をクリック
3. プロジェクトを選択（または新規作成）
4. APIキーをコピー（`AIzaSy...`で始まる）
5. `.env`ファイルを開く
6. `VITE_GEMINI_API_KEY=your_gemini_api_key_here` の部分を以下に置き換え：
   ```env
   VITE_GEMINI_API_KEY=AIzaSy...（実際のAPIキー）
   ```

**重要**: 
- `your_gemini_api_key_here` を削除して、実際のAPIキーを貼り付け
- `=` の前後にスペースを入れない
- コメント（`#`）を同じ行に入れない

## 🔧 オプションの環境変数

### 2. Supabase（クラウドバックアップを使用する場合）

**現在のエラー**: `VITE_SUPABASE_URL` と `VITE_SUPABASE_ANON_KEY` が設定されていません

**注意**: Supabaseは**オプション**です。設定されていない場合、`localStorage`のみを使用します（自動フォールバック）。

**設定する場合の手順**:

1. **[Supabase](https://supabase.com/)** にアクセス
2. プロジェクトを作成（または既存のプロジェクトを使用）
3. 「Settings」→「API」を開く
4. 以下の値をコピー：
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public** キー → `VITE_SUPABASE_ANON_KEY`
5. `.env`ファイルを開く
6. コメント（`#`）を外して、実際の値を設定：
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

**Supabaseを設定しない場合**: 
- エラーは出ますが、アプリは動作します
- データは`localStorage`に保存されます（ブラウザのローカルストレージ）
- クラウドバックアップ機能は使用できません

## 🔄 設定後の手順

### 重要: 開発サーバーを再起動

**Viteでは、`.env`ファイルを変更したら、開発サーバーを完全に再起動する必要があります。**

1. **開発サーバーを停止**（Ctrl+C）
2. **開発サーバーを再起動**:
   ```bash
   cd primal-logic-app/primal-logic-web
   npm run dev
   ```

**注意**: 
- ブラウザをリロードするだけでは不十分
- 開発サーバーを完全に停止して再起動する必要がある

## 📝 .envファイルの例（完成形）

```env
# Gemini API キー（必須）
VITE_GEMINI_API_KEY=AIzaSyC...（実際のAPIキー）

# Supabase（オプション - クラウドバックアップを使用する場合）
# VITE_SUPABASE_URL=https://your-project.supabase.co
# VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Replicate API（オプション - 画像生成の自動化を使用する場合）
# VITE_REPLICATE_API_TOKEN=r8_your_api_token_here
```

## ❓ よくある質問

### Q: Supabaseは必須ですか？

**A: いいえ、オプションです。**
- 設定されていない場合、`localStorage`のみを使用します
- エラーは出ますが、アプリは動作します
- クラウドバックアップ機能を使いたい場合のみ設定してください

### Q: 再起動しても動かない

**A: 以下を確認してください：**
1. `.env`ファイルが正しい場所にあるか（`primal-logic-web`フォルダ内）
2. 環境変数名が正しいか（`VITE_`プレフィックスが必要）
3. `=`の前後にスペースがないか
4. 実際のAPIキーが設定されているか（`your_gemini_api_key_here`が残っていないか）
5. 開発サーバーを完全に再起動したか

### Q: チャットを変えてしまったのは問題ですか？

**A: Obsidianにメモがあれば問題ありません。**
- Cursorのチャット履歴は左サイドバーから確認できます
- 重要な情報はObsidianにメモしておけば問題ありません

## 🔗 関連ドキュメント

- `API_KEY_SETUP_GUIDE.md` - 詳細なAPIキー取得方法
- `README.md` - プロジェクトの概要
- `.env_OPEN_GUIDE.md` - .envファイルの開き方

