# Cursor 実装指示書（完全版）

**作成日**: 2026-02-05
**対象**: CarnivOS (Primal Logic) v1.0 → v2.0
**目的**: Cursorがコピペで実装できる詳細レベルの指示書

---

## 0. ユーザーフィードバック反映事項

### 実装してOK（確定）
- **ROI点数ラベル**: 金ないけどCarnivoreしたい人向けに実装
- **RecipeScreen**: 削除ではなく、野菜検索等は残す形で実装
- **カルマゲージ**: ビーガンが見たら面白そう → 実装

### 削除（不採用）
- **PrimalBonfire**: 削除（本人も知らない）
- **専門家相談データ**: 削除（知らない）
- **MoltBook/OpenClaw**: 削除（Cursorの伝達ミス）

### 時間軸のルール
- 「明日」「〇週間」等の細かい時間軸は不要
- 「リリース後」くらいの粒度のみ使用

---

## 1. 実装優先度と時期

### P0: v1.0必須（リリース前）

| ID | 機能名 | 実装時間 | 理由 |
|----|--------|----------|------|
| A1 | 栄養ゲージ完全動的化 | 3時間 | コア価値。DailyStatusと連動しないと日記機能の意味が半減 |
| A2 | ButcherSelect動的目標値対応 | 1時間 | A1の依存機能 |
| B1 | 水分管理機能 | 4時間 | カーニボアでは電解質バランスに直結 |
| B2 | 電解質バランス表示 | 2時間 | カーニボア特有の価値 |
| C1 | 写真解析フォローアップ | 3時間 | 解析精度向上に不可欠 |
| C4 | バーコードモバイル対応 | 1日 | 現状「非対応」で使えない |
| H1 | 断食タイマー通知実装 | 4時間 | 実用性向上 |
| S1 | Supabase RLS実装 | 2時間 | セキュリティ必須 |

### P1: リリース直後

| ID | 機能名 | 実装時間 |
|----|--------|----------|
| B3 | 肉からの水分自動計算 | 4時間 |
| C2 | 写真解析中のTips表示 | 2時間 |
| C3 | 写真解析速度改善 | 1週間 |
| D1 | 外出時間帯記録 | 2時間 |
| D2 | 天気連携自動取得 | 3時間 |
| E1 | 3モードによるUI分け | 1週間 |
| E2 | 機能紹介強化 | 1日 |
| E4 | AI説明形式改善 | 2時間 |
| F1 | 部位最適化アドバイス強化 | 1週間 |
| G1 | グラスフェッド区分 | 1週間 |
| H2 | 断食タイマーデフォルト時間 | 2時間 |
| I1 | トロフィー機能 | 1週間 |

### P2: リリース後（短期）

| ID | 機能名 | 実装時間 |
|----|--------|----------|
| A3 | 複雑な計算式実装 | 2週間 |
| A4 | 貯蔵量の実計算 | 1週間 |
| E5 | 食品おすすめ機能 | 1週間 |
| F2 | メニュー生成機能 | 2-3週間 |
| F3 | ブラックアウト食材 | 3日 |
| F4 | 満足度記録・遵守率 | 3日 |
| H3 | 断食タイマーテンプレート | 3日 |
| I2 | フィードバックご褒美 | 1週間 |
| J1 | If-Then Rules表示 | 3日 |
| J2 | ルール作成UI | 2週間 |
| J3 | リカバリープロトコル | 1週間 |
| K1 | カルマゲージ（Meat Gauge） | 3日 |
| C5 | スーパーマーケット・スキャナー | 2週間 |
| L1 | Community機能 | 4週間 |
| L2 | インサイト・パターン分析 | 2週間 |
| D3 | VitD精緻化 | 1週間 |
| E3 | Chat-First Operation | 2-3週間 |
| R1 | Tipsカテゴリ機能 | 3日 |
| U1 | ROI点数ラベル | 1週間 |
| U2 | RecipeScreen改善 | 1週間 |

### P3: リリース後（中長期）

| ID | 機能名 | 実装時間 |
|----|--------|----------|
| M1 | Apple Watch連携 | 2週間 |
| M2 | Google Fit連携 | 2週間 |
| M3 | 体重計連携 | 2週間 |
| M4 | 睡眠トラッキング連携 | 1週間 |
| N1-N3 | Widget各種 | 各1週間 |
| P1 | 音声精度向上 | 2週間 |
| P2 | カーニボア用語辞書 | 1週間 |
| G2 | 狩猟・屠殺・熟成トラッキング | 1ヶ月+ |
| O2 | フランス対応 | 1週間 |

---

## 2. P0機能の詳細実装仕様

### A1: 栄養ゲージ完全動的化（DailyStatus連携）

#### 目的
日記データ（DailyStatus）に基づいて、栄養目標値を動的に計算する。

#### 現状の問題
- 現在はUserProfileの静的データのみで目標値を計算
- 日記で「体調不良」「激しい運動」等を記録しても目標値が変わらない

#### 実装詳細

**1. データ構造（型定義）**

ファイル: `src/types/index.ts`

```typescript
export interface DailyStatus {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD

  // 体調・生活状況
  sleepQuality: 'poor' | 'fair' | 'good' | 'excellent';
  sleepHours: number; // 0-24
  stressLevel: 'low' | 'moderate' | 'high';
  exerciseIntensity: 'none' | 'light' | 'moderate' | 'intense';
  exerciseDuration: number; // minutes

  // 女性特有
  menstrualPhase?: 'follicular' | 'ovulation' | 'luteal' | 'menstrual';

  // 体調不良
  symptoms?: string[]; // ['headache', 'fatigue', 'digestive']

  // メモ
  notes?: string;

  // タイムスタンプ
  createdAt: string;
  updatedAt: string;
}
```

**2. 計算ロジック**

ファイル: `src/utils/dynamicTargetCalculator.ts`（新規作成）

