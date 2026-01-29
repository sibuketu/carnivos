/**
 * Labs Screen - 「その他（Labs）」画面
 *
 * 必須かどうか迷った結果とりあえず実装した機能たち
 */

import { useState, useEffect } from 'react';
import { getRandomTip, TIPS_DATA, type Tip } from '../data/tips';
import { getRemedyBySymptom, type RemedyItem } from '../data/remedyLogic';
import KnowledgeScreen from './KnowledgeScreen';
import { calculateStreak, type StreakData } from '../utils/streakCalculator';
import { AppIconGenerator } from '../components/AppIconGenerator';
import { getSavedTipIds, saveTip, unsaveTip, isTipSaved } from '../utils/savedTips';
import { useTranslation } from '../utils/i18n';
import { logError } from '../utils/errorHandler';
import { useSettings } from '../hooks/useSettings';
import { isFeatureEnabled } from '../utils/featureFlags';

export default function LabsScreen() {
  const { t } = useTranslation();
  const { tipsEnabled } = useSettings(); // SettingsScreenから取得
  const [showTipDetail, setShowTipDetail] = useState(false);
  const [selectedTip, setSelectedTip] = useState<Tip | null>(null);
  const [currentTipIndex, setCurrentTipIndex] = useState<number>(0); // 現在表示中のTipsのインデックス
  const [isCurrentTipSaved, setIsCurrentTipSaved] = useState(false); // 現在表示中のTipsのお気に入り状態
  const [showTipHistory, setShowTipHistory] = useState(false);
  const [showTipsList, setShowTipsList] = useState(false); // Tips一覧表示フラグ
  const [tipsListTab, setTipsListTab] = useState<'all' | 'saved'>('all'); // Tips一覧のタブ（すべて/保存済み）
  const [tipsListRefreshKey, setTipsListRefreshKey] = useState(0); // Tips一覧の再レンダリング用キー
  const [tipHistory, setTipHistory] = useState<(RemedyItem | Tip)[]>([]);
  const [showLogicArmor, setShowLogicArmor] = useState(false);
  const [streakData, setStreakData] = useState<StreakData | null>(null);
  const [showAppIconGenerator, setShowAppIconGenerator] = useState(false);

  // ストリークデータを読み込み
  useEffect(() => {
    const loadStreakData = async () => {
      const data = await calculateStreak();
      setStreakData(data);
    };
    loadStreakData();

    // データ更新・画面遷移を監視
    const handleDataUpdate = () => {
      loadStreakData();
    };
    window.addEventListener('dailyLogUpdated', handleDataUpdate);
    window.addEventListener('screenChanged', handleDataUpdate);

    return () => {
      window.removeEventListener('dailyLogUpdated', handleDataUpdate);
      window.removeEventListener('screenChanged', handleDataUpdate);
    };
  }, []);

  // Tips履歴を読み込み（RemedyItemとTipの両方、お気に入りTipsも含む）
  useEffect(() => {
    const savedRemedyHistory = localStorage.getItem('primal_logic_tip_history');
    const savedTipHistory = localStorage.getItem('primal_logic_tips_displayed');
    const savedTipIds = getSavedTipIds(); // お気に入り登録したTipsのIDリスト

    const history: (RemedyItem | Tip)[] = [];

    // お気に入り登録したTipsを追加
    if (savedTipIds.length > 0) {
      const savedTips = TIPS_DATA.filter((tip) => savedTipIds.includes(tip.id));
      history.push(...savedTips);
    }

    if (savedRemedyHistory) {
      const remedyHistory: RemedyItem[] = JSON.parse(savedRemedyHistory);
      history.push(...remedyHistory);
    }

    if (savedTipHistory) {
      const tipHistory: Tip[] = JSON.parse(savedTipHistory);
      history.push(...tipHistory);
    }

    // 重複を除去（idで判定）
    const uniqueHistory = history.filter(
      (item, index, self) =>
        index ===
        self.findIndex(
          (t) =>
            ('id' in item && 'id' in t && item.id === t.id) ||
            ('symptom' in item && 'symptom' in t && item.symptom === t.symptom)
        )
    );

    setTipHistory(uniqueHistory);
  }, []);

  // Tip詳細を表示
  const handleTipClick = (tip: Tip) => {
    const tipIndex = TIPS_DATA.findIndex((t) => t.id === tip.id);
    setCurrentTipIndex(tipIndex >= 0 ? tipIndex : 0);
    setSelectedTip(tip);
    setIsCurrentTipSaved(isTipSaved(tip.id));
    setShowTipDetail(true);
  };

  // 次のTipsに移動
  const handleNextTip = () => {
    const nextIndex = (currentTipIndex + 1) % TIPS_DATA.length;
    setCurrentTipIndex(nextIndex);
    const nextTip = TIPS_DATA[nextIndex];
    setSelectedTip(nextTip);
    setIsCurrentTipSaved(isTipSaved(nextTip.id));
  };

  // 前のTipsに移動
  const handlePrevTip = () => {
    const prevIndex = currentTipIndex === 0 ? TIPS_DATA.length - 1 : currentTipIndex - 1;
    setCurrentTipIndex(prevIndex);
    const prevTip = TIPS_DATA[prevIndex];
    setSelectedTip(prevTip);
    setIsCurrentTipSaved(isTipSaved(prevTip.id));
  };

  // シェア機能
  const handleShare = async (tip: Tip | RemedyItem) => {
    let shareText = '';
    if ('title' in tip && tip.title) {
      shareText = `Did you know? ${tip.title}\n\n${tip.content} #PrimalLogic`;
    } else if ('symptom' in tip) {
      shareText = `Did you know? ${tip.symptom} -> ${tip.remedies.join(', ')} #PrimalLogic`;
    }

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Primal Logic Tip',
          text: shareText,
        });
      } catch (err) {
        if (import.meta.env.DEV) {
          console.log('Share cancelled');
        }
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareText);
        alert('Copied to clipboard!');
      } catch (err) {
        logError(err, { component: 'LabsScreen', action: 'handleShare' });
      }
    }
  };

  return (
    <div
      className="labs-screen-container"
      style={{ padding: '1rem', maxWidth: '600px', margin: '0 auto' }}
    >
      {/* 説明文 */}
      <div
        style={{
          marginBottom: '2rem',
          padding: '1rem',
          backgroundColor: '#f9fafb',
          borderRadius: '8px',
        }}
      >
        <p style={{ fontSize: '14px', color: '#78716c', lineHeight: '1.6' }}>
          {t('labs.description')}
        </p>
      </div>

      {/* Bio-Hack Dashboard (Experimental) - ボタンで表示 */}
      <div style={{ marginBottom: '2rem' }}>
        <div
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            const event = new CustomEvent('navigateToScreen', { detail: 'bioHack' });
            window.dispatchEvent(event);
          }}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '1rem',
            backgroundColor: '#ecfdf5',
            borderRadius: '8px',
            border: '1px solid #10b981',
            cursor: 'pointer',
            transition: 'background-color 0.2s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#d1fae5')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#ecfdf5')}
        >
          <div>
            <h3
              style={{
                fontSize: '16px',
                fontWeight: 'bold',
                marginBottom: '4px',
                color: '#065f46',
              }}
            >
              🧬 Bio-Hack Terminal
            </h3>
            <p style={{ fontSize: '12px', color: '#065f46' }}>
              代謝状態、細胞修復、栄養素の詳細分析
            </p>
          </div>
          <span style={{ fontSize: '20px', color: '#065f46' }}>→</span>
        </div>
      </div>

      {/* Bio-Tuner (日次入力) */}
      <div style={{ marginBottom: '2rem' }}>
        <div
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            const event = new CustomEvent('navigateToScreen', { detail: 'input' });
            window.dispatchEvent(event);
          }}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '1rem',
            backgroundColor: '#ecfdf5',
            borderRadius: '8px',
            border: '1px solid #10b981',
            cursor: 'pointer',
            transition: 'background-color 0.2s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#d1fae5')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#ecfdf5')}
        >
          <div>
            <h3
              style={{
                fontSize: '16px',
                fontWeight: 'bold',
                marginBottom: '4px',
                color: '#065f46',
              }}
            >
              🧬 Bio-Tuner (Daily)
            </h3>
            <p style={{ fontSize: '12px', color: '#065f46' }}>
              {t('labs.inputDescription') || '睡眠、太陽光、排泄、体調記録など'}
            </p>
          </div>
          <span style={{ fontSize: '20px', color: '#065f46' }}>→</span>
        </div>
      </div>

      {/* 日記機能 */}
      <div style={{ marginBottom: '2rem' }}>
        <div
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            const event = new CustomEvent('navigateToScreen', { detail: 'diary' });
            window.dispatchEvent(event);
          }}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '1rem',
            backgroundColor: 'white',
            borderRadius: '8px',
            border: '1px solid #e7e5e4',
            cursor: 'pointer',
            transition: 'background-color 0.2s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f9fafb')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'white')}
        >
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '4px' }}>
              📝 {t('labs.diary')}
            </h3>
            <p style={{ fontSize: '12px', color: '#78716c' }}>{t('labs.diaryDescription')}</p>
          </div>
          <span style={{ fontSize: '20px' }}>→</span>
        </div>
      </div>



      {/* 統計・グラフ */}
      <div style={{ marginBottom: '2rem' }}>
        <div
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            const event = new CustomEvent('navigateToScreen', { detail: 'stats' });
            window.dispatchEvent(event);
          }}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '1rem',
            backgroundColor: 'white',
            borderRadius: '8px',
            border: '1px solid #e7e5e4',
            cursor: 'pointer',
            transition: 'background-color 0.2s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f9fafb')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'white')}
        >
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '4px' }}>
              📈 {t('labs.stats')}
            </h3>
            <p style={{ fontSize: '12px', color: '#78716c' }}>{t('labs.statsDescription')}</p>
          </div>
          <span style={{ fontSize: '20px' }}>→</span>
        </div>
      </div>

      {/* コミュニティ機能 */}
      {isFeatureEnabled('community') && (
        <div style={{ marginBottom: '2rem' }}>
          <div
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              const event = new CustomEvent('navigateToScreen', { detail: 'community' });
              window.dispatchEvent(event);
            }}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '1rem',
              backgroundColor: 'white',
              borderRadius: '8px',
              border: '1px solid #e7e5e4',
              cursor: 'pointer',
              transition: 'background-color 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f9fafb')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'white')}
          >
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '4px' }}>
                🤝 {t('labs.community')}
              </h3>
              <p style={{ fontSize: '12px', color: '#78716c' }}>{t('labs.communityDescription')}</p>
            </div>
            <span style={{ fontSize: '20px' }}>→</span>
          </div>
        </div>
      )}

      {/* ショップ */}
      <div style={{ marginBottom: '2rem' }}>
        <div
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            const event = new CustomEvent('navigateToScreen', { detail: 'shop' });
            window.dispatchEvent(event);
          }}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '1rem',
            backgroundColor: '#f0f9ff',
            borderRadius: '8px',
            border: '1px solid #0ea5e9',
            cursor: 'pointer',
            transition: 'background-color 0.2s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#e0f2fe')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#f0f9ff')}
        >
          <div>
            <h3
              style={{
                fontSize: '16px',
                fontWeight: 'bold',
                marginBottom: '4px',
                color: '#0c4a6e',
              }}
            >
              🛍️ {t('labs.shop')}
            </h3>
            <p style={{ fontSize: '12px', color: '#0c4a6e' }}>{t('labs.shopDescription')}</p>
          </div>
          <span style={{ fontSize: '20px', color: '#0c4a6e' }}>→</span>
        </div>
      </div>

      {/* ギフト機能 */}
      <div style={{ marginBottom: '2rem' }}>
        <div
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            const event = new CustomEvent('navigateToScreen', { detail: 'gift' });
            window.dispatchEvent(event);
          }}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '1rem',
            backgroundColor: '#fef3c7',
            borderRadius: '8px',
            border: '1px solid #fbbf24',
            cursor: 'pointer',
            transition: 'background-color 0.2s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#fde68a')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#fef3c7')}
        >
          <div>
            <h3
              style={{
                fontSize: '16px',
                fontWeight: 'bold',
                marginBottom: '4px',
                color: '#78350f',
              }}
            >
              🎁 {t('labs.gift')}
            </h3>
            <p style={{ fontSize: '12px', color: '#78350f' }}>{t('labs.giftDescription')}</p>
          </div>
          <span style={{ fontSize: '20px', color: '#78350f' }}>→</span>
        </div>
      </div>

      {/* 習慣トラッカー */}
      <div style={{ marginBottom: '2rem' }}>
        <div
          onClick={() => {
            const event = new CustomEvent('navigateToScreen', { detail: 'streakTracker' });
            window.dispatchEvent(event);
          }}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '1rem',
            backgroundColor: 'white',
            borderRadius: '8px',
            border: '1px solid #e7e5e4',
            cursor: 'pointer',
            transition: 'background-color 0.2s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f9fafb')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'white')}
        >
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '4px' }}>
              🔥 {t('labs.streakTracker')}
            </h3>
            <p style={{ fontSize: '12px', color: '#78716c' }}>
              {streakData
                ? `${streakData.currentStreak}${t('common.days')} ${t('common.consecutive')}`
                : t('labs.streakTrackerDescription')}
            </p>
          </div>
          <span style={{ fontSize: '20px' }}>→</span>
        </div>
      </div>

      {/* Tips表示セクション */}
      {tipsEnabled && (
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '1rem' }}>
            💡 {t('labs.tips')}
          </h3>
          <button
            onClick={() => {
              setTipsListTab('all');
              setShowTipsList(true);
            }}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#fbbf24',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              cursor: 'pointer',
              color: '#78350f',
              fontWeight: 'bold',
              width: '100%',
            }}
          >
            {t('labs.viewTipsList')}
          </button>
        </div>
      )}

      {/* Tip詳細モーダル */}
      {showTipDetail && selectedTip && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
          }}
          onClick={() => setShowTipDetail(false)}
        >
          <div
            style={{
              backgroundColor: 'white',
              padding: '1.5rem',
              borderRadius: '8px',
              maxHeight: '80%',
              overflow: 'auto',
              position: 'relative',
              width: '100%',
              maxWidth: '400px',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowTipDetail(false)}
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                background: 'none',
                border: 'none',
                fontSize: '1.5rem',
                cursor: 'pointer',
              }}
            >
              ×
            </button>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '0.5rem',
              }}
            >
              <h3 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0, flex: 1 }}>
                {selectedTip.title}
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <button
                  onClick={() => {
                    if (isCurrentTipSaved) {
                      unsaveTip(selectedTip.id);
                    } else {
                      saveTip(selectedTip.id);
                    }
                    setIsCurrentTipSaved(!isCurrentTipSaved);
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '20px',
                    cursor: 'pointer',
                    padding: '4px',
                  }}
                  title={isCurrentTipSaved ? t('labs.tipSaved') : t('labs.tipSave')}
                >
                  {isCurrentTipSaved ? '⭐' : '☆'}
                </button>
                <span style={{ fontSize: '12px', color: '#6b7280' }}>
                  {currentTipIndex + 1} / {TIPS_DATA.length}
                </span>
              </div>
            </div>
            <p
              style={{
                fontSize: '14px',
                lineHeight: '1.6',
                color: '#374151',
                marginBottom: '1rem',
              }}
            >
              {selectedTip.content}
            </p>
            {selectedTip.category && (
              <div style={{ marginBottom: '1rem' }}>
                <span
                  style={{
                    padding: '4px 8px',
                    backgroundColor: '#f3f4f6',
                    borderRadius: '4px',
                    fontSize: '12px',
                    color: '#6b7280',
                  }}
                >
                  {selectedTip.category}
                </span>
              </div>
            )}
            <div
              style={{
                display: 'flex',
                gap: '0.5rem',
                justifyContent: 'space-between',
                marginTop: '1.5rem',
              }}
            >
              <button
                onClick={handlePrevTip}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#f3f4f6',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '14px',
                  cursor: 'pointer',
                  color: '#374151',
                  flex: 1,
                }}
              >
                {t('labs.tipBack')}
              </button>
              <button
                onClick={handleNextTip}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#f3f4f6',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '14px',
                  cursor: 'pointer',
                  color: '#374151',
                  flex: 1,
                }}
              >
                {t('labs.tipNext')}
              </button>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
              <button
                onClick={() => handleShare(selectedTip)}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#fee2e2',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '14px',
                  cursor: 'pointer',
                  color: '#dc2626',
                  flex: 1,
                }}
              >
                {t('labs.tipShare')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tips履歴モーダル */}
      {showTipHistory && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
          }}
          onClick={() => setShowTipHistory(false)}
        >
          <div
            style={{
              backgroundColor: 'white',
              padding: '1.5rem',
              borderRadius: '8px',
              maxHeight: '80%',
              overflow: 'auto',
              position: 'relative',
              width: '100%',
              maxWidth: '400px',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1rem',
              }}
            >
              <h3 style={{ fontSize: '18px', fontWeight: 'bold' }}>{t('labs.tipsHistory')}</h3>
              <button
                onClick={() => setShowTipHistory(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                }}
              >
                ×
              </button>
            </div>
            {tipHistory.length === 0 ? (
              <p
                style={{
                  fontSize: '14px',
                  color: '#78716c',
                  textAlign: 'center',
                  padding: '2rem 0',
                }}
              >
                {t('labs.noTipsHistory')}
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {tipHistory.map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: '1rem',
                      backgroundColor: '#f9fafb',
                      border: '1px solid #e7e5e4',
                      borderRadius: '8px',
                    }}
                  >
                    {'title' in item ? (
                      <>
                        <h4 style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '4px' }}>
                          {item.title}
                        </h4>
                        <p
                          style={{
                            fontSize: '12px',
                            color: '#374151',
                            marginBottom: '8px',
                            lineHeight: '1.5',
                          }}
                        >
                          {item.content}
                        </p>
                        {item.category && (
                          <div style={{ marginBottom: '8px' }}>
                            <span
                              style={{
                                padding: '2px 6px',
                                backgroundColor: '#e5e7eb',
                                borderRadius: '4px',
                                fontSize: '10px',
                                color: '#6b7280',
                              }}
                            >
                              {item.category}
                            </span>
                          </div>
                        )}
                      </>
                    ) : (
                      <>
                        <h4 style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '4px' }}>
                          {(item as RemedyItem).symptom}
                        </h4>
                        <p style={{ fontSize: '12px', color: '#78716c', marginBottom: '8px' }}>
                          {(item as RemedyItem).logic}
                        </p>
                        <ul
                          style={{
                            fontSize: '12px',
                            color: '#374151',
                            listStyle: 'disc',
                            paddingLeft: '1.5rem',
                            marginBottom: '8px',
                          }}
                        >
                          {(item as RemedyItem).remedies.map((remedy, rIdx) => (
                            <li key={rIdx}>{remedy}</li>
                          ))}
                        </ul>
                      </>
                    )}
                    <button
                      onClick={() => handleShare(item)}
                      style={{
                        padding: '4px 8px',
                        backgroundColor: '#fee2e2',
                        border: 'none',
                        borderRadius: '4px',
                        fontSize: '12px',
                        cursor: 'pointer',
                        color: '#dc2626',
                      }}
                    >
                      📤 Share
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tips一覧モーダル */}
      {showTipsList && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
          }}
          onClick={() => setShowTipsList(false)}
        >
          <div
            style={{
              backgroundColor: 'white',
              padding: '1.5rem',
              borderRadius: '8px',
              maxHeight: '80%',
              overflow: 'auto',
              position: 'relative',
              width: '100%',
              maxWidth: '600px',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1rem',
                position: 'relative',
                paddingRight: '2rem',
              }}
            >
              <h3 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0 }}>
                {t('labs.tipsList')} (
                {tipsListTab === 'all' ? TIPS_DATA.length : getSavedTipIds().length}
                {t('common.items')})
              </h3>
              <button
                onClick={() => setShowTipsList(false)}
                style={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  background: 'none',
                  border: 'none',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  padding: '0.25rem',
                  zIndex: 10,
                }}
              >
                ×
              </button>
            </div>
            {/* タブ */}
            <div
              style={{
                display: 'flex',
                gap: '0.5rem',
                marginBottom: '1rem',
                borderBottom: '2px solid #e7e5e4',
              }}
            >
              <button
                onClick={() => setTipsListTab('all')}
                style={{
                  padding: '0.5rem 1rem',
                  background: 'none',
                  border: 'none',
                  borderBottom:
                    tipsListTab === 'all' ? '2px solid #fbbf24' : '2px solid transparent',
                  fontSize: '14px',
                  fontWeight: tipsListTab === 'all' ? 'bold' : 'normal',
                  color: tipsListTab === 'all' ? '#78350f' : '#6b7280',
                  cursor: 'pointer',
                  marginBottom: '-2px',
                }}
              >
                {t('labs.tipsListAll')} ({TIPS_DATA.length})
              </button>
              <button
                onClick={() => setTipsListTab('saved')}
                style={{
                  padding: '0.5rem 1rem',
                  background: 'none',
                  border: 'none',
                  borderBottom:
                    tipsListTab === 'saved' ? '2px solid #fbbf24' : '2px solid transparent',
                  fontSize: '14px',
                  fontWeight: tipsListTab === 'saved' ? 'bold' : 'normal',
                  color: tipsListTab === 'saved' ? '#78350f' : '#6b7280',
                  cursor: 'pointer',
                  marginBottom: '-2px',
                }}
              >
                {t('labs.tipsListSaved')} ({getSavedTipIds().length})
              </button>
            </div>
            <div
              style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}
              key={tipsListRefreshKey}
            >
              {(tipsListTab === 'all'
                ? TIPS_DATA
                : TIPS_DATA.filter((tip) => isTipSaved(tip.id))
              ).map((tip, idx) => {
                const originalIndex = TIPS_DATA.findIndex((t) => t.id === tip.id);
                return (
                  <div
                    key={tip.id}
                    style={{
                      padding: '1rem',
                      backgroundColor: '#f9fafb',
                      border: '1px solid #e7e5e4',
                      borderRadius: '8px',
                      transition: 'background-color 0.2s',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        marginBottom: '0.5rem',
                      }}
                    >
                      <h4
                        onClick={() => {
                          setCurrentTipIndex(originalIndex >= 0 ? originalIndex : 0);
                          setSelectedTip(tip);
                          setIsCurrentTipSaved(isTipSaved(tip.id));
                          setShowTipsList(false);
                          setShowTipDetail(true);
                        }}
                        style={{
                          fontSize: '14px',
                          fontWeight: 'bold',
                          margin: 0,
                          flex: 1,
                          cursor: 'pointer',
                        }}
                      >
                        {originalIndex >= 0 ? originalIndex + 1 : idx + 1}. {tip.title}
                      </h4>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const currentlySaved = isTipSaved(tip.id);
                          if (currentlySaved) {
                            unsaveTip(tip.id);
                          } else {
                            saveTip(tip.id);
                          }
                          // 状態を強制的に更新して再レンダリング
                          setTipsListRefreshKey((prev) => prev + 1);
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          fontSize: '20px',
                          cursor: 'pointer',
                          padding: '4px',
                          marginLeft: '0.5rem',
                        }}
                        title={isTipSaved(tip.id) ? t('labs.tipSaved') : t('labs.tipSave')}
                      >
                        {isTipSaved(tip.id) ? '⭐' : '☆'}
                      </button>
                    </div>
                    <p
                      onClick={() => {
                        setCurrentTipIndex(originalIndex >= 0 ? originalIndex : 0);
                        setSelectedTip(tip);
                        setIsCurrentTipSaved(isTipSaved(tip.id));
                        setShowTipsList(false);
                        setShowTipDetail(true);
                      }}
                      style={{
                        fontSize: '12px',
                        color: '#374151',
                        marginBottom: '0.5rem',
                        lineHeight: '1.5',
                        cursor: 'pointer',
                      }}
                    >
                      {tip.content.substring(0, 100)}...
                    </p>
                    {tip.category && (
                      <span
                        style={{
                          padding: '2px 6px',
                          backgroundColor: '#e5e7eb',
                          borderRadius: '4px',
                          fontSize: '10px',
                          color: '#6b7280',
                        }}
                      >
                        {tip.category}
                      </span>
                    )}
                  </div>
                );
              })}
              {tipsListTab === 'saved' && getSavedTipIds().length === 0 && (
                <p
                  style={{
                    fontSize: '14px',
                    color: '#78716c',
                    textAlign: 'center',
                    padding: '2rem 0',
                  }}
                >
                  {t('labs.noSavedTips')}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Logic Armor モーダル */}
      {showLogicArmor && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
          }}
          onClick={() => setShowLogicArmor(false)}
        >
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '16px',
              padding: '1.5rem',
              width: '100%',
              maxWidth: '600px',
              maxHeight: '90vh',
              overflow: 'auto',
              position: 'relative',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowLogicArmor(false)}
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                background: 'none',
                border: 'none',
                fontSize: '24px',
                cursor: 'pointer',
                color: '#6b7280',
              }}
            >
              ×
            </button>
            <KnowledgeScreen />
          </div>
        </div>
      )}

      {/* アプリアイコン生成モーダル */}
      {showAppIconGenerator && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
          }}
          onClick={() => setShowAppIconGenerator(false)}
        >
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '16px',
              padding: '2rem',
              width: '100%',
              maxWidth: '800px',
              maxHeight: '90vh',
              overflowY: 'auto',
              position: 'relative',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowAppIconGenerator(false)}
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                background: 'none',
                border: 'none',
                fontSize: '24px',
                cursor: 'pointer',
                color: '#6b7280',
              }}
            >
              ×
            </button>
            <h2
              style={{
                fontSize: '24px',
                fontWeight: 'bold',
                marginBottom: '1.5rem',
                textAlign: 'center',
              }}
            >
              🎨 {t('labs.appIconGenerator')}
            </h2>
            <AppIconGenerator />
          </div>
        </div>
      )}
    </div>
  );
}
