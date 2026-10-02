import { db } from '@/lib/db';
import { reviews, reviewAspects } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';

export interface DashboardStats {
  totalReviews: number;
  analyzedReviewCount: number;
  averageRating: number | null;
  positiveCount: number;
  neutralCount: number;
  negativeCount: number;
  mixedCount: number;
  topTopics: {
    name: string;
    total: number;
    positiveCount: number;
    positivePercent: number;
  }[];
  recentReviews: {
    id: number;
    campaignId: number | null;
    rating: number;
    text: string;
    overallSentiment: 'positive' | 'negative' | 'neutral' | 'mixed' | null;
    analysisStatus: 'DONE' | 'PENDING' | 'FAILED';
    createdAt: Date | null;
  }[];
  insight: string | null;
}

export async function getDashboardData(
  businessId: number
): Promise<DashboardStats> {
  const businessReviews = await db
    .select({
      id: reviews.id,
      campaignId: reviews.campaignId,
      rating: reviews.rating,
      text: reviews.text,
      overallSentiment: reviews.overallSentiment,
      analysisStatus: reviews.analysisStatus,
      createdAt: reviews.createdAt,
    })
    .from(reviews)
    .where(eq(reviews.businessId, businessId))
    .orderBy(desc(reviews.createdAt));

  const totalReviews = businessReviews.length;

  if (totalReviews === 0) {
    return {
      totalReviews: 0,
      analyzedReviewCount: 0,
      averageRating: null,
      positiveCount: 0,
      neutralCount: 0,
      negativeCount: 0,
      mixedCount: 0,
      topTopics: [],
      recentReviews: [],
      insight: null,
    };
  }

  const sumRating = businessReviews.reduce((sum, r) => sum + r.rating, 0);
  const averageRating = Number((sumRating / totalReviews).toFixed(1));

  let positiveCount = 0;
  let neutralCount = 0;
  let negativeCount = 0;
  let mixedCount = 0;

  for (const r of businessReviews) {
    if (r.overallSentiment === 'positive') positiveCount++;
    else if (r.overallSentiment === 'neutral') neutralCount++;
    else if (r.overallSentiment === 'negative') negativeCount++;
    else if (r.overallSentiment === 'mixed') mixedCount++;
  }

  const aspectsList = await db
    .select({
      name: reviewAspects.name,
      sentiment: reviewAspects.sentiment,
    })
    .from(reviewAspects)
    .innerJoin(reviews, eq(reviewAspects.reviewId, reviews.id))
    .where(eq(reviews.businessId, businessId));

  const topicMap = new Map<string, { total: number; positive: number }>();

  for (const a of aspectsList) {
    const key = a.name.trim();
    if (!key) continue;
    const current = topicMap.get(key) || { total: 0, positive: 0 };
    current.total += 1;
    if (a.sentiment === 'positive') {
      current.positive += 1;
    }
    topicMap.set(key, current);
  }

  const topTopics = Array.from(topicMap.entries())
    .map(([name, stat]) => ({
      name,
      total: stat.total,
      positiveCount: stat.positive,
      positivePercent: Math.round((stat.positive / stat.total) * 100),
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);

  let insight: string | null = null;
  if (totalReviews < 3) {
    insight =
      'Keep collecting feedback. More responses will help reveal meaningful patterns.';
  } else if (topTopics.length > 0) {
    const mostMentioned = topTopics[0];
    if (mostMentioned.positivePercent >= 80) {
      insight = `${mostMentioned.name} is your most praised topic (${mostMentioned.positivePercent}% positive across ${mostMentioned.total} mentions).`;
    } else if (mostMentioned.positivePercent <= 50) {
      insight = `${mostMentioned.name} is frequently mentioned, with only ${mostMentioned.positivePercent}% positive sentiment.`;
    } else {
      insight = `${mostMentioned.name} is your most frequently mentioned topic (${mostMentioned.total} mentions).`;
    }
  }

  return {
    totalReviews,
    analyzedReviewCount:
      positiveCount + neutralCount + negativeCount + mixedCount,
    averageRating,
    positiveCount,
    neutralCount,
    negativeCount,
    mixedCount,
    topTopics,
    recentReviews: businessReviews.slice(0, 5),
    insight,
  };
}
