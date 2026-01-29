# Netlify UI完全復元ガイド（詳細版）

> **作成日**: 2026-01-27  
> **目的**: Netlifyのビルド済みファイルを使用してUIを完全に復元する

---

## 📍 完全なファイルパス

### BATファイルの場所

1. **`RESTORE_NETLIFY_AND_PREVIEW.bat`**
   - **完全パス**: `C:\Users\susam\Downloads\新しいフォルダー\docs\primal-logic-app\primal-logic-web\RESTORE_NETLIFY_AND_PREVIEW.bat`

2. **`DOWNLOAD_AND_PREVIEW_NETLIFY.bat`**
   - **完全パス**: `C:\Users\susam\Downloads\新しいフォルダー\docs\primal-logic-app\primal-logic-web\DOWNLOAD_AND_PREVIEW_NETLIFY.bat`

3. **`RESTORE_NETLIFY_BUILD.bat`**
   - **完全パス**: `C:\Users\susam\Downloads\新しいフォルダー\docs\primal-logic-app\primal-logic-web\RESTORE_NETLIFY_BUILD.bat`

---

## 🖱️ 実行方法（エクスプローラーから）

### 方法1: エクスプローラーから直接実行（推奨）

1. **エクスプローラーを開く**
   - **Windowsキー** + **E** を押す
   - または、タスクバーの**フォルダーアイコン**をクリック

2. **アドレスバーにパスを貼り付ける**
   - エクスプローラーの**上部にあるアドレスバー**をクリック
   - 以下をコピーして貼り付け（**Ctrl+V**）:
   ```
   C:\Users\susam\Downloads\新しいフォルダー\docs\primal-logic-app\primal-logic-web
   ```
   - **Enterキー**を押す

3. **BATファイルを探す**
   - `RESTORE_NETLIFY_AND_PREVIEW.bat` というファイルを探す
   - ファイル名で並び替える場合は、**「名前」列のヘッダー**をクリック

4. **BATファイルをダブルクリック**
   - `RESTORE_NETLIFY_AND_PREVIEW.bat` を**ダブルクリック**
   - 黒いコマンドプロンプトウィンドウが開きます

5. **実行結果を確認**
   - ターミナルに「Netlifyから最新のビルド済みファイルをダウンロード中...」と表示されます
   - ダウンロードが完了すると、プレビューサーバーが自動的に起動します
   - 最後に「ブラウザで http://localhost:4173 を開いてください」と表示されます

---

## ⌨️ 実行方法（PowerShellから）

### 方法2: PowerShellから実行

1. **PowerShellを開く**
   - **Windowsキー**を押す
   - 「**PowerShell**」と入力
   - **Enterキー**を押す
   - または、**Windowsキー + X** → 「**Windows PowerShell**」を選択

2. **プロジェクトフォルダに移動**
   - 以下をコピーして貼り付け（**Ctrl+V**）、**Enterキー**を押す:
   ```powershell
   cd "C:\Users\susam\Downloads\新しいフォルダー\docs\primal-logic-app\primal-logic-web"
   ```

3. **BATファイルを実行**
   - 以下をコピーして貼り付け（**Ctrl+V**）、**Enterキー**を押す:
   ```powershell
   .\RESTORE_NETLIFY_AND_PREVIEW.bat
   ```

---

## 🌐 ブラウザで確認

### プレビューサーバー起動後の手順

1. **ブラウザを開く**
   - **Chrome**、**Edge**、**Firefox**のいずれかを開く
   - **Windowsキー**を押して「**chrome**」または「**edge**」と入力してEnter

2. **アドレスバーにURLを入力**
   - ブラウザの**上部にあるアドレスバー**をクリック
   - 以下を入力:
   ```
   http://localhost:4173
   ```
   - **Enterキー**を押す

3. **UIを確認**
   - Netlifyと同じUIが表示されるはずです
   - 各画面（History、Home、Profile、Labs）を確認してください

---

## 🔍 各画面の確認項目

### HistoryScreen
- [ ] **期間フィルターボタン**が表示されているか（Today、7 day、30 day、All、⭐ All）
- [ ] **タブ**が表示されているか（Summary、History、Photo Gallery）
- [ ] ログをクリックして展開できるか

### HomeScreen
- [ ] **栄養ゲージ**が表示されているか（電解質、マクロ、その他）
- [ ] **Fasting Timer**が表示されているか
- [ ] **アクションボタン**が表示されているか（+、📋、⭐、✏️、🍽️、📷）

### ProfileScreen
- [ ] **タイトル**が「Setting」になっているか（「Settings」ではない）
- [ ] **言語設定ボタン**が表示されているか

### LabsScreen
- [ ] **Tipカード**（💡 Tip）が表示されているか
- [ ] **「View Tip List」ボタン**が表示されているか

---

## ⚠️ トラブルシューティング

### 問題1: BATファイルが見つからない

**解決方法**:
1. エクスプローラーで以下を確認:
   ```
   C:\Users\susam\Downloads\新しいフォルダー\docs\primal-logic-app\primal-logic-web
   ```
2. ファイルが存在しない場合は、プロジェクトフォルダを確認してください

### 問題2: プレビューサーバーが起動しない

**解決方法**:
1. **Node.jsがインストールされているか確認**
   - PowerShellで以下を実行:
   ```powershell
   node --version
   ```
2. **npmがインストールされているか確認**
   - PowerShellで以下を実行:
   ```powershell
   npm --version
   ```

### 問題3: localhost:4173にアクセスできない

**解決方法**:
1. **プレビューサーバーが起動しているか確認**
   - ターミナルに「Local: http://localhost:4173」と表示されているか確認
2. **ポート番号を確認**
   - ターミナルに表示されたポート番号を使用してください（4173以外の可能性があります）

---

## 📝 参考

- **Netlify URL**: https://strong-travesseiro-0a6a1c.netlify.app
- **Netlifyダッシュボード**: https://app.netlify.com/projects/carnivos/deploys
- **復元スクリプト**: `C:\Users\susam\Downloads\新しいフォルダー\docs\primal-logic-app\primal-logic-web\scripts\restore-dist-from-netlify.ps1`
