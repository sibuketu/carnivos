/**
 * Primal Logic - Knowledge Base (Tips用データ)
 *
 * カーニボアダイエットに関する一般的な誤解（Myth）と科学的真実（Truth）を定義します。
 * これにより、ユーザーは「なぜカーニボアが正しいのか」を論理的に説明できるようになります。
 *
 * A robust collection of scientific arguments to debunk common Carnivore Diet criticisms.
 */

export interface KnowledgeItem {
  id: string;
  category:
    | 'Digestion'
    | 'Heart Health'
    | 'Cancer'
    | 'Micronutrients'
    | 'Long-term Health'
    | 'Nutrition'
    | 'Other';
  myth: string;
  truth: string;
  mechanism: string;
  source: string;
  effectSize: string; // Effect size context for statistical significance
  // 後方互換性のためのオプショナルフィールド
  title?: string; // 旧データ構造との互換性
  details?: string; // 旧データ構造との互換性
}

export const KNOWLEDGE_BASE: KnowledgeItem[] = [
  {
    id: 'fiber-constipation',
    category: 'Digestion',
    myth: 'Fiber is essential for healthy bowel movements and preventing constipation.',
    truth:
      'Fiber acts as a mechanical irritant. Removing it completely can cure idiopathic constipation.',
    mechanism:
      'Fiber increases stool bulk, which adds mechanical load to the colon. In patients with slow transit or pelvic floor dyssynergia, this extra bulk exacerbates the inability to evacuate. Removing fiber eliminates the bulk, allowing the gut to rest and function naturally without "traffic jams".',
    source:
      'Ho KS et al., "Stopping or reducing dietary fiber intake reduces constipation and its associated symptoms", World Journal of Gastroenterology (2012).',
    effectSize:
      '100% efficacy. In the study, 41 patients who stopped fiber completely had 100% resolution of constipation, bloating, and bleeding. Those who continued high fiber saw 0% improvement.',
  },
  {
    id: 'ldl-heart-disease',
    category: 'Heart Health',
    myth: 'High LDL cholesterol caused by red meat leads to atherosclerosis and heart disease.',
    truth:
      'LDL concentration alone is a poor predictor of CVD. In the context of low Triglycerides and high HDL (Lean Mass Hyper-Responder), high LDL is energy delivery, not pathology.',
    mechanism:
      'The "Lipid Energy Model" suggests that in a carbohydrate-restricted state, the liver exports VLDL (energy) which remodels to LDL. Unlike "Pattern B" small dense LDL (caused by insulin resistance/sugar) which penetrates arterial walls, large buoyant "Pattern A" LDL observed in carnivores is resistant to oxidation and atherogenesis.',
    source:
      'Diamond & O\'Kelly (2022) "The Lipid Energy Model"; O\'Kelly et al. (2024) - UCLA/Lundquist Institute Match Study (Preliminary Data).',
    effectSize:
      'Risk stratification fails: Studies show that high LDL with optimal metabolic markers (High HDL, Low Tg) often results in a Hazard Ratio (HR) of ~1.0 (no increased risk), compared to HR >2.0 for insulin resistant phenotypes.',
  },
  {
    id: 'red-meat-cancer',
    category: 'Cancer',
    myth: 'Red meat is a Class 2A carcinogen that causes colorectal cancer.',
    truth:
      'The WHO classification relies on weak epidemiology riddled with "Healthy User Bias", not clinical trials.',
    mechanism:
      'Observational studies rarely separate "burger eaters" (meat + bun + seed oils + soda) from healthy meat eaters. The mechanism often cited (heme iron/N-nitroso compounds) is nullified by the presence of other nutrients in whole meat and the absence of gut-damaging inflammatory refined carbs.',
    source: 'WHO/IARC 2015 Report; critique by Dr. David Klurfeld (IARC working group member).',
    effectSize:
      'Negligible relative risk. The reported Hazard Ratio is roughly 1.17 (17-18% relative increase). In epidemiology, an HR < 2.0 is generally considered "noise" or potential confounding, unlike smoking which has an HR of 10-30.',
  },
  {
    id: 'vitamin-c-scurvy',
    category: 'Micronutrients',
    myth: 'You will get scurvy without fruit and vegetables (Vitamin C).',
    truth: 'Vitamin C requirements drop drastically in the absence of dietary glucose.',
    mechanism:
      'Glucose and Vitamin C (Ascorbic Acid) compete for entry into cells via the same GLUT-1 receptors (Glucose-Ascorbate Antagonism). In ketosis, low blood glucose allows Vitamin C to be transported efficiently. Furthermore, hydroxyproline/glutathione sparing reduces total demand. Fresh meat also contains sufficient Vitamin C to prevent scurvy.',
    source: 'Cahill (1970s Starvation Studies); Stefansson (1928) Bellevue Hospital Study.',
    effectSize:
      'Binary Outcome: Historical records of Arctic explorers and clinical observations of modern carnivores show 0% incidence of scurvy despite intake levels (e.g. 10mg/day) below the standard RDA (65-90mg/day).',
  },
];

/**
 * カテゴリ別に知識を取得
 */
export function getKnowledgeByCategory(category: KnowledgeItem['category']): KnowledgeItem[] {
  return KNOWLEDGE_BASE.filter((item) => item.category === category);
}

/**
 * IDで知識を取得
 */
export function getKnowledgeById(id: string): KnowledgeItem | undefined {
  return KNOWLEDGE_BASE.find((item) => item.id === id);
}

/**
 * 検索キーワードで知識を検索
 */
export function searchKnowledge(keyword: string): KnowledgeItem[] {
  const lowerKeyword = keyword.toLowerCase();
  return KNOWLEDGE_BASE.filter(
    (item) =>
      (item.title && item.title.toLowerCase().includes(lowerKeyword)) ||
      item.myth.toLowerCase().includes(lowerKeyword) ||
      item.truth.toLowerCase().includes(lowerKeyword) ||
      item.mechanism.toLowerCase().includes(lowerKeyword) ||
      item.source.toLowerCase().includes(lowerKeyword) ||
      item.effectSize.toLowerCase().includes(lowerKeyword) ||
      (item.details && item.details.toLowerCase().includes(lowerKeyword))
  );
}

/**
 * すべてのカテゴリを取得
 */
export function getAllCategories(): KnowledgeItem['category'][] {
  return Array.from(new Set(KNOWLEDGE_BASE.map((item) => item.category)));
}
