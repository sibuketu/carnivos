/**
 * CarnivOS - 利用規約画面
 */

import './TermsOfServiceScreen.css';

export default function TermsOfServiceScreen() {
  return (
    <div className="terms-of-service-screen">
      <div className="terms-of-service-container">
        <button
          onClick={() => {
            window.dispatchEvent(new CustomEvent('navigateToScreen', { detail: 'settings' }));
          }}
          className="terms-of-service-back-button"
        >
          ← 設定に戻る
        </button>
        <h1 className="terms-of-service-title">利用規約</h1>
        <div className="terms-of-service-content">
          <p className="terms-of-service-updated">最終更新日: 2025年1月1日</p>

          <section className="terms-of-service-section">
            <h2>1. はじめに</h2>
            <p>
              本利用規約（以下「本規約」）は、CarnivOS
              （以下「当アプリ」）の利用条件を定めるものです。
              当アプリを利用することにより、本規約に同意したものとみなされます。
            </p>
          </section>

          <section className="terms-of-service-section">
            <h2>2. サービスの内容</h2>
            <p>当アプリは、カーニボアダイエット管理アプリとして、以下の機能を提供します：</p>
            <ul>
              <li>栄養素追跡（100項目以上の栄養素）</li>
              <li>動的目標値計算（ユーザープロファイルに基づく）</li>
              <li>食事記録と履歴管理</li>
              <li>AIチャット（カーニボアダイエットに関する質問対応）</li>
              <li>統計・グラフ表示</li>
              <li>日記機能</li>
            </ul>
          </section>

          <section className="terms-of-service-section">
            <h2>3. 利用資格</h2>
            <p>当アプリは、以下の条件を満たす方にご利用いただけます：</p>
            <ul>
              <li>18歳以上であること（保護者の同意がある場合は除く）</li>
              <li>本規約に同意すること</li>
              <li>正確な情報を提供すること</li>
            </ul>
          </section>

          <section className="terms-of-service-section">
            <h2>4. アカウント</h2>
            <h3>4.1 アカウントの作成</h3>
            <p>
              当アプリを使用するには、アカウントを作成する必要があります。
              アカウント作成時には、正確な情報を提供してください。
            </p>

            <h3>4.2 アカウントの管理</h3>
            <p>
              アカウントの管理は、ユーザーの責任です。
              パスワードの管理、不正アクセスの防止に努めてください。
            </p>

            <h3>4.3 アカウントの削除</h3>
            <p>
              ユーザーは、いつでもアカウントを削除できます。
              アカウント削除時には、関連するデータも削除されます。
            </p>
          </section>

          <section className="terms-of-service-section">
            <h2>5. 禁止事項</h2>
            <p>以下の行為は禁止されています：</p>
            <ul>
              <li>当アプリの機能を不正に使用すること</li>
              <li>他のユーザーのアカウントに不正にアクセスすること</li>
              <li>当アプリのシステムやデータを破壊、改ざんすること</li>
              <li>当アプリの知的財産権を侵害すること</li>
              <li>法令に違反する行為</li>
            </ul>
          </section>

          <section className="terms-of-service-section">
            <h2>6. 免責事項</h2>
            <h3>6.1 医療アドバイス</h3>
            <p>
              当アプリは、医療アドバイスを提供するものではありません。
              健康に関する重要な決定は、必ず医療専門家に相談してください。
            </p>

            <h3>6.2 情報の正確性</h3>
            <p>
              当アプリは、情報の正確性について保証しません。
              栄養素データや計算結果は参考情報としてご利用ください。
            </p>

            <h3>6.3 サービスの中断</h3>
            <p>
              当アプリは、予告なくサービスを中断、終了する場合があります。
              これにより生じた損害について、当アプリは責任を負いません。
            </p>
          </section>

          <section className="terms-of-service-section">
            <h2>7. 知的財産権</h2>
            <p>
              当アプリのコンテンツ、デザイン、ロゴ、商標などは、当アプリの知的財産です。
              無断で複製、転載、改変することは禁止されています。
            </p>
          </section>

          <section className="terms-of-service-section">
            <h2>8. 規約の変更</h2>
            <p>
              本規約は、予告なく変更される場合があります。
              重要な変更がある場合は、アプリ内で通知します。
            </p>
          </section>

          <section className="terms-of-service-section">
            <h2>9. 準拠法</h2>
            <p>本規約は、日本法に準拠し、解釈されます。</p>
          </section>

          <section className="terms-of-service-section">
            <h2>10. お問い合わせ</h2>
            <p>本規約に関するご質問は、設定画面からお問い合わせください。</p>
          </section>
        </div>
      </div>
    </div>
  );
}
