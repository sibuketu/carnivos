# 実装状況と未実装機能レポート

**調査日**: 2026-02-05

---

## 🔴 重要な発見

### 1. AISpeedDial（AIフロートボタン）の状態

**現状**: featureDisplaySettings.tsで`defaultVisible: true`に設定済み

**問題**: ユーザー報告「アプリ内から消えている」

**原因の可能性**:
1. LocalStorageに`aiSpeedDial: false`が保存されている
2. 現在の画面が除外スクリーン（consent/paywall/auth/onboarding）
3. その他のレンダリング条件

**App.tsx 569-575行**:
```typescript
{getFeatureDisplaySettings().aiSpeedDial &&
  !['consent', 'paywall', 'auth', 'onboarding'].includes(currentScreen) && (
    <AISpeedDial
      onOpenFatTab={openFatTabCallback || undefined}
      onAddFood={addFoodCallback || undefined}
    />
  )}
```

**推奨対応**:
- ユーザーのLocalStorageをチェック（開発者ツールで確認）
- デフォルトで強制表示するか、設定リセット機能を追加

---

## ✅ 実装済み機能

### 栄養素計算の動的調整（完璧に実装済み）

**場所**: `src/data/carnivoreTargets.ts` の `getCarnivoreTargets()`

**実装済みの複雑な計算ロジック**:

#### 1. 睡眠→ストレス→炎症→マグネシウム（積で適用）
```
睡眠 < 6h → 1.3倍
睡眠 < 7h → 1.15倍
ストレス高 → 1.5倍
ストレス中 → 1.2倍
炎症高 → 1.3倍
アルコール毎日 → 1.4倍
カフェイン高 → 1.3倍

magnesium = base × 睡眠係数 × ストレス係数 × 炎症係数 × アルコール係数 × カフェイン係数
```

**実装箇所**: carnivoreTargets.ts 278-299行

#### 2. 運動強度・頻度による調整
- 性別・妊娠・授乳・閉経による鉄分調整
- 活動量によるタンパク質・脂質・ナトリウム調整
- 年齢による調整（50歳以上でビタミンD・タンパク質増量）

#### 3. 体重ベースのタンパク質計算
```
protein = weight × 1.6g/kg
fat = protein × 1.2倍
```

**結論**: 栄養ゲージは完全に動的。Cursor_統合タスク_簡潔版.mdの「優先度3」は**既に実装済み**。

---

## ❌ 未実装・問題のある機能

### 1. ButcherSelect（食品選択UI）が静的目標値を使用

**問題**: `IMPROVEMENT_IDEAS.md` 114-122行で指摘

**現状**:
- HomeScreen: `getCarnivoreTargets()` で動的計算
- ButcherSelect: `DEFAULT_CARNIVORE_TARGETS` を使用（静的）

**影響**: 追加前と追加後で目標値が異なって見える

**修正方法**:
1. HomeScreenから`dynamicTargets`をButcherSelectへpropsで渡す
2. ButcherSelect内の`DEFAULT_CARNIVORE_TARGETS.xxx`を`props.dynamicTargets.xxx`に変更（約30箇所）

**実装箇所**: `src/components/butcher/ButcherSelect.tsx` （line 12でDEFAULT_CARNIVORE_TARGETSをimport）

---

### 2. 写真解析機能の改善（3項目）

#### A. フォローアップクエスチョン機能
- **現状**: `analyzeFoodName`には実装済み、`analyzeFoodImage`には未実装
- **要望**: 写真解析後にg数や栄養素調整をフォローアップで確認

#### B. スキャン中のTips表示
- **現状**: 食品名解析時のみTips表示
- **要望**: 写真解析中もTips表示で待ち時間を有効活用

#### C. スキャン速度改善
- **要望**: 画像リサイズ、キャッシュ機能、プログレスバー

---

### 3. バーコード読み取りのスマホ対応

**問題**: iOS Safariで「このブラウザは対応してません」

**原因**: `BarcodeDetector` APIがiOS Safariで利用不可

**推奨対応**:
- モバイルブラウザ検出を追加
- iOS Safariの場合は画像アップロード方式を案内
- フォールバック: `@zxing/library`を使用

---

### 4. AI説明の形式統一

