# Geminiへの要件定義プロンプト：カメラ機能統合（完全版）

> 作成日: 2025-01-27
> 目的: Geminiと要件定義を行い、カメラ機能（写真から追加・バーコード読み取り・アルバム選択）の最適な実装方法を決定する
> **重要**: このアプリのことを全く知らない前提で、包括的な情報を提供する

---

## 📱 プロジェクト概要

### アプリ名
**CarnivOS**（別名: Carnivore Compass）

### アプリの目的
**世界一のカーニボアダイエット管理アプリを目指す**

カーニボアダイエット（肉・魚・卵・内臓のみを食べる食事法）を実践する人々をサポートする専門アプリ。一般的な健康管理アプリとは異なり、**進化的適合性**と**生化学**を重視し、疫学的栄養ガイドラインを優先しない。

### ミッション
現代の栄養情報の「ノイズ」に対する「盾（Shield）」として機能し、論理的な自己防衛の「武器（Weapon）」を提供する。

### ターゲットユーザー
- カーニボアダイエット実践者・興味がある人
- 性別・年齢・健康状態を問わず、全てのカーニボア実践者に対応
- 女性特有の条件（妊娠、授乳、閉経、PMS、PCOS等）も完全に対応
- 健康状態が様々な人に対応するため、疾患・症状・血液検査値も幅広く対応

### アプリの特徴
1. **動的目標値**: ユーザーの状態に応じた栄養素目標値の自動調整（100項目以上のプロファイル設定）
2. **バイオアベイラビリティロジック**: 植物性栄養素はペナルティ、動物性栄養素は優先
3. **メンタル安全性**: 厳格なカロリー計算ではなく、「不安のない」追跡と「リカバリープロトコル」に焦点
4. **4ゾーングラデーションゲージ**: 栄養素の状態を直感的に可視化（Red/Orange/Green/Purple）

---

## 🛠️ 技術スタック

### フロントエンド
- **フレームワーク**: React + Vite
- **言語**: TypeScript（strict mode）
- **スタイリング**: Tailwind CSS
- **アイコン**: Lucide React
- **状態管理**: React Context API
- **ストレージ**: localStorage（オフライン対応）

### プラットフォーム
- **PWA（Progressive Web App）**: ネイティブアプリではないため、ブラウザAPIの制限がある
- **モバイルファースト**: スマホ（iPhone 15幅）で完璧に見えるレイアウトを最優先
- **iOS化**: Capacitor（将来的にiOSアプリ化可能）

### 外部API
- **Gemini API**: AIチャット、写真解析（`analyzeFoodImage`関数）
- **Supabase**: クラウドバックアップ（オプション）
- **Browser Notification API**: 通知機能

### 既存のカメラ関連実装
- **写真解析**: [`src/services/aiService.ts`](primal-logic-app/primal-logic-web/src/services/aiService.ts) - `analyzeFoodImage`関数
- **バーコード読み取り**: [`src/utils/barcodeScanner.ts`](primal-logic-app/primal-logic-web/src/utils/barcodeScanner.ts) - `scanBarcodeFromCamera`関数、`BarcodeDetector API`使用
- **バーコードスキャナーモーダル**: [`src/components/BarcodeScannerModal.tsx`](primal-logic-app/primal-logic-web/src/components/BarcodeScannerModal.tsx)
- **写真解析モーダル**: [`src/components/PhotoAnalysisModal.tsx`](primal-logic-app/primal-logic-web/src/components/PhotoAnalysisModal.tsx)

---

## 🎨 デザイン原則

### スティーブ・ジョブズ風ミニマルデザイン
- **余計な装飾を削ぎ落とす**: 機能と美しさのバランスを重視
- **間隔は最小限**: `gap: 0`、`padding: 0.5rem`以下
- **余白は必要最小限**: 統一性と一貫性を最優先
- **色は抑制的に**: Apple製品のような「見えないデザイン」を目指す
- **フォントサイズ**: 読みやすさを保ちつつ控えめに

### UI/UXルール
- **モバイルファースト**: スマホ（iPhone 15幅）で完璧に見えるレイアウトを最優先
- **タッチフレンドリー**: すべてのボタンや入力要素は、指で押しやすいサイズ（44px以上）を確保
- **統一性**: 栄養ゲージのUI（背景色、枠線、間隔、ゲージバーの高さ、色ロジックなど）は、アプリ全体で一貫したデザインを保つ

### 現在のボタン仕様（カメラ機能）
- **サイズ**: 44px × 44px
- **アイコン**: 📷（絵文字）
- **背景色**: `#f3f4f6`（グレー）
- **ホバー**: `#e5e7eb`（薄いグレー）
- **位置**: ホーム画面の食品追加ボタンエリア
- **ファイル**: [`src/screens/HomeScreen.tsx`](primal-logic-app/primal-logic-web/src/screens/HomeScreen.tsx) (917-1008行目)

