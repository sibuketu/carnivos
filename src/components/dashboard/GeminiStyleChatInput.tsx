/**
 * Gemini Style Chat Input - Gemini風のチャット入力UI
 *
 * 大きな入力フィールド、ツールメニュー、思考モード選択を含む
 */

import { useState, useRef, useEffect } from 'react';
import { useSettings } from '../../hooks/useSettings';

interface GeminiStyleChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onVoiceInput: () => void;
  isVoiceInputActive: boolean;
  isLoading: boolean;
  placeholder?: string;
  onFileUpload?: (file: File) => void;
  onPhotoClick?: () => void;
}

export default function GeminiStyleChatInput({
  value,
  onChange,
  onSend,
  onVoiceInput,
  isVoiceInputActive,
  isLoading,
  placeholder = 'CarnivOS に相談',
  onFileUpload,
  onPhotoClick: _onPhotoClick,
}: GeminiStyleChatInputProps) {
  const { aiMode: _aiMode } = useSettings();
  const [thinkingMode, _setThinkingMode] = useState<'fast' | 'auto' | 'deep'>(() => {
    const saved = localStorage.getItem('ai_thinking_mode');
    return (saved as 'fast' | 'auto' | 'deep') || 'auto';
  });
  const [_showFileMenu, setShowFileMenu] = useState(false);
  const [_showThinkingModeMenu, setShowThinkingModeMenu] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const fileMenuRef = useRef<HTMLDivElement>(null);
  const thinkingModeMenuRef = useRef<HTMLDivElement>(null);

  // 思考モードをlocalStorageに保存
  useEffect(() => {
    localStorage.setItem('ai_thinking_mode', thinkingMode);
  }, [thinkingMode]);

  // クリックアウトサイドでメニューを閉じる
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (fileMenuRef.current && !fileMenuRef.current.contains(event.target as Node)) {
        setShowFileMenu(false);
      }
      if (thinkingModeMenuRef.current && !thinkingModeMenuRef.current.contains(event.target as Node)) {
        setShowThinkingModeMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const _handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onFileUpload) {
      onFileUpload(file);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setShowFileMenu(false);
  };

  const _thinkingModeLabels = {
    fast: 'Fast',
    auto: 'Auto',
    deep: 'Deep',
  };

  const _thinkingModeDescriptions = {
    fast: 'Quick, concise answers',
    auto: 'Smart detection (default)',
    deep: 'Detailed analysis with evidence',
  };

  return (
    <div
      style={{
        width: '100%',
        maxWidth: '800px',
        margin: '0 auto',
        padding: '1rem',
        backgroundColor: '#f9fafb',
        borderRadius: '24px',
        border: '1px solid #e5e7eb',
        position: 'relative',
      }}
    >
      {/* メイン入力エリア */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          backgroundColor: 'var(--color-bg-primary)',
          borderRadius: '20px',
          padding: '0.75rem 1rem',
          border: '1px solid #e5e7eb',
          minHeight: '56px',
        }}
      >
        {/* 入力フィールド */}
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey && !isLoading) {
              e.preventDefault();
              onSend();
            }
          }}
          onInput={(e) => {
            const target = e.target as HTMLTextAreaElement;
            target.style.height = 'auto';
            target.style.height = `${Math.min(target.scrollHeight, 200)}px`;
          }}
          style={{
            flex: 1,
            border: 'none',
            outline: 'none',
            fontSize: '16px',
            fontFamily: 'inherit',
            resize: 'none',
            minHeight: '24px',
            maxHeight: '200px',
            backgroundColor: 'transparent',
            color: '#111827',
            lineHeight: '1.5',
            padding: '0.25rem 0',
          }}
          rows={1}
        />

        {/* マイクアイコン（音声入力） */}
        <button
          onClick={onVoiceInput}
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            border: 'none',
            backgroundColor: isVoiceInputActive ? '#dc2626' : 'transparent',
            color: isVoiceInputActive ? 'white' : '#374151',
            fontSize: '20px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            if (!isVoiceInputActive) {
              e.currentTarget.style.backgroundColor = '#f3f4f6';
            }
          }}
          onMouseLeave={(e) => {
            if (!isVoiceInputActive) {
              e.currentTarget.style.backgroundColor = 'transparent';
            }
          }}
          title={isVoiceInputActive ? '音声入力を停止' : '音声入力を開始'}
        >
          🎤
        </button>
      </div>

      {/* モバイル対応: ボトムシート形式のメニュー */}
      <style>{`
        @media (max-width: 768px) {
          /* モバイルではドロップダウンをボトムシート形式に変更 */
        }
      `}</style>
    </div>
  );
}

