/**
 * Primal Logic - Health Device Sync Utility
 *
 * ウェアラブルデバイス連携（Apple Health、Google Fit）
 *
 * 注意: Webアプリでは直接的な連携は難しいため、以下の方法を提供:
 * 1. 手動入力（活動量、心拍数など）
 * 2. 将来的にモバイルアプリ（Expo）で実装予定
 */

import { logError } from './errorHandler';

export interface HealthData {
  steps?: number; // 歩数
  heartRate?: number; // 心拍数（bpm）
  activeMinutes?: number; // 活動時間（分）
  caloriesBurned?: number; // 消費カロリー（kcal）
  date: string; // ISO date string (YYYY-MM-DD)
}

const HEALTH_DATA_STORAGE_KEY = 'primal_logic_health_data';

/**
 * 健康データを保存
 */
export function saveHealthData(data: HealthData): void {
  try {
    const allData = getHealthData();
    const existingIndex = allData.findIndex((d) => d.date === data.date);

    if (existingIndex >= 0) {
      allData[existingIndex] = { ...allData[existingIndex], ...data };
    } else {
      allData.push(data);
    }

    localStorage.setItem(HEALTH_DATA_STORAGE_KEY, JSON.stringify(allData));
  } catch (error) {
    logError(error, { component: 'healthDeviceSync', action: 'saveHealthData' });
  }
}

/**
 * 健康データを取得
 */
export function getHealthData(date?: string): HealthData[] {
  try {
    const stored = localStorage.getItem(HEALTH_DATA_STORAGE_KEY);
    if (!stored) return [];
    const allData: HealthData[] = JSON.parse(stored);
    if (date) {
      return allData.filter((d) => d.date === date);
    }
    return allData;
  } catch (error) {
    logError(error, { component: 'healthDeviceSync', action: 'getHealthData' });
    return [];
  }
}

/**
 * 健康データを削除
 */
export function deleteHealthData(date: string): boolean {
  try {
    const allData = getHealthData();
    const filtered = allData.filter((d) => d.date !== date);
    if (filtered.length === allData.length) return false;
    localStorage.setItem(HEALTH_DATA_STORAGE_KEY, JSON.stringify(filtered));
    return true;
  } catch (error) {
    logError(error, { component: 'healthDeviceSync', action: 'deleteHealthData' });
    return false;
  }
}

/**
 * Apple Health連携（将来実装予定）
 *
 * 注意: Webアプリでは直接的な連携は不可能。
 * モバイルアプリ（Expo）で実装予定。
 */
export async function syncWithAppleHealth(): Promise<HealthData | null> {
  // 将来実装予定
  if (import.meta.env.DEV) {
    console.log('Apple Health連携はモバイルアプリで実装予定です');
  }
  return null;
}

/**
 * Google Fit連携（将来実装予定）
 *
 * 注意: Webアプリでは直接的な連携は不可能。
 * モバイルアプリ（Expo）で実装予定。
 */
export async function syncWithGoogleFit(): Promise<HealthData | null> {
  // 将来実装予定
  if (import.meta.env.DEV) {
    console.log('Google Fit連携はモバイルアプリで実装予定です');
  }
  return null;
}
