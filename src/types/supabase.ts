/**
 * Primal Logic - Supabase Database Types
 *
 * Supabaseデータベースのテーブル型定義
 */

/**
 * daily_logs テーブルの型定義
 */
export interface DailyLogRow {
  id?: string;
  user_id: string;
  date: string; // ISO date string (YYYY-MM-DD)
  status: {
    sleep_score: number;
    sleep_hours?: number;
    sun_minutes: number;
    activity_level: 'high' | 'moderate' | 'low';
    stress_level?: 'low' | 'medium' | 'high';
    bowel_movement?: {
      status: 'normal' | 'constipated' | 'loose' | 'watery';
      bristol_scale?: number;
      notes?: string;
    };
    water_intake?: number; // 飲んだ水（ml）
  };
  fuel: Array<{
    item: string;
    amount: number;
    unit: 'g' | 'serving' | 'piece' | '個';
    type: 'animal' | 'plant' | 'trash' | 'ruminant' | 'dairy';
    nutrients?: Record<string, number>;
  }>;
  calculated_metrics: {
    net_carbs: number;
    effective_vit_c: number;
    vit_c_requirement: number;
    effective_vit_k: number;
    effective_iron: number;
    iron_requirement: number;
    effective_zinc: number;
    fiber_total: number;
    sodium_total: number;
    magnesium_total: number;
    effective_protein: number;
    protein_total: number;
    protein_requirement: number;
    fat_total: number;
    [key: string]: number | undefined;
  };
  recovery_protocol?: {
    violation_type: string;
    is_active: boolean;
    fasting_target_hours: number;
    activities?: string[];
    diet_recommendations: string[];
    supplements?: string[];
    warnings?: string[];
    protocol_id?: string;
    target_fast_end?: string;
  };
  diary?: string; // 日記（自由入力）
  weight?: number; // 体重（kg）- 日次記録
  body_fat_percentage?: number; // 体脂肪率（%）- 日次記録
  created_at?: string;
  updated_at?: string;
}

/**
 * profiles テーブルの型定義
 */
export interface ProfileRow {
  id?: string;
  user_id: string;
  gender: 'male' | 'female';
  height?: number;
  weight?: number;
  age?: number;
  activity_level?: 'sedentary' | 'moderate' | 'active';
  goal: string;
  dairy_tolerance?: boolean;
  metabolic_status: 'adapted' | 'transitioning';
  mode?: string;
  target_carbs?: number;
  is_pregnant?: boolean;
  is_breastfeeding?: boolean;
  is_post_menopause?: boolean;
  stress_level?: 'low' | 'moderate' | 'high';
  sleep_hours?: number;
  exercise_intensity?: 'none' | 'light' | 'moderate' | 'intense';
  exercise_frequency?: 'none' | '1-2' | '3-4' | '5+';
  thyroid_function?: 'normal' | 'hypothyroid' | 'hyperthyroid';
  sun_exposure_frequency?: 'none' | 'rare' | 'occasional' | 'daily';
  digestive_issues?: boolean;
  inflammation_level?: 'low' | 'moderate' | 'high';
  mental_health_status?: 'good' | 'moderate' | 'poor';
  supplement_magnesium?: boolean;
  supplement_vitamin_d?: boolean;
  supplement_iodine?: boolean;
  alcohol_frequency?: 'none' | 'rare' | 'weekly' | 'daily';
  caffeine_intake?: 'none' | 'low' | 'moderate' | 'high';
  chronic_diseases?: string[];
  language?: 'ja' | 'en' | 'fr' | 'de';
  created_at?: string;
  updated_at?: string;
}

/**
 * streaks テーブルの型定義
 */
export interface StreakRow {
  id?: string;
  user_id: string;
  current_streak: number;
  longest_streak: number;
  last_log_date: string; // ISO date string
  created_at?: string;
  updated_at?: string;
}

/**
 * tips_history テーブルの型定義（オプション）
 */
export interface TipHistoryRow {
  id?: string;
  user_id: string;
  tip_id: string;
  tip_title: string;
  tip_content: string;
  tip_category?: string;
  viewed_at: string; // ISO timestamp
  created_at?: string;
}
