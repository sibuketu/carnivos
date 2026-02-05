# 🔧 Antigravity 修正タスク一覧

> **作成日**: 2026-02-02
> **目的**: COMPREHENSIVE_APP_AUDIT.md で発見された問題の修正
> **優先度**: Phase 1（CRITICAL）から順番に実行

---

## ⚡ Phase 1: CRITICAL FIXES（最優先・即座に実行）

### ✅ Task 1.1: 通知バナーの非表示機能実装

**ファイル**: `src/screens/HomeScreen.tsx` (835-888行)

**問題**:
- 通知許可プロンプトが常に表示される
- 非表示にする方法がない（×ボタンがない）
- 許可済みかどうかのチェックがない

**修正内容**:
```typescript
// 1. State を追加
const [notificationBannerDismissed, setNotificationBannerDismissed] = useState(
  () => localStorage.getItem('notification_banner_dismissed') === 'true'
);

// 2. 表示条件を追加
const shouldShowNotificationBanner =
  featureDisplaySettings.notifications &&
  !notificationBannerDismissed &&
  ('Notification' in window && Notification.permission === 'default');

// 3. バナーの条件分岐を修正
{shouldShowNotificationBanner && (
  <div style={{ /* 既存スタイル */ }}>
    {/* 既存の内容 */}
    <button
      onClick={() => {
        setNotificationBannerDismissed(true);
        localStorage.setItem('notification_banner_dismissed', 'true');
      }}
      style={{
        position: 'absolute',
        top: '0.5rem',
        right: '0.5rem',
        background: 'none',
        border: 'none',
        fontSize: '20px',
        color: '#78350f',
        cursor: 'pointer',
        padding: '0.25rem',
      }}
      title="非表示にする"
    >
      ×
    </button>
  </div>
)}
```

**テスト方法**:
1. ブラウザで開く → バナーが表示される
2. ×ボタンをクリック → バナーが消える
3. リロード → バナーが表示されない（localStorage に保存されている）
4. localStorage をクリア → バナーが再度表示される

---

### ✅ Task 1.2: Storage Nutrient Gauge の視覚化修正

**ファイル**: `src/components/StorageNutrientGauge.tsx` (82-92行)

**問題**:
- ゲージバー（視覚的な棒グラフ）が表示されない
- 数値だけが表示される
- Tailwind CSS のクラスが効いていない可能性

**調査手順**:
1. ブラウザ開発者ツールを開く
2. Storage Gauge の HTML 要素を検証
3. 以下を確認:
   - `<div className="w-full h-2.5 bg-stone-800..."` が DOM に存在するか
   - Tailwind クラスが CSS に変換されているか（Computed Styles で確認）
   - `width: XX%` が適用されているか

**修正方針A**: Tailwind クラスが効いていない場合
```typescript
// Tailwind クラスをインラインスタイルに変更
<div style={{
  width: '100%',
  height: '10px',
  backgroundColor: '#292524', // stone-800
  borderRadius: '9999px',
  overflow: 'hidden',
}}>
  <div style={{
    height: '100%',
    borderRadius: '9999px',
    width: `${Math.min(100, Math.max(0, currentStorage))}%`,
    backgroundColor: dynamicColor,
    boxShadow: `0 0 10px ${dynamicColor}40`,
    transition: 'all 0.5s ease-out',
  }} />
</div>
```

**修正方針B**: クラス名の競合の場合
```typescript
// より具体的なクラス名を使用（BEM方式）
<div className="storage-gauge__bar-container">
  <div
    className="storage-gauge__bar-fill"
    style={{
      width: `${Math.min(100, Math.max(0, currentStorage))}%`,
      backgroundColor: dynamicColor,
    }}
  />
</div>

// CSS を追加（StorageNutrientGauge.css を作成）
.storage-gauge__bar-container {
  width: 100%;
  height: 10px;
  background-color: #292524;
  border-radius: 9999px;
  overflow: hidden;
}

.storage-gauge__bar-fill {
  height: 100%;
  border-radius: 9999px;
  transition: all 0.5s ease-out;
}
```

**テスト方法**:
1. ゲージバーが視覚的に表示される
2. パーセンテージに応じてバーの長さが変わる
3. 色が正しく表示される（Red/Orange/Green/Purple）

---

### ✅ Task 1.3: AI Chat UI の完成（File Menu & Thinking Mode Menu）

