/**
 * CarnivOS - Interactive Chicken Component
 *
 * クリッカブルSVG解剖図: 鶏の部位を直接タップして選択
 * デザインのトーン＆マナーは牛（InteractiveCow）と同じ
 */

import './InteractiveButcher.css';

interface InteractiveChickenProps {
  selectedPart: string | null;
  onSelectPart: (part: string) => void;
}

export default function InteractiveChicken({
  selectedPart,
  onSelectPart,
}: InteractiveChickenProps) {
  return (
    <div className="w-full max-w-md mx-auto">
      <h2 className="text-xl font-bold text-center mb-4">部位をタップしてください</h2>

      <svg
        viewBox="0 0 500 300"
        className="w-full h-auto drop-shadow-xl cursor-pointer interactive-butcher-svg"
      >
        {/* 鶏のシルエット定義 */}
        <g stroke="white" strokeWidth="2">
          {/* 1. 胸肉 (Breast) */}
          <path
            d="M150,80 Q200,60 250,80 L260,150 L150,150 Z"
            fill={selectedPart === 'breast' ? '#ff6b6b' : '#e11d48'}
            className="interactive-butcher-path"
            onClick={() => onSelectPart('breast')}
          />
          <text
            x="205"
            y="120"
            fill="white"
            fontSize="14"
            textAnchor="middle"
            pointerEvents="none"
            fontWeight="bold"
          >
            胸肉
          </text>

          {/* 2. もも (Thigh) */}
          <path
            d="M260,80 Q320,85 360,120 L360,200 L260,150 Z"
            fill={selectedPart === 'thigh' ? '#ff6b6b' : '#be123c'}
            className="interactive-butcher-path"
            onClick={() => onSelectPart('thigh')}
          />
          <text
            x="310"
            y="150"
            fill="white"
            fontSize="14"
            textAnchor="middle"
            pointerEvents="none"
            fontWeight="bold"
          >
            もも
          </text>

          {/* 3. 手羽 (Wing) */}
          <path
            d="M100,100 Q120,70 140,90 L145,130 L100,130 Z"
            fill={selectedPart === 'wing' ? '#ff6b6b' : '#9f1239'}
            className="interactive-butcher-path"
            onClick={() => onSelectPart('wing')}
          />
          <text
            x="120"
            y="110"
            fill="white"
            fontSize="12"
            textAnchor="middle"
            pointerEvents="none"
            fontWeight="bold"
          >
            手羽
          </text>

          {/* 4. レバー (Liver) - 内臓 */}
          <circle
            cx="205"
            cy="165"
            r="25"
            fill={selectedPart === 'liver' ? '#ff6b6b' : '#881337'}
            className="interactive-butcher-path"
            onClick={() => onSelectPart('liver')}
          />
          <text
            x="205"
            y="170"
            fill="white"
            fontSize="12"
            textAnchor="middle"
            pointerEvents="none"
            fontWeight="bold"
          >
            レバー
          </text>
        </g>
      </svg>

      <p className="text-center text-gray-500 mt-4 text-sm interactive-butcher-hint">
        図の部位を直接タップして選択
      </p>
    </div>
  );
}
