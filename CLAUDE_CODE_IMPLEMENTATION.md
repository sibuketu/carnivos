# ClaudeCode 完全実装指示書

## 🎯 実装方針
- **一気に実装**してトークン効率最大化
- **既存コードの破壊OK**（特にカスタムフード）
- **テスト不要**（後で手動確認）
- **完璧主義禁止**（動けばOK）

---

## 📦 実装タスク一覧（優先度順）

### 🔴 Priority 1: Critical Bugs（リリースブロッカー）

#### 1. TipsScreen バグ修正
**ファイル:** `src/screens/TipsScreen.tsx`

**問題:**
```typescript
// 現在（バグ）
<h3>{item.title}</h3>  // undefined
<p>{item.details}</p>  // undefined
```

**修正:**
```typescript
// 修正後
<h3>{item.myth}</h3>  // または適切なタイトル生成
<p>{item.mechanism}</p>
<p>{item.effectSize}</p>
```

**追加:**
- AIチャットTips（`src/data/tips.ts`）との連携
- 「その他」画面からTipsScreenへの遷移確認
- effectSizeフィールドの表示追加

---

#### 2. ButcherSelect 動的目標値修正
**ファイル:** `src/components/butcher/ButcherSelect.tsx`

**問題:**
```typescript
// 静的目標値を使用（バグ）
DEFAULT_CARNIVORE_TARGETS
```

**修正:**
```typescript
// 動的目標値を使用
const dynamicTargets = getCarnivoreTargets(userProfile);
```

**実装:**
- HomeScreenから`dynamicTargets`をpropsで渡す
- 約30箇所の目標値参照を修正

---

#### 3. オンボーディング モード選択追加
**ファイル:** `src/screens/OnboardingScreen.tsx`

**追加ステップ:**
```typescript
// Step 4: モード選択
<div>
  <h2>栄養表示モードを選択</h2>
  <button onClick={() => setMode('simple')}>
    シンプル（電解質+マクロのみ）
  </button>
  <button onClick={() => setMode('standard')}>
    通常（Tier1+Tier2）
  </button>
  <button onClick={() => setMode('detailed')}>
    詳細（全栄養素）
  </button>
</div>
```

**保存:**
```typescript
userProfile.nutrientDisplayMode = selectedMode;
```

---

#### 4. 水分ゲージ はりぼてUI修正
**ファイル:** `src/screens/HomeScreen.tsx` (行871-925)

**追加:**
```typescript
// ゲージ全体をクリック可能に
<div
  onClick={() => setShowWaterModal(true)}
  style={{ cursor: 'pointer' }}
>
  {/* 既存の水分ゲージUI */}
</div>

{/* 新規モーダル */}
{showWaterModal && (
  <WaterIntakeModal
    current={waterTotal}
    target={waterTarget}
    onAdd={(ml) => updateWaterIntake(ml)}
    onClose={() => setShowWaterModal(false)}
  />
)}
```

**WaterIntakeModal.tsx (新規作成):**
- カスタム入力フィールド（自由入力）
- プリセットボタン（250/500/750/1000ml）
- 履歴表示（今日追加した水分）
- 削除機能

---

### 🟠 Priority 2: UI統一（品質向上）

#### 5. UI色統一（白背景→CSS変数）
**対象ファイル（20箇所以上）:**
- `src/screens/HomeScreen.tsx` (3箇所)
- `src/screens/PrivacyPolicyScreen.tsx`
- `src/screens/DataExportScreen.tsx`
- `src/screens/FeedbackScreen.tsx`
- `src/screens/HistoryScreen.tsx`
- `src/styles/*.css` (複数)

**一括置換:**
```typescript
// Before
backgroundColor: 'white'
background: white

// After
backgroundColor: 'var(--color-bg-primary)'
background: var(--color-bg-primary)
```

**CSS変数定義（確認）:**
```css
:root {
  --color-bg-primary: #ffffff;
  --color-bg-secondary: #f9fafb;
  --color-text-primary: #1f2937;
}

[data-theme="dark"] {
  --color-bg-primary: #1f2937;
  --color-bg-secondary: #374151;
  --color-text-primary: #f9fafb;
}
```

