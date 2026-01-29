# Netlifyデプロイ手順

## ビルドコマンド

```bash
npm run build
```

## 公開ディレクトリ

```
dist
```

## Netlify設定ファイル

`netlify.toml`が既に存在します：

```toml
[build]
  publish = "dist"
  command = "npm run build"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[build.environment]
  NODE_VERSION = "20"
```

## 環境変数

Netlifyのダッシュボードで以下の環境変数を設定してください：

- `VITE_GEMINI_API_KEY`: Gemini APIキー（AIチャット機能用）
- `VITE_SUPABASE_URL`: Supabase Project URL
- `VITE_SUPABASE_ANON_KEY`: Supabase ANON KEY
- `VITE_REPLICATE_API_TOKEN`: Replicate APIトークン（画像生成用、オプション）

## デプロイ方法

1. Netlifyにログイン
2. 新しいサイトを作成
3. Gitリポジトリを接続
4. ビルド設定：
   - **ビルドコマンド**: `npm run build`
   - **公開ディレクトリ**: `dist`
5. 環境変数を設定
6. デプロイ

## 注意事項

- `dist`フォルダは`.gitignore`に含まれているため、Gitにはコミットされません
- Netlifyが自動的にビルドしてデプロイします
- SPA（Single Page Application）のため、`netlify.toml`でリダイレクト設定が必要です
