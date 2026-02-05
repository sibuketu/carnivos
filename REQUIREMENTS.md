# Primal Logic App - Requirements Definition (要件定義書)

## 1. Project Vision (コンセプト)
**"Hack Your Body with Logic"**
感情や習慣に頼らず、論理（ロジック）とデータに基づいて肉体改造（カーニボアダイエット）を行うアプリ。
ユーザーの「空腹感」や「気分のムラ」さえも、栄養素（ミネラル、脂質不足）のエラーシグナルとして捉え、論理的な解決策（ソリューション）を提供する。

## 2. Core Features (コア機能)

### 2.1 Dashboard (ホーム画面) - "Bio-Controller"
**要件**:
- ナビゲーションバーは下部に**4つ**のボタン（Home, History, Others + AI Action）。
  - ※オンボーディングや認証画面では非表示にすること。
- **Nutrient Gauges (栄養素ゲージ)**:
  - **Daily**: 毎日リセット。必須ミネラル（Mg, K, Na）とP:Fバランス。
  - **Storage**: 長期蓄積型（Fe, B12, VitA）。「あと何日で枯渇するか」での管理。
  - ゲージのデザインは統一する（ミニゲージもメインゲージと同じスタイル）。
- **Photo Analysis Button**:
  - 画面下部中央、または操作しやすい位置に配置。他の要素と被らないこと。
  
### 2.2 Photo Analysis (写真解析) - "Nutrient Scanner"
**要件**:
- カメラ起動はブラウザ標準機能（`<input type="file" capture>`）を使用。
- **解析結果画面**:
  - 提示された栄養素が「現在の摂取量」に対して「どれだけ積み上がるか」を視覚化すること（Before/Afterグラフ）。
  - 既存のゲージシステムとデザインを完全に一致させる。
  - ユーザーが重量や品目を修正したら、即座にゲージに反映。

### 2.3 Butcher Select (食材選択) - "Resource Market"
- 写真がない場合の食材入力。
- スーパーの肉売り場のようなビジュアル。

### 2.4 Onboarding (オンボーディング)
**要件**:
- 初回起動時のみ表示。
- 完了するまで他の画面（ホーム等）には遷移させない（タブバーも隠す）。
- 身体データ入力後、即座にパーソナライズされた目標値（ロジック）を提示。

## 3. Technical Requirements (技術要件)
- **Frontend**: React, Vite, TailwindCSS
- **Backend**: Supabase
- **Security**: 
  - APIキーや秘密鍵（`.key`, `.pem`等）は絶対にリポジトリにコミットしない。
  - `.gitignore` にこれらを明記する。

## 4. UI/UX Philosophy (デザイン哲学)
- **Pixel Art & Cyberpunk**:
  - テキストは読みやすく、かつ「端末」っぽさを出す。
  - アニメーションはキビキビとさせる（もっさりさせない）。
- **Unified Experience**:
  - 「写真解析のゲージ」と「ホームのゲージ」が別物に見えてはいけない。同じデザイン言語を使う。

## 5. Idea Backlog (アイデア保管庫)
- **Logic Shield**: 特定の栄養素やサプリを「防御壁」として可視化。
- **Body Map**: 不調部位をタップすると、不足栄養素を表示。
