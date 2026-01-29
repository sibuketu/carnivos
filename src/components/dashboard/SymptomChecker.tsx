/**
 * Primal Logic - Symptom Checker (トラブルシューティング)
 *
 * カーニボア実践中の症状をチェックし、対処法を提案するコンポーネント
 */

import { useState } from 'react';
import { REMEDY_LOGIC, type RemedyItem } from '../../data/remedyLogic';
import './SymptomChecker.css';

export default function SymptomChecker() {
  const [selectedSymptom, setSelectedSymptom] = useState<RemedyItem | null>(null);
  const [showModal, setShowModal] = useState(false);

  const handleSymptomClick = (remedy: RemedyItem) => {
    setSelectedSymptom(remedy);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedSymptom(null);
  };

  return (
    <>
      <div className="symptom-checker-section">
        <h3 className="symptom-checker-title">💊 体調はどう？</h3>
        <p className="symptom-checker-subtitle">症状を選んで対処法を確認</p>
        <div className="symptom-buttons">
          {REMEDY_LOGIC.map((remedy) => (
            <button
              key={remedy.symptom}
              className="symptom-button"
              onClick={() => handleSymptomClick(remedy)}
            >
              {remedy.symptom}
            </button>
          ))}
        </div>
      </div>

      {/* モーダル */}
      {showModal && selectedSymptom && (
        <div className="symptom-modal-overlay" onClick={closeModal}>
          <div className="symptom-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="symptom-modal-close" onClick={closeModal}>
              ×
            </button>
            <h2 className="symptom-modal-title">{selectedSymptom.symptom}</h2>

            <div className="symptom-modal-section">
              <h3 className="symptom-modal-section-title">🔍 考えられる原因</h3>
              <ul className="symptom-modal-list">
                {selectedSymptom.possibleCauses.map((cause, idx) => (
                  <li key={idx}>{cause}</li>
                ))}
              </ul>
            </div>

            <div className="symptom-modal-section">
              <h3 className="symptom-modal-section-title">✅ 対処法</h3>
              <ul className="symptom-modal-list">
                {selectedSymptom.remedies.map((remedy, idx) => (
                  <li key={idx}>{remedy}</li>
                ))}
              </ul>
            </div>

            <div className="symptom-modal-section">
              <h3 className="symptom-modal-section-title">📚 ロジック</h3>
              <p className="symptom-modal-logic">{selectedSymptom.logic}</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
