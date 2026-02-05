/**
 * Primal Logic - Barcode Scanner Utility
 *
 * バーコード読み取り機能
 * Web API: BarcodeDetector API（Chrome/Edge対応）
 * フォールバック: @zxing/library（#34: iOS Safari等での画像アップロード対応）
 */

import { logError } from './errorHandler';

export interface BarcodeResult {
  code: string; // バーコード値
  format: string; // バーコード形式（EAN-13, UPC-A等）
}

/**
 * BarcodeDetector APIが利用可能かチェック
 * モバイルブラウザ（特にiOS Safari）では利用できないため、より厳密にチェック
 */
export function isBarcodeDetectorAvailable(): boolean {
  // モバイルブラウザの検出
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);

  // iOS SafariではBarcodeDetector APIが利用できない
  if (isIOS) {
    return false;
  }

  // Android Chromeでも、実際にAPIが利用可能か確認
  if (isMobile && 'BarcodeDetector' in window) {
    try {
      // 実際にBarcodeDetectorをインスタンス化して確認
      const testDetector = new (
        window as typeof window & { BarcodeDetector: typeof BarcodeDetector }
      ).BarcodeDetector({ formats: ['qr_code'] });
      return !!testDetector;
    } catch {
      return false;
    }
  }

  // デスクトップブラウザ（Chrome、Edge）では利用可能
  return 'BarcodeDetector' in window;
}

/**
 * バーコードをスキャン（BarcodeDetector API使用）
 */
export async function scanBarcodeFromImage(file: File): Promise<BarcodeResult | null> {
  try {
    if (!isBarcodeDetectorAvailable()) {
      throw new Error('BarcodeDetector API is not available');
    }

    const imageBitmap = await createImageBitmap(file);
    const BarcodeDetectorClass = (
      window as typeof window & { BarcodeDetector: typeof BarcodeDetector }
    ).BarcodeDetector;
    const barcodeDetector = new BarcodeDetectorClass({
      formats: [
        'ean_13',
        'ean_8',
        'upc_a',
        'upc_e',
        'code_128',
        'code_39',
        'code_93',
        'codabar',
        'itf',
        'qr_code',
        'data_matrix',
        'aztec',
        'pdf417',
      ],
    });

    const barcodes = await barcodeDetector.detect(imageBitmap);

    if (barcodes.length === 0) {
      return null;
    }

    return {
      code: barcodes[0].rawValue,
      format: barcodes[0].format,
    };
  } catch (error) {
    logError(error, { component: 'barcodeScanner', action: 'scanBarcodeFromImage' });
    throw error;
  }
}

/**
 * カメラからバーコードをスキャン
 *
 * @param videoElement 既に初期化されたvideo要素（オプション）
 * @param onProgress スキャン中の進捗コールバック（オプション）
 */
export async function scanBarcodeFromCamera(
  videoElement?: HTMLVideoElement,
  onProgress?: (progress: number) => void
): Promise<BarcodeResult | null> {
  try {
    if (!isBarcodeDetectorAvailable()) {
      throw new Error('BarcodeDetector API is not available');
    }

    let stream: MediaStream;
    let video: HTMLVideoElement;
    let shouldCleanup = false;

    if (videoElement) {
      // 既に初期化されたvideo要素を使用
      video = videoElement;
      stream = video.srcObject as MediaStream;
    } else {
      // 新しいカメラストリームを開始
      stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });

      video = document.createElement('video');
      video.srcObject = stream;
      await video.play();
      shouldCleanup = true;
    }

    const BarcodeDetectorClass = (
      window as typeof window & { BarcodeDetector: typeof BarcodeDetector }
    ).BarcodeDetector;
    const barcodeDetector = new BarcodeDetectorClass({
      formats: [
        'ean_13',
        'ean_8',
        'upc_a',
        'upc_e',
        'code_128',
        'code_39',
        'code_93',
        'codabar',
        'itf',
        'qr_code',
        'data_matrix',
        'aztec',
        'pdf417',
      ],
    });

    return new Promise((resolve, _reject) => {
      let scanCount = 0;
      const maxScans = 20; // 10秒間（500ms × 20回）

      const scanInterval = setInterval(async () => {
        try {
          scanCount++;
          if (onProgress) {
            onProgress((scanCount / maxScans) * 100);
          }

          const barcodes = await barcodeDetector.detect(video);
          if (barcodes.length > 0) {
            clearInterval(scanInterval);
            if (shouldCleanup) {
              stream.getTracks().forEach((track) => track.stop());
              video.remove();
            }
            resolve({
              code: barcodes[0].rawValue,
              format: barcodes[0].format,
            });
          } else if (scanCount >= maxScans) {
            // タイムアウト
            clearInterval(scanInterval);
            if (shouldCleanup) {
              stream.getTracks().forEach((track) => track.stop());
              video.remove();
            }
            resolve(null);
          }
        } catch {
          if (import.meta.env.DEV) void 0;
        }
      }, 500);
    });
  } catch (error: unknown) {
    logError(error, { component: 'barcodeScanner', action: 'scanBarcodeFromCamera' });

    // エラーの種類に応じて適切なメッセージを返す
    const err = error as { name?: string; message?: string };
    if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
      throw new Error('カメラの許可が必要です。ブラウザの設定からカメラを許可してください。');
    } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
      throw new Error('カメラが見つかりませんでした。');
    } else if (err.message?.includes('BarcodeDetector')) {
      throw new Error(
        'このブラウザはバーコード読み取りに対応していません。ChromeまたはEdgeをご利用ください。'
      );
    }

    throw error;
  }
}

