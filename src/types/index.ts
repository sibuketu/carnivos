/**
 * CarnivOS - Type Definitions
 *
 * データ構造、Recovery Protocol、Food types の型定義
 */

import {
  VIOLATION_TYPES,
  METABOLIC_STATUS,
  USER_GOALS,
  DIET_MODES,
} from '../constants/carnivore_constants';

/**
 * Violation Types
 */
export type ViolationType =
  | typeof VIOLATION_TYPES.SUGAR_CARBS
  | typeof VIOLATION_TYPES.SEED_OILS
  | typeof VIOLATION_TYPES.ALCOHOL
  | typeof VIOLATION_TYPES.OXALATES;

/**
 * Defrost Reminder
 */
export interface DefrostReminder {
  id: string;
  time: string; // ISO date string
  timeoutId?: number; // setTimeout ID
  protocolId?: string; // Recovery Protocol ID
  foodItems?: FoodItem[]; // Food items that require defrosting
}

/**
 * Metabolic Status
 */
export type MetabolicStatus =
  | typeof METABOLIC_STATUS.ADAPTED
  | typeof METABOLIC_STATUS.TRANSITIONING;

/**
 * User Goals
 */
export type UserGoal =
  | typeof USER_GOALS.HEALING
  | typeof USER_GOALS.PERFORMANCE
  | typeof USER_GOALS.WEIGHT_LOSS
  | typeof USER_GOALS.AUTOIMMUNE_HEALING;

/**
 * Diet Modes
 */
export type DietMode =
  | typeof DIET_MODES.STRICT_CARNIVORE
  | typeof DIET_MODES.KETOVORE
  | typeof DIET_MODES.LION_DIET;

/**
 * User Profile
 */
export interface UserProfile {
  // 必須項目
  gender: 'male' | 'female'; // 性別（必須）- 摂取基準が変わる
  height?: number; // 身長（cm）- 推奨
  weight?: number; // 体重（kg）- 推奨
  age?: number; // 年齢（推奨）- 栄養素の必要量に影響
  activityLevel?: 'sedentary' | 'moderate' | 'active'; // 活動量（推奨）- 栄養素の必要量に影響

  // 設定項目
  goal: UserGoal;
  dairyTolerance?: boolean; // 乳糖耐性（任意）
  metabolicStatus: MetabolicStatus;
  mode?: DietMode;

  // 女性特有の条件（栄養素の必要量に影響）
  isPregnant?: boolean; // 妊娠中
  isBreastfeeding?: boolean; // 授乳中
  isPostMenopause?: boolean; // 閉経後（女性の場合、鉄分の必要量が変わる）

  // ストレスレベル（マグネシウムの必要量に影響）
  stressLevel?: 'low' | 'moderate' | 'high'; // ストレスレベル

  // 追加の栄養素変動要因（優先順位: 推奨）
  sleepHours?: number; // 睡眠時間（時間/日）- マグネシウム・コルチゾールに影響
  exerciseIntensity?: 'none' | 'light' | 'moderate' | 'intense'; // 運動強度 - タンパク質・脂質・マグネシウムに影響
  exerciseFrequency?: 'none' | '1-2' | '3-4' | '5+'; // 運動頻度（週回数）
  thyroidFunction?: 'normal' | 'hypothyroid' | 'hyperthyroid'; // 甲状腺機能 - ヨウ素・セレンに影響
  sunExposureFrequency?: 'none' | 'rare' | 'occasional' | 'daily'; // 日光暴露頻度 - ビタミンD合成に影響

  // 追加の栄養素変動要因（優先順位: 任意）
  digestiveIssues?: boolean; // 消化器系の問題 - タンパク質・脂質の吸収に影響
  inflammationLevel?: 'low' | 'moderate' | 'high'; // 炎症レベル - オメガ3/6比率に影響
  mentalHealthStatus?: 'good' | 'moderate' | 'poor'; // メンタルヘルス状態 - マグネシウム・ビタミンDに影響
  supplementMagnesium?: boolean; // マグネシウムサプリメント摂取
  supplementVitaminD?: boolean; // ビタミンDサプリメント摂取
  supplementIodine?: boolean; // ヨウ素サプリメント摂取
  alcoholFrequency?: 'none' | 'rare' | 'weekly' | 'daily'; // アルコール摂取頻度 - マグネシウム・ビタミンB群に影響
  caffeineIntake?: 'none' | 'low' | 'moderate' | 'high'; // カフェイン摂取量 - マグネシウム・ストレスレベルに影響
  chronicDiseases?: string[]; // 慢性疾患のリスト - 各栄養素の必要量に影響

