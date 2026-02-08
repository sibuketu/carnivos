/**
 * CarnivOS - Paywall Modal
 *
 * トライアル期限切れ時に表示するペイウォール
 */

import { useState } from 'react';
import type { TrialStatus } from '../utils/trialManager';
import './PaywallModal.css';

interface PaywallModalProps {
  trialStatus: TrialStatus;
  onSubscribe: () => void;
}

export default function PaywallModal({ trialStatus: _trialStatus, onSubscribe }: PaywallModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubscribe = async () => {
    setIsLoading(true);
    try {
      onSubscribe();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="paywall-overlay">
      <div className="paywall-modal">
        <div className="paywall-icon">⏰</div>
        <h2 className="paywall-title">無料トライアル終了</h2>
        <p className="paywall-description">
          7日間の無料トライアルが終了しました。
          <br />
          引き続きCarnivOSをご利用いただくには、サブスクリプションの登録が必要です。
        </p>

        <div className="paywall-pricing">
          <div className="paywall-plan">
            <div className="paywall-plan-badge">おすすめ</div>
            <div className="paywall-plan-name">年額プラン</div>
            <div className="paywall-plan-price">
              <span className="paywall-plan-price-amount">¥9,999</span>
              <span className="paywall-plan-price-period">/年</span>
            </div>
            <div className="paywall-plan-note">月額換算 ¥833/月（2ヶ月分お得）</div>
          </div>

          <div className="paywall-plan">
            <div className="paywall-plan-name">月額プラン</div>
            <div className="paywall-plan-price">
              <span className="paywall-plan-price-amount">¥1,999</span>
              <span className="paywall-plan-price-period">/月</span>
            </div>
            <div className="paywall-plan-note">いつでもキャンセル可能</div>
          </div>
        </div>

        <div className="paywall-features">
          <div className="paywall-feature">
            <span className="paywall-feature-icon">✅</span>
            <span>無制限の食事記録</span>
          </div>
          <div className="paywall-feature">
            <span className="paywall-feature-icon">✅</span>
            <span>AI栄養分析</span>
          </div>
          <div className="paywall-feature">
            <span className="paywall-feature-icon">✅</span>
            <span>詳細な栄養素ゲージ</span>
          </div>
          <div className="paywall-feature">
            <span className="paywall-feature-icon">✅</span>
            <span>カスタム目標設定</span>
          </div>
          <div className="paywall-feature">
            <span className="paywall-feature-icon">✅</span>
            <span>クラウド同期</span>
          </div>
        </div>

        <button
          className="paywall-button"
          onClick={handleSubscribe}
          disabled={isLoading}
        >
          {isLoading ? '処理中...' : 'サブスクリプションに登録'}
        </button>

        <p className="paywall-note">
          いつでもキャンセル可能。登録後すぐにご利用いただけます。
        </p>
      </div>
    </div>
  );
}
