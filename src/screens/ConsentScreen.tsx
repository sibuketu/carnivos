/**
 * Primal Logic - Consent Screen
 *
 * 初回起動時のプライバシーポリシー・利用規約への同意画面
 */

import { useState } from 'react';
import './ConsentScreen.css';

interface ConsentScreenProps {
  onAccept: () => void;
  onDecline: () => void;
}

export default function ConsentScreen({ onAccept, onDecline }: ConsentScreenProps) {
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
        <h1 className="consent-screen-title">Primal Logicへようこそ</h1>
        <p className="consent-screen-description">
          サービスをご利用いただくには、プライバシーポリシーと利用規約への同意が必要です。
        </p>

        <div className="consent-screen-checkboxes">
          <label className="consent-screen-checkbox">
            <input
              type="checkbox"
              checked={privacyAccepted}
              onChange={(e) => setPrivacyAccepted(e.target.checked)}
            />
            <span>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  handleViewPrivacy();
                }}
              >
                プライバシーポリシー
              </a>
              に同意します
            </span>
          </label>

          <label className="consent-screen-checkbox">
            <input
              type="checkbox"
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
            />
            <span>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  handleViewTerms();
                }}
              >
                利用規約
              </a>
              に同意します
            </span>
          </label>
        </div>

        <div className="consent-screen-buttons">
          <button
            className="consent-screen-button consent-screen-button-decline"
            onClick={onDecline}
          >
            拒否
          </button>
          <button
            className="consent-screen-button consent-screen-button-accept"
            onClick={handleAccept}
            disabled={!privacyAccepted || !termsAccepted}
          >
            同意して続ける
          </button>
        </div>
      </div>
    </div>
  );
}
