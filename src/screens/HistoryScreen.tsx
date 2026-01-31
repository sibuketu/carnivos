/**
 * CarnivOS (カーニボス) - History Screen (Web版)
 *
 * 日次ログ履歴画面: 過去のログ表示、日付選択、統計表示
 * 要件定義書: @Primal_Logic_History_Feature_Requirements.md 参照
 */

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { getDailyLogs, deleteDailyLog, saveDailyLog } from '../utils/storage';
import { getArgumentCardByNutrient } from '../data/argumentCards';
import ArgumentCard from '../components/ArgumentCard';
import { getFeatureDisplaySettings } from '../utils/featureDisplaySettings';
import { useApp } from '../context/AppContext';
import { getCarnivoreTargets } from '../data/carnivoreTargets';
import { getNutrientColor, NUTRIENT_GROUPS } from '../utils/gaugeUtils';
import MiniNutrientGauge from '../components/MiniNutrientGauge';
import { getNutrientDisplayMode, isNutrientVisibleInMode } from '../utils/nutrientPriority';
import { searchFoods } from '../data/foodsDatabase';
import { useTranslation } from '../utils/i18n';
import { logError, getUserFriendlyErrorMessage } from '../utils/errorHandler';
import { calculateAllMetrics } from '../utils/nutrientCalculator';
import type { DailyLog, FoodItem } from '../types';
import './HistoryScreen.css';

