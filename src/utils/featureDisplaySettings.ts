/**
 * Primal Logic - Feature Display Settings
 *
 * あらゆる機能の表示/非表示を管理するユーティリティ
 * デフォルトは全部表示（ON）
 */

import { logError } from './errorHandler';

export type FeatureKey =
  // 画面要素
  | 'streakDisplay' // ストリーク表示
  | 'phaseDisplay' // Phase表示
  // Phase 1 related keys removed
  | 'pfRatioGauge' // P:F比率ゲージ
  | 'omegaRatioGauge' // オメガ比率ゲージ
  | 'calciumPhosphorusRatioGauge' // カルシウム:リン比率ゲージ
  | 'glycineMethionineRatioGauge' // グリシン:メチオニン比率ゲージ
  | 'argumentCard' // 根拠カード（栄養タップ時の説明）
  | 'recoveryProtocol' // 回復プロトコル
  | 'myFoodsTab' // 「いつもの」タブ
  | 'historyTab' // 履歴タブ
  | 'aiSpeedDial' // AI Speed Dial
  | 'photoUpload' // 写真アップロード
  | 'avoidZone' // Avoid Zone（植物性食品警告）
  // 分析機能
  | 'nutrientTrendGraph' // 栄養素トレンドグラフ
  | 'weeklySummary' // 週間サマリー
  | 'monthlySummary' // 月間サマリー
  | 'statisticsCard' // 統計カード
  // 通知設定
  | 'electrolyteAlert' // 電解質アラート
  | 'fatDeficiencyReminder' // 脂質不足リマインダー
  | 'streakReminder' // ストリークリマインダー
  // その他
  | 'debugMode' // デバッグモード
  | 'customFoodRegistration' // カスタム食品登録
  | 'bodyCompositionSettings' // 体組成設定
  | 'metabolicStressIndicators' // 代謝ストレス指標
  | 'nutrientTargetCustomization' // 栄養素目標値のカスタマイズ
  | 'diary' // 日記
  | 'gift' // ギフト
  | 'shop' // ショップ
  // 非表示基本の機能（今は見せない）
  | 'recipeScreen' // レシピ画面
  | 'photoAnalysisModal'; // 写真分析モーダル

export interface FeatureDisplayConfig {
  key: FeatureKey;
  label: string;
  category: 'screenElement' | 'analysis' | 'notification' | 'other';
  defaultVisible: boolean; // デフォルトは全部表示
  description?: string;
}

/**
 * 全機能の表示設定（デフォルト全部表示）
 */
