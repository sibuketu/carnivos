import React, { useState } from 'react';

interface StorageNutrientGaugeProps {
  label: string;
  currentStorage: number; // 0 to 100 (percentage)
  nutrientKey: string;
  dailyTarget: number; // Personalized daily target
  unit?: string;
}

const StorageNutrientGauge: React.FC<StorageNutrientGaugeProps> = ({
  label,
  currentStorage,
  nutrientKey,
  dailyTarget,
  unit = '',
}) => {
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'simple' | 'detailed' | 'general'>('simple');

  // Dynamic color logic to match MiniNutrientGauge (Red -> Orange -> Green -> Purple)
  const getDynamicColor = (percent: number): string => {
    if (percent < 30) return '#ef4444'; // Red (Refill needed)
    if (percent < 70) return '#f97316'; // Orange (OK but dropping)
    if (percent < 100) return '#f43f5e'; // Green (Good)
    return '#f43f5e'; // Purple (Supercharged)
  };

  const dynamicColor = getDynamicColor(currentStorage);

  // Placeholder logic for missing variables to prevent crash
  // In a real implementation, these should be calculated or passed as props
  const maxStorage = dailyTarget * 90; // Approx 3 months buffer as default max?
  const currentAmount = (currentStorage / 100) * maxStorage;
  const daysUntilEmpty = Math.max(0, Math.floor((currentStorage / 100) * 90));
  const decayRate = 1.5; // Dummy decay rate

  // Refill guide content mapping
  const getGuideContent = (key: string) => {
    switch (key) {
      case 'vitamin_a': return { foods: ['Beef Liver', 'Cod Liver Oil', 'Egg Yolks'], action: 'Consume 100g Liver / week', why: 'Liver is the ultimate source of Vitamin A.' };
      case 'vitamin_d': return { foods: ['Salmon', 'Mackerel', 'Sun Exposure'], action: 'Get morning sun or eat oily fish', why: 'Vitamin D is crucial for immunity.' };
      case 'vitamin_b12': return { foods: ['Beef', 'Clams', 'Liver'], action: 'Eat ruminant meat daily', why: 'B12 supports energy and nerve health.' };
      case 'iron': return { foods: ['Red Meat', 'Spleen', 'Liver'], action: 'Prioritize red meat', why: 'Heme iron is most bioavailable.' };
      default: return { foods: ['Red Meat', 'Eggs'], action: 'Eat nutrient dense foods', why: 'Maintain levels for optimal health.' };
    }
  };
  const guide = getGuideContent(nutrientKey);

  return (
    <>
      <div
        className="bg-stone-900 border border-stone-800 rounded-xl p-3 mb-3 relative overflow-hidden group cursor-pointer transition-all hover:bg-stone-800/50"
        onClick={() => setShowModal(true)}
      >
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-stone-300">{label}</span>
            {currentStorage < 30 && (
              <span className="text-xs bg-red-900/50 text-red-400 px-1.5 py-0.5 rounded border border-red-800 animate-pulse">
                Refill
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-stone-400">
              {Math.round(currentStorage)}% <span style={{ color: dynamicColor }} className="text-xs font-bold">({Math.round(currentAmount).toLocaleString()}/{Math.round(maxStorage).toLocaleString()} {unit})</span>
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowModal(true);
              }}
              className="text-stone-600 hover:text-rose-500 transition-colors"
            >
              💡
            </button>
          </div>
        </div>

        {/* Gauge Bar */}
        <div className="w-full h-2.5 bg-stone-800 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500 ease-out"
            style={{
              width: `${Math.min(100, Math.max(0, currentStorage))}%`,
              backgroundColor: dynamicColor,
              boxShadow: `0 0 10px ${dynamicColor}40`
            }}
          />
        </div>

      </div>

      {/* Storage Info Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setShowModal(false)}>
          <div className="bg-stone-900 border border-stone-700 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200" onClick={e => e.stopPropagation()}>

            {/* Modal Header */}
            <div className="p-4 border-b border-stone-800 flex justify-between items-center bg-stone-900/50">
              <h3 className="font-bold text-lg text-white flex items-center gap-2">
                <span>💡</span> {label} ストレージ
              </h3>
              <button onClick={() => setShowModal(false)} className="text-stone-500 hover:text-white text-xl">&times;</button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-stone-800 bg-stone-900/30">
              {(['simple', 'detailed', 'general'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-3 text-sm font-bold transition-colors relative ${activeTab === tab
                    ? 'text-white bg-stone-800'
                    : 'text-stone-500 hover:text-stone-300 hover:bg-stone-800/50'
                    }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  {activeTab === tab && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-rose-500" />
                  )}
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="p-5 min-h-[200px] text-stone-300">

              {activeTab === 'simple' && (
                <div className="space-y-4">
                  <div className={`p-4 rounded-xl border ${currentStorage < 30 ? 'bg-red-900/20 border-red-800' : 'bg-rose-900/20 border-rose-800'}`}>
                    <h4 className={`font-bold mb-1 ${currentStorage < 30 ? 'text-red-400' : 'text-rose-400'}`}>
                      {currentStorage < 30 ? '⚠️ Storage is Low' : '✅ Storage is Good'}
                    </h4>
                    <p className="text-sm opacity-90">
                      {currentStorage < 30
                        ? `Your ${label} reserves are below 30%. Prioritize refill foods soon.`
                        : `Your ${label} reserves are healthy. Maintain your current diet.`}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-stone-800/50 rounded-lg">
                    <span className="text-2xl">📉</span>
                    <div>
                      <div className="text-xs text-stone-500">Estimated Depletion</div>
                      <div className="font-bold text-white">
                        {daysUntilEmpty > 0 ? `~${daysUntilEmpty} days left` : 'Empty'}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'detailed' && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm py-2 border-b border-stone-800">
                      <span className="text-stone-500">Current Level</span>
                      <div className="text-right">
                        <span className="text-white font-mono block">{currentStorage.toFixed(1)}%</span>
                        <span className="text-xs text-stone-500 font-mono">
                          ({Math.round(currentAmount)} / {Math.round(maxStorage)} {unit})
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between text-sm py-2 border-b border-stone-800">
                      <span className="text-stone-500">Natural Decay</span>
                      <span className="text-red-400 font-mono">-{decayRate}% / week</span>
                    </div>
                    <div className="flex justify-between text-sm py-2 border-b border-stone-800">
                      <span className="text-stone-500">Daily Target</span>
                      <span className="text-stone-300 font-mono">{dailyTarget} {unit}</span>
                    </div>
                  </div>
                  <p className="text-xs text-stone-500 mt-4 leading-relaxed">
                    * Storage levels are estimates based on standard metabolic rates.
                    * Refill calculations use your <strong>Personalized Targets</strong> (Age, Gender, Activity).
                    * Stress, exercise, and inflammation can accelerate depletion.
                  </p>
                </div>
              )}

              {activeTab === 'general' && (
                <div className="space-y-4">
                  <div className="p-3 bg-stone-800/50 rounded-lg border border-stone-700">
                    <h4 className="font-bold text-rose-500 text-sm mb-2">🍽️ Refill Sources</h4>
                    <ul className="text-sm space-y-1 text-stone-300 list-disc list-inside">
                      {guide.foods.map((food, i) => (
                        <li key={i}>{food}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-3 bg-stone-800/50 rounded-lg border border-stone-700">
                    <h4 className="font-bold text-rose-400 text-sm mb-2">⚡ Pro Tip</h4>
                    <p className="text-sm text-stone-300">{guide.action}</p>
                  </div>

                  <p className="text-xs text-stone-500 italic">
                    {guide.why}
                  </p>
                </div>
              )}

            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-stone-800 bg-stone-900/50 text-center">
              <button
                onClick={() => setShowModal(false)}
                className="text-stone-400 hover:text-white text-sm font-bold uppercase tracking-wider"
              >
                Close Shield
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
};

export default StorageNutrientGauge;
