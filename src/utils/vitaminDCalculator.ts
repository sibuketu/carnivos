/**
 * Primal Logic - Vitamin D Calculator
 *
 * Solar Charge (太陽光暴露) から Vitamin D 合成量を計算
 * 技術仕様書: @Primal_Logic_Technical_Spec.md 参照
 */

/**
 * Calculate Vitamin D synthesis from sun exposure
 *
 * Simplified calculation based on:
 * - Time of exposure (minutes)
 * - Skin exposure area (simplified to "full body" vs "arms/face")
 * - UV index (simplified to "sunny" vs "cloudy")
 *
 * Note: This is a simplified model. Real calculation would consider:
 * - Latitude
 * - Time of day
 * - Season
 * - Skin type
 * - Age
 */
export interface SunExposure {
  minutes: number;
  isSunny: boolean; // true = sunny, false = cloudy
  exposureArea?: 'full' | 'partial'; // full body vs arms/face only
  weatherFactor?: number; // 天気情報による係数（0-1、weatherServiceから取得）
  uvIndex?: number; // UV指数（0-11+）
  cloudCover?: number; // 雲量（0-100%）
}

/**
 * Calculate Vitamin D synthesis (IU)
 *
 * Rough estimates:
 * - Full body, sunny, 30 min: ~10,000-20,000 IU
 * - Arms/face, sunny, 30 min: ~2,000-4,000 IU
 * - Cloudy reduces by ~50-70%
 */
export function calculateVitaminDSynthesis(exposure: SunExposure): number {
  const {
    minutes,
    isSunny,
    exposureArea = 'partial',
    weatherFactor,
    uvIndex,
    cloudCover,
  } = exposure;

  // Base synthesis rate (IU per minute)
  // Full body exposure: ~500-700 IU/min (sunny)
  // Partial exposure (arms/face): ~100-150 IU/min (sunny)
  const baseRate = exposureArea === 'full' ? 600 : 120;

  // 天気情報による係数を適用（weatherServiceから取得した場合）
  let rate = baseRate;
  if (weatherFactor !== undefined) {
    // weatherFactorが提供されている場合はそれを使用（より正確）
    rate = baseRate * weatherFactor;
  } else {
    // 従来の方法（isSunnyのみ）
    // Cloudy conditions reduce synthesis by ~60%
    rate = isSunny ? baseRate : baseRate * 0.4;

    // UV指数と雲量が提供されている場合はより正確に計算
    if (uvIndex !== undefined && cloudCover !== undefined) {
      // UV指数による影響（0-11+を0.3-1.5の範囲にマッピング）
      const uvFactor = 0.3 + (uvIndex / 11) * 1.2;
      // 雲量による影響（雲量が多いほど係数が低い）
      const cloudFactor = (100 - cloudCover) / 100;
      rate = baseRate * Math.min(uvFactor, 1.5) * cloudFactor;
    }
  }

  // Calculate total synthesis
  const total = rate * minutes;

  // Cap at reasonable maximum (very long exposure doesn't linearly increase)
  // After ~30-60 min, additional exposure has diminishing returns
  if (minutes > 60) {
    const capped = rate * 60;
    const additional = rate * 0.3 * (minutes - 60); // Diminishing returns
    return Math.round(capped + additional);
  }

  return Math.round(total);
}

/**
 * Get recommended sun exposure based on current Vitamin D status
 *
 * Note: This is a simplified recommendation. Real recommendations
 * would consider current blood levels, latitude, season, etc.
 */
export function getRecommendedSunExposure(
  currentLevel?: number // Current Vitamin D level (ng/mL)
): { minutes: number; frequency: string } {
  // Default recommendation: 15-30 min, 3-4 times per week
  if (!currentLevel) {
    return {
      minutes: 20,
      frequency: '3-4 times per week',
    };
  }

  if (currentLevel < 20) {
    // Deficient
    return {
      minutes: 30,
      frequency: 'Daily until levels improve',
    };
  }

  if (currentLevel < 30) {
    // Insufficient
    return {
      minutes: 25,
      frequency: '4-5 times per week',
    };
  }

  // Optimal
  return {
    minutes: 15,
    frequency: '2-3 times per week',
  };
}
