/**
 * Interactive Butcher - 動物と部位の選択UI
 *
 * タブ切り替えで動物（牛・豚・鶏）を選び、部位をタップするUI
 * リアルタイムで栄養素を計算・プレビュー表示
 * スクロール式のステータスウィンドウ付き
 */

import { useState, useEffect, useMemo, useRef } from 'react';
import { getFoodMasterItem, type FoodMasterItem } from '../../data/foodMaster';
import { useUserConfig } from '../../hooks/useUserConfig';
import { DEFAULT_CARNIVORE_TARGETS, CARNIVORE_NUTRIENT_TARGETS, type CarnivoreTarget } from '../../data/carnivoreTargets';
import type { PreviewData } from '../../hooks/useNutrition';
import {
  getButcherNutrientOrder,
  sortNutrientsByMode,
  type ButcherNutrientKey,
  type SortMode,
} from '../../utils/butcherNutrientOrder';
import { getNutrientDisplaySettings, type NutrientKey } from '../../utils/nutrientDisplaySettings';
import { getFeatureDisplaySettings } from '../../utils/featureDisplaySettings';

import { useTranslation, getLanguage } from '../../utils/i18n';
import MiniNutrientGauge from '../MiniNutrientGauge';
import StorageNutrientGauge from '../StorageNutrientGauge';
import type { FoodItem } from '../../types';
import FoodSearchModal from './FoodSearchModal';


// masterRef: maps each part to its FOOD_MASTER category and key
type PartDef = { id: string; label: string; masterRef: { category: string; key: string } };
type AnimalDef = {
  type: string;
  label: string;
  icon: string;
  omega6Warning?: boolean;
  parts: PartDef[];
};

// 内部データ定義 - 5大カテゴリー（FOOD_SELECTION_UI_REQUIREMENTS.md準拠）
const INTERNAL_ANIMALS: AnimalDef[] = [
  {
    type: 'ruminant',
    label: 'Ruminant',
    icon: '🥩',
    parts: [
      { id: 'ribeye', label: 'Ribeye Steak', masterRef: { category: 'beef', key: 'ribeye' } },
      { id: 'ground', label: 'Ground Beef', masterRef: { category: 'beef', key: 'ground' } },
      { id: 'sirloin', label: 'NY Strip / Sirloin', masterRef: { category: 'beef', key: 'sirloin' } },
      { id: 'chuck', label: 'Beef Roast / Chuck', masterRef: { category: 'beef', key: 'chuck' } },
      { id: 'lamb_chops', label: 'Lamb Chops', masterRef: { category: 'beef', key: 'lamb_chops' } },
      { id: 'short_ribs', label: 'Short Ribs', masterRef: { category: 'beef', key: 'short_ribs' } },
      { id: 'bison', label: 'Bison / Venison', masterRef: { category: 'beef', key: 'bison' } },
      { id: 'beef_jerky', label: 'Beef Jerky / Biltong', masterRef: { category: 'beef', key: 'beef_jerky' } },
      { id: 'pemmican', label: 'Pemmican', masterRef: { category: 'beef', key: 'pemmican' } },
      { id: 'bone_broth', label: 'Bone Broth', masterRef: { category: 'beef', key: 'bone_broth' } },
    ],
  },
  {
    type: 'pork_poultry',
    label: 'Pork & Poultry',
    icon: '🥓',
    omega6Warning: true,
    parts: [
      { id: 'bacon', label: 'Bacon (Sugar-Free)', masterRef: { category: 'pork', key: 'bacon' } },
      { id: 'chicken_thigh', label: 'Chicken Thighs', masterRef: { category: 'chicken', key: 'thigh' } },
      { id: 'chicken_wing', label: 'Chicken Wings', masterRef: { category: 'chicken', key: 'wing' } },
      { id: 'pork_belly', label: 'Pork Belly', masterRef: { category: 'pork', key: 'belly' } },
      { id: 'pork_chops', label: 'Pork Chops', masterRef: { category: 'pork', key: 'chops' } },
      { id: 'sausage', label: 'Sausage (Clean)', masterRef: { category: 'pork', key: 'sausage' } },
      { id: 'pork_rinds', label: 'Pork Rinds', masterRef: { category: 'pork', key: 'pork_rinds' } },
    ],
  },
  {
    type: 'seafood',
    label: 'Seafood',
    icon: '🐟',
    parts: [
      { id: 'salmon', label: 'Salmon', masterRef: { category: 'fish', key: 'salmon' } },
      { id: 'sardines', label: 'Sardines (Canned)', masterRef: { category: 'fish', key: 'sardines' } },
      { id: 'shrimp', label: 'Shrimp', masterRef: { category: 'fish', key: 'shrimp' } },
      { id: 'oysters', label: 'Oysters', masterRef: { category: 'fish', key: 'oysters' } },
      { id: 'scallops', label: 'Scallops', masterRef: { category: 'fish', key: 'scallops' } },
      { id: 'tuna', label: 'Canned Tuna', masterRef: { category: 'fish', key: 'tuna' } },
      { id: 'cod', label: 'Cod / White Fish', masterRef: { category: 'fish', key: 'cod' } },
      { id: 'salmon_roe', label: 'Salmon Roe', masterRef: { category: 'fish', key: 'salmon_roe' } },
    ],
  },
  {
    type: 'eggs_fats',
    label: 'Eggs & Fats',
    icon: '🥚',
    parts: [
      { id: 'egg', label: 'Whole Eggs', masterRef: { category: 'dairy', key: 'egg' } },
      { id: 'butter', label: 'Butter (Salted)', masterRef: { category: 'dairy', key: 'butter' } },
      { id: 'ghee', label: 'Ghee', masterRef: { category: 'fat', key: 'ghee' } },
      { id: 'tallow', label: 'Beef Tallow', masterRef: { category: 'fat', key: 'tallow' } },
      { id: 'heavy_cream', label: 'Heavy Cream', masterRef: { category: 'dairy', key: 'heavy_cream' } },
      { id: 'cheese', label: 'Hard Cheese', masterRef: { category: 'dairy', key: 'cheese' } },
      { id: 'bacon_grease', label: 'Bacon Grease', masterRef: { category: 'fat', key: 'bacon_grease' } },
      { id: 'cream_cheese', label: 'Cream Cheese', masterRef: { category: 'dairy', key: 'cream_cheese' } },
      { id: 'duck_eggs', label: 'Duck Eggs', masterRef: { category: 'egg', key: 'duck' } },
    ],
  },
  {
    type: 'organs',
    label: 'Organs',
    icon: '🫀',
    parts: [
      { id: 'beef_liver', label: 'Beef Liver', masterRef: { category: 'beef', key: 'liver' } },
      { id: 'chicken_liver', label: 'Chicken Liver', masterRef: { category: 'chicken', key: 'liver' } },
      { id: 'beef_heart', label: 'Beef Heart', masterRef: { category: 'beef', key: 'heart' } },
      { id: 'cod_liver', label: 'Cod Liver (Canned)', masterRef: { category: 'fish', key: 'cod_liver' } },
      { id: 'bone_marrow', label: 'Bone Marrow', masterRef: { category: 'beef', key: 'bone_marrow' } },
      { id: 'chicken_hearts', label: 'Chicken Hearts', masterRef: { category: 'chicken', key: 'hearts' } },
      { id: 'tongue', label: 'Tongue', masterRef: { category: 'beef', key: 'tongue' } },
      { id: 'suet', label: 'Suet / Tallow', masterRef: { category: 'fat', key: 'suet' } },
    ],
  },
];

type AnimalType = AnimalDef['type'];

/**
 * Lookup food master data using the masterRef mapping.
 * Maps new 5-category system to existing FOOD_MASTER keys.
 */
function lookupFoodMaster(animalType: string, partId: string): FoodMasterItem | undefined {
  const animal = INTERNAL_ANIMALS.find(a => a.type === animalType);
  const part = animal?.parts.find(p => p.id === partId);
  if (!part?.masterRef) return undefined;
  return getFoodMasterItem(
    part.masterRef.category as 'beef' | 'pork' | 'chicken' | 'egg' | 'fish' | 'dairy' | 'fat' | 'plant',
    part.masterRef.key
  );
}

interface ButcherSelectProps {
  initialAnimal?: AnimalType;
  onSelect?: (animal: string, part: string) => void;
  onPreviewChange?: (preview: PreviewData | null) => void;
  onFoodAdd?: (foodItem: FoodItem) => void;
  previewGauges?: React.ReactNode[]; // プレビューゲージをpropsとして受け取る
  currentDailyTotal?: {
    protein?: number;
    fat?: number;
    zinc?: number;
    magnesium?: number;
    iron?: number;
    vitamin_b12?: number;
    sodium?: number;
    potassium?: number;
    vitamin_a?: number;
    vitamin_d?: number;
    vitamin_k2?: number;
    choline?: number;
    vitamin_b7?: number;
    [key: string]: number | undefined;
  }; // 今日すでに確定した摂取量
  dynamicTargets?: CarnivoreTarget; // 動的栄養素目標値（ユーザープロファイルから計算）
}

// Avoid Zoneゲージ用コンポーネント（上限違反でOUT表示、4ゾーングラデーション統一）
const AvoidGauge = ({
  label,
  currentDailyTotal = 0,
  previewAmount = 0,
  max,
  unit = '',
}: {
  label: string;
  currentDailyTotal?: number;
  previewAmount?: number;
  max: number; // 上限値
  unit?: string;
}) => {
  const totalValue = currentDailyTotal + previewAmount;
  const isViolation = totalValue > max;
  const percent = max > 0 ? (totalValue / max) * 100 : 0;

  // 単色を生成する関数（グラデーションなし）
  const getSingleColor = (percentValue: number): string => {
    // 単色（閾値に応じて色が変わる）
    if (percentValue < 50) {
      return '#ef4444'; // 赤（不足）
    } else if (percentValue < 100) {
      return '#f97316'; // オレンジ（やや不足）
    } else if (percentValue < 120) {
      return '#f43f5e'; // 緑（適切）
    } else {
      return '#f43f5e'; // 紫（過剰）
    }
  };

  const currentPercent = max > 0 ? (currentDailyTotal / max) * 100 : 0;
  const previewPercent = max > 0 ? (previewAmount / max) * 100 : 0;

  return (
    <div style={{ marginBottom: 0 }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 0,
        }}
      >
        <span
          style={{
            fontSize: '12px',
            color: '#78716c',
            fontWeight: isViolation ? 'bold' : 'normal',
          }}
        >
          {label}
        </span>
        <span
          style={{
            fontSize: '12px',
            color: isViolation ? '#dc2626' : '#78716c',
            fontWeight: isViolation ? 'bold' : 'normal',
          }}
        >
          {totalValue.toFixed(1)} / {max.toFixed(1)} {unit}
        </span>
      </div>
      <div
        style={{
          width: '100%',
          height: '10px',
          backgroundColor: '#e5e7eb',
          borderRadius: '9999px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* 現在値のバー（既に食べたもの、4ゾーングラデーション） */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            width: `${Math.min(currentPercent, 200)}%`,
            height: '100%',
            backgroundColor: getSingleColor(currentPercent),
            borderRadius: '9999px',
            zIndex: 2,
          }}
        />
        {/* プレビュー値のバー（まだ食べてないもの、4ゾーングラデーション） */}
        {previewAmount > 0 && (
          <div
            style={{
              position: 'absolute',
              left: `${Math.min(currentPercent, 200)}%`,
              width: `${Math.min(previewPercent, Math.max(0, 200 - Math.min(currentPercent, 200)))}%`,
              height: '100%',
              backgroundColor: getSingleColor(percent),
              borderRadius: '9999px',
              zIndex: 3,
              border: '1px solid rgba(0, 0, 0, 0.1)',
            }}
          />
        )}
      </div>
    </div>
  );
};