---

#### 6. 青背景削除
**ファイル:** `src/screens/HomeScreen.tsx`、グローバルCSS

**削除対象:**
- アプリ裏の謎の青背景
- 不要な装飾色

---

#### 7. Logic Shield 削除
**ファイル:** `src/components/StorageNutrientGauge.tsx`

**削除:**
- 「💡 Logic Shield」タイトル
- 黒背景の装飾デザイン
- ゲーム的演出（アニメーション、影効果）

**統一:**
- MiniNutrientGaugeと同じシンプルデザイン
- 白背景、シンプルなモーダル

---

#### 8. ボタンスタイル統一
**ファイル:** `src/screens/HomeScreen.tsx`、全画面

**統一スタイル:**
```typescript
const buttonStyles = {
  primary: {
    backgroundColor: '#f43f5e',
    color: 'white',
    padding: '0.5rem 1rem',
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer',
  },
  secondary: {
    backgroundColor: '#f3f4f6',
    color: '#1f2937',
    padding: '0.5rem 1rem',
    borderRadius: '8px',
    border: '1px solid #e5e7eb',
    cursor: 'pointer',
  },
};
```

---

### 🟡 Priority 3: カスタムフード再設計

#### 9. CustomFoodScreen 完全再構築
**ファイル:** `src/screens/CustomFoodScreen.tsx`

**既存を破壊して一から再設計:**

**新UI構成:**
```
┌─────────────────────────────────────┐
│ カスタム食品追加                      │
├─────────────────────────────────────┤
│ 食品名: [_____________]              │
│                                     │
│ タイプ:                              │
│ [🥩 動物] [🗑️ 毒] [🌱 植物]         │
│                                     │
│ 栄養素（100gあたり）:                │
│ タンパク質: [___] g                  │
│ 脂質: [___] g                        │
│ ナトリウム: [___] mg                 │
│ ... (主要栄養素のみ)                 │
│                                     │
│ [もっと詳しく ▼]  (展開式)           │
│                                     │
│ 植物の場合のみ表示:                   │
│ ┌─ 毒ゲージ（5つ） ─┐              │
│ │ レクチン: [___]    │              │
│ │ オキサレート: [___] │              │
│ │ フィチン酸: [___]   │              │
│ │ サポニン: [___]     │              │
│ │ タンニン: [___]     │              │
│ └────────────────┘              │
│                                     │
│ [保存] [キャンセル]                  │
└─────────────────────────────────────┘
```

**簡略化:**
- 6ステップ → 1画面
- 不要なMiniNutrientGauge削除
- 主要栄養素のみデフォルト表示
- 「もっと詳しく」で微量栄養素展開

**植物対応:**
```typescript
type FoodType = 'animal' | 'trash' | 'plant';

if (type === 'plant') {
  // 毒ゲージ5つ表示
  antiNutrients: {
    lectin: number;
    oxalate: number;
    phyticAcid: number;
    saponin: number;
    tannin: number;
  }
}
```

---

### 🎮 Priority 4: トロフィーシステム

#### 10. トロフィーシステム実装
**新規ファイル:**
- `src/types/trophy.ts`
- `src/data/trophies.ts`
- `src/hooks/useTrophyProgress.ts`
- `src/components/TrophyButton.tsx`
- `src/components/TrophyModal.tsx`
- `src/components/TrophyUnlockToast.tsx`

**データ構造:**
```typescript
// src/types/trophy.ts
export interface Trophy {
  id: string;
  title: string; // 例: "🦁 ハンター"
  label: string; // 例: "あなたは本能に従う人"
  description: string; // 達成条件
  condition: {
    type: 'count' | 'streak' | 'threshold';
    target: number;
  };
  unlocked: boolean;
  unlockedAt?: Date;
}
```