---

## 📋 既存の決定事項

### カメラ機能の意図と目的
**食品記録の手間を削減し、ユーザーの継続的な使用を促進する**

詳細は [`FEATURE_INTENTS.md`](primal-logic-app/primal-logic-web/FEATURE_INTENTS.md) を参照。

### 実装方針
- **統合UI**: 1つのボタンで複数の機能を提供（UIがシンプルになる）
- **健康管理アプリのパターンを参考**: MyFitnessPal、Lifesum、Noomなどのパターンを参考
- **カメラ1つで複数の機能を提供**: UIがシンプルになる

### 既存の実装状況
- **場所**: [`src/screens/HomeScreen.tsx`](primal-logic-app/primal-logic-web/src/screens/HomeScreen.tsx) (917-1008行目)
- **実装方法**: `window.confirm`で「写真から追加」か「バーコード読み取り」かを選択
- **問題点**: 
  - UXが悪い（確認ダイアログは非推奨）
  - モバイルで使いにくい
  - 他アプリのベストプラクティスに沿っていない
  - **アルバムから写真を選ぶ機能がない**

### 現在のコード（抜粋）
```typescript
// HomeScreen.tsx (917-1008行目)
<button
  onClick={async () => {
    const action = window.confirm('写真から追加しますか？\n\n「OK」: 写真から追加\n「キャンセル」: バーコード読み取り');
    
    if (action) {
      // 写真から追加
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.capture = 'environment'; // カメラのみ（アルバム選択不可）
      // ... 写真解析処理
    } else {
      // バーコード読み取り
      setShowBarcodeScanner(true);
    }
  }}
>
  📷
</button>
```

---

## 🔍 他アプリのパターン調査

### 健康管理アプリ

#### MyFitnessPal
- **パターン**: 写真とバーコードを別ボタンに分けている
- **写真ボタン**: カメラ起動 → 写真撮影 → AI解析
- **バーコードボタン**: カメラ起動 → バーコード検出 → 商品情報取得
- **アルバム**: 写真ボタンから、カメラ撮影かアルバム選択かを選択可能

#### Lifesum
- **パターン**: 1つのボタンで、カメラ起動後にモード選択
- **アクションシート（iOS）/ ボトムシート（Android）**: 「カメラで撮影」「アルバムから選択」「バーコード読み取り」を選択
- **UX**: モバイルで使いやすい選択UI

#### Noom
- **パターン**: 写真とバーコードを統合
- **カメラ起動後**: 自動的にバーコードを検出し、なければ写真として処理
- **アルバム**: 写真ボタンから、カメラ撮影かアルバム選択かを選択可能

### ショッピングアプリ

#### Amazon
- **パターン**: カメラ起動 → バーコード検出を優先 → 検出できなければ写真として処理
- **アルバム**: 写真ボタンから、カメラ撮影かアルバム選択かを選択可能

#### 楽天
- **パターン**: 1つのボタンで、カメラ起動後にモード選択（アクションシート）
- **選択肢**: 「カメラで撮影」「アルバムから選択」「バーコード読み取り」

### カメラアプリ

#### Google Lens
- **パターン**: カメラ起動 → 自動的にバーコード/テキスト/画像を検出 → 適切な処理を実行
- **アルバム**: 写真ボタンから、カメラ撮影かアルバム選択かを選択可能

#### Microsoft Lens
- **パターン**: 同様の自動検出機能
- **アルバム**: 写真ボタンから、カメラ撮影かアルバム選択かを選択可能

### ベストプラクティス
1. **アクションシート/ボトムシート**: モバイルで使いやすい選択UI
2. **自動検出**: バーコードを自動検出し、なければ写真として処理
3. **統合UI**: 1つのボタンで複数の機能を提供（UIがシンプル）
4. **アルバム選択**: 写真ボタンから、カメラ撮影かアルバム選択かを選択可能（必須機能）

---

## 💡 実装方法の選択肢

### 選択肢A: アクションシート/ボトムシート（推奨候補1）
- **方法**: ボタンタップ後、アクションシートで「カメラで撮影」「アルバムから選択」「バーコード読み取り」を選択
- **メリット**: 
  - モバイルで使いやすい
  - 明確な選択
  - アルバム選択も含められる
- **デメリット**: 1回のタップが増える

### 選択肢B: 自動検出 + アクションシート（推奨候補2）
- **方法**: カメラ起動後、自動的にバーコードを検出。検出できればバーコード処理、できなければアクションシートで「写真として処理」「アルバムから選択」を選択
- **メリット**: 
  - ユーザーの操作が少ない（バーコード検出時）
  - スムーズな体験
  - アルバム選択も含められる
- **デメリット**: バーコード検出の精度に依存

