/**
 * Cursorの会話履歴をObsidianにエクスポートするスクリプト
 * 
 * 使用方法:
 * npx tsx scripts/exportCursorChatToObsidian.ts
 * 
 * 出力先:
 * docs/second-brain/chat-logs/
 */

import * as fs from 'fs';
import * as path from 'path';
import initSqlJs, { Database as SqlJsDatabase } from 'sql.js';

// 設定
const CONFIG = {
  // Cursorのワークスペースストレージパス
  workspaceStoragePath: path.join(
    process.env.APPDATA || '',
    'Cursor',
    'User',
    'workspaceStorage'
  ),
  // primal-logic-webのワークスペースID
  workspaceId: 'c3aea3cc222d6af95608d683535cf0cb',
  // Obsidianの出力先
  obsidianOutputPath: path.join(
    process.cwd(),
    '..',
    '..',
    'second-brain',
    'chat-logs'
  ),
};

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: number;
}

interface ChatSession {
  id: string;
  title?: string;
  messages: ChatMessage[];
  createdAt?: number;
  updatedAt?: number;
}

/**
 * state.vscdbから会話履歴を抽出
 */
async function extractChatHistory(): Promise<ChatSession[]> {
  const dbPath = path.join(
    CONFIG.workspaceStoragePath,
    CONFIG.workspaceId,
    'state.vscdb'
  );

  if (!fs.existsSync(dbPath)) {
    throw new Error(`データベースが見つかりません: ${dbPath}`);
  }

  console.log(`📂 データベースを開いています: ${dbPath}`);

  // sql.jsを初期化
  const SQL = await initSqlJs();
  
  // データベースをコピーして読み取り（ロックを避けるため）
  const tempDbPath = path.join(process.cwd(), 'temp_state.vscdb');
  fs.copyFileSync(dbPath, tempDbPath);
  
  const fileBuffer = fs.readFileSync(tempDbPath);
  const db: SqlJsDatabase = new SQL.Database(fileBuffer);
  const sessions: ChatSession[] = [];

  try {
    // チャットデータを取得
    const chatDataKeys = [
      'aiService.prompts',
      'workbench.panel.aichat.view.aichat.chatdata',
      'composer.composerData',
    ];

    for (const key of chatDataKeys) {
      try {
        const result = db.exec(`SELECT value FROM ItemTable WHERE key = '${key}'`);

        if (result.length > 0 && result[0].values.length > 0) {
          const value = result[0].values[0][0] as string;
          console.log(`✅ キー "${key}" からデータを取得`);
          const parsed = JSON.parse(value);
          const extractedSessions = extractSessionsFromData(parsed, key);
          sessions.push(...extractedSessions);
        }
      } catch (err) {
        console.log(`⚠️ キー "${key}" の処理中にエラー: ${(err as Error).message}`);
      }
    }

    // すべてのキーを確認（デバッグ用）
    const keyResult = db.exec(
      `SELECT key FROM ItemTable WHERE key LIKE '%chat%' OR key LIKE '%composer%' OR key LIKE '%ai%'`
    );

    if (keyResult.length > 0) {
      const allKeys = keyResult[0].values.map(v => v[0] as string);
      console.log(`\n🔍 関連するキー一覧 (${allKeys.length}件):`);
      allKeys.slice(0, 20).forEach(k => console.log(`  - ${k}`));
      if (allKeys.length > 20) {
        console.log(`  ... 他 ${allKeys.length - 20} 件`);
      }
    }

  } finally {
    db.close();
    // 一時ファイルを削除
    try {
      fs.unlinkSync(tempDbPath);
    } catch {
      // 無視
    }
  }

  return sessions;
}

/**
 * データからセッションを抽出
 */
