/**
 * CarnivOS - Carnivore-Specific Nutrition Targets
 *
 * カーニボア専用の栄養目標値を定義します。
 * 一般的なRDA（推奨食事摂取基準）ではなく、厳格なカーニボア実践者のための目標値です。
 *
 * Research Basis: Dr. Anthony Chaffee, Dr. Bart Kay, Dr. Ken Berry, LMNT, Dr. Shawn Baker
 */

export interface NutrientTarget {
  target?: number;
  min?: number;
  max?: number;
  unit: string;
  logic: string;
}

export interface CarnivoreTargets {
  [key: string]: NutrientTarget;
}

export const CARNIVORE_NUTRIENT_TARGETS: CarnivoreTargets = {
  vitamin_c: {
    target: 10, // mg（カーニボアロジック: 壊血病を防ぐために必要な最小量は約10mg。肉食のみでも1日約30mgを摂取可能なため、肉で十分足りる。RDA基準の90mgは不要）
    unit: 'mg',
    logic:
      'グルコース・アスコルビン酸拮抗作用により、糖質ゼロ環境下ではビタミンC必要量が大幅に減少。新鮮な肉に含まれる微量（DHAA）で十分であり、肉食のみでも1日約30mgを摂取可能。壊血病を防ぐために必要な最小量は約10mg',
  },
  protein: {
    target: 110, // g/日（体重70kg、1.6g/kgを想定。カーニボアロジック: 体重1kgあたり1.5-2.0gのタンパク質が推奨。肉で十分摂取可能）
    unit: 'g',
    logic:
      'カーニボアロジック: 体重1kgあたり1.5-2.0gのタンパク質が推奨。肉類に豊富に含まれ、肉で十分摂取可能。筋肉量維持、代謝、ホルモン合成に重要',
  },
  fat: {
    target: 150, // g/日（タンパク質との比率1:1.4を想定。カーニボアロジック: タンパク質と脂質の比率は1:1から1:1.5が推奨。肉で十分摂取可能）
    unit: 'g',
    logic:
      'カーニボアロジック: タンパク質と脂質の比率は1:1から1:1.5が推奨。エネルギー源として脂質が重要。肉類に豊富に含まれ、肉で十分摂取可能',
  },
  zinc: {
    target: 11, // mg/日（RDA準拠。カーニボアロジック: 肉類に豊富で、ヘム鉄による吸収促進により十分摂取可能）
    unit: 'mg',
    logic:
      'カーニボアロジック: 肉類に豊富に含まれ、ヘム鉄による吸収促進により十分摂取可能。免疫機能、代謝、創傷治癒に重要。肉で十分摂取可能',
  },
  iron: {
    target: 8, // mg/日（男性。女性は18mg推奨。カーニボアロジック: ヘム鉄として肉で十分摂取可能）
    unit: 'mg',
    logic:
      'カーニボアロジック: 赤身肉や内臓肉に多く含まれ、吸収率の高いヘム鉄として摂取可能。肉で十分摂取可能。女性は月経がある場合18mg推奨',
  },
  sodium: {
    min: 5000,
    max: 8000,
    unit: 'mg',
    logic:
      '低インスリン状態では腎臓からのナトリウム排出（ナトリウム利尿）が加速するため、電解質維持と「ケトフル」予防に高用量が必要',
  },
  magnesium: {
    target: 600,
    unit: 'mg',
    logic:
      '現代の土壌枯渇により肉のみでは不足しがちであり、こむら返りや便秘を防ぐために積極的な摂取またはサプリメントが必要',
  },
  potassium: {
    target: 4500,
    unit: 'mg',
    logic:
      'ナトリウム摂取増に対応する細胞内バランス維持のため、肉汁（ミオグロビン）を捨てずに摂取することで確保する',
  },
  vitamin_a: {
    target: 5000, // IU/日（レチノール。カーニボアロジック: レバーなどの内臓肉に豊富。肉で十分摂取可能）
    unit: 'IU',
    logic:
      'カーニボアロジック: レバーなどの内臓肉に豊富に含まれ、肉で十分摂取可能。視力、皮膚の健康維持に重要。過剰摂取に注意',
  },
  vitamin_d: {
    target: 2000, // IU/日（D3。カーニボアロジック: 魚の肝油や卵黄に含まれるが、日光暴露も重要。肉で十分摂取可能な場合もある）
    unit: 'IU',
    logic:
      'カーニボアロジック: 魚の肝油や卵黄に含まれるが、日光暴露も重要。肉や魚で十分摂取可能な場合もある。骨の健康、免疫機能に重要',
  },
  vitamin_k2: {
    target: 200, // μg/日（MK-4。カーニボアロジック: 動物性食品（特に内臓肉）に豊富。肉で十分摂取可能）
    unit: 'μg',
    logic:
      'カーニボアロジック: 動物性食品（特に内臓肉）に豊富に含まれ、肉で十分摂取可能。血液凝固、骨の健康に重要',
  },
  vitamin_b12: {
    target: 2.4, // μg/日（RDA準拠。カーニボアロジック: 動物性食品に豊富。肉で十分摂取可能）
    unit: 'μg',
    logic:
      'カーニボアロジック: 動物性食品に豊富に含まれ、肉で十分摂取可能。神経系の健康、赤血球形成に重要',
  },
  choline: {
    target: 450, // mg/日（RDA準拠。カーニボアロジック: レバーや卵に豊富。肉で十分摂取可能）
    unit: 'mg',
    logic: 'カーニボアロジック: レバーや卵に豊富に含まれ、肉で十分摂取可能。脳の健康、肝機能に重要',
  },
};

