# AntiGravityでObsidian（第二の脳）を共有する方法

## 方法1: プロジェクトフォルダ全体を開く（推奨）

### 手順

1. **AntiGravityのセットアップ画面で「Start fresh」を選択**
   - または「Import from Cursor」を選択（Cursorの設定を引き継ぐ）

2. **プロジェクトフォルダを開く**
   - フォルダ選択画面で、以下のパスを選択:
     ```
     C:\Users\susam\Downloads\新しいフォルダー\docs
     ```
   - これで`primal-logic-app`と`second-brain`の両方が見えます

3. **second-brainフォルダを確認**
   - 左側のファイルエクスプローラーで`second-brain`フォルダを開く
   - `.md`ファイルをクリックして編集・閲覧可能

### メリット
- プロジェクトコードとObsidianノートを同じ画面で管理
- 動的に共有（編集すると即座に反映）
- Gitで管理すれば、両方の変更を追跡可能

---

## 方法2: GitHubで管理して共有（より高度）

### 手順

1. **Obsidian Gitプラグインをインストール**
   - Obsidianで「Obsidian Git」プラグインをインストール
   - GitHubリポジトリに`second-brain`フォルダをプッシュ

2. **AntiGravityでGitHubリポジトリを開く**
   - AntiGravityでGitHubリポジトリを開く
   - `second-brain`フォルダを編集

3. **同期**
   - AntiGravityで編集 → GitHubにプッシュ
   - Obsidianで「Obsidian Git」プラグインからプル

### メリット
- バージョン管理が可能
- 複数デバイスで同期
- バックアップが自動

---

## 現在の推奨方法

### 方法1（プロジェクトフォルダ全体を開く）を推奨

**理由:**
- 設定が簡単
- プロジェクトコードとObsidianノートを同じ画面で管理
- 動的に共有（編集すると即座に反映）

**手順（さっきの画面から）:**

1. **「Start fresh」を選択**（または「Import from Cursor」）
2. **「Open Folder」または「Browse」をクリック**
3. **以下のパスを選択:**
   ```
   C:\Users\susam\Downloads\新しいフォルダー\docs
   ```
4. **「Open」をクリック**
5. **左側のファイルエクスプローラーで`second-brain`フォルダを開く**
6. **`.md`ファイルをクリックして編集・閲覧**

---

## 注意点

1. **Obsidianのリンク**: Obsidianの内部リンク（`[[ファイル名]]`）は、AntiGravityでは通常のMarkdownリンクとして表示されます
2. **プラグイン**: Obsidianのプラグイン機能（タグ、グラフビューなど）はAntiGravityでは使用できません
3. **同期**: 両方で同時に編集しないように注意（競合を避ける）

---

## 実践的な使い方

### 日常的な開発
1. **AntiGravityでプロジェクトを開く**
2. **`second-brain`フォルダを参照**（設計、アイデア、ログなど）
3. **`primal-logic-app`フォルダで開発**
4. **必要に応じて`second-brain`のノートを編集**

### ノートの編集
- AntiGravityで`.md`ファイルを開いて編集
- 保存すると即座に反映（Obsidianでも見える）
- Gitで管理すれば、変更履歴も追跡可能

---

## まとめ

**推奨: 方法1（プロジェクトフォルダ全体を開く）**

**手順:**
1. AntiGravityで「Start fresh」を選択
2. `C:\Users\susam\Downloads\新しいフォルダー\docs`を開く
3. `second-brain`フォルダを参照・編集

**メリット:**
- 設定が簡単
- 動的に共有
- プロジェクトコードとObsidianノートを同じ画面で管理

