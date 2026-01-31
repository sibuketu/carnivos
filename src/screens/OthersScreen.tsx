import { useState } from 'react';
import { useTranslation } from '../utils/i18n';
import { getFeatureDisplaySettings } from '../utils/featureDisplaySettings';
import TipsScreen from './TipsScreen'; // Renamed from KnowledgeScreen
import { calculateStreak } from '../utils/streakCalculator';
import './LabsScreen.css'; // Maintaining styles for now

export default function OthersScreen() { // OthersScreen
  const { t } = useTranslation();
  const featureDisplaySettings = getFeatureDisplaySettings();
  const [showTipsList, setShowTipsList] = useState(false);
  const [streakDays, setStreakDays] = useState<number | null>(null);

  // Load streak for display
  useState(() => {
    calculateStreak().then(data => setStreakDays(data.currentStreak));
  });

  const navigateTo = (screen: string) => {
    window.dispatchEvent(new CustomEvent('navigateToScreen', { detail: screen }));
  };

  // If Tips List is active, show that screen (or overlay)
  if (showTipsList) {
    return (
      <div className="labs-screen-sub-view">
        <button className="labs-back-button" onClick={() => setShowTipsList(false)}>
          {t('common.back')}
        </button>
        <TipsScreen />
      </div>
    );
  }

  return (
    <div className="labs-screen-container" style={{ paddingBottom: '80px' }}>
      <header className="labs-screen-header">
        <h1 className="labs-screen-title">{t('nav.others')}</h1>
        <p className="labs-screen-description">{t('others.description')}</p>
      </header>

      {/* 1. Analysis Section */}
      <section className="labs-screen-section">
        <h2 className="labs-screen-section-title">📊 {t('others.analysis')}</h2>
        <div className="labs-grid">
          {/* Bio-Hack Terminal */}
          <div
            className="labs-card bio-hack-card"
            onClick={() => navigateTo('bioHack')}
            style={{ backgroundColor: '#ecfdf5', borderColor: '#10b981' }}
          >
            <div className="labs-card-content">
              <h3 className="labs-card-title" style={{ color: '#065f46' }}>🧬 {t('analysis.bioHack')}</h3>
              <p className="labs-card-description" style={{ color: '#065f46' }}>{t('analysis.bioHackDescription')}</p>
            </div>
            <span className="labs-card-arrow" style={{ color: '#065f46' }}>→</span>
          </div>

          {/* Stats */}
          <button className="labs-card" onClick={() => navigateTo('stats')}>
            <span className="labs-card-icon">📈</span>
            <div className="labs-card-content">
              <h3 className="labs-card-title">{t('analysis.stats')}</h3>
              <p className="labs-card-description">{t('analysis.statsDescription')}</p>
            </div>
          </button>

          {/* Streak */}
          {featureDisplaySettings.streakDisplay && (
            <button className="labs-card" onClick={() => navigateTo('streakTracker')}>
              <span className="labs-card-icon">🔥</span>
              <div className="labs-card-content">
                <h3 className="labs-card-title">{t('analysis.streak')}</h3>
                <p className="labs-card-description">
                  {streakDays !== null ? `${streakDays} ${t('common.days')}` : t('analysis.streakDescription')}
                </p>
              </div>
            </button>
          )}
        </div>
      </section>

      {/* 2. Tips Section */}
      <section className="labs-screen-section">
        <h2 className="labs-screen-section-title">💡 {t('others.tips')}</h2>
        <div className="labs-grid">
          <button className="labs-card" onClick={() => setShowTipsList(true)}>
            <span className="labs-card-icon">📚</span>
            <div className="labs-card-content">
              <h3 className="labs-card-title">{t('tips.title')}</h3>
              <p className="labs-card-description">{t('tips.viewList')}</p>
            </div>
          </button>
        </div>
      </section>

      {/* 3. Records Section */}
      <section className="labs-screen-section">
        <h2 className="labs-screen-section-title">📝 {t('others.records')}</h2>
        <div className="labs-grid">
          {/* Bio-Tuner / Input */}
          <button className="labs-card" onClick={() => navigateTo('input')}>
            <span className="labs-card-icon">🧬</span>
            <div className="labs-card-content">
              <h3 className="labs-card-title">Bio-Tuner</h3>
              <p className="labs-card-description">Daily Input</p>
            </div>
          </button>

          {/* Diary */}
          {featureDisplaySettings.diary && (
            <button className="labs-card" onClick={() => navigateTo('diary')}>
              <span className="labs-card-icon">📔</span>
              <div className="labs-card-content">
                <h3 className="labs-card-title">{t('records.diary')}</h3>
                <p className="labs-card-description">{t('records.diaryDescription')}</p>
              </div>
            </button>
          )}
        </div>
      </section>

      {/* 4. Store Section */}
      <section className="labs-screen-section">
        <h2 className="labs-screen-section-title">🛒 {t('others.store')}</h2>
        <div className="labs-grid">
          {/* Gift */}
          {featureDisplaySettings.gift && (
            <button className="labs-card" onClick={() => navigateTo('gift')}>
              <span className="labs-card-icon">🎁</span>
              <div className="labs-card-content">
                <h3 className="labs-card-title">{t('store.gift')}</h3>
                <p className="labs-card-description">{t('store.giftDescription')}</p>
              </div>
            </button>
          )}

          {/* Shop */}
          {featureDisplaySettings.shop && (
            <button className="labs-card" onClick={() => navigateTo('shop')}>
              <span className="labs-card-icon">🛍️</span>
              <div className="labs-card-content">
                <h3 className="labs-card-title">{t('store.shop')}</h3>
                <p className="labs-card-description">{t('store.shopDescription')}</p>
              </div>
            </button>
          )}
        </div>
      </section>

      {/* 5. Settings Section */}
      <section className="labs-screen-section">
        <h2 className="labs-screen-section-title">⚙️ {t('others.settings')}</h2>
        <div className="labs-list">
          <button className="labs-list-item" onClick={() => navigateTo('userSettings')}>
            <span className="labs-list-item-icon">👤</span>
            <div className="labs-list-item-content">
              <span className="labs-list-item-title">{t('profile.userSettings')}</span>
            </div>
            <span className="labs-list-item-arrow">→</span>
          </button>
          <button className="labs-list-item" onClick={() => navigateTo('settings')}>
            <span className="labs-list-item-icon">🛠️</span>
            <div className="labs-list-item-content">
              <span className="labs-list-item-title">{t('profile.uiSettings')}</span>
            </div>
            <span className="labs-list-item-arrow">→</span>
          </button>
          <button className="labs-list-item" onClick={() => navigateTo('language')}>
            <span className="labs-list-item-icon">🌐</span>
            <div className="labs-list-item-content">
              <span className="labs-list-item-title">{t('profile.languageSettings')}</span>
            </div>
            <span className="labs-list-item-arrow">→</span>
          </button>
          <button className="labs-list-item" onClick={() => navigateTo('auth')}>
            <span className="labs-list-item-icon">🔐</span>
            <div className="labs-list-item-content">
              <span className="labs-list-item-title">{t('profile.account')}</span>
            </div>
            <span className="labs-list-item-arrow">→</span>
          </button>
          <button className="labs-list-item" onClick={() => navigateTo('feedback')}>
            <span className="labs-list-item-icon">💬</span>
            <div className="labs-list-item-content">
              <span className="labs-list-item-title">Feedback</span>
            </div>
            <span className="labs-list-item-arrow">→</span>
          </button>
        </div>
      </section>
    </div>
  );
}
