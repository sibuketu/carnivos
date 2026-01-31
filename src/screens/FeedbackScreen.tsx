/**
 * Primal Logic - フィードバック画面
 *
 * ユーザーからのフィードバック・バグレポート・機能リクエストを受け付ける
 */

import { useState } from 'react';
import { logError } from '../utils/errorHandler';
import './FeedbackScreen.css';

type FeedbackType = 'bug' | 'feature' | 'general';

export default function FeedbackScreen() {
  const [type, setType] = useState<FeedbackType>('general');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!message.trim()) {
      alert('メッセージを入力してください');
      return;
    }

    setSubmitting(true);

    try {
      // メール送信用の件名を先に作成
      const emailSubject = subject || '（件名なし）';
      const encodedSubject = encodeURIComponent(
        `[Primal Logic ${type === 'bug' ? 'Bug Report' : type === 'feature' ? 'Feature Request' : 'Feedback'}] ${emailSubject}`
      );

      // フィードバックデータを構築
      const feedbackData = {
        type,
        subject: emailSubject,
        message,
        email: email || '（メールアドレスなし）',
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
      };

      // ローカルストレージに保存
      const existingFeedback = localStorage.getItem('primal_logic_feedback');
      const feedbacks = existingFeedback ? JSON.parse(existingFeedback) : [];
      feedbacks.push(feedbackData);
      localStorage.setItem('primal_logic_feedback', JSON.stringify(feedbacks.slice(-50))); // 最新50件のみ保存

      // メール送信（mailto:リンクを使用）
      const body = encodeURIComponent(
        `Type: ${type === 'bug' ? 'Bug Report' : type === 'feature' ? 'Feature Request' : 'General Feedback'}\n` +
          `Subject: ${emailSubject || '(No Subject)'}\n\n` +
          `Message:\n${message}\n\n` +
          `Email: ${email || '(Not provided)'}\n` +
          `Timestamp: ${feedbackData.timestamp}\n` +
          `User Agent: ${feedbackData.userAgent}\n` +
          `URL: ${feedbackData.url}`
      );
      const mailtoLink = `mailto:sibuketu12345@gmail.com?subject=${encodedSubject}&body=${body}`;
      window.location.href = mailtoLink;

      // 開発環境ではコンソールに出力
      if (import.meta.env.DEV) {
      }

      setSubmitted(true);
      setSubject('');
      setMessage('');
      setEmail('');

      // 3秒後にリセット
      setTimeout(() => {
        setSubmitted(false);
      }, 3000);
    } catch (error) {
      logError(error, { component: 'FeedbackScreen', action: 'handleSubmit', type });
      alert('フィードバックの送信に失敗しました');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="feedback-screen">
      <div className="feedback-container">
        <button
          onClick={() => {
            window.dispatchEvent(new CustomEvent('navigateToScreen', { detail: 'settings' }));
          }}
          className="feedback-back-button"
        >
          ← 設定に戻る
        </button>
        <h1 className="feedback-title">フィードバック</h1>
        <p className="feedback-description">バグ報告、機能リクエスト、ご意見をお聞かせください。</p>

        <form onSubmit={handleSubmit} className="feedback-form">
          <div className="feedback-form-group">
            <label htmlFor="feedback-type" className="feedback-label">
              種類
            </label>
            <select
              id="feedback-type"
              value={type}
              onChange={(e) => setType(e.target.value as FeedbackType)}
              className="feedback-select"
            >
              <option value="general">一般的なフィードバック</option>
              <option value="bug">バグ報告</option>
              <option value="feature">機能リクエスト</option>
            </select>
          </div>

          <div className="feedback-form-group">
            <label htmlFor="feedback-subject" className="feedback-label">
              件名（任意）
            </label>
            <input
              id="feedback-subject"
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="feedback-input"
              placeholder="例：栄養素の計算が正しくない"
            />
          </div>

          <div className="feedback-form-group">
            <label htmlFor="feedback-message" className="feedback-label">
              メッセージ <span className="feedback-required">*</span>
            </label>
            <textarea
              id="feedback-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              className="feedback-textarea"
              rows={8}
              placeholder="詳細を入力してください..."
            />
          </div>

          <div className="feedback-form-group">
            <label htmlFor="feedback-email" className="feedback-label">
              メールアドレス（任意・返信が必要な場合）
            </label>
            <input
              id="feedback-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="feedback-input"
              placeholder="example@email.com"
            />
          </div>

          <button
            type="submit"
            disabled={submitting || !message.trim()}
            className="feedback-button"
          >
            {submitting ? '送信中...' : '送信'}
          </button>
        </form>

        {submitted && (
          <div className="feedback-success">
            ✅ フィードバックを送信しました。ありがとうございます！
          </div>
        )}
      </div>
    </div>
  );
}
