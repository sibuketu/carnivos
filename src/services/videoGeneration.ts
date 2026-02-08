/**
 * CarnivOS - Video Generation Service
 *
 * 動画生成機能: Makefilm/HeyGen/Runway APIを使用してロング動画を自動生成
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { logError } from '../utils/errorHandler';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

export interface VideoScript {
  title: string;
  description: string;
  script: string; // 動画の台本
  hashtags: string[];
  duration: number; // 秒
  contentType?: ContentType; // コンテンツタイプ
  templateSelection?: TemplateSelection; // 選択されたテンプレート
  language?: 'ja' | 'en' | 'fr' | 'de'; // 言語（デフォルト: 'ja'）
  platform?: 'youtube' | 'tiktok' | 'instagram'; // プラットフォーム（アスペクト比の決定に使用）
}

export type ContentType =
  | 'explainer' // 説明動画
  | 'counter' // 反論動画
  | 'testimonial' // 体験談
  | 'educational' // 教育動画
  | 'entertainment'; // エンタメ動画

export type VideoType = 'long' | 'short';

export interface TemplateSelection {
  template: string;
  category: string;
  orientation: 'landscape' | 'portrait';
  style: string;
  reason: string;
}

export interface VideoGenerationOptions {
  platform: 'youtube' | 'tiktok' | 'instagram';
  language: 'ja' | 'en' | 'fr' | 'de';
  topic?: string; // トピック（指定がない場合はランダム）
  contentType?: ContentType; // コンテンツタイプ（自動判定も可能）
  videoType?: VideoType; // ロング or ショート（platformから自動判定も可能）
  useFreePlan?: boolean; // Freeプランを使用する場合true（3分・720p・月3本まで）
}

/**
 * コンテンツタイプを自動判定
 */
export function detectContentType(script: string): ContentType {
  const scriptLower = script.toLowerCase();

  // 反論動画のキーワード
  const counterKeywords = [
    '反論',
    '間違い',
    '批判',
    'counter',
    'myth',
    'debunk',
    'wrong',
    'misconception',
  ];
  if (counterKeywords.some((keyword) => scriptLower.includes(keyword))) {
    return 'counter';
  }

  // 体験談のキーワード
  const testimonialKeywords = [
    '体験',
    '実践',
    '結果',
    'testimonial',
    'experience',
    'result',
    'story',
  ];
  if (testimonialKeywords.some((keyword) => scriptLower.includes(keyword))) {
    return 'testimonial';
  }

  // 教育動画のキーワード
  const educationalKeywords = ['学ぶ', '学習', '教育', 'learn', 'education', 'how to', 'guide'];
  if (educationalKeywords.some((keyword) => scriptLower.includes(keyword))) {
    return 'educational';
  }

  // エンタメ動画のキーワード
  const entertainmentKeywords = ['面白い', '驚き', 'fun', 'amazing', 'wow', 'shocking'];
  if (entertainmentKeywords.some((keyword) => scriptLower.includes(keyword))) {
    return 'entertainment';
  }

  // デフォルト: 説明動画
  return 'explainer';
}

/**
 * テンプレートを自動選択
 */
