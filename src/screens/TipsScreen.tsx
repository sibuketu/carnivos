/**
 * Primal Logic - Knowledge Screen (理論武装モード)
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
import './KnowledgeScreen.css';

export default function TipsScreen() {
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
      }
      return newSet;
    });
  };

  return (
    <div className="knowledge-screen-container">
      <div className="knowledge-screen-header">
        <h1 className="knowledge-screen-title">🛡️ Logic Armor (理論武装)</h1>
        <p className="knowledge-screen-subtitle">
          カーニボアに対する誤解を解き、科学的根拠で武装する
        </p>
      </div>

      {/* カテゴリフィルター */}
      <div className="knowledge-category-filter">
        {categories.map((category) => (
          <button
            key={category}
            className={`knowledge-category-button ${selectedCategory === category ? 'active' : ''}`}
            onClick={() => setSelectedCategory(category)}
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
      <div className="knowledge-cards-container">
        {filteredKnowledge.map((item) => {
          const isFlipped = flippedCards.has(item.id);
          return (
            <div
              key={item.id}
              className={`knowledge-card ${isFlipped ? 'flipped' : ''}`}
              onClick={() => toggleCard(item.id)}
            >
              <div className="knowledge-card-inner">
                {/* 表面（Myth） */}
                <div className="knowledge-card-front">
                  <div className="knowledge-card-category">{item.category}</div>
                  <h3 className="knowledge-card-title">{item.title}</h3>
                  <div className="knowledge-card-myth">
                    <div className="knowledge-card-label">❌ Myth (誤解)</div>
                    <p className="knowledge-card-text">{item.myth}</p>
                  </div>
                  <div className="knowledge-card-hint">タップして真実を見る →</div>
                </div>

                {/* 裏面（Truth + Source） */}
                <div className="knowledge-card-back">
                  <div className="knowledge-card-category">{item.category}</div>
                  <h3 className="knowledge-card-title">{item.title}</h3>
                  <div className="knowledge-card-truth">
                    <div className="knowledge-card-label">✅ Truth (真実)</div>
                    <p className="knowledge-card-text">{item.truth}</p>
                  </div>
                  <div className="knowledge-card-details">
                    <div className="knowledge-card-label">📖 Details</div>
                    <p className="knowledge-card-text">{item.details}</p>
                  </div>
                  <div className="knowledge-card-source">
                    <div className="knowledge-card-label">🔬 Source</div>
                    <p className="knowledge-card-text">{item.source}</p>
                  </div>
                  <div className="knowledge-card-hint">タップして戻る ←</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredKnowledge.length === 0 && (
        <div className="knowledge-empty-state">
          <p>このカテゴリには知識がありません</p>
        </div>
      )}
    </div>
  );
}
