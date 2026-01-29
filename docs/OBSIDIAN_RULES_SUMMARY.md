# Obsidianまとめ方・使い方ルール（AI用）

> **作成日**: 2026-01-27  
> **目的**: AIがObsidianを使う際のルールをまとめたドキュメント

---

## 📍 Obsidianの場所

**絶対パス**: `C:\Users\susam\Downloads\新しいフォルダー\docs\second-brain\`

**相対パス**: プロジェクトから `../../second-brain/`

---

## 🎯 Obsidianの目的

- **Cursor/Antigravity用のチケット**: 人間が見る前提
- **構造化より優先**: 構造化を優先
- **検索・参照用**: 大量になっても問題なし（検索機能で管理可能）

---

## 📝 保存ルール

### 1. 実装完了時は必ずObsidian更新

**ルール**: コードを書いたら即座に `second-brain/` に記録せよ。**例外なし**。

**記録内容**:
- ✅ 実装済み
- 🔄 一部実装
- ❌ 未実装
- 🚧 計画中止

### 2. 決定事項の即座記録

ユーザーとの会話で重要な決定があった場合、**即座に**以下のファイルを更新せよ：

- `STATUS.md`
- `DECISION_LOG.md`
- `README.md`

---

## 📂 ファイル構造

### Gemini会話の保存

```
second-brain/GEMINI_CONVERSATIONS/
  ├── original/
  │   └── YYYY-MM-DD-conversation-N.md (原文)
  └── summaries/
      └── CARNIVOS_GEMINI_CONVERSATION_SUMMARY.md (まとめ)
```

### 他のAI会話の保存

```
docs/ai-conversations/
  ├── claude/
  │   ├── original/
  │   └── summaries/
  ├── gpt/
  │   ├── original/
  │   └── summaries/
  └── gemini/
      ├── original/
      └── summaries/
```

**Obsidianにも同期**: 同じ構造で `second-brain/` にも保存

---

## 📋 まとめの作成方法

### 必須項目

1. **決定事項**: 会話で決定した内容
2. **アイデア**: 実装予定・検討中のアイデア
3. **技術的詳細**: 実装方法、制約、注意点
4. **優先度**: 高/中/低

### まとめのフォーマット

```markdown
## YYYY-MM-DD 会話まとめ

### 決定事項
- [決定内容1]
- [決定内容2]

### アイデア（未実装）
- [アイデア1] - 優先度: [高/中/低]
- [アイデア2] - 優先度: [高/中/低]

### 技術的詳細
- [技術的詳細1]
- [技術的詳細2]

### 参考: 原文
- [docs/gemini-conversations/original/YYYY-MM-DD-conversation-N.md](docs/gemini-conversations/original/YYYY-MM-DD-conversation-N.md)
```

---

## 🔄 実装への反映

### まとめから実装への流れ

1. まとめを確認
2. 実装予定のアイデアを `docs/RELEASE_FUTURE_TASKS.md` に追加
3. 決定事項を `docs/DECISION_LOG.md` に記録
4. 実装時は原文も参照可能にする

### アイデアの追跡

- **未実装アイデア**: `docs/RELEASE_FUTURE_TASKS.md`
- **実装済みアイデア**: `docs/AGENT_LOG.md` に記録

---

## 📚 関連ルールファイル

1. **`.cursor/rules/gemini_conversation_management.mdc`**
   - Gemini会話管理ルール（Obsidianへの保存方法が含まれている）

2. **`second-brain/AI_RULES.md` (5.5節)**
   - Obsidian作業ルール（厳格適用）

3. **`docs/OBSIDIAN_IMPLEMENTATION_STATUS_CHECK.md`**
   - Obsidian実装状況チェック

---

## ⚠️ 重要な注意事項

1. **例外なし**: 実装完了時は必ずObsidian更新
2. **即座記録**: 決定事項は即座に記録
3. **検索可能**: 大量になっても問題なし（検索機能で管理）
4. **構造化優先**: 構造化を優先する

---

## 📖 参考

- **Gemini会話管理ルール**: `.cursor/rules/gemini_conversation_management.mdc`
- **AI Rules**: `second-brain/AI_RULES.md`
- **実装状況チェック**: `docs/OBSIDIAN_IMPLEMENTATION_STATUS_CHECK.md`