export const ALL_FEATURE_DISPLAY_CONFIGS: FeatureDisplayConfig[] = [
  // 画面要素
  {
    key: 'streakDisplay',
    label: 'ストリーク表示',
    category: 'screenElement',
    defaultVisible: true,
    description: '連続日数の表示',
  },
  {
    key: 'phaseDisplay',
    label: 'Phase表示',
    category: 'screenElement',
    defaultVisible: true,
    description: '現在のPhase（Rookie, Carnivore, Hunter等）',
  },
  // Phase 1 config removed
  {
    key: 'pfRatioGauge',
    label: 'P:F比率ゲージ',
    category: 'screenElement',
    defaultVisible: true,
    description: 'タンパク質:脂質の達成率',
  },
  {
    key: 'omegaRatioGauge',
    label: 'オメガ比率ゲージ',
    category: 'screenElement',
    defaultVisible: true,
    description: 'オメガ3/6比率',
  },
  {
    key: 'calciumPhosphorusRatioGauge',
    label: 'カルシウム:リン比率ゲージ',
    category: 'screenElement',
    defaultVisible: true,
    description: 'カルシウム:リン比率',
  },
  {
    key: 'glycineMethionineRatioGauge',
    label: 'グリシン:メチオニン比率ゲージ',
    category: 'screenElement',
    defaultVisible: true,
    description: 'グリシン:メチオニン比率',
  },
  {
    key: 'argumentCard',
    label: '根拠カード',
    category: 'screenElement',
    defaultVisible: true,
    description: '栄養素をタップした時の理論説明',
  },
  {
    key: 'recoveryProtocol',
    label: '回復プロトコル',
    category: 'screenElement',
    defaultVisible: true,
    description: '違反時の回復プロトコル',
  },
  {
    key: 'myFoodsTab',
    label: '「いつもの」タブ',
    category: 'screenElement',
    defaultVisible: true,
    description: 'よく使う食品のタブ',
  },
  {
    key: 'historyTab',
    label: '履歴タブ',
    category: 'screenElement',
    defaultVisible: true,
    description: '過去のログ履歴',
  },
  {
    key: 'aiSpeedDial',
    label: 'AI Speed Dial',
    category: 'screenElement',
    defaultVisible: true,
    description: 'AIチャット・写真・音声入力',
  },
  {
    key: 'photoUpload',
    label: '写真アップロード',
    category: 'screenElement',
    defaultVisible: true,
    description: '写真から食品を登録',
  },
  {
    key: 'avoidZone',
    label: 'Avoid Zone',
    category: 'screenElement',
    defaultVisible: true,
    description: '植物性食品・抗栄養素の警告表示',
  },

  // 分析機能
  {
    key: 'nutrientTrendGraph',
    label: '栄養素トレンドグラフ',
    category: 'analysis',
    defaultVisible: true,
    description: '栄養素の推移グラフ',
  },
  {
    key: 'weeklySummary',
    label: '週間サマリー',
    category: 'analysis',
    defaultVisible: true,
    description: '週間の統計サマリー',
  },
  {
    key: 'monthlySummary',
    label: '月間サマリー',
    category: 'analysis',
    defaultVisible: true,
    description: '月間の統計サマリー',
  },
  {
    key: 'statisticsCard',
    label: '統計カード',
    category: 'analysis',
    defaultVisible: true,
    description: '記録日数、違反なし日数等',
  },

  // 通知設定
  {
    key: 'electrolyteAlert',
    label: '電解質アラート',
    category: 'notification',
    defaultVisible: true,
    description: 'Na/K/Mgのバランス崩れ通知',
  },
  {
    key: 'fatDeficiencyReminder',
    label: '脂質不足リマインダー',
    category: 'notification',
    defaultVisible: true,
    description: '夕方18時時点で脂質不足の場合の通知',
  },
  {
    key: 'streakReminder',
    label: 'ストリークリマインダー',
    category: 'notification',
    defaultVisible: true,
    description: 'ストリーク継続のリマインダー',
  },

  // その他
  {
    key: 'debugMode',
    label: 'デバッグモード',
    category: 'other',
    defaultVisible: true,
    description: 'デバッグ用ダミーデータ表示',
  },
  {
    key: 'customFoodRegistration',
    label: 'カスタム食品登録',
    category: 'other',
    defaultVisible: true,
    description: 'ユーザー定義食品の登録',
  },
  {
    key: 'bodyCompositionSettings',
    label: '体組成設定',
    category: 'other',
    defaultVisible: true,
    description: 'LBMベースのタンパク質計算',
  },
  {
    key: 'metabolicStressIndicators',
    label: '代謝ストレス指標',
    category: 'other',
    defaultVisible: true,
    description: '朝起きるのが辛い等のチェック',
  },
  {
    key: 'nutrientTargetCustomization',
    label: '栄養素目標値のカスタマイズ',
    category: 'other',
    defaultVisible: true,
    description: '栄養素目標値の手動設定',
  },
  {
    key: 'diary',
    label: '日記',
    category: 'other',
    defaultVisible: true,
    description: '日々の記録',
  },
  {
    key: 'gift',
    label: 'ギフト',
    category: 'other',
    defaultVisible: true,
    description: 'ギフト機能',
  },
  {
    key: 'shop',
    label: 'ショップ',
    category: 'other',
    defaultVisible: true,
    description: 'ショップ機能',
  },
  // 非表示基本の機能（今は見せない）
  {
    key: 'recipeScreen',
    label: 'レシピ画面',
    category: 'other',
    defaultVisible: false,
    description: 'レシピ機能（今は非表示）',
  },
  {
    key: 'photoAnalysisModal',
    label: '写真分析モーダル',
    category: 'other',
    defaultVisible: false,
    description: 'AI写真分析機能（今は非表示）',
  },
];