  // さらに追加の栄養素変動要因（余計なくらい大量に）
  bodyFatPercentage?: number; // 体脂肪率（%） - タンパク質必要量に影響
  muscleMass?: number; // 筋肉量（kg） - タンパク質必要量に影響
  // Phase 3: 体組成設定（LBMベースのタンパク質計算）
  bodyComposition?: 'muscular' | 'average' | 'high_fat' | { bodyFatPercentage: number }; // 体組成（3択 or 体脂肪率入力）
  metabolicRate?: 'slow' | 'normal' | 'fast'; // 代謝速度 - 全栄養素に影響
  insulinSensitivity?: 'low' | 'normal' | 'high'; // インスリン感受性 - ナトリウム・マグネシウムに影響
  cortisolLevel?: 'low' | 'normal' | 'high'; // コルチゾールレベル - マグネシウム・タンパク質に影響
  testosteroneLevel?: 'low' | 'normal' | 'high'; // テストステロンレベル（男性） - タンパク質・脂質に影響
  estrogenLevel?: 'low' | 'normal' | 'high'; // エストロゲンレベル（女性） - 鉄分・タンパク質に影響
  bloodPressure?: 'low' | 'normal' | 'high'; // 血圧 - ナトリウム・マグネシウムに影響
  heartRate?: 'low' | 'normal' | 'high'; // 安静時心拍数 - マグネシウム・タンパク質に影響
  recoveryTime?: 'fast' | 'normal' | 'slow'; // 回復時間 - タンパク質・マグネシウムに影響
  waterIntake?: number; // 水分摂取量（L/日） - ナトリウム・マグネシウムに影響
  saunaFrequency?: 'none' | 'rare' | 'weekly' | 'daily'; // サウナ頻度 - ナトリウム・マグネシウムに影響
  coldExposure?: 'none' | 'rare' | 'weekly' | 'daily'; // 寒冷暴露頻度 - タンパク質・脂質に影響
  workSchedule?: 'day' | 'night' | 'shift'; // 勤務スケジュール - ビタミンD・マグネシウムに影響
  timeZoneChanges?: 'none' | 'rare' | 'frequent'; // タイムゾーン変更頻度 - マグネシウム・ビタミンDに影響
  medicationUse?: string[]; // 薬物使用リスト - 各栄養素に影響
  supplementList?: string[]; // サプリメントリスト（詳細） - 各栄養素に影響
  foodAllergies?: string[]; // 食物アレルギー - タンパク質源に影響
  foodIntolerances?: string[]; // 食物不耐性 - 消化器系に影響
  gutHealth?: 'poor' | 'moderate' | 'good'; // 腸内環境 - タンパク質・脂質の吸収に影響
  liverFunction?: 'poor' | 'normal' | 'good'; // 肝機能 - タンパク質・ビタミンAに影響
  kidneyFunction?: 'poor' | 'normal' | 'good'; // 腎機能 - タンパク質・ナトリウムに影響
  boneDensity?: 'low' | 'normal' | 'high'; // 骨密度 - カルシウム・マグネシウム・ビタミンDに影響
  jointHealth?: 'poor' | 'moderate' | 'good'; // 関節の健康 - オメガ3・マグネシウムに影響
  skinCondition?: 'poor' | 'moderate' | 'good'; // 肌の状態 - ビタミンA・タンパク質に影響
  hairHealth?: 'poor' | 'moderate' | 'good'; // 髪の健康 - タンパク質・鉄分・亜鉛に影響
  nailHealth?: 'poor' | 'moderate' | 'good'; // 爪の健康 - タンパク質・亜鉛に影響
  energyLevel?: 'low' | 'moderate' | 'high'; // エネルギーレベル - 全栄養素に影響
  focusLevel?: 'low' | 'moderate' | 'high'; // 集中力レベル - タンパク質・脂質に影響
  libido?: 'low' | 'normal' | 'high'; // 性欲 - タンパク質・脂質・亜鉛に影響
  sleepQuality?: 'poor' | 'moderate' | 'good'; // 睡眠の質 - マグネシウム・タンパク質に影響
  dreamFrequency?: 'none' | 'rare' | 'frequent'; // 夢の頻度 - 睡眠の質に影響
  snoring?: 'none' | 'mild' | 'severe'; // いびき - 睡眠の質に影響
  sleepApnea?: boolean; // 睡眠時無呼吸症候群 - 睡眠の質・マグネシウムに影響
  restlessLegs?: boolean; // むずむず脚症候群 - マグネシウム・鉄分に影響
  muscleCramps?: 'none' | 'rare' | 'frequent'; // 筋肉痙攣 - マグネシウム・ナトリウムに影響
  headaches?: 'none' | 'rare' | 'frequent'; // 頭痛 - マグネシウム・ナトリウムに影響
  migraines?: 'none' | 'rare' | 'frequent'; // 片頭痛 - マグネシウム・リボフラビンに影響
  brainFog?: 'none' | 'rare' | 'frequent'; // ブレインフォグ - タンパク質・脂質・ビタミンB群に影響
  memoryIssues?: 'none' | 'rare' | 'frequent'; // 記憶の問題 - タンパク質・脂質・ビタミンB群に影響
  moodSwings?: 'none' | 'rare' | 'frequent'; // 気分の変動 - マグネシウム・タンパク質・脂質に影響
  anxietyLevel?: 'low' | 'moderate' | 'high'; // 不安レベル - マグネシウム・タンパク質に影響
  depressionLevel?: 'low' | 'moderate' | 'high'; // うつレベル - マグネシウム・ビタミンD・オメガ3に影響
  adhd?: boolean; // ADHD - タンパク質・脂質・マグネシウムに影響
  autism?: boolean; // 自閉症 - タンパク質・脂質・マグネシウムに影響
  autoimmuneConditions?: string[]; // 自己免疫疾患 - 各栄養素に影響
  inflammatoryConditions?: string[]; // 炎症性疾患 - オメガ3・マグネシウムに影響
  hormonalImbalance?: boolean; // ホルモンバランスの乱れ - タンパク質・脂質・マグネシウムに影響
  pms?: boolean; // PMS（女性） - マグネシウム・ビタミンB群に影響
  menopauseSymptoms?: boolean; // 更年期症状（女性） - タンパク質・マグネシウム・ビタミンDに影響
  pcos?: boolean; // PCOS（女性） - インスリン感受性・タンパク質に影響
  endometriosis?: boolean; // 子宮内膜症（女性） - 炎症・オメガ3に影響
  fibroids?: boolean; // 子宮筋腫（女性） - 鉄分・タンパク質に影響
  osteoporosis?: boolean; // 骨粗鬆症 - カルシウム・マグネシウム・ビタミンDに影響
  arthritis?: boolean; // 関節炎 - オメガ3・マグネシウムに影響
  fibromyalgia?: boolean; // 線維筋痛症 - マグネシウム・タンパク質に影響
  chronicFatigue?: boolean; // 慢性疲労症候群 - タンパク質・マグネシウム・ビタミンB群に影響
  ibs?: boolean; // 過敏性腸症候群 - 消化器系・タンパク質に影響
  crohns?: boolean; // クローン病 - 消化器系・タンパク質・ビタミンB12に影響
  colitis?: boolean; // 大腸炎 - 消化器系・タンパク質に影響
  gerd?: boolean; // 逆流性食道炎 - 消化器系・タンパク質に影響
  gastritis?: boolean; // 胃炎 - 消化器系・タンパク質に影響
  leakyGut?: boolean; // リーキーガット - 消化器系・タンパク質に影響
  sibo?: boolean; // SIBO - 消化器系・タンパク質に影響
  candida?: boolean; // カンジダ - 消化器系・タンパク質に影響
  parasites?: boolean; // 寄生虫 - 消化器系・タンパク質・鉄分に影響
  hPylori?: boolean; // ピロリ菌 - 消化器系・タンパク質に影響
  gallbladderIssues?: boolean; // 胆嚢の問題 - 脂質の消化に影響
  pancreasIssues?: boolean; // 膵臓の問題 - タンパク質・脂質の消化に影響
  liverDisease?: boolean; // 肝疾患 - タンパク質・ビタミンAに影響
  kidneyDisease?: boolean; // 腎疾患 - タンパク質・ナトリウムに影響
  diabetes?: 'none' | 'type1' | 'type2' | 'prediabetes'; // 糖尿病 - 全栄養素に影響
  prediabetes?: boolean; // 糖尿病予備軍 - インスリン感受性に影響
  metabolicSyndrome?: boolean; // メタボリックシンドローム - 全栄養素に影響
  insulinResistance?: boolean; // インスリン抵抗性 - ナトリウム・マグネシウムに影響
  pcosInsulinResistance?: boolean; // PCOS関連インスリン抵抗性（女性） - タンパク質・脂質に影響
  hypoglycemia?: boolean; // 低血糖 - タンパク質・脂質に影響
  hyperglycemia?: boolean; // 高血糖 - 全栄養素に影響
  cholesterolLevel?: 'low' | 'normal' | 'high'; // コレステロールレベル - 脂質・タンパク質に影響
  triglycerides?: 'low' | 'normal' | 'high'; // トリグリセリド - 脂質・タンパク質に影響
  hdlCholesterol?: 'low' | 'normal' | 'high'; // HDLコレステロール - 脂質に影響
  ldlCholesterol?: 'low' | 'normal' | 'high'; // LDLコレステロール - 脂質に影響
  apolipoproteinB?: 'low' | 'normal' | 'high'; // ApoB - 脂質に影響
  lpA?: 'low' | 'normal' | 'high'; // Lp(a) - 脂質に影響
  homocysteine?: 'low' | 'normal' | 'high'; // ホモシステイン - ビタミンB群・タンパク質に影響
  crp?: 'low' | 'normal' | 'high'; // CRP（炎症マーカー） - オメガ3・マグネシウムに影響
  esr?: 'low' | 'normal' | 'high'; // ESR（炎症マーカー） - オメガ3・マグネシウムに影響
  ferritin?: 'low' | 'normal' | 'high'; // フェリチン - 鉄分に影響
  transferrin?: 'low' | 'normal' | 'high'; // トランスフェリン - 鉄分に影響
  ironSaturation?: 'low' | 'normal' | 'high'; // 鉄飽和度 - 鉄分に影響
  b12Level?: 'low' | 'normal' | 'high'; // ビタミンB12レベル - ビタミンB12に影響
  folateLevel?: 'low' | 'normal' | 'high'; // 葉酸レベル - 葉酸・ビタミンB群に影響
  vitaminDLevel?: 'low' | 'normal' | 'high'; // ビタミンDレベル - ビタミンDに影響
  vitaminALevel?: 'low' | 'normal' | 'high'; // ビタミンAレベル - ビタミンAに影響
  vitaminKLevel?: 'low' | 'normal' | 'high'; // ビタミンKレベル - ビタミンKに影響
  magnesiumLevel?: 'low' | 'normal' | 'high'; // マグネシウムレベル - マグネシウムに影響
  zincLevel?: 'low' | 'normal' | 'high'; // 亜鉛レベル - 亜鉛に影響
  copperLevel?: 'low' | 'normal' | 'high'; // 銅レベル - 銅に影響
  seleniumLevel?: 'low' | 'normal' | 'high'; // セレンレベル - セレン・甲状腺に影響
  iodineLevel?: 'low' | 'normal' | 'high'; // ヨウ素レベル - ヨウ素・甲状腺に影響
  calciumLevel?: 'low' | 'normal' | 'high'; // カルシウムレベル - カルシウム・マグネシウムに影響
  phosphorusLevel?: 'low' | 'normal' | 'high'; // リンレベル - リン・カルシウムに影響
  potassiumLevel?: 'low' | 'normal' | 'high'; // カリウムレベル - カリウム・ナトリウムに影響
  sodiumLevel?: 'low' | 'normal' | 'high'; // ナトリウムレベル - ナトリウムに影響
  chlorideLevel?: 'low' | 'normal' | 'high'; // 塩素レベル - ナトリウムに影響
  omega3Index?: 'low' | 'normal' | 'high'; // オメガ3インデックス - オメガ3に影響
  omega6To3Ratio?: 'low' | 'normal' | 'high'; // オメガ6/3比率 - オメガ3・オメガ6に影響
  dhaLevel?: 'low' | 'normal' | 'high'; // DHAレベル - オメガ3に影響
  epaLevel?: 'low' | 'normal' | 'high'; // EPAレベル - オメガ3に影響
  arachidonicAcid?: 'low' | 'normal' | 'high'; // アラキドン酸レベル - オメガ6に影響
  linoleicAcid?: 'low' | 'normal' | 'high'; // リノール酸レベル - オメガ6に影響

