# CarnivOS Web App - 開発サーバー起動ガイド

> 最終更新: 2025-12-18

---

## 🚀 開発サーバー起動方法

### 方法1: 絶対パスで起動（推奨）

```powershell
cd "C:\Users\susam\Downloads\新しいフォルダー\docs\primal-logic-app\primal-logic-web"
npm run dev
```

### 方法2: 現在のディレクトリから

```powershell
npm --prefix ".\primal-logic-app\primal-logic-web" run dev
```

### 方法3: PowerShellでパスを検索して起動

```powershell
$webPath = (Get-ChildItem -Path . -Filter "package.json" -Recurse | Where-Object { $_.DirectoryName -like "*primal-logic-web*" } | Select-Object -First 1).DirectoryName
if ($webPath) {
    Set-Location $webPath
    npm run dev
}
```

---

## 📱 アクセス

ブラウザで `http://localhost:5173` を開く

---

## ✅ 動作確認項目

### 基本動作
- [ ] アプリが起動する
- [ ] ナビゲーション（Home, Input, History, Profile）が動作する
- [ ] エラーが表示されない

### Home画面
- [ ] ログがない場合のEmpty Stateが表示される
- [ ] ログがある場合、栄養素ゲージが表示される
- [ ] ゲージをタップするとArgument Cardが表示される

### Input画面
- [ ] Status入力（Sleep, Sun, Activity）が動作する
- [ ] 食品検索が動作する
- [ ] 食品追加が動作する
- [ ] Recovery Protocolが自動生成される（違反食品の場合）

### History画面
- [ ] ログ一覧が表示される（新しい順）
- [ ] ログアイテムをタップすると詳細が展開される（アコーディオン形式）
- [ ] 削除ボタンが動作する
- [ ] 栄養素メトリクスをタップするとArgument Cardが表示される

### Profile画面
- [ ] プロファイル設定が保存できる
- [ ] 設定が正しく読み込まれる

---

## 🐛 トラブルシューティング

### ポート5173が既に使用されている場合

```powershell
# ポートを使用しているプロセスを確認
netstat -ano | findstr :5173

# プロセスを終了（必要に応じて）
taskkill /PID <プロセスID> /F
```

### 依存関係の再インストール

```powershell
cd "C:\Users\susam\Downloads\新しいフォルダー\docs\primal-logic-app\primal-logic-web"
rm -r node_modules
npm install
```

---

最終更新: 2025-12-18


