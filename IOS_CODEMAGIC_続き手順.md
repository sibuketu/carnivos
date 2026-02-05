# Apple iOS 続き手順（Provisioning Profile → ビルド）

> **前回まで**: 証明書（.p12）作成・Codemagic アップロードまで完了  
> **このドキュメント**: Provisioning Profile 作成 → Codemagic 登録 → 再ビルド  
> **ルール**: URL・パス・コピペする値はすべてコードブロックで渡す。パスは絶対パス。

---

## コピペ用まとめ（先に貼れる値）

ブラウザのアドレスバーや入力欄に貼るときは、以下をそのままコピペして使う。

```
https://developer.apple.com/account/resources/profiles/add
```

```
https://codemagic.io/teams
```

```
https://codemagic.io/app/6979c495b449837e0749a2ee/settings
```

**Bundle ID（Apple / Codemagic で使う）**

```
com.CarnivOS.app
```

**Provisioning Profile 名（例）**

```
CarnivOS App Store
```

**.p12 パスワード（Codemagic 登録時と同じ）**

```
carnivos123
```

---

## ステップ 1: Provisioning Profile を作成する

### 1.1 Apple Developer を開く

アドレスバーに貼って開く（コピペ一発）:

```
https://developer.apple.com/account/resources/profiles/add
```

- Apple Developer アカウントでサインインする

### 1.2 プロファイルの種類を選ぶ

- **「Distribution」** を選ぶ（Development ではない）
- **「Continue」** をクリック

### 1.3 App ID を選ぶ

- 一覧から次の Bundle ID のアプリを選択（ない場合は「+」で新規作成）:

```
com.CarnivOS.app
```

- **「Continue」** をクリック

### 1.4 証明書を選ぶ

- **「Apple Distribution」** の証明書を 1 つ選択（先にアップロードしたもの）
- **「Continue」** をクリック

### 1.5 プロファイル名を付けて生成

- **Provisioning Profile Name** に以下をコピペ（または任意の名前）:

```
CarnivOS App Store
```

- **「Generate」** をクリック
- **「Download」** で `.mobileprovision` をダウンロード（保存場所をメモ）

---

## ステップ 2: Codemagic に Provisioning Profile を登録する

### 2.1 Code signing の設定を開く

アドレスバーに貼って開く:

```
https://codemagic.io/teams
```

- 左メニューまたはチーム設定から **「Code signing identities」** を開く

### 2.2 iOS provisioning profiles に追加

- **「iOS provisioning profiles」** セクションで **「Add」** または **「Upload」**
- ダウンロードした **`.mobileprovision`** を選択してアップロード
- 表示名は任意（上記 `CarnivOS App Store` でよい）

### 2.3 ワークフローでプロファイルを使う設定

- 対象アプリの **「Workflow editor」** を開く
- **Code signing** で、今回アップロードした **Provisioning profile** を選択する  
  （既に Certificate で .p12 を選んでいれば、Profile を選ぶだけでよい）

---

## ステップ 3: ビルドを実行する

### 3.1 アプリのビルド設定を開く

アドレスバーに貼って開く:

```
https://codemagic.io/app/6979c495b449837e0749a2ee/settings
```

（アプリ ID が違う場合は Codemagic ダッシュボードから該当アプリ → Settings）

### 3.2 新規ビルドを開始

- **「Start new build」** をクリック
- **ブランチ**を選択（例: `main` または `chore/pr-autonomy-setup`）
- **Workflow** で iOS 用ワークフローを選択
- **「Start new build」** で実行

### 3.3 ビルド結果を確認

- ビルドログで **Code signing** が通っているか確認
- 成功していれば **Artifacts** に `.ipa` が含まれる
- **App Store Connect** 連携していれば TestFlight / ビルド一覧に自動アップロードされる

---

## よくある失敗と対処

| 現象 | 対処 |
|------|------|
| 「No valid signing identity」 | .p12 のパスワードが Codemagic に登録したもの（上記コードブロック `carnivos123`）と一致しているか確認 |
| 「Provisioning profile doesn't include the signing certificate」 | Profile 作成時に選んだ証明書と、Codemagic に登録した .p12 が同じペアか確認 |
| 「Bundle ID mismatch」 | Codemagic の環境変数・Xcode 設定の Bundle ID が `com.CarnivOS.app` になっているか確認 |
| ビルドは成功するが App Store Connect に出ない | ワークフローの **Publishing → App Store Connect** と API Key（.p8）設定を確認 |

---

## 参照（絶対パス・コードブロック）

このガイドを開くときのパス:

```
C:\Users\susam\Downloads\CarnivOS\docs\primal-logic-app\primal-logic-web\IOS_CODEMAGIC_続き手順.md
```

証明書作成・Codemagic 初期設定のログ:

```
C:\Users\susam\Downloads\CarnivOS\docs\second-brain\50_Logs_Memory\chat-logs\agent-log-ios-appstore.md
```

同フォルダ内の関連ドキュメント:

```
C:\Users\susam\Downloads\CarnivOS\docs\primal-logic-app\primal-logic-web\CODEMAGIC_IOS_BUILD_SETUP.md
```

```
C:\Users\susam\Downloads\CarnivOS\docs\primal-logic-app\primal-logic-web\APP_STORE_SUBMISSION_CHECKLIST.md
```

---

**最終更新**: 2026-02-03
