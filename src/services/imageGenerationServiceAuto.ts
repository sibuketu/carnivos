/**
 * 画像生成サービス（自動化版 - 無料API使用）
 *
 * Replicate API（Stable Diffusion）を使用して自動生成
 * 無料枠あり、API経由で完全自動化可能
 */

import { logError } from '../utils/errorHandler';

const REPLICATE_API_TOKEN = import.meta.env.VITE_REPLICATE_API_TOKEN;

/**
 * Replicate API（Stable Diffusion）で画像を自動生成
 *
 * @param prompt 画像生成プロンプト
 * @returns 生成された画像のURL
 */
export async function generateImageAuto(prompt: string): Promise<string> {
  if (!REPLICATE_API_TOKEN) {
    throw new Error(
      'Replicate APIトークンが設定されていません。\n' +
        'VITE_REPLICATE_API_TOKEN を .env ファイルに設定してください。\n\n' +
        '取得方法:\n' +
        '1. https://replicate.com/ でアカウント作成（無料）\n' +
        '2. https://replicate.com/account/api-tokens でAPIトークンを取得\n' +
        '3. .envファイルに追加: VITE_REPLICATE_API_TOKEN=r8_...'
    );
  }

  try {
    if (import.meta.env.DEV) void 0;

    // Replicate APIでStable Diffusionを実行
    const response = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Token ${REPLICATE_API_TOKEN}`,
      },
      body: JSON.stringify({
        version: 'db21e45d3f7023abc2a46ee38a23973f6dce16bb082a930b0c49861f96d1e5bf', // stable-diffusion-2.1
        input: {
          prompt: prompt,
          width: 1024,
          height: 1024,
          num_outputs: 1,
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `画像生成に失敗しました: ${response.status} ${response.statusText}\n` +
          `${errorData.error || JSON.stringify(errorData)}`
      );
    }

    const prediction = await response.json();
    const predictionId = prediction.id;

    // 生成が完了するまで待機（ポーリング）
    let result = prediction;
    while (result.status === 'starting' || result.status === 'processing') {
      await new Promise((resolve) => setTimeout(resolve, 1000)); // 1秒待機

      const statusResponse = await fetch(
        `https://api.replicate.com/v1/predictions/${predictionId}`,
        {
          headers: {
            Authorization: `Token ${REPLICATE_API_TOKEN}`,
          },
        }
      );

      result = await statusResponse.json();
    }

    if (result.status === 'succeeded' && result.output && result.output.length > 0) {
      const imageUrl = result.output[0];
      if (import.meta.env.DEV) void 0;
      return imageUrl;
    } else {
      throw new Error(`画像生成に失敗しました: ${result.error || '不明なエラー'}`);
    }
  } catch (error) {
    logError(error, { component: 'imageGenerationServiceAuto', action: 'generateImageAuto' });
    throw error;
  }
}

/**
 * アプリアイコンを自動生成（Replicate API使用）
 */
export async function generateAppIconAuto(
  style: 1 | 2 | 3,
  variation: 1 | 2 | 3 | 4 = 1
): Promise<string> {
  const prompt = getAppIconPrompt(style, variation);
  return generateImageAuto(prompt);
}

/**
 * 複数のアプリアイコンを一括自動生成（10個）
 */
export async function generateMultipleAppIconsAuto(): Promise<
  Array<{ style: number; variation: number; url: string }>
> {
  const results: Array<{ style: number; variation: number; url: string }> = [];

  // スタイル1: 4バリエーション
  for (let v = 1; v <= 4; v++) {
    try {
      const url = await generateAppIconAuto(1, v as 1 | 2 | 3 | 4);
      results.push({ style: 1, variation: v, url });
      await new Promise((resolve) => setTimeout(resolve, 2000)); // APIレート制限対策
    } catch (error) {
      logError(error, {
        component: 'imageGenerationServiceAuto',
        action: 'generateMultipleAppIconsAuto',
        style: 1,
        variation: v,
      });
    }
  }

  // スタイル2: 3バリエーション
  for (let v = 1; v <= 3; v++) {
    try {
      const url = await generateAppIconAuto(2, v as 1 | 2 | 3);
      results.push({ style: 2, variation: v, url });
      await new Promise((resolve) => setTimeout(resolve, 2000));
    } catch (error) {
      logError(error, {
        component: 'imageGenerationServiceAuto',
        action: 'generateMultipleAppIconsAuto',
        style: 2,
        variation: v,
      });
    }
  }

  // スタイル3: 3バリエーション
  for (let v = 1; v <= 3; v++) {
    try {
      const url = await generateAppIconAuto(3, v as 1 | 2 | 3);
      results.push({ style: 3, variation: v, url });
      await new Promise((resolve) => setTimeout(resolve, 2000));
    } catch (error) {
      logError(error, {
        component: 'imageGenerationServiceAuto',
        action: 'generateMultipleAppIconsAuto',
        style: 3,
        variation: v,
      });
    }
  }

  return results;
}

/**
 * アプリアイコンのプロンプトを取得（共通関数）
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
      'Create a modern app icon combining "logic" and "meat" concepts for "CarnivoreGuid" app. Square format (1024x1024px), geometric brain and meat icon side by side, style: Modern geometric clean, colors: Cool blues (logic) + warm reds (meat), no text, recognizable at 16x1024px, rounded corners, app icon style.',
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
