# Cursor実装タスク: 未実装機能とアイデアズレ修正

**作成日**: 2026-02-05
**担当**: Cursor AI
**参照**: `IMPROVEMENT_IDEAS.md`, `RULES.md`

---

## 実装タスク一覧

### タスク1: 栄養素計算の改善（優先度：高）

#### 1.1 ButcherSelectとHomeScreenの目標値不一致を修正

**問題**:
- ButcherSelect（食品選択画面）が固定値`DEFAULT_CARNIVORE_TARGETS`を使用
- HomeScreenが動的値`getCarnivoreTargets()`を使用
- 追加前と追加後で目標値が異なって見える

**修正方法**:
1. HomeScreenから`dynamicTargets`をButcherSelectへpropsで渡す
2. ButcherSelect内の全ての`DEFAULT_CARNIVORE_TARGETS.xxx`を`props.dynamicTargets.xxx`に変更（約30箇所）

**影響範囲**:
- `src/screens/HomeScreen.tsx`
- `src/components/butcher/ButcherSelect.tsx`

**確認方法**:
1. ユーザープロフィール（性別、年齢、妊娠中など）を変更
2. HomeScreenのゲージとButcherSelectのゲージが同じ目標値を表示することを確認

---

#### 1.2 食品おすすめ機能（色表示）

**狙い**: 不足している栄養素を補える食品を視覚的に示す

**仕様**:
- 自動判定（ユーザー選択不要）
- 総量ベース（例: マグネシウム200mg不足 → この魚で150mg補える）
- 色で表示（枠線を光らせる、背景を薄く光らせるなど）

**実装方針**:
1. 現在の不足栄養素を計算
2. 各食品が補える量を計算
3. 上位3種の栄養素を多く含む食品に色付け（赤色: `#f43f5e`）

**影響範囲**:
- `src/components/butcher/ButcherSelect.tsx`

**確認方法**:
1. HomeScreenでマグネシウムが不足している状態を作る
2. ButcherSelectを開く
3. マグネシウムを多く含む食品（サバ、イワシなど）が光っていることを確認

---

### タスク2: 写真解析機能の改善

#### 2.1 フォローアップクエスチョン機能

**現状**: `analyzeFoodName`には`followupQuestions`があるが、`analyzeFoodImage`にはない

**要望**: 写真解析後、g数や栄養素の調整をフォローアップクエスチョンで確認

**実装方針**:
1. `analyzeFoodImage`の戻り値に`followupQuestions`を追加
2. 解析結果表示後に、必要に応じてフォローアップ質問を表示
3. ユーザーが回答した内容を元に、栄養素や重量を再計算

**影響範囲**:
- `src/utils/geminiAI.ts` (`analyzeFoodImage`関数)
- `src/components/PhotoAnalysisModal.tsx`
- `src/screens/CustomFoodScreen.tsx`

---

#### 2.2 スキャン中のTips表示

**現状**: 食品名解析時にはTipsが表示されるが、写真解析時には表示されない

**要望**: 写真解析中にもTipsを表示して待ち時間を有効活用

**実装方針**:
1. `analyzeFoodImage`実行中にTipsを表示
2. `CustomFoodScreen`や`ButcherSelect`の写真解析処理にTips表示を追加

**影響範囲**:
- `src/components/PhotoAnalysisModal.tsx`
- `src/screens/CustomFoodScreen.tsx`
- `src/components/butcher/ButcherSelect.tsx`（もし写真解析機能がある場合）

---

#### 2.3 スキャン速度の改善

**現状**: 写真解析に時間がかかる

**要望**: 解析速度を向上させたい

**実装方針**:
1. 画像のリサイズ（解像度を下げる）でAPI呼び出しを高速化
2. キャッシュ機能の追加（同じ画像の再解析を避ける）
3. プログレスバーの表示で体感速度を向上

**影響範囲**:
- `src/utils/geminiAI.ts` (`analyzeFoodImage`関数)
- `src/components/PhotoAnalysisModal.tsx`