export function selectTemplate(contentType: ContentType, videoType: VideoType): TemplateSelection {
  if (videoType === 'long') {
    // ロング動画（YouTube用）
    if (contentType === 'explainer' || contentType === 'educational') {
      return {
        template: 'Explainer Video',
        category: 'Explainer Video',
        orientation: 'landscape',
        style: 'professional',
        reason:
          'カーニボアダイエットの説明・教育コンテンツに最適。プロフェッショナルな説明動画スタイル。',
      };
    }
    if (contentType === 'counter') {
      return {
        template: 'Breaking News',
        category: 'Advertisement',
        orientation: 'landscape',
        style: 'news',
        reason: 'ニューススタイルで「事実を伝える」印象を与える。カウンター動画に最適。',
      };
    }
    if (contentType === 'testimonial') {
      return {
        template: 'Explainer Video',
        category: 'Explainer Video',
        orientation: 'landscape',
        style: 'professional',
        reason: '体験談も解説動画スタイルで統一。プロフェッショナルな印象を与える。',
      };
    }
    // デフォルト
    return {
      template: 'Explainer Video',
      category: 'Explainer Video',
      orientation: 'landscape',
      style: 'professional',
      reason: 'デフォルト: 説明動画スタイル',
    };
  } else {
    // ショート動画（TikTok/Instagram用）
    if (contentType === 'entertainment' || contentType === 'testimonial') {
      return {
        template: 'Social Template',
        category: 'Social Media',
        orientation: 'portrait',
        style: 'entertainment',
        reason: 'SNS向けに最適化されている。エンタメ性が高い。',
      };
    }
    if (contentType === 'counter') {
      return {
        template: 'Breaking News',
        category: 'Advertisement',
        orientation: 'portrait',
        style: 'news',
        reason: 'ニューススタイルでインパクトのある反論動画。',
      };
    }
    // デフォルト
    return {
      template: 'Social Template',
      category: 'Social Media',
      orientation: 'portrait',
      style: 'entertainment',
      reason: 'デフォルト: SNS向けエンタメスタイル',
    };
  }
}

/**
 * Gemini APIを使用して動画スクリプトを生成
 */
export async function generateVideoScript(options: VideoGenerationOptions): Promise<VideoScript> {
  if (!GEMINI_API_KEY) {
    throw new Error('VITE_GEMINI_API_KEY is not set');
  }

  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

  // 動画タイプを自動判定（platformから）
  const videoType: VideoType =
    options.videoType || (options.platform === 'youtube' ? 'long' : 'short');

  // コンテンツタイプを自動判定（topicから推測、または指定された値を使用）
  // 戦略: 最初は解説動画に集中。デフォルトは説明動画（explainer）
  const contentType: ContentType = options.contentType || 'explainer'; // デフォルトは説明動画

  // テンプレートを自動選択
  const templateSelection = selectTemplate(contentType, videoType);

  // Freeプランの場合、スクリプトは3分以内（約450-500文字）に制限
  const maxDuration = options.useFreePlan ? 180 : videoType === 'long' ? 600 : 45; // 秒
  const maxScriptLength = options.useFreePlan ? 500 : videoType === 'long' ? 5000 : 500; // 文字数

  // コンテンツタイプに応じたプロンプト調整
  const contentTypePrompt = {
    explainer: '説明動画スタイルで、カーニボアダイエットについて分かりやすく説明してください。',
    counter:
      '反論動画スタイルで、カーニボアダイエットへの批判や誤解に対して、科学的根拠に基づいて反論してください。ニューススタイルで「事実を伝える」印象を与えてください。',
    testimonial: '体験談スタイルで、カーニボアダイエットの実践体験や結果を語る形式にしてください。',
    educational: '教育動画スタイルで、カーニボアダイエットについて学べる内容にしてください。',
    entertainment: 'エンタメ動画スタイルで、視聴者が楽しめる、シェアしたくなる内容にしてください。',
  };

  const prompt = `
あなたはカーニボアダイエットの専門家です。${options.platform === 'youtube' ? 'YouTube' : options.platform === 'tiktok' ? 'TikTok' : 'Instagram'}用の${options.language === 'ja' ? '日本語' : options.language === 'en' ? '英語' : options.language === 'fr' ? 'フランス語' : 'ドイツ語'}の動画スクリプトを生成してください。

${options.topic ? `トピック: ${options.topic}` : 'トピックはランダムに選んでください（カーニボアダイエットに関連する内容）'}

コンテンツタイプ: ${contentType}
${contentTypePrompt[contentType]}

テンプレート: ${templateSelection.template} (${templateSelection.category})
${templateSelection.reason}

要件:
- エンタメ性を重視した内容
- 科学的根拠に基づいた情報
- ${options.useFreePlan ? '3分以内（約450-500文字）' : videoType === 'long' ? '5-10分' : '30-60秒'}の動画に適した長さ
- 視聴者が興味を持ち、シェアしたくなる内容
${options.useFreePlan ? '- **重要**: スクリプトは必ず450-500文字以内に収めてください。3分を超えるとエラーになります。' : ''}
${options.language === 'en' ? '- **重要**: 英語で作成してください。グローバルに広がるカーニボアダイエットの動画として、英語が最適です。' : ''}

以下のJSON形式で返してください:
{
  "title": "動画のタイトル",
  "description": "動画の説明文（${options.platform === 'youtube' ? '200文字以上' : '100文字程度'}）",
  "script": "動画の台本（話す内容をそのまま書いてください。${options.useFreePlan ? '必ず450-500文字以内に収めてください。' : ''}）",
  "hashtags": ["ハッシュタグ1", "ハッシュタグ2", ...],
  "duration": ${maxDuration}
}
`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // JSONを抽出（```json で囲まれている場合がある）
    const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to parse JSON from response');
    }

    const script = JSON.parse(jsonMatch[1] || jsonMatch[0]) as VideoScript;

    // Freeプランの場合、スクリプト長さをチェック
    if (options.useFreePlan && script.script.length > maxScriptLength) {
      // スクリプトが長すぎる場合は、文の区切りで切り詰める
      let truncatedScript = script.script.substring(0, maxScriptLength - 3);
      // 最後の文の区切り（。、！、？）を探して、その位置で切り詰める
      const lastSentenceEnd = Math.max(
        truncatedScript.lastIndexOf('。'),
        truncatedScript.lastIndexOf('！'),
        truncatedScript.lastIndexOf('？'),
        truncatedScript.lastIndexOf('.'),
        truncatedScript.lastIndexOf('!'),
        truncatedScript.lastIndexOf('?')
      );
      if (lastSentenceEnd > maxScriptLength * 0.7) {
        // 70%以上が文の区切りで終わっている場合のみ、その位置で切り詰める
        truncatedScript = truncatedScript.substring(0, lastSentenceEnd + 1);
      }
      script.script = truncatedScript + '...';
      if (import.meta.env.DEV) {
        console.warn(
          `Freeプランの制限により、スクリプトを${truncatedScript.length}文字に切り詰めました（元の長さ: ${script.script.length}文字）`
        );
      }
    }

    return script;
  } catch (error) {
    logError(error, { component: 'videoGeneration', action: 'generateVideoScript' });
    throw error;
  }
}

