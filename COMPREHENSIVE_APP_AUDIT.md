# 🔍 CarnivOS 完全監査レポート
> **作成日**: 2026-02-02
> **目的**: アプリの全問題を自律的に発見・記録し、修正計画を立てる
> **ステータス**: 🚨 修正必須の問題あり

---

## 📊 監査結果サマリー

| 重要度 | 問題数 | カテゴリ |
|:---:|:---:|:---|
| 🔴 CRITICAL | 3 | UX破壊、機能不全 |
| 🟠 HIGH | 4 | 要件未対応、UI不具合 |
| 🟡 MEDIUM | 2 | 最適化、クリーンアップ |

**総合評価**: ⚠️ **リリース前に修正必須**

---

## 🔴 CRITICAL ISSUES（最優先修正）

### ❌ 1. 通知バナーが常に表示される (HomeScreen.tsx:835-888)

**問題**:
- 通知許可プロンプトが**常に**ホーム画面上部に表示される
- 許可済みかどうかのチェックなし
- 非表示にする方法なし（×ボタンもなし）
- ユーザーが通知を望まない場合でも消せない

**影響**:
- UX最悪（画面が狭くなる、目障り）
- カーニボアUX原則「余計なストレスを与えない」に違反

**場所**: `src/screens/HomeScreen.tsx` 835-888行

**修正方法**:
```typescript
// 以下の条件で表示すべき:
// 1. 通知機能が有効（featureDisplaySettings）
// 2. 通知許可がまだ「default」（未回答）
// 3. ユーザーが明示的に非表示にしていない

const [notificationBannerDismissed, setNotificationBannerDismissed] = useState(
  () => localStorage.getItem('notification_banner_dismissed') === 'true'
);

const shouldShowNotificationBanner =
  featureDisplaySettings.notifications &&
  !notificationBannerDismissed &&
  ('Notification' in window && Notification.permission === 'default');

// バナー内に×ボタンを追加
<button onClick={() => {
  setNotificationBannerDismissed(true);
  localStorage.setItem('notification_banner_dismissed', 'true');
}}>×</button>
```

**優先度**: 🔴 **最優先** - 即座に修正

---

### ❌ 2. Storage Nutrient Gauges が視覚的に表示されない

**問題**:
- `StorageNutrientGauge` コンポーネントは数値を表示するが、ゲージバー（視覚的な棒グラフ）が表示されない
- ユーザーは「数字だけでてゲージが出ない」と報告
- Tailwind CSS は正しく設定されているため、別の原因

**場所**:
- `src/components/StorageNutrientGauge.tsx` 82-92行（ゲージバー描画部分）
- `src/screens/HomeScreen.tsx` 768-801行（使用箇所）

**考えられる原因**:
1. CSS クラス名の競合（他のスタイルで上書きされている）
2. Tailwind の JIT モードでクラスが生成されていない
3. コンポーネントの描画順序の問題
4. `currentStorage` の値が正しく渡されていない

**検証が必要**:
```bash
# ブラウザ開発者ツールで確認すべき項目:
1. .bg-stone-800, .rounded-full などのクラスが適用されているか
2. ゲージバーのdivが DOM に存在するか
3. width スタイルが正しく適用されているか（例: width: 70%）
4. backgroundColor が設定されているか
```

**修正方針**:
1. Tailwind クラスをインラインスタイルに変更（確実に動作）
2. または、CSS モジュールを使用
3. デバッグ用に一時的に固定値でテスト

**優先度**: 🔴 **最優先** - ユーザーが明確に報告している

---

### ❌ 3. AI Chat UI が不完全 (GeminiStyleChatInput.tsx)

**問題**:
- ファイルアップロードメニューのUI が実装されていない
  - `showFileMenu` の state は存在するが、JSX がない
- 思考モード選択メニューのUI が実装されていない
  - `showThinkingModeMenu` の state は存在するが、JSX がない
- 空の `<style>` タグにプレースホルダーコメントのみ

**場所**: `src/components/dashboard/GeminiStyleChatInput.tsx`
- 34-42行: state 定義
- 50-64行: useEffect でメニュー外クリック処理は完了
- 184-189行: 空の style タグ

**影響**:
- AI チャット機能が不完全
- ユーザーが「AIチャットのUIおかしい」と報告
- ファイルアップロードボタンをクリックしても何も起きない

