import { db } from '@/lib/db';
import { reviews } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';

export interface ReviewWithAspects {
  id: number;
  businessId: number | null;
  rating: number;
  text: string;
  overallSentiment: 'positive' | 'negative' | 'neutral' | 'mixed' | null;
  analysisStatus: 'DONE' | 'PENDING' | 'FAILED';
  createdAt: Date | null;
  aspects: {
    id: number;
    name: string;
    sentiment: 'positive' | 'negative' | 'neutral';
    evidence: string;
  }[];
}

export async function getBusinessReviews(
  businessId: number
): Promise<ReviewWithAspects[]> {
  return await db.query.reviews.findMany({
    where: eq(reviews.businessId, businessId),
    with: {
      aspects: true,
    },
    orderBy: [desc(reviews.createdAt)],
  });
}

export async function getCampaignReviews(
  businessId: number,
  campaignId: number
): Promise<ReviewWithAspects[]> {
  return await db.query.reviews.findMany({
    where: (review, { and, eq }) =>
      and(eq(review.businessId, businessId), eq(review.campaignId, campaignId)),
    with: { aspects: true },
    orderBy: [desc(reviews.createdAt)],
  });
}