```typescript
import { UserProfile, DailyStatus } from '../types';
import { getCarnivoreTargets } from '../data/carnivoreTargets';

export interface NutrientModifiers {
  protein: number; // 乗算係数（1.0 = 変化なし）
  fat: number;
  sodium: number;
  potassium: number;
  magnesium: number;
  zinc: number;
  iron: number;
  vitaminA: number;
  vitaminD: number;
  vitaminB12: number;
  omega3: number;
  water: number;
}

/**
 * DailyStatusに基づいて栄養素の補正係数を計算
 */
export function calculateModifiers(
  dailyStatus: DailyStatus | null,
  userProfile: UserProfile
): NutrientModifiers {
  const modifiers: NutrientModifiers = {
    protein: 1.0,
    fat: 1.0,
    sodium: 1.0,
    potassium: 1.0,
    magnesium: 1.0,
    zinc: 1.0,
    iron: 1.0,
    vitaminA: 1.0,
    vitaminD: 1.0,
    vitaminB12: 1.0,
    omega3: 1.0,
    water: 1.0,
  };

  if (!dailyStatus) return modifiers;

  // 睡眠不足の影響（6時間未満）
  if (dailyStatus.sleepHours < 6) {
    modifiers.magnesium *= 1.2; // マグネシウム +20%
    modifiers.vitaminB12 *= 1.1; // B12 +10%
  }

  // ストレスレベルの影響
  if (dailyStatus.stressLevel === 'high') {
    modifiers.magnesium *= 1.3; // マグネシウム +30%
    modifiers.sodium *= 1.1; // ナトリウム +10%
    modifiers.vitaminB12 *= 1.15; // B12 +15%
  } else if (dailyStatus.stressLevel === 'moderate') {
    modifiers.magnesium *= 1.15;
    modifiers.sodium *= 1.05;
  }

  // 運動の影響
  if (dailyStatus.exerciseIntensity === 'intense') {
    modifiers.protein *= 1.3; // タンパク質 +30%
    modifiers.sodium *= 1.4; // ナトリウム +40%（発汗）
    modifiers.potassium *= 1.3; // カリウム +30%
    modifiers.magnesium *= 1.2; // マグネシウム +20%
    modifiers.water *= 1.5; // 水分 +50%
  } else if (dailyStatus.exerciseIntensity === 'moderate') {
    modifiers.protein *= 1.15;
    modifiers.sodium *= 1.2;
    modifiers.potassium *= 1.15;
    modifiers.magnesium *= 1.1;
    modifiers.water *= 1.3;
  } else if (dailyStatus.exerciseIntensity === 'light') {
    modifiers.sodium *= 1.1;
    modifiers.water *= 1.15;
  }

  // 生理周期の影響（女性のみ）
  if (userProfile.gender === 'female' && dailyStatus.menstrualPhase) {
    if (dailyStatus.menstrualPhase === 'menstrual') {
      modifiers.iron *= 1.5; // 鉄分 +50%
      modifiers.magnesium *= 1.2; // マグネシウム +20%
    } else if (dailyStatus.menstrualPhase === 'luteal') {
      modifiers.magnesium *= 1.15; // マグネシウム +15%（PMS対策）
    }
  }

  // 症状による影響
  if (dailyStatus.symptoms?.includes('headache')) {
    modifiers.magnesium *= 1.25;
    modifiers.water *= 1.2;
  }
  if (dailyStatus.symptoms?.includes('fatigue')) {
    modifiers.iron *= 1.2;
    modifiers.vitaminB12 *= 1.15;
  }
  if (dailyStatus.symptoms?.includes('digestive')) {
    modifiers.zinc *= 1.2;
    modifiers.fat *= 0.9; // 脂質は控えめに
  }

  return modifiers;
}

/**
 * 動的目標値を計算
 */
export function getDynamicTargets(
  userProfile: UserProfile,
  dailyStatus: DailyStatus | null
) {
  const baseTargets = getCarnivoreTargets(userProfile);
  const modifiers = calculateModifiers(dailyStatus, userProfile);

  const dynamicTargets: Record<string, number> = {};

  for (const [nutrient, baseValue] of Object.entries(baseTargets)) {
    const modifier = modifiers[nutrient as keyof NutrientModifiers] || 1.0;
    dynamicTargets[nutrient] = Math.round(baseValue * modifier);
  }

  return dynamicTargets;
}
```

**3. Supabaseテーブル定義**

```sql
-- daily_status テーブル
CREATE TABLE daily_status (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,

  -- 体調・生活状況
  sleep_quality TEXT CHECK (sleep_quality IN ('poor', 'fair', 'good', 'excellent')),
  sleep_hours NUMERIC(3,1) CHECK (sleep_hours >= 0 AND sleep_hours <= 24),
  stress_level TEXT CHECK (stress_level IN ('low', 'moderate', 'high')),
  exercise_intensity TEXT CHECK (exercise_intensity IN ('none', 'light', 'moderate', 'intense')),
  exercise_duration INTEGER CHECK (exercise_duration >= 0),

  -- 女性特有
  menstrual_phase TEXT CHECK (menstrual_phase IN ('follicular', 'ovulation', 'luteal', 'menstrual')),

  -- 症状
  symptoms TEXT[], -- 配列型

  -- メモ
  notes TEXT,

  -- タイムスタンプ
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- ユニーク制約（1日1レコード）
  UNIQUE(user_id, date)
);

-- RLS有効化
ALTER TABLE daily_status ENABLE ROW LEVEL SECURITY;

-- ポリシー（自分のデータのみ）
CREATE POLICY "Users can view own daily_status"
  ON daily_status FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own daily_status"
  ON daily_status FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own daily_status"
  ON daily_status FOR UPDATE
  USING (auth.uid() = user_id);

-- インデックス
CREATE INDEX idx_daily_status_user_date ON daily_status(user_id, date DESC);
```

**4. UI実装（DiaryScreen拡張）**

ファイル: `src/screens/DiaryScreen.tsx`

既存のDiaryScreenに以下を追加:

```typescript
// 新規セクション: Daily Status
<div className="bg-gray-800 rounded-lg p-4 mb-4">
  <h2 className="text-lg font-bold text-white mb-3">Today's Status</h2>

  {/* 睡眠 */}
  <div className="mb-3">
    <label className="text-sm text-gray-400">Sleep Hours</label>
    <input
      type="number"
      min="0"
      max="24"
      step="0.5"
      value={dailyStatus.sleepHours}
      onChange={(e) => updateDailyStatus({ sleepHours: parseFloat(e.target.value) })}
      className="w-full bg-gray-700 text-white rounded px-3 py-2 mt-1"
    />
  </div>

  {/* 睡眠の質 */}
  <div className="mb-3">
    <label className="text-sm text-gray-400">Sleep Quality</label>
    <div className="flex gap-2 mt-1">
      {['poor', 'fair', 'good', 'excellent'].map((quality) => (
        <button
          key={quality}
          onClick={() => updateDailyStatus({ sleepQuality: quality })}
          className={`flex-1 px-3 py-2 rounded ${
            dailyStatus.sleepQuality === quality
              ? 'bg-blue-600 text-white'
              : 'bg-gray-700 text-gray-300'
          }`}
        >
          {quality}
        </button>
      ))}
    </div>
  </div>

  {/* ストレスレベル */}
  <div className="mb-3">
    <label className="text-sm text-gray-400">Stress Level</label>
    <div className="flex gap-2 mt-1">
      {['low', 'moderate', 'high'].map((level) => (
        <button
          key={level}
          onClick={() => updateDailyStatus({ stressLevel: level })}
          className={`flex-1 px-3 py-2 rounded ${
            dailyStatus.stressLevel === level
              ? 'bg-red-600 text-white'
              : 'bg-gray-700 text-gray-300'
          }`}
        >
          {level}
        </button>
      ))}
    </div>
  </div>

  {/* 運動 */}
  <div className="mb-3">
    <label className="text-sm text-gray-400">Exercise Intensity</label>
    <div className="flex gap-2 mt-1">
      {['none', 'light', 'moderate', 'intense'].map((intensity) => (
        <button
          key={intensity}
          onClick={() => updateDailyStatus({ exerciseIntensity: intensity })}
          className={`flex-1 px-3 py-2 rounded ${
            dailyStatus.exerciseIntensity === intensity
              ? 'bg-green-600 text-white'
              : 'bg-gray-700 text-gray-300'
          }`}
        >
          {intensity}
        </button>
      ))}
    </div>
  </div>

  {/* 女性のみ: 生理周期 */}
  {userProfile.gender === 'female' && (
    <div className="mb-3">
      <label className="text-sm text-gray-400">Menstrual Phase</label>
      <select
        value={dailyStatus.menstrualPhase || ''}
        onChange={(e) => updateDailyStatus({ menstrualPhase: e.target.value })}
        className="w-full bg-gray-700 text-white rounded px-3 py-2 mt-1"
      >
        <option value="">Not tracking</option>
        <option value="follicular">Follicular (Day 1-13)</option>
        <option value="ovulation">Ovulation (Day 14-16)</option>
        <option value="luteal">Luteal (Day 17-28)</option>
        <option value="menstrual">Menstrual</option>
      </select>
    </div>
  )}

  {/* 症状 */}
  <div className="mb-3">
    <label className="text-sm text-gray-400">Symptoms (if any)</label>
    <div className="flex flex-wrap gap-2 mt-1">
      {['headache', 'fatigue', 'digestive', 'joint_pain', 'brain_fog'].map((symptom) => (
        <button
          key={symptom}
          onClick={() => toggleSymptom(symptom)}
          className={`px-3 py-1 rounded text-sm ${
            dailyStatus.symptoms?.includes(symptom)
              ? 'bg-orange-600 text-white'
              : 'bg-gray-700 text-gray-400'
          }`}
        >
          {symptom.replace('_', ' ')}
        </button>
      ))}
    </div>
  </div>
</div>
```

