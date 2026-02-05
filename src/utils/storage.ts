/**
 * Primal Logic - Storage Utility (Web版)
 *
 * SupabaseとlocalStorageの両方に対応したデータ永続化
 * Supabaseが利用可能な場合はSupabaseを優先、フォールバックとしてlocalStorageを使用
 */

import type {
  DailyLog,
  UserProfile,
  UserGoal,
  MetabolicStatus,
  DietMode,
  ViolationType,
  CalculatedMetrics,
} from '../types';
import type { DailyLogRow, ProfileRow } from '../types/supabase';
import { supabase, isSupabaseAvailable } from '../lib/supabaseClient';
import { logError } from './errorHandler';

// 匿名ユーザーIDを取得（localStorageに保存）
function getUserId(): string {
  let userId = localStorage.getItem('primal_logic_user_id');
  if (!userId) {
    userId = `anon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('primal_logic_user_id', userId);
  }
  return userId;
}

const STORAGE_KEYS = {
  DAILY_LOGS: '@primal_logic:daily_logs',
  USER_PROFILE: '@primal_logic:user_profile',
  CURRENT_DATE: '@primal_logic:current_date',
} as const;

/**
 * Save daily log to storage (Supabase優先、フォールバック: localStorage)
 */
export async function saveDailyLog(log: DailyLog): Promise<void> {
  const userId = getUserId();

  // Supabaseが利用可能な場合
  if (isSupabaseAvailable() && supabase) {
    try {
      const logRow: DailyLogRow = {
        user_id: userId,
        date: log.date,
        status: {
          sleep_score: log.status.sleepScore,
          sleep_hours: log.status.sleepHours, // 新規追加
          sun_minutes: log.status.sunMinutes,
          activity_level: log.status.activityLevel,
          stress_level: log.status.stressLevel,
          bowel_movement: log.status.bowelMovement
            ? {
              status: log.status.bowelMovement.status,
              bristol_scale: log.status.bowelMovement.bristolScale,
              notes: log.status.bowelMovement.notes,
            }
            : undefined,
          water_intake: log.waterIntake,
        },
        fuel: log.fuel.map((f) => ({
          item: f.item,
          amount: f.amount,
          unit: f.unit,
          type: f.type,
          nutrients: f.nutrients || {},
        })),
        calculated_metrics: log.calculatedMetrics ? {
          net_carbs: log.calculatedMetrics.netCarbs,
          effective_vit_c: log.calculatedMetrics.effectiveVitC,
          vit_c_requirement: log.calculatedMetrics.vitCRequirement,
          effective_vit_k: log.calculatedMetrics.effectiveVitK,
          effective_iron: log.calculatedMetrics.effectiveIron,
          iron_requirement: log.calculatedMetrics.ironRequirement,
          effective_zinc: log.calculatedMetrics.effectiveZinc,
          fiber_total: log.calculatedMetrics.fiberTotal,
          sodium_total: log.calculatedMetrics.sodiumTotal,
          magnesium_total: log.calculatedMetrics.magnesiumTotal,
          effective_protein: log.calculatedMetrics.effectiveProtein,
          protein_total: log.calculatedMetrics.proteinTotal,
          protein_requirement: log.calculatedMetrics.proteinRequirement,
          fat_total: log.calculatedMetrics.fatTotal,
          ...Object.fromEntries(
            Object.entries(log.calculatedMetrics)
              .filter(
                ([key]) =>
                  ![
                    'netCarbs',
                    'effectiveVitC',
                    'vitCRequirement',
                    'effectiveVitK',
                    'effectiveIron',
                    'ironRequirement',
                    'effectiveZinc',
                    'fiberTotal',
                    'sodiumTotal',
                    'magnesiumTotal',
                    'effectiveProtein',
                    'proteinTotal',
                    'proteinRequirement',
                    'fatTotal',
                  ].includes(key)
              )
              .map(([key, value]) => [
                key
                  .toLowerCase()
                  .replace(/([A-Z])/g, '_$1')
                  .toLowerCase(),
                value,
              ])
          ),
        } : {},
        recovery_protocol: log.recoveryProtocol
          ? {
            violation_type: log.recoveryProtocol.violationType,
            is_active: log.recoveryProtocol.isActive,
            fasting_target_hours: log.recoveryProtocol.fastingTargetHours,
            activities: log.recoveryProtocol.activities,
            diet_recommendations: log.recoveryProtocol.dietRecommendations,
            supplements: log.recoveryProtocol.supplements,
            warnings: log.recoveryProtocol.warnings,
            protocol_id: log.recoveryProtocol.protocolId,
            target_fast_end: log.recoveryProtocol.targetFastEnd,
          }
          : undefined,
        diary: log.diary,
        weight: log.weight,
        body_fat_percentage: log.bodyFatPercentage,
      };

      // Upsert操作（存在する場合は更新、存在しない場合は挿入）
      const { error } = await supabase.from('daily_logs').upsert(
        {
          ...logRow,
          user_id: userId,
          date: log.date,
        },
        {
          onConflict: 'user_id,date',
        }
      );

      if (error) {
        logError(error, { component: 'storage', action: 'saveDailyLog', step: 'supabase' });
        throw error;
      }

      // 成功した場合、localStorageにもバックアップを保存
      await saveToLocalStorage(log);
      return;
    } catch (error) {
      logError(error, { component: 'storage', action: 'saveDailyLog', step: 'fallback' });
      // フォールバック: localStorageに保存
    }
  }

  // localStorageに保存（Supabaseが利用不可、またはエラー時）
  await saveToLocalStorage(log);

  // キャッシュをクリア（次回getDailyLogs()で最新データを取得）
  clearDailyLogsCache();
}

/**
 * localStorageに保存（内部関数）
 * デバッグモードがONの場合でも、実際のデータを保存する
 */
async function saveToLocalStorage(log: DailyLog): Promise<void> {
  try {
    // 直接localStorageから取得（Supabaseを経由しない、デバッグデータも無視）
    const rawData = localStorage.getItem(STORAGE_KEYS.DAILY_LOGS);
    let logs: DailyLog[] = [];
    if (rawData) {
      try {
        logs = JSON.parse(rawData) as DailyLog[];
      } catch {
        // パースエラーの場合は空配列から開始
        logs = [];
      }
    }

    const existingIndex = logs.findIndex((l) => l.date === log.date);

    if (existingIndex >= 0) {
      logs[existingIndex] = log;
    } else {
      logs.push(log);
    }

    localStorage.setItem(STORAGE_KEYS.DAILY_LOGS, JSON.stringify(logs));

    // デバッグモードがONの場合、キャッシュをクリアして次回のgetDailyLogs()で再生成されるようにする
    // ただし、今日のログは実際のデータを優先する
    cachedDebugData = null;
  } catch (error) {
    logError(error, { component: 'storage', action: 'saveToLocalStorage' });
    throw error;
  }
}

/**
 * Get daily log by date (Supabase優先、フォールバック: localStorage)
 */
export async function getDailyLogByDate(date: string): Promise<DailyLog | null> {
  const userId = getUserId();

  // Supabaseが利用可能な場合
  if (isSupabaseAvailable() && supabase) {
    try {
      const { data, error } = await supabase
        .from('daily_logs')
        .select('*')
        .eq('user_id', userId)
        .eq('date', date)
        .single();

      if (error && error.code !== 'PGRST116') {
        // PGRST116は「行が見つからない」エラー
        logError(error, { component: 'storage', action: 'getDailyLogByDate', step: 'supabase' });
        // フォールバック: localStorageから取得
        return getFromLocalStorage(date);
      }

      if (data) {
        return convertLogRowToDailyLog(data as DailyLogRow);
      }
    } catch (error) {
      logError(error, { component: 'storage', action: 'getDailyLogByDate', step: 'fallback' });
    }
  }

  // localStorageから取得
  return getFromLocalStorage(date);
}

/**
 * localStorageから取得（内部関数）
 */
async function getFromLocalStorage(date: string): Promise<DailyLog | null> {
  try {
    const logs = await getDailyLogs();
    return logs.find((log) => log.date === date) || null;
  } catch (error) {
    logError(error, { component: 'storage', action: 'getFromLocalStorage' });
    return null;
  }
}

/**
 * Get all daily logs (Supabase優先、フォールバック: localStorage)
 * デバッグモードがONの場合は仮データを返す
 */
// デバッグデータのキャッシュ（毎回生成しないように）
let cachedDebugData: DailyLog[] | null = null;

// デバッグデータをクリアする関数（必要に応じて）
export function clearDebugDataCache() {
  cachedDebugData = null;
}

// 通常モードのキャッシュ（無限ループ防止）
let cachedNormalData: DailyLog[] | null = null;
let lastCacheTime: number = 0;
const CACHE_DURATION = 2000; // 2秒間キャッシュ

export function clearDailyLogsCache() {
  cachedNormalData = null;
  lastCacheTime = 0;
}

// 呼び出し頻度制限（無限ループ防止）
let isGettingLogs = false;
let lastGetTime = 0;
const MIN_GET_INTERVAL = 1000; // 1秒以内の連続呼び出しを防ぐ

export async function getDailyLogs(): Promise<DailyLog[]> {
  // 呼び出し頻度制限（1秒以内の連続呼び出しを防ぐ）
  const now = Date.now();
  if (isGettingLogs || (now - lastGetTime) < MIN_GET_INTERVAL) {
    // 既に取得中、または1秒以内の場合はキャッシュを返す
    if (cachedDebugData) {
      return cachedDebugData;
    }
    if (cachedNormalData) {
      return cachedNormalData;
    }
    // キャッシュがない場合は待機（既に取得中の場合は待つ）
    if (isGettingLogs) {
      // 最大500ms待機
      await new Promise((resolve) => setTimeout(resolve, 500));
      if (cachedDebugData) return cachedDebugData;
      if (cachedNormalData) return cachedNormalData;
    }
    // キャッシュがなく、取得中でもない場合は空配列を返す（無限ループ防止）
    return [];
  }

  isGettingLogs = true;
  lastGetTime = now;

  try {
    // デバッグモードチェック
    const debugMode = localStorage.getItem('settings_debug_mode');
    // JSON.parseでbooleanに変換（'true'文字列ではなく）
    const isDebugMode =
      debugMode === 'true' || (debugMode !== null && JSON.parse(debugMode) === true);

    if (isDebugMode) {
      // キャッシュがあればそれを使用（毎回ランダム生成しない）
      if (cachedDebugData) {
        isGettingLogs = false;
        return cachedDebugData;
      }
      const { generateDebugData } = await import('./debugData');
      cachedDebugData = generateDebugData();
      isGettingLogs = false;
      return cachedDebugData;
    }

    // 通常モード: キャッシュをチェック（2秒以内ならキャッシュを返す）
    const cacheNow = Date.now();
    if (cachedNormalData && (cacheNow - lastCacheTime) < CACHE_DURATION) {
      isGettingLogs = false;
      return cachedNormalData;
    }

    // デバッグモードがOFFの場合はキャッシュをクリア
    cachedDebugData = null;

    const userId = getUserId();
    let result: DailyLog[];

    // Supabaseが利用可能な場合
    if (isSupabaseAvailable() && supabase) {
      try {
        const { data, error } = await supabase
          .from('daily_logs')
          .select('*')
          .eq('user_id', userId)
          .order('date', { ascending: false });

        if (error) {
          logError(error, { component: 'storage', action: 'getDailyLogs', step: 'supabase' });
          // フォールバック: localStorageから取得
          result = getFromLocalStorageAll();
        } else if (data && data.length > 0) {
          result = data.map((row) => convertLogRowToDailyLog(row as DailyLogRow));
        } else {
          result = getFromLocalStorageAll();
        }
      } catch (error) {
        logError(error, { component: 'storage', action: 'getDailyLogs', step: 'fallback' });
        result = getFromLocalStorageAll();
      }
    } else {
      // localStorageから取得
      result = getFromLocalStorageAll();
    }

    // キャッシュを更新
    cachedNormalData = result;
    lastCacheTime = Date.now();

    isGettingLogs = false;
    return result;
  } finally {
    isGettingLogs = false;
  }
}

/**
 * localStorageから全件取得（内部関数）
 */
function getFromLocalStorageAll(): DailyLog[] {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.DAILY_LOGS);
    if (!data) return [];
    return JSON.parse(data) as DailyLog[];
  } catch (error) {
    logError(error, { component: 'storage', action: 'getFromLocalStorageAll' });
    return [];
  }
}

/**
 * SupabaseのLogRowをDailyLogに変換
 */
function convertLogRowToDailyLog(row: DailyLogRow): DailyLog {
  return {
    date: row.date,
    status: {
      sleepScore: row.status.sleep_score,
      sleepHours: row.status.sleep_hours, // 新規追加
      sunMinutes: row.status.sun_minutes,
      activityLevel: row.status.activity_level,
      stressLevel: row.status.stress_level,
      bowelMovement: row.status.bowel_movement
        ? {
          status: row.status.bowel_movement.status,
          bristolScale: row.status.bowel_movement.bristol_scale,
          notes: row.status.bowel_movement.notes,
        }
        : undefined,
    },
    fuel: row.fuel.map((f) => ({
      item: f.item,
      amount: f.amount,
      unit: f.unit,
      type: f.type,
      nutrients: f.nutrients,
    })),
    calculatedMetrics: {
      netCarbs: row.calculated_metrics.net_carbs ?? 0,
      effectiveVitC: row.calculated_metrics.effective_vit_c ?? 0,
      vitCRequirement: row.calculated_metrics.vit_c_requirement ?? 0,
      effectiveVitK: row.calculated_metrics.effective_vit_k ?? 0,
      effectiveIron: row.calculated_metrics.effective_iron ?? 0,
      ironRequirement: row.calculated_metrics.iron_requirement ?? 0,
      effectiveZinc: row.calculated_metrics.effective_zinc ?? 0,
      fiberTotal: row.calculated_metrics.fiber_total ?? 0,
      sodiumTotal: row.calculated_metrics.sodium_total ?? 0,
      magnesiumTotal: row.calculated_metrics.magnesium_total ?? 0,
      effectiveProtein: row.calculated_metrics.effective_protein ?? 0,
      proteinTotal: row.calculated_metrics.protein_total ?? 0,
      proteinRequirement: row.calculated_metrics.protein_requirement ?? 0,
      fatTotal: row.calculated_metrics.fat_total ?? 0,
    } as CalculatedMetrics,
    recoveryProtocol: row.recovery_protocol
      ? {
        violationType: row.recovery_protocol.violation_type as ViolationType,
        isActive: row.recovery_protocol.is_active,
        fastingTargetHours: row.recovery_protocol.fasting_target_hours,
        activities: row.recovery_protocol.activities,
        dietRecommendations: row.recovery_protocol.diet_recommendations,
        supplements: row.recovery_protocol.supplements,
        warnings: row.recovery_protocol.warnings,
        protocolId: row.recovery_protocol.protocol_id,
        targetFastEnd: row.recovery_protocol.target_fast_end,
      }
      : undefined,
    diary: row.diary,
    weight: row.weight,
    bodyFatPercentage: row.body_fat_percentage,
    waterIntake: (row.status as { water_intake?: number })?.water_intake,
  };
}

/**
 * Get today's log
 * デバッグモードがONの場合でも、実際のデータを優先する
 */
export async function getTodayLog(): Promise<DailyLog | null> {
  const today = new Date().toISOString().split('T')[0];

  // まず実際のデータを取得（デバッグモードに関係なく）
  const actualLog = await getDailyLogByDate(today);

  // デバッグモードチェック
  const debugMode = localStorage.getItem('settings_debug_mode');
  const isDebugMode =
    debugMode === 'true' || (debugMode !== null && JSON.parse(debugMode) === true);

  if (isDebugMode && !actualLog) {
    // デバッグモードで実際のデータがない場合のみ、デバッグデータを直接生成（無限ループ防止）
    // getDailyLogs()を呼ばずに、直接generateDebugData()を呼ぶ
    const { generateDebugData } = await import('./debugData');
    const debugData = generateDebugData();
    return debugData.find((log) => log.date === today) || null;
  }

  // 実際のデータがある場合はそれを返す（デバッグモードでも）
  return actualLog;
}

/**
 * Delete daily log by date
 */
export async function deleteDailyLog(date: string): Promise<void> {
  try {
    // デバッグモードの場合はデバッグデータをクリア
    const debugMode = localStorage.getItem('settings_debug_mode');
    const isDebugMode =
      debugMode === 'true' || (debugMode !== null && JSON.parse(debugMode) === true);
    if (isDebugMode) {
      // デバッグモードの場合はキャッシュをクリア
      clearDebugDataCache();
    }

    // 実際のデータから削除
    const logs = await getDailyLogs();
    const filtered = logs.filter((log) => log.date !== date);

    // Supabaseが利用可能な場合
    const userId = getUserId();
    if (isSupabaseAvailable() && supabase) {
      try {
        const { error } = await supabase
          .from('daily_logs')
          .delete()
          .eq('user_id', userId)
          .eq('date', date);

        if (error) {
          logError(error, { component: 'storage', action: 'deleteDailyLog', step: 'supabase' });
        }
      } catch (error) {
        logError(error, {
          component: 'storage',
          action: 'deleteDailyLog',
          step: 'supabase-fallback',
        });
      }
    }

    // localStorageにも保存
    localStorage.setItem(STORAGE_KEYS.DAILY_LOGS, JSON.stringify(filtered));
  } catch (error) {
    logError(error, { component: 'storage', action: 'deleteDailyLog' });
    throw error;
  }
}

/**
 * Save user profile (Supabase優先、フォールバック: localStorage)
 */
export async function saveUserProfile(profile: UserProfile): Promise<void> {
  const userId = getUserId();

  // Supabaseが利用可能な場合
  if (isSupabaseAvailable() && supabase) {
    try {
      const profileRow: ProfileRow = {
        user_id: userId,
        gender: profile.gender,
        height: profile.height,
        weight: profile.weight,
        age: profile.age,
        activity_level: profile.activityLevel,
        goal: profile.goal,
        dairy_tolerance: profile.dairyTolerance,
        metabolic_status: profile.metabolicStatus,
        mode: profile.mode,
        is_pregnant: profile.isPregnant,
        is_breastfeeding: profile.isBreastfeeding,
        is_post_menopause: profile.isPostMenopause,
        stress_level: profile.stressLevel,
        sleep_hours: profile.sleepHours,
        exercise_intensity: profile.exerciseIntensity,
        exercise_frequency: profile.exerciseFrequency,
        thyroid_function: profile.thyroidFunction,
        sun_exposure_frequency: profile.sunExposureFrequency,
        digestive_issues: profile.digestiveIssues,
        inflammation_level: profile.inflammationLevel,
        mental_health_status: profile.mentalHealthStatus,
        supplement_magnesium: profile.supplementMagnesium,
        supplement_vitamin_d: profile.supplementVitaminD,
        supplement_iodine: profile.supplementIodine,
        alcohol_frequency: profile.alcoholFrequency,
        caffeine_intake: profile.caffeineIntake,
        chronic_diseases: profile.chronicDiseases,
        language: profile.language,
      };

      const { error } = await supabase.from('profiles').upsert(
        {
          ...profileRow,
          user_id: userId,
        },
        {
          onConflict: 'user_id',
        }
      );

      if (error) {
        logError(error, { component: 'storage', action: 'saveUserProfile', step: 'supabase' });
        throw error;
      }

      // 成功した場合、localStorageにもバックアップを保存
      localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
      return;
    } catch (error) {
      logError(error, { component: 'storage', action: 'saveUserProfile', step: 'fallback' });
    }
  }

  // localStorageに保存
  try {
    localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
  } catch (error) {
    logError(error, { component: 'storage', action: 'saveUserProfile', step: 'localStorage' });
    throw error;
  }
}

/**
 * Get user profile (Supabase優先、フォールバック: localStorage)
 */
export async function getUserProfile(): Promise<UserProfile | null> {
  // デバッグモードチェック
  const debugMode = localStorage.getItem('settings_debug_mode');
  const isDebugMode =
    debugMode === 'true' || (debugMode !== null && JSON.parse(debugMode) === true);

  if (isDebugMode) {
    // デバッグモードの場合は、デバッグプロファイルを生成・返す
    const { generateDebugProfile } = await import('./debugData');
    return generateDebugProfile();
  }

  const userId = getUserId();

  // Supabaseが利用可能な場合
  if (isSupabaseAvailable() && supabase) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116' && error.code !== '406') {
        logError(error, { component: 'storage', action: 'getUserProfile', step: 'supabase' });
        // フォールバック: localStorageから取得
        return getProfileFromLocalStorage();
      }

      if (data) {
        const profileRow = data as ProfileRow;
        return {
          gender: profileRow.gender,
          height: profileRow.height,
          weight: profileRow.weight,
          age: profileRow.age,
          activityLevel: profileRow.activity_level,
          goal: profileRow.goal as UserGoal,
          dairyTolerance: profileRow.dairy_tolerance,
          metabolicStatus: profileRow.metabolic_status as MetabolicStatus,
          mode: profileRow.mode as DietMode | undefined,
          isPregnant: profileRow.is_pregnant,
          isBreastfeeding: profileRow.is_breastfeeding,
          isPostMenopause: profileRow.is_post_menopause,
          stressLevel: profileRow.stress_level,
          sleepHours: profileRow.sleep_hours,
          exerciseIntensity: profileRow.exercise_intensity,
          exerciseFrequency: profileRow.exercise_frequency,
          thyroidFunction: profileRow.thyroid_function,
          sunExposureFrequency: profileRow.sun_exposure_frequency,
          digestiveIssues: profileRow.digestive_issues,
          inflammationLevel: profileRow.inflammation_level,
          mentalHealthStatus: profileRow.mental_health_status,
          supplementMagnesium: profileRow.supplement_magnesium,
          supplementVitaminD: profileRow.supplement_vitamin_d,
          supplementIodine: profileRow.supplement_iodine,
          alcoholFrequency: profileRow.alcohol_frequency,
          caffeineIntake: profileRow.caffeine_intake,
          chronicDiseases: profileRow.chronic_diseases,
          language: profileRow.language,
        };
      }
    } catch (error) {
      logError(error, { component: 'storage', action: 'getUserProfile', step: 'fallback' });
    }
  }

  // localStorageから取得
  return getProfileFromLocalStorage();
}

/**
 * localStorageからプロファイル取得（内部関数）
 */
function getProfileFromLocalStorage(): UserProfile | null {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
    if (!data) return null;
    return JSON.parse(data) as UserProfile;
  } catch (error) {
    logError(error, { component: 'storage', action: 'getProfileFromLocalStorage' });
    return null;
  }
}

/**
 * Clear all storage
 */
export async function clearAllStorage(): Promise<void> {
  try {
    Object.values(STORAGE_KEYS).forEach((key) => {
      localStorage.removeItem(key);
    });
  } catch (error) {
    logError(error, { component: 'storage', action: 'clearAllStorage' });
    throw error;
  }
}

/**
 * localStorageからSupabaseへのデータ同期（アプリ起動時に呼び出す）
 */
export async function syncLocalStorageToSupabase(): Promise<void> {
  if (!isSupabaseAvailable() || !supabase) {
    return;
  }

  try {
    // localStorageから既存データを取得
    const localLogs = getFromLocalStorageAll();
    const localProfile = getProfileFromLocalStorage();

    // 各ログをSupabaseに保存（既に存在する場合はスキップ）
    for (const log of localLogs) {
      try {
        const userId = getUserId();
        const { data } = await supabase
          .from('daily_logs')
          .select('id')
          .eq('user_id', userId)
          .eq('date', log.date)
          .single();

        // 存在しない場合のみ保存
        if (!data) {
          await saveDailyLog(log);
        }
      } catch (err: unknown) {
        const code = (err as { code?: string })?.code;
        if (code === 'PGRST116') {
          await saveDailyLog(log);
        } else {
          logError(err, {
            component: 'storage',
            action: 'syncLocalStorageToSupabase',
            step: 'checkLog',
            date: log.date,
          });
        }
      }
    }

    // プロファイルをSupabaseに保存
    if (localProfile) {
      try {
        const userId = getUserId();
        const { data } = await supabase
          .from('profiles')
          .select('id')
          .eq('user_id', userId)
          .single();

        // 存在しない場合のみ保存
        if (!data) {
          await saveUserProfile(localProfile);
        }
      } catch (err: unknown) {
        const code = (err as { code?: string })?.code;
        if (code === 'PGRST116') {
          await saveUserProfile(localProfile);
        } else {
          logError(err, {
            component: 'storage',
            action: 'syncLocalStorageToSupabase',
            step: 'checkProfile',
          });
        }
      }
    }
  } catch (error) {
    logError(error, { component: 'storage', action: 'syncLocalStorageToSupabase' });
    throw error;
  }
}

/**
 * データエクスポート: すべてのデータをJSON形式でエクスポート
 */
export async function exportAllData(): Promise<string> {
  try {
    const logs = await getDailyLogs();
    const profile = await getUserProfile();

    const exportData = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      dailyLogs: logs,
      userProfile: profile,
    };

    return JSON.stringify(exportData, null, 2);
  } catch (error) {
    logError(error, { component: 'storage', action: 'exportAllData' });
    throw new Error('データのエクスポートに失敗しました。');
  }
}

/**
 * データインポート: JSON形式のデータをインポート
 */
export async function importAllData(jsonData: string): Promise<void> {
  try {
    const data = JSON.parse(jsonData);

    if (!data.version || !data.dailyLogs || !Array.isArray(data.dailyLogs)) {
      throw new Error('無効なデータ形式です。');
    }

    // 既存データをバックアップ（オプション）
    const backup = await exportAllData();
    localStorage.setItem('primal_logic_backup_' + Date.now(), backup);

    // データをインポート
    if (data.dailyLogs && data.dailyLogs.length > 0) {
      for (const log of data.dailyLogs) {
        await saveDailyLog(log);
      }
    }

    if (data.userProfile) {
      await saveUserProfile(data.userProfile);
    }
  } catch (error) {
    logError(error, { component: 'storage', action: 'importAllData' });
    throw new Error(
      'データのインポートに失敗しました。' + (error instanceof Error ? error.message : '')
    );
  }
}