**技術詳細**:
- 画像リサイズ: Canvas APIを使用して、最大幅1024pxにリサイズ
- キャッシュ: IndexedDBまたはlocalStorageに画像ハッシュと解析結果を保存
- プログレスバー: `PhotoAnalysisModal`に0-100%のプログレスバーを追加

---

### タスク3: バーコード読み取りのスマホ対応

#### 3.1 問題点

**現状**: スマホで「このブラウザは対応してません Chrome or Safari」と表示される

**原因**: `isBarcodeDetectorAvailable()`が`'BarcodeDetector' in window`だけをチェックしているが、実際にはモバイルブラウザ（特にiOS Safari）では`BarcodeDetector` APIが利用できない

**実装方針**:
1. モバイルブラウザの検出を追加
2. iOS Safariの場合は、代替手段（画像アップロード方式）を案内
3. Android Chromeの場合は、`BarcodeDetector` APIの実際の動作確認を追加
4. フォールバック: `@zxing/library`を使用した画像ベースのバーコード読み取り

**影響範囲**:
- `src/components/BarcodeScannerModal.tsx`
- `package.json` (`@zxing/library`を追加)

**技術詳細**:
```typescript
// モバイル判定
const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);

// フォールバック実装
import { BrowserMultiFormatReader } from '@zxing/library';
const codeReader = new BrowserMultiFormatReader();
```

---

### タスク4: AI機能説明の形式改善

#### 4.1 要望

**現状**: AIが機能を説明する際の形式が統一されていない

**要望**:
- 機能ごとに記号ナンバリング（1⃣、2⃣、3⃣など）
- 各機能内の手順は数字（1、2、3...）で番号付け

**例**:
```
1⃣ 食品追加方法
1. ホーム画面の「+ 食品追加」をタップ
2. 食品名を入力して「AI推測」をタップ
3. 栄養素を確認・修正して「保存」をタップ
```

#### 4.2 実装方針

1. `chatWithAIStructured`のプロンプトに、機能説明の形式を追加
2. 機能説明を生成する際のテンプレートを作成
3. 記号ナンバリングと数字ナンバリングの使い分けを明確化

**影響範囲**:
- `src/utils/geminiAI.ts` (`chatWithAIStructured`関数)
- AIプロンプトのテンプレート

**プロンプト例**:
```typescript
const formatPrompt = `
機能を説明する際は、以下の形式を使用してください：
- 機能ごとに記号ナンバリング（1⃣、2⃣、3⃣）
- 各機能内の手順は数字（1、2、3）で番号付け
- 例：
  1⃣ 機能名
  1. 手順1
  2. 手順2
  3. 手順3
`;
```

---

## 実装順序（推奨）

1. **タスク1.1**: ButcherSelectとHomeScreenの目標値不一致修正（最優先・影響大）
2. **タスク1.2**: 食品おすすめ機能（優先度高・ユーザー体験向上）
3. **タスク3**: バーコード読み取りのスマホ対応（モバイルユーザー向け・重要）
4. **タスク2.2**: スキャン中のTips表示（実装簡単）
5. **タスク4**: AI機能説明の形式改善（実装簡単）
6. **タスク2.1**: フォローアップクエスチョン機能（実装やや複雑）
7. **タスク2.3**: スキャン速度の改善（実装やや複雑）

---

## 注意事項

1. **起動確認必須**: 各タスク実装後、必ず`npm run dev`で起動確認
2. **既存機能の破壊禁止**: 修正時は既存の動作を壊さないこと
3. **型安全性**: TypeScriptの型エラーが出ないように実装
4. **コミットメッセージ**: 各タスク完了時に`Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>`を含める
5. **テスト**: 実装後、該当機能の動作確認を行う

---

## 参考ファイル

- `IMPROVEMENT_IDEAS.md`: 各機能の詳細な要件定義
- `RULES.md`: プロジェクト全体のルールと方針
- `src/utils/geminiAI.ts`: Gemini AI関連の実装
- `src/data/carnivoreTargets.ts`: 栄養素目標値の動的計算
