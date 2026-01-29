# Capacitorクイックスタート（2026-01-03）

> Webアプリをネイティブアプリ化する簡単な手順

---

## ✅ 完了した作業

1. **Capacitorのインストール**: 完了 ✅
2. **Capacitorの初期化**: 完了 ✅

---

## 🚀 次のステップ（簡単な方法）

### 方法1: バッチファイルを使用（推奨）

**Windows:**
1. `setup-capacitor.bat` をダブルクリック
2. 自動的にビルド、Androidプラットフォーム追加、同期が実行されます

### 方法2: 手動で実行

**1. Webアプリをビルド**
```bash
npm run build
```

**2. Androidプラットフォームを追加**
```bash
npx cap add android
```

**3. Capacitorに同期**
```bash
npx cap sync
```

**4. Android Studioで開く**
```bash
npx cap open android
```

---

## 📱 iOS対応について

**注意**: WindowsではiOSプラットフォームの追加はできません。

**iOS対応が必要な場合:**
1. macOSが必要です
2. Xcodeが必要です
3. 以下のコマンドを実行:
   ```bash
   npx cap add ios
   npx cap sync
   npx cap open ios
   ```

---

## 🎯 実機でテスト

### Android

1. Android Studioで開く: `npx cap open android`
2. 実機をUSBで接続
3. Android Studioで「Run」ボタンをクリック
4. 実機でアプリが起動します

### iOS（macOSが必要）

1. Xcodeで開く: `npx cap open ios`
2. 実機をUSBで接続
3. Xcodeで「Run」ボタンをクリック
4. 実機でアプリが起動します

---

## 🔍 Recovery Protocolの確認

**Webアプリ版に実装されている機能:**
- ✅ Recovery Protocol表示
- ✅ Recovery Protocol生成
- ✅ Recovery Protocol設定
- ✅ 「明日のログに追加」機能

**Capacitorでネイティブ化した場合:**
- ✅ 全ての機能がそのまま動作します
- ✅ Recovery Protocolも動作します（心配なし）

---

## 📝 注意事項

1. **ビルド**: ネイティブアプリを実行する前に、必ず`npm run build`を実行してください
2. **同期**: コードを変更したら、`npx cap sync`を実行してください
3. **iOS**: WindowsではiOS開発はできません（macOSが必要）

---

最終更新: 2026-01-03

