# APIキー取得ガイド（このチャットで完結）

## OpenAI APIキーの取得方法

### ステップ1: アカウント作成

1. [https://platform.openai.com/](https://platform.openai.com/) にアクセス
2. 「Sign up」をクリック
3. メールアドレスとパスワードを入力
4. メール認証を完了

### ステップ2: APIキーを生成

1. ログイン後、右上のプロフィールアイコン（👤）をクリック
2. 「View API keys」を選択
3. 「Create new secret key」をクリック
4. キーに名前を付ける（例: "CarnivOS"）
5. **重要**: 生成されたキーを**すぐにコピー**してください（後で表示されません）

### ステップ3: クレジットを追加

1. 左サイドバーの「Billing」を選択
2. 「Add payment method」をクリック
3. クレジットカード情報を入力
4. 初回利用時は$5程度のクレジットを追加することを推奨

### ステップ4: アプリに設定

1. `primal-logic-web` ディレクトリに `.env` ファイルを作成（または編集）

```bash
cd primal-logic-web
# .env ファイルを作成
```

2. 以下の内容を追加：

```env
VITE_OPENAI_API_KEY=sk-ここにコピーしたAPIキーを貼り付け
```

3. アプリを再起動：

```bash
npm run dev
```

## Google Gemini APIキーの取得方法

### ステップ1: Google AI Studio にアクセス

1. [https://aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey) にアクセス
2. Googleアカウントでログイン

### ステップ2: APIキーを生成

1. 「Create API Key」をクリック
2. Google Cloud プロジェクトを選択（新規作成も可能）
3. APIキーが生成される
4. **重要**: 生成されたキーを**すぐにコピー**してください

### ステップ3: APIの有効化

1. [Google Cloud Console](https://console.cloud.google.com/) にアクセス
2. プロジェクトを選択
3. 「APIとサービス」→「有効なAPI」を選択
4. 「Generative Language API」が有効になっているか確認
5. 有効でない場合は「APIを有効にする」をクリック

### ステップ4: アプリに設定

1. `.env` ファイルに追加：

```env
VITE_GEMINI_API_KEY=ここにコピーしたAPIキーを貼り付け
```

2. アプリを再起動

## どちらを使うべきか？

### 開発・テスト段階
**Geminiを推奨**
- 無料枠が大きい（1日60リクエスト）
- コストがかからない

### 本番環境
**用途に応じて選択**
- **コスト重視**: Gemini
- **速度・品質重視**: OpenAI

## トラブルシューティング

### エラー: "API key not valid"
- APIキーが正しくコピーされているか確認
- `.env`ファイルが正しい場所にあるか確認（`primal-logic-web`ディレクトリ直下）
- アプリを再起動（環境変数の変更は再起動が必要）

### エラー: "Insufficient quota"
- OpenAI: アカウントにクレジットが残っているか確認
- Gemini: 無料枠（1日60リクエスト）を超えている可能性

### エラー: "Connection refused"
- 開発サーバーが動いているか確認（`npm run dev`）
- ポート5173が使用可能か確認


