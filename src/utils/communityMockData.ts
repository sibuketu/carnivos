/**
 * Community Mock Data - コミュニティのデバッグ用モックデータ
 */

export interface CommunityInsight {
  id: string;
  title: string;
  description: string;
  stat: string;
  category: 'nutrition' | 'recovery' | 'symptom';
}

export interface CommunityPattern {
  id: string;
  pattern: string;
  description: string;
  percentage: number;
  sampleSize: number;
}

export const mockCommunityInsights: CommunityInsight[] = [
  {
    id: '1',
    title: '下痢の改善',
    description: '下痢を経験したユーザーの80%が、塩分を増やすことで3日以内に改善',
    stat: '80%',
    category: 'symptom',
  },
  {
    id: '2',
    title: '便秘の改善',
    description: '便秘を経験したユーザーの75%が、マグネシウムを600mg以上摂取することで改善',
    stat: '75%',
    category: 'symptom',
  },
  {
    id: '3',
    title: '違反からの回復',
    description: '違反後、16時間ファスティングを実施したユーザーの90%が1日以内に回復',
    stat: '90%',
    category: 'recovery',
  },
  {
    id: '4',
    title: 'タンパク質摂取量',
    description: 'コミュニティ全体の平均タンパク質摂取量は120g/日',
    stat: '120g/日',
    category: 'nutrition',
  },
  {
    id: '5',
    title: '頭痛の改善',
    description: '頭痛を経験したユーザーの70%が、ナトリウムを5000mg以上摂取することで改善',
    stat: '70%',
    category: 'symptom',
  },
];

export const mockCommunityPatterns: CommunityPattern[] = [
  {
    id: '1',
    pattern: '下痢 → 塩分増加',
    description: '下痢を経験した人の80%が、塩分を増やすことで3日以内に改善',
    percentage: 80,
    sampleSize: 1250,
  },
  {
    id: '2',
    pattern: '便秘 → マグネシウム増加',
    description: '便秘を経験した人の75%が、マグネシウムを600mg以上摂取することで改善',
    percentage: 75,
    sampleSize: 980,
  },
  {
    id: '3',
    pattern: '頭痛 → ナトリウム増加',
    description: '頭痛を経験した人の70%が、ナトリウムを5000mg以上摂取することで改善',
    percentage: 70,
    sampleSize: 650,
  },
  {
    id: '4',
    pattern: '違反 → 16時間ファスティング',
    description: '違反後、16時間ファスティングを実施した人の90%が1日以内に回復',
    percentage: 90,
    sampleSize: 2100,
  },
  {
    id: '5',
    pattern: 'こむら返り → マグネシウム増加',
    description: 'こむら返りを経験した人の85%が、マグネシウムを増やすことで改善',
    percentage: 85,
    sampleSize: 420,
  },
];
