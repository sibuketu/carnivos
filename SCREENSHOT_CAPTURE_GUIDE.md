# スクリーンショット取得ガイド

CarnivOSアプリの全画面のスクリーンショットを自動取得し、Geminiに共有するためのガイドです。

---

## 🚀 クイックスタート

### 方法1: バッチファイルから実行（推奨・一番簡単）

1. **エクスプローラーを開く**（Windowsキー+E）
2. **アドレスバーに以下を貼り付けてEnter**:
   ```
   C:\Users\susam\Downloads\新しいフォルダー\docs\primal-logic-app\primal-logic-web
   ```
3. **`capture-screenshots.bat`をダブルクリック**

### 方法2: PowerShellから実行

1. **新しいPowerShellを開く**（Windowsキー → 「PowerShell」と入力 → Enter）
2. **以下をコピペして実行**:
   ```powershell
   cd "C:\Users\susam\Downloads\新しいフォルダー\docs\primal-logic-app\primal-logic-web"
   npm run screenshot:all
   ```

---

## ⚠️ 前提条件

### 開発サーバーが起動している必要があります

スクリーンショット取得前に、**開発サーバーを起動**してください：

#### 開発サーバーの起動方法

**方法1: バッチファイルから実行（推奨）**
1. エクスプローラーを開く（Windowsキー+E）
2. アドレスバーに以下を貼り付けてEnter:
   ```
   C:\Users\susam\Downloads\新しいフォルダー\docs\primal-logic-app\primal-logic-web
   ```
3. `start-dev-server.bat`をダブルクリック

**方法2: PowerShellから実行**
```powershell
cd "C:\Users\susam\Downloads\新しいフォルダー\docs\primal-logic-app\primal-logic-web"
npm run dev
```

開発サーバーが起動したら（`http://localhost:5173`でアクセス可能）、別のターミナルでスクリーンショット取得を実行してください。

---

## 📸 取得されるスクリーンショット

以下の画面のスクリーンショットが自動取得されます：

1. **consent.png** - 同意画面
2. **onboarding.png** - オンボーディング画面
3. **home.png** - ホーム画面（メインダッシュボード）
4. **profile.png** - プロファイル設定画面
5. **history.png** - 履歴画面
6. **labs.png** - Labs画面（実験的機能）
7. **settings.png** - 設定画面
8. **customFood.png** - カスタム食品登録画面
9. **input.png** - 日次入力画面
10. **gift.png** - Gift画面（コミュニティ機能）
11. **bioHack.png** - Bio-Hackダッシュボード画面
12. **ifThenRules.png** - If-Thenルール画面

---

## 📁 保存先

スクリーンショットは以下のフォルダに保存されます：

**フォルダパス**: `C:\Users\susam\Downloads\新しいフォルダー\docs\primal-logic-app\primal-logic-web\screenshots-for-gemini\`

各スクリーンショットは以下の形式で保存されます：
- `{画面名}.png` - スクリーンショット画像
- `SCREENSHOT_LIST.md` - スクリーンショット一覧（Geminiへの送信メッセージ例付き）

---

## 📤 Geminiへの送信方法

### 1. スクリーンショット一覧を確認

スクリーンショット取得後、以下のファイルを開いて確認してください：

**ファイルパス**: `C:\Users\susam\Downloads\新しいフォルダー\docs\primal-logic-app\primal-logic-web\screenshots-for-gemini\SCREENSHOT_LIST.md`

このファイルには、各スクリーンショットの説明とGeminiへの送信メッセージ例が含まれています。

### 2. Geminiにファイルを送信

以下のファイルをGeminiに送信してください：

1. **スクリーンショット画像**（`screenshots-for-gemini\`フォルダ内の全`.png`ファイル）
2. **要件定義プロンプト**（`GEMINI_CAMERA_PROMPT_COMPLETE.md`）

### 3. 送信メッセージ例

```
以下のファイルを送信します。CarnivOSアプリの全画面のスクリーンショットと、カメラ機能統合の要件定義です。

送信ファイル：
1. GEMINI_CAMERA_PROMPT_COMPLETE.md（要件定義プロンプト）
2. screenshots-for-gemini\ フォルダ内の全スクリーンショット画像

これらのスクリーンショットを参考に、カメラ機能統合の要件定義をお願いします。
```

---

## 🔧 トラブルシューティング

### エラー: "Cannot connect to http://localhost:5173"

**原因**: 開発サーバーが起動していない

**解決方法**: 
1. 別のターミナルで開発サーバーを起動（`npm run dev`）
2. `http://localhost:5173`でアクセスできることを確認
3. 再度スクリーンショット取得を実行

### エラー: "tsx: command not found"

**原因**: `tsx`がインストールされていない

**解決方法**:
```powershell
npm install
```

### スクリーンショットが空白

**原因**: 画面の読み込みが完了していない

**解決方法**: 
- `scripts/capture-screenshots-simple.ts`の`waitForTimeout`の値を増やす（例: 2000 → 3000）

---

## 📝 カスタマイズ

### 取得する画面を変更する

`scripts/capture-screenshots-simple.ts`の`SCREENS`配列を編集してください。

### ビューポートサイズを変更する

`scripts/capture-screenshots-simple.ts`の以下の行を編集してください：

```typescript
viewport: { width: 393, height: 852 }, // iPhone 15幅
```

例：
- iPad: `{ width: 768, height: 1024 }`
- デスクトップ: `{ width: 1920, height: 1080 }`

---

## 🎯 次のステップ

1. スクリーンショットを取得
2. `SCREENSHOT_LIST.md`を確認
3. Geminiにスクリーンショットと要件定義プロンプトを送信
4. Geminiの回答を確認して実装を進める