  // 言語設定
  language?: 'ja' | 'en' | 'fr' | 'de'; // 言語設定

  // カーニボア歴（Gemini提案：導入期判定用）
  // カーニボア歴（Gemini提案：導入期判定用）
  daysOnCarnivore?: number; // カーニボア継続日数
  carnivoreStartDate?: string; // ISO date string
  forceAdaptationMode?: boolean; // 適応期モード強制フラグ
  // Phase 4: 代謝ストレス指標
  metabolicStressIndicators?: string[];
  // Phase 5: 栄養素目標値のカスタマイズ
  customNutrientTargets?: Record<string, { mode: 'auto' | 'manual'; value?: number }>;

  // サブスクリプション管理
  trial_start_date?: string; // ISO date string - 7日間無料トライアル開始日
  subscription_status?: 'trial' | 'active' | 'canceled' | 'expired'; // サブスクリプションステータス
  subscription_id?: string; // Stripe subscription ID
  subscription_end_date?: string; // ISO date string - サブスクリプション終了日
}

export const defaultUserProfile: UserProfile = {
  gender: 'male',
  height: 170,
  weight: 70,
  age: 30,
  activityLevel: 'moderate',
  goal: USER_GOALS.HEALING,
  metabolicStatus: METABOLIC_STATUS.ADAPTED,
  mode: DIET_MODES.LION_DIET,
};