**5. HomeScreenでの動的表示**

ファイル: `src/screens/HomeScreen.tsx`

```typescript
import { getDynamicTargets } from '../utils/dynamicTargetCalculator';

// HomeScreen内
const [dailyStatus, setDailyStatus] = useState<DailyStatus | null>(null);

// 今日のDailyStatusを取得
useEffect(() => {
  const fetchDailyStatus = async () => {
    const today = new Date().toISOString().split('T')[0];
    const { data, error } = await supabase
      .from('daily_status')
      .select('*')
      .eq('user_id', user?.id)
      .eq('date', today)
      .single();

    if (data) setDailyStatus(data);
  };

  fetchDailyStatus();
}, [user]);

// 動的目標値を計算
const targets = getDynamicTargets(userProfile, dailyStatus);

// ゲージに渡す
<NutrientGauges
  consumed={consumed}
  targets={targets} // 動的に計算された値
  mode={userProfile.nutrientDisplayMode}
/>
```

**6. テスト項目**

- [ ] DailyStatusの保存・読み込み
- [ ] 各条件（睡眠不足、ストレス、運動）で目標値が変化することを確認
- [ ] ゲージの色・表示が正しく更新されることを確認
- [ ] RLS（自分のデータのみアクセス可能）の動作確認

---

### A2: ButcherSelect動的目標値対応

#### 目的
ButcherSelectで食品を選択する際、表示される目標値がHomeScreenと一致するようにする。

#### 実装詳細

ファイル: `src/components/ButcherSelect.tsx`

```typescript
import { getDynamicTargets } from '../utils/dynamicTargetCalculator';

// ButcherSelect内
const [dailyStatus, setDailyStatus] = useState<DailyStatus | null>(null);

useEffect(() => {
  const fetchDailyStatus = async () => {
    const today = new Date().toISOString().split('T')[0];
    const { data } = await supabase
      .from('daily_status')
      .select('*')
      .eq('user_id', user?.id)
      .eq('date', today)
      .single();

    if (data) setDailyStatus(data);
  };

  fetchDailyStatus();
}, [user]);

// 動的目標値を計算
const targets = getDynamicTargets(userProfile, dailyStatus);

// ゲージコンポーネントに渡す
<MiniNutrientGauges
  consumed={consumed}
  targets={targets} // HomeScreenと同じ値
  foodToAdd={selectedFood}
/>
```

---

### B1: 水分管理機能

#### 目的
カーニボアでは電解質バランスが重要。水分摂取を記録・管理する。

#### データ構造

ファイル: `src/types/index.ts`

```typescript
export interface WaterIntake {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  amount: number; // ml
  timestamp: string; // ISO string
}
```

#### Supabaseテーブル

```sql
CREATE TABLE water_intake (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  amount INTEGER NOT NULL CHECK (amount > 0), -- ml
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE water_intake ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own water_intake"
  ON water_intake FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own water_intake"
  ON water_intake FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own water_intake"
  ON water_intake FOR DELETE
  USING (auth.uid() = user_id);

CREATE INDEX idx_water_intake_user_date ON water_intake(user_id, date DESC);
```

#### UI実装

ファイル: `src/components/WaterTracker.tsx`（新規作成）

```typescript
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface WaterTrackerProps {
  userProfile: UserProfile;
  dailyStatus: DailyStatus | null;
}

export const WaterTracker: React.FC<WaterTrackerProps> = ({
  userProfile,
  dailyStatus,
}) => {
  const [todayIntake, setTodayIntake] = useState(0);
  const [recentIntakes, setRecentIntakes] = useState<WaterIntake[]>([]);

  // 目標値を計算（基本: 体重kg × 30ml、運動で +50%）
  const calculateTarget = () => {
    let base = (userProfile.weight || 70) * 30; // デフォルト70kg

    if (dailyStatus) {
      const modifiers = calculateModifiers(dailyStatus, userProfile);
      base *= modifiers.water;
    }

    return Math.round(base);
  };

  const target = calculateTarget();

  // 今日の合計摂取量を取得
  useEffect(() => {
    const fetchTodayIntake = async () => {
      const today = new Date().toISOString().split('T')[0];
      const { data } = await supabase
        .from('water_intake')
        .select('amount')
        .eq('user_id', user?.id)
        .eq('date', today);

      if (data) {
        const total = data.reduce((sum, item) => sum + item.amount, 0);
        setTodayIntake(total);
      }
    };

    fetchTodayIntake();
  }, []);

  // 水分追加
  const addWater = async (amount: number) => {
    const today = new Date().toISOString().split('T')[0];

    const { error } = await supabase
      .from('water_intake')
      .insert({
        user_id: user?.id,
        date: today,
        amount: amount,
        timestamp: new Date().toISOString(),
      });

    if (!error) {
      setTodayIntake((prev) => prev + amount);
    }
  };

  const percentage = Math.min((todayIntake / target) * 100, 100);

  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-white font-bold">💧 Water Intake</h3>
        <span className="text-sm text-gray-400">
          {todayIntake}ml / {target}ml
        </span>
      </div>

      {/* プログレスバー */}
      <div className="w-full bg-gray-700 rounded-full h-4 mb-4">
        <div
          className="bg-blue-500 h-4 rounded-full transition-all"
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* クイック追加ボタン */}
      <div className="grid grid-cols-4 gap-2">
        {[250, 500, 750, 1000].map((amount) => (
          <button
            key={amount}
            onClick={() => addWater(amount)}
            className="bg-gray-700 hover:bg-gray-600 text-white rounded py-2 text-sm"
          >
            +{amount}ml
          </button>
        ))}
      </div>

      {/* カスタム入力 */}
      <div className="mt-3 flex gap-2">
        <input
          type="number"
          placeholder="Custom amount (ml)"
          className="flex-1 bg-gray-700 text-white rounded px-3 py-2"
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              const value = parseInt((e.target as HTMLInputElement).value);
              if (value > 0) {
                addWater(value);
                (e.target as HTMLInputElement).value = '';
              }
            }
          }}
        />
      </div>
    </div>
  );
};
```

#### HomeScreenへの統合

ファイル: `src/screens/HomeScreen.tsx`

```typescript
import { WaterTracker } from '../components/WaterTracker';

// HomeScreen内、Nutrient Gaugesの下に配置
<WaterTracker
  userProfile={userProfile}
  dailyStatus={dailyStatus}
/>
```

---

### B2: 電解質バランス表示

#### 目的
ナトリウム・カリウム・マグネシウムのバランスを視覚化。

#### 実装詳細

ファイル: `src/components/ElectrolyteBalance.tsx`（新規作成）

