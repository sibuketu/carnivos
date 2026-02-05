# Cursor実装タスク: Lint修正

**作成日**: 2026-02-05
**優先度**: 高

---

## Lintエラー一覧

### エラー1-3: android/app/build内のJSファイル（自動生成）
**ファイル**: `android/app/build/intermediates/assets/debug/mergeDebugAssets/native-bridge.js`

**問題**: 自動生成ファイルなので、Lintチェックから除外すべき

**修正方法**: `.eslintignore`に追加
```
# .eslintignore
android/app/build/**
```

---

### エラー2: 未使用変数 `FASTING_TEMPLATES`
**ファイル**: `src/components/dashboard/AISpeedDial.tsx`
**行**: 19

**問題**: `FASTING_TEMPLATES`が定義されているが使用されていない

**修正方法**: 2つのオプション

#### オプション1: 使用する（推奨）
```typescript
// 断食テンプレートを実際に使用する機能を実装
// 例: AIチャットで断食に関する質問時に自動提案
```

#### オプション2: 削除する
```typescript
// 19行目を削除
// const FASTING_TEMPLATES = ...
```

**判断**: コードを確認して、将来使用する予定があるなら変数名を`_FASTING_TEMPLATES`に変更（アンダースコアプレフィックスで未使用許可）、使わないなら削除。

**推奨修正**:
```typescript
// 将来使う予定があるなら
const _FASTING_TEMPLATES = [...]; // アンダースコアで未使用OK

// 使わないなら
// 削除
```

---

### エラー3: `any`型の使用
**ファイル**: `src/screens/InputScreen.tsx`
**行**: 1162

**問題**: `any`型が使用されている（型安全性の低下）

**修正方法**: 適切な型を指定

**コンテキスト確認が必要**: 1162行目付近のコードを確認して、適切な型を特定

**一般的な修正パターン**:
```typescript
// Before
const handleChange = (e: any) => {
  // ...
};

// After（イベントハンドラの場合）
const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  // ...
};

// Before
const data: any = JSON.parse(response);

// After
interface ResponseData {
  // 期待される構造を定義
  foods: Food[];
  total: number;
}
const data: ResponseData = JSON.parse(response);
```

**実装手順**:
1. 1162行目付近のコードを確認
2. `any`が何を表しているか特定
3. 適切な型（interface、type、またはReact型）を指定
4. 型エラーが出ないことを確認

---

## 実装順序

1. `.eslintignore`にandroid/app/buildを追加（即座）
2. `FASTING_TEMPLATES`の処理（削除または`_`プレフィックス）
3. `InputScreen.tsx`の`any`型を適切な型に修正

---

## 確認方法

修正後、以下を実行：
```bash
npm run lint
```

エラーが0になることを確認。

---

## 注意事項

- **型安全性重視**: `any`は極力避ける
- **自動生成ファイル**: Lintチェックから除外
- **未使用変数**: 将来使う予定があるなら`_`プレフィックス、使わないなら削除
