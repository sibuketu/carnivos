# Claude Code向け: Netlify→Vercel移行ガイド

> **作成日**: 2026-02-09
> **作成者**: Windsurf/Cascade
> **対象**: Claude Code（人間操作をガイドする形式）
> **目的**: Netlify paused問題の解決策としてVercelに移行する手順をガイド

---

## 前提（Claude Codeへの指示）

- **RULES.md を2回読んでから作業開始すること**
- **AGENT_LOG.md に作業記録を残すこと**
- ガイドは7.9形式（番号付き・URL直リンク・入力値コードブロック）で出すこと
- 画面操作はユーザーが行う。AIはガイドを出す役割

---

## Vercel無料枠 vs Netlify無料枠

| 項目 | Vercel Hobby（無料） | Netlify Free（無料） |
|------|-------------------|-------------------|
| **バンドウィス** | 100GB/月 | 100GB/月（クレジット制） |
| **リクエスト数** | 100万リクエスト/月 | 制限なし（クレジット消費） |
| **ビルド時間** | 4時間/月 | 300分/月 |
| **超過時** | **停止（アップグレード必須）** | **停止（来月復旧 or アップグレード）** |
| **特徴** | 超過しても有料プランで継続可能 | クレジット制で予測しづらい |

**結論**: Vercelの方がシンプルで、超過時も有料プラン($20/月)で継続可能。

---

## ガイド1: Vercelアカウント作成

### 1-1. Vercelにサインアップ

1 Vercelトップページを開く
```
https://vercel.com
```

2 「Sign Up」をクリック

3 GitHubアカウントで連携（推奨）
- 「Continue with GitHub」をクリック
- GitHubの認証を完了

4 チーム名を入力（個人でもOK）
- Team name:
```
sibuketu
```
- 「Create Team」をクリック

---

## ガイド2: プロジェクトインポート

### 2-1. GitHubリポジトリをインポート

1 Vercelダッシュボードで「Add New...」→「Project」をクリック
```
https://vercel.com/dashboard
```

2 GitHubタブを選択
- `sibuketu/carnivos` リポジトリを探す
- 「Import」をクリック

### 2-2. プロジェクト設定

**Framework Preset**:
- Vite（自動検出されるはず）

**Build Settings**:
- Build Command:
```
npm run build
```
- Output Directory:
```
dist
```
- Install Command:
```
npm install
```

**Environment Variables**（重要）:
```
VITE_GEMINI_API_KEY=AIzaSyAqMSE8HCCVwd3VQA26ZdK-mocleyS9Lbo
VITE_SUPABASE_URL=https://msvonymnpyeofznaopre.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1zdm9ueW1ucHllb2Z6bmFvcHJlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYyMjc5MDYsImV4cCI6MjA4MTgwMzkwNn0.DRSc0fGy35FtDBWo9ZgkaSqpTm4qLFRFR2_at2VKIXA
VITE_FIREBASE_API_KEY=AIzaSyCksvRRzxieft8CSd_NvJ8i6TAjQOCjyRk
VITE_FIREBASE_AUTH_DOMAIN=sibuketu-83cc0.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=sibuketu-83cc0
VITE_FIREBASE_STORAGE_BUCKET=sibuketu-83cc0.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=322669224002
VITE_FIREBASE_APP_ID=1:322669224002:web:3ffef6d8d261c0942e4ddb
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_51RCdvv06Z0q3rla2ISziU3zDNHHdFDlAhxKIrkDMXhxuuRFJqQaipFBxrhftR8azuQghmLifZUqLRTwUhlGaPEU200de63MPYe
YOUTUBE_API_KEY=AIzaSyBcCfeahsLmZsjkq8GVI30Nb-XQy0HIaLI
```

3 「Deploy」をクリック

### 2-3. デプロイ確認

- ビルドが完了するのを待つ（2-3分）
- デプロイ成功したらURLが表示される
- アプリが正しく表示されるか確認

---

## ガイド3: カスタムドメイン設定（任意）

### 3-1. ドメインを追加

1 プロジェクト設定で「Domains」タブを開く

2 カスタムドメインを入力（現在のNetlifyサブドメインを維持する場合）
```
carnivoslol.vercel.app
```
または独自ドメインを持つ場合:
```
your-domain.com
```

3 「Add」をクリック

### 3-2. DNS設定（独自ドメインの場合）

Vercelが表示するDNSレコードをドメイン registrarに設定:
- Aレコード（またはCNAME）
- TXTレコード（認証用）

---

## ガイド4: Supabase Edge FunctionのCORS設定（重要）

### 4-1. Supabase CORS設定更新

VercelのドメインをSupabaseのCORSに追加:

1 Supabaseプロジェクト設定を開く
```
https://supabase.com/dashboard/project/msvonymnpyeofznaopre/settings/api
```

2 「Additional CORS Origins」にVercelドメインを追加:
```
https://carnivoslol.vercel.app
```

3 「Save」をクリック

---

## ガイド5: NetlifyからVercelへの移行完了後

### 5-1. 新しいURLの確認

Vercelデプロイ後のURL:
```
https://carnivoslol.vercel.app
```

### 5-2. 古いNetlifyサイトの処理

1 Netlifyダッシュボードを開く
```
https://app.netlify.com/sites/carnivoslol/overview
```

2 「Site settings」→「Danger zone」→「Delete site」で古いサイトを削除（任意）

### 5-3. ストア掲載情報の更新

**Apple App Store Connect**:
- App Storeの「App Information」→「Marketing URL」を更新
- サポートURLも更新（該当する場合）

**Google Play Console**:
- ストア掲載情報の「ウェブサイト」URLを更新
- プライバシーポリシーのURLも更新（該当する場合）

---

## ガイド6: Vercel Proプランへのアップグレード（必要な場合）

無料枠（100GB/月）を超えた場合:

1 Vercelダッシュボードで「Settings」→「Billing」を開く
```
https://vercel.com/dashboard/sibuketu/settings/billing
```

2 「Upgrade to Pro」をクリック
- 月額$20 + 超過分従量課金
- 10倍の枠（1TB/月など）

---

## トラブルシューティング

### ビルドエラーが出る場合
- `package.json`の`scripts`を確認
- Node.jsバージョン（Vercelは自動で最適化）
- 環境変数が正しく設定されているか確認

### 環境変数が反映されない場合
- Vercelプロジェクトの「Settings」→「Environment Variables」で再設定
- 「Redeploy」で再デプロイ

### Supabase接続エラー
- CORS設定が正しいか確認
- Supabase URLとAPIキーが正しいか確認

---

## 完了後の確認リスト

- [ ] Vercelでアプリが表示される
- [ ] 環境変数がすべて設定済み
- [ ] Supabase Edge Functionが動作する
- [ ] Stripe決済フローが動作する（テスト）
- [ ] ストア掲載URLを更新済み（必要な場合）
- [ ] Netlifyサイトを削除済み（任意）

---

## 参考情報

### Vercel無料枠の詳細
- Edge Requests: 100万/月
- Fast Data Transfer: 100GB/月
- Active CPU Time: 4時間/月
- 超過時: アップグレード必須（Pro $20/月）

### 移行のメリット
- シンプルな従量課金モデル
- より高いパフォーマンス（Zero cold starts on Pro）
- Next.jsとの親和性が高い

### 移行のデメリット
- 環境変数の再設定が必要
- カスタムドメインのDNS再設定が必要
- ビルド設定の微調整が必要な場合あり
