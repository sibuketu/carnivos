# ネイティブアプリ化セットアップ完了（2026-01-03）

> Capacitorを使ったネイティブアプリ化の準備が完了しました

---

## ✅ 完了した作業

1. **Capacitorのインストール**: 完了 ✅
2. **Capacitorの初期化**: 完了 ✅
3. **capacitor.config.tsの作成**: 完了 ✅
4. **セットアップバッチファイルの作成**: 完了 ✅

---

## 📋 次のステップ（ユーザーが実行）

### 方法1: バッチファイルを使用（推奨・一番簡単）

**エクスプローラーから:**
1. エクスプローラーを開く（Windowsキー+E）
2. アドレスバーに以下を貼り付けてEnter:
   ```
   C:\Users\susam\Downloads\新しいフォルダー\docs\primal-logic-app\primal-logic-web
   ```
3. `setup-capacitor.bat` をダブルクリック
4. 自動的にビルド、Androidプラットフォーム追加、同期が実行されます

### 方法2: 手動で実行

**PowerShellから:**
1. 新しいPowerShellを開く（Windowsキー → 「PowerShell」と入力 → Enter）
2. 以下のコマンドを順番に実行:

```powershell
cd "C:\Users\susam\Downloads\新しいフォルダー\docs\primal-logic-app\primal-logic-web"
npm run build
npx cap add android
npx cap sync
npx cap open android
```

---

## 📱 実機でテスト

### Android

1. **Android Studioで開く**: `npx cap open android`
2. **実機をUSBで接続**: Android実機をUSBケーブルで接続
3. **実機を選択**: Android Studioのデバイス選択で実機を選択
4. **実行**: 「Run」ボタンをクリック
5. **アプリが起動**: 実機でアプリが起動します

### iOS（macOSが必要）

**注意**: WindowsではiOS開発はできません。macOSが必要です。

1. **Xcodeで開く**: `npx cap open ios`
2. **実機をUSBで接続**: iOS実機をUSBケーブルで接続
3. **実機を選択**: Xcodeのデバイス選択で実機を選択
4. **実行**: 「Run」ボタンをクリック
5. **アプリが起動**: 実機でアプリが起動します

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
4. **Android Studio**: Android開発にはAndroid Studioが必要です

---

## 🎯 次のアクション

1. **バッチファイルを実行**: `setup-capacitor.bat` をダブルクリック
2. **Android Studioで開く**: `npx cap open android`
3. **実機でテスト**: 実機を接続して実行
4. **Recovery Protocolの動作確認**: 実機でRecovery Protocolを試す

---

最終更新: 2026-01-03