/**
 * Daily Status Metrics
 */
export interface DailyStatus {
  // 基本スコア
  sleepScore: number; // 0-100
  sleepHours?: number; // 睡眠時間（時間）
  sunMinutes: number; // 日光浴時間（分）
  activityLevel: 'high' | 'low' | 'moderate';
  stressLevel?: 'low' | 'medium' | 'high';

  // 排泄 (Bowel Movement)
  bowelMovement?: {
    status: 'normal' | 'constipated' | 'loose' | 'watery';
    bristolScale?: number; // 1-7
    frequency?: number; // 回数
    blood?: boolean; // 出血有無
    pain?: boolean; // 痛み有無
  };

  // 身体状態 (Physical)
  weight?: number; // 体重 (kg)
  bodyFatPercentage?: number; // 体脂肪率 (%)
  muscleMass?: number; // 筋肉量 (kg)
  waterWeight?: number; // 体水分率 (%)
  bodyTemperature?: number; // 体温 (℃)
  systolicBloodPressure?: number; // 収縮期血圧
  diastolicBloodPressure?: number; // 拡張期血圧
  heartRate?: number; // 安静時心拍数 (bpm)
  hrv?: number; // 心拍変動 (ms)
  oxygenSaturation?: number; // SpO2 (%)
  respiratoryRate?: number; // 呼吸数 (回/分)
  energyLevel?: number; // 1-10 (エネルギーレベル)
  physicalFatigue?: number; // 1-10 (身体的疲労感)
  muscleSoreness?: number; // 1-10 (筋肉痛)
  jointPain?: number; // 1-10 (関節痛)
  headache?: number; // 1-10 (頭痛)
  nausea?: number; // 1-10 (吐き気)
  bloating?: number; // 1-10 (腹部膨満感)
  skinCondition?: 'good' | 'dry' | 'oily' | 'acne' | 'rash'; // 肌の状態
  libido?: number; // 1-10 (性欲)

