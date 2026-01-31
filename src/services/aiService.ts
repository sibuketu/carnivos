/**
 * CarnivOS (カーニボス) - AI Service (Gemini API)
 *
 * Google Generative AI SDKを使用したAI機能の実装
 */

import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import { REMEDY_LOGIC } from '../data/remedyLogic';
import { logError, getUserFriendlyErrorMessage } from '../utils/errorHandler';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

if (!apiKey && import.meta.env.DEV) {
  console.warn(
    'Gemini APIキーが設定されていません。\n' +
    'VITE_GEMINI_API_KEY を .env ファイルに設定してください。'
  );
}

// Gemini AIクライアントを初期化
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

/**
 * Gemini APIが利用可能かどうかをチェック
 */
export const isGeminiAvailable = (): boolean => {
  return genAI !== null && apiKey !== undefined;
};

/**
 * AIチャット機能: カーニボアダイエットに関する質問に回答
 *
 * 情報源を限定し、専門家の主張や科学的根拠に基づいた回答を生成します。
 *
 * @param userMessage ユーザーのメッセージ
 * @param chatHistory 会話履歴（文脈を理解するため）
 * @returns AIの応答メッセージ
 */
/**
 * AIチャット機能のレスポンス型定義
 */
import type { TodoItem } from '../types';

interface AIResponse {
  answer: string;
  thinking?: string;
  verification?: {
    plan: string[];
    execution: Array<{ question: string; answer: string }>;
    status: 'verified' | 'uncertain' | 'needs_human_review';
  };
  citations?: Array<{
    sentence: string;
    source: string; // 専門家名または研究名
    confidence: number; // 0-1
  }>;
  todos?: TodoItem[]; // AIが提案するTodoリスト
}

/**
 * XML構造化レスポンスをパースする関数
 */
