# Cursor実装タスク（修正版・トークン節約）

**目的**: 世界一のCarnivoreアプリ

**重要**: 優先度3（栄養素計算）は既に100%完璧に実装済みのため削除済み

---

## 優先度1: Lint修正（5分）

### エラー箇所
1. `android/app/build/**` → `.eslintignore`に追加
2. `AISpeedDial.tsx:19` → `FASTING_TEMPLATES`を削除または`_FASTING_TEMPLATES`にリネーム
3. `InputScreen.tsx:1162` → `any`を適切な型に（React.ChangeEvent等）

---

## 優先度2: ButcherSelect動的目標値対応（最重要・30分）

### 問題
HomeScreenは動的計算、ButcherSelectは静的値 → 追加前後で目標値が不一致

### 実装
1. `HomeScreen.tsx`から`getCarnivoreTargets()`の結果をButcherSelectにpropsで渡す
2. `ButcherSelect.tsx` (line 12)の`DEFAULT_CARNIVORE_TARGETS`import削除
3. ButcherSelect内の`DEFAULT_CARNIVORE_TARGETS.xxx`を`props.dynamicTargets.xxx`に変更（約30箇所）

**ファイル**:
- `src/screens/HomeScreen.tsx`
- `src/components/butcher/ButcherSelect.tsx`

---

## 優先度3: UI/UX改善（30分）

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

## 優先度4: エラーハンドリング（1時間）

### A. Rate Limiter実装
`src/utils/rateLimiter.ts` 新規作成

```typescript
制限:
- 1日100回（通常）
- 1日100-200回 → 警告「平均の10倍使用。ご協力を」
- 1日200回超 → ソフトブロック（隠れアップグレード案内）
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

## 優先度5: パフォーマンス（1時間）

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

## 優先度6: 食品データベース拡充（継続的）

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

## 優先度7: 写真解析改善（1時間）

### A. フォローアップクエスチョン
`analyzeFoodImage`の戻り値に`followupQuestions`追加

### B. スキャン中Tips表示
写真解析中もTips表示（待ち時間活用）

### C. 速度改善
- 画像リサイズ（解像度下げる）
- キャッシュ機能（同じ画像の再解析回避）
- プログレスバー表示

---

## 優先度8: バーコードスマホ対応（30分）

### 問題
iOS Safariで「このブラウザは対応してません」

### 実装
- モバイルブラウザ検出追加
- iOS Safariの場合は画像アップロード方式案内
- Android Chromeは`BarcodeDetector` API動作確認追加
- フォールバック: `@zxing/library`使用

---

## 実装順序

1. **Lint修正**（5分）← 最速
2. **ButcherSelect動的目標値**（30分）← **最重要**
3. UI/UX改善（30分）
4. エラーハンドリング（1時間）
5. パフォーマンス（1時間）
6. 写真解析改善（1時間）
7. バーコードスマホ対応（30分）
8. 食品DB拡充（継続的）

---

## 注意

- 型安全性維持（`any`禁止）
- 既存機能を壊さない
- コミット時: `Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>`

---

## 削除した項目

~~優先度3: 栄養素計算精度向上~~ → **既に100%実装済み**
- 睡眠→ストレス→マグネシウム係数 ✅
- 運動→代謝→タンパク質・脂質係数 ✅
- 甲状腺→ヨウ素係数 ✅
- 日光浴→ビタミンD係数 ✅
- 消化問題→亜鉛・鉄吸収率補正 ✅
- アルコール・カフェイン→マグネシウム係数 ✅
- メンタルヘルス調整 ✅
- 代謝ストレス指標 ✅

**実装箇所**: `src/data/carnivoreTargets.ts` の `getCarnivoreTargets()` 関数
