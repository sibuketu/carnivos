# Netlify自動デプロイ設定手順

## 概要

Gitリポジトリにプッシュするだけで、自動的にNetlifyでビルド・デプロイされるように設定します。

## 前提条件

- Netlifyアカウントを持っている
- GitHub/GitLab/Bitbucketのリポジトリを持っている（または作成する）
- プロジェクトがGitリポジトリとして管理されている

## 設定手順

### 1. Gitリポジトリの準備

プロジェクトがGitリポジトリで管理されているか確認：

```powershell
cd "C:\Users\susam\Downloads\新しいフォルダー\docs\primal-logic-app\primal-logic-web"
git status
```

Gitリポジトリでない場合は初期化：

```powershell
git init
git add .
git commit -m "Initial commit"
```

### 2. GitHub/GitLab/Bitbucketにリポジトリを作成

- GitHub: https://github.com/new
- GitLab: https://gitlab.com/projects/new
- Bitbucket: https://bitbucket.org/repo/create

リポジトリ名は `primal-logic-web` など適切な名前を付ける

### 3. リモートリポジトリを追加

```powershell
git remote add origin <リポジトリのURL>
git branch -M main
git push -u origin main
```

例：
```powershell
git remote add origin https://github.com/yourusername/primal-logic-web.git
git push -u origin main
```

### 4. Netlifyでサイトを作成

1. https://app.netlify.com にログイン
2. 「Add new site」→「Import an existing project」をクリック
3. GitHub/GitLab/Bitbucketを選択して認証
4. 作成したリポジトリを選択

### 5. ビルド設定

Netlifyの設定画面で以下を設定：

- **Build command**: `npm run build`
- **Publish directory**: `dist`
- **Node version**: `20`（または最新のLTS）

または、`netlify.toml`が既に設定されているので、そのまま使用可能です。

### 6. 環境変数の設定（必要に応じて）

Netlifyの設定画面で環境変数を設定：

- `VITE_GEMINI_API_KEY`: Gemini APIキー（AIチャット機能用）
- `VITE_SUPABASE_URL`: Supabase Project URL
- `VITE_SUPABASE_ANON_KEY`: Supabase ANON KEY
- `VITE_REPLICATE_API_TOKEN`: Replicate APIトークン（画像生成用、オプション）

設定方法：
1. Netlifyのサイト設定 →「Environment variables」
2. 「Add a variable」をクリック
3. 変数名と値を入力

### 7. デプロイの確認

設定が完了すると、自動的にデプロイが開始されます。

- デプロイ履歴は「Deploys」タブで確認可能
- デプロイが成功すると、URLが表示されます
- 以降、Gitにプッシュするたびに自動デプロイされます

## 自動デプロイの動作

1. Gitリポジトリにプッシュ（`git push`）
2. Netlifyが変更を検知
3. 自動的にビルドコマンド（`npm run build`）を実行
4. `dist`フォルダをデプロイ
5. URLは変わらず、中身だけ更新される

## トラブルシューティング

### ビルドエラーが発生する場合

- Netlifyのデプロイログを確認
- ローカルで`npm run build`が成功するか確認
- 環境変数が正しく設定されているか確認

### デプロイが自動実行されない場合

- Gitリポジトリが正しく連携されているか確認
- Netlifyの設定で「Build settings」を確認
- ブランチ名が`main`または`master`になっているか確認

## 参考

- Netlify公式ドキュメント: https://docs.netlify.com/
- `netlify.toml`の設定: プロジェクトルートの`netlify.toml`を参照