**ファイル**: `src/components/dashboard/GeminiStyleChatInput.tsx`

**問題**:
- ファイルアップロードメニューのUI が実装されていない
- 思考モード選択メニューのUI が実装されていない

**修正内容**:

#### 1. ファイルメニュー UI を追加（onFileUpload prop が存在する場合のみ）
```typescript
{/* ファイルアップロードボタン */}
{onFileUpload && (
  <div style={{ position: 'relative' }} ref={fileMenuRef}>
    <button
      onClick={() => setShowFileMenu(!showFileMenu)}
      style={{
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        border: 'none',
        backgroundColor: showFileMenu ? '#f3f4f6' : 'transparent',
        color: '#374151',
        fontSize: '20px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.2s',
      }}
      title="ファイルをアップロード"
    >
      📎
    </button>

    {/* ファイルメニュー */}
    {showFileMenu && (
      <div
        style={{
          position: 'absolute',
          bottom: '50px',
          right: '0',
          backgroundColor: 'white',
          border: '1px solid #e5e7eb',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          padding: '0.5rem',
          minWidth: '200px',
          zIndex: 1000,
        }}
      >
        <button
          onClick={() => {
            fileInputRef.current?.click();
            setShowFileMenu(false);
          }}
          style={{
            width: '100%',
            padding: '0.75rem',
            border: 'none',
            backgroundColor: 'transparent',
            textAlign: 'left',
            cursor: 'pointer',
            borderRadius: '8px',
            fontSize: '14px',
            transition: 'background 0.2s',
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          📷 画像をアップロード
        </button>
      </div>
    )}
  </div>
)}
```

#### 2. 思考モード選択メニュー UI を追加（aiMode が存在する場合のみ）
```typescript
{/* 思考モード選択ボタン */}
{aiMode && (
  <div style={{ position: 'relative' }} ref={thinkingModeMenuRef}>
    <button
      onClick={() => setShowThinkingModeMenu(!showThinkingModeMenu)}
      style={{
        padding: '0.5rem 1rem',
        border: '1px solid #e5e7eb',
        borderRadius: '20px',
        backgroundColor: 'white',
        fontSize: '12px',
        fontWeight: '500',
        color: '#374151',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        transition: 'all 0.2s',
      }}
      title="思考モードを選択"
    >
      <span>⚡</span>
      <span>{thinkingModeLabels[thinkingMode]}</span>
      <span style={{ fontSize: '10px' }}>▼</span>
    </button>

    {/* 思考モードメニュー */}
    {showThinkingModeMenu && (
      <div
        style={{
          position: 'absolute',
          bottom: '50px',
          left: '0',
          backgroundColor: 'white',
          border: '1px solid #e5e7eb',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          padding: '0.5rem',
          minWidth: '250px',
          zIndex: 1000,
        }}
      >
        {(Object.entries(thinkingModeLabels) as Array<[keyof typeof thinkingModeLabels, string]>).map(([key, label]) => (
          <button
            key={key}
            onClick={() => {
              setThinkingMode(key);
              setShowThinkingModeMenu(false);
            }}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: 'none',
              backgroundColor: thinkingMode === key ? '#f3f4f6' : 'transparent',
              textAlign: 'left',
              cursor: 'pointer',
              borderRadius: '8px',
              fontSize: '14px',
              transition: 'background 0.2s',
            }}
            onMouseEnter={(e) => {
              if (thinkingMode !== key) {
                e.currentTarget.style.backgroundColor = '#f9fafb';
              }
            }}
            onMouseLeave={(e) => {
              if (thinkingMode !== key) {
                e.currentTarget.style.backgroundColor = 'transparent';
              }
            }}
          >
            <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>
              {label}
            </div>
            <div style={{ fontSize: '12px', color: '#6b7280' }}>
              {thinkingModeDescriptions[key]}
            </div>
          </button>
        ))}
      </div>
    )}
  </div>
)}
```

**テスト方法**:
1. ファイルアップロードボタン（📎）をクリック → メニューが開く
2. 「画像をアップロード」をクリック → ファイル選択ダイアログが開く
3. 思考モードボタンをクリック → メニューが開く
4. モードを選択 → 表示が変わり、localStorage に保存される

---

## 🟠 Phase 2: HIGH PRIORITY FIXES（Phase 1完了後に実行）

### ✅ Task 2.1: 写真解析重複の確認

