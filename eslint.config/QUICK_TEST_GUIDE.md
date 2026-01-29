# クイックテスト実行ガイド

## 同時並行で実行できるテスト

### ✅ Visual Regression Test（UI見た目テスト）

**実行方法（サルでもわかる説明）:**

**方法1: エクスプローラーから実行（一番簡単・推奨）**

1. **エクスプローラーを開く**
   - Windowsキーを押す
   - 「エクスプローラー」と入力してEnter
   - または、Windowsキー+Eを押す

2. **アドレスバーにパスを貼り付ける**
   - エクスプローラーの上部にあるアドレスバー（フォルダーのパスが表示されている場所）をクリック
   - 以下をコピーして貼り付け（Ctrl+V）:
   ```
   C:\Users\susam\Downloads\新しいフォルダー\docs\primal-logic-app\primal-logic-web
   ```
   - Enterキーを押す

3. **バッチファイルを実行**
   - `run-visual-test.bat` というファイルを探す
   - ダブルクリックする

**方法2: PowerShellから実行**

1. **PowerShellを開く**
   - Windowsキーを押す
   - 「PowerShell」と入力してEnter
   - または、Windowsキー+X → 「Windows PowerShell」を選択

2. **以下をコピペして実行（1行ずつ）**
```powershell
cd "C:\Users\susam\Downloads\新しいフォルダー\docs\primal-logic-app\primal-logic-web"
```
```powershell
.\run-visual-test.bat
```

**初回実行（ベースライン作成）:**

**方法1: エクスプローラーから実行（一番簡単）**
1. エクスプローラーを開く（Windowsキー+E）
2. アドレスバーに以下を貼り付けてEnter:
   ```
   C:\Users\susam\Downloads\新しいフォルダー\docs\primal-logic-app\primal-logic-web
   ```
3. `create-visual-baseline.bat` をダブルクリック

**方法2: PowerShellから実行**
```powershell
cd "C:\Users\susam\Downloads\新しいフォルダー\docs\primal-logic-app\primal-logic-web"
npm run test:visual:update
```

**特徴:**
- ✅ PCで完結（ブラウザで実行）
- ✅ 他のテストと同時実行可能
- ✅ スクリーンショットでUIの変更を検出

---

### ✅ iOS版テスト（Maestro）

**実行方法（サルでもわかる説明）:**

**方法1: エクスプローラーから実行（一番簡単・推奨）**

1. **エクスプローラーを開く**
   - Windowsキー+Eを押す

2. **アドレスバーにパスを貼り付ける**
   - アドレスバーをクリック
   - 以下をコピーして貼り付け:
   ```
   C:\Users\susam\Downloads\新しいフォルダー\docs\primal-logic-app
   ```
   - Enterキーを押す

3. **バッチファイルを実行**
   - `run-ios-test.bat` をダブルクリック

**方法2: PowerShellから実行**

1. **PowerShellを開く**
   - Windowsキー → 「PowerShell」と入力 → Enter

2. **以下をコピペして実行（1行ずつ）**
```powershell
cd "C:\Users\susam\Downloads\新しいフォルダー\docs\primal-logic-app"
```
```powershell
.\run-ios-test.bat
```

**前提条件:**
1. ✅ Maestroインストール済み（v2.0.10確認済み）
2. iOS実機をUSB接続
3. アプリを起動（別ターミナル）:
   - エクスプローラーを開く（Windowsキー+E）
   - アドレスバーに以下を貼り付けてEnter:
     ```
     C:\Users\susam\Downloads\新しいフォルダー\docs\primal-logic-app
     ```
   - `start-ios-app.bat` をダブルクリック

**特徴:**
- ✅ iOS実機で実行
- ✅ Visual Regression Testと同時実行可能

---

## 同時実行の手順

### ターミナル1: Visual Regression Test

**方法1: エクスプローラーから実行（一番簡単・推奨）**

1. **エクスプローラーを開く**
   - Windowsキー+Eを押す

2. **アドレスバーにパスを貼り付ける**
   - アドレスバーをクリック
   - 以下をコピーして貼り付け:
   ```
   C:\Users\susam\Downloads\新しいフォルダー\docs\primal-logic-app\primal-logic-web
   ```
   - Enterキーを押す

3. **バッチファイルを実行**
   - `run-visual-test.bat` をダブルクリック

**方法2: PowerShellから実行**

1. **PowerShellを開く**
   - Windowsキー → 「PowerShell」と入力 → Enter

2. **以下をコピペして実行（1行ずつ）**
```powershell
cd "C:\Users\susam\Downloads\新しいフォルダー\docs\primal-logic-app\primal-logic-web"
```
```powershell
.\run-visual-test.bat
```

### ターミナル2: iOS版テスト

**方法1: エクスプローラーから実行（一番簡単・推奨）**

1. **エクスプローラーを開く**
   - Windowsキー+Eを押す

2. **アドレスバーにパスを貼り付ける**
   - アドレスバーをクリック
   - 以下をコピーして貼り付け:
   ```
   C:\Users\susam\Downloads\新しいフォルダー\docs\primal-logic-app
   ```
   - Enterキーを押す

3. **アプリを起動**
   - `start-ios-app.bat` をダブルクリック

4. **別のエクスプローラーでテスト実行**
   - もう一度エクスプローラーを開く（Windowsキー+E）
   - 同じパスを貼り付けてEnter
   - `run-ios-test.bat` をダブルクリック

**方法2: PowerShellから実行**

1. **PowerShellを開く**
   - Windowsキー → 「PowerShell」と入力 → Enter

2. **アプリを起動（1行ずつ）**
```powershell
cd "C:\Users\susam\Downloads\新しいフォルダー\docs\primal-logic-app"
```
```powershell
.\start-ios-app.bat
```

3. **別のPowerShellを開いてテスト実行**
   - もう一度PowerShellを開く
   - 以下を実行（1行ずつ）:
```powershell
cd "C:\Users\susam\Downloads\新しいフォルダー\docs\primal-logic-app"
```
```powershell
.\run-ios-test.bat
```

---

## テスト結果

### Visual Regression Test
- 結果: `primal-logic-app/primal-logic-web/test-results/`
- 差分がある場合: `*-diff.png`で確認

### iOS版テスト
- 結果: ターミナルに表示
- ログ: `.maestro/test-results/`（あれば）

---

## 注意事項

- **Visual Regression Test**: 初回実行時は必ず`--update-snapshots`でベースラインを作成
- **iOS版テスト**: iOS実機が必要（Windows環境では実機のみ対応）
- **同時実行**: 両方のテストは独立しているため、同時実行可能

---

最終更新: 2026-01-03
