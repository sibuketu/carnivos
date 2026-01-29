/**
 * Primal Logic - Barcode Scanner Modal
 *
 * バーコード読み取りモーダル（スキャン中の表示、成功/失敗のフィードバック）
 */

import { useState, useEffect, useRef } from 'react';
import {
  scanBarcodeFromCamera,
  getFoodInfoFromBarcode,
  isBarcodeDetectorAvailable,
  type BarcodeResult,
} from '../utils/barcodeScanner';
import { logError } from '../utils/errorHandler';
import './BarcodeScannerModal.css';

interface BarcodeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (foodName: string, amount: number) => void;
}

export default function BarcodeScannerModal({
  isOpen,
  onClose,
  onSuccess,
}: BarcodeScannerModalProps) {
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [barcodeResult, setBarcodeResult] = useState<BarcodeResult | null>(null);
  const [foodInfo, setFoodInfo] = useState<any>(null);
  const [loadingFoodInfo, setLoadingFoodInfo] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (isOpen) {
      setScanning(false);
      setError(null);
      setBarcodeResult(null);
      setFoodInfo(null);
      setLoadingFoodInfo(false);
    } else {
      // モーダルが閉じられたらカメラを停止
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    }
  }, [isOpen]);

  const handleStartScan = async () => {
    if (!isBarcodeDetectorAvailable()) {
      // モバイルブラウザの検出
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);

      if (isIOS) {
        setError(
          'iOS Safariではバーコード読み取りに対応していません。画像をアップロードしてバーコードを読み取る機能をご利用ください。'
        );
      } else if (isMobile) {
        setError(
          'このモバイルブラウザではバーコード読み取りに対応していません。Android Chromeをご利用ください。'
        );
      } else {
        setError(
          'このブラウザはバーコード読み取りに対応していません。ChromeまたはEdgeをご利用ください。'
        );
      }
      return;
    }

    setScanning(true);
    setError(null);
    setBarcodeResult(null);
    setFoodInfo(null);

    try {
      // カメラアクセス
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      // バーコードスキャン
      const result = await scanBarcodeFromCamera(videoRef.current || undefined);

      if (result) {
        setBarcodeResult(result);
        setScanning(false);

        // 食品情報を取得
        setLoadingFoodInfo(true);
        try {
          const info = await getFoodInfoFromBarcode(result.code);
          if (info) {
            setFoodInfo(info);
          } else {
            setError('商品情報が見つかりませんでした。');
          }
        } catch (infoError) {
          logError(infoError, { component: 'BarcodeScannerModal', action: 'getFoodInfo' });
          setError('商品情報の取得に失敗しました。');
        } finally {
          setLoadingFoodInfo(false);
        }
      } else {
        setError('バーコードを読み取れませんでした。もう一度お試しください。');
        setScanning(false);
      }
    } catch (error: unknown) {
      logError(error, { component: 'BarcodeScannerModal', action: 'handleStartScan' });

      const err = error as { name?: string; message?: string };
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setError('カメラの許可が必要です。ブラウザの設定からカメラを許可してください。');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setError('カメラが見つかりませんでした。');
      } else {
        setError('バーコード読み取りに失敗しました。もう一度お試しください。');
      }
      setScanning(false);
    }
  };

  const handleAddFood = () => {
    if (!foodInfo) return;

    const foodName = foodInfo.product_name || foodInfo.product_name_en || '不明な食品';
    const amountStr = prompt(`${foodName}の量を入力してください（g）:`, '100');
    if (!amountStr) return;

    const amount = Number(amountStr);
    if (isNaN(amount) || amount <= 0) {
      alert('有効な量を入力してください');
      return;
    }

    onSuccess(foodName, amount);
    onClose();
  };

  const handleClose = () => {
    // カメラを停止
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="barcode-scanner-modal-overlay" onClick={handleClose}>
      <div className="barcode-scanner-modal" onClick={(e) => e.stopPropagation()}>
        <div className="barcode-scanner-modal-header">
          <h2 className="barcode-scanner-modal-title">バーコード読み取り</h2>
          <button onClick={handleClose} className="barcode-scanner-modal-close">
            ×
          </button>
        </div>

        <div className="barcode-scanner-modal-content">
          {!scanning && !barcodeResult && !error && (
            <div className="barcode-scanner-modal-start">
              <p>バーコードを読み取る準備ができました。</p>
              <button onClick={handleStartScan} className="barcode-scanner-modal-start-button">
                スキャンを開始
              </button>
            </div>
          )}

          {scanning && (
            <div className="barcode-scanner-modal-scanning">
              <div className="barcode-scanner-modal-video-container">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="barcode-scanner-modal-video"
                />
                <div className="barcode-scanner-modal-scan-line" />
              </div>
              <p className="barcode-scanner-modal-scanning-text">
                バーコードをカメラに向けてください...
              </p>
            </div>
          )}

          {error && (
            <div className="barcode-scanner-modal-error">
              <p>⚠️ {error}</p>
              <button onClick={handleStartScan} className="barcode-scanner-modal-retry-button">
                もう一度試す
              </button>
            </div>
          )}

          {barcodeResult && (
            <div className="barcode-scanner-modal-result">
              <p className="barcode-scanner-modal-success">✓ バーコードを読み取りました</p>
              <p className="barcode-scanner-modal-barcode">コード: {barcodeResult.code}</p>

              {loadingFoodInfo && (
                <p className="barcode-scanner-modal-loading">商品情報を取得中...</p>
              )}

              {foodInfo && (
                <div className="barcode-scanner-modal-food-info">
                  <h3>{foodInfo.product_name || foodInfo.product_name_en || '不明な食品'}</h3>
                  <button onClick={handleAddFood} className="barcode-scanner-modal-add-button">
                    食品を追加
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
