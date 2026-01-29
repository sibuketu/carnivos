/**
 * Primal Logic - Voice Input (Web Speech API)
 *
 * WindowsHキーでの音声入力対応
 * Web Speech APIを使用した音声認識機能
 */

import { logError } from './errorHandler';

// Web Speech APIの型定義
interface SpeechRecognitionInterface extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
}

interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent {
  error: string;
  message: string;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
  isFinal: boolean;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

export interface VoiceInputOptions {
  language?: string; // 'ja-JP', 'en-US', 'fr-FR', 'de-DE'
  continuous?: boolean; // 連続認識
  interimResults?: boolean; // 中間結果を返す
  maxAlternatives?: number; // 候補数
}

export interface VoiceInputResult {
  text: string;
  confidence: number;
  isFinal: boolean;
}

export class VoiceInputManager {
  private recognition: SpeechRecognitionInterface | null = null;
  private isListening: boolean = false;
  private onResultCallback: ((result: VoiceInputResult) => void) | null = null;
  private onErrorCallback: ((error: string) => void) | null = null;
  private onEndCallback: (() => void) | null = null;

  constructor(options: VoiceInputOptions = {}) {
    // Web Speech APIのサポート確認
    const SpeechRecognitionClass = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognitionClass) {
      console.warn('Web Speech API is not supported in this browser.');
      return;
    }

    this.recognition = new SpeechRecognitionClass();
    if (!this.recognition) return;

    this.recognition.lang = options.language || 'ja-JP';
    this.recognition.continuous = options.continuous ?? false;
    this.recognition.interimResults = options.interimResults ?? true;
    this.recognition.maxAlternatives = options.maxAlternatives || 1;

    // イベントハンドラー
    this.recognition.onresult = (event: SpeechRecognitionEvent) => {
      const result = event.results[event.results.length - 1];
      const transcript = result[0].transcript;
      const confidence = result[0].confidence || 0.8;

      if (this.onResultCallback) {
        this.onResultCallback({
          text: transcript,
          confidence,
          isFinal: result.isFinal,
        });
      }
    };

    this.recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      const error = event.error;
      if (this.onErrorCallback) {
        this.onErrorCallback(error);
      }
    };

    this.recognition.onend = () => {
      this.isListening = false;
      if (this.onEndCallback) {
        this.onEndCallback();
      }
    };
  }

  /**
   * 音声認識を開始
   */
  start(): void {
    if (!this.recognition) {
      logError(new Error('Speech Recognition is not available.'), {
        component: 'voiceInput',
        action: 'start',
      });
      return;
    }

    if (this.isListening) {
      console.warn('Voice input is already listening.');
      return;
    }

    try {
      this.recognition.start();
      this.isListening = true;
    } catch (error) {
      logError(error, { component: 'voiceInput', action: 'start' });
    }
  }

  /**
   * 音声認識を停止
   */
  stop(): void {
    if (!this.recognition || !this.isListening) {
      return;
    }

    try {
      this.recognition.stop();
      this.isListening = false;
    } catch (error) {
      logError(error, { component: 'voiceInput', action: 'stop' });
    }
  }

  /**
   * 結果コールバックを設定
   */
  onResult(callback: (result: VoiceInputResult) => void): void {
    this.onResultCallback = callback;
  }

  /**
   * エラーコールバックを設定
   */
  onError(callback: (error: string) => void): void {
    this.onErrorCallback = callback;
  }

  /**
   * 終了コールバックを設定
   */
  onEnd(callback: () => void): void {
    this.onEndCallback = callback;
  }

  /**
   * 現在の言語を設定
   */
  setLanguage(language: string): void {
    if (this.recognition) {
      this.recognition.lang = language;
    }
  }

  /**
   * 音声認識が利用可能かどうか
   */
  static isAvailable(): boolean {
    interface WindowWithSpeechRecognition {
      SpeechRecognition?: any;
      webkitSpeechRecognition?: any;
    }
    const win = window as unknown as WindowWithSpeechRecognition;
    const SpeechRecognition = win.SpeechRecognition || win.webkitSpeechRecognition;
    return !!SpeechRecognition;
  }
}

/**
 * WindowsHキーでの音声入力（ブラウザの制約により完全対応は困難だが、可能な範囲で実装）
 *
 * 注意: WindowsHキーはOSレベルのショートカットのため、ブラウザから直接制御することはできません。
 * 代わりに、マイクボタンをクリックするか、カスタムショートカットキー（例: Ctrl+Shift+V）を使用します。
 */
export function setupVoiceInputShortcut(
  onStart: () => void,
  shortcutKey: string = 'v', // デフォルト: Ctrl+Shift+V
  modifiers: { ctrl?: boolean; shift?: boolean; alt?: boolean } = { ctrl: true, shift: true }
): void {
  document.addEventListener('keydown', (event) => {
    const isShortcut =
      event.key.toLowerCase() === shortcutKey.toLowerCase() &&
      (!modifiers.ctrl || event.ctrlKey) &&
      (!modifiers.shift || event.shiftKey) &&
      (!modifiers.alt || event.altKey);

    if (isShortcut) {
      event.preventDefault();
      onStart();
    }
  });
}
