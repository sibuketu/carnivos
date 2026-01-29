/**
 * Primal Logic - Weather Service
 *
 * OpenWeatherMap APIを使用して天気情報を取得
 * ビタミンD合成計算に活用
 */

import { logError } from './errorHandler';

export interface WeatherData {
  temperature: number; // 気温（℃）
  condition: 'sunny' | 'cloudy' | 'partly-cloudy' | 'rainy' | 'snowy'; // 天気状態
  uvIndex: number; // UV指数（0-11+）
  cloudCover: number; // 雲量（0-100%）
  humidity: number; // 湿度（0-100%）
  location?: string; // 位置情報（都市名など）
  timestamp: string; // 取得日時
}

const WEATHER_CACHE_KEY = 'primal_logic_weather_cache';
const WEATHER_CACHE_DURATION = 60 * 60 * 1000; // 1時間

/**
 * 位置情報を取得（Geolocation API）
 */
export async function getCurrentLocation(): Promise<{ lat: number; lon: number } | null> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      if (import.meta.env.DEV) {
        console.log('Geolocation API is not supported');
      }
      resolve(null);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        });
      },
      (error) => {
        logError(error, { component: 'weatherService', action: 'getCurrentLocation' });
        resolve(null);
      },
      {
        timeout: 10000,
        maximumAge: 5 * 60 * 1000, // 5分間キャッシュ
      }
    );
  });
}

/**
 * 位置情報から都市名を取得（Reverse Geocoding）
 */
export async function getCityName(lat: number, lon: number): Promise<string | null> {
  try {
    // OpenWeatherMap Geocoding APIを使用
    const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY;
    if (!apiKey) {
      if (import.meta.env.DEV) {
        console.log('OpenWeatherMap API key is not set');
      }
      return null;
    }

    const response = await fetch(
      `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${apiKey}`
    );

    if (!response.ok) {
      throw new Error(`Geocoding API error: ${response.status}`);
    }

    const data = await response.json();
    if (data && data.length > 0) {
      return data[0].name || null;
    }

    return null;
  } catch (error) {
    logError(error, { component: 'weatherService', action: 'getCityName' });
    return null;
  }
}

/**
 * OpenWeatherMap APIから天気情報を取得
 */
export async function getWeatherData(lat?: number, lon?: number): Promise<WeatherData | null> {
  try {
    // キャッシュを確認
    const cached = getCachedWeatherData();
    if (cached) {
      return cached;
    }

    // 位置情報を取得（未指定の場合）
    let location: { lat: number; lon: number } | null = null;
    if (lat && lon) {
      location = { lat, lon };
    } else {
      location = await getCurrentLocation();
    }

    if (!location) {
      if (import.meta.env.DEV) {
        console.log('Location not available');
      }
      return null;
    }

    // OpenWeatherMap APIキーを確認
    const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY;
    if (!apiKey) {
      if (import.meta.env.DEV) {
        console.log(
          'OpenWeatherMap API key is not set. Set VITE_OPENWEATHER_API_KEY in .env file.'
        );
      }
      return null;
    }

    // OpenWeatherMap APIから天気情報を取得
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${location.lat}&lon=${location.lon}&appid=${apiKey}&units=metric&lang=ja`
    );

    if (!response.ok) {
      throw new Error(`Weather API error: ${response.status}`);
    }

    const data = await response.json();

    // UV指数を取得（別API）
    let uvIndex = 0;
    try {
      const uvResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/uvi?lat=${location.lat}&lon=${location.lon}&appid=${apiKey}`
      );
      if (uvResponse.ok) {
        const uvData = await uvResponse.json();
        uvIndex = uvData.value || 0;
      }
    } catch (error) {
      // UV指数の取得に失敗しても続行
      if (import.meta.env.DEV) {
        console.log('UV index fetch failed:', error);
      }
    }

    // 天気状態を判定
    const weatherId = data.weather[0]?.id || 800;
    let condition: WeatherData['condition'] = 'cloudy';
    if (weatherId >= 800 && weatherId < 803) {
      condition = 'sunny';
    } else if (weatherId === 803 || weatherId === 804) {
      condition = 'cloudy';
    } else if (weatherId >= 801 && weatherId < 803) {
      condition = 'partly-cloudy';
    } else if (weatherId >= 200 && weatherId < 600) {
      condition = 'rainy';
    } else if (weatherId >= 600 && weatherId < 700) {
      condition = 'snowy';
    }

    // 都市名を取得
    const cityName = await getCityName(location.lat, location.lon);

    const weatherData: WeatherData = {
      temperature: data.main.temp || 0,
      condition,
      uvIndex: Math.round(uvIndex * 10) / 10, // 小数点第1位まで
      cloudCover: data.clouds?.all || 0,
      humidity: data.main.humidity || 0,
      location: cityName || undefined,
      timestamp: new Date().toISOString(),
    };

    // キャッシュに保存
    cacheWeatherData(weatherData);

    return weatherData;
  } catch (error) {
    logError(error, { component: 'weatherService', action: 'getWeatherData' });
    return null;
  }
}

/**
 * 天気情報をキャッシュから取得
 */
function getCachedWeatherData(): WeatherData | null {
  try {
    const cached = localStorage.getItem(WEATHER_CACHE_KEY);
    if (!cached) {
      return null;
    }

    const data = JSON.parse(cached) as WeatherData & { cachedAt: number };
    const now = Date.now();
    const cacheAge = now - data.cachedAt;

    if (cacheAge > WEATHER_CACHE_DURATION) {
      // キャッシュが古い場合は削除
      localStorage.removeItem(WEATHER_CACHE_KEY);
      return null;
    }

    // キャッシュからtimestampを削除して返す
    const { cachedAt, ...weatherData } = data;
    return weatherData;
  } catch (error) {
    logError(error, { component: 'weatherService', action: 'getCachedWeatherData' });
    return null;
  }
}

/**
 * 天気情報をキャッシュに保存
 */
function cacheWeatherData(data: WeatherData): void {
  try {
    const cached = {
      ...data,
      cachedAt: Date.now(),
    };
    localStorage.setItem(WEATHER_CACHE_KEY, JSON.stringify(cached));
  } catch (error) {
    logError(error, { component: 'weatherService', action: 'cacheWeatherData' });
  }
}

/**
 * 天気状態からビタミンD合成に影響する係数を計算
 */
export function getWeatherVitaminDFactor(weather: WeatherData): number {
  // 天気状態に基づく係数
  let factor = 1.0;

  // 雲量による影響（雲量が多いほど係数が低い）
  factor *= (100 - weather.cloudCover) / 100;

  // 天気状態による影響
  switch (weather.condition) {
    case 'sunny':
      factor *= 1.0;
      break;
    case 'partly-cloudy':
      factor *= 0.7;
      break;
    case 'cloudy':
      factor *= 0.3;
      break;
    case 'rainy':
    case 'snowy':
      factor *= 0.1;
      break;
  }

  // UV指数による影響（UV指数が高いほど係数が高い）
  // UV指数0-11+を0.5-1.5の範囲にマッピング
  const uvFactor = 0.5 + (weather.uvIndex / 11) * 1.0;
  factor *= Math.min(uvFactor, 1.5);

  return Math.max(0, Math.min(1, factor)); // 0-1の範囲に制限
}
