# テストセットアップ

## ユニットテスト (Jest)

計算ロジック（`getCarnivoreTargets`など）のユニットテストを実行します。

### 実行方法

```bash
cd primal-logic-web

# 全テスト実行
npm run test:unit

# ウォッチモード（開発中に便利）
npm run test:unit:watch

# カバレッジレポート付き
npm run test:unit:coverage
```

### テストファイルの場所

- `src/__tests__/`: ユニットテストファイル
- テストファイル名: `*.test.ts` または `*.spec.ts`

## E2Eテスト (Playwright)

WebアプリのE2Eテストを実行します。

### 実行方法

```bash
cd primal-logic-web

# 全テスト実行
npm test

# UIモード（視覚的にテストを実行）
npm run test:ui

# ヘッド付きモード（ブラウザを表示）
npm run test:headed
```

## コードフォーマット (Prettier)

コードの自動フォーマットを実行します。

### 実行方法

```bash
cd primal-logic-web

# フォーマット実行
npm run format

# フォーマットチェック（CI用）
npm run format:check
```

## リンター (ESLint)

コードの品質チェックと自動修正を実行します。

### 実行方法

```bash
cd primal-logic-web

# リンターチェック
npm run lint

# 自動修正
npm run lint:fix
```

