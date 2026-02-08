/**
 * トロフィー一覧（10個）
 * ラベリング形式でユーザーのアイデンティティを強化
 */

import type { Trophy } from '../types/trophy';

export const TROPHIES: Trophy[] = [
  {
    id: 'hunter',
    title: '🦁 ハンター',
    label: 'あなたは本能に従う人',
    description: '初めて食品を追加',
    hint: 'ホーム画面の動物を選んで部位をタップ',
    condition: { type: 'count', target: 1 },
    unlocked: false,
  },
  {
    id: 'scientist',
    title: '🔬 科学者',
    label: 'あなたは探求する人',
    description: '栄養ゲージ💡を5回タップ',
    hint: '各栄養素の右側にある💡アイコンをタップ',
    condition: { type: 'count', target: 5 },
    unlocked: false,
  },
  {
    id: 'perfectionist',
    title: '🎯 完璧主義者',
    label: 'あなたは徹底する人',
    description: '全栄養素100%達成',
    hint: '全ての栄養素を目標値まで摂取',
    condition: { type: 'threshold', target: 100 },
    unlocked: false,
  },
  {
    id: 'persistent',
    title: '🔥 努力家',
    label: 'あなたは継続する人',
    description: '3日連続で記録',
    hint: '毎日食品を追加して記録を継続',
    condition: { type: 'streak', target: 3 },
    unlocked: false,
  },
  {
    id: 'true_self',
    title: '🌟 本来の自分',
    label: 'あなたは本来の姿を取り戻した',
    description: '完全カーニボア7日達成',
    hint: '7日間、動物性食品のみで過ごす',
    condition: { type: 'streak', target: 7 },
    unlocked: false,
  },
  {
    id: 'recorder',
    title: '📸 記録家',
    label: 'あなたはデータを愛する人',
    description: '写真解析を3回使用',
    hint: 'ホーム画面下部の「📸 写真から食品を追加」をタップ',
    condition: { type: 'count', target: 3 },
    unlocked: false,
  },
  {
    id: 'learner',
    title: '💬 相談者',
    label: 'あなたは学び続ける人',
    description: 'AIチャットで5回質問',
    hint: 'ホーム画面下部の入力欄で質問を送信',
    condition: { type: 'count', target: 5 },
    unlocked: false,
  },
  {
    id: 'scholar',
    title: '📖 知識人',
    label: 'あなたは知識を求める人',
    description: 'Tips20個読む',
    hint: '下部ナビの「💡 Tips」タブでカードをタップ',
    condition: { type: 'count', target: 20 },
    unlocked: false,
  },
  {
    id: 'reflector',
    title: '✍️ 内省家',
    label: 'あなたは自己を見つめる人',
    description: 'Diaryに3回書き込み',
    hint: '下部ナビの「📔 Diary」タブで日記を記録',
    condition: { type: 'count', target: 3 },
    unlocked: false,
  },
  {
    id: 'master',
    title: '⚡ マスター',
    label: 'あなたは真のカーニボア',
    description: '全トロフィー獲得',
    hint: '他の9つのトロフィーを全て達成',
    condition: { type: 'count', target: 9 },
    unlocked: false,
  },
];

/**
 * トロフィーIDでトロフィーを取得
 */
export function getTrophyById(id: string): Trophy | undefined {
  return TROPHIES.find((trophy) => trophy.id === id);
}

/**
 * 全てのトロフィーを取得
 */
export function getAllTrophies(): Trophy[] {
  return TROPHIES;
}
