/**
 * CarnivOS - フィードバック画面
 *
 * ユーザーからのフィードバック・バグレポート・機能リクエストを受け付ける
 */

import { useState } from 'react';
import { useTranslation } from '../utils/i18n';
import { logError } from '../utils/errorHandler';
import { setFeedbackContributor } from '../utils/featureDisplaySettings';
import './FeedbackScreen.css';

type FeedbackType = 'bug' | 'feature' | 'general';

export default function FeedbackScreen() {
  const { t } = useTranslation();
  const [type, setType] = useState<FeedbackType>('general');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!message.trim()) {
      alert(t('feedback.pleaseEnterMessage'));
      return;
    }

    setSubmitting(true);

    try {
      // メール送信用の件名を先に作成
      const emailSubject = subject || '（件名なし）';
      const encodedSubject = encodeURIComponent(
        `[CarnivOS ${type === 'bug' ? 'Bug Report' : type === 'feature' ? 'Feature Request' : 'Feedback'}] ${emailSubject}`
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
      // #35: バグ報告・機能提案はフィードバックご褒美対象
      if (type === 'bug' || type === 'feature') {
        setFeedbackContributor();
      }

      const mailtoLink = `mailto:sibuketu12345@gmail.com?subject=${encodedSubject}&body=${body}`;
      window.location.href = mailtoLink;

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
      alert(t('feedback.sendFailed'));
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
          {t('feedback.backToSettings')}
        </button>
        <h1 className="feedback-title">{t('feedback.title')}</h1>
        <p className="feedback-description">{t('feedback.description')}</p>

        <form onSubmit={handleSubmit} className="feedback-form">
          <div className="feedback-form-group">
            <label htmlFor="feedback-type" className="feedback-label">
              {t('feedback.type')}
            </label>
            <select
              id="feedback-type"
              value={type}
              onChange={(e) => setType(e.target.value as FeedbackType)}
              className="feedback-select"
            >
              <option value="general">{t('feedback.typeGeneral')}</option>
              <option value="bug">{t('feedback.typeBug')}</option>
              <option value="feature">{t('feedback.typeFeature')}</option>
            </select>
          </div>

          <div className="feedback-form-group">
            <label htmlFor="feedback-subject" className="feedback-label">
              {t('feedback.subject')}
            </label>
            <input
              id="feedback-subject"
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="feedback-input"
              placeholder={t('feedback.subjectPlaceholder')}
            />
          </div>

          <div className="feedback-form-group">
            <label htmlFor="feedback-message" className="feedback-label">
              {t('feedback.message')} <span className="feedback-required">*</span>
            </label>
            <textarea
              id="feedback-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              className="feedback-textarea"
              rows={8}
              placeholder={t('feedback.messagePlaceholder')}
            />
          </div>

          <div className="feedback-form-group">
            <label htmlFor="feedback-email" className="feedback-label">
              {t('feedback.email')}
            </label>
            <input
              id="feedback-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="feedback-input"
              placeholder={t('feedback.emailPlaceholder')}
            />
          </div>

          <button
            type="submit"
            disabled={submitting || !message.trim()}
            className="feedback-button"
          >
            {submitting ? t('feedback.sending') : t('feedback.send')}
          </button>
        </form>

        {submitted && (
          <div className="feedback-success">
            {t('feedback.success')}
            {(type === 'bug' || type === 'feature') && (
              <div className="feedback-reward" style={{ marginTop: '0.5rem', fontSize: '0.9em', opacity: 0.9 }}>
                {t('feedback.reward')}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
