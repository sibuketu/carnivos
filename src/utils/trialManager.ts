/**
 * CarnivOS - Trial Manager
 *
 * 7日間無料トライアルの管理
 */

import type { UserProfile } from '../types';

export interface TrialStatus {
  isActive: boolean;
  isExpired: boolean;
  daysRemaining: number;
  expiryDate: string | null;
  hasSubscription: boolean;
}

/**
 * トライアルステータスをチェック
 */
export function checkTrialStatus(userProfile: UserProfile | null): TrialStatus {
  // プロファイルがない場合、または trial_start_date がない場合
  if (!userProfile || !userProfile.trial_start_date) {
    return {
      isActive: false,
      isExpired: false,
      daysRemaining: 0,
      expiryDate: null,
      hasSubscription: false,
    };
  }

  // すでにサブスクリプションがアクティブな場合
  if (userProfile.subscription_status === 'active') {
    return {
      isActive: false,
      isExpired: false,
      daysRemaining: 0,
      expiryDate: null,
      hasSubscription: true,
    };
  }

  // トライアル開始日から7日後を計算
  const trialStartDate = new Date(userProfile.trial_start_date);
  const expiryDate = new Date(trialStartDate);
  expiryDate.setDate(expiryDate.getDate() + 7);

  const now = new Date();
  const diffTime = expiryDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  const isExpired = diffDays <= 0;
  const isActive = !isExpired && userProfile.subscription_status === 'trial';

  return {
    isActive,
    isExpired,
    daysRemaining: Math.max(0, diffDays),
    expiryDate: expiryDate.toISOString(),
    hasSubscription: false,
  };
}

/**
 * トライアル期限切れかどうかをチェック
 */
export function isTrialExpired(userProfile: UserProfile | null): boolean {
  const status = checkTrialStatus(userProfile);
  return status.isExpired && !status.hasSubscription;
}

/**
 * アプリにアクセス可能かどうかをチェック
 */
export function canAccessApp(userProfile: UserProfile | null): boolean {
  const status = checkTrialStatus(userProfile);
  return status.isActive || status.hasSubscription || !userProfile?.trial_start_date;
}