  // メンタル (Mental)
  mood?: 'great' | 'good' | 'neutral' | 'bad' | 'terrible'; // 気分
  anxiety?: number; // 1-10 (不安)
  depression?: number; // 1-10 (抑うつ)
  irritability?: number; // 1-10 (イライラ)
  focus?: number; // 1-10 (集中力)
  // 運動（日次記録・栄養目標の動的計算用）
  exerciseMinutes?: number; // 運動時間（分）
  exerciseIntensity?: 'none' | 'light' | 'moderate' | 'intense'; // 運動強度
  exerciseType?: string; // 運動種類（ウェイト、ランニング等）
  brainFog?: number; // 1-10 (ブレインフォグ)
  motivation?: number; // 1-10 (やる気)
  gratitude?: string; // 感謝日記（テキスト）

  // 睡眠詳細 (Sleep Detail)
  bedTime?: string; // 就床時刻 (HH:mm)
  wakeTime?: string; // 起床時刻 (HH:mm)
  sleepLatency?: number; // 入眠潜時 (分)
  remSleep?: number; // REM睡眠 (分)
  deepSleep?: number; // 深い睡眠 (分)
  awakeCount?: number; // 中途覚醒回数
  snoring?: boolean; // いびき
  dreamContent?: string; // 夢の内容