**修正方法**:
```typescript
// ファイルメニュー UI を追加（例）
{showFileMenu && (
  <div ref={fileMenuRef} className="file-menu">
    <button onClick={() => fileInputRef.current?.click()}>
      📷 画像をアップロード
    </button>
    <button onClick={() => fileInputRef.current?.click()}>
      📄 ドキュメントをアップロード
    </button>
  </div>
)}

// 思考モード選択メニュー UI を追加
{showThinkingModeMenu && (
  <div ref={thinkingModeMenuRef} className="thinking-mode-menu">
    {Object.entries(thinkingModeLabels).map(([key, label]) => (
      <button key={key} onClick={() => setThinkingMode(key as any)}>
        {label}: {thinkingModeDescriptions[key]}
      </button>
    ))}
  </div>
)}
```

**優先度**: 🔴 **高** - AI機能の重要部分

---

## 🟠 HIGH PRIORITY ISSUES（重要修正）

### ⚠️ 4. 写真解析機能の重複表示（要確認）

**問題**:
ユーザーが「写真解析機能が二つUIとして表示されてる」と報告

**現状**:
- `PhotoAnalysisModal`: 解析結果の確認用（HomeScreen.tsx 1842-1852行）
- `showPhotoOrBarcodeModal`: 写真/バーコード選択用（HomeScreen.tsx 1855-1984行）
- 📷 ボタン: 1つだけ（HomeScreen.tsx 1085-1118行）

**要検証**:
1. ボタンが複数表示されているか？
2. モーダルが同時に2つ開くか？
3. 別の場所に写真機能のボタンがあるか？

**調査方法**:
- 実際にデプロイ版（https://carnivoslol.netlify.app）で確認
- ブラウザ開発者ツールで📷ボタンを検索（`button` 要素で "📷" を含むもの）

**優先度**: 🟠 **高** - ユーザー報告あり、要確認

---

### ⚠️ 5. "Others" セクションの栄養素が多すぎる

**問題**:
ユーザーが「その他ってもっと絞るんじゃないの」と指摘

**場所**: `src/screens/HomeScreen.tsx` 755-765行
```typescript
{/* Tier 3: Other (Verified Metrics) */}
{visibleTier3.length > 0 && (
  <div className="tier-section">
    <h3 className="text-sm font-bold text-gray-500 mb-2">
      {NUTRIENT_GROUPS.other.label}
    </h3>
    {/* ... */}
  </div>
)}
```

**現状の問題**:
- Tier 1, Tier 2 に含まれない全ての栄養素が "Others" に入る
- フィルタリングロジックが不十分
- ユーザーが必要としない栄養素まで表示される可能性

**修正方針**:
```typescript
// 以下の条件で絞り込むべき:
1. 実際に摂取した栄養素のみ表示（0の場合は非表示）
2. カーニボアに重要な栄養素のみ（例: B群ビタミン、微量ミネラル）
3. 植物由来の栄養素（ファイバー、フィタート等）は「Avoid Zone」として別セクションへ

const visibleTier3 = Object.keys(configs)
  .filter(key => !TIER_1_KEYS.includes(key) && !TIER_2_KEYS.includes(key))
  .filter(key => {
    const config = configs[key];
    // 値が0の場合は非表示
    if (config.current <= 0 && config.previewValue <= 0) return false;
    // カーニボア関連栄養素のみ（要定義）
    return CARNIVORE_RELEVANT_NUTRIENTS.includes(key);
  });
```

**優先度**: 🟠 **中** - UX改善

---

### ⚠️ 6. 要件定義と実装のギャップ（REQUIREMENTS.md）

**問題**:
ユーザーが「要件はもう決まってる けど実装してない」「決めたこと実装されてないとか」と指摘

**要検証項目**:

#### 6.1 ナビゲーションバー（REQUIREMENTS.md:12-13）
- ✅ 要件: 下部に4つのボタン（Home, History, Others + AI Action）
- ❓ 実装: 確認が必要（App.tsx で確認）
- ✅ 要件: オンボーディング・認証画面では非表示
- ❓ 実装: 確認が必要

#### 6.2 栄養素ゲージ（REQUIREMENTS.md:14-16）
- ✅ 要件: Daily（毎日リセット）
- ✅ 実装: MiniNutrientGauge で完了
- ✅ 要件: Storage（長期蓄積、枯渇日数管理）
- ⚠️ 実装: StorageNutrientGauge は存在するが、視覚的に動作していない（問題#2）

#### 6.3 写真解析結果画面（REQUIREMENTS.md:24-27）
- ✅ 要件: Before/After グラフ表示
- ❓ 実装: PhotoAnalysisModal で確認が必要
- ✅ 要件: 既存ゲージと同じデザイン
- ❓ 実装: 確認が必要
- ✅ 要件: 重量修正時に即座にゲージ反映
- ❓ 実装: 確認が必要

**優先度**: 🟠 **中〜高** - 要件との整合性確認が必要

---

### ⚠️ 7. 💡（Logic Shield）セクションのUI問題

**問題**:
ユーザーが「💡の所でのUIも変やし」「💡のやつは全部の栄養ゲージの反映すべき」と指摘

