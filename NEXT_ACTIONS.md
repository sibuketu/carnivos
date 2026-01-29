# 次のアクション（一気に色々やる）

> 作成日: 2026-01-03
> 目的: リリース前の最終確認と改善を一気に進める

---

## 🎯 同時進行タスク

### 1. ✅ Visual Regression Test（完了）
- **状態**: テストケース追加完了、実行済み
- **結果**: 33テスト中、16 passed、17 failed（主にFirefoxのタイムアウト）
- **次のアクション**: 失敗したテストの修正

### 2. ⏳ iOS版テスト（Maestro）
- **状態**: テストファイル存在確認済み
- **次のアクション**: 
  - アプリ起動確認
  - テスト実行
  - 結果確認

### 3. ⏳ コード品質チェック
- **状態**: バッチファイル作成済み
- **次のアクション**: 
  - Lintチェック実行
  - 型チェック実行
  - エラー修正

### 4. ⏳ リリース前チェックリスト
- **状態**: チェックリスト確認済み
- **次のアクション**: 
  - 各項目の確認
  - 未完了項目の実装
  - ドキュメント更新

### 5. ⏳ 未実装機能の確認
- **状態**: グリシン:メチオニン比は実装済み確認
- **次のアクション**: 
  - その他の未実装機能の確認
  - 優先度の高い機能の実装

### 6. ⏳ ドキュメント更新
- **状態**: README確認済み
- **次のアクション**: 
  - 実装状況の更新
  - テスト結果の記録
  - リリースノートの準備

---

## 📋 実行コマンド（コピペ用）

### コードチェック
**方法1: エクスプローラーから実行（推奨）**
1. エクスプローラーを開く（Windowsキー+E）
2. アドレスバーに以下を貼り付けてEnter:
   ```
   C:\Users\susam\Downloads\新しいフォルダー\docs\primal-logic-app\primal-logic-web
   ```
3. `run-code-check.bat` をダブルクリック

**方法2: PowerShellから実行**
```powershell
cd "C:\Users\susam\Downloads\新しいフォルダー\docs\primal-logic-app\primal-logic-web"
.\run-code-check.bat
```

### Visual Regression Test
```powershell
cd "C:\Users\susam\Downloads\新しいフォルダー\docs\primal-logic-app\primal-logic-web"
.\run-visual-test.bat
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
   - **修正**: `waitUntil: 'domcontentloaded'`に変更済み
2. **セレクタの問題**: ナトリウムゲージ、ButcherSelectのセレクタ
   - **修正**: より堅牢なセレクタに変更済み

### コード品質
- Lintエラー: 確認中
- 型エラー: 確認中（メモリ不足エラーが発生したため、バッチファイルで実行）

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

1. **最優先**: Visual Regression Testの失敗修正
2. **高優先**: コード品質チェック（Lint、型チェック）
3. **中優先**: iOS版テストの実行
4. **中優先**: リリース前チェックリストの確認
5. **低優先**: ドキュメント更新

---

最終更新: 2026-01-03

