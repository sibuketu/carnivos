/**
 * アプリアイコン生成UIコンポーネント
 *
 * 開発用: アプリアイコンの生成と確認を行うためのUI
 */

import { useState } from 'react';
// 自動生成版を使用（Replicate API）
import {
  generateAppIconAuto,
  generateMultipleAppIconsAuto,
} from '../services/imageGenerationServiceAuto';
// 手動生成版（プロンプトのみ）も残しておく
import { generateAppIcon, generateMultipleAppIcons } from '../services/imageGenerationService';

export function AppIconGenerator() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<
    Array<{ style: number; variation: number; url: string }>
  >([]);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateAll = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      // 自動生成版を試す（Replicate API）
      const results = await generateMultipleAppIconsAuto();
      setGeneratedImages(results);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '画像生成に失敗しました';

      // Replicate APIが設定されていない場合は、手動生成版にフォールバック
      if (errorMessage.includes('Replicate APIトークンが設定されていません')) {
        try {
          // 手動生成版を使用（プロンプトを生成）
          await generateMultipleAppIcons();
          // 手動生成版はエラーをスローする（プロンプト表示のため）
        } catch {
          // エラーメッセージは手動生成版のthrowで表示される
          setError(errorMessage);
        }
      } else {
        setError(errorMessage);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateSingle = async (style: 1 | 2 | 3, variation: 1 | 2 | 3 | 4 = 1) => {
    setIsGenerating(true);
    setError(null);

    try {
      // 自動生成版を試す（Replicate API）
      const url = await generateAppIconAuto(style, variation);
      setGeneratedImages((prev) => [...prev, { style, variation, url }]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '画像生成に失敗しました';

      // Replicate APIが設定されていない場合は、手動生成版にフォールバック
      if (errorMessage.includes('Replicate APIトークンが設定されていません')) {
        try {
          await generateAppIcon(style, variation);
          // 手動生成版はエラーをスローする（プロンプト表示のため）
        } catch {
          // エラーメッセージは手動生成版のthrowで表示される
          setError(errorMessage);
        }
      } else {
        setError(errorMessage);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">アプリアイコン生成</h1>

      <div className="mb-4 space-x-2">
        <button
          onClick={handleGenerateAll}
          disabled={isGenerating}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGenerating ? '生成中...' : '10個一括生成'}
        </button>

        <button
          onClick={() => handleGenerateSingle(1, 1)}
          disabled={isGenerating}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
        >
          スタイル1-1を生成
        </button>

        <button
          onClick={() => handleGenerateSingle(2, 1)}
          disabled={isGenerating}
          className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50"
        >
          スタイル2-1を生成
        </button>

        <button
          onClick={() => handleGenerateSingle(3, 1)}
          disabled={isGenerating}
          className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 disabled:opacity-50"
        >
          スタイル3-1を生成
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-yellow-100 border border-yellow-400 text-yellow-800 rounded whitespace-pre-line">
          <div className="font-bold mb-2">📋 画像生成プロンプト（無料版）</div>
          <div className="mb-3">{error}</div>
          <div className="text-sm">
            <p className="font-bold mb-1">✅ 無料で画像生成する方法:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>
                <a
                  href="https://replicate.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  Replicate (Stable Diffusion)
                </a>{' '}
                - 無料枠あり
              </li>
              <li>
                <a
                  href="https://huggingface.co/spaces/stabilityai/stable-diffusion"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  Hugging Face
                </a>{' '}
                - 完全無料
              </li>
              <li>
                <a
                  href="https://www.craiyon.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  Craiyon
                </a>{' '}
                - 完全無料
              </li>
            </ul>
            <p className="mt-2 text-xs text-gray-600">
              プロンプトはクリップボードにコピーされています。上記のサービスに貼り付けて生成してください。
            </p>
          </div>
        </div>
      )}

      {generatedImages.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {generatedImages.map((result, index) => (
            <div key={index} className="border rounded p-2">
              <img
                src={result.url}
                alt={`スタイル${result.style} - バリエーション${result.variation}`}
                className="w-full aspect-square object-cover rounded mb-2"
              />
              <div className="text-sm text-gray-600">
                スタイル{result.style} - バリエーション{result.variation}
              </div>
              <a
                href={result.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline text-sm"
              >
                新しいタブで開く
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
