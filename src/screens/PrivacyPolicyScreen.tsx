/**
 * CarnivOS - プライバシーポリシー画面
 */

import { useTranslation } from '../utils/i18n';
import './PrivacyPolicyScreen.css';

export default function PrivacyPolicyScreen() {
  const { t, language } = useTranslation();
  return (
    <div className="privacy-policy-screen">
      <div className="privacy-policy-container">
        <button
          onClick={() => {
            window.dispatchEvent(new CustomEvent('navigateToScreen', { detail: 'settings' }));
          }}
          className="privacy-policy-back-button"
        >
          {t('privacy.backToSettings')}
        </button>
        <h1 className="privacy-policy-title">{t('privacy.title')}</h1>
        <div className="privacy-policy-content">
          {language === 'ja' ? (
            <>
              <p className="privacy-policy-updated">最終更新日: 2025年1月1日</p>
              <section className="privacy-policy-section">
                <h2>1. はじめに</h2>
                <p>Primal Logic（以下「当アプリ」）は、ユーザーのプライバシーを尊重し、個人情報の保護に努めています。本プライバシーポリシーは、当アプリが収集、使用、保護する情報について説明します。</p>
              </section>
              <section className="privacy-policy-section">
                <h2>2. 収集する情報</h2>
                <h3>2.1 アカウント情報</h3>
                <p>当アプリを使用するために、以下の情報を収集する場合があります：</p>
                <ul><li>メールアドレス</li><li>パスワード（暗号化して保存）</li></ul>
                <h3>2.2 健康・栄養情報</h3>
                <p>当アプリの機能を提供するために、以下の情報を収集します：</p>
                <ul><li>食事記録（食品名、量、栄養素情報）</li><li>体重、体脂肪率</li><li>日記（体調、症状など）</li><li>プロファイル情報（性別、年齢、体重、活動レベルなど）</li><li>血液検査値（任意入力）</li></ul>
                <h3>2.3 技術情報</h3>
                <p>当アプリの改善のために、以下の技術情報を収集する場合があります：</p>
                <ul><li>デバイス情報（OS、ブラウザ種類など）</li><li>使用状況（機能の使用頻度など）</li><li>エラーログ</li></ul>
              </section>
              <section className="privacy-policy-section">
                <h2>3. 情報の使用目的</h2>
                <p>収集した情報は、以下の目的で使用します：</p>
                <ul><li>アプリの機能提供（栄養素追跡、目標値計算など）</li><li>アカウント管理と認証</li><li>アプリの改善と新機能の開発</li><li>エラーの修正とパフォーマンスの向上</li><li>ユーザーサポート</li></ul>
              </section>
              <section className="privacy-policy-section">
                <h2>4. 情報の保存と保護</h2>
                <h3>4.1 データの保存</h3>
                <p>データは以下の方法で保存されます：</p>
                <ul><li>ローカルストレージ（ブラウザのローカルストレージ）</li><li>Supabase（クラウドデータベース、認証済みユーザーのみ）</li></ul>
                <h3>4.2 データの保護</h3>
                <p>当アプリは、以下の方法でデータを保護します：</p>
                <ul><li>データの暗号化（転送時および保存時）</li><li>認証とアクセス制御</li><li>定期的なセキュリティ監査</li></ul>
              </section>
              <section className="privacy-policy-section">
                <h2>5. 情報の共有</h2>
                <p>当アプリは、以下の場合を除き、ユーザーの個人情報を第三者と共有しません：</p>
                <ul><li>ユーザーの明示的な同意がある場合</li><li>法的義務に基づく場合</li><li>アプリのサービス提供に必要な場合（例：Supabase、AIサービス）</li></ul>
              </section>
              <section className="privacy-policy-section">
                <h2>6. ユーザーの権利</h2>
                <p>ユーザーは、以下の権利を有します：</p>
                <ul><li>個人情報へのアクセス</li><li>個人情報の修正</li><li>個人情報の削除</li><li>データのエクスポート</li><li>アカウントの削除</li></ul>
                <p>これらの権利を行使するには、設定画面からアカウントを削除するか、お問い合わせください。</p>
              </section>
              <section className="privacy-policy-section">
                <h2>7. クッキーとトラッキング</h2>
                <p>当アプリは、セッション管理とアプリの機能提供のために、必要最小限のクッキーを使用します。第三者によるトラッキングや広告配信は行いません。</p>
              </section>
              <section className="privacy-policy-section">
                <h2>8. お問い合わせ</h2>
                <p>プライバシーポリシーに関するご質問やご意見は、設定画面からお問い合わせください。</p>
              </section>
              <section className="privacy-policy-section">
                <h2>9. 変更通知</h2>
                <p>本プライバシーポリシーは、予告なく変更される場合があります。重要な変更がある場合は、アプリ内で通知します。</p>
              </section>
            </>
          ) : (
            <>
              <p className="privacy-policy-updated">Last updated: January 1, 2025</p>
              <section className="privacy-policy-section">
                <h2>1. Introduction</h2>
                <p>Primal Logic ("the App") respects your privacy and is committed to protecting your personal information. This Privacy Policy explains what information we collect, use, and protect.</p>
              </section>
              <section className="privacy-policy-section">
                <h2>2. Information We Collect</h2>
                <h3>2.1 Account Information</h3>
                <p>We may collect the following information to provide our services:</p>
                <ul><li>Email address</li><li>Password (stored encrypted)</li></ul>
                <h3>2.2 Health & Nutrition Information</h3>
                <p>We collect the following information to provide app functionality:</p>
                <ul><li>Meal records (food names, amounts, nutrient information)</li><li>Body weight, body fat percentage</li><li>Journal entries (health conditions, symptoms, etc.)</li><li>Profile information (gender, age, weight, activity level, etc.)</li><li>Blood test values (optional)</li></ul>
                <h3>2.3 Technical Information</h3>
                <p>We may collect the following technical information to improve the app:</p>
                <ul><li>Device information (OS, browser type, etc.)</li><li>Usage data (feature usage frequency, etc.)</li><li>Error logs</li></ul>
              </section>
              <section className="privacy-policy-section">
                <h2>3. Purpose of Information Use</h2>
                <p>Collected information is used for the following purposes:</p>
                <ul><li>Providing app functionality (nutrient tracking, target calculations, etc.)</li><li>Account management and authentication</li><li>App improvement and new feature development</li><li>Bug fixes and performance improvements</li><li>User support</li></ul>
              </section>
              <section className="privacy-policy-section">
                <h2>4. Data Storage and Protection</h2>
                <h3>4.1 Data Storage</h3>
                <p>Data is stored using the following methods:</p>
                <ul><li>Local storage (browser local storage)</li><li>Supabase (cloud database, authenticated users only)</li></ul>
                <h3>4.2 Data Protection</h3>
                <p>We protect your data through:</p>
                <ul><li>Data encryption (in transit and at rest)</li><li>Authentication and access control</li><li>Regular security audits</li></ul>
              </section>
              <section className="privacy-policy-section">
                <h2>5. Information Sharing</h2>
                <p>We do not share your personal information with third parties except in the following cases:</p>
                <ul><li>With your explicit consent</li><li>When required by law</li><li>When necessary for service provision (e.g., Supabase, AI services)</li></ul>
              </section>
              <section className="privacy-policy-section">
                <h2>6. Your Rights</h2>
                <p>You have the following rights:</p>
                <ul><li>Access to your personal information</li><li>Correction of your personal information</li><li>Deletion of your personal information</li><li>Data export</li><li>Account deletion</li></ul>
                <p>To exercise these rights, delete your account from the Settings screen or contact us.</p>
              </section>
              <section className="privacy-policy-section">
                <h2>7. Cookies and Tracking</h2>
                <p>The App uses minimal cookies necessary for session management and app functionality. We do not use third-party tracking or advertising.</p>
              </section>
              <section className="privacy-policy-section">
                <h2>8. Contact Us</h2>
                <p>For questions or comments about this Privacy Policy, please contact us through the Settings screen.</p>
              </section>
              <section className="privacy-policy-section">
                <h2>9. Changes</h2>
                <p>This Privacy Policy may be changed without prior notice. We will notify you within the app of any significant changes.</p>
              </section>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
