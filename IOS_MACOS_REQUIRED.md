# iOS対応について（macOSが必要）

> WindowsではiOS開発はできません。macOSが必要です。

---

## ⚠️ 重要な注意事項

**WindowsではiOS開発はできません**

- ❌ Windowsでは`npx cap add ios`が実行できません
- ❌ WindowsではXcodeが動作しません
- ✅ macOSが必要です

---

## 🍎 iOS対応が必要な場合

### 必要な環境

1. **macOS**: macOSがインストールされたMacが必要
2. **Xcode**: Xcodeがインストールされている必要がある
3. **Apple Developer Program**: App Storeに公開する場合は必要（有料）

### 実行手順（macOSで実行）

```bash
cd primal-logic-web
npm run build
npx cap add ios
npx cap sync
npx cap open ios
```

---

## 🎯 現在の対応状況

### ✅ 完了していること

- ✅ **Webアプリ**: 完全に動作する
- ✅ **Android**: セットアップ完了（実機でテスト可能）
- ⚠️ **iOS**: macOSが必要（Windowsでは不可）

### 📱 推奨アプローチ

1. **今すぐ**: Webアプリで動作確認（ブラウザで動作）
2. **家に帰ったら**: Android実機でネイティブアプリをテスト
3. **将来的に**: macOSがあればiOS対応も可能

---

## 🔄 代替案

### PWA（Progressive Web App）

**WebアプリをPWA対応にすることで、iOSでも「ホーム画面に追加」可能:**

- ✅ App Store審査不要
- ✅ すぐに利用可能
- ✅ iOS Safariで「ホーム画面に追加」可能
- ⚠️ ただし、App Storeには出せない

**PWA対応は既に完了**（`manifest.json`、Service Worker等）

---

## 📝 まとめ

- **WindowsではiOS開発は不可**: macOSが必要
- **Androidは可能**: 実機があればテスト可能
- **Webアプリは動作**: ブラウザで動作確認可能
- **PWA対応済み**: iOS Safariでも「ホーム画面に追加」可能

---

最終更新: 2026-01-03

