/**
 * Community Screen - コミュニティ機能
 *
 * 設計思想: 既存コミュニティ系の上位互換 + データ駆動型集合知
 * - 既存コミュニティ（Discord、Reddit、X等）の上位互換
 * - 会話はデータベースに保存され、ログとして活用される
 * - 過去の会話に基づいてAIが回答したり、集合知の生成に利用される
 */

import { useState, useEffect } from 'react';
import {
  analyzePatterns,
  exportDataForConsultation,
  type PatternAnalysis,
} from '../utils/communityAnalytics';
import { mockCommunityInsights, mockCommunityPatterns } from '../utils/communityMockData';
import { mockConversations } from '../utils/communityConversations';
import { useTranslation } from '../utils/i18n';
import { logError, getUserFriendlyErrorMessage } from '../utils/errorHandler';
import './CommunityScreen.css';

type CommunityScreenProps = {
  onBack: () => void;
};

type CommunityCategory = 'conversations' | 'insights' | 'patterns' | 'consultation';

export default function CommunityScreen({ onBack }: CommunityScreenProps) {
  const { t } = useTranslation();
  const [activeCategory, setActiveCategory] = useState<CommunityCategory>('conversations');
  const [_patterns, setPatterns] = useState<PatternAnalysis | null>(null);
  const [_isLoading, setIsLoading] = useState(false);
  const [showConcept, setShowConcept] = useState(false);
  const [selectedThread, setSelectedThread] = useState<string | null>(null);

  useEffect(() => {
    if (activeCategory === 'patterns') {
      const loadPatterns = async () => {
        try {
          setIsLoading(true);
          const patternsData = await analyzePatterns();
          setPatterns(patternsData);
          setIsLoading(false);
        } catch (error) {
          logError(error, { component: 'CommunityScreen', action: 'loadPatterns' });
          setIsLoading(false);
        }
      };
      loadPatterns();
    }
  }, [activeCategory]);

  return (
    <div className="community-screen-container">
      <div className="community-screen-content">
        {/* ヘッダー */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '2rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button
              onClick={onBack}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '24px',
                cursor: 'pointer',
                color: '#6b7280',
              }}
            >
              ←
            </button>
            <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>
              🤝 {t('community.title')}
            </h1>
          </div>
          <button
            onClick={() => setShowConcept(!showConcept)}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '20px',
              cursor: 'pointer',
              color: '#6b7280',
              padding: '0.5rem',
            }}
            title={t('community.showConcept')}
          >
            ❓
          </button>
        </div>

        {/* 設計思想の説明（展開可能） */}
        {showConcept && (
          <div
            style={{
              padding: '1.5rem',
              backgroundColor: '#f9fafb',
              borderRadius: '16px',
              border: '1px solid #e5e7eb',
              marginBottom: '2rem',
            }}
          >
            <h2
              style={{
                fontSize: '16px',
                fontWeight: 'bold',
                marginBottom: '0.75rem',
                color: '#1f2937',
              }}
            >
              {t('community.conceptTitle')}
            </h2>
            <div style={{ fontSize: '14px', color: '#4b5563', lineHeight: '1.6' }}>
              <p style={{ marginBottom: '0.75rem' }}>
                <strong>{t('community.concept1')}</strong>
              </p>
              <p style={{ marginBottom: '0.75rem' }}>{t('community.concept2')}</p>
              <ul style={{ marginLeft: '1.5rem', marginTop: '0.75rem' }}>
                <li style={{ marginBottom: '0.5rem' }}>
                  <strong>{t('community.concept3')}</strong>: {t('community.concept3Desc')}
                </li>
                <li style={{ marginBottom: '0.5rem' }}>
                  <strong>{t('community.concept4')}</strong>: {t('community.concept4Desc')}
                </li>
                <li style={{ marginBottom: '0.5rem' }}>
                  <strong>{t('community.concept5')}</strong>: {t('community.concept5Desc')}
                </li>
                <li>
                  <strong>{t('community.concept6')}</strong>: {t('community.concept6Desc')}
                </li>
              </ul>
            </div>
          </div>
        )}

        {/* カテゴリタブ */}
        <div
          style={{
            display: 'flex',
            gap: '0.5rem',
            marginBottom: '2rem',
            borderBottom: '1px solid #e5e7eb',
            overflowX: 'auto',
          }}
        >
          <button
            onClick={() => setActiveCategory('conversations')}
            style={{
              padding: '0.75rem 1rem',
              background: 'none',
              border: 'none',
              borderBottom:
                activeCategory === 'conversations' ? '2px solid #dc2626' : '2px solid transparent',
              color: activeCategory === 'conversations' ? '#dc2626' : '#6b7280',
              fontWeight: activeCategory === 'conversations' ? '600' : '400',
              cursor: 'pointer',
              fontSize: '14px',
              whiteSpace: 'nowrap',
            }}
          >
            💬 {t('community.conversations')}
          </button>
          <button
            onClick={() => setActiveCategory('insights')}
            style={{
              padding: '0.75rem 1rem',
              background: 'none',
              border: 'none',
              borderBottom:
                activeCategory === 'insights' ? '2px solid #dc2626' : '2px solid transparent',
              color: activeCategory === 'insights' ? '#dc2626' : '#6b7280',
              fontWeight: activeCategory === 'insights' ? '600' : '400',
              cursor: 'pointer',
              fontSize: '14px',
              whiteSpace: 'nowrap',
            }}
          >
            💡 {t('community.insights')}
          </button>
          <button
            onClick={() => setActiveCategory('patterns')}
            style={{
              padding: '0.75rem 1rem',
              background: 'none',
              border: 'none',
              borderBottom:
                activeCategory === 'patterns' ? '2px solid #dc2626' : '2px solid transparent',
              color: activeCategory === 'patterns' ? '#dc2626' : '#6b7280',
              fontWeight: activeCategory === 'patterns' ? '600' : '400',
              cursor: 'pointer',
              fontSize: '14px',
              whiteSpace: 'nowrap',
            }}
          >
            📊 {t('community.patterns')}
          </button>
          <button
            onClick={() => setActiveCategory('consultation')}
            style={{
              padding: '0.75rem 1rem',
              background: 'none',
              border: 'none',
              borderBottom:
                activeCategory === 'consultation' ? '2px solid #dc2626' : '2px solid transparent',
              color: activeCategory === 'consultation' ? '#dc2626' : '#6b7280',
              fontWeight: activeCategory === 'consultation' ? '600' : '400',
              cursor: 'pointer',
              fontSize: '14px',
              whiteSpace: 'nowrap',
            }}
          >
            👨‍⚕️ {t('community.consultation')}
          </button>
        </div>

        {/* コンテンツ */}
        {activeCategory === 'conversations' && (
          <div>
            <div
              style={{
                padding: '1.5rem',
                backgroundColor: 'var(--color-bg-primary)',
                borderRadius: '16px',
                border: '1px solid #e5e7eb',
                marginBottom: '1rem',
              }}
            >
              <h2
                style={{
                  fontSize: '18px',
                  fontWeight: 'bold',
                  marginBottom: '0.75rem',
                  color: '#1f2937',
                }}
              >
                💬 {t('community.conversationsTitle')}
              </h2>
              <div
                style={{
                  padding: '1rem',
                  backgroundColor: '#fef3c7',
                  borderRadius: '8px',
                  marginBottom: '1rem',
                  border: '1px solid #fbbf24',
                }}
              >
                <div
                  style={{
                    fontSize: '14px',
                    color: '#78350f',
                    fontWeight: '600',
                    marginBottom: '0.5rem',
                  }}
                >
                  ⚠️ {t('community.comingSoonWarning')}
                </div>
                <p
                  style={{
                    fontSize: '13px',
                    color: '#78350f',
                    lineHeight: '1.6',
                    margin: 0,
                  }}
                >
                  {t('community.comingSoonDescription')}
                </p>
              </div>
              <p
                style={{
                  fontSize: '13px',
                  color: '#6b7280',
                  lineHeight: '1.6',
                  marginBottom: '1rem',
                }}
              >
                {t('community.conversationsDescription')}
              </p>

              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                  marginTop: '1rem',
                }}
              >
                {mockConversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    style={{
                      padding: '1rem',
                      backgroundColor: '#f9fafb',
                      borderRadius: '8px',
                      border: '1px solid #e5e7eb',
                      cursor: 'pointer',
                    }}
                    onClick={() => {
                      setSelectedThread(selectedThread === conversation.id ? null : conversation.id);
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
                      <div style={{ flex: 1 }}>
                        <div
                          style={{
                            fontSize: '15px',
                            fontWeight: '600',
                            color: '#1f2937',
                            marginBottom: '0.25rem',
                          }}
                        >
                          {conversation.title}
                        </div>
                        <div
                          style={{
                            fontSize: '13px',
                            color: '#6b7280',
                            marginBottom: '0.5rem',
                            lineHeight: '1.5',
                          }}
                        >
                          {conversation.content}
                        </div>
                      </div>
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                        <span style={{ fontSize: '12px', color: '#9ca3af' }}>
                          {conversation.author}
                        </span>
                        <span style={{ fontSize: '12px', color: '#9ca3af' }}>
                          {conversation.timestamp}
                        </span>
                      </div>
                      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <span style={{ fontSize: '12px', color: '#6b7280' }}>
                          👍 {conversation.upvotes}
                        </span>
                        <span style={{ fontSize: '12px', color: '#6b7280' }}>
                          💬 {conversation.replies}
                        </span>
                        <span style={{ fontSize: '12px', color: '#9ca3af' }}>
                          👁 {conversation.views}
                        </span>
                      </div>
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        gap: '0.5rem',
                        marginTop: '0.5rem',
                        flexWrap: 'wrap',
                      }}
                    >
                      {conversation.tags.map((tag, index) => (
                        <span
                          key={index}
                          style={{
                            padding: '0.25rem 0.5rem',
                            backgroundColor: '#e5e7eb',
                            borderRadius: '12px',
                            fontSize: '11px',
                            color: '#4b5563',
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeCategory === 'insights' && (
          <div>
            <div
              style={{
                padding: '1.5rem',
                backgroundColor: 'var(--color-bg-primary)',
                borderRadius: '16px',
                border: '1px solid #e5e7eb',
                marginBottom: '1rem',
              }}
            >
              <h2
                style={{
                  fontSize: '18px',
                  fontWeight: 'bold',
                  marginBottom: '1rem',
                  color: '#1f2937',
                }}
              >
                💡 {t('community.insightsTitle')}
              </h2>
              <p
                style={{
                  fontSize: '14px',
                  color: '#6b7280',
                  lineHeight: '1.6',
                  marginBottom: '1rem',
                }}
              >
                {t('community.insightsDescription')}
              </p>
              <p
                style={{
                  fontSize: '13px',
                  color: '#9ca3af',
                  lineHeight: '1.6',
                  marginBottom: '1rem',
                  fontStyle: 'italic',
                }}
              >
                {t('community.insightsNote')}
              </p>

              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                  marginTop: '1rem',
                }}
              >
                {mockCommunityInsights.map((insight) => (
                  <div
                    key={insight.id}
                    style={{
                      padding: '1rem',
                      backgroundColor: '#f9fafb',
                      borderRadius: '8px',
                      border: '1px solid #e5e7eb',
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
                      <div
                        style={{
                          fontSize: '15px',
                          fontWeight: '600',
                          color: '#1f2937',
                        }}
                      >
                        {insight.title}
                      </div>
                      <div
                        style={{
                          padding: '0.25rem 0.75rem',
                          backgroundColor: '#dc2626',
                          color: 'white',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: '600',
                        }}
                      >
                        {insight.stat}
                      </div>
                    </div>
                    <div
                      style={{
                        fontSize: '13px',
                        color: '#6b7280',
                        lineHeight: '1.5',
                      }}
                    >
                      {insight.description}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeCategory === 'patterns' && (
          <div>
            <div
              style={{
                padding: '1.5rem',
                backgroundColor: 'var(--color-bg-primary)',
                borderRadius: '16px',
                border: '1px solid #e5e7eb',
                marginBottom: '1rem',
              }}
            >
              <h2
                style={{
                  fontSize: '18px',
                  fontWeight: 'bold',
                  marginBottom: '1rem',
                  color: '#1f2937',
                }}
              >
                📊 {t('community.patternsTitle')}
              </h2>
              <p
                style={{
                  fontSize: '14px',
                  color: '#6b7280',
                  lineHeight: '1.6',
                  marginBottom: '1rem',
                }}
              >
                {t('community.patternsDescription')}
              </p>

              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                  marginTop: '1rem',
                }}
              >
                {mockCommunityPatterns.map((pattern) => (
                  <div
                    key={pattern.id}
                    style={{
                      padding: '1rem',
                      backgroundColor: '#f9fafb',
                      borderRadius: '8px',
                      border: '1px solid #e5e7eb',
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
                      <div
                        style={{
                          fontSize: '15px',
                          fontWeight: '600',
                          color: '#1f2937',
                        }}
                      >
                        {pattern.pattern}
                      </div>
                      <div
                        style={{
                          padding: '0.25rem 0.75rem',
                          backgroundColor: '#059669',
                          color: 'white',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: '600',
                        }}
                      >
                        {pattern.percentage}%
                      </div>
                    </div>
                    <div
                      style={{
                        fontSize: '13px',
                        color: '#6b7280',
                        lineHeight: '1.5',
                        marginBottom: '0.25rem',
                      }}
                    >
                      {pattern.description}
                    </div>
                    <div
                      style={{
                        fontSize: '12px',
                        color: '#9ca3af',
                      }}
                    >
                      {t('community.sampleSize')}: {pattern.sampleSize.toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeCategory === 'consultation' && (
          <div>
            <div
              style={{
                padding: '1.5rem',
                backgroundColor: 'var(--color-bg-primary)',
                borderRadius: '16px',
                border: '1px solid #e5e7eb',
                marginBottom: '1rem',
              }}
            >
              <h2
                style={{
                  fontSize: '18px',
                  fontWeight: 'bold',
                  marginBottom: '1rem',
                  color: '#1f2937',
                }}
              >
                👨‍⚕️ {t('community.consultationTitle')}
              </h2>
              <div
                style={{
                  padding: '1rem',
                  backgroundColor: '#eff6ff',
                  borderRadius: '8px',
                  marginBottom: '1rem',
                }}
              >
                <div
                  style={{
                    fontSize: '14px',
                    color: '#1e40af',
                    lineHeight: '1.6',
                    marginBottom: '0.75rem',
                  }}
                >
                  <strong>{t('community.consultationSubtitle')}</strong>
                </div>
                <p
                  style={{
                    fontSize: '13px',
                    color: '#1e3a8a',
                    lineHeight: '1.6',
                    marginBottom: '0.75rem',
                  }}
                >
                  {t('community.consultationDesc1')}
                </p>
                <p
                  style={{
                    fontSize: '13px',
                    color: '#1e3a8a',
                    lineHeight: '1.6',
                    marginBottom: '0.75rem',
                  }}
                >
                  {t('community.consultationDesc2')}
                </p>
                <p
                  style={{
                    fontSize: '13px',
                    color: '#1e3a8a',
                    lineHeight: '1.6',
                    marginBottom: '0.75rem',
                  }}
                >
                  {t('community.consultationDesc3')}
                </p>
                <p
                  style={{
                    fontSize: '13px',
                    color: '#1e3a8a',
                    lineHeight: '1.6',
                  }}
                >
                  {t('community.consultationDesc4')}
                </p>
              </div>
              <p
                style={{
                  fontSize: '13px',
                  color: '#6b7280',
                  lineHeight: '1.6',
                  marginBottom: '1rem',
                  fontStyle: 'italic',
                }}
              >
                {t('community.consultationNote')}
              </p>

              <button
                onClick={async () => {
                  try {
                    const data = await exportDataForConsultation();
                    const blob = new Blob([data], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `carnivore-data-${new Date().toISOString().split('T')[0]}.json`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                  } catch (error) {
                    logError(error, { component: 'CommunityScreen', action: 'handleExport' });
                    (window as unknown as { showToast?: (msg: string) => void }).showToast?.(getUserFriendlyErrorMessage(error) || t('community.exportFailed'));
                  }
                }}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#dc2626',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  width: '100%',
                  marginTop: '1rem',
                }}
              >
                {t('community.exportData')}
              </button>

              <div
                style={{
                  padding: '1rem',
                  backgroundColor: '#eff6ff',
                  borderRadius: '8px',
                  marginTop: '1rem',
                }}
              >
                <div
                  style={{
                    fontSize: '13px',
                    color: '#1e40af',
                  }}
                >
                  💡 将来的には、専門医・コーチとのデータ共有プラットフォームが利用可能になります
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
