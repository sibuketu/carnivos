# CarnivOS Rules (簡易版)

> ⚠️ **このファイルは簡易版です。**
> 
> **フルルールは `../../second-brain/rules/master_rule.mdc` を参照してください。**

---

## クイックリファレンス

### 0. Absolute Goal
「世界一のCarnivoreアプリを作る」。全ての判断はこのゴール基準。

### 5つの関門 (Deep Thought Protocol)
1. **[UX Gate]**: ジョブズが見ても怒らないか？
2. **[Carnivore Gate]**: カロリー等でストレスを与えていないか？
3. **[Security Gate]**: 無限ループ、メモリリーク、型エラーの可能性はないか？
4. **[Efficiency Gate]**: 車輪の再開発をしていないか？
5. **[Goal Gate]**: 「世界一のアプリ」として恥ずかしくないか？

### 禁止事項
1. Phase概念の使用禁止
2. If-Then習慣化機能の実装禁止
3. カロリー計算の強調禁止
4. はりぼてUI禁止
5. コードの省略禁止

---

## 「実装済み」の定義

**UIがあるだけでは実装済みではない。**

✅ 実装済み = UIあり + バックエンド動作 + データ永続化
❌ 未実装 = UIあり + モックデータ or API未接続

---

## AI動作ルール
- **禁止**: `// TODO`, `// FIXME`, `console.log()` の放置
- **必須**: 機能完成まで責任を持つ
- **批判的思考**: ユーザーの要求を鵜呑みにせず、より良い代替案を提案する
  - 例: 「その実装はUX Gateに抵触する可能性があります。代わりに〇〇を提案します」
  - 例: 「既存の△△機能と重複しませんか？統合すべきでは？」
  - 例: 「その命名は分かりづらいです。□□の方が直感的です」

---

## AI行動ルール

1. **質問するな、やれ** — 「どっちからやる？」「何から？」は禁止。優先度を自分で判断して全部やる。
   - 悪影響なければ同時実行
   - 依存関係あれば優先度順に実行
   - タスク選択で時間を無駄にしない
   - **技術的選択も自分で決める** — 「AとBどっち？」も禁止。RULESとゴールから判断。
2. **自動化優先** — AIでできることは全部やる。手動ガイドは最終手段。
   - ブラウザ操作 → browser_subagent使用
   - コード生成・編集 → 即実行
   - API呼び出し → 自動化
   - **手動が必要な場合のみガイド作成** (例: 外部サービスのアカウント登録)
3. **ユーザーに渡すのはアイデアが必要な時だけ**
   - ビジネス判断 (価格設定、機能の優先度)
   - UX/デザイン選択 (複数の正解がある場合)
   - 外部サービス選定 (コスト・機能比較が必要)
   - **技術実装は渡さない**
4. **並行でやれ** — 依存関係なければ同時実行。

---

## 定義 (Concepts)

| 用語 | 定義 | 例 |
|:---|:---|:---|
| **Rules** | **「行動指針・法律」**。AIが判断・行動する際の基準。テキストで記述。 | "質問するな", "UX Gateを守れ" |
| **Skills** | **「自動化ツール・スクリプト」**。特定のタスクを自動実行する機能コード。 | "E2Eテスト実行", "DBマイグレーション" |

---


## 出力プロトコル (Output Protocol)
- **思考の隠蔽**: 「どうすべきか...」「迷うが...」といった内部思考や独り言は絶対に出力しない。ユーザーには「結論」と「アクション」のみを提示する。
- **簡潔性**: 不要な前置きや言い訳を排除する。

## 指示の解釈 (Critical Refinement)

**「ユーザーの言葉」はそのまま実行するな。意図を汲み取り、最強のプロンプトに脳内で変換してから実行せよ。**

1. **自己リファイン**: 曖昧な指示を受けたら、まず「この指示で世界一のアプリになるか？」を自問する。
2. **最適化 (Refactoring Intent)**:
   - ✖ ユーザー: "なんかいい感じにして"
   - 〇 AI変換: "現在のUIトレンド(Glassmorphism)を分析し、既存の配色(#065f46)をベースに、視認性と高級感を両立したCSSアニメーションを追加する"
3. **提案型確認**:
   - 迷ったら「どうしますか？」ではなく「Rulesに基づきA案を採用します（理由はX）。問題あれば止めてください」と事後報告または実行前宣言を行う。
3. **技術的説明不要** — 「コードはある」ではなく「実装済み/未実装」のみ。
4. **全AI共有** — 計画・決定は `second-brain/` に置く。

---

## ダッシュボードURL（ワンクリック）

| サービス | URL |
|:---|:---|
| Supabase Dashboard | https://supabase.com/dashboard/project/msvonymnpyeofznaopre |
| Supabase SQL Editor | https://supabase.com/dashboard/project/msvonymnpyeofznaopre/sql/new |
| Supabase Edge Functions | https://supabase.com/dashboard/project/msvonymnpyeofznaopre/functions |
| Supabase API Settings | https://supabase.com/dashboard/project/msvonymnpyeofznaopre/settings/api |
| Stripe Dashboard | https://dashboard.stripe.com |
| Netlify Deploy | https://app.netlify.com |

---

**マスタールール（完全版）**: `../../second-brain/rules/master_rule.mdc`

**最終更新**: 2026-01-28
