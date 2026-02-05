# Capacitorセットアップ手順（2026-01-03）

> Webアプリをネイティブアプリ化する手順。コピペするものはすべてコードブロック。パスは絶対パス（CarnivOS）。

---

## 完了した作業

1. **Capacitorのインストール**: 完了
2. **Capacitorの初期化**: 完了（appId: com.primallogic.app, appName: CarnivOS, webDir: dist）

---

## 次のステップ（コピペ用）

### ビルド → Android 同期 → Android Studio で開く（1ブロック）

```powershell
Set-Location "C:\Users\susam\Downloads\CarnivOS\docs\primal-logic-app\primal-logic-web"; npm run build; npx cap sync android; npx cap open android
```

### Android Studio で開くだけ（1ブロック）

```powershell
Set-Location "C:\Users\susam\Downloads\CarnivOS\docs\primal-logic-app\primal-logic-web"; npx cap open android
```

### コードを変えたあと（ビルドと同期のみ・1ブロック）

```powershell
Set-Location "C:\Users\susam\Downloads\CarnivOS\docs\primal-logic-app\primal-logic-web"; npm run build; npx cap sync android
```

### エクスプローラーでフォルダを開く（アドレスバーに貼る）

primal-logic-web フォルダ:

```
C:\Users\susam\Downloads\CarnivOS\docs\primal-logic-app\primal-logic-web
```

android フォルダ（Android Studio で Open する用）:

```
C:\Users\susam\Downloads\CarnivOS\docs\primal-logic-app\primal-logic-web\android
```

---

## 実機でテスト

- **Android**: 上記で Android Studio を開く → 実機をUSB接続 → デバイス選択 → Run
- **iOS**: Windowsでは不可。macOS で `npx cap open ios` を実行

---

## 注意事項

- **WindowsでのiOS**: iOS は macOS が必要。Windows では `cap sync` で iOS が失敗するため、`cap sync android` のみ使用すること。
- **Android**: Windows でも開発可能。Android Studio が必要。
- **ビルド**: 実行前に必ずビルドと同期を行う（上記ブロック参照）。

---

最終更新: 2026-02-03
