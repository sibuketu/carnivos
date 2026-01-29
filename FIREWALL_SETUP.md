# Windowsファイアウォール設定 - ポート5174を開く

## 🔥 クイック設定手順

### 方法1: GUI（グラフィカルインターフェース）

1. **Windowsの検索で「ファイアウォール」を検索**
   - 「Windows Defender ファイアウォール」を開く

2. **「詳細設定」をクリック**

3. **「受信の規則」を選択**

4. **右側の「新しい規則」をクリック**

5. **「ポート」を選択 → 「次へ」**

6. **「TCP」を選択**
   - 「特定のローカル ポート」に `5174` を入力
   - 「次へ」

7. **「接続を許可する」を選択 → 「次へ」**

8. **すべてのプロファイルにチェック → 「次へ」**
   - ドメイン
   - プライベート
   - パブリック

9. **名前を「Vite Dev Server (5174)」などに設定 → 「完了」**

---

### 方法2: PowerShell（管理者権限で実行）

1. **PowerShellを管理者権限で開く**
   - Windowsの検索で「PowerShell」を検索
   - 右クリック → 「管理者として実行」

2. **以下のコマンドを実行**:

```powershell
New-NetFirewallRule -DisplayName "Vite Dev Server (5174)" -Direction Inbound -Protocol TCP -LocalPort 5174 -Action Allow
```

これでポート5174が開きます。

---

## ✅ 設定の確認

PowerShellで以下のコマンドを実行して、規則が追加されたか確認：

```powershell
Get-NetFirewallRule | Where-Object {$_.DisplayName -like "*5174*"}
```

規則が表示されれば、設定は成功しています。

---

## 🔍 トラブルシューティング

### それでもアクセスできない場合

1. **PCのブラウザで確認**
   - Chrome/Edgeで `http://localhost:5174` にアクセス
   - 表示されない場合、開発サーバーが起動していません

2. **開発サーバーの起動確認**
   - ターミナルで `npm run dev` を実行
   - 以下のようなメッセージが表示されることを確認：
   ```
   VITE v5.x.x  ready in xxx ms
   
   ➜  Local:   http://localhost:5174/
   ➜  Network: http://172.20.10.2:5174/
   ```

3. **IPアドレスの確認**
   - PowerShellで `ipconfig` を実行
   - 「IPv4 アドレス」を確認
   - iPhoneで `http://[IPアドレス]:5174` にアクセス

4. **ネットワークプロファイルの確認**
   - 設定 → ネットワークとインターネット → Wi-Fi
   - 接続中のWi-Fiをクリック → プロパティ
   - 「ネットワーク プロファイル」が「プライベート」になっているか確認

---

## 🚨 セキュリティ注意事項

- この設定は開発環境でのみ使用してください
- 本番環境では、適切なセキュリティ設定を行ってください
- 開発終了後は、規則を削除することをお勧めします

### 規則の削除方法

PowerShell（管理者権限）で実行：

```powershell
Remove-NetFirewallRule -DisplayName "Vite Dev Server (5174)"
```

---

最終更新: 2025-01-27

