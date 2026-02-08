/**
 * CarnivOS - Runway API Integration
 *
 * Runway APIを使用して動画を生成
 * API仕様: https://docs.runwayml.com/ (要確認)
 */

import type { VideoScript } from './videoGeneration';
import { logError } from '../utils/errorHandler';

const RUNWAY_API_KEY = import.meta.env.VITE_RUNWAY_API_KEY;
// Runway ML API エンドポイント
// 公式ドキュメント: https://docs.runwayml.com/
// 実際のAPIエンドポイントは公式ドキュメントで確認してください
const RUNWAY_API_URL = 'https://api.runwayml.com/v1';

export interface RunwayVideoRequest {
  prompt: string; // スクリプトから生成したプロンプト
  duration?: number;
  aspect_ratio?: '16:9' | '9:16' | '1:1';
}

export interface RunwayVideoResponse {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  output?: string[]; // 動画URLの配列
  error?: string;
}

/**
 * Runway APIを使用して動画を生成
 */
export async function generateVideoWithRunway(script: VideoScript): Promise<string> {
  if (!RUNWAY_API_KEY) {
    throw new Error('VITE_RUNWAY_API_KEY is not set');
  }

  // スクリプトからプロンプトを生成（完全実装版）
  // タイトル、説明、スクリプトの最初の部分を組み合わせてプロンプトを作成
  const scriptPreview = script.script.substring(0, 500);
  const prompt = `${script.title}. ${script.description || ''}. ${scriptPreview}`.trim();

  // プラットフォームに応じてアスペクト比を決定
  const aspectRatioMap: Record<string, '16:9' | '9:16' | '1:1'> = {
    youtube: '16:9',
    tiktok: '9:16',
    instagram: script.duration <= 60 ? '9:16' : '1:1', // ショート動画は9:16、ロング動画は1:1
  };

  const aspectRatio = script.platform ? aspectRatioMap[script.platform] || '16:9' : '16:9'; // デフォルトは16:9（YouTube用）

  const request: RunwayVideoRequest = {
    prompt,
    duration: script.duration,
    aspect_ratio: aspectRatio,
  };

  try {
    // Step 1: 動画生成リクエストを送信
    const response = await fetch(`${RUNWAY_API_URL}/video/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${RUNWAY_API_KEY}`,
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`Runway API error: ${response.statusText}`);
    }

    const data: RunwayVideoResponse = await response.json();

    // Step 2: 動画生成の完了を待つ（ポーリング）
    if (data.status === 'pending' || data.status === 'processing') {
      return await pollVideoStatus(data.id);
    }

    if (data.status === 'completed' && data.output && data.output.length > 0) {
      return data.output[0];
    }

    throw new Error(data.error || 'Video generation failed');
  } catch (error) {
    logError(error, { component: 'videoGenerationRunway', action: 'generateVideoWithRunway' });
    throw error;
  }
}

/**
 * 動画生成のステータスをポーリング
 */
async function pollVideoStatus(
  videoId: string,
  maxAttempts = 60,
  intervalMs = 5000
): Promise<string> {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    await new Promise((resolve) => setTimeout(resolve, intervalMs));

    try {
      const response = await fetch(`${RUNWAY_API_URL}/video/${videoId}`, {
        headers: {
          Authorization: `Bearer ${RUNWAY_API_KEY}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to check video status: ${response.statusText}`);
      }

      const data: RunwayVideoResponse = await response.json();

      if (data.status === 'completed' && data.output && data.output.length > 0) {
        return data.output[0];
      }

      if (data.status === 'failed') {
        throw new Error(data.error || 'Video generation failed');
      }

      // まだ処理中
    } catch (error) {
      logError(error, { component: 'videoGenerationRunway', action: 'pollVideoStatus', videoId });
      throw error;
    }
  }

  throw new Error('Video generation timeout');
}
