# Webアプリの起動方法

> ブラウザでアプリを起動して動作確認する方法

---

## 🚀 起動方法

### 方法1: バッチファイルを使用（推奨）

**エクスプローラーから:**
1. エクスプローラーを開く（Windowsキー+E）
2. アドレスバーに以下を貼り付けてEnter:
   ```
   C:\Users\susam\Downloads\新しいフォルダー\docs\primal-logic-app\primal-logic-web
   ```
3. `start-dev-server.bat` をダブルクリック
4. ブラウザが自動的に開きます

### 方法2: 手動で実行

**PowerShellから:**
```powershell
cd "C:\Users\susam\Downloads\新しいフォルダー\docs\primal-logic-app\primal-logic-web"
npm run dev
```

**ブラウザで開く:**
- 自動的にブラウザが開きます
- 開かない場合は、手動で `http://localhost:5174` を開いてください

---

## 🔍 動作確認項目

### Recovery Protocolの確認

1. **違反食品を追加**: 植物性食品（例：野菜、果物）を追加
2. **Recovery Protocolが自動生成される**: 違反検出時に自動的にRecovery Protocolが生成されます
3. **Recovery Protocolを表示**: ホーム画面にRecovery Protocolが表示されます
4. **Recovery Protocolを設定**: Recovery Protocol画面で断食時間を調整できます
5. **「明日のログに追加」**: SET PROTOCOLボタンをクリックすると、明日のログに追加されます

### その他の機能確認

- ✅ 栄養素ゲージの表示
- ✅ 食品追加機能
- ✅ AIチャット機能
- ✅ 履歴管理機能

---

## 📝 注意事項

- **開発サーバー**: `npm run dev`を実行すると、開発サーバーが起動します
- **ポート**: デフォルトで`http://localhost:5174`で起動します
- **停止**: ターミナルで`Ctrl+C`を押すと停止します

---

最終更新: 2026-01-03

