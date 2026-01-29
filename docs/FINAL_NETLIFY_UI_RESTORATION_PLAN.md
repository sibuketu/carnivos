# Netlify UI完全復元計画（最終手段）

> **作成日**: 2026-01-27  
> **状況**: コード修正では解決しない。Netlifyのビルド済みファイルを直接使用する。

---

## 🎯 最終手段: Netlifyのビルド済みファイルを使用

### 方法1: プレビューサーバーで確認（推奨）

1. **Netlifyから最新のビルド済みファイルをダウンロード**
2. **`dist` フォルダにコピー**
3. **`npm run preview` で確認**

**実行コマンド**:
```powershell
# RESTORE_NETLIFY_BUILD.bat をダブルクリック
# または
npm run preview
```

**URL**: `http://localhost:4173` (または表示されたポート)

---

### 方法2: ソースコードを完全に再構築

Netlifyのビルド済みファイルからはソースコードを復元できませんが、以下の方法で確認できます：

1. **Netlifyのデプロイログからコミットハッシュを確認**
2. **そのコミットに `git reset --hard`**
3. **開発サーバーを再起動**

---

## ⚠️ 重要な注意事項

### ビルド済みファイルの制限

- **`dist` フォルダの内容はビルド済みファイル**: ソースコードではありません
- **開発サーバー (`npm run dev`) は `src/` からビルド**: `dist/` は使用しません
- **プレビューサーバー (`npm run preview`) は `dist/` を使用**: Netlifyと同じ状態を確認できます

### 根本的な解決方法

Netlifyのデプロイログから**実際のコミットハッシュ**を確認し、そのコミットに戻す必要があります。

---

## 📋 実行手順

### Step 1: Netlifyから最新ファイルをダウンロード

```powershell
# RESTORE_NETLIFY_BUILD.bat を実行
# または手動で
.\scripts\restore-dist-from-netlify.ps1
```

### Step 2: プレビューサーバーで確認

```powershell
npm run preview
```

### Step 3: ブラウザで確認

- **URL**: `http://localhost:4173` (または表示されたポート)
- **Netlifyと同じUIが表示されるはずです**

---

## 🔍 根本原因の特定

### 問題: ソースコードがNetlifyのデプロイバージョンと異なる

**解決方法**:
1. Netlifyのデプロイログからコミットハッシュを確認
2. そのコミットに `git reset --hard <commit-hash>`
3. `git clean -fd` で未追跡ファイルを削除
4. 開発サーバーを再起動

---

## 📝 参考

- **Netlify URL**: https://strong-travesseiro-0a6a1c.netlify.app
- **Netlifyダッシュボード**: https://app.netlify.com/projects/carnivos/deploys
- **復元スクリプト**: `scripts/restore-dist-from-netlify.ps1`
- **BATファイル**: `RESTORE_NETLIFY_BUILD.bat`
