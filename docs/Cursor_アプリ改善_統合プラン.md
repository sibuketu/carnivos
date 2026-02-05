# Cursor実装タスク: アプリ改善統合プラン

**作成日**: 2026-02-05
**目的**: 世界一のCarnivoreアプリを作る

---

## タスク1: 栄養素計算の精度向上（最優先）

### 目的
基本的な動的計算（性別、年齢、活動量）を超えて、睡眠、運動、ストレスなど複雑な要素を考慮した超パーソナライズ計算を実装。

### 現状
`src/data/carnivoreTargets.ts`の`getCarnivoreTargets()`が以下のパラメータを受け取っている：
- 性別、年齢、活動量
- 妊娠中、授乳中、閉経後
- ストレスレベル、睡眠時間
- 運動強度・頻度
- 甲状腺機能、日光浴頻度
- 消化問題、炎症レベル
- メンタルヘルス
- サプリ摂取状況
- アルコール、カフェイン摂取

### 実装すべき複雑な依存関係

#### 1. 睡眠 → ストレス → マグネシウム
```typescript
// 睡眠不足はストレスを増加させ、マグネシウム必要量を増やす
const sleepStressFactor = sleepHours < 6 ? 1.3 : sleepHours < 7 ? 1.15 : 1.0;
const stressMultiplier = stressLevel === 'high' ? 1.5 : stressLevel === 'medium' ? 1.2 : 1.0;
const magnesiumNeed = baseMagnesium * sleepStressFactor * stressMultiplier;

// 炎症レベルもマグネシウムに影響
if (inflammationLevel === 'high') {
  magnesiumNeed *= 1.3;
}
```

#### 2. 運動 → 代謝 → タンパク質・脂質
```typescript
// 運動強度と頻度から代謝率を計算
const exerciseFactor =
  exerciseIntensity === 'high' && exerciseFrequency >= 5 ? 1.4 :
  exerciseIntensity === 'high' && exerciseFrequency >= 3 ? 1.3 :
  exerciseIntensity === 'medium' && exerciseFrequency >= 4 ? 1.25 :
  exerciseIntensity === 'medium' && exerciseFrequency >= 2 ? 1.15 :
  exerciseIntensity === 'low' || exerciseFrequency < 2 ? 1.05 :
  1.0;

// タンパク質・脂質必要量を増加
const proteinNeed = baseProtein * exerciseFactor;
const fatNeed = baseFat * exerciseFactor;

// 電解質（sodium, potassium）も運動で増加
const sodiumNeed = baseSodium * (exerciseFactor > 1.2 ? 1.3 : 1.1);
const potassiumNeed = basePotassium * (exerciseFactor > 1.2 ? 1.2 : 1.05);
```

#### 3. 甲状腺機能 → ヨウ素
```typescript
// 甲状腺機能低下時はヨウ素必要量を大幅増加
const iodineNeed =
  thyroidFunction === 'hypo' ? baseIodine * 2.0 :
  thyroidFunction === 'normal' ? baseIodine :
  thyroidFunction === 'hyper' ? baseIodine * 0.5 :
  baseIodine;

// ただし、サプリ摂取している場合は減らす
if (supplementIodine) {
  iodineNeed *= 0.7; // サプリで補っているため
}
```

#### 4. 日光浴 → ビタミンD
```typescript
// 日光浴頻度でビタミンD必要量を調整
const vitaminDNeed =
  sunExposureFrequency === 'daily' ? baseVitaminD * 0.5 : // 日光で十分生成
  sunExposureFrequency === 'weekly' ? baseVitaminD * 0.8 :
  sunExposureFrequency === 'rarely' ? baseVitaminD * 1.2 :
  sunExposureFrequency === 'never' ? baseVitaminD * 1.5 :
  baseVitaminD;

// サプリ摂取している場合
if (supplementVitaminD) {
  vitaminDNeed *= 0.6;
}
```

#### 5. 消化問題 → 亜鉛・鉄の吸収率
```typescript
// 消化問題がある場合、吸収率が低下するため必要量を増やす
const absorptionFactor = digestiveIssues ? 1.3 : 1.0;
const zincNeed = baseZinc * absorptionFactor;
const ironNeed = baseIron * absorptionFactor;
```

