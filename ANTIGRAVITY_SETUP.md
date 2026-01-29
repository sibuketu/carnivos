# AntiGravity移行ガイド

## 概要

このガイドは、CarnivOSアプリをAntiGravityで開いて開発するための手順を説明します。

---

## 前提条件

- AntiGravityがインストールされていること
- Gitリポジトリが設定されていること
- 環境変数（`.env`）が設定されていること

---

## 移行手順

### 1. AntiGravityでプロジェクトを開く

1. AntiGravityを起動
2. 「Open Folder」をクリック
3. 以下のパスを選択：
   ```
   C:\Users\susam\Downloads\新しいフォルダー\docs\primal-logic-app\primal-logic-web
   ```
4. セキュリティ警告が表示されたら、「Yes, I trust the authors」を選択

### 2. 環境変数の確認

`.env`ファイルが存在することを確認してください。存在しない場合は、`.env_OPEN_GUIDE.md`を参照して作成してください。

**必要な環境変数:**
- `VITE_GEMINI_API_KEY`: Gemini APIキー（AI機能用）
- `VITE_SUPABASE_URL`: Supabase Project URL（オプション）
- `VITE_SUPABASE_ANON_KEY`: Supabase ANON KEY（オプション）

### 3. 依存関係のインストール

AntiGravityのターミナルで以下を実行：

```bash
npm install
```

### 4. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで `http://localhost:5173` を開いて動作確認してください。

---

## AntiGravityでの開発フロー

### 日常的な開発

1. **AntiGravityでコード編集**
   - ファイルを開いて編集
   - AIエージェントに質問・指示

2. **Git操作**
   ```bash
   git add .
   git commit -m "変更内容"
   git push
   ```

3. **自動デプロイ**
   - AntiGravityの自動デプロイ機能を使用
   - Netlifyへの自動デプロイが可能

### ビルドとデプロイ

```bash
# 本番ビルド
npm run build

# ビルド結果のプレビュー
npm run preview
```

---

## Cursorとの使い分け

### AntiGravityを使う場合
- ✅ 自動デプロイが必要な場合
- ✅ UI調整や軽微な修正
- ✅ Obsidian（第二の脳）の参照・編集
- ✅ コストを抑えたい場合

### Cursorを使う場合
- ✅ 複雑な機能実装
- ✅ コード補完やリファクタリング
- ✅ エラー修正やデバッグ
- ✅ `.cursorrules`を活用した開発

---

## Obsidian（第二の脳）との連携

AntiGravityで`docs`フォルダ全体を開くと、`second-brain`フォルダも参照・編集可能になります。

1. AntiGravityで「Open Folder」をクリック
2. 以下のパスを選択：
   ```
   C:\Users\susam\Downloads\新しいフォルダー\docs
   ```
3. 左側のExplorerで`second-brain`フォルダを展開
4. `.md`ファイルを開いて編集可能

---

## トラブルシューティング

### 開発サーバーが起動しない

```bash
# node_modulesを削除して再インストール
rm -rf node_modules
npm install
```

### 環境変数が読み込まれない

- `.env`ファイルが正しい場所（`primal-logic-web`フォルダ）にあるか確認
- 環境変数の名前が`VITE_`で始まっているか確認
- 開発サーバーを再起動

### Git操作でエラーが出る

- Gitリポジトリが正しく設定されているか確認
- リモートリポジトリが設定されているか確認：
  ```bash
  git remote -v
  ```

---

## 注意事項

1. **同時に開発サーバーを起動しない**: CursorとAntiGravityで同時に起動するとポート競合が発生します
2. **Git操作は一つのIDEから**: 両方で同時に操作しないでください
3. **環境変数は両方で同じ値**: `.env`ファイルを共有してください
4. **`.cursorrules`は両方で有効**: AntiGravityも`.cursorrules`を読み込みます

---

## 関連ドキュメント

- [IDE使い分けガイド](./IDE_USAGE_GUIDE.md)
- [環境変数設定ガイド](./.env_OPEN_GUIDE.md)
- [README](./README.md)

---

最終更新: 2025-12-31