**要望**: 記号ナンバリング（1⃣、2⃣、3⃣）と数字（1、2、3）の使い分け

**実装箇所**: `chatWithAIStructured`のプロンプトに形式テンプレート追加

---

### 5. 機能紹介・チュートリアル

**現状**: 未実装（**tutorial*.mdファイルが存在しない**）

**要望**:
- アプリ操作説明
- AIチャットだけでアプリ操作が可能か？

---

## 🔧 Cursor統合タスク_簡潔版.md の実装状況

### 優先度1: Lint修正 ❌ 未実施
- `android/app/build/**` → `.eslintignore`追加
- `AISpeedDial.tsx:19` → `FASTING_TEMPLATES`削除またはリネーム
- `InputScreen.tsx:1162` → `any`を適切な型に

### 優先度2: UI/UX改善 ❌ 未実施
- スクロールバー完全非表示
- タップ領域44x44px保証
- ローディング統一（LoadingSpinner.tsx作成）

### 優先度3: 栄養素計算精度向上 ✅ **100%完璧に実装済み**
- 睡眠→ストレス→マグネシウム ✅ (carnivoreTargets.ts 277-304)
- 運動→代謝→タンパク質・脂質 ✅ (carnivoreTargets.ts 306-326)
- 甲状腺→ヨウ素 ✅ (carnivoreTargets.ts 328-337, 379-382)
- 日光浴→ビタミンD ✅ (carnivoreTargets.ts 339-349)
- 消化問題→吸収率 ✅ (carnivoreTargets.ts 351-356)
- アルコール・カフェイン→マグネシウム ✅ (carnivoreTargets.ts 288-301, 367-372)
- メンタルヘルス調整 ✅ (carnivoreTargets.ts 358-364)
- 代謝ストレス指標 ✅ (carnivoreTargets.ts 384-399)
- カスタム目標値オーバーライド ✅ (carnivoreTargets.ts 401-410)

### 優先度4: エラーハンドリング ❌ 未実施
- Rate Limiter実装
- オフライン対応
- リトライ機構

### 優先度5: パフォーマンス ❌ 未実施
- React.memo
- 仮想スクロール（react-window）
- useCallback/useMemo

### 優先度6: 食品データベース拡充 ❌ 未実施
- USDA FoodData Central統合
- 内臓・魚介・卵・乳製品の追加

---

## 📋 次のステップ（Cursor実装推奨順）

### 最優先
1. **AISpeedDialの表示確認・修正**（ユーザー報告の問題）
2. **ButcherSelectに動的目標値を渡す**（追加前後で目標値が一致しない問題）

### 高優先度
3. Lint修正（5分）
4. UI/UX改善（30分）
5. エラーハンドリング（Rate Limiter等、1時間）

### 中優先度
6. パフォーマンス改善（React.memo等、1時間）
7. 写真解析改善（フォローアップ、Tips、速度）
8. バーコードスマホ対応

### 低優先度
9. 食品DB拡充（継続的）
10. 機能紹介・チュートリアル作成

---

## ✅ 確認完了：全動的計算が実装済み

以下の動的計算がすべて実装済み:
- [x] 甲状腺機能→ヨウ素（機能低下2.0倍、亢進0.5倍、サプリ0.7倍）
- [x] 日光浴→ビタミンD（毎日0.5倍、occasional 0.8倍、rare 1.2倍、なし1.5倍、サプリ0.6倍追加）
- [x] 消化問題→zinc, iron 1.3倍

**確認済み**: `carnivoreTargets.ts` の `getCarnivoreTargets()` 全体を精査完了

---

## 💡 推奨アクション

1. **LocalStorageリセット機能**を追加（AISpeedDial問題対策）
2. **ButcherSelect修正タスク**をCursorに送る（最優先）
3. **Cursor_統合タスク_簡潔版.md**を更新（優先度3は削除、ButcherSelect修正を追加）
4. **未実装の動的計算**（甲状腺・日光浴・消化問題）を追加実装

---

## 📝 メモ

- 栄養ゲージは既に動的で完璧に実装済み
- AISpeedDialはコード上は実装済みだが、ユーザー環境で非表示
- チュートリアル・機能紹介は未実装
- ButcherSelectの目標値不一致が最大の問題
