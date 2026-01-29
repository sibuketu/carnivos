/**
 * Primal Logic - My Foods Storage Utility
 *
 * 「いつもの食品」をユーザーが明示的に登録したものだけを管理
 */

import { logError } from './errorHandler';

export interface MyFoodItem {
  id?: string; // カスタム食品の一意ID（新規追加時は自動生成）
  foodName: string; // 食品名（栄養素検索に使用）
  displayName?: string; // 登録名（表示・検索に使用、デフォルトはfoodName）
  amount: number;
  unit: 'g' | '個';
  type?: 'animal' | 'plant' | 'trash' | 'ruminant' | 'dairy'; // 食品タイプ
  nutrients?: {
    protein?: number; // g/100g
    fat?: number; // g/100g
    carbs?: number; // g/100g
    fiber?: number; // g/100g
    sodium?: number; // mg/100g
    magnesium?: number; // mg/100g
    potassium?: number; // mg/100g
    zinc?: number; // mg/100g
    iron?: number; // mg/100g
    vitaminA?: number; // IU/100g
    vitaminD?: number; // IU/100g
    vitaminK2?: number; // μg/100g
    vitaminB12?: number; // μg/100g
    omega3?: number; // g/100g
    omega6?: number; // g/100g
    calcium?: number; // mg/100g
    phosphorus?: number; // mg/100g
    glycine?: number; // g/100g
    methionine?: number; // g/100g
    // アミノ酸（カーニボア重要）
    taurine?: number; // mg/100g（タウリン、内臓・魚・肉に豊富）
    // その他のビタミン・ミネラル（余計なくらい大量に）
    vitaminB5?: number; // mg/100g（パントテン酸）
    vitaminB9?: number; // μg/100g（葉酸、Folate）
    chromium?: number; // μg/100g（クロム）
    molybdenum?: number; // μg/100g（モリブデン）
    fluoride?: number; // mg/100g（フッ素）
    chloride?: number; // mg/100g（塩素）
    boron?: number; // mg/100g（ホウ素）
    nickel?: number; // mg/100g（ニッケル）
    silicon?: number; // mg/100g（ケイ素）
    vanadium?: number; // μg/100g（バナジウム）
    vitaminB1?: number; // mg/100g
    vitaminB2?: number; // mg/100g
    vitaminB3?: number; // mg/100g
    vitaminB6?: number; // mg/100g
    vitaminB7?: number; // μg/100g（ビオチン）
    vitaminE?: number; // mg/100g
    selenium?: number; // μg/100g
    copper?: number; // mg/100g
    manganese?: number; // mg/100g
    iodine?: number; // μg/100g（ヨウ素）
    choline?: number; // mg/100g
    // 抗栄養素（植物性食品の場合）
    phytates?: number; // mg/100g
    polyphenols?: number; // mg/100g
    flavonoids?: number; // mg/100g
    anthocyanins?: number; // mg/100g（アントシアニン、フラボノイドの一種）
    oxalates?: number; // mg/100g
    lectins?: number; // mg/100g
    saponins?: number; // mg/100g
    goitrogens?: number; // mg/100g
    tannins?: number; // mg/100g
    trypsinInhibitors?: number; // mg/100g
    proteaseInhibitors?: number; // mg/100g
    cyanogenicGlycosides?: number; // mg/100g
    solanine?: number; // mg/100g
    chaconine?: number; // mg/100g
  };
}

const STORAGE_KEY = 'primal_logic_my_foods';

/**
 * 「いつもの食品」一覧を取得
 */
export function getMyFoods(): MyFoodItem[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
    return [];
  } catch (error) {
    logError(error, { component: 'myFoodsStorage', action: 'getMyFoods' });
    return [];
  }
}

/**
 * 「いつもの食品」に追加
 */
export function addMyFood(food: MyFoodItem): void {
  try {
    const current = getMyFoods();
    // 既に存在するかチェック（食品名、量、単位が全て同じ場合は追加しない）
    const exists = current.some(
      (item) =>
        item.foodName === food.foodName && item.amount === food.amount && item.unit === food.unit
    );
    if (!exists) {
      current.push(food);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
    }
  } catch (error) {
    logError(error, { component: 'myFoodsStorage', action: 'addMyFood' });
  }
}

/**
 * 「いつもの食品」から削除
 */
export function removeMyFood(food: MyFoodItem): void {
  try {
    const current = getMyFoods();
    const filtered = current.filter(
      (item) =>
        !(item.foodName === food.foodName && item.amount === food.amount && item.unit === food.unit)
    );
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (error) {
    logError(error, { component: 'myFoodsStorage', action: 'removeMyFood' });
  }
}

/**
 * 「いつもの食品」を全て削除
 */
export function clearMyFoods(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    logError(error, { component: 'myFoodsStorage', action: 'clearMyFoods' });
  }
}

/**
 * カスタム食品をIDで取得
 */
export function getCustomFoodById(id: string): MyFoodItem | null {
  try {
    const foods = getMyFoods();
    return foods.find((food) => food.id === id) || null;
  } catch (error) {
    logError(error, { component: 'myFoodsStorage', action: 'getCustomFoodById', id });
    return null;
  }
}

/**
 * カスタム食品を更新
 */
export function updateCustomFood(id: string, updatedFood: MyFoodItem): void {
  try {
    const current = getMyFoods();
    const index = current.findIndex((food) => food.id === id);
    if (index !== -1) {
      current[index] = { ...updatedFood, id }; // IDを保持
      localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
    }
  } catch (error) {
    logError(error, { component: 'myFoodsStorage', action: 'updateCustomFood', id });
  }
}

/**
 * カスタム食品をIDで削除
 */
export function deleteCustomFood(id: string): void {
  try {
    const current = getMyFoods();
    const filtered = current.filter((food) => food.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (error) {
    logError(error, { component: 'myFoodsStorage', action: 'deleteCustomFood', id });
  }
}

/**
 * カスタム食品を追加（IDを自動生成）
 */
export function addCustomFood(food: Omit<MyFoodItem, 'id'>): string {
  try {
    const id = `custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const foodWithId: MyFoodItem = { ...food, id };
    addMyFood(foodWithId);
    return id;
  } catch (error) {
    logError(error, { component: 'myFoodsStorage', action: 'addCustomFood' });
    throw error;
  }
}
