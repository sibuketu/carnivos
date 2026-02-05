/**
 * 画像生成サービス（無料版 - プロンプト生成のみ）
 *
 * 実際の画像生成は外部サービスで手動実行
 * 将来的に無料API（Replicate等）を統合可能
 */

import { logError } from '../utils/errorHandler';

// 注意: DALL·E 3は有料のため、現在はプロンプト生成のみ
// 実際の画像生成は手動で行うか、無料APIを使用

/**
 * 画像生成プロンプトを生成（無料版）
 *
 * 実際の画像生成は手動で行うか、無料APIサービスを使用してください
 *
 * @param prompt 画像生成プロンプト
 * @param size 画像サイズ（デフォルト: "1024x1024"）
 * @returns プロンプト文字列（画像URLではない）
 */
export async function generateImage(
  prompt: string,
  _size: '1024x1024' | '1792x1024' | '1024x1792' = '1024x1024'
): Promise<string> {
  if (import.meta.env.DEV) void 0;

  if (navigator.clipboard) {
    try {
      await navigator.clipboard.writeText(prompt);
      if (import.meta.env.DEV) void 0;
    } catch (err) {
      logError(err, {
        component: 'imageGenerationService',
        action: 'generateImage',
        step: 'copyToClipboard',
      });
    }
  }

  // エラーをスローして、UI側で手動生成を案内
  throw new Error(
    `💰 画像生成は有料APIのため、現在は自動生成できません。\n\n` +
      `📋 生成されたプロンプト: ${prompt}\n\n` +
      `✅ 以下の無料サービスで手動生成してください:\n` +
      `- Replicate (Stable Diffusion): https://replicate.com/\n` +
      `- Hugging Face: https://huggingface.co/spaces/stabilityai/stable-diffusion\n` +
      `- Craiyon: https://www.craiyon.com/\n\n` +
      `（プロンプトはクリップボードにコピーされています）`
  );
}

/**
 * アプリアイコンを生成
 *
 * @param style アイコンのスタイル（1: ミートアイコン、2: 論理+肉、3: C文字+肉）
 * @param variation バリエーション番号（1-4）
 * @returns 生成された画像のURL
 */
export async function generateAppIcon(
  style: 1 | 2 | 3,
  variation: 1 | 2 | 3 | 4 = 1
): Promise<string> {
  const prompt = getAppIconPrompt(style, variation);
  return generateImage(prompt, '1024x1024');
}

/**
 * アプリアイコンのプロンプトを取得（内部関数）
 */
function getAppIconPrompt(style: 1 | 2 | 3, variation: 1 | 2 | 3 | 4): string {
  const prompts = {
    1: [
      'Create a simple, modern app icon for a carnivore diet app called "CarnivoreGuid". Square format (1024x1024px), geometric abstract meat shape, style: Modern clean minimalist, colors: Warm reds and browns, no text, bold clear silhouette recognizable at 16x16px, rounded corners, app icon style.',
      'Create a simple, modern app icon for a carnivore diet app called "CarnivoreGuid". Square format (1024x1024px), realistic but simplified steak silhouette, style: Modern clean minimalist, colors: Warm reds and browns, no text, bold clear silhouette recognizable at 16x16px, rounded corners, app icon style.',
      'Create a simple, modern app icon for a carnivore diet app called "CarnivoreGuid". Square format (1024x1024px), minimalist meat cut outline, style: Modern clean minimalist, colors: Warm reds and browns, no text, bold clear silhouette recognizable at 16x16px, rounded corners, app icon style.',
      'Create a simple, modern app icon for a carnivore diet app called "CarnivoreGuid". Square format (1024x1024px), bold flat design meat icon, style: Modern clean minimalist, colors: Warm reds and browns, no text, bold clear silhouette recognizable at 16x16px, rounded corners, app icon style.',
    ],
    2: [
      'Create a modern app icon combining "logic" and "meat" concepts for "CarnivoreGuid" app. Square format (1024x1024px), brain icon with meat texture inside, style: Modern geometric clean, colors: Cool blues (logic) + warm reds (meat), no text, recognizable at 16x16px, rounded corners, app icon style.',
      'Create a modern app icon combining "logic" and "meat" concepts for "CarnivoreGuid" app. Square format (1024x1024px), meat cut with logic/circuit pattern overlay, style: Modern geometric clean, colors: Cool blues (logic) + warm reds (meat), no text, recognizable at 16x16px, rounded corners, app icon style.',
      'Create a modern app icon combining "logic" and "meat" concepts for "CarnivoreGuid" app. Square format (1024x1024px), geometric brain and meat icon side by side, style: Modern geometric clean, colors: Cool blues (logic) + warm reds (meat), no text, recognizable at 16x16px, rounded corners, app icon style.',
    ],
    3: [
      'Create a modern app icon featuring the letter "C" (for Carnivore) combined with a meat element for "CarnivoreGuid" app. Square format (1024x1024px), bold sans-serif "C" with meat icon inside, style: Modern bold typography + icon, colors: Strong vibrant colors (reds, oranges), "C" prominent and readable at small sizes, rounded corners, app icon style.',
      'Create a modern app icon featuring the letter "C" (for Carnivore) combined with a meat element for "CarnivoreGuid" app. Square format (1024x1024px), "C" made of meat texture/pattern, style: Modern bold typography + icon, colors: Strong vibrant colors (reds, oranges), "C" prominent and readable at small sizes, rounded corners, app icon style.',
      'Create a modern app icon featuring the letter "C" (for Carnivore) combined with a meat element for "CarnivoreGuid" app. Square format (1024x1024px), meat icon replacing part of the "C" letter, style: Modern bold typography + icon, colors: Strong vibrant colors (reds, oranges), "C" prominent and readable at small sizes, rounded corners, app icon style.',
    ],
  };

  const stylePrompts = prompts[style];
  const index = Math.min(variation - 1, stylePrompts.length - 1);
  return stylePrompts[index];
}

