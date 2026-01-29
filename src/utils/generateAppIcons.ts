/**
 * アプリアイコン生成ユーティリティ
 *
 * このスクリプトを実行して、10個のアプリアイコン候補を生成します。
 *
 * 使用方法:
 * 1. .envファイルに VITE_OPENAI_API_KEY を設定
 * 2. このファイルを実行（Node.js環境で）
 * 3. 生成された画像URLを確認
 */

import { generateMultipleAppIcons } from '../services/imageGenerationService';
import { logError } from './errorHandler';

async function main() {
  console.log('🚀 アプリアイコンの一括生成を開始します...\n');

  try {
    const results = await generateMultipleAppIcons();

    console.log('\n✅ 生成完了！\n');
    console.log('生成された画像:');
    console.log('='.repeat(60));

    results.forEach((result, index) => {
      console.log(`\n${index + 1}. スタイル${result.style} - バリエーション${result.variation}`);
      console.log(`   URL: ${result.url}`);
    });

    console.log('\n' + '='.repeat(60));
    console.log(`\n合計 ${results.length}個の画像を生成しました。`);
    console.log('各URLをブラウザで開いて、最適なものを選んでください。\n');
  } catch (error) {
    logError(error, { component: 'generateAppIcons', action: 'main' });
    process.exit(1);
  }
}

// Node.js環境で実行する場合
if (typeof window === 'undefined') {
  main();
}

// ブラウザ環境から呼び出す場合のエクスポート
export { generateMultipleAppIcons };
