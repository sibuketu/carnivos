/**
 * useUserConfig Hook - ユーザー設定管理
 *
 * 塩の単位や重量など、ユーザー固有の設定を管理
 */

import { useState, useEffect } from 'react';

export interface UserConfig {
  saltUnitLabel: string; // 塩の単位ラベル（例: "削り" または "秒"）
  saltUnitWeight: number; // 1削り/1秒あたりのg数
  targetCarbs: number; // 炭水化物の目標値（g）、デフォルト: 0（カーニボア）
  saltType?: 'table_salt' | 'sea_salt' | 'himalayan_salt' | 'celtic_salt'; // 塩の種類
}

const DEFAULT_CONFIG: UserConfig = {
  saltUnitLabel: '削り',
  saltUnitWeight: 0.5, // 1削り = 0.5g
  targetCarbs: 0, // カーニボアのデフォルトは0g
  saltType: 'table_salt', // デフォルトは食卓塩
};

export function useUserConfig() {
  const [config, setConfig] = useState<UserConfig>(() => {
    const saved = localStorage.getItem('user_config');
    if (saved) {
      try {
        return { ...DEFAULT_CONFIG, ...JSON.parse(saved) };
      } catch {
        return DEFAULT_CONFIG;
      }
    }
    return DEFAULT_CONFIG;
  });

  const updateConfig = (updates: Partial<UserConfig>) => {
    const newConfig = { ...config, ...updates };
    setConfig(newConfig);
    localStorage.setItem('user_config', JSON.stringify(newConfig));
  };

  useEffect(() => {
    // 初期ロード時にlocalStorageから設定を読み込む
    const saved = localStorage.getItem('user_config');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setConfig({ ...DEFAULT_CONFIG, ...parsed });
      } catch {
        // エラー時はデフォルト値を使用
      }
    }
  }, []);

  return {
    config,
    updateConfig,
  };
}
