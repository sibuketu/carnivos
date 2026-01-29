# App Foundation Requirements (アプリ基盤機能要件定義)

**Target**: North American Biohackers
**Last Updated**: 2026-01-27

---

## 1. Authentication (認証)

### 1.1 Login Methods
| Method | Status | Priority |
|--------|--------|----------|
| Email + Password | Existing | Must have |
| Google Login | New | Must have |
| Apple Login | New | Must have (App Store requirement) |

### 1.2 Password Reset
- Email-based reset flow
- Standard Supabase auth flow

### 1.3 Account Deletion
- User can delete account from Settings
- Deletes: Supabase data + auth session + localStorage
- Confirmation required (double confirm)
- Irreversible warning displayed

---

## 2. Pricing & Subscription (Stripe)

### 2.1 Pricing

| Plan | Price | Notes |
|------|-------|-------|
| Monthly | **$19.99/month** | Reference price (anchor) |
| Yearly | **$99/year** | 59% OFF, $8.25/month equivalent |
| Free Trial | **7 days** | Full access during trial |

### 2.2 Pricing Strategy
- **Reference price is intentionally high** ($19.99)
- Coupons bring effective price down → strong anchoring effect
- If "too expensive" feedback → issue coupons, never lower reference price
- **Grandfathering**: on price increase, existing users keep old price

### 2.3 Coupon Strategy
- Monthly coupon issuance (various types):
  - Yearly discount
  - Extended trial period
  - Monthly price discount
- Always some coupon available → reference price stays high
- Idea: SNS roulette-style coupon reveal (see IMPROVEMENT_IDEAS.md)

### 2.4 Gift Feature
- Users can gift subscriptions to others
- Strategy: affluent early adopters gift to expand user base
- Existing GiftScreen implementation

### 2.5 Paywall UI
- PaywallScreen needed (currently missing)
- Show: monthly vs yearly comparison
- Show: savings on yearly plan
- Show: free trial callout
- Trigger: when user tries premium feature without subscription

### 2.6 Refund Policy
- **Lenient approach**: be generous with refunds
- "Forgot to cancel" → refund without friction
- Trust builds long-term retention over short-term revenue

### 2.7 Monetization Strategy
- **Full paid app** (no freemium, no free tier)
- 7-day free trial → full subscription required
- No free/paid feature split
- Coupons for flexibility (trial extension, discounts)

### 2.8 API Cost Policy
- **No user-facing usage limits** (no "5 queries per day" etc.)
- Visible limits cause stress even when generous
- Backend: anomaly detection only (alert if >100 calls/day per user)
- Paid-only users → low abuse motivation

### 2.9 Stripe Implementation
- Frontend: Stripe.js (already loaded)
- Backend: Firebase Cloud Functions (partially implemented)
- Required env vars: STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, PRICE_IDs, APP_URL
- Webhook events: checkout.session.completed, subscription.updated, subscription.deleted

---

## 3. Privacy Policy & Terms of Service

### 3.1 Current Status
- Both screens exist (PrivacyPolicyScreen.tsx, TermsOfServiceScreen.tsx)
- Consent flow exists (ConsentScreen.tsx)

### 3.2 Required Changes
| Change | Reason |
|--------|--------|
| Translate to English | Target is North American |
| Update date | Currently shows 2025-01-01 |
| Review content | Ensure compliance with current features |

---

## 4. Feedback & Support

### 4.1 Current Status
- FeedbackScreen exists (3 types: general, bug, feature request)
- Uses mailto: only (no backend)
- localStorage backup (50 items max)

### 4.2 Required Changes
| Change | Reason |
|--------|--------|
| Save to Supabase | Reliable storage, not lost on cache clear |
| Remove mailto: dependency | Doesn't guarantee delivery |
| Simple form → Supabase table | No over-engineering (n8n, spreadsheet, etc.) |

### 4.3 Feedback Flow
```
User submits feedback
    ↓
Save to Supabase (feedback table)
    ↓
Developer reads manually
    ↓
(Future: automation when volume justifies it)
```

---

## 5. Data Export

### 5.1 Current Status
- DataExportScreen exists
- JSON format only
- Limited data scope

### 5.2 Required Changes
| Change | Reason |
|--------|--------|
| Add CSV export | User-friendly, spreadsheet compatible |
| Keep JSON export | For technical users / data portability |
| Expand data scope | Include all user data (logs, custom foods, diary, settings) |

