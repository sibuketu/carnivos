# Codemagic iOSビルド設定手順

> App Store提出用のiOSアプリをビルドするためのCodemagic設定ガイド

---

## 前提条件

- GitHubリポジトリ: `https://github.com/sibuketu/carnivos.git`
- ブランチ: `chore/pr-autonomy-setup`（またはメインブランチ）
- App Store Connectアカウント: 登録済み
- Bundle ID: `com.CarnivOS.app`

---

## Phase 1: Codemagicアカウント作成

1. **Codemagicにアクセス**
   - URL: https://codemagic.io
   - 「Sign up」または「Get started」をクリック

2. **GitHubアカウントでログイン**
   - 「Sign in with GitHub」をクリック
   - GitHubアカウントで認証
   - Codemagicへのアクセス許可を承認

---

## Phase 2: リポジトリ接続

1. **アプリを追加**
   - Codemagicダッシュボードで「Add application」をクリック
   - 「GitHub」を選択

2. **リポジトリを選択**
   - `sibuketu/carnivos` を検索・選択
   - 「Next」をクリック

3. **プロジェクトタイプを選択**
   - 「Capacitor」を選択
   - 「Next」をクリック

---

## Phase 3: ビルド設定

### 3.1 基本設定

1. **プラットフォーム選択**
   - 「iOS」にチェックを入れる
   - 「Android」は必要に応じて選択（今回はiOSのみ）

2. **ワークフロー設定**
   - 「Workflow editor」を選択
   - または「codemagic.yaml」ファイルを使用

### 3.2 codemagic.yaml設定（推奨）

プロジェクトルートに `codemagic.yaml` ファイルを作成：

```yaml
workflows:
  ios-workflow:
    name: iOS Workflow
    max_build_duration: 120
    instance_type: mac_mini_m1
    environment:
      groups:
        - app_store_credentials
      vars:
        APP_ID: com.CarnivOS.app
        XCODE_WORKSPACE: "ios/App/App.xcworkspace"
        XCODE_SCHEME: "App"
        BUNDLE_ID: com.CarnivOS.app
      node: 20
      xcode: latest
    scripts:
      - name: Install dependencies
        script: |
          npm install
      - name: Build web app
        script: |
          npm run build
      - name: Sync Capacitor
        script: |
          npx cap sync ios
      - name: Set up code signing settings on Xcode project
        script: |
          xcode-project use-profiles
      - name: Build ipa for distribution
        script: |
          xcode-project build-ipa \
            --workspace "$XCODE_WORKSPACE" \
            --scheme "$XCODE_SCHEME"
    artifacts:
      - build/ios/ipa/*.ipa
      - $HOME/Library/Developer/Xcode/DerivedData/**/Build/**/*.app
    publishing:
      email:
        recipients:
          - your-email@example.com
        notify:
          success: true
          failure: true
      app_store_connect:
        auth: integration
        
        # App Store Connect API Key認証
        submit_to_testflight: true
        submit_to_app_store: false  # 審査提出は手動で行う
```

### 3.3 App Store Connect認証設定

1. **App Store Connect API Keyの生成**
   - App Store Connectにログイン: https://appstoreconnect.apple.com
   - 「Users and Access」→「Keys」タブ
   - 「+」ボタンをクリック
   - キー名を入力（例: "Codemagic CI/CD"）
   - 「App Manager」ロールを選択
   - 「Generate」をクリック
   - **重要**: `.p8`ファイルとKey ID、Issuer IDをダウンロード・保存

2. **Codemagicに認証情報を追加**
   - Codemagicダッシュボードで「Teams」→「Code signing identities」
   - 「App Store Connect API key」セクションで「Add」をクリック
   - 以下を入力：
     - **Key ID**: App Store Connectで取得したKey ID
     - **Issuer ID**: App Store Connectで取得したIssuer ID
     - **Private key (.p8)**: ダウンロードした`.p8`ファイルの内容を貼り付け
   - 「Save」をクリック

3. **環境変数グループの作成**
   - Codemagicダッシュボードで「Teams」→「Environment variables」
   - 新しいグループを作成（例: `app_store_credentials`）
   - グループをワークフローに追加

---

## Phase 4: 初回ビルド実行

1. **ビルドを開始**
   - Codemagicダッシュボードでアプリを選択
   - 「Start new build」をクリック
   - ブランチを選択（`chore/pr-autonomy-setup` またはメインブランチ）
   - 「Start new build」をクリック

2. **ビルドプロセスの監視**
   - ビルドログを確認
   - エラーが発生した場合はログを確認して修正
   - ビルド時間: 約30分-1時間

3. **ビルド完了後の確認**
   - ビルドが成功したことを確認
   - `.ipa`ファイルが生成されていることを確認

---

## Phase 5: App Store Connectでの確認

1. **App Store Connectにログイン**
   - https://appstoreconnect.apple.com にアクセス
   - 「CarnivOS」アプリを選択

2. **ビルドの確認**
   - 「iOSアプリ バージョン 1.0」ページを開く
   - 「ビルド」セクションを確認
   - アップロードされたビルドが表示されていることを確認

3. **ビルドの選択**
   - 「+」ボタンをクリック
   - アップロードされたビルドを選択
   - 「完了」をクリック

---

## トラブルシューティング

### ビルドエラー: "No such file or directory: dist"

**原因**: Webアプリのビルドが実行されていない

**解決方法**:
- `codemagic.yaml`の「Build web app」スクリプトが正しく実行されているか確認
- `npm run build`が成功しているかログを確認

### ビルドエラー: "Code signing failed"

**原因**: 証明書またはプロビジョニングプロファイルの問題

**解決方法**:
- App Store Connect API Keyが正しく設定されているか確認
- Bundle IDが正しいか確認（`com.CarnivOS.app`）

### ビルドエラー: "Capacitor sync failed"

**原因**: Capacitorの設定が正しくない

**解決方法**:
- `capacitor.config.ts`が正しく設定されているか確認
- `ios/`フォルダが存在するか確認

---

## 次のステップ

ビルドが成功し、App Store Connectにアップロードされたら：

1. **アプリアイコンのアップロード**（まだ完了していない場合）
2. **プライバシー情報の完了**（まだ完了していない場合）
3. **審査提出**
   - App Store Connectで「審査用に追加」をクリック
   - 「審査へ提出」ボタンが有効になることを確認
   - 「審査へ提出」をクリック

---

## 参考リンク

- [Codemagic公式ドキュメント](https://docs.codemagic.io/)
- [Codemagic Capacitor設定](https://docs.codemagic.io/yaml-quick-start/building-a-capacitor-app/)
- [App Store Connect API Key](https://developer.apple.com/documentation/appstoreconnectapi/creating_api_keys_for_app_store_connect_api)

---

最終更新: 2026-01-25
