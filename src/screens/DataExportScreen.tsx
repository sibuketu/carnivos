/**
 * CarnivOS - データエクスポート画面
 *
 * GDPR対応：ユーザーデータのエクスポート機能
 */

import { useState } from 'react';
import { getDailyLogs } from '../utils/storage';
import { logError } from '../utils/errorHandler';
import './DataExportScreen.css';

export default function DataExportScreen() {
  const [exporting, setExporting] = useState(false);
  const [exported, setExported] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    setExported(false);

    try {
      // 全てのデータを取得
      const logs = await getDailyLogs();
      const userProfile = localStorage.getItem('primal_logic_user_profile');
      const settings = localStorage.getItem('primal_logic_settings');

      // エクスポートデータを構築
      const exportData = {
        exportDate: new Date().toISOString(),
        version: '1.0',
        userProfile: userProfile ? JSON.parse(userProfile) : null,
        settings: settings ? JSON.parse(settings) : null,
        dailyLogs: logs,
      };

      // JSONファイルとしてダウンロード
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `primal-logic-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setExported(true);
    } catch (error) {
      logError(error, { component: 'DataExportScreen', action: 'handleExport' });
      alert('データのエクスポートに失敗しました');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="data-export-screen">
      <div className="data-export-container">
        <button
          onClick={() => {
            window.dispatchEvent(new CustomEvent('navigateToScreen', { detail: 'settings' }));
          }}
          className="data-export-back-button"
        >
          ← 設定に戻る
        </button>
        <h1 className="data-export-title">データエクスポート</h1>
        <p className="data-export-description">
          あなたのデータをJSON形式でダウンロードできます。
          これには、食事記録、プロファイル情報、設定などが含まれます。
        </p>

        <button onClick={handleExport} disabled={exporting} className="data-export-button">
          {exporting ? 'エクスポート中...' : 'データをエクスポート'}
        </button>

        {exported && (
          <div className="data-export-success">✅ データのエクスポートが完了しました</div>
        )}

        <div className="data-export-info">
          <h3>エクスポートされるデータ</h3>
          <ul>
            <li>プロファイル情報（性別、年齢、体重など）</li>
            <li>食事記録（全履歴）</li>
            <li>日記</li>
            <li>体重・体脂肪率の記録</li>
            <li>アプリ設定</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