**10個のトロフィー:**
```typescript
// src/data/trophies.ts
export const TROPHIES: Trophy[] = [
  {
    id: 'hunter',
    title: '🦁 ハンター',
    label: 'あなたは本能に従う人',
    description: '初めて食品を追加',
    condition: { type: 'count', target: 1 },
    unlocked: false,
  },
  {
    id: 'scientist',
    title: '🔬 科学者',
    label: 'あなたは探求する人',
    description: '栄養ゲージ💡を5回タップ',
    condition: { type: 'count', target: 5 },
    unlocked: false,
  },
  {
    id: 'perfectionist',
    title: '🎯 完璧主義者',
    label: 'あなたは徹底する人',
    description: '全栄養素100%達成',
    condition: { type: 'threshold', target: 100 },
    unlocked: false,
  },
  {
    id: 'persistent',
    title: '🔥 努力家',
    label: 'あなたは継続する人',
    description: '3日連続で記録',
    condition: { type: 'streak', target: 3 },
    unlocked: false,
  },
  {
    id: 'true_self',
    title: '🌟 本来の自分',
    label: 'あなたは本来の姿を取り戻した',
    description: '完全カーニボア7日達成',
    condition: { type: 'streak', target: 7 },
    unlocked: false,
  },
  {
    id: 'recorder',
    title: '📸 記録家',
    label: 'あなたはデータを愛する人',
    description: '写真解析を3回使用',
    condition: { type: 'count', target: 3 },
    unlocked: false,
  },
  {
    id: 'learner',
    title: '💬 相談者',
    label: 'あなたは学び続ける人',
    description: 'AIチャットで5回質問',
    condition: { type: 'count', target: 5 },
    unlocked: false,
  },
  {
    id: 'scholar',
    title: '📖 知識人',
    label: 'あなたは知識を求める人',
    description: 'Tips20個読む',
    condition: { type: 'count', target: 20 },
    unlocked: false,
  },
  {
    id: 'reflector',
    title: '✍️ 内省家',
    label: 'あなたは自己を見つめる人',
    description: 'Diaryに3回書き込み',
    condition: { type: 'count', target: 3 },
    unlocked: false,
  },
  {
    id: 'master',
    title: '⚡ マスター',
    label: 'あなたは真のカーニボア',
    description: '全トロフィー獲得',
    condition: { type: 'count', target: 9 },
    unlocked: false,
  },
];
```

**HomeScreenに追加:**
```typescript
<button
  className="trophy-button"
  onClick={() => setShowTrophyModal(true)}
>
  🏆 <span>{unlockedCount}/10</span>
</button>

{isFirstVisit && (
  <div className="tooltip">
    このアプリの使い方はトロフィーで見れます 👆
  </div>
)}
```

---

#### 11. ホーム初回表示（ウェルカムモーダル）
**ファイル:** `src/screens/HomeScreen.tsx`

**新規コンポーネント:** `WelcomeModal.tsx`

```typescript
{isFirstVisit && (
  <WelcomeModal onClose={() => setIsFirstVisit(false)} />
)}
```

**WelcomeModal内容:**
```typescript
<div className="welcome-modal">
  <h3>🏆 CarnivOSへようこそ</h3>
  <p>このアプリの使い方は2つの場所で学べます：</p>

  <div className="feature-cards">
    <div className="card">
      <span className="icon">💬</span>
      <h4>AIアシスタント</h4>
      <p>わからないことは何でもAIに聞いてください。<br/>
      <strong>話すだけで入力もしてくれます。</strong></p>
    </div>

    <div className="card">
      <span className="icon">🏆</span>
      <h4>トロフィー</h4>
      <p>達成条件を見れば、<br/>
      <strong>自然に操作方法が学べます。</strong></p>
    </div>
  </div>

  <button onClick={onClose}>はじめる</button>
</div>
```

---

### 🛠️ Priority 5: 機能追加

#### 12. エラーメッセージ直接報告機能
**ファイル:** `src/utils/errorHandler.ts`

