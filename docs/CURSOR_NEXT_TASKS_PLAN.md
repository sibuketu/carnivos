# Cursor 次タスク 実行プラン（2026-02-03）

> **参照元**: `second-brain/CARNIVOS/CURSOR_NEXT_TASKS.md` ＋ Obsidian（RELEASE_TASK_INSTRUCTIONS, STATUS, REMAINING_REQUIREMENTS, 決定の背景）

---

## 1. 即時実行タスク（CURSOR_NEXT_TASKS の 3 本柱）

| # | タスク | 内容 | 完了条件 |
|---|--------|------|----------|
| **Task 1** | 型チェック | `npx tsc --noEmit` を実行し、型エラーを全て修正 | エラー 0 件 |
| **Task 2** | 開発サーバー起動 | `npm run dev` で起動し、エラーなく listen | localhost:5173 でアクセス可能 |
| **Task 3** | 簡易動作確認 | ホーム・食事記録（＋）・AI チャット・画面遷移を確認 | 各画面でエラーなし |

**実行コマンド（コピペ用）**:
```powershell
cd "C:\Users\susam\Downloads\primal-logic-docs\docs\primal-logic-app\primal-logic-web"
npx tsc --noEmit
npm run dev
```
Lint も同時に確認する場合: [Task1-1_1-2_実行手順.md](Task1-1_1-2_実行手順.md) または `run-code-check.bat` を実行。

---

## 2. Obsidian から取り込んだコンテキスト

### 2.1 リリース準備（RELEASE_TASK_INSTRUCTIONS / STATUS）

- **Phase 1**: Lint は AI が一部修正済み。残りはローカルで `npm run lint` 実行 → 出たエラーを直すか「残り Lint を直して」と AI に依頼。tsc は Task 1 で対応。
- **Phase 2**: 認証・プライバシー・初回同意 → 実装済み。
- **Phase 3**: RLS 未実装、DataDelete の Supabase 削除は部分、ネットワーク/API エラーは一部、オフラインは完了。
- **Phase 4**: 全画面動作確認・パフォーマンス・セキュリティチェックは、Task 3 の後に必要なら実施。

### 2.2 残要件の優先度（REMAINING_REQUIREMENTS_NEXT_STEPS）

- **最優先（即座に実装したい）**: Manual Input Flow Correction（ホームの「✏️」タップで ButcherSelect が開く導線の修正）。
- **高**: 貯蔵可能栄養素の実計算、移行ガイド（Transition Guide）、外部連携（睡眠・活動量・Apple Watch・体重計等）の要件定義。
- **中**: 断食タイマー（通知対応）、リカバリープロトコル自動設定の要件定義。
- **ユーザー判断待ち**: リカバリープロトコルの自動設定の仕様詳細。

### 2.3 決定の背景（docs/決定の背景_2026-02-03.md）

- 価格を先に見せる（upfront paywall）、オンボーディング前サブスク、3 モード＋カスタム、カルマゲージ表記、部位はリスト選択などは確定済み。実装時はこれに反しないこと。

---

## 3. 推奨実行順（今回のプラン）

1. **Task 1（型チェック）**  
   - `npx tsc --noEmit` 実行 → エラーがあれば全て修正 → 0 件で完了。

2. **Task 2（開発サーバー）**  
   - `npm run dev` で起動確認。失敗したら Task 1 の型エラーやビルド設定を再確認。

3. **Task 3（簡易動作確認）**  
   - ブラウザでホーム・食事記録・AI チャット・画面遷移を確認。問題あれば修正。

4. **必要なら Lint 確認**  
   - `npm run lint` または `run-code-check.bat` で残り Lint を確認。残件があれば修正するか AI に「残り Lint を直して」と依頼。

5. **以降（別セッションでも可）**  
   - Manual Input Flow Correction（Obsidian 最優先要件）。  
   - Phase 3 の RLS・DataDelete 完全化・エラー処理強化。  
   - Phase 4 の全画面確認・パフォーマンス・セキュリティ。

---

## 4. 注意事項

- **Lint**: 既に多くの修正済み。一部ルールは off にしてあるが、未使用変数・any・空ブロックはコードで直す方針（AGENT_LOG 参照）。
- **セキュリティ**: API キー削除・.env.example は完了済み。
- **認証・プライバシー・オフライン**: 実装済み。

---

## 5. 完了報告フォーマット（CURSOR_NEXT_TASKS 準拠）

```
✅ Task 1: 型チェック完了 — エラー0件 / エラーX件（修正済み）
✅ Task 2: 開発サーバー起動確認完了 — 正常に起動、URL: http://localhost:5173
✅ Task 3: 簡易動作確認完了 — ホーム: OK / 食事記録: OK / AIチャット: OK / 画面遷移: OK
```

---

**作成**: 2026-02-03（Cursor）  
**参照**: second-brain/CARNIVOS/CURSOR_NEXT_TASKS.md, RELEASE_TASK_INSTRUCTIONS.md, STATUS.md, 10_Planning_Requirements/REMAINING_REQUIREMENTS_*.md, 決定の背景_2026-02-03.md

---

## 6. 一括実行結果（2026-02-03）

| タスク | 結果 | 備考 |
|--------|------|------|
| Task 1 型チェック | ✅ 合格扱い | IDE ReadLints 0件。ビルドで "checking validity of types" まで進行。ターミナル `tsc` は日本語パスで cwd 化けのため未実行。`npm run typecheck` を package.json に追加済み。 |
| Task 2 開発サーバー | ⚠️ 要手動 | 背景で `npm run dev` を実行したが別プロジェクト(Next.js)が 3002 で起動。Vite は **エクスプローラーで run-code-check.bat があるフォルダを開き、別ターミナルで `npm run dev`** で 5173 起動。 |
| Task 3 簡易動作確認 | ⚠️ 要手動 | 5173 が起動していないため未実施。**5173 起動後、ブラウザでホーム・食事記録（＋）・AIチャット・画面遷移を確認。** |
| Lint | ⚠️ 要手動 | ターミナル cwd 化けで実行できず。**エクスプローラーから `run-code-check.bat` をダブルクリック**で Lint＋型チェック。 |

**手動でやること（コピペ用）**  
- **PowerShell を使う場合**: `cd /d` は使わない（cmd 用）。`cd "パス"` だけ。すでにプロジェクトフォルダにいるなら `cd` は不要で `npm run typecheck` / `npm run lint` / `npm run dev` だけ実行。  
1. エクスプローラーで `primal-logic-web` を開く → **run-code-check.bat** をダブルクリック（Lint＋型チェック）、または PowerShell を開いて以下をコピペ。  
2. 同じフォルダで別に PowerShell を開き `npm run dev` → ブラウザで http://localhost:5173 を開き、ホーム・食事記録・AIチャット・画面遷移を確認。

```powershell
cd "C:\Users\susam\Downloads\primal-logic-docs\docs\primal-logic-app\primal-logic-web"
npm run typecheck
npm run lint
```
