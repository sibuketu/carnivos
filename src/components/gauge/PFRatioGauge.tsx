/**
 * Protein & Fat Sufficiency Gauge
 *
 * ホーム画面の最上部に常時表示される羅針盤
 * ProteinバーとFatバーを独立して上下に配置
 * それぞれの「目標値に対する達成率」を表示
 *
 * 重要: カーニボアダイエットでは、P:F比率よりも「Pを充分に満たした」「Fも充分に満たした」という総摂取量の基準の方が重要。
 * 比率が適切でも、総摂取量が不足していれば意味がない。
 */

import { useApp } from '../../context/AppContext';
import type { PreviewData } from '../../hooks/useNutrition';
import { getCarnivoreTargets } from '../../data/carnivoreTargets';

interface PFRatioGaugeProps {
  previewData?: PreviewData | null;
  showPreview?: boolean;
}

export default function PFRatioGauge({
  previewData = null,
  showPreview = true,
}: PFRatioGaugeProps) {
  const { dailyLog, userProfile } = useApp();

  // previewDataが存在する場合はそれを使用、ない場合はdailyLogを使用
  const protein =
    showPreview && previewData?.protein !== undefined
      ? previewData.protein
      : (dailyLog?.calculatedMetrics?.animalEffectiveProtein ??
        dailyLog?.calculatedMetrics?.effectiveProtein ??
        0); // 動物性タンパク質を優先

  const fat =
    showPreview && previewData?.fat !== undefined
      ? previewData.fat
      : (dailyLog?.calculatedMetrics?.fatTotal ?? 0);

  // 動的目標値（ユーザープロファイルから取得）
  const targets = getCarnivoreTargets(
    userProfile?.gender,
    userProfile?.age,
    userProfile?.activityLevel,
    userProfile?.isPregnant,
    userProfile?.isBreastfeeding,
    userProfile?.isPostMenopause,
    userProfile?.stressLevel,
    userProfile?.sleepHours,
    userProfile?.exerciseIntensity,
    userProfile?.exerciseFrequency,
    userProfile?.thyroidFunction,
    userProfile?.sunExposureFrequency,
    userProfile?.digestiveIssues,
    userProfile?.inflammationLevel,
    userProfile?.mentalHealthStatus,
    userProfile?.supplementMagnesium,
    userProfile?.supplementVitaminD,
    userProfile?.supplementIodine,
    userProfile?.alcoholFrequency,
    userProfile?.caffeineIntake
  );
  // 目標値の取得（優先順位: dailyLogのproteinRequirement > targets.protein > デフォルト値）
  const P_GOAL = dailyLog?.calculatedMetrics?.proteinRequirement ?? targets.protein ?? 110; // デフォルト値110g
  const F_GOAL = targets.fat ?? 150; // デフォルト値150g（DEFAULT_CARNIVORE_TARGETSの値）
  const pPercent = P_GOAL > 0 ? Math.min((protein / P_GOAL) * 100, 200) : 0; // 200%まで表示可能（取りすぎの警告は不要、カーニボアでは基本的に取りすぎは存在しない）
  const fPercent = F_GOAL > 0 ? Math.min((fat / F_GOAL) * 100, 200) : 0; // 200%まで表示可能

  // 達成状況の判定
  const pSufficient = pPercent >= 100;
  const fSufficient = fPercent >= 100;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        backgroundColor: 'transparent',
        borderBottom: 'none',
        boxShadow: 'none',
        height: '90px',
        padding: '10px 16px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        gap: '8px',
        pointerEvents: 'none',
      }}
    >
      <div style={{ maxWidth: '600px', margin: '0 auto', width: '100%', pointerEvents: 'auto' }}>
        {/* Protein Bar Row */}
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] font-bold text-stone-500 w-8">PRO</span>
          <div className="flex-1 h-3 bg-stone-200 rounded-full overflow-hidden relative shadow-inner">
            <div
              style={{ width: `${Math.min(pPercent, 100)}%` }}
              className={`h-full bg-gradient-to-r ${pSufficient ? 'from-green-600 to-green-400' : 'from-red-900 to-red-500'} shadow-[0_0_10px_rgba(239,68,68,0.6)] transition-all duration-300`}
            />
          </div>
          <span className="text-[10px] font-mono text-stone-500 w-24 text-right">
            {Math.round(protein)}/{P_GOAL}g ({Math.round(pPercent)}%)
          </span>
        </div>

        {/* Fat Bar Row */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-stone-500 w-8">FAT</span>
          <div className="flex-1 h-3 bg-stone-200 rounded-full overflow-hidden relative shadow-inner">
            <div
              style={{ width: `${Math.min(fPercent, 100)}%` }}
              className={`h-full bg-gradient-to-r ${fSufficient ? 'from-green-600 to-green-400' : 'from-yellow-700 to-yellow-400'} shadow-[0_0_10px_rgba(234,179,8,0.6)] transition-all duration-300`}
            />
          </div>
          <span className="text-[10px] font-mono text-stone-500 w-24 text-right">
            {Math.round(fat)}/{F_GOAL}g ({Math.round(fPercent)}%)
          </span>
        </div>
      </div>
    </div>
  );
}
