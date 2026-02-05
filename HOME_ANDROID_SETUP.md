# 家に帰ったら実行する手順（Androidネイティブアプリ化）

> 実機（Android）でネイティブアプリをテストする手順。コピペするものはすべてコードブロック。パスは絶対パス（CarnivOS）。

---

## 前提条件

- Android実機がある
- USBケーブルがある
- Android Studioがインストールされている（なければインストールが必要）

---

## 実行手順

### 方法1: バッチファイルを使用（推奨）

1. エクスプローラーを開く（Windowsキー+E）
2. アドレスバーに以下を貼り付けてEnter（コピペ）:

```
C:\Users\susam\Downloads\CarnivOS\docs\primal-logic-app\primal-logic-web
```

3. `setup-capacitor.bat` をダブルクリック
4. ビルド・Android追加・同期が自動実行される（完了後、必要なら「Android Studioで開く」は方法2のブロックを実行）

### 方法2: PowerShell でビルド〜Android Studio で開く（コピペ1ブロック）

PowerShell を開き、以下をそのまま貼り付けて実行:

```powershell
Set-Location "C:\Users\susam\Downloads\CarnivOS\docs\primal-logic-app\primal-logic-web"; npm run build; npx cap sync android; npx cap open android
```

（Android は既に追加済みのため `cap add android` は不要。iOS は Windows では sync で失敗するので `cap sync android` のみ。）

---

## 実機でテスト

1. **Android Studioで開く**: 上記のブロックで開いていない場合は、以下をコピペ1ブロックで実行:

```powershell
Set-Location "C:\Users\susam\Downloads\CarnivOS\docs\primal-logic-app\primal-logic-web"; npx cap open android
```

2. **実機をUSBで接続**: Android実機をUSBケーブルで接続
3. **USBデバッグを有効化**: 実機で「USBデバッグ」を有効化（初回のみ）
4. **実機を選択**: Android Studioのデバイス選択で実機を選択
5. **実行**: 「Run」ボタン（緑の再生ボタン）をクリック
6. **アプリが起動**: 実機でアプリが起動する

**エクスプローラーで android フォルダを開く場合（アドレスバーに貼る）:**

```
C:\Users\susam\Downloads\CarnivOS\docs\primal-logic-app\primal-logic-web\android
```

→ 開いたフォルダを Android Studio で「Open」する。

---

## Recovery Protocolの確認

実機で確認する項目:

- Recovery Protocol表示
- Recovery Protocol生成（違反食品を追加した時）
- Recovery Protocol設定
- 「明日のログに追加」機能

全ての機能がそのまま動作する。

---

## 注意事項

- **ビルド**: ネイティブアプリを実行する前に、必ずビルドと同期を行う（バッチまたは上記PowerShellブロック）。
- **同期**: コードを変更したら、以下をコピペ1ブロックで実行:

```powershell
Set-Location "C:\Users\susam\Downloads\CarnivOS\docs\primal-logic-app\primal-logic-web"; npm run build; npx cap sync android
```

- **Android Studio**: Android開発にはAndroid Studioが必要（なければインストールが必要）。

---

## 完了後の確認

- アプリが実機で起動する
- Recovery Protocolが動作する
- 全機能が動作する

---

最終更新: 2026-02-03