const STORAGE_KEY = 'primal_logic_feature_display_settings';
const FEEDBACK_CONTRIBUTOR_KEY = 'primal_logic_feedback_contributor'; // #35

/**
 * バグ報告・機能提案をしたユーザーか（#35 フィードバックご褒美）
 */
export function isFeedbackContributor(): boolean {
  try {
    return localStorage.getItem(FEEDBACK_CONTRIBUTOR_KEY) === 'true';
  } catch {
    return false;
  }
}

/**
 * フィードバック貢献者フラグを設定（FeedbackScreenから呼ぶ）
 */
export function setFeedbackContributor(): void {
  try {
    localStorage.setItem(FEEDBACK_CONTRIBUTOR_KEY, 'true');
  } catch {
    // ignore
  }
}

/**
 * 機能の表示設定を取得（デフォルトは全部表示）
 */
export function getFeatureDisplaySettings(): Record<FeatureKey, boolean> {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    // デフォルトは全部表示
    const defaults = {} as Record<FeatureKey, boolean>;
    ALL_FEATURE_DISPLAY_CONFIGS.forEach((config) => {
      defaults[config.key] = config.defaultVisible;
    });

    if (saved) {
      const parsed = JSON.parse(saved);
      const merged = { ...defaults, ...parsed };
      // #35: フィードバック貢献者はレシピ・写真分析モーダルを先行開放
      if (isFeedbackContributor()) {
        merged.recipeScreen = merged.recipeScreen ?? true;
        merged.photoAnalysisModal = merged.photoAnalysisModal ?? true;
      }
      return merged;
    }

    const result = { ...defaults };
    if (isFeedbackContributor()) {
      result.recipeScreen = true;
      result.photoAnalysisModal = true;
    }
    return result;
  } catch (error) {
    logError(error, { component: 'featureDisplaySettings', action: 'getFeatureDisplaySettings' });
    // エラー時もデフォルトは全部表示
    const defaults = {} as Record<FeatureKey, boolean>;
    ALL_FEATURE_DISPLAY_CONFIGS.forEach((config) => {
      defaults[config.key] = config.defaultVisible;
    });
    return defaults;
  }
}

/**
 * 機能の表示設定を保存
 */
export function saveFeatureDisplaySettings(settings: Record<FeatureKey, boolean>): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (error) {
    logError(error, { component: 'featureDisplaySettings', action: 'saveFeatureDisplaySettings' });
  }
}

/**
 * 特定の機能の表示/非表示を切り替え
 */
export function toggleFeatureVisibility(key: FeatureKey): void {
  const settings = getFeatureDisplaySettings();
  settings[key] = !settings[key];
  saveFeatureDisplaySettings(settings);
}

/**
 * カテゴリごとに表示/非表示を切り替え
 */
export function toggleCategoryVisibility(
  category: FeatureDisplayConfig['category'],
  visible: boolean
): void {
  const settings = getFeatureDisplaySettings();
  ALL_FEATURE_DISPLAY_CONFIGS.filter((config) => config.category === category).forEach((config) => {
    settings[config.key] = visible;
  });
  saveFeatureDisplaySettings(settings);
}

/**
 * 全ての機能を表示/非表示
 */
export function setAllFeaturesVisible(visible: boolean): void {
  const settings = {} as Record<FeatureKey, boolean>;
  ALL_FEATURE_DISPLAY_CONFIGS.forEach((config) => {
    settings[config.key] = visible;
  });
  saveFeatureDisplaySettings(settings);
}
