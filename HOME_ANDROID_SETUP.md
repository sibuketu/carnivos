# 家に帰ったら実行する手順（Androidネイティブアプリ化）

> 実機（Android）でネイティブアプリをテストする手順

---

## 📱 前提条件

- ✅ Android実機がある
- ✅ USBケーブルがある
- ✅ Android Studioがインストールされている（なければインストールが必要）

---

## 🚀 実行手順

### 方法1: バッチファイルを使用（推奨・一番簡単）

**エクスプローラーから:**
1. エクスプローラーを開く（Windowsキー+E）
2. アドレスバーに以下を貼り付けてEnter:
   ```
   C:\Users\susam\Downloads\新しいフォルダー\docs\primal-logic-app\primal-logic-web
   ```
3. `setup-capacitor.bat` をダブルクリック
4. 自動的にビルド、Androidプラットフォーム追加、同期が実行されます
5. 完了後、Android Studioが自動的に開きます

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

1. **Android Studioで開く**: `npx cap open android`（バッチファイル実行後は自動的に開きます）
2. **実機をUSBで接続**: Android実機をUSBケーブルで接続
3. **USBデバッグを有効化**: 実機で「USBデバッグ」を有効化（初回のみ）
4. **実機を選択**: Android Studioのデバイス選択で実機を選択
5. **実行**: 「Run」ボタン（緑の再生ボタン）をクリック
6. **アプリが起動**: 実機でアプリが起動します

---

## 🔍 Recovery Protocolの確認

**実機で確認する項目:**
- ✅ Recovery Protocol表示
- ✅ Recovery Protocol生成（違反食品を追加した時）
- ✅ Recovery Protocol設定
- ✅ 「明日のログに追加」機能

**全ての機能がそのまま動作します（心配なし）**

---

## 📝 注意事項

1. **ビルド**: ネイティブアプリを実行する前に、必ず`npm run build`を実行してください（バッチファイルで自動実行されます）
2. **同期**: コードを変更したら、`npx cap sync`を実行してください
3. **Android Studio**: Android開発にはAndroid Studioが必要です（なければインストールが必要）

---

## 🎯 完了後の確認

- ✅ アプリが実機で起動する
- ✅ Recovery Protocolが動作する
- ✅ 全機能が動作する

---

最終更新: 2026-01-03