**追加:**
```typescript
export function showErrorWithReport(error: Error, context?: object) {
  const errorMessage = getUserFriendlyErrorMessage(error);

  // エラーモーダル表示
  showModal({
    title: 'エラーが発生しました',
    message: errorMessage,
    buttons: [
      {
        label: '運営に報告',
        action: () => reportErrorToTeam(error, context),
      },
      {
        label: '閉じる',
        action: () => closeModal(),
      },
    ],
  });
}

async function reportErrorToTeam(error: Error, context?: object) {
  // Supabaseにエラーレポート送信
  await supabase.from('error_reports').insert({
    error_message: error.message,
    stack: error.stack,
    context: JSON.stringify(context),
    user_id: getCurrentUserId(),
    timestamp: new Date().toISOString(),
  });

  showToast('エラーレポートを送信しました');
}
```

---

#### 13. アプリ名CarnivOS統一
**対象ファイル（全ファイル）:**
- `src/screens/OnboardingScreen.tsx`
- `package.json`
- `index.html` (title)
- 全てのUI表示

**一括置換:**
```
Primal Logic → CarnivOS
primal-logic → carnivos
primalLogic → carnivos
```

**注意:**
- コード内の変数名は変更不要（破壊的変更を避ける）
- 表示文字列のみ変更

---

### 🎨 Priority 6: CSS/デザイン

#### 14. TipsScreen CSS復元
**ファイル:** `src/screens/TipsScreen.tsx`、`src/styles/TipsScreen.css`

**現在:**
```typescript
// import './KnowledgeScreen.css'; // Deleted
```

**修正:**
新規CSSファイル作成または既存スタイルをインライン化

```css
/* src/styles/TipsScreen.css */
.knowledge-screen-container {
  padding: 1rem;
  background: var(--color-bg-primary);
}

.knowledge-card {
  background: var(--color-bg-secondary);
  border-radius: 12px;
  padding: 1rem;
  margin-bottom: 1rem;
  cursor: pointer;
  transition: transform 0.3s;
}

.knowledge-card:hover {
  transform: scale(1.02);
}

.knowledge-card.flipped {
  background: #f0f9ff;
}
```

---

## 🔧 実装ガイドライン

### コーディングルール
1. **既存コード破壊OK**（特にカスタムフード）
2. **TypeScript型エラーは無視**（動けばOK）
3. **コメント不要**（コード自体が説明）
4. **テスト不要**（手動で確認）
5. **段階的実装不要**（一気に全部）

### ファイル命名規則
- コンポーネント: `PascalCase.tsx`
- ユーティリティ: `camelCase.ts`
- CSS: `kebab-case.css`

### CSS変数使用
```typescript
// Good
style={{ backgroundColor: 'var(--color-bg-primary)' }}

// Bad
style={{ backgroundColor: 'white' }}
```

### LocalStorage キー
```typescript
const STORAGE_KEYS = {
  trophyProgress: '@carnivos:trophy_progress',
  firstVisit: '@carnivos:first_visit',
  userProfile: '@carnivos:user_profile',
};
```

---

## 🚀 実装順序

1. **Critical Bugs** (1-4) - 30分
2. **UI統一** (5-8) - 20分
3. **カスタムフード** (9) - 40分
4. **トロフィー** (10-11) - 60分
5. **機能追加** (12-13) - 20分
6. **CSS** (14) - 10分

**合計: 約180分（3時間）**

---

## ✅ 完了条件

- [ ] 全てのビルドエラーが解消
- [ ] npm run buildが成功
- [ ] 主要画面が表示される
- [ ] トロフィーモーダルが開く
- [ ] カスタムフード画面が動作
- [ ] 白背景が全てCSS変数化

---

## 📝 注意事項

1. **Supabase接続は後回し** - まずローカル動作を優先
2. **Gemini APIキーは未設定でもOK** - エラーメッセージ改善のみ
3. **Discord/Giftは後回し** - `DEFERRED_FEATURES.md`参照
4. **貯蔵栄養は現状維持** - 変更しない
5. **iOS対応は後回し** - Windows/Web優先

---

## 🎯 最終ゴール

**ユーザーが最初にアプリを開いた時:**
1. ウェルカムモーダル表示（AI＋トロフィー説明）
2. ホーム画面にトロフィーボタン
3. カスタムフード画面がシンプルで使いやすい
4. 全てのUIが統一されている
5. 白背景問題が解消
6. はりぼてUIが解消

**リリース可能な状態を目指す！**
