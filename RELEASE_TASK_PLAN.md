# リリース作業計画

> **作成日**: 2026-02-01
> **目的**: リリースに必要な全作業を整理し、Antigravityに任せられるタスクと、Claude Codeがやるべきタスクを分類

---

## ✅ 完了済み

- ✅ ルールファイル統合（`AI_RULES.md` 作成、古いルールファイル削除）
- ✅ 主要機能の実装（栄養素追跡、AIチャット、履歴管理等）
- ✅ Visual Regression Testの実装
- ✅ E2Eテストの実装

---

## 🎯 リリース必須項目（優先順位順）

### 【最優先】A. 認証・ログイン機能（文脈依存・Claude Code担当）

**なぜClaude Code？**: 既存のコードベースとの統合、セキュリティ要件、複雑なエラーハンドリングが必要

**タスク**:
1. Supabase Auth セットアップ
   - Supabaseプロジェクト作成
   - 環境変数設定（`.env`）
   - Auth設定（Email/Password）
2. 認証UI実装
   - ログイン画面
   - ユーザー登録画面
   - パスワードリセット画面
3. セッション管理
   - ログイン状態の保持
   - 自動ログアウト（セッション期限）
   - トークンリフレッシュ
4. エラーハンドリング
   - ネットワークエラー
   - 認証エラー（パスワード間違い等）
   - セッション期限切れ
5. ゲストモード（オプション）
   - ローカルストレージのみで動作
   - 認証スキップ

**見積もり**: 大規模（文脈理解が必要）

---

### 【高優先】B. プライバシーポリシー・利用規約（シンプル・Antigravity可能）

**なぜAntigravity？**: 既存アプリのコピー＋翻訳作業が中心。文脈理解不要

**タスク**:
1. プライバシーポリシーページ作成
   - 既存の健康管理アプリ（MyFitnessPal、Noom等）からテンプレートをカンニング
   - 日本語翻訳
   - Markdown形式で作成（`public/privacy-policy.md`）
2. 利用規約ページ作成
   - 既存アプリからテンプレートをカンニング
   - 日本語翻訳
   - Markdown形式で作成（`public/terms-of-service.md`）
3. 同意画面UI実装
   - 初回起動時のモーダル
   - チェックボックス（「同意する」）
   - 設定画面からのリンク
4. ルーティング追加
   - `/privacy-policy` ページ
   - `/terms-of-service` ページ

**Antigravityへの指示テンプレート**:
```
タスク: プライバシーポリシー・利用規約の作成

1. 以下のアプリのプライバシーポリシーと利用規約をWeb検索で取得：
   - MyFitnessPal
   - Noom
   - Cronometer

2. これらを参考に、CarnivOSアプリ用のプライバシーポリシーと利用規約を日本語で作成

3. 以下のファイルを作成：
   - public/privacy-policy.md
   - public/terms-of-service.md

4. Markdown形式で書く（見出しは ##、リストは -）

5. 必須項目：
   - 収集する情報
   - 情報の使用目的
   - データの保存期間
   - ユーザーの権利（データ削除・エクスポート）
   - 連絡先

6. 禁止事項：
   - 推測で書かない
   - 既存アプリから丸コピー（参考にして独自に書く）

7. 完了後、AGENT_LOG.md に作業ログを追記
```

**見積もり**: 中規模（シンプル）

---

### 【高優先】C. Lintエラー修正（シンプル・Antigravity可能）

**なぜAntigravity？**: 機械的な修正作業が中心。文脈理解不要

**現在のLintエラー**: 23ファイル、約50個のエラー

**主なエラータイプ**:
1. 未使用変数（`@typescript-eslint/no-unused-vars`）
2. `any` 型の使用（`@typescript-eslint/no-explicit-any`）
3. React Hooks関連（`react-hooks/set-state-in-effect`）
4. その他（正規表現のエスケープ等）