  // 社交 (Social)
  socialInteractions?: number; // 社交回数（人との会話など）
  loneliness?: number; // 1-10 (孤独感)
  socialSatisfaction?: number; // 1-10 (社交満足度)
  sharedMeal?: boolean; // 誰かと食事をしたか
  partnerIntimacy?: boolean; // パートナーとの親密な時間

  // 環境 (Environment)
  weather?: 'sunny' | 'cloudy' | 'rainy' | 'snowy'; // 天気
  temperature?: number; // 気温 (℃)
  humidity?: number; // 湿度 (%)
  airQuality?: 'good' | 'moderate' | 'unhealthy'; // 空気質
  noiseLevel?: 'quiet' | 'moderate' | 'noisy'; // 騒音レベル
  blueLightExposure?: number; // 夜間のブルーライト暴露 (1-10)

  // その他 (Other)
  meditationMinutes?: number; // 瞑想時間 (分)
  coldExposureMinutes?: number; // 寒冷暴露時間 (分)
  saunaMinutes?: number; // サウナ時間 (分)
  groundingMinutes?: number; // アーシング時間 (分)
  fastingHours?: number; // 断食時間 (時間)
  ketones?: number; // 血中ケトン体 (mmol/L)
  glucose?: number; // 血糖値 (mg/dL)
}

/**
 * Food Item
 */
export interface FoodItem {
  item: string;
  amount: number;
  unit: 'g' | 'serving' | 'piece' | '個';
  type: 'animal' | 'plant' | 'trash' | 'ruminant' | 'dairy';
  eggCookingMethod?: 'raw' | 'cooked'; // 卵の調理法（生/加熱）
  biotinBlocked?: boolean; // ビタミンB7（ビオチン）の吸収阻害フラグ（生卵の場合）
  nutrients?: {
    protein?: number;
    fat?: number;
    carbs?: number;
    netCarbs?: number;
    hemeIron?: number;
    nonHemeIron?: number;
    vitaminA?: number;
    vitaminC?: number;
    vitaminK?: number;
    vitaminB1?: number;
    vitaminB2?: number;
    vitaminB3?: number;
    vitaminB6?: number;
    vitaminB12?: number;
    vitaminB7?: number; // ビタミンB7（ビオチン）（μg）
    vitaminE?: number;
    zinc?: number;
    sodium?: number;
    magnesium?: number;
    calcium?: number;
    phosphorus?: number;
    selenium?: number;
    glycine?: number; // g（コラーゲン、皮、骨、軟骨由来）
    methionine?: number; // g（筋肉由来）
    copper?: number;
    manganese?: number;
    fiber?: number;
    // 脂溶性ビタミン（カーニボア重要）
    // vitaminA?: number; // IU (重複を削除)
    vitaminD?: number; // IU
    vitaminK2?: number; // μg (MK-4)
    omega3?: number; // g
    omega6?: number; // g
    choline?: number; // mg
    potassium?: number; // mg
    // アミノ酸（カーニボア重要）
    taurine?: number; // mg（タウリン、内臓・魚・肉に豊富）
    // その他のビタミン・ミネラル（余計なくらい大量に）
    vitaminB5?: number; // mg（パントテン酸）
    vitaminB9?: number; // μg（葉酸、Folate）
    chromium?: number; // μg（クロム）
    molybdenum?: number; // μg（モリブデン）
    fluoride?: number; // mg（フッ素）
    chloride?: number; // mg（塩素）
    boron?: number; // mg（ホウ素）
    nickel?: number; // mg（ニッケル）
    silicon?: number; // mg（ケイ素）
    vanadium?: number; // μg（バナジウム）
    iodine?: number; // μg（ヨウ素）
    // 抗栄養素（カーニボア重要：植物性食品の避けるべき理由）
    phytates?: number; // mg（フィチン酸）
    polyphenols?: number; // mg（ポリフェノール）
    flavonoids?: number; // mg（フラボノイド）
    anthocyanins?: number; // mg（アントシアニン、フラボノイドの一種、色素成分）
    oxalates?: number; // mg（シュウ酸）
    lectins?: number; // mg（レクチン）
    saponins?: number; // mg（サポニン）
    goitrogens?: number; // mg（ゴイトロゲン）
    tannins?: number; // mg（タンニン）
    trypsinInhibitors?: number; // mg（トリプシン阻害物質、豆類に多い）
    proteaseInhibitors?: number; // mg（プロテアーゼ阻害物質）
    cyanogenicGlycosides?: number; // mg（シアノグリコシド、アミグダリンなど）
    solanine?: number; // mg（ソラニン、ナス科に含まれる）
    chaconine?: number; // mg（チャコニン、ナス科に含まれる）
  };
}

