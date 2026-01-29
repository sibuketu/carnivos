/**
 * getCarnivoreTargets関数のユニットテスト
 * 動的目標値計算ロジックの正確性を確認
 */

import { getCarnivoreTargets } from '../data/carnivoreTargets';

describe('getCarnivoreTargets', () => {
  describe('基本的な目標値計算', () => {
    it('デフォルトプロファイルで基本的な目標値が計算される', () => {
      const targets = getCarnivoreTargets('male', 30, 'moderate', false, false, false, 'moderate');

      expect(targets.protein).toBeGreaterThan(0);
      expect(targets.fat).toBeGreaterThan(0);
      expect(targets.sodium).toBeGreaterThan(0);
      expect(targets.magnesium).toBeGreaterThan(0);
    });

    it('女性プロファイルで適切な目標値が計算される', () => {
      const targets = getCarnivoreTargets(
        'female',
        30,
        'moderate',
        false,
        false,
        false,
        'moderate'
      );

      expect(targets.protein).toBeGreaterThan(0);
      expect(targets.fat).toBeGreaterThan(0);
    });
  });

  describe('妊娠中・授乳中の調整', () => {
    it('妊娠中はタンパク質目標値が120g以上になる', () => {
      const targets = getCarnivoreTargets(
        'female',
        30,
        'moderate',
        true, // 妊娠中
        false,
        false,
        'moderate'
      );

      expect(targets.protein).toBeGreaterThanOrEqual(120);
    });

    it('授乳中はタンパク質目標値が130g以上になる', () => {
      const targets = getCarnivoreTargets(
        'female',
        30,
        'moderate',
        false,
        true, // 授乳中
        false,
        'moderate'
      );

      expect(targets.protein).toBeGreaterThanOrEqual(130);
    });
  });

  describe('運動強度による調整', () => {
    it('激しい運動の場合、タンパク質目標値が増加する', () => {
      const targets = getCarnivoreTargets(
        'male',
        30,
        'active',
        false,
        false,
        false,
        'moderate',
        undefined,
        'intense', // 激しい運動
        '5+'
      );

      expect(targets.protein).toBeGreaterThanOrEqual(130);
    });
  });

  describe('年齢による調整', () => {
    it('50歳以上の場合、タンパク質とビタミンDが増加する', () => {
      const targets50 = getCarnivoreTargets(
        'male',
        55,
        'moderate',
        false,
        false,
        false,
        'moderate'
      );
      const targets30 = getCarnivoreTargets(
        'male',
        30,
        'moderate',
        false,
        false,
        false,
        'moderate'
      );

      // 年齢による調整が反映されていることを確認
      expect(targets50.protein).toBeGreaterThanOrEqual(targets30.protein);
      expect(targets50.vitamin_d).toBeGreaterThanOrEqual(3000);
    });
  });
});