### 5.3 Export Formats
| Format | Contents | Use Case |
|--------|----------|----------|
| CSV | Daily logs, nutrients, food entries | Spreadsheet analysis |
| JSON | Full data dump (profile, settings, logs, foods) | Data portability, backup |

---

## 6. Language

| Setting | Value |
|---------|-------|
| Primary language | **English** |
| Future | Multi-language translation from English base |
| Current issue | Some screens still in Japanese → translate |

---

## 7. Notifications (通知)

### 7.1 Adopted (v1 Release)

| # | Notification | Example | Trigger |
|---|-------------|---------|---------|
| 1 | **Nutrient Deficiency Alert** | "Sodium: 62% - consider adding salt" | When key nutrient below threshold by end of day |
| 2 | **Weekly Summary** | "Weekly report ready: avg protein 165g" | Every Sunday/Monday |
| 3 | **Coupon/Promo** | "January coupon: 40% off yearly plan" | Monthly, tied to coupon strategy |
| 4 | **Meal Log Reminder** | "Haven't logged today - tap to add" | Configurable time, **ON/OFF toggle required** (fasting users) |
| 5 | **Trial Expiry** | "Trial ends in 2 days" | 2 days before trial ends |
| 6 | **Subscription Renewal** | "Subscription renews in 3 days" | 3 days before renewal |

### 7.2 Post-Launch (Requirements TBD)

| # | Notification | Status |
|---|-------------|--------|
| 7 | **AI Insight** | "Zinc low for 3 days - try oysters" | Requirements definition AND implementation both post-launch |

### 7.3 Not Adopted
| Notification | Reason |
|-------------|--------|
| Goal Achievement ("Protein target reached!") | Feels spammy with nutrient gauge already visible |

### 7.3 Notification Settings
- Each notification type individually toggleable (ON/OFF)
- Meal Log Reminder: OFF by default (fasting users should not be bothered)
- Others: ON by default

---

## 8. Offline & Sync

### 8.1 Offline Support
- localStorage as primary storage → works offline by default
- Supabase sync when online
- No internet → app still usable, syncs when reconnected

### 8.2 Cross-Device Sync
- Login with same account → same data on any device
- Supabase is source of truth
- localStorage is local cache
- Data conflict → newer timestamp wins

---

## 9. External AI Tasks (Memo for Other AI Tools)

These tasks are handled outside Claude Code. Documented here for reference.

| Task | Where | Notes |
|------|-------|-------|
| Domain / URL setup | Other AI | Needs domain purchase + DNS config |
| App Store submission | Other AI | Screenshots, description, review guidelines |
| Google Play submission | Other AI | Same as above |
| Japanese → English translation of all screens | Implementation AI | All UI must be English |

---

## 10. Technical Foundation (Developer Decision - No User Input Needed)

These are standard requirements that don't need user approval:

- Input validation on all forms
- Loading states for async operations
- Error handling with user-friendly messages
- Responsive design (mobile-first)
- PWA configuration (installable)
- HTTPS enforced

---

## 11. Completion Checklist

### Authentication
- [ ] Google Login integration
- [ ] Apple Login integration
- [ ] Account deletion (Supabase data actually deleted)

### Stripe
- [ ] PaywallScreen created
- [ ] Environment variables configured
- [ ] Subscription flow working (monthly + yearly)
- [ ] Coupon system
- [ ] Gift flow verified
- [ ] Grandfathering logic for future price changes

### Privacy & Terms
- [ ] English translation
- [ ] Date updated
- [ ] Content reviewed

### Feedback
- [ ] Supabase storage
- [ ] mailto: removed
- [ ] Form working end-to-end

### Export
- [ ] CSV export added
- [ ] Data scope expanded
- [ ] JSON export maintained

### Language
- [ ] All screens in English
- [ ] Japanese remnants removed

### Notifications
- [ ] Nutrient Deficiency Alert
- [ ] Weekly Summary
- [ ] Coupon/Promo notification
- [ ] Meal Log Reminder (with ON/OFF toggle)
- [ ] Notification settings screen

### Offline & Sync
- [ ] Offline mode working (localStorage fallback)
- [ ] Cross-device sync via Supabase

---

**Source**: Claude Code requirements session (2026-01-27)