/**
 * Calculated Metrics
 */
export interface CalculatedMetrics {
  netCarbs: number;
  effectiveVitC: number;
  vitCRequirement: number;
  effectiveVitK: number;
  effectiveIron: number;
  ironRequirement: number; // 性別に応じた必要量
  effectiveZinc: number;
  fiberTotal: number;
  sodiumTotal: number;
  magnesiumTotal: number;
  effectiveProtein: number; // 有効タンパク質（バイオアベイラビリティ適用後、動物性+植物性）
  animalEffectiveProtein?: number; // 動物性タンパク質のみ（有効タンパク質）
  proteinTotal: number; // 総タンパク質
  proteinRequirement: number; // タンパク質必要量（体重ベース）
  fatTotal: number; // 総脂質
  effectiveFat?: number; // Gemini提案: 有効脂質（オメガ6ペナルティ適用後）
  effectiveVitaminA?: number; // Gemini提案: 有効ビタミンA（バイオアベイラビリティ適用後）
  effectiveCalcium?: number; // Gemini提案: 有効カルシウム（ビタミンD考慮後）
  omegaRatio?: number; // Gemini提案: オメガ6:3比率
  omegaRatioStatus?: 'excellent' | 'good' | 'warning' | 'danger'; // Gemini提案: オメガ比率の状態
  inflammationScore?: number; // Gemini提案: 炎症スコア（オメガ6:3比率）
  electrolyteBalance?: { isBalanced: boolean; warning?: string }; // Gemini提案: 電解質バランス
  // 追加栄養素（全栄養素表示用）
  vitaminB12Total?: number;
  vitaminB7Total?: number; // ビタミンB7（ビオチン）合計（μg）
  biotinBlocked?: boolean; // ビタミンB7（ビオチン）の吸収阻害フラグ（生卵を含む場合）
  // タウリン（カーニボア重要：内臓・魚・肉に豊富）
  taurineTotal?: number; // mg
  vitaminB1Total?: number;
  vitaminB2Total?: number;
  vitaminB3Total?: number;
  vitaminB5Total?: number; // mg（パントテン酸）
  vitaminB6Total?: number;
  vitaminB9Total?: number; // μg（葉酸、Folate）
  vitaminETotal?: number;
  calciumTotal?: number;
  phosphorusTotal?: number;
  seleniumTotal?: number;
  copperTotal?: number;
  manganeseTotal?: number;
  // 脂溶性ビタミン（合計値）
  vitaminATotal?: number; // IU
  vitaminDTotal?: number; // IU
  vitaminK2Total?: number; // μg (MK-4)
  omega3Total?: number; // g
  omega6Total?: number; // g
  cholineTotal?: number; // mg
  potassiumTotal?: number; // mg
  iodineTotal?: number; // μg
  // 比率（カーニボア重要）
  calciumPhosphorusRatio?: number; // カルシウム:リン比率（推奨: 1:1以上）
  // グリシン:メチオニン比（カーニボア重要：長寿の視点）
  glycineTotal?: number; // g（コラーゲン、皮、骨、軟骨由来）
  methionineTotal?: number; // g（筋肉由来）
  glycineMethionineRatio?: number; // 比率（推奨: 1:1以上）
  // 抗栄養素（カーニボア重要：植物性食品の避けるべき理由）
  phytatesTotal?: number; // mg（フィチン酸）
  polyphenolsTotal?: number; // mg（ポリフェノール）
  flavonoidsTotal?: number; // mg（フラボノイド）
  anthocyaninsTotal?: number; // mg（アントシアニン、フラボノイドの一種、色素成分）
  oxalatesTotal?: number; // mg（シュウ酸）
  lectinsTotal?: number; // mg（レクチン）
  saponinsTotal?: number; // mg（サポニン）
  goitrogensTotal?: number; // mg（ゴイトロゲン）
  tanninsTotal?: number; // mg（タンニン）
  trypsinInhibitorsTotal?: number; // mg（トリプシン阻害物質）
  proteaseInhibitorsTotal?: number; // mg（プロテアーゼ阻害物質）
  cyanogenicGlycosidesTotal?: number; // mg（シアノグリコシド）
  solanineTotal?: number; // mg（ソラニン、ナス科）
  chaconineTotal?: number; // mg（チャコニン、ナス科）
  // その他のミネラル（余計なくらい大量に）
  chromiumTotal?: number; // μg（クロム）
  molybdenumTotal?: number; // μg（モリブデン）
  fluorideTotal?: number; // mg（フッ素）
  chlorideTotal?: number; // mg（塩素）
  boronTotal?: number; // mg（ホウ素）
  nickelTotal?: number; // mg（ニッケル）
  siliconTotal?: number; // mg（ケイ素）
  vanadiumTotal?: number; // μg（バナジウム）
  // 植物性タンパク質・植物油（Avoid Zone用）
  plantProteinTotal?: number; // g（植物性タンパク質）
  vegetableOilTotal?: number; // g（植物油）
  // 違反検出
  hasViolation?: boolean; // カーニボア違反があるかどうか
  violationTypes?: string[]; // 違反の種類（例: ['plant_food', 'high_carbs']）
}

