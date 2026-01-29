/**
 * Primal Logic - HeyGen API Integration
 *
 * HeyGen APIを使用して動画を生成
 * API仕様: https://www.heygen.com/api (要確認)
 */

import type { VideoScript } from './videoGeneration';
import { logError } from '../utils/errorHandler';

const HEYGEN_API_KEY = import.meta.env.VITE_HEYGEN_API_KEY;
const HEYGEN_API_URL = 'https://api.heygen.com/v2'; // HeyGen API V2

export interface HeyGenVideoRequest {
  text: string; // スクリプトテキスト（5000文字以下）
  avatar_id?: string; // アバターID（必須）
  voice_id?: string; // 音声ID（必須）
  dimension?: {
    width: number;
    height: number;
  }; // 解像度（デフォルト: 720p）
  background?: string; // 背景設定
  caption?: boolean; // キャプション表示
  test?: boolean; // テストモード
}

export interface HeyGenVideoResponse {
  data: {
    video_id: string;
    status: 'pending' | 'waiting' | 'processing' | 'completed' | 'failed';
    video_url?: string;
    error?: string;
  };
}

/**
 * HeyGen APIを使用して動画を生成
 * @param script 動画スクリプト
 * @param useFreePlan Freeプランを使用する場合true（3分・720p・月3本まで）
 */
export async function generateVideoWithHeyGen(
  script: VideoScript,
  useFreePlan: boolean = false
): Promise<string> {
  if (!HEYGEN_API_KEY) {
    throw new Error('VITE_HEYGEN_API_KEY is not set');
  }

  // Freeプランの場合、スクリプト長さを500文字に制限
  if (useFreePlan) {
    if (script.script.length > 500) {
      throw new Error('Freeプランではスクリプトは500文字以内に制限されています（3分以内の動画用）');
    }
    if (script.duration > 180) {
      throw new Error('Freeプランでは動画の長さは3分（180秒）以内に制限されています');
    }
  } else {
    // 有料プランの場合、5000文字まで
    if (script.script.length > 5000) {
      throw new Error('Script text must be less than 5000 characters');
    }
  }

  const request: HeyGenVideoRequest = {
    text: script.script,
    // avatar_idとvoice_idは必須だが、デフォルト値を使用する場合は省略可能
    // 実際の使用時には、事前にList Avatars APIとList Voices APIで取得したIDを使用
    dimension: useFreePlan
      ? { width: 1280, height: 720 } // Freeプラン: 720p
      : { width: 1920, height: 1080 }, // 有料プラン: 1080p（Teamプランなら4Kも可能）
  };

  try {
    // Step 1: 動画生成リクエストを送信
    // エンドポイント: POST https://api.heygen.com/v2/video/generate
    const response = await fetch(`${HEYGEN_API_URL}/video/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': HEYGEN_API_KEY, // HeyGen APIはX-Api-Keyヘッダーを使用
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HeyGen API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const result: HeyGenVideoResponse = await response.json();
    const data = result.data;

    // Step 2: 動画生成の完了を待つ（ポーリング）
    if (data.status === 'pending' || data.status === 'waiting' || data.status === 'processing') {
      return await pollVideoStatus(data.video_id);
    }

    if (data.status === 'completed' && data.video_url) {
      return data.video_url;
    }

    throw new Error(data.error || 'Video generation failed');
  } catch (error) {
    logError(error, { component: 'videoGenerationHeyGen', action: 'generateVideoWithHeyGen' });
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
      // エンドポイント: GET https://api.heygen.com/v2/video_status?video_id={video_id}
      const response = await fetch(`${HEYGEN_API_URL}/video_status?video_id=${videoId}`, {
        headers: {
          'X-Api-Key': HEYGEN_API_KEY,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to check video status: ${response.statusText}`);
      }

      const result: HeyGenVideoResponse = await response.json();
      const data = result.data;

      if (data.status === 'completed' && data.video_url) {
        return data.video_url;
      }

      if (data.status === 'failed') {
        throw new Error(data.error || 'Video generation failed');
      }

      // まだ処理中
    } catch (error) {
      logError(error, { component: 'videoGenerationHeyGen', action: 'pollVideoStatus', videoId });
      throw error;
    }
  }

  throw new Error('Video generation timeout');
}
