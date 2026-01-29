# Cursor用タスク指示書: 食品選択UI

**要件定義**: `docs/FOOD_SELECTION_UI_REQUIREMENTS.md`を必ず読んでから作業開始。

---

## タスク概要

ホーム画面の「＋」ボタンから食品を選ぶUIを、5大カテゴリー構成に変更する。
ターゲット: 北米バイオハッカー（英語UI）

---

## タスク1: 現状確認

### やること
1. 現在の食品選択フロー（Home → ＋ → ?）を確認
2. 関連ファイルを特定:
   - 食品選択画面のコンポーネント
   - ButcherSelect等の既存実装
3. 現在のカテゴリ構成を確認

### 報告
- 現在の実装状態
- 変更が必要なファイル一覧

---

## タスク2: カテゴリ構成変更

### 新しい5大カテゴリー

| Icon | Display Name | 内容 |
|------|--------------|------|
| 🥩 | Ruminant Meat | 牛・羊・鹿・ヤギ |
| 🥓 | Pork & Poultry | 豚・鶏（⚠️ High Omega-6 注釈） |
| 🐟 | Seafood | 魚介類 |
| 🥚 | Eggs & Fats | 卵・脂（Dairyは下位） |
| 🫀 | Organs | 内臓全般（動物種で分けない） |

### やること
1. カテゴリアイコン/タブを5つに変更
2. 🥩 Ruminant Meatをデフォルトで開く or 最大表示
3. 🥓 Pork & Poultryに「⚠️ High Omega-6」注釈を小さく表示

---

## タスク3: 食品リスト実装

### 各カテゴリの食品リスト

要件定義（`FOOD_SELECTION_UI_REQUIREMENTS.md`）のSection 2を参照。

### UX原則
- **ラベルは使わない**（「上級者向け」等は禁止）
- **配置順序だけで優先度を表現**
  - Top: よく食べる、入手しやすい
  - Middle: 一般的だが頻度低い
  - Bottom: ニッチ、内臓系（スクロールで到達）

### やること
1. 各カテゴリに食品リストを実装
2. UX順で並べる（Top→Middle→Bottom）
3. 英語表示（Display Name使用）

---

## タスク4: Organs カテゴリ実装

### 特別な要件
- 動物種でフォルダ分け**しない**
- フラットに並べる（Beef Liver, Chicken Liver, Beef Heart...）

### 食品リスト（UX順）
1. Beef Liver
2. Chicken Liver
3. Beef Heart
4. Cod Liver (Canned)
5. Bone Marrow
6. Chicken Hearts
7. Tongue
8. Suet / Tallow

---

## タスク5: 例外加工食品の追加

### 追加する食品
各カテゴリのBottom付近に配置。

| 食品 | カテゴリ |
|------|----------|
| Pork Rinds / Chicharrones | Pork & Poultry |
| Beef Jerky / Biltong (Sugar-Free) | Ruminant Meat |
| Pemmican | Ruminant Meat |
| Bone Broth | Ruminant Meat or Seafood |
| Canned Cod Liver | Seafood or Organs |

---

## タスク6: 動作確認

### やること
1. `npm run dev`でローカル起動
2. Home → ＋ボタン → 5つのカテゴリが表示されるか
3. 各カテゴリをタップ → 食品リストが正しく表示されるか
4. 食品をタップ → 正しく追加されるか
5. エラーがないか確認

---

## 完了報告

全タスク完了後、以下を報告:
- 修正したファイル一覧
- 動作確認結果
- スクリーンショット（可能なら）

---

## 注意事項

- **英語UI**: 全て英語で表示
- **ラベル禁止**: 配置順序だけで優先度を表現
- **コードの省略禁止**: 完全な動くコードを書く
- **Gitコミット**: タスク完了ごとにコミット
  - 例: `git commit -m "食品選択UI: 5大カテゴリー実装"`

---

## 画面遷移イメージ

```
ホーム → ＋ボタン → 【5つのアイコン】

              [ 🥩 Ruminant ] ← デフォルト
              [ 🥓 Pork/Poul ]
              [ 🐟 Seafood ]
              [ 🥚 Eggs/Fats ]
              [ 🫀 Organs ]
                    ↓
              【食品リスト（UX順）】
                    ↓
              タップで追加
```
