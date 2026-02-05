# Cursor実装タスク（統合・簡潔版）

**目的**: 世界一のCarnivoreアプリ

---

## 優先度1: Lint修正

### エラー箇所
1. `android/app/build/**` → `.eslintignore`に追加
2. `AISpeedDial.tsx:19` → `FASTING_TEMPLATES`を削除または`_FASTING_TEMPLATES`にリネーム
3. `InputScreen.tsx:1162` → `any`を適切な型に（React.ChangeEvent等）

---

## 優先度2: UI/UX改善

### A. スクロールバー完全非表示
```css
/* src/index.css */
*, *::-webkit-scrollbar { display: none; }
* { scrollbar-width: none; -ms-overflow-style: none; }
```

### B. タップ領域44x44px保証
全ボタンに`min-width: 44px; min-height: 44px;`

### C. ローディング統一
共通コンポーネント`LoadingSpinner.tsx`作成
- 赤スピナー（#f43f5e）
- small/medium/large
- 全画面で使用

---

## 優先度3: 栄養素計算精度向上

### 実装場所
`src/data/carnivoreTargets.ts` の `getCarnivoreTargets()`

### 追加ロジック

#### 1. 睡眠→ストレス→マグネシウム
```
睡眠 < 6h → 1.3倍
睡眠 < 7h → 1.15倍
ストレス高 → 1.5倍
ストレス中 → 1.2倍
炎症高 → 1.3倍追加

magnesium = base × 睡眠係数 × ストレス係数 × 炎症係数
```

#### 2. 運動→代謝→タンパク質・脂質
```
運動（高・週5+） → 1.4倍
運動（高・週3+） → 1.3倍
運動（中・週4+） → 1.25倍
運動（中・週2+） → 1.15倍

protein = base × 運動係数
fat = base × 運動係数
sodium = base × (運動係数 > 1.2 ? 1.3 : 1.1)
```

#### 3. 甲状腺→ヨウ素
```
機能低下 → 2.0倍
正常 → 1.0倍
機能亢進 → 0.5倍
サプリ摂取中 → 0.7倍
```

#### 4. 日光浴→ビタミンD
```
毎日 → 0.5倍
週数回 → 0.8倍
稀 → 1.2倍
なし → 1.5倍
サプリ摂取中 → さらに0.6倍
```

#### 5. 消化問題→吸収率
```
消化問題あり → zinc, iron を 1.3倍
```

#### 6. アルコール・カフェイン→マグネシウム
```
アルコール（毎日） → 1.4倍
アルコール（週数回） → 1.2倍
カフェイン（高） → 1.3倍
カフェイン（中） → 1.15倍
```

---

## 優先度4: エラーハンドリング

### A. Rate Limiter実装
`src/utils/rateLimiter.ts` 新規作成

```typescript
制限:
- 1日50回（通常）
- 1日100回超 → 警告「平均の10倍使用。ご協力を」
- 1日150回超 → ソフトブロック
- 1分10回、10秒3回

checkRateLimit() → { allowed: boolean, reason?: string }
aiService.tsの全API呼び出し前にチェック
```

### B. オフライン対応
```typescript
navigator.onLine チェック
オフライン時: 「保存済みデータは閲覧可能」表示
```

### C. リトライ機構
```typescript
retryWithBackoff(fn, maxRetries=3, baseDelay=1000)
指数バックオフ: 1秒 → 2秒 → 4秒
```

---

## 優先度5: パフォーマンス

### A. React.memo
以下をmemo化:
- NutrientGauge
- MiniNutrientGauge
- ButcherChart
- StreakCalendar
- NutrientTrendChart
- WeightTrendChart

### B. 仮想スクロール（履歴100件以上時）
```bash
npm install react-window
```
HistoryScreenで`<FixedSizeList>`使用

### C. useCallback/useMemo
ハンドラーと重い計算をメモ化

---

## 優先度6: 食品データベース拡充

### データソース
USDA FoodData Central: https://fdc.nal.usda.gov/

### 追加すべき食品（Tier 1）
- 内臓: 牛/鶏/豚レバー、牛ハツ、牛タン
- 魚介: イワシ、サバ、サーモン、マグロ、エビ、カキ
- 卵: 鶏卵（全卵、卵黄）
- 乳製品: チーズ各種、バター、生クリーム

### 実装
`src/data/butcherData.ts`に追加
USDAのFDC IDを記録（トレーサビリティ）

---

## 実装順序

1. Lint修正（5分）
2. UI/UX改善（30分）
3. 栄養素計算（1時間）
4. エラーハンドリング（1時間）
5. パフォーマンス（1時間）
6. 食品DB拡充（継続的）

---

## 注意

- 型安全性維持（`any`禁止）
- 既存機能を壊さない
- コミット時: `Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>`
