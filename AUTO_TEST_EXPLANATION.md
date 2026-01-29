# 自動テストと手動テストの違い

## 現在利用可能な自動テストツール

### 1. Playwright（E2Eテスト - Web版）
- **用途**: Webブラウザでの自動テスト
- **実行コマンド**: `npm test` または `npm run test:ui`
- **できること**: 
  - PCブラウザ（Chrome、Firefox、Safari）での自動操作
  - 画面遷移、ボタンクリック、フォーム入力などの自動化
- **できないこと**: 
  - iPhone実機でのテスト（PCのブラウザエミュレーションのみ）

### 2. Jest（ユニットテスト）
- **用途**: 関数・ロジックの自動テスト
- **実行コマンド**: `npm run test:unit`
- **できること**: 
  - 計算ロジック（栄養素計算など）の自動テスト
- **できないこと**: 
  - UIの操作テスト
  - 実機でのテスト

### 3. Maestro（モバイルE2Eテスト）
- **現状**: 導入されていない
- **用途**: iOS/Android実機での自動テスト
- **できること**: 
  - iPhone実機での自動操作
- **必要なもの**: 
  - Maestroのインストール
  - 実機との接続

---

## 今回のチェックリストについて

`TEST_ITEMS_29_ONWARD.md` は**手動テスト用**のチェックリストです。

### なぜ手動テストが必要？
- iPhone実機でのテストが必要
- PlaywrightはPCブラウザでのテストのみ（実機不可）
- Maestroは未導入

### 自動テストでできること
- PCブラウザでの基本動作確認（Playwright）
- 計算ロジックの検証（Jest）

### 自動テストでできないこと（手動テストが必要）
- iPhone実機での操作確認
- タッチ操作の確認
- Safari特有の動作確認
- 実機でのパフォーマンス確認

---

## 自動テストを実行する場合

### Playwrightでテスト実行
```bash
cd primal-logic-app/primal-logic-web
npm test
```

### Jestでテスト実行
```bash
cd primal-logic-app/primal-logic-web
npm run test:unit
```

---

最終更新: 2025-01-27

