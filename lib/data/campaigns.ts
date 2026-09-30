import { db } from '@/lib/db';
import { campaigns, reviewAspects, reviews } from '@/lib/db/schema';
import { desc, eq } from 'drizzle-orm';

export interface CampaignSummary {
  id: number;
  name: string;
  slug: string;
  createdAt: Date;
  reviewCount: number;
  averageRating: number | null;
  topics: string[];
}

export async function getCampaignSummaries(
  businessId: number
): Promise<CampaignSummary[]> {
  const [businessCampaigns, reviewRows, aspects] = await Promise.all([
    db
      .select()
      .from(campaigns)
      .where(eq(campaigns.businessId, businessId))
      .orderBy(desc(campaigns.createdAt)),
    db
      .select({ campaignId: reviews.campaignId, rating: reviews.rating })
      .from(reviews)
      .where(eq(reviews.businessId, businessId)),
    db
      .select({ campaignId: reviews.campaignId, name: reviewAspects.name })
      .from(reviewAspects)
      .innerJoin(reviews, eq(reviewAspects.reviewId, reviews.id))
      .where(eq(reviews.businessId, businessId)),
  ]);

  return businessCampaigns.map((campaign) => {
    const campaignReviews = campaignReviewsFor(campaign.id, reviewRows);
    const topicCounts = new Map<string, number>();
    for (const aspect of aspects) {
      if (aspect.campaignId !== campaign.id) continue;
      const name = aspect.name.trim();
      if (name) topicCounts.set(name, (topicCounts.get(name) ?? 0) + 1);
    }

    return {
      ...campaign,
      reviewCount: campaignReviews.length,
      averageRating:
        campaignReviews.length === 0
          ? null
          : Number(
              (
                campaignReviews.reduce((sum, review) => sum + review.rating, 0) /
                campaignReviews.length
              ).toFixed(1)
            ),
      topics: Array.from(topicCounts.entries())
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)
        .map(([name]) => name),
    };
  });
}

function campaignReviewsFor(
  campaignId: number,
  campaignReviews: { campaignId: number | null; rating: number }[]
) {
  return campaignReviews.filter((review) => review.campaignId === campaignId);
}
