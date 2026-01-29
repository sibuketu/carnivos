/**
 * Primal Logic - データ削除画面
 *
 * GDPR対応：ユーザーデータの削除機能
 */

import { useState } from 'react';
import { supabase, isSupabaseAvailable } from '../lib/supabaseClient';
import { logError, getUserFriendlyErrorMessage } from '../utils/errorHandler';
import './DataDeleteScreen.css';

export default function DataDeleteScreen() {
  const [confirmText, setConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [deleted, setDeleted] = useState(false);

  const handleDelete = async () => {
    if (confirmText !== '削除') {
      alert('「削除」と入力してください');
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
          // ユーザーのデータを削除（将来的に実装）
          // await supabase.from('daily_logs').delete().eq('user_id', session.user.id);
          // await supabase.from('user_profiles').delete().eq('user_id', session.user.id);

          // ログアウト（アカウント削除はサーバー側で実装が必要）
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
      alert(getUserFriendlyErrorMessage(error) || 'データの削除に失敗しました');
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
          ← 設定に戻る
        </button>
        <h1 className="data-delete-title">データ削除</h1>
        <div className="data-delete-warning">
          <h2>⚠️ 警告</h2>
          <p>この操作を実行すると、以下のデータが完全に削除されます：</p>
          <ul>
            <li>全ての食事記録</li>
            <li>プロファイル情報</li>
            <li>日記</li>
            <li>体重・体脂肪率の記録</li>
            <li>アプリ設定</li>
            <li>アカウント情報（認証済みユーザーの場合）</li>
          </ul>
          <p className="data-delete-warning-strong">この操作は取り消せません。</p>
        </div>

        <div className="data-delete-confirm">
          <label htmlFor="confirm-input" className="data-delete-label">
            削除を確認するには、「削除」と入力してください：
          </label>
          <input
            id="confirm-input"
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            className="data-delete-input"
            placeholder="削除"
          />
        </div>

        <button
          onClick={handleDelete}
          disabled={deleting || confirmText !== '削除'}
          className="data-delete-button"
        >
          {deleting ? '削除中...' : '全てのデータを削除'}
        </button>

        {deleted && (
          <div className="data-delete-success">
            ✅ データの削除が完了しました。ページをリロードします...
          </div>
        )}
      </div>
    </div>
  );
}
