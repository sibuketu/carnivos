/**
 * CarnivOS - Remedy Logic (トラブルシューティング)
 *
 * カーニボア実践中に起こりうる問題とその対処法を定義します。
 *
 * Research Basis: Dr. Steven Gundry (The Plant Paradox) & Carnivore Diet Logic
 */

export interface PlantToxin {
  name: string;
  nameEn: string;
  category: string;
  foods: string[];
  toxins: string[];
  effects: string[];
  riskLevel: 'low' | 'medium' | 'high';
  carnivoreAlternative: string;
}

export interface RemedyItem {
  symptom: string;
  possibleCauses: string[];
  remedies: string[];
  logic: string;
}

/**
 * 植物性抗栄養素（植物毒）データベース
 *
 * このデータベースは、「健康に良い」と一般的に信じられているが、
 * 実際には抗栄養素や毒素を含み、炎症、腸内環境の悪化、栄養吸収阻害を
 * 引き起こす可能性のある植物性食品をリスト化したものです。
 */
export const PLANT_TOXIN_DATABASE: PlantToxin[] = [
  {
    name: 'ほうれん草',
    nameEn: 'Spinach',
    category: '葉物野菜',
    foods: ['ほうれん草', 'スイスチャード', 'ビートの葉'],
    toxins: ['Oxalates(シュウ酸)'],
    effects: [
      'カルシウムと結合し、体内で鋭利な結晶を形成',
      '腎結石、関節痛、外陰部痛、全身の炎症を引き起こす',
      '鉄分の吸収も阻害する',
    ],
    riskLevel: 'high',
    carnivoreAlternative: 'レバー(生物学的利用能の高い本物の栄養素)',
  },
  {
    name: 'アーモンド',
    nameEn: 'Almonds',
    category: 'ナッツ類',
    foods: ['アーモンド', 'カシューナッツ', 'ピーナッツ'],
    toxins: ['Lectins(レクチン)', 'Phytates(フィチン酸)'],
    effects: [
      'レクチン: 腸壁を攻撃し、リーキーガット（腸管壁浸漏）を引き起こす',
      'フィチン酸: 亜鉛、マグネシウム、カルシウム等の重要ミネラルの吸収をブロックする',
      '※皮に最も多くの毒素が含まれる',
    ],
    riskLevel: 'high',
    carnivoreAlternative: '動物性脂肪(バター、牛脂、ラード)',
  },
  {
    name: '大豆',
    nameEn: 'Soybeans',
    category: '豆類',
    foods: ['大豆', 'インゲン豆', 'レンズ豆'],
    toxins: ['Lectins(特にWGA/PHA)', 'Phytates'],
    effects: [
      '強力なレクチンが腸の微絨毛を破壊し、自己免疫疾患の引き金となる',
      'タンパク質の消化を阻害する酵素阻害物質も含む',
      'エストロゲン様作用（大豆）によるホルモン撹乱',
    ],
    riskLevel: 'high',
    carnivoreAlternative: '赤身肉 (反芻動物)(完全なアミノ酸スコアとヘム鉄)',
  },
  {
    name: 'トマト',
    nameEn: 'Tomato',
    category: 'ナス科',
    foods: ['トマト (皮/種)', '唐辛子', 'ジャガイモ', 'ナス'],
    toxins: ['Lectins', 'Solanine(ソラニン)'],
    effects: [
      'レクチン: 関節軟骨に結合しやすく、関節炎や痛みの原因となる',
      'ソラニン: 神経毒の一種であり、炎症反応を増悪させる',
      '※「イタリア人はトマトの皮と種を取り除いて食べる」のが伝統',
    ],
    riskLevel: 'medium',
    carnivoreAlternative: '卵黄(コリンと脂溶性ビタミン)',
  },
  {
    name: '全粒小麦',
    nameEn: 'Whole Wheat',
    category: '穀物',
    foods: ['全粒小麦', '玄米', 'オートミール'],
    toxins: ['WGA (小麦胚芽レクチン)', 'Phytates', 'Gluten'],
    effects: [
      'WGA: インスリンの挙動を模倣し、代謝を混乱させる。血管内皮を傷つける',
      'フィチン酸: ミネラル欠乏症の原因',
      '繊維質が腸を物理的に傷つける',
    ],
    riskLevel: 'high',
    carnivoreAlternative: '骨付き肉・ボーンブロス(グリシンとコラーゲンによる腸の修復)',
  },
  {
    name: 'ケール',
    nameEn: 'Kale',
    category: 'アブラナ科',
    foods: ['ケール', 'ブロッコリー', 'キャベツ'],
    toxins: ['Goitrogens(ゴイトロゲン)'],
    effects: [
      '甲状腺によるヨウ素の取り込みを阻害し、甲状腺機能を低下させる（代謝低下、疲労）',
      'ラフィノース（難消化性糖類）によるガス・膨満感',
    ],
    riskLevel: 'medium',
    carnivoreAlternative: 'シーフード(天然のヨウ素源)',
  },
  {
    name: 'チアシード',
    nameEn: 'Chia Seeds',
    category: '種子類',
    foods: ['チアシード', 'パンプキンシード', 'ヒマワリの種'],
    toxins: ['Lectins', 'Phytates', 'Omega-6'],
    effects: [
      '植物にとって「次世代の命」である種子は最も防御（毒性）が強い',
      '過剰なオメガ6脂肪酸（リノール酸）による炎症促進',
      'エストロゲン様作用',
    ],
    riskLevel: 'medium',
    carnivoreAlternative: '魚卵 (イクラ等)(DHA/EPAが豊富な「動物の種」)',
  },
];