// Omega-6:3 Ratio表示コンポーネント（ゲージスタイル）
const OmegaRatioDisplay = ({ omega3, omega6 }: { omega3: number; omega6: number }) => {
  const { t } = useTranslation();
  // 比率計算（6:3 = ?:1）
  const ratio = omega3 > 0 ? omega6 / omega3 : omega6 > 0 ? Infinity : 0;

  // 推奨比率: 1:1 〜 1:4（カーニボア推奨）
  const optimalRatioMin = 1;
  const optimalRatioMax = 4;

  // ステータス判定
  const getStatus = (): 'optimal' | 'warning' | 'low' => {
    if (omega3 === 0 && omega6 === 0) return 'low';
    if (ratio === 0) return 'optimal'; // オメガ3のみ（理想的）
    if (ratio >= optimalRatioMin && ratio <= optimalRatioMax) return 'optimal';
    if (ratio > optimalRatioMax) return 'warning'; // オメガ6過多（炎症リスク）
    return 'low'; // オメガ3過多（問題なしだが表示用）
  };

  const status = getStatus();

  // シーソー表示用のパーセンテージ
  const total = omega3 + omega6;
  const omega3Percent = total > 0 ? (omega3 / total) * 100 : 0;
  const omega6Percent = total > 0 ? (omega6 / total) * 100 : 0;

  const displayRatio =
    omega3 > 0 && omega6 > 0
      ? `${ratio.toFixed(2)}:1 (Ω6:Ω3)`
      : omega3 > 0 && omega6 === 0
        ? `0:1 (Ω6:Ω3)`
        : omega6 > 0 && omega3 === 0
          ? `∞:1 (Ω6:Ω3)`
          : `${omega3.toFixed(2)}g / ${omega6.toFixed(2)}g`;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 0,
        padding: '0.5rem',
        backgroundColor: 'transparent',
        borderRadius: '8px',
        border: '1px solid #e5e7eb',
        marginBottom: 0,
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '0.25rem',
        }}
      >
        <span style={{ fontSize: '12px', color: '#78716c' }}>{t('butcher.omega36Ratio')}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ fontSize: '12px', fontWeight: '600', color: '#44403c' }}>
            {displayRatio}
          </span>
          {status === 'warning' && (
            <span
              style={{
                fontSize: '12px',
                cursor: 'pointer',
                color: '#FF3B30',
              }}
              title={t('butcher.omega6ExcessWarning')}
            >
              ⚠️
            </span>
          )}
        </div>
      </div>
      {/* シーソー表示 */}
      <div
        style={{
          display: 'flex',
          width: '100%',
          height: '10px',
          borderRadius: '9999px',
          overflow: 'hidden',
          marginTop: '0.25rem',
          backgroundColor: '#e5e7eb',
        }}
      >
        {/* オメガ3（左側、緑） */}
        <div
          style={{
            width: `${omega3Percent}%`,
            backgroundColor: '#34C759',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '10px',
            fontWeight: 'bold',
          }}
        >
          {omega3Percent > 10 && 'Ω3'}
        </div>
        {/* オメガ6（右側、赤） */}
        <div
          style={{
            width: `${omega6Percent}%`,
            backgroundColor: status === 'warning' ? '#FF3B30' : '#FF9500',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '10px',
            fontWeight: 'bold',
          }}
        >
          {omega6Percent > 10 && 'Ω6'}
        </div>
      </div>
      {status === 'optimal' && ratio > 0 && (
        <div style={{ fontSize: '10px', color: '#34C759', marginTop: '0.25rem' }}>
          ✅ {t('butcher.optimalRatioRange')}
        </div>
      )}
      {status === 'warning' && (
        <div style={{ fontSize: '10px', color: '#FF3B30', marginTop: '0.25rem' }}>
          ⚠️ {t('butcher.omega6ExcessRisk')}
        </div>
      )}
    </div>
  );
};

