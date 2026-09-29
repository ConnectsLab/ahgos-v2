import { z } from 'zod';

export const ReviewAnalysisSchema = z.object({
  overallSentiment: z.enum(['positive', 'negative', 'neutral', 'mixed']),
  aspects: z.array(
    z.object({
      name: z.string(),
      sentiment: z.enum(['positive', 'negative', 'neutral']),
      evidence: z.string(),
    })
  ),
});
