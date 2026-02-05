---
tags: [Log, Cursor]
aliases: []
summary: |
  バイブコーディングでYouTubeクローンを新規作成。
  ショート動画除外＋意図的シグナル（Good/Bad評価、登録チャンネル）を高比重とするカスタムレコメンデーションアルゴリズムを実装。
  プロジェクト配置場所の整理ガイドを作成。
---

# Cursor Session Log (2026-01-28)

## 1. 目的

Geminiとの会話を元に、バイブコーディング（Vibe Coding）でショート動画を除外したYouTubeクローンを作成する。従来のYouTubeアルゴリズム（視聴時間など無意識シグナル重視）ではなく、ユーザーの意図的なアクション（Good/Bad評価、チャンネル登録）を高比重とするカスタムレコメンデーションアルゴリズムを実装する。

## 2. 重要な決定事項・変更点

### プロジェクト作成
- **新規プロジェクト作成**: `youtube-clone-no-shorts`を`primal-logic-app`配下に作成
  - Why: 既存のCarnivoreアプリ（primal-logic-web）とは独立したプロジェクトとして実装

### 技術スタック
- React 19 + Vite + TypeScript + Tailwind CSS
- YouTube Data API v3（公式API、APIキー必要）
- Supabase（ユーザーデータ保存）

### ショート動画除外ロジック
- 60秒未満 かつ アスペクト比が縦長（< 1）の動画を除外
  - Why: ショート動画の特徴を2つの条件で判定

### カスタムレコメンデーションアルゴリズム
- **意図的シグナル（高比重）**:
  - Good評価: 10.0
  - Bad評価: -5.0（ネガティブ）
  - 登録チャンネル: 8.0
  - お気に入り: 6.0
- **無意識シグナル（低比重）**:
  - 視聴時間: 0.1
  - 再生回数: 0.01
  - Why: YouTubeの既存アルゴリズム（視聴時間重視）への不満を解消

### Supabaseスキーマ
- `user_ratings`（Good/Bad評価）
- `user_favorites`（お気に入り）
- `watch_history`（視聴履歴）
- `subscribed_channels`（登録チャンネル）
- `user_preferences`（アルゴリズム重み設定）

### 実装した画面・コンポーネント
- HomeScreen（おすすめ動画）
- SearchScreen（検索結果）
- HistoryScreen（視聴履歴）
- VideoCard, VideoGrid, VideoPlayer
- VideoRating（Good/Bad評価）
- SubscribeButton（チャンネル登録）
- FavoriteButton（お気に入り）

## 3. ユーザーの重要な指示・好み

### アルゴリズムに関する指示
- 「市長じかんなど無意識のものよりGoodやBadのような意図的なもののアルゴリズムを超比重高める」
  - 意図: YouTubeの既存アルゴリズム（視聴時間でエンゲージメント測定）への不満。ユーザーが意図的に表明した評価を重視したい

### プロジェクト配置に関する指示
- 「Youtubeのやつそこにおいても他のやつとややこしくない？」
  - 意図: 既存のCarnivoreアプリと混同を避けたい
  - 対応: プロジェクト分離ガイドを作成し、別ディレクトリへの移動を推奨

### ドキュメント共有に関する指示
- 「ガイドは全部チャットに貼って」
  - 意図: ファイルを開かずにチャット上で確認したい

## 4. 残タスク・申し送り

### 必須タスク
- [ ] プロジェクトを別ディレクトリに移動（推奨）
  ```powershell
  cd "C:\Users\susam\Downloads\新しいフォルダー\docs"
  Move-Item "primal-logic-app\youtube-clone-no-shorts" "youtube-clone-no-shorts"
  ```
- [ ] YouTube API キーの取得（Google Cloud Console）
- [ ] Supabaseプロジェクト作成＆スキーマ実行（`supabase/schema.sql`）
- [ ] `.env`ファイルの作成と環境変数設定
- [ ] `npm run dev`で動作確認

### 動作確認チェックリスト
- [ ] ホーム画面でおすすめ動画が表示される
- [ ] ショート動画が除外されている
- [ ] 検索機能が動作する
- [ ] 動画再生ができる
- [ ] Good/Bad評価が動作する
- [ ] チャンネル登録が動作する
- [ ] お気に入り機能が動作する
- [ ] 視聴履歴が記録される

### オプションタスク
- [ ] アルゴリズム重みのカスタマイズ
- [ ] UIのカスタマイズ（カラーテーマ等）
- [ ] Vercel/Netlifyへのデプロイ

## 5. 作成したファイル一覧

```
youtube-clone-no-shorts/
├── src/
│   ├── components/
│   │   ├── video/
│   │   │   ├── VideoCard.tsx
│   │   │   ├── VideoGrid.tsx
│   │   │   ├── VideoPlayer.tsx
│   │   │   ├── VideoRating.tsx
│   │   │   ├── SubscribeButton.tsx
│   │   │   └── FavoriteButton.tsx
│   │   └── search/
│   │       └── SearchBar.tsx
│   ├── screens/
│   │   ├── HomeScreen.tsx
│   │   ├── SearchScreen.tsx
│   │   └── HistoryScreen.tsx
│   ├── services/
│   │   ├── youtubeApi.ts
│   │   ├── recommendationAlgorithm.ts
│   │   └── supabaseService.ts
│   ├── types/
│   │   └── video.ts
│   ├── lib/
│   │   └── supabaseClient.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── supabase/
│   └── schema.sql
├── .env.example
├── README.md
├── NEXT_STEPS_GUIDE.md
└── PROJECT_SEPARATION_GUIDE.md
```