#### 6. アルコール・カフェイン → マグネシウム・ビタミンB群
```typescript
// アルコールはマグネシウムを消耗
const alcoholFactor =
  alcoholFrequency === 'daily' ? 1.4 :
  alcoholFrequency === 'weekly' ? 1.2 :
  alcoholFrequency === 'monthly' ? 1.05 :
  1.0;

// カフェインもマグネシウムを消耗
const caffeineFactor =
  caffeineIntake === 'high' ? 1.3 :
  caffeineIntake === 'moderate' ? 1.15 :
  caffeineIntake === 'low' ? 1.05 :
  1.0;

const magnesiumNeed = baseMagnesium * alcoholFactor * caffeineFactor;
```

### 実装場所
`src/data/carnivoreTargets.ts`の`getCarnivoreTargets()`内

### テスト方法
1. ユーザープロフィールで極端な値を設定（睡眠3時間、運動強度高、ストレス高など）
2. HomeScreenのゲージで目標値が大幅に増加していることを確認
3. 通常プロフィールと比較して、妥当な差があることを確認

---

## タスク2: 食品データベース拡充

### 現状確認
1. `src/data/butcherData.ts`（または類似ファイル）を確認
2. 食品数をカウント
3. 日本の食材（和牛、イワシ、サバ、鶏レバーなど）が十分か確認

### 追加すべき食品（優先度順）

#### 高優先度（Carnivore必須）
- **内臓肉**: 牛レバー、鶏レバー、豚レバー、牛ハツ、牛タン
- **魚介**: イワシ、サバ、サーモン、マグロ、タラ、エビ、カキ
- **卵**: 鶏卵（全卵、卵黄のみ）
- **乳製品**: チーズ（チェダー、パルメザン、モッツァレラ）、バター、生クリーム

#### 中優先度（地域食材）
- 和牛（各部位）
- 地鶏
- ジビエ（鹿肉、猪肉、野生サーモン）

#### 低優先度（バリエーション）
- 加工肉（ベーコン、ソーセージ）※ただし添加物警告
- ボーンブロス

### 栄養素データの検証
**データソース**: USDA FoodData Central（最も信頼性高い）
```
https://fdc.nal.usda.gov/
```

**確認項目**:
- [ ] タンパク質（g/100g）
- [ ] 脂質（g/100g）
- [ ] ナトリウム（mg/100g）
- [ ] マグネシウム（mg/100g）
- [ ] 鉄（mg/100g）
- [ ] 亜鉛（mg/100g）
- [ ] ビタミンD（IU/100g）
- [ ] ビタミンK（μg/100g）

### 実装手順
1. USDデータを取得
2. `butcherData.ts`（または類似）に追加
3. 既存データの検証・修正

---

## タスク3: UI/UX磨き込み

### 3.1 スクロールバー完全非表示の徹底

**確認ファイル**:
- `src/index.css` または `src/App.css`
- 各コンポーネントのインラインスタイル

**実装**:
```css
/* グローバルスタイル（src/index.css） */
* {
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE/Edge */
}

*::-webkit-scrollbar {
  display: none; /* Chrome/Safari */
}

/* 特定要素でスクロール必要な場合も非表示 */
.scrollable {
  overflow-y: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.scrollable::-webkit-scrollbar {
  display: none;
}
```

**確認方法**:
1. 全画面を開いてスクロール
2. スクロールバーが一切表示されないことを確認
3. Chrome、Firefox、Safariで確認

---

### 3.2 タップ領域の拡大（最低44x44px）

**対象**: 全てのボタン、リンク、インタラクティブ要素

**実装**:
```css
/* 小さいボタンにpadding追加 */
button, a[role="button"], .interactive {
  min-width: 44px;
  min-height: 44px;
  padding: 0.75rem 1rem; /* 余裕を持たせる */
}

/* アイコンボタン */
.icon-button {
  min-width: 44px;
  min-height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
}
```

**確認方法**:
1. DevToolsでボタンのサイズを測定
2. 全てのボタンが44x44px以上であることを確認

---

### 3.3 ローディング状態の統一

**現状確認**: 各画面でローディング表示が異なる可能性

**実装**: 共通ローディングコンポーネント
```tsx
// src/components/common/LoadingSpinner.tsx
export default function LoadingSpinner({
  message = "読み込み中...",
  size = "medium" // small, medium, large
}) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
    }}>
      <div style={{
        width: size === 'small' ? '24px' : size === 'large' ? '64px' : '48px',
        height: size === 'small' ? '24px' : size === 'large' ? '64px' : '48px',
        border: '4px solid #27272a',
        borderTop: '4px solid #f43f5e', // 赤色統一
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
      }} />
      <p style={{ marginTop: '1rem', color: '#a1a1aa' }}>{message}</p>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}} />
    </div>
  );
}
```

