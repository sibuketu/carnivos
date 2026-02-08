/**
 * CarnivOS - Coffee Caffeine Calculator
 *
 * コーヒー入力からカフェイン量を自動計算
 */

// スタバのサイズ別カフェイン含有量（mg）
const STARBUCKS_CAFFEINE: Record<string, number> = {
  short: 155, // 240ml
  tall: 220, // 350ml
  grande: 330, // 470ml
  venti: 415, // 590ml
  trenta: 475, // 920ml（コールドドリンクのみ）
};

// 一般的なコーヒーのカフェイン含有量（mg/100ml）
const COFFEE_CAFFEINE_PER_100ML = 60; // ドリップコーヒー

/**
 * コーヒー入力からカフェイン量を計算
 *
 * @param input コーヒー入力（例: "スタバのコーヒーShort", "コーヒー2杯", "コーヒー300ml"）
 * @returns カフェイン量（mg）と説明
 */
export function calculateCaffeineFromCoffee(input: string): {
  caffeineMg: number;
  description: string;
} {
  const lowerInput = input.toLowerCase().trim();

  // スタバのサイズを検出
  for (const [size, caffeine] of Object.entries(STARBUCKS_CAFFEINE)) {
    if (lowerInput.includes(`スタバ`) || lowerInput.includes(`starbucks`)) {
      if (lowerInput.includes(size)) {
        return {
          caffeineMg: caffeine,
          description: `スタバ ${size}サイズ: ${caffeine}mg`,
        };
      }
    }
  }

  // 杯数を検出（例: "コーヒー2杯"）
  const cupMatch = lowerInput.match(/(\d+)\s*杯/);
  if (cupMatch) {
    const cups = parseInt(cupMatch[1], 10);
    // 1杯 = 200ml（日本の一般的なコーヒーカップ）
    const ml = cups * 200;
    const caffeine = (ml / 100) * COFFEE_CAFFEINE_PER_100ML;
    return {
      caffeineMg: Math.round(caffeine),
      description: `コーヒー${cups}杯（${ml}ml）: 約${Math.round(caffeine)}mg`,
    };
  }

  // ml数を検出（例: "コーヒー300ml"）
  const mlMatch = lowerInput.match(/(\d+)\s*ml/);
  if (mlMatch) {
    const ml = parseInt(mlMatch[1], 10);
    const caffeine = (ml / 100) * COFFEE_CAFFEINE_PER_100ML;
    return {
      caffeineMg: Math.round(caffeine),
      description: `コーヒー${ml}ml: 約${Math.round(caffeine)}mg`,
    };
  }

  // デフォルト: 1杯と仮定
  return {
    caffeineMg: Math.round((200 / 100) * COFFEE_CAFFEINE_PER_100ML),
    description: `コーヒー1杯（200ml）: 約${Math.round((200 / 100) * COFFEE_CAFFEINE_PER_100ML)}mg（推定）`,
  };
}

/**
 * カフェイン量から摂取レベルを判定
 */
export function getCaffeineIntakeLevel(caffeineMg: number): 'none' | 'low' | 'moderate' | 'high' {
  if (caffeineMg === 0) return 'none';
  if (caffeineMg < 100) return 'low';
  if (caffeineMg < 300) return 'moderate';
  return 'high';
}
