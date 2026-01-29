# Cursor × Obsidian 連携スクリプト

## 概要

CursorのTODOリストをObsidianに自動記録するためのスクリプトです。

## セットアップ

### 1. ObsidianのVaultパスを確認

Obsidianを開き、Vaultの場所を確認してください。
- 設定（Settings）→ ファイルとリンク（Files & Links）
- 「Vaultの場所」を確認

### 2. シンボリックリンクの作成（推奨）

```powershell
# プロジェクトルートに移動
cd "C:\Users\susam\Downloads\新しいフォルダー\docs\primal-logic-app\primal-logic-web"

# シンボリックリンクを作成
New-Item -ItemType SymbolicLink -Path ".\obsidian-vault" -Target "C:\Users\susam\Documents\ObsidianVault"
```

### 3. スクリプトのパスを更新

`scripts/saveTodoToObsidian.ts` の `getObsidianVaultPath()` 関数内のパスを、実際のObsidian Vaultパスに更新してください。

### 4. Obsidianのフォルダ構造を作成

ObsidianのVault内に以下のフォルダを作成してください：
- `Daily/` - 日付ごとのTODOリストを保存

## 使用方法

### 手動実行

```bash
# TypeScriptを実行（tsxが必要）
npx tsx scripts/saveTodoToObsidian.ts
```

### package.jsonにスクリプトを追加

```json
{
  "scripts": {
    "save-todo": "tsx scripts/saveTodoToObsidian.ts"
  }
}
```

実行:
```bash
npm run save-todo
```

## 今後の改善

- [ ] CursorのTODOリストを実際に取得する機能
- [ ] 自動実行（GitHub Actions、cron等）
- [ ] 既存のTODOリストとのマージ機能
- [ ] 完了したタスクのアーカイブ機能

