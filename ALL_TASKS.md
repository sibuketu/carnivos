# 全タスク一覧（一気に色々やる）

> 作成日: 2026-01-03
> 目的: リリース前の最終確認と改善を一気に進める

---

## 🎯 全タスク（並行実行）

### ✅ 完了済み
1. **Visual Regression Testの追加** - 完了
2. **グリシン:メチオニン比の表示追加** - 完了
3. **Rulesの前提明確化** - 完了

### ⏳ 実行中・次のアクション

#### 1. コード品質チェック
**Cursorが実行:**
- Lintチェック実行中
- 型チェック実行中
- エラーがあれば修正

**ユーザーが実行（エクスプローラーから）:**
- `run-code-check.bat` をダブルクリック（確認用）

#### 2. Visual Regression Testの再実行
**Cursorが実行:**
- テスト実行中
- 失敗したテストの修正

**ユーザーが実行（エクスプローラーから）:**
- `run-visual-test.bat` をダブルクリック（確認用）

#### 3. iOS版テスト（Maestro）
**ユーザーが実行:**
1. エクスプローラーを開く（Windowsキー+E）
2. アドレスバーに以下を貼り付けてEnter:
   ```
   C:\Users\susam\Downloads\新しいフォルダー\docs\primal-logic-app
   ```
3. `.maestro\scripts\run-all-tests-ios.ps1` をダブルクリック

**または、PowerShellから:**
```powershell
cd "C:\Users\susam\Downloads\新しいフォルダー\docs\primal-logic-app"
.\start-ios-app.bat
# 別のターミナルで:
.\run-ios-test.bat
```

#### 4. リリース前チェックリストの確認
**Cursorが実行:**
- `RELEASE_CHECKLIST.md`の各項目を確認
- 未完了項目の実装
- ドキュメント更新

**ユーザーが確認:**
- デバッグモードの動作確認
- UI/UXの確認
- ブラウザ互換性の確認

#### 5. ドキュメント更新
**Cursorが実行:**
- `README.md`の更新
- 実装状況の記録
- テスト結果の記録

---

## 📋 実行コマンド（コピペ用）

### コードチェック（Cursorが実行中）
```powershell
cd "C:\Users\susam\Downloads\新しいフォルダー\docs\primal-logic-app\primal-logic-web"
npm run lint
npx tsc --noEmit
```

### Visual Regression Test（Cursorが実行中）
```powershell
cd "C:\Users\susam\Downloads\新しいフォルダー\docs\primal-logic-app\primal-logic-web"
npm run test:visual
```

### E2Eテスト（全テスト）
```powershell
cd "C:\Users\susam\Downloads\新しいフォルダー\docs\primal-logic-app\primal-logic-web"
npm test
```

### iOS版テスト（Maestro）
```powershell
cd "C:\Users\susam\Downloads\新しいフォルダー\docs\primal-logic-app"
.\start-ios-app.bat
# 別のターミナルで:
.\run-ios-test.bat
```

---

## 🔍 確認項目

### Visual Regression Testの失敗原因
1. **Firefoxのタイムアウト**: `page.reload()`が30秒でタイムアウト
   - **修正**: `waitUntil: 'domcontentloaded'`に変更済み ✅
2. **セレクタの問題**: ナトリウムゲージ、ButcherSelectのセレクタ
   - **修正**: より堅牢なセレクタに変更済み ✅

### コード品質
- Lintエラー: 確認中
- 型エラー: 確認中

### リリース前チェックリスト
- [ ] デバッグモードの動作確認
- [ ] 機能の動作確認
- [ ] UI/UXの確認
- [ ] パフォーマンスの確認
- [ ] セキュリティの確認
- [ ] ブラウザ互換性の確認
- [ ] テストの確認
- [ ] ドキュメントの確認

---

## 🚀 優先順位

1. **最優先**: コード品質チェック（Lint、型チェック）
2. **高優先**: Visual Regression Testの失敗修正
3. **中優先**: iOS版テストの実行
4. **中優先**: リリース前チェックリストの確認
5. **低優先**: ドキュメント更新

---

最終更新: 2026-01-03

