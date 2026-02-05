# Netlify UI復元チェックリスト

> **作成日**: 2026-01-27  
> **目的**: NetlifyのUIと現在のローカルUIを比較して、差異を確認・修正する

---

## ✅ 確認済み（コード上は完了）

### HistoryScreen
- ✅ 期間フィルター: "Today", "7 day", "30 day", "All", "⭐ All"
- ✅ タブ: "Summary", "History", "Photo Gallery"
- ✅ タイトル: `{t('history.title') || 'History'}`

### HomeScreen
- ✅ Fasting Timer: "Fasting Not Started" / "Stop Eating" ボタン
- ✅ アクションボタン: +, 📋, ⭐, ✏️, 🍽️, 📷
- ✅ "Report Issue / Feedback (Beta)" ボタン
- ✅ 栄養ゲージ: グループ化表示（電解質、マクロ、その他）
- ✅ CSS: `display: block !important`, `visibility: visible !important`

### ProfileScreen
- ✅ タイトル: `{t('settings.title') || 'Setting'}` (単数形)
- ✅ 各種設定項目

### LabsScreen
- ✅ タイトル: "💡 Tip"
- ✅ "View Tip List" ボタン

---

## 🔧 修正済み

1. ✅ `CarbTargetSettingsScreen.tsx` の文字化けを修正
2. ✅ Viteキャッシュをクリア
3. ✅ 開発サーバーを再起動

---

## ⚠️ 確認が必要な項目

### ブラウザで確認してください

1. **HistoryScreen**
   - [ ] 期間フィルターボタンが表示されているか
   - [ ] タブ（Summary, History, Photo Gallery）が表示されているか
   - [ ] ログが展開できるか

2. **HomeScreen**
   - [ ] 栄養ゲージが表示されているか（電解質、マクロ、その他）
   - [ ] Fasting Timerが表示されているか
   - [ ] アクションボタンが表示されているか

3. **ProfileScreen**
   - [ ] タイトルが「Setting」になっているか
   - [ ] 言語設定ボタンが表示されているか

4. **LabsScreen**
   - [ ] Tipカードが表示されているか
   - [ ] "View Tip List" ボタンが表示されているか

---

## 🐛 問題が続く場合の対処法

### 1. ブラウザキャッシュを完全にクリア

1. **開発者ツールを開く** (F12)
2. **Networkタブ** → **"Disable cache"** にチェック
3. **Applicationタブ** → **Storage** → **Clear site data**
4. **ハードリロード**: `Ctrl+Shift+R`

### 2. 開発サーバーを再起動

```powershell
# すべてのNodeプロセスを停止
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force

# Viteキャッシュをクリア
Remove-Item -Recurse -Force node_modules\.vite -ErrorAction SilentlyContinue

# 開発サーバーを起動
npm run dev
```

### 3. 問題を報告

以下の情報を送ってください：

```
- 画面名: [History / Home / Profile / Labs]
- 問題: [具体的に何が表示されていないか]
- エラー: [Consoleタブのエラーメッセージがあれば]
```

---

## 📝 参考

- **Netlify URL**: https://strong-travesseiro-0a6a1c.netlify.app
- **UI確認ガイド**: `docs/UI_CHECK_GUIDE.md`
- **Netlify UI比較**: `docs/NETLIFY_UI_COMPARISON_AND_FIXES.md`