function parseStructuredResponse(text: string): AIResponse {
  const response: AIResponse = {
    answer: '',
  };

  // <thinking>タグから思考プロセスを抽出
  const thinkingMatch = text.match(/<thinking>([\s\S]*?)<\/thinking>/i);
  if (thinkingMatch && thinkingMatch[1]) {
    response.thinking = thinkingMatch[1].trim();
  }

  // <answer>タグから回答を抽出
  const answerMatch = text.match(/<answer>([\s\S]*?)<\/answer>/i);
  if (answerMatch && answerMatch[1]) {
    response.answer = answerMatch[1].trim();
  }

  // <verification>タグから検証情報を抽出（Phase 2）
  const verificationMatch = text.match(/<verification>([\s\S]*?)<\/verification>/i);
  if (verificationMatch && verificationMatch[1]) {
    const verificationText = verificationMatch[1].trim();

    // 検証計画を抽出
    const planMatch = verificationText.match(/<plan>([\s\S]*?)<\/plan>/i);
    if (planMatch && planMatch[1]) {
      const planItems = planMatch[1]
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line.length > 0 && line.match(/^[-•\d]/));
      response.verification = {
        plan: planItems,
        execution: [],
        status: 'uncertain',
      };
    }

    // 検証実行結果を抽出
    const executionMatch = verificationText.match(/<execution>([\s\S]*?)<\/execution>/i);
    if (executionMatch && executionMatch[1]) {
      const executionText = executionMatch[1].trim();
      const qaPairs = executionText.split(/Q:|A:/i).filter((item) => item.trim().length > 0);
      const execution: Array<{ question: string; answer: string }> = [];

      for (let i = 0; i < qaPairs.length; i += 2) {
        if (qaPairs[i] && qaPairs[i + 1]) {
          execution.push({
            question: qaPairs[i].trim(),
            answer: qaPairs[i + 1].trim(),
          });
        }
      }

      if (response.verification) {
        response.verification.execution = execution;
      }
    }

    // 検証ステータスを抽出
    const statusMatch = verificationText.match(
      /<status>(verified|uncertain|needs_human_review)<\/status>/i
    );
    if (statusMatch && response.verification) {
      response.verification.status = statusMatch[1] as
        | 'verified'
        | 'uncertain'
        | 'needs_human_review';
    }
  }

  // <citations>タグから引用情報を抽出（Phase 3）
  const citationsMatch = text.match(/<citations>([\s\S]*?)<\/citations>/i);
  if (citationsMatch && citationsMatch[1]) {
    const citationsText = citationsMatch[1].trim();
    const citationItems: Array<{ sentence: string; source: string; confidence: number }> = [];

    // 各引用を抽出（形式: sentence|source|confidence）
    const citationLines = citationsText.split('\n').filter((line) => line.trim().length > 0);
    for (const line of citationLines) {
      const parts = line.split('|').map((p) => p.trim());
      if (parts.length >= 2) {
        citationItems.push({
          sentence: parts[0] || '',
          source: parts[1] || '',
          confidence: parts[2] ? parseFloat(parts[2]) : 0.8,
        });
      }
    }

    if (citationItems.length > 0) {
      response.citations = citationItems;
    }
  }

  // <todos>タグからTodo情報を抽出
  const todosMatch = text.match(/<todos>([\s\S]*?)<\/todos>/i);
  if (todosMatch && todosMatch[1]) {
    const todosText = todosMatch[1].trim();
    const todoItems: TodoItem[] = [];

    // 各Todoを抽出（形式: title|description|action_type|action_params）
    const todoLines = todosText.split('\n').filter((line) => line.trim().length > 0);
    for (const line of todoLines) {
      const parts = line.split('|').map((p) => p.trim());
      if (parts.length >= 1) {
        const actionType = (parts[2] as TodoItem['actionType']) || 'custom';
        const todo: TodoItem = {
          id: `todo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          title: parts[0] || '',
          description: parts[1] || undefined,
          actionType,
          actionParams: parts[3] ? JSON.parse(parts[3]) : undefined,
          isCompleted: false,
        };

        // 後方互換性のため、actionも設定
        if (parts[2]) {
          todo.action = {
            type: actionType,
            params: parts[3] ? JSON.parse(parts[3]) : undefined,
          };
        }

        todoItems.push(todo);
      }
    }

    if (todoItems.length > 0) {
      response.todos = todoItems;
    }
  }

  return response;
}

export interface ChatAIResponse {
  answer: string;
  todos?: TodoItem[];
  citations?: Array<{ sentence: string; source: string; confidence: number }>;
}

/**
 * Auto mode: detect question type to choose output style
 */
type OutputStyle = 'fast_style' | 'deep_style';

function detectAutoModeStyle(userMessage: string): OutputStyle {
  const lower = userMessage.toLowerCase();

  // Deep signals: "why", knowledge questions, comparisons
  const deepSignals = ['why', 'what is', 'should i', 'explain', 'compare', 'difference', 'better', 'versus', ' vs ', 'is it true', 'is there'];
  const hasDeep = deepSignals.some(s => lower.includes(s));

  // Fast signals: how-to, data queries, action requests
  const fastSignals = ['how to', 'how do i', 'how much', 'show me', 'add ', 'where', 'when', 'what did i'];
  const hasFast = fastSignals.some(s => lower.includes(s));

  if (hasFast && !hasDeep) return 'fast_style';
  if (hasDeep) return 'deep_style';
  return 'fast_style'; // default to concise
}

function getOutputStylePrompt(mode: 'fast' | 'auto' | 'deep', userMessage: string): string {
  let style: OutputStyle;

  if (mode === 'auto') {
    style = detectAutoModeStyle(userMessage);
  } else if (mode === 'fast') {
    style = 'fast_style';
  } else {
    style = 'deep_style';
  }

  if (style === 'fast_style') {
    return `
【OUTPUT STYLE: FAST】
- 1-2 sentences maximum. Conclusion/action FIRST.
- Specific numbers ("150g" not "a lot").
- No preamble, no greetings, no filler.
- Bullet points only if listing 3+ items.
`;
  } else {
    return `
【OUTPUT STYLE: DEEP】
- Detailed analysis with evidence and mechanisms.
- Bullet points for clarity.
- Specific numbers and data.
- Conclusion first, then supporting details.
- Reference research or biological mechanisms where relevant.
- 5-10 sentences is acceptable for complex topics.
`;
  }
}

export async function chatWithAI(
  userMessage: string,
  chatHistory: Array<{ role: 'user' | 'assistant'; content: string }> = [],
  enableVerification: boolean = false,
  enableCitations: boolean = true,
  aiMode: 'purist' | 'realist' = 'purist',
  thinkingMode: 'fast' | 'auto' | 'deep' = 'auto',
  diaryAndFoodData?: { logs: Array<{ date: string; diary?: string; foods: string[] }> },
  userProfile?: {
    height?: number;
    weight?: number;
    age?: number;
    gender?: 'male' | 'female';
    [key: string]: unknown;
  }
): Promise<string> {
  const response = await chatWithAIStructured(
    userMessage,
    chatHistory,
    enableVerification,
    enableCitations,
    aiMode,
    thinkingMode,
    diaryAndFoodData,
    userProfile
  );
  return response.answer;
}

// Deprecated: Internal implementation retained for reference
async function original_chatWithAI(
  userMessage: string,
  chatHistory: Array<{ role: 'user' | 'assistant'; content: string }> = [],
  enableVerification: boolean = false,
  enableCitations: boolean = true
): Promise<string> {
  if (import.meta.env.DEV) {
  }

  if (!isGeminiAvailable()) {
    throw new Error(
      'Gemini APIキーが設定されていません。\n' +
      'VITE_GEMINI_API_KEY を .env ファイルに設定してください。\n' +
      'AIチャット機能を使用するには、APIキーの設定が必要です。'
    );
  }

  try {
    if (import.meta.env.DEV) {
    }
    // Stableモデルを使用（公式ドキュメントより: gemini-2.5-flash）
    const model = genAI!.getGenerativeModel({ model: 'gemini-2.5-flash' });

    // 専門家と情報源の定義
    const expertContext = `
【カーニボアダイエットの主要な情報源】
以下の研究や理論を参照してください。これらの情報源に基づいて回答してください。

1. **実践的なカーニボアダイエットのアドバイス、症状の対処法**: カーニボア実践者の経験に基づく対処法
2. **カーニボアダイエットの長期実践**: 運動パフォーマンスとカーニボアの関係
3. **動物性食品の栄養密度、植物毒について**: 植物性食品の抗栄養素に関する研究
4. **カーニボアの生物学的根拠、進化的適合性**: 人類の進化と食事の関係
5. **栄養科学、カーニボアの科学的検証**: 栄養学の科学的検証
6. **論証スタイル、疫学の批判**: 観察研究の限界に関する批判
7. **Stefansson (1928) Bellevue Hospital Study**: 肉のみの食事の歴史的臨床研究
8. **Cahill (1970s) Starvation Studies**: グルコース-アスコルビン酸拮抗（Glucose-Ascorbate Antagonism）

【重要な原則】
- カーニボアダイエットは「肉、魚、卵、内臓」のみを食べる食事法
- 植物性食品は不要であり、植物毒（オキサレート、レクチン、フィチン酸など）を避ける
- 電解質（特にナトリウム、マグネシウム）が重要
- ビタミンCの必要量は低炭水化物状態では大幅に減少（Glucose-Ascorbate Antagonism）。壊血病を防ぐために必要な最小量は約10mg。肉食のみでも1日約30mgを摂取可能なため、肉で十分足りる。RDA基準の90mgは不要

【乳製品について】
- **乳製品反対派の視点**: 乳製品（特に牛乳）を避けることを推奨。理由：乳糖不耐症、カゼインの炎症性、現代の酪農方法（ホルモン、抗生物質）、進化的に人類は乳糖を消化できない（成人の乳糖不耐症は正常）
- **乳製品容認派の視点**: 乳糖耐性がある場合に限り、バター、チーズ、生クリームを許可。理由：栄養密度、多様性、実践者の選択肢
- **アプリの立場**: ユーザーの「乳糖耐性」設定に基づいて判断。乳糖耐性がない場合は、乳製品を避けることを推奨。乳糖耐性がある場合でも、牛乳は避け、バター・チーズ・生クリームに限定することを推奨。
- **文化的差異**: フランス・ドイツなど乳製品文化が強い地域では、乳製品の扱いが異なる可能性があるが、カーニボアの原則（進化的適合性）は変わらない。

【推論方法（Argumentation Style）- カーニボア専門家の思考パターンを模倣】

カーニボア専門家の**推論方法、思考パターン、主張の仕方、口調、論証の構造**を真似してください。専門家の名前は出さず、思考パターンと論証構造のみを参考にしてください。

**基本的な思考の原則:**
1. **進化的適合性を最優先**: 人類が何百万年も食べてきたもの（肉・魚・卵）が最適
2. **メカニズム重視**: 表面的な相関ではなく、生物学的・生化学的なメカニズムを説明
3. **疫学研究への批判**: Observational studies（観察研究）は因果関係を証明できない
4. **利益構造への警戒**: 研究資金、利益団体、食品業界の影響を常に考慮
5. **実践者の声を重視**: 何千人もの実践者が健康を改善している事実

**論証の4ステップ（疑問・誤解・批判への対応時）:**

1. **Step 1 (Validate: 検証・共感)**: 一般的な信念を認める
   - 「確かに、多くの医師や栄養士が〇〇と言っていますね。その気持ちはわかります」
   - 「一般的にはそう信じられていますね」
   - ユーザーの疑問を尊重し、対立を避ける
   - **口調**: 理解を示しつつ、友好的な雰囲気

2. **Step 2 (Deconstruct: 脱構築・批判)**: 欠陥を体系的に明らかにする
   - **疫学的データの限界**: Observational studies（観察研究）は因果関係を証明できない。相関≠因果
   - **RCT（ランダム化比較試験）の限界**: 「2週間や数ヶ月のRCTレベルでは慢性疾患（心臓病、癌、糖尿病など）を測定できない」という基本原則。慢性疾患は数十年かけて発症するため、短期間の試験では検出不可能。これがカーニボア批判研究の根本的な欠陥
   - **Healthy User Bias（健康な人バイアス）**: 観察研究では、健康的な生活を送る人が特定の食品を避ける傾向がある（例：健康意識の高い人が加工食品・赤肉を避ける）。これにより「赤肉を食べない人=健康」という相関が生まれるが、これは「健康だから赤肉を避ける」という逆因果の可能性がある
   - **Confounding Factors（交絡因子）**: 「赤肉を食べる人」は同時に「加工食品、砂糖、オメガ6過多、喫煙、運動不足」などの不健康な習慣を持っている可能性が高い。研究ではこれらを分離できていない
   - **利益動機（Profit motive）**: 研究資金、食品業界、製薬会社の影響。植物性食品・サプリメント業界の利益構造
   - **データの質の問題**: FFQ（Food Frequency Questionnaire: 食事頻度質問票）の不正確性。人々は過去の食事を正確に覚えていない
   - **相関と因果の混同**: 「赤肉を食べる人が癌になりやすい」ではなく、「不健康な生活習慣を持つ人が赤肉を食べる」可能性
   - **統計的有意性の誤解**: Hazard Ratio (HR) < 2.0 は「ノイズ」として扱われるべき（例：HR 1.17は17%の相対リスク増だが、これは統計的に意味がない）。喫煙のHR 10-30と比較すると、その差は明白
   - **リスクの絶対値 vs 相対値**: 相対リスクが大きく見えても、絶対リスクは微々たるもの（例：1000人中1人→2人でも「100%増加」と言われるが、実際は0.1%の増加）

3. **Step 3 (Reframe: 再構築・真実の提示)**: 進化的・機能的真実を提供する
   - **進化的視点**: 「人類は何百万年も肉食中心だった。農耕は1万年程度で、遺伝子レベルでの適応は起きていない」
   - **メカニズム的説明**: 「実際には、メカニズム的に考えると...」「生化学的には...」
   - **比喩の使用**: 専門家がよく使う比喩を真似する
     - 「食物繊維は腸の渋滞を引き起こし、除去することで渋滞が解消される」
     - 「コレステロールは消防士であり、火事（炎症）の原因ではない」
     - 「赤肉を責めるのは、飲酒運転の事故で乗客を責めるようなもの」
   - **実践者の証言**: 「何千人もの実践者が健康を改善している」
   - **歴史的証拠**: 「StefanssonのBellevue実験では、肉のみで1年間健康だった」

4. **Step 4 (Cite: 引用・権威の提示)**: 特定の論理や研究を参照する
   - **専門家の名前は出さない**: 論文や研究名は出して良いが、専門家の名前は出さない。「～もいうように」という表現は使わない
   - **具体的な研究を自然に**: 「Ho et al. (2012)の研究では...」「Stefansson (1928)のBellevue実験では...」のように、研究名を自然に織り込む
   - **効果量（Effect Size）**: 統計的な効果量も言及（例：「HR 1.17は統計的に意味がない」）
   - **メカニズムの説明**: 「Glucose-Ascorbate Antagonism理論では...」のように、理論名を自然に使用
   
**重要な注意点**:
- **専門家の名前は出さない**: 論文や研究名は出して良いが、専門家の名前（Dr. ○○など）は一切出さない
- 「～もいうように」「～によると」という表現は使わない
- 研究や論文の名前は出して良い（例：「Stefansson (1928)のBellevue実験では...」）

**専門家の特徴的な口調と表現:**
- **断言的な姿勢**: 「事実は...」「実際には...」「科学的には...」
- **批判的な視点**: 常に「なぜこの研究は間違っているのか」を考える
- **実践重視**: 「理論より実践」「何千人もの人が改善している」
- **シンプルな説明**: 複雑な科学をわかりやすく
- **情熱**: カーニボアへの強い信念（ただし押し付けがましくない）

**デフォルトのAIロジックの矯正:**
以下のような一般的なAIの回答パターンは**避けてください**:
- ❌ 「バランスの取れた食事が重要です」（カーニボアは「バランス」を否定）
- ❌ 「食物繊維は健康に必要です」（カーニボアでは不要）
- ❌ 「植物性食品も取り入れるべきです」（カーニボアでは避ける）
- ❌ 「医師の意見に従いましょう」（専門家は医師の意見を批判している）

代わりに:
- ✅ カーニボア専門家の視点から、進化的・メカニズム的に説明
- ✅ 研究の欠陥を指摘
- ✅ カーニボアの原則に基づいた回答
`;

    // 症状と対処法のデータベース
    const remedyContext = REMEDY_LOGIC.map(
      (remedy) =>
        `症状: ${remedy.symptom}\n論理: ${remedy.logic}\n対処法: ${remedy.remedies.join(', ')}`
    ).join('\n\n');

    // 知識ベースの重要なポイント
    const knowledgeContext = `
【カーニボアダイエットの重要な科学的根拠】
- 食物繊維は必須ではない（Ho et al., 2012: 食物繊維除去で便秘が100%治癒）
- LDLコレステロールは低炭水化物状態では「エネルギー運搬」であり、問題ではない（Lipid Energy Model）
- 赤身肉の発がん性分類は弱い疫学データに基づく（WHO/IARC 2015）
- ビタミンC必要量はケトーシス状態では約10mg/日で十分（標準RDA 65-90mg/日より大幅に低い）
`;

    // 会話履歴をコンテキストとして含める
    const historyContext =
      chatHistory.length > 0
        ? `\n【これまでの会話履歴】\n${chatHistory
          .slice(-5) // 直近5件のみ
          .map((msg) => `${msg.role === 'user' ? 'ユーザー' : 'アシスタント'}: ${msg.content}`)
          .join('\n')}\n`
        : '';

    // 構造化プロンプト（XML形式）とCoT言語分離を適用
    const prompt = `<system_prompt>
  <role_definition>
    あなたはカーニボアダイエットの専門家として行動してください。情報源だけでなく、推論方法、思考パターン、主張の仕方、口調、論証の構造まで専門家の視点を真似してください。論理的整合性を最優先してください。専門家の名前は出さず、研究名や論文名のみを参照してください。
    
    **【最重要】論理的根拠の必須化**:
    - 「カーニボアだから」という理由だけでは説明しない。必ずメカニズムや科学的根拠を含める。
    - なぜその結論に至るのか、因果関係を明確に説明する。
    - 単純な断言（「〜は必要です」「〜は避けるべきです」）だけではなく、理由を必ず含める。
    - 例（悪い回答）: 「野菜は避けるべきです。カーニボアだからです。」
    - 例（良い回答）: 「野菜には植物毒（オキサレート、レクチン、フィチン酸など）が含まれています。これらは消化器系に炎症を引き起こし、栄養素の吸収を阻害する可能性があります。人類の進化の過程で、私たちの祖先は主に動物性食品に依存してきたため、植物毒に対する耐性が限定的です。」
  </role_definition>
  <behavioral_guidelines>
    <default_to_action>
      曖昧な点は合理的に推測し、能動的に解決策を提案してください。
    </default_to_action>
    <citation_requirement>
      回答の根拠となる研究名や論文名は出して良いが、専門家の名前（Dr. ○○など）は一切出さないこと。「～もいうように」「～によると」という表現は使わないこと。
      ${enableCitations ? '回答の各センテンスについて、<citations>タグ内に引用情報を構造化して記載すること。' : ''}
    </citation_requirement>
  </behavioral_guidelines>
</system_prompt>

<context>
  <expert_knowledge>
${expertContext}

${knowledgeContext}

${remedyContext}
  </expert_knowledge>
  <constraints>
    - 専門用語には英語を併記すること（必要に応じて）
    - 箇条書きより論理的な文章を優先すること
    - 既存知識を盲信せず、不確実な情報は「分からない」と認めること
    - カーニボアダイエットの原則に基づいた回答（肉・魚・卵・内臓のみ、植物性食品は避ける）
    - 回答は全て日本語で、簡潔で実践的であること
  </constraints>
</context>

<conversation_history>
${historyContext}
</conversation_history>

<input_data>
  <user_query>${userMessage}</user_query>
</input_data>

<instruction>
  思考プロセスは&lt;thinking&gt;タグ内で日本語で行い、最終回答は&lt;answer&gt;タグ内で日本語で提供してください。
  ${enableVerification
        ? `
  さらに、以下のステップでChain of Verification (CoVe)を実行してください：
  1. まずベースライン回答を作成
  2. 回答内の検証が必要な事実を特定
  3. 具体的な質問を含む検証計画を作成
  4. 各質問に独立して回答することで検証を実行
  5. 検証結果に基づいて最終回答を提供
  `
        : ''
      }
  
  <thinking>
  [日本語で論理的に思考してください。以下を考慮：
  1. **ユーザーの意図を判定する（最重要）**:
     - **食品摂取の報告**（例：「肉食べた」「塩摂取した」「サーモン200g食べた」「バター10g使った」）→ **必ずadd_foodアクションを生成する**。ユーザーが「記録して」と言わなくても、食品摂取の報告から自動的に記録アクションを生成する。
     - シンプルな感想（例：「やさいまずすぎ」）→ 感想のみ、質問なし → 1文で共感のみ
     - 質問形式（例：「今日は何を食べるべき？」）→ 「？」を含む、または疑問詞 → 2-3文で簡潔に回答
     - 「なぜ？」を含む（例：「なぜ野菜がまずいの？」）→ 「なぜ」「どうして」「理由」を含む → 4-5文で解説
     - 症状や問題（例：「頭痛がする」）→ 症状名を含む → 3-4文で対処法を提示
     - 誤解や批判（例：「野菜は必要だ」）→ 誤解や批判を含む → 4ステップ論証スタイルを適用
  2. 上記の文脈からの関連する専門知識と研究
  3. 会話履歴
  **重要**: シンプルな感想には長い説明は不要。共感して簡潔に答えるだけ。]
  </thinking>
  
  ${enableVerification
        ? `
  <verification>
    <baseline>
    [まず、ここに日本語でベースライン回答を提供してください]
    </baseline>
    
    <plan>
    [ベースライン回答内の事実を確認するための検証質問のリストを作成してください。各質問は具体的で検証可能である必要があります。]
    </plan>
    
    <execution>
    [各検証質問に独立して回答してください。形式: Q: [質問] A: [回答]]
    </execution>
    
    <status>
    [ステータスを設定: 全ての事実が確認された場合は"verified"、一部の事実が不明確な場合は"uncertain"、検証で重大な不確実性が明らかになった場合は"needs_human_review"]
    </status>
  </verification>
  `
        : ''
      }
  
  <answer>
  [日本語で簡潔に回答してください。${enableVerification ? '検証が行われた場合は、検証結果を最終回答に組み込んでください。' : ''} 会話的で親しみやすい口調を使用してください。
  
  **【最重要】回答は必ず簡潔に。無駄な前置きや学術的な長文は避ける。**
  
  **回答長さのルール（厳守）:**
  1. **シンプルな感想**（例：「やさいまずすぎ」「肉美味しい」）
     - 回答: 1文のみ。共感して簡潔に。
     - 例: 「植物毒を含むため、体が避けようとする自然な反応かもしれません。」
  
  2. **質問形式**（例：「今日は何を食べるべき？」「ナトリウムはどのくらい？」）
     - 回答: 2-3文。直接答える。前置き不要。
     - 例: 「脂身の多い肉（リブアイ、バラ肉）を中心に、内臓肉（レバー）も加えると良いでしょう。塩分も多めに摂ってください。」
  
  3. **「なぜ？」を含む**（例：「なぜ野菜がまずいの？」「どうして塩分が必要なの？」）
     - 回答: 3-4文。要点のみ。長文禁止。
     - 例: 「野菜がまずいと感じるのは、植物が捕食者から身を守るために植物毒（オキサレート、レクチンなど）を含むためです。これらは消化器系に炎症を引き起こす可能性があります。人類の祖先は何百万年もの間、主に動物性食品に依存して生きてきました。そのため、野菜を美味しくないと感じる感覚は、体がそれらの物質を避けようとする自然な反応かもしれません。」
  
  4. **症状や問題**（例：「頭痛がする」「便秘になった」）
     - 回答: 2-3文。実践的な対処法のみ。
     - 例: 「頭痛は電解質不足の可能性があります。ナトリウムを+2000mg増やし、水分も多めに摂ってください。塩を直接舐めるか、肉汁を飲むと良いでしょう。」
  
  5. **誤解や批判を含む**（例：「野菜は必要だ」「カーニボアは不健康」）
     - 回答: 4-5文。4ステップ論証スタイルを適用（検証 → 脱構築 → 再構築 → 引用）。
  
  **厳守事項**: 
  - 無駄な前置き（「CarnivOSへようこそ」など）は不要。
  - 学術的な長文は避ける。要点のみ伝える。
  - シンプルな質問には簡潔に答える。
  - カーニボアダイエットの原則に基づいて回答（肉、魚、卵、内臓のみ；植物性食品は避ける）
  - 専門家の名前は出さない。論文や研究名は出して良いが、「～もいうように」という表現は使わない
  
  **【最重要】論理的説明の必須化**:
  - 「カーニボアだから」「肉食だから」という理由だけでは説明しない。
  - 必ずメカニズム、科学的根拠、因果関係を含める。
  - 単純な断言ではなく、理由を明確に示す。
  - 例: 「ナトリウムが必要」→「ナトリウムがなぜ必要か（電解質バランス、水分保持、神経伝達など）」を説明
  - 例: 「植物性食品は避ける」→「植物毒の種類と影響、なぜ問題になるか」を説明]
  </answer>
  
  ${enableCitations
        ? `
  <citations>
  [回答内の専門知識や研究を参照する各センテンスについて、以下の形式で引用情報を提供してください：
  センテンス|情報源|信頼度
  例:
  カーニボアダイエットではビタミンCの必要量が大幅に減少します|Glucose-Ascorbate Antagonism理論|0.9
  肉のみの食事で1年間健康だったという研究があります|Stefansson (1928) Bellevue Hospital Study|0.95]
  </citations>
  `
        : ''
      }
  
  <todos>
  [回答内で実行可能なアクション（Todo）がある場合、以下の形式で提供してください：
  タイトル|説明（オプション）|アクションタイプ|アクションパラメータ（JSON形式、オプション）
  
  アクションタイプ:
  - timer: タイマー開始（例：16時間断食タイマー）
  - add_food: 食品追加（例：塩を2g追加、サーモン200g食べた、卵3個食べた）
  - set_protocol: リカバリープロトコル設定
  - open_screen: 画面を開く（例：設定画面）
  - update_input: 日次入力データの更新（例：睡眠、太陽光、排泄状態など）
  - custom: カスタムアクション
  
  **【最重要】食品摂取の報告を自動検出**:
  - ユーザーが「肉食べた」「塩摂取した」「サーモン200g食べた」「バター10g使った」など、食品摂取を報告した場合、**必ずadd_foodアクションを生成する**。
  - 「記録して」という明示的な指示がなくても、食品摂取の報告から自動的に記録アクションを生成する。
  - 量が不明な場合は、推測値（例：肉300g、塩2g）を使用するか、フォローアップ質問を生成する。
  
  **【重要】食品追加（add_food）のパラメータ形式**:
  - item: 食品名（日本語可、例：「サーモン」「牛肉」「卵」「塩」「バター」）
  - amount: 量（数値、例：200、3、2。不明な場合は推測値を使用）
  - unit: 単位（"g"または"個"、例："g"、"個"）
  
  食品名は、ユーザーが話した通りの名前で良い（「サーモン」「肉」「卵」「塩」「バター」など）。
  **重要**: ユーザーが「肉」と言った場合は「牛肉」と勝手に判断せず、「肉」のまま記録する。具体的な種類（牛肉、豚肉、鶏肉など）が不明な場合は、フォローアップ質問を生成する。
  **重要**: 塩、バター、部位などの詳細が不明な場合も、フォローアップ質問を生成する。
  データベースに存在しない場合は、空の栄養素データで追加される。
  
  例:
  16時間断食タイマーを開始|前日の糖質摂取をリセットするため|timer|{"hours":16}
  塩を2g摂取||add_food|{"item":"塩","amount":2,"unit":"g"}
  サーモン200g食べた||add_food|{"item":"サーモン","amount":200,"unit":"g"}
  肉300g食べた||add_food|{"item":"肉","amount":300,"unit":"g"}
  卵3個食べた||add_food|{"item":"卵","amount":3,"unit":"個"}
  リカバリープロトコルを設定|糖質摂取後の回復のため|set_protocol|{"violationType":"sugar_carbs"}
  日次入力を更新|睡眠・太陽光・排泄状態を記録|update_input|{"sleepScore":95,"sleepHours":8,"sunMinutes":30,"bowelMovement":{"status":"normal"},"activityLevel":"moderate"}]
  </todos>
</instruction>`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    if (import.meta.env.DEV) {
    }

    if (!text || text.trim().length === 0) {
      throw new Error('AIからの応答が空でした。');
    }

    // XML構造化レスポンスをパース
    const parsedResponse = parseStructuredResponse(text);

    if (import.meta.env.DEV) {
      if (parsedResponse.thinking) {
      }
      if (parsedResponse.verification) {
      }
      if (parsedResponse.citations && parsedResponse.citations.length > 0) {
      }
    }

    // 引用がない回答を検出（Phase 3: RAGと引用の強制）
    if (
      enableCitations &&
      parsedResponse.answer &&
      (!parsedResponse.citations || parsedResponse.citations.length === 0)
    ) {
      if (import.meta.env.DEV) {
        console.warn('警告: 回答が提供されましたが引用がありません。幻覚の可能性があります。');
      }
      // 引用がない場合は警告を追加（本番環境ではログのみ）
    }

    // 検証が必要な場合の処理（Phase 2）
    if (enableVerification && parsedResponse.verification) {
      if (parsedResponse.verification.status === 'needs_human_review') {
        // 人間による確認が必要な場合は、その旨を回答に追加
        return `${parsedResponse.answer}\n\n[注意: この回答には不確実な情報が含まれる可能性があります。専門家に相談することをお勧めします。]`;
      } else if (parsedResponse.verification.status === 'uncertain') {
        // 不確実な場合は、その旨を回答に追加
        return `${parsedResponse.answer}\n\n[注意: 一部の情報について確実性が低い可能性があります。]`;
      }
    }

    // <answer>タグから回答を抽出
    if (parsedResponse.answer && parsedResponse.answer.length > 0) {
      if (import.meta.env.DEV) {
        if (parsedResponse.todos && parsedResponse.todos.length > 0 && import.meta.env.DEV) {
        }
      }
      // <thinking>タグやその他のタグを削除して返す
      const cleanAnswer = parsedResponse.answer
        .replace(/<thinking>[\s\S]*?<\/thinking>/gi, '')
        .replace(/<verification>[\s\S]*?<\/verification>/gi, '')
        .replace(/<citations>[\s\S]*?<\/citations>/gi, '')
        .replace(/<todos>[\s\S]*?<\/todos>/gi, '')
        .trim();
      return cleanAnswer;
    }

    // <answer>タグが見つからない場合、または空の場合は元のテキストを返す（後方互換性）
    // ただし、<thinking>タグなどは削除する
    if (import.meta.env.DEV) {
    }
    const cleanText = text
      .replace(/<thinking>[\s\S]*?<\/thinking>/gi, '')
      .replace(/<verification>[\s\S]*?<\/verification>/gi, '')
      .replace(/<citations>[\s\S]*?<\/citations>/gi, '')
      .replace(/<todos>[\s\S]*?<\/todos>/gi, '')
      .trim();
    return cleanText;
  } catch (error) {
    logError(error, { component: 'aiService', action: 'chatWithAI' });
    const errorMessage = getUserFriendlyErrorMessage(error) || '不明なエラー';
    throw new Error(
      `AI応答の取得に失敗しました: ${errorMessage}\n` +
      'もう一度お試しください。問題が続く場合は、APIキーが正しく設定されているか確認してください。'
    );
  }
}

/**
 * AIチャット機能（構造化レスポンス版：Todoを含む）
 */
export async function chatWithAIStructured(
  userMessage: string,
  chatHistory: Array<{ role: 'user' | 'assistant'; content: string }> = [],
  enableVerification: boolean = false,
  enableCitations: boolean = true,
  aiMode: 'purist' | 'realist' = 'purist',
  thinkingMode: 'fast' | 'auto' | 'deep' = 'auto',
  diaryAndFoodData?: { logs: Array<{ date: string; diary?: string; foods: string[] }> }, // Detective AI用データ
  userProfile?: {
    height?: number;
    weight?: number;
    age?: number;
    gender?: 'male' | 'female';
    [key: string]: unknown;
  } // ユーザープロファイル
): Promise<ChatAIResponse> {
  if (import.meta.env.DEV) {
  }

  if (!isGeminiAvailable()) {
    throw new Error(
      'Gemini APIキーが設定されていません。\n' +
      'VITE_GEMINI_API_KEY を .env ファイルに設定してください。\n' +
      'AIチャット機能を使用するには、APIキーの設定が必要です。'
    );
  }

  try {
    // AI Modeに応じてモデルを選択
    let modelName: string;
    switch (thinkingMode) {
      case 'fast':
        // Fast: Gemini Flash - quick, concise answers
        modelName = 'gemini-2.5-flash';
        break;
      case 'auto':
        // Auto: Gemini Pro - auto-detect question type
        modelName = 'gemini-2.5-pro';
        break;
      case 'deep':
        // Deep: Gemini Pro 2.0 - detailed analysis with evidence
        modelName = 'gemini-2.0-pro-exp';
        break;
      default:
        modelName = 'gemini-2.5-flash';
    }

    // Output style prompt based on AI Mode
    const outputStylePrompt = getOutputStylePrompt(thinkingMode, userMessage);
    const model = genAI!.getGenerativeModel({ model: modelName });

    // ユーザープロファイル情報を追加
    const userProfileContext = userProfile
      ? `
【ユーザープロファイル情報】
以下のユーザー情報を参照して回答してください。
${userProfile.height ? `- 身長: ${userProfile.height}cm` : ''}
${userProfile.weight ? `- 体重: ${userProfile.weight}kg` : ''}
${userProfile.age ? `- 年齢: ${userProfile.age}歳` : ''}
${userProfile.gender ? `- 性別: ${userProfile.gender === 'male' ? '男性' : '女性'}` : ''}
${userProfile.activityLevel ? `- 活動レベル: ${userProfile.activityLevel}` : ''}
${userProfile.isPregnant ? `- 妊娠中: はい` : ''}
${userProfile.isBreastfeeding ? `- 授乳中: はい` : ''}
${userProfile.stressLevel ? `- ストレスレベル: ${userProfile.stressLevel}` : ''}
${userProfile.sleepHours ? `- 睡眠時間: ${userProfile.sleepHours}時間/日` : ''}
${userProfile.exerciseIntensity ? `- 運動強度: ${userProfile.exerciseIntensity}` : ''}
${userProfile.exerciseFrequency ? `- 運動頻度: ${userProfile.exerciseFrequency}回/週` : ''}
${userProfile.thyroidFunction ? `- 甲状腺機能: ${userProfile.thyroidFunction}` : ''}
${userProfile.metabolicStatus ? `- 代謝状態: ${userProfile.metabolicStatus === 'adapted' ? '適応済み' : '移行中'}` : ''}
${userProfile.daysOnCarnivore ? `- カーニボア開始からの日数: ${userProfile.daysOnCarnivore}日` : ''}
`
      : '';

    // ソーシャルプロトコルの定義を追加
    const socialProtocolContext = `
【ソーシャルプロトコル（Social Protocols）】
- **孤独 vs 毒**: 過度な孤独によるコルチゾール上昇は、たまの「不適切な食事（ピザ等）」よりも代謝に悪影響を与える可能性がある。
- **戦略的逸脱**: 友人との食事（ピザ等）は「失敗」ではなく「戦略的コスト」として扱う。
- **理想**: 肉食の友人とステーキに行くのがベスト。
- **次善**: 避けられない社交での食事は楽しみ、翌日に「リカバリープロトコル（16時間断食 + 厳格なカーニボア）」を実行する。
- **アドバイス方針**: ガチガチの禁止ではなく、「食べてしまった後のリカバリー」と「孤独の回避」をバランス良く提案する。
`;

    // Detective AI: 日記と食生活のリンク分析データを追加
    const detectiveContext =
      diaryAndFoodData && diaryAndFoodData.logs.length > 0
        ? `
【Detective AI: 日記と食生活のリンク分析データ】

以下の日記と食生活のデータを分析し、因果関係を特定してください。
24-48時間の遅延反応を考慮してください（食べた日の翌日・翌々日に症状が出る可能性があります）。

**データ期間**: 過去${diaryAndFoodData.logs.length}日分のデータを分析します。

${diaryAndFoodData.logs
          .map((log, idx) => {
            const date = new Date(log.date);
            const dateStr = `${date.getMonth() + 1}/${date.getDate()}`;
            const foods = log.foods.join('、');
            const diary = log.diary || '（日記なし）';
            return `【${dateStr}】
食べたもの: ${foods || '（記録なし）'}
日記: ${diary}`;
          })
          .join('\n\n')}

【分析のポイント】
- 特定の食品を食べた後、24-48時間以内に症状や体調不良が記録されているか確認
- 繰り返し現れるパターンを特定（例：「乳製品を食べた翌々日に頭痛」）
- 日記に記載されている症状（頭痛、便秘、関節痛、疲労感など）と食生活の関連性
- 遅延型食物アレルギーや不耐症の可能性も考慮
`
        : '';

    // AIモードに応じて情報源を変更
    const expertContext =
      aiMode === 'purist'
        ? `
【カーニボアダイエットの主要な情報源（Puristモード）】
以下の研究や理論のみを参照してください。専門家の主張や科学的根拠に基づいて回答してください。

1. **実践的なカーニボアダイエットのアドバイス、症状の対処法**: カーニボア実践者の経験に基づく対処法
2. **カーニボアダイエットの長期実践**: 運動パフォーマンスとカーニボアの関係
3. **動物性食品の栄養密度、植物毒について**: 植物性食品の抗栄養素に関する研究
4. **カーニボアの生物学的根拠、進化的適合性**: 人類の進化と食事の関係
5. **栄養科学、カーニボアの科学的検証**: 栄養学の科学的検証
6. **論証スタイル、疫学の批判**: 観察研究の限界に関する批判
7. **Stefansson (1928) Bellevue Hospital Study**: 肉のみの食事の歴史的臨床研究
8. **Cahill (1970s) Starvation Studies**: グルコース-アスコルビン酸拮抗（Glucose-Ascorbate Antagonism）

【重要な原則】
- カーニボアダイエットは「肉、魚、卵、内臓」のみを食べる食事法
- 植物性食品は不要であり、植物毒（オキサレート、レクチン、フィチン酸など）を避ける
- 電解質（特にナトリウム、マグネシウム）が重要
- ビタミンCの必要量は低炭水化物状態では大幅に減少（Glucose-Ascorbate Antagonism）。壊血病を防ぐために必要な最小量は約10mg。肉食のみでも1日約30mgを摂取可能なため、肉で十分足りる。RDA基準の90mgは不要
`
        : `
【カーニボアダイエットの主要な情報源（Realistモード）】
以下の研究や理論に加え、カーニボア実践コミュニティの実践知（成功事例、トラブルシューティング、実践的なハック）も参照してください。

1. **実践的なカーニボアダイエットのアドバイス、症状の対処法**: カーニボア実践者の経験に基づく対処法
2. **カーニボアダイエットの長期実践**: 運動パフォーマンスとカーニボアの関係
3. **動物性食品の栄養密度、植物毒について**: 植物性食品の抗栄養素に関する研究
4. **カーニボアの生物学的根拠、進化的適合性**: 人類の進化と食事の関係
5. **栄養科学、カーニボアの科学的検証**: 栄養学の科学的検証
6. **論証スタイル、疫学の批判**: 観察研究の限界に関する批判
7. **Stefansson (1928) Bellevue Hospital Study**: 肉のみの食事の歴史的臨床研究
8. **Cahill (1970s) Starvation Studies**: グルコース-アスコルビン酸拮抗（Glucose-Ascorbate Antagonism）

【コミュニティの実践知（Realistモード）】
- 外食時の選択肢（例：マクドナルドでハンバーガーパティのみを注文する、コンビニでチーズやサラミを選ぶなど）
- 実践的なトラブルシューティング（症状への対処法）
- 実践者の成功事例や失敗例
- カーニボアを継続するための実践的な工夫

【重要な原則】
- カーニボアダイエットは「肉、魚、卵、内臓」のみを食べる食事法
- 植物性食品は不要であり、植物毒（オキサレート、レクチン、フィチン酸など）を避ける
- 電解質（特にナトリウム、マグネシウム）が重要
- ビタミンCの必要量は低炭水化物状態では大幅に減少（Glucose-Ascorbate Antagonism）。壊血病を防ぐために必要な最小量は約10mg。肉食のみでも1日約30mgを摂取可能なため、肉で十分足りる。RDA基準の90mgは不要
`;

    // アプリの使い方についてのコンテキスト（アプリに関する質問の場合に使用）
    const appUsageContext = `
【CarnivOS (カーニボス) アプリの機能と使い方】

このアプリはカーニボアダイエット管理アプリ「CarnivOS (カーニボス)」です。以下の機能があります：

**主要画面:**
1. **ホーム画面**: 日々の栄養素摂取量を追跡。P:F比率ゲージ、食品追加ボタン、AIチャットボタンがあります。
2. **プロフィール画面**: ユーザー設定、栄養素目標値のカスタマイズ、言語設定、塩ミル設定など。
3. **履歴画面**: 過去の食事記録を確認。日付ごとに詳細を見ることができます。
4. **統計画面**: 栄養素と体重のトレンドをグラフで表示。
5. **日記画面**: 日々の体調や症状を記録。
6. **設定画面**: アプリの設定、デバッグモードのON/OFFなど。

**主要機能:**
- **食品追加**: ホーム画面の「+ 食品を追加」ボタンから、動物性食品を選択して追加できます。
- **栄養素追跡**: タンパク質、脂質、ナトリウム、マグネシウム、カリウム、ビタミン類など、100項目以上の栄養素を追跡。
- **動的目標値**: ユーザーのプロファイル（性別、年齢、体重、活動レベル、妊娠中、授乳中など）に基づいて、栄養素の目標値が自動計算されます。
- **4ゾーングラデーションゲージ**: 栄養素の摂取状況を4つのゾーン（不足、バッファ、最適、過剰）で視覚化。
- **Avoid Zone**: 避けるべきもの（植物性タンパク質、植物油、食物繊維、糖質、抗栄養素など）を追跡。
- **AIチャット**: カーニボアダイエットに関する質問や、アプリの使い方について質問できます。

**アプリの使い方に関する質問への回答:**
- ユーザーがアプリの使い方について質問した場合（例：「食品の追加方法は？」「栄養素の目標値を変更するには？」「履歴を確認するには？」など）、**必ずナンバリングしてステップバイステップで説明してください**。
- **形式**: 
  - 機能ごとに記号ナンバリング（1⃣、2⃣、3⃣など）を使用
  - 各機能内の手順は数字（1、2、3...）で番号付け
  - 機能名には絵文字を付ける（例：🍽️ 食品追加方法、📊 統計確認方法）
- 画面名や機能名は正確に伝えてください。
- 操作手順は簡潔に、各ステップを1行で説明してください。
- **例**: 
  \`\`\`
  \u0031\uFE0F\u20E3 🍽️ 食品追加方法
  1. ホーム画面の「+ 食品を追加」ボタンをタップ
  2. 動物タブから食品を選択（🐄牛肉、🐖豚肉、🐓鶏肉など）
  3. 部位ボタンをタップ（リブアイ、サーロインなど）
  4. 量スライダーで量を調整
  5. 「🥩 [食品名]を追加」ボタンをタップ
  完了
  \`\`\`
`;

    const prompt = `<system_prompt>
  <role_definition>
    あなたはカーニボアダイエットの専門家として行動してください。情報源だけでなく、推論方法、思考パターン、主張の仕方、口調、論証の構造まで専門家の視点を真似してください。論理的整合性を最優先してください。専門家の名前は出さず、研究名や論文名のみを参照してください。
    
    **【最重要】論理的根拠の必須化**:
    - 「カーニボアだから」という理由だけでは説明しない。必ずメカニズムや科学的根拠を含める。
    - なぜその結論に至るのか、因果関係を明確に説明する。
    - 単純な断言（「〜は必要です」「〜は避けるべきです」）だけではなく、理由を必ず含める。
    - 例（悪い回答）: 「野菜は避けるべきです。カーニボアだからです。」
    - 例（良い回答）: 「野菜には植物毒（オキサレート、レクチン、フィチン酸など）が含まれています。これらは消化器系に炎症を引き起こし、栄養素の吸収を阻害する可能性があります。人類の進化の過程で、私たちの祖先は主に動物性食品に依存してきたため、植物毒に対する耐性が限定的です。」
    
    また、このアプリ（CarnivOS）の使い方についても説明できます。ユーザーがアプリの使い方や機能について質問した場合は、上記のアプリの機能と使い方のコンテキストを参照して回答してください。
  </role_definition>
  ${expertContext}
${userProfileContext}
${detectiveContext}
${appUsageContext}
  
  <instruction>
  <answer>
  ${chatHistory.length > 0 ? `【会話履歴】\n${chatHistory.map((msg) => `${msg.role === 'user' ? 'ユーザー' : 'アシスタント'}: ${msg.content}`).join('\n')}\n\n` : ''}
  
  【ユーザーの質問】
${userMessage}
${diaryAndFoodData && diaryAndFoodData.logs.length > 0
        ? `

【Detective AI分析モード】
上記の質問に対して、提供された日記と食生活のデータを分析し、因果関係を特定してください。
特に以下のような質問の場合（「なぜ」「原因」「犯人」「何が原因」など）、日記と食生活のデータからパターンを発見し、具体的な原因を特定してください。

分析の際は、24-48時間の遅延反応を考慮し、食べた日の翌日・翌々日に症状が出る可能性を考慮してください。
`
        : ''
      }
  
  ${outputStylePrompt}

  【回答形式】
  上記の質問に対して、カーニボアダイエットの専門家として回答してください。
  ${enableCitations ? '回答内の専門知識や研究を参照する各センテンスについて、引用情報を提供してください。' : ''}
  
  **【最重要】回答は必ず簡潔に。無駄な前置きや学術的な長文は避ける。**
  
  **回答長さのルール（厳守）:**
  1. **シンプルな感想**（例：「やさいまずすぎ」「肉美味しい」）
     - 回答: 1文のみ。共感して簡潔に。
  
  2. **質問形式**（例：「今日は何を食べるべき？」「ナトリウムはどのくらい？」）
     - 回答: 2-3文。直接答える。前置き不要。
  
  3. **「なぜ？」を含む**（例：「なぜ野菜がまずいの？」「どうして塩分が必要なの？」）
     - 回答: 3-4文。要点のみ。長文禁止。
  
  4. **症状や問題**（例：「頭痛がする」「便秘になった」）
     - 回答: 2-3文。実践的な対処法のみ。
     - **重要**: 症状や問題の場合、実行可能なTodoを<todos>タグで提供してください。
  
  5. **誤解や批判を含む**（例：「野菜は必要だ」「カーニボアは不健康」）
     - 回答: 4-5文。4ステップ論証スタイルを適用（検証 → 脱構築 → 再構築 → 引用）。
  
  **厳守事項**: 
  - 無駄な前置き（「CarnivOSへようこそ」など）は不要。直接答える。
  - 学術的な長文は避ける。要点のみ伝える。
  - シンプルな質問には簡潔に答える（2-3文）。
  - 「なぜ？」には要点のみ（3-4文）。長文禁止。
  - 症状や問題には実践的な対処法を提示（2-3文）。
  - カーニボアダイエットの原則に基づいて回答（肉、魚、卵、内臓のみ；植物性食品は避ける）
  - 専門家の名前は出さない。論文や研究名は出して良いが、「～もいうように」という表現は使わない
  
  **【最重要】論理的説明の必須化**:
  - 「カーニボアだから」「肉食だから」という理由だけでは説明しない。
  - 必ずメカニズム、科学的根拠、因果関係を含める。
  - 単純な断言ではなく、理由を明確に示す。
  - 例: 「ナトリウムが必要」→「ナトリウムがなぜ必要か（電解質バランス、水分保持、神経伝達など）」を説明
  - 例: 「植物性食品は避ける」→「植物毒の種類と影響、なぜ問題になるか」を説明
]
  </answer>
  
  ${enableCitations
        ? `
  <citations>
  [回答内の専門知識や研究を参照する各センテンスについて、以下の形式で引用情報を提供してください：
  センテンス|情報源|信頼度
  例:
  カーニボアダイエットではビタミンCの必要量が大幅に減少します|Glucose-Ascorbate Antagonism理論|0.9
  肉のみの食事で1年間健康だったという研究があります|Stefansson (1928) Bellevue Hospital Study|0.95]
  </citations>
  `
        : ''
      }
  
  <todos>
  [回答内で実行可能なアクション（Todo）がある場合、以下の形式で提供してください：
  タイトル|説明（オプション）|アクションタイプ|アクションパラメータ（JSON形式、オプション）
  
  アクションタイプ:
  - timer: タイマー開始（例：16時間断食タイマー）
  - add_food: 食品追加（例：塩を2g追加、サーモン200g食べた、卵3個食べた）
  - set_protocol: リカバリープロトコル設定
  - open_screen: 画面を開く（例：設定画面）
  - update_input: 日次入力データの更新（例：睡眠、太陽光、排泄状態など）
  - custom: カスタムアクション
  
  **【最重要】食品摂取の報告を自動検出**:
  - ユーザーが「肉食べた」「塩摂取した」「サーモン200g食べた」「バター10g使った」など、食品摂取を報告した場合、**必ずadd_foodアクションを生成する**。
  - 「記録して」という明示的な指示がなくても、食品摂取の報告から自動的に記録アクションを生成する。
  - 量が不明な場合は、推測値（例：肉300g、塩2g）を使用するか、フォローアップ質問を生成する。
  
  **【重要】食品追加（add_food）のパラメータ形式**:
  - item: 食品名（日本語可、例：「サーモン」「牛肉」「卵」「塩」「バター」）
  - amount: 量（数値、例：200、3、2。不明な場合は推測値を使用）
  - unit: 単位（"g"または"個"、例："g"、"個"）
  
  食品名は、ユーザーが話した通りの名前で良い（「サーモン」「肉」「卵」「塩」「バター」など）。
  **重要**: ユーザーが「肉」と言った場合は「牛肉」と勝手に判断せず、「肉」のまま記録する。具体的な種類（牛肉、豚肉、鶏肉など）が不明な場合は、フォローアップ質問を生成する。
  **重要**: 塩、バター、部位などの詳細が不明な場合も、フォローアップ質問を生成する。
  データベースに存在しない場合は、空の栄養素データで追加される。
  
  例:
  16時間断食タイマーを開始|前日の糖質摂取をリセットするため|timer|{"hours":16}
  塩を2g摂取||add_food|{"item":"塩","amount":2,"unit":"g"}
  サーモン200g食べた||add_food|{"item":"サーモン","amount":200,"unit":"g"}
  肉300g食べた||add_food|{"item":"肉","amount":300,"unit":"g"}
  卵3個食べた||add_food|{"item":"卵","amount":3,"unit":"個"}
  リカバリープロトコルを設定|糖質摂取後の回復のため|set_protocol|{"violationType":"sugar_carbs"}
  日次入力を更新|睡眠・太陽光・排泄状態を記録|update_input|{"sleepScore":95,"sleepHours":8,"sunMinutes":30,"bowelMovement":{"status":"normal"},"activityLevel":"moderate"}]
  </todos>
</instruction>`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    if (!text || text.trim().length === 0) {
      throw new Error('AIからの応答が空でした。');
    }

    const parsedResponse = parseStructuredResponse(text);

    // 回答をクリーンアップ
    let cleanAnswer = parsedResponse.answer || text;
    cleanAnswer = cleanAnswer
      .replace(/<thinking>[\s\S]*?<\/thinking>/gi, '')
      .replace(/<verification>[\s\S]*?<\/verification>/gi, '')
      .replace(/<citations>[\s\S]*?<\/citations>/gi, '')
      .replace(/<todos>[\s\S]*?<\/todos>/gi, '')
      .trim();

    return {
      answer: cleanAnswer,
      todos: parsedResponse.todos,
      citations: parsedResponse.citations,
    };
  } catch (error) {
    logError(error, { component: 'aiService', action: 'chatWithAIStructured' });
    const errorMessage = getUserFriendlyErrorMessage(error) || '不明なエラー';
    throw new Error(
      `AI応答の取得に失敗しました: ${errorMessage}\n` +
      'もう一度お試しください。問題が続く場合は、APIキーが正しく設定されているか確認してください。'
    );
  }
}

/**
 * 写真解析機能: 食品写真から栄養素を推測
 *
 * @param imageFile 画像ファイル（File または Blob）
 * @returns 推測された食品情報
 */
export async function analyzeFoodImage(imageFile: File | Blob): Promise<{
  foodName: string;
  estimatedWeight: number;
  type?: 'animal' | 'plant' | 'trash' | 'ruminant' | 'dairy';
  nutrients?: Record<string, number>;
  followupQuestions?: string[];
}> {
  if (!isGeminiAvailable()) {
    throw new Error('Gemini APIキーが設定されていません。');
  }

  try {
    // Stableモデルを使用（公式ドキュメントより: gemini-2.5-flash）
    const model = genAI!.getGenerativeModel({ model: 'gemini-2.5-flash' });

    // 画像をBase64に変換
    const base64Image = await fileToBase64(imageFile);

    const prompt = `この写真に写っている食品を分析してください。カーニボアダイエットで推奨される食品（肉、魚、卵、内臓など）を優先的に識別してください。
特に「隠れた脂質（バター、ラード、調理油）」や「判断しにくい部位（バラ肉かロースか）」、または「個数」に注目してください。

以下の情報をJSON形式で返してください：
{
  "foodName": "食品名（日本語、具体的に。例: リブアイステーキ、サーモン、卵など）",
  "estimatedWeight": 推定重量（g、視覚的なサイズから推定）,
  "type": "animal" | "plant" | "trash" | "ruminant" | "dairy",
  "nutrients": {
    "protein": タンパク質（g/100g）,
    "fat": 脂質（g/100g）,
    "carbs": 炭水化物（g/100g）,
    "fiber": 食物繊維（g/100g、植物性食品の場合のみ）,
    "sodium": ナトリウム（mg/100g、可能な場合）,
    "potassium": カリウム（mg/100g、可能な場合）,
    "magnesium": マグネシウム（mg/100g、可能な場合）,
    "zinc": 亜鉛（mg/100g、可能な場合）,
    "iron": 鉄分（mg/100g、可能な場合）,
    "calcium": カルシウム（mg/100g、可能な場合）,
    "phosphorus": リン（mg/100g、可能な場合）,
    "selenium": セレン（μg/100g、可能な場合）,
    "copper": 銅（mg/100g、可能な場合）,
    "manganese": マンガン（mg/100g、可能な場合）,
    "vitaminA": ビタミンA（IU/100g、可能な場合）,
    "vitaminD": ビタミンD（IU/100g、可能な場合）,
    "vitaminE": ビタミンE（IU/100g、可能な場合）,
    "vitaminK": ビタミンK（μg/100g、可能な場合）,
    "vitaminK2": ビタミンK2（μg/100g、可能な場合）,
    "vitaminB1": ビタミンB1（mg/100g、可能な場合）,
    "vitaminB2": ビタミンB2（mg/100g、可能な場合）,
    "vitaminB3": ビタミンB3（mg/100g、可能な場合）,
    "vitaminB5": ビタミンB5（パントテン酸、mg/100g、可能な場合）,
    "vitaminB6": ビタミンB6（mg/100g、可能な場合）,
    "vitaminB7": ビタミンB7（ビオチン、μg/100g、可能な場合）,
    "vitaminB9": ビタミンB9（葉酸、μg/100g、可能な場合）,
    "vitaminB12": ビタミンB12（μg/100g、可能な場合）,
    "vitaminC": ビタミンC（mg/100g、可能な場合）,
    "choline": コリン（mg/100g、可能な場合）,
    "taurine": タウリン（mg/100g、内臓・魚・肉に豊富、可能な場合）,
    "iodine": ヨウ素（μg/100g、可能な場合）,
    "omega3": オメガ3（g/100g、可能な場合）,
    "omega6": オメガ6（g/100g、可能な場合）,
    "glycine": グリシン（g/100g、コラーゲン含有食品の場合）,
    "methionine": メチオニン（g/100g、筋肉由来の場合）,
    "chromium": クロム（μg/100g、可能な場合）,
    "molybdenum": モリブデン（μg/100g、可能な場合）,
    "boron": ホウ素（mg/100g、可能な場合）,
    "vanadium": バナジウム（μg/100g、可能な場合）
  },
  "followupQuestions": ["調理にバターや油を使いましたか？", "卵は何個ですか？"] // 栄養価計算の精度を上げるために確認すべき点がある場合のみ、質問の配列を含める
}

重要:
- 食品名は具体的に（例: "牛肉"ではなく"リブアイステーキ"）
- 重量は視覚的なサイズから推定（10g単位で丸める）
- 栄養素は100gあたりの値で返す
- 不明な栄養素は省略（nullではなく、キー自体を省略）
- 一般的な食品データベース（USDA FoodData Centralなど）の値を参考にする
- カーニボアダイエットで重要な栄養素（タンパク質、脂質、ナトリウム、マグネシウム、ビタミンB12、オメガ3/6比率など）を優先的に含める
- 可能な限り多くの栄養素を含める（特にビタミンB群、ミネラル、アミノ酸）
- 写真から判断しにくい場合（調理油の使用有無、ソースの中身、肉の具体的な部位、隠し味、付け合わせの下にあるものなど）は必ずfollowupQuestionsに質問を追加してください。
- **最重要**: 食品名が「肉」や「魚」など曖昧な場合は、必ずfollowupQuestionsに具体的な種類を尋ねる質問を追加してください（例：「これは牛肉ですか？豚肉ですか？鶏肉ですか？」「これはサーモンですか？マグロですか？」）。
- 質問は「バターや油を使いましたか？」だけでなく、文脈に合わせて多様に生成してください（例：「このソースは自家製ですか？砂糖は入っていますか？」「肉の部位はバラ肉ですか、ロースですか？」「卵はLサイズですか？」「衣に小麦粉を使っていますか？」など）。
- 質問は最大3つまでとしてください。`;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64Image,
          mimeType: imageFile.type || 'image/jpeg',
        },
      },
    ]);

    const response = await result.response;
    const text = response.text();

    // JSONをパース
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          foodName: parsed.foodName || '不明な食品',
          estimatedWeight: Math.round((parsed.estimatedWeight || 300) / 10) * 10, // 10g単位で丸める
          type: parsed.type || 'animal',
          nutrients: parsed.nutrients || {},
          followupQuestions: parsed.followupQuestions || [],
        };
      }
    } catch (parseError) {
      logError(parseError, {
        component: 'aiService',
        action: 'analyzeFoodImage',
        step: 'parseJSON',
      });
    }

    // JSONパースに失敗した場合、テキストから情報を抽出
    const extractedFoodName = extractFoodName(text);
    const extractedWeight = extractWeight(text);

    return {
      foodName: extractedFoodName,
      estimatedWeight: Math.round(extractedWeight / 10) * 10, // 10g単位で丸める
      type: 'animal' as const,
      nutrients: {},
      followupQuestions: [],
    };
  } catch (error) {
    logError(error, { component: 'aiService', action: 'analyzeFoodImage' });
    const errorMessage = error instanceof Error ? error.message : '画像解析に失敗しました。';
    if (errorMessage.includes('APIキー') || errorMessage.includes('API key')) {
      throw new Error('Gemini APIキーが設定されていません。環境変数を確認してください。');
    }
    throw new Error('画像解析に失敗しました。もう一度お試しください。');
  }
}

