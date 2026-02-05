// Web Speech API (ブラウザ組み込みの型が無いため object で宣言)
interface Window {
  SpeechRecognition?: object;
  webkitSpeechRecognition?: object;
}

declare let SpeechRecognition: object;
declare let webkitSpeechRecognition: object;

declare class BarcodeDetector {
  constructor(options?: { formats: string[] });
  detect(image: ImageBitmapSource): Promise<Array<{ rawValue: string; format: string }>>;
  static getSupportedFormats(): Promise<string[]>;
}
