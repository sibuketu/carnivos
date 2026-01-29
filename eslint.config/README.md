# CarnivOS - Web App

> CarnivOS (Carnivore Compass) のWebアプリ版
> カーニボアダイエット管理アプリ - 世界一のCarnivoreアプリを目指す
> CapacitorでiOSアプリ化可能

---

## 🚀 クイックスタート

```bash
# 依存関係のインストール
npm install

# 開発サーバーの起動
npm run dev
```

ブラウザで `http://localhost:5173` を開いてください。

---

## 📋 セットアップ手順

### 1. リポジトリのクローン（初回のみ）

```bash
git clone <repository-url>
cd primal-logic-app/primal-logic-web
```

### 2. 依存関係のインストール

```bash
npm install
```

### 3. 環境変数の設定

`.env` ファイルを `primal-logic-web` ディレクトリに作成し、以下のテンプレートをコピーしてください：

```env
# ============================================
# CarnivOS - 環境変数設定
# ============================================
# このファイルをコピーして .env ファイルを作成し、
# 実際のAPIキーに置き換えてください
# ============================================

# ============================================
# 必須: Gemini API キー（AI機能を使用する場合）
# ============================================
# AI機能（チャット、写真解析等）を使用するには必須です
# 取得方法: https://aistudio.google.com/app/apikey
# 注意: Viteでは `VITE_` プレフィックスが必要です
VITE_GEMINI_API_KEY=your_gemini_api_key_here

# ============================================
# オプション: OpenAI API キー
# ============================================
# 従来のAIチャット機能を使用する場合のみ必要
# VITE_OPENAI_API_KEY=sk-your-api-key-here

# ============================================
# オプション: Supabase連携
# ============================================
# クラウドバックアップを使用する場合のみ必要
# 設定されていない場合、localStorageのみを使用します（自動フォールバック）
# 
# セットアップ手順:
# 1. https://supabase.com でプロジェクトを作成
# 2. プロジェクトURLとAnon Keyを取得
# 3. 以下の2行のコメントを外して値を設定
# 4. supabase_schema.sql をSupabaseのSQL Editorで実行
# VITE_SUPABASE_URL=your_supabase_project_url
# VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# ============================================
# オプション: Replicate API トークン
# ============================================
# 画像生成の完全自動化を使用する場合のみ必要（無料枠あり）
# アプリアイコン生成やSNS自動化で使用
# 取得方法: https://replicate.com/account/api-tokens
# VITE_REPLICATE_API_TOKEN=r8_your_api_token_here

# ============================================
# オプション: OpenWeatherMap API キー
# ============================================
# 天気情報の自動取得を使用する場合のみ必要
# ビタミンD合成計算に天気情報を自動反映
# 取得方法: https://openweathermap.org/api
# VITE_OPENWEATHER_API_KEY=your_openweather_api_key_here

# ============================================
# オプション: Google Fit API キー
# ============================================
# Google Fit連携を使用する場合のみ必要
# 歩数、心拍数、活動時間、消費カロリーの自動取得
# 注意: OAuth 2.0認証が必要（将来的に実装予定）
# 取得方法: https://console.cloud.google.com/apis/credentials
# VITE_GOOGLE_FIT_API_KEY=your_google_fit_api_key_here

# ============================================
# オプション: Google Calendar API キー
# ============================================
# Google Calendar連携を使用する場合のみ必要
# 食事時間や運動時間の記録
# 注意: OAuth 2.0認証が必要（将来的に実装予定）
# 取得方法: https://console.cloud.google.com/apis/credentials
# VITE_GOOGLE_CALENDAR_API_KEY=your_google_calendar_api_key_here

# ============================================
# オプション: Google Drive API キー
# ============================================
# Google Drive連携を使用する場合のみ必要
# データバックアップ
# 注意: OAuth 2.0認証が必要（将来的に実装予定）
# 取得方法: https://console.cloud.google.com/apis/credentials
# VITE_GOOGLE_DRIVE_API_KEY=your_google_drive_api_key_here
```

### 4. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで `http://localhost:5173` を開いてください。

---

## 🔑 APIキーの取得方法

### Gemini API キー（必須 - AI機能を使用する場合）

