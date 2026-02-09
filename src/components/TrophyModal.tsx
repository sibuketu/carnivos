/**
 * トロフィーモーダル - トロフィー一覧表示
 */

import React from 'react';
import { TROPHIES } from '../data/trophies';
import type { TrophyProgress } from '../types/trophy';
import { useTranslation } from '../utils/i18n';

interface TrophyModalProps {
  progress: TrophyProgress;
  onClose: () => void;
}

export default function TrophyModal({ progress, onClose }: TrophyModalProps) {
  const { t } = useTranslation();
  const unlockedCount = Object.values(progress).filter((p) => p.unlocked).length;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tt = (key: string): string => (t as any)(key) ?? key;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
        padding: '1rem',
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: 'var(--color-bg-primary)',
          borderRadius: '16px',
          padding: '2rem',
          maxWidth: '600px',
          width: '100%',
          maxHeight: '80vh',
          overflow: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ヘッダー */}
        <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.5rem' }}>
            🏆 {t('trophy.title')}
          </h2>
          <p style={{ color: '#78716c', fontSize: '0.875rem' }}>
            {unlockedCount} / {TROPHIES.length} {t('trophy.achieved')}
          </p>
        </div>

        {/* トロフィーリスト */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {TROPHIES.map((trophy) => {
            const trophyProgress = progress[trophy.id];
            const isUnlocked = trophyProgress?.unlocked || false;
            const currentProgress = trophyProgress?.progress || 0;

            return (
              <div
                key={trophy.id}
                style={{
                  padding: '1rem',
                  borderRadius: '12px',
                  border: '1px solid #e5e7eb',
                  backgroundColor: isUnlocked ? '#f0f9ff' : '#f9fafb',
                  opacity: isUnlocked ? 1 : 0.6,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                  {/* アイコン */}
                  <div
                    style={{
                      fontSize: '2rem',
                      filter: isUnlocked ? 'none' : 'grayscale(100%)',
                    }}
                  >
                    {trophy.title.split(' ')[0]}
                  </div>

                  {/* 内容 */}
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.25rem' }}>
                      {tt(`trophy.${trophy.id}`) !== `trophy.${trophy.id}` ? tt(`trophy.${trophy.id}`).replace(/^[^\s]+\s/, '') : trophy.title.split(' ').slice(1).join(' ')}
                    </h3>
                    <p
                      style={{
                        fontSize: '0.875rem',
                        color: isUnlocked ? '#10b981' : '#78716c',
                        fontWeight: isUnlocked ? '600' : '400',
                        marginBottom: '0.5rem',
                      }}
                    >
                      {isUnlocked
                        ? (tt(`trophy.${trophy.id}Label`) !== `trophy.${trophy.id}Label` ? tt(`trophy.${trophy.id}Label`) : trophy.label)
                        : (tt(`trophy.${trophy.id}Desc`) !== `trophy.${trophy.id}Desc` ? tt(`trophy.${trophy.id}Desc`) : trophy.description)}
                    </p>

                    {/* ヒント（未達成の場合のみ） */}
                    {!isUnlocked && trophy.hint && (
                      <p
                        style={{
                          fontSize: '0.75rem',
                          color: '#f59e0b',
                          marginBottom: '0.5rem',
                          fontStyle: 'italic',
                        }}
                      >
                        💡 {tt(`trophy.${trophy.id}Hint`) !== `trophy.${trophy.id}Hint` ? tt(`trophy.${trophy.id}Hint`) : trophy.hint}
                      </p>
                    )}

                    {/* 進捗バー（未達成の場合のみ） */}
                    {!isUnlocked && trophy.condition.type === 'count' && (
                      <div>
                        <div
                          style={{
                            height: '8px',
                            backgroundColor: '#e5e7eb',
                            borderRadius: '4px',
                            overflow: 'hidden',
                          }}
                        >
                          <div
                            style={{
                              width: `${(currentProgress / trophy.condition.target) * 100}%`,
                              height: '100%',
                              backgroundColor: '#f43f5e',
                              transition: 'width 0.3s',
                            }}
                          />
                        </div>
                        <p style={{ fontSize: '0.75rem', color: '#78716c', marginTop: '0.25rem' }}>
                          {currentProgress} / {trophy.condition.target}
                        </p>
                      </div>
                    )}

                    {/* 達成日時 */}
                    {isUnlocked && trophyProgress.unlockedAt && (
                      <p style={{ fontSize: '0.75rem', color: '#78716c' }}>
                        {t('trophy.achieved')}: {new Date(trophyProgress.unlockedAt).toLocaleDateString(t('common.locale'))}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* 閉じるボタン */}
        <button
          onClick={onClose}
          style={{
            marginTop: '1.5rem',
            width: '100%',
            padding: '0.75rem',
            borderRadius: '8px',
            border: '1px solid #e5e7eb',
            backgroundColor: '#f3f4f6',
            color: '#1f2937',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: 'pointer',
          }}
        >
          {t('common.close')}
        </button>
      </div>
    </div>
  );
}
