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
        <h2 className="paywall-title">Free Trial Ended</h2>
        <p className="paywall-description">
          Your 7-day free trial has ended.
          <br />
          Subscribe to continue using CarnivOS.
        </p>

        <div className="paywall-pricing">
          <div className="paywall-plan">
            <div className="paywall-plan-badge">Best Value</div>
            <div className="paywall-plan-name">Annual</div>
            <div className="paywall-plan-price">
              <span className="paywall-plan-price-amount">$200</span>
              <span className="paywall-plan-price-period">/yr</span>
            </div>
            <div className="paywall-plan-note">$16.67/mo — Save 44%</div>
          </div>

          <div className="paywall-plan">
            <div className="paywall-plan-name">Monthly</div>
            <div className="paywall-plan-price">
              <span className="paywall-plan-price-amount">$30</span>
              <span className="paywall-plan-price-period">/mo</span>
            </div>
            <div className="paywall-plan-note">Cancel anytime</div>
          </div>
        </div>

        <div className="paywall-features">
          <div className="paywall-feature">
            <span className="paywall-feature-icon">✅</span>
            <span>Unlimited meal logging</span>
          </div>
          <div className="paywall-feature">
            <span className="paywall-feature-icon">✅</span>
            <span>AI nutrition analysis</span>
          </div>
          <div className="paywall-feature">
            <span className="paywall-feature-icon">✅</span>
            <span>Detailed nutrient gauges</span>
          </div>
          <div className="paywall-feature">
            <span className="paywall-feature-icon">✅</span>
            <span>Custom nutrient targets</span>
          </div>
          <div className="paywall-feature">
            <span className="paywall-feature-icon">✅</span>
            <span>Cloud sync</span>
          </div>
        </div>

        <button
          className="paywall-button"
          onClick={handleSubscribe}
          disabled={isLoading}
        >
          {isLoading ? 'Processing...' : 'Subscribe'}
        </button>

        <p className="paywall-note">
          Cancel anytime. Instant access after subscribing.
        </p>
      </div>
    </div>
  );
}