```typescript
import React from 'react';

interface ElectrolyteBalanceProps {
  consumed: Record<string, number>;
  targets: Record<string, number>;
}

export const ElectrolyteBalance: React.FC<ElectrolyteBalanceProps> = ({
  consumed,
  targets,
}) => {
  const electrolytes = [
    { key: 'sodium', label: 'Na', color: '#10b981' },
    { key: 'potassium', label: 'K', color: '#f59e0b' },
    { key: 'magnesium', label: 'Mg', color: '#06b6d4' },
  ];

  // バランス判定
  const getBalanceStatus = () => {
    const naRatio = consumed.sodium / targets.sodium;
    const kRatio = consumed.potassium / targets.potassium;
    const mgRatio = consumed.magnesium / targets.magnesium;

    // すべて0.8以上なら「Good」
    if (naRatio >= 0.8 && kRatio >= 0.8 && mgRatio >= 0.8) {
      return { status: 'Good', color: '#10b981', icon: '✓' };
    }
    // いずれかが0.5未満なら「Critical」
    if (naRatio < 0.5 || kRatio < 0.5 || mgRatio < 0.5) {
      return { status: 'Critical', color: '#ef4444', icon: '!' };
    }
    // それ以外は「Caution」
    return { status: 'Caution', color: '#f59e0b', icon: '⚠' };
  };

  const balance = getBalanceStatus();

  return (
    <div className="bg-gray-800 rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-white font-bold">⚡ Electrolyte Balance</h3>
        <span
          className="text-sm font-bold"
          style={{ color: balance.color }}
        >
          {balance.icon} {balance.status}
        </span>
      </div>

      {/* 三角形バランス図（簡易版） */}
      <div className="grid grid-cols-3 gap-3">
        {electrolytes.map((e) => {
          const ratio = consumed[e.key] / targets[e.key];
          const percentage = Math.min(ratio * 100, 100);

          return (
            <div key={e.key} className="text-center">
              <div className="text-2xl font-bold mb-1" style={{ color: e.color }}>
                {e.label}
              </div>
              <div className="text-sm text-gray-400 mb-1">
                {consumed[e.key]}
                <span className="text-xs">/{targets[e.key]}</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className="h-2 rounded-full transition-all"
                  style={{
                    width: `${percentage}%`,
                    backgroundColor: e.color,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* アドバイス */}
      {balance.status === 'Critical' && (
        <div className="mt-3 p-2 bg-red-900/30 border border-red-500 rounded text-sm text-red-300">
          ⚠️ Low electrolytes detected. Consider adding salt or electrolyte supplements.
        </div>
      )}
      {balance.status === 'Caution' && (
        <div className="mt-3 p-2 bg-yellow-900/30 border border-yellow-500 rounded text-sm text-yellow-300">
          ⚡ Electrolytes slightly low. Monitor your intake.
        </div>
      )}
    </div>
  );
};
```

#### HomeScreenへの統合

```typescript
<ElectrolyteBalance
  consumed={consumed}
  targets={targets}
/>
```

---

### C1: 写真解析フォローアップクエスチョン

#### 目的
analyzeFoodImageでも、analyzeFoodNameと同様にフォローアップ質問を実装。

#### 現状の問題
- analyzeFoodNameには既に実装済み
- analyzeFoodImageには未実装（一度きりの解析で終わる）

#### 実装詳細

ファイル: `src/components/PhotoAnalysisModal.tsx`

**1. 状態管理を追加**

```typescript
const [followUpQuestions, setFollowUpQuestions] = useState<string[]>([]);
const [selectedQuestion, setSelectedQuestion] = useState<string | null>(null);
```

**2. 解析レスポンスにフォローアップ質問を含める**

バックエンド（functions/src/gemini.ts）:

```typescript
// analyzeFoodImage関数内
const prompt = `
Analyze this food image and return a JSON response.

Response format:
{
  "items": [
    {
      "name": "Food name",
      "amount": 100,
      "unit": "g",
      "confidence": "high"
    }
  ],
  "followUpQuestions": [
    "Is this grass-fed beef?",
    "How was this cooked?",
    "Any seasonings added?"
  ]
}

Focus on:
- Accurate food identification
- Reasonable portion estimates
- Relevant follow-up questions to improve accuracy
`;
```

**3. UIにフォローアップ質問を表示**

```typescript
{/* フォローアップ質問（解析結果の下） */}
{followUpQuestions.length > 0 && (
  <div className="mt-4">
    <h4 className="text-sm text-gray-400 mb-2">Quick refinements:</h4>
    <div className="flex flex-wrap gap-2">
      {followUpQuestions.map((question, index) => (
        <button
          key={index}
          onClick={() => handleFollowUpQuestion(question)}
          className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded"
        >
          {question}
        </button>
      ))}
    </div>
  </div>
)}
```

**4. フォローアップ質問の処理**

```typescript
const handleFollowUpQuestion = async (question: string) => {
  setSelectedQuestion(question);
  setIsLoading(true);

  const response = await fetch('/api/gemini/followup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      originalImage: uploadedImage,
      originalResult: analysisResult,
      question: question,
    }),
  });

  const data = await response.json();

  // 結果を更新
  setAnalysisResult(data.updatedResult);
  setFollowUpQuestions(data.newFollowUpQuestions || []);
  setIsLoading(false);
};
```

---

### C4: バーコードモバイル対応

#### 目的
iOS SafariでBarcodeDetector APIが使えないため、代替手段を実装。

#### 実装詳細

**1. フォールバック検出**

ファイル: `src/components/BarcodeScanner.tsx`

```typescript
import { BrowserMultiFormatReader } from '@zxing/library';

const [scannerType, setScannerType] = useState<'native' | 'zxing'>('native');

useEffect(() => {
  // BarcodeDetectorの対応確認
  if ('BarcodeDetector' in window) {
    setScannerType('native');
  } else {
    setScannerType('zxing');
  }
}, []);
```

**2. ZXing実装**

```typescript
const scanWithZXing = async (imageFile: File) => {
  const reader = new BrowserMultiFormatReader();

  try {
    const result = await reader.decodeFromImageUrl(URL.createObjectURL(imageFile));

    if (result) {
      return {
        rawValue: result.getText(),
        format: result.getBarcodeFormat(),
      };
    }
  } catch (error) {
    console.error('ZXing scan failed:', error);
    return null;
  }
};
```

**3. UI分岐**

```typescript
{scannerType === 'native' ? (
  <button onClick={scanWithNativeAPI}>
    Scan Barcode (Native)
  </button>
) : (
  <div>
    <p className="text-sm text-gray-400 mb-2">
      Camera scanning not available on this device.
      Please upload a photo of the barcode.
    </p>
    <input
      type="file"
      accept="image/*"
      onChange={async (e) => {
        if (e.target.files?.[0]) {
          const result = await scanWithZXing(e.target.files[0]);
          if (result) {
            handleBarcodeDetected(result.rawValue);
          }
        }
      }}
      className="block w-full text-sm text-gray-400"
    />
  </div>
)}
```

**4. パッケージ追加**

```bash
npm install @zxing/library
```

---

### H1: 断食タイマー通知実装

#### 目的
断食終了時刻に通知を送る。

#### 実装詳細

**1. Capacitor通知プラグイン**

```bash
npm install @capacitor/local-notifications
npx cap sync
```

**2. 通知権限リクエスト**

ファイル: `src/utils/notificationManager.ts`（新規作成）

```typescript
import { LocalNotifications } from '@capacitor/local-notifications';

export async function requestNotificationPermission() {
  const permission = await LocalNotifications.requestPermissions();
  return permission.display === 'granted';
}

export async function scheduleNotification(
  title: string,
  body: string,
  triggerAt: Date
) {
  await LocalNotifications.schedule({
    notifications: [
      {
        id: Math.floor(Math.random() * 1000000),
        title: title,
        body: body,
        schedule: {
          at: triggerAt,
        },
        sound: 'default',
        attachments: [],
        actionTypeId: '',
        extra: {},
      },
    ],
  });
}

export async function cancelAllNotifications() {
  await LocalNotifications.cancelAll();
}
```

**3. 断食タイマー画面で通知をスケジュール**

ファイル: `src/screens/FastingTimerScreen.tsx`（既存）

```typescript
import { scheduleNotification, requestNotificationPermission } from '../utils/notificationManager';

// タイマー開始時
const startFasting = async (durationHours: number) => {
  // 通知権限確認
  const hasPermission = await requestNotificationPermission();

  if (!hasPermission) {
    alert('Please enable notifications to receive fasting reminders.');
    return;
  }

  const endTime = new Date(Date.now() + durationHours * 60 * 60 * 1000);

  // 通知をスケジュール
  await scheduleNotification(
    '🍖 Fasting Complete!',
    `Your ${durationHours}-hour fast is done. Time to feast!`,
    endTime
  );

  // タイマー開始処理
  setFastingEndTime(endTime);
  setIsFasting(true);
};
```

