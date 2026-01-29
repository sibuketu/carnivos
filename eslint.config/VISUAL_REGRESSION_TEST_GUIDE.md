# Visual Regression Test ガイド

## 概要

Visual Regression Test（VRT）は、UIの見た目が意図せず変更されていないかを検出するテストです。スクリーンショットを比較して、デザインの変更を自動的に検出します。

## 実行方法

### 初回実行（ベースライン作成）

```bash
npm run test:visual:update
```

初回実行時は、現在のUIをベースラインとして保存します。

### 通常のテスト実行

```bash
npm run test:visual
```

コードを変更した後、このコマンドでスクリーンショットを比較します。

### UIモードで実行

```bash
npm run test:ui
```

ブラウザでテスト結果を確認できます。

## テスト対象画面

- ホーム画面（デスクトップ/モバイル）
- 入力画面（ButcherSelect）（デスクトップ/モバイル）
- 履歴画面（デスクトップ/モバイル）
- Labs画面（デスクトップ）
- 設定画面（デスクトップ）
- AIチャットモーダル（デスクトップ）
- 栄養素ゲージ（詳細表示）
- Argument Card表示

## スクリーンショットの保存場所

```
primal-logic-web/test-results/
```

## 差分の確認方法

テストが失敗した場合、`test-results/`フォルダーに以下が保存されます：

- `*-actual.png`: 実際のスクリーンショット
- `*-expected.png`: 期待されるスクリーンショット
- `*-diff.png`: 差分画像

## 許容誤差の調整

`playwright.config.ts`の`maxDiffPixels`で調整できます：

```typescript
await expect(page).toHaveScreenshot('home-screen.png', {
  maxDiffPixels: 100, // 100ピクセルまでの差分を許容
});
```

## 注意事項

- 動的コンテンツ（日付、ランダムな値など）は除外する必要があります
- 初回実行時は必ず`--update-snapshots`フラグを使用してください
- 意図的なUI変更がある場合は、ベースラインを更新してください