/**
 * 複数のアプリアイコンプロンプトを一括生成（10個程度）
 *
 * 無料版: プロンプトを生成するだけ。実際の画像生成は手動で行う
 *
 * @returns プロンプトの配列（エラーをスローしてプロンプトを表示）
 */
export async function generateMultipleAppIcons(): Promise<
  Array<{ style: number; variation: number; url: string }>
> {
  // 無料版: すべてのプロンプトをまとめて表示
  const allPrompts: Array<{ style: number; variation: number; prompt: string }> = [];

  // スタイル1: 4バリエーション
  for (let v = 1; v <= 4; v++) {
    const prompt = getAppIconPrompt(1, v as 1 | 2 | 3 | 4);
    allPrompts.push({ style: 1, variation: v, prompt });
  }

  // スタイル2: 3バリエーション
  for (let v = 1; v <= 3; v++) {
    const prompt = getAppIconPrompt(2, v as 1 | 2 | 3);
    allPrompts.push({ style: 2, variation: v, prompt });
  }

  // スタイル3: 3バリエーション
  for (let v = 1; v <= 3; v++) {
    const prompt = getAppIconPrompt(3, v as 1 | 2 | 3);
    allPrompts.push({ style: 3, variation: v, prompt });
  }

  // すべてのプロンプトをクリップボードにコピー
  const promptsText = allPrompts
    .map(
      (p, idx) => `${idx + 1}. スタイル${p.style} - バリエーション${p.variation}:\n${p.prompt}\n`
    )
    .join('\n');

  if (navigator.clipboard) {
    try {
      await navigator.clipboard.writeText(promptsText);
    } catch (err) {
      logError(err, {
        component: 'imageGenerationService',
        action: 'generateMultipleAppIcons',
        step: 'copyToClipboard',
      });
    }
  }

  // エラーとしてプロンプトを返す（UI側で表示）
  throw new Error(
    `💰 画像生成は有料APIのため、現在は自動生成できません。\n\n` +
      `📋 以下の10個のプロンプトがクリップボードにコピーされました:\n\n` +
      promptsText +
      `\n✅ 無料で画像生成する方法:\n` +
      `1. Replicate (Stable Diffusion): https://replicate.com/\n` +
      `   - 無料枠あり、高品質\n` +
      `2. Hugging Face: https://huggingface.co/spaces/stabilityai/stable-diffusion\n` +
      `   - 完全無料\n` +
      `3. Craiyon: https://www.craiyon.com/\n` +
      `   - 完全無料\n\n` +
      `上記のサービスにプロンプトを貼り付けて、10個の画像を生成してください。`
  );
}

/**
 * SNS投稿用の画像を生成
 *
 * @param prompt 画像生成プロンプト
 * @returns 生成された画像のURL
 */
export async function generateSNSImage(prompt: string): Promise<string> {
  const enhancedPrompt = `Create a social media post image for a carnivore diet app. ${prompt} Style: Modern, engaging, Instagram/Twitter optimized, 1024x1024px, high quality, vibrant colors.`;
  return generateImage(enhancedPrompt, '1024x1024');
}
