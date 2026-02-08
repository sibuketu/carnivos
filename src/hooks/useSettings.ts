/**
 * CarnivOS - Settings Hook
 *
 * アプリ設定の管理（Local Storage）
 */

import { useState, useEffect } from 'react';

export const useSettings = () => {
  // すべてのuseStateを最初に定義（React Hooksのルール）
  const [showKnowledge, setShowKnowledge] = useState(() => {
    const saved = localStorage.getItem('settings_show_knowledge');
    return saved ? JSON.parse(saved) : false;
  });

  const [showNutrientPreview, setShowNutrientPreview] = useState(() => {
    const saved = localStorage.getItem('settings_show_nutrient_preview');
    return saved ? JSON.parse(saved) : true; // デフォルトは true
  });

  const [fontSize, setFontSizeState] = useState<'small' | 'medium' | 'large' | 'xlarge'>(() => {
    const saved = localStorage.getItem('app_font_size');
    return (saved as 'small' | 'medium' | 'large' | 'xlarge') || 'medium';
  });

  const [debugMode, setDebugModeState] = useState(() => {
    const saved = localStorage.getItem('settings_debug_mode');
    return saved !== null ? JSON.parse(saved) : true; // デフォルトON
  });

  const [darkMode, setDarkModeState] = useState(() => {
    const saved = localStorage.getItem('settings_dark_mode');
    return saved ? JSON.parse(saved) : false;
  });

  const [aiMode, setAiModeState] = useState<'purist' | 'realist'>(() => {
    const saved = localStorage.getItem('settings_ai_mode');
    return (saved as 'purist' | 'realist') || 'purist';
  });

  const [tipsEnabled, setTipsEnabledState] = useState(() => {
    const saved = localStorage.getItem('primal_logic_tips_enabled');
    return saved !== null ? JSON.parse(saved) : true; // デフォルトON
  });

  // すべての関数を定義
  const toggleKnowledge = () => {
    const newValue = !showKnowledge;
    setShowKnowledge(newValue);
    localStorage.setItem('settings_show_knowledge', JSON.stringify(newValue));
  };

  const toggleNutrientPreview = () => {
    const newValue = !showNutrientPreview;
    setShowNutrientPreview(newValue);
    localStorage.setItem('settings_show_nutrient_preview', JSON.stringify(newValue));
  };

  const setFontSize = (size: 'small' | 'medium' | 'large' | 'xlarge') => {
    setFontSizeState(size);
    localStorage.setItem('app_font_size', size);
    // フォントサイズを直接適用
    const fontSizeValue =
      size === 'small' ? '14px' : size === 'medium' ? '16px' : size === 'large' ? '18px' : '20px';
    document.documentElement.style.setProperty('--app-font-size', fontSizeValue);
    document.body.style.fontSize = fontSizeValue;
    const rootElement = document.getElementById('root');
    if (rootElement) {
      rootElement.style.fontSize = fontSizeValue;
    }
  };

  const toggleDebugMode = () => {
    const newValue = !debugMode;
    setDebugModeState(newValue);
    localStorage.setItem('settings_debug_mode', JSON.stringify(newValue));
    // デバッグモード切り替え時にカスタムイベントを発火（リロード不要）
    window.dispatchEvent(new CustomEvent('debugModeChanged'));
    // 念のため、ページをリロード（確実に反映させるため）
    window.location.reload();
  };

  const toggleDarkMode = () => {
    const newValue = !darkMode;
    setDarkModeState(newValue);
    localStorage.setItem('settings_dark_mode', JSON.stringify(newValue));

    // テーマを適用
    if (newValue) {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  };

  const setAiMode = (mode: 'purist' | 'realist') => {
    setAiModeState(mode);
    localStorage.setItem('settings_ai_mode', mode);
  };

  const toggleTips = () => {
    const newValue = !tipsEnabled;
    setTipsEnabledState(newValue);
    localStorage.setItem('primal_logic_tips_enabled', JSON.stringify(newValue));
  };

  // すべてのuseEffectを最後に定義
  useEffect(() => {
    const savedKnowledge = localStorage.getItem('settings_show_knowledge');
    if (savedKnowledge !== null) {
      setShowKnowledge(JSON.parse(savedKnowledge));
    }

    const savedPreview = localStorage.getItem('settings_show_nutrient_preview');
    if (savedPreview !== null) {
      setShowNutrientPreview(JSON.parse(savedPreview));
    } else {
      // 初回はデフォルト値（true）を保存
      localStorage.setItem('settings_show_nutrient_preview', JSON.stringify(true));
    }
  }, []);

  useEffect(() => {
    const applyFontSize = (size: 'small' | 'medium' | 'large' | 'xlarge') => {
      const fontSizeValue =
        size === 'small' ? '14px' : size === 'medium' ? '16px' : size === 'large' ? '18px' : '20px';
      document.documentElement.style.setProperty('--app-font-size', fontSizeValue);
      document.body.style.fontSize = fontSizeValue;
      const rootElement = document.getElementById('root');
      if (rootElement) {
        rootElement.style.fontSize = fontSizeValue;
      }
    };

    const savedFontSize = localStorage.getItem('app_font_size') as
      | 'small'
      | 'medium'
      | 'large'
      | 'xlarge'
      | null;
    if (savedFontSize) {
      setFontSizeState(savedFontSize);
      applyFontSize(savedFontSize);
    } else {
      // デフォルト値を設定
      setFontSizeState('medium');
      applyFontSize('medium');
    }
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem('settings_debug_mode');
    if (saved !== null) {
      setDebugModeState(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem('settings_dark_mode');
    const isDark = saved ? JSON.parse(saved) : false;
    if (isDark) {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem('settings_ai_mode');
    if (saved) {
      setAiModeState(saved as 'purist' | 'realist');
    }
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem('primal_logic_tips_enabled');
    if (saved !== null) {
      setTipsEnabledState(JSON.parse(saved));
    } else {
      // 初回はデフォルト値（true）を保存
      localStorage.setItem('primal_logic_tips_enabled', JSON.stringify(true));
    }
  }, []);

  return {
    showKnowledge,
    toggleKnowledge,
    showNutrientPreview,
    toggleNutrientPreview,
    fontSize,
    setFontSize,
    debugMode,
    toggleDebugMode,
    darkMode,
    toggleDarkMode,
    aiMode,
    setAiMode,
    tipsEnabled,
    toggleTips,
  };
};