/**
 * Recovery Protocol
 */
export interface TodoItem {
  id: string;
  title: string;
  description?: string;
  actionType: 'timer' | 'add_food' | 'set_protocol' | 'open_screen' | 'update_input' | 'suggest_target' | 'custom';
  actionParams?: Record<string, unknown>;
  isCompleted: boolean;
  // 後方互換性のため（コード内でaction.typeとaction.paramsを使っている場合）
  action?: {
    type: 'timer' | 'add_food' | 'set_protocol' | 'open_screen' | 'update_input' | 'suggest_target' | 'custom';
    params?: Record<string, unknown>;
  };
}

export interface RecoveryProtocol {
  violationType: ViolationType;
  isActive: boolean;
  fastingTargetHours: number;
  activities?: string[];
  dietRecommendations: string[];
  supplements?: string[];
  warnings?: string[];
  protocolId?: string;
  targetFastEnd?: string; // ISO date string
  todos?: TodoItem[]; // Recovery Quest用のTodoリスト
}

/**
 * Daily Log
 */
export interface DailyLog {
  date: string; // ISO date string (YYYY-MM-DD)
  status: DailyStatus;
  fuel: FoodItem[];
  calculatedMetrics?: CalculatedMetrics; // ✅ オプショナルに変更（useMemoで計算するため）
  recoveryProtocol?: RecoveryProtocol;
  diary?: string; // 日記（自由入力、メンタル・体調・身体能力など総合的に記録）
  weight?: number; // 体重（kg）- 日次記録
  bodyFatPercentage?: number; // 体脂肪率（%）- 日次記録
  waterIntake?: number; // 飲んだ水の量（ml/日）
}

/**
 * Trash Intake
 */
export interface TrashIntake {
  type: ViolationType;
  source: string;
  severity: 'low' | 'medium' | 'high';
}
