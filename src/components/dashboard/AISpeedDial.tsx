/**
 * AI Speed Dial - 複数のAI機能にアクセスする展開式ボタン
 * 
 * 右下に配置され、タップすると3つのAI機能（Photo, Chat, Voice）が展開される
 */

import { useState, useEffect, useRef } from 'react';
import { VoiceInputManager } from '../../utils/voiceInput';
import type { TodoItem, FoodItem } from '../../types';
import { useApp } from '../../context/AppContext';
import { getRandomTip, getRandomTipExcluding, TIPS_DATA } from '../../data/tips';
import type { Tip } from '../../data/tips';
import { saveTip, unsaveTip, isTipSaved } from '../../utils/savedTips';
import { useSettings } from '../../hooks/useSettings';
import { logError, getUserFriendlyErrorMessage } from '../../utils/errorHandler';
import FoodEditModal from './FoodEditModal';
import BarcodeScannerModal from '../BarcodeScannerModal';
import '../../styles/ai-chat.css';

interface AISpeedDialProps {
  onOpenFatTab?: () => void;
  onAddFood?: (foodItem: FoodItem) => void;
}

export default function AISpeedDial({
  onOpenFatTab,
  onAddFood
}: AISpeedDialProps = {}) {
  const { addFood, userProfile } = useApp();
  const { aiMode, setAiMode } = useSettings();
  const [chatUIMode, setChatUIMode] = useState<'modal' | 'bubble' | 'browse'>(() => {
    // localStorageからUIモードを読み込む（デフォルトはbubble）
    const saved = localStorage.getItem('ai_chat_ui_mode');
    return (saved === 'modal' || saved === 'bubble' || saved === 'browse') ? saved : 'bubble';
  });
  const [bubblePosition, setBubblePosition] = useState<{ x: number; y: number }>(() => {
    // localStorageから位置を読み込む
    const saved = localStorage.getItem('ai_chat_bubble_position');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return { x: window.innerWidth - 280 - 20, y: window.innerHeight - 400 - 100 };
      }
    }
    return { x: window.innerWidth - 280 - 20, y: window.innerHeight - 400 - 100 };
  });
  const [bubbleSize, setBubbleSize] = useState<{ width: number; height: number }>(() => {
    // localStorageからサイズを読み込む
    const saved = localStorage.getItem('ai_chat_bubble_size');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // 最小・最大サイズの範囲内に収める
        const minWidth = 180;
        const minHeight = 220;
        const maxWidth = window.innerWidth; // 全画面対応（余白なし）
        const maxHeight = window.innerHeight; // 全画面対応（余白なし）
        return {
          width: Math.max(minWidth, Math.min(maxWidth, parsed.width || 280)),
          height: Math.max(minHeight, Math.min(maxHeight, parsed.height || 400)),
        };
      } catch {
        return { width: 280, height: 400 };
      }
    }
    return { width: 280, height: 400 };
  });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeCorner, setResizeCorner] = useState<'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [resizeOffset, setResizeOffset] = useState({ x: 0, y: 0 });
  const bubbleRef = useRef<HTMLDivElement>(null);

  // ai-chat-fab-buttonの位置とドラッグ状態
  const [fabButtonPosition, setFabButtonPosition] = useState<{ x: number; y: number }>(() => {
    const saved = localStorage.getItem('ai_chat_fab_position');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return { x: window.innerWidth - 80, y: window.innerHeight - 100 };
      }
    }
    return { x: window.innerWidth - 80, y: window.innerHeight - 100 };
  });
  const [isDraggingFab, setIsDraggingFab] = useState(false);
  const [fabDragOffset, setFabDragOffset] = useState({ x: 0, y: 0 });
  const [fabDragStartPos, setFabDragStartPos] = useState({ x: 0, y: 0 }); // ドラッグ開始位置を記録
  const fabHasMovedRef = useRef(false); // ドラッグで移動したかどうか（最新値を保持）
  const fabButtonRef = useRef<HTMLButtonElement>(null);
  const [showImageConfirm, setShowImageConfirm] = useState(false);
  const [pendingFoodItem, setPendingFoodItem] = useState<any>(null);
  const [showButterConfirm, setShowButterConfirm] = useState(false);
  const [showAIConcierge, setShowAIConcierge] = useState(false);
  const [conciergeData, setConciergeData] = useState<{
    saltUsed: boolean;
    saltType: string;
    saltAmount: number; // 塩の量（g）
    fatTrimmed: number; // 脂身の取り除き率（0-100%）
    cookingMethod: 'raw' | 'grilled' | 'boiled' | 'other';
    butterUsed: boolean; // バター/牛脂の使用
    additionalFoods: Array<{ name: string; amount: number; unit: 'g' | '個' }>; // 写真で認識不可能な食品（自由入力）
  }>({
    saltUsed: false,
    saltType: 'ぬちまーす',
    saltAmount: 0,
    fatTrimmed: 0, // 0-100%の範囲
    cookingMethod: 'grilled',
    butterUsed: false,
    additionalFoods: [],
  });

  const [showAdditionalFoodModal, setShowAdditionalFoodModal] = useState(false);
  const [additionalFoodName, setAdditionalFoodName] = useState<string>('');
  const [additionalFoodAmount, setAdditionalFoodAmount] = useState<number>(0);
  const [additionalFoodUnit, setAdditionalFoodUnit] = useState<'g' | '個'>('g');
  const [isAnalyzingImage, setIsAnalyzingImage] = useState(false);
  const [imageAnalysisError, setImageAnalysisError] = useState<string | null>(null);

  // Gemini-style UI: "+"ボタンのドロップダウン
  const [showPlusMenu, setShowPlusMenu] = useState(false);
  const plusMenuRef = useRef<HTMLDivElement>(null);

  // Gemini-style UI: "ツール"ボタンのドロップダウン
  const [showToolsMenu, setShowToolsMenu] = useState(false);
  const toolsMenuRef = useRef<HTMLDivElement>(null);

  // バーコードスキャナー
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false);

  // AI Mode selection (Fast / Auto / Deep)
  const [thinkingMode, setThinkingMode] = useState<'fast' | 'auto' | 'deep'>('auto');
  const [showThinkingModeMenu, setShowThinkingModeMenu] = useState(false);
  const thinkingModeMenuRef = useRef<HTMLDivElement>(null);

  // メニュー外クリックで閉じる
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (plusMenuRef.current && !plusMenuRef.current.contains(e.target as Node)) {
        setShowPlusMenu(false);
      }
      if (toolsMenuRef.current && !toolsMenuRef.current.contains(e.target as Node)) {
        setShowToolsMenu(false);
      }
      if (thinkingModeMenuRef.current && !thinkingModeMenuRef.current.contains(e.target as Node)) {
        setShowThinkingModeMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // アルバムから選択
  const handleAlbumPicker = async () => {
    setShowPlusMenu(false);
    try {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      // カメラではなくアルバムを優先（captureを設定しない）

      input.onchange = async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) {
          // 写真解析と同じ処理を実行
          await processImageFile(file);
        }
      };

      input.click();
    } catch (error) {
      logError(error, { component: 'AISpeedDial', action: 'handleAlbumPicker' });
      alert('アルバムの選択に失敗しました。');
    }
  };

  // ファイルアップロード（CSV、テキストなど）
  const handleFileUpload = async () => {
    setShowPlusMenu(false);
    try {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.csv,.txt,.json';

      input.onchange = async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) {
          // ファイル処理（将来実装：血液検査結果CSV等）
          alert(`ファイルアップロード機能は今後実装予定です。\n選択されたファイル: ${file.name}`);
        }
      };

      input.click();
    } catch (error) {
      logError(error, { component: 'AISpeedDial', action: 'handleFileUpload' });
      alert('ファイルの選択に失敗しました。');
    }
  };

  // バーコード読み取り
  const handleBarcodeScanner = () => {
    setShowPlusMenu(false);
    setShowBarcodeScanner(true);
  };

  // ツールメニュー: Deep Research
  const handleDeepResearch = () => {
    setShowToolsMenu(false);
    setChatInput('カーニボアについて深く調べてください。');
    // モーダルまたはバブルを開く
    if (chatUIMode === 'modal') {
      setShowChatModal(true);
    } else {
      setBubbleSize({ width: 400, height: 600 });
    }
  };

  // ツールメニュー: ガイド付き学習
  const handleGuidedLearning = () => {
    setShowToolsMenu(false);
    setChatInput('カーニボアダイエットの移行ガイドを教えてください。');
    // モーダルまたはバブルを開く
    if (chatUIMode === 'modal') {
      setShowChatModal(true);
    } else {
      setBubbleSize({ width: 400, height: 600 });
    }
  };

  // ツールメニュー: 症状推論
  const handleSymptomInference = () => {
    setShowToolsMenu(false);
    setChatInput('最近の記録から、私の症状の原因を推論してください。');
    // モーダルまたはバブルを開く
    if (chatUIMode === 'modal') {
      setShowChatModal(true);
    } else {
      setBubbleSize({ width: 400, height: 600 });
    }
  };

  // ツールメニュー: 誠実さスコア確認
  const handleHonestyScore = () => {
    setShowToolsMenu(false);
    setChatInput('私の記録の誠実さスコアを確認してください。');
    // モーダルまたはバブルを開く
    if (chatUIMode === 'modal') {
      setShowChatModal(true);
    } else {
      setBubbleSize({ width: 400, height: 600 });
    }
  };

  // 画像ファイル処理（写真・アルバム共通）
  const processImageFile = async (file: File) => {
    setIsAnalyzingImage(true);
    setImageAnalysisError(null);

    try {
      // Gemini Vision APIで画像解析
      const { analyzeFoodImage } = await import('../../services/aiService');
      const result = await analyzeFoodImage(file);

      // 食品マスターデータから栄養素を取得
      const { getFoodMasterItem } = await import('../../data/foodMaster');

      // 食品名からマスターデータを検索（完全実装版）
      const { searchFoodMasterByName } = await import('../../data/foodMaster');
      let masterItem = searchFoodMasterByName(result.foodName);

      // 見つからない場合は、typeに基づいてデフォルトを設定
      if (!masterItem) {
        if (result.type === 'ruminant' || result.type === 'animal') {
          masterItem = getFoodMasterItem('beef', 'ribeye');
        } else if (result.type === 'dairy') {
          masterItem = getFoodMasterItem('dairy', 'butter');
        } else {
          masterItem = getFoodMasterItem('beef', 'ribeye'); // デフォルト
        }
      }

      const ratio = result.estimatedWeight / 100;

      // 栄養素キー名のマッピング（AIが返すキー名 → FoodItemのキー名）
      const nutrientKeyMap: Record<string, string> = {
        'protein': 'protein',
        'fat': 'fat',
        'carbs': 'carbs',
        'fiber': 'fiber',
        'sodium': 'sodium',
        'potassium': 'potassium',
        'magnesium': 'magnesium',
        'zinc': 'zinc',
        'iron': 'iron',
        'calcium': 'calcium',
        'phosphorus': 'phosphorus',
        'selenium': 'selenium',
        'copper': 'copper',
        'manganese': 'manganese',
        'vitaminA': 'vitaminA',
        'vitaminD': 'vitaminD',
        'vitaminE': 'vitaminE',
        'vitaminK': 'vitaminK',
        'vitaminK2': 'vitaminK2',
        'vitaminB1': 'vitaminB1',
        'vitaminB2': 'vitaminB2',
        'vitaminB3': 'vitaminB3',
        'vitaminB5': 'vitaminB5',
        'vitaminB6': 'vitaminB6',
        'vitaminB7': 'vitaminB7',
        'vitaminB9': 'vitaminB9',
        'vitaminB12': 'vitaminB12',
        'vitaminC': 'vitaminC',
        'choline': 'choline',
        'taurine': 'taurine',
        'iodine': 'iodine',
        'omega3': 'omega3',
        'omega6': 'omega6',
        'glycine': 'glycine',
        'methionine': 'methionine',
        'chromium': 'chromium',
        'molybdenum': 'molybdenum',
        'boron': 'boron',
        'vanadium': 'vanadium',
      };

      // マスターデータから基本栄養素を取得
      const baseNutrients: Partial<FoodItem['nutrients']> = masterItem ? {
        protein: (masterItem.protein?.value || 0) * ratio,
        fat: (masterItem.fat?.value || 0) * ratio,
        carbs: (masterItem.carbs?.value || 0) * ratio,
        netCarbs: (masterItem.carbs?.value || 0) * ratio,
        zinc: (masterItem.zinc?.value || 0) * ratio,
        sodium: (masterItem.sodium?.value || 0) * ratio,
        magnesium: (masterItem.magnesium?.value || 0) * ratio,
        hemeIron: (masterItem.iron?.value || 0) * ratio,
        nonHemeIron: 0,
        vitaminB12: (masterItem.vitamin_b12?.value || 0) * ratio,
        potassium: (masterItem.potassium?.value || 0) * ratio,
        calcium: (masterItem.calcium?.value || 0) * ratio,
        phosphorus: (masterItem.phosphorus?.value || 0) * ratio,
        vitaminA: (masterItem.vitamin_a?.value || 0) * ratio,
        vitaminD: (masterItem.vitamin_d?.value || 0) * ratio,
        vitaminK2: (masterItem.vitamin_k2?.value || 0) * ratio,
        omega3: (masterItem.omega_3?.value || 0) * ratio,
        omega6: (masterItem.omega_6?.value || 0) * ratio,
        choline: (masterItem.choline?.value || 0) * ratio,
        iodine: (masterItem.iodine?.value || 0) * ratio,
        vitaminB7: (masterItem.vitamin_b7?.value || 0) * ratio,
        glycine: (masterItem.glycine?.value || 0) * ratio,
        methionine: (masterItem.methionine?.value || 0) * ratio,
      } : {};

      // AIが返した栄養素をマッピングして追加（マスターデータを上書き）
      const aiNutrients: Partial<FoodItem['nutrients']> = {};
      if (result.nutrients) {
        Object.entries(result.nutrients).forEach(([key, value]) => {
          const mappedKey = nutrientKeyMap[key] || key;
          if (mappedKey && typeof value === 'number') {
            (aiNutrients as Record<string, number>)[mappedKey] = value * ratio;
          }
        });
      }

      const foodItem: FoodItem = {
        item: result.foodName,
        amount: result.estimatedWeight,
        unit: 'g' as const,
        type: 'ruminant' as const,
        nutrients: { ...baseNutrients, ...aiNutrients },
      };

      if (masterItem) {
        const ratio = result.estimatedWeight / 100;
        foodItem.nutrients = {
          protein: (masterItem.protein?.value || 0) * ratio,
          fat: (masterItem.fat?.value || 0) * ratio,
          carbs: 0,
          netCarbs: 0,
          zinc: (masterItem.zinc?.value || 0) * ratio,
          sodium: (masterItem.sodium?.value || 0) * ratio,
          magnesium: (masterItem.magnesium?.value || 0) * ratio,
          hemeIron: (masterItem.iron?.value || 0) * ratio,
          nonHemeIron: 0,
          vitaminB12: (masterItem.vitamin_b12?.value || 0) * ratio,
        };
      }

      // onAddFoodが存在しない場合はエラー
      if (!onAddFood) {
        alert('エラー: 食品追加機能が利用できません。ページを再読み込みしてください。');
      return;
    }

      // AI Conciergeインタビューを表示（Master Specification準拠）
      setPendingFoodItem(foodItem);
      setShowAIConcierge(true);
      setIsAnalyzingImage(false);
    } catch (error) {
      setIsAnalyzingImage(false);
      logError(error, { component: 'AISpeedDial', action: 'processImageFile' });
      const errorMessage = getUserFriendlyErrorMessage(error) || '画像解析に失敗しました。';
      setImageAnalysisError(errorMessage);

      // エラーダイアログを表示（リトライ可能）
      const retry = confirm(`${errorMessage}\n\nリトライしますか？`);
      if (retry) {
        // リトライ: 再度写真撮影を開始
        setTimeout(() => {
          handlePhoto();
        }, 100);
      }
    }
  };

  const handlePhoto = async () => {
    setShowPlusMenu(false);
    setImageAnalysisError(null);

    try {
      // ファイル入力を作成
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.capture = 'environment'; // カメラを優先

      input.onchange = async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) {
          await processImageFile(file);
        }
      };

      input.click();
    } catch (error) {
      logError(error, { component: 'AISpeedDial', action: 'handlePhoto' });
      const errorMessage = getUserFriendlyErrorMessage(error) || '写真の取得に失敗しました。';
      setImageAnalysisError(errorMessage);
      alert(errorMessage);
    }
  };


  // 音声入力はMagic Inputの横に移動したため、Speed Dialから削除

  const [showChatUI, setShowChatUI] = useState(false);

  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [isVoiceInputActive, setIsVoiceInputActive] = useState(false);
  const voiceInputManagerRef = useRef<VoiceInputManager | null>(null);

  const handleChat = () => {
    setShowChatUI(true);
  };

  // 音声入力の初期化
  useEffect(() => {
    if (VoiceInputManager.isAvailable()) {
      voiceInputManagerRef.current = new VoiceInputManager({
        language: 'ja-JP',
        continuous: false,
        interimResults: true,
      });

      voiceInputManagerRef.current.onResult((result) => {
        if (result.isFinal) {
          setChatInput(result.text);
          setIsVoiceInputActive(false);
          voiceInputManagerRef.current?.stop();
        } else {
          // 中間結果も表示（オプション）
          setChatInput(result.text);
        }
      });

      voiceInputManagerRef.current.onError((error) => {
        logError(error, { component: 'AISpeedDial', action: 'voiceInput' });
        setIsVoiceInputActive(false);
        const errorMessage = getUserFriendlyErrorMessage(error) || `音声入力エラー: ${error}`;
        alert(errorMessage);
      });

      voiceInputManagerRef.current.onEnd(() => {
        setIsVoiceInputActive(false);
      });
    }

    return () => {
      if (voiceInputManagerRef.current) {
        voiceInputManagerRef.current.stop();
      }
    };
  }, []);

  const handleVoiceInput = () => {
    if (!voiceInputManagerRef.current) {
      alert('お使いのブラウザでは音声入力がサポートされていません。');
      return;
    }

    if (isVoiceInputActive) {
      voiceInputManagerRef.current.stop();
      setIsVoiceInputActive(false);
    } else {
      try {
        voiceInputManagerRef.current.start();
        setIsVoiceInputActive(true);
      } catch (error) {
        logError(error, { component: 'AISpeedDial', action: 'startVoiceInput' });
        const errorMessage = getUserFriendlyErrorMessage(error) || '音声入力の開始に失敗しました。';
        alert(errorMessage);
      }
    }
  };

  const [currentTodos, setCurrentTodos] = useState<Array<{ id: string; todos: TodoItem[] }>>([]);
  const [loadingTip, setLoadingTip] = useState<Tip | null>(null);
  const [displayedTip, setDisplayedTip] = useState<Tip | null>(null); // AI回答後も保持するTips
  const [previousTips, setPreviousTips] = useState<Tip[]>([]); // 表示したTipsの履歴（戻るボタン用）
  const [isTipSavedState, setIsTipSavedState] = useState(false);

  // チャット画面が開いたときに初期Tipsを表示
  useEffect(() => {
    if (showChatUI && !displayedTip) {
      const initialTip = getRandomTip();
      setDisplayedTip(initialTip);
      setIsTipSavedState(isTipSaved(initialTip.id));
    }
  }, [showChatUI]); // displayedTipを依存配列から削除（無限ループ防止）

  // シェア機能
  const handleShareTip = async (tip: Tip) => {
    const shareText = `Did you know? ${tip.title}\n\n${tip.content} #PrimalLogic`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Primal Logic Tip',
          text: shareText,
        });
      } catch (err) {
        if (import.meta.env.DEV) {
          console.log('Share cancelled');
        }
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareText);
        alert('クリップボードにコピーしました！');
      } catch (err) {
        logError(err, { component: 'AISpeedDial', action: 'copyToClipboard' });
        alert('クリップボードへのコピーに失敗しました。');
      }
    }
  };

  // TipCardコンポーネント（内部定義）
  const TipCard = ({ tip, onNextTip, onPrevTip, onToggleSave, isSaved, canGoBack }: {
    tip: Tip;
    onNextTip: () => void;
    onPrevTip: () => void;
    onToggleSave: (tipId: string, isSaved: boolean) => void;
    isSaved: boolean;
    canGoBack: boolean;
  }) => {
    const tipIndex = TIPS_DATA.findIndex(t => t.id === tip.id);
    const tipNumber = tipIndex >= 0 ? tipIndex + 1 : 0;

    return (
      <div className="ai-chat-tips-card">
        <div className="ai-chat-tips-header">
          <div className="ai-chat-tips-title">
            💡 {tip.title}
            <span style={{ fontSize: '12px', color: '#6b7280', marginLeft: '0.5rem', fontWeight: 'normal' }}>
              ({tipNumber} / {TIPS_DATA.length})
            </span>
          </div>
          <button
            onClick={() => onToggleSave(tip.id, isSaved)}
            className={`ai-chat-tips-save-button ${isSaved ? 'saved' : ''}`}
            title={isSaved ? '保存済み' : '保存する'}
          >
            {isSaved ? '⭐' : '☆'}
          </button>
        </div>
        <div className="ai-chat-tips-content">
          {tip.content}
        </div>
        <div className="ai-chat-tips-footer">
          {canGoBack && (
            <button
              onClick={onPrevTip}
              style={{
                padding: '6px 12px',
                backgroundColor: '#f3f4f6',
                border: 'none',
                borderRadius: '4px',
                fontSize: '12px',
                cursor: 'pointer',
                color: '#374151',
                marginRight: '0.5rem',
              }}
            >
              ← 戻る
            </button>
          )}
          <button
            onClick={onNextTip}
            className="ai-chat-tips-next-button"
          >
            次のTipsを見る →
          </button>
          <button
            onClick={() => handleShareTip(tip)}
            style={{
              padding: '6px 12px',
              backgroundColor: '#fee2e2',
              border: 'none',
              borderRadius: '4px',
              fontSize: '12px',
              cursor: 'pointer',
              color: '#dc2626',
              marginLeft: '0.5rem',
            }}
            title="SNSでシェア"
          >
            📤 Share
          </button>
        </div>
      </div>
    );
  };

  const handleSendChatMessage = async () => {
    if (!chatInput.trim() || isChatLoading) return;

    const userMessage = chatInput.trim();
    setChatInput('');
    setChatMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsChatLoading(true);

    // ローディング中のTipsを表示
    const randomTip = displayedTip ? getRandomTipExcluding(displayedTip.id) : getRandomTip();
    setLoadingTip(randomTip);
    setDisplayedTip(randomTip); // 表示中のTipを保持
    setIsTipSavedState(isTipSaved(randomTip.id));

    try {
      if (import.meta.env.DEV) {
        console.log('Sending chat message:', userMessage);
      }

      // AIチャットにユーザープロファイル、日記、過去の食事記録を常に渡す
      // これにより、「3日前何食べたっけ？」「身長は？」などの質問にも対応可能
      const { getDailyLogs } = await import('../../utils/storage');
      const logs = await getDailyLogs();

      // 過去の日記と食生活データを準備（取得可能な全てのデータを使用）
      const diaryAndFoodData: { logs: Array<{ date: string; diary?: string; foods: string[] }> } = {
        logs: logs.map(log => ({
          date: log.date,
          diary: log.diary,
          foods: log.fuel.map(f => f.item),
        })),
      };

      // Gemini APIを使用してAI応答を取得（構造化レスポンス版を使用）
      // ユーザープロファイルと過去の食事記録を常に渡す
      const { chatWithAIStructured } = await import('../../services/aiService');
      const aiResponse = await chatWithAIStructured(userMessage, chatMessages, false, true, aiMode, thinkingMode, diaryAndFoodData, userProfile ? {
        height: userProfile.height,
        weight: userProfile.weight,
        age: userProfile.age,
        gender: userProfile.gender,
      } : undefined);
      if (import.meta.env.DEV) {
        console.log('Received AI response:', aiResponse.answer.substring(0, 100));
        if (aiResponse.todos && aiResponse.todos.length > 0) {
          console.log('Received Todos:', aiResponse.todos.length);
        }
      }

      setIsChatLoading(false);
      setLoadingTip(null); // ローディング中の表示は消すが、displayedTipは保持
      setChatMessages(prev => [...prev, { role: 'assistant', content: aiResponse.answer }]);

      // Todoがあれば保存
      if (aiResponse.todos && aiResponse.todos.length > 0) {
        setCurrentTodos(prev => [...prev, {
          id: `todos_${Date.now()}`,
          todos: aiResponse.todos!
        }]);
      }

      // Tips履歴に保存（症状に関する回答の場合）
      const { getRemedyBySymptom } = await import('../../data/remedyLogic');
      const symptomKeywords = ['頭痛', 'こむら返り', '便秘', '関節痛', 'ケトフル', '疲労'];
      const hasSymptomKeyword = symptomKeywords.some(keyword => userMessage.includes(keyword));

      if (hasSymptomKeyword) {
        const savedHistory = localStorage.getItem('primal_logic_tip_history');
        const history = savedHistory ? JSON.parse(savedHistory) : [];
        const tipEntry = {
          id: `chat_${Date.now()}`,
          title: userMessage.substring(0, 50),
          content: aiResponse.answer,
          category: '症状',
          viewed_at: new Date().toISOString(),
        };
        history.unshift(tipEntry);
        localStorage.setItem('primal_logic_tip_history', JSON.stringify(history.slice(0, 50)));
      }
    } catch (error) {
      logError(error, { component: 'AISpeedDial', action: 'handleChatSubmit' });
      setIsChatLoading(false);
      setLoadingTip(null); // ローディング中の表示は消すが、displayedTipは保持

      // より詳細なエラーメッセージを生成
      let errorMessage = 'サーバーエラーが発生しました。しばらくしてから再度お試しください。';

      if (error instanceof Error) {
        if (error.message.includes('APIキー') || error.message.includes('API key')) {
          errorMessage = 'Gemini APIキーが設定されていません。設定画面からAPIキーを設定してください。';
        } else if (error.message.includes('network') || error.message.includes('fetch')) {
          errorMessage = 'ネットワークエラーが発生しました。インターネット接続を確認してください。';
        } else if (error.message.includes('timeout')) {
          errorMessage = 'リクエストがタイムアウトしました。しばらくしてから再度お試しください。';
        } else if (error.message.includes('quota') || error.message.includes('rate limit')) {
          errorMessage = 'APIの利用制限に達しました。しばらくしてから再度お試しください。';
        } else {
          // その他のエラーは詳細を表示（開発環境のみ）
          if (import.meta.env.DEV) {
            errorMessage = `エラー: ${error.message}`;
          }
        }
      }

      setChatMessages(prev => [...prev, {
        role: 'assistant',
        content: errorMessage,
      }]);
    }
  };

  // 吹き出しのドラッグ処理
  const handleBubbleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (bubbleRef.current) {
      const rect = bubbleRef.current.getBoundingClientRect();
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      setDragOffset({
        x: clientX - rect.left,
        y: clientY - rect.top,
      });
      setIsDragging(true);
    }
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent | TouchEvent) => {
      e.preventDefault();
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

      const newX = Math.max(0, Math.min(window.innerWidth - bubbleSize.width, clientX - dragOffset.x));
      const newY = Math.max(0, Math.min(window.innerHeight - bubbleSize.height, clientY - dragOffset.y));

      setBubblePosition({ x: newX, y: newY });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchmove', handleMouseMove, { passive: false });
    window.addEventListener('touchend', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleMouseMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDragging, dragOffset, bubbleSize]);

  // ai-chat-fab-buttonのドラッグ処理
  const handleFabButtonMouseDown = (e: React.MouseEvent<HTMLButtonElement> | React.TouchEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (fabButtonRef.current) {
      const rect = fabButtonRef.current.getBoundingClientRect();
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      setFabDragOffset({
        x: clientX - rect.left,
        y: clientY - rect.top,
      });
      setFabDragStartPos({ x: clientX, y: clientY }); // ドラッグ開始位置を記録
      fabHasMovedRef.current = false; // リセット
      setIsDraggingFab(true);
    }
  };

  useEffect(() => {
    if (!isDraggingFab) return;

    const handleMouseMove = (e: MouseEvent | TouchEvent) => {
      e.preventDefault();
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

      // ドラッグ開始位置からの距離を計算
      const deltaX = Math.abs(clientX - fabDragStartPos.x);
      const deltaY = Math.abs(clientY - fabDragStartPos.y);
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      
      // 5px以上移動した場合はドラッグと判定
      if (distance > 5) {
        fabHasMovedRef.current = true;
      }

      const buttonSize = 59; // ai-chat-fab-buttonのサイズ
      const newX = Math.max(0, Math.min(window.innerWidth - buttonSize, clientX - fabDragOffset.x));
      const newY = Math.max(0, Math.min(window.innerHeight - buttonSize, clientY - fabDragOffset.y));

      setFabButtonPosition({ x: newX, y: newY });
    };

    const handleMouseUp = () => {
      setIsDraggingFab(false);
      // 状態はonClickでリセット
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchmove', handleMouseMove, { passive: false });
    window.addEventListener('touchend', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleMouseMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDraggingFab, fabDragOffset]);

  // fab-buttonの位置が変更されたらlocalStorageに保存
  useEffect(() => {
    if (!isDraggingFab && fabButtonPosition) {
      localStorage.setItem('ai_chat_fab_position', JSON.stringify(fabButtonPosition));
    }
  }, [fabButtonPosition, isDraggingFab]);

  // UIモードが変更されたらlocalStorageに保存
  useEffect(() => {
    localStorage.setItem('ai_chat_ui_mode', chatUIMode);
  }, [chatUIMode]);

  // 位置が変更されたらlocalStorageに保存
  useEffect(() => {
    if (!isDragging && bubblePosition) {
      localStorage.setItem('ai_chat_bubble_position', JSON.stringify(bubblePosition));
    }
  }, [bubblePosition, isDragging]);

  // サイズが変更されたらlocalStorageに保存
  useEffect(() => {
    if (!isResizing && bubbleSize) {
      localStorage.setItem('ai_chat_bubble_size', JSON.stringify(bubbleSize));
    }
  }, [bubbleSize, isResizing]);


  // 吹き出しのリサイズ処理（4つの角に対応）
  const handleBubbleResizeStart = (corner: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right') => (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (bubbleRef.current) {
      const rect = bubbleRef.current.getBoundingClientRect();
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

      // 角に応じてオフセットを計算
      if (corner === 'top-left') {
        setResizeOffset({
          x: clientX - rect.left,
          y: clientY - rect.top,
        });
      } else if (corner === 'top-right') {
        setResizeOffset({
          x: clientX - rect.right,
          y: clientY - rect.top,
        });
      } else if (corner === 'bottom-left') {
        setResizeOffset({
          x: clientX - rect.left,
          y: clientY - rect.bottom,
        });
      } else { // bottom-right
        setResizeOffset({
          x: clientX - rect.right,
          y: clientY - rect.bottom,
        });
      }

      setResizeCorner(corner);
      setIsResizing(true);
    }
  };

  useEffect(() => {
    if (!isResizing || !resizeCorner) return;

    const handleMouseMove = (e: MouseEvent | TouchEvent) => {
      e.preventDefault();
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

      if (bubbleRef.current) {
        const rect = bubbleRef.current.getBoundingClientRect();
        // 最小サイズ: 180px × 220px、最大サイズ: 画面幅の100% × 画面高さの100%（全画面対応）
        const minWidth = 180;
        const minHeight = 220;
        const maxWidth = window.innerWidth; // 全画面対応（余白なし）
        const maxHeight = window.innerHeight; // 全画面対応（余白なし）

        let newWidth = bubbleSize.width;
        let newHeight = bubbleSize.height;
        let newX = bubblePosition.x;
        let newY = bubblePosition.y;

        // 角に応じてリサイズ処理
        if (resizeCorner === 'top-left') {
          newWidth = Math.max(minWidth, Math.min(maxWidth, rect.right - clientX + resizeOffset.x));
          newHeight = Math.max(minHeight, Math.min(maxHeight, rect.bottom - clientY + resizeOffset.y));
          newX = clientX - resizeOffset.x;
          newY = clientY - resizeOffset.y;
        } else if (resizeCorner === 'top-right') {
          newWidth = Math.max(minWidth, Math.min(maxWidth, clientX - rect.left + resizeOffset.x));
          newHeight = Math.max(minHeight, Math.min(maxHeight, rect.bottom - clientY + resizeOffset.y));
          newY = clientY - resizeOffset.y;
        } else if (resizeCorner === 'bottom-left') {
          newWidth = Math.max(minWidth, Math.min(maxWidth, rect.right - clientX + resizeOffset.x));
          newHeight = Math.max(minHeight, Math.min(maxHeight, clientY - rect.top + resizeOffset.y));
          newX = clientX - resizeOffset.x;
        } else { // bottom-right
          newWidth = Math.max(minWidth, Math.min(maxWidth, clientX - rect.left + resizeOffset.x));
          newHeight = Math.max(minHeight, Math.min(maxHeight, clientY - rect.top + resizeOffset.y));
        }

        // 画面内に制限
        newX = Math.max(0, Math.min(window.innerWidth - newWidth, newX));
        newY = Math.max(0, Math.min(window.innerHeight - newHeight, newY));

        setBubbleSize({ width: newWidth, height: newHeight });
        setBubblePosition({ x: newX, y: newY });
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      setResizeCorner(null);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchmove', handleMouseMove, { passive: false });
    window.addEventListener('touchend', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleMouseMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [isResizing, resizeCorner, resizeOffset, bubbleSize, bubblePosition]);

  return (
    <>
      {/* Chat UI - モーダル or 吹き出し */}
      {showChatUI && (
        <>
          {chatUIMode === 'modal' ? (
            <>
              <div
                className="ai-chat-modal-overlay"
                onClick={() => setShowChatUI(false)}
                aria-label="チャットを閉じる"
              />
              <div
                className="ai-chat-modal"
                role="dialog"
                aria-label="AIチャット"
                aria-modal="false"
              >
                <div className="ai-chat-header">
                  <h3 className="ai-chat-header-title">AI Chat</h3>
                  <div className="ai-chat-header-actions">
                    {/* Browse mode toggle */}
                    <button
                      onClick={() => setChatUIMode('browse')}
                      className="ai-chat-ui-toggle-button"
                      title="Browse mode (view last response)"
                      style={{ fontSize: '12px', padding: '4px 8px' }}
                    >
                      Browse
                    </button>
                    {/* UI切り替えボタン */}
                    <button
                      onClick={() => setChatUIMode('bubble')}
                      className="ai-chat-ui-toggle-button"
                      title="Switch to bubble UI"
                    >
                      💬
        </button>

                    {/* AI Mode selection */}
                    <div ref={thinkingModeMenuRef} style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                      <button
                        onClick={() => setShowThinkingModeMenu(!showThinkingModeMenu)}
                        style={{
                          padding: '6px 12px',
                          backgroundColor: showThinkingModeMenu ? '#e5e7eb' : 'transparent',
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '13px',
                          transition: 'background-color 0.2s',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                        title="Select AI Mode"
                      >
                        {thinkingMode === 'fast' && '⚡ Fast'}
                        {thinkingMode === 'auto' && '🔷 Auto'}
                        {thinkingMode === 'deep' && '💎 Deep'}
                        <span style={{ marginLeft: '4px' }}>▼</span>
                      </button>
                      {showThinkingModeMenu && (
                        <div
                          style={{
                            position: 'absolute',
                            top: '100%',
                            right: 0,
                            marginTop: '8px',
                            backgroundColor: 'white',
                            borderRadius: '8px',
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                            minWidth: '200px',
                            zIndex: 1000,
                            overflow: 'hidden',
                          }}
                        >
                          <button
                            onClick={() => {
                              setThinkingMode('fast');
                              setShowThinkingModeMenu(false);
                            }}
                            style={{
                              width: '100%',
                              padding: '12px 16px',
                              backgroundColor: thinkingMode === 'fast' ? '#f3f4f6' : 'transparent',
                              border: 'none',
                              textAlign: 'left',
                              cursor: 'pointer',
                              fontSize: '14px',
                              transition: 'background-color 0.2s',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '4px',
                            }}
                            onMouseOver={(e) => {
                              if (thinkingMode !== 'fast') {
                                e.currentTarget.style.backgroundColor = '#f9fafb';
                              }
                            }}
                            onMouseOut={(e) => {
                              if (thinkingMode !== 'fast') {
                                e.currentTarget.style.backgroundColor = 'transparent';
                              }
                            }}
                          >
                            <div style={{ fontWeight: 'bold' }}>⚡ Fast</div>
                            <div style={{ fontSize: '12px', color: '#6b7280' }}>Quick, concise answers</div>
                          </button>
                          <button
                            onClick={() => {
                              setThinkingMode('auto');
                              setShowThinkingModeMenu(false);
                            }}
                            style={{
                              width: '100%',
                              padding: '12px 16px',
                              backgroundColor: thinkingMode === 'auto' ? '#f3f4f6' : 'transparent',
                              border: 'none',
                              textAlign: 'left',
                              cursor: 'pointer',
                              fontSize: '14px',
                              transition: 'background-color 0.2s',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '4px',
                            }}
                            onMouseOver={(e) => {
                              if (thinkingMode !== 'auto') {
                                e.currentTarget.style.backgroundColor = '#f9fafb';
                              }
                            }}
                            onMouseOut={(e) => {
                              if (thinkingMode !== 'auto') {
                                e.currentTarget.style.backgroundColor = 'transparent';
                              }
                            }}
                          >
                            <div style={{ fontWeight: 'bold' }}>🔷 Auto</div>
                            <div style={{ fontSize: '12px', color: '#6b7280' }}>Smart detection (default)</div>
                          </button>
                          <button
                            onClick={() => {
                              setThinkingMode('deep');
                              setShowThinkingModeMenu(false);
                            }}
                            style={{
                              width: '100%',
                              padding: '12px 16px',
                              backgroundColor: thinkingMode === 'deep' ? '#f3f4f6' : 'transparent',
                              border: 'none',
                              textAlign: 'left',
                              cursor: 'pointer',
                              fontSize: '14px',
                              transition: 'background-color 0.2s',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '4px',
                            }}
                            onMouseOver={(e) => {
                              if (thinkingMode !== 'deep') {
                                e.currentTarget.style.backgroundColor = '#f9fafb';
                              }
                            }}
                            onMouseOut={(e) => {
                              if (thinkingMode !== 'deep') {
                                e.currentTarget.style.backgroundColor = 'transparent';
                              }
                            }}
                          >
                            <div style={{ fontWeight: 'bold' }}>💎 Deep</div>
                            <div style={{ fontSize: '12px', color: '#6b7280' }}>Detailed analysis with evidence</div>
                          </button>
          </div>
        )}
      </div>

                    <button
                      onClick={() => setShowChatUI(false)}
                      className="ai-chat-close-button"
                    >
                      ×
                    </button>
            </div>
                </div>
                <div className="ai-chat-messages">
                  {chatMessages.length === 0 ? (
                    <div className="ai-chat-empty-state">
                      <p className="ai-chat-empty-state-text">
                        カーニボアダイエットに関する質問をどうぞ
                      </p>
                      <p className="ai-chat-empty-state-text" style={{ fontSize: '11px', color: '#6b7280', marginTop: '0.5rem', lineHeight: '1.5' }}>
                        アプリの使い方についても質問できます
                      </p>
                      {/* 初期表示時にもTipsを表示 */}
              {displayedTip && (
                        <TipCard
                          tip={displayedTip}
                          onNextTip={() => {
                            if (displayedTip) {
                              setPreviousTips(prev => [...prev, displayedTip]);
                            }
                            const nextTip = getRandomTipExcluding(displayedTip.id);
                            setDisplayedTip(nextTip);
                            setIsTipSavedState(isTipSaved(nextTip.id));
                          }}
                          onPrevTip={() => {
                            if (previousTips.length > 0) {
                              const prevTip = previousTips[previousTips.length - 1];
                              setPreviousTips(prev => prev.slice(0, -1));
                              setDisplayedTip(prevTip);
                              setIsTipSavedState(isTipSaved(prevTip.id));
                            }
                          }}
                          onToggleSave={(tipId, isSaved) => {
                            if (isSaved) {
                              unsaveTip(tipId);
                            } else {
                              saveTip(tipId);
                            }
                            setIsTipSavedState(!isSaved);
                          }}
                          isSaved={isTipSavedState}
                          canGoBack={previousTips.length > 0}
                        />
                      )}
                    </div>
                  ) : (
                    <div className="ai-chat-message-list">
                      {chatMessages.map((msg, idx) => {
                        // このメッセージに対応するTodoを取得
                        const messageTodos = currentTodos.find(t => t.id === `todos_${idx}`)?.todos || [];
                        const isLastAssistant = idx === chatMessages.length - 1 && msg.role === 'assistant';
                        const todosForThisMessage = isLastAssistant ? currentTodos[currentTodos.length - 1]?.todos || [] : [];

                        return (
                          <div key={idx} className={`ai-chat-message ${msg.role === 'user' ? 'ai-chat-message-user' : 'ai-chat-message-assistant'}`}>
                            <div className="ai-chat-message-bubble">
                              {msg.content}
                            </div>
                            {/* Todoカード表示（アシスタントの最後のメッセージにのみ） */}
                            {isLastAssistant && todosForThisMessage.length > 0 && (
                              <div className="ai-chat-message ai-chat-message-assistant">
                                {todosForThisMessage.map((todo: TodoItem) => (
                                  <div
                                    key={todo.id}
                                    className="ai-chat-todo-card"
                                  >
                                    <div className="ai-chat-todo-title">
                                      {todo.title}
                                    </div>
                                    {todo.description && (
                                      <div className="ai-chat-todo-description">
                                        {todo.description}
                                      </div>
                                    )}
                                    {todo.action && (
                    <button
                                        onClick={() => {
                                          // Todoアクションを実行
                                          if (todo.action?.type === 'add_food' && todo.action.params) {
                                            const { item, amount, unit } = todo.action.params;
                                            if (addFood && item && amount) {
                                              addFood({
                                                item,
                                                amount: Number(amount),
                                                unit: unit || 'g',
                                                type: 'animal',
                                              });
                                              alert(`${item} ${amount}${unit || 'g'}を追加しました`);
                                            }
                                          } else if (todo.action?.type === 'timer' && todo.action.params) {
                                            const { hours } = todo.action.params;
                                            // タイマー機能は将来実装予定（通知APIを使用）
                                            alert(`${hours}時間の断食タイマーを開始しました（通知機能は今後実装予定）`);
                                          } else if (todo.action?.type === 'set_protocol') {
                                            // リカバリープロトコル画面に遷移
                                            window.dispatchEvent(new CustomEvent('navigateToScreen', { detail: 'labs' }));
                                            // リカバリープロトコル画面で自動的にプロトコルを設定する機能は今後実装予定
                                            alert('リカバリープロトコル画面に遷移しました。手動でプロトコルを設定してください。');
                                          } else if (todo.action?.type === 'open_screen' && todo.action.params) {
                                            const { screen } = todo.action.params;
                                            if (screen) {
                                              window.dispatchEvent(new CustomEvent('navigateToScreen', { detail: screen }));
                                            } else {
                                              alert('画面を開きます（実装予定）');
                                            }
                                          }
                                        }}
                                        className="ai-chat-todo-action-button"
                                      >
                                        実行
                    </button>
                                    )}
                  </div>
                                ))}
                  </div>
                            )}
                            {/* AI回答後もTipsを表示 */}
                            {!isChatLoading && displayedTip && isLastAssistant && (
                              <div className="ai-chat-message ai-chat-message-assistant">
                                <TipCard
                                  tip={displayedTip}
                                  onNextTip={() => {
                                    if (displayedTip) {
                                      setPreviousTips(prev => [...prev, displayedTip]);
                                    }
                                    const nextTip = getRandomTipExcluding(displayedTip.id);
                                    setDisplayedTip(nextTip);
                                    setIsTipSavedState(isTipSaved(nextTip.id));
                                  }}
                                  onPrevTip={() => {
                                    if (previousTips.length > 0) {
                                      const prevTip = previousTips[previousTips.length - 1];
                                      setPreviousTips(prev => prev.slice(0, -1));
                                      setDisplayedTip(prevTip);
                                      setIsTipSavedState(isTipSaved(prevTip.id));
                                    }
                                  }}
                                  onToggleSave={(tipId, isSaved) => {
                                    if (isSaved) {
                                      unsaveTip(tipId);
                                    } else {
                                      saveTip(tipId);
                                    }
                                    setIsTipSavedState(!isSaved);
                                  }}
                                  isSaved={isTipSavedState}
                                  canGoBack={previousTips.length > 0}
                                />
                </div>
              )}
                          </div>
                        );
                      })}
                      {isChatLoading && (
                        <div className="ai-chat-message ai-chat-message-assistant">
                          <div className="ai-chat-loading">
                            <div className="ai-chat-loading-spinner"></div>
                            <span>考え中...</span>
                          </div>
                          {/* ローディング中のTips表示 */}
                          {loadingTip && (
                            <TipCard
                              tip={loadingTip}
                              onNextTip={() => {
                                const nextTip = getRandomTipExcluding(loadingTip.id);
                                setLoadingTip(nextTip);
                                setDisplayedTip(nextTip);
                                setIsTipSavedState(isTipSaved(nextTip.id));
                              }}
                              onPrevTip={() => {
                                if (previousTips.length > 0) {
                                  const prevTip = previousTips[previousTips.length - 1];
                                  setPreviousTips(prev => prev.slice(0, -1));
                                  setLoadingTip(prevTip);
                                  setDisplayedTip(prevTip);
                                  setIsTipSavedState(isTipSaved(prevTip.id));
                                }
                              }}
                              onToggleSave={(tipId, isSaved) => {
                                if (isSaved) {
                                  unsaveTip(tipId);
                                } else {
                                  saveTip(tipId);
                                }
                                setIsTipSavedState(!isSaved);
                              }}
                              isSaved={isTipSavedState}
                              canGoBack={previousTips.length > 0}
                            />
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <div className="ai-chat-input-container">
                  <div className="ai-chat-input-wrapper" style={{ position: 'relative' }}>
                    {/* Gemini-style + button with dropdown */}
                    <div ref={plusMenuRef} style={{ position: 'relative', display: 'flex', alignItems: 'flex-end' }}>
                      <button
                        onClick={() => setShowPlusMenu(!showPlusMenu)}
                        style={{
                          padding: '8px 12px',
                          backgroundColor: showPlusMenu ? '#e5e7eb' : 'transparent',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '20px',
                          transition: 'background-color 0.2s',
                          marginRight: '4px',
                        }}
                        title="ファイルアップロード"
                      >
                        +
                      </button>
                      {showPlusMenu && (
                        <div
                          style={{
                            position: 'absolute',
                            bottom: '100%',
                            left: 0,
                            marginBottom: '8px',
                            backgroundColor: 'white',
                            borderRadius: '8px',
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                            minWidth: '220px',
                            zIndex: 1000,
                            overflow: 'hidden',
                          }}
                        >
                          <button
                            onClick={handlePhoto}
                            style={{
                              width: '100%',
                              padding: '12px 16px',
                              backgroundColor: 'transparent',
                              border: 'none',
                              textAlign: 'left',
                              cursor: 'pointer',
                              fontSize: '14px',
                              transition: 'background-color 0.2s',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                            }}
                            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#f3f4f6')}
                            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                          >
                            <span>📸</span> 写真から追加
                          </button>
                          <button
                            onClick={handleAlbumPicker}
                            style={{
                              width: '100%',
                              padding: '12px 16px',
                              backgroundColor: 'transparent',
                              border: 'none',
                              textAlign: 'left',
                              cursor: 'pointer',
                              fontSize: '14px',
                              transition: 'background-color 0.2s',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                            }}
                            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#f3f4f6')}
                            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                          >
                            <span>🖼️</span> アルバムから選択
                          </button>
                          <button
                            onClick={handleFileUpload}
                            style={{
                              width: '100%',
                              padding: '12px 16px',
                              backgroundColor: 'transparent',
                              border: 'none',
                              textAlign: 'left',
                              cursor: 'pointer',
                              fontSize: '14px',
                              transition: 'background-color 0.2s',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                            }}
                            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#f3f4f6')}
                            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                          >
                            <span>📄</span> ファイルアップロード
                          </button>
                          <button
                            onClick={handleBarcodeScanner}
                            style={{
                              width: '100%',
                              padding: '12px 16px',
                              backgroundColor: 'transparent',
                              border: 'none',
                              textAlign: 'left',
                              cursor: 'pointer',
                              fontSize: '14px',
                              transition: 'background-color 0.2s',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                            }}
                            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#f3f4f6')}
                            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                          >
                            <span>📷</span> バーコード読み取り
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Gemini-style ツール button with dropdown */}
                    <div ref={toolsMenuRef} style={{ position: 'relative', display: 'flex', alignItems: 'flex-end' }}>
                      <button
                        onClick={() => setShowToolsMenu(!showToolsMenu)}
                        style={{
                          padding: '8px 12px',
                          backgroundColor: showToolsMenu ? '#e5e7eb' : 'transparent',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '14px',
                          transition: 'background-color 0.2s',
                          marginRight: '8px',
                        }}
                        title="ツール"
                      >
                        🔧
                      </button>
                      {showToolsMenu && (
                        <div
                          style={{
                            position: 'absolute',
                            bottom: '100%',
                            left: 0,
                            marginBottom: '8px',
                            backgroundColor: 'white',
                            borderRadius: '8px',
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                            minWidth: '240px',
                            zIndex: 1000,
                            overflow: 'hidden',
                          }}
                        >
                          <button
                            onClick={handleDeepResearch}
                            style={{
                              width: '100%',
                              padding: '12px 16px',
                              backgroundColor: 'transparent',
                              border: 'none',
                              textAlign: 'left',
                              cursor: 'pointer',
                              fontSize: '14px',
                              transition: 'background-color 0.2s',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                            }}
                            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#f3f4f6')}
                            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                          >
                            <span>🔍</span> Deep Research
                          </button>
                          <button
                            onClick={handleGuidedLearning}
                            style={{
                              width: '100%',
                              padding: '12px 16px',
                              backgroundColor: 'transparent',
                              border: 'none',
                              textAlign: 'left',
                              cursor: 'pointer',
                              fontSize: '14px',
                              transition: 'background-color 0.2s',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                            }}
                            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#f3f4f6')}
                            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                          >
                            <span>📚</span> ガイド付き学習
                          </button>
                          <button
                            onClick={handleSymptomInference}
                            style={{
                              width: '100%',
                              padding: '12px 16px',
                              backgroundColor: 'transparent',
                              border: 'none',
                              textAlign: 'left',
                              cursor: 'pointer',
                              fontSize: '14px',
                              transition: 'background-color 0.2s',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                            }}
                            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#f3f4f6')}
                            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                          >
                            <span>🩺</span> 症状推論
                          </button>
                          <button
                            onClick={handleHonestyScore}
                            style={{
                              width: '100%',
                              padding: '12px 16px',
                              backgroundColor: 'transparent',
                              border: 'none',
                              textAlign: 'left',
                              cursor: 'pointer',
                              fontSize: '14px',
                              transition: 'background-color 0.2s',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                            }}
                            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#f3f4f6')}
                            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                          >
                            <span>✅</span> 誠実さスコア
                          </button>
                        </div>
                      )}
                    </div>

                    <textarea
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder="質問を入力..."
                      id="chat-input-field"
                      className="ai-chat-textarea"
                      rows={1}
                      style={{ flex: 1 }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey && !isChatLoading) {
                          e.preventDefault();
                          handleSendChatMessage();
                        }
                      }}
                      onInput={(e) => {
                        const target = e.target as HTMLTextAreaElement;
                        target.style.height = 'auto';
                        target.style.height = `${Math.min(target.scrollHeight, 120)}px`;
                      }}
                    />
                    {/* 音声入力ボタン */}
                    {VoiceInputManager.isAvailable() && (
                      <button
                        onClick={handleVoiceInput}
                        className={`ai-chat-voice-button ${isVoiceInputActive ? 'active' : ''}`}
                        title={isVoiceInputActive ? '音声入力を停止' : '音声入力を開始'}
                      >
                        {isVoiceInputActive ? '⏹️' : '🎤'}
                      </button>
                    )}
                    <button
                      onClick={handleSendChatMessage}
                      disabled={!chatInput.trim() || isChatLoading}
                      className="ai-chat-send-button"
                    >
                      送信
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : chatUIMode === 'browse' ? (
            /* Browse Mode: show only the last AI response as an overlay */
            <div
              style={{
                position: 'fixed',
                bottom: '80px',
                right: '16px',
                left: '16px',
                maxWidth: '600px',
                marginLeft: 'auto',
                backgroundColor: 'white',
                borderRadius: '16px',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
                border: '1px solid #e5e7eb',
                zIndex: 999,
                maxHeight: '60vh',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {/* Browse header */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  borderBottom: '1px solid #f3f4f6',
                  backgroundColor: '#fafbfc',
                  borderRadius: '16px 16px 0 0',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '14px', fontWeight: 600, color: '#374151' }}>AI Response</span>
                  <span style={{ fontSize: '11px', color: '#9ca3af', backgroundColor: '#f3f4f6', padding: '2px 8px', borderRadius: '10px' }}>Browse</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <button
                    onClick={() => setChatUIMode('modal')}
                    style={{
                      padding: '6px 12px',
                      backgroundColor: '#f3f4f6',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      color: '#374151',
                      fontWeight: 500,
                    }}
                    title="Back to Fullscreen Chat"
                  >
                    Fullscreen
                  </button>
                  <button
                    onClick={() => setShowChatUI(false)}
                    style={{
                      width: '28px',
                      height: '28px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: 'transparent',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '16px',
                      color: '#6b7280',
                    }}
                  >
                    x
                  </button>
                </div>
              </div>
              {/* Browse content: last AI response only */}
              <div
                style={{
                  padding: '16px',
                  overflowY: 'auto',
                  flex: 1,
                  fontSize: '14px',
                  lineHeight: '1.6',
                  color: '#1f2937',
                }}
              >
                {(() => {
                  const lastAssistant = [...chatMessages].reverse().find(m => m.role === 'assistant');
                  if (lastAssistant) {
                    return <div style={{ whiteSpace: 'pre-wrap' }}>{lastAssistant.content}</div>;
                  }
                  return <div style={{ color: '#9ca3af', textAlign: 'center', padding: '2rem 0' }}>No AI response yet. Ask a question first.</div>;
                })()}
              </div>
            </div>
          ) : (
            <div
              ref={bubbleRef}
              className="ai-chat-bubble"
              role="dialog"
              aria-label="AIチャット（吹き出し）"
              style={{
                left: `${bubblePosition.x}px`,
                top: `${bubblePosition.y}px`,
                right: 'auto',
                bottom: 'auto',
                width: `${bubbleSize.width}px`,
                height: `${bubbleSize.height}px`,
                cursor: isDragging ? 'grabbing' : 'default',
                transition: isDragging || isResizing ? 'none' : 'width 0.3s ease, height 0.3s ease, left 0.3s ease, top 0.3s ease',
              }}
            >
              <div
                className="ai-chat-bubble-header"
                onMouseDown={handleBubbleMouseDown}
                onTouchStart={handleBubbleMouseDown}
                style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                  <h3 className="ai-chat-bubble-title">AIチャット</h3>

                  {/* AI Mode selection */}
                  <div
                    ref={thinkingModeMenuRef}
                    style={{ position: 'relative', display: 'flex', alignItems: 'center' }}
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                    onMouseDown={(e) => {
                      e.stopPropagation();
                    }}
                  >
                    <button
                      onClick={() => setShowThinkingModeMenu(!showThinkingModeMenu)}
                      style={{
                        padding: '4px 8px',
                        backgroundColor: showThinkingModeMenu ? '#e5e7eb' : 'rgba(255, 255, 255, 0.1)',
                        border: '1px solid rgba(209, 213, 219, 0.5)',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '11px',
                        transition: 'background-color 0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '2px',
                        color: '#374151',
                      }}
                      title="Select AI Mode"
                    >
                      {thinkingMode === 'fast' && '⚡'}
                      {thinkingMode === 'auto' && '🔷'}
                      {thinkingMode === 'deep' && '💎'}
                      <span style={{ fontSize: '10px' }}>▼</span>
                    </button>
                    {showThinkingModeMenu && (
                      <div
                        style={{
                          position: 'absolute',
                          top: '100%',
                          left: 0,
                          marginTop: '8px',
                          backgroundColor: 'white',
                          borderRadius: '8px',
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                          minWidth: '180px',
                          zIndex: 1004,
                          overflow: 'hidden',
                        }}
                      >
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setThinkingMode('fast');
                            setShowThinkingModeMenu(false);
                          }}
                          style={{
                            width: '100%',
                            padding: '10px 12px',
                            backgroundColor: thinkingMode === 'fast' ? '#f3f4f6' : 'transparent',
                            border: 'none',
                            textAlign: 'left',
                            cursor: 'pointer',
                            fontSize: '13px',
                            transition: 'background-color 0.2s',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '2px',
                          }}
                          onMouseOver={(e) => {
                            if (thinkingMode !== 'fast') {
                              e.currentTarget.style.backgroundColor = '#f9fafb';
                            }
                          }}
                          onMouseOut={(e) => {
                            if (thinkingMode !== 'fast') {
                              e.currentTarget.style.backgroundColor = 'transparent';
                            }
                          }}
                        >
                          <div style={{ fontWeight: 'bold' }}>⚡ Fast</div>
                          <div style={{ fontSize: '11px', color: '#6b7280' }}>Quick answers</div>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setThinkingMode('auto');
                            setShowThinkingModeMenu(false);
                          }}
                          style={{
                            width: '100%',
                            padding: '10px 12px',
                            backgroundColor: thinkingMode === 'auto' ? '#f3f4f6' : 'transparent',
                            border: 'none',
                            textAlign: 'left',
                            cursor: 'pointer',
                            fontSize: '13px',
                            transition: 'background-color 0.2s',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '2px',
                          }}
                          onMouseOver={(e) => {
                            if (thinkingMode !== 'auto') {
                              e.currentTarget.style.backgroundColor = '#f9fafb';
                            }
                          }}
                          onMouseOut={(e) => {
                            if (thinkingMode !== 'auto') {
                              e.currentTarget.style.backgroundColor = 'transparent';
                            }
                          }}
                        >
                          <div style={{ fontWeight: 'bold' }}>🔷 Auto</div>
                          <div style={{ fontSize: '11px', color: '#6b7280' }}>Smart (default)</div>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setThinkingMode('deep');
                            setShowThinkingModeMenu(false);
                          }}
                          style={{
                            width: '100%',
                            padding: '10px 12px',
                            backgroundColor: thinkingMode === 'deep' ? '#f3f4f6' : 'transparent',
                            border: 'none',
                            textAlign: 'left',
                            cursor: 'pointer',
                            fontSize: '13px',
                            transition: 'background-color 0.2s',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '2px',
                          }}
                          onMouseOver={(e) => {
                            if (thinkingMode !== 'deep') {
                              e.currentTarget.style.backgroundColor = '#f9fafb';
                            }
                          }}
                          onMouseOut={(e) => {
                            if (thinkingMode !== 'deep') {
                              e.currentTarget.style.backgroundColor = 'transparent';
                            }
                          }}
                        >
                          <div style={{ fontWeight: 'bold' }}>💎 Deep</div>
                          <div style={{ fontSize: '11px', color: '#6b7280' }}>Detailed analysis</div>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                <div className="ai-chat-bubble-actions" style={{ position: 'relative', zIndex: 1002, flexDirection: 'column', gap: '0.25rem', alignItems: 'flex-end' }}>
                  {/* 全画面表示時は💬ボタンを非表示 */}
                  {!(bubbleSize.width >= window.innerWidth - 20 && bubbleSize.height >= window.innerHeight - 20) && (
                    <button
                      onClick={() => setChatUIMode('modal')}
                      className="ai-chat-bubble-toggle-button"
                      title="モーダルUIに変更"
                      style={{ position: 'relative', zIndex: 1003 }}
                    >
                      ⛶
                    </button>
                  )}
                  <button
                    onClick={() => setShowChatUI(false)}
                    className="ai-chat-bubble-close-button"
                    title="閉じる"
                    style={{ position: 'relative', zIndex: 1003 }}
                  >
                    ×
                  </button>
                </div>
              </div>
              <div className="ai-chat-messages">
                {chatMessages.length === 0 ? (
                  <div className="ai-chat-empty-state">
                    <p className="ai-chat-empty-state-text">
                      カーニボアダイエットに関する質問をどうぞ
                    </p>
                    <p className="ai-chat-empty-state-text" style={{ fontSize: '11px', color: '#6b7280', marginTop: '0.5rem', lineHeight: '1.5' }}>
                      アプリの使い方についても質問できます
                    </p>
                    {displayedTip && (
                      <TipCard
                        tip={displayedTip}
                        onNextTip={() => {
                          if (displayedTip) {
                            setPreviousTips(prev => [...prev, displayedTip]);
                          }
                          const nextTip = getRandomTipExcluding(displayedTip.id);
                          setDisplayedTip(nextTip);
                          setIsTipSavedState(isTipSaved(nextTip.id));
                        }}
                        onPrevTip={() => {
                          if (previousTips.length > 0) {
                            const prevTip = previousTips[previousTips.length - 1];
                            setPreviousTips(prev => prev.slice(0, -1));
                            setDisplayedTip(prevTip);
                            setIsTipSavedState(isTipSaved(prevTip.id));
                          }
                        }}
                        onToggleSave={(tipId, isSaved) => {
                          if (isSaved) {
                            unsaveTip(tipId);
                          } else {
                            saveTip(tipId);
                          }
                          setIsTipSavedState(!isSaved);
                        }}
                        isSaved={isTipSavedState}
                        canGoBack={previousTips.length > 0}
                      />
                    )}
                  </div>
                ) : (
                  <div className="ai-chat-message-list">
                    {chatMessages.map((msg, idx) => {
                      const messageTodos = currentTodos.find(t => t.id === `todos_${idx}`)?.todos || [];
                      const isLastAssistant = idx === chatMessages.length - 1 && msg.role === 'assistant';
                      const todosForThisMessage = isLastAssistant ? currentTodos[currentTodos.length - 1]?.todos || [] : [];

                      return (
                        <div key={idx} className={`ai-chat-message ${msg.role === 'user' ? 'ai-chat-message-user' : 'ai-chat-message-assistant'}`}>
                          <div className="ai-chat-message-bubble">
                    {msg.content}
                          </div>
                          {isLastAssistant && todosForThisMessage.length > 0 && (
                            <div className="ai-chat-message ai-chat-message-assistant">
                              {todosForThisMessage.map((todo: TodoItem) => (
                                <div
                                  key={todo.id}
                                  className="ai-chat-todo-card"
                                >
                                  <div className="ai-chat-todo-title">
                                    {todo.title}
                                  </div>
                                  {todo.description && (
                                    <div className="ai-chat-todo-description">
                                      {todo.description}
                                    </div>
                                  )}
                                  {todo.action && (
                                    <button
                                      onClick={() => {
                                        if (todo.action?.type === 'add_food' && todo.action.params) {
                                          const { item, amount, unit } = todo.action.params;
                                          if (addFood && item && amount) {
                                            addFood({
                                              item,
                                              amount: Number(amount),
                                              unit: unit || 'g',
                                              type: 'animal',
                                            });
                                            alert(`${item} ${amount}${unit || 'g'}を追加しました`);
                                          }
                                        } else if (todo.action?.type === 'timer' && todo.action.params) {
                                          const { hours } = todo.action.params;
                                          alert(`${hours}時間タイマーを開始しました（実装予定）`);
                                        } else if (todo.action?.type === 'set_protocol') {
                                          alert('リカバリープロトコルを設定しました（実装予定）');
                                        } else if (todo.action?.type === 'open_screen') {
                                          alert('画面を開きます（実装予定）');
                                        }
                                      }}
                                      className="ai-chat-todo-action-button"
                                    >
                                      実行
                                    </button>
                                  )}
                  </div>
                ))}
              </div>
                          )}
                        </div>
                      );
                    })}
                    {isChatLoading && (
                      <div className="ai-chat-message ai-chat-message-assistant">
                        <div className="ai-chat-loading">
                          <div className="ai-chat-loading-spinner"></div>
                          <span>考え中...</span>
                        </div>
                        {loadingTip && (
                          <TipCard
                            tip={loadingTip}
                            onNextTip={() => {
                              if (loadingTip) {
                                setPreviousTips(prev => [...prev, loadingTip]);
                              }
                              const nextTip = getRandomTipExcluding(loadingTip.id);
                              setLoadingTip(nextTip);
                              setDisplayedTip(nextTip);
                              setIsTipSavedState(isTipSaved(nextTip.id));
                            }}
                            onPrevTip={() => {
                              if (previousTips.length > 0) {
                                const prevTip = previousTips[previousTips.length - 1];
                                setPreviousTips(prev => prev.slice(0, -1));
                                setLoadingTip(prevTip);
                                setDisplayedTip(prevTip);
                                setIsTipSavedState(isTipSaved(prevTip.id));
                              }
                            }}
                            onToggleSave={(tipId, isSaved) => {
                              if (isSaved) {
                                unsaveTip(tipId);
                              } else {
                                saveTip(tipId);
                              }
                              setIsTipSavedState(!isSaved);
                            }}
                            isSaved={isTipSavedState}
                            canGoBack={previousTips.length > 0}
                          />
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="ai-chat-input-container">
                <div className="ai-chat-input-wrapper" style={{ position: 'relative' }}>
                  {/* Gemini-style + button with dropdown */}
                  <div ref={plusMenuRef} style={{ position: 'relative', display: 'flex', alignItems: 'flex-end' }}>
                    <button
                      onClick={() => setShowPlusMenu(!showPlusMenu)}
                      style={{
                        padding: '8px 12px',
                        backgroundColor: showPlusMenu ? '#e5e7eb' : 'transparent',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '20px',
                        transition: 'background-color 0.2s',
                        marginRight: '4px',
                      }}
                      title="ファイルアップロード"
                    >
                      +
                    </button>
                    {showPlusMenu && (
                      <div
                        style={{
                          position: 'absolute',
                          bottom: '100%',
                          left: 0,
                          marginBottom: '8px',
                          backgroundColor: 'white',
                          borderRadius: '8px',
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                          minWidth: '220px',
                          zIndex: 1000,
                          overflow: 'hidden',
                        }}
                      >
                        <button
                          onClick={handlePhoto}
                          style={{
                            width: '100%',
                            padding: '12px 16px',
                            backgroundColor: 'transparent',
                            border: 'none',
                            textAlign: 'left',
                            cursor: 'pointer',
                            fontSize: '14px',
                            transition: 'background-color 0.2s',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                          }}
                          onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#f3f4f6')}
                          onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                        >
                          <span>📸</span> 写真から追加
                        </button>
                        <button
                          onClick={handleAlbumPicker}
                          style={{
                            width: '100%',
                            padding: '12px 16px',
                            backgroundColor: 'transparent',
                            border: 'none',
                            textAlign: 'left',
                            cursor: 'pointer',
                            fontSize: '14px',
                            transition: 'background-color 0.2s',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                          }}
                          onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#f3f4f6')}
                          onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                        >
                          <span>🖼️</span> アルバムから選択
                        </button>
                        <button
                          onClick={handleFileUpload}
                          style={{
                            width: '100%',
                            padding: '12px 16px',
                            backgroundColor: 'transparent',
                            border: 'none',
                            textAlign: 'left',
                            cursor: 'pointer',
                            fontSize: '14px',
                            transition: 'background-color 0.2s',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                          }}
                          onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#f3f4f6')}
                          onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                        >
                          <span>📄</span> ファイルアップロード
                        </button>
                        <button
                          onClick={handleBarcodeScanner}
                          style={{
                            width: '100%',
                            padding: '12px 16px',
                            backgroundColor: 'transparent',
                            border: 'none',
                            textAlign: 'left',
                            cursor: 'pointer',
                            fontSize: '14px',
                            transition: 'background-color 0.2s',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                          }}
                          onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#f3f4f6')}
                          onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                        >
                          <span>📷</span> バーコード読み取り
                        </button>
                      </div>
                    )}
            </div>

                  {/* Gemini-style ツール button with dropdown */}
                  <div ref={toolsMenuRef} style={{ position: 'relative', display: 'flex', alignItems: 'flex-end' }}>
                    <button
                      onClick={() => setShowToolsMenu(!showToolsMenu)}
                      style={{
                        padding: '8px 12px',
                        backgroundColor: showToolsMenu ? '#e5e7eb' : 'transparent',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        transition: 'background-color 0.2s',
                        marginRight: '8px',
                      }}
                      title="ツール"
                    >
                      🔧
                    </button>
                    {showToolsMenu && (
                      <div
                        style={{
                          position: 'absolute',
                          bottom: '100%',
                          left: 0,
                          marginBottom: '8px',
                          backgroundColor: 'white',
                          borderRadius: '8px',
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                          minWidth: '240px',
                          zIndex: 1000,
                          overflow: 'hidden',
                        }}
                      >
                        <button
                          onClick={handleDeepResearch}
                          style={{
                            width: '100%',
                            padding: '12px 16px',
                            backgroundColor: 'transparent',
                            border: 'none',
                            textAlign: 'left',
                            cursor: 'pointer',
                            fontSize: '14px',
                            transition: 'background-color 0.2s',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                          }}
                          onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#f3f4f6')}
                          onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                        >
                          <span>🔍</span> Deep Research
                        </button>
                        <button
                          onClick={handleGuidedLearning}
                          style={{
                            width: '100%',
                            padding: '12px 16px',
                            backgroundColor: 'transparent',
                            border: 'none',
                            textAlign: 'left',
                            cursor: 'pointer',
                            fontSize: '14px',
                            transition: 'background-color 0.2s',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                          }}
                          onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#f3f4f6')}
                          onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                        >
                          <span>📚</span> ガイド付き学習
                        </button>
                        <button
                          onClick={handleSymptomInference}
                          style={{
                            width: '100%',
                            padding: '12px 16px',
                            backgroundColor: 'transparent',
                            border: 'none',
                            textAlign: 'left',
                            cursor: 'pointer',
                            fontSize: '14px',
                            transition: 'background-color 0.2s',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                          }}
                          onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#f3f4f6')}
                          onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                        >
                          <span>🩺</span> 症状推論
                        </button>
                        <button
                          onClick={handleHonestyScore}
                          style={{
                            width: '100%',
                            padding: '12px 16px',
                            backgroundColor: 'transparent',
                            border: 'none',
                            textAlign: 'left',
                            cursor: 'pointer',
                            fontSize: '14px',
                            transition: 'background-color 0.2s',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                          }}
                          onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#f3f4f6')}
                          onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                        >
                          <span>✅</span> 誠実さスコア
                        </button>
                      </div>
                    )}
                  </div>

                  <textarea
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                    placeholder="質問を入力..."
                    className="ai-chat-textarea"
                    rows={1}
                    style={{ flex: 1 }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey && !isChatLoading) {
                        e.preventDefault();
                        handleSendChatMessage();
                      }
                    }}
                    onInput={(e) => {
                      const target = e.target as HTMLTextAreaElement;
                      target.style.height = 'auto';
                      target.style.height = `${Math.min(target.scrollHeight, 100)}px`;
                    }}
                  />
                  {VoiceInputManager.isAvailable() && (
                    <button
                      onClick={handleVoiceInput}
                      className={`ai-chat-voice-button ${isVoiceInputActive ? 'active' : ''}`}
                      title={isVoiceInputActive ? '音声入力を停止' : '音声入力を開始'}
                    >
                      {isVoiceInputActive ? '⏹️' : '🎤'}
              </button>
                  )}
                  <button
                    onClick={handleSendChatMessage}
                    disabled={!chatInput.trim() || isChatLoading}
                    className="ai-chat-send-button"
                  >
                    送信
              </button>
            </div>
          </div>
              {/* リサイズハンドル（4つの角） */}
              <div
                className="ai-chat-bubble-resize-handle ai-chat-bubble-resize-handle-top-left"
                onMouseDown={handleBubbleResizeStart('top-left')}
                onTouchStart={handleBubbleResizeStart('top-left')}
                title="サイズを変更（左上）"
              />
              <div
                className="ai-chat-bubble-resize-handle ai-chat-bubble-resize-handle-top-right"
                onMouseDown={handleBubbleResizeStart('top-right')}
                onTouchStart={handleBubbleResizeStart('top-right')}
                title="サイズを変更（右上）"
                style={{ top: '4px', right: '4px' }}
              />
              <div
                className="ai-chat-bubble-resize-handle ai-chat-bubble-resize-handle-bottom-left"
                onMouseDown={handleBubbleResizeStart('bottom-left')}
                onTouchStart={handleBubbleResizeStart('bottom-left')}
                title="サイズを変更（左下）"
              />
              <div
                className="ai-chat-bubble-resize-handle ai-chat-bubble-resize-handle-bottom-right"
                onMouseDown={handleBubbleResizeStart('bottom-right')}
                onTouchStart={handleBubbleResizeStart('bottom-right')}
                title="サイズを変更（右下）"
              />
        </div>
          )}
        </>
      )}

      {/* 画像解析中のインジケーター */}
      {isAnalyzingImage && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10003,
            padding: '1rem',
          }}
        >
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '16px',
              padding: '2rem',
              maxWidth: '300px',
              width: '100%',
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                width: '48px',
                height: '48px',
                border: '4px solid #e5e7eb',
                borderTop: '4px solid #dc2626',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto 1rem',
              }}
            />
            <p style={{ margin: 0, fontSize: '16px', fontWeight: '500', color: '#374151' }}>
              画像を解析中...
            </p>
            <p style={{ margin: '0.5rem 0 0 0', fontSize: '14px', color: '#6b7280' }}>
              しばらくお待ちください
            </p>
          </div>
        </div>
      )}

      {/* エラーダイアログ */}
      {imageAnalysisError && !isAnalyzingImage && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10003,
            padding: '1rem',
          }}
          onClick={() => setImageAnalysisError(null)}
        >
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '16px',
              padding: '1.5rem',
              maxWidth: '400px',
              width: '100%',
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ margin: '0 0 1rem 0', fontSize: '18px', fontWeight: '600', color: '#dc2626' }}>
              ⚠️ エラー
            </h3>
            <p style={{ margin: '0 0 1.5rem 0', fontSize: '14px', color: '#374151' }}>
              {imageAnalysisError}
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setImageAnalysisError(null)}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#e5e7eb',
                  color: '#374151',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  cursor: 'pointer',
                  fontWeight: '500',
                }}
              >
                閉じる
              </button>
              <button
                onClick={() => {
                  setImageAnalysisError(null);
                  handlePhoto();
                }}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#dc2626',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  cursor: 'pointer',
                  fontWeight: '500',
                }}
              >
                リトライ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Conciergeインタビューモーダル（Master Specification準拠） */}
      {showAIConcierge && pendingFoodItem && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10002,
            padding: '1rem',
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowAIConcierge(false);
              setPendingFoodItem(null);
            }
          }}
        >
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '16px',
              padding: '1.5rem',
              maxWidth: '400px',
              width: '100%',
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
              maxHeight: '80vh',
              overflowY: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ margin: '0 0 1rem 0', fontSize: '18px', fontWeight: '600' }}>
              🤖 AI確認
            </h3>
            <p style={{ margin: '0 0 1rem 0', fontSize: '14px', color: '#666' }}>
              検出: {pendingFoodItem.item} ({pendingFoodItem.amount}g)
            </p>

            {/* 追加情報（マックのサイドメニューのように） */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.75rem', fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                追加情報（任意）
              </label>

              {/* 塩の使用確認（チェックボックス形式） */}
              <div style={{ marginBottom: '0.75rem', padding: '0.75rem', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={conciergeData.saltUsed}
                    onChange={(e) => setConciergeData({ ...conciergeData, saltUsed: e.target.checked })}
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                  <span style={{ fontSize: '14px', fontWeight: '500' }}>塩を振った</span>
                </label>
                {conciergeData.saltUsed && (
                  <div style={{ marginTop: '0.5rem', marginLeft: '26px' }}>
                    <select
                      value={conciergeData.saltType}
                      onChange={(e) => setConciergeData({ ...conciergeData, saltType: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        border: '1px solid #e5e7eb',
                        borderRadius: '6px',
                        fontSize: '14px',
                        marginBottom: '0.5rem',
                      }}
                    >
                      <option value="ぬちまーす">ぬちまーす</option>
                      <option value="海塩">海塩</option>
                      <option value="岩塩">岩塩</option>
                      <option value="その他">その他</option>
                    </select>
                    {/* ButcherSelectと同じスタイルの量入力UI */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%' }}>
                      <button
                        onClick={() => setConciergeData({ ...conciergeData, saltAmount: Math.max(0, conciergeData.saltAmount - 0.5) })}
                        style={{
                          width: '32px',
                          height: '32px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: '#e5e7eb',
                          borderRadius: '6px',
                          border: 'none',
                          cursor: 'pointer',
                          fontSize: '18px',
                          fontWeight: 'bold',
                        }}
                      >
                        −
                      </button>
                      <input
                        type="number"
                        value={conciergeData.saltAmount || ''}
                        onChange={(e) => setConciergeData({ ...conciergeData, saltAmount: parseFloat(e.target.value) || 0 })}
                        style={{
                          flex: 1,
                          padding: '0.5rem',
                          border: '2px solid #d1d5db',
                          borderRadius: '6px',
                          fontSize: '16px',
                          textAlign: 'center',
                          fontWeight: 'bold',
                        }}
                        min="0"
                        step="0.1"
                      />
                      <button
                        onClick={() => setConciergeData({ ...conciergeData, saltAmount: conciergeData.saltAmount + 0.5 })}
                        style={{
                          width: '32px',
                          height: '32px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: '#e5e7eb',
                          borderRadius: '6px',
                          border: 'none',
                          cursor: 'pointer',
                          fontSize: '18px',
                          fontWeight: 'bold',
                        }}
                      >
                        +
                      </button>
                      <span style={{ fontSize: '14px', color: '#6b7280', minWidth: '20px' }}>g</span>
                    </div>
                  </div>
                )}
              </div>

              {/* 脂身の確認（スライダー形式、0-100%） */}
              <div style={{ marginBottom: '0.75rem', padding: '0.75rem', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '14px', fontWeight: '500' }}>
                  脂身の取り除き率: {conciergeData.fatTrimmed}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={conciergeData.fatTrimmed}
                  onChange={(e) => setConciergeData({ ...conciergeData, fatTrimmed: parseInt(e.target.value, 10) })}
                  style={{
                    width: '100%',
                    height: '6px',
                    borderRadius: '3px',
                    backgroundColor: '#e5e7eb',
                    outline: 'none',
                    cursor: 'pointer',
                  }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#6b7280', marginTop: '0.25rem' }}>
                  <span>0%</span>
                  <span>50%</span>
                  <span>100%</span>
                </div>
              </div>

              {/* 調理方法（チェックボックス形式） */}
              <div style={{ marginBottom: '0.75rem', padding: '0.75rem', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '14px', fontWeight: '500' }}>
                  調理方法
                </label>
                <select
                  value={conciergeData.cookingMethod}
                  onChange={(e) => setConciergeData({ ...conciergeData, cookingMethod: e.target.value as 'raw' | 'grilled' | 'boiled' | 'other' })}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                    fontSize: '14px',
                  }}
                >
                  <option value="raw">生</option>
                  <option value="grilled">焼く</option>
                  <option value="boiled">煮る</option>
                  <option value="other">その他</option>
                </select>
              </div>

              {/* 写真で認識不可能な食品を追加（自由入力） */}
              <div style={{ marginBottom: '0.75rem', padding: '0.75rem', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                  写真で認識不可能な食品を追加
                </label>
                <button
                  onClick={() => {
                    setAdditionalFoodName('');
                    setAdditionalFoodAmount(0);
                    setAdditionalFoodUnit('g');
                    setShowAdditionalFoodModal(true);
                  }}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                    fontSize: '14px',
                    textAlign: 'left',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}
                >
                  <span>➕</span>
                  <span>食品を追加</span>
                </button>
                {conciergeData.additionalFoods.length > 0 && (
                  <div style={{ marginTop: '0.5rem', fontSize: '12px', color: '#6b7280' }}>
                    {conciergeData.additionalFoods.map((food, idx) => (
                      <div key={idx} style={{ marginTop: '0.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>{food.name}: {food.amount}{food.unit === 'g' ? 'g' : '個'}</span>
                        <button
                          onClick={() => {
                            setConciergeData({
                              ...conciergeData,
                              additionalFoods: conciergeData.additionalFoods.filter((_, i) => i !== idx),
                            });
                          }}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#dc2626',
                            cursor: 'pointer',
                            fontSize: '14px',
                            padding: '0.25rem',
                          }}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>


            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
              <button
                onClick={() => {
                  setShowAIConcierge(false);
                  setPendingFoodItem(null);
                }}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#e5e7eb',
                  color: '#374151',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  cursor: 'pointer',
                  fontWeight: '500',
                }}
              >
                スキップ
              </button>
              <button
                onClick={() => {
                  // インタビュー結果を食品情報に反映
                  const finalFoodItem = {
                    ...pendingFoodItem,
                    metadata: {
                      saltUsed: conciergeData.saltUsed,
                      saltType: conciergeData.saltType,
                      saltAmount: conciergeData.saltAmount,
                      fatTrimmed: conciergeData.fatTrimmed, // 0-100%の範囲
                      cookingMethod: conciergeData.cookingMethod,
                      additionalFoods: conciergeData.additionalFoods,
                    },
                  };

                  setPendingFoodItem(finalFoodItem);
                  setShowAIConcierge(false);
                  setShowImageConfirm(true);

                  // 追加食品（自由入力）を個別に追加
                  if (conciergeData.additionalFoods.length > 0 && onAddFood) {
                    conciergeData.additionalFoods.forEach((food, index) => {
                      // 食品名から食品データベースを検索
                      const { searchFoods } = require('../../data/foodsDatabase');
                      const foodResults = searchFoods(food.name);
                      const foodData = foodResults.length > 0 ? foodResults[0] : null;

                      const foodItem: FoodItem = {
                        item: food.name,
                        amount: food.amount,
                        unit: food.unit,
                        type: foodData?.type || 'animal' as const,
                        nutrients: {},
                      };

                      // 食品データベースから栄養素を補完
                      if (foodData) {
                        const ratio = food.unit === '個' && foodData.pieceWeight
                          ? (food.amount * foodData.pieceWeight) / 100
                          : food.amount / 100;

                        foodItem.nutrients = {
                          protein: (foodData.nutrientsRaw.protein || 0) * ratio,
                          fat: (foodData.nutrientsRaw.fat || 0) * ratio,
                          carbs: (foodData.nutrientsRaw.carbs || 0) * ratio,
                          netCarbs: (foodData.nutrientsRaw.carbs || 0) * ratio,
                          fiber: (foodData.nutrientsRaw.fiber || 0) * ratio,
                          hemeIron: (foodData.nutrientsRaw.hemeIron || 0) * ratio,
                          nonHemeIron: (foodData.nutrientsRaw.nonHemeIron || 0) * ratio,
                          zinc: (foodData.nutrientsRaw.zinc || 0) * ratio,
                          sodium: (foodData.nutrientsRaw.sodium || 0) * ratio,
                          magnesium: (foodData.nutrientsRaw.magnesium || 0) * ratio,
                          vitaminC: (foodData.nutrientsRaw.vitaminC || 0) * ratio,
                          vitaminK: (foodData.nutrientsRaw.vitaminK || 0) * ratio,
                          vitaminB12: (foodData.nutrientsRaw.vitaminB12 || 0) * ratio,
                        };
                      } else {
                        // 食品データベースにない場合は、栄養素を0に設定（ユーザーが手動で入力した食品）
                        foodItem.nutrients = {
                          protein: 0,
                          fat: 0,
                          carbs: 0,
                          netCarbs: 0,
                          fiber: 0,
                          hemeIron: 0,
                          nonHemeIron: 0,
                          zinc: 0,
                          sodium: 0,
                          magnesium: 0,
                          vitaminC: 0,
                          vitaminK: 0,
                          vitaminB12: 0,
                        };
                      }

                      // 少し遅延させて追加（UIの更新を待つ）
                      setTimeout(() => {
                        if (onAddFood) {
                          onAddFood(foodItem);
                        }
                      }, 200 * (index + 1));
                    });
                  }
                }}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#dc2626',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  cursor: 'pointer',
                  fontWeight: '500',
                }}
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 統一された食品編集モーダル（画像解析・チャット共通） */}
      {showImageConfirm && pendingFoodItem && (
        <FoodEditModal
          isOpen={showImageConfirm}
          initialFood={pendingFoodItem}
          onClose={() => {
            setShowImageConfirm(false);
            setPendingFoodItem(null);
          }}
          onSave={async (finalFood) => {
            if (onAddFood) {
              // ログ追加
              await onAddFood(finalFood);

              // チャットUIにメッセージを追加（もしチャット経由なら）
              setChatMessages(prev => [...prev, {
                role: 'assistant',
                content: `記録しました: ${finalFood.item} (${finalFood.amount}g)\nP:Fバランスを記録しました。`,
              }]);

              setShowImageConfirm(false);
              setPendingFoodItem(null);
            }
          }}
        />
      )}

      {/* バーコードスキャナーモーダル */}
      <BarcodeScannerModal
        isOpen={showBarcodeScanner}
        onClose={() => setShowBarcodeScanner(false)}
        onSuccess={async (foodName, amount) => {
          // バーコードから食品情報を取得して追加
          if (onAddFood) {
            const foodItem: FoodItem = {
              item: foodName,
              amount: amount,
              unit: 'g' as const,
              type: 'animal' as const,
              nutrients: {},
            };
            await onAddFood(foodItem);
            setShowBarcodeScanner(false);
          }
        }}
      />

      {/* AIチャットボタン - 直接開く（チャットが開いている時は非表示、移動可能） */}
      {!showChatUI && (
        <button
          ref={fabButtonRef}
          className="ai-chat-fab-button"
          onClick={(e) => {
            // ドラッグで移動した場合はクリックを無視
            if (fabHasMovedRef.current) {
              e.preventDefault();
              e.stopPropagation();
              fabHasMovedRef.current = false; // リセット
              return;
            }
            // 通常のクリックの場合は処理
            handleChat();
            fabHasMovedRef.current = false; // リセット
          }}
          onMouseDown={handleFabButtonMouseDown}
          onTouchStart={handleFabButtonMouseDown}
          title="AIチャット（ドラッグで移動）"
          style={{
            position: 'fixed',
            left: `${fabButtonPosition.x}px`,
            top: `${fabButtonPosition.y}px`,
            cursor: isDraggingFab ? 'grabbing' : 'grab',
            transition: isDraggingFab ? 'none' : 'left 0.2s ease, top 0.2s ease',
          }}
        >
          💬
        </button>
      )}
    </>
  );
}