export interface PFRatioMode {
  name: string;
  proteinRatio: number;
  fatRatio: number;
  description: string;
  logic: string;
}

export const PF_RATIO_MODES: PFRatioMode[] = [
  {
    name: 'Standard',
    proteinRatio: 1.0,
    fatRatio: 1.0,
    description: '標準的なP:F比率（1:1）',
    logic: '一般的なカーニボア実践者の推奨比率。エネルギーとタンパク質のバランスが取れた状態。',
  },
  // 追加のモードは今後実装
];

/**
 * デフォルトのカーニボア栄養目標値（後方互換性のため）
 */
export interface CarnivoreTarget {
  // マクロ栄養素
  protein: number; // g/日
  fat: number; // g/日

  // ミネラル
  zinc: number; // mg/日
  magnesium: number; // mg/日
  iron: number; // mg/日（ヘム鉄推奨）
  potassium: number; // mg/日
  sodium: number; // mg/日（高塩分推奨）
  iodine?: number; // μg/日（ヨウ素）

  // 脂溶性ビタミン
  vitamin_a: number; // IU/日（レチノール）
  vitamin_d: number; // IU/日（D3）
  vitamin_k2: number; // μg/日（MK-4）

  // ビタミンB群
  vitamin_b12: number; // μg/日

  // その他
  choline: number; // mg/日

  // 比率
  omega_6_to_3_ratio_max?: number; // 最大推奨比率（例: 4:1）
}

export const DEFAULT_CARNIVORE_TARGETS: CarnivoreTarget = {
  // マクロ栄養素（P:E比率を考慮）
  // カーニボアロジック: 体重1kgあたり1.5-2.0gのタンパク質（Dr. Shawn Baker / Dr. Anthony Chaffee）
  // 70kgの人の場合: 105-140g。デフォルトは110g（中程度の活動量を想定）
  protein: 110, // g/日（体重70kg、1.6g/kgを想定。肉で十分摂取可能）
  // カーニボアロジック: タンパク質と脂質の比率は1:1から1:1.5が推奨（Dr. Ken Berry, Dr. Anthony Chaffee）
  // エネルギー源として脂質が重要。デフォルトは150g（タンパク質110gに対して約1.4:1）
  fat: 150, // g/日（タンパク質との比率1:1.4を想定。肉で十分摂取可能）

  // ミネラル
  // カーニボアロジック: 肉類に豊富に含まれ、ヘム鉄による吸収促進により十分摂取可能（Dr. Ken Berry, Dr. Bart Kay）
  zinc: 11, // mg/日（RDA準拠。肉類に豊富で、ヘム鉄による吸収促進により十分摂取可能）
  magnesium: 600, // mg/日（Phase 1: 基本600mg、移行期間中は800mg）
  iron: 8, // mg/日（男性。女性は18mg推奨。ヘム鉄として肉で十分摂取可能）
  potassium: 4500, // mg/日（Phase 1: 基本4500mg、移行期間中は5000mg）
  sodium: 5000, // mg/日（CARNIVORE_NUTRIENT_TARGETSから。低インスリン状態では高用量が必要）

  // 脂溶性ビタミン
  // カーニボアロジック: レバーなどの内臓肉に豊富。肉で十分摂取可能（Dr. Ken Berry）
  vitamin_a: 5000, // IU/日（レチノール。レバーや内臓肉に豊富で、肉で十分摂取可能。過剰摂取に注意）
  // カーニボアロジック: 魚の肝油や卵黄に含まれるが、日光暴露も重要。肉で十分摂取可能な場合もある（Dr. Ken Berry）
  vitamin_d: 2000, // IU/日（D3。日光暴露を考慮。肉や魚で十分摂取可能な場合もある）
  // カーニボアロジック: 動物性食品（特に内臓肉）に豊富。肉で十分摂取可能（Dr. Ken Berry）
  vitamin_k2: 200, // μg/日（MK-4。内臓肉や発酵食品に豊富で、肉で十分摂取可能）

  // ビタミンB群
  // カーニボアロジック: 動物性食品に豊富。肉で十分摂取可能（Dr. Bart Kay）
  vitamin_b12: 2.4, // μg/日（RDA準拠。肉類に豊富で、肉で十分摂取可能）

  // その他
  // カーニボアロジック: レバーや卵に豊富。肉で十分摂取可能（Dr. Ken Berry）
  choline: 450, // mg/日（RDA準拠。レバーや卵に豊富で、肉で十分摂取可能）
};

