/**
 * CarnivOS - 利用規約画面
 */

import { useTranslation } from '../utils/i18n';
import './TermsOfServiceScreen.css';

export default function TermsOfServiceScreen() {
  const { t, language } = useTranslation();
  return (
    <div className="terms-of-service-screen">
      <div className="terms-of-service-container">
        <button
          onClick={() => {
            window.dispatchEvent(new CustomEvent('navigateToScreen', { detail: 'settings' }));
          }}
          className="terms-of-service-back-button"
        >
          {t('terms.backToSettings')}
        </button>
        <h1 className="terms-of-service-title">{t('terms.title')}</h1>
        <div className="terms-of-service-content">
          {language === 'ja' ? (
            <>
              <p className="terms-of-service-updated">最終更新日: 2025年1月1日</p>
              <section className="terms-of-service-section">
                <h2>1. はじめに</h2>
                <p>本利用規約（以下「本規約」）は、CarnivOS（以下「当アプリ」）の利用条件を定めるものです。当アプリを利用することにより、本規約に同意したものとみなされます。</p>
              </section>
              <section className="terms-of-service-section">
                <h2>2. サービスの内容</h2>
                <p>当アプリは、カーニボアダイエット管理アプリとして、以下の機能を提供します：</p>
                <ul><li>栄養素追跡（100項目以上の栄養素）</li><li>動的目標値計算（ユーザープロファイルに基づく）</li><li>食事記録と履歴管理</li><li>AIチャット（カーニボアダイエットに関する質問対応）</li><li>統計・グラフ表示</li><li>日記機能</li></ul>
              </section>
              <section className="terms-of-service-section">
                <h2>3. 利用資格</h2>
                <p>当アプリは、以下の条件を満たす方にご利用いただけます：</p>
                <ul><li>18歳以上であること（保護者の同意がある場合は除く）</li><li>本規約に同意すること</li><li>正確な情報を提供すること</li></ul>
              </section>
              <section className="terms-of-service-section">
                <h2>4. アカウント</h2>
                <h3>4.1 アカウントの作成</h3>
                <p>当アプリを使用するには、アカウントを作成する必要があります。アカウント作成時には、正確な情報を提供してください。</p>
                <h3>4.2 アカウントの管理</h3>
                <p>アカウントの管理は、ユーザーの責任です。パスワードの管理、不正アクセスの防止に努めてください。</p>
                <h3>4.3 アカウントの削除</h3>
                <p>ユーザーは、いつでもアカウントを削除できます。アカウント削除時には、関連するデータも削除されます。</p>
              </section>
              <section className="terms-of-service-section">
                <h2>5. 禁止事項</h2>
                <p>以下の行為は禁止されています：</p>
                <ul><li>当アプリの機能を不正に使用すること</li><li>他のユーザーのアカウントに不正にアクセスすること</li><li>当アプリのシステムやデータを破壊、改ざんすること</li><li>当アプリの知的財産権を侵害すること</li><li>法令に違反する行為</li></ul>
              </section>
              <section className="terms-of-service-section">
                <h2>6. 免責事項</h2>
                <h3>6.1 医療アドバイス</h3>
                <p>当アプリは、医療アドバイスを提供するものではありません。健康に関する重要な決定は、必ず医療専門家に相談してください。</p>
                <h3>6.2 情報の正確性</h3>
                <p>当アプリは、情報の正確性について保証しません。栄養素データや計算結果は参考情報としてご利用ください。</p>
                <h3>6.3 サービスの中断</h3>
                <p>当アプリは、予告なくサービスを中断、終了する場合があります。これにより生じた損害について、当アプリは責任を負いません。</p>
              </section>
              <section className="terms-of-service-section">
                <h2>7. 知的財産権</h2>
                <p>当アプリのコンテンツ、デザイン、ロゴ、商標などは、当アプリの知的財産です。無断で複製、転載、改変することは禁止されています。</p>
              </section>
              <section className="terms-of-service-section">
                <h2>8. 規約の変更</h2>
                <p>本規約は、予告なく変更される場合があります。重要な変更がある場合は、アプリ内で通知します。</p>
              </section>
              <section className="terms-of-service-section">
                <h2>9. 準拠法</h2>
                <p>本規約は、日本法に準拠し、解釈されます。</p>
              </section>
              <section className="terms-of-service-section">
                <h2>10. お問い合わせ</h2>
                <p>本規約に関するご質問は、設定画面からお問い合わせください。</p>
              </section>
            </>
          ) : (
            <>
              <p className="terms-of-service-updated">Last updated: January 1, 2025</p>
              <section className="terms-of-service-section">
                <h2>1. Introduction</h2>
                <p>These Terms of Service ("Terms") govern the use of CarnivOS ("the App"). By using the App, you agree to these Terms.</p>
              </section>
              <section className="terms-of-service-section">
                <h2>2. Service Description</h2>
                <p>The App is a carnivore diet management app that provides the following features:</p>
                <ul><li>Nutrient tracking (100+ nutrients)</li><li>Dynamic target calculations (based on user profile)</li><li>Meal recording and history management</li><li>AI chat (carnivore diet Q&A)</li><li>Statistics and graphs</li><li>Journal feature</li></ul>
              </section>
              <section className="terms-of-service-section">
                <h2>3. Eligibility</h2>
                <p>The App is available to users who meet the following conditions:</p>
                <ul><li>18 years or older (unless with parental consent)</li><li>Agreement to these Terms</li><li>Provision of accurate information</li></ul>
              </section>
              <section className="terms-of-service-section">
                <h2>4. Account</h2>
                <h3>4.1 Account Creation</h3>
                <p>You must create an account to use the App. Please provide accurate information when creating your account.</p>
                <h3>4.2 Account Management</h3>
                <p>You are responsible for managing your account. Please maintain your password security and prevent unauthorized access.</p>
                <h3>4.3 Account Deletion</h3>
                <p>You may delete your account at any time. All associated data will be deleted when your account is deleted.</p>
              </section>
              <section className="terms-of-service-section">
                <h2>5. Prohibited Activities</h2>
                <p>The following activities are prohibited:</p>
                <ul><li>Misusing the App's features</li><li>Unauthorized access to other users' accounts</li><li>Destroying or tampering with the App's systems or data</li><li>Infringing on the App's intellectual property rights</li><li>Violating applicable laws</li></ul>
              </section>
              <section className="terms-of-service-section">
                <h2>6. Disclaimers</h2>
                <h3>6.1 Medical Advice</h3>
                <p>The App does not provide medical advice. Please consult a healthcare professional for important health decisions.</p>
                <h3>6.2 Accuracy of Information</h3>
                <p>The App does not guarantee the accuracy of information. Nutrient data and calculations are for reference only.</p>
                <h3>6.3 Service Interruption</h3>
                <p>The App may be interrupted or terminated without notice. We are not liable for any damages resulting from such interruptions.</p>
              </section>
              <section className="terms-of-service-section">
                <h2>7. Intellectual Property</h2>
                <p>The App's content, design, logos, and trademarks are the intellectual property of the App. Unauthorized reproduction, redistribution, or modification is prohibited.</p>
              </section>
              <section className="terms-of-service-section">
                <h2>8. Changes to Terms</h2>
                <p>These Terms may be changed without prior notice. We will notify you within the App of any significant changes.</p>
              </section>
              <section className="terms-of-service-section">
                <h2>9. Governing Law</h2>
                <p>These Terms are governed by and construed in accordance with the laws of Japan.</p>
              </section>
              <section className="terms-of-service-section">
                <h2>10. Contact Us</h2>
                <p>For questions about these Terms, please contact us through the Settings screen.</p>
              </section>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
