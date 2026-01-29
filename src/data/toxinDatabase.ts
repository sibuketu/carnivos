/**
 * Primal Logic - Plant Toxin Database
 *
 * 植物に含まれる毒素・抗栄養素のデータベース。
 * カーニボアの視点から、植物性食品の「なぜ避けるべきか」を説明するためのデータ。
 */

export interface PlantToxin {
  name: string; // 毒素名（日本語）
  nameEn: string; // 毒素名（英語）
  description: string; // 説明
  healthEffects: string[]; // 健康への影響
  commonSources: string[]; // 主な含有食品
  bioavailabilityImpact?: string; // 栄養素の吸収率への影響
}

/**
 * 植物毒素データベース
 */
export const PLANT_TOXINS: PlantToxin[] = [
  {
    name: 'オキサレート（シュウ酸）',
    nameEn: 'Oxalate',
    description: '腎臓結石の原因となり、ミネラル（カルシウム、マグネシウム）の吸収を阻害します。',
    healthEffects: [
      '腎臓結石の形成',
      'ミネラル欠乏（カルシウム、マグネシウム）',
      '関節炎や炎症の悪化',
    ],
    commonSources: ['ほうれん草', 'ルバーブ', 'アーモンド', 'カシューナッツ', 'チョコレート'],
    bioavailabilityImpact: 'カルシウムとマグネシウムの吸収率を低下させる',
  },
  {
    name: 'フィチン酸',
    nameEn: 'Phytic Acid',
    description: 'ミネラル（鉄、亜鉛、マグネシウム）と結合し、吸収を阻害します。',
    healthEffects: ['ミネラル欠乏（鉄、亜鉛、マグネシウム）', '骨密度の低下'],
    commonSources: ['全粒穀物', '豆類', 'ナッツ類', '種子類'],
    bioavailabilityImpact: '鉄、亜鉛、マグネシウムの吸収率を著しく低下させる',
  },
  {
    name: 'レクチン',
    nameEn: 'Lectins',
    description: '腸の透過性を高め（リーキーガット）、炎症を引き起こす可能性があります。',
    healthEffects: ['リーキーガット症候群', '自己免疫疾患の悪化', '消化器系の不調'],
    commonSources: [
      '豆類（特に生の状態）',
      'ナッツ類',
      '全粒穀物',
      'ナス科の野菜（トマト、ピーマンなど）',
    ],
  },
  {
    name: 'サポニン',
    nameEn: 'Saponins',
    description: '腸の細胞膜を破壊し、炎症を引き起こす可能性があります。',
    healthEffects: ['腸の炎症', '栄養素の吸収不良'],
    commonSources: ['豆類', 'キヌア', 'オーツ麦'],
  },
  {
    name: 'ゴイトロゲン',
    nameEn: 'Goitrogens',
    description: '甲状腺のヨウ素取り込みを阻害し、甲状腺機能を低下させる可能性があります。',
    healthEffects: ['甲状腺機能低下', '代謝の低下'],
    commonSources: ['キャベツ', 'ブロッコリー', 'カリフラワー', 'ケール'],
  },
  {
    name: 'タンニン',
    nameEn: 'Tannins',
    description: 'タンパク質と結合し、消化を阻害します。鉄の吸収も阻害します。',
    healthEffects: ['タンパク質の消化不良', '鉄欠乏'],
    commonSources: ['お茶', 'コーヒー', 'ワイン', '豆類'],
    bioavailabilityImpact: '鉄の吸収率を低下させる',
  },
];

/**
 * 特定の食品に含まれる毒素を検索
 */
export function getToxinsByFood(foodName: string): PlantToxin[] {
  return PLANT_TOXINS.filter((toxin) =>
    toxin.commonSources.some(
      (source) =>
        source.toLowerCase().includes(foodName.toLowerCase()) ||
        foodName.toLowerCase().includes(source.toLowerCase())
    )
  );
}

/**
 * 特定の毒素の詳細を取得
 */
export function getToxinByName(name: string): PlantToxin | undefined {
  return PLANT_TOXINS.find(
    (toxin) => toxin.name === name || toxin.nameEn.toLowerCase() === name.toLowerCase()
  );
}