1. [Google AI Studio](https://aistudio.google.com/app/apikey) にアクセス
2. 「Create API Key」をクリック
3. 生成されたAPIキーをコピー
4. `.env` ファイルの `VITE_GEMINI_API_KEY` に貼り付け

### Supabase（オプション - クラウドバックアップを使用する場合）

1. [Supabase](https://supabase.com) でプロジェクトを作成
2. Settings → API から以下を取得：
   - Project URL → `VITE_SUPABASE_URL`
   - anon public key → `VITE_SUPABASE_ANON_KEY`
3. SQL Editorで `supabase_schema.sql` を実行してテーブルを作成

詳細な手順は `API_KEY_SETUP.md` を参照してください。

---

## 📱 iOSアプリ化（Capacitor）

詳細は `CAPACITOR_SETUP.md` を参照してください。

### クイックスタート

```bash
npm install @capacitor/core @capacitor/cli @capacitor/ios
npx cap init "CarnivOS" "com.primallogic.app"
npx cap add ios
npm run build
npx cap sync
npx cap open ios
```

---

## 🏗️ プロジェクト構造

```
src/
├── constants/     # バイオアベイラビリティ係数、動的必要量
├── types/         # TypeScript型定義
├── data/          # 食品データベース、Argument Cards
├── utils/         # 計算エンジン、ストレージ、通知
├── context/       # グローバル状態管理
├── components/    # UIコンポーネント
└── screens/       # 画面コンポーネント
```

---

## 📚 技術スタック

- **フレームワーク**: React + Vite
- **言語**: TypeScript
- **状態管理**: React Context API
- **ストレージ**: localStorage
- **通知**: Browser Notification API
- **iOS化**: Capacitor

---

## 🎯 主要機能

### 基本機能
- ✅ **栄養素追跡**: タンパク質、脂質、ビタミン、ミネラルなどの詳細な追跡
- ✅ **4ゾーングラデーションゲージ**: 直感的な栄養素可視化
- ✅ **動的目標値**: 100項目以上のプロファイル設定による個人最適化
- ✅ **P:F比率表示**: タンパク質と脂質の比率を視覚化
- ✅ **カルシウム:リン比率**: 骨代謝に重要な比率を表示
- ✅ **グリシン:メチオニン比率**: 長寿の視点から重要な比率を表示（ボーンブロス提案機能付き）【2026-01-03実装完了】
- ✅ **オメガ3/6比率**: 炎症管理に重要な比率を表示
- ✅ **Argument Cards**: 栄養素に関する科学的根拠の表示

### AI機能
- ✅ **AIチャット**: Carnivore専門家レベルのアドバイス
- ✅ **写真解析**: 食べたものを写真で記録
- ✅ **AI Concierge**: 詳細な栄養素情報の自動補完

### その他の機能
- ✅ **Recovery Protocol**: 違反検出時の自動リカバリープロトコル生成
- ✅ **習慣トラッカー**: カーニボアダイエットの連続日数を記録
- ✅ **履歴管理**: 過去の食事記録の確認と分析
- ✅ **多言語対応**: 英語、フランス語、ドイツ語、日本語、中国語
- ✅ **Gift機能**: コミュニティによる新規ユーザー支援
- ✅ **ドット絵UI**: アプリ全体をドット絵スタイルに変更可能

---

## 🛠️ 開発コマンド

```bash
# 開発サーバーの起動
npm run dev

# 本番ビルド
npm run build

# ビルド結果のプレビュー
npm run preview

# リンターの実行
npm run lint

# テストの実行
npm run test

# テスト（UIモード）
npm run test:ui
```

---

## 📦 ビルドとデプロイ

### 本番ビルド

```bash
npm run build
```

ビルド結果は `dist/` ディレクトリに出力されます。

### Netlifyへのデプロイ

このプロジェクトはNetlifyの自動デプロイに対応しています。

1. GitHubリポジトリをNetlifyに接続
2. ビルドコマンド: `npm run build`
3. 公開ディレクトリ: `dist`
4. 環境変数をNetlifyの設定で追加

詳細は `NETLIFY_DEPLOY.md` を参照してください。

---

## 🐛 トラブルシューティング

### 開発サーバーが起動しない

- Node.jsのバージョンを確認（v18以上推奨）
- `node_modules` を削除して `npm install` を再実行

### AI機能が動作しない

- `.env` ファイルが正しく作成されているか確認
- `VITE_GEMINI_API_KEY` が正しく設定されているか確認
- ブラウザのコンソールでエラーメッセージを確認

### ビルドエラーが発生する

- TypeScriptの型エラーを確認: `npm run lint`
- 依存関係を再インストール: `rm -rf node_modules && npm install`

---

## 🤖 AntiGravityでの開発

AntiGravityでこのプロジェクトを開いて開発することも可能です。

### クイックスタート

1. AntiGravityで「Open Folder」をクリック
2. `primal-logic-web`フォルダを選択
3. セキュリティ警告 → 「Yes, I trust the authors」を選択
4. `npm install` → `npm run dev`

詳細は以下を参照：
- [AntiGravity クイックスタート](./ANTIGRAVITY_QUICK_START.md)
- [AntiGravity移行ガイド](./ANTIGRAVITY_SETUP.md)
- [IDE使い分けガイド](./IDE_USAGE_GUIDE.md)

---

## 📚 関連ドキュメント

- [リリース前チェックリスト](./RELEASE_CHECKLIST.md)
- [APIキー設定ガイド](./API_KEY_SETUP.md)
- [Capacitorセットアップ](./CAPACITOR_SETUP.md)
- [Netlifyデプロイガイド](./NETLIFY_DEPLOY.md)
- [AntiGravity クイックスタート](./ANTIGRAVITY_QUICK_START.md)
- [AntiGravity移行ガイド](./ANTIGRAVITY_SETUP.md)
- [IDE使い分けガイド](./IDE_USAGE_GUIDE.md)

---

## 🔒 セキュリティ

- APIキーは `.env` ファイルに保存し、Gitにコミットしないでください
- `.env` ファイルは `.gitignore` に含まれています
- 本番環境では環境変数を適切に設定してください

---

## 📝 リリース前の確認事項

リリース前に以下のチェックリストを確認してください：

- [ ] 環境変数が正しく設定されているか
- [ ] 全画面の動作確認
- [ ] 翻訳漏れの確認（`RELEASE_CHECKLIST.md` 参照）
- [ ] パフォーマンステスト
- [ ] セキュリティチェック

詳細は [RELEASE_CHECKLIST.md](./RELEASE_CHECKLIST.md) を参照してください。

---

最終更新: 2026-01-03

