/**
 * CarnivOS - Argument Cards Database
 *
 * 論破カードのネタ帳: 3-tier情報表示用のコンテンツ
 * 技術仕様書: @Primal_Logic_Technical_Spec.md 参照
 */

export interface ArgumentCard {
  topic: string;
  nutrient?: string; // Associated nutrient (for gauge tap)
  level1: string; // Glance: Short statement
  level2: string; // Explanation: Detailed explanation
  level3: string; // Source: Citations and references
  verdict: 'trash' | 'sufficient' | 'precious' | 'safe';
  emoji: string;
}

export const ARGUMENT_CARDS: Record<string, ArgumentCard> = {
  fiber: {
    topic: 'Fiber (食物繊維)',
    nutrient: 'fiber',
    level1: 'Fiber is unnecessary.',
    level2:
      'Fiber is a non-digestible irritant. Fiber causes gut traffic jams. Removing it resolves constipation (100% cure rate in studies).',
    level3:
      'Source: Dr. Paul Mason (2012), Ho et al. "Stopping or reducing dietary fiber reduces constipation and its associated symptoms."',
    verdict: 'trash',
    emoji: '🗑️',
  },
  vitaminC: {
    topic: 'Vitamin C (ビタミンC)',
    nutrient: 'vitaminC',
    level1: 'Meat has C, and you need less without sugar.',
    level2:
      'Glucose-Ascorbate Antagonism: In the absence of glucose (Ketosis), Vitamin C requirements drop drastically (approx. 10mg/day is sufficient). A bus with no passengers (glucose) lets the driver (Vit C) on easily.',
    level3:
      'Source: Glucose-Ascorbate Antagonism Theory / Stefansson\'s Bellevue Experiment. Amber O\'Hearn - "Vitamin C requirements in ketosis."',
    verdict: 'sufficient',
    emoji: '✅',
  },
  saturatedFat: {
    topic: 'Saturated Fat (飽和脂肪酸)',
    nutrient: 'fat',
    level1: 'Fat is stable structural fuel. Inflammation causes the clog.',
    level2:
      'Fat does not clog arteries. Inflammation causes the clog. Blaming the firefighters (Cholesterol) for the fire (Inflammation).',
    level3:
      'Source: Dr. Paul Mason - "LDL is an energy carrier." Cholesterol is essential for brain function and hormone production.',
    verdict: 'precious',
    emoji: '💎',
  },
  redMeatCancer: {
    topic: 'Red Meat & Cancer (赤肉と癌)',
    nutrient: 'protein',
    level1: "Healthy User Bias. Studies didn't separate burger buns/fries from the meat.",
    level2:
      'Observational studies against meat are invalid due to "Healthy User Bias" and poor data (FFQ). Blaming the passenger (Meat) for the drunk driver\'s (Sugar/Smoking) crash.',
    level3:
      'Source: Dr. Ken Berry - "Lies My Doctor Told Me." Epidemiological studies conflate processed meats with whole meats.',
    verdict: 'safe',
    emoji: '🛡️',
  },
  iron: {
    topic: 'Iron (鉄)',
    nutrient: 'iron',
    level1: 'Heme iron from meat is far superior to plant iron.',
    level2:
      'Heme iron (from meat) has high absorption and is unaffected by chelators. Non-heme iron (from plants) is blocked by phytates and polyphenols, with only ~10% bioavailability.',
    level3:
      'Source: Nutritional Biochemistry research. Heme iron absorption: ~25-30%. Non-heme iron absorption: ~2-10% (depending on inhibitors).',
    verdict: 'precious',
    emoji: '💎',
  },
  vitaminK: {
    topic: 'Vitamin K (ビタミンK)',
    nutrient: 'vitaminK',
    level1: 'MK-4 from animal sources is the bioactive form.',
    level2:
      'Vitamin K1 from plants is poorly converted to active MK-4 (only ~10% conversion). Animal sources provide MK-4 directly, which is 100% bioavailable.',
    level3:
      'Source: Vitamin K metabolism research. MK-4 is the primary form used by the body for bone and cardiovascular health.',
    verdict: 'precious',
    emoji: '💎',
  },
  sodium: {
    topic: 'Sodium (ナトリウム)',
    nutrient: 'sodium',
    level1: 'Low insulin (Carnivore) = High sodium excretion.',
    level2:
      'In ketosis/carnivore diet, insulin is low, leading to increased sodium excretion (Natriuresis of Fasting). Higher sodium intake (5000mg+) is optimal to prevent "Keto Flu" and headaches.',
    level3:
      'Source: Dr. DiNicolantonio - "The Salt Fix." Low insulin states require higher sodium intake for optimal function.',
    verdict: 'precious',
    emoji: '💎',
  },
};

/**
 * Get argument card by nutrient name
 */
export function getArgumentCardByNutrient(nutrient: string): ArgumentCard | null {
  const card = Object.values(ARGUMENT_CARDS).find((c) => c.nutrient === nutrient);
  return card || null;
}

/**
 * Get argument card by topic
 */
export function getArgumentCardByTopic(topic: string): ArgumentCard | null {
  return ARGUMENT_CARDS[topic] || null;
}

/**
 * Get all argument cards
 */
export function getAllArgumentCards(): ArgumentCard[] {
  return Object.values(ARGUMENT_CARDS);
}
