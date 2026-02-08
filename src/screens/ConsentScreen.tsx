/**
 * CarnivOS - Consent Screen
 *
 * 初回起動時のプライバシーポリシー・利用規約への同意画面
 */

import { useState } from 'react';
import { useTranslation } from '../utils/i18n';
import './ConsentScreen.css';

interface ConsentScreenProps {
  onAccept: () => void;
  onDecline: () => void;
}

export default function ConsentScreen({ onAccept, onDecline }: ConsentScreenProps) {
  const { t } = useTranslation();
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  const handleAccept = () => {
    if (privacyAccepted && termsAccepted) {
      localStorage.setItem('primal_logic_consent_accepted', 'true');
      localStorage.setItem('primal_logic_consent_date', new Date().toISOString());
      onAccept();
    }
  };

  const handleViewPrivacy = () => {
    window.dispatchEvent(new CustomEvent('navigateToScreen', { detail: 'privacy' }));
  };

  const handleViewTerms = () => {
    window.dispatchEvent(new CustomEvent('navigateToScreen', { detail: 'terms' }));
  };

  return (
    <div className="consent-screen-container">
      <div className="consent-screen-content">
        <h1 className="consent-screen-title">{t('consent.title')}</h1>
        <p className="consent-screen-description">{t('consent.description')}</p>

        <div className="consent-screen-checkboxes">
          <label className="consent-screen-checkbox">
            <input
              type="checkbox"
              checked={privacyAccepted}
              onChange={(e) => setPrivacyAccepted(e.target.checked)}
            />
            <span>
              {t('consent.acceptPrivacyBefore')}
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  handleViewPrivacy();
                }}
              >
                {t('consent.acceptPrivacyLink')}
              </a>
              {t('consent.acceptPrivacyAfter')}
            </span>
          </label>

          <label className="consent-screen-checkbox">
            <input
              type="checkbox"
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
            />
            <span>
              {t('consent.acceptTermsBefore')}
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  handleViewTerms();
                }}
              >
                {t('consent.acceptTermsLink')}
              </a>
              {t('consent.acceptTermsAfter')}
            </span>
          </label>
        </div>

        <div className="consent-screen-buttons">
          <button
            className="consent-screen-button consent-screen-button-decline"
            onClick={onDecline}
          >
            {t('consent.decline')}
          </button>
          <button
            className="consent-screen-button consent-screen-button-accept"
            onClick={handleAccept}
            disabled={!privacyAccepted || !termsAccepted}
          >
            {t('consent.accept')}
          </button>
        </div>
      </div>
    </div>
  );
}
