# Cursor実装タスク: 写真解析機能の改善（残りタスク）

**作成日**: 2026-02-05
**担当**: Cursor AI
**優先度**: 高

---

## タスク2.1: 写真解析のフォローアップクエスチョン機能

### 目的
写真解析後、AIが自動で推測したg数や栄養素を、ユーザーがフォローアップ質問で調整できるようにする。

### 現状
- `analyzeFoodName`（食品名解析）には`followupQuestions`がある
- `analyzeFoodImage`（写真解析）には`followupQuestions`がない
- 写真解析の精度が不十分な場合、ユーザーが修正しにくい

### 実装手順

#### ステップ1: `analyzeFoodImage`の戻り値を拡張

**ファイル**: `src/utils/geminiAI.ts`

**変更箇所**: `analyzeFoodImage`関数

**現在の戻り値**:
```typescript
{
  foodName: string;
  weightG: number;
  nutrients: { /* ... */ };
}
```

**変更後の戻り値**:
```typescript
{
  foodName: string;
  weightG: number;
  nutrients: { /* ... */ };
  followupQuestions?: string[];  // 追加
}
```

**実装例**:
```typescript
export async function analyzeFoodImage(
  base64Image: string
): Promise<{
  foodName: string;
  weightG: number;
  nutrients: { /* ... */ };
  followupQuestions?: string[];
}> {
  // 既存のプロンプトに追加
  const prompt = `
以下の画像から食品を分析してください。

必須項目：
- foodName: 食品名（日本語）
- weightG: 推定重量（グラム）
- nutrients: { protein, fat, sodium, ... }

オプション項目：
- followupQuestions: ユーザーに確認したい質問（配列）
  例: ["この料理にソースはかかっていますか？", "調理方法は焼きですか、それとも揚げですか？"]

JSON形式で返してください。
`;

  // ... 既存の実装

  // レスポンスパース時に followupQuestions も含める
  const result = JSON.parse(responseText);
  return {
    foodName: result.foodName,
    weightG: result.weightG,
    nutrients: result.nutrients,
    followupQuestions: result.followupQuestions || [], // 追加
  };
}
```

---

#### ステップ2: `PhotoAnalysisModal`でフォローアップ質問を表示

**ファイル**: `src/components/PhotoAnalysisModal.tsx`

**追加内容**:
1. `followupQuestions`をstateで管理
2. 解析結果表示後、フォローアップ質問を表示
3. ユーザーが回答すると、AIに再質問して栄養素を再計算

**実装例**:
```typescript
const [followupQuestions, setFollowupQuestions] = useState<string[]>([]);
const [followupAnswers, setFollowupAnswers] = useState<string[]>([]);
const [showFollowup, setShowFollowup] = useState(false);

// 解析完了時
const handleAnalysisComplete = (result) => {
  setAnalysisResult(result);
  if (result.followupQuestions && result.followupQuestions.length > 0) {
    setFollowupQuestions(result.followupQuestions);
    setShowFollowup(true);
  }
};

// フォローアップ質問UI
{showFollowup && (
  <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: 'rgba(244, 63, 94, 0.1)', borderRadius: '8px' }}>
    <h3 style={{ color: '#f43f5e', marginBottom: '0.5rem' }}>追加情報を教えてください</h3>
    {followupQuestions.map((question, index) => (
      <div key={index} style={{ marginBottom: '0.5rem' }}>
        <label style={{ display: 'block', marginBottom: '0.25rem' }}>{question}</label>
        <input
          type="text"
          value={followupAnswers[index] || ''}
          onChange={(e) => {
            const newAnswers = [...followupAnswers];
            newAnswers[index] = e.target.value;
            setFollowupAnswers(newAnswers);
          }}
          style={{
            width: '100%',
            padding: '0.5rem',
            borderRadius: '4px',
            border: '1px solid #27272a',
            backgroundColor: '#18181b',
            color: '#e4e4e7',
          }}
        />
      </div>
    ))}
    <button
      onClick={() => handleFollowupSubmit()}
      style={{
        marginTop: '0.5rem',
        padding: '0.5rem 1rem',
        backgroundColor: '#f43f5e',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
      }}
    >
      栄養素を再計算
    </button>
  </div>
)}

// フォローアップ回答を送信してAIに再計算させる
const handleFollowupSubmit = async () => {
  setIsLoading(true);
  try {
    const followupPrompt = `
