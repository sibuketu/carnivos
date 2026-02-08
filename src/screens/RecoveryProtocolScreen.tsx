/**
 * CarnivOS - Recovery Protocol Screen (Web版)
 *
 * Phase 4: Recovery Protocol詳細画面、編集UI、SET PROTOCOLボタン
 */

import { useState } from 'react';
import { useApp } from '../context/AppContext';
import type { RecoveryProtocol } from '../types';
import { calculateTargetFastEnd } from '../utils/recoveryAlgorithm';
import { FASTING_TEMPLATES } from '../utils/fastingDefaults';
import type { DailyLog } from '../types';
import { scheduleDefrostReminder, hasMeatInPlan, requestNotificationPermission } from '../utils/defrostReminder';
import { addProtocolToTomorrowLog } from '../utils/tomorrowLog';
import { logError, getUserFriendlyErrorMessage } from '../utils/errorHandler';
import './RecoveryProtocolScreen.css';

interface RecoveryProtocolScreenProps {
  protocol: RecoveryProtocol;
  onClose: () => void;
  onSetProtocol: (protocol: RecoveryProtocol) => void;
}

export default function RecoveryProtocolScreen({
  protocol,
  onClose,
  onSetProtocol,
}: RecoveryProtocolScreenProps) {
  const { dailyLog, saveDailyLog, loadTodayLog, updateWaterIntake } = useApp();
  const [fastingHours, setFastingHours] = useState(protocol.fastingTargetHours);

  const handleSetProtocol = async () => {
    const updatedProtocol: RecoveryProtocol = {
      ...protocol,
      fastingTargetHours: fastingHours,
      targetFastEnd: calculateTargetFastEnd(fastingHours),
    };

    try {
      // Add protocol to tomorrow's log
      await addProtocolToTomorrowLog(updatedProtocol);

      // Also set in current log (for display)
      onSetProtocol(updatedProtocol);

      // Schedule defrost reminder if meat is in plan
      if (hasMeatInPlan(updatedProtocol)) {
        const meatItem =
          updatedProtocol.dietRecommendations
            ?.find(
              (rec) => rec.toLowerCase().includes('ribeye') || rec.toLowerCase().includes('meat')
            )
            ?.split(' ')
            .find(
              (word) => word.toLowerCase().includes('ribeye') || word.toLowerCase().includes('beef')
            ) || 'meat';

        await scheduleDefrostReminder(meatItem);
      }

      (window as unknown as { showToast?: (msg: string) => void }).showToast?.(
        `✅ プロトコル設定完了 — 断食: ${fastingHours}時間${hasMeatInPlan(updatedProtocol) ? ' / 解凍リマインダー設定済み' : ''}`
      );
      onClose();
    } catch (error) {
      logError(error, { component: 'RecoveryProtocolScreen', action: 'handleSetProtocol' });
      (window as unknown as { showToast?: (msg: string) => void }).showToast?.(
        getUserFriendlyErrorMessage(error) ||
        'エラー: プロトコルの設定に失敗しました。再度お試しください。'
      );
    }
  };

  return (
    <div className="recovery-protocol-overlay" onClick={onClose}>
      <div className="recovery-protocol-container" onClick={(e) => e.stopPropagation()}>
        <div className="recovery-protocol-header">
          <h2 className="recovery-protocol-title">
            リカバリープロトコル
            <span style={{ fontSize: '0.8em', color: '#f59e0b', marginLeft: '0.5rem' }}>
              ⚠️ 実験的機能（β版）
            </span>
          </h2>
          <button className="recovery-protocol-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="recovery-protocol-content">
          {/* Beta版の注意書き */}
          <div style={{
            padding: '0.75rem',
            backgroundColor: '#fef3c7',
            border: '1px solid #fbbf24',
            borderRadius: '8px',
            marginBottom: '1rem',
            fontSize: '0.875rem',
            color: '#92400e'
          }}>
            ⚠️ この機能は現在監視中です。ユーザーの使い方によって機能が正しいかどうかを確認しています。フィードバックをお待ちしています。
          </div>
          <div className="recovery-protocol-section">
            <h3 className="recovery-protocol-section-title">違反タイプ</h3>
            <div className="recovery-protocol-violation-type">
              {protocol.violationType.replace('_', ' ').toUpperCase()}
            </div>
          </div>

          <div className="recovery-protocol-section">
            <h3 className="recovery-protocol-section-title">断食時間</h3>
            <div className="recovery-protocol-fasting-row">
              <input
                type="number"
                className="recovery-protocol-fasting-input"
                value={fastingHours.toString()}
                onChange={(e) => setFastingHours(Number(e.target.value) || 16)}
              />
              <span className="recovery-protocol-fasting-label">時間</span>
            </div>
            <div className="recovery-protocol-fasting-hint">
              目標断食終了時刻: {calculateTargetFastEnd(fastingHours)}
            </div>
            <button
              onClick={async () => {
                if ('Notification' in window && Notification.permission === 'default') {
                  await requestNotificationPermission();
                }
                const endAt = new Date(Date.now() + fastingHours * 60 * 60 * 1000).toISOString();
                localStorage.setItem('primal_logic_fasting_timer_end', endAt);
                (window as unknown as { showToast?: (msg: string) => void }).showToast?.(
                  `${fastingHours}時間の断食タイマーを開始しました`
                );
              }}
              style={{
                marginTop: '0.5rem',
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                border: '1px solid #f43f5e',
                backgroundColor: '#dcfce7',
                color: '#166534',
                cursor: 'pointer',
                fontSize: '14px',
              }}
            >
              ⏱ 断食タイマーを今すぐ開始
            </button>
            <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
              {Object.entries(FASTING_TEMPLATES).map(([key, { name, hours }]) => (
                <button
                  key={key}
                  onClick={() => setFastingHours(hours)}
                  style={{
                    padding: '0.25rem 0.5rem',
                    borderRadius: '6px',
                    border: '1px solid #a3a3a3',
                    backgroundColor: '#fafaf9',
                    fontSize: '12px',
                    cursor: 'pointer',
                  }}
                >
                  {name} ({hours}h)
                </button>
              ))}
            </div>
          </div>

          {protocol.activities && protocol.activities.length > 0 && (
            <div className="recovery-protocol-section">
              <h3 className="recovery-protocol-section-title">推奨アクティビティ</h3>
              {protocol.activities.map((activity, index) => (
                <div key={index} className="recovery-protocol-list-item">
                  <span className="recovery-protocol-list-bullet">•</span>
                  <span className="recovery-protocol-list-text">{activity}</span>
                </div>
              ))}
            </div>
          )}

          {protocol.dietRecommendations && protocol.dietRecommendations.length > 0 && (
            <div className="recovery-protocol-section">
              <h3 className="recovery-protocol-section-title">食事の推奨事項</h3>
              {protocol.dietRecommendations.map((rec, index) => (
                <div key={index} className="recovery-protocol-list-item">
                  <span className="recovery-protocol-list-bullet">•</span>
                  <span className="recovery-protocol-list-text">{rec}</span>
                </div>
              ))}
              <button
                onClick={() => {
                  localStorage.setItem('primal_logic_highlight_electrolytes', '1');
                  onClose();
                  window.dispatchEvent(new CustomEvent('navigateToScreen', { detail: 'home' }));
                  window.dispatchEvent(new CustomEvent('openButcherSelect'));
                }}
                style={{
                  marginTop: '0.5rem',
                  padding: '0.5rem 1rem',
                  borderRadius: '8px',
                  border: '1px solid #f43f5e',
                  backgroundColor: '#dbeafe',
                  color: '#1e40af',
                  cursor: 'pointer',
                  fontSize: '14px',
                }}
              >
                🍽 電解質の多い食品を表示
              </button>
            </div>
          )}

          {/* 水分追加クイックアクション */}
          <div className="recovery-protocol-section">
            <button
              onClick={() => {
                updateWaterIntake(2000);
                (window as unknown as { showToast?: (msg: string) => void }).showToast?.(
                  '水分 +2000ml を記録しました'
                );
              }}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                border: '1px solid #0ea5e9',
                backgroundColor: '#e0f2fe',
                color: '#0369a1',
                cursor: 'pointer',
                fontSize: '14px',
                width: '100%',
              }}
            >
              💧 水分 +2L を記録
            </button>
            <button
              onClick={() => {
                onClose();
                window.dispatchEvent(new CustomEvent('navigateToScreen', { detail: 'input' }));
              }}
              style={{
                marginTop: '0.5rem',
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                border: '1px solid #94a3b8',
                backgroundColor: '#f8fafc',
                color: '#475569',
                cursor: 'pointer',
                fontSize: '14px',
                width: '100%',
              }}
            >
              水分入力画面を開く
            </button>
          </div>

          {protocol.supplements && protocol.supplements.length > 0 && (
            <div className="recovery-protocol-section">
              <h3 className="recovery-protocol-section-title">サプリメント（任意）</h3>
              {protocol.supplements.map((supp, index) => (
                <div key={index} className="recovery-protocol-list-item">
                  <span className="recovery-protocol-list-bullet">•</span>
                  <span className="recovery-protocol-list-text">{supp}</span>
                </div>
              ))}
            </div>
          )}

          {protocol.warnings && protocol.warnings.length > 0 && (
            <div className="recovery-protocol-warning-section">
              <h3 className="recovery-protocol-warning-title">⚠️ 警告</h3>
              {protocol.warnings.map((warning, index) => (
                <div key={index} className="recovery-protocol-list-item">
                  <span className="recovery-protocol-list-bullet">⚠️</span>
                  <span className="recovery-protocol-warning-text">{warning}</span>
                </div>
              ))}
            </div>
          )}

          {/* Recovery Quest: Todoリスト */}
          {protocol.todos && protocol.todos.length > 0 && (
            <div className="recovery-protocol-section">
              <h3 className="recovery-protocol-section-title">📋 実行すべきタスク</h3>
              {protocol.todos.map((todo) => (
                <div
                  key={todo.id}
                  style={{
                    padding: '0.75rem 1rem',
                    backgroundColor: todo.isCompleted ? '#f0fdf4' : '#fef3c7',
                    border: `1px solid ${todo.isCompleted ? '#86efac' : '#fbbf24'}`,
                    borderRadius: '8px',
                    marginBottom: '0.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={todo.isCompleted}
                    onChange={async (e) => {
                      // Todoの完了状態を更新
                      const updatedTodos =
                        protocol.todos?.map((t) =>
                          t.id === todo.id ? { ...t, isCompleted: e.target.checked } : t
                        ) || [];

                      // Recovery Protocolを更新
                      const updatedProtocol: RecoveryProtocol = {
                        ...protocol,
                        todos: updatedTodos,
                      };

                      // 現在のログに反映
                      if (dailyLog) {
                        const updatedLog: DailyLog = {
                          ...dailyLog,
                          recoveryProtocol: updatedProtocol,
                        };
                        await saveDailyLog(updatedLog);
                        loadTodayLog();
                      }
                    }}
                    style={{
                      width: '18px',
                      height: '18px',
                      cursor: 'pointer',
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontWeight: '600',
                        marginBottom: '0.25rem',
                        color: todo.isCompleted ? '#166534' : '#92400e',
                      }}
                    >
                      {todo.title}
                    </div>
                    {todo.description && (
                      <div
                        style={{
                          fontSize: '12px',
                          color: todo.isCompleted ? '#16a34a' : '#78350f',
                        }}
                      >
                        {todo.description}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          <button className="recovery-protocol-set-button" onClick={handleSetProtocol}>
            プロトコルを設定
          </button>

          <div className="recovery-protocol-footer-note">
            このプロトコルは明日のログに追加され、今夜8時に解凍リマインダーが設定されます。
          </div>
        </div>
      </div>
    </div>
  );
}
