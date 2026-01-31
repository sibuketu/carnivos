/**
 * Primal Logic - Home Screen (Web版)
 *
 * 栄養素ゲージの表示と基本的なナビゲーション
 */

import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { useTranslation } from '../utils/i18n';
import MiniNutrientGauge from '../components/MiniNutrientGauge';
import OmegaRatioGauge from '../components/OmegaRatioGauge';
import CalciumPhosphorusRatioGauge from '../components/CalciumPhosphorusRatioGauge';
import ArgumentCard from '../components/ArgumentCard';
import RecoveryProtocolScreen from './RecoveryProtocolScreen';
import ButcherSelect from '../components/butcher/ButcherSelect';
import PFRatioGauge from '../components/gauge/PFRatioGauge';
import StorageNutrientGauge from '../components/StorageNutrientGauge';
// SymptomChecker is removed - replaced with AI Prompt Chips in Magic Input
import { useNutrition, type PreviewData } from '../hooks/useNutrition';
import { useSettings } from '../hooks/useSettings';
import { getArgumentCardByNutrient } from '../data/argumentCards';
import { getNutrientDisplaySettings, type NutrientKey } from '../utils/nutrientDisplaySettings';
import { getFeatureDisplaySettings } from '../utils/featureDisplaySettings';
import { getAllFoodHistory } from '../utils/foodHistory';
import { getMyFoods, addMyFood, removeMyFood, type MyFoodItem } from '../utils/myFoodsStorage';
import { searchFoods, getFoodById } from '../data/foodsDatabase';
import { getTodayLog, getDailyLogs } from '../utils/storage';
import { calculateAllMetrics } from '../utils/nutrientCalculator';
import { getCarnivoreTargets } from '../data/carnivoreTargets';
import { getNutrientColor, NUTRIENT_GROUPS } from '../utils/gaugeUtils';
import { isNutrientVisibleInMode, getNutrientDisplayMode } from '../utils/nutrientPriority';
import { calculateStreak, type StreakData } from '../utils/streakCalculator';
import { calculateTransitionProgress } from '../data/transitionGuide';
import TransitionBanner from '../components/TransitionBanner';
import TransitionGuideModal from '../components/TransitionGuideModal';
import BarcodeScannerModal from '../components/BarcodeScannerModal';
import type { AnimalType } from '../data/deepNutritionData';
import type { FoodItem } from '../types';
import { logError, getUserFriendlyErrorMessage } from '../utils/errorHandler';
import PhotoAnalysisModal from '../components/PhotoAnalysisModal';
import FoodEditModal from '../components/dashboard/FoodEditModal';
// import './HomeScreen.css';

interface HomeScreenProps {
  onOpenFatTabReady?: (callback: () => void) => void;
  onAddFoodReady?: (callback: (foodItem: FoodItem) => void) => void;
}