### 選択肢C: カメラ起動後のモード選択
- **方法**: カメラ起動後、画面上に「写真」「アルバム」「バーコード」ボタンを表示
- **メリット**: 視覚的に分かりやすい
- **デメリット**: UIが複雑になる、カメラ起動が必要

### 選択肢D: 別ボタンに分ける
- **方法**: 写真ボタンとバーコードボタンを別々に配置
- **メリット**: 明確、他アプリ（MyFitnessPal）のパターン
- **デメリット**: UIが複雑になる、ボタンが増える

### 選択肢E: 3つのボタンに分ける
- **方法**: 「カメラで撮影」「アルバムから選択」「バーコード読み取り」を3つのボタンに分ける
- **メリット**: 最も明確
- **デメリット**: UIが最も複雑になる、ボタンが3つになる

---

## 🔧 技術的な実装要件

### 現在の技術スタック
- **写真解析**: Gemini API（[`src/services/aiService.ts`](primal-logic-app/primal-logic-web/src/services/aiService.ts) - `analyzeFoodImage`関数）
- **バーコード読み取り**: [`src/utils/barcodeScanner.ts`](primal-logic-app/primal-logic-web/src/utils/barcodeScanner.ts) - `scanBarcodeFromCamera`関数、`BarcodeDetector API`使用
- **カメラ起動**: HTML5 `<input type="file" accept="image/*" capture="environment">`（現在は`capture="environment"`でカメラのみ）

### アルバム選択の実装
- **HTML5 File API**: `<input type="file" accept="image/*">`（`capture`属性なしでアルバム選択可能）
- **モバイルブラウザ**: iOS Safari、Chrome Mobileでの動作を保証

### アクションシート/ボトムシートの実装
- **PWAの制約**: ネイティブアプリではないため、ブラウザAPIの制限がある
- **実装方法**: カスタムコンポーネントの作成が必要
- **ライブラリ**: Headless UI、Radix UIなどの利用も検討可能

### バーコード自動検出の実装
- **Web BarcodeDetector API**: Chrome/Edge対応、iOS Safariでは利用不可
- **フォールバック**: `@zxing/library`などのライブラリ
- **パフォーマンス**: リアルタイム検出が必要

---

## 🎯 機能要件

### 必須機能
1. **カメラで撮影**: カメラを起動して写真を撮影し、AIで解析
2. **アルバムから選択**: 既存の写真をアルバムから選択し、AIで解析
3. **バーコード読み取り**: バーコードをスキャンして商品情報を取得

### オプション機能
1. **自動検出**: カメラ起動後、自動的にバーコードを検出
2. **複数写真選択**: アルバムから複数の写真を選択（将来的に）

---

## 🚫 制約条件

### 技術的制約
- **PWA**: ネイティブアプリではないため、ブラウザAPIの制限がある
- **モバイルブラウザ**: iOS Safari、Chrome Mobileでの動作を保証
- **カメラ権限**: ブラウザのカメラ権限が必要
- **アルバムアクセス**: ブラウザのファイルアクセス権限が必要

### UI制約
- **ボタンサイズ**: 44px × 44px（タッチフレンドリー）
- **デザイン**: スティーブ・ジョブズ風ミニマルデザイン
- **モバイルファースト**: スマホで完璧に動作

### パフォーマンス制約
- **写真解析**: Gemini APIのレスポンス時間（数秒）
- **バーコード検出**: リアルタイム検出が必要

---

## 🤔 整合性チェックと推論

### 既存機能との整合性
1. **AI機能**: 写真解析は既にGemini APIを使用（[`src/services/aiService.ts`](primal-logic-app/primal-logic-web/src/services/aiService.ts)）
2. **バーコード機能**: 既に`BarcodeDetector API`を使用（[`src/utils/barcodeScanner.ts`](primal-logic-app/primal-logic-web/src/utils/barcodeScanner.ts)）
3. **UI統一性**: 他の食品追加ボタン（「食品追加」「いつもの」「履歴」）と統一性を保つ必要がある

### デザイン原則との整合性
1. **ミニマルデザイン**: アクションシート/ボトムシートは、UIをシンプルに保つ
2. **モバイルファースト**: アクションシート/ボトムシートは、モバイルで使いやすい
3. **タッチフレンドリー**: すべての選択肢は44px以上のタッチターゲットを確保

### ユーザー体験の推論
1. **操作の流れ**: ボタンタップ → 選択 → 実行 → 結果表示
2. **エラーハンドリング**: カメラ権限が拒否された場合、アルバム選択にフォールバック
3. **ローディング表示**: 写真解析中はローディング表示（既存実装を参考）

---

## ❓ Geminiへの質問

1. **実装方法の推奨**: 上記の選択肢A-Eのうち、どれが最適か？理由は？
   - 既存のデザイン原則（スティーブ・ジョブズ風ミニマルデザイン）との整合性
   - モバイルファーストの観点
   - ユーザー体験の最適化

