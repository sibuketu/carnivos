# テスト実行ガイド

## 同時並行で実行できるテスト

### 1. Visual Regression Test（UI見た目テスト）【Web版】

**実行方法:**
```bash
cd primal-logic-app/primal-logic-web
run-visual-test.bat
```

または:
```bash
npm run test:visual
```

**初回実行時（ベースライン作成）:**
```bash
npm run test:visual:update
```

**特徴:**
- Webブラウザで実行（PCで完結）
- スクリーンショットを比較してUIの変更を検出
- 他のテストと同時実行可能

---

### 2. iOS版テスト（Maestro）【iOS実機】

**実行方法:**
```bash
cd primal-logic-app
run-ios-test.bat
```

または:
```bash
npm run test:e2e
```

**前提条件:**
1. Maestroのインストール
   ```powershell
   iwr https://get.maestro.mobile.dev -UseBasicParsing | iex
   ```

2. iOS実機の接続
   - USBケーブルでPCに接続
   - 「このコンピュータを信頼する」を選択

3. アプリの起動（別ターミナル）
   ```bash
   cd primal-logic-app
   npx expo start --ios
   ```

**特徴:**
- iOS実機で実行
- 実機での動作を確認
- Visual Regression Testと同時実行可能

---

## 同時実行の手順

### ターミナル1: Visual Regression Test

```bash
cd primal-logic-app/primal-logic-web
run-visual-test.bat
```

### ターミナル2: iOS版テスト

```bash
# 1. アプリを起動
cd primal-logic-app
npx expo start --ios

# 2. 別のターミナルでテスト実行
cd primal-logic-app
run-ios-test.bat
```

---

## テスト結果の確認

### Visual Regression Test
- 結果: `primal-logic-app/primal-logic-web/test-results/`
- 差分画像: `*-diff.png`
- 実際のスクリーンショット: `*-actual.png`

### iOS版テスト
- 結果: `primal-logic-app/.maestro/test-results/`
- ログ: ターミナルに表示

---

## トラブルシューティング

### Visual Regression Test

**差分が検出された場合:**
1. 意図的な変更か確認
2. 意図的な場合は、ベースラインを更新:
   ```bash
   npm run test:visual:update
   ```

### iOS版テスト

**デバイスが見つからない場合:**
```bash
maestro devices
```
- 実機が表示されない場合は、USB接続を確認

**アプリが見つからない場合:**
- アプリが起動しているか確認
- appIdが正しいか確認（`com.primallogic.app`）

---

最終更新: 2026-01-03