元の解析結果：
- 食品名: ${analysisResult.foodName}
- 重量: ${analysisResult.weightG}g
- 栄養素: ${JSON.stringify(analysisResult.nutrients)}

ユーザーからの追加情報：
${followupQuestions.map((q, i) => `Q: ${q}\nA: ${followupAnswers[i]}`).join('\n')}

この情報を元に、栄養素と重量を再計算してください。JSON形式で返してください。
`;

    const updatedResult = await chatWithAI(followupPrompt);
    // updatedResultをパースして、analysisResultを更新
    setAnalysisResult({ ...analysisResult, ...JSON.parse(updatedResult) });
    setShowFollowup(false);
  } catch (error) {
    console.error('Followup error:', error);
  } finally {
    setIsLoading(false);
  }
};
```

---

#### ステップ3: `CustomFoodScreen`でも同様の処理を追加

**ファイル**: `src/screens/CustomFoodScreen.tsx`

**変更内容**: `PhotoAnalysisModal`と同じロジックを追加（または`PhotoAnalysisModal`を共通コンポーネント化）

---

## タスク2.3: スキャン速度の改善

### 目的
写真解析の待ち時間を短縮し、ユーザー体験を向上させる。

### 実装手順

#### ステップ1: 画像リサイズ機能

**ファイル**: `src/utils/geminiAI.ts`

**追加内容**: 画像を最大1024pxにリサイズしてからAPIに送信

**実装例**:
```typescript
/**
 * 画像をリサイズする（最大幅1024px）
 */
function resizeImage(base64Image: string, maxWidth: number = 1024): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      // 横幅が maxWidth を超える場合はリサイズ
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas context is null'));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      // JPEGで圧縮（品質0.8）
      const resizedBase64 = canvas.toDataURL('image/jpeg', 0.8);
      resolve(resizedBase64);
    };

    img.onerror = (error) => reject(error);
    img.src = base64Image;
  });
}

// analyzeFoodImage内で使用
export async function analyzeFoodImage(base64Image: string) {
  // 画像をリサイズ
  const resizedImage = await resizeImage(base64Image, 1024);

  // リサイズした画像をAPIに送信
  // ... 既存の実装
}
```

---

#### ステップ2: キャッシュ機能

**ファイル**: `src/utils/geminiAI.ts`

**追加内容**: 画像のハッシュ値をキーに、解析結果をlocalStorageにキャッシュ

**実装例**:
```typescript
/**
 * 画像のハッシュ値を計算（簡易版）
 */
async function getImageHash(base64Image: string): Promise<string> {
  // Base64文字列の最初の1000文字をハッシュ化
  const sample = base64Image.substring(0, 1000);
  const encoder = new TextEncoder();
  const data = encoder.encode(sample);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

/**
 * キャッシュから取得
 */
function getCachedAnalysis(imageHash: string) {
  const cacheKey = `food_analysis_${imageHash}`;
  const cached = localStorage.getItem(cacheKey);
  if (cached) {
    try {
      const parsed = JSON.parse(cached);
      // 24時間以内のキャッシュのみ有効
      if (Date.now() - parsed.timestamp < 24 * 60 * 60 * 1000) {
        return parsed.result;
      }
    } catch (e) {
      console.error('Cache parse error:', e);
    }
  }
  return null;
}

/**
 * キャッシュに保存
 */
function setCachedAnalysis(imageHash: string, result: any) {
  const cacheKey = `food_analysis_${imageHash}`;
  localStorage.setItem(cacheKey, JSON.stringify({
    timestamp: Date.now(),
    result,
  }));
}

// analyzeFoodImage内で使用
export async function analyzeFoodImage(base64Image: string) {
  // 1. 画像ハッシュを計算
  const imageHash = await getImageHash(base64Image);

  // 2. キャッシュチェック
  const cached = getCachedAnalysis(imageHash);
  if (cached) {
    console.log('Using cached analysis result');
    return cached;
  }

  // 3. 画像をリサイズ
  const resizedImage = await resizeImage(base64Image, 1024);

  // 4. APIに送信
  const result = await /* 既存のAPI呼び出し */;

  // 5. 結果をキャッシュ
  setCachedAnalysis(imageHash, result);

  return result;
}
```