function extractSessionsFromData(data: unknown, source: string): ChatSession[] {
  const sessions: ChatSession[] = [];

  if (!data) return sessions;

  // データ構造に応じて処理
  if (Array.isArray(data)) {
    // 配列形式（prompts等）
    data.forEach((item, index) => {
      if (item && typeof item === 'object') {
        const session = extractSingleSession(item, `${source}-${index}`);
        if (session) sessions.push(session);
      }
    });
  } else if (typeof data === 'object') {
    // オブジェクト形式
    const obj = data as Record<string, unknown>;
    
    // tabs形式（composerData）
    if ('tabs' in obj && Array.isArray(obj.tabs)) {
      obj.tabs.forEach((tab: unknown, index: number) => {
        if (tab && typeof tab === 'object') {
          const session = extractSingleSession(tab, `${source}-tab-${index}`);
          if (session) sessions.push(session);
        }
      });
    }
    
    // conversations形式
    if ('conversations' in obj && Array.isArray(obj.conversations)) {
      obj.conversations.forEach((conv: unknown, index: number) => {
        if (conv && typeof conv === 'object') {
          const session = extractSingleSession(conv, `${source}-conv-${index}`);
          if (session) sessions.push(session);
        }
      });
    }

    // 直接セッションとして処理
    const directSession = extractSingleSession(obj, source);
    if (directSession) sessions.push(directSession);
  }

  return sessions;
}

/**
 * 単一セッションを抽出
 */
function extractSingleSession(data: Record<string, unknown>, id: string): ChatSession | null {
  const messages: ChatMessage[] = [];
  
  // メッセージ配列を探す
  const messageArrays = ['messages', 'conversation', 'bubbles', 'history'];
  
  for (const key of messageArrays) {
    if (key in data && Array.isArray(data[key])) {
      const arr = data[key] as unknown[];
      arr.forEach((msg: unknown) => {
        if (msg && typeof msg === 'object') {
          const msgObj = msg as Record<string, unknown>;
          const role = extractRole(msgObj);
          const content = extractContent(msgObj);
          
          if (role && content) {
            messages.push({
              role,
              content,
              timestamp: typeof msgObj.timestamp === 'number' ? msgObj.timestamp : undefined,
            });
          }
        }
      });
      break;
    }
  }

  if (messages.length === 0) return null;

  return {
    id,
    title: extractTitle(data, messages),
    messages,
    createdAt: typeof data.createdAt === 'number' ? data.createdAt : undefined,
    updatedAt: typeof data.updatedAt === 'number' ? data.updatedAt : undefined,
  };
}

/**
 * ロールを抽出
 */
function extractRole(msg: Record<string, unknown>): 'user' | 'assistant' | null {
  const role = msg.role || msg.type || msg.sender;
  if (typeof role !== 'string') return null;
  
  const roleLower = role.toLowerCase();
  if (roleLower.includes('user') || roleLower.includes('human')) return 'user';
  if (roleLower.includes('assistant') || roleLower.includes('ai') || roleLower.includes('bot')) return 'assistant';
  
  // 数値で判定（0=user, 1=assistant）
  if (msg.role === 0 || msg.type === 0) return 'user';
  if (msg.role === 1 || msg.type === 1) return 'assistant';
  
  return null;
}

/**
 * コンテンツを抽出
 */
function extractContent(msg: Record<string, unknown>): string | null {
  // 直接content
  if (typeof msg.content === 'string') return msg.content;
  
  // text
  if (typeof msg.text === 'string') return msg.text;
  
  // message
  if (typeof msg.message === 'string') return msg.message;
  
  // 配列形式のcontent
  if (Array.isArray(msg.content)) {
    return msg.content
      .map((c: unknown) => {
        if (typeof c === 'string') return c;
        if (c && typeof c === 'object' && 'text' in c) return (c as { text: string }).text;
        return '';
      })
      .filter(Boolean)
      .join('\n');
  }
  
  return null;
}

/**
 * タイトルを抽出
 */