import { generateVideoWithMakefilm } from './videoGenerationMakefilm';
import { generateVideoWithHeyGen } from './videoGenerationHeyGen';
import { generateVideoWithRunway } from './videoGenerationRunway';

// Re-export for convenience
export { generateVideoWithMakefilm, generateVideoWithHeyGen, generateVideoWithRunway };

/**
 * 動画生成のメイン関数
 */
export async function generateVideo(options: VideoGenerationOptions): Promise<{
  script: VideoScript;
  videoUrl?: string;
}> {
  // 1. スクリプト生成
  const script = await generateVideoScript(options);

  // 2. 動画生成（優先順位: Makefilm > HeyGen > Runway）
  // Freeプランの場合はHeyGenのみを使用（制限があるため）
  let videoUrl: string | undefined;

  if (options.useFreePlan) {
    // Freeプランの場合、HeyGenのみ使用
    try {
      videoUrl = await generateVideoWithHeyGen(script, true);
    } catch (error) {
      logError(error, {
        component: 'videoGeneration',
        action: 'generateVideo',
        step: 'heyGenFreePlan',
      });
    }
  } else {
    // 有料プランの場合、優先順位で試行
    try {
      videoUrl = await generateVideoWithMakefilm(script);
    } catch (error) {
      console.warn('Makefilm failed, trying HeyGen:', error);
      try {
        videoUrl = await generateVideoWithHeyGen(script, false);
      } catch (error2) {
        if (import.meta.env.DEV) {
          console.warn('HeyGen failed, trying Runway:', error2);
        }
        try {
          videoUrl = await generateVideoWithRunway(script);
        } catch (error3) {
          logError(error3, {
            component: 'videoGeneration',
            action: 'generateVideo',
            step: 'allServicesFailed',
          });
        }
      }
    }
  }

  return {
    script,
    videoUrl,
  };
}
