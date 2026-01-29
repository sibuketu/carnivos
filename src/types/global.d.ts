interface Window {
  SpeechRecognition: any;
  webkitSpeechRecognition: any;
}

declare let SpeechRecognition: any;
declare let webkitSpeechRecognition: any;

declare class BarcodeDetector {
  constructor(options?: { formats: string[] });
  detect(image: ImageBitmapSource): Promise<Array<{ rawValue: string; format: string }>>;
  static getSupportedFormats(): Promise<string[]>;
}