export default function HomeScreen({ onOpenFatTabReady, onAddFoodReady }: HomeScreenProps = {}) {
  const { t } = useTranslation();
  const { dailyLog, setRecoveryProtocol, addFood, userProfile } = useApp();
  const { previewData, setPreview, clearPreview } = useNutrition();
  const { showNutrientPreview } = useSettings();
  const featureDisplaySettings = getFeatureDisplaySettings();

  // 動的目標値を取得（ユーザープロファイルから）
  const dynamicTargets = useMemo(() => {
    return getCarnivoreTargets(
      userProfile?.gender,
      userProfile?.age,
      userProfile?.activityLevel,
      userProfile?.isPregnant,
      userProfile?.isBreastfeeding,
      userProfile?.isPostMenopause,
      userProfile?.stressLevel,
      userProfile?.sleepHours,
      userProfile?.exerciseIntensity,
      userProfile?.exerciseFrequency,
      userProfile?.thyroidFunction,
      userProfile?.sunExposureFrequency,
      userProfile?.digestiveIssues,
      userProfile?.inflammationLevel,
      userProfile?.mentalHealthStatus,
      userProfile?.supplementMagnesium,
      userProfile?.supplementVitaminD,
      userProfile?.supplementIodine,
      userProfile?.alcoholFrequency,
      userProfile?.caffeineIntake,
      userProfile?.daysOnCarnivore, // Phase 1: 移行期間判定用
      userProfile?.carnivoreStartDate, // Phase 1: 移行期間判定用
      userProfile?.forceAdaptationMode, // Phase 1: 手動オーバーライド
      userProfile?.bodyComposition, // Phase 3: 体組成設定
      userProfile?.weight, // Phase 3: 体重（LBM計算用）
      userProfile?.metabolicStressIndicators, // Phase 4: 代謝ストレス指標
      userProfile?.customNutrientTargets
        ? Object.fromEntries(
          Object.entries(userProfile.customNutrientTargets).map(([key, value]) => [
            key,
            typeof value === 'number' ? { mode: 'manual' as const, value } : value,
          ])
        )
        : undefined // Phase 5: 栄養素目標値のカスタマイズ
    );
  }, [userProfile]);
  const [selectedArgumentCard, setSelectedArgumentCard] = useState<string | null>(null);
  const [showRecoveryProtocol, setShowRecoveryProtocol] = useState(false);
  const [showAllNutrients, setShowAllNutrients] = useState(false);
  const [selectedAnimal, setSelectedAnimal] = useState<AnimalType | null>(null);
  const [showSecondaryMenu, setShowSecondaryMenu] = useState(false);
  const [showMyFoods, setShowMyFoods] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [myFoodsList, setMyFoodsList] = useState<MyFoodItem[]>([]);
  const [historyList, setHistoryList] = useState<
    Array<{ foodName: string; amount: number; unit: 'g' | '個'; date: string }>
  >([]);
  const [streakData, setStreakData] = useState<StreakData | null>(null);
  const [showTransitionGuide, setShowTransitionGuide] = useState(false);
  const [showAmountModal, setShowAmountModal] = useState(false);
  const [selectedHistoryFood, setSelectedHistoryFood] = useState<{
    foodName: string;
    amount: number;
    unit: 'g' | '個';
    date: string;
  } | null>(null);
  const [amountInput, setAmountInput] = useState<string>('');
  const [showMyFoodAmountModal, setShowMyFoodAmountModal] = useState(false);
  const [selectedMyFood, setSelectedMyFood] = useState<MyFoodItem | null>(null);
  const [myFoodAmountInput, setMyFoodAmountInput] = useState<string>('');
  const [myFoodsSearchQuery, setMyFoodsSearchQuery] = useState<string>('');
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false);
  const [showPhotoOrBarcodeModal, setShowPhotoOrBarcodeModal] = useState(false);

  // AI写真解析確認モーダル用ステート
  const [showPhotoConfirmation, setShowPhotoConfirmation] = useState(false);
  const [photoAnalysisResult, setPhotoAnalysisResult] = useState<{
    foodName: string;
    estimatedWeight: number;
    type?: 'animal' | 'plant' | 'trash' | 'ruminant' | 'dairy';
    nutrients?: Record<string, number>;
    followupQuestions?: string[];
  } | null>(null);
  const [followupAnswers, setFollowupAnswers] = useState<Record<string, string>>({});
  const [isAIProcessing, setIsAIProcessing] = useState(false);

  // Storage Gauge State
  const [storageLevels, setStorageLevels] = useState<{ [key: string]: number }>({
    vitamin_a: 70,
    vitamin_d: 70,
    vitamin_b12: 70,
    iron: 70,
  });

  // Storage Decay Logic
  useEffect(() => {
    const STORAGE_KEY = 'nutrient_storage_levels';
    const LAST_UPDATE_KEY = 'nutrient_storage_last_update';

    const savedStorage = localStorage.getItem(STORAGE_KEY);
    const lastUpdate = localStorage.getItem(LAST_UPDATE_KEY);
    const today = new Date().toISOString().split('T')[0];

    let currentLevels = savedStorage
      ? JSON.parse(savedStorage)
      : { vitamin_a: 70, vitamin_d: 70, vitamin_b12: 70, iron: 70 };

    if (lastUpdate && lastUpdate !== today) {
      const lastDate = new Date(lastUpdate);
      const currDate = new Date(today);
      const diffTime = Math.abs(currDate.getTime() - lastDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      const DECAY_RATE_PER_DAY = 14;

      Object.keys(currentLevels).forEach(key => {
        currentLevels[key] = Math.max(0, currentLevels[key] - (DECAY_RATE_PER_DAY * diffDays));
      });

      // Update storage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(currentLevels));
      localStorage.setItem(LAST_UPDATE_KEY, today);
    } else if (!lastUpdate) {
      // First run initialization
      localStorage.setItem(STORAGE_KEY, JSON.stringify(currentLevels));
      localStorage.setItem(LAST_UPDATE_KEY, today);
    }

    setStorageLevels(currentLevels);
  }, []);

  // 統一確認画面 (FoodEditModal) 用ステート
  const [showFoodEditModal, setShowFoodEditModal] = useState(false);
  const [editingFood, setEditingFood] = useState<FoodItem | null>(null);
  const transitionProgress = useMemo(() => {
    return calculateTransitionProgress(
      userProfile?.daysOnCarnivore,
      userProfile?.carnivoreStartDate
    );
  }, [userProfile?.daysOnCarnivore, userProfile?.carnivoreStartDate]);

  // ストリークデータを読み込み
  useEffect(() => {
    const loadStreakData = async () => {
      const data = await calculateStreak();
      setStreakData(data);
    };
    loadStreakData();
  }, [dailyLog?.date]); // dailyLogの日付が変更されたら再計算

  // プレビュー変更ハンドラ（無限ループ防止のためuseCallbackでメモ化）
  const handlePreviewChange = useCallback(
    (preview: PreviewData | null) => {
      if (preview) {
        setPreview(preview);
      } else {
        clearPreview();
      }
    },
    [setPreview, clearPreview]
  );

  // AISpeedDialから呼び出されるコールバックを登録（無限ループ防止のため、useRefで初回のみ実行）
  const hasRegisteredCallbacks = useRef(false);

  useEffect(() => {
    if (hasRegisteredCallbacks.current) return; // 既に登録済みの場合はスキップ

    if (onOpenFatTabReady) {
      onOpenFatTabReady(() => {
        // 脂質タブを開く（AnimalTypeではないため、別の方法で処理）
        // setSelectedAnimal('fat'); // 削除：'fat'はAnimalTypeではない
      });
    }
    if (onAddFoodReady) {
      onAddFoodReady((foodItem) => {
        addFood(foodItem); // 食品を追加
      });
    }
    hasRegisteredCallbacks.current = true;
  }, [onOpenFatTabReady, onAddFoodReady, addFood]);

  // 「いつもの」タブのデータを読み込む
  useEffect(() => {
    if (showMyFoods) {
      loadMyFoods();
    }
  }, [showMyFoods]);

  // 「履歴」タブのデータを読み込む
  useEffect(() => {
    if (showHistory) {
      loadHistory();
    }
  }, [showHistory]);

  const loadMyFoods = async () => {
    // ユーザーが明示的に登録した「いつもの食品」のみを表示
    const myFoods = getMyFoods();
    // 履歴からも取得してマージ（dateプロパティを追加）
    const history = await getAllFoodHistory();
    const historyWithDate = history.map((food) => ({
      ...food,
      date: new Date().toISOString().split('T')[0], // 最新の日付を設定
    }));
    // 既存のmyFoodsと履歴をマージ（重複を除去）
    const merged = [...myFoods];
    historyWithDate.forEach((historyFood) => {
      const exists = merged.some(
        (item) =>
          item.foodName === historyFood.foodName &&
          item.amount === historyFood.amount &&
          item.unit === historyFood.unit
      );
      if (!exists) {
        merged.push(historyFood);
      }
    });
    setMyFoodsList(merged);
  };

  const loadHistory = async () => {
    const { getDailyLogs } = await import('../utils/storage');
    const logs = await getDailyLogs();

    // 過去30日分の食品を時系列で取得
    const historyItems: Array<{
      foodName: string;
      amount: number;
      unit: 'g' | '個';
      date: string;
    }> = [];
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    logs
      .filter((log) => new Date(log.date) >= thirtyDaysAgo)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .forEach((log) => {
        log.fuel.forEach((food) => {
          historyItems.push({
            foodName: food.item,
            amount: food.amount,
            unit: food.unit as 'g' | '個',
            date: log.date,
          });
        });
      });

    setHistoryList(historyItems.slice(0, 50)); // 最新50件まで表示
  };

  // 履歴から食品を追加（量選択モーダルを表示）
  const handleAddHistoryFoodClick = (historyItem: {
    foodName: string;
    amount: number;
    unit: 'g' | '個';
    date: string;
  }) => {
    setSelectedHistoryFood(historyItem);
    setAmountInput(historyItem.amount.toString());
    setShowAmountModal(true);
  };

  // 履歴から食品を追加（実際の追加処理）
  const handleAddHistoryFood = async (historyItem: {
    foodName: string;
    amount: number;
    unit: 'g' | '個';
    date: string;
  }) => {
    // 既存のログから該当する食品の栄養素データを検索
    // これにより、カスタム食品や日本語名の食品にも対応
    const allLogs = await getDailyLogs();
    let existingFoodItem: FoodItem | null = null;

    // 該当する日付のログから検索（最も正確）
    const targetLog = allLogs.find((log) => log.date === historyItem.date);
    if (targetLog) {
      // 完全一致（食品名、量、単位）を検索
      existingFoodItem =
        targetLog.fuel.find(
          (f) =>
            f.item === historyItem.foodName &&
            f.amount === historyItem.amount &&
            f.unit === historyItem.unit
        ) || null;

      // 完全一致が見つからない場合は、食品名のみで検索
      if (!existingFoodItem) {
        existingFoodItem = targetLog.fuel.find((f) => f.item === historyItem.foodName) || null;
      }
    }

    // 該当日付に見つからない場合、全ログから検索
    if (!existingFoodItem) {
      for (const log of allLogs) {
        existingFoodItem = log.fuel.find((f) => f.item === historyItem.foodName) || null;
        if (existingFoodItem) break;
      }
    }

    // 既存の栄養素データがある場合は、それを使用
    if (
      existingFoodItem &&
      existingFoodItem.nutrients &&
      Object.keys(existingFoodItem.nutrients).length > 0
    ) {
      const ratio = historyItem.amount / existingFoodItem.amount;
      const foodItem: FoodItem = {
        item: historyItem.foodName,
        amount: historyItem.amount,
        unit: historyItem.unit,
        type: existingFoodItem.type,
        nutrients: Object.fromEntries(
          Object.entries(existingFoodItem.nutrients || {}).map(([key, value]) => [
            key,
            (value || 0) * ratio,
          ])
        ) as FoodItem['nutrients'],
      };
      addFood(foodItem);
      // 履歴更新を確実にするため、少し遅延させてからイベントを発火
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('dailyLogUpdated'));
      }, 200);
      setShowHistory(false);
      return;
    }

    // 食品名からFoodDataを検索（フォールバック）
    const foodResults = searchFoods(historyItem.foodName);
    const foodData = foodResults.length > 0 ? foodResults[0] : null;

    if (!foodData) {
      // データベースにも見つからない場合は、空の栄養素データで追加
      const foodItem: FoodItem = {
        item: historyItem.foodName,
        amount: historyItem.amount,
        unit: historyItem.unit,
        type: 'animal', // デフォルト
        nutrients: {},
      };
      addFood(foodItem);
      // 履歴更新を確実にするため、少し遅延させてからイベントを発火
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('dailyLogUpdated'));
      }, 200);
      setShowHistory(false);
      return;
    }

    // FoodItemを作成
    const ratio = historyItem.amount / 100;
    const foodItem: FoodItem = {
      item: historyItem.foodName,
      amount: historyItem.amount,
      unit: historyItem.unit,
      type: foodData.type,
      nutrients: {
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
      },
    };

    addFood(foodItem);
    // 履歴更新を確実にするため、少し遅延させてからイベントを発火
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('dailyLogUpdated'));
    }, 200);
    setShowHistory(false);
  };

  // 「いつもの」食品を追加（量選択モーダルを表示）
  const handleAddMyFoodClick = (food: MyFoodItem) => {
    setSelectedMyFood(food);
    setMyFoodAmountInput(food.amount.toString());
    setShowMyFoodAmountModal(true);
  };

  // 「いつもの」食品を追加（実際の追加処理）
  const handleAddMyFood = async (food: MyFoodItem, newAmount?: number) => {
    const amountToUse = newAmount !== undefined ? newAmount : food.amount;

    // 既存のログから該当する食品の栄養素データを検索
    // これにより、カスタム食品や日本語名の食品にも対応
    const allLogs = await getDailyLogs();
    let existingFoodItem: FoodItem | null = null;

    // 全ログから検索
    for (const log of allLogs) {
      existingFoodItem = log.fuel.find((f) => f.item === food.foodName) || null;
      if (existingFoodItem) break;
    }

    // 既存の栄養素データがある場合は、それを使用
    if (
      existingFoodItem &&
      existingFoodItem.nutrients &&
      Object.keys(existingFoodItem.nutrients).length > 0
    ) {
      const ratio = amountToUse / existingFoodItem.amount;
      const foodItem: FoodItem = {
        item: food.foodName,
        amount: amountToUse,
        unit: food.unit,
        type: existingFoodItem.type,
        nutrients: Object.fromEntries(
          Object.entries(existingFoodItem.nutrients || {}).map(([key, value]) => [
            key,
            (value || 0) * ratio,
          ])
        ) as FoodItem['nutrients'],
      };
      addFood(foodItem);
      // 履歴更新を確実にするため、少し遅延させてからイベントを発火
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('dailyLogUpdated'));
      }, 200);
      setShowMyFoods(false);
      return;
    }

    // 食品名からFoodDataを検索（フォールバック）
    const foodResults = searchFoods(food.foodName);
    const foodData = foodResults.length > 0 ? foodResults[0] : null;

    if (!foodData) {
      // データベースにも見つからない場合は、空の栄養素データで追加
      const foodItem: FoodItem = {
        item: food.foodName,
        amount: amountToUse,
        unit: food.unit,
        type: 'animal', // デフォルト
        nutrients: {},
      };
      addFood(foodItem);
      // 履歴更新を確実にするため、少し遅延させてからイベントを発火
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('dailyLogUpdated'));
      }, 200);
      setShowMyFoods(false);
      return;
    }

    // FoodItemを作成
    const ratio = amountToUse / 100;
    const foodItem: FoodItem = {
      item: food.foodName,
      amount: amountToUse,
      unit: food.unit,
      type: foodData.type,
      nutrients: {
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
      },
    };

    addFood(foodItem);
    // 履歴更新を確実にするため、少し遅延させてからイベントを発火
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('dailyLogUpdated'));
    }, 200);
    setShowMyFoods(false);
  };

  // プレビューゲージを生成（既に食べたもの + プレビューを分けて表示）
  const previewGauges = useMemo(() => {
    if (!previewData) return [];

    // dailyLogがない場合のデフォルト値
    const defaultMetrics = {
      effectiveProtein: 0,
      proteinRequirement: 100,
      fatTotal: 0,
      effectiveVitC: 0,
      vitCRequirement: 10, // カーニボアロジック: 糖質ゼロ環境下では最小必要量10mg。肉で十分摂取可能
      effectiveVitK: 0,
      effectiveIron: 0,
      ironRequirement: 8,
      effectiveZinc: 0,
      magnesiumTotal: 0,
      sodiumTotal: 0,
      netCarbs: 0,
      fiberTotal: 0,
    };

    const { calculatedMetrics } = dailyLog || { calculatedMetrics: defaultMetrics };
    const safeEffectiveProtein = calculatedMetrics.effectiveProtein ?? 0;
    const safeProteinRequirement = calculatedMetrics.proteinRequirement ?? 100;

    const configs: Record<
      string,
      {
        key: NutrientKey;
        label: string;
        current: number;
        previewValue: number;
        target: number;
        unit: string;
        nutrient: string;
        status: 'optimal' | 'low' | 'warning';
      }
    > = {
      protein: {
        key: 'protein',
        label: 'Protein (Effective)',
        current: safeEffectiveProtein,
        previewValue: previewData.protein || 0,
        target: safeProteinRequirement,
        unit: 'g',
        nutrient: 'protein',
        status: safeEffectiveProtein >= safeProteinRequirement ? 'optimal' : 'low',
      },
      fat: {
        key: 'fat',
        label: 'Fat',
        current: calculatedMetrics.fatTotal ?? 0,
        previewValue: previewData.fat || 0,
        target: dynamicTargets.fat ?? 150,
        unit: 'g',
        nutrient: 'fat',
        status:
          (calculatedMetrics.fatTotal ?? 0) >= (dynamicTargets.fat ?? 150)
            ? 'optimal'
            : (calculatedMetrics.fatTotal ?? 0) < (dynamicTargets.fat ?? 150) * 0.67
              ? 'warning'
              : 'low',
      },
      zinc: {
        key: 'zinc',
        label: 'Zinc (Effective)',
        current: calculatedMetrics.effectiveZinc,
        previewValue: previewData.zinc || 0,
        target: dynamicTargets.zinc ?? 11,
        unit: 'mg',
        nutrient: 'zinc',
        status: calculatedMetrics.effectiveZinc >= (dynamicTargets.zinc ?? 11) ? 'optimal' : 'low',
      },
      iron: {
        key: 'iron',
        label: 'Iron (Effective)',
        current: calculatedMetrics.effectiveIron,
        previewValue: previewData.iron || 0,
        target: dynamicTargets.iron ?? calculatedMetrics.ironRequirement ?? 8,
        unit: 'mg',
        nutrient: 'iron',
        status:
          calculatedMetrics.effectiveIron >= (dynamicTargets.iron ?? calculatedMetrics.ironRequirement ?? 8)
            ? 'optimal'
            : 'low',
      },
      magnesium: {
        key: 'magnesium',
        label: 'Magnesium',
        current: calculatedMetrics.magnesiumTotal,
        previewValue: previewData.magnesium || 0,
        target: dynamicTargets.magnesium ?? 400,
        unit: 'mg',
        nutrient: 'magnesium',
        status: calculatedMetrics.magnesiumTotal >= (dynamicTargets.magnesium ?? 400) ? 'optimal' : 'low',
      },
      sodium: {
        key: 'sodium',
        label: 'Sodium',
        current: calculatedMetrics.sodiumTotal,
        previewValue: previewData.sodium || 0,
        target: dynamicTargets.sodium ?? 5000,
        unit: 'mg',
        nutrient: 'sodium',
        status:
          calculatedMetrics.sodiumTotal >= (dynamicTargets.sodium ?? 5000)
            ? 'optimal'
            : calculatedMetrics.sodiumTotal < (dynamicTargets.sodium ?? 5000) * 0.6
              ? 'warning'
              : 'low',
      },
    };

    // 現在の表示モードを取得（Simple/Standard/Detailed）
    const displayMode = getNutrientDisplayMode();

    // Tierごとのグループ定義
    // Tierごとのグループ定義 (gaugeUtilsから取得)
    const TIER_1_KEYS = [...NUTRIENT_GROUPS.electrolytes.nutrients] as NutrientKey[];
    const TIER_2_KEYS = [...NUTRIENT_GROUPS.macros.nutrients] as NutrientKey[];
    // 'carbs' は gaugeUtils.macros に含まれないため、Tier 3 (Other) に移動します

    // 表示可能なキーをフィルタリングするヘルパー
    const getVisibleKeys = (keys: NutrientKey[]) => {
      return keys.filter(key => {
        const config = configs[key];
        if (!config) return false;
        if (config.current <= 0 && config.previewValue <= 0) return false;
        return isNutrientVisibleInMode(key, displayMode);
      });
    };

    const visibleTier1 = getVisibleKeys(TIER_1_KEYS);
    const visibleTier2 = getVisibleKeys(TIER_2_KEYS);
    const visibleTier3 = Object.keys(configs).filter(key =>
      !TIER_1_KEYS.includes(key as NutrientKey) &&
      !TIER_2_KEYS.includes(key as NutrientKey)
    ).filter(key => {
      const config = configs[key as NutrientKey];
      if (!config) return false;
      if (config.current <= 0 && config.previewValue <= 0) return false;
      return isNutrientVisibleInMode(key as NutrientKey, displayMode);
    }) as NutrientKey[];

    // ゲージレンダリングヘルパー
    const renderGauge = (key: NutrientKey) => {
      const config = configs[key];
      // 二重チェックになるが念のため
      if (!config) return null;

      return (
        <MiniNutrientGauge
          key={config.key}
          label={config.label}
          currentDailyTotal={config.current}
          previewAmount={config.previewValue}
          target={config.target}
          color={getNutrientColor(config.key)}
          unit={config.unit}
          nutrientKey={config.key}
        />
      );
    };

    return (
      <div className="space-y-6">
        {/* Tier 1: Essentials (Electrolytes) */}
        {visibleTier1.length > 0 && (
          <div className="tier-section">
            <h3 className="text-sm font-bold text-gray-500 mb-2 flex items-center gap-1">
              {NUTRIENT_GROUPS.electrolytes.label}
            </h3>
            <div className="space-y-2">
              {visibleTier1.map(renderGauge)}
            </div>
          </div>
        )}

        {/* Tier 2: Macros */}
        {visibleTier2.length > 0 && (
          <div className="tier-section">
            <h3 className="text-sm font-bold text-gray-500 mb-2 flex items-center gap-1">
              {NUTRIENT_GROUPS.macros.label}
            </h3>
            <div className="space-y-2">
              {visibleTier2.map(renderGauge)}
            </div>
          </div>
        )}

        {/* Tier 3: Other (Verified Metrics) */}
        {visibleTier3.length > 0 && (
          <div className="tier-section">
            <h3 className="text-sm font-bold text-gray-500 mb-2 flex items-center gap-1">
              {NUTRIENT_GROUPS.other.label}
            </h3>
            <div className="space-y-2">
              {visibleTier3.map(renderGauge)}
            </div>
          </div>
        )}

        {/* Storage Gauges Section (New) */}
        <div className="tier-section">
          <h3 className="text-sm font-bold text-gray-500 mb-2 flex items-center gap-1">
            <span>📦</span> Nutrient Storage
          </h3>
          <div className="space-y-2">
            <StorageNutrientGauge
              label="Vitamin A"
              currentStorage={storageLevels.vitamin_a}
              nutrientKey="vitamin_a"
            />
            <StorageNutrientGauge
              label="Vitamin D"
              currentStorage={storageLevels.vitamin_d}
              nutrientKey="vitamin_d"
            />
            <StorageNutrientGauge
              label="Vitamin B12"
              currentStorage={storageLevels.vitamin_b12}
              nutrientKey="vitamin_b12"
            />
            <StorageNutrientGauge
              label="Iron"
              currentStorage={storageLevels.iron}
              nutrientKey="iron"
            />
          </div>
        </div>
      </div >
    );
  }, [previewData, dailyLog]);

  // 動物タイプのマッピング（AnimalType -> ButcherSelectのAnimalType）
  const mapAnimalType = (animal: AnimalType): 'ruminant' | 'pork_poultry' | 'seafood' | 'eggs_fats' | 'organs' | null => {
    if (animal === 'ruminant' || animal === 'beef' || animal === 'lamb') return 'ruminant';
    if (animal === 'pork_poultry' || animal === 'pork' || animal === 'chicken' || animal === 'duck') return 'pork_poultry';
    if (animal === 'seafood' || animal === 'fish') return 'seafood';
    if (animal === 'eggs_fats' || animal === 'egg') return 'eggs_fats';
    if (animal === 'organs') return 'organs';
    return 'ruminant'; // デフォルトはruminant
  };

  // dailyLogがない場合でも、プレビューデータがあればゲージを表示する
  // 早期リターンは削除し、常にメインのレンダリングに進む

  return (
    <div className="home-screen-container">
      {/* PとFの充分な摂取量ゲージ（Master Specification準拠: ホーム画面の最上部に常時表示） */}
      <PFRatioGauge previewData={previewData} showPreview={showNutrientPreview} />

      {/* コンテンツエリア */}
      <div className="home-screen-content" style={{ paddingTop: '100px' }}>
        {/* Phase 1: 移行期間バナー（移行期間中のみ表示） */}
        {transitionProgress && (
          <TransitionBanner
            daysInTransition={transitionProgress.daysInTransition}
            totalDays={transitionProgress.totalDays}
            onPress={() => setShowTransitionGuide(true)}
          />
        )}

        {/* Phase 1: 移行期間ガイド画面（モーダル） */}
        {showTransitionGuide && transitionProgress && (
          <TransitionGuideModal
            progress={transitionProgress}
            onClose={() => setShowTransitionGuide(false)}
          />
        )}



        {/* Symptom Checker removed - replaced with AI Prompt Chips in Magic Input */}

        {/* 通知設定（常に表示） */}
        <div
          style={{
            padding: '0.75rem',
            marginBottom: '1rem',
            backgroundColor: '#fef3c7',
            border: '1px solid #fbbf24',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.5rem',
          }}
        >
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '20px' }}>🔔</span>
            <div>
              <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '0.25rem' }}>
                通知設定
              </div>
              <div style={{ fontSize: '12px', color: '#92400e' }}>
                電解質アラート、脂質不足リマインダーなどの通知を受け取れます
              </div>
            </div>
          </div>
          <button
            onClick={async () => {
              const notificationPermission = 'Notification' in window ? Notification.permission : 'default';
              if (notificationPermission === 'denied') {
                alert('通知が拒否されています。ブラウザの設定から通知を許可してください。\n\n設定画面からも通知設定を変更できます。');
                const event = new CustomEvent('navigateToScreen', { detail: 'settings' });
                window.dispatchEvent(event);
                return;
              }
              const { requestNotificationPermission } = await import('../utils/defrostReminder');
              const permission = await requestNotificationPermission();
              if (permission) {
                localStorage.setItem('settings_notification_enabled', JSON.stringify(true));
                window.location.reload(); // 状態を更新するため再読み込み
              }
            }}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#f59e0b',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            有効にする
          </button>
        </div>

        {/* 食品追加ボタン */}
        <div className="home-screen-section" style={{ position: 'relative', zIndex: 10 }}>
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.25rem',
              marginBottom: '1rem',
              flexWrap: 'wrap',
            }}
          >
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                // デフォルトで反芻動物を選択
                setSelectedAnimal('ruminant');
                setShowMyFoods(false);
                setShowHistory(false);
              }}
              title={t('home.addFood')}
              style={{
                width: '44px',
                height: '44px',
                padding: 0,
                backgroundColor: selectedAnimal ? '#b91c1c' : '#f3f4f6',
                color: selectedAnimal ? 'white' : '#374151',
                fontWeight: 600,
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000,
                position: 'relative',
              }}
              onMouseEnter={(e) => {
                if (!selectedAnimal) {
                  e.currentTarget.style.backgroundColor = '#e5e7eb';
                }
              }}
              onMouseLeave={(e) => {
                if (!selectedAnimal) {
                  e.currentTarget.style.backgroundColor = '#f3f4f6';
                }
              }}
            >
              +
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowHistory(!showHistory);
                setShowMyFoods(false);
                setSelectedAnimal(null);
              }}
              title={t('home.history')}
              style={{
                width: '44px',
                height: '44px',
                padding: 0,
                backgroundColor: showHistory ? '#b91c1c' : '#f3f4f6',
                color: showHistory ? 'white' : '#374151',
                fontWeight: 600,
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000,
                position: 'relative',
              }}
              onMouseEnter={(e) => {
                if (!showHistory) {
                  e.currentTarget.style.backgroundColor = '#e5e7eb';
                }
              }}
              onMouseLeave={(e) => {
                if (!showHistory) {
                  e.currentTarget.style.backgroundColor = '#f3f4f6';
                }
              }}
            >
              📋
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowMyFoods(!showMyFoods);
                setShowHistory(false);
                setSelectedAnimal(null);
              }}
              title={t('home.myFoods')}
              style={{
                width: '44px',
                height: '44px',
                padding: 0,
                backgroundColor: showMyFoods ? '#b91c1c' : '#f3f4f6',
                color: showMyFoods ? 'white' : '#374151',
                fontWeight: 600,
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000,
                position: 'relative',
              }}
              onMouseEnter={(e) => {
                if (!showMyFoods) {
                  e.currentTarget.style.backgroundColor = '#e5e7eb';
                }
              }}
              onMouseLeave={(e) => {
                if (!showMyFoods) {
                  e.currentTarget.style.backgroundColor = '#f3f4f6';
                }
              }}
            >
              ⭐
            </button>
            <button
              onClick={() => {
                const event = new CustomEvent('navigateToScreen', { detail: 'customFood' });
                window.dispatchEvent(event);
              }}
              title={t('customFood.title')}
              style={{
                width: '44px',
                height: '44px',
                padding: 0,
                backgroundColor: '#f3f4f6',
                color: '#374151',
                fontWeight: 600,
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000,
                position: 'relative',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#e5e7eb';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#f3f4f6';
              }}
            >
              ✏️
            </button>
            <button
              onClick={() => {
                const event = new CustomEvent('navigateToScreen', { detail: 'recipe' });
                window.dispatchEvent(event);
              }}
              title={t('home.recipe')}
              style={{
                width: '44px',
                height: '44px',
                padding: 0,
                backgroundColor: '#f3f4f6',
                color: '#374151',
                fontWeight: 600,
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000,
                position: 'relative',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#e5e7eb';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#f3f4f6';
              }}
            >
              🍽️
            </button>
            {featureDisplaySettings.photoUpload && (
              <button
                onClick={() => {
                  // モーダルを表示
                  setShowPhotoOrBarcodeModal(true);
                }}
                title={t('home.addFromPhoto') + ' / ' + t('home.barcodeScan')}
                style={{
                  width: '44px',
                  height: '44px',
                  padding: 0,
                  backgroundColor: '#f3f4f6',
                  color: '#374151',
                  fontWeight: 600,
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 1000,
                  position: 'relative',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#e5e7eb';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#f3f4f6';
                }}
              >
                📷
              </button>
            )}
          </div>
        </div>

        {/* 「いつもの」タブ（Master Specification準拠: History Copy機能） */}
        {featureDisplaySettings.myFoodsTab && showMyFoods && (
          <div className="home-screen-section" style={{ marginTop: '1rem' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1rem',
              }}
            >
              <h2 className="home-screen-section-title">{t('home.myFoodsTitle')}</h2>
              <button
                onClick={() => {
                  const event = new CustomEvent('navigateToScreen', { detail: 'customFood' });
                  window.dispatchEvent(event);
                }}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#b91c1c',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                }}
              >
                + 新規作成
              </button>
            </div>
            {myFoodsList.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#6b7280', padding: '2rem' }}>
                {t('home.noMyFoodsRegistered')}
              </p>
            ) : (
              <>
                {/* 検索バー */}
                <div style={{ marginBottom: '1rem' }}>
                  <input
                    type="text"
                    value={myFoodsSearchQuery}
                    onChange={(e) => setMyFoodsSearchQuery(e.target.value)}
                    placeholder={t('input.searchPlaceholder')}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '14px',
                    }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {myFoodsList
                    .filter((food) => {
                      const searchLower = myFoodsSearchQuery.toLowerCase();
                      const displayName = food.displayName || food.foodName;
                      return (
                        displayName.toLowerCase().includes(searchLower) ||
                        food.foodName.toLowerCase().includes(searchLower)
                      );
                    })
                    .map((food, index) => (
                      <div
                        key={`${food.foodName}_${food.amount}_${food.unit}_${index}`}
                        style={{
                          padding: '1rem',
                          backgroundColor: '#f9fafb',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <button
                          onClick={() => handleAddMyFoodClick(food)}
                          style={{
                            flex: 1,
                            textAlign: 'left',
                            cursor: 'pointer',
                            background: 'none',
                            border: 'none',
                            padding: 0,
                          }}
                        >
                          <div
                            style={{ fontWeight: 600, fontSize: '16px', marginBottom: '0.25rem' }}
                          >
                            {food.displayName || food.foodName}
                          </div>
                          <div style={{ fontSize: '14px', color: '#6b7280' }}>
                            {food.amount}
                            {food.unit === 'g' ? 'g' : '個'}
                          </div>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeMyFood(food);
                            loadMyFoods();
                          }}
                          style={{
                            padding: '0.5rem',
                            backgroundColor: '#fee2e2',
                            color: '#dc2626',
                            border: 'none',
                            borderRadius: '4px',
                            fontSize: '12px',
                            cursor: 'pointer',
                            fontWeight: '500',
                          }}
                          title={t('common.delete')}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* 「履歴」タブ */}
        {featureDisplaySettings.historyTab && showHistory && (
          <div className="home-screen-section" style={{ marginTop: '1rem' }}>
            <h2 className="home-screen-section-title">{t('home.history')}</h2>
            {historyList.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#6b7280', padding: '2rem' }}>
                {t('home.noHistory')}
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {historyList.map((food, index) => (
                  <div
                    key={`${food.foodName}_${food.amount}_${food.unit}_${food.date}_${index}`}
                    onClick={() => handleAddHistoryFoodClick(food)}
                    style={{
                      padding: '1rem',
                      backgroundColor: '#f9fafb',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#f3f4f6';
                      e.currentTarget.style.borderColor = '#dc2626';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#f9fafb';
                      e.currentTarget.style.borderColor = '#e5e7eb';
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '16px', marginBottom: '0.25rem' }}>
                          {food.foodName}
                        </div>
                        <div style={{ fontSize: '14px', color: '#6b7280' }}>
                          {food.amount}
                          {food.unit === 'g' ? 'g' : '個'}
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <button
                          onClick={async (e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            try {
                              // 「いつもの」に追加
                              addMyFood({
                                foodName: food.foodName,
                                amount: food.amount,
                                unit: food.unit,
                              });
                              // UIを即座に更新
                              await loadMyFoods();
                            } catch (error) {
                              if (import.meta.env.DEV) {
                                console.error('「いつもの」への追加に失敗:', error);
                              }
                            }
                          }}
                          style={{
                            padding: '0.25rem 0.5rem',
                            backgroundColor: '#b91c1c',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            fontSize: '12px',
                            cursor: 'pointer',
                            fontWeight: '500',
                          }}
                          title={t('home.myFoods')}
                        >
                          ⭐
                        </button>
                        <div style={{ fontSize: '12px', color: '#9ca3af' }}>
                          {new Date(food.date).toLocaleDateString('ja-JP', {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ButcherSelect が展開されている場合 */}
        {selectedAnimal && mapAnimalType(selectedAnimal) && (
          <div className="home-screen-section">
            <div className="flex items-center justify-between mb-3">
              <h2 className="home-screen-section-title">
                {selectedAnimal === 'ruminant' || selectedAnimal === 'beef' || selectedAnimal === 'lamb'
                  ? 'Ruminant Meat'
                  : selectedAnimal === 'pork_poultry' || selectedAnimal === 'pork' || selectedAnimal === 'chicken'
                    ? 'Pork & Poultry'
                    : selectedAnimal === 'seafood' || selectedAnimal === 'fish'
                      ? 'Seafood'
                      : selectedAnimal === 'eggs_fats' || selectedAnimal === 'egg'
                        ? 'Eggs & Fats'
                        : selectedAnimal === 'organs'
                          ? 'Organs'
                          : t('home.food')}{' '}
                {t('home.select')}
              </h2>
              <button
                onClick={() => setSelectedAnimal(null)}
                className="text-sm text-carnivore-zinc-600 hover:text-carnivore-red-600"
              >
                × {t('common.close')}
              </button>
            </div>
            <ButcherSelect
              initialAnimal={mapAnimalType(selectedAnimal)!}
              onSelect={(animal, part) => {
                if (import.meta.env.DEV) {

                }
              }}
              onPreviewChange={handlePreviewChange}
              onFoodAdd={(foodItem) => {
                // ButcherSelectからの追加もFoodEditModalを経由する
                setEditingFood(foodItem);
                setShowFoodEditModal(true);
                // ButcherSelectは開いたままにしない（モーダルが出るので閉じる）
                setSelectedAnimal(null);
              }}
              currentDailyTotal={
                dailyLog?.calculatedMetrics
                  ? {
                    protein: dailyLog.calculatedMetrics.effectiveProtein || 0,
                    fat: dailyLog.calculatedMetrics.fatTotal || 0,
                    zinc: dailyLog.calculatedMetrics.effectiveZinc || 0,
                    magnesium: dailyLog.calculatedMetrics.magnesiumTotal || 0,
                    iron: dailyLog.calculatedMetrics.effectiveIron || 0,
                    vitamin_b12: dailyLog.calculatedMetrics.vitaminB12Total || 0,
                    sodium: dailyLog.calculatedMetrics.sodiumTotal || 0,
                    potassium: dailyLog.calculatedMetrics.potassiumTotal || 0,
                    vitamin_a: dailyLog.calculatedMetrics.vitaminATotal || 0,
                    vitamin_d: dailyLog.calculatedMetrics.vitaminDTotal || 0,
                    vitamin_k2: dailyLog.calculatedMetrics.vitaminK2Total || 0,
                    choline: dailyLog.calculatedMetrics.cholineTotal || 0,
                    iodine: dailyLog.calculatedMetrics.iodineTotal || 0,
                    calcium: dailyLog.calculatedMetrics.calciumTotal || 0,
                    phosphorus: dailyLog.calculatedMetrics.phosphorusTotal || 0,
                    glycine: dailyLog.calculatedMetrics.glycineTotal || 0,
                    methionine: dailyLog.calculatedMetrics.methionineTotal || 0,
                    // Avoid Zone（避けるべきもの）
                    plantProtein: dailyLog.calculatedMetrics.plantProteinTotal || 0,
                    vegetableOil: dailyLog.calculatedMetrics.vegetableOilTotal || 0,
                    fiber: dailyLog.calculatedMetrics.fiberTotal || 0,
                    netCarbs: dailyLog.calculatedMetrics.netCarbs || 0,
                    phytates: dailyLog.calculatedMetrics.phytatesTotal || 0,
                    polyphenols: dailyLog.calculatedMetrics.polyphenolsTotal || 0,
                    flavonoids: dailyLog.calculatedMetrics.flavonoidsTotal || 0,
                    oxalates: dailyLog.calculatedMetrics.oxalatesTotal || 0,
                    lectins: dailyLog.calculatedMetrics.lectinsTotal || 0,
                    saponins: dailyLog.calculatedMetrics.saponinsTotal || 0,
                    goitrogens: dailyLog.calculatedMetrics.goitrogensTotal || 0,
                    tannins: dailyLog.calculatedMetrics.tanninsTotal || 0,
                  }
                  : {}
              }
              dynamicTargets={dynamicTargets}
            />
          </div>
        )}

        {featureDisplaySettings.recoveryProtocol && dailyLog?.recoveryProtocol && (
          <div className="home-screen-recovery" onClick={() => setShowRecoveryProtocol(true)}>
            <div className="home-screen-recovery-title">⚠️ Recovery Protocol Active</div>
            <div className="home-screen-recovery-text">
              Fasting: {dailyLog?.recoveryProtocol?.fastingTargetHours}h
            </div>
            {dailyLog?.recoveryProtocol?.dietRecommendations?.slice(0, 2).map((rec, idx) => (
              <div key={idx} className="home-screen-recovery-text">
                • {rec}
              </div>
            ))}
            <div className="home-screen-recovery-tap">Tap to view/edit →</div>
          </div>
        )}

        {/* Argument Card Modal */}
        {featureDisplaySettings.argumentCard && selectedArgumentCard && (
          <ArgumentCard
            card={getArgumentCardByNutrient(selectedArgumentCard)!}
            onClose={() => setSelectedArgumentCard(null)}
          />
        )}

        {/* Recovery Protocol Screen */}
        {featureDisplaySettings.recoveryProtocol &&
          showRecoveryProtocol &&
          dailyLog?.recoveryProtocol && (
            <RecoveryProtocolScreen
              protocol={dailyLog.recoveryProtocol}
              onClose={() => setShowRecoveryProtocol(false)}
              onSetProtocol={(protocol) => {
                setRecoveryProtocol(protocol);
                setShowRecoveryProtocol(false);
              }}
            />
          )}

        {/* All Nutrients Modal */}
        {showAllNutrients && dailyLog && dailyLog.calculatedMetrics && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 1000,
            }}
            onClick={() => setShowAllNutrients(false)}
          >
            <div
              style={{
                backgroundColor: 'white',
                padding: '2rem',
                borderRadius: '8px',
                maxWidth: '90%',
                maxHeight: '90%',
                overflow: 'auto',
                position: 'relative',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowAllNutrients(false)}
                style={{
                  position: 'absolute',
                  top: '1rem',
                  right: '1rem',
                  background: 'none',
                  border: 'none',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                }}
              >
                ×
              </button>
              <h2 style={{ marginBottom: '1rem' }}>全栄養素レポート</h2>
              {(() => {
                const calculatedMetrics = dailyLog.calculatedMetrics;
                if (!calculatedMetrics) return null;
                return (
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                      gap: '1rem',
                    }}
                  >
                    {/* 主要マクロ */}
                    <div>
                      <h3 style={{ marginBottom: '0.5rem', color: '#333' }}>主要マクロ</h3>
                      <div>
                        タンパク質（有効）: {calculatedMetrics.effectiveProtein.toFixed(1)} /{' '}
                        {calculatedMetrics.proteinRequirement.toFixed(1)} g
                      </div>
                      <div>脂質: {calculatedMetrics.fatTotal.toFixed(1)} g</div>
                      <div>
                        正味炭水化物: {calculatedMetrics.netCarbs.toFixed(1)} g{' '}
                        <span style={{ color: '#999', fontSize: '0.9rem' }}>(不要)</span>
                      </div>
                    </div>
                    {/* カーニボア重要項目 */}
                    <div>
                      <h3 style={{ marginBottom: '0.5rem', color: '#333' }}>カーニボア重要項目</h3>
                      <div>
                        ビタミンB12: {calculatedMetrics.vitaminB12Total?.toFixed(1) || '0.0'} μg
                      </div>
                      <div>
                        亜鉛（有効）: {calculatedMetrics.effectiveZinc.toFixed(1)} / 11.0 mg
                      </div>
                      <div>
                        鉄分（有効）: {calculatedMetrics.effectiveIron.toFixed(1)} /{' '}
                        {calculatedMetrics.ironRequirement.toFixed(1)} mg
                      </div>
                      <div>ビタミンA: {calculatedMetrics.effectiveVitC > 0 ? 'あり' : '0'} μg</div>
                    </div>
                    {/* ビタミンB群 */}
                    <div>
                      <h3 style={{ marginBottom: '0.5rem', color: '#333' }}>ビタミンB群</h3>
                      <div>
                        ビタミンB1: {calculatedMetrics.vitaminB1Total?.toFixed(2) || '0.00'} mg
                      </div>
                      <div>
                        ビタミンB2: {calculatedMetrics.vitaminB2Total?.toFixed(2) || '0.00'} mg
                      </div>
                      <div>
                        ビタミンB3: {calculatedMetrics.vitaminB3Total?.toFixed(2) || '0.00'} mg
                      </div>
                      <div>
                        ビタミンB6: {calculatedMetrics.vitaminB6Total?.toFixed(2) || '0.00'} mg
                      </div>
                      <div>
                        ビタミンB12: {calculatedMetrics.vitaminB12Total?.toFixed(1) || '0.0'} μg
                      </div>
                    </div>
                    {/* ビタミン */}
                    <div>
                      <h3 style={{ marginBottom: '0.5rem', color: '#333' }}>ビタミン</h3>
                      <div>
                        ビタミンC: {calculatedMetrics.effectiveVitC.toFixed(1)} /{' '}
                        {calculatedMetrics.vitCRequirement.toFixed(1)} mg
                      </div>
                      <div>
                        ビタミンK（有効）: {calculatedMetrics.effectiveVitK.toFixed(1)} / 120.0 μg
                      </div>
                      <div>
                        ビタミンE: {calculatedMetrics.vitaminETotal?.toFixed(2) || '0.00'} mg
                      </div>
                    </div>
                    {/* ミネラル */}
                    <div>
                      <h3 style={{ marginBottom: '0.5rem', color: '#333' }}>ミネラル</h3>
                      <div>ナトリウム: {calculatedMetrics.sodiumTotal.toFixed(0)} / 5000 mg</div>
                      <div>
                        マグネシウム: {calculatedMetrics.magnesiumTotal.toFixed(0)} / 400 mg
                      </div>
                      <div>カルシウム: {calculatedMetrics.calciumTotal?.toFixed(0) || '0'} mg</div>
                      <div>リン: {calculatedMetrics.phosphorusTotal?.toFixed(0) || '0'} mg</div>
                      <div>セレン: {calculatedMetrics.seleniumTotal?.toFixed(1) || '0.0'} μg</div>
                      <div>銅: {calculatedMetrics.copperTotal?.toFixed(2) || '0.00'} mg</div>
                      <div>
                        マンガン: {calculatedMetrics.manganeseTotal?.toFixed(2) || '0.00'} mg
                      </div>
                    </div>
                    {/* 要注意項目 */}
                    <div>
                      <h3 style={{ marginBottom: '0.5rem', color: '#333' }}>要注意項目</h3>
                      <div>
                        食物繊維: {calculatedMetrics.fiberTotal.toFixed(1)} g{' '}
                        <span style={{ color: '#999', fontSize: '0.9rem' }}>(0が理想)</span>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        )}

        {/* 量選択モーダル */}
        {showAmountModal && selectedHistoryFood && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 1000,
            }}
            onClick={() => setShowAmountModal(false)}
          >
            <div
              style={{
                backgroundColor: 'white',
                borderRadius: '16px',
                padding: '2rem',
                maxWidth: '400px',
                width: '90%',
                maxHeight: '90vh',
                overflow: 'auto',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '1.5rem' }}>
                {t('home.selectAmount')}
              </h2>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                  {selectedHistoryFood.foodName} ({selectedHistoryFood.amount}
                  {selectedHistoryFood.unit})
                </label>
                <input
                  type="number"
                  value={amountInput}
                  onChange={(e) => setAmountInput(e.target.value)}
                  placeholder={selectedHistoryFood.amount.toString()}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '16px',
                  }}
                  autoFocus
                />
                <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '0.25rem' }}>
                  {t('home.unit')}: {selectedHistoryFood.unit}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => setShowAmountModal(false)}
                  style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor: '#f3f4f6',
                    color: '#374151',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '16px',
                    fontWeight: '600',
                  }}
                >
                  {t('common.cancel')}
                </button>
                <button
                  onClick={() => {
                    const amount = Number(amountInput);
                    if (!isNaN(amount) && amount > 0) {
                      handleAddHistoryFood({
                        ...selectedHistoryFood,
                        amount,
                      });
                      setShowAmountModal(false);
                      setSelectedHistoryFood(null);
                    }
                  }}
                  style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor: '#b91c1c',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '16px',
                    fontWeight: '600',
                  }}
                >
                  {t('home.add')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 「いつもの」食品の量選択モーダル */}
        {showMyFoodAmountModal && selectedMyFood && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 1000,
            }}
            onClick={() => setShowMyFoodAmountModal(false)}
          >
            <div
              style={{
                backgroundColor: 'white',
                borderRadius: '16px',
                padding: '2rem',
                maxWidth: '400px',
                width: '90%',
                maxHeight: '90vh',
                overflow: 'auto',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '1.5rem' }}>
                {t('home.confirmAdd')}
              </h2>

              <div style={{ marginBottom: '1.5rem' }}>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    fontWeight: '600',
                    fontSize: '16px',
                  }}
                >
                  {selectedMyFood.foodName}
                </label>
                <div style={{ marginBottom: '1rem', fontSize: '14px', color: '#6b7280' }}>
                  {t('home.originalAmount')}: {selectedMyFood.amount}
                  {selectedMyFood.unit}
                </div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                  {t('home.changeAmount')}
                </label>
                <input
                  type="number"
                  value={myFoodAmountInput}
                  onChange={(e) => setMyFoodAmountInput(e.target.value)}
                  placeholder={selectedMyFood.amount.toString()}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '16px',
                  }}
                  autoFocus
                />
                <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '0.25rem' }}>
                  {t('home.unit')}: {selectedMyFood.unit}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => setShowMyFoodAmountModal(false)}
                  style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor: '#f3f4f6',
                    color: '#374151',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '16px',
                    fontWeight: '600',
                  }}
                >
                  {t('common.cancel')}
                </button>
                <button
                  onClick={() => {
                    const amount = Number(myFoodAmountInput);
                    if (!isNaN(amount) && amount > 0) {
                      handleAddMyFood(selectedMyFood, amount);
                      setShowMyFoodAmountModal(false);
                      setSelectedMyFood(null);
                    }
                  }}
                  disabled={
                    !myFoodAmountInput ||
                    isNaN(Number(myFoodAmountInput)) ||
                    Number(myFoodAmountInput) <= 0
                  }
                  style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor:
                      !myFoodAmountInput ||
                        isNaN(Number(myFoodAmountInput)) ||
                        Number(myFoodAmountInput) <= 0
                        ? '#d1d5db'
                        : '#b91c1c',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor:
                      !myFoodAmountInput ||
                        isNaN(Number(myFoodAmountInput)) ||
                        Number(myFoodAmountInput) <= 0
                        ? 'not-allowed'
                        : 'pointer',
                    fontSize: '16px',
                    fontWeight: '600',
                    transition: 'background-color 0.2s',
                  }}
                >
                  {t('common.confirm')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* AI写真解析確認モーダル */}
      <PhotoAnalysisModal
        isOpen={showPhotoConfirmation}
        onClose={() => setShowPhotoConfirmation(false)}
        analysisResult={photoAnalysisResult!}
        onConfirm={(foodItem) => {
          addFood(foodItem);
          setShowPhotoConfirmation(false);
          setPhotoAnalysisResult(null);
        }}
        dynamicTargets={dynamicTargets}
      />
      {/* 旧コード（無効化） */}
      {false && showPhotoConfirmation && photoAnalysisResult && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
          }}
          onClick={() => setShowPhotoConfirmation(false)}
        >
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '16px',
              padding: '1.5rem',
              width: '90%',
              maxWidth: '500px',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2
              style={{
                fontSize: '20px',
                fontWeight: 'bold',
                marginBottom: '1.5rem',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              📸 解析結果の確認
            </h2>

            <div
              style={{
                marginBottom: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
              }}
            >
              <div>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    fontWeight: '600',
                    fontSize: '14px',
                    color: '#374151',
                  }}
                >
                  食品名
                </label>
                <input
                  type="text"
                  value={photoAnalysisResult.foodName}
                  onChange={(e) =>
                    setPhotoAnalysisResult({ ...photoAnalysisResult, foodName: e.target.value })
                  }
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '16px',
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    fontWeight: '600',
                    fontSize: '14px',
                    color: '#374151',
                  }}
                >
                  量 (g)
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input
                    type="number"
                    value={photoAnalysisResult.estimatedWeight}
                    onChange={(e) =>
                      setPhotoAnalysisResult({
                        ...photoAnalysisResult,
                        estimatedWeight: Number(e.target.value),
                      })
                    }
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '16px',
                    }}
                  />
                  <span style={{ fontWeight: '600' }}>g</span>
                </div>
              </div>

              {/* フォローアップ質問（詳細確認） */}
              {photoAnalysisResult.followupQuestions &&
                photoAnalysisResult.followupQuestions.length > 0 && (
                  <div
                    style={{
                      marginTop: '1rem',
                      padding: '1rem',
                      backgroundColor: '#f0f9ff',
                      borderRadius: '8px',
                      border: '1px solid #bae6fd',
                    }}
                  >
                    <h3
                      style={{
                        fontSize: '15px',
                        fontWeight: 'bold',
                        color: '#0369a1',
                        marginBottom: '0.75rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                      }}
                    >
                      🤖 AIからの確認
                      <span style={{ fontSize: '12px', fontWeight: 'normal', color: '#0c4a6e' }}>
                        （より正確に計算します）
                      </span>
                    </h3>
                    {photoAnalysisResult.followupQuestions.map((question, index) => (
                      <div key={index} style={{ marginBottom: '1rem' }}>
                        <label
                          style={{
                            display: 'block',
                            marginBottom: '0.5rem',
                            fontSize: '14px',
                            fontWeight: '500',
                            color: '#0c4a6e',
                          }}
                        >
                          {question}
                        </label>
                        <input
                          type="text"
                          placeholder="例: はい、10g / いいえ / 目玉焼き2個"
                          value={followupAnswers[question] || ''}
                          onChange={(e) =>
                            setFollowupAnswers({ ...followupAnswers, [question]: e.target.value })
                          }
                          style={{
                            width: '100%',
                            padding: '0.6rem',
                            border: '1px solid #bae6fd',
                            borderRadius: '6px',
                            fontSize: '14px',
                          }}
                        />
                      </div>
                    ))}

                    <button
                      onClick={async () => {
                        if (isAIProcessing) return;
                        try {
                          setIsAIProcessing(true);
                          const { refineFoodAnalysis } = await import('../services/aiService');
                          const refined = await refineFoodAnalysis(
                            photoAnalysisResult,
                            followupAnswers
                          );
                          setPhotoAnalysisResult({ ...refined, followupQuestions: [] }); // 質問完了とする
                          // followupAnswersはクリアしない（何と答えたか残してもいいが、今回はクリアせずそのまま次へ）
                        } catch (e) {
                          alert('再計算に失敗しました');
                        } finally {
                          setIsAIProcessing(false);
                        }
                      }}
                      disabled={isAIProcessing || Object.keys(followupAnswers).length === 0}
                      style={{
                        width: '100%',
                        padding: '0.6rem',
                        backgroundColor: isAIProcessing ? '#cbd5e1' : '#0ea5e9',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        fontWeight: '600',
                        cursor: isAIProcessing ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                      }}
                    >
                      {isAIProcessing ? '計算中...' : '🔄 回答を反映して再計算'}
                    </button>
                  </div>
                )}
            </div>

            <div
              style={{
                display: 'flex',
                gap: '1rem',
                justifyContent: 'flex-end',
                marginTop: '1rem',
              }}
            >
              <button
                onClick={() => setShowPhotoConfirmation(false)}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#f3f4f6',
                  color: '#374151',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: '600',
                }}
              >
                キャンセル
              </button>
              <button
                onClick={() => {
                  // 最終的に追加 -> FoodEditModalへ
                  const ratio = photoAnalysisResult.estimatedWeight / 100;
                  const nutrients: Record<string, number> = {};

                  if (photoAnalysisResult.nutrients) {
                    Object.entries(photoAnalysisResult.nutrients).forEach(([key, value]) => {
                      nutrients[key] = (value as number) * ratio;
                    });
                  }

                  const foodItem: FoodItem = {
                    item: photoAnalysisResult.foodName,
                    amount: photoAnalysisResult.estimatedWeight,
                    unit: 'g' as const,
                    type: (photoAnalysisResult.type as any) || 'animal',
                    nutrients: Object.keys(nutrients).length > 0 ? nutrients : undefined,
                  };

                  setEditingFood(foodItem);
                  setShowFoodEditModal(true);
                  setShowPhotoConfirmation(false);
                  setPhotoAnalysisResult(null);
                }}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#dc2626',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: '600',
                  boxShadow: '0 2px 4px rgba(220, 38, 38, 0.3)',
                }}
              >
                追加する
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 写真/バーコード選択モーダル */}
      {showPhotoOrBarcodeModal && (
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
            zIndex: 10000,
            padding: '1rem',
          }}
          onClick={() => setShowPhotoOrBarcodeModal(false)}
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
            <h3 style={{ margin: '0 0 1rem 0', fontSize: '18px', fontWeight: '600' }}>
              追加方法を選択
            </h3>
            <p style={{ margin: '0 0 1.5rem 0', fontSize: '14px', color: '#6b7280' }}>
              写真から追加するか、バーコードを読み取りますか？
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  setShowPhotoOrBarcodeModal(false);
                  setShowBarcodeScanner(true);
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
                バーコード読み取り
              </button>
              <button
                onClick={async () => {
                  setShowPhotoOrBarcodeModal(false);
                  // 写真から追加
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.accept = 'image/*';
                  input.capture = 'environment';
                  input.style.display = 'none';
                  document.body.appendChild(input);

                  input.onchange = async (e) => {
                    const file = (e.target as HTMLInputElement).files?.[0];
                    if (!file) {
                      document.body.removeChild(input);
                      return;
                    }

                    try {
                      // ローディング表示
                      const loadingMessage = document.createElement('div');
                      loadingMessage.textContent = '写真を解析中...';
                      loadingMessage.style.cssText =
                        'position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: rgba(0,0,0,0.8); color: white; padding: 1rem 2rem; border-radius: 8px; z-index: 10000;';
                      document.body.appendChild(loadingMessage);

                      const { analyzeFoodImage } = await import('../services/aiService');
                      const result = await analyzeFoodImage(file);

                      // ローディング表示を削除
                      document.body.removeChild(loadingMessage);

                      // 結果をセットして確認モーダルを表示
                      setPhotoAnalysisResult(result);
                      setFollowupAnswers({});
                      setShowPhotoConfirmation(true);

                      document.body.removeChild(input);
                    } catch (error) {
                      // ローディング表示を削除
                      const loadingMessage = document.querySelector('div[style*="写真を解析中"]');
                      if (loadingMessage) {
                        document.body.removeChild(loadingMessage);
                      }

                      logError(error, { component: 'HomeScreen', action: 'handlePhotoUpload' });
                      const { getUserFriendlyErrorMessage } = await import('../utils/errorHandler');
                      alert(
                        getUserFriendlyErrorMessage(error) ||
                        '写真の解析に失敗しました。もう一度お試しください。'
                      );
                      document.body.removeChild(input);
                    }
                  };

                  input.click();
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
                写真から追加
              </button>
            </div>
          </div>
        </div>
      )}

      {/* バーコードスキャナーモーダル */}
      <BarcodeScannerModal
        isOpen={showBarcodeScanner}
        onClose={() => setShowBarcodeScanner(false)}
        onSuccess={(foodName, amount) => {
          const foodItem: FoodItem = {
            item: foodName,
            amount,
            unit: 'g',
            type: 'animal', // デフォルト（後で変更可能）
          };
          // バーコードもFoodEditModalへ
          setEditingFood(foodItem);
          setShowFoodEditModal(true);
          setShowBarcodeScanner(false);
        }}
      />

      {/* 統一確認画面 (FoodEditModal) */}
      {showFoodEditModal && editingFood && (
        <FoodEditModal
          isOpen={showFoodEditModal}
          initialFood={editingFood}
          onClose={() => setShowFoodEditModal(false)}
          onSave={async (food) => {
            await addFood(food);
            setShowFoodEditModal(false);
            setEditingFood(null);
            clearPreview();
          }}
        />
      )}
    </div>
  );
}
