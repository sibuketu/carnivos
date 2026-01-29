# コピペ用コマンド集

> **重要**: このドキュメントは、**サルでもわかるように**実行方法を説明しています。
> 
> **前提**: 
> - ターミナル（PowerShell）は**手動で開く必要があります**（AIは物理的に開けません）
> - エクスプローラーから実行する方法（バッチファイルをダブルクリック）が**一番簡単**です
> - エクスプローラーから実行する方法と、PowerShellから実行する方法の両方を記載しています

## Visual Regression Test（UI見た目テスト）

### ベースライン作成（初回のみ）

**方法1: エクスプローラーから実行（一番簡単）**

1. **エクスプローラーを開く**
   - Windowsキーを押す
   - 「エクスプローラー」と入力してEnter
   - または、Windowsキー+Eを押す

2. **アドレスバーにパスを貼り付ける**
   - エクスプローラーの上部にあるアドレスバーをクリック
   - 以下をコピーして貼り付け（Ctrl+V）:
   ```
   C:\Users\susam\Downloads\新しいフォルダー\docs\primal-logic-app\primal-logic-web
   ```
   - Enterキーを押す

3. **バッチファイルを実行**
   - `create-visual-baseline.bat` というファイルを探す
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
.\create-visual-baseline.bat
```

### 通常のテスト実行

**方法1: エクスプローラーから実行（一番簡単）**

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

---

## iOS版テスト（Maestro）

### アプリ起動

**方法1: エクスプローラーから実行（一番簡単）**

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
   - `start-ios-app.bat` をダブルクリック

**方法2: PowerShellから実行**

1. **PowerShellを開く**
   - Windowsキー → 「PowerShell」と入力 → Enter

2. **以下をコピペして実行（1行ずつ）**
```powershell
cd "C:\Users\susam\Downloads\新しいフォルダー\docs\primal-logic-app"
```
```powershell
.\start-ios-app.bat
```

### テスト実行

**方法1: エクスプローラーから実行（一番簡単）**

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

---

## 全テスト実行（E2E + Visual Regression）

**方法1: エクスプローラーから実行（一番簡単）**

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
   - `run-all-tests.bat` をダブルクリック

**方法2: PowerShellから実行**

1. **PowerShellを開く**
   - Windowsキー → 「PowerShell」と入力 → Enter

2. **以下をコピペして実行（1行ずつ）**
```powershell
cd "C:\Users\susam\Downloads\新しいフォルダー\docs\primal-logic-app\primal-logic-web"
```
```powershell
.\run-all-tests.bat
```

---

## 開発サーバー起動

**方法1: エクスプローラーから実行（一番簡単）**

1. **エクスプローラーを開く**
   - Windowsキー+Eを押す

2. **アドレスバーにパスを貼り付ける**
   - アドレスバーをクリック
   - 以下をコピーして貼り付け:
   ```
   C:\Users\susam\Downloads\新しいフォルダー\docs\primal-logic-app\primal-logic-web
   ```
   - Enterキーを押す

3. **バッチファイルを実行（あれば）**
   - `start-dev-server.bat` をダブルクリック

**方法2: PowerShellから実行**

1. **PowerShellを開く**
   - Windowsキー → 「PowerShell」と入力 → Enter

2. **以下をコピペして実行（1行ずつ）**
```powershell
cd "C:\Users\susam\Downloads\新しいフォルダー\docs\primal-logic-app\primal-logic-web"
```
```powershell
npm run dev
```

---

## 注意事項

- **エクスプローラーから実行が一番簡単**: バッチファイル（.bat）は、エクスプローラーからダブルクリックで実行できます
- **フルパスを使用**: 相対パスではなく、必ず完全なフルパスを使用してください
- **パスが途中で切れないように**: コピペする際は、パスが途中で切れないように注意してください

---

最終更新: 2026-01-03

