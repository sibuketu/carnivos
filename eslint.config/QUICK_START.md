# クイックスタートガイド

## アプリのURL

**開発サーバー起動後:**
```
http://localhost:5173
```

## Gemini API（AIチャット）の状態

✅ **APIキー**: `.env` に `VITE_GEMINI_API_KEY=` を設定（未設定時はAIチャットは動作しません）

**動作確認:**
1. ブラウザで `http://localhost:5173` を開く
2. 「✨」ボタン → 「💬 Chat」をクリック
3. 「足痛い」と入力して送信
4. AIが応答すればOK

**もし動かない場合:**
- 開発サーバーを再起動（Ctrl+C → `npm run dev`）
- ブラウザをハードリロード（Ctrl + Shift + R）

---

## 画像生成の完全自動化（無料）

### セットアップ（1回だけ）

1. **Replicate APIトークンを取得（無料）**
   - https://replicate.com/ でアカウント作成
   - https://replicate.com/account/api-tokens でAPIトークンを取得
   - トークンをコピー（`r8_...`で始まる）

2. **`.env`ファイルに追加**
   ```env
   VITE_REPLICATE_API_TOKEN=r8_your_api_token_here
   ```

3. **開発サーバーを再起動**

### 使い方（完全自動）

1. アプリで「その他（Labs）」タブを開く
2. 「🎨 アプリアイコン生成」をクリック
3. 「10個一括生成」ボタンをクリック
4. **自動で10個の画像が生成される！**（手動作業ゼロ）

**コスト:** 約$0.02（ほぼ無料）

---

## SNS自動化の範囲

### 完全自動化可能

1. **画像生成** → 自動 ✅
2. **テキスト生成** → 自動 ✅
3. **SNSにログイン** → 自動 ✅（MCPブラウザ）
4. **投稿** → 自動 ✅（MCPブラウザ）

**手動作業: 初回設定のみ！**

詳細は `second-brain/config/SNS_AUTOMATION_SCOPE.md` を参照。
