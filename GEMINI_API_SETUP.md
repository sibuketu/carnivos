# Google Gemini API キー設定ガイド

## 概要

CarnivOSアプリのAIチャット機能で、OpenAIの代わりにGoogle Gemini APIを使用することも可能です。

## Gemini vs OpenAI: どちらが向いているか？

### Gemini API の特徴

**メリット:**
- **無料枠が大きい**: 1日あたり60リクエスト（無料）
- **コストが安い**: 有料プランでもOpenAIより安価
- **日本語対応が良い**: Google製のため、日本語の理解が優秀
- **マルチモーダル**: 画像入力にも対応（将来拡張可能）

**デメリット:**
- **レスポンス速度**: OpenAI GPT-4oよりやや遅い場合がある
- **コンテキストウィンドウ**: OpenAIより小さい（ただし十分）

### OpenAI API の特徴

**メリット:**
- **レスポンス速度**: 非常に高速
- **品質**: GPT-4oは高品質な回答
- **Assistants API**: スレッド管理やファイルアップロードに対応（高度な機能）

**デメリット:**
- **コスト**: Geminiより高価
- **無料枠**: なし（クレジットカード必須）

### 推奨

**開発・テスト段階**: Gemini（無料枠が大きい）
**本番環境**: 用途に応じて選択
- コスト重視 → Gemini
- 速度・品質重視 → OpenAI

## 1. Gemini APIキーの取得方法

### ステップ1: Google AI Studio にアクセス

1. [Google AI Studio](https://aistudio.google.com/app/apikey) にアクセス
2. Googleアカウントでログイン

### ステップ2: APIキーの生成

1. 「Create API Key」をクリック
2. Google Cloud プロジェクトを選択（新規作成も可能）
3. APIキーが生成される
4. **重要:** 生成されたキーを**すぐにコピー**してください

### ステップ3: APIの有効化

1. [Google Cloud Console](https://console.cloud.google.com/) にアクセス
2. プロジェクトを選択
3. 「APIとサービス」→「有効なAPI」を選択
4. 「Generative Language API」が有効になっているか確認
5. 有効でない場合は「APIを有効にする」をクリック

## 2. アプリへのAPIキーの設定

### 方法1: 環境変数ファイル（推奨）

1. `primal-logic-web` ディレクトリの `.env` ファイルを開く（または作成）

2. 以下のように設定：

```env
# OpenAI API（既存）
VITE_OPENAI_API_KEY=sk-your-api-key-here

# Gemini API（新規追加）
VITE_GEMINI_API_KEY=your-gemini-api-key-here
```

3. アプリを再起動

### 方法2: コードで切り替え

`AIFloatButton.tsx` で使用するAPIを選択：

```typescript
const USE_GEMINI = true; // Geminiを使用する場合
const USE_OPENAI = false; // OpenAIを使用する場合
```

## 3. Gemini APIの実装

### 基本的な実装

```typescript
const response = await fetch(
  `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${import.meta.env.VITE_GEMINI_API_KEY}`,
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            {
              text: `${systemPrompt}\n\nUser: ${userMessage}\n\nAssistant:`,
            },
          ],
        },
      ],
    }),
  }
);

const data = await response.json();
const assistantMessage = data.candidates[0]?.content?.parts[0]?.text || 'エラー';
```

## 4. Assistants APIについて

### OpenAI Assistants API

**特徴:**
- スレッド管理（会話履歴の自動管理）
- ファイルアップロード（PDF、CSVなど）
- コード実行（Code Interpreter）
- 関数呼び出し（Function Calling）

**用途:**
- 複雑な会話管理が必要な場合
- ファイルを参照して回答を生成したい場合
- コードを実行して結果を返したい場合

**CarnivOSでの使用例:**
- ユーザーの過去のログをファイルとしてアップロード
- 栄養データベースを参照して回答を生成

### Gemini の類似機能

Geminiには「Assistants API」に相当する機能はありませんが、以下の方法で実現可能：

1. **コンテキスト管理**: 手動で会話履歴を管理
2. **ファイル参照**: 将来、Gemini Pro Visionで画像入力に対応予定

## 5. 実装の切り替え方法

`AIFloatButton.tsx` を修正して、両方のAPIに対応：

```typescript
const handleSendMessage = async () => {
  // ...
  
  const useGemini = import.meta.env.VITE_USE_GEMINI === 'true';
  
  if (useGemini) {
    // Gemini API呼び出し
    const response = await fetch(/* Gemini API */);
  } else {
    // OpenAI API呼び出し
    const response = await fetch(/* OpenAI API */);
  }
};
```

## 6. コスト比較

### Gemini API
- **無料枠**: 1日60リクエスト
- **有料**: $0.00025 / 1K characters（入力）、$0.0005 / 1K characters（出力）

### OpenAI API (GPT-4o)
- **無料枠**: なし
- **有料**: $2.50 / 1M tokens（入力）、$10.00 / 1M tokens（出力）

**例: 1回の会話（500文字）**
- Gemini: 約 $0.0002
- OpenAI: 約 $0.001

## 7. 推奨設定

### 開発環境
```env
VITE_USE_GEMINI=true
VITE_GEMINI_API_KEY=your-key-here
```

### 本番環境
- コスト重視 → Gemini
- 速度・品質重視 → OpenAI
- 両方対応 → ユーザーが選択可能にする

## 8. トラブルシューティング

### エラー: "API key not valid"
- APIキーが正しく設定されているか確認
- Google Cloud ConsoleでAPIが有効になっているか確認

### エラー: "Quota exceeded"
- 無料枠（1日60リクエスト）を超えている
- 有料プランにアップグレードするか、翌日まで待つ

## 参考リンク

- [Google AI Studio](https://aistudio.google.com/)
- [Gemini API Documentation](https://ai.google.dev/docs)
- [Gemini API Pricing](https://ai.google.dev/pricing)


