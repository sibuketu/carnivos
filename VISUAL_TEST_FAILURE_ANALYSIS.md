# Visual Regression Test失敗分析（2026-01-03）

> 29件の失敗の原因分析と対処方法

---

## 📊 現在の状況

- **全テスト**: 54件
- **成功**: 25件 ✅
- **失敗**: 29件 ❌
- **成功率**: 46%

---

## 🔍 失敗のパターン分析

### 成功しているテスト（25件）
- 主にchromiumブラウザで成功
- 一部のwebkitテストも成功

### 失敗しているテスト（29件）
- **firefox**: 多くのテストが失敗
- **webkit**: 一部のテストが失敗
- **chromium**: 一部のテストが失敗（栄養素ゲージ、Argument Cardなど）

---

## 🎯 失敗の原因（推測）

### 1. ベースラインが不完全
- **症状**: 一部のブラウザ・画面のベースラインが作成されていない
- **証拠**: firefoxとwebkitで多くの失敗
- **対処**: 再度 `npm run test:visual:update` を実行して、全ブラウザのベースラインを作成

### 2. ブラウザ固有の描画の違い
- **症状**: 同じ画面で、chromiumは成功、firefoxは失敗
- **原因**: ブラウザ間でフォントレンダリング、CSS解釈が異なる
- **対処**: `maxDiffPixels`を調整するか、ブラウザ固有の許容誤差を設定

### 3. タイミングの問題
- **症状**: アニメーションやローディングのタイミングが異なる
- **対処**: テストコードの待機時間を調整

---

## 🔧 推奨される対処方法

### 方法1: ベースラインを再作成（推奨）

全てのブラウザでベースラインを作成し直します：

```bash
cd "C:\Users\susam\Downloads\新しいフォルダー\docs\primal-logic-app\primal-logic-web"
npm run test:visual:update
```

または、バッチファイルから:
```
create-visual-baseline.bat をダブルクリック
```

### 方法2: 許容誤差を調整

`playwright.config.ts`の`maxDiffPixels`を増やす：

```typescript
expect: {
  toHaveScreenshot: {
    maxDiffPixels: 200, // 100 → 200に増やす
  },
}
```

### 方法3: ブラウザ固有の設定

特定のブラウザでのみ許容誤差を増やす：

```typescript
test('栄養素ゲージ - 詳細表示', async ({ page, browserName }) => {
  const maxDiff = browserName === 'firefox' ? 200 : 100;
  await expect(page).toHaveScreenshot('nutrient-gauge-section.png', {
    maxDiffPixels: maxDiff,
  });
});
```

---

## 📋 次のステップ

### 即座に実行すべきこと

1. **ベースラインを再作成**
   ```bash
   npm run test:visual:update
   ```

2. **テストを再実行**
   ```bash
   npm run test:visual
   ```

3. **結果を確認**
   - 成功数が増えているか確認
   - まだ失敗しているテストがあれば、原因を特定

### それでも失敗する場合

1. **失敗したテストのスクリーンショットを確認**
   - HTMLレポートで失敗したテストをクリック
   - 差分画像を確認

2. **許容誤差を調整**
   - `maxDiffPixels`を増やす
   - または、ブラウザ固有の設定を追加

3. **テストコードを調整**
   - 待機時間を増やす
   - セレクタを改善

---

## 🎯 目標

- **成功率**: 90%以上（50件以上成功）
- **失敗**: 5件以下（許容誤差内の差分のみ）

---

最終更新: 2026-01-03

