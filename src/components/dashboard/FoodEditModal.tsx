import React, { useState, useEffect } from 'react';
import type { FoodItem } from '../../types';
import { useTranslation } from '../../utils/i18n';
import './FoodEditModal.css';

interface FoodEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (food: FoodItem) => void;
    initialFood: FoodItem; // AI解析結果やデフォルト値
}

export default function FoodEditModal({ isOpen, onClose, onSave, initialFood }: FoodEditModalProps) {
    const { t } = useTranslation();
    const [editedFood, setEditedFood] = useState<FoodItem>(initialFood);
    const [isCooked, setIsCooked] = useState(false);
    const [weight, setWeight] = useState(initialFood.amount || 100);

    // 栄養素スライダー用の状態（100gあたりの値）
    const [proteinPer100g, setProteinPer100g] = useState(0);
    const [fatPer100g, setFatPer100g] = useState(0);

    // 初期化
    useEffect(() => {
        if (initialFood) {
            setEditedFood(initialFood);
            setWeight(initialFood.amount || 100);
            // 既存の栄養価から100gあたりの値を逆算してスライダー初期値にする
            // もしnutrientsが未定義なら適当なデフォルト値を入れる
            const currentProtein = initialFood.nutrients?.protein ?? 0;
            const currentFat = initialFood.nutrients?.fat ?? 0;
            const currentAmount = initialFood.amount || 100;

            setProteinPer100g((currentProtein / currentAmount) * 100);
            setFatPer100g((currentFat / currentAmount) * 100);
        }
    }, [initialFood]);

    // 重量やスライダーが変わったら栄養価を再計算
    useEffect(() => {
        // 焼成係数: 焼いた肉(100g)は 生肉(約133g) に相当すると仮定 (係数 1.33)
        // ユーザーが「焼いた状態で100g」と入力したら、実際は「生133g」分の栄養があるとする
        const cookingFactor = isCooked ? 1.33 : 1.0;

        // 実際に計算に使われる「生換算重量」
        const rawWeight = weight * cookingFactor;

        // トータル栄養価の計算
        const totalProtein = (proteinPer100g / 100) * rawWeight;
        const totalFat = (fatPer100g / 100) * rawWeight;
        const totalCalories = (totalProtein * 4) + (totalFat * 9); // カロリーは参考値

        setEditedFood(prev => ({
            ...prev,
            amount: weight, // 保存されるのは「入力された重量（焼いた後の重量）」
            nutrients: {
                ...prev.nutrients,
                protein: Math.round(totalProtein * 10) / 10,
                fat: Math.round(totalFat * 10) / 10,
                calories: Math.round(totalCalories),
            }
        }));
    }, [weight, isCooked, proteinPer100g, fatPer100g]);

    if (!isOpen) return null;

    // 栄養素が未定義の場合のガード
    const currentProtein = editedFood.nutrients?.protein ?? 0;
    const currentFat = editedFood.nutrients?.fat ?? 0;

    // P:F比率の計算 (重量比)
    const pfRatio = currentFat > 0
        ? (currentProtein / currentFat).toFixed(2)
        : '∞';

    // エネルギー比率 (カロリーベース) - 参考用（将来表示用に計算のみ保持）
    const _energyRatio = currentFat > 0
        ? ((currentFat * 9) / ((currentProtein * 4) + (currentFat * 9)) * 100).toFixed(0)
        : '0';

    return (
        <div className="food-edit-modal-overlay">
            <div className="food-edit-modal">
                <div className="food-edit-header">
                    <h3>{editedFood.item}</h3>
                    <button className="close-button" onClick={onClose}>×</button>
                </div>

                <div className="food-edit-content">
                    {/* 重量と状態 */}
                    <div className="input-group weight-group">
                        <div className="weight-input-wrapper">
                            <label>{t('foodEdit.weight')}</label>
                            <input
                                type="number"
                                value={weight}
                                onChange={(e) => setWeight(Number(e.target.value))}
                                className="weight-input"
                            />
                        </div>
                        <div className="state-toggle-wrapper">
                            <label>Measurement State</label>
                            <div className="toggle-switch">
                                <button
                                    className={`toggle-option ${!isCooked ? 'active' : ''}`}
                                    onClick={() => setIsCooked(false)}
                                    title="計測: 生肉 (Raw)"
                                >
                                    🥩
                                </button>
                                <button
                                    className={`toggle-option ${isCooked ? 'active' : ''}`}
                                    onClick={() => setIsCooked(true)}
                                    title="計測: 調理済み (Cooked)"
                                >
                                    🍳
                                </button>
                            </div>
                        </div>
                    </div>

                    <p className="hint-text">
                        {isCooked
                            ? "🍳 調理後 (水分減少 x1.33換算)"
                            : "🥩 調理前 (Raw)"}
                    </p>

                    {/* 栄養ダッシュボード */}
                    <div className="nutrition-dashboard">
                        <div className="nutrition-stat">
                            <span className="stat-label">P:F 比率</span>
                            <span className="stat-value highlight">{pfRatio}</span>
                            <span className="stat-unit">{t('foodEdit.pfRatioUnit')}</span>
                        </div>
                    </div>

                    {/* 栄養スライダー */}
                    <div className="slider-section">
                        <div className="slider-group">
                            <div className="slider-header">
                                <label>{t('foodEdit.proteinLabel')}</label>
                                <span className="slider-current-value">{Math.round(proteinPer100g)}g / 100g</span>
                                {/* トッピングボタン (削除済) */}
                            </div>
                            <input
                                type="range"
                                min="0"
                                max="50"
                                step="0.5"
                                value={proteinPer100g}
                                onChange={(e) => setProteinPer100g(Number(e.target.value))}
                                className="nutrient-slider protein-slider"
                            />
                            <div className="actual-value">{t('foodEdit.total')}: {editedFood.nutrients?.protein ?? 0}g</div>
                        </div>

                        <div className="slider-group">
                            <div className="slider-header">
                                <label>{t('foodEdit.fatLabel')}</label>
                                <span className="slider-current-value">{Math.round(fatPer100g)}g / 100g</span>
                            </div>
                            <input
                                type="range"
                                min="0"
                                max="100" // 脂質は牛脂なら100近くいく
                                step="0.5"
                                value={fatPer100g}
                                onChange={(e) => setFatPer100g(Number(e.target.value))}
                                className="nutrient-slider fat-slider"
                            />
                            <div className="actual-value">{t('foodEdit.total')}: {editedFood.nutrients?.fat ?? 0}g</div>
                        </div>
                    </div>

                    {/* トッピングボタン */}
                    <div className="topping-buttons" style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                        <button
                            onClick={() => {
                                const addedFat = 8; // バター10gで約8gの脂質
                                const currentTotalFat = (editedFood.nutrients?.fat || 0) + addedFat;
                                // スライダー(100gあたり)も更新して同期させる
                                const newFatPer100g = (currentTotalFat / weight) * 100;
                                setFatPer100g(newFatPer100g);
                            }}
                            className="topping-btn"
                            style={{ padding: '0.5rem 1rem', borderRadius: '20px', border: '1px solid #444', background: '#222', color: '#fff', cursor: 'pointer' }}
                        >
                            🧈 バター (+10g)
                        </button>
                        <button
                            onClick={() => {
                                const addedSodium = 390; // 塩1gで約390mgのナトリウム
                                const newNutrients = { ...editedFood.nutrients };
                                newNutrients.sodium = (newNutrients.sodium || 0) + addedSodium;
                                setEditedFood({ ...editedFood, nutrients: newNutrients });
                                // 塩はスライダーがないので直接nutrients更新でOK
                            }}
                            className="topping-btn"
                            style={{ padding: '0.5rem 1rem', borderRadius: '20px', border: '1px solid #444', background: '#222', color: '#fff', cursor: 'pointer' }}
                        >
                            🧂 塩 (+1g)
                        </button>
                        <button
                            onClick={() => {
                                const addedFat = 10; // 牛脂10gで約10gの脂質
                                const currentTotalFat = (editedFood.nutrients?.fat || 0) + addedFat;
                                // スライダー(100gあたり)も更新して同期させる
                                const newFatPer100g = (currentTotalFat / weight) * 100;
                                setFatPer100g(newFatPer100g);
                            }}
                            className="topping-btn"
                            style={{ padding: '0.5rem 1rem', borderRadius: '20px', border: '1px solid #444', background: '#222', color: '#fff', cursor: 'pointer' }}
                        >
                            🐂 牛脂 (+10g)
                        </button>
                    </div>

                    {/* アコーディオン (詳細) */}
                    <details className="advanced-details">
                        <summary>{t('foodEdit.advancedSettings')}</summary>
                        <div className="detail-inputs">
                            <label>
                                食品名:
                                <input
                                    type="text"
                                    value={editedFood.item}
                                    onChange={(e) => setEditedFood({ ...editedFood, item: e.target.value })}
                                />
                            </label>
                            {/* ここにビタミンなどを追加可能 */}
                        </div>
                    </details>

                </div>

                <div className="food-edit-footer">
                    <button className="cancel-button" onClick={onClose}>{t('foodEdit.cancel')}</button>
                    <button className="confirm-button" onClick={() => onSave(editedFood)}>
                        確定して記録
                    </button>
                </div>
            </div>
        </div>
    );
}
