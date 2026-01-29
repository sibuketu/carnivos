# BATファイル実行ガイド（完全版）

> **重要**: BATファイルを提供する際は、**必ず完全なパス（フルパス）**を記載します。

---

## 📍 完全なファイルパス一覧

### プロジェクトルート
```
C:\Users\susam\Downloads\新しいフォルダー\docs\primal-logic-app\primal-logic-web
```

### BATファイルの完全パス

1. **`RESTORE_NETLIFY_AND_PREVIEW.bat`**
   ```
   C:\Users\susam\Downloads\新しいフォルダー\docs\primal-logic-app\primal-logic-web\RESTORE_NETLIFY_AND_PREVIEW.bat
   ```

2. **`DOWNLOAD_AND_PREVIEW_NETLIFY.bat`**
   ```
   C:\Users\susam\Downloads\新しいフォルダー\docs\primal-logic-app\primal-logic-web\DOWNLOAD_AND_PREVIEW_NETLIFY.bat
   ```

3. **`RESTORE_NETLIFY_BUILD.bat`**
   ```
   C:\Users\susam\Downloads\新しいフォルダー\docs\primal-logic-app\primal-logic-web\RESTORE_NETLIFY_BUILD.bat
   ```

4. **`AUTO_CHECK_UI.bat`**
   ```
   C:\Users\susam\Downloads\新しいフォルダー\docs\primal-logic-app\primal-logic-web\AUTO_CHECK_UI.bat
   ```

---

## 🖱️ エクスプローラーからの実行手順（詳細）

### Step 1: エクスプローラーを開く

1. **Windowsキー**を押す
2. 「**エクスプローラー**」と入力
3. **Enterキー**を押す
   - または、**Windowsキー + E**を押す
   - または、タスクバーの**フォルダーアイコン**をクリック

### Step 2: アドレスバーにパスを貼り付ける

1. **エクスプローラーの上部にあるアドレスバー**をクリック
   - アドレスバーは、メニューバーの下、ツールバーの上にあります
   - 「このPC」や「クイックアクセス」と表示されている部分です

2. **既存のテキストをすべて選択**
   - **Ctrl + A**を押す（すべて選択）
   - または、マウスでドラッグしてすべて選択

3. **以下をコピーして貼り付け（Ctrl+V）**:
   ```
   C:\Users\susam\Downloads\新しいフォルダー\docs\primal-logic-app\primal-logic-web
   ```

4. **Enterキー**を押す
   - プロジェクトフォルダが開きます

### Step 3: BATファイルを探す

1. **ファイル一覧を確認**
   - `RESTORE_NETLIFY_AND_PREVIEW.bat`というファイルを探します
   - ファイル名で並び替える場合は、**「名前」列のヘッダー**をクリック

2. **ファイルが見つからない場合**
   - **表示**タブ → **詳細**を選択
   - または、**Ctrl + F**で検索

### Step 4: BATファイルをダブルクリック

1. **`RESTORE_NETLIFY_AND_PREVIEW.bat`**を**ダブルクリック**
   - 黒いコマンドプロンプトウィンドウが開きます

2. **実行結果を確認**
   - ターミナルに「Netlifyから最新のビルド済みファイルをダウンロード中...」と表示されます
   - ダウンロードが完了すると、プレビューサーバーが自動的に起動します
   - 最後に「ブラウザで http://localhost:4173 を開いてください」と表示されます

---

## ⌨️ PowerShellからの実行手順（詳細）

### Step 1: PowerShellを開く

1. **Windowsキー**を押す
2. 「**PowerShell**」と入力
3. **Enterキー**を押す
   - または、**Windowsキー + X** → 「**Windows PowerShell**」を選択

### Step 2: プロジェクトフォルダに移動

1. **PowerShellのウィンドウ**をクリック
2. **以下をコピーして貼り付け（Ctrl+V）**:
   ```powershell
   cd "C:\Users\susam\Downloads\新しいフォルダー\docs\primal-logic-app\primal-logic-web"
   ```
3. **Enterキー**を押す
   - プロジェクトフォルダに移動します

### Step 3: BATファイルを実行

1. **以下をコピーして貼り付け（Ctrl+V）**:
   ```powershell
   .\RESTORE_NETLIFY_AND_PREVIEW.bat
   ```
2. **Enterキー**を押す
   - BATファイルが実行されます

---

## 🌐 ブラウザ操作の自動化

### 自動確認スクリプトの実行

1. **プレビューサーバーが起動していることを確認**
   - `RESTORE_NETLIFY_AND_PREVIEW.bat`を実行済みであること

2. **自動確認スクリプトを実行**
   - エクスプローラーから:
     - `C:\Users\susam\Downloads\新しいフォルダー\docs\primal-logic-app\primal-logic-web\AUTO_CHECK_UI.bat`をダブルクリック
   - PowerShellから:
     ```powershell
     cd "C:\Users\susam\Downloads\新しいフォルダー\docs\primal-logic-app\primal-logic-web"
     .\AUTO_CHECK_UI.bat
     ```

3. **自動確認の内容**
   - HistoryScreen: 期間フィルターボタン、タブの確認
   - HomeScreen: 栄養ゲージ、Fasting Timerの確認
   - ProfileScreen: タイトル「Setting」の確認
   - LabsScreen: Tipカード、「View Tip List」ボタンの確認

---

## 🔍 各ボタンの説明

### HistoryScreenのボタン

1. **期間フィルターボタン**
   - **「Today」ボタン**: 今日のログのみを表示
   - **「7 day」ボタン**: 過去7日間のログを表示
   - **「30 day」ボタン**: 過去30日間のログを表示
   - **「All」ボタン**: すべてのログを表示
   - **「⭐ All」ボタン**: お気に入り（⭐）が付いたログのみを表示

2. **タブボタン**
   - **「Summary」タブ**: サマリー表示
   - **「History」タブ**: 履歴表示（デフォルト）
   - **「Photo Gallery」タブ**: 写真ギャラリー表示

### HomeScreenのボタン

1. **アクションボタン**
   - **「+」ボタン**: 新しいログを追加
   - **「📋」ボタン**: クリップボード関連
   - **「⭐」ボタン**: お気に入りに追加
   - **「✏️」ボタン**: 編集
   - **「🍽️」ボタン**: 食事関連
   - **「📷」ボタン**: 写真を追加

2. **Fasting Timerボタン**
   - **「Start Fasting」ボタン**: ファスティングを開始
   - **「Stop Fasting」ボタン**: ファスティングを停止

### ProfileScreenのボタン

1. **言語設定ボタン**
   - **「Language」ボタン**: 言語を変更

### LabsScreenのボタン

1. **「View Tip List」ボタン**
   - ヒントの一覧を表示

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
- **詳細ガイド**: `C:\Users\susam\Downloads\新しいフォルダー\docs\primal-logic-app\primal-logic-web\docs\NETLIFY_UI_RESTORATION_COMPLETE_GUIDE.md`