**4. iOS/Android設定**

iOS: `ios/App/App/Info.plist`に以下を追加

```xml
<key>UIBackgroundModes</key>
<array>
  <string>fetch</string>
  <string>remote-notification</string>
</array>
```

Android: `android/app/src/main/AndroidManifest.xml`に以下を追加

```xml
<uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
```

---

### S1: Supabase RLS実装

#### 目的
すべてのテーブルで、ユーザーが自分のデータのみアクセスできるようにする。

#### 実装詳細

**対象テーブル**

1. user_profiles
2. food_entries
3. daily_status
4. water_intake
5. fasting_sessions
6. trophies_earned
7. custom_foods
8. feedback_submissions

**テンプレート**

各テーブルに以下を適用:

```sql
-- RLS有効化
ALTER TABLE <table_name> ENABLE ROW LEVEL SECURITY;

-- SELECT: 自分のデータのみ閲覧可能
CREATE POLICY "Users can view own data"
  ON <table_name> FOR SELECT
  USING (auth.uid() = user_id);

-- INSERT: 自分のデータのみ挿入可能
CREATE POLICY "Users can insert own data"
  ON <table_name> FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- UPDATE: 自分のデータのみ更新可能
CREATE POLICY "Users can update own data"
  ON <table_name> FOR UPDATE
  USING (auth.uid() = user_id);

-- DELETE: 自分のデータのみ削除可能
CREATE POLICY "Users can delete own data"
  ON <table_name> FOR DELETE
  USING (auth.uid() = user_id);
```

**例: food_entries**

```sql
ALTER TABLE food_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own food_entries"
  ON food_entries FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own food_entries"
  ON food_entries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own food_entries"
  ON food_entries FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own food_entries"
  ON food_entries FOR DELETE
  USING (auth.uid() = user_id);
```

**テスト方法**

1. Supabaseダッシュボード > SQL Editor で実行
2. 2つの異なるユーザーアカウントでログイン
3. User Aがfood_entriesを追加
4. User Bでログインして、User Aのデータが見えないことを確認

---

## 3. P1機能の詳細実装仕様

### E1: 3モードによるUI分け

#### 目的
初心者から上級者まで、段階的に情報を増やせるUI。

#### 実装詳細

**1. モード定義**

```typescript
export type NutrientDisplayMode = 'simple' | 'standard' | 'detailed';

export interface UserProfile {
  // ... 既存
  nutrientDisplayMode: NutrientDisplayMode; // デフォルト: 'standard'
}
```

**2. モード別表示ルール**

| モード | 表示内容 | 対象ユーザー |
|--------|----------|------------|
| Simple | 電解質(Na, K, Mg) + マクロ(Protein, Fat) のみ | 初心者・シンプル志向 |
| Standard | Simple + 主要ミネラル(Fe, Zn, VitD, VitA) | 一般ユーザー |
| Detailed | すべての栄養素 + 詳細説明 | 上級者・データ志向 |

**3. UI実装**

ファイル: `src/components/NutrientGauges.tsx`

```typescript
const getNutrientsForMode = (mode: NutrientDisplayMode): string[] => {
  const simple = ['sodium', 'potassium', 'magnesium', 'protein', 'fat'];
  const standard = [
    ...simple,
    'iron',
    'zinc',
    'vitaminD',
    'vitaminA',
    'vitaminB12',
    'omega3',
  ];
  const detailed = [
    ...standard,
    'calcium',
    'phosphorus',
    'selenium',
    'copper',
    'choline',
    // ... すべての栄養素
  ];

  switch (mode) {
    case 'simple':
      return simple;
    case 'standard':
      return standard;
    case 'detailed':
      return detailed;
    default:
      return standard;
  }
};

// レンダリング
const visibleNutrients = getNutrientsForMode(mode);

return (
  <div>
    {visibleNutrients.map((nutrient) => (
      <NutrientGauge
        key={nutrient}
        nutrient={nutrient}
        consumed={consumed[nutrient]}
        target={targets[nutrient]}
      />
    ))}
  </div>
);
```

**4. 設定画面にモード切り替えを追加**

ファイル: `src/screens/SettingsScreen.tsx`

```typescript
<div className="bg-gray-800 rounded-lg p-4 mb-4">
  <h3 className="text-white font-bold mb-3">Nutrient Display Mode</h3>

  <div className="space-y-2">
    {[
      { value: 'simple', label: 'Simple', desc: 'Electrolytes + Macros only' },
      { value: 'standard', label: 'Standard', desc: 'Essential nutrients' },
      { value: 'detailed', label: 'Detailed', desc: 'All nutrients + details' },
    ].map((option) => (
      <button
        key={option.value}
        onClick={() => updateProfile({ nutrientDisplayMode: option.value })}
        className={`w-full text-left p-3 rounded ${
          userProfile.nutrientDisplayMode === option.value
            ? 'bg-blue-600 text-white'
            : 'bg-gray-700 text-gray-300'
        }`}
      >
        <div className="font-bold">{option.label}</div>
        <div className="text-sm opacity-80">{option.desc}</div>
      </button>
    ))}
  </div>
</div>
```

---

### I1: トロフィー機能

#### 目的
習慣化を促進するため、達成条件をクリアするとトロフィーを獲得。

#### データ構造

```typescript
export interface Trophy {
  id: string;
  name: string;
  description: string;
  icon: string; // emoji
  condition: {
    type: 'streak' | 'total_entries' | 'nutrient_goal' | 'special';
    target: number;
    metric?: string; // 'days', 'entries', 'protein_g', etc.
  };
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlockedAt?: string; // ISO timestamp
}

export interface UserTrophy {
  id: string;
  userId: string;
  trophyId: string;
  unlockedAt: string;
}
```

#### トロフィー定義

ファイル: `src/data/trophies.ts`（新規作成）

```typescript
export const TROPHIES: Trophy[] = [
  // Streak系
  {
    id: 'streak_7',
    name: 'First Week Warrior',
    description: 'Log food for 7 days in a row',
    icon: '🔥',
    condition: { type: 'streak', target: 7, metric: 'days' },
    rarity: 'common',
  },
  {
    id: 'streak_30',
    name: 'Carnivore Committed',
    description: 'Log food for 30 days in a row',
    icon: '💪',
    condition: { type: 'streak', target: 30, metric: 'days' },
    rarity: 'rare',
  },
  {
    id: 'streak_90',
    name: 'Metabolic Master',
    description: 'Log food for 90 days in a row',
    icon: '👑',
    condition: { type: 'streak', target: 90, metric: 'days' },
    rarity: 'epic',
  },
  {
    id: 'streak_365',
    name: 'Carnivore Legend',
    description: 'Log food for 365 days in a row',
    icon: '🏆',
    condition: { type: 'streak', target: 365, metric: 'days' },
    rarity: 'legendary',
  },

  // Total Entries系
  {
    id: 'entries_100',
    name: 'Century Club',
    description: 'Log 100 total food entries',
    icon: '💯',
    condition: { type: 'total_entries', target: 100 },
    rarity: 'common',
  },
  {
    id: 'entries_500',
    name: 'Data Driven',
    description: 'Log 500 total food entries',
    icon: '📊',
    condition: { type: 'total_entries', target: 500 },
    rarity: 'rare',
  },

  // Nutrient Goal系
  {
    id: 'protein_target_30',
    name: 'Protein Pro',
    description: 'Hit protein target 30 days',
    icon: '🥩',
    condition: { type: 'nutrient_goal', target: 30, metric: 'protein' },
    rarity: 'common',
  },
  {
    id: 'electrolyte_perfect_7',
    name: 'Electrolyte Expert',
    description: 'Hit all electrolyte targets for 7 days',
    icon: '⚡',
    condition: { type: 'nutrient_goal', target: 7, metric: 'electrolytes' },
    rarity: 'rare',
  },

  // Special系
  {
    id: 'photo_analysis_10',
    name: 'AI Assistant',
    description: 'Use photo analysis 10 times',
    icon: '📸',
    condition: { type: 'special', target: 10, metric: 'photo_analysis' },
    rarity: 'common',
  },
  {
    id: 'feedback_submitted',
    name: 'Community Builder',
    description: 'Submit feedback',
    icon: '💬',
    condition: { type: 'special', target: 1, metric: 'feedback' },
    rarity: 'common',
  },
];
```

