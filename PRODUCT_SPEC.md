# Primal Logic App - Product Specification (製品企画書)

## 0. Core Philosophy (設計思想)
**"Logic Over Emotion"**
感情、習慣、伝統、「なんとなく」を排除し、生理学的なロジックのみに基づいて「食」と「体」を制御する。
アプリは「管理ツール」ではなく、ユーザーの脳（ロジック）を拡張する「外部デバイス」として機能する。

## 1. Concept Store (アイデア保管庫)

### 1.1 "Bio-Controller" (ホーム画面)
身体を機械（Machine）として捉え、コックピットのような操作感を提供する。
- **Nutrient Mechanics**:
  - 「カロリー」という概念は捨てる。
  - **Storage (備蓄)**: ビタミンA, D, B12, 鉄。これらは「バッテリー残量」として管理。
  - **Daily Fuel (燃料)**: タンパク質, 脂質, 電解質。これらは「日々の消費燃料」として管理。
- **Status Effects (状態異常)**:
  - ゲームのようにステータス異常（Debuff）を表示。
  - 例: "Low Magnesium" → Status: **[Irritable]** (イライラ)
  - 例: "Low Sodium" → Status: **[Headache]** (頭痛)

### 1.2 "Nutrient Scanner" (写真解析)
ただの記録ツールではなく、「物質解析器」としての体験。
- **Visual Feedback**:
  - 解析結果は、現在のゲージに対して「どれだけチャージされるか」を可視化（充電アニメーションのような表現）。
  - 不足している栄養素があれば、「警告」ではなく「推奨（Recommendation）」として、具体的な食材（例：バター、塩）の追加を促す。

### 1.3 "Logic Shield" (防御壁システム)
有害物質（植物性毒素、糖質）からの防御を可視化。
- **Shield Strength**: 腸内環境や代謝柔軟性を「シールド」として表現。
- **Damage Log**: 違反（Cheat）をした場合、どのシールドが何％損傷したかを計算し、修復ロジック（断食時間など）を提示。

### 1.4 "Quest System" (行動誘導)
健康管理を「タスク」ではなく「クエスト」にする。
- **Daily Quests**:
  - "Absorb Sun" (日光浴 15分) → Reward: Vitamin D Charge
  - "Refill Electrolytes" (塩水摂取) → Reward: Mental Clarity Buff

### 1.5 "Body Map" (3D生体マップ)
- 自分のアバター（3Dモデル）を表示。
- 不調な部位（頭、胃、筋肉）をタップすると、関連する不足栄養素と解決策が表示される。

## 2. Requirements Definition (要件定義 - 自然言語)

### 2.1 ナビゲーションと構造 (Navigation)
- **4-Tab Structure**:
  - **Main**: コックピット（ゲージ管理）。
  - **Market**: 食材選択（写真がない場合）。
  - **Log**: 過去のデータ、分析。
  - **Action**: AIとの対話、クエスト確認。
- **Mode Switching**:
  - **Onboarding Mode**: 初回起動時。余計な情報は一切遮断し、入力のみに集中させる「没入モード」。
  - **Standard Mode**: 通常の操作モード。

### 2.2 栄養管理ロジック (Nutrient Logic)
- **Base Logic**: カーニボア（動物性食品のみ）を基本とする。
- **Targeting**:
  - ユーザーの不調（Input）に合わせて、ターゲット（Output）を自動調整する。
  - 例：生理中の女性 → 鉄分ターゲット自動上昇。
  - 例：ストレス高 → マグネシウムターゲット自動上昇。

### 2.3 開発・運用ルール (Dev Rules)
- **Security**: 鍵情報は絶対に表に出さない。
- **UI Consistency**: 全画面で統一された「Cyberpunk / Pixel」テーマを維持。

---
*このファイルは「アプリの全アイデア・仕様」を保存するマスターファイルです。機能追加や変更がある場合は、まずこのファイルを更新し、合意形成を行ってからコードに着手します。*
