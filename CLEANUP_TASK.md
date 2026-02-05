# 余計な機能削除タスク

## 削除対象（HomeScreen.tsx）

以下のコンポーネントとその関連コードを削除：
- QuestLog
- BodyMap3D  
- LogicShield

## 保持するもの
- StorageNutrientGauge（栄養素貯蔵ゲージ）

## 手順
1. HomeScreen.tsxから上記3つのインポートを削除
2. 使用箇所を削除
3. ビルドテスト: `npm run build`
4. 動作確認: `npm run dev`
5. コミット・デプロイ

## 完了後
AGENT_LOG.mdに記録
