# アプリ起動URL

## 開発サーバーのURL

### ローカルアクセス
```
http://localhost:5174
```

### ネットワークアクセス（同一ネットワーク内の他のデバイスから）
```
http://[あなたのPCのIPアドレス]:5174
```

## ポート番号
- **ポート**: `5174`
- **設定ファイル**: `vite.config.ts` の `server.port` で設定されています

## 開発サーバーの起動方法

### 方法1: バッチファイルから起動（推奨）
1. エクスプローラーを開く（Windowsキー + E）
2. アドレスバーに以下を貼り付けてEnter:
   ```
   C:\Users\susam\Downloads\新しいフォルダー\docs\primal-logic-app\primal-logic-web
   ```
3. `start-dev-server.bat` をダブルクリック

### 方法2: PowerShellから起動
1. PowerShellを開く（Windowsキー → 「PowerShell」と入力 → Enter）
2. 以下のコマンドを実行:
   ```powershell
   cd "C:\Users\susam\Downloads\新しいフォルダー\docs\primal-logic-app\primal-logic-web"
   npm run dev
   ```

## 開発サーバーが起動しているか確認

### ブラウザで確認
ブラウザで以下のURLにアクセス:
```
http://localhost:5174
```

### コマンドで確認
PowerShellで以下のコマンドを実行:
```powershell
netstat -ano | findstr :5174
```
ポート5174が使用されている場合、開発サーバーが起動しています。

## 注意事項
- 開発サーバーが起動していない場合、URLにアクセスしてもエラーになります
- 開発サーバーを停止する場合は、ターミナルで `Ctrl + C` を押してください

