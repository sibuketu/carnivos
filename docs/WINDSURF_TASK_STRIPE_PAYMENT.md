# Claude Code向け: Stripe決済セットアップ＆Netlify復旧ガイド

> **作成日**: 2026-02-09
> **作成者**: Windsurf/Cascade
> **対象**: Claude Code（人間操作をガイドする形式）
> **目的**: このmdをClaude Codeに渡し、ユーザー（sibuketu）のブラウザ操作をステップバイステップでガイドしてもらう

---

## 前提（Claude Codeへの指示）

- **RULES.md を2回読んでから作業開始すること**
- **AGENT_LOG.md に作業記録を残すこと**
- シークレットキーはチャットに貼らない（.env / Supabase環境変数のみ）
- ガイドは7.9形式（番号付き・URL直リンク・入力値コードブロック）で出すこと
- 画面操作はユーザーが行う。AIはガイドを出す役割

---

## ガイド1: Netlify復旧（クレジット上限超過でpaused）

### 現状
- サイト `carnivoslol.netlify.app` が「Project has been paused」状態
- 原因: Netlify無料プランのクレジット上限超過
- 「This team has exceeded the credit limit」と表示

### 解決策（A案推奨・B案・C案）

**A案（推奨）: 来月の自動復旧を待つ（$0）**
- 次の請求サイクル開始時に自動復旧する
- その間はローカル `npm run dev` で開発継続可能
- ストア審査（Apple/Android）には影響しない（審査はストアのビルドで動く）

**B案: Netlify有料プラン（Personal $19/月）にアップグレード**
- 即座にサイト復旧
- auto rechargeも使える
```
https://app.netlify.com/teams/sibuketu/billing
```

**C案: 別のホスティングに移行（Vercel等）**
- Vercelは無料枠が広い（月100GBバンドウィス）
- 移行コストあり

### ユーザーに確認すること
「Netlifyが無料枠超過でサイト停止中。A案: 来月自動復旧を待つ（$0）、B案: $19/月で即復旧、C案: Vercel移行。どれにする？」

---

## ガイド2: Stripe決済セットアップ（人間操作）

### 2-1. Stripeアカウント確認

1 Stripeダッシュボードを開く
```
https://dashboard.stripe.com
```
→ ログイン済みか確認。アカウントがなければ作成が必要。

### 2-2. Stripe商品・Price ID作成

1 Stripeの商品ページを開く
```
https://dashboard.stripe.com/products
```

2 「+ Add product」をクリック

3 **月額プラン**を作成:
- Name:
```
CarnivOS Monthly
```
- Price: 
```
9.99
```
- Currency: USD
- Billing period: Monthly（Recurring）
- 「Save product」

4 作成された Price ID（`price_...`で始まる文字列）を控える

5 同様に**年額プラン**を作成:
- Name:
```
CarnivOS Yearly
```
- Price:
```
99
```
- Currency: USD
- Billing period: Yearly（Recurring）
- 「Save product」

6 作成された Price ID を控える

### 2-3. Stripe Secret Key の取得

1 Stripe APIキーページを開く
```
https://dashboard.stripe.com/apikeys
```

2 「Secret key」の値を確認（`sk_test_...`で始まる）
→ **チャットに貼らない。次のステップでSupabaseに直接入力する。**

### 2-4. Supabase Edge Function に Secret Key を設定

1 Supabaseのプロジェクト設定を開く
```
https://supabase.com/dashboard/project/msvonymnpyeofznaopre/settings/functions
```

2 「Secrets」セクションで以下を追加:
- Name:
```
STRIPE_SECRET_KEY
```
- Value: 2-3で確認したSecret Key（`sk_test_...`）を貼る

### 2-5. PaywallScreenにPrice IDを接続（コード実装 → Claude Codeが実施）

**ファイル**: `src/screens/PaywallScreen.tsx`

**現状**: サブスクリプション選択時に「processing...」表示のみ（ハリボテ）

**やること**: 
- 月額ボタン押下時 → Supabase Edge Functionへ `{ priceId: "price_月額のID" }` を送信
- 年額ボタン押下時 → Supabase Edge Functionへ `{ priceId: "price_年額のID" }` を送信
- Edge Functionは既に `priceId` を受け取ってStripe Checkout Sessionを作成する実装済み
- `ShopScreen.tsx` の実装パターン（Supabase Edge Function呼び出し）を参考にする

**Edge Functionのエンドポイント**:
```
${VITE_SUPABASE_URL}/functions/v1/create-checkout-session
```

**リクエストbody例（サブスクリプション）**:
```json
{
  "priceId": "price_xxxxxxxx",
  "successUrl": "https://carnivoslol.netlify.app/?payment=success",
  "cancelUrl": "https://carnivoslol.netlify.app/?payment=canceled"
}
```

### 2-6. Stripe Webhook設定（リリース後でOK）

1 Stripe Webhookページを開く
```
https://dashboard.stripe.com/webhooks
```

2 「+ Add endpoint」をクリック

3 Endpoint URL:
```
https://msvonymnpyeofznaopre.supabase.co/functions/v1/stripe-webhook
```
（※ stripe-webhook Edge Functionが未実装の場合は、Firebase Functionsのエンドポイントを使う）

4 Events to send: `checkout.session.completed` を選択

### 2-7. 本番キーへの切り替え（リリース直前）

テストキー（`pk_test_...` / `sk_test_...`）→ 本番キー（`pk_live_...` / `sk_live_...`）に差し替え:
- `.env` の `VITE_STRIPE_PUBLISHABLE_KEY`
- Supabase Secrets の `STRIPE_SECRET_KEY`
- Netlify環境変数の `VITE_STRIPE_PUBLISHABLE_KEY`

---

## ガイド3: GiftScreen.tsx 型エラー修正（Claude Codeが実施）

### 現状
既存の型エラーが複数ある（Windsurf作業で導入されたものではない）:
- `supabase is possibly null`（6箇所）
- `SupabaseGift` 型の不一致（select結果の型が合わない）

### やること
- `supabase` の null チェックを追加（early return パターン）
- Supabase select の型を `SupabaseGift` に合わせる、または型アサーション

---

## 関連ファイル

| ファイル | 役割 |
|----------|------|
| `src/screens/ShopScreen.tsx` | ショップ画面（Stripe Checkout呼び出し・実装済み参考） |
| `src/screens/GiftScreen.tsx` | ギフト画面（Stripe Checkout呼び出し・型エラーあり） |
| `src/screens/PaywallScreen.tsx` | サブスクリプション画面（Price ID未接続・ハリボテ） |
| `src/components/PaywallModal.tsx` | トライアル終了モーダル |
| `supabase/functions/create-checkout-session/index.ts` | Supabase Edge Function（実装済み） |
| `functions/lib/index.js` | Firebase Functions（Webhook含む） |
| `.env` | 環境変数（Publishable Key等） |
| `src/utils/i18n.ts` | 翻訳キー（価格表示） |

---

## 完了済み（Windsurf実施済み・参考情報）
- 全画面ダークモードCSS変数化（約20ファイル）
- 価格表示をUSD化（$99/yr, $9.99/mo）
- ShopScreen Stripe接続修正（Supabase Edge Function経由に統一）
- PaywallModalテキスト英語化
- Supabase Edge Function通貨をUSDに変更
- Supabase Edge FunctionのデフォルトoriginをcarnivoslolURLに修正
- git push済み（GitHub: `sibuketu/carnivos` mainブランチ）