export default function HistoryScreen() {
  const { t } = useTranslation();
  const { userProfile, addFood } = useApp();
  const featureDisplaySettings = getFeatureDisplaySettings();
  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [expandedLogs, setExpandedLogs] = useState<Set<string>>(new Set());
  const [selectedArgumentCard, setSelectedArgumentCard] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<'today' | '7days' | '30days' | 'all'>('all');
  const [activeTab, setActiveTab] = useState<'summary' | 'logs'>('logs');
  const [showAmountModal, setShowAmountModal] = useState(false);
  const [selectedFoodForAdd, setSelectedFoodForAdd] = useState<FoodItem | null>(null);
  const [amountInput, setAmountInput] = useState<string>('');
  // showNutrientDetails removed - now controlled by nutrientDisplayMode

  const loadLogs = useCallback(async () => {
    // getDailyLogs()を使用（デバッグモードでもキャッシュが効く）
    const allLogs = await getDailyLogs();
    // Sort by date (newest first)
    const sorted = allLogs.sort((a, b) => b.date.localeCompare(a.date));
    setLogs(sorted);
  }, []);

  useEffect(() => {
    loadLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // 初回のみ実行

  // デバッグモード変更と食品追加を監視
  const loadLogsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'settings_debug_mode') {
        loadLogs();
      }
    };
    window.addEventListener('storage', handleStorageChange);

    // カスタムイベントも監視（同じタブ内での変更）
    const handleDebugModeChange = () => {
      loadLogs();
    };
    window.addEventListener('debugModeChanged', handleDebugModeChange);

    // 食品追加を監視（デバウンスで無限ループを防ぐ）
    const handleDailyLogUpdated = () => {
      // 既存のタイムアウトをクリア
      if (loadLogsTimeoutRef.current) {
        clearTimeout(loadLogsTimeoutRef.current);
      }
      // 500ms待ってから読み込み（連続呼び出しを防ぐ）
      loadLogsTimeoutRef.current = setTimeout(() => {
        loadLogs();
        loadLogsTimeoutRef.current = null;
      }, 500);
    };
    window.addEventListener('dailyLogUpdated', handleDailyLogUpdated);

    // foodAddedイベントも監視
    const handleFoodAdded = () => {
      loadLogs();
    };
    window.addEventListener('foodAdded', handleFoodAdded);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('debugModeChanged', handleDebugModeChange);
      window.removeEventListener('dailyLogUpdated', handleDailyLogUpdated);
      window.removeEventListener('foodAdded', handleFoodAdded);
      // タイムアウトをクリア
      if (loadLogsTimeoutRef.current) {
        clearTimeout(loadLogsTimeoutRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // loadLogsはuseCallbackでメモ化されているため、依存配列から除外

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const locale = t('common.locale');
    return date.toLocaleDateString(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const toggleExpand = (date: string) => {
    const newExpanded = new Set(expandedLogs);
    if (newExpanded.has(date)) {
      newExpanded.delete(date);
    } else {
      newExpanded.add(date);
    }
    setExpandedLogs(newExpanded);
  };

  const handleDelete = async (date: string) => {
    if (!window.confirm(t('history.deleteConfirm'))) {
      return;
    }

    try {
      await deleteDailyLog(date);
      await loadLogs();
      // Remove from expanded logs if it was expanded
      const newExpanded = new Set(expandedLogs);
      newExpanded.delete(date);
      setExpandedLogs(newExpanded);
    } catch (error) {
      logError(error, { action: 'deleteDailyLog', date });
      const errorMessage = getUserFriendlyErrorMessage(error);
      alert(`${t('history.deleteFailed')}: ${errorMessage}`);
    }
  };

  const handleNutrientClick = (nutrient: string) => {
    const card = getArgumentCardByNutrient(nutrient);
    if (card) {
      setSelectedArgumentCard(nutrient);
    }
  };

  // 履歴から食品を再追加（量選択モーダルを表示）
  const handleReAddFoodClick = (food: FoodItem) => {
    setSelectedFoodForAdd(food);
    setAmountInput(food.amount.toString());
    setShowAmountModal(true);
  };

  // 履歴から食品を再追加（実際の追加処理）
  const handleReAddFood = async (food: FoodItem, newAmount?: number) => {
    const amountToUse = newAmount !== undefined ? newAmount : food.amount;

    // 既存の栄養素データがある場合は、それを優先使用（カスタム食品や日本語名の食品に対応）
    // 量が変更されている場合は比率で調整
    if (food.nutrients && Object.keys(food.nutrients).length > 0) {
      const ratio = amountToUse / food.amount;
      const updatedFood: FoodItem = {
        ...food,
        amount: amountToUse,
        nutrients: Object.fromEntries(
          Object.entries(food.nutrients || {}).map(([key, value]) => [key, (value || 0) * ratio])
        ) as FoodItem['nutrients'],
      };
      addFood(updatedFood);
      // 履歴を再読み込み
      setTimeout(() => {
        loadLogs();
      }, 100);
      // ホーム画面に遷移
      const event = new CustomEvent('navigateToScreen', { detail: 'home' });
      window.dispatchEvent(event);
      return;
    }

    // 栄養素データがない場合のみ、データベースから検索
    // 食品名を正規化して検索（括弧やスペースを除去、日本語名の部分文字列も検索）
    const normalizedName = food.item
      .replace(/[（(].*?[）)]/g, '') // 括弧とその中身を除去
      .replace(/\s+/g, ' ') // 連続するスペースを1つに
      .trim();

    // 複数の検索パターンを試す
    let foodResults = searchFoods(normalizedName);
    if (foodResults.length === 0) {
      // 括弧前の部分だけでも検索（例：「卵 (全卵)」→「卵」）
      const beforeBracket = food.item.split(/[（(]/)[0].trim();
      if (beforeBracket) {
        foodResults = searchFoods(beforeBracket);
      }
    }
    if (foodResults.length === 0) {
      // 元の食品名で検索
      foodResults = searchFoods(food.item);
    }

    const foodData = foodResults.length > 0 ? foodResults[0] : null;

    if (!foodData) {
      // データベースにも見つからない場合は、空の栄養素データで追加
      const updatedFood: FoodItem = {
        ...food,
        amount: amountToUse,
        nutrients: {},
      };
      addFood(updatedFood);
      // 履歴を再読み込み
      setTimeout(() => {
        loadLogs();
      }, 100);
      // ホーム画面に遷移
      const event = new CustomEvent('navigateToScreen', { detail: 'home' });
      window.dispatchEvent(event);
      return;
    }

    // FoodItemを作成（HomeScreenのロジックを参考）
    // 単位が「個」の場合は、pieceWeightを考慮
    let actualAmount = amountToUse;
    if (food.unit === '個' && foodData.pieceWeight) {
      // 個数で入力されている場合は、グラムに変換してから計算
      actualAmount = amountToUse * foodData.pieceWeight;
    }

    const ratio = actualAmount / 100;
    const foodItem: FoodItem = {
      item: food.item, // 元の食品名を保持
      amount: amountToUse, // ユーザーが指定した量を保持
      unit: food.unit, // 元の単位を保持
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
      loadLogs();
    }, 200);
    // ホーム画面に遷移
    const event = new CustomEvent('navigateToScreen', { detail: 'home' });
    window.dispatchEvent(event);
  };

  // 期間でフィルタリングされたログを計算
  const filteredLogs = useMemo(() => {
    if (logs.length === 0) return [];

    if (selectedPeriod === 'today') {
      const today = new Date().toISOString().split('T')[0];
      return logs.filter((log) => log.date === today);
    }

    if (selectedPeriod === '7days') {
      return logs.filter((log) => {
        const logDate = new Date(log.date);
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        return logDate >= sevenDaysAgo;
      });
    }

    if (selectedPeriod === '30days') {
      return logs.filter((log) => {
        const logDate = new Date(log.date);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return logDate >= thirtyDaysAgo;
      });
    }

    // 'all' の場合
    return logs;
  }, [logs, selectedPeriod]);

  // 目標値を取得
  const targets = useMemo(() => {
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
      userProfile?.daysOnCarnivore,
      userProfile?.carnivoreStartDate,
      userProfile?.forceAdaptationMode,
      userProfile?.bodyComposition,
      userProfile?.weight,
      userProfile?.metabolicStressIndicators,
      userProfile?.customNutrientTargets
        ? Object.fromEntries(
          Object.entries(userProfile.customNutrientTargets).map(([key, value]) => [
            key,
            typeof value === 'number' ? { mode: 'manual' as const, value } : value,
          ])
        )
        : undefined
    );
  }, [userProfile]);

  // 統計情報を計算
  const statistics = useMemo(() => {
    if (filteredLogs.length === 0) return null;

    const totalDays = filteredLogs.length;
    const violationDays = filteredLogs.filter((log) => log.calculatedMetrics?.hasViolation).length;
    const noViolationDays = totalDays - violationDays;

    return {
      totalDays,
      violationDays,
      noViolationDays,
    };
  }, [filteredLogs]);

  return (
    <div className="history-screen-container">
      <div className="history-screen-content">
        <h1 className="history-screen-title">{t('history.title')}</h1>

        {/* 期間選択タブ */}
        <div
          style={{
            display: 'flex',
            gap: '0.5rem',
            marginBottom: '1rem',
          }}
        >
          {(
            [
              { key: 'today', label: t('home.today') },
              { key: '7days', label: t('history.7days') },
              { key: '30days', label: t('history.30days') },
              { key: 'all', label: t('history.all') },
            ] as const
          ).map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setSelectedPeriod(key)}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: selectedPeriod === key ? '#dc2626' : '#f9fafb',
                color: selectedPeriod === key ? 'white' : '#78716c',
                border: '1px solid',
                borderColor: selectedPeriod === key ? '#dc2626' : '#e5e7eb',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '500',
                fontSize: '14px',
                transition: 'all 0.2s',
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* サマリー/履歴切り替えタブ */}
        <div
          style={{
            display: 'flex',
            gap: '0.5rem',
            marginBottom: '1rem',
            borderBottom: '2px solid #e5e7eb',
          }}
        >
          {(
            [
              { key: 'summary', label: t('history.summary') },
              { key: 'logs', label: t('history.title') },
            ] as const
          ).map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: activeTab === key ? '#b91c1c' : 'var(--color-bg-secondary)',
                color: activeTab === key ? 'white' : 'var(--color-text-primary)',
                border: 'none',
                borderBottom: activeTab === key ? '2px solid #b91c1c' : '2px solid transparent',
                cursor: 'pointer',
                fontWeight: activeTab === key ? 'bold' : '600',
                transition: 'all 0.2s',
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* サマリータブ */}
        {activeTab === 'summary' &&
          filteredLogs.length > 0 &&
          statistics &&
          (() => {
            const totalProtein = filteredLogs.reduce(
              (sum, log) =>
                sum +
                (log.calculatedMetrics?.animalEffectiveProtein ??
                  log.calculatedMetrics?.effectiveProtein ??
                  0),
              0
            );
            const totalFat = filteredLogs.reduce(
              (sum, log) => sum + (log.calculatedMetrics?.fatTotal || 0),
              0
            );
            const avgProtein = totalProtein / filteredLogs.length;
            const avgFat = totalFat / filteredLogs.length;
            const violationCount = filteredLogs.filter(
              (log) => log.calculatedMetrics?.hasViolation
            ).length;
            const violationRate = (violationCount / filteredLogs.length) * 100;

            // タンパク質の目標値（最初のログから取得、なければデフォルト）
            const firstLog = filteredLogs[0];
            const proteinTarget =
              firstLog?.calculatedMetrics?.proteinRequirement ?? targets.protein ?? 110;
            const fatTarget = targets.fat ?? 150;

            const periodLabel =
              selectedPeriod === 'today'
                ? t('home.today')
                : selectedPeriod === '7days'
                  ? t('history.past7days')
                  : selectedPeriod === '30days'
                    ? t('history.past30days')
                    : t('history.allPeriod');

            return (
              <div
                style={{
                  backgroundColor: 'white',
                  padding: '1rem',
                  borderRadius: '12px',
                  marginBottom: '1.5rem',
                  border: '1px solid #e5e7eb',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                }}
              >
                <h2
                  style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    marginBottom: '1rem',
                    color: '#1f2937',
                  }}
                >
                  {periodLabel}
                  {t('history.summaryOf')}
                </h2>

                {/* 栄養素ゲージ */}
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem',
                    marginBottom: '1rem',
                  }}
                >
                  <MiniNutrientGauge
                    label={t('history.averageProtein')}
                    currentDailyTotal={avgProtein}
                    target={proteinTarget}
                    color={getNutrientColor('protein')}
                    unit="g"
                  />
                  <MiniNutrientGauge
                    label={t('history.averageFat')}
                    currentDailyTotal={avgFat}
                    target={fatTarget}
                    color={getNutrientColor('fat')}
                    unit="g"
                  />
                </div>

                {/* 統計情報 */}
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '0.75rem',
                      backgroundColor: '#f9fafb',
                      borderRadius: '8px',
                    }}
                  >
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>
                      {t('history.recordedDays')}
                    </div>
                    <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#1f2937' }}>
                      {statistics.totalDays}
                      {t('history.days')}
                    </div>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '0.75rem',
                      backgroundColor: '#f9fafb',
                      borderRadius: '8px',
                    }}
                  >
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>
                      {t('history.violationRate')}
                    </div>
                    <div
                      style={{
                        fontSize: '18px',
                        fontWeight: 'bold',
                        color:
                          violationRate === 0
                            ? '#34C759'
                            : violationRate < 20
                              ? '#f59e0b'
                              : '#dc2626',
                      }}
                    >
                      {violationRate.toFixed(0)}%
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

        {/* 履歴タブ */}
        {activeTab === 'logs' && (
          <>
            {filteredLogs.length === 0 ? (
              <div className="history-screen-empty">
                <div className="history-screen-empty-text">{t('history.noLogs')}</div>
                <div className="history-screen-empty-subtext">{t('history.noDataDescription')}</div>
                <div
                  style={{
                    marginTop: '1rem',
                    fontSize: '14px',
                    color: 'var(--color-text-secondary)',
                  }}
                >
                  💡 Tap "+ Add Food" on the Home screen to start logging.
                </div>
              </div>
            ) : (
              <div className="history-screen-logs">
                {filteredLogs.map((item) => {
                  const isExpanded = expandedLogs.has(item.date);
                  return (
                    <div key={item.date} className="history-screen-log-wrapper">
                      <div
                        className={`history-screen-log-item ${isExpanded ? 'expanded' : ''}`}
                        onClick={() => toggleExpand(item.date)}
                      >
                        <div className="history-screen-log-header">
                          <div className="history-screen-log-date">{formatDate(item.date)}</div>
                          <div className="history-screen-log-actions">
                            <button
                              className="history-screen-delete-button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(item.date);
                              }}
                              title={t('common.delete')}
                            >
                              🗑️
                            </button>
                            <span className="history-screen-expand-icon">
                              {isExpanded ? '▼' : '▶'}
                            </span>
                          </div>
                        </div>
                        <div className="history-screen-log-summary">
                          <span className="history-screen-log-summary-text">
                            {item.fuel.length}
                            {t('history.items')}: {item.fuel.map((f) => f.item).join(', ')}
                          </span>
                          {/* タンパク質・脂質の達成状況 */}
                          {(() => {
                            const protein =
                              item.calculatedMetrics?.animalEffectiveProtein ??
                              item.calculatedMetrics?.effectiveProtein ??
                              0;
                            const fat = item.calculatedMetrics?.fatTotal || 0;
                            const proteinTarget = item.calculatedMetrics?.proteinRequirement || 110;
                            const fatTarget = 150;
                            const proteinOk = protein >= proteinTarget;
                            const fatOk = fat >= fatTarget;
                            return (
                              <span
                                style={{
                                  fontSize: '14px',
                                  marginLeft: '0.5rem',
                                }}
                              >
                                {proteinOk ? '✅' : '⚠️'}P:{protein.toFixed(0)}g{' '}
                                {fatOk ? '✅' : '⚠️'}F:{fat.toFixed(0)}g
                              </span>
                            );
                          })()}
                          {/* 違反表示 */}
                          {item.calculatedMetrics?.hasViolation && (
                            <span
                              style={{
                                fontSize: '12px',
                                fontWeight: 'bold',
                                color: '#dc2626',
                                marginLeft: '0.5rem',
                                padding: '0.25rem 0.5rem',
                                backgroundColor: '#fef2f2',
                                borderRadius: '4px',
                              }}
                            >
                              ⚠️ {t('history.violation')}
                            </span>
                          )}
                          {item.recoveryProtocol && (
                            <span className="history-screen-recovery-badge">
                              ⚠️ {t('history.recovery')}
                            </span>
                          )}
                        </div>
                        {/* 詳細を見るボタン */}
                        {!isExpanded && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleExpand(item.date);
                            }}
                            style={{
                              marginTop: '0.5rem',
                              padding: '0.5rem 1rem',
                              fontSize: '14px',
                              backgroundColor: '#f3f4f6',
                              color: '#374151',
                              border: '1px solid #e5e7eb',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              width: '100%',
                              textAlign: 'center',
                            }}
                          >
                            {t('history.viewDetails')}
                          </button>
                        )}
                      </div>

                      {isExpanded && (
                        <>
                          {/* 履歴タブで展開時は食品リストを表示 */}
                          {activeTab === 'logs' && (
                            <div className="history-screen-detail">
                              <div className="history-screen-detail-section">
                                <div className="history-screen-detail-label">
                                  {t('history.foodsEaten')}:
                                </div>
                                {item.fuel.map((food, index) => (
                                  <div
                                    key={index}
                                    className="history-screen-food-item"
                                    style={{
                                      marginTop: '0.25rem',
                                      display: 'flex',
                                      justifyContent: 'space-between',
                                      alignItems: 'center',
                                      padding: '0.375rem',
                                      backgroundColor: 'var(--color-bg-secondary)',
                                      borderRadius: '4px',
                                      border: '1px solid var(--color-border)',
                                    }}
                                  >
                                    <span>
                                      • {food.item} ({food.amount}
                                      {food.unit})
                                    </span>
                                    <div
                                      style={{
                                        display: 'flex',
                                        gap: '0.5rem',
                                        alignItems: 'center',
                                      }}
                                    >
                                      <button
                                        onClick={async (e) => {
                                          e.stopPropagation();
                                          // 個別の食品を削除
                                          if (
                                            window.confirm(
                                              `Delete ${food.item} (${food.amount}${food.unit})?`
                                            )
                                          ) {
                                            try {
                                              const updatedFuel = item.fuel.filter(
                                                (_, i) => i !== index
                                              );
                                              const updatedLog: DailyLog = {
                                                ...item,
                                                fuel: updatedFuel,
                                                calculatedMetrics: calculateAllMetrics(
                                                  updatedFuel,
                                                  userProfile
                                                ),
                                              };
                                              await saveDailyLog(updatedLog);
                                              await loadLogs();
                                            } catch (error) {
                                              logError(error, {
                                                action: 'deleteFoodFromLog',
                                                date: item.date,
                                                index,
                                              });
                                              alert(t('history.deleteFailed'));
                                            }
                                          }
                                        }}
                                        style={{
                                          padding: '0.25rem 0.5rem',
                                          fontSize: '12px',
                                          backgroundColor: '#6b7280',
                                          color: 'white',
                                          border: 'none',
                                          borderRadius: '4px',
                                          cursor: 'pointer',
                                        }}
                                        title={t('common.delete')}
                                      >
                                        🗑️
                                      </button>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleReAddFoodClick(food);
                                        }}
                                        style={{
                                          padding: '0.25rem 0.5rem',
                                          fontSize: '12px',
                                          backgroundColor: '#3b82f6',
                                          color: 'white',
                                          border: 'none',
                                          borderRadius: '4px',
                                          cursor: 'pointer',
                                        }}
                                        title="Edit amount"
                                      >
                                        ✏️
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* 展開時は栄養素ゲージを表示（全タブ共通） */}
                          {isExpanded && (
                            <div className="history-screen-detail">
                              <div
                                className="history-screen-detail-section"
                                style={{
                                  marginBottom: '0.5rem',
                                }}
                              >
                                <div
                                  className="history-screen-detail-label"
                                  style={{
                                    fontSize: '13px',
                                    fontWeight: 'bold',
                                    marginBottom: '0.25rem',
                                    color: '#1f2937',
                                  }}
                                >
                                  Nutrient Gauges
                                </div>
                                {(() => {
                                  const metrics = item.calculatedMetrics;
                                  if (!metrics) return null;
                                  const protein = metrics.animalEffectiveProtein ?? metrics.effectiveProtein ?? 0;
                                  const fat = metrics.fatTotal || 0;
                                  const proteinTarget = metrics.proteinRequirement ?? targets.protein ?? 110;
                                  const fatTarget = targets.fat ?? 150;
                                  const displayMode = getNutrientDisplayMode();

                                  type NutrientConfig = { key: string; label: string; current: number; target: number; unit: string };

                                  // 全ての栄養素データを定義
                                  const nutrientConfigs: Record<string, NutrientConfig> = {
                                    // Electrolytes
                                    sodium: { key: 'sodium', label: 'Sodium', current: metrics.sodiumTotal || 0, target: targets.sodium || 5000, unit: 'mg' },
                                    potassium: { key: 'potassium', label: 'Potassium', current: metrics.potassiumTotal || 0, target: targets.potassium || 4500, unit: 'mg' },
                                    magnesium: { key: 'magnesium', label: 'Magnesium', current: metrics.magnesiumTotal || 0, target: targets.magnesium || 400, unit: 'mg' },
                                    // Macros
                                    protein: { key: 'protein', label: 'Protein (Effective)', current: protein, target: proteinTarget, unit: 'g' },
                                    fat: { key: 'fat', label: 'Fat', current: fat, target: fatTarget, unit: 'g' },
                                    // Others
                                    zinc: { key: 'zinc', label: 'Zinc (Effective)', current: metrics.effectiveZinc || 0, target: targets.zinc || 11, unit: 'mg' },
                                    iron: { key: 'iron', label: 'Iron (Effective)', current: metrics.effectiveIron || 0, target: targets.iron || 8, unit: 'mg' },
                                    vitamin_a: { key: 'vitamin_a', label: 'Vitamin A', current: metrics.effectiveVitaminA || 0, target: targets.vitamin_a || 5000, unit: 'IU' },
                                    vitamin_d: { key: 'vitamin_d', label: 'Vitamin D', current: metrics.vitaminDTotal || 0, target: targets.vitamin_d || 2000, unit: 'IU' },
                                    vitamin_b12: { key: 'vitamin_b12', label: 'Vitamin B12', current: metrics.vitaminB12Total || 0, target: targets.vitamin_b12 || 2.4, unit: 'μg' },
                                    choline: { key: 'choline', label: 'Choline', current: metrics.cholineTotal || 0, target: targets.choline || 550, unit: 'mg' },
                                    omega3: { key: 'omega3', label: 'Omega-3', current: metrics.omega3Total || 0, target: 2, unit: 'g' },
                                  };

                                  const renderGauge = (n: NutrientConfig) => (
                                    <MiniNutrientGauge
                                      key={n.key}
                                      label={n.label}
                                      currentDailyTotal={n.current}
                                      target={n.target}
                                      color={getNutrientColor(n.key)}
                                      unit={n.unit}
                                      nutrientKey={n.key}
                                    />
                                  );

                                  const renderGroup = (label: string, keys: readonly string[]) => {
                                    const visibleConfigs = keys
                                      .map(k => nutrientConfigs[k])
                                      .filter(c => c && isNutrientVisibleInMode(c.key, displayMode));

                                    if (visibleConfigs.length === 0) return null;

                                    return (
                                      <div>
                                        <h4 style={{ fontSize: '13px', fontWeight: 'bold', color: '#6b7280', marginBottom: '0.25rem' }}>
                                          {label}
                                        </h4>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                          {visibleConfigs.map(renderGauge)}
                                        </div>
                                      </div>
                                    );
                                  };

                                  // Otherグループのキーを動的に算出
                                  const tier1Keys = NUTRIENT_GROUPS.electrolytes.nutrients;
                                  const tier2Keys = NUTRIENT_GROUPS.macros.nutrients;
                                  const otherKeys = Object.keys(nutrientConfigs).filter(k =>
                                    !tier1Keys.includes(k as any) &&
                                    !tier2Keys.includes(k as any)
                                  );

                                  return (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                      {renderGroup(NUTRIENT_GROUPS.electrolytes.label, NUTRIENT_GROUPS.electrolytes.nutrients)}
                                      {renderGroup(NUTRIENT_GROUPS.macros.label, NUTRIENT_GROUPS.macros.nutrients)}
                                      {renderGroup(NUTRIENT_GROUPS.other.label, otherKeys)}
                                    </div>
                                  );
                                })()}
                              </div>
                            </div>
                          )}

                          {/* その他タブで展開時はステータス・日記を表示 */}
                          {false && (
                            <div className="history-screen-detail">
                              <div className="history-screen-detail-section">
                                <div className="history-screen-detail-label">
                                  {t('history.date')}:
                                </div>
                                <div className="history-screen-detail-value">
                                  {formatDate(item.date)}
                                </div>
                              </div>

                              <div className="history-screen-detail-section">
                                <div className="history-screen-detail-label">睡眠スコア:</div>
                                <div className="history-screen-detail-value">
                                  {item.status.sleepScore}
                                </div>
                              </div>

                              <div className="history-screen-detail-section">
                                <div className="history-screen-detail-label">太陽光暴露:</div>
                                <div className="history-screen-detail-value">
                                  {item.status.sunMinutes} min
                                </div>
                              </div>

                              <div className="history-screen-detail-section">
                                <div className="history-screen-detail-label">活動レベル:</div>
                                <div className="history-screen-detail-value">
                                  {item.status.activityLevel}
                                </div>
                              </div>

                              {item.status.stressLevel && (
                                <div className="history-screen-detail-section">
                                  <div className="history-screen-detail-label">ストレスレベル:</div>
                                  <div className="history-screen-detail-value">
                                    {item.status.stressLevel}
                                  </div>
                                </div>
                              )}

                              {item.diary && (
                                <div className="history-screen-detail-section">
                                  <div className="history-screen-detail-label">日記:</div>
                                  <div
                                    className="history-screen-detail-value"
                                    style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}
                                  >
                                    {item.diary}
                                  </div>
                                </div>
                              )}

                              {item.recoveryProtocol && (
                                <div
                                  className="history-screen-recovery-section clickable"
                                  onClick={() => {
                                    // Recovery Protocolに関するArgument Cardを表示（将来の拡張）
                                    // 現時点では、違反タイプに応じたArgument Cardを表示する
                                  }}
                                >
                                  <div className="history-screen-recovery-title">
                                    リカバリープロトコル
                                  </div>
                                  <div className="history-screen-recovery-text">
                                    Fasting: {item.recoveryProtocol?.fastingTargetHours || 0}h
                                  </div>
                                  {item.recoveryProtocol?.dietRecommendations?.map((rec, idx) => (
                                    <div key={idx} className="history-screen-recovery-text">
                                      • {rec}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* Argument Card Modal */}
        {featureDisplaySettings.argumentCard && selectedArgumentCard && (
          <ArgumentCard
            card={getArgumentCardByNutrient(selectedArgumentCard)!}
            onClose={() => setSelectedArgumentCard(null)}
          />
        )}

        {/* 量選択モーダル */}
        {showAmountModal && selectedFoodForAdd && (
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
                  {selectedFoodForAdd.item}
                </label>
                <div style={{ marginBottom: '1rem', fontSize: '14px', color: '#6b7280' }}>
                  {t('home.originalAmount')}: {selectedFoodForAdd.amount}
                  {selectedFoodForAdd.unit}
                </div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                  {t('home.changeAmount')}
                </label>
                <input
                  type="number"
                  value={amountInput}
                  onChange={(e) => setAmountInput(e.target.value)}
                  placeholder={selectedFoodForAdd.amount.toString()}
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
                  Unit: {selectedFoodForAdd.unit}
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
                      handleReAddFood(selectedFoodForAdd, amount);
                      setShowAmountModal(false);
                      setSelectedFoodForAdd(null);
                    }
                  }}
                  disabled={!amountInput || isNaN(Number(amountInput)) || Number(amountInput) <= 0}
                  style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor:
                      !amountInput || isNaN(Number(amountInput)) || Number(amountInput) <= 0
                        ? '#d1d5db'
                        : '#dc2626',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor:
                      !amountInput || isNaN(Number(amountInput)) || Number(amountInput) <= 0
                        ? 'not-allowed'
                        : 'pointer',
                    fontSize: '16px',
                    fontWeight: '600',
                    transition: 'background-color 0.2s',
                  }}
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
