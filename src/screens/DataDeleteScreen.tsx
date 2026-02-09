/**
 * CarnivOS - データ削除画面
 *
 * GDPR対応：ユーザーデータの削除機能
 */

import { useState } from 'react';
import { supabase, isSupabaseAvailable } from '../lib/supabaseClient';
import { logError, getUserFriendlyErrorMessage } from '../utils/errorHandler';
import { useTranslation } from '../utils/i18n';
import './DataDeleteScreen.css';

export default function DataDeleteScreen() {
  const { t } = useTranslation();
  const [confirmText, setConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [deleted, setDeleted] = useState(false);

  const handleDelete = async () => {
    if (confirmText !== t('dataDelete.confirmWord')) {
      (window as unknown as { showToast?: (msg: string) => void }).showToast?.(t('dataDelete.confirmLabel'));
      return;
    }

    if (!confirm('本当に全てのデータを削除しますか？この操作は取り消せません。')) {
      return;
    }

    setDeleting(true);

    try {
      // ローカルストレージのデータを削除
      const keys = Object.keys(localStorage);
      keys.forEach((key) => {
        if (key.startsWith('primal_logic_')) {
          localStorage.removeItem(key);
        }
      });

      // Supabaseのデータを削除（認証済みユーザーの場合）
      if (isSupabaseAvailable() && supabase) {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session) {
          const userId = session.user.id;
          await supabase.from('daily_logs').delete().eq('user_id', userId);
          await supabase.from('profiles').delete().eq('user_id', userId);
          try {
            await supabase.from('streaks').delete().eq('user_id', userId);
          } catch {
            // streaks テーブルが存在しない場合などは無視
          }
          await supabase.auth.signOut();
        }
      }

      setDeleted(true);

      // 3秒後にページをリロード
      setTimeout(() => {
        window.location.reload();
      }, 3000);
    } catch (error) {
      logError(error, { component: 'DataDeleteScreen', action: 'handleDelete' });
      (window as unknown as { showToast?: (msg: string) => void }).showToast?.(getUserFriendlyErrorMessage(error) || 'データの削除に失敗しました');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="data-delete-screen">
      <div className="data-delete-container">
        <button
          onClick={() => {
            window.dispatchEvent(new CustomEvent('navigateToScreen', { detail: 'settings' }));
          }}
          className="data-delete-back-button"
        >
          {t('dataDelete.backToSettings')}
        </button>
        <h1 className="data-delete-title">{t('dataDelete.title')}</h1>
        <div className="data-delete-warning">
          <h2>{t('dataDelete.warningTitle')}</h2>
          <p>{t('dataDelete.warningDesc')}</p>
          <ul>
            <li>{t('dataDelete.allMealRecords')}</li>
            <li>{t('dataDelete.profileInfo')}</li>
            <li>{t('dataDelete.diary')}</li>
            <li>{t('dataDelete.weightRecords')}</li>
            <li>{t('dataDelete.appSettings')}</li>
            <li>{t('dataDelete.accountInfo')}</li>
          </ul>
          <p className="data-delete-warning-strong">{t('dataDelete.irreversible')}</p>
        </div>

        <div className="data-delete-confirm">
          <label htmlFor="confirm-input" className="data-delete-label">
            {t('dataDelete.confirmLabel')}
          </label>
          <input
            id="confirm-input"
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            className="data-delete-input"
            placeholder={t('dataDelete.confirmWord')}
          />
        </div>

        <button
          onClick={handleDelete}
          disabled={deleting || confirmText !== t('dataDelete.confirmWord')}
          className="data-delete-button"
        >
          {deleting ? t('dataDelete.deleting') : t('dataDelete.deleteAll')}
        </button>

        {deleted && (
          <div className="data-delete-success">
            {t('dataDelete.success')}
          </div>
        )}
      </div>
    </div>
  );
}