#### トロフィー判定ロジック

ファイル: `src/utils/trophyChecker.ts`（新規作成）

```typescript
import { TROPHIES } from '../data/trophies';
import { supabase } from '../lib/supabase';

export async function checkAndUnlockTrophies(userId: string) {
  const unlockedTrophies: string[] = [];

  for (const trophy of TROPHIES) {
    // 既に獲得済みか確認
    const { data: existing } = await supabase
      .from('user_trophies')
      .select('id')
      .eq('user_id', userId)
      .eq('trophy_id', trophy.id)
      .single();

    if (existing) continue; // 既に獲得済み

    // 条件チェック
    const unlocked = await checkTrophyCondition(userId, trophy);

    if (unlocked) {
      // トロフィー獲得
      await supabase.from('user_trophies').insert({
        user_id: userId,
        trophy_id: trophy.id,
        unlocked_at: new Date().toISOString(),
      });

      unlockedTrophies.push(trophy.id);
    }
  }

  return unlockedTrophies;
}

async function checkTrophyCondition(
  userId: string,
  trophy: Trophy
): Promise<boolean> {
  const { condition } = trophy;

  switch (condition.type) {
    case 'streak': {
      // 連続日数を計算
      const { data } = await supabase
        .from('food_entries')
        .select('date')
        .eq('user_id', userId)
        .order('date', { ascending: false });

      if (!data || data.length === 0) return false;

      let streak = 0;
      let currentDate = new Date();

      for (let i = 0; i < data.length; i++) {
        const entryDate = new Date(data[i].date);
        const diffDays = Math.floor(
          (currentDate.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (diffDays === streak) {
          streak++;
        } else {
          break;
        }

        currentDate = entryDate;
      }

      return streak >= condition.target;
    }

    case 'total_entries': {
      const { count } = await supabase
        .from('food_entries')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId);

      return (count || 0) >= condition.target;
    }

    case 'nutrient_goal': {
      // 目標達成日数をカウント
      const { data } = await supabase
        .from('daily_nutrient_totals')
        .select('date, protein, sodium, potassium, magnesium')
        .eq('user_id', userId)
        .order('date', { ascending: false });

      if (!data) return false;

      let daysHit = 0;

      for (const day of data) {
        if (condition.metric === 'protein') {
          if (day.protein >= targets.protein) daysHit++;
        } else if (condition.metric === 'electrolytes') {
          if (
            day.sodium >= targets.sodium &&
            day.potassium >= targets.potassium &&
            day.magnesium >= targets.magnesium
          ) {
            daysHit++;
          }
        }
      }

      return daysHit >= condition.target;
    }

    case 'special': {
      // メトリックごとに判定
      if (condition.metric === 'photo_analysis') {
        const { count } = await supabase
          .from('photo_analysis_logs')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', userId);

        return (count || 0) >= condition.target;
      }

      if (condition.metric === 'feedback') {
        const { count } = await supabase
          .from('feedback_submissions')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', userId);

        return (count || 0) >= condition.target;
      }

      return false;
    }

    default:
      return false;
  }
}
```

#### トロフィー画面

ファイル: `src/screens/TrophiesScreen.tsx`（新規作成）

```typescript
import React, { useEffect, useState } from 'react';
import { TROPHIES } from '../data/trophies';
import { supabase } from '../lib/supabase';

export const TrophiesScreen: React.FC = () => {
  const [unlockedTrophies, setUnlockedTrophies] = useState<Set<string>>(
    new Set()
  );

  useEffect(() => {
    const fetchUnlockedTrophies = async () => {
      const { data } = await supabase
        .from('user_trophies')
        .select('trophy_id')
        .eq('user_id', user?.id);

      if (data) {
        setUnlockedTrophies(new Set(data.map((t) => t.trophy_id)));
      }
    };

    fetchUnlockedTrophies();
  }, []);

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common':
        return '#9ca3af';
      case 'rare':
        return '#3b82f6';
      case 'epic':
        return '#a855f7';
      case 'legendary':
        return '#f59e0b';
      default:
        return '#6b7280';
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold text-white mb-4">🏆 Trophies</h1>

      <div className="grid grid-cols-2 gap-4">
        {TROPHIES.map((trophy) => {
          const isUnlocked = unlockedTrophies.has(trophy.id);

          return (
            <div
              key={trophy.id}
              className={`p-4 rounded-lg ${
                isUnlocked ? 'bg-gray-800' : 'bg-gray-900 opacity-50'
              }`}
            >
              <div
                className="text-4xl mb-2"
                style={{
                  filter: isUnlocked ? 'none' : 'grayscale(100%)',
                }}
              >
                {trophy.icon}
              </div>
              <div className="text-white font-bold text-sm mb-1">
                {trophy.name}
              </div>
              <div className="text-xs text-gray-400 mb-2">
                {trophy.description}
              </div>
              <div
                className="text-xs font-bold"
                style={{ color: getRarityColor(trophy.rarity) }}
              >
                {trophy.rarity.toUpperCase()}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
```

#### トロフィー獲得時の通知

```typescript
// HomeScreenなど、食事追加後に実行
useEffect(() => {
  const checkTrophies = async () => {
    const newTrophies = await checkAndUnlockTrophies(user?.id);

    if (newTrophies.length > 0) {
      // トースト通知
      toast.success(`🏆 Trophy Unlocked: ${newTrophies[0]}`);
    }
  };

  checkTrophies();
}, [foodEntries]);
```

---

### K1: カルマゲージ（Meat Gauge）

#### 目的
「1頭の牛の何%を食べたか」を視覚化。ビーガンに見せたら面白い。

#### 実装詳細

**1. データ構造**

```typescript
export interface MeatConsumption {
  userId: string;
  totalBeefConsumed: number; // グラム
  totalPorkConsumed: number;
  totalChickenConsumed: number;
  totalLambConsumed: number;
  // ... 他の動物
}

// 1頭あたりの可食部重量（平均）
export const ANIMAL_WEIGHTS = {
  beef: 300000, // 300kg（可食部）
  pork: 90000, // 90kg
  chicken: 1200, // 1.2kg
  lamb: 20000, // 20kg
};
```

**2. 計算ロジック**

ファイル: `src/utils/meatGaugeCalculator.ts`（新規作成）

```typescript
import { ANIMAL_WEIGHTS } from '../data/animalWeights';

export function calculateMeatPercentage(
  totalConsumed: number,
  animalType: keyof typeof ANIMAL_WEIGHTS
): number {
  const totalWeight = ANIMAL_WEIGHTS[animalType];
  return (totalConsumed / totalWeight) * 100;
}

export function getAnimalCount(
  totalConsumed: number,
  animalType: keyof typeof ANIMAL_WEIGHTS
): { full: number; partial: number } {
  const totalWeight = ANIMAL_WEIGHTS[animalType];
  const full = Math.floor(totalConsumed / totalWeight);
  const partial = ((totalConsumed % totalWeight) / totalWeight) * 100;

  return { full, partial };
}
```

**3. UI実装**

