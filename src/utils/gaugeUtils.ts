/**
 * Gauge Utilities - 栄養素ゲージ共通関数
 *
 * 全画面で統一して使用する色、グループ定義、ユーティリティ関数
 * @see docs/NUTRIENT_GAUGE_REQUIREMENTS.md
 */

/**
 * 栄養素ごとの色を返す（全画面共通）
 * ハードコード禁止 - この関数のみを使用すること
 */
export function getNutrientColor(nutrientKey: string): string {
    const colorMap: Record<string, string> = {
        protein: '#f43f5e',   // rose-500 (neon red)
        fat: '#f43f5e',       // rose-500 (neon red)
        zinc: '#f43f5e',      // rose-500 (neon red)
        magnesium: '#f43f5e', // rose-500 (neon red)
        iron: '#f43f5e',      // rose-500 (neon red)
        sodium: '#f43f5e',    // rose-500 (neon red)
        potassium: '#f43f5e', // rose-500 (neon red)
    };
    return colorMap[nutrientKey] || '#f43f5e'; // デフォルトは rose-500 (neon red)
}

/**
 * 栄養素グループ定義（表示用）
 */
export const NUTRIENT_GROUPS = {
    electrolytes: {
        label: '⚡ Electrolytes',
        bg: '#f0f9ff', // light blue
        nutrients: ['sodium', 'potassium', 'magnesium'] as const,
    },
    macros: {
        label: '🥩 Macros',
        bg: '#fef3c7', // light yellow
        nutrients: ['protein', 'fat'] as const,
    },
    other: {
        label: '📊 Other',
        bg: '#f3f4f6', // light gray
        nutrients: [] as string[], // Tier2, Tier3の栄養素
    },
} as const;

export type NutrientGroupKey = keyof typeof NUTRIENT_GROUPS;

/**
 * 栄養素がどのグループに属するかを判定
 */
export function getNutrientGroup(nutrientKey: string): NutrientGroupKey {
    if (NUTRIENT_GROUPS.electrolytes.nutrients.includes(nutrientKey as typeof NUTRIENT_GROUPS.electrolytes.nutrients[number])) {
        return 'electrolytes';
    }
    if (NUTRIENT_GROUPS.macros.nutrients.includes(nutrientKey as typeof NUTRIENT_GROUPS.macros.nutrients[number])) {
        return 'macros';
    }
    return 'other';
}
