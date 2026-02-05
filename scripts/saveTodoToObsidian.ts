/**
 * CursorのTODOリストをObsidianに記録するスクリプト
 * 
 * 使用方法:
 * - Cursorのターミナルで実行: `npx tsx scripts/saveTodoToObsidian.ts`
 * - または、package.jsonにスクリプトを追加して実行
 */

import * as fs from 'fs';
import * as path from 'path';

interface TodoItem {
  id: string;
  content: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
}

/**
 * ObsidianのVaultパスを取得
 * シンボリックリンクまたは直接パスを指定
 */
function getObsidianVaultPath(): string {
  // プロジェクトルートから相対パスでObsidianのVaultを参照
  // シンボリックリンクが作成されている場合: ./obsidian-vault
  // または、絶対パスを指定: C:\Users\susam\Documents\ObsidianVault

  const possiblePaths = [
    path.join(process.cwd(), 'obsidian-vault'),
    path.join(process.cwd(), '..', 'obsidian-vault'),
    'C:\\Users\\susam\\Documents\\ObsidianVault', // 実際のパスに置き換えてください
  ];

  for (const vaultPath of possiblePaths) {
    if (fs.existsSync(vaultPath)) {
      return vaultPath;
    }
  }

  throw new Error('Obsidian Vaultが見つかりません。シンボリックリンクを作成するか、パスを確認してください。');
}

/**
 * 今日の日付をYYYY-MM-DD形式で取得
 */
function getTodayDateString(): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * TODOリストをObsidianファイルに保存
 */
function saveTodoToObsidian(todos: TodoItem[]): void {
  try {
    const vaultPath = getObsidianVaultPath();
    const dailyFolder = path.join(vaultPath, 'Daily');

    // Dailyフォルダが存在しない場合は作成
    if (!fs.existsSync(dailyFolder)) {
      fs.mkdirSync(dailyFolder, { recursive: true });
    }

    const today = getTodayDateString();
    const filePath = path.join(dailyFolder, `${today}.md`);

    // 既存のファイルを読み込む（存在する場合）
    let existingContent = '';
    if (fs.existsSync(filePath)) {
      existingContent = fs.readFileSync(filePath, 'utf-8');
    }

    // TODOリストをMarkdown形式で生成
    const todoSection = `## Cursor TODOリスト (${today})

${todos.map(todo => {
      const statusIcon = {
        pending: '- [ ]',
        in_progress: '- [~]',
        completed: '- [x]',
        cancelled: '- [ ] ~~',
      }[todo.status];

      const statusText = {
        pending: '未着手',
        in_progress: '進行中',
        completed: '完了',
        cancelled: 'キャンセル',
      }[todo.status];

      const content = todo.status === 'cancelled'
        ? `~~${todo.content}~~`
        : todo.content;

      return `${statusIcon} ${content} (${statusText})`;
    }).join('\n')}

---

`;

    // 既存の内容と結合（TODOセクションを更新または追加）
    const todoSectionRegex = /## Cursor TODOリスト.*?(?=\n## |$)/s;
    let updatedContent = existingContent;

    if (todoSectionRegex.test(existingContent)) {
      // 既存のTODOセクションを置き換え
      updatedContent = existingContent.replace(todoSectionRegex, todoSection.trim());
    } else {
      // 新しいTODOセクションを追加
      updatedContent = existingContent + '\n\n' + todoSection;
    }

    // ファイルに書き込む
    fs.writeFileSync(filePath, updatedContent, 'utf-8');
    console.log(`✅ TODOリストをObsidianに保存しました: ${filePath}`);
  } catch (error) {
    console.error('❌ エラーが発生しました:', error);
    throw error;
  }
}

/**
 * CursorのTODOリストを取得
 * 
 * 取得方法（優先順位順）:
 * 1. コマンドライン引数からTODOリストを取得（JSON形式）
 * 2. second-brain/logs/daily/ から最新のTODOリストを読み込む
 * 3. デフォルトのTODOリスト（サンプル）
 */
function getCursorTodos(): TodoItem[] {
  // 方法1: コマンドライン引数から取得
  const args = process.argv.slice(2);
  if (args.length > 0) {
    try {
      const todosJson = args[0];
      const todos = JSON.parse(todosJson);
      if (Array.isArray(todos)) {
        return todos;
      }
    } catch {
      console.warn('コマンドライン引数のパースに失敗しました。デフォルトのTODOリストを使用します。');
    }
  }

  // 方法2: second-brain/logs/daily/ から最新のTODOリストを読み込む
  try {
    const secondBrainPath = path.join(process.cwd(), '..', '..', 'second-brain', 'logs', 'daily');
    if (fs.existsSync(secondBrainPath)) {
      const files = fs.readdirSync(secondBrainPath)
        .filter(file => file.endsWith('.md') && file.match(/^\d{4}-\d{2}-\d{2}\.md$/))
        .sort()
        .reverse(); // 最新のファイルを先に

      if (files.length > 0) {
        const latestFile = path.join(secondBrainPath, files[0]);
        const content = fs.readFileSync(latestFile, 'utf-8');

        // MarkdownのTODOリストをパース（🔵付きのタスクを抽出）
        // 形式: "- 1. 🔵 タスク内容" または "- [ ] タスク内容"
        const todoRegex = /[-*]\s*(?:\[([ x~])\])?\s*(?:\d+\.\s*)?(?:🔵\s*)?(.+)/g;
        const todos: TodoItem[] = [];
        let match;
        let id = 1;

        while ((match = todoRegex.exec(content)) !== null) {
          const checkbox = match[1];
          const taskContent = match[2].trim();

          // 空のタスクや「（ToDo）」のようなプレースホルダーはスキップ
          if (!taskContent || taskContent === '（ToDo）' || taskContent === '(ToDo)') {
            continue;
          }

          let status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
          if (checkbox === 'x') {
            status = 'completed';
          } else if (checkbox === '~') {
            status = 'in_progress';
          } else if (checkbox === ' ') {
            status = 'pending';
          } else {
            // 🔵付きのタスクは未完了として扱う
            status = 'pending';
          }

          todos.push({
            id: String(id++),
            content: taskContent,
            status,
          });
        }

        if (todos.length > 0) {
          console.log(`📝 second-brainから ${todos.length} 件のTODOを読み込みました`);
          return todos;
        }
      }
    }
  } catch (error) {
    console.warn('second-brainからのTODOリスト読み込みに失敗しました。', error);
  }

  // 方法3: デフォルトのTODOリスト（サンプル）
  console.log('⚠️ デフォルトのTODOリストを使用します。');
  return [
    {
      id: '1',
      content: 'AIチャット機能の改善',
      status: 'completed',
    },
    {
      id: '2',
      content: 'Obsidian連携の実装',
      status: 'in_progress',
    },
    {
      id: '3',
      content: '投資家からの返事確認',
      status: 'pending',
    },
  ];
}

// メイン処理
if (require.main === module) {
  try {
    const todos = getCursorTodos();
    saveTodoToObsidian(todos);
  } catch (error) {
    console.error('エラー:', error);
    process.exit(1);
  }
}

export { saveTodoToObsidian, getCursorTodos, getTodayDateString };