ファイル: `src/components/MeatGauge.tsx`（新規作成）

```typescript
import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import {
  calculateMeatPercentage,
  getAnimalCount,
} from '../utils/meatGaugeCalculator';

export const MeatGauge: React.FC = () => {
  const [beefConsumed, setBeefConsumed] = useState(0);
  const [porkConsumed, setPorkConsumed] = useState(0);
  const [chickenConsumed, setChickenConsumed] = useState(0);

  useEffect(() => {
    const fetchTotalConsumption = async () => {
      const { data } = await supabase
        .from('food_entries')
        .select('name, amount')
        .eq('user_id', user?.id);

      if (data) {
        let beef = 0;
        let pork = 0;
        let chicken = 0;

        data.forEach((entry) => {
          const name = entry.name.toLowerCase();
          if (name.includes('beef') || name.includes('steak')) {
            beef += entry.amount;
          } else if (name.includes('pork') || name.includes('bacon')) {
            pork += entry.amount;
          } else if (name.includes('chicken')) {
            chicken += entry.amount;
          }
        });

        setBeefConsumed(beef);
        setPorkConsumed(pork);
        setChickenConsumed(chicken);
      }
    };

    fetchTotalConsumption();
  }, []);

  const beefCount = getAnimalCount(beefConsumed, 'beef');
  const porkCount = getAnimalCount(porkConsumed, 'pork');
  const chickenCount = getAnimalCount(chickenConsumed, 'chicken');

  return (
    <div className="bg-gray-800 rounded-lg p-4 mb-4">
      <h3 className="text-white font-bold mb-3">🐄 Meat Gauge (Karma)</h3>

      {/* 牛 */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-white">🐄 Beef</span>
          <span className="text-sm text-gray-400">
            {beefCount.full} full + {beefCount.partial.toFixed(1)}%
          </span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-3">
          <div
            className="bg-red-500 h-3 rounded-full transition-all"
            style={{ width: `${Math.min(beefCount.partial, 100)}%` }}
          />
        </div>
      </div>

      {/* 豚 */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-white">🐷 Pork</span>
          <span className="text-sm text-gray-400">
            {porkCount.full} full + {porkCount.partial.toFixed(1)}%
          </span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-3">
          <div
            className="bg-pink-500 h-3 rounded-full transition-all"
            style={{ width: `${Math.min(porkCount.partial, 100)}%` }}
          />
        </div>
      </div>

      {/* 鶏 */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-white">🐔 Chicken</span>
          <span className="text-sm text-gray-400">
            {chickenCount.full} full + {chickenCount.partial.toFixed(1)}%
          </span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-3">
          <div
            className="bg-yellow-500 h-3 rounded-full transition-all"
            style={{ width: `${Math.min(chickenCount.partial, 100)}%` }}
          />
        </div>
      </div>

      {/* メッセージ */}
      {beefCount.full >= 1 && (
        <div className="mt-3 p-2 bg-green-900/30 border border-green-500 rounded text-sm text-green-300">
          🎉 You've consumed {beefCount.full} full cow{beefCount.full > 1 ? 's' : ''}!
        </div>
      )}
    </div>
  );
};
```

---

### U1: ROI点数ラベル

#### 目的
「金ないけどCarnivoreしたい人」向けに、コスパの良い食品を表示。

#### 実装詳細

**1. ROIスコア計算**

ファイル: `src/utils/roiCalculator.ts`（新規作成）

```typescript
export interface FoodROI {
  name: string;
  pricePerKg: number; // USD
  proteinPer100g: number;
  ironPer100g: number;
  zincPer100g: number;
  roiScore: number; // 高いほどコスパ良い
}

/**
 * ROIスコア = (Protein + Iron*10 + Zinc*5) / Price
 */
export function calculateROI(food: FoodROI): number {
  const nutrientScore =
    food.proteinPer100g + food.ironPer100g * 10 + food.zincPer100g * 5;

  return nutrientScore / food.pricePerKg;
}

// サンプルデータ（実際はDBから取得）
export const FOOD_ROI_DATA: FoodROI[] = [
  {
    name: 'Ground Beef (80/20)',
    pricePerKg: 8.8, // $8.8/kg (Costco average)
    proteinPer100g: 20,
    ironPer100g: 2.5,
    zincPer100g: 5.0,
    roiScore: 0,
  },
  {
    name: 'Chicken Thighs',
    pricePerKg: 5.5,
    proteinPer100g: 18,
    ironPer100g: 0.9,
    zincPer100g: 1.5,
    roiScore: 0,
  },
  {
    name: 'Beef Liver',
    pricePerKg: 6.6,
    proteinPer100g: 20,
    ironPer100g: 6.5,
    zincPer100g: 4.0,
    roiScore: 0,
  },
  {
    name: 'Eggs',
    pricePerKg: 3.3, // ~18 eggs
    proteinPer100g: 13,
    ironPer100g: 1.8,
    zincPer100g: 1.3,
    roiScore: 0,
  },
  {
    name: 'Ribeye Steak',
    pricePerKg: 22.0,
    proteinPer100g: 25,
    ironPer100g: 2.0,
    zincPer100g: 4.5,
    roiScore: 0,
  },
  // ... 他の食品
];

// ROIスコアを計算
FOOD_ROI_DATA.forEach((food) => {
  food.roiScore = calculateROI(food);
});

// ROIスコア順にソート（降順）
FOOD_ROI_DATA.sort((a, b) => b.roiScore - a.roiScore);
```

**2. UI実装**

ファイル: `src/screens/BudgetFoodsScreen.tsx`（新規作成）

```typescript
import React from 'react';
import { FOOD_ROI_DATA } from '../utils/roiCalculator';

export const BudgetFoodsScreen: React.FC = () => {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold text-white mb-2">
        💰 Budget-Friendly Carnivore
      </h1>
      <p className="text-sm text-gray-400 mb-4">
        Best nutrient-to-cost ratio foods
      </p>

      <div className="space-y-3">
        {FOOD_ROI_DATA.map((food, index) => {
          const rankColor =
            index === 0
              ? '#f59e0b' // Gold
              : index === 1
              ? '#9ca3af' // Silver
              : index === 2
              ? '#cd7f32' // Bronze
              : '#6b7280'; // Gray

          return (
            <div
              key={food.name}
              className="bg-gray-800 rounded-lg p-4 flex items-center"
            >
              {/* ランク */}
              <div
                className="text-2xl font-bold mr-3"
                style={{ color: rankColor }}
              >
                #{index + 1}
              </div>

              {/* 食品情報 */}
              <div className="flex-1">
                <div className="text-white font-bold">{food.name}</div>
                <div className="text-xs text-gray-400 mt-1">
                  ${food.pricePerKg.toFixed(2)}/kg • Protein: {food.proteinPer100g}g
                  • ROI: {food.roiScore.toFixed(2)}
                </div>
              </div>

              {/* バッジ */}
              {index < 3 && (
                <div className="ml-3 px-2 py-1 bg-yellow-600 rounded text-xs text-white font-bold">
                  TOP {index + 1}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Tips */}
      <div className="mt-6 p-4 bg-blue-900/30 border border-blue-500 rounded">
        <h3 className="text-white font-bold mb-2">💡 Budget Tips</h3>
        <ul className="text-sm text-gray-300 space-y-1">
          <li>• Buy ground beef in bulk (freeze portions)</li>
          <li>• Eggs are the cheapest complete protein</li>
          <li>• Beef liver: nutrition bomb at $6.6/kg</li>
          <li>• Check Costco for bulk chicken thighs</li>
        </ul>
      </div>
    </div>
  );
};
```

**3. ナビゲーションに追加**