export default function ButcherSelect({
  initialAnimal,
  onSelect,
  onPreviewChange,
  onFoodAdd,
  previewGauges: _previewGauges = [],
  currentDailyTotal = {},
  dynamicTargets = DEFAULT_CARNIVORE_TARGETS,
}: ButcherSelectProps) {
  const { t } = useTranslation();
  const currentLang = getLanguage() || 'ja'; // フォールバックを追加
  const [selectedAnimal, setSelectedAnimal] = useState<string>(initialAnimal || 'ruminant');
  const [selectedPart, setSelectedPart] = useState<string | null>(null);
  const [amount, setAmount] = useState<number>(300);
  const [unit, setUnit] = useState<'g' | '個' | '削り'>('g'); // 単位管理
  const [saltGrinds, setSaltGrinds] = useState<number>(1); // 塩の削り回数
  const { config, updateConfig } = useUserConfig();
  const [selectedSaltType, setSelectedSaltType] = useState<
    'table_salt' | 'sea_salt' | 'himalayan_salt' | 'celtic_salt'
  >(config.saltType || 'table_salt');
  const [eggCookingMethod, _setEggCookingMethod] = useState<'raw' | 'cooked'>('cooked'); // 卵の調理法（デフォルト: 加熱）
  // 各動物タイプごとの調理法を保持（タブ切り替え時も状態を維持）
  const [cookingMethodByAnimal, setCookingMethodByAnimal] = useState<Record<string, 'raw' | 'cooked'>>({
    ruminant: 'raw',
    pork_poultry: 'raw',
    seafood: 'raw',
  });
  // const [eggCookingMethod, setEggCookingMethod] = useState<'raw' | 'cooked'>('cooked'); // Unused separate state? Using cookingMethodByAnimal logic instead?
  // Actually line 428 defined eggCookingMethod. Let's keep it but prefix setter if unused


  // 現在の動物の調理法を取得
  const meatCookingMethod = cookingMethodByAnimal[selectedAnimal] || 'raw';

  // 現在の動物の調理法を設定
  const setMeatCookingMethod = (method: 'raw' | 'cooked') => {
    setCookingMethodByAnimal(prev => ({
      ...prev,
      [selectedAnimal]: method,
    }));
  };

  // Nutrients Breakdownの並び順管理
  const [nutrientOrder, _setNutrientOrder] = useState(getButcherNutrientOrder);
  const [sortMode, setSortMode] = useState<SortMode>('default'); // 並び替えモード
  // 写真アップロード関連

  // 「避けるべきもの」セクションの「もっと見る」ボタン状態
  const [showAllAntinutrients, setShowAllAntinutrients] = useState(false);
  // AI自信度検証用ステート
  const [pendingVerification, setPendingVerification] = useState<{
    foodItem: FoodItem;
    confidence: number;
  } | null>(null);

  // Manual Search Modal State
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [searchModalQuery, setSearchModalQuery] = useState('');


  // 機能表示設定を取得
  const featureDisplaySettings = getFeatureDisplaySettings();

  // config.saltTypeが変更されたらselectedSaltTypeも更新
  useEffect(() => {
    if (config.saltType) {
      setSelectedSaltType(config.saltType);
    }
  }, [config.saltType]);

  // 並び順を変更する関数（手動並び替え機能は削除、並び替えモード選択のみ使用）
  const currentAnimal =
    INTERNAL_ANIMALS.find((a) => a.type === selectedAnimal) || INTERNAL_ANIMALS[0];

  // 部位選択時にのみデフォルト量を設定（スライダー操作中は干渉しないようにする）
  // このuseEffectは部位が変更された時のみ実行されるべきなので、selectedPartがnullでない時のみ実行
  useEffect(() => {
    if (!selectedPart) return; // 部位が選択されていない場合は何もしない

    if (selectedAnimal === 'eggs_fats' && selectedPart === 'egg') {
      setUnit('個');
      setAmount(1); // デフォルト1個
      setSaltGrinds(1);
    } else if (selectedAnimal === 'eggs_fats' && selectedPart === 'salt') {
      setUnit('削り');
      setSaltGrinds(1); // 塩はデフォルト1削り
      setAmount(config.saltUnitWeight); // 1削りあたりのg数を設定
    } else {
      setUnit('g');
      setSaltGrinds(1);
      const foodItem = lookupFoodMaster(selectedAnimal, selectedPart);
      setAmount(foodItem?.default_unit || 300); // デフォルト300g（または食品のデフォルト値）
    }
  }, [selectedAnimal, selectedPart, config.saltUnitWeight]); // selectedPartが変更された時のみ実行

  // initialAnimalが変更されたら更新（ただし、ユーザーが手動で選択した場合は無視）
  useEffect(() => {
    if (initialAnimal && initialAnimal !== selectedAnimal) {
      // 次のレンダリングサイクルで更新
      const timer = setTimeout(() => {
        setSelectedAnimal(initialAnimal);
        setSelectedPart(null);
        // eggs_fats（卵・脂質）の場合は1個、それ以外は300g
        if (initialAnimal === 'eggs_fats') {
          setAmount(1);
        } else {
          setAmount(300);
        }
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [initialAnimal]);

  // 選択された食品マスターデータを取得
  const selectedFoodItem: FoodMasterItem | undefined = useMemo(() => {
    if (!selectedPart) return undefined;
    return lookupFoodMaster(selectedAnimal, selectedPart);
  }, [selectedAnimal, selectedPart]);

  // 食品おすすめ（不足栄養素を補える上位3食品に色付け）
  // リカバリー「電解質の多い食品を表示」時は電解質のみを優先
  const recommendedPartIds = useMemo(() => {
    const highlightElectrolytes = typeof window !== 'undefined' && localStorage.getItem('primal_logic_highlight_electrolytes') === '1';
    if (highlightElectrolytes) {
      try {
        localStorage.removeItem('primal_logic_highlight_electrolytes');
      } catch {
        void 0;
      }
    }
    const nutrientsToCheck: Array<{ targetKey: keyof CarnivoreTarget; foodKey: keyof FoodMasterItem }> = highlightElectrolytes
      ? [
          { targetKey: 'sodium', foodKey: 'sodium' },
          { targetKey: 'magnesium', foodKey: 'magnesium' },
          { targetKey: 'potassium', foodKey: 'potassium' },
        ]
      : [
      { targetKey: 'protein', foodKey: 'protein' },
      { targetKey: 'fat', foodKey: 'fat' },
      { targetKey: 'zinc', foodKey: 'zinc' },
      { targetKey: 'magnesium', foodKey: 'magnesium' },
      { targetKey: 'iron', foodKey: 'iron' },
      { targetKey: 'sodium', foodKey: 'sodium' },
      { targetKey: 'potassium', foodKey: 'potassium' },
      { targetKey: 'vitamin_a', foodKey: 'vitamin_a' },
      { targetKey: 'vitamin_d', foodKey: 'vitamin_d' },
      { targetKey: 'vitamin_k2', foodKey: 'vitamin_k2' },
      { targetKey: 'vitamin_b12', foodKey: 'vitamin_b12' },
      { targetKey: 'choline', foodKey: 'choline' },
    ];
    const deficits: Record<string, number> = {};
    if (highlightElectrolytes) {
      deficits.sodium = 5000;
      deficits.magnesium = 400;
      deficits.potassium = 3000;
    } else {
    for (const { targetKey } of nutrientsToCheck) {
      const target = (dynamicTargets as Record<string, number>)[targetKey];
      const current = (currentDailyTotal as Record<string, number>)[targetKey] ?? 0;
      if (typeof target === 'number' && target > 0) {
        const d = Math.max(0, target - current);
        if (d > 0) deficits[targetKey] = d;
      }
    }
    }
    if (Object.keys(deficits).length === 0) return [];
    const scores: Array<{ partId: string; score: number }> = [];
    for (const part of currentAnimal.parts) {
      const foodItem = lookupFoodMaster(selectedAnimal, part.id);
      if (!foodItem) continue;
      let score = 0;
      for (const { targetKey, foodKey } of nutrientsToCheck) {
        const deficit = deficits[targetKey];
        if (!deficit) continue;
        const foodVal = (foodItem as Record<string, { value?: number } | undefined>)[foodKey]?.value ?? 0;
        if (foodVal > 0) score += Math.min(100, (foodVal / deficit) * 100);
      }
      scores.push({ partId: part.id, score });
    }
    return scores
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .filter((s) => s.score > 0)
      .map((s) => s.partId);
  }, [currentAnimal, selectedAnimal, currentDailyTotal, dynamicTargets]);

  // 栄養素をリアルタイム計算（微量栄養素も含む）
  // topping 専用機能は作らない。タロー等は部位選択で追加する想定。塩は saltGrinds（docs/用語_実装の定義と表記一覧.md）
  const toppingNutrients = {
    fat: 0,
    fat_tallow: 0,
    magnesium: 0,
    sodium: 0
  };

  const calculatedNutrients = useMemo(() => {
    if (!selectedFoodItem) return null;

    // 卵の場合は個数からgに変換（1個 = 50g）
    // 塩の場合は削り回数からgに変換
    let actualAmount = amount;
    if (selectedAnimal === 'eggs_fats' && selectedPart === 'egg' && unit === '個') {
      actualAmount = amount * 50; // 1個 = 50g
    } else if (selectedAnimal === 'eggs_fats' && selectedPart === 'salt' && unit === '削り') {
      actualAmount = saltGrinds * config.saltUnitWeight; // 削り回数 × 1削りあたりのg数
    }

    // 肉類の生/焼変換（焼いた肉100g = 生肉133g相当、係数1.33）
    const isMeat = ['ruminant', 'pork_poultry', 'seafood'].includes(selectedAnimal);
    let rawEquivalentAmount = actualAmount;
    if (isMeat && meatCookingMethod === 'cooked') {
      rawEquivalentAmount = actualAmount * 1.33; // 焼いた場合は生換算重量に変換
    }

    const ratio = rawEquivalentAmount / 100; // 100gあたりの倍率（生換算）

    // 卵の調理法によるタンパク質吸収率補正
    let proteinAbsorptionFactor = 1.0;
    if (selectedAnimal === 'eggs_fats' && selectedPart === 'egg') {
      if (eggCookingMethod === 'raw') {
        proteinAbsorptionFactor = 0.513; // 生卵: 51.3%の吸収率
      } else if (eggCookingMethod === 'cooked') {
        proteinAbsorptionFactor = 0.909; // 加熱卵: 90.9%の吸収率
      }
    }

    // 炭水化物と食物繊維の計算
    const carbs = selectedFoodItem.carbs ? selectedFoodItem.carbs.value * ratio : 0;
    const fiber = selectedFoodItem.fiber ? selectedFoodItem.fiber.value * ratio : 0;
    const netCarbs = Math.max(0, carbs - fiber); // NetCarbs = Carbs - Fiber

    // 植物性タンパク質・植物油の計算（植物性食品の場合のみ）
    const isPlant = selectedAnimal === 'plant';
    const plantProtein = isPlant ? selectedFoodItem.protein.value * ratio : 0;
    const vegetableOil = isPlant ? selectedFoodItem.fat.value * ratio : 0;

    return {
      protein: selectedFoodItem.protein.value * ratio * proteinAbsorptionFactor,
      fat: selectedFoodItem.fat.value * ratio + toppingNutrients.fat + toppingNutrients.fat_tallow,
      carbs: carbs,
      netCarbs: netCarbs,
      zinc: selectedFoodItem.zinc ? selectedFoodItem.zinc.value * ratio : 0,
      magnesium: (selectedFoodItem.magnesium ? selectedFoodItem.magnesium.value * ratio : 0) + toppingNutrients.magnesium,
      iron: selectedFoodItem.iron ? selectedFoodItem.iron.value * ratio : 0,
      vitamin_b12: selectedFoodItem.vitamin_b12 ? selectedFoodItem.vitamin_b12.value * ratio : 0,
      sodium: (selectedFoodItem.sodium ? selectedFoodItem.sodium.value * ratio : 0) + toppingNutrients.sodium,
      // 新しい栄養素
      choline: selectedFoodItem.choline ? selectedFoodItem.choline.value * ratio : 0,
      potassium: selectedFoodItem.potassium ? selectedFoodItem.potassium.value * ratio : 0,
      vitamin_a: selectedFoodItem.vitamin_a ? selectedFoodItem.vitamin_a.value * ratio : 0,
      vitamin_d: selectedFoodItem.vitamin_d ? selectedFoodItem.vitamin_d.value * ratio : 0,
      vitamin_k2: selectedFoodItem.vitamin_k2 ? selectedFoodItem.vitamin_k2.value * ratio : 0,
      omega_3: selectedFoodItem.omega_3 ? selectedFoodItem.omega_3.value * ratio : 0,
      omega_6: selectedFoodItem.omega_6 ? selectedFoodItem.omega_6.value * ratio : 0,
      vitamin_b7: selectedFoodItem.vitamin_b7 ? selectedFoodItem.vitamin_b7.value * ratio : 0,
      iodine: selectedFoodItem.iodine ? selectedFoodItem.iodine.value * ratio : 0,
      calcium: selectedFoodItem.calcium ? selectedFoodItem.calcium.value * ratio : 0,
      phosphorus: selectedFoodItem.phosphorus ? selectedFoodItem.phosphorus.value * ratio : 0,
      glycine: selectedFoodItem.glycine ? selectedFoodItem.glycine.value * ratio : 0,
      methionine: selectedFoodItem.methionine ? selectedFoodItem.methionine.value * ratio : 0,
      // 食物繊維（Avoid Zone用）
      fiber: fiber,
      // 植物性タンパク質・植物油（Avoid Zone用）
      plantProtein: plantProtein,
      vegetableOil: vegetableOil,
      // 抗栄養素（植物性食品のみ）
      phytates: selectedFoodItem.phytates ? selectedFoodItem.phytates.value * ratio : 0,
      polyphenols: selectedFoodItem.polyphenols ? selectedFoodItem.polyphenols.value * ratio : 0,
      flavonoids: selectedFoodItem.flavonoids ? selectedFoodItem.flavonoids.value * ratio : 0,
      oxalates: selectedFoodItem.oxalates ? selectedFoodItem.oxalates.value * ratio : 0,
      lectins: selectedFoodItem.lectins ? selectedFoodItem.lectins.value * ratio : 0,
      saponins: selectedFoodItem.saponins ? selectedFoodItem.saponins.value * ratio : 0,
      goitrogens: selectedFoodItem.goitrogens ? selectedFoodItem.goitrogens.value * ratio : 0,
      tannins: selectedFoodItem.tannins ? selectedFoodItem.tannins.value * ratio : 0,
    };
  }, [
    selectedFoodItem,
    amount,
    selectedAnimal,
    unit,
    selectedPart,
    saltGrinds,
    config.saltUnitWeight,
    eggCookingMethod,
    meatCookingMethod,
    toppingNutrients.fat,
    toppingNutrients.fat_tallow,
    toppingNutrients.magnesium,
    toppingNutrients.sodium
  ]);


  // プレビュー計算（無限ループ防止のため、onPreviewChangeを依存配列から除外）
  // onPreviewChangeはuseRefで最新の値を保持
  const onPreviewChangeRef = useRef(onPreviewChange);
  useEffect(() => {
    onPreviewChangeRef.current = onPreviewChange;
  }, [onPreviewChange]);

  useEffect(() => {
    if (selectedPart && calculatedNutrients && onPreviewChangeRef.current) {
      onPreviewChangeRef.current({
        protein: calculatedNutrients.protein,
        fat: calculatedNutrients.fat,
        zinc: calculatedNutrients.zinc,
        magnesium: calculatedNutrients.magnesium,
        iron: calculatedNutrients.iron,
        vitamin_b12: calculatedNutrients.vitamin_b12,
        sodium: calculatedNutrients.sodium,
        // 脂溶性ビタミン（カーニボア重要）
        vitamin_a: calculatedNutrients.vitamin_a,
        vitamin_d: calculatedNutrients.vitamin_d,
        vitamin_k2: calculatedNutrients.vitamin_k2,
        // その他
        choline: calculatedNutrients.choline,
        potassium: calculatedNutrients.potassium,
        // ビタミンB7（ビオチン）
        vitamin_b7: calculatedNutrients.vitamin_b7,
        // オメガ3/6（カーニボア重要：炎症管理）
        omega_3: calculatedNutrients.omega_3,
        omega_6: calculatedNutrients.omega_6,
        // ヨウ素（カーニボア重要：甲状腺機能）
        iodine: calculatedNutrients.iodine,
        // カルシウム、リン（比率計算用）
        calcium: calculatedNutrients.calcium,
        phosphorus: calculatedNutrients.phosphorus,
        // グリシン、メチオニン（比率計算用）
        glycine: calculatedNutrients.glycine,
        methionine: calculatedNutrients.methionine,
      });
    } else if (!selectedPart && onPreviewChangeRef.current) {
      onPreviewChangeRef.current(null);
    }
  }, [calculatedNutrients, selectedPart]); // onPreviewChangeを依存配列から削除（無限ループ防止）

  // パーツ選択ハンドラ
  const handlePartSelect = (partId: string) => {
    if (import.meta.env.DEV) void 0;
    setSelectedPart(partId);

    // デフォルト量を設定
    const foodItem = lookupFoodMaster(selectedAnimal, partId);
    if (foodItem) {
      if (selectedAnimal === 'eggs_fats' && partId === 'egg') {
        setUnit('個');
        setAmount(1); // 卵は1個から
        setSaltGrinds(1);
      } else if (selectedAnimal === 'eggs_fats' && partId === 'salt') {
        setUnit('削り');
        setSaltGrinds(1); // 塩は1削りから
        setAmount(config.saltUnitWeight); // 1削りあたりのg数
      } else {
        setUnit('g');
        setAmount(foodItem.default_unit);
        setSaltGrinds(1);
      }
    }

    // バイブレーション（対応デバイスのみ）
    if (navigator.vibrate) {
      navigator.vibrate(10);
    }

    if (onSelect) {
      onSelect(selectedAnimal, partId);
    }
  };


  const handleSearchSelect = (masterItem: FoodMasterItem) => {
    // 検索結果からFoodItemを生成
    const amount = masterItem.default_unit || 100;
    const ratio = amount / 100;

    const foodItem: FoodItem = {
      item: currentLang === 'ja' ? masterItem.name_ja : masterItem.name,
      amount: amount,
      unit: 'g',
      type: 'ruminant', // Default fallback
      nutrients: {
        protein: (masterItem.protein.value || 0) * ratio,
        fat: (masterItem.fat.value || 0) * ratio,
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
      }
    };

    if (onFoodAdd) {
      onFoodAdd(foodItem);
      if (typeof window !== 'undefined' && (window as Window & { showToast?: (msg: string) => void }).showToast) {
        (window as Window & { showToast: (msg: string) => void }).showToast(`🥩 ${foodItem.item} 追加!`);
      }
    }
  };



  const handleAddFood = () => {
    if (!selectedFoodItem || !calculatedNutrients || !onFoodAdd) return;

    // 卵の場合は個数からgに変換
    // 塩の場合は削り回数からgに変換
    let actualAmount = amount;
    if (selectedAnimal === 'eggs_fats' && selectedPart === 'egg' && unit === '個') {
      actualAmount = amount * 50; // 1個 = 50g
    } else if (selectedAnimal === 'eggs_fats' && selectedPart === 'salt' && unit === '削り') {
      actualAmount = saltGrinds * config.saltUnitWeight; // 削り回数 × 1削りあたりのg数
    }

    // 現在の言語に応じた食品名を取得
    const getFoodName = (item: FoodMasterItem): string => {
      if (currentLang === 'ja') return item.name_ja;
      if (currentLang === 'fr') return item.name_fr || item.name;
      if (currentLang === 'de') return item.name_de || item.name;
      if (currentLang === 'zh') return item.name_ja; // 中国語は日本語名を使用（将来的に追加可能）
      return item.name; // 英語（デフォルト）
    };

    const foodItem = {
      item: getFoodName(selectedFoodItem),
      amount:
        selectedAnimal === 'eggs_fats' && selectedPart === 'egg' && unit === '個'
          ? amount
          : selectedAnimal === 'eggs_fats' && selectedPart === 'salt' && unit === '削り'
            ? actualAmount
            : actualAmount,
      unit:
        selectedAnimal === 'eggs_fats' && selectedPart === 'egg' && unit === '個'
          ? ('個' as 'g' | '個')
          : ('g' as 'g' | '個'),
      type: (selectedAnimal === 'plant'
        ? 'animal'
        : selectedAnimal === 'ruminant'
          ? 'ruminant'
          : selectedAnimal === 'eggs_fats'
            ? 'dairy'
            : 'animal') as 'animal' | 'ruminant' | 'dairy',
      // 卵の調理法を追加
      eggCookingMethod:
        selectedAnimal === 'eggs_fats' && selectedPart === 'egg' ? eggCookingMethod : undefined,
      // 肉類の調理法を追加
      cookingMethod:
        ['ruminant', 'pork_poultry', 'seafood'].includes(selectedAnimal) ? meatCookingMethod : undefined,
      // ビタミンB7（ビオチン）の吸収阻害フラグ（生卵の場合）
      biotinBlocked:
        selectedAnimal === 'eggs_fats' && selectedPart === 'egg' && eggCookingMethod === 'raw'
          ? true
          : undefined,
      nutrients: {
        protein: calculatedNutrients.protein,
        fat: calculatedNutrients.fat,
        carbs: selectedFoodItem.carbs.value * (actualAmount / 100),
        netCarbs: selectedFoodItem.carbs.value * (actualAmount / 100),
        zinc: calculatedNutrients.zinc,
        sodium: calculatedNutrients.sodium,
        magnesium: calculatedNutrients.magnesium,
        hemeIron: calculatedNutrients.iron,
        vitaminB12: calculatedNutrients.vitamin_b12,
        // 脂溶性ビタミン
        vitaminA: calculatedNutrients.vitamin_a,
        vitaminD: calculatedNutrients.vitamin_d,
        vitaminK2: calculatedNutrients.vitamin_k2,
        // その他
        choline: calculatedNutrients.choline,
        potassium: calculatedNutrients.potassium,
        // ビタミンB7（ビオチン）
        vitaminB7: calculatedNutrients.vitamin_b7,
        // オメガ3/6
        omega3: calculatedNutrients.omega_3,
        omega6: calculatedNutrients.omega_6,
        // ヨウ素
        iodine: calculatedNutrients.iodine,
        // カルシウム、リン
        calcium: calculatedNutrients.calcium,
        phosphorus: calculatedNutrients.phosphorus,
        // グリシン、メチオニン
        glycine: calculatedNutrients.glycine,
        methionine: calculatedNutrients.methionine,
        // 食物繊維・抗栄養素（植物性食品のみ）
        fiber: calculatedNutrients.fiber || 0,
        phytates: calculatedNutrients.phytates || 0,
        polyphenols: calculatedNutrients.polyphenols || 0,
        flavonoids: calculatedNutrients.flavonoids || 0,
        oxalates: calculatedNutrients.oxalates || 0,
        lectins: calculatedNutrients.lectins || 0,
        saponins: calculatedNutrients.saponins || 0,
        goitrogens: calculatedNutrients.goitrogens || 0,
        tannins: calculatedNutrients.tannins || 0,
      },
    };

    onFoodAdd(foodItem);

    // トースト通知を表示
    const win = window as Window & { showToast?: (msg: string) => void };
    if (typeof window !== 'undefined' && win.showToast) {
      const displayAmount = selectedAnimal === 'eggs_fats' && selectedPart === 'egg' && unit === '個'
        ? amount
        : actualAmount;
      const displayUnit = selectedAnimal === 'eggs_fats' && selectedPart === 'egg' && unit === '個'
        ? '個'
        : 'g';
      win.showToast(`🥩 ${getFoodName(selectedFoodItem)} ${displayAmount}${displayUnit} 追加!`);
    }

    setSelectedPart(null);

    if (selectedAnimal === 'eggs_fats') {
      setAmount(selectedPart === 'egg' ? 50 : 100);
    } else {
      setAmount(300);
    }

    if (onPreviewChangeRef.current) {
      onPreviewChangeRef.current(null);
    }
  };

  // 表示用データ（プレビュー値 = 選択中の食品のみの値）（将来の表示用に保持）
  const _currentNutrients = calculatedNutrients
    ? {
      protein: calculatedNutrients.protein,
      fat: calculatedNutrients.fat,
      zinc: calculatedNutrients.zinc, // プレビュー値（動物性食品なので係数1.0で計算済み）
      magnesium: calculatedNutrients.magnesium,
      hemeIron: calculatedNutrients.iron, // プレビュー値（動物性食品なのでheme iron、係数1.0で計算済み）
      nonHemeIron: 0,
      vitamin_b12: calculatedNutrients.vitamin_b12,
      sodium: calculatedNutrients.sodium,
    }
    : {
      protein: 0,
      fat: 0,
      zinc: 0,
      magnesium: 0,
      hemeIron: 0,
      nonHemeIron: 0,
      vitamin_b12: 0,
      sodium: 0,
    };

  return (
    <div className="flex flex-col gap-4 p-4 w-full max-w-md mx-auto pb-40 pt-36">
      {/* 動物タブ (Style強制) */}
      <div className="flex flex-wrap gap-2 mb-4 relative z-40">
        {INTERNAL_ANIMALS.map((animal) => {
          const isActive = selectedAnimal === animal.type;
          return (
            <button
              key={animal.type}
              onClick={() => {
                setSelectedAnimal(animal.type);
                setSelectedPart(null);
                setUnit('g');
                if (animal.type === 'dairy') {
                  setAmount(50);
                } else if (animal.type === 'fat') {
                  setAmount(100);
                } else {
                  setAmount(300);
                }
              }}
              className="px-3 py-3 rounded-2xl flex flex-col items-center justify-center transition-all duration-200 min-w-[30%]"
              style={{
                flex: '1 1 30%',
                backgroundColor: isActive ? '#ef4444' : '#292524', // Red-500 : Stone-800
                color: isActive ? 'white' : '#a8a29e', // White : Stone-400
                boxShadow: isActive
                  ? '0 10px 15px -3px rgba(239, 68, 68, 0.4)'
                  : '0 4px 6px -1px rgba(0, 0, 0, 0.2)', // Darker shadow for inactive
                transform: isActive ? 'translateY(-2px)' : 'scale(1)',
                cursor: 'pointer',
              }}
            >
              <span className="text-2xl mb-1 drop-shadow-sm">{animal.icon}</span>
              <span className={`text-[12px] font-bold tracking-wide ${isActive ? 'opacity-100' : 'opacity-70'}`}>
                {animal.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* 植物性食品選択時の警告バナー */}
      {selectedAnimal === 'plant' && (
        <div
          className="p-4 rounded-lg border-2 mb-4 relative z-40"
          style={{
            backgroundColor: '#fef3c7',
            borderColor: '#f59e0b',
            boxShadow: '0 4px 6px -1px rgba(245, 158, 11, 0.3)',
          }}
        >
          <div className="flex items-start gap-3">
            <span className="text-2xl" style={{ flexShrink: 0 }}>
              ⚠️
            </span>
            <div>
              <h3
                className="font-bold text-base mb-1"
                style={{ color: '#92400e' }}
              >
                {t('butcher.plantWarningTitle') || '植物性食品の注意点'}
              </h3>
              <p
                className="text-sm leading-relaxed"
                style={{ color: '#78350f' }}
              >
                {t('butcher.plantWarningMessage') ||
                  '植物性食品にはフィチン酸、シュウ酸、レクチンなどの抗栄養素が含まれており、ミネラルの吸収を阻害する可能性があります。カーニボアダイエットでは動物性食品を推奨しています。'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Omega-6 warning for Pork & Poultry */}
      {currentAnimal.omega6Warning && (
        <div
          className="px-3 py-2 rounded-lg border mb-4 relative z-40 flex items-center gap-2"
          style={{
            backgroundColor: '#fff7ed',
            borderColor: '#fdba74',
          }}
        >
          <span className="text-sm">⚠️</span>
          <span className="text-xs font-medium" style={{ color: '#9a3412' }}>
            High Omega-6 — balance with Omega-3 sources (seafood, ruminant fat)
          </span>
        </div>
      )}

      {/* Nutrients Breakdown Summary (Unselected State) - Moved above buttons for visibility */}
      {!selectedPart && (
        <div className="bg-stone-900/80 rounded-xl shadow-lg border border-stone-800 overflow-hidden relative z-40 p-4 mb-4">
          <h3 className="text-sm font-bold text-stone-400 mb-3 flex items-center gap-2">
            <span>📊</span> {t('butcher.nutrientBreakdown') || 'NUTRIENT BREAKDOWN'} (Today)
          </h3>
          <div className="space-y-3">
            <AvoidGauge
              label={t('customFood.protein') || 'Protein'}
              currentDailyTotal={currentDailyTotal.protein || 0}
              previewAmount={0}
              max={dynamicTargets.protein}
              unit="g"
            />
            <AvoidGauge
              label={t('customFood.fat') || 'Fat'}
              currentDailyTotal={currentDailyTotal.fat || 0}
              previewAmount={0}
              max={dynamicTargets.fat}
              unit="g"
            />
            <div className="text-xs text-stone-400 text-center mt-2">
              Select a part to see detailed simulation
            </div>
          </div>
        </div>
      )}

      {/* カテゴリと部位の境界線 */}
      <div className="flex items-center gap-2 mb-4 mt-2">
        <div className="h-px bg-stone-800 flex-1"></div>
        <span className="text-xs font-bold text-stone-500">SELECT PART</span>
        <div className="h-px bg-stone-800 flex-1"></div>
      </div>

      {/* 部位ボタン */}
      <div className="grid grid-cols-2 gap-3 mb-6 relative z-40">
        {currentAnimal.parts.map((part) => {
          const isPartActive = selectedPart === part.id;
          const isRecommended = recommendedPartIds.includes(part.id);
          // 食品名を取得（foodMasterから）
          const foodItem = lookupFoodMaster(selectedAnimal, part.id);
          const getPartLabel = (): string => {
            if (!foodItem) return part.label;
            return foodItem.name; // Always English
          };
          return (
            <button
              key={part.id}
              onClick={() => handlePartSelect(part.id)}
              className="py-4 px-4 rounded-2xl text-sm font-bold transition-all duration-200 flex items-center justify-between group"
              style={{
                backgroundColor: isPartActive ? '#ef4444' : isRecommended ? 'rgba(244, 63, 94, 0.15)' : '#292524',
                color: isPartActive ? 'white' : isRecommended ? '#fda4af' : '#d6d3d1',
                border: isPartActive ? 'none' : isRecommended ? '2px solid #f43f5e' : '1px solid #44403c',
                boxShadow: isPartActive
                  ? '0 10px 15px -3px rgba(239, 68, 68, 0.3)'
                  : isRecommended
                    ? '0 0 0 1px rgba(244, 63, 94, 0.4), 0 4px 6px -1px rgba(0, 0, 0, 0.2)'
                    : '0 4px 6px -1px rgba(0, 0, 0, 0.2)',
                transform: isPartActive ? 'scale(1.02)' : 'scale(1)',
                cursor: 'pointer',
              }}
            >
              <span className="transform group-active:scale-95 transition-transform flex items-center gap-1.5">
                {getPartLabel()}
                {isRecommended && !isPartActive && <span className="text-xs opacity-90">⭐</span>}
              </span>
              {isPartActive && <span className="text-lg animate-pulse">●</span>}
            </button>
          );
        })}
      </div>

      {/* コントロールパネル & ステータスウィンドウ */}


      {selectedPart && selectedFoodItem && (
        <div className="bg-stone-900 rounded-xl shadow-lg border border-stone-800 overflow-hidden relative z-40">
          {/* 量入力エリア */}
          <div className="p-4 border-b border-stone-800">
            {/* 量入力エリア */}
            {selectedAnimal === 'eggs_fats' && selectedPart === 'salt' ? (
              // 塩の場合はスピナー（数値入力）
              <>
                {/* 塩の種類選択 */}
                <div className="mb-4">
                  <label className="text-sm font-bold text-stone-700 block mb-2">
                    {t('butcher.saltType')}
                  </label>
                  <div className="flex gap-2 flex-wrap">
                    <button
                      onClick={() => {
                        const newSaltType = 'table_salt';
                        setSelectedSaltType(newSaltType);
                        updateConfig({ saltType: newSaltType });
                      }}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${selectedSaltType === 'table_salt'
                        ? 'bg-red-600 text-white'
                        : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                        }`}
                    >
                      {t('profile.tableSalt')}
                    </button>
                    <button
                      onClick={() => {
                        const newSaltType = 'sea_salt';
                        setSelectedSaltType(newSaltType);
                        updateConfig({ saltType: newSaltType });
                      }}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${selectedSaltType === 'sea_salt'
                        ? 'bg-red-600 text-white'
                        : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                        }`}
                    >
                      {t('profile.seaSalt')}
                    </button>
                    <button
                      onClick={() => {
                        const newSaltType = 'himalayan_salt';
                        setSelectedSaltType(newSaltType);
                        updateConfig({ saltType: newSaltType });
                      }}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${selectedSaltType === 'himalayan_salt'
                        ? 'bg-red-600 text-white'
                        : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                        }`}
                    >
                      {t('profile.himalayanSalt')}
                    </button>
                    <button
                      onClick={() => {
                        const newSaltType = 'celtic_salt';
                        setSelectedSaltType(newSaltType);
                        updateConfig({ saltType: newSaltType });
                      }}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${selectedSaltType === 'celtic_salt'
                        ? 'bg-red-600 text-white'
                        : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                        }`}
                    >
                      {t('profile.celticSalt')}
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-4 mb-4">
                  <label className="text-sm font-bold text-stone-700 flex-1">
                    {t('butcher.quantity')}
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSaltGrinds(Math.max(1, saltGrinds - 1))}
                      className="min-w-[44px] min-h-[44px] w-11 h-11 flex items-center justify-center bg-stone-200 hover:bg-stone-300 rounded-lg font-bold text-lg"
                    >
                      −
                    </button>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={saltGrinds}
                      onChange={(e) => {
                        const newValue = parseInt(e.target.value, 10);
                        if (!isNaN(newValue) && newValue >= 1) {
                          setSaltGrinds(newValue);
                          setAmount(newValue * config.saltUnitWeight);
                        }
                      }}
                      className="w-16 text-center text-xl font-bold border-2 border-stone-300 rounded-lg py-1"
                    />
                    <button
                      onClick={() => setSaltGrinds(saltGrinds + 1)}
                      className="w-8 h-8 flex items-center justify-center bg-stone-200 hover:bg-stone-300 rounded-lg font-bold text-lg"
                    >
                      +
                    </button>
                    <span className="text-xl font-bold text-stone-900">{t('butcher.grind')}</span>
                    <input
                      type="number"
                      min="0"
                      max="10"
                      step="0.1"
                      value={config.saltUnitWeight}
                      onChange={(e) => {
                        const newValue = parseFloat(e.target.value);
                        if (!isNaN(newValue) && newValue >= 0) {
                          updateConfig({ saltUnitWeight: newValue });
                          setAmount(saltGrinds * newValue);
                        }
                      }}
                      className="w-12 text-center text-sm border border-stone-300 rounded px-1 py-0.5 ml-1"
                      title={t('butcher.perGrind')}
                    />
                    <span className="text-sm text-stone-500">g</span>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        updateConfig({ saltUnitWeight: 0.5 }); // デフォルト値に戻す
                        setAmount(saltGrinds * 0.5);
                      }}
                      className="min-w-[44px] min-h-[44px] flex items-center justify-center text-xs text-stone-400 hover:text-stone-600 ml-1 rounded-lg"
                      title={t('butcher.resetToDefault')}
                    >
                      ↺
                    </button>
                  </div>
                </div>
              </>
            ) : (
              // その他の食品はスライダー
              <>
                <div className="flex justify-between items-baseline mb-2">
                  <label className="text-sm font-bold text-stone-400">
                    {t('butcher.quantity')}
                  </label>
                  <span className="text-2xl font-bold text-stone-200">
                    {amount}
                    {unit === '個' ? t('butcher.piece') : 'g'}
                  </span>
                </div>
                <div className="flex items-center gap-2 mb-4">
                  <button
                    onClick={() => {
                      const step = unit === '個' ? 1 : 10;
                      const min = unit === '個' ? 1 : 0;
                      const newValue = Math.max(min, amount - step);
                      setAmount(newValue);
                    }}
                    className="w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center bg-stone-200 hover:bg-stone-300 rounded-lg text-2xl font-bold text-stone-700 transition-colors"
                    style={{ minWidth: '44px', minHeight: '44px' }}
                  >
                    -
                  </button>
                  <input
                    type="range"
                    min={unit === '個' ? '1' : '0'}
                    max={unit === '個' ? '10' : '1000'}
                    step={unit === '個' ? '1' : '10'}
                    value={amount}
                    onChange={(e) => {
                      const newValue = parseFloat(e.target.value);
                      if (!isNaN(newValue)) {
                        setAmount(newValue);
                      }
                    }}
                    className="flex-1 h-2 bg-stone-800 rounded-lg appearance-none cursor-pointer accent-red-600"
                  />
                  <button
                    onClick={() => {
                      const step = unit === '個' ? 1 : 10;
                      const max = unit === '個' ? 10 : 1000;
                      const newValue = Math.min(max, amount + step);
                      setAmount(newValue);
                    }}
                    className="w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center bg-stone-200 hover:bg-stone-300 rounded-lg text-2xl font-bold text-stone-700 transition-colors"
                    style={{ minWidth: '44px', minHeight: '44px' }}
                  >
                    +
                  </button>
                </div>
              </>
            )}

            {/* 計測時の状態（肉類のみ表示） */}
            {['ruminant', 'pork_poultry', 'seafood'].includes(selectedAnimal) && (
              <div className="mb-4">
                <label className="text-sm font-bold text-stone-700 block mb-2">
                  計測時の状態
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setMeatCookingMethod('raw')}
                    className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${meatCookingMethod === 'raw'
                      ? 'bg-red-600 text-white'
                      : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                      }`}
                  >
                    生
                  </button>
                  <button
                    onClick={() => setMeatCookingMethod('cooked')}
                    className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${meatCookingMethod === 'cooked'
                      ? 'bg-red-600 text-white'
                      : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                      }`}
                  >
                    焼
                  </button>
                </div>
                {meatCookingMethod === 'cooked' && (
                  <p className="text-xs text-stone-500 mt-1">
                    焼いた状態で{amount}g = 生換算{Math.round(amount * 1.33)}g相当
                  </p>
                )}
              </div>
            )}


            {/* Nutrients Breakdown - 詳細な栄養素内訳（プレビュー、動物性食品のみ表示） */}
            {calculatedNutrients &&
              selectedAnimal !== 'plant' &&
              (() => {
                // 貯蔵可能な栄養素のリスト（別UIで表示）
                const storageNutrients: ButcherNutrientKey[] = [
                  'vitaminA',
                  'vitaminD',
                  'vitaminK2',
                  'calcium',
                  'phosphorus',
                ];

                // 栄養素データのマッピング
                const nutrientDataMap: Record<
                  ButcherNutrientKey,
                  {
                    label: string;
                    currentDailyTotal: number;
                    previewAmount: number;
                    target: number;
                    color: string;
                    unit: string;
                    logic?: string;
                    hint?: string;
                    showLowIsOk?: boolean;
                    isRatio?: boolean;
                  }
                > = {
                  protein: {
                    label: t('customFood.protein'),
                    currentDailyTotal: currentDailyTotal.protein || 0,
                    previewAmount: calculatedNutrients.protein,
                    target: dynamicTargets.protein,
                    color: '#f43f5e',
                    unit: 'g',
                  },
                  fat: {
                    label: t('customFood.fat'),
                    currentDailyTotal: currentDailyTotal.fat || 0,
                    previewAmount: calculatedNutrients.fat,
                    target: dynamicTargets.fat,
                    color: '#f43f5e',
                    unit: 'g',
                  },
                  zinc: {
                    label: t('customFood.zinc'),
                    currentDailyTotal: currentDailyTotal.zinc || 0,
                    previewAmount: calculatedNutrients.zinc,
                    target: dynamicTargets.zinc,
                    color: '#f43f5e',
                    unit: 'mg',
                  },
                  magnesium: {
                    label: t('customFood.magnesium'),
                    currentDailyTotal: currentDailyTotal.magnesium || 0,
                    previewAmount: calculatedNutrients.magnesium,
                    target:
                      CARNIVORE_NUTRIENT_TARGETS.magnesium?.target ||
                      dynamicTargets.magnesium,
                    color: '#f43f5e',
                    unit: 'mg',
                    logic: CARNIVORE_NUTRIENT_TARGETS.magnesium?.logic,
                    hint: t('butcher.magnesiumHint'),
                  },
                  iron: {
                    label: t('customFood.iron'),
                    currentDailyTotal:
                      ((currentDailyTotal as Record<string, number>).hemeIron || 0) +
                      ((currentDailyTotal as Record<string, number>).nonHemeIron || 0),
                    previewAmount: calculatedNutrients.iron,
                    target: dynamicTargets.iron,
                    color: '#f43f5e',
                    unit: 'mg',
                  },
                  potassium: {
                    label: t('customFood.potassium'),
                    currentDailyTotal: currentDailyTotal.potassium || 0,
                    previewAmount: calculatedNutrients.potassium,
                    target:
                      CARNIVORE_NUTRIENT_TARGETS.potassium?.target ||
                      dynamicTargets.potassium,
                    color: '#f43f5e',
                    unit: 'mg',
                    logic: CARNIVORE_NUTRIENT_TARGETS.potassium?.logic,
                  },
                  sodium: {
                    label: t('customFood.sodium'),
                    currentDailyTotal: currentDailyTotal.sodium || 0,
                    previewAmount: calculatedNutrients.sodium,
                    target:
                      CARNIVORE_NUTRIENT_TARGETS.sodium?.min || dynamicTargets.sodium,
                    color: '#f43f5e',
                    unit: 'mg',
                    logic: CARNIVORE_NUTRIENT_TARGETS.sodium?.logic,
                  },
                  vitaminA: {
                    label: t('customFood.vitaminA'),
                    currentDailyTotal: currentDailyTotal.vitamin_a || 0,
                    previewAmount: calculatedNutrients.vitamin_a,
                    target: dynamicTargets.vitamin_a,
                    color: '#f43f5e',
                    unit: 'IU',
                  },
                  vitaminD: {
                    label: t('customFood.vitaminD'),
                    currentDailyTotal: currentDailyTotal.vitamin_d || 0,
                    previewAmount: calculatedNutrients.vitamin_d,
                    target: dynamicTargets.vitamin_d,
                    color: '#f43f5e',
                    unit: 'IU',
                  },
                  vitaminK2: {
                    label: t('customFood.vitaminK2'),
                    currentDailyTotal: currentDailyTotal.vitamin_k2 || 0,
                    previewAmount: calculatedNutrients.vitamin_k2,
                    target: dynamicTargets.vitamin_k2,
                    color: '#f43f5e',
                    unit: 'μg',
                  },
                  vitaminB12: {
                    label: t('customFood.vitaminB12'),
                    currentDailyTotal: currentDailyTotal.vitamin_b12 || 0,
                    previewAmount: calculatedNutrients.vitamin_b12,
                    target: dynamicTargets.vitamin_b12,
                    color: '#f43f5e',
                    unit: 'μg',
                  },
                  vitaminB7: {
                    label: t('customFood.vitaminB7'),
                    currentDailyTotal: currentDailyTotal.vitamin_b7 || 0,
                    previewAmount: calculatedNutrients.vitamin_b7,
                    target: 30,
                    color: '#f43f5e',
                    unit: 'μg',
                    hint:
                      eggCookingMethod === 'raw' &&
                        selectedAnimal === 'eggs_fats' &&
                        selectedPart === 'egg'
                        ? t('butcher.biotinBlockedHint')
                        : undefined,
                  },
                  choline: {
                    label: t('customFood.choline'),
                    currentDailyTotal: currentDailyTotal.choline || 0,
                    previewAmount: calculatedNutrients.choline,
                    target: dynamicTargets.choline,
                    color: '#f43f5e',
                    unit: 'mg',
                  },
                  iodine: {
                    label: t('customFood.iodine'),
                    currentDailyTotal: currentDailyTotal.iodine || 0,
                    previewAmount: calculatedNutrients.iodine,
                    target: 150,
                    color: '#f43f5e',
                    unit: 'μg',
                  },
                  calcium: {
                    label: t('customFood.calcium'),
                    currentDailyTotal: currentDailyTotal.calcium || 0,
                    previewAmount: calculatedNutrients.calcium,
                    target: 1000,
                    color: '#f43f5e',
                    unit: 'mg',
                  },
                  phosphorus: {
                    label: t('customFood.phosphorus'),
                    currentDailyTotal: currentDailyTotal.phosphorus || 0,
                    previewAmount: calculatedNutrients.phosphorus,
                    target: 700,
                    color: '#f43f5e',
                    unit: 'mg',
                  },
                  glycine: {
                    label: t('customFood.glycine'),
                    currentDailyTotal: currentDailyTotal.glycine || 0,
                    previewAmount: calculatedNutrients.glycine,
                    target: 0,
                    color: '#f43f5e',
                    unit: 'g',
                  },
                  methionine: {
                    label: t('customFood.methionine'),
                    currentDailyTotal: currentDailyTotal.methionine || 0,
                    previewAmount: calculatedNutrients.methionine,
                    target: 0,
                    color: '#f43f5e',
                    unit: 'g',
                  },
                  omegaRatio: {
                    label: t('butcher.omega36Ratio'),
                    currentDailyTotal: 0,
                    previewAmount: 0,
                    target: 0,
                    color: '#f43f5e',
                    unit: '',
                    isRatio: true,
                  },
                };

                // 並び替えモードに応じて栄養素をソート
                const sortedNutrients = sortNutrientsByMode(
                  nutrientOrder,
                  sortMode,
                  Object.fromEntries(
                    Object.entries(nutrientDataMap).map(([key, data]) => [
                      key,
                      {
                        currentDailyTotal: data.currentDailyTotal,
                        previewAmount: data.previewAmount,
                        target: data.target,
                      },
                    ])
                  ) as Record<
                    ButcherNutrientKey,
                    { currentDailyTotal: number; previewAmount: number; target: number }
                  >
                );

                return (
                  <div className="mt-4">
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '0.5rem',
                      }}
                    >
                      <h3 className="text-sm font-semibold text-stone-600">
                        {t('butcher.nutrientBreakdown')}
                      </h3>
                      {/* 並び替えモード選択 */}
                      <select
                        value={sortMode}
                        onChange={(e) => setSortMode(e.target.value as SortMode)}
                        style={{
                          padding: '0.25rem 0.5rem',
                          fontSize: '12px',
                          border: '1px solid #d1d5db',
                          borderRadius: '4px',
                          backgroundColor: 'var(--color-bg-primary)',
                          cursor: 'pointer',
                        }}
                      >
                        <option value="default">{t('butcher.sortByPriority')}</option>
                        <option value="deficiency">{t('butcher.sortByDeficiency')}</option>
                      </select>
                    </div>
                    <div
                      style={{
                        maxHeight: '400px',
                        overflowY: 'auto',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 0,
                        padding: '0.5rem',
                        backgroundColor: 'transparent',
                        borderRadius: '8px',
                        border: '1px solid #e5e7eb',
                      }}
                    >
                      {(() => {
                        // 栄養素表示設定を取得
                        const displaySettings = getNutrientDisplaySettings();

                        // ButcherNutrientKeyからNutrientKeyへのマッピング
                        const keyMapping: Record<ButcherNutrientKey, NutrientKey> = {
                          protein: 'protein',
                          fat: 'fat',
                          zinc: 'zinc',
                          magnesium: 'magnesium',
                          iron: 'iron',
                          potassium: 'potassium',
                          sodium: 'sodium',
                          vitaminA: 'vitaminA',
                          vitaminD: 'vitaminD',
                          vitaminK2: 'vitaminK2',
                          vitaminB12: 'vitaminB12',
                          vitaminB7: 'vitaminB7',
                          choline: 'choline',
                          iodine: 'iodine',
                          calcium: 'calcium',
                          phosphorus: 'phosphorus',
                          glycine: 'glycineMethionineRatio', // グリシンは比率として扱う
                          methionine: 'glycineMethionineRatio', // メチオニンは比率として扱う
                          omegaRatio: 'omegaRatio',
                        };

                        // ButcherNutrientKeyからcarnivoreTargets.tsの栄養素キーへのマッピング
                        const carnivoreKeyMapping: Record<string, string> = {
                          protein: 'protein',
                          fat: 'fat',
                          zinc: 'zinc',
                          magnesium: 'magnesium',
                          iron: 'iron',
                          potassium: 'potassium',
                          sodium: 'sodium',
                          vitaminA: 'vitamin_a',
                          vitaminD: 'vitamin_d',
                          vitaminK2: 'vitamin_k2',
                          vitaminB12: 'vitamin_b12',
                          choline: 'choline',
                        };

                        return sortedNutrients
                          .filter((orderItem) => {
                            // 貯蔵可能な栄養素は除外（別UIで表示）
                            if (storageNutrients.includes(orderItem.key)) return false;

                            // 栄養素表示設定に基づいてフィルタリング
                            const nutrientKey = keyMapping[orderItem.key];
                            if (!nutrientKey) return true; // マッピングがない場合は表示

                            // グリシンとメチオニンは比率として扱う
                            if (orderItem.key === 'glycine' || orderItem.key === 'methionine') {
                              return displaySettings['glycineMethionineRatio'] !== false;
                            }

                            return displaySettings[nutrientKey] !== false;
                          })
                          .map((orderItem, _index) => {
                            const nutrient = nutrientDataMap[orderItem.key];
                            if (!nutrient) return null;

                            return (
                              <div key={orderItem.key}>
                                {/* 栄養素ゲージ */}
                                <div>
                                  {nutrient.isRatio ? (
                                    <OmegaRatioDisplay
                                      omega3={calculatedNutrients.omega_3}
                                      omega6={calculatedNutrients.omega_6}
                                    />
                                  ) : (
                                    <div>
                                      <MiniNutrientGauge
                                        label=""
                                        currentDailyTotal={nutrient.currentDailyTotal}
                                        previewAmount={nutrient.previewAmount}
                                        target={nutrient.target}
                                        color={nutrient.color}
                                        unit={nutrient.unit}
                                        logic={nutrient.logic}
                                        hint={nutrient.hint}
                                        showLowIsOk={nutrient.showLowIsOk}
                                        nutrientKey={
                                          carnivoreKeyMapping[orderItem.key] || undefined
                                        }
                                      />
                                      <div
                                        style={{ fontSize: '12px', color: '#6b7280', marginTop: 0 }}
                                      >
                                        {nutrient.label}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          });
                      })()}
                    </div>
                  </div>
                );
              })()}

            {/* Storage Nutrients（貯蔵可能な栄養素）セクション */}
            {calculatedNutrients &&
              selectedAnimal !== 'plant' &&
              (() => {
                // HomeScreen と同一の nutrient_storage_levels を参照（貯蔵量は日次減衰＋摂取で更新）
                const storedLevels = (() => {
                  try {
                    const s = localStorage.getItem('nutrient_storage_levels');
                    return s ? (JSON.parse(s) as Record<string, number>) : {};
                  } catch {
                    return {};
                  }
                })();
                const clamp = (v: number) => Math.min(100, Math.max(0, v));
                const def = 70;

                const storageNutrientsData = [
                  {
                    key: 'vitaminA' as const,
                    label: t('customFood.vitaminA'),
                    currentStorage: clamp(storedLevels.vitamin_a ?? def),
                    dailyIntake: calculatedNutrients.vitamin_a,
                    dailyRequirement: dynamicTargets.vitamin_a,
                    unit: 'IU',
                  },
                  {
                    key: 'vitaminD' as const,
                    label: t('customFood.vitaminD'),
                    currentStorage: clamp(storedLevels.vitamin_d ?? def),
                    dailyIntake: calculatedNutrients.vitamin_d,
                    dailyRequirement: dynamicTargets.vitamin_d,
                    unit: 'IU',
                  },
                  {
                    key: 'vitaminK2' as const,
                    label: t('customFood.vitaminK2'),
                    currentStorage: clamp(storedLevels.vitamin_k2 ?? def),
                    dailyIntake: calculatedNutrients.vitamin_k2,
                    dailyRequirement: dynamicTargets.vitamin_k2,
                    unit: 'μg',
                  },
                  {
                    key: 'calcium' as const,
                    label: t('customFood.calcium'),
                    currentStorage: clamp(storedLevels.calcium ?? def),
                    dailyIntake: calculatedNutrients.calcium,
                    dailyRequirement: 1000,
                    unit: 'mg',
                  },
                  {
                    key: 'phosphorus' as const,
                    label: t('customFood.phosphorus'),
                    currentStorage: clamp(storedLevels.phosphorus ?? def),
                    dailyIntake: calculatedNutrients.phosphorus,
                    dailyRequirement: 700,
                    unit: 'mg',
                  },
                ];

                // 少なくとも1つでも値がある場合のみ表示
                const hasAnyStorageValue = storageNutrientsData.some(
                  (item) => item.dailyIntake > 0 || item.currentStorage > 0
                );

                if (!hasAnyStorageValue) return null;

                return (
                  <div className="mt-4">
                    <h3
                      className="text-sm font-semibold text-stone-600 mb-2"
                      style={{ color: '#f43f5e' }}
                    >
                      貯蔵可能な栄養素
                    </h3>
                    <div
                      style={{
                        maxHeight: '400px',
                        overflowY: 'auto',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 0,
                        padding: 0,
                        backgroundColor: 'transparent',
                        borderRadius: '8px',
                        border: '1px solid #e9d5ff',
                      }}
                    >
                      {storageNutrientsData.map((item) => (
                        <StorageNutrientGauge
                          key={item.key}
                          nutrientKey={item.key}
                          label={item.label}
                          currentStorage={item.currentStorage}
                          dailyTarget={item.dailyRequirement} // mapped from requirement to target
                          unit={item.unit}
                        />
                      ))}
                    </div>
                  </div>
                );
              })()}

            {/* Avoid Zone（避けるべきもの）セクション - 植物性食品選択時は必ず表示 */}
            {featureDisplaySettings.avoidZone &&
              (() => {
                // 植物性食品を選択している場合は常に表示
                const isPlantSelected = selectedAnimal === 'plant';

                // カスタマイズ可能な上限値（将来的にユーザー設定から取得）
                const avoidLimits = {
                  plantProteinMax: 0, // 完全排除
                  vegetableOilMax: 0, // 完全排除
                  fiberMax: 0, // 完全排除
                  netCarbsMax: 20, // 設定可能（デフォルト: 20g）
                  // 抗栄養素の上限値（将来的にユーザー設定から取得）
                  phytatesMax: 0,
                  polyphenolsMax: 0,
                  flavonoidsMax: 0,
                  oxalatesMax: 0,
                  lectinsMax: 0,
                  saponinsMax: 0,
                  goitrogensMax: 0,
                  tanninsMax: 0,
                };

                // 今日すでに確定した摂取量（dailyLogから取得、将来的に実装）
                const avoidCurrentTotals = {
                  plantProtein: (currentDailyTotal as Record<string, number>).plantProtein || 0,
                  vegetableOil: (currentDailyTotal as Record<string, number>).vegetableOil || 0,
                  fiber: (currentDailyTotal as Record<string, number>).fiber || 0,
                  netCarbs: (currentDailyTotal as Record<string, number>).netCarbs || 0,
                  phytates: (currentDailyTotal as Record<string, number>).phytates || 0,
                  polyphenols: (currentDailyTotal as Record<string, number>).polyphenols || 0,
                  flavonoids: (currentDailyTotal as Record<string, number>).flavonoids || 0,
                  oxalates: (currentDailyTotal as Record<string, number>).oxalates || 0,
                  lectins: (currentDailyTotal as Record<string, number>).lectins || 0,
                  saponins: (currentDailyTotal as Record<string, number>).saponins || 0,
                  goitrogens: (currentDailyTotal as Record<string, number>).goitrogens || 0,
                  tannins: (currentDailyTotal as Record<string, number>).tannins || 0,
                };

                // プレビュー値（現在選択している食品から）
                const avoidPreviewAmounts = {
                  plantProtein: calculatedNutrients?.plantProtein || 0,
                  vegetableOil: calculatedNutrients?.vegetableOil || 0,
                  fiber: calculatedNutrients?.fiber || 0,
                  netCarbs: calculatedNutrients?.netCarbs || 0,
                  phytates: calculatedNutrients?.phytates || 0,
                  polyphenols: calculatedNutrients?.polyphenols || 0,
                  flavonoids: calculatedNutrients?.flavonoids || 0,
                  oxalates: calculatedNutrients?.oxalates || 0,
                  lectins: calculatedNutrients?.lectins || 0,
                  saponins: calculatedNutrients?.saponins || 0,
                  goitrogens: calculatedNutrients?.goitrogens || 0,
                  tannins: calculatedNutrients?.tannins || 0,
                };

                // 少なくとも1つでも値がある場合、または植物性食品を選択している場合は表示
                const hasAnyAvoidValue =
                  Object.values(avoidCurrentTotals).some((v) => v > 0) ||
                  Object.values(avoidPreviewAmounts).some((v) => v > 0);

                if (!hasAnyAvoidValue && !isPlantSelected) return null;

                // 主に意識すべき避けるべきもの（常に表示）
                const primaryAntinutrients = [
                  {
                    key: 'plantProtein',
                    label: t('butcher.plantProtein'),
                    unit: 'g',
                    current: avoidCurrentTotals.plantProtein,
                    preview: avoidPreviewAmounts.plantProtein,
                    max: avoidLimits.plantProteinMax,
                  },
                  {
                    key: 'vegetableOil',
                    label: t('butcher.vegetableOil'),
                    unit: 'g',
                    current: avoidCurrentTotals.vegetableOil,
                    preview: avoidPreviewAmounts.vegetableOil,
                    max: avoidLimits.vegetableOilMax,
                  },
                  {
                    key: 'fiber',
                    label: t('butcher.fiber'),
                    unit: 'g',
                    current: avoidCurrentTotals.fiber,
                    preview: avoidPreviewAmounts.fiber,
                    max: avoidLimits.fiberMax,
                  },
                  {
                    key: 'netCarbs',
                    label: t('butcher.netCarbs'),
                    unit: 'g',
                    current: avoidCurrentTotals.netCarbs,
                    preview: avoidPreviewAmounts.netCarbs,
                    max: avoidLimits.netCarbsMax,
                  },
                ];

                // マニアック系の抗栄養素（「もっと見る」で表示）
                const advancedAntinutrients = [
                  {
                    key: 'phytates',
                    label: t('butcher.phytates'),
                    unit: 'mg',
                    current: avoidCurrentTotals.phytates,
                    preview: avoidPreviewAmounts.phytates,
                    max: avoidLimits.phytatesMax,
                  },
                  {
                    key: 'polyphenols',
                    label: t('butcher.polyphenols'),
                    unit: 'mg',
                    current: avoidCurrentTotals.polyphenols,
                    preview: avoidPreviewAmounts.polyphenols,
                    max: avoidLimits.polyphenolsMax,
                  },
                  {
                    key: 'flavonoids',
                    label: t('butcher.flavonoids'),
                    unit: 'mg',
                    current: avoidCurrentTotals.flavonoids,
                    preview: avoidPreviewAmounts.flavonoids,
                    max: avoidLimits.flavonoidsMax,
                  },
                  {
                    key: 'oxalates',
                    label: t('butcher.oxalates'),
                    unit: 'mg',
                    current: avoidCurrentTotals.oxalates,
                    preview: avoidPreviewAmounts.oxalates,
                    max: avoidLimits.oxalatesMax,
                  },
                  {
                    key: 'lectins',
                    label: t('butcher.lectins'),
                    unit: 'mg',
                    current: avoidCurrentTotals.lectins,
                    preview: avoidPreviewAmounts.lectins,
                    max: avoidLimits.lectinsMax,
                  },
                  {
                    key: 'saponins',
                    label: t('butcher.saponins'),
                    unit: 'mg',
                    current: avoidCurrentTotals.saponins,
                    preview: avoidPreviewAmounts.saponins,
                    max: avoidLimits.saponinsMax,
                  },
                  {
                    key: 'goitrogens',
                    label: t('butcher.goitrogens'),
                    unit: 'mg',
                    current: avoidCurrentTotals.goitrogens,
                    preview: avoidPreviewAmounts.goitrogens,
                    max: avoidLimits.goitrogensMax,
                  },
                  {
                    key: 'tannins',
                    label: t('butcher.tannins'),
                    unit: 'mg',
                    current: avoidCurrentTotals.tannins,
                    preview: avoidPreviewAmounts.tannins,
                    max: avoidLimits.tanninsMax,
                  },
                ];

                // 表示する抗栄養素を決定（「もっと見る」がONの場合は全て、OFFの場合は値があるもののみ）
                const visibleAdvancedAntinutrients = showAllAntinutrients
                  ? advancedAntinutrients
                  : advancedAntinutrients.filter(
                    (antinutrient) => antinutrient.preview > 0 || antinutrient.current > 0
                  );

                // 「もっと見る」ボタンを表示する条件：抗栄養素が1つでも存在する場合
                const hasAdvancedAntinutrients = advancedAntinutrients.length > 0;

                return (
                  <div className="mt-4">
                    <h3
                      className="text-sm font-semibold text-stone-600 mb-2"
                      style={{ color: '#dc2626' }}
                    >
                      {t('butcher.avoidZone')}
                    </h3>
                    <div
                      style={{
                        maxHeight: '400px',
                        overflowY: 'auto',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 0,
                        padding: '0.5rem',
                        backgroundColor: 'transparent',
                        borderRadius: '8px',
                        border: '1px solid #fecaca',
                      }}
                    >
                      {/* 主に意識すべき避けるべきもの（常に表示） */}
                      {primaryAntinutrients.map((antinutrient) => (
                        <AvoidGauge
                          key={antinutrient.key}
                          label={antinutrient.label}
                          currentDailyTotal={antinutrient.current}
                          previewAmount={antinutrient.preview}
                          max={antinutrient.max}
                          unit={antinutrient.unit}
                        />
                      ))}

                      {/* マニアック系の抗栄養素 */}
                      {visibleAdvancedAntinutrients.map((antinutrient) => (
                        <AvoidGauge
                          key={antinutrient.key}
                          label={antinutrient.label}
                          currentDailyTotal={antinutrient.current}
                          previewAmount={antinutrient.preview}
                          max={antinutrient.max}
                          unit={antinutrient.unit}
                        />
                      ))}

                      {/* 「もっと見る」ボタン */}
                      {hasAdvancedAntinutrients && (
                        <button
                          onClick={() => setShowAllAntinutrients(!showAllAntinutrients)}
                          style={{
                            marginTop: '0.5rem',
                            padding: '0.5rem 1rem',
                            backgroundColor: showAllAntinutrients ? '#dc2626' : '#f3f4f6',
                            color: showAllAntinutrients ? 'white' : '#374151',
                            border: '1px solid #e5e7eb',
                            borderRadius: '6px',
                            fontSize: '14px',
                            fontWeight: '500',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                          }}
                        >
                          {showAllAntinutrients ? t('butcher.collapse') : t('butcher.showMore')}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })()}
          </div>
        </div>
      )}

      {/* 追加ボタンと写真アップロードボタン */}
      {onFoodAdd && (
        <div className="mt-4 space-y-3">
          {/* 写真解析ボタン */}
          {/* Photo analyze button removed as duplicate */}

          {/* 選択した食品の追加ボタン */}
          {selectedPart && selectedFoodItem && (
            <button
              onClick={handleAddFood}
              className="w-full py-4 text-white font-bold text-lg rounded-xl shadow-xl active:scale-95 transition-transform flex items-center justify-center gap-2"
              style={{ backgroundColor: '#dc2626' }}
            >
              <span>🥩</span>{' '}
              {(() => {
                const part = currentAnimal.parts.find((p) => p.id === selectedPart);
                if (!part) return '';
                const foodItem = lookupFoodMaster(selectedAnimal, part.id);
                if (!foodItem) return part.label + t('butcher.add');
                const getPartLabel = (): string => {
                  if (currentLang === 'ja') return foodItem.name_ja;
                  if (currentLang === 'fr') return foodItem.name_fr || foodItem.name;
                  if (currentLang === 'de') return foodItem.name_de || foodItem.name;
                  if (currentLang === 'zh') return foodItem.name_ja;
                  return foodItem.name;
                };
                return getPartLabel() + t('butcher.add');
              })()}
            </button>
          )}
        </div>
      )}
      {/* AI Confidence Verification Dialog */}
      {pendingVerification && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-stone-900 border border-stone-700 rounded-2xl p-6 w-full max-w-sm shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="text-center mb-6">
              <span className="text-4xl mb-2 block">🤔</span>
              <h3 className="text-xl font-bold text-white mb-2">
                これは「{pendingVerification.foodItem.item}」ですか？
              </h3>
              <p className="text-stone-400 text-sm mb-4">
                AIの自信度: {Math.round(pendingVerification.confidence * 100)}%
              </p>

              {/* Confidence Bar */}
              <div className="w-full bg-stone-800 h-2 rounded-full overflow-hidden mb-2">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${pendingVerification.confidence > 0.6 ? 'bg-rose-500' : 'bg-red-500'
                    }`}
                  style={{ width: `${pendingVerification.confidence * 100}%` }}
                />
              </div>
              <p className="text-xs text-stone-500">
                写真が不鮮明か、判断が難しい食品の可能性があります。
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => {
                  const initialQuery = pendingVerification.foodItem.item;
                  setPendingVerification(null);
                  setSearchModalQuery(initialQuery);
                  setIsSearchModalOpen(true);
                }}
                className="py-3 px-4 rounded-xl font-bold bg-stone-800 text-stone-300 hover:bg-stone-700 transition-colors"
              >
                いいえ
              </button>
              <button
                onClick={() => {
                  if (onFoodAdd) {
                    onFoodAdd(pendingVerification.foodItem);
                    if (typeof window !== 'undefined' && (window as Window & { showToast?: (msg: string) => void }).showToast) {
                      (window as Window & { showToast: (msg: string) => void }).showToast(`🥩 ${pendingVerification.foodItem.item} 追加!`);
                    }
                  }
                  setPendingVerification(null);
                }}
                className="py-3 px-4 rounded-xl font-bold bg-red-600 text-white hover:bg-red-500 transition-colors"
              >
                はい
              </button>
            </div>
          </div>
        </div>
      )}


      {/* Manual Search Modal */}
      <FoodSearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        onSelect={handleSearchSelect}
        initialQuery={searchModalQuery}
        onCreateCustom={(query) => {
          // カスタム食品画面に遷移
          window.dispatchEvent(new CustomEvent('navigateToScreen', { detail: 'customFood' }));
          // クエリをカスタム食品画面に渡す（LocalStorageまたはイベントで）
          localStorage.setItem('@carnivos:custom_food_initial_name', query);
        }}
      />
    </div>
  );
}
