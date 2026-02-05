# ネイティブアプリ化セットアップ完了（2026-01-03）

> Capacitorを使ったネイティブアプリ化の準備が完了。コピペするものはすべてコードブロック。パスは絶対パス（CarnivOS）。

---

## 完了した作業

1. **Capacitorのインストール**: 完了
2. **Capacitorの初期化**: 完了
3. **capacitor.config.tsの作成**: 完了
4. **セットアップバッチファイルの作成**: 完了

---

## 次のステップ（あなたが実行）

### 方法1: バッチファイルを使用（推奨）

1. エクスプローラーを開く（Windowsキー+E）
2. アドレスバーに以下を貼り付けてEnter（コピペ）:

```
C:\Users\susam\Downloads\CarnivOS\docs\primal-logic-app\primal-logic-web
```

3. `setup-capacitor.bat` をダブルクリック
4. ビルド・Android追加・同期が自動実行される

### 方法2: PowerShell で実行（コピペ1ブロック）

```powershell
Set-Location "C:\Users\susam\Downloads\CarnivOS\docs\primal-logic-app\primal-logic-web"; npm run build; npx cap sync android; npx cap open android
```

（android は既に追加済みのため `cap add android` は省略。開くだけなら下のブロック。）

**Android Studio で開くだけ（コピペ1ブロック）:**

```powershell
Set-Location "C:\Users\susam\Downloads\CarnivOS\docs\primal-logic-app\primal-logic-web"; npx cap open android
```

**エクスプローラーで android フォルダを開く（アドレスバーに貼る）:**

```
C:\Users\susam\Downloads\CarnivOS\docs\primal-logic-app\primal-logic-web\android
```

---

## 実機でテスト

### Android

1. 上記で Android Studio でプロジェクトを開く
2. 実機をUSBで接続
3. デバイス選択で実機を選択
4. 「Run」ボタンをクリック
5. 実機でアプリが起動する

### iOS（macOSが必要）

WindowsではiOS開発はできません。macOSが必要です。

---

## Recovery Protocolの確認

- Recovery Protocol表示・生成・設定・「明日のログに追加」機能は、ネイティブ化後もそのまま動作する。

---

## 注意事項

- **ビルド**: 実行前にビルドと同期を行う（上記ブロック参照）。
- **同期**: コードを変更したら、以下をコピペ1ブロックで実行:

```powershell
Set-Location "C:\Users\susam\Downloads\CarnivOS\docs\primal-logic-app\primal-logic-web"; npm run build; npx cap sync android
```

- **iOS**: WindowsではiOS開発はできません（macOSが必要）。
- **Android Studio**: Android開発にはAndroid Studioが必要。

---

## 次のアクション

1. バッチまたはPowerShellブロックでビルド・同期・Android Studio を開く
2. 実機を接続して Run
3. 実機で Recovery Protocol を確認

---

最終更新: 2026-02-03
