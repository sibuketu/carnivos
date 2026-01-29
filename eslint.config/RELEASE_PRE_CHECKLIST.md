# リリース前テストチェックリスト（簡易版）

> 【メモ】将来のリリース前に使用するチェックリスト
> リリース前に必ず全てのテストを実行し、全て合格することを確認してください。

## 🚀 クイック実行

### 全テストを自動実行（推奨）

**Windows:**
```bash
cd primal-logic-app/primal-logic-web
run-all-tests.bat
```

**コマンド:**
```bash
cd primal-logic-app/primal-logic-web
npm run test:all
```

---

## 📋 テスト実行チェックリスト

### ✅ 1. E2Eテスト（動作テスト）【必須】

**実行方法:**
```bash
cd primal-logic-app/primal-logic-web
npm test
```

**確認項目:**
- [ ] 全てのテストがPassed（失敗0件）
- [ ] Flakyテストが最小限（目標: 50件以下）
- [ ] テスト実行時間が10分以内

**対象テスト:**
- `test-items-1-28.spec.ts` - 基本機能テスト（1-28項目）
- `test-items-29-120.spec.ts` - 拡張機能テスト（29-120項目）
- `phase1-transition-check.spec.ts` - 移行期間機能テスト
- `ui-check.spec.ts` - UI要素表示テスト

---

### ✅ 2. Visual Regression Test（UI見た目テスト）【必須】

**実行方法:**
```bash
cd primal-logic-app/primal-logic-web
npm run test:visual
```

**確認項目:**
- [ ] 全てのスクリーンショットが一致
- [ ] 意図しないUI変更がない
- [ ] 差分がある場合は、意図的な変更か確認

**対象画面:**
- [ ] ホーム画面（デスクトップ/モバイル）
- [ ] 入力画面（ButcherSelect）（デスクトップ/モバイル）
- [ ] 履歴画面（デスクトップ/モバイル）
- [ ] Labs画面（デスクトップ）
- [ ] 設定画面（デスクトップ）
- [ ] AIチャットモーダル（デスクトップ）
- [ ] 栄養素ゲージ（詳細表示）
- [ ] Argument Card表示

**初回実行時:**
```bash
npm run test:visual:update  # ベースライン作成
```

---

### ✅ 3. iOS版テスト（Maestro）【推奨】

**実行方法:**
```bash
# 1. Maestroのインストール（初回のみ）
iwr https://get.maestro.mobile.dev -UseBasicParsing | iex

# 2. アプリを起動（別ターミナル）
cd primal-logic-app
npx expo start --ios

# 3. テスト実行（別ターミナル）
cd primal-logic-app
npm run test:e2e
```

**確認項目:**
- [ ] アプリ起動テストが成功
- [ ] ナビゲーションテストが成功
- [ ] 食品追加テストが成功
- [ ] 栄養素表示テストが成功
- [ ] AIチャットテストが成功

**対象テスト:**
- [ ] `app-launch.yaml` - アプリ起動
- [ ] `navigation-basic.yaml` - ナビゲーション
- [ ] `food-add-basic.yaml` - 食品追加
- [ ] `nutrients-display.yaml` - 栄養素表示
- [ ] `ai-chat-basic.yaml` - AIチャット

---

## ⚠️ リリース前の注意事項

1. **全てのテストが合格するまでリリースしない**
2. **Flakyテストが多い場合は、原因を調査して修正**
3. **Visual Regression Testで差分がある場合は、意図的な変更か確認**
4. **iOS版テストが失敗する場合は、実機で確認**

---

## 📊 テスト結果の記録

リリース前に、以下の情報を記録してください：

- **テスト実行日時**: 
- **E2Eテスト結果**: Passed / Failed / Flaky
- **Visual Regression Test結果**: Passed / Failed
- **iOS版テスト結果**: Passed / Failed
- **テスト実行時間**: 
- **発見した問題**: 

---

## 🔄 詳細なチェックリスト

より詳細なチェックリストは `RELEASE_CHECKLIST.md` を参照してください。

---

最終更新: 2026-01-03

## 📊 現在の実装状況（2026-01-03）

### ✅ 実装完了機能
- ✅ グリシン:メチオニン比率ゲージ（ホーム画面に表示）
- ✅ ボーンブロス提案機能（グリシン:メチオニン比が低い場合に表示）
- ✅ Visual Regression Test（全画面・全ブラウザ対応）
- ✅ E2Eテスト（Playwright）

### ⚠️ テスト状況
- ✅ Visual Regression Test: 実行済み（一部失敗あり、要確認）
- ✅ E2Eテスト: 実行済み（結果要確認）
- ⏸️ iOS版テスト（Maestro）: 後回し（Apple Developer Programが必要・ネットが不安定）

### 📝 次のステップ
1. Visual Regression Testの失敗原因を特定して修正
2. E2Eテスト結果の確認と修正
3. コード品質チェック（lint、型チェック）
4. ドキュメントの最終更新
