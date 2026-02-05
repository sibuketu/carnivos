# CarnivOS: Project Structure Map

> **目的**: Claude Codeがプロジェクト全体を即座に把握できるように、ファイル構造と重要な場所をマップ化する。
> **更新日**: 2026-01-11

---

## プロジェクト概要

**プロジェクト名**: CarnivOS (Carnivore Compass)
**種類**: Carnivoreダイエット専門の栄養管理・最適化アプリ
**技術スタック**: React + Vite + TypeScript + Tailwind CSS + Supabase
**プラットフォーム**: Web (PWA), iOS (Capacitor), Android (Capacitor)

---

## ディレクトリ構造

### ルートディレクトリ
```
primal-logic-app/
├── primal-logic-web/          # メインのWebアプリ（React + Vite）
├── android/                    # Androidネイティブコード
├── docs/                       # プロジェクトドキュメント・参考資料
└── 設定ファイル（package.json等）
```

### メインアプリ (primal-logic-web/)
```
primal-logic-web/
├── src/                        # ソースコード
│   ├── components/             # UIコンポーネント（30+ファイル）
│   ├── screens/                # 画面コンポーネント（40+ファイル）
│   ├── data/                   # データベース（11ファイル）
│   ├── context/                # 状態管理
│   ├── hooks/                  # カスタムフック
│   ├── constants/              # 定数
│   └── lib/                    # ライブラリ
├── public/                     # 静的ファイル
├── docs/                       # ドキュメント
├── _ARCHIVE_OLD_DOCS/          # 古いドキュメント（アーカイブ）
├── .cursorrules                # Cursor用ルール
├── CLAUDE.md                   # Claude Code用ルール
├── package.json                # 依存関係
├── vite.config.ts              # Vite設定
└── playwright.config.ts        # テスト設定
```

---

## 重要ファイルの場所

### 📋 仕様・ドキュメント

#### マスター仕様書
- **場所**: `Carnivore_Logic_Master_Spec.md`
- **内容**: アプリの全体仕様、UI/UX、Logic Matrix、AI Concierge
- **更新**: 2025-12-18 → **要更新**（完了機能を反映）

#### 決定ログ
- **場所**: `DECISION_LOG.md`
- **内容**: 重要な決定事項と、その理由（Why）の記録
- **更新**: 2026-01-11（最新）
- **記録内容**: If-Then削除、Phase概念削除

#### 機能の意図
- **場所**: `FEATURE_INTENTS.md`
- **内容**: 各機能の意図と目的、実装の根拠

#### 完了機能リスト
- **場所**: `CURRENT_FEATURES_ACCURATE.md`
- **内容**: 完了機能の正確なリスト、未対応機能の記録
- **更新**: 2026-01-03

#### 差別化ポイント
- **場所**: `CORE_FEATURES_AND_WEAPONS.md`
- **内容**: 4つのコア機能、10個の武器（差別化ポイント）
- **更新**: 2026-01-03

### ⚙️ 設定ファイル

#### Claude Code用ルール
- **場所**: `CLAUDE.md`
- **内容**: 19セクション、260行のルール（プロジェクト固有情報、ツール使用法、禁止事項）
- **更新**: 2026-01-11（最新）

#### Cursor用ルール
- **場所**: `.cursorrules`
- **内容**: 77行のルール（Deep Thought Protocol、Neo Persona、AI Information Source Matrix）

### 📊 データファイル

#### 食品データベース
- **場所**: `src/data/foodMaster.ts`
- **内容**: 食品カテゴリー、動物タイプ、部位の定義
- **サイズ**: 約500行

#### 栄養素データベース
- **場所**: `src/data/foodsDatabase.ts`
- **内容**: 12,000+食品の栄養素データ
- **サイズ**: 大規模

#### 推奨栄養素目標値
- **場所**: `src/data/carnivoreTargets.ts`
- **内容**: カーニボア推奨の栄養素目標値、バイオアベイラビリティ係数

#### 科学的根拠
- **場所**: `src/data/argumentCards.ts`
- **内容**: カーニボアダイエットの科学的根拠、論破カード

#### 移行ガイド
- **場所**: `src/data/transitionGuide.ts`
- **内容**: カーニボア移行期間のガイド

---

## コンポーネント構成

### 🖼️ UIコンポーネント (src/components/)

#### Butcher UI
- **ButcherSelect.tsx**: 動物タイプ・部位選択UI
- **ButcherChart.tsx**: 解剖図表示
- **InteractiveButcher.tsx**: インタラクティブな解剖図

#### ゲージ
- **NutrientGauge.tsx**: 4ゾーングラデーションゲージ
- **PFRatioGauge.tsx**: P:F比率ゲージ
- **CalciumPhosphorusRatioGauge.tsx**: Ca:P比率ゲージ
- **GlycineMethionineRatioGauge.tsx**: Gly:Met比率ゲージ
- **OmegaRatioGauge.tsx**: Omega 3/6比率ゲージ

