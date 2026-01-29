# AntiGravityとCursorの併用設定

## 両方使う場合の対応

### 1. プロジェクトの共有
- 同じGitリポジトリを使用する
- `.cursorrules`は両方で有効（AntiGravityも`.cursorrules`を読み込む）
- 環境変数（`.env`）は両方で共有

### 2. 設定ファイルの共有
- `.cursorrules`: 両方で使用可能
- `package.json`: 両方で使用可能
- `tsconfig.json`: 両方で使用可能

### 3. 注意点
- 両方で同時に開発サーバーを起動しない（ポート競合）
- Gitのコミット・プッシュは一つのIDEから行う
- 環境変数は両方で同じ値を設定する

### 4. 推奨ワークフロー
- **Cursor**: メイン開発（AI機能、複雑な実装）
- **AntiGravity**: 補助開発（UI調整、軽微な修正）

または

- **AntiGravity**: メイン開発
- **Cursor**: 補助開発

### 5. 設定の移行
AntiGravityに移行する場合：
1. `.cursorrules`をそのまま使用可能
2. 環境変数を設定
3. `npm install`を実行
4. 開発サーバーを起動

## 現在のプロジェクト構成
- **プロジェクトパス**: `C:\Users\susam\Downloads\新しいフォルダー\docs\primal-logic-app\primal-logic-web`
- **開発サーバー**: `npm run dev` (通常は `http://localhost:5173`)
- **ビルド**: `npm run build:skip-check` (型チェックをスキップ)

