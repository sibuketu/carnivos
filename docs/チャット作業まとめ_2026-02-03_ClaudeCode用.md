# チャット作業まとめ（2026-02-03）— Claude Code 用

このチャットで実施した作業の一覧です。Claude Code で続きの作業をする際のコンテキストとして使ってください。

---

## 1. RELEASE_TASK_INSTRUCTIONS に沿った作業

**参照**: `second-brain/CARNIVOS/RELEASE_TASK_INSTRUCTIONS.md`（プロジェクト直下の `RELEASE_TASK_INSTRUCTIONS.md` は存在しない）

### Phase 1: セキュリティ（Task 1-3）✅ 完了
- **QUICK_START.md** / **eslint.config/QUICK_START.md**: 平文の API キー（`AIzaSy...`）を削除し、「.env に設定」の説明に変更
- **.env.example**: プロジェクトルートに新規作成（キー名のみ、値は空欄）。`.gitignore` に `.env` が含まれていることは確認済み

### Phase 2: 認証・プライバシー・同意
- **実装済みであることを確認**: `App.tsx` で Consent → Paywall → Auth → Onboarding の流れ、PrivacyPolicyScreen / TermsOfServiceScreen / AuthScreen / ConsentScreen / DataExportScreen / DataDeleteScreen がルーティング済み
- **RELEASE_TASK_INSTRUCTIONS**: second-brain 内の指示書で Task 2-1 / 2-2 / 2-3 を「実装済み」に更新済み

### Phase 3: オフラインモード（Task 3-6）✅ 完了
- **App.tsx**: `navigator.onLine` と online/offline イベントでオフライン検出し、画面上部に「📡 オフラインです。一部の機能（AIチャット等）は利用できません。」バナーを表示
- **AISpeedDial.tsx**: チャット送信・画像解析前にオフラインなら「オンライン接続が必要です。インターネットに接続してから再度お試しください。」と表示し、API 呼び出しをしない

### 指示書の状態更新
- **second-brain/CARNIVOS/RELEASE_TASK_INSTRUCTIONS.md**: Task 1-3, 2-1/2-2/2-3, 3-2/3-3/3-6 を「完了」または「実装済み」に更新し、末尾に「未実装・部分実装の機能」一覧を追加済み

---

## 2. 未実装アイデアの一括実装

### 2.1 AISpeedDial（AIチャットの「実行」ボタン）
- **断食タイマー（timer）**: 実行時に終了時刻を `primal_logic_fasting_timer_end`（ISO 文字列）で localStorage に保存し、トーストで「○時間の断食タイマーを開始しました」と表示。「通知機能は今後実装予定」の文言は削除
- **リカバリープロトコル（set_protocol）**: `primal_logic_open_recovery_protocol` を 1 に設定し、ホームへ遷移。トーストで「ホームの「リカバリー」からプロトコルを設定できます」と表示
- **画面を開く（open_screen）**: `todo.action.params.screen` があれば `navigateToScreen` でその画面へ遷移（モーダル・バブル両方で同じ処理）

### 2.2 HomeScreen（リカバリー画面を開く）
- **AI から「リカバリープロトコルを設定」でホームに来たとき**: `primal_logic_open_recovery_protocol` を検知し、`recoveryProtocolForModal` に `generateRecoveryProtocol(VIOLATION_TYPES.SUGAR_CARBS)` をセットしてリカバリー画面を表示
- **RecoveryProtocolScreen**: 表示条件を「dailyLog?.recoveryProtocol があるとき」から「showRecoveryProtocol && (recoveryProtocolForModal ?? dailyLog?.recoveryProtocol ?? defaultRecoveryProtocol)」に変更。protocol は `recoveryProtocolForModal ?? dailyLog?.recoveryProtocol ?? defaultRecoveryProtocol`

### 2.3 DataDeleteScreen（Supabase のデータ削除）
- 認証ユーザーについて、`daily_logs`・`profiles` を `user_id` で削除。`streaks` テーブルがあれば同様に削除（存在しなければ無視）。その後 `signOut`

### 2.4 写真解析中の Tips 表示（IMPROVEMENT_IDEAS 1.2）
- AISpeedDial の画像解析オーバーレイ内で、解析開始時に `getRandomTip()` で Tip を 1 件取得し、「画像を解析中…」の下にタイトル＋本文を表示。解析終了（成功・失敗どちらでも）で `setImageAnalysisTip(null)` でクリア

---

## 3. 変更したファイル一覧

| ファイル | 内容 |
|----------|------|
| QUICK_START.md | API キー削除、プレースホルダー説明に変更 |
| eslint.config/QUICK_START.md | 同上 |
| .env.example | 新規作成（キー名のみ） |
| src/App.tsx | オフライン検出・バナー表示 |
| src/components/dashboard/AISpeedDial.tsx | オフライン時 AI 無効メッセージ、断食タイマー／set_protocol／open_screen 実装、写真解析中 Tips |
| src/screens/HomeScreen.tsx | リカバリー開くフラグ処理、recoveryProtocolForModal／defaultRecoveryProtocol |
| src/screens/DataDeleteScreen.tsx | Supabase の daily_logs / profiles / streaks 削除 |
| second-brain/CARNIVOS/RELEASE_TASK_INSTRUCTIONS.md | 状態更新・未実装一覧追加 |
| docs/AGENT_LOG.md | 上記 2 回分の作業ログを追記 |

---

## 4. 未実装・残タスク（Claude Code で対応候補）

- **Lint 全修正・tsc**: ターミナルで `npm run lint` が next lint になる等、環境依存。要手動確認
- **断食タイマー終了時の通知**: 終了時刻の保存のみ。ブラウザの Notification API 等は未実装
- **withingsService**: token 交換・GET measure はコメントで「未実装」のまま
- **RLS（Supabase）**: Task 3-1 は SQL で別途実行が必要
- **Task 3-4/3-5**: ネットワーク・API エラーのタイムアウト・リトライは未実装（errorHandler でメッセージ変換のみ）
- **OAuth 系**: Google Fit / Google Drive / Calendar 等は「将来的に実装予定」のまま

---

## 5. 参照ドキュメント

- リリースタスク指示書: `second-brain/CARNIVOS/RELEASE_TASK_INSTRUCTIONS.md`
- 改善アイデア: `IMPROVEMENT_IDEAS.md`
- Gemini 風機能リスト: `GEMINI_FEATURES_TO_IMPLEMENT.md`
- Agent 作業ログ: `docs/AGENT_LOG.md`

---

**作成日**: 2026-02-03  
**対象**: Claude Code（続き作業用コンテキスト）
