# Gitデプロイ手順

## エクスプローラーからPowerShellを起動

1. エクスプローラーを開く（Windowsキー + E）
2. 以下のパスに移動：
   ```
   C:\Users\susam\Downloads\新しいフォルダー\docs\primal-logic-app\primal-logic-web
   ```
3. アドレスバーに上記のパスを貼り付けてEnter
4. ディレクトリ内で、Shiftキーを押しながら右クリック
5. 「PowerShellウィンドウをここで開く」を選択

## Git操作

### 1. Gitリポジトリの確認

```powershell
git status
```

### 2. Gitリポジトリでない場合（初回のみ）

```powershell
git init
git add .
git commit -m "Update: UI improvements and AI chat enhancements"
```

### 3. リモートリポジトリがある場合

```powershell
git add .
git commit -m "Update: UI improvements and AI chat enhancements"
git push
```

### 4. リモートリポジトリがない場合

GitHubなどにリポジトリを作成してから：

```powershell
git remote add origin <リポジトリのURL>
git branch -M main
git push -u origin main
```

## Netlify自動デプロイ

NetlifyがGitリポジトリと連携している場合、`git push`を実行すると自動的にデプロイが開始されます。