/**
 * 性別・年齢・活動量・その他の条件に応じた目標値を返す（動的目標値）
 */
export function getCarnivoreTargets(
  gender?: 'male' | 'female',
  age?: number,
  activityLevel?: 'sedentary' | 'moderate' | 'active',
  isPregnant?: boolean,
  isBreastfeeding?: boolean,
  isPostMenopause?: boolean,
  stressLevel?: 'low' | 'moderate' | 'high',
  sleepHours?: number,
  exerciseIntensity?: 'none' | 'light' | 'moderate' | 'intense',
  exerciseFrequency?: 'none' | '1-2' | '3-4' | '5+',
  thyroidFunction?: 'normal' | 'hypothyroid' | 'hyperthyroid',
  sunExposureFrequency?: 'none' | 'rare' | 'occasional' | 'daily',
  digestiveIssues?: boolean,
  inflammationLevel?: 'low' | 'moderate' | 'high',
  mentalHealthStatus?: 'good' | 'moderate' | 'poor',
  supplementMagnesium?: boolean,
  supplementVitaminD?: boolean,
  supplementIodine?: boolean,
  alcoholFrequency?: 'none' | 'rare' | 'weekly' | 'daily',
  caffeineIntake?: 'none' | 'low' | 'moderate' | 'high',
  // Phase 1 related params removed
  bodyComposition?: 'muscular' | 'average' | 'high_fat' | { bodyFatPercentage: number }, // Phase 3: 体組成設定
  weight?: number, // Phase 3: 体重（LBM計算用）
  metabolicStressIndicators?: string[], // Phase 4: 代謝ストレス指標
  customNutrientTargets?: Record<string, { mode: 'auto' | 'manual'; value?: number }> // Phase 5: 栄養素目標値のカスタマイズ
): CarnivoreTarget {
  const targets = { ...DEFAULT_CARNIVORE_TARGETS };

  // Phase 1: Transition Phase Logic Removed

  // 基本計算: 体重がある場合は体重からタンパク質目標を算出 (1.6g/kg)
  if (weight) {
    // デフォルトの110gではなく、個人の体重に基づいた数値をベースにする
    targets.protein = Math.round(weight * 1.6);
    // 脂質はタンパク質の1.2倍に設定 (1:1.2 ~ 1:1.4 ratio)
    targets.fat = Math.round(targets.protein * 1.2);
  }

  // 性別による調整
  if (gender === 'female') {
    if (isPostMenopause) {
      targets.iron = 8; // 閉経後は8mg（男性と同じ）
    } else {
      targets.iron = 18; // 女性は18mg推奨（月経がある場合）
    }
  }

  // 妊娠中・授乳中の調整
  if (isPregnant) {
    targets.protein = Math.max(targets.protein, 120); // 妊娠中はタンパク質増量
    targets.iron = Math.max(targets.iron, 27); // 妊娠中は鉄分増量（27mg）
    targets.magnesium = Math.max(targets.magnesium, 700); // マグネシウム増量
  }

  if (isBreastfeeding) {
    targets.protein = Math.max(targets.protein, 130); // 授乳中はタンパク質さらに増量
    targets.iron = Math.max(targets.iron, 9); // 授乳中は鉄分9mg（月経がないため）
    targets.magnesium = Math.max(targets.magnesium, 700);
  }

  // Phase 1: Transition Phase Logic Removed (Dynamic adjustments for adaptation)

  // 活動量による調整
  if (activityLevel === 'active') {
    targets.protein = Math.max(targets.protein, 120); // 活動的な人はタンパク質増量
    targets.fat = Math.max(targets.fat, 180); // 脂質も増量
    targets.magnesium = Math.max(targets.magnesium, 700); // マグネシウム増量
    // Gemini提案：活動レベル高（汗をかく）はナトリウム+1000mg
    // Gemini提案：活動レベル高（汗をかく）はナトリウム+1000mg
    targets.sodium = Math.max(targets.sodium, targets.sodium + 1000);
  } else if (activityLevel === 'moderate') {
    targets.protein = Math.max(targets.protein, 110);
    targets.fat = Math.max(targets.fat, 160);
  }

  // ストレスレベルによる調整
  if (stressLevel === 'high') {
    targets.magnesium = Math.max(targets.magnesium, 700); // 高ストレス時はマグネシウム増量
  }

  // 年齢による調整
  if (age && age > 50) {
    targets.vitamin_d = Math.max(targets.vitamin_d, 3000); // 高齢者はビタミンD増量
    targets.protein = Math.max(targets.protein, 110); // 高齢者はタンパク質増量（筋肉量維持のため）
  }

  // 睡眠→ストレス→炎症 → マグネシウム係数（積で適用）
  let magnesiumSleepFactor = 1;
  if (sleepHours != null) {
    if (sleepHours < 6) magnesiumSleepFactor = 1.3;
    else if (sleepHours < 7) magnesiumSleepFactor = 1.15;
  }
  let magnesiumStressFactor = 1;
  if (stressLevel === 'high') magnesiumStressFactor = 1.5;
  else if (stressLevel === 'moderate') magnesiumStressFactor = 1.2;
  let magnesiumInflammationFactor = 1;
  if (inflammationLevel === 'high') magnesiumInflammationFactor = 1.3;
  let magnesiumAlcoholFactor = 1;
  if (alcoholFrequency === 'daily') magnesiumAlcoholFactor = 1.4;
  else if (alcoholFrequency === 'weekly' || alcoholFrequency === 'rare') magnesiumAlcoholFactor = 1.2;
  let magnesiumCaffeineFactor = 1;
  if (caffeineIntake === 'high') magnesiumCaffeineFactor = 1.3;
  else if (caffeineIntake === 'moderate') magnesiumCaffeineFactor = 1.15;
  targets.magnesium = Math.round(
    targets.magnesium *
      magnesiumSleepFactor *
      magnesiumStressFactor *
      magnesiumInflammationFactor *
      magnesiumAlcoholFactor *
      magnesiumCaffeineFactor
  );
  if (sleepHours != null && sleepHours < 7) {
    targets.magnesium = Math.max(targets.magnesium, 650); // 既存の最低保証
  }

  // 運動→代謝 → タンパク質・脂質・ナトリウム係数
  let exerciseFactor = 1;
  if (exerciseIntensity === 'intense' && (exerciseFrequency === '5+' || exerciseFrequency === '3-4')) {
    exerciseFactor = exerciseFrequency === '5+' ? 1.4 : 1.3;
  } else if (exerciseIntensity === 'moderate' && (exerciseFrequency === '3-4' || exerciseFrequency === '1-2')) {
    exerciseFactor = exerciseFrequency === '3-4' ? 1.25 : 1.15;
  }
  targets.protein = Math.round(targets.protein * exerciseFactor);
  targets.fat = Math.round(targets.fat * exerciseFactor);
  targets.sodium = Math.round(targets.sodium * (exerciseFactor > 1.2 ? 1.3 : 1.1));

  // 既存の運動による下限も維持
  if (exerciseIntensity === 'intense' || exerciseFrequency === '5+') {
    targets.protein = Math.max(targets.protein, 130);
    targets.fat = Math.max(targets.fat, 190);
    targets.magnesium = Math.max(targets.magnesium, 750);
  } else if (exerciseIntensity === 'moderate' || exerciseFrequency === '3-4') {
    targets.protein = Math.max(targets.protein, 115);
    targets.fat = Math.max(targets.fat, 170);
    targets.magnesium = Math.max(targets.magnesium, 650);
  }

  // 甲状腺→ヨウ素係数
  let iodineFactor = 1;
  if (thyroidFunction === 'hypothyroid') iodineFactor = 2.0;
  else if (thyroidFunction === 'hyperthyroid') iodineFactor = 0.5;
  if (supplementIodine) iodineFactor *= 0.7;
  const baseIodine = targets.iodine ?? 150;
  targets.iodine = Math.round(baseIodine * iodineFactor);
  if (thyroidFunction === 'hypothyroid' && !supplementIodine) {
    targets.iodine = Math.max(targets.iodine, 300);
  }

  // 日光浴→ビタミンD係数
  let vitaminDFactor = 1;
  if (sunExposureFrequency === 'daily') vitaminDFactor = 0.5;
  else if (sunExposureFrequency === 'occasional') vitaminDFactor = 0.8;
  else if (sunExposureFrequency === 'rare') vitaminDFactor = 1.2;
  else if (sunExposureFrequency === 'none') vitaminDFactor = 1.5;
  if (supplementVitaminD) vitaminDFactor *= 0.6;
  targets.vitamin_d = Math.round(targets.vitamin_d * vitaminDFactor);
  if (sunExposureFrequency === 'none' || sunExposureFrequency === 'rare') {
    if (!supplementVitaminD) targets.vitamin_d = Math.max(targets.vitamin_d, 4000);
  }

  // 消化問題→亜鉛・鉄 吸収率補正
  if (digestiveIssues) {
    targets.zinc = Math.round(targets.zinc * 1.3);
    targets.iron = Math.round(targets.iron * 1.3);
    targets.protein = Math.max(targets.protein, 110);
  }

  // メンタルヘルス状態による調整
  if (mentalHealthStatus === 'poor') {
    targets.magnesium = Math.max(targets.magnesium, 700); // メンタルヘルス不良時はマグネシウム増量
    if (!supplementVitaminD) {
      targets.vitamin_d = Math.max(targets.vitamin_d, 3000); // ビタミンDも増量
    }
  }

  // アルコール・カフェインのマグネシウムは上記係数で適用済み。B12のみ追加
  if (alcoholFrequency === 'daily' || alcoholFrequency === 'weekly') {
    targets.vitamin_b12 = Math.max(targets.vitamin_b12, 3.0);
  }
  if (caffeineIntake === 'high' && stressLevel === 'high') {
    targets.magnesium = Math.max(targets.magnesium, 750); // 高ストレス+高カフェインの下限
  }

  // Gemini提案：脂質ターゲットの自動設定（タンパク質量の1.2倍）
  if (targets.protein > 0) {
    targets.fat = Math.max(targets.fat, targets.protein * 1.2);
  }

  // Gemini提案：甲状腺機能低下時のヨウ素調整
  if (thyroidFunction === 'hypothyroid' && !supplementIodine) {
    targets.iodine = Math.max(targets.iodine || 150, 300); // 甲状腺機能低下時は300μg以上
  }

  // Phase 4: 代謝ストレス指標による調整
  if (metabolicStressIndicators && metabolicStressIndicators.length > 0) {
    if (metabolicStressIndicators.includes('morning_fatigue')) {
      // 朝起きるのが辛い / 疲労感が抜けない → 副腎疲労疑い → ナトリウム +1500mg
      targets.sodium = Math.max(targets.sodium, targets.sodium + 1500);
    }
    if (metabolicStressIndicators.includes('night_wake')) {
      // 睡眠中に目が覚める / 悪夢を見る → 夜間低血糖疑い → マグネシウム +200mg
      targets.magnesium = Math.max(targets.magnesium, targets.magnesium + 200);
    }
    if (metabolicStressIndicators.includes('coffee_high')) {
      // コーヒーを毎日2杯以上飲む → ナトリウム排出増 → ナトリウム +500mg
      targets.sodium = Math.max(targets.sodium, targets.sodium + 500);
    }
    // postmeal_sleepy（食後に眠くなる）はフラグとして保存のみ（将来的にカーボサイクル推奨などに使用）
  }

  // Phase 5: 栄養素目標値のカスタマイズ（手動設定の適用）
  if (customNutrientTargets) {
    Object.entries(customNutrientTargets).forEach(([nutrient, config]) => {
      if (config.mode === 'manual' && config.value !== undefined) {
        // 手動設定値で上書き
        (targets as Record<string, number>)[nutrient] = config.value;
      }
      // mode === 'auto' の場合は既存の計算ロジックを使用（何もしない）
    });
  }

  return targets;
}
