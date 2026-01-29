# iPhone実機テスト - クイック修正ガイド

## 🚨 アクセスできない場合の最初の確認事項

### 1. PCのブラウザで動作確認（最重要）

まず、PCのブラウザ（Chrome/Edge）で以下にアクセスしてください：

```
http://localhost:5174
```

- ✅ **表示される**: 開発サーバーは正常です。次のステップに進んでください。
- ❌ **表示されない**: 開発サーバーが起動していません。`npm run dev`を実行してください。

---

### 2. ファイアウォールの設定（よくある原因）

Windowsファイアウォールでポート5174がブロックされている可能性が高いです。

#### 簡単な設定方法（GUI）

1. Windowsの検索で「ファイアウォール」→「Windows Defender ファイアウォール」
2. 「詳細設定」をクリック
3. 「受信の規則」→「新しい規則」
4. 「ポート」→「次へ」
5. 「TCP」→「特定のローカル ポート」に `5174` →「次へ」
6. 「接続を許可する」→「次へ」
7. すべてにチェック→「次へ」
8. 名前「Vite Dev Server (5174)」→「完了」

詳細は `FIREWALL_SETUP.md` を参照してください。

#### PowerShellで設定（管理者権限）

```powershell
New-NetFirewallRule -DisplayName "Vite Dev Server (5174)" -Direction Inbound -Protocol TCP -LocalPort 5174 -Action Allow
```

---

### 3. IPアドレスの確認

PowerShellまたはコマンドプロンプトで：

```powershell
ipconfig
```

「IPv4 アドレス」を確認してください（例: `172.20.10.2`）

---

### 4. iPhoneからアクセス

iPhoneのSafariで以下を開いてください：

```
http://[PCのIPアドレス]:5174
```

例: `http://172.20.10.2:5174`

---

## 📚 詳細なトラブルシューティング

- `TROUBLESHOOTING_IPHONE.md`: 詳細なトラブルシューティングガイド
- `FIREWALL_SETUP.md`: ファイアウォール設定の詳細手順

---

最終更新: 2025-01-27