**担当**: Claude Code（実際に確認してから報告）

**確認方法**:
1. https://carnivoslol.netlify.app を開く
2. 📷 ボタンが何個表示されるか確認
3. ボタンをクリックして、モーダルの動作を確認
4. 重複がある場合は、どの部分が重複しているかスクリーンショット

---

### ✅ Task 2.2: "Others" セクションのフィルタリング強化

**ファイル**: `src/screens/HomeScreen.tsx` (699-708行)

**修正内容**:
```typescript
// Tier 3: Other の絞り込みロジックを強化
const visibleTier3 = Object.keys(configs)
  .filter(key =>
    !TIER_1_KEYS.includes(key as NutrientKey) &&
    !TIER_2_KEYS.includes(key as NutrientKey)
  )
  .filter(key => {
    const config = configs[key as NutrientKey];
    if (!config) return false;

    // 値が0の場合は非表示
    if (config.current <= 0 && config.previewValue <= 0) return false;

    // カーニボアに重要な栄養素のみ表示
    const CARNIVORE_RELEVANT_OTHERS: NutrientKey[] = [
      'vitamin_b1', 'vitamin_b2', 'vitamin_b3', 'vitamin_b6', 'vitamin_b12',
      'vitamin_a', 'vitamin_d', 'vitamin_e', 'vitamin_k',
      'calcium', 'phosphorus', 'selenium', 'copper', 'manganese',
      'choline', 'iodine', 'potassium',
    ];

    if (!CARNIVORE_RELEVANT_OTHERS.includes(key as NutrientKey)) {
      return false;
    }

    // 表示モードによるフィルタリング
    return isNutrientVisibleInMode(key as NutrientKey, displayMode);
  }) as NutrientKey[];
```

**テスト方法**:
1. "Others" セクションに表示される栄養素が減る
2. カーニボアに重要な栄養素のみが表示される
3. 値が0の栄養素は表示されない

---

### ✅ Task 2.3: 要件定義チェック & 修正

#### 2.3.1 ナビゲーションバーの確認

**ファイル**: `src/App.tsx`

**確認項目**:
- [ ] 下部に4つのボタン（Home, History, Others + AI Action）が存在するか
- [ ] オンボーディング・認証画面で非表示になっているか

**修正が必要な場合**:
- ナビゲーションバーの表示条件を追加
```typescript
const showNavBar =
  !isOnboarding &&
  !isAuthScreen &&
  userProfile !== null;
```

#### 2.3.2 写真解析結果画面の確認

**ファイル**: `src/components/PhotoAnalysisModal.tsx`

**確認項目**:
- [ ] Before/After グラフが表示されるか
- [ ] 既存のゲージと同じデザインか（MiniNutrientGauge を使用しているか）
- [ ] 重量修正時にゲージが即座に反映されるか

---

## 🟡 Phase 3: MEDIUM PRIORITY（時間があれば）

### Task 3.1: Dead Code の削除

**方法**:
```bash
# 無効化されたコードを検索
grep -r "{false &&" src/

# 見つかったコードを削除
```

---

### Task 3.2: ESLint エラー修正

**方法**:
```bash
npm run lint:fix
```

---

## 📝 実行順序

1. **Task 1.1**: 通知バナー修正 → コミット
2. **Task 1.2**: Storage Gauge 修正 → コミット
3. **Task 1.3**: AI Chat UI 完成 → コミット
4. **Phase 1 完了**: デプロイ & 動作確認
5. **Task 2.1**: 写真解析重複確認（Claude Code が実行）
6. **Task 2.2**: Others セクション修正 → コミット
7. **Task 2.3**: 要件定義チェック → 必要に応じて修正 → コミット
8. **Phase 2 完了**: デプロイ & 動作確認

---

## ✅ 完了チェックリスト

- [ ] Task 1.1 完了（通知バナー）
- [ ] Task 1.2 完了（Storage Gauge）
- [ ] Task 1.3 完了（AI Chat UI）
- [ ] Phase 1 デプロイ完了
- [ ] Task 2.1 完了（写真解析確認）
- [ ] Task 2.2 完了（Others セクション）
- [ ] Task 2.3 完了（要件定義チェック）
- [ ] Phase 2 デプロイ完了
- [ ] ユーザーに報告

---

**作成日時**: 2026-02-02
**優先度**: Phase 1 → Phase 2 → Phase 3