**使用箇所**: 全画面で統一

---

## タスク4: エラーハンドリング強化

### 4.1 オフライン時の優雅なフォールバック

**実装**: オフライン検出 + キャッシュ活用
```typescript
// src/utils/networkStatus.ts
export function isOnline(): boolean {
  return navigator.onLine;
}

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}

// 使用例
const isOnline = useOnlineStatus();

if (!isOnline) {
  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <p style={{ color: '#f43f5e' }}>オフラインです</p>
      <p style={{ color: '#a1a1aa', marginTop: '0.5rem' }}>
        保存済みのデータは閲覧できます
      </p>
    </div>
  );
}
```

---

### 4.2 API制限時の対応

**実装**: Rate Limiter
```typescript
// src/utils/rateLimiter.ts
interface RateLimitState {
  requests: number[];
  blocked: boolean;
}

const state: RateLimitState = {
  requests: [],
  blocked: false,
};

const LIMITS = {
  perMinute: 10,
  perTenSeconds: 3,
  daily: 100,
};

export function checkRateLimit(): { allowed: boolean; reason?: string } {
  const now = Date.now();

  // 古いリクエスト記録を削除（1日以上前）
  state.requests = state.requests.filter(time => now - time < 24 * 60 * 60 * 1000);

  // 1日のリクエスト数チェック
  if (state.requests.length >= LIMITS.daily) {
    return { allowed: false, reason: '1日の利用上限に達しました。明日再度お試しください。' };
  }

  // 1分間のリクエスト数チェック
  const lastMinute = state.requests.filter(time => now - time < 60 * 1000);
  if (lastMinute.length >= LIMITS.perMinute) {
    return { allowed: false, reason: '少し時間を置いてから再度お試しください。' };
  }

  // 10秒間のリクエスト数チェック
  const lastTenSeconds = state.requests.filter(time => now - time < 10 * 1000);
  if (lastTenSeconds.length >= LIMITS.perTenSeconds) {
    return { allowed: false, reason: '連続送信が多すぎます。少し待ってください。' };
  }

  // 許可
  state.requests.push(now);
  return { allowed: true };
}

// aiService.tsで使用
export async function chatWithAI(prompt: string) {
  const rateCheck = checkRateLimit();
  if (!rateCheck.allowed) {
    throw new Error(rateCheck.reason);
  }

  // API呼び出し
  // ...
}
```

---

### 4.3 リトライ機構

**実装**: 指数バックオフ付きリトライ
```typescript
// src/utils/retry.ts
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  baseDelay = 1000
): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;

      // 指数バックオフ: 1秒 → 2秒 → 4秒
      const delay = baseDelay * Math.pow(2, i);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  throw new Error('Max retries reached');
}

// 使用例
const result = await retryWithBackoff(() => chatWithAI(prompt));
```

---

## タスク5: パフォーマンス最適化

### 5.1 React.memoの活用

**対象**: 重いコンポーネント（NutrientGauge、ButcherChartなど）

**実装**:
```tsx
// src/components/NutrientGauge.tsx
import { memo } from 'react';

const NutrientGauge = memo(({
  nutrient,
  current,
  target
}: NutrientGaugeProps) => {
  // 既存の実装
}, (prevProps, nextProps) => {
  // カスタム比較関数（必要な場合のみ）
  return (
    prevProps.nutrient === nextProps.nutrient &&
    prevProps.current === nextProps.current &&
    prevProps.target === nextProps.target
  );
});

export default NutrientGauge;
```

**対象コンポーネント**:
- NutrientGauge
- MiniNutrientGauge
- ButcherChart
- StreakCalendar
- NutrientTrendChart
- WeightTrendChart

---

### 5.2 仮想スクロール（履歴が多い場合）

**対象**: HistoryScreen

**実装**: react-window
```bash
npm install react-window
```

```tsx
// src/screens/HistoryScreen.tsx
import { FixedSizeList } from 'react-window';

// 履歴が100件以上ある場合のみ仮想スクロール
{logs.length > 100 ? (
  <FixedSizeList
    height={600}
    itemCount={logs.length}
    itemSize={120}
    width="100%"
  >
    {({ index, style }) => (
      <div style={style}>
        <LogItem log={logs[index]} />
      </div>
    )}
  </FixedSizeList>
) : (
  logs.map(log => <LogItem key={log.id} log={log} />)
)}
```

---

### 5.3 不要な再レンダリング削減

**確認方法**: React DevTools Profiler

