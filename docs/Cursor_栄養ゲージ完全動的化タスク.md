# 栄養ゲージ完全動的化タスク（Cursor実装用）

**問題**: 現在の`getCarnivoreTargets()`はUserProfileの静的設定のみを使用。**日記で記録する内容（DailyStatus）が栄養目標値に反映されていない**。

**目標**: 日記で記録した全項目を使い、**その日ごとに栄養目標値を動的計算**

---

## 現状の問題

### UserProfile vs DailyStatus

**UserProfile** (静的設定 - オンボーディング時に一度設定):
- gender, age, weight, activityLevel
- exerciseIntensity, exerciseFrequency
- thyroidFunction, stressLevel, sleepHours
- etc... (一度設定したら変わらない)

**DailyStatus** (動的記録 - 毎日記録):
- sleepHours, sleepScore, deepSleep, awakeCount
- mood, anxiety, focus, brainFog
- energyLevel, physicalFatigue, muscleSoreness
- jointPain, headache, bowelMovement
- weight, bodyFatPercentage, heartRate, bloodPressure
- weather, sunMinutes, coldExposureMinutes, saunaMinutes
- fastingHours, glucose, ketones
- etc... (毎日変わる)

### 現状
`getCarnivoreTargets()` は **UserProfileのみ** を使用
→ 日記で「今日は頭痛がひどい（headache=8）」と記録しても、**その日のマグネシウム目標値が上がらない**

---

## 実装すべき動的計算ロジック

### 1. 睡眠の質 → マグネシウム・ビタミンD

```typescript
// DailyStatusから
if (dailyStatus.sleepScore < 50) magnesiumFactor *= 1.4;
else if (dailyStatus.sleepScore < 70) magnesiumFactor *= 1.2;

if (dailyStatus.deepSleep < 60) magnesiumFactor *= 1.3; // 深い睡眠60分未満
if (dailyStatus.awakeCount > 3) magnesiumFactor *= 1.2; // 中途覚醒3回以上
if (dailyStatus.sleepLatency > 30) magnesiumFactor *= 1.15; // 入眠30分以上
```

### 2. 頭痛・筋肉痛・関節痛 → マグネシウム・オメガ3

```typescript
// 頭痛 → マグネシウム
if (dailyStatus.headache >= 7) magnesiumFactor *= 1.5;
else if (dailyStatus.headache >= 4) magnesiumFactor *= 1.3;

// 関節痛 → オメガ3、マグネシウム
if (dailyStatus.jointPain >= 7) {
  omega3Factor *= 1.4;
  magnesiumFactor *= 1.2;
} else if (dailyStatus.jointPain >= 4) {
  omega3Factor *= 1.2;
}

// 筋肉痛 → タンパク質、マグネシウム（運動後の回復）
if (dailyStatus.muscleSoreness >= 7) {
  proteinFactor *= 1.3;
  magnesiumFactor *= 1.2;
} else if (dailyStatus.muscleSoreness >= 4) {
  proteinFactor *= 1.15;
}
```

### 3. メンタル状態 → マグネシウム・ビタミンD・オメガ3

```typescript
// mood → mentalHealthStatus変換
let mentalHealthFromMood: 'good' | 'moderate' | 'poor';
if (dailyStatus.mood === 'great' || dailyStatus.mood === 'good') {
  mentalHealthFromMood = 'good';
} else if (dailyStatus.mood === 'neutral') {
  mentalHealthFromMood = 'moderate';
} else {
  mentalHealthFromMood = 'poor';
}

// anxiety, depression → マグネシウム、オメガ3
if (dailyStatus.anxiety >= 7 || dailyStatus.depression >= 7) {
  magnesiumFactor *= 1.4;
  omega3Factor *= 1.3;
  vitaminDFactor *= 1.2;
} else if (dailyStatus.anxiety >= 4 || dailyStatus.depression >= 4) {
  magnesiumFactor *= 1.2;
  omega3Factor *= 1.15;
}

// brainFog, focus → DHA/EPA（オメガ3）、タンパク質
if (dailyStatus.brainFog >= 7 || (dailyStatus.focus && dailyStatus.focus <= 3)) {
  omega3Factor *= 1.3;
  proteinFactor *= 1.1;
}
```

### 4. エネルギー・疲労 → タンパク質・脂質・電解質

```typescript
// energyLevel低 → タンパク質・脂質・鉄分
if (dailyStatus.energyLevel <= 3) {
  proteinFactor *= 1.2;
  fatFactor *= 1.2;
  ironFactor *= 1.3;
  magnesiumFactor *= 1.3;
} else if (dailyStatus.energyLevel <= 5) {
  proteinFactor *= 1.1;
  ironFactor *= 1.15;
}

// physicalFatigue高 → 同上
if (dailyStatus.physicalFatigue >= 7) {
  proteinFactor *= 1.2;
  ironFactor *= 1.3;
}
```

### 5. 排便状態 → 電解質・消化吸収