---

#### ステップ3: プログレスバー表示

**ファイル**: `src/components/PhotoAnalysisModal.tsx`

**追加内容**: 解析中に0-100%のプログレスバーを表示

**実装例**:
```typescript
const [progress, setProgress] = useState(0);

// 解析開始時
const handleAnalyze = async () => {
  setIsLoading(true);
  setProgress(0);

  // プログレスバーをアニメーション
  const progressInterval = setInterval(() => {
    setProgress(prev => {
      if (prev >= 90) return prev; // 90%で停止
      return prev + 10;
    });
  }, 500);

  try {
    const result = await analyzeFoodImage(base64Image);
    setProgress(100);
    clearInterval(progressInterval);
    setAnalysisResult(result);
  } catch (error) {
    clearInterval(progressInterval);
    // エラー処理
  } finally {
    setIsLoading(false);
  }
};

// プログレスバーUI
{isLoading && (
  <div style={{ marginTop: '1rem' }}>
    <div style={{
      width: '100%',
      height: '8px',
      backgroundColor: '#27272a',
      borderRadius: '4px',
      overflow: 'hidden',
    }}>
      <div style={{
        width: `${progress}%`,
        height: '100%',
        backgroundColor: '#f43f5e',
        transition: 'width 0.3s ease',
      }} />
    </div>
    <p style={{ textAlign: 'center', marginTop: '0.5rem', color: '#a1a1aa' }}>
      解析中... {progress}%
    </p>
  </div>
)}
```

---

## 実装順序（推奨）

1. **画像リサイズ** - 最も効果的（APIコスト削減、速度向上）
2. **プログレスバー** - ユーザー体験向上（実装簡単）
3. **キャッシュ機能** - 2回目以降の体験向上
4. **フォローアップクエスチョン** - 精度向上（やや複雑）

---

## テスト方法

### 画像リサイズのテスト
1. 大きな画像（3000x2000pxなど）を選択
2. コンソールで元画像サイズとリサイズ後のサイズを確認
3. 解析結果が正常に返ることを確認

### キャッシュのテスト
1. 同じ画像を2回解析
2. 2回目はコンソールに「Using cached analysis result」が表示されることを確認
3. localStorage に `food_analysis_` で始まるキーが保存されていることを確認

### プログレスバーのテスト
1. 写真解析を開始
2. プログレスバーが0%→90%→100%と変化することを確認
3. 解析完了後、プログレスバーが消えることを確認

### フォローアップクエスチョンのテスト
1. 料理の写真を解析
2. フォローアップ質問が表示されることを確認
3. 質問に回答して「栄養素を再計算」をクリック
4. 栄養素が更新されることを確認

---

## 注意事項

1. **型安全性**: TypeScriptの型定義を正しく更新
2. **エラーハンドリング**: 画像リサイズやキャッシュ処理でのエラーを適切に処理
3. **パフォーマンス**: 画像リサイズは非同期処理で行い、UIをブロックしない
4. **キャッシュサイズ**: localStorageの容量制限（約5MB）に注意
5. **プライバシー**: キャッシュに個人情報が含まれないように注意

---

## 参考

- Canvas API: https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API
- SubtleCrypto (ハッシュ): https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto
- localStorage: https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage
