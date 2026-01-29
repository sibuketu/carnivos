# AntiGravity クイックスタート

## 5分で始める

### 1. AntiGravityでフォルダを開く

1. AntiGravityを起動
2. 「Open Folder」をクリック
3. 以下のパスを選択：
   ```
   C:\Users\susam\Downloads\新しいフォルダー\docs\primal-logic-app\primal-logic-web
   ```
4. セキュリティ警告 → 「Yes, I trust the authors」を選択

### 2. 依存関係のインストール

AntiGravityのターミナルで：

```bash
npm install
```

### 3. 開発サーバー起動

```bash
npm run dev
```

ブラウザで `http://localhost:5173` を開く

---

## 環境変数の設定

`.env`ファイルが存在しない場合：

1. `.env_OPEN_GUIDE.md`を参照
2. `.env`ファイルを作成
3. `VITE_GEMINI_API_KEY`を設定（AI機能を使用する場合）

---

## よく使うコマンド

```bash
# 開発サーバー起動
npm run dev

# 本番ビルド
npm run build

# ビルド結果のプレビュー
npm run preview

# リンター実行
npm run lint
```

---

## 詳細情報

- [AntiGravity移行ガイド](./ANTIGRAVITY_SETUP.md)
- [IDE使い分けガイド](./IDE_USAGE_GUIDE.md)
- [README](./README.md)