```typescript
// OthersScreen.tsx に追加
<button
  onClick={() => navigate('/budget-foods')}
  className="w-full bg-gray-800 hover:bg-gray-700 text-white rounded-lg p-4 text-left"
>
  <div className="flex items-center">
    <span className="text-2xl mr-3">💰</span>
    <div>
      <div className="font-bold">Budget-Friendly Foods</div>
      <div className="text-sm text-gray-400">Best ROI carnivore foods</div>
    </div>
  </div>
</button>
```

---

### U2: RecipeScreen改善

#### 目的
削除ではなく、野菜検索等は残す形で実装。

#### 実装詳細

**1. 現状の問題**
- RecipeScreenが中途半端に実装されている
- カーニボアでは「調理」が少ないため、レシピ機能の必要性が低い

**2. 改善案**

RecipeScreenを「Non-Carnivore Food Search」に変更。

ファイル: `src/screens/RecipeScreen.tsx` → `src/screens/NonCarnivoreSearchScreen.tsx`

```typescript
import React, { useState } from 'react';
import { supabase } from '../lib/supabase';

export const NonCarnivoreSearchScreen: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);

  const searchFood = async (query: string) => {
    // USDA FoodData Central API or Open Food Facts
    const response = await fetch(
      `https://api.nal.usda.gov/fdc/v1/foods/search?api_key=${API_KEY}&query=${query}`
    );
    const data = await response.json();
    setSearchResults(data.foods || []);
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold text-white mb-2">
        🌱 Non-Carnivore Food Search
      </h1>
      <p className="text-sm text-gray-400 mb-4">
        For vegetables, fruits, and other non-animal foods
      </p>

      {/* 検索バー */}
      <input
        type="text"
        placeholder="Search for vegetables, fruits..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onKeyPress={(e) => {
          if (e.key === 'Enter') {
            searchFood(searchQuery);
          }
        }}
        className="w-full bg-gray-800 text-white rounded-lg p-3 mb-4"
      />

      {/* 検索結果 */}
      <div className="space-y-3">
        {searchResults.map((food) => (
          <div key={food.fdcId} className="bg-gray-800 rounded-lg p-4">
            <div className="text-white font-bold">{food.description}</div>
            <div className="text-sm text-gray-400 mt-1">
              {food.foodNutrients
                ?.slice(0, 3)
                .map((n: any) => `${n.nutrientName}: ${n.value}${n.unitName}`)
                .join(' • ')}
            </div>
            <button
              onClick={() => addFoodEntry(food)}
              className="mt-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded"
            >
              Add to Diary
            </button>
          </div>
        ))}
      </div>

      {/* 警告メッセージ */}
      {searchResults.length > 0 && (
        <div className="mt-6 p-4 bg-orange-900/30 border border-orange-500 rounded">
          <h3 className="text-white font-bold mb-2">⚠️ Non-Carnivore Alert</h3>
          <p className="text-sm text-gray-300">
            These foods contain plant compounds that may affect your carnivore
            goals. Track at your own discretion.
          </p>
        </div>
      )}
    </div>
  );
};
```

**3. ルーティング変更**

```typescript
// App.tsx
<Route path="/non-carnivore-search" element={<NonCarnivoreSearchScreen />} />
```

---

## 4. エッジケース処理

### 4.1 オフライン対応

**問題**: ネットワーク切断時にアプリがクラッシュする。

**対策**:

```typescript
// src/utils/offlineHandler.ts
export async function safeSupabaseQuery<T>(
  queryFn: () => Promise<{ data: T | null; error: any }>,
  fallbackValue: T
): Promise<T> {
  try {
    const { data, error } = await queryFn();

    if (error) {
      console.error('Supabase error:', error);
      return fallbackValue;
    }

    return data || fallbackValue;
  } catch (error) {
    console.error('Network error:', error);
    return fallbackValue;
  }
}

// 使用例
const dailyStatus = await safeSupabaseQuery(
  () =>
    supabase
      .from('daily_status')
      .select('*')
      .eq('user_id', user?.id)
      .eq('date', today)
      .single(),
  null // fallback
);
```

### 4.2 データ欠損対応

**問題**: UserProfileやDailyStatusがnullの場合の処理。

**対策**:

```typescript
// 安全なデフォルト値を提供
export function getDynamicTargetsWithDefaults(
  userProfile: UserProfile | null,
  dailyStatus: DailyStatus | null
) {
  const profile = userProfile || {
    gender: 'male',
    weight: 70,
    activityLevel: 'moderate',
    // ... デフォルト値
  };

  return getDynamicTargets(profile, dailyStatus);
}
```

### 4.3 バーコードスキャンエラー

**問題**: バーコードが読み取れない、または商品が見つからない。

**対策**:

```typescript
const handleBarcodeError = (error: string) => {
  if (error === 'NOT_FOUND') {
    toast.error(
      'Product not found in database. Please add manually.',
      {
        action: {
          label: 'Add Manually',
          onClick: () => navigate('/custom-food'),
        },
      }
    );
  } else {
    toast.error('Failed to scan barcode. Please try again.');
  }
};
```

---

## 5. テスト項目

### 5.1 P0機能のテスト

#### A1: 栄養ゲージ動的化

- [ ] DailyStatusの保存・読み込み
- [ ] 睡眠不足時にマグネシウム目標値が +20%
- [ ] ストレス高時にマグネシウム目標値が +30%
- [ ] 激しい運動時にタンパク質目標値が +30%
- [ ] 生理中に鉄分目標値が +50%（女性のみ）
- [ ] HomeScreenのゲージが動的目標値を反映

#### B1: 水分管理

- [ ] 水分追加ボタンで正しく記録
- [ ] 今日の合計摂取量が正しく表示
- [ ] 目標値が体重×30mlで計算
- [ ] 運動時に目標値が +50%

#### C4: バーコードモバイル対応

- [ ] iOS Safariで @zxing/library が動作
- [ ] 画像アップロード方式でバーコード読み取り
- [ ] 読み取り結果が正しく表示

#### H1: 断食タイマー通知

- [ ] 通知権限のリクエスト
- [ ] 断食終了時刻に通知が届く
- [ ] 通知タップでアプリが開く

### 5.2 P1機能のテスト

#### I1: トロフィー機能

- [ ] 7日連続ログで「First Week Warrior」獲得
- [ ] 100エントリーで「Century Club」獲得
- [ ] トロフィー画面に獲得済みトロフィーが表示
- [ ] 未獲得トロフィーはグレーアウト

#### K1: カルマゲージ

- [ ] 牛肉300kg消費で「1 full cow」表示
- [ ] 部分的な消費が%で表示
- [ ] 複数頭消費時に正しくカウント

---

## 6. 実装時の注意事項

### 6.1 パフォーマンス

- [ ] Supabaseクエリは必要最小限に
- [ ] 頻繁に変わるデータは useState でキャッシュ
- [ ] 画像は圧縮してから送信（写真解析）

### 6.2 セキュリティ

- [ ] すべてのSupabaseテーブルでRLS有効化
- [ ] APIキーは環境変数で管理
- [ ] ユーザー入力は必ずサニタイズ

### 6.3 UX

- [ ] ローディング時は必ずスピナー表示
- [ ] エラー時は具体的なメッセージ
- [ ] 成功時はトースト通知

---

## 7. リリースチェックリスト

### v1.0リリース前

- [ ] P0機能（A1, A2, B1, B2, C1, C4, H1, S1）すべて実装
- [ ] 自動テスト（npm test）成功
- [ ] 手動テスト（test:embody）成功
- [ ] RLS設定完了
- [ ] プライバシーポリシー更新
- [ ] App Store/Google Play提出

### リリース後

- [ ] P1機能の実装開始
- [ ] ユーザーフィードバック収集
- [ ] バグ修正の優先順位付け

---

**最終更新**: 2026-02-05
**次回更新**: v1.0リリース後、ユーザーフィードバック反映時
