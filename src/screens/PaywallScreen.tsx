/**
 * CarnivOS - Paywall Screen（初回フロー用フル画面）
 *
 * docs/フロー_ログインサブスク.md に基づく。
 * 初回: Consent → サブスク画面 → ログイン/新規登録 → オンボーディング。
 * 既存ユーザー別デバイスは「既にアカウントをお持ちの方はログイン」で auth へ。
 */

import { useState } from 'react';
import { useTranslation } from '../utils/i18n';
import './PaywallScreen.css';

const PAYWALL_CHOICE_KEY = 'primal_logic_paywall_choice';

export function setPaywallChoiceLogin(): void {
  try {
    localStorage.setItem(PAYWALL_CHOICE_KEY, 'login');
  } catch {
    // ignore
  }
}

export function setPaywallChoiceSignup(): void {
  try {
    localStorage.setItem(PAYWALL_CHOICE_KEY, 'signup');
  } catch {
    // ignore
  }
}

export function getPaywallChoice(): 'login' | 'signup' | null {
  try {
    const v = localStorage.getItem(PAYWALL_CHOICE_KEY);
    if (v === 'login' || v === 'signup') return v;
    return null;
  } catch {
    return null;
  }
}

export function clearPaywallChoice(): void {
  try {
    localStorage.removeItem(PAYWALL_CHOICE_KEY);
  } catch {
    // ignore
  }
}

interface PaywallScreenProps {
  onGoToAuth: () => void;
  onContinue: () => void; // スキップ or 購入 → auth（新規登録へ）
}

export default function PaywallScreen({ onGoToAuth, onContinue }: PaywallScreenProps) {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);

  const handleExistingAccount = () => {
    setPaywallChoiceLogin();
    onGoToAuth();
  };

  const handleSubscribe = () => {
    setIsLoading(true);
    setPaywallChoiceSignup();
    onContinue();
    setIsLoading(false);
  };

  const handleSkip = () => {
    setPaywallChoiceSignup();
    onContinue();
  };

  return (
    <div className="paywall-screen">
      <div className="paywall-screen-inner">
        <div className="paywall-screen-icon">🥩</div>
        <h1 className="paywall-screen-title">{t('paywall.title')}</h1>
        <p className="paywall-screen-description">{t('paywall.description')}</p>

        <div className="paywall-screen-pricing">
          <div className="paywall-screen-plan paywall-screen-plan-featured">
            <div className="paywall-screen-plan-badge">{t('paywall.badge')}</div>
            <div className="paywall-screen-plan-name">{t('paywall.planYearly')}</div>
            <div className="paywall-screen-plan-price">
              <span className="paywall-screen-plan-amount">$200</span>
              <span className="paywall-screen-plan-period">/yr</span>
            </div>
            <div className="paywall-screen-plan-note">{t('paywall.noteYearly')}</div>
          </div>
          <div className="paywall-screen-plan">
            <div className="paywall-screen-plan-name">{t('paywall.planMonthly')}</div>
            <div className="paywall-screen-plan-price">
              <span className="paywall-screen-plan-amount">$30</span>
              <span className="paywall-screen-plan-period">/mo</span>
            </div>
            <div className="paywall-screen-plan-note">{t('paywall.noteMonthly')}</div>
          </div>
        </div>

        <div className="paywall-screen-features">
          <div className="paywall-screen-feature"><span className="paywall-screen-feature-icon">✅</span>{t('paywall.feature1')}</div>
          <div className="paywall-screen-feature"><span className="paywall-screen-feature-icon">✅</span>{t('paywall.feature2')}</div>
          <div className="paywall-screen-feature"><span className="paywall-screen-feature-icon">✅</span>{t('paywall.feature3')}</div>
          <div className="paywall-screen-feature"><span className="paywall-screen-feature-icon">✅</span>{t('paywall.feature4')}</div>
        </div>

        <button
          type="button"
          className="paywall-screen-btn paywall-screen-btn-primary"
          onClick={handleSubscribe}
          disabled={isLoading}
        >
          {isLoading ? t('paywall.processing') : t('paywall.subscribe')}
        </button>
        <button
          type="button"
          className="paywall-screen-btn paywall-screen-btn-secondary"
          onClick={handleSkip}
        >
          {t('paywall.skip')}
        </button>

        <button
          type="button"
          className="paywall-screen-link-login"
          onClick={handleExistingAccount}
        >
          {t('paywall.loginLink')}
        </button>
      </div>
    </div>
  );
}