**現状**:
- 💡 アイコンは `StorageNutrientGauge.tsx` に存在（70-78行）
- モーダル（Logic Shield）は実装されている（96-220行）
- ただし、Storage Gauge が視覚的に動作していない（問題#2）

**要検証**:
1. 💡 ボタンが正しく動作するか
2. Logic Shield モーダルが開くか
3. 「全部の栄養ゲージの反映すべき」の意味を明確化

**修正方針**:
- ユーザーの意図を確認してから対応
- 可能性: Impact Factors（栄養素の影響因子）を全ゲージに表示する機能？

**優先度**: 🟡 **中** - 要件明確化が必要

---

## 🟡 MEDIUM PRIORITY ISSUES（最適化・改善）

### 📝 8. HomeScreen.tsx に無効化されたコード（Dead Code）

**場所**: `src/screens/HomeScreen.tsx` 近辺（要確認）
- 過去の修正で `{false && ...}` で無効化されたコードが残っている可能性
- Antigravity が「zombie UI」として削除した履歴あり

**修正方法**:
```bash
# 無効化されたコードを検索
grep -r "{false &&" src/
```

**優先度**: 🟡 **低** - コードクリーンアップ

---

### 📝 9. ESLint エラー 136個残存

**問題**:
- 主要エラーは修正済み
- 残り136個は未使用変数など軽微なもの

**優先度**: 🟡 **低** - 後回し可

---

## 🎯 修正優先順位と実行計画

### Phase 1: 🔴 CRITICAL（即座に修正）

1. ✅ **通知バナー修正** (問題#1)
   - 推定時間: 15分
   - 担当: Antigravity（実装）
   - 確認: ローカル & デプロイ確認

2. ✅ **Storage Gauge 視覚化修正** (問題#2)
   - 推定時間: 30分
   - 担当: Antigravity（デバッグ & 修正）
   - 確認: ブラウザ開発者ツールで検証

3. ✅ **AI Chat UI 完成** (問題#3)
   - 推定時間: 20分
   - 担当: Antigravity（UI実装）
   - 確認: 動作テスト

### Phase 2: 🟠 HIGH（優先修正）

4. ✅ **写真解析重複調査** (問題#4)
   - 推定時間: 10分（確認のみ）
   - 担当: Claude Code（デプロイ版確認）
   - 方法: carnivoslol.netlify.app で実際に確認

5. ✅ **Others セクション絞り込み** (問題#5)
   - 推定時間: 20分
   - 担当: Antigravity（ロジック修正）

6. ✅ **要件定義チェック** (問題#6)
   - 推定時間: 30分（確認 + 修正）
   - 担当: Claude Code（確認）→ Antigravity（実装）

7. ✅ **💡 セクション確認** (問題#7)
   - 推定時間: 15分（確認 → ユーザーに確認）
   - 担当: Claude Code

### Phase 3: 🟡 MEDIUM（時間があれば）

8. Dead Code 削除
9. ESLint 残エラー修正

---

## 📋 修正チェックリスト

- [ ] **問題#1**: 通知バナーに非表示ボタン追加 & 条件判定実装
- [ ] **問題#2**: Storage Gauge のゲージバー視覚化修正
- [ ] **問題#3**: AI Chat の file menu & thinking mode menu UI 実装
- [ ] **問題#4**: 写真解析重複の有無を確認
- [ ] **問題#5**: Others セクションのフィルタリング強化
- [ ] **問題#6**: REQUIREMENTS.md との整合性確認 & 修正
- [ ] **問題#7**: 💡 セクションの意図を確認 & 対応
- [ ] **Phase 1 完了後**: デプロイ & 動作確認
- [ ] **Phase 2 完了後**: ユーザーに報告 & フィードバック収集

---

## 🛠️ 次のアクション

**即座に実行**:
1. この監査レポートを `docs/AGENT_LOG.md` に記録
2. Phase 1 の修正を Antigravity にタスク化して渡す
3. 修正完了後、carnivoslol.netlify.app で動作確認

**ユーザーへの報告内容**:
```
🔍 アプリ全体を監査しました。以下の問題を発見:

🔴 最優先修正（3件）:
1. 通知バナーが消せない → 非表示ボタン追加
2. Storage Gauge が視覚的に表示されない → 修正中
3. AI Chat UI が未完成 → メニュー実装

🟠 重要修正（4件）:
4. 写真解析の重複（要確認）
5. Others セクションの絞り込み強化
6. 要件定義との整合性チェック
7. 💡 セクションの確認

修正を開始します。Phase 1（最優先3件）を先に完了させます。
```

---

**監査完了日時**: 2026-02-02
**次回監査予定**: Phase 1修正完了後
