/**
 * Primal Logic - OpenAI API Integration
 *
 * Recovery Protocol生成用のAI API統合
 * 技術仕様書: @Primal_Logic_Technical_Spec.md 参照
 */

import { logError } from './errorHandler';

export interface OpenAIRequest {
  violationType: string;
  userProfile?: {
    gender?: string;
    goal?: string;
    metabolicStatus?: string;
  };
  foodItem: string;
}

export interface OpenAIResponse {
  protocol: {
    fastingTargetHours: number;
    activities: string[];
    dietRecommendations: string[];
    supplements: string[];
    warnings: string[];
  };
  reasoning: string;
}

/**
 * Generate recovery protocol using OpenAI API
 *
 * Fallback: If API fails, use static algorithm
 */
export async function generateRecoveryProtocolWithAI(
  request: OpenAIRequest
): Promise<OpenAIResponse | null> {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

  if (!apiKey) {
    console.warn('OpenAI API key not found. Using static algorithm.');
    return null;
  }

  try {
    const systemPrompt = `You are the "Primal Logic Engine," an advanced nutritional AI based on Evolutionary Biology, Anthropology, and Metabolic Biochemistry. You reject the "Standard American Diet" guidelines and strictly adhere to the logic of the Carnivore Diet.

When a violation is detected, generate a specific recovery protocol based on:
1. Violation type (sugar/carbs, seed oils, alcohol, oxalates)
2. User's metabolic status
3. Biochemical mechanisms

Return a JSON object with:
- fastingTargetHours: number (16-20 hours)
- activities: string[] (e.g., "Sprint/HIIT")
- dietRecommendations: string[] (specific foods)
- supplements: string[] (optional)
- warnings: string[] (important notes)
- reasoning: string (brief explanation)`;

    const userPrompt = `Violation Type: ${request.violationType}
Food Item: ${request.foodItem}
User Profile: ${JSON.stringify(request.userProfile || {})}

Generate a recovery protocol.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      throw new Error('No content in OpenAI response');
    }

    // Parse JSON response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }

    return JSON.parse(jsonMatch[0]) as OpenAIResponse;
  } catch (error) {
    logError(error, { component: 'openaiApi', action: 'generateRecoveryProtocolWithAI' });
    return null;
  }
}
