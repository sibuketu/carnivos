/**
 * 動作確認: 日記入力で目標値が動的に変わることの検証
 * - 頭痛8 → マグネシウム目標値が上がる
 * - 睡眠不良(sleepScore 40) → マグネシウム目標値が上がる
 * - 便秘 → マグネシウム目標値が上がる
 * - 激しい運動(30分以上) → タンパク質目標値が上がる
 */

import { getDynamicNutrientTargets } from '../data/dynamicNutrientCalculator';
import type { DailyStatus, UserProfile } from '../types';
import { METABOLIC_STATUS, USER_GOALS } from '../constants/carnivore_constants';

const minimalProfile: UserProfile = {
  gender: 'male',
  goal: USER_GOALS.HEALING,
  metabolicStatus: METABOLIC_STATUS.ADAPTED,
  weight: 70,
  age: 30,
};

const baseStatus: Pick<DailyStatus, 'sleepScore' | 'sunMinutes' | 'activityLevel'> = {
  sleepScore: 80,
  sunMinutes: 30,
  activityLevel: 'moderate',
};

describe('getDynamicNutrientTargets - 動作確認テスト', () => {
  it('頭痛8 → マグネシウム目標値が上がる', () => {
    const base = getDynamicNutrientTargets(minimalProfile, undefined);
    const withHeadache = getDynamicNutrientTargets(minimalProfile, {
      ...baseStatus,
      headache: 8,
    });
    expect(withHeadache.magnesium).toBeGreaterThan(base.magnesium);
  });

  it('睡眠スコア40(睡眠不良) → マグネシウム目標値が上がる', () => {
    const base = getDynamicNutrientTargets(minimalProfile, undefined);
    const withPoorSleep = getDynamicNutrientTargets(minimalProfile, {
      ...baseStatus,
      sleepScore: 40,
    });
    expect(withPoorSleep.magnesium).toBeGreaterThan(base.magnesium);
  });

  it('便秘 → マグネシウム目標値が上がる', () => {
    const base = getDynamicNutrientTargets(minimalProfile, undefined);
    const withConstipated = getDynamicNutrientTargets(minimalProfile, {
      ...baseStatus,
      bowelMovement: { status: 'constipated' },
    });
    expect(withConstipated.magnesium).toBeGreaterThan(base.magnesium);
  });

  it('激しい運動30分以上 → タンパク質目標値が上がる', () => {
    const base = getDynamicNutrientTargets(minimalProfile, undefined);
    const withIntenseExercise = getDynamicNutrientTargets(minimalProfile, {
      ...baseStatus,
      exerciseIntensity: 'intense',
      exerciseMinutes: 30,
    });
    expect(withIntenseExercise.protein).toBeGreaterThan(base.protein);
  });
});
