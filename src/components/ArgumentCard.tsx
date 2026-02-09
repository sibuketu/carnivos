/**
 * CarnivOS - Argument Card Component (Web版)
 *
 * 3-tier情報表示: Level 1 (Glance) → Level 2 (Explanation) → Level 3 (Source)
 * Phase 3: The Logic Shield
 */

import { useState } from 'react';
import type { ArgumentCard as ArgumentCardType } from '../data/argumentCards';
import { useTranslation } from '../utils/i18n';
import './ArgumentCard.css';

interface ArgumentCardProps {
  card: ArgumentCardType;
  onClose: () => void;
}

export default function ArgumentCard({ card, onClose }: ArgumentCardProps) {
  const { t } = useTranslation();
  const [level, setLevel] = useState<1 | 2 | 3>(1);
  const [showCitations, setShowCitations] = useState(false);

  // 引用元を抽出し、テキストから削除する関数
  const formatArgumentCardText = (text: string): { cleanedText: string; citations: string[] } => {
    // 引用元のパターンを抽出
    const citationPatterns = [
      /\[論証スタイル[^\]]*\]/g,
      /\[疫学の批判[^\]]*\]/g,
      /\[栄養科学[^\]]*\]/g,
      /\[カーニボアの科学的検証[^\]]*\]/g,
      /\[科学的検証[^\]]*\]/g,
      /\[[^\]]*\]/g, // その他の角括弧内のテキスト
    ];

    const citations: string[] = [];
    let cleanedText = text;

    // 引用元を抽出して削除
    citationPatterns.forEach((pattern) => {
      const matches = cleanedText.match(pattern);
      if (matches) {
        citations.push(...matches.map((m) => m.replace(/[[\]]/g, '')));
        cleanedText = cleanedText.replace(pattern, '');
      }
    });

    // 句読点の後に改行を追加（読みやすくするため）
    cleanedText = cleanedText
      .trim()
      .replace(/。/g, '。\n\n')
      .replace(/、/g, '、\n')
      .replace(/\. /g, '.\n\n')
      .replace(/, /g, ',\n');

    return { cleanedText, citations: [...new Set(citations)] }; // 重複を削除
  };

  // 引用元を抽出
  const { cleanedText: level2Text, citations } = formatArgumentCardText(card.level2);

  const getVerdictColor = () => {
    switch (card.verdict) {
      case 'trash':
        return '#FF3B30';
      case 'sufficient':
        return '#34C759';
      case 'precious':
        return '#FF9500';
      case 'safe':
        return '#007AFF';
      default:
        return '#666';
    }
  };

  return (
    <div className="argument-card-overlay" onClick={onClose}>
      <div className="argument-card-container" onClick={(e) => e.stopPropagation()}>
        <div className="argument-card-header">
          <h2 className="argument-card-title">
            {card.emoji} {card.topic}
          </h2>
          <button className="argument-card-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="argument-card-content">
          {/* Level 1: Glance */}
          {level >= 1 && (
            <div className="argument-card-level">
              <div className="argument-card-level-label">{t('argumentCard.level1')}</div>
              <div
                className="argument-card-level-card"
                style={{ borderLeftColor: getVerdictColor() }}
              >
                <div className="argument-card-level1-text">{card.level1}</div>
              </div>
            </div>
          )}

          {/* Level 2: Explanation */}
          {level >= 2 && (
            <div className="argument-card-level">
              <div className="argument-card-level-label">{t('argumentCard.level2')}</div>
              <div
                className="argument-card-level-card"
                style={{ borderLeftColor: getVerdictColor() }}
              >
                <div className="argument-card-level2-text">
                  {level2Text.split('\n').map((line, index) => (
                    <span key={index}>
                      {line}
                      {index < level2Text.split('\n').length - 1 && <br />}
                    </span>
                  ))}
                </div>
                {/* 引用元ボタン */}
                {citations.length > 0 && (
                  <div
                    style={{
                      marginTop: '12px',
                      paddingTop: '12px',
                      borderTop: '1px solid var(--color-border)',
                    }}
                  >
                    <button
                      onClick={() => setShowCitations(!showCitations)}
                      className="argument-card-citation-button"
                      style={{
                        background: 'transparent',
                        border: '1px solid var(--color-border)',
                        borderRadius: '6px',
                        padding: '6px 12px',
                        color: 'var(--color-text-secondary)',
                        fontSize: '12px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      {showCitations ? '▼' : '▶'} 引用元 ({citations.length})
                    </button>
                    {showCitations && (
                      <div
                        style={{
                          marginTop: '8px',
                          padding: '8px',
                          backgroundColor: 'var(--color-bg-tertiary)',
                          borderRadius: '6px',
                        }}
                      >
                        {citations.map((citation, idx) => (
                          <div
                            key={idx}
                            style={{
                              fontSize: '12px',
                              color: 'var(--color-text-secondary)',
                              marginBottom: '4px',
                            }}
                          >
                            • {citation}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Level 3: Source - 削除（3枚目を消す） */}

          {/* Expand Button */}
          {level < 2 && (
            <button
              className="argument-card-expand-button"
              style={{ backgroundColor: getVerdictColor() }}
              onClick={() => setLevel((prev) => (prev + 1) as 1 | 2)}
            >
              詳細説明を見る →
            </button>
          )}

          {/* Verdict Badge */}
          <div
            className="argument-card-verdict-badge"
            style={{ backgroundColor: getVerdictColor() }}
          >
            判定: {card.emoji}{' '}
            {card.verdict === 'trash'
              ? '不要'
              : card.verdict === 'sufficient'
                ? '十分'
                : card.verdict === 'precious'
                  ? '重要'
                  : '安全'}
          </div>
        </div>
      </div>
    </div>
  );
}
