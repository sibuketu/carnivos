# 伝言：E2E を作りまくってほしい（他エージェント用）

**依頼**: このチャットは Android リリース用のため、E2E 増強は別エージェント／別チャットで対応してほしい。

**やること**
- **E2E をあらゆる操作で作りまくる**
- RULES.md 2.1b に従い、画面遷移・ボタン・フォーム・主要フローを**全部** E2E でカバーする
- 既存: `tests/test-items-1-28.spec.ts`, `test-items-29-120.spec.ts`, `auth.spec.ts`, `embody-user.spec.ts` 等
- 足りていない操作・画面・フローを洗い出し、Playwright の spec に追加する

**基準**
- ユーザーが手でできる操作は、できるだけ E2E で実行できるようにする
- 新規 spec は `tests/` に追加。既存 describe に test を足す形でも可