```typescript
// bowelMovement → 電解質・消化問題
if (dailyStatus.bowelMovement) {
  if (dailyStatus.bowelMovement.status === 'constipated') {
    magnesiumFactor *= 1.4; // 便秘はMg不足の典型症状
    potassiumFactor *= 1.2;
    digestiveIssuesFlag = true;
  } else if (dailyStatus.bowelMovement.status === 'watery' || dailyStatus.bowelMovement.status === 'loose') {
    sodiumFactor *= 1.4; // 下痢でNa喪失
    potassiumFactor *= 1.3;
    zincFactor *= 1.3; // 吸収不良
    ironFactor *= 1.3;
    digestiveIssuesFlag = true;
  }
}

// bloating → 消化問題
if (dailyStatus.bloating >= 7) {
  digestiveIssuesFlag = true;
  zincFactor *= 1.2;
}
```

### 6. 体重・体組成（日次） → タンパク質・脂質

```typescript
// 日記で記録した体重を優先（UserProfileの体重より優先）
const currentWeight = dailyStatus.weight ?? userProfile.weight ?? 70;
proteinBase = currentWeight * 1.6;
fatBase = proteinBase * 1.2;

// bodyFatPercentage → LBMベース計算
if (dailyStatus.bodyFatPercentage) {
  const leanBodyMass = currentWeight * (1 - dailyStatus.bodyFatPercentage / 100);
  proteinBase = leanBodyMass * 2.0; // LBMベースは2.0g/kg
}
```

### 7. 心拍・血圧 → 電解質

```typescript
// heartRate → マグネシウム・カリウム
if (dailyStatus.heartRate) {
  if (dailyStatus.heartRate > 80) {
    magnesiumFactor *= 1.3;
    potassiumFactor *= 1.2;
  } else if (dailyStatus.heartRate < 50) {
    // 低心拍はアスリートか甲状腺機能低下
    // 判断難しいため係数調整なし or 軽度減
  }
}

// 血圧 → ナトリウム・カリウム・マグネシウム
if (dailyStatus.systolicBloodPressure && dailyStatus.diastolicBloodPressure) {
  if (dailyStatus.systolicBloodPressure > 140 || dailyStatus.diastolicBloodPressure > 90) {
    // 高血圧 → Na/K比重視、Mg増
    sodiumFactor *= 0.9; // やや控える
    potassiumFactor *= 1.3;
    magnesiumFactor *= 1.3;
  } else if (dailyStatus.systolicBloodPressure < 100) {
    // 低血圧 → Na増
    sodiumFactor *= 1.3;
  }
}
```

### 8. 天気・日光 → ビタミンD

```typescript
// weather + sunMinutes → ビタミンD
let vitaminDWeatherFactor = 1;
if (dailyStatus.weather === 'sunny' && dailyStatus.sunMinutes >= 30) {
  vitaminDWeatherFactor = 0.5; // 十分なUVB
} else if (dailyStatus.weather === 'cloudy' && dailyStatus.sunMinutes >= 20) {
  vitaminDWeatherFactor = 0.8; // 曇りで50%減
} else if (dailyStatus.weather === 'rainy' || dailyStatus.sunMinutes < 10) {
  vitaminDWeatherFactor = 1.5; // ほぼUVBなし
}
```

### 9. 冷水・サウナ・瞑想 → ストレス・電解質

```typescript
// coldExposureMinutes → 代謝上昇、脂質・タンパク質増
if (dailyStatus.coldExposureMinutes >= 10) {
  proteinFactor *= 1.1;
  fatFactor *= 1.15;
}

// saunaMinutes → ナトリウム・マグネシウム喪失
if (dailyStatus.saunaMinutes >= 20) {
  sodiumFactor *= 1.3;
  magnesiumFactor *= 1.2;
}

// meditationMinutes → ストレス軽減
if (dailyStatus.meditationMinutes >= 20) {
  magnesiumStressFactor *= 0.9; // ストレス軽減でMg必要量減
}
```

### 10. 断食・血糖・ケトン → 電解質・代謝

```typescript
// fastingHours → ナトリウム排出増加
if (dailyStatus.fastingHours >= 16) {
  sodiumFactor *= 1.3;
  potassiumFactor *= 1.2;
}

// glucose → インスリン感受性の指標
if (dailyStatus.glucose) {
  if (dailyStatus.glucose > 100) {
    // 高血糖 → インスリン抵抗性 → Mg消費増
    magnesiumFactor *= 1.3;
  } else if (dailyStatus.glucose < 70) {
    // 低血糖 → 副腎疲労疑い → Na増
    sodiumFactor *= 1.4;
  }
}

// ketones → ケトーシス状態 → 電解質排出増
if (dailyStatus.ketones >= 1.5) {
  sodiumFactor *= 1.3;
  magnesiumFactor *= 1.2;
}
```

### 11. 肌・リビドー → ホルモン・栄養状態

```typescript
// skinCondition → ビタミンA・亜鉛・オメガ3
if (dailyStatus.skinCondition === 'acne' || dailyStatus.skinCondition === 'rash') {
  vitaminAFactor *= 1.3;
  zincFactor *= 1.3;
  omega3Factor *= 1.2;
} else if (dailyStatus.skinCondition === 'dry') {
  fatFactor *= 1.2;
  omega3Factor *= 1.2;
}

// libido → 亜鉛・タンパク質・脂質
if (dailyStatus.libido <= 3) {
  zincFactor *= 1.4;
  proteinFactor *= 1.2;
  fatFactor *= 1.2;
}
```