function extractTitle(data: Record<string, unknown>, messages: ChatMessage[]): string {
  if (typeof data.title === 'string' && data.title) return data.title;
  if (typeof data.name === 'string' && data.name) return data.name;
  
  // 最初のユーザーメッセージから生成
  const firstUserMsg = messages.find(m => m.role === 'user');
  if (firstUserMsg) {
    const content = firstUserMsg.content.substring(0, 50);
    return content.length < firstUserMsg.content.length ? `${content}...` : content;
  }
  
  return 'Untitled Chat';
}

/**
 * セッションをMarkdownに変換
 */
function sessionToMarkdown(session: ChatSession): string {
  const date = session.createdAt 
    ? new Date(session.createdAt).toISOString().split('T')[0]
    : new Date().toISOString().split('T')[0];
  
  const frontmatter = `---
tags: [Log, Cursor, Carnivore]
aliases: [${date}_CursorLog_${session.id}]
created: ${session.createdAt ? new Date(session.createdAt).toISOString() : 'unknown'}
---

`;

  const title = `# ${session.title || 'Cursor Chat'}\n\n`;
  
  const messages = session.messages.map(msg => {
    const roleLabel = msg.role === 'user' ? '## 👤 ユーザー' : '## 🤖 アシスタント';
    return `${roleLabel}\n\n${msg.content}\n`;
  }).join('\n---\n\n');

  return frontmatter + title + messages;
}

/**
 * Obsidianに保存
 */
function saveToObsidian(sessions: ChatSession[]): void {
  const outputDir = CONFIG.obsidianOutputPath;
  
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
    console.log(`📁 ディレクトリを作成: ${outputDir}`);
  }

  let savedCount = 0;
  
  sessions.forEach((session, index) => {
    const date = session.createdAt 
      ? new Date(session.createdAt).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0];
    
    const filename = `${date}_chat_${index + 1}.md`;
    const filepath = path.join(outputDir, filename);
    
    const markdown = sessionToMarkdown(session);
    fs.writeFileSync(filepath, markdown, 'utf-8');
    savedCount++;
    console.log(`  ✅ ${filename} (${session.messages.length}メッセージ)`);
  });

  console.log(`\n📝 ${savedCount}件のチャットをObsidianに保存しました`);
  console.log(`📂 保存先: ${outputDir}`);
}

/**
 * すべてのキーをダンプ（デバッグ用）
 */
async function dumpAllKeys(): Promise<void> {
  const dbPath = path.join(
    CONFIG.workspaceStoragePath,
    CONFIG.workspaceId,
    'state.vscdb'
  );

  const SQL = await initSqlJs();
  const tempDbPath = path.join(process.cwd(), 'temp_state.vscdb');
  fs.copyFileSync(dbPath, tempDbPath);

  const fileBuffer = fs.readFileSync(tempDbPath);
  const db: SqlJsDatabase = new SQL.Database(fileBuffer);

  try {
    const result = db.exec(`SELECT key FROM ItemTable`);
    
    if (result.length > 0) {
      const keys = result[0].values.map(v => v[0] as string);
      console.log(`\n📋 全キー一覧 (${keys.length}件):\n`);
      keys.forEach(k => console.log(k));
    }
    
  } finally {
    db.close();
    fs.unlinkSync(tempDbPath);
  }
}

// メイン処理
async function main() {
  console.log('🚀 Cursor会話履歴エクスポートを開始...\n');
  
  try {
    // デバッグモード
    if (process.argv.includes('--debug')) {
      await dumpAllKeys();
      return;
    }

    const sessions = await extractChatHistory();
    
    if (sessions.length === 0) {
      console.log('⚠️ 会話履歴が見つかりませんでした');
      console.log('\n💡 ヒント: --debug オプションでキー一覧を確認できます');
      return;
    }

    console.log(`\n📊 ${sessions.length}件の会話セッションを発見\n`);
    
    saveToObsidian(sessions);
    
  } catch (error) {
    console.error('❌ エラー:', error);
    process.exit(1);
  }
}

main();
