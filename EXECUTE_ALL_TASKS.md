# 全タスク実行指示（一気に色々やる）

> 作成日: 2026-01-03
> **Cursorが指示しない限り、ユーザーは新しいターミナルから実行する前提でやる**

---

## 🎯 全タスク（Cursorが実行中）

### ✅ 1. コード品質チェック（Cursorが実行中）
- Lintチェック: 実行中
- 型チェック: 実行中
- エラーがあれば修正

### ✅ 2. Visual Regression Test（Cursorが実行中）
- テスト実行中（バックグラウンド）
- 失敗したテストの修正

### ✅ 3. E2Eテスト（Cursorが実行中）
- 全テスト実行中（バックグラウンド）
- 結果確認

---

## 📋 ユーザーが実行するタスク（エクスプローラーから）

### 1. iOS版テスト（Maestro）

**方法1: エクスプローラーから実行（推奨・一番簡単）**
1. エクスプローラーを開く（Windowsキー+E）
2. アドレスバーに以下を貼り付けてEnter:
   ```
   C:\Users\susam\Downloads\新しいフォルダー\docs\primal-logic-app
   ```
3. `run-all-tests-ios-simple.bat` をダブルクリック

**注意**: `.ps1`ファイルをダブルクリックするとメモ帳で開いてしまいます。必ず`.bat`ファイルをダブルクリックしてください。

**方法2: PowerShellから実行**
```powershell
cd "C:\Users\susam\Downloads\新しいフォルダー\docs\primal-logic-app"
.\start-ios-app.bat
# 別のターミナルで:
.\run-ios-test.bat
```

### 2. コードチェック確認（オプション）

**方法1: エクスプローラーから実行（推奨）**
1. エクスプローラーを開く（Windowsキー+E）
2. アドレスバーに以下を貼り付けてEnter:
   ```
   C:\Users\susam\Downloads\新しいフォルダー\docs\primal-logic-app\primal-logic-web
   ```
3. `run-code-check.bat` をダブルクリック

### 3. Visual Regression Test確認（オプション）

**方法1: エクスプローラーから実行（推奨）**
1. エクスプローラーを開く（Windowsキー+E）
2. アドレスバーに以下を貼り付けてEnter:
   ```
   C:\Users\susam\Downloads\新しいフォルダー\docs\primal-logic-app\primal-logic-web
   ```
3. `run-visual-test.bat` をダブルクリック

---

## 🔍 Cursorが実行中のタスク

1. ✅ **コード品質チェック**: Lint + 型チェック実行中
2. ✅ **Visual Regression Test**: テスト実行中（バックグラウンド）
3. ✅ **E2Eテスト**: 全テスト実行中（バックグラウンド）
4. ⏳ **リリース前チェックリストの確認**: 実行中
5. ⏳ **ドキュメント更新**: 実行中

---

## 🚀 次に何するか

### 最優先（Cursorが実行中）
1. **コード品質チェック結果の確認** - エラーがあれば修正
2. **Visual Regression Test結果の確認** - 失敗したテストの修正
3. **E2Eテスト結果の確認** - 失敗したテストの修正

### 中優先（ユーザーが実行）
4. **iOS版テスト（Maestro）** - エクスプローラーから実行

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

