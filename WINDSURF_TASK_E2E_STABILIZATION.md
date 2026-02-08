# Windsurf Task: E2E Test Stabilization

**タスクID**: E2E-STABILIZE-001
**担当AI**: Windsurf (Opus 4.6)
**優先度**: 🔥 High
**予想時間**: 10-15分
**トークン消費**: 大（Opus使い放題前提）

---

## 📋 タスク概要

CarnivOSの348個のE2Eテストのうち、不安定なテスト（時々失敗するflaky tests）を特定して修正する。

**背景**:
- 現在、GitHub Actionsで348個のE2Eテストが実行されている
- 一部のテストが環境・タイミング依存で不安定
- CI/CDパイプラインの信頼性を向上させる必要がある

---

## 🎯 目標

1. **不安定テストの特定**: 5回連続実行して、失敗率 > 20% のテストをリストアップ
2. **根本原因の分析**: タイミング問題、セレクタ問題、データ依存性など
3. **修正実装**: 安定化パッチを適用
4. **検証**: 修正後、10回連続で100%成功を確認

**成功基準**:
- ✅ 全テスト10回連続成功（成功率100%）
- ✅ 平均実行時間 < 3分（現状から悪化しないこと）
- ✅ GitHub Actions でグリーン ✓

---

## 📁 関連ファイル

```
tests/screens-and-flows.spec.ts    # メインE2Eテスト（348テスト）
tests/embody-user.spec.ts          # ユーザーシミュレーション
tests/visual-regression.spec.ts    # ビジュアルテスト
playwright.config.ts               # Playwright設定
```

---

## 🔍 分析手順

### Step 1: 不安定テストの特定

```bash
# 5回連続実行してflakyテストを検出
for i in {1..5}; do
  echo "=== Run $i/5 ==="
  npm test 2>&1 | tee test-run-$i.log
done

# 失敗したテストを集計
grep "✘" test-run-*.log | sort | uniq -c | sort -rn
```

**分析ポイント**:
- どのテストが何回失敗したか
- エラーメッセージのパターン
- 失敗タイミング（どのStepで失敗？）

### Step 2: 典型的な不安定性パターンを確認

| パターン | 原因 | 修正方法 |
|---------|------|----------|
| `Timeout 30000ms exceeded` | 要素読み込み遅延 | `waitFor` を追加、timeout延長 |
| `Element not visible` | アニメーション完了前 | `waitForSelector` + `state: 'visible'` |
| `Element is outside viewport` | スクロール不足 | `scrollIntoViewIfNeeded()` 追加 |
| `Storage not ready` | LocalStorage書き込み遅延 | `waitForFunction` でストレージ確認 |
| `Network request failed` | APIタイミング | `waitForResponse` でAPI完了待機 |

### Step 3: コード調査

**特に注意すべき箇所**:
```typescript
// ❌ 不安定（即座にクリック）
await page.click('.button');

// ✅ 安定（要素が見えるまで待機）
await page.waitForSelector('.button', { state: 'visible' });
await page.click('.button');

// ❌ 不安定（固定sleep）
await page.waitForTimeout(1000);

// ✅ 安定（条件待機）
await page.waitForFunction(() => {
  return localStorage.getItem('key') !== null;
});
```

---

## 🛠️ 修正実装ガイドライン

### 原則

1. **固定sleep禁止**: `waitForTimeout` は使わない
2. **動的待機**: `waitForSelector`, `waitForFunction`, `waitForResponse` を使う
3. **明示的な状態確認**: ボタンが押せるか、データが読み込まれたかを確認
4. **リトライロジック**: 重要な操作は `retry` でラップ

### 修正テンプレート

```typescript
// タイムアウト延長
test('...', async ({ page }) => {
  test.setTimeout(60000); // デフォルト30秒→60秒

  // 要素待機
  await page.waitForSelector('.loading', { state: 'hidden' });
  await page.waitForSelector('.content', { state: 'visible' });

  // クリック前に準備確認
  const button = page.locator('.submit-button');
  await button.waitFor({ state: 'visible' });
  await expect(button).toBeEnabled();
  await button.click();

  // API完了待機
  await page.waitForResponse(
    (response) => response.url().includes('/api/') && response.status() === 200
  );

  // LocalStorage確認
  await page.waitForFunction(() => {
    return localStorage.getItem('data') !== null;
  });
});
```

---

## 🧪 検証手順

### 修正後の確認

```bash
# 10回連続実行
for i in {1..10}; do
  echo "=== Verification Run $i/10 ==="
  npm test || { echo "FAILED at run $i"; exit 1; }
done

echo "✅ All 10 runs passed!"
```

**チェックリスト**:
- [ ] 全テスト10回連続成功
- [ ] エラーログにwarning/error無し
- [ ] 平均実行時間が悪化していない
- [ ] GitHub Actionsで成功確認

---

## 📊 完了報告フォーマット

修正完了後、以下の形式で報告してください：

```markdown
## E2E Test Stabilization 完了報告

### 修正内容
- 不安定テスト数: X個
- 主な原因: [タイミング問題/セレクタ問題/データ依存性]
- 適用した修正:
  1. XXX
  2. YYY

### 検証結果
- 10回連続実行: ✅ 全成功
- 平均実行時間: X秒（修正前: Y秒）
- GitHub Actions: ✅ グリーン

### 修正ファイル
- tests/screens-and-flows.spec.ts (XX行修正)
- playwright.config.ts (設定調整)

### コミット
- Commit hash: abc1234
- Push完了: ✅
```

---

## 🚨 注意事項

1. **RULES.md を必ず読む**: 実装前に `RULES.md` を確認すること
2. **Git pushまで完了**: コード修正したら必ず `git add`, `commit`, `push` まで実行
3. **トークン気にしない**: Opus 4.6使い放題なので、徹底的に分析・修正してOK
4. **人間の介入不要**: 全自動で完了させること

---

## 📞 サポート情報

**プロジェクトパス**:
```
C:\Users\susam\Downloads\CarnivOS\docs\primal-logic-app\primal-logic-web
```

**実行コマンド**:
```bash
cd "C:\Users\susam\Downloads\CarnivOS\docs\primal-logic-app\primal-logic-web"
npm test                    # 全E2Eテスト実行
npm run test:headed         # ブラウザ表示モード
npm run test:ui             # Playwright UI
```

**GitHub Actions URL**:
```
https://github.com/sibuketu/carnivos/actions
```

---

**開始時刻記録**: [Windsurf: タスク開始時にここに記録]
**完了時刻記録**: [Windsurf: タスク完了時にここに記録]