/**
 * 用語解説 (Mechanism Summary)
 */
export const TOXIN_MECHANISMS = {
  oxalates: {
    name: 'Oxalates (シュウ酸)',
    description:
      '植物が捕食者から身を守るための「ガラスの破片」のような微細な結晶。加熱しても完全には分解されない。',
  },
  lectins: {
    name: 'Lectins (レクチン)',
    description:
      '糖結合タンパク質。腸のバリア機能を破壊し（リーキーガット）、血中に侵入して全身の炎症や自己免疫反応を引き起こす。',
  },
  phytates: {
    name: 'Phytates (フィチン酸)',
    description:
      '「抗栄養素」の代表格。ミネラル（特に亜鉛、鉄、マグネシウム）と結合し、人体への吸収を不可逆的に阻害する。',
  },
  goitrogens: {
    name: 'Goitrogens (ゴイトロゲン)',
    description: '甲状腺腫誘発物質。代謝の要である甲状腺ホルモンの生成を妨げる。',
  },
};

/**
 * トラブルシューティング: よくある症状と対処法
 */
export const REMEDY_LOGIC: RemedyItem[] = [
  {
    symptom: '便秘',
    possibleCauses: ['マグネシウム不足', '水分不足', '食物繊維の過剰摂取（移行期）'],
    remedies: [
      'マグネシウムサプリメント（600mg/日）',
      '水分と塩分の十分な摂取',
      '食物繊維を完全に除去',
    ],
    logic:
      '食物繊維は腸の刺激物であり、除去することで便秘が解消される（Ho et al., 2012）。マグネシウムは腸の水分保持を助ける。',
  },
  {
    symptom: 'こむら返り',
    possibleCauses: ['マグネシウム不足', 'カリウム不足', 'ナトリウム不足'],
    remedies: [
      'マグネシウムサプリメント',
      '肉汁を捨てずに摂取（カリウム）',
      '塩分の積極的摂取（5000-8000mg/日）',
    ],
    logic: '電解質バランスが重要。カーニボアではナトリウム排出が加速するため、積極的な補充が必要。',
  },
  {
    symptom: 'ケトフル（頭痛、疲労）',
    possibleCauses: ['ナトリウム不足', 'マグネシウム不足', '水分不足'],
    remedies: [
      '塩水を飲む（1リットルの水に5-8gの塩）',
      'マグネシウムサプリメント',
      '十分な水分摂取',
    ],
    logic:
      '低インスリン状態では腎臓からのナトリウム排出が加速するため、高用量のナトリウムが必要（Dr. Ken Berry）。',
  },
  {
    symptom: '関節痛',
    possibleCauses: ['レクチンを含む植物の摂取（移行期）', 'オキサレートの蓄積'],
    remedies: ['すべての植物を除去', '十分な水分摂取でオキサレートを排出'],
    logic: 'レクチンは関節軟骨に結合しやすく、炎症を引き起こす。完全な除去が必要。',
  },
];

/**
 * 特定の食品に含まれる毒素を検索
 */
export function getToxinsByFood(foodName: string): PlantToxin[] {
  return PLANT_TOXIN_DATABASE.filter((toxin) =>
    toxin.foods.some(
      (food) =>
        food.toLowerCase().includes(foodName.toLowerCase()) ||
        foodName.toLowerCase().includes(food.toLowerCase())
    )
  );
}

/**
 * 特定の毒素の詳細を取得
 */
export function getToxinByName(name: string): PlantToxin | undefined {
  return PLANT_TOXIN_DATABASE.find(
    (toxin) => toxin.name === name || toxin.nameEn.toLowerCase() === name.toLowerCase()
  );
}

/**
 * 症状から対処法を検索
 */
export function getRemedyBySymptom(symptom: string): RemedyItem | undefined {
  return REMEDY_LOGIC.find(
    (item) =>
      item.symptom.toLowerCase().includes(symptom.toLowerCase()) ||
      symptom.toLowerCase().includes(item.symptom.toLowerCase())
  );
}

/**
 * CarnivOS - Adaptation Phases (代謝フェーズ)
 *
 * カーニボア移行における代謝適応の段階を定義します。
 * ユーザーが現在どの段階にいるかを判定するために使用します。
 */
export interface AdaptationPhase {
  id: string;
  name: string;
  nameEn: string;
  duration: string; // 例: "1-2週間", "2-4週間"
  description: string;
  symptoms: string[]; // このフェーズでよく見られる症状
  metabolicState: string; // 代謝状態の説明
  recommendations: string[]; // このフェーズでの推奨事項
  nextPhase?: string; // 次のフェーズのID
}

/**
 * 代謝適応フェーズのデータベース
 *
 * カーニボア移行における典型的な代謝適応の段階を定義します。
 * 各フェーズは、ユーザーの移行開始からの経過時間と症状に基づいて判定されます。
 */
export const ADAPTATION_PHASES: AdaptationPhase[] = [
  // データは後で追加される予定
  // 現時点では空配列として定義
];
