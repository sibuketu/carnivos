/**
 * Primal Logic - Transition Guide Modal Component
 *
 * Phase 1: 移行期間サポート - 移行期間ガイド画面（モーダル）
 */

import React, { useState } from 'react';
import { TRANSITION_SYMPTOMS, type TransitionSymptom } from '../data/transitionGuide';
import type { TransitionProgress } from '../data/transitionGuide';

interface TransitionGuideModalProps {
  progress: TransitionProgress;
  onClose: () => void;
}

export default function TransitionGuideModal({ progress, onClose }: TransitionGuideModalProps) {
  const [selectedSymptom, setSelectedSymptom] = useState<TransitionSymptom | null>(null);

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '1rem',
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '1.5rem',
          maxWidth: '600px',
          width: '100%',
          maxHeight: '80vh',
          overflowY: 'auto',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ヘッダー */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.5rem',
          }}
        >
          <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 'bold' }}>移行期間ガイド</h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.5rem',
              cursor: 'pointer',
              padding: '0.25rem',
            }}
          >
            ×
          </button>
        </div>

        {/* セクション1: 移行期間の説明 */}
        <section style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '0.75rem' }}>
            移行期間について
          </h3>
          <p style={{ fontSize: '14px', lineHeight: '1.6', marginBottom: '1rem' }}>
            最初の30日間は、体が脂質代謝に切り替わる重要な期間です。
            この期間中は、電解質（ナトリウム、マグネシウム、カリウム）の目標値が自動的に増量されます。
          </p>
          <div style={{ marginTop: '1rem' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '0.5rem',
              }}
            >
              <span style={{ fontSize: '14px' }}>
                進捗: {progress.daysInTransition}/{progress.totalDays}日
              </span>
              <span style={{ fontSize: '14px', fontWeight: 'bold' }}>
                {Math.round(progress.progress)}%
              </span>
            </div>
            <div
              style={{
                width: '100%',
                height: '8px',
                backgroundColor: '#e5e7eb',
                borderRadius: '4px',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: `${progress.progress}%`,
                  height: '100%',
                  backgroundColor: '#3b82f6',
                  transition: 'width 0.3s ease',
                }}
              />
            </div>
          </div>
        </section>

        {/* セクション2: よくある症状と対処法 */}
        <section style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '0.75rem' }}>
            よくある症状と対処法
          </h3>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
            }}
          >
            {TRANSITION_SYMPTOMS.map((symptom) => (
              <button
                key={symptom.id}
                onClick={() =>
                  setSelectedSymptom(selectedSymptom?.id === symptom.id ? null : symptom)
                }
                style={{
                  padding: '0.75rem',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  backgroundColor: selectedSymptom?.id === symptom.id ? '#f3f4f6' : 'white',
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontSize: '14px',
                }}
              >
                <div style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>{symptom.name}</div>
                <div style={{ fontSize: '12px', color: '#6b7280' }}>{symptom.description}</div>
              </button>
            ))}
          </div>

          {/* 選択した症状の対処法を表示 */}
          {selectedSymptom && (
            <div
              style={{
                marginTop: '1rem',
                padding: '1rem',
                backgroundColor: '#f9fafb',
                borderRadius: '8px',
                border: '1px solid #e5e7eb',
              }}
            >
              <h4 style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '0.75rem' }}>
                {selectedSymptom.name}の対処法
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {selectedSymptom.remedies.map((remedy, index) => (
                  <div key={index} style={{ fontSize: '13px', lineHeight: '1.6' }}>
                    <div style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>
                      {remedy.nutrient === 'sodium' && 'ナトリウム'}
                      {remedy.nutrient === 'magnesium' && 'マグネシウム'}
                      {remedy.nutrient === 'potassium' && 'カリウム'}
                      {remedy.nutrient === 'fat' && '脂質'}
                      {remedy.nutrient === 'water' && '水分'}
                      {remedy.adjustment > 0 ? ` +${remedy.adjustment}` : ` ${remedy.adjustment}`}
                      {remedy.nutrient === 'sodium' ||
                      remedy.nutrient === 'magnesium' ||
                      remedy.nutrient === 'potassium'
                        ? 'mg'
                        : remedy.nutrient === 'fat'
                          ? 'g'
                          : 'L'}
                    </div>
                    <div style={{ color: '#6b7280', fontSize: '12px' }}>{remedy.explanation}</div>
                  </div>
                ))}
              </div>
              {selectedSymptom.recommendedFoods.length > 0 && (
                <div style={{ marginTop: '0.75rem' }}>
                  <div style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                    推奨食品:
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {selectedSymptom.recommendedFoods.map((food, index) => (
                      <span
                        key={index}
                        style={{
                          padding: '0.25rem 0.5rem',
                          backgroundColor: 'white',
                          border: '1px solid #e5e7eb',
                          borderRadius: '4px',
                          fontSize: '12px',
                        }}
                      >
                        {food}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </section>

        {/* セクション3: 推奨食品 */}
        <section>
          <h3 style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '0.75rem' }}>
            推奨食品
          </h3>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: '0.75rem',
            }}
          >
            {[
              { name: '内臓肉', items: ['レバー', '腎臓', '心臓'] },
              { name: '脂身の多い肉', items: ['リブアイ', 'バラ肉'] },
              { name: '卵', items: ['特に卵黄'] },
              { name: '魚', items: ['サーモン', 'マグロ'] },
            ].map((category, index) => (
              <div
                key={index}
                style={{
                  padding: '0.75rem',
                  backgroundColor: '#f9fafb',
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb',
                }}
              >
                <div style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                  {category.name}
                </div>
                <div style={{ fontSize: '11px', color: '#6b7280' }}>
                  {category.items.join('、')}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
