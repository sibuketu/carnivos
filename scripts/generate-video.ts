#!/usr/bin/env tsx
/**
 * CarnivOS - 動画自動生成スクリプト
 *
 * ハイブリッド方式: 指定画像 + AI補完
 *
 * 使い方:
 * npm run video-generate -- --topic "フルーツ批判" --length 5min
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import Anthropic from '@anthropic-ai/sdk';

interface VideoConfig {
  topic: string;
  length: string; // "30sec" | "60sec" | "5min" | "10min"
  language: string; // "ja" | "en"
  style: string; // "educational" | "debate" | "comparison"
}

interface ScriptSection {
  timeStart: string;
  timeEnd: string;
  narration: string;
  imageType: 'specified' | 'ai-generated';
  imagePath?: string; // 指定画像の場合
  imagePrompt?: string; // AI生成の場合
}

interface VideoScript {
  title: string;
  description: string;
  sections: ScriptSection[];
}

// 環境変数チェック
function checkEnvVars() {
  const required = {
    ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
    ELEVENLABS_API_KEY: process.env.ELEVENLABS_API_KEY,
  };

  const missing = Object.entries(required)
    .filter(([_, value]) => !value)
    .map(([key]) => key);

  if (missing.length > 0) {
    console.error('❌ 必須の環境変数が設定されていません:');
    missing.forEach(key => console.error(`   - ${key}`));
    console.error('\n.env ファイルを確認してください。');
    console.error('設定方法: API_KEY_SETUP_GUIDE.md を参照');
    process.exit(1);
  }
}

/**
 * Claude APIで台本生成
 */
async function generateScript(config: VideoConfig): Promise<VideoScript> {
  console.log('📝 台本生成中...');

  const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY!,
  });

  const lengthMap: Record<string, string> = {
    '30sec': '30秒',
    '60sec': '60秒',
    '5min': '5分',
    '10min': '10分',
  };

  const prompt = `
あなたはYouTube動画の台本作成の専門家です。

【テーマ】${config.topic}
【動画の長さ】${lengthMap[config.length] || config.length}
【スタイル】${config.style === 'educational' ? '教育的解説' : config.style === 'debate' ? '論破・反論' : '比較分析'}
【言語】${config.language === 'ja' ? '日本語' : '英語'}

以下の形式でJSON形式の台本を生成してください：

{
  "title": "動画タイトル（キャッチー、50文字以内）",
  "description": "動画の説明（200文字程度）",
  "sections": [
    {
      "timeStart": "0:00",
      "timeEnd": "0:10",
      "narration": "ナレーション原稿",
      "imageType": "ai-generated" または "specified",
      "imagePrompt": "AI生成の場合の画像プロンプト（英語）",
      "imagePath": "指定画像の場合のパス（例: ./assets/apple-comparison.jpg）"
    }
  ]
}

**重要な指示**:
1. タイムスタンプは正確に（合計が指定された長さになるように）
2. ナレーションは自然で聞きやすい文章
3. 画像は「データ・グラフ」「比較写真」などはAI生成、「実物写真」は指定画像を想定
4. imageTypeで "ai-generated" を選んだ場合、imagePromptを英語で詳細に記述
5. imageTypeで "specified" を選んだ場合、imagePathに推奨パスを記載（ユーザーが後で用意）

**例**:
- "昔の果物 vs 今の果物" → imageType: "specified", imagePath: "./assets/apple-1950-vs-2026.jpg"
- "糖度グラフ" → imageType: "ai-generated", imagePrompt: "Sugar content comparison chart, 1950 vs 2026, professional data visualization"
`;

  const message = await anthropic.messages.create({
    model: 'claude-opus-4-20250514',
    max_tokens: 4096,
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
  });

  const content = message.content[0];
  if (content.type !== 'text') {
    throw new Error('Unexpected response type from Claude API');
  }

  // JSONを抽出（```json ... ``` の場合に対応）
  let jsonText = content.text;
  const jsonMatch = jsonText.match(/```json\s*([\s\S]*?)\s*```/);
  if (jsonMatch) {
    jsonText = jsonMatch[1];
  }

  const script: VideoScript = JSON.parse(jsonText);

  console.log('✅ 台本生成完了');
  console.log(`   タイトル: ${script.title}`);
  console.log(`   セクション数: ${script.sections.length}`);

  return script;
}