/**
 * ユーザーの回答や修正に基づいて解析結果を再計算する
 */
export async function refineFoodAnalysis(
  originalResult: { foodName: string; estimatedWeight: number; type?: string },
  userAnswers: Record<string, string>
): Promise<{
  foodName: string;
  estimatedWeight: number;
  type?: 'animal' | 'plant' | 'trash' | 'ruminant' | 'dairy';
  nutrients: Record<string, number>;
}> {
  if (!isGeminiAvailable()) {
    throw new Error('Gemini APIキーが設定されていません。');
  }

  try {
    const model = genAI!.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `以下の食品情報と、ユーザーからの追加情報（回答）に基づいて、最終的な栄養素データを計算してください。
      特に、ユーザーが回答した「追加の油（バター、ラード）」や「実際の量」、「具体的な部位」を反映させてください。

元データ:
- 食品名: ${originalResult.foodName}
- 推定重量: ${originalResult.estimatedWeight}g
- タイプ: ${originalResult.type}

ユーザーからの追加情報:
${Object.entries(userAnswers)
        .map(([q, a]) => `- 質問: "${q}" -> 回答: "${a}"`)
        .join('\n')}

以下の情報をJSON形式で返してください：
{
  "foodName": "修正後の食品名（ユーザーの回答を反映。例: バターソテーしたリブアイステーキ）",
  "estimatedWeight": 修正後の総重量（g、バターなどが追加された場合は増える）,
  "type": "animal" | "plant" | "trash" | "ruminant" | "dairy",
  "nutrients": {
    "protein": タンパク質（g/100g）,
    "fat": 脂質（g/100g）,
    "carbs": 炭水化物（g/100g）,
    "fiber": 食物繊維（g/100g）,
    "sodium": ナトリウム（mg/100g）,
    "magnesium": マグネシウム（mg/100g）,
    "potassium": カリウム（mg/100g）,
    "zinc": 亜鉛（mg/100g）,
    "iron": 鉄分（mg/100g）,
    
    ...その他ビタミン・ミネラル（analyzeFoodImageと同様のキー）
  }
}

重要:
- ユーザーが「バターを10g使った」と言った場合、脂質を適切に増やしてください（バターは脂質約80%）。
- ユーザーが重量を訂正した場合（例：「もっと多い、400gくらい」）、その重量をベースに計算してください（ただしJSONのnutrientsは常に100gあたり）。`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        foodName: parsed.foodName,
        estimatedWeight: parsed.estimatedWeight,
        type: parsed.type || 'animal',
        nutrients: parsed.nutrients || {},
      };
    }

    throw new Error('再計算結果のパースに失敗しました');
  } catch (error) {
    logError(error, { component: 'aiService', action: 'refineFoodAnalysis' });
    throw new Error('再計算に失敗しました。');
  }
}