### 12. 社交・孤独感 → メンタルヘルス

```typescript
// loneliness, socialSatisfaction → メンタルヘルス → Mg, VitD
if (dailyStatus.loneliness >= 7 || (dailyStatus.socialSatisfaction && dailyStatus.socialSatisfaction <= 3)) {
  magnesiumFactor *= 1.2;
  vitaminDFactor *= 1.15;
}
```

---

## 実装場所

### 新規ファイル作成
`src/data/dynamicNutrientCalculator.ts`

```typescript
import type { DailyStatus } from '../types';
import type { CarnivoreTarget } from './carnivoreTargets';
import { getCarnivoreTargets } from './carnivoreTargets';

/**
 * DailyStatusから動的に栄養目標値を計算
 * UserProfileの静的設定 + その日のDailyStatusで調整
 */
export function getDynamicNutrientTargets(
  userProfile: UserProfile,
  dailyStatus: DailyStatus
): CarnivoreTarget {
  // 1. UserProfileからベース目標値取得
  const baseTargets = getCarnivoreTargets(
    userProfile.gender,
    userProfile.age,
    // ... 既存のパラメータ全て
  );

  // 2. DailyStatusから係数計算
  let magnesiumFactor = 1;
  let proteinFactor = 1;
  let fatFactor = 1;
  let sodiumFactor = 1;
  let potassiumFactor = 1;
  let zincFactor = 1;
  let ironFactor = 1;
  let vitaminDFactor = 1;
  let omega3Factor = 1;
  // ... etc

  // 3. 上記の全ロジック実装

  // 4. 係数を適用して最終目標値を返す
  return {
    ...baseTargets,
    magnesium: Math.round(baseTargets.magnesium * magnesiumFactor),
    protein: Math.round(baseTargets.protein * proteinFactor),
    fat: Math.round(baseTargets.fat * fatFactor),
    sodium: Math.round(baseTargets.sodium * sodiumFactor),
    potassium: Math.round(baseTargets.potassium * potassiumFactor),
    zinc: Math.round(baseTargets.zinc * zincFactor),
    iron: Math.round(baseTargets.iron * ironFactor),
    vitamin_d: Math.round(baseTargets.vitamin_d * vitaminDFactor),
    // omega3は別途追加が必要
  };
}
```

### 使用箇所を変更

**HomeScreen.tsx**:
```typescript
// Before
const targets = getCarnivoreTargets(userProfile...);

// After
import { getDynamicNutrientTargets } from '../data/dynamicNutrientCalculator';
const targets = getDynamicNutrientTargets(userProfile, todayLog?.status);
```

**ButcherSelect.tsx**:
```typescript
// props経由で動的目標値を受け取る（既存の問題も同時解決）
interface ButcherSelectProps {
  dynamicTargets: CarnivoreTarget; // HomeScreenから渡される
  // ...
}
```

---

## 追加で必要な実装

### 運動項目をDailyStatusに追加

**src/types/index.ts** の `DailyStatus` に追加:
```typescript
export interface DailyStatus {
  // ... 既存項目

  // 運動（追加）
  exerciseMinutes?: number; // 運動時間（分）
  exerciseIntensity?: 'none' | 'light' | 'moderate' | 'intense'; // 運動強度
  exerciseType?: string; // 運動種類（ウェイト、ランニング、等）
}
```

**DiaryScreen.tsx** の `METRICS` に追加:
```typescript
{ id: 'exerciseMinutes', label: 'Exercise time', type: 'number', unit: 'min', category: 'physical' },
{ id: 'exerciseIntensity', label: 'Exercise intensity', type: 'select', options: ['none', 'light', 'moderate', 'intense'], category: 'physical' },
```

---

## 実装順序

1. **運動項目追加**（types/index.ts, DiaryScreen.tsx）- 10分
2. **dynamicNutrientCalculator.ts 作成**（全ロジック実装）- 2時間
3. **HomeScreen.tsx 変更**（getDynamicNutrientTargets使用）- 10分
4. **ButcherSelect.tsx 修正**（dynamicTargets propsで受け取る）- 30分
5. **テスト**（日記で様々な値を入力して目標値が変わることを確認）- 30分

**合計**: 約3時間

---

## 注意事項

- 型安全性維持（`any`禁止）
- 既存機能を壊さない
- DailyStatusが未記録の場合はUserProfileのみで計算（後方互換性）
- 係数の積が過度に大きくならないよう上限設定（例: 最大2.0倍まで）

---

## 期待される効果

- 日記で「今日は頭痛8」→ その日のマグネシウム目標値が1.5倍に上昇
- 日記で「今日は筋肉痛9」→ その日のタンパク質目標値が1.3倍に上昇
- 日記で「今日は便秘」→ その日のマグネシウム目標値が1.4倍に上昇
- 日記で「今日はサウナ30分」→ その日のナトリウム目標値が1.3倍に上昇
- **真の意味での動的栄養計算の実現**
