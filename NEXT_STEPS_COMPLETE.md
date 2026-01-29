# 次のステップ（全部指示）

> 作成日: 2026-01-03
> **Cursorが指示しない限り、ユーザーは新しいターミナルから実行する前提でやる**

---

## ✅ 完了した作業

1. **Visual Regression Testの追加** - 完了
2. **グリシン:メチオニン比の表示追加** - 完了
3. **Rulesの前提明確化** - 完了
4. **Visual Regression Testのセレクタ改善** - 完了

---

## 🎯 全タスク（Cursorが実行中）

### 1. ✅ コード品質チェック（Cursorが実行中）
- Lintチェック: 実行中
- 型チェック: 実行中
- エラーがあれば修正

### 2. ✅ Visual Regression Test（Cursorが実行中）
- テスト実行中（バックグラウンド）
- 失敗したテストの修正

### 3. ✅ E2Eテスト（Cursorが実行中）
- 全テスト実行中（バックグラウンド）
- 結果確認

### 4. ⏳ リリース前チェックリストの確認（Cursorが実行中）
- 各項目の確認
- 未完了項目の実装
- ドキュメント更新

### 5. ⏳ ドキュメント更新（Cursorが実行中）
- READMEの更新（グリシン:メチオニン比を追加済み）
- 実装状況の記録
- テスト結果の記録

---

## 📋 ユーザーが実行するタスク（エクスプローラーから）

### iOS版テスト（Maestro）

**方法1: エクスプローラーから実行（推奨・一番簡単）**
1. エクスプローラーを開く（Windowsキー+E）
2. アドレスバーに以下を貼り付けてEnter:
   ```
   C:\Users\susam\Downloads\新しいフォルダー\docs\primal-logic-app
   ```
3. `run-all-tests-ios-simple.bat` をダブルクリック

**注意**: `.ps1`ファイルをダブルクリックするとメモ帳で開いてしまいます。必ず`.bat`ファイルをダブルクリックしてください。

**方法2: PowerShellから実行**
1. 新しいPowerShellを開く（Windowsキー → 「PowerShell」と入力 → Enter）
2. 以下をコピペして実行:
```powershell
cd "C:\Users\susam\Downloads\新しいフォルダー\docs\primal-logic-app"
.\start-ios-app.bat
```
3. 別のPowerShellを開いて以下を実行:
```powershell
cd "C:\Users\susam\Downloads\新しいフォルダー\docs\primal-logic-app"
.\run-ios-test.bat
```

---

## 🚀 次に何するか

### 最優先（Cursorが実行中）
1. **コード品質チェック結果の確認** - エラーがあれば修正
2. **Visual Regression Test結果の確認** - 失敗したテストの修正
3. **E2Eテスト結果の確認** - 失敗したテストの修正

### 中優先（ユーザーが実行）
4. **iOS版テスト（Maestro）** - エクスプローラーから実行（上記参照）

### 低優先（Cursorが実行中）
5. **リリース前チェックリストの確認** - 各項目の確認
6. **ドキュメント更新** - README、実装状況の更新

---

## 📝 前提の確認

- ✅ **Cursorはターミナル操作できる**（`run_terminal_cmd`ツール使用）
- ✅ **Cursorが指示しない限り、ユーザーは新しいターミナルから実行する前提でやる**
- ✅ **エクスプローラーから実行する方法が一番簡単**（バッチファイルをダブルクリック）

---

最終更新: 2026-01-03

