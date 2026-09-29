import 'dotenv/config';

import Groq from 'groq-sdk';
import { SYSTEM_PROMPT } from '../constants';

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
