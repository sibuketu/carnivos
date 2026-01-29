# Cursor用タスク指示書: 栄養素ゲージ統一

**要件定義**: `docs/NUTRIENT_GAUGE_REQUIREMENTS.md`を必ず読んでから作業開始。

---

## タスク概要

HomeScreenの栄養素ゲージ実装を基準に、他の画面にも同じ実装を適用する。

---

## タスク1: 現状確認

### やること
1. `src/screens/HomeScreen.tsx`を読んで、栄養素ゲージの実装を確認
2. 以下の関数が使われているか確認:
   - `getNutrientColor()` from `src/utils/gaugeUtils.ts`
   - `getCarnivoreTargets()` from `src/data/carnivoreTargets.ts`
   - `isNutrientVisibleInMode()` from `src/utils/nutrientPriority.ts`
3. グループ化表示（電解質⚡/マクロ🥩/その他📊）が実装されているか確認

### 報告
- HomeScreenの実装状態を報告
- 足りない要素があれば報告

---

## タスク2: HistoryScreen修正

### やること
1. `src/screens/HistoryScreen.tsx`を読む
2. HomeScreenと同じ実装を適用:
   - `nutrientDisplayMode`に基づく表示制御
   - 色は`getNutrientColor()`使用
   - Targetは`getCarnivoreTargets()`使用
   - グループ化表示
3. ハードコードされた色・targetを削除
4. 日本語があれば英語化

### 参照
- `src/screens/HomeScreen.tsx`（基準実装）

---

## タスク3: CustomFoodScreen修正

### やること
1. `src/screens/CustomFoodScreen.tsx`を読む
2. HomeScreenと同じ実装を適用
3. ハードコードされた色・targetを削除

### 参照
- `src/screens/HomeScreen.tsx`（基準実装）

---

## タスク4: RecipeScreen/PhotoAnalysisModal非表示

### やること
1. `RecipeScreen`と`PhotoAnalysisModal`を今は見せない設定にする
2. ナビゲーションやメニューから非表示にする
3. コードは削除せず、表示だけ無効化

---

## タスク5: 動作確認

### やること
1. `npm run dev`でローカル起動
2. 各画面で栄養素ゲージが正しく表示されるか確認
3. モード切り替え（Simple/Standard/Detailed）が動作するか確認
4. エラーがないか確認

---

## 完了報告

全タスク完了後、以下を報告:
- 修正したファイル一覧
- 動作確認結果
- 問題があれば報告

---

## 注意事項

- **コードの省略禁止**: 完全な動くコードを書く
- **技術用語禁止**: 報告は「〇〇ボタンを押すと△△できるようになりました」形式
- **Gitコミット**: タスク完了ごとにコミット
  - 例: `git commit -m "HistoryScreen栄養素ゲージ統一完了"`
