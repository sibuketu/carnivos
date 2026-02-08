/**
 * CarnivOS - Tips Screen
 *
 * カーニボアダイエットに関する一般的な誤解（Myth）と科学的真実（Truth）を表示
 * カード型のリスト表示で、MythをタップするとTruthとSourceが表示される
 */

import { useState, useMemo } from 'react';
import {
  KNOWLEDGE_BASE,
  getAllCategories,
  getKnowledgeByCategory,
  type KnowledgeItem,
} from '../data/knowledgeBase';
import { useTrophyProgress } from '../hooks/useTrophyProgress';
// import './KnowledgeScreen.css'; // Deleted

export default function TipsScreen() {
  const { updateProgress: updateTrophyProgress } = useTrophyProgress();
  const [flippedCards, setFlippedCards] = useState<Set<string>>(new Set());
  const [selectedCategory, setSelectedCategory] = useState<KnowledgeItem['category'] | 'All'>(
    'All'
  );

  const categories = useMemo(() => ['All', ...getAllCategories()] as const, []);
  const filteredKnowledge = useMemo(() => {
    if (selectedCategory === 'All') {
      return KNOWLEDGE_BASE;
    }
    return getKnowledgeByCategory(selectedCategory);
  }, [selectedCategory]);

  const toggleCard = (id: string) => {
    setFlippedCards((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
        // 知識人トロフィー進捗更新（Tips20個読む）
        updateTrophyProgress('scholar');
      }
      return newSet;
    });
  };

  return (
    <div style={{ padding: '1rem', backgroundColor: 'var(--color-bg-primary)', minHeight: '100vh' }}>
      <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>💡 Tips</h1>
        <p style={{ color: '#78716c', fontSize: '0.875rem' }}>
          カーニボアに対する誤解と真実
        </p>
      </div>

      {/* カテゴリフィルター */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem', justifyContent: 'center' }}>
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              border: selectedCategory === category ? '2px solid #f43f5e' : '1px solid #e5e7eb',
              backgroundColor: selectedCategory === category ? '#fce7f3' : 'var(--color-bg-secondary, #f9fafb)',
              color: selectedCategory === category ? '#f43f5e' : '#1f2937',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: selectedCategory === category ? '600' : '400',
            }}
          >
            {category === 'All'
              ? 'すべて'
              : category === 'Digestion'
                ? '消化'
                : category === 'Heart Health'
                  ? '心臓'
                  : category === 'Long-term Health'
                    ? '長期健康'
                    : category === 'Nutrition'
                      ? '栄養'
                      : 'その他'}
          </button>
        ))}
      </div>

      {/* 知識カードリスト */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {filteredKnowledge.map((item) => {
          const isFlipped = flippedCards.has(item.id);
          return (
            <div
              key={item.id}
              onClick={() => toggleCard(item.id)}
              style={{
                backgroundColor: isFlipped ? '#f0f9ff' : 'var(--color-bg-secondary, #f9fafb)',
                border: '1px solid #e5e7eb',
                borderRadius: '12px',
                padding: '1.5rem',
                cursor: 'pointer',
                transition: 'transform 0.3s, box-shadow 0.3s',
                boxShadow: isFlipped ? '0 4px 12px rgba(0,0,0,0.1)' : '0 2px 4px rgba(0,0,0,0.05)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.02)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              <div>
                {!isFlipped ? (
                  /* 表面（Myth） */
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#f43f5e', fontWeight: '600', marginBottom: '0.5rem' }}>
                      {item.category}
                    </div>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem', color: '#1f2937' }}>
                      カーニボアの誤解
                    </h3>
                    <div style={{ marginBottom: '1rem' }}>
                      <div style={{ fontSize: '0.875rem', fontWeight: '600', color: '#ef4444', marginBottom: '0.5rem' }}>
                        ❌ Myth (誤解)
                      </div>
                      <p style={{ fontSize: '0.875rem', lineHeight: '1.6', color: '#374151' }}>{item.myth}</p>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#78716c', textAlign: 'right' }}>
                      タップして真実を見る →
                    </div>
                  </div>
                ) : (
                  /* 裏面（Truth + Source + Mechanism + Effect Size） */
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#f43f5e', fontWeight: '600', marginBottom: '0.5rem' }}>
                      {item.category}
                    </div>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem', color: '#1f2937' }}>
                      科学的真実
                    </h3>
                    <div style={{ marginBottom: '1rem' }}>
                      <div style={{ fontSize: '0.875rem', fontWeight: '600', color: '#10b981', marginBottom: '0.5rem' }}>
                        ✅ Truth (真実)
                      </div>
                      <p style={{ fontSize: '0.875rem', lineHeight: '1.6', color: '#374151' }}>{item.truth}</p>
                    </div>
                    <div style={{ marginBottom: '1rem' }}>
                      <div style={{ fontSize: '0.875rem', fontWeight: '600', color: '#3b82f6', marginBottom: '0.5rem' }}>
                        🔬 Mechanism (メカニズム)
                      </div>
                      <p style={{ fontSize: '0.875rem', lineHeight: '1.6', color: '#374151' }}>{item.mechanism}</p>
                    </div>
                    <div style={{ marginBottom: '1rem' }}>
                      <div style={{ fontSize: '0.875rem', fontWeight: '600', color: '#8b5cf6', marginBottom: '0.5rem' }}>
                        📊 Effect Size (効果量)
                      </div>
                      <p style={{ fontSize: '0.875rem', lineHeight: '1.6', color: '#374151' }}>{item.effectSize}</p>
                    </div>
                    <div style={{ marginBottom: '1rem' }}>
                      <div style={{ fontSize: '0.875rem', fontWeight: '600', color: '#f59e0b', marginBottom: '0.5rem' }}>
                        📚 Source (出典)
                      </div>
                      <p style={{ fontSize: '0.875rem', lineHeight: '1.6', color: '#374151' }}>{item.source}</p>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#78716c', textAlign: 'right' }}>
                      タップして戻る ←
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredKnowledge.length === 0 && (
        <div style={{ textAlign: 'center', padding: '2rem', color: '#78716c' }}>
          <p>このカテゴリには知識がありません</p>
        </div>
      )}
    </div>
  );
}
