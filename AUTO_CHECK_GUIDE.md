# UI自動チェックガイド

## 概要

Rulesに追加した自動チェック機能を実行するためのガイドです。以下の項目を自動的にチェックします：

1. **入力フィールドの表示**: `flex: 1`、`width: 100%`、`display: flex`が正しく設定されているか
2. **ボタンの表示**: サイズ、色、配置が正しいか
3. **テキストの表示**: フォントサイズ、色、配置が正しいか
4. **レスポンシブデザイン**: モバイル、タブレット、PCで正しく動作するか

## 実行方法

### 方法1: エクスプローラーから実行（推奨・一番簡単）

1. **エクスプローラーを開く**
   - Windowsキー + E を押す

2. **アドレスバーに以下を貼り付けてEnter**
   ```
   C:\Users\susam\Downloads\新しいフォルダー\docs\primal-logic-app\primal-logic-web
   ```

3. **`auto-check-ui.bat`をダブルクリック**
   - バッチファイルをダブルクリックすると自動チェックが開始されます

### 方法2: PowerShellから実行

1. **PowerShellを開く**
   - Windowsキー → 「PowerShell」と入力 → Enter

2. **以下のコマンドをコピペして実行**
   ```powershell
   cd "C:\Users\susam\Downloads\新しいフォルダー\docs\primal-logic-app\primal-logic-web"
   .\auto-check-ui.bat
   ```

## チェック内容

### 1. ESLint（コード品質チェック）
- コードの品質と一貫性をチェック
- エラーが見つかった場合: `npm run lint:fix`で自動修正可能

### 2. TypeScript型チェック
- 型エラーがないかチェック
- エラーが見つかった場合: コードを修正する必要があります

### 3. Prettier（フォーマットチェック）
- コードのフォーマットが統一されているかチェック
- エラーが見つかった場合: `npm run format`で自動修正可能

### 4. Visual Regression Test（UI見た目チェック）
- UIの見た目が意図せず変更されていないかチェック
- **注意**: 開発サーバー（`npm run dev`）が起動している必要があります
- エラーが見つかった場合: `npm run test:ui`で結果を確認できます

## 開発サーバーの起動方法

Visual Regression Testを実行する前に、開発サーバーを起動する必要があります：

### エクスプローラーから起動（推奨）

1. **エクスプローラーを開く**
   - Windowsキー + E を押す

2. **アドレスバーに以下を貼り付けてEnter**
   ```
   C:\Users\susam\Downloads\新しいフォルダー\docs\primal-logic-app\primal-logic-web
   ```

3. **`start-dev-server.bat`をダブルクリック**
   - 開発サーバーが起動します（`http://localhost:5174`）

### PowerShellから起動

```powershell
cd "C:\Users\susam\Downloads\新しいフォルダー\docs\primal-logic-app\primal-logic-web"
.\start-dev-server.bat
```

## トラブルシューティング

### Visual Regression Testが失敗する場合

1. **開発サーバーが起動しているか確認**
   - `http://localhost:5174`にアクセスできるか確認

2. **ベースラインを更新する**
   ```powershell
   npm run test:visual:update
   ```

3. **UIモードで結果を確認する**
   ```powershell
   npm run test:ui
   ```

### ESLintエラーが発生する場合

自動修正を実行：
```powershell
npm run lint:fix
```

### Prettierエラーが発生する場合

自動修正を実行：
```powershell
npm run format
```

## 個別チェックの実行

### ESLintのみ実行
```powershell
npm run lint
```

### TypeScript型チェックのみ実行
```powershell
npx tsc --noEmit
```

### Prettierチェックのみ実行
```powershell
npm run format:check
```

### Visual Regression Testのみ実行
```powershell
npm run test:visual
```

## 参考

- [Visual Regression Test ガイド](VISUAL_REGRESSION_TEST_GUIDE.md)
- [リリース前チェックリスト](RELEASE_PRE_CHECKLIST.md)