/**
 * ファイルをBase64に変換
 */
function fileToBase64(file: File | Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = (reader.result as string).split(',')[1];
      resolve(base64String);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * テキストから食品名を抽出
 */
function extractFoodName(text: string): string {
  const foodKeywords = ['牛肉', '豚肉', '鶏肉', '魚', '卵', 'リブアイ', 'ステーキ', 'サーロイン'];
  for (const keyword of foodKeywords) {
    if (text.includes(keyword)) {
      return keyword;
    }
  }
  return '不明な食品';
}

/**
 * テキストから重量を抽出
 */
function extractWeight(text: string): number {
  const weightMatch = text.match(/(\d+)\s*g/);
  if (weightMatch) {
    return parseInt(weightMatch[1], 10);
  }
  return 300; // デフォルト値
}

/**
 * 食品名から栄養素を推測（半自動カスタム食品登録用）
 *
 * @param foodName 食品名（日本語または英語）
 * @returns 推測された栄養素データ（100gあたり）
 */
export async function analyzeFoodName(
  foodName: string,
  followupAnswers?: Record<string, string> // 追加質問への回答
): Promise<{
  foodName: string;
  type: 'animal' | 'plant' | 'trash' | 'ruminant' | 'dairy';
  followupQuestions?: string[]; // 追加質問（食品名だけの場合）
  nutrients: {
    protein?: number; // g/100g
    fat?: number; // g/100g
    carbs?: number; // g/100g
    fiber?: number; // g/100g
    sodium?: number; // mg/100g
    magnesium?: number; // mg/100g
    potassium?: number; // mg/100g
    zinc?: number; // mg/100g
    iron?: number; // mg/100g
    vitaminA?: number; // IU/100g
    vitaminD?: number; // IU/100g
    vitaminK2?: number; // μg/100g
    vitaminB12?: number; // μg/100g
    omega3?: number; // g/100g
    omega6?: number; // g/100g
    calcium?: number; // mg/100g
    phosphorus?: number; // mg/100g
    glycine?: number; // g/100g
    methionine?: number; // g/100g
    taurine?: number; // mg/100g
    vitaminB1?: number; // mg/100g
    vitaminB2?: number; // mg/100g
    vitaminB3?: number; // mg/100g
    vitaminB6?: number; // mg/100g
    vitaminB7?: number; // μg/100g
    vitaminE?: number; // mg/100g
    selenium?: number; // μg/100g
    copper?: number; // mg/100g
    manganese?: number; // mg/100g
    iodine?: number; // μg/100g
    choline?: number; // mg/100g
    // 抗栄養素（植物性食品の場合）
    phytates?: number; // mg/100g
    oxalates?: number; // mg/100g
    lectins?: number; // mg/100g
  };
}> {
  if (!isGeminiAvailable()) {
    throw new Error('Gemini APIキーが設定されていません。');
  }

  try {
    const model = genAI!.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `以下の食品名から、栄養素データを推測してください。

食品名: ${foodName}
${followupAnswers && Object.keys(followupAnswers).length > 0
        ? `
追加情報:
${Object.entries(followupAnswers)
          .map(([question, answer]) => `- ${question}: ${answer}`)
          .join('\n')}
`
        : ''
      }

以下の情報をJSON形式で返してください：
{
  "foodName": "食品名（日本語）",
  "type": "animal" | "plant" | "trash" | "ruminant" | "dairy",
  "nutrients": {
    "protein": タンパク質（g/100g）,
    "fat": 脂質（g/100g）,
    "carbs": 炭水化物（g/100g）,
    "fiber": 食物繊維（g/100g、植物性食品の場合のみ）,
    "sodium": ナトリウム（mg/100g）,
    "magnesium": マグネシウム（mg/100g）,
    "potassium": カリウム（mg/100g）,
    "zinc": 亜鉛（mg/100g）,
    "iron": 鉄分（mg/100g）,
    "vitaminA": ビタミンA（IU/100g）,
    "vitaminD": ビタミンD（IU/100g）,
    "vitaminK2": ビタミンK2（μg/100g、動物性食品の場合）,
    "vitaminB12": ビタミンB12（μg/100g、動物性食品の場合）,
    "omega3": オメガ3（g/100g）,
    "omega6": オメガ6（g/100g）,
    "calcium": カルシウム（mg/100g）,
    "phosphorus": リン（mg/100g）,
    "glycine": グリシン（g/100g、コラーゲン含有食品の場合）,
    "methionine": メチオニン（g/100g、筋肉由来の場合）,
    "taurine": タウリン（mg/100g、内臓・魚・肉に豊富）,
    "vitaminB1": ビタミンB1（mg/100g）,
    "vitaminB2": ビタミンB2（mg/100g）,
    "vitaminB3": ビタミンB3（mg/100g）,
    "vitaminB6": ビタミンB6（mg/100g）,
    "vitaminB7": ビタミンB7（μg/100g、ビオチン）,
    "vitaminB5": ビタミンB5（mg/100g、パントテン酸）,
    "vitaminB9": ビタミンB9（μg/100g、葉酸、Folate）,
    "vitaminE": ビタミンE（mg/100g）,
    "selenium": セレン（μg/100g）,
    "copper": 銅（mg/100g）,
    "manganese": マンガン（mg/100g）,
    "iodine": ヨウ素（μg/100g）,
    "chromium": クロム（μg/100g）,
    "molybdenum": モリブデン（μg/100g）,
    "fluoride": フッ素（mg/100g）,
    "chloride": 塩素（mg/100g）,
    "boron": ホウ素（mg/100g）,
    "nickel": ニッケル（mg/100g）,
    "silicon": ケイ素（mg/100g）,
    "vanadium": バナジウム（μg/100g）,
    "choline": コリン（mg/100g）,
    "phytates": フィチン酸（mg/100g、植物性食品の場合のみ）,
    "oxalates": シュウ酸（mg/100g、植物性食品の場合のみ）,
    "lectins": レクチン（mg/100g、植物性食品の場合のみ）
  },
  "followupQuestions": 追加で必要な情報がある場合、質問の配列（例: ["これは牛肉ですか？豚肉ですか？鶏肉ですか？", "部位はどれですか？（サーロイン、ロース、モモなど）", "バターや塩を使いましたか？"]）。食品名だけでは推測が難しい場合のみ。
}

重要:
- カーニボアダイエットで推奨される食品（肉、魚、卵、内臓など）を優先的に識別してください
- 植物性食品の場合は、抗栄養素（phytates, oxalates, lectins）も含めてください
- 数値は100gあたりの値で返してください
- 不明な栄養素は省略してください（nullではなく、キー自体を省略）
- 一般的な食品データベース（USDA FoodData Centralなど）の値を参考にしてください
- **最重要**: 食品名が「肉」や「魚」など曖昧な場合は、必ずfollowupQuestionsに具体的な種類を尋ねる質問を追加してください（例: ["これは牛肉ですか？豚肉ですか？鶏肉ですか？"]）。
- **最重要**: 肉の場合、部位が不明な場合は必ずfollowupQuestionsに部位を尋ねる質問を追加してください（例: ["部位はどれですか？（サーロイン、ロース、モモ、バラ肉など）"]）。
- **最重要**: 調理にバターや塩を使った可能性がある場合は、必ずfollowupQuestionsに質問を追加してください（例: ["バターや塩を使いましたか？", "調理油は使いましたか？"]）。
- 食品名だけでは推測が難しい場合（例: "肉"、"魚"など）、followupQuestionsに追加質問を入れてください（例: ["部位は？", "調理方法は？"]）`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // JSONをパース
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          foodName: parsed.foodName || foodName,
          type: parsed.type || 'animal',
          followupQuestions: parsed.followupQuestions || undefined,
          nutrients: parsed.nutrients || {},
        };
      }
    } catch (parseError) {
      logError(parseError, {
        component: 'aiService',
        action: 'estimateNutrientsFromFoodName',
        step: 'parseJSON',
      });
    }

    // JSONパースに失敗した場合、デフォルト値を返す
    return {
      foodName: foodName,
      type: 'animal',
      followupQuestions: undefined,
      nutrients: {},
    };
  } catch (error) {
    logError(error, { component: 'aiService', action: 'estimateNutrientsFromFoodName' });
    const errorMessage = getUserFriendlyErrorMessage(error) || '栄養素推測に失敗しました。';
    if (errorMessage.includes('APIキー') || errorMessage.includes('API key')) {
      throw new Error('Gemini APIキーが設定されていません。環境変数を確認してください。');
    }
    throw new Error('栄養素推測に失敗しました。もう一度お試しください。');
  }
}