/**
 * 台本をファイルに保存
 */
async function saveScript(script: VideoScript, outputDir: string) {
  await fs.mkdir(outputDir, { recursive: true });

  // JSON保存
  const jsonPath = path.join(outputDir, 'script.json');
  await fs.writeFile(jsonPath, JSON.stringify(script, null, 2));
  console.log(`✅ 台本保存: ${jsonPath}`);

  // テキスト版も保存（読みやすい形式）
  const textPath = path.join(outputDir, 'script.txt');
  let textContent = `# ${script.title}\n\n${script.description}\n\n---\n\n`;

  script.sections.forEach((section, i) => {
    textContent += `## [${section.timeStart} - ${section.timeEnd}]\n\n`;
    textContent += `**ナレーション**:\n${section.narration}\n\n`;
    textContent += `**画像**:\n`;
    if (section.imageType === 'ai-generated') {
      textContent += `- AI生成: ${section.imagePrompt}\n`;
    } else {
      textContent += `- 指定画像: ${section.imagePath}\n`;
      textContent += `  ※ このパスに画像を用意してください\n`;
    }
    textContent += '\n---\n\n';
  });

  await fs.writeFile(textPath, textContent);
  console.log(`✅ テキスト版保存: ${textPath}`);
}

/**
 * 次のステップを表示
 */
function showNextSteps(outputDir: string) {
  console.log('\n🎉 台本生成完了！\n');
  console.log('📂 出力ディレクトリ:');
  console.log(`   ${outputDir}\n`);
  console.log('📋 次のステップ:\n');
  console.log('1. script.txt を確認');
  console.log('2. 指定画像（imageType: "specified"）を用意');
  console.log('   → ./assets/ に配置\n');
  console.log('3. 音声生成（実装予定）:');
  console.log('   npm run video-audio -- --script ${outputDir}/script.json\n');
  console.log('4. 画像生成（実装予定）:');
  console.log('   npm run video-images -- --script ${outputDir}/script.json\n');
  console.log('5. 動画合成（実装予定）:');
  console.log('   npm run video-compose -- --script ${outputDir}/script.json\n');
  console.log('💡 現在は台本生成のみ実装されています。');
  console.log('   音声・画像・合成機能は順次実装予定です。\n');
}

/**
 * メイン処理
 */
async function main() {
  console.log('🎬 CarnivOS 動画自動生成\n');

  // 環境変数チェック
  checkEnvVars();

  // コマンドライン引数解析
  const args = process.argv.slice(2);
  const config: VideoConfig = {
    topic: args.find(arg => arg.startsWith('--topic='))?.split('=')[1] || 'フルーツ批判',
    length: args.find(arg => arg.startsWith('--length='))?.split('=')[1] || '5min',
    language: args.find(arg => arg.startsWith('--lang='))?.split('=')[1] || 'ja',
    style: args.find(arg => arg.startsWith('--style='))?.split('=')[1] || 'educational',
  };

  console.log('⚙️  設定:');
  console.log(`   テーマ: ${config.topic}`);
  console.log(`   長さ: ${config.length}`);
  console.log(`   言語: ${config.language}`);
  console.log(`   スタイル: ${config.style}\n`);

  // 台本生成
  const script = await generateScript(config);

  // 出力ディレクトリ作成
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const outputDir = path.join(process.cwd(), 'video-output', `${config.topic}_${timestamp}`);

  // 保存
  await saveScript(script, outputDir);

  // 次のステップ表示
  showNextSteps(outputDir);
}

main().catch((error) => {
  console.error('❌ エラー:', error.message);
  process.exit(1);
});