**実装**: useCallback、useMemo
```tsx
// ハンドラーをuseCallbackでメモ化
const handleAddFood = useCallback((food: Food) => {
  // ...
}, [依存配列]);

// 計算結果をuseMemoでメモ化
const totalNutrients = useMemo(() => {
  return calculateTotalNutrients(logs);
}, [logs]);
```

---

## タスク6: UIチェック自動化

### 目的
Manusのトークン切れ問題を解決。Claude API + Playwrightで自動UIテストを実装。

### 実装

#### 1. 依存関係のインストール
```bash
npm install @playwright/test @anthropic-ai/sdk dotenv
```

#### 2. UIテストスクリプト作成
```typescript
// tests/ui-check-claude.ts
import { test } from '@playwright/test';
import Anthropic from '@anthropic-ai/sdk';
import fs from 'fs';
import path from 'path';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const SCREENS = [
  { name: 'Home', url: 'http://localhost:5173/' },
  { name: 'Input', url: 'http://localhost:5173/#input' },
  { name: 'History', url: 'http://localhost:5173/#history' },
  { name: 'Stats', url: 'http://localhost:5173/#stats' },
  { name: 'Settings', url: 'http://localhost:5173/#settings' },
];

test.describe('UI Check with Claude', () => {
  for (const screen of SCREENS) {
    test(`Check ${screen.name} screen`, async ({ page }) => {
      // 画面を開く
      await page.goto(screen.url);
      await page.waitForTimeout(2000); // 読み込み待機

      // スクリーンショット撮影
      const screenshot = await page.screenshot({ fullPage: true });
      const base64Image = screenshot.toString('base64');

      // Claude APIで分析
      const message = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1024,
        messages: [{
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: 'image/png',
                data: base64Image,
              },
            },
            {
              type: 'text',
              text: `この画面のUIをチェックしてください。以下の観点で問題を指摘してください：
1. スクロールバーが表示されていないか？
2. ボタンのタップ領域は十分か（最低44x44px）？
3. 色が赤（#f43f5e）で統一されているか？
4. ローディング状態は適切か？
5. エラーメッセージは明確か？
6. レイアウトの崩れはないか？
7. フォントサイズは読みやすいか？

問題がある場合のみ指摘してください。問題がない場合は「OK」とだけ答えてください。`,
            },
          ],
        }],
      });

      const result = message.content[0].type === 'text' ? message.content[0].text : '';

      // 結果を保存
      const reportPath = path.join('test-results', `ui-check-${screen.name}.md`);
      fs.mkdirSync('test-results', { recursive: true });
      fs.writeFileSync(reportPath, `# ${screen.name} Screen UI Check\n\n${result}`);

      console.log(`${screen.name}: ${result}`);

      // OKでない場合はテスト失敗
      if (result.trim() !== 'OK') {
        throw new Error(`UI issues found in ${screen.name}: ${result}`);
      }
    });
  }
});
```

#### 3. 実行スクリプト
```json
// package.json に追加
{
  "scripts": {
    "ui-check": "playwright test tests/ui-check-claude.ts"
  }
}
```

#### 4. .env に API Key 追加
```
ANTHROPIC_API_KEY=your_key_here
```

### 使用方法
```bash
# 開発サーバー起動
npm run dev

# 別ターミナルでUIチェック実行
npm run ui-check
```

### メリット
- Manusより長時間利用可能（Claude API）
- 自動化可能（CI/CDに組み込める）
- 詳細なフィードバック
- コスト効率的

---

## 実装順序（推奨）

1. **Lint修正**（即座）
2. **タスク3: UI/UX磨き込み**（効果大、実装簡単）
3. **タスク1: 栄養素計算精度向上**（最重要、やや複雑）
4. **タスク4: エラーハンドリング強化**（ユーザー体験向上）
5. **タスク5: パフォーマンス最適化**（React.memoから）
6. **タスク6: UIチェック自動化**（長期的メリット）
7. **タスク2: 食品データベース拡充**（継続的作業）

---

## 注意事項

1. **型安全性**: TypeScript型エラーゼロを維持
2. **既存機能の破壊禁止**: 修正時は既存動作を壊さない
3. **コミットメッセージ**: `Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>` を含める
4. **テスト**: 各タスク完了後、該当機能の動作確認
5. **パフォーマンス測定**: React DevTools Profilerで測定

---

## 参考リソース

- USDA FoodData Central: https://fdc.nal.usda.gov/
- React.memo: https://react.dev/reference/react/memo
- react-window: https://react-window.vercel.app/
- Playwright: https://playwright.dev/
- Claude API: https://docs.anthropic.com/
