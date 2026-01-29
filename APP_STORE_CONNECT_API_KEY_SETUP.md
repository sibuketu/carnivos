# App Store Connect API Key設定手順

> CodemagicでiOSアプリをビルド・アップロードするためのApp Store Connect API Key生成ガイド

---

## 概要

App Store Connect API Keyを使用することで、Codemagicが自動的にApp Store Connectにビルドをアップロードできます。macOSやXcodeなしで、Windows環境からiOSアプリを提出できます。

---

## 手順

### Step 1: App Store Connectにログイン

1. **App Store Connectにアクセス**
   - URL: https://appstoreconnect.apple.com
   - Apple Developerアカウントでログイン

2. **ユーザーとアクセスページを開く**
   - 右上のアカウント名をクリック
   - 「Users and Access」を選択
   - または直接: https://appstoreconnect.apple.com/access/users

---

### Step 2: API Keysセクションを開く

1. **Keysタブを選択**
   - 「Users and Access」ページで「Keys」タブをクリック
   - 既存のキーが表示される（初回は空）

2. **新しいキーを作成**
   - 「+」ボタンをクリック
   - または「Generate API Key」ボタンをクリック

---

### Step 3: API Keyの生成

1. **キー名を入力**
   - 例: "Codemagic CI/CD"
   - 例: "CarnivOS Build Key"
   - わかりやすい名前を入力

2. **アクセス権限を選択**
   - **「App Manager」**を選択（推奨）
     - ビルドのアップロードに必要な権限
     - アプリ情報の編集は不要なため、この権限で十分
   - 「Admin」を選択することも可能（より広い権限）

3. **キーを生成**
   - 「Generate」ボタンをクリック
   - **重要**: この画面は一度しか表示されません

---

### Step 4: 認証情報の保存

**以下の3つの情報を必ず保存してください：**

1. **Key ID**
   - 例: `ABC123DEF4`
   - 10文字の英数字
   - コピーして保存

2. **Issuer ID**
   - 例: `12345678-1234-1234-1234-123456789012`
   - UUID形式
   - コピーして保存

3. **Private Key (.p8ファイル)**
   - 「Download API Key」ボタンをクリック
   - `.p8`ファイルをダウンロード
   - **重要**: このファイルは再ダウンロードできません
   - 安全な場所に保存（例: パスワードマネージャー）

---

### Step 5: Codemagicに認証情報を追加

1. **Codemagicにログイン**
   - URL: https://codemagic.io
   - アカウントでログイン

2. **Team integrations > Developer Portal > Manage keysを開く**
   - ダッシュボードで「Teams」を選択
   - 「Team integrations」を選択
   - 「Developer Portal」を選択
   - 「Manage keys」を選択

3. **App Store Connect API keyを追加**
   - 「Add key」ボタンをクリック
   - 以下の情報を入力：
     - **Key name**: 任意の名前（例: "CarnivOS API Key"）
       - 後でアプリケーション設定で参照するための人間が読める名前
     - **Issuer ID**: Step 4で保存したIssuer ID
     - **Key ID**: Step 4で保存したKey ID
     - **Private key (.p8ファイル)**: 
       - 「Choose a .p8 file」をクリックしてファイルを選択
       - または、`.p8`ファイルをドラッグ&ドロップ
       - App Store Connectでダウンロードした`.p8`ファイルを使用
   - 「Save」をクリック

---

### Step 6: 環境変数グループの作成（オプション）

Codemagicのワークフローで使用するために、環境変数グループを作成：

1. **Environment variablesを開く**
   - Codemagicダッシュボードで「Teams」→「Environment variables」

2. **新しいグループを作成**
   - 「Add group」をクリック
   - グループ名を入力（例: `app_store_credentials`）

3. **グループをワークフローに追加**
   - ワークフロー設定で「Environment variables」セクションを開く
   - 作成したグループを選択

---

## 確認方法

### Codemagicでの確認

1. **Code signing identitiesページを確認**
   - 「App Store Connect API key」セクションに追加したキーが表示される
   - ステータスが「Active」であることを確認

### ビルドでの確認

1. **ビルドを実行**
   - Codemagicでビルドを開始
   - ビルドログで「App Store Connect authentication」が成功していることを確認

2. **エラーの場合**
   - 「Authentication failed」エラーが表示される場合：
     - Key ID、Issuer ID、Private keyが正しいか確認
     - `.p8`ファイルの内容が完全にコピーされているか確認（改行を含む）

---

## セキュリティ注意事項

1. **Private Key (.p8ファイル)の取り扱い**
   - このファイルは機密情報です
   - GitHubにコミットしない（`.gitignore`に追加）
   - パスワードマネージャーなど安全な場所に保存
   - 共有する場合は暗号化して送信

2. **Key IDとIssuer ID**
   - これらも機密情報として扱う
   - 公開リポジトリにコミットしない

3. **キーのローテーション**
   - 定期的にキーを再生成することを推奨
   - 古いキーは削除可能

---

## トラブルシューティング

### エラー: "Invalid API Key"

**原因**: Key ID、Issuer ID、またはPrivate keyが間違っている

**解決方法**:
- 各値を再確認
- `.p8`ファイルの内容が完全にコピーされているか確認
- 改行が正しく含まれているか確認

### エラー: "Insufficient permissions"

**原因**: キーのアクセス権限が不足している

**解決方法**:
- App Store Connectでキーの権限を「App Manager」以上に変更
   - 注意: 既存のキーの権限は変更できない
   - 新しいキーを生成する必要がある

### エラー: "Key not found"

**原因**: キーが削除されている、または間違ったKey IDを使用している

**解決方法**:
- App Store Connectでキーが存在するか確認
- Key IDが正しいか確認

---

## 参考リンク

- [App Store Connect API Keys](https://developer.apple.com/documentation/appstoreconnectapi/creating_api_keys_for_app_store_connect_api)
- [Codemagic App Store Connect認証](https://docs.codemagic.io/code-signing-yaml/signing-ios/)

---

最終更新: 2026-01-25
