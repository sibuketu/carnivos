# APIキー設定ガイド

## Gemini APIキー（アプリのAIチャット機能）

### 設定場所

`.env` ファイルに以下を追加：

```env
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

### APIキー取得方法

1. **[Google AI Studio](https://aistudio.google.com/app/apikey)** にアクセス
2. 「Create API Key」をクリック
3. プロジェクトを選択（または新規作成）
4. APIキーをコピー
5. `.env`ファイルに貼り付け

---

## ElevenLabs APIキー（動画自動生成）

### 設定場所

`.env` ファイルに以下を追加：

```env
ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
```

### APIキー取得方法

1. **[ElevenLabs](https://elevenlabs.io/)** にアクセス
2. アカウント作成（Starterプラン $5/月 推奨）
3. **[Profile → API Keys](https://elevenlabs.io/app/settings/api-keys)** にアクセス
4. 「Generate new API key」をクリック
5. APIキーをコピー
6. `.env`ファイルに貼り付け

**プラン推奨**:
- 軽いプラン: Starter ($5/月) で開始
- 必要に応じて Creator ($99/月) にアップグレード可能

---

## Claude APIキー（台本自動生成）

### 設定場所

`.env` ファイルに以下を追加：

```env
ANTHROPIC_API_KEY=sk-ant-your_api_key_here
```

### APIキー取得方法

1. **[Anthropic Console](https://console.anthropic.com/)** にアクセス
2. アカウント作成
3. **[API Keys](https://console.anthropic.com/settings/keys)** にアクセス
4. 「Create Key」をクリック
5. APIキーをコピー（`sk-ant-...`で始まる）
6. `.env`ファイルに貼り付け

**料金**: 台本1本あたり約16円（激安）

---

## Replicate APIトークン（画像生成の自動化）

### 設定場所

`.env` ファイルに以下を追加：

```env
VITE_REPLICATE_API_TOKEN=r8_your_api_token_here
```

### APIトークン取得方法

1. **[Replicate](https://replicate.com/)** にアクセス（クリックで開きます）
2. アカウント作成（無料）
3. **[API Tokens](https://replicate.com/account/api-tokens)** にアクセス（クリックで開きます）
4. 「Create token」をクリック
5. トークンをコピー（`r8_...`で始まる）
6. `.env`ファイルに貼り付け

---

## Supabase（オプション - データ永続化）

### 設定場所

`.env` ファイルに以下を追加：

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 取得方法

1. **[Supabase](https://supabase.com/)** にアクセス（クリックで開きます）
2. プロジェクトを作成
3. 「Settings」→「API」でURLとAnon Keyをコピー
4. `.env`ファイルに貼り付け

---

## .envファイルの場所

`primal-logic-app/primal-logic-web/.env`

---

## 設定後の手順

1. `.env`ファイルを保存
2. 開発サーバーを再起動（自動で実行されます）

