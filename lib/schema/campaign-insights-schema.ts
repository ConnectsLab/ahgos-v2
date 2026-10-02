import { z } from 'zod';

export const CampaignInsightInputSchema = z.object({
  campaign: z.object({
    name: z.string(),
    totalReviews: z.number().int().nonnegative(),
    analyzedReviews: z.number().int().nonnegative(),
    pendingAnalysisReviews: z.number().int().nonnegative(),
    failedAnalysisReviews: z.number().int().nonnegative(),
    averageRating: z.number().min(1).max(5).nullable(),
  }),
  sentiment: z.object({
    positive: z.number().int().nonnegative(),
    neutral: z.number().int().nonnegative(),
    negative: z.number().int().nonnegative(),
    mixed: z.number().int().nonnegative(),
  }),
  aspects: z.array(
    z.object({
      name: z.string(),
      mentions: z.number().int().positive(),
      positive: z.number().int().nonnegative(),
      neutral: z.number().int().nonnegative(),
      negative: z.number().int().nonnegative(),
      evidence: z.array(z.string()),
    })
  ),
});

export const CampaignInsightsSchema = z.object({
  summary: z.string(),
  whatWentWell: z.array(
    z.object({
      topic: z.string(),
      insight: z.string(),
      evidence: z.array(z.string()),
    })
  ),
  needsAttention: z.array(
    z.object({
      topic: z.string(),
      insight: z.string(),
      evidence: z.array(z.string()),
    })
  ),
  whatStoodOut: z.array(
    z.object({
      topic: z.string(),
      insight: z.string(),
      evidence: z.array(z.string()),
    })
  ),
});

export type CampaignInsightInput = z.infer<typeof CampaignInsightInputSchema>;
export type CampaignInsights = z.infer<typeof CampaignInsightsSchema>;
