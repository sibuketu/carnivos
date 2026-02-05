/**
 * Cursorの会話履歴をObsidianにエクスポートするスクリプト
 * 
 * 使用方法:
 * node scripts/exportCursorChat.mjs
 * node scripts/exportCursorChat.mjs --debug
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import initSqlJs from 'sql.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 設定
const CONFIG = {
  workspaceStoragePath: path.join(
    process.env.APPDATA || '',
    'Cursor',
    'User',
    'workspaceStorage'
  ),
  workspaceId: 'c3aea3cc222d6af95608d683535cf0cb',
  obsidianOutputPath: path.join(__dirname, '..', '..', '..', 'second-brain', 'chat-logs'),
};

/**
 * state.vscdbから会話履歴を抽出
 */
async function extractChatHistory() {
  const dbPath = path.join(CONFIG.workspaceStoragePath, CONFIG.workspaceId, 'state.vscdb');

  if (!fs.existsSync(dbPath)) {
    throw new Error(`データベースが見つかりません: ${dbPath}`);
  }

  console.log(`📂 データベースを開いています: ${dbPath}`);

  const SQL = await initSqlJs();
  const tempDbPath = path.join(process.cwd(), 'temp_state.vscdb');
  fs.copyFileSync(dbPath, tempDbPath);
  
  const fileBuffer = fs.readFileSync(tempDbPath);
  const db = new SQL.Database(fileBuffer);
  const sessions = [];

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
          const value = result[0].values[0][0];
          console.log(`✅ キー "${key}" からデータを取得`);
          const parsed = JSON.parse(value);
          const extractedSessions = extractSessionsFromData(parsed, key);
          sessions.push(...extractedSessions);
        }
      } catch (err) {
        console.log(`⚠️ キー "${key}" の処理中にエラー: ${err.message}`);
      }
    }

    // 関連するキーを確認
    const keyResult = db.exec(
      `SELECT key FROM ItemTable WHERE key LIKE '%chat%' OR key LIKE '%composer%' OR key LIKE '%ai%'`
    );

    if (keyResult.length > 0) {
      const allKeys = keyResult[0].values.map(v => v[0]);
      console.log(`\n🔍 関連するキー一覧 (${allKeys.length}件):`);
      allKeys.slice(0, 20).forEach(k => console.log(`  - ${k}`));
      if (allKeys.length > 20) console.log(`  ... 他 ${allKeys.length - 20} 件`);
    }

  } finally {
    db.close();
    try { fs.unlinkSync(tempDbPath); } catch { /* ignore */ }
  }

  return sessions;
}

function extractSessionsFromData(data, source) {
  const sessions = [];
  if (!data) return sessions;

  if (Array.isArray(data)) {
    data.forEach((item, index) => {
      if (item && typeof item === 'object') {
        const session = extractSingleSession(item, `${source}-${index}`);
        if (session) sessions.push(session);
      }
    });
  } else if (typeof data === 'object') {
    if (data.tabs && Array.isArray(data.tabs)) {
      data.tabs.forEach((tab, index) => {
        if (tab && typeof tab === 'object') {
          const session = extractSingleSession(tab, `${source}-tab-${index}`);
          if (session) sessions.push(session);
        }
      });
    }
    if (data.conversations && Array.isArray(data.conversations)) {
      data.conversations.forEach((conv, index) => {
        if (conv && typeof conv === 'object') {
          const session = extractSingleSession(conv, `${source}-conv-${index}`);
          if (session) sessions.push(session);
        }
      });
    }
    const directSession = extractSingleSession(data, source);
    if (directSession) sessions.push(directSession);
  }

  return sessions;
}

function extractSingleSession(data, id) {
  const messages = [];
  const messageArrays = ['messages', 'conversation', 'bubbles', 'history'];
  
  for (const key of messageArrays) {
    if (data[key] && Array.isArray(data[key])) {
      for (const msg of data[key]) {
        if (msg && typeof msg === 'object') {
          const role = extractRole(msg);
          const content = extractContent(msg);
          if (role && content) {
            messages.push({ role, content, timestamp: msg.timestamp });
          }
        }
      }
      break;
    }
  }

  if (messages.length === 0) return null;

  return {
    id,
    title: extractTitle(data, messages),
    messages,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  };
}

function extractRole(msg) {
  const role = msg.role || msg.type || msg.sender;
  if (typeof role === 'string') {
    const r = role.toLowerCase();
    if (r.includes('user') || r.includes('human')) return 'user';
    if (r.includes('assistant') || r.includes('ai') || r.includes('bot')) return 'assistant';
  }
  if (msg.role === 0 || msg.type === 0) return 'user';
  if (msg.role === 1 || msg.type === 1) return 'assistant';
  return null;
}

function extractContent(msg) {
  if (typeof msg.content === 'string') return msg.content;
  if (typeof msg.text === 'string') return msg.text;
  if (typeof msg.message === 'string') return msg.message;
  if (Array.isArray(msg.content)) {
    return msg.content
      .map(c => (typeof c === 'string' ? c : c?.text || ''))
      .filter(Boolean)
      .join('\n');
  }
  return null;
}

function extractTitle(data, messages) {
  if (data.title) return data.title;
  if (data.name) return data.name;
  const firstUserMsg = messages.find(m => m.role === 'user');
  if (firstUserMsg) {
    const content = firstUserMsg.content.substring(0, 50);
    return content.length < firstUserMsg.content.length ? `${content}...` : content;
  }
  return 'Untitled Chat';
}

function sessionToMarkdown(session) {
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

function saveToObsidian(sessions) {
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

async function dumpAllKeys() {
  const dbPath = path.join(CONFIG.workspaceStoragePath, CONFIG.workspaceId, 'state.vscdb');

  const SQL = await initSqlJs();
  const tempDbPath = path.join(process.cwd(), 'temp_state.vscdb');
  fs.copyFileSync(dbPath, tempDbPath);

  const fileBuffer = fs.readFileSync(tempDbPath);
  const db = new SQL.Database(fileBuffer);

  try {
    const result = db.exec(`SELECT key FROM ItemTable`);
    if (result.length > 0) {
      const keys = result[0].values.map(v => v[0]);
      console.log(`\n📋 全キー一覧 (${keys.length}件):\n`);
      keys.forEach(k => console.log(k));
    }
  } finally {
    db.close();
    fs.unlinkSync(tempDbPath);
  }
}

async function main() {
  console.log('🚀 Cursor会話履歴エクスポートを開始...\n');
  
  try {
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
