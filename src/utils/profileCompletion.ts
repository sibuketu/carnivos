/**
 * CarnivOS - Profile Completion Calculator
 *
 * プロフィール完成度を計算するユーティリティ
 */

import type { UserProfile } from '../types';

export type FieldCategory =
  | 'basic'
  | 'body'
  | 'health'
  | 'lifestyle'
  | 'disease'
  | 'lab'
  | 'advanced';

interface ProfileFieldConfig {
  key: keyof UserProfile;
  category: FieldCategory;
  priority: 'required' | 'recommended' | 'optional';
  weight: number; // 重要度（required: 3, recommended: 2, optional: 1）
}

const PROFILE_FIELDS: ProfileFieldConfig[] = [
  // 基本情報（必須）
  { key: 'gender', category: 'basic', priority: 'required', weight: 3 },
  { key: 'goal', category: 'basic', priority: 'required', weight: 3 },
  { key: 'metabolicStatus', category: 'basic', priority: 'required', weight: 3 },

  // 基本情報（推奨）
  { key: 'height', category: 'basic', priority: 'recommended', weight: 2 },
  { key: 'weight', category: 'basic', priority: 'recommended', weight: 2 },
  { key: 'age', category: 'basic', priority: 'recommended', weight: 2 },
  { key: 'mode', category: 'basic', priority: 'recommended', weight: 2 },

  // 体組成（推奨）
  { key: 'bodyComposition', category: 'body', priority: 'recommended', weight: 2 },
  { key: 'activityLevel', category: 'body', priority: 'recommended', weight: 2 },
  { key: 'exerciseIntensity', category: 'body', priority: 'recommended', weight: 2 },
  { key: 'exerciseFrequency', category: 'body', priority: 'recommended', weight: 2 },

  // 健康状態（推奨）
  { key: 'stressLevel', category: 'health', priority: 'recommended', weight: 2 },
  { key: 'sleepHours', category: 'health', priority: 'recommended', weight: 2 },
  { key: 'thyroidFunction', category: 'health', priority: 'recommended', weight: 2 },
  { key: 'sunExposureFrequency', category: 'health', priority: 'recommended', weight: 2 },

  // 女性特有（推奨・任意）
  { key: 'isPregnant', category: 'health', priority: 'recommended', weight: 2 },
  { key: 'isBreastfeeding', category: 'health', priority: 'recommended', weight: 2 },
  { key: 'isPostMenopause', category: 'health', priority: 'recommended', weight: 2 },

  // ライフスタイル（任意）
  { key: 'dairyTolerance', category: 'lifestyle', priority: 'optional', weight: 1 },
  { key: 'digestiveIssues', category: 'lifestyle', priority: 'optional', weight: 1 },
  { key: 'caffeineIntake', category: 'lifestyle', priority: 'optional', weight: 1 },
  { key: 'alcoholFrequency', category: 'lifestyle', priority: 'optional', weight: 1 },
  { key: 'supplementMagnesium', category: 'lifestyle', priority: 'optional', weight: 1 },
  { key: 'supplementVitaminD', category: 'lifestyle', priority: 'optional', weight: 1 },
  { key: 'supplementIodine', category: 'lifestyle', priority: 'optional', weight: 1 },

  // 疾患・症状（任意）
  { key: 'inflammationLevel', category: 'disease', priority: 'optional', weight: 1 },
  { key: 'mentalHealthStatus', category: 'disease', priority: 'optional', weight: 1 },
  { key: 'diabetes', category: 'disease', priority: 'optional', weight: 1 },
  { key: 'autoimmuneConditions', category: 'disease', priority: 'optional', weight: 1 },
  { key: 'chronicDiseases', category: 'disease', priority: 'optional', weight: 1 },

  // 血液検査値（任意）
  { key: 'vitaminDLevel', category: 'lab', priority: 'optional', weight: 1 },
  { key: 'b12Level', category: 'lab', priority: 'optional', weight: 1 },
  { key: 'ferritin', category: 'lab', priority: 'optional', weight: 1 },
  { key: 'omega3Index', category: 'lab', priority: 'optional', weight: 1 },
];

/**
 * フィールドが入力されているかチェック
 */
function isFieldFilled(profile: UserProfile | null, key: keyof UserProfile): boolean {
  if (!profile) return false;

  const value = profile[key];

  // undefined, nullは未入力
  if (value === undefined || value === null) return false;

  // boolean型はfalseでも入力済みとみなす
  if (typeof value === 'boolean') return true;

  // 数値型は0以外を入力済みとみなす
  if (typeof value === 'number') return value > 0;

  // 文字列型は空文字列でない場合に入力済み
  if (typeof value === 'string') return value.trim() !== '';

  // 配列型は空配列でない場合に入力済み
  if (Array.isArray(value)) return value.length > 0;

  // オブジェクト型はnull以外を入力済みとみなす
  if (typeof value === 'object') return true;

  return false;
}

/**
 * プロフィール完成度を計算（0-100%）
 */
export function calculateProfileCompletion(profile: UserProfile | null): number {
  if (!profile) return 0;

  let totalWeight = 0;
  let filledWeight = 0;

  for (const field of PROFILE_FIELDS) {
    totalWeight += field.weight;
    if (isFieldFilled(profile, field.key)) {
      filledWeight += field.weight;
    }
  }

  if (totalWeight === 0) return 0;

  return Math.round((filledWeight / totalWeight) * 100);
}

/**
 * カテゴリ別の完成度を計算
 */
export function calculateCategoryCompletion(
  profile: UserProfile | null,
  category: FieldCategory
): number {
  if (!profile) return 0;

  const categoryFields = PROFILE_FIELDS.filter((f) => f.category === category);
  if (categoryFields.length === 0) return 0;

  let totalWeight = 0;
  let filledWeight = 0;

  for (const field of categoryFields) {
    totalWeight += field.weight;
    if (isFieldFilled(profile, field.key)) {
      filledWeight += field.weight;
    }
  }

  if (totalWeight === 0) return 0;

  return Math.round((filledWeight / totalWeight) * 100);
}

/**
 * カテゴリ名を取得
 */
export function getCategoryName(category: FieldCategory): string {
  const names: Record<FieldCategory, string> = {
    basic: '基本情報',
    body: '体組成',
    health: '健康状態',
    lifestyle: 'ライフスタイル',
    disease: '疾患・症状',
    lab: '血液検査値',
    advanced: '詳細設定',
  };
  return names[category];
}

/**
 * カテゴリの優先度を取得（カテゴリ内の最高優先度）
 */
export function getCategoryPriority(
  category: FieldCategory
): 'required' | 'recommended' | 'optional' {
  const categoryFields = PROFILE_FIELDS.filter((f) => f.category === category);
  if (categoryFields.some((f) => f.priority === 'required')) return 'required';
  if (categoryFields.some((f) => f.priority === 'recommended')) return 'recommended';
  return 'optional';
}
