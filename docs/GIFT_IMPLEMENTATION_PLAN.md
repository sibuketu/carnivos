# Gift機能 実装プラン (Backend)

> **作成日**: 2026-01-28
> **担当**: Antigravity / Cursor
> **状態**: 🔴 未着手

---

## 現状

| 項目 | 状態 |
|:---|:---|
| GiftScreen UI | ✅ 完成 (898行) |
| Stripe Publishable Key | ✅ `.env` に設定済み |
| Stripe Secret Key | ❌ 未設定 |
| Supabase URL/Key | ❌ コメントアウト（未設定） |
| `/api/create-checkout-session` | ❌ 未実装 |
| `gifts` テーブル | ❌ 未作成 |

---

## 実装ステップ

### Phase 1: Supabase設定 (0.5時間)
1. [ ] Supabase Dashboard → 新規プロジェクト作成（または既存使用）
2. [ ] `.env` の `VITE_SUPABASE_URL` と `VITE_SUPABASE_ANON_KEY` を有効化
3. [ ] `gifts` テーブル作成:
   ```sql
   CREATE TABLE gifts (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     user_id UUID REFERENCES auth.users(id),
     amount INTEGER NOT NULL,
     month VARCHAR(7) NOT NULL, -- '2026-01'
     message TEXT,
     is_public BOOLEAN DEFAULT true,
     payment_provider VARCHAR(20),
     transaction_id VARCHAR(255),
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );
   ```
4. [ ] `gift_likes` テーブル作成
5. [ ] `gift_replies` テーブル作成

### Phase 2: Stripe設定 (0.5時間)
1. [ ] Stripe Dashboard → Gift用Product作成
2. [ ] Price ID取得（動的金額の場合は不要）
3. [ ] `STRIPE_SECRET_KEY` を `.env` に追加
4. [ ] `STRIPE_WEBHOOK_SECRET` を `.env` に追加

### Phase 3: Supabase Edge Function作成 (1時間)
1. [ ] `supabase/functions/create-checkout-session/index.ts` 作成
2. [ ] Stripe Checkout Session作成ロジック
3. [ ] デプロイ: `supabase functions deploy create-checkout-session`

### Phase 4: Webhook処理 (1時間)
1. [ ] `supabase/functions/stripe-webhook/index.ts` 作成
2. [ ] `checkout.session.completed` イベント処理
3. [ ] `gifts` テーブルへの記録
4. [ ] Stripe Dashboard → Webhook URL設定

### Phase 5: フロントエンド接続 (0.5時間)
1. [ ] `GiftScreen.tsx` の `/api/create-checkout-session` を Supabase Edge Function URLに変更
2. [ ] 動作確認

---

## 必要な環境変数（.env追加）

```bash
# Supabase（コメント外す）
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...

# Stripe Secret（サーバーサイドのみ、VITE_つけない）
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

---

## 優先度: 高

Gift機能はコミュニティ形成の核。リリース時に動作必須。

---

**次のアクション**: Supabaseプロジェクト設定