2. **アルバム選択の実装**: アルバムから写真を選ぶ機能を実装する場合、どのような方法が最適か？
   - HTML5 File APIの`capture`属性なしでの実装
   - モバイルブラウザ（iOS Safari、Chrome Mobile）での動作確認
   - 既存の写真解析機能との統合

3. **アクションシート/ボトムシートの実装**: PWAでアクションシート/ボトムシートを実装する場合、どのような方法が最適か？
   - カスタムコンポーネントの作成
   - ライブラリの利用（Headless UI、Radix UIなど）
   - モバイルブラウザでの動作確認
   - 既存のデザイン原則との整合性

4. **自動検出の実装**: バーコードの自動検出を実装する場合、どのような技術を使うべきか？
   - Web API（BarcodeDetector API）の利用可否
   - ライブラリの推奨（QuaggaJS、ZXingなど）
   - パフォーマンスの最適化方法
   - iOS Safariでの動作（BarcodeDetector APIは利用不可）

5. **UXの最適化**: ユーザー体験を最適化するために、どのような工夫ができるか？
   - ローディング表示の改善
   - エラーハンドリングの強化
   - フィードバックの提供
   - 操作の流れの最適化

6. **他アプリのパターン**: 他アプリ（MyFitnessPal、Lifesum、Noomなど）のパターンを参考に、さらに改善できる点はあるか？
   - 既存の決定事項との整合性
   - デザイン原則との整合性
   - ユーザー体験の最適化

7. **実装の優先順位**: 実装の優先順位はどうすべきか？
   - Phase 1: アクションシート/ボトムシートの実装（アルバム選択を含む）
   - Phase 2: 自動検出機能の追加
   - Phase 3: UXの最適化

8. **整合性チェック**: 既存の決定事項、デザイン原則、技術スタックとの整合性をチェックし、推奨実装方法を提示してください。

---

## 📤 期待する出力

1. **推奨実装方法**: 選択肢A-Eのうち、どれを選ぶべきか、理由とともに
2. **技術的な実装方法**: 具体的なコード例やライブラリの推奨
3. **UI/UX設計**: アクションシート/ボトムシートのデザイン案
4. **アルバム選択の実装**: アルバムから写真を選ぶ機能の実装方法
5. **実装の優先順位**: Phase 1-3の具体的な実装内容
6. **他アプリとの比較**: 他アプリのパターンを参考にした改善案
7. **整合性チェック**: 既存の決定事項、デザイン原則、技術スタックとの整合性チェック結果
8. **推論**: ユーザー体験、パフォーマンス、保守性などの観点からの推論

---

## 📚 補足情報

### 関連ファイル
- [`src/screens/HomeScreen.tsx`](primal-logic-app/primal-logic-web/src/screens/HomeScreen.tsx): 現在の実装（917-1008行目）
- [`src/components/BarcodeScannerModal.tsx`](primal-logic-app/primal-logic-web/src/components/BarcodeScannerModal.tsx): バーコード読み取りコンポーネント
- [`src/components/PhotoAnalysisModal.tsx`](primal-logic-app/primal-logic-web/src/components/PhotoAnalysisModal.tsx): 写真解析コンポーネント
- [`src/utils/barcodeScanner.ts`](primal-logic-app/primal-logic-web/src/utils/barcodeScanner.ts): バーコード読み取りユーティリティ
- [`src/services/aiService.ts`](primal-logic-app/primal-logic-web/src/services/aiService.ts): AIサービス（写真解析）
- [`FEATURE_INTENTS.md`](primal-logic-app/primal-logic-web/FEATURE_INTENTS.md): 機能の意図と目的
- [`README.md`](primal-logic-app/primal-logic-web/README.md): プロジェクト概要

### 参考資料
- [Web BarcodeDetector API](https://developer.mozilla.org/en-US/docs/Web/API/BarcodeDetector)
- [QuaggaJS - Barcode Scanner](https://github.com/serratus/quaggaJS)
- [ZXing - Multi-format 1D/2D barcode image processing library](https://github.com/zxing/zxing)
- [HTML5 File API](https://developer.mozilla.org/en-US/docs/Web/API/File_API)

---

## 🎯 プロンプト送信時の注意

このプロンプトをGeminiに送る際は、以下を追加：
- 「余計なくらい情報を送りたい」という要望
- アイデア創造56技法を使った検討を希望
- 複数の選択肢を提示し、推奨順で上から並べる
- 技術的な実装方法も具体的に提示する
- **整合性チェックと推論を必ず行う**

---

**重要**: このプロンプトは、アプリのことを全く知らない前提で作成されています。包括的な情報を提供し、整合性チェックと推論を行ってください。


