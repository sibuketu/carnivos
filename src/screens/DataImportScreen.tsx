/**
 * Primal Logic - データインポート画面
 *
 * データのバックアップと復元機能
 */

import { useState, useRef } from 'react';
import { getDailyLogs, saveDailyLog, saveUserProfile } from '../utils/storage';
import { logError } from '../utils/errorHandler';
import './DataImportScreen.css';

interface DataImportScreenProps {
  onBack: () => void;
}

export default function DataImportScreen({ onBack }: DataImportScreenProps) {
  const [importing, setImporting] = useState(false);
  const [imported, setImported] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImport = async () => {
    const file = fileInputRef.current?.files?.[0];
    if (!file) {
      alert('ファイルを選択してください');
      return;
    }

    setImporting(true);
    setImported(false);
    setError(null);

    try {
      const text = await file.text();
      const importData = JSON.parse(text);

      // バージョンチェック
      if (!importData.version) {
        throw new Error('無効なデータ形式です');
      }

      // 既存データのバックアップ（確認）
      if (
        !window.confirm(
          '既存のデータを上書きしますか？\n（推奨: 先にエクスポートしてバックアップを取ってください）'
        )
      ) {
        setImporting(false);
        return;
      }

      // ユーザープロファイルをインポート
      if (importData.userProfile) {
        await saveUserProfile(importData.userProfile);
      }

      // 設定をインポート
      if (importData.settings) {
        localStorage.setItem('primal_logic_settings', JSON.stringify(importData.settings));
      }

      // 日次ログをインポート
      if (importData.dailyLogs && Array.isArray(importData.dailyLogs)) {
        for (const log of importData.dailyLogs) {
          await saveDailyLog(log);
        }
      }

      setImported(true);
      alert('データのインポートが完了しました');
      // 画面をリロードしてデータを反映
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      logError(error, { component: 'DataImportScreen', action: 'handleImport' });
      setError('データのインポートに失敗しました。ファイル形式を確認してください。');
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="data-import-screen">
      <div className="data-import-container">
        <button onClick={onBack} className="data-import-back-button">
          ← 設定に戻る
        </button>
        <h1 className="data-import-title">データインポート</h1>
        <p className="data-import-description">
          エクスポートしたJSONファイルを選択して、データを復元できます。
        </p>

        <div className="data-import-form">
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            style={{ display: 'none' }}
            onChange={() => {
              // ファイル選択時の処理はhandleImportで行う
            }}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="data-import-select-button"
          >
            ファイルを選択
          </button>
          {fileInputRef.current?.files?.[0] && (
            <p style={{ fontSize: '14px', color: '#78716c', marginTop: '0.5rem' }}>
              選択中: {fileInputRef.current.files[0].name}
            </p>
          )}

          <button
            onClick={handleImport}
            disabled={importing || !fileInputRef.current?.files?.[0]}
            className="data-import-button"
          >
            {importing ? 'インポート中...' : 'データをインポート'}
          </button>
        </div>

        {imported && <div className="data-import-success">✅ データのインポートが完了しました</div>}

        {error && <div className="data-import-error">⚠️ {error}</div>}

        <div className="data-import-info">
          <h3>注意事項</h3>
          <ul>
            <li>インポート前に既存データのエクスポートを推奨します</li>
            <li>既存のデータは上書きされます</li>
            <li>エクスポートしたJSONファイルのみインポート可能です</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
