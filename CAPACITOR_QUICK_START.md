# Capacitorクイックスタート（2026-01-03）

> Webアプリをネイティブアプリ化する手順。コピペするものはすべてコードブロック。パスは絶対パス（CarnivOS）。

---

## 完了した作業

1. **Capacitorのインストール**: 完了
2. **Capacitorの初期化**: 完了

---

## 次のステップ

### 方法1: バッチファイルを使用（推奨）

1. エクスプローラーで次のパスを開く（アドレスバーに貼る）:

```
C:\Users\susam\Downloads\CarnivOS\docs\primal-logic-app\primal-logic-web
```

2. `setup-capacitor.bat` をダブルクリック

### 方法2: PowerShell で実行（コピペ1ブロック）

ビルド → Android 同期 → Android Studio で開く、まで一括:

```powershell
Set-Location "C:\Users\susam\Downloads\CarnivOS\docs\primal-logic-app\primal-logic-web"; npm run build; npx cap sync android; npx cap open android
```

**Android Studio で開くだけ（コピペ1ブロック）:**

```powershell
Set-Location "C:\Users\susam\Downloads\CarnivOS\docs\primal-logic-app\primal-logic-web"; npx cap open android
```

**コードを変えたあと（ビルドと同期のみ・コピペ1ブロック）:**

```powershell
Set-Location "C:\Users\susam\Downloads\CarnivOS\docs\primal-logic-app\primal-logic-web"; npm run build; npx cap sync android
```

---

## iOS対応について

**注意**: WindowsではiOSプラットフォームの追加・sync はできません（pod が無いため）。macOS が必要です。

---

## 実機でテスト

### Android

1. 上記ブロックで Android Studio を開く
2. 実機をUSBで接続
3. 「Run」ボタンをクリック
4. 実機でアプリが起動する

### iOS（macOSが必要）

1. macOS で `npx cap open ios` を実行
2. 実機を接続して Xcode で Run

---

## Recovery Protocolの確認

表示・生成・設定・「明日のログに追加」はネイティブ化後もそのまま動作する。

---

## 注意事項

- **ビルド**: 実行前にビルドと同期を行う（上記ブロック参照）。
- **同期**: コードを変更したら上記「コードを変えたあと」ブロックを実行。
- **iOS**: WindowsではiOS開発はできません。

---

最終更新: 2026-02-03
