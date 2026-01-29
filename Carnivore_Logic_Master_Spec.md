# 🥩 Carnivore Logic: Master Specification

> **Mission:** Transform from "Tracker" to "Optimizer".

> **Persona:** "The Logic Seeker" (論理的探求者)

---

## 1. Core Concept & Differentiation

- **Logic over Calorie:** カロリー計算ではなく、ホルモンと栄養素のロジックで体をハックする。

- **Dynamic Optimization:** 天気・体調・活動量に応じて、その日の摂取目標（Target）が自動変動する。

- **Frictionless Input:** 「キーボード入力」を排除。解剖図タップと履歴活用で3秒で完了。

---

## 2. Features to "Steal" & "Crush"

| Feature | Source | Implementation Strategy |
| :--- | :--- | :--- |
| **P:F Ratio** | Vore | ホーム画面の最上部にゲージとして常時表示。 |
| **History Copy** | Cronometer | 「いつもの（My Foods）」タブを作成。ワンタップ入力。 |
| **Micronutrients** | Cronometer | Mg, Zn, Vitamin Dなどを裏で計算し、不足時のみ警告。 |
| **Adaptation** | (None) | **独自機能:** 移行期ユーザーに対し、塩分増量をプッシュ通知。 |

---

## 3. UI/UX Specifications

### A. The Interactive Butcher (Input)

- **Visual:** 牛・豚・鶏の解剖図（SVG）を使用。

- **Unit:** グラム入力は「微調整」のみ。基本は「スライダー」や「見た目プリセット（ステーキ1枚など）」。

- **Range Display:** 栄養素は「100~130g」のような幅（Range）として保持するが、メイン画面では中央値のみシンプルに表示する。

### B. Logic Matrix (Optimization Engine)

以下のトリガーにより、栄養ターゲットを自動補正する。

| Trigger | Condition | Action (Target Adjustment) |
| :--- | :--- | :--- |
| **Environment** | 気温 < 10℃ | 脂質(Fuel) +15% (熱産生需要) |
| **Environment** | 日照不足 (天気API) | ビタミンD +目標増 |
| **Activity** | 運動強度: High | 脂質(Fuel) +20%, Mg +50mg |
| **Physiology** | 生理 / 出血 | 鉄分(Fe) +目標増, 脂質 +10% |
| **Diet** | カフェイン摂取 | Mg +20mg/杯 (排出分補填) |

### C. AI Concierge (Interview)

- 写真アップ時、AIは単に記録するのではなく「不足情報」を聞き出す。

- **Question:** 「塩は振りましたか？（デフォルト: ぬちまーす）」「脂身は残しましたか？」

- **Loadout:** ユーザー設定で「いつもの塩」を登録済みなら質問をスキップ。

---

## 4. Tech Stack & Data

- **Frontend:** React, Vite, Tailwind CSS

- **Data:** Local Storage (Privacy First)

- **API:** OpenWeatherMap (Free Tier) for Environment Logic.

---

## 5. Implementation Steps

1. **Core UI:** 解剖図と履歴タブの実装。
2. **Database:** "Fuzzy Data"（幅のある栄養データ）の構築。
3. **Logic Engine:** 天気・体調による係数計算ロジックの実装。
4. **AI Integration:** 写真解析とインタビュープロンプトの実装。

---

## 6. Data Structure (Fuzzy Data)

栄養素データは「幅（Range）」として保持する。

```typescript
interface NutrientRange {
  min: number;
  max: number;
  typical: number; // 中央値（表示用）
}

interface FoodData {
  // ... existing fields ...
  nutrientsRaw: {
    protein: NutrientRange; // 例: { min: 20, max: 24, typical: 22 }
    fat: NutrientRange;
    // ...
  };
}
```

---

## 7. P:F Ratio (Protein:Fat Ratio)

ホーム画面の最上部に常時表示。

- **計算式:** `P:F = タンパク質(g) / 脂質(g)`
- **推奨範囲:** 1:1 ~ 1:2 (カーニボア推奨)
- **表示:** ゲージ形式で視覚化

---

## 8. History Copy ("いつもの" タブ)

- 過去に最も入力回数が多い食品を「いつもの」として表示
- ワンタップで入力完了（デフォルト量で自動追加）

---

## 9. Dynamic Optimization Logic

### 環境要因

```typescript
function adjustTargetsByEnvironment(
  baseTargets: NutrientTargets,
  weather: WeatherData
): NutrientTargets {
  if (weather.temperature < 10) {
    return {
      ...baseTargets,
      fat: baseTargets.fat * 1.15, // +15%
    };
  }
  
  if (weather.sunHours < 2) {
    return {
      ...baseTargets,
      vitaminD: baseTargets.vitaminD * 1.2, // +20%
    };
  }
  
  return baseTargets;
}
```

### 活動要因

```typescript
function adjustTargetsByActivity(
  baseTargets: NutrientTargets,
  activityLevel: 'high' | 'moderate' | 'low'
): NutrientTargets {
  if (activityLevel === 'high') {
    return {
      ...baseTargets,
      fat: baseTargets.fat * 1.2, // +20%
      magnesium: baseTargets.magnesium + 50, // +50mg
    };
  }
  
  return baseTargets;
}
```

### 生理要因

```typescript
function adjustTargetsByPhysiology(
  baseTargets: NutrientTargets,
  userProfile: UserProfile
): NutrientTargets {
  if (userProfile.gender === 'female' && userProfile.menstrualCycle?.isActive) {
    return {
      ...baseTargets,
      iron: baseTargets.iron * 1.3, // +30%
      fat: baseTargets.fat * 1.1, // +10%
    };
  }
  
  return baseTargets;
}
```

---

## 10. AI Concierge Interview Flow

1. ユーザーが写真をアップロード
2. AIが食品を識別
3. AIが不足情報を質問:
   - 「塩は振りましたか？（デフォルト: ぬちまーす）」
   - 「脂身は残しましたか？」
   - 「調理方法は？（生/焼く/煮る）」
4. ユーザーが回答（またはデフォルトを選択）
5. 記録完了

---

## 11. Implementation Status

### Core UI
- ✅ Interactive Butcher (SVG解剖図)
- ✅ History Screen
- ✅ P:F Ratio ゲージ
- ⏳ "いつもの" タブ

### Logic Engine
- ⏳ Dynamic Optimization (環境・活動・生理要因)
- ⏳ Fuzzy Data (栄養素の幅)
- ⏳ Weather API 統合

### AI Integration
- ✅ 写真解析
- ✅ Interview Flow
- ⏳ Loadout (ユーザー設定)

---

## 12. OpenWeatherMap API Integration

### 環境変数

```env
VITE_WEATHER_API_KEY=your-api-key-here
```

### 使用例

```typescript
async function getWeatherData(lat: number, lon: number) {
  const response = await fetch(
    `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${VITE_WEATHER_API_KEY}&units=metric`
  );
  const data = await response.json();
  return {
    temperature: data.main.temp,
    sunHours: calculateSunHours(data), // 実装必要
  };
}
```

---

**この仕様書は、Cursorが実装する際の「言い訳できない形」の要件定義です。**