/**
 * Open Food Facts APIから食品情報を取得
 */
export interface OpenFoodFactsProduct {
  product_name?: string;
  product_name_en?: string;
  nutriments?: {
    proteins?: number;
    fat?: number;
    carbohydrates?: number;
    sodium?: number;
    magnesium?: number;
    zinc?: number;
    iron?: number;
    vitamin_b12?: number;
    vitamin_a?: number;
    vitamin_d?: number;
    omega_3_fat?: number;
    omega_6_fat?: number;
    [key: string]: number | undefined;
  };
  [key: string]: unknown;
}

/**
 * 画像ファイルからバーコードを読み取る（#34: ZXingフォールバック、iOS Safari等対応）
 */
export async function scanBarcodeFromImageFile(file: File): Promise<BarcodeResult | null> {
  try {
    if (isBarcodeDetectorAvailable()) {
      return await scanBarcodeFromImage(file);
    }

    // BarcodeDetector 非対応時は ZXing を使用
    const ZXing = await import('@zxing/library');
    const img = await createImageBitmap(file);
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      img.close();
      return null;
    }
    ctx.drawImage(img, 0, 0);
    img.close();

    const source = new ZXing.HTMLCanvasElementLuminanceSource(canvas);
    const binarizer = new ZXing.HybridBinarizer(source);
    const binaryBitmap = new ZXing.BinaryBitmap(binarizer);
    const reader = new ZXing.MultiFormatReader();
    const result = reader.decode(binaryBitmap);

    const formatMap: Record<string, string> = {
      [ZXing.BarcodeFormat.EAN_13]: 'ean_13',
      [ZXing.BarcodeFormat.EAN_8]: 'ean_8',
      [ZXing.BarcodeFormat.UPC_A]: 'upc_a',
      [ZXing.BarcodeFormat.UPC_E]: 'upc_e',
      [ZXing.BarcodeFormat.CODE_128]: 'code_128',
      [ZXing.BarcodeFormat.CODE_39]: 'code_39',
      [ZXing.BarcodeFormat.CODE_93]: 'code_93',
      [ZXing.BarcodeFormat.QR_CODE]: 'qr_code',
    };
    const format = formatMap[result.getBarcodeFormat()] || 'unknown';

    return { code: result.getText(), format };
  } catch (error) {
    logError(error, { component: 'barcodeScanner', action: 'scanBarcodeFromImageFile' });
    return null;
  }
}

export async function getFoodInfoFromBarcode(
  barcode: string
): Promise<OpenFoodFactsProduct | null> {
  try {
    const response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`);
    const data = await response.json();

    if (data.status === 0) {
      return null; // 商品が見つからない
    }

    return data.product;
  } catch (error) {
    logError(error, { component: 'barcodeScanner', action: 'getFoodInfoFromBarcode' });
    throw error;
  }
}
