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
      (window as unknown as { showToast?: (msg: string) => void }).showToast?.('データのエクスポートに失敗しました');
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
          {t('dataExport.backToSettings')}
        </button>
        <h1 className="data-export-title">{t('dataExport.title')}</h1>
        <p className="data-export-description">
          {t('dataExport.description')}
        </p>

        <button onClick={handleExport} disabled={exporting} className="data-export-button">
          {exporting ? t('dataExport.exporting') : t('dataExport.exportButton')}
        </button>

        {exported && (
          <div className="data-export-success">{t('dataExport.success')}</div>
        )}

        <div className="data-export-info">
          <h3>{t('dataExport.dataIncluded')}</h3>
          <ul>
            <li>{t('dataExport.profileInfo')}</li>
            <li>{t('dataExport.mealRecords')}</li>
            <li>{t('dataExport.diary')}</li>
            <li>{t('dataExport.weightRecords')}</li>
            <li>{t('dataExport.appSettings')}</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
