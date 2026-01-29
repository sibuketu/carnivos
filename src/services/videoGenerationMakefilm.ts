/**
 * Primal Logic - Makefilm API Integration
 *
 * Makefilm APIを使用して動画を生成
 * API仕様: https://makefilm.jp/ (要確認)
 */

import type { VideoScript } from './videoGeneration';
import { logError } from '../utils/errorHandler';

const MAKEFILM_API_KEY = import.meta.env.VITE_MAKEFILM_API_KEY;
// Makefilm API エンドポイント
// 公式ドキュメントで確認してください
// 実際のAPIエンドポイントは公式ドキュメントで確認してください
const MAKEFILM_API_URL = 'https://api.makefilm.jp/v1';

export interface MakefilmVideoRequest {
  script: string;
  title: string;
  duration: number;
  language: string;
}

export interface MakefilmVideoResponse {
  video_id: string;
  status: 'processing' | 'completed' | 'failed';
  video_url?: string;
  error?: string;
}

/**
 * Makefilm APIを使用して動画を生成
 */
export async function generateVideoWithMakefilm(script: VideoScript): Promise<string> {
  if (!MAKEFILM_API_KEY) {
    throw new Error('VITE_MAKEFILM_API_KEY is not set');
  }

  // 言語を取得（scriptから、またはデフォルトで'ja'）
  const language = script.language || 'ja';

  // 言語コードをMakefilm APIの形式に変換
  const languageMap: Record<string, string> = {
    ja: 'ja',
    en: 'en',
    fr: 'fr',
    de: 'de',
  };

  const request: MakefilmVideoRequest = {
    script: script.script,
    title: script.title,
    duration: script.duration,
    language: languageMap[language] || 'ja',
  };

  try {
    // Step 1: 動画生成リクエストを送信
    const response = await fetch(`${MAKEFILM_API_URL}/videos/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${MAKEFILM_API_KEY}`,
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`Makefilm API error: ${response.statusText}`);
    }

    const data: MakefilmVideoResponse = await response.json();

    // Step 2: 動画生成の完了を待つ（ポーリング）
    if (data.status === 'processing') {
      return await pollVideoStatus(data.video_id);
    }

    if (data.status === 'completed' && data.video_url) {
      return data.video_url;
    }

    throw new Error(data.error || 'Video generation failed');
  } catch (error) {
    logError(error, { component: 'videoGenerationMakefilm', action: 'generateVideoWithMakefilm' });
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
      const response = await fetch(`${MAKEFILM_API_URL}/videos/${videoId}`, {
        headers: {
          Authorization: `Bearer ${MAKEFILM_API_KEY}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to check video status: ${response.statusText}`);
      }

      const data: MakefilmVideoResponse = await response.json();

      if (data.status === 'completed' && data.video_url) {
        return data.video_url;
      }

      if (data.status === 'failed') {
        throw new Error(data.error || 'Video generation failed');
      }

      // まだ処理中
    } catch (error) {
      logError(error, { component: 'videoGenerationMakefilm', action: 'pollVideoStatus', videoId });
      throw error;
    }
  }

  throw new Error('Video generation timeout');
}
