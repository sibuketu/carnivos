# AI Feature Requirements (AI機能要件定義)

**Target**: North American Biohackers
**Last Updated**: 2026-01-27

---

## 1. UI Modes (2つのUIモード)

### 1.1 Fullscreen Mode (全画面モード)
- 通常のチャットUI
- 入力欄あり、会話できる
- AIとの深い対話用
- 画面全体を使用、他のUI要素は非表示

### 1.2 Browse Mode (閲覧モード)
- 全画面モードで会話した後、AIの**最後の回答だけ**を画面に表示
- 入力欄なし（読むだけ）
- AIの説明を見ながらアプリを操作できる
- 例: 操作方法を聞く → AIの説明が表示される → その説明を見ながら実際に操作

**切り替えフロー**:
```
Fullscreen Mode（会話する）
    ↓ AIが回答
Browse Mode（最後の回答を見ながら操作）
    ↓ もう一度聞きたい
Fullscreen Mode に戻る
```

---

## 2. AI Mode (統合設定)

**Location: Chat UI上で切り替え**（Settings画面ではなく、ChatGPT/Geminiと同様にチャット画面上にモード切り替えUI）

1つの設定で「AIモデル」と「出力スタイル」を同時に制御。

| Mode | Backend Model | Output Style | Use Case |
|------|---------------|--------------|----------|
| **Fast** | Gemini Flash | 簡潔（1-2行、結論のみ） | 操作確認、素早い回答 |
| **Auto** (default) | Gemini Pro | 質問に応じて自動切替 | 日常使い |
| **Deep** | Gemini Pro 2.0 | 根拠付き・詳細 | 知識系の深い質問 |

### Auto Mode Detection Logic

| Question Type | Detection Signal | Output Style |
|---------------|-----------------|--------------|
| How-to / Action | "How to", "How do I", imperative | Fast style |
| Knowledge / Why | "Why", "Is", "What is", "Should I" | Deep style |
| Data / Status | "How much", "Show me", numbers | Fast style (data-focused) |

---

## 3. Output Principles (全モード共通)

| Principle | Description |
|-----------|-------------|
| Conclusion First | Answer/action first, details after |
| Bullet Points | Prefer lists over paragraphs |
| Specific Numbers | "150g" not "a lot" |
| Max 1-2 Lines | Per point, no verbose explanations |
| Technical Terms OK | "Electrolytes" not "minerals your body needs" |
| No Labels | No "beginner" / "advanced" labeling |

---

## 4. Output Examples

### Fast Style

**User**: "How do I add food?"
```
+ > Ruminant > Ribeye > Done
Edit: long press any item.
```

**User**: "How much protein today?"
```
Protein: 142g / 180g target (79%)
Top source: Ribeye (68g)
```

### Deep Style

**User**: "Why are vegetables toxic?"
```
Plants produce defense chemicals (antinutrients) since they can't run:

- Oxalates: bind calcium, cause kidney stones
- Lectins: damage gut lining, block nutrient absorption
- Phytates: bind zinc, iron, magnesium

Carnivore eliminates all three. Most report improved digestion within 2 weeks.
```

**User**: "Is salmon better than beef?"
```
Different strengths:

- Salmon: Omega-3 (EPA/DHA), Vitamin D, Astaxanthin
- Beef: Iron, Zinc, B12, Creatine, higher satiety

Best approach: beef as base, salmon 2-3x/week for Omega-3.
```

---

## 5. Tone Guidelines

| Do | Don't |
|----|-------|
| Direct, confident | Hedging ("maybe", "it depends") |
| Evidence-based | Opinions without backing |
| Carnivore-aligned | Mainstream dietary advice |
| Respectful of user intelligence | Over-explaining basics |

---

## 6. Future: AI Personalization (Post-Launch)

- User-customizable AI behavior (tone, detail level, language)
- See IMPROVEMENT_IDEAS.md Section 6.4

---

**Source**: Claude Code requirements session (2026-01-27)
