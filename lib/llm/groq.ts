import 'dotenv/config';

import Groq from 'groq-sdk';
import { SYSTEM_ANALYSIS_PROMPT, SYSTEM_PROMPT } from '../constants';
import {
  CampaignInsightInputSchema,
  CampaignInsightsSchema,
  type CampaignInsightInput,
} from '@/lib/schema/campaign-insights-schema';

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const groq = new Groq({ apiKey: GROQ_API_KEY });

export async function analyzeReview(review: string) {
  try {
    const response = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: SYSTEM_PROMPT,
        },
        {
          role: 'user',
          content: review,
        },
      ],
      model: 'openai/gpt-oss-120b',
    });

    return JSON.parse(response.choices[0].message.content!);
  } catch (error) {
    console.log(error);

    return error;
  }
}

export async function generateCampaignInsights(input: CampaignInsightInput) {
  const validatedInput = CampaignInsightInputSchema.parse(input);
  const response = await groq.chat.completions.create({
    messages: [
      {
        role: 'system',
        content: SYSTEM_ANALYSIS_PROMPT,
      },
      {
        role: 'user',
        content: JSON.stringify(validatedInput),
      },
    ],
    model: 'openai/gpt-oss-120b',
    response_format: { type: 'json_object' },
  });

  const content = response.choices[0]?.message.content;
  if (!content) {
    throw new Error('The insight model returned an empty response.');
  }

  return CampaignInsightsSchema.parse(JSON.parse(content));
}