**Antigravityへの指示テンプレート**:
```
タスク: Lintエラー修正

1. 以下のコマンドを実行してLintエラーリストを取得：
   cd "C:\Users\susam\Downloads\新しいフォルダー\docs\primal-logic-app\primal-logic-web"
   npm run lint

2. エラーを1つずつ修正：
   - 未使用変数: 削除または `_` プレフィックスを付ける
   - `any` 型: 適切な型を指定（不明な場合は `unknown` を使う）
   - React Hooks: useEffectの依存配列を修正、またはuseCallbackでラップ

3. 修正後、再度 `npm run lint` を実行してエラーが消えたことを確認

4. 完了後、AGENT_LOG.md に作業ログを追記

注意事項：
- 既存の動作を変えない（ロジックを変更しない）
- わからない場合は修正せず、Claude Codeに報告
- テストが失敗した場合は修正を戻す
```

**見積もり**: 中規模（機械的作業）

---

### 【高優先】D. TypeScript型チェック（文脈依存・Claude Code担当）

**なぜClaude Code？**: 型推論、既存コードとの整合性確認が必要

**タスク**:
1. 型チェック実行: `npx tsc --noEmit`
2. エラー修正
3. 再実行して確認

**見積もり**: 中規模（文脈理解が必要）

---

### 【高優先】E. テスト結果確認・修正（文脈依存・Claude Code担当）

**なぜClaude Code？**: テスト失敗の原因分析、既存コードとの整合性確認が必要

**タスク**:
1. Visual Regression Test結果確認
   - HTMLレポートを開く
   - 失敗したテストの原因を特定
   - 必要に応じて修正
2. E2Eテスト結果確認
   - Playwrightレポートを開く
   - 失敗したテストの原因を特定
   - 必要に応じて修正

**見積もり**: 中規模（文脈理解が必要）

---

### 【中優先】F. アクセシビリティチェック（シンプル・Antigravity可能）

**なぜAntigravity？**: ツールを使った機械的チェックが中心

**タスク**:
1. axe DevToolsをインストール（Chrome拡張）
2. 全ページでチェック実行
3. エラーをリスト化
4. 修正（可能な範囲）

**Antigravityへの指示テンプレート**:
```
タスク: アクセシビリティチェック

1. axe DevTools Chrome拡張をインストール:
   https://chrome.google.com/webstore/detail/axe-devtools-web-accessibility-testing/lhdoppojpmngadmnindnejefpokejbdd

2. アプリを起動:
   cd "C:\Users\susam\Downloads\新しいフォルダー\docs\primal-logic-app\primal-logic-web"
   npm run dev

3. 全ページ（Home、Input、History、Settings等）でaxe DevToolsを実行

4. 発見したエラーをリスト化（Markdown形式）

5. 修正可能なエラー（altタグの追加等）は修正

6. 完了後、AGENT_LOG.md に作業ログを追記

注意事項：
- 修正は簡単なもののみ（altタグ、aria-label等）
- UIの構造を変更する必要がある場合は、Claude Codeに報告
```

**見積もり**: 小規模（機械的作業）

---

### 【中優先】G. パフォーマンス最適化（文脈依存・Claude Code担当）

**なぜClaude Code？**: コード分割、キャッシュ戦略等、アーキテクチャレベルの判断が必要

**タスク**:
1. Lighthouse監査実行
2. パフォーマンススコア確認
3. 改善提案実施
   - 画像最適化
   - コード分割（React.lazy）
   - キャッシュ戦略

**見積もり**: 中規模（文脈理解が必要）

---

### 【低優先】H. データ保護機能（文脈依存・Claude Code担当）

**なぜClaude Code？**: 認証機能との統合、セキュリティ要件が必要

**タスク**:
1. データエクスポート機能
   - JSONフォーマット
   - ダウンロードボタン
2. データ削除機能
   - 全データ削除
   - 確認ダイアログ

**見積もり**: 小規模（認証実装後）

---

## 📋 作業順序（推奨）

