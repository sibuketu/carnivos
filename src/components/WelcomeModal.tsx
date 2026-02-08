/**
 * ウェルカムモーダル - 初回訪問時に表示
 * AIアシスタントとトロフィーシステムの2カード表示
 */

import React, { useState } from 'react';

interface WelcomeModalProps {
  onClose: () => void;
}

export default function WelcomeModal({ onClose }: WelcomeModalProps) {
  const [currentCard, setCurrentCard] = useState(0);

  const cards = [
    {
      emoji: '🤖',
      title: 'AIアシスタントがサポート',
      description: (
        <>
          <p style={{ marginBottom: '0.75rem' }}>
            CarnivOSには強力なAIアシスタントが搭載されています。
          </p>
          <ul style={{ paddingLeft: '1.5rem', marginBottom: '0.75rem' }}>
            <li>📸 写真から食品を自動認識</li>
            <li>💬 栄養や健康について質問</li>
            <li>🔬 科学的根拠に基づくアドバイス</li>
          </ul>
          <p style={{ fontSize: '0.875rem', color: '#78716c' }}>
            困ったときはいつでもAIに聞いてください！
          </p>
        </>
      ),
    },
    {
      emoji: '🏆',
      title: 'トロフィーで成長を実感',
      description: (
        <>
          <p style={{ marginBottom: '0.75rem' }}>
            あなたの行動は全てトロフィーとして記録されます。
          </p>
          <ul style={{ paddingLeft: '1.5rem', marginBottom: '0.75rem' }}>
            <li>🦁 ハンター - 本能に従う人</li>
            <li>🔬 科学者 - 探求する人</li>
            <li>⚡ マスター - 真のカーニボア</li>
          </ul>
          <p style={{ fontSize: '0.875rem', color: '#78716c' }}>
            画面右上の🏆ボタンから進捗を確認できます。
          </p>
        </>
      ),
    },
  ];

  const handleNext = () => {
    if (currentCard < cards.length - 1) {
      setCurrentCard(currentCard + 1);
    } else {
      onClose();
    }
  };

  const handleSkip = () => {
    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
        padding: '1rem',
      }}
      onClick={handleSkip}
    >
      <div
        style={{
          backgroundColor: 'var(--color-bg-primary)',
          borderRadius: '16px',
          padding: '2rem',
          maxWidth: '500px',
          width: '100%',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* カードインジケーター */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '0.5rem',
            marginBottom: '1.5rem',
          }}
        >
          {cards.map((_, index) => (
            <div
              key={index}
              style={{
                width: '32px',
                height: '4px',
                borderRadius: '2px',
                backgroundColor: index === currentCard ? '#f43f5e' : '#e5e7eb',
                transition: 'background-color 0.3s',
              }}
            />
          ))}
        </div>

        {/* カードコンテンツ */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>
            {cards[currentCard].emoji}
          </div>
          <h2
            style={{
              fontSize: '1.5rem',
              fontWeight: '700',
              marginBottom: '1rem',
              color: 'var(--color-text-primary, #1f2937)',
            }}
          >
            {cards[currentCard].title}
          </h2>
          <div
            style={{
              fontSize: '1rem',
              color: 'var(--color-text-secondary, #4b5563)',
              textAlign: 'left',
            }}
          >
            {cards[currentCard].description}
          </div>
        </div>

        {/* ボタン */}
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={handleSkip}
            style={{
              flex: 1,
              padding: '0.75rem',
              borderRadius: '8px',
              border: '1px solid #e5e7eb',
              backgroundColor: 'transparent',
              color: '#6b7280',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            スキップ
          </button>
          <button
            onClick={handleNext}
            style={{
              flex: 2,
              padding: '0.75rem',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: '#f43f5e',
              color: 'white',
              fontSize: '1rem',
              fontWeight: '700',
              cursor: 'pointer',
            }}
          >
            {currentCard < cards.length - 1 ? '次へ' : '始める'}
          </button>
        </div>
      </div>
    </div>
  );
}
