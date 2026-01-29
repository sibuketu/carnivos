/**
 * Primal Logic - プライバシーポリシー画面
 */

import './PrivacyPolicyScreen.css';

export default function PrivacyPolicyScreen() {
  return (
    <div className="privacy-policy-screen">
      <div className="privacy-policy-container">
        <button
          onClick={() => {
            window.dispatchEvent(new CustomEvent('navigateToScreen', { detail: 'settings' }));
          }}
          className="privacy-policy-back-button"
        >
          ← 設定に戻る
        </button>
        <h1 className="privacy-policy-title">プライバシーポリシー</h1>
        <div className="privacy-policy-content">
          <p className="privacy-policy-updated">最終更新日: 2025年1月1日</p>

          <section className="privacy-policy-section">
            <h2>1. はじめに</h2>
            <p>
              Primal
              Logic（以下「当アプリ」）は、ユーザーのプライバシーを尊重し、個人情報の保護に努めています。
              本プライバシーポリシーは、当アプリが収集、使用、保護する情報について説明します。
            </p>
          </section>

          <section className="privacy-policy-section">
            <h2>2. 収集する情報</h2>
            <h3>2.1 アカウント情報</h3>
            <p>当アプリを使用するために、以下の情報を収集する場合があります：</p>
            <ul>
              <li>メールアドレス</li>
              <li>パスワード（暗号化して保存）</li>
            </ul>

            <h3>2.2 健康・栄養情報</h3>
            <p>当アプリの機能を提供するために、以下の情報を収集します：</p>
            <ul>
              <li>食事記録（食品名、量、栄養素情報）</li>
              <li>体重、体脂肪率</li>
              <li>日記（体調、症状など）</li>
              <li>プロファイル情報（性別、年齢、体重、活動レベルなど）</li>
              <li>血液検査値（任意入力）</li>
            </ul>

            <h3>2.3 技術情報</h3>
            <p>当アプリの改善のために、以下の技術情報を収集する場合があります：</p>
            <ul>
              <li>デバイス情報（OS、ブラウザ種類など）</li>
              <li>使用状況（機能の使用頻度など）</li>
              <li>エラーログ</li>
            </ul>
          </section>

          <section className="privacy-policy-section">
            <h2>3. 情報の使用目的</h2>
            <p>収集した情報は、以下の目的で使用します：</p>
            <ul>
              <li>アプリの機能提供（栄養素追跡、目標値計算など）</li>
              <li>アカウント管理と認証</li>
              <li>アプリの改善と新機能の開発</li>
              <li>エラーの修正とパフォーマンスの向上</li>
              <li>ユーザーサポート</li>
            </ul>
          </section>

          <section className="privacy-policy-section">
            <h2>4. 情報の保存と保護</h2>
            <h3>4.1 データの保存</h3>
            <p>データは以下の方法で保存されます：</p>
            <ul>
              <li>ローカルストレージ（ブラウザのローカルストレージ）</li>
              <li>Supabase（クラウドデータベース、認証済みユーザーのみ）</li>
            </ul>

            <h3>4.2 データの保護</h3>
            <p>当アプリは、以下の方法でデータを保護します：</p>
            <ul>
              <li>データの暗号化（転送時および保存時）</li>
              <li>認証とアクセス制御</li>
              <li>定期的なセキュリティ監査</li>
            </ul>
          </section>

          <section className="privacy-policy-section">
            <h2>5. 情報の共有</h2>
            <p>当アプリは、以下の場合を除き、ユーザーの個人情報を第三者と共有しません：</p>
            <ul>
              <li>ユーザーの明示的な同意がある場合</li>
              <li>法的義務に基づく場合</li>
              <li>アプリのサービス提供に必要な場合（例：Supabase、AIサービス）</li>
            </ul>
          </section>

          <section className="privacy-policy-section">
            <h2>6. ユーザーの権利</h2>
            <p>ユーザーは、以下の権利を有します：</p>
            <ul>
              <li>個人情報へのアクセス</li>
              <li>個人情報の修正</li>
              <li>個人情報の削除</li>
              <li>データのエクスポート</li>
              <li>アカウントの削除</li>
            </ul>
            <p>
              これらの権利を行使するには、設定画面からアカウントを削除するか、お問い合わせください。
            </p>
          </section>

          <section className="privacy-policy-section">
            <h2>7. クッキーとトラッキング</h2>
            <p>
              当アプリは、セッション管理とアプリの機能提供のために、必要最小限のクッキーを使用します。
              第三者によるトラッキングや広告配信は行いません。
            </p>
          </section>

          <section className="privacy-policy-section">
            <h2>8. お問い合わせ</h2>
            <p>プライバシーポリシーに関するご質問やご意見は、設定画面からお問い合わせください。</p>
          </section>

          <section className="privacy-policy-section">
            <h2>9. 変更通知</h2>
            <p>
              本プライバシーポリシーは、予告なく変更される場合があります。
              重要な変更がある場合は、アプリ内で通知します。
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
