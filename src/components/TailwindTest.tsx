/**
 * Tailwind CSS動作確認用のテストコンポーネント
 * カーニボアらしい配色（Stone, Red, Zinc系）が正しく適用されることを確認
 */

export default function TailwindTest() {
  return (
    <div className="p-4 bg-carnivore-stone-50 min-h-screen">
      <h1 className="text-2xl font-bold text-carnivore-red-700 mb-4">
        🥩 CarnivOS - Tailwind CSS Test
      </h1>
      <div className="space-y-4">
        <div className="p-4 bg-carnivore-stone-100 rounded-lg border border-carnivore-stone-300">
          <h2 className="text-lg font-semibold text-carnivore-zinc-800 mb-2">
            Stone Color Palette
          </h2>
          <div className="flex gap-2">
            <div className="w-16 h-16 bg-carnivore-stone-200 rounded"></div>
            <div className="w-16 h-16 bg-carnivore-stone-400 rounded"></div>
            <div className="w-16 h-16 bg-carnivore-stone-600 rounded"></div>
            <div className="w-16 h-16 bg-carnivore-stone-800 rounded"></div>
          </div>
        </div>
        <div className="p-4 bg-carnivore-red-50 rounded-lg border border-carnivore-red-200">
          <h2 className="text-lg font-semibold text-carnivore-red-800 mb-2">Red Color Palette</h2>
          <div className="flex gap-2">
            <div className="w-16 h-16 bg-carnivore-red-200 rounded"></div>
            <div className="w-16 h-16 bg-carnivore-red-400 rounded"></div>
            <div className="w-16 h-16 bg-carnivore-red-600 rounded"></div>
            <div className="w-16 h-16 bg-carnivore-red-800 rounded"></div>
          </div>
        </div>
        <div className="p-4 bg-carnivore-zinc-50 rounded-lg border border-carnivore-zinc-200">
          <h2 className="text-lg font-semibold text-carnivore-zinc-800 mb-2">Zinc Color Palette</h2>
          <div className="flex gap-2">
            <div className="w-16 h-16 bg-carnivore-zinc-200 rounded"></div>
            <div className="w-16 h-16 bg-carnivore-zinc-400 rounded"></div>
            <div className="w-16 h-16 bg-carnivore-zinc-600 rounded"></div>
            <div className="w-16 h-16 bg-carnivore-zinc-800 rounded"></div>
          </div>
        </div>
        <button className="px-6 py-3 bg-carnivore-red-600 text-white rounded-lg font-semibold hover:bg-carnivore-red-700 transition-colors">
          Test Button
        </button>
      </div>
    </div>
  );
}