#### AI機能
- **AISpeedDial.tsx**: AI機能のクイックアクセス
- **PhotoAnalysisModal.tsx**: 写真解析UI
- **SymptomChecker.tsx**: 症状チェッカー

#### その他
- **ArgumentCard.tsx**: 科学的根拠の表示
- **StreakCalendar.tsx**: 連続日数カレンダー
- **PrimalBonfire.tsx**: Bonfire効果の可視化

### 📱 画面コンポーネント (src/screens/)

#### メイン画面
- **HomeScreen.tsx**: メインダッシュボード（83,573バイト）
- **InputScreen.tsx**: 食事入力画面
- **HistoryScreen.tsx**: 履歴管理（70,379バイト）

#### 設定・プロファイル
- **ProfileScreen.tsx**: プロファイル設定
- **SettingsScreen.tsx**: 設定画面
- **NutrientTargetCustomizationScreen.tsx**: 栄養素目標値カスタマイズ

#### その他
- **DiaryScreen.tsx**: 日記・記録
- **StatsScreen.tsx**: 統計・グラフ
- **KnowledgeScreen.tsx**: 知識ベース
- **GiftScreen.tsx**: ギフト機能（35,823バイト）
- **LabsScreen.tsx**: 実験室機能

---

## データフロー

### 状態管理
- **AppContext.tsx**: グローバル状態（ユーザー設定、認証状態など）
- **NutritionContext.tsx**: 栄養素関連の状態（食事記録、目標値など）

### カスタムフック
- **useNutrition.ts**: 栄養素計算ロジック
- **useSettings.ts**: 設定管理
- **useUserConfig.ts**: ユーザー設定管理

---

## 技術スタック

### フロントエンド
- **Framework**: React 19.2.0 + TypeScript 5.9.3
- **Build Tool**: Vite 7.2.4
- **Styling**: Tailwind CSS 4.1.18
- **Icons**: Lucide React
- **PWA**: vite-plugin-pwa 1.2.0

### 外部API統合
- **Google Gemini API**: AI機能（写真解析、チャット）
- **Supabase**: バックアップ・クラウド同期（オプション）
- **OpenWeatherMap**: 天気情報（オプション、未対応）

### テスト・品質管理
- **E2E Testing**: Playwright 1.57.0
- **Linting**: ESLint 9.39.1 + typescript-eslint

---

## ビルド・デプロイ

### 開発サーバー
```bash
npm run dev     # 開発サーバー起動
```

### ビルド
```bash
npm run build   # プロダクションビルド
npm run preview # ビルド結果のプレビュー
```

### テスト
```bash
npm run lint    # Lintチェック
npm run test    # Playwrightテスト
```

### デプロイ
- **Web版**: Netlifyに自動デプロイ対応
- **iOS版**: Capacitor設定済み
- **Android版**: ネイティブコード準備中

---

## 開発ワークフロー

### 1. 機能実装前
1. `Carnivore_Logic_Master_Spec.md` を読む
2. `CURRENT_FEATURES_ACCURATE.md` で実装状況を確認
3. `FEATURE_INTENTS.md` で機能の意図を確認

### 2. 実装中
1. `CLAUDE.md` のルールに従う
2. 専用ツール（Glob, Grep, Read, Edit, Write）を使用
3. 技術的な詳細は自律的に解決

### 3. 実装後
1. `npm run lint` でチェック
2. `npm run build` でビルド確認
3. `DECISION_LOG.md` に決定事項と理由を記録
4. 実装状況を `CURRENT_FEATURES_ACCURATE.md` に反映

---

## アーカイブ

### 古いドキュメント
- **場所**: `_ARCHIVE_OLD_DOCS/`
- **内容**: 重複していた年収予測、価格戦略、Geminiプロンプトの旧バージョン
- **理由**: 整理のため、削除ではなくアーカイブ

---

## 重要な注意事項

### ❌ やってはいけないこと
1. **Phase概念の使用**: 「Phase 1」などの表現禁止
2. **If-Then機能の実装**: 習慣化アプリの機能は実装しない
3. **習慣化アプリ混在**: Carnivoreアプリに関係ない情報を混ぜない
4. **技術用語でユーザーに報告**: 非エンジニア向けの言葉で報告
5. **ドキュメント更新忘れ**: 決定事項は必ず記録

### ✅ 必ずやること
1. **起動確認**: 実装後は必ず動作確認
2. **決定の記録**: `DECISION_LOG.md` に理由を含めて記録
3. **専用ツール使用**: Bash ではなく Read/Edit/Write/Glob/Grep を使用
4. **5つの関門通過**: UX, Carnivore, Security, Efficiency, Goal

---

最終更新: 2026-01-11

