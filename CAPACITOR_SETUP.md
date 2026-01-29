# Capacitorセットアップ手順（2026-01-03）

> Webアプリをネイティブアプリ化する手順

---

## ✅ 完了した作業

1. **Capacitorのインストール**: 完了
   ```bash
   npm install @capacitor/core @capacitor/cli @capacitor/ios @capacitor/android --save-dev
   ```

2. **Capacitorの初期化**: 完了
   ```bash
   npx cap init "CarnivOS" "com.primallogic.app" --web-dir="dist"
   ```

---

## 📋 次のステップ

### 1. Webアプリをビルド

```bash
cd primal-logic-web
npm run build
```

これで`dist`ディレクトリにビルドされたファイルが生成されます。

### 2. iOS/Androidプラットフォームを追加

**Android（Windowsでも可能）:**
```bash
npx cap add android
```

**iOS（macOSが必要）:**
```bash
npx cap add ios
```

**注意**: WindowsではiOSプラットフォームの追加はできません。macOSが必要です。

### 3. Capacitorに同期

```bash
npx cap sync
```

これで、ビルドされたWebアプリがネイティブプロジェクトにコピーされます。

### 4. 実機でテスト

**Android:**
```bash
npx cap open android
```
Android Studioが開くので、実機を接続して実行できます。

**iOS（macOSが必要）:**
```bash
npx cap open ios
```
Xcodeが開くので、実機を接続して実行できます。

---

## 🔧 設定ファイル

### capacitor.config.ts

Capacitorの設定ファイルが作成されているはずです。確認してください。

```typescript
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.primallogic.app',
  appName: 'CarnivOS',
  webDir: 'dist',
  // その他の設定
};

export default config;
```

---

## 📝 注意事項

1. **WindowsでのiOS開発**: WindowsではiOSプラットフォームの追加はできません。macOSが必要です。
2. **Android開発**: WindowsでもAndroid開発は可能です。
3. **ビルド**: ネイティブアプリを実行する前に、必ず`npm run build`を実行してください。

---

## 🎯 次のアクション

1. Webアプリをビルド: `npm run build`
2. Androidプラットフォームを追加: `npx cap add android`
3. Capacitorに同期: `npx cap sync`
4. Android Studioで開く: `npx cap open android`
5. 実機でテスト

---

最終更新: 2026-01-03


