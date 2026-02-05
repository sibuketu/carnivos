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
  try {
    const results = await generateMultipleAppIcons();
    results.forEach((_result, _index) => {});
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