### フェーズ1: コード品質（Antigravity中心）
1. ✅ ルールファイル統合（完了）
2. ⏳ Lintエラー修正（Antigravity）
3. ⏳ プライバシーポリシー・利用規約作成（Antigravity）
4. ⏳ アクセシビリティチェック（Antigravity）

### フェーズ2: コア機能（Claude Code中心）
5. ⏳ TypeScript型チェック（Claude Code）
6. ⏳ テスト結果確認・修正（Claude Code）
7. ⏳ 認証・ログイン機能実装（Claude Code）
8. ⏳ パフォーマンス最適化（Claude Code）

### フェーズ3: 最終確認（Claude Code）
9. ⏳ データ保護機能実装（Claude Code）
10. ⏳ 全体動作確認（Claude Code）
11. ⏳ ドキュメント最終更新（Claude Code）

---

## 🤖 Antigravityに任せられるタスクまとめ

**理由**: 文脈理解不要、機械的作業、既存アプリのコピー作業が中心

1. **Lintエラー修正**（中規模・機械的）
   - 未使用変数削除
   - `any` 型の修正
   - React Hooks関連の修正

2. **プライバシーポリシー・利用規約作成**（中規模・コピー作業）
   - 既存アプリからテンプレートをカンニング
   - 日本語翻訳
   - Markdownファイル作成

3. **アクセシビリティチェック**（小規模・機械的）
   - axe DevToolsでチェック
   - 簡単な修正（altタグ、aria-label等）

**注意**: Antigravityは文脈理解が苦手なので、指示は詳細かつ具体的に。チェックリスト形式で提示する。

---

## 👨‍💻 Claude Codeがやるべきタスクまとめ

**理由**: 文脈理解必須、アーキテクチャレベルの判断が必要、セキュリティ要件が厳しい

1. **認証・ログイン機能実装**（大規模・文脈依存）
   - Supabase Auth統合
   - セッション管理
   - エラーハンドリング

2. **TypeScript型チェック**（中規模・文脈依存）
   - 型推論
   - 既存コードとの整合性確認

3. **テスト結果確認・修正**（中規模・文脈依存）
   - Visual Regression Test
   - E2Eテスト

4. **パフォーマンス最適化**（中規模・文脈依存）
   - コード分割
   - キャッシュ戦略

5. **データ保護機能実装**（小規模・認証実装後）
   - データエクスポート
   - データ削除

---

## 📊 見積もりサマリー

| タスク | 担当 | 規模 | 優先度 | 状態 |
|:---:|:---:|:---:|:---:|:---:|
| ルールファイル統合 | Claude Code | 小 | 最優先 | ✅ 完了 |
| Lintエラー修正 | Antigravity | 中 | 高 | ⏳ 待機 |
| プライバシーポリシー・利用規約 | Antigravity | 中 | 高 | ⏳ 待機 |
| アクセシビリティチェック | Antigravity | 小 | 中 | ⏳ 待機 |
| TypeScript型チェック | Claude Code | 中 | 高 | ⏳ 待機 |
| テスト結果確認・修正 | Claude Code | 中 | 高 | ⏳ 待機 |
| 認証・ログイン機能 | Claude Code | 大 | 最優先 | ⏳ 待機 |
| パフォーマンス最適化 | Claude Code | 中 | 中 | ⏳ 待機 |
| データ保護機能 | Claude Code | 小 | 低 | ⏳ 待機 |

**合計見積もり**:
- Antigravity: 中2 + 小1 = 約20-30時間（推定）
- Claude Code: 大1 + 中3 + 小1 = 約40-60時間（推定）

---

## 🎯 次のアクション

### 1. Antigravityタスクを開始（並行実行可能）
- Lintエラー修正
- プライバシーポリシー・利用規約作成
- アクセシビリティチェック

### 2. Claude Codeタスクを開始
- TypeScript型チェック
- テスト結果確認・修正
- 認証・ログイン機能実装

### 3. 進捗確認
- 各タスク完了後、`AGENT_LOG.md` に記録
- 問題があればエスカレーション

---

最終更新: 2026-02-01
