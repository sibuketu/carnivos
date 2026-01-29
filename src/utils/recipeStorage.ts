/**
 * Primal Logic - Recipe Storage Utility
 *
 * レシピ登録・保存機能
 */

import { logError } from './errorHandler';
import type { FoodItem } from '../types';

export interface Recipe {
  id: string;
  name: string;
  description?: string;
  foods: FoodItem[];
  createdAt: string;
  updatedAt: string;
}

const RECIPE_STORAGE_KEY = 'primal_logic_recipes';

/**
 * 全てのレシピを取得
 */
export function getRecipes(): Recipe[] {
  try {
    const stored = localStorage.getItem(RECIPE_STORAGE_KEY);
    if (!stored) return [];
    return JSON.parse(stored);
  } catch (error) {
    logError(error, { component: 'recipeStorage', action: 'getRecipes' });
    return [];
  }
}

/**
 * レシピを保存
 */
export function saveRecipe(recipe: Omit<Recipe, 'id' | 'createdAt' | 'updatedAt'>): Recipe {
  try {
    const recipes = getRecipes();
    const now = new Date().toISOString();
    const newRecipe: Recipe = {
      ...recipe,
      id: `recipe_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: now,
      updatedAt: now,
    };
    recipes.push(newRecipe);
    localStorage.setItem(RECIPE_STORAGE_KEY, JSON.stringify(recipes));
    return newRecipe;
  } catch (error) {
    logError(error, { component: 'recipeStorage', action: 'saveRecipe' });
    throw error;
  }
}

/**
 * レシピを更新
 */
export function updateRecipe(
  id: string,
  recipe: Partial<Omit<Recipe, 'id' | 'createdAt'>>
): Recipe | null {
  try {
    const recipes = getRecipes();
    const index = recipes.findIndex((r) => r.id === id);
    if (index === -1) return null;

    recipes[index] = {
      ...recipes[index],
      ...recipe,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(RECIPE_STORAGE_KEY, JSON.stringify(recipes));
    return recipes[index];
  } catch (error) {
    logError(error, { component: 'recipeStorage', action: 'updateRecipe' });
    throw error;
  }
}

/**
 * レシピを削除
 */
export function deleteRecipe(id: string): boolean {
  try {
    const recipes = getRecipes();
    const filtered = recipes.filter((r) => r.id !== id);
    if (filtered.length === recipes.length) return false;
    localStorage.setItem(RECIPE_STORAGE_KEY, JSON.stringify(filtered));
    return true;
  } catch (error) {
    logError(error, { component: 'recipeStorage', action: 'deleteRecipe' });
    throw error;
  }
}

/**
 * レシピをIDで取得
 */
export function getRecipeById(id: string): Recipe | null {
  try {
    const recipes = getRecipes();
    return recipes.find((r) => r.id === id) || null;
  } catch (error) {
    logError(error, { component: 'recipeStorage', action: 'getRecipeById' });
    return null;
  }
}
