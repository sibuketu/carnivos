# 作業委託: Stripe決済・Netlifyデプロイ接続

> **作成日**: 2026-02-09
> **作成者**: Windsurf/Cascade
> **対象Agent**: Claude Code / Cursor / 任意のAgent

---

## 背景・現状

### 完了済み（Windsurf実施済み）
- 全画面ダークモードCSS変数化（約20ファイル）
- 価格表示をUSD化（$99/yr, $9.99/mo）
- ShopScreen Stripe接続修正（Supabase Edge Function経由に統一）
- PaywallModalテキスト英語化
- Supabase Edge Function通貨をUSDに変更
- git push済み（GitHub: `sibuketu/carnivos` mainブランチ）

### ストア審査状況
- **Apple**: 審査提出済み
- **Android**: テスター募集中

---

## タスク1: Netlify自動デプロイ接続（人間操作が必要）

### 目的
git pushするだけで `carnivoslol.netlify.app` に自動デプロイされる状態にする。

### 現状
- GitHubリポジトリ: `https://github.com/sibuketu/carnivos.git`
- Netlifyサイト: `carnivoslol.netlify.app`（既存）
- `netlify.toml` はリポジトリルートに設定済み（`publish: dist`, `command: npm run build`）
- 現在はGitHub→Netlifyの自動接続が**未設定**の可能性あり

### 手順
1. Netlifyダッシュボードを開く
```
https://app.netlify.com/sites/carnivoslol/configuration/deploys
```

2. 「Link site to Git」または「Build settings」でGitHubリポジトリ `sibuketu/carnivos` を接続

3. ビルド設定（`netlify.toml`が自動認識されるはず）:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
   - **Node version**: 20

4. 環境変数を設定（Site configuration > Environment variables）:
```
VITE_GEMINI_API_KEY=AIzaSyAqMSE8HCCVwd3VQA26ZdK-mocleyS9Lbo
VITE_SUPABASE_URL=https://msvonymnpyeofznaopre.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1zdm9ueW1ucHllb2Z6bmFvcHJlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYyMjc5MDYsImV4cCI6MjA4MTgwMzkwNn0.DRSc0fGy35FtDBWo9ZgkaSqpTm4qLFRFR2_at2VKIXA
VITE_FIREBASE_API_KEY=AIzaSyCksvRRzxieft8CSd_NvJ8i6TAjQOCjyRk
VITE_FIREBASE_AUTH_DOMAIN=sibuketu-83cc0.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=sibuketu-83cc0
VITE_FIREBASE_STORAGE_BUCKET=sibuketu-83cc0.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=322669224002
VITE_FIREBASE_APP_ID=1:322669224002:web:3ffef6d8d261c0942e4ddb
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_51RCdvv06Z0q3rla2ISziU3zDNHHdFDlAhxKIrkDMXhxuuRFJqQaipFBxrhftR8azuQghmLifZUqLRTwUhlGaPEU200de63MPYe
```

5. デプロイをトリガー（「Trigger deploy」→「Deploy site」）

### 確認
- `https://carnivoslol.netlify.app` でアプリが表示されること
- 以降 `git push` で自動デプロイされること

---

## タスク2: Stripe決済の本番化

### 目的
Stripe決済フローを本番環境で動作させる。

### 現状
- **Stripe Publishable Key**: テストキー（`pk_test_...`）が `.env` に設定済み
- **Stripe Secret Key**: Supabase Edge Function の環境変数 `STRIPE_SECRET_KEY` に設定が必要
- **Supabase Edge Function**: `supabase/functions/create-checkout-session/index.ts` に実装済み
  - サブスクリプション（priceId指定）とギフト（amount指定、USD）の両方に対応
  - 7日間無料トライアル付き
- **ShopScreen.tsx**: Supabase Edge Function経由でCheckout Session作成（修正済み）
- **GiftScreen.tsx**: Supabase Edge Function経由でCheckout Session作成（元から対応済み）

### やること

#### 2-1. Stripe Price ID の作成
Stripe Dashboardで以下のPrice IDを作成:
```
https://dashboard.stripe.com/products
```

| プラン | 価格 | 請求間隔 | 用途 |
|--------|------|----------|------|
| Monthly | $9.99/月 | monthly | PaywallScreen月額プラン |
| Yearly | $99/年 | yearly | PaywallScreen年額プラン |

作成後、Price ID（`price_...`）を控える。

#### 2-2. Supabase Edge Function に STRIPE_SECRET_KEY を設定
```
https://supabase.com/dashboard/project/msvonymnpyeofznaopre/settings/functions
```

環境変数に追加:
- `STRIPE_SECRET_KEY`: Stripeダッシュボードのシークレットキー

#### 2-3. PaywallScreen にPrice IDを接続
`src/screens/PaywallScreen.tsx` で、サブスクリプション選択時にSupabase Edge Functionへ `priceId` を送信するよう実装。現在はハリボテ（「processing...」表示のみ）。

#### 2-4. Stripe Webhook の設定（任意・リリース後）
決済完了後にユーザーのサブスクリプション状態を更新するWebhook。
- Stripe Dashboard > Webhooks で `checkout.session.completed` イベントを設定
- Firebase Functions の `stripeWebhook`（`functions/lib/index.js`）が既に実装済み

#### 2-5. 本番キーへの切り替え（リリース直前）
- テストキー（`pk_test_...` / `sk_test_...`）→ 本番キー（`pk_live_...` / `sk_live_...`）に差し替え

---

## タスク3: GiftScreen.tsx 型エラー修正

### 現状
既存の型エラーが複数ある（今回の変更で導入されたものではない）:
- `supabase is possibly null` （6箇所）
- `SupabaseGift` 型の不一致（select結果の型が合わない）

### やること
- `supabase` の null チェックを追加（early return パターン）
- Supabase select の型を `SupabaseGift` に合わせる、または型アサーション

---

## 関連ファイル

| ファイル | 役割 |
|----------|------|
| `src/screens/ShopScreen.tsx` | ショップ画面（Stripe Checkout呼び出し） |
| `src/screens/GiftScreen.tsx` | ギフト画面（Stripe Checkout呼び出し） |
| `src/screens/PaywallScreen.tsx` | サブスクリプション画面（Price ID未接続） |
| `src/components/PaywallModal.tsx` | トライアル終了モーダル |
| `supabase/functions/create-checkout-session/index.ts` | Supabase Edge Function |
| `functions/lib/index.js` | Firebase Functions（Webhook含む） |
| `.env` | 環境変数（Publishable Key等） |
| `src/utils/i18n.ts` | 翻訳キー（価格表示） |

---

## 注意事項
- **RULES.md を2回読んでから作業開始すること**
- **AGENT_LOG.md に作業記録を残すこと**
- シークレットキーはチャットに貼らない（.env / Supabase環境変数のみ）
- 既存のTypeScriptエラー（GiftScreen.tsx）は今回のスコープ外だったが、修正推奨
