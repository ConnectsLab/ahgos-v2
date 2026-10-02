import { NextRequest, NextResponse } from 'next/server';
import { and, eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { campaigns, reviewAspects, reviews } from '@/lib/db/schema';
import { getCurrentUserAndBusiness } from '@/lib/session';
import { generateCampaignInsights } from '@/lib/llm/groq';

interface CampaignInsightsRouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(
  _request: NextRequest,
  { params }: CampaignInsightsRouteContext
) {
  try {
    const context = await getCurrentUserAndBusiness();
    if (!context) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (!context.business) {
      return NextResponse.json(
        { error: 'Business not found' },
        { status: 404 }
      );
    }

    const campaignId = Number((await params).id);
    if (!Number.isInteger(campaignId)) {
      return NextResponse.json(
        { error: 'Invalid campaign id' },
        { status: 400 }
      );
    }

    const campaign = await db.query.campaigns.findFirst({
      where: and(
        eq(campaigns.id, campaignId),
        eq(campaigns.businessId, context.business.id)
      ),
      columns: { id: true, name: true },
    });
    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      );
    }

    const [campaignReviews, campaignAspects] = await Promise.all([
      db
        .select({
          rating: reviews.rating,
          overallSentiment: reviews.overallSentiment,
          analysisStatus: reviews.analysisStatus,
        })
        .from(reviews)
        .where(
          and(
            eq(reviews.businessId, context.business.id),
            eq(reviews.campaignId, campaign.id)
          )
        ),
      db
        .select({
          name: reviewAspects.name,
          sentiment: reviewAspects.sentiment,
          evidence: reviewAspects.evidence,
        })
        .from(reviewAspects)
        .innerJoin(reviews, eq(reviewAspects.reviewId, reviews.id))
        .where(
          and(
            eq(reviews.businessId, context.business.id),
            eq(reviews.campaignId, campaign.id)
          )
        ),
    ]);

    const sentiment = {
      positive: 0,
      neutral: 0,
      negative: 0,
      mixed: 0,
    };
    for (const review of campaignReviews) {
      if (review.overallSentiment) sentiment[review.overallSentiment] += 1;
    }

    const analyzedReviews = Object.values(sentiment).reduce(
      (total, count) => total + count,
      0
    );
    if (analyzedReviews === 0) {
      return NextResponse.json(
        { error: 'No analyzed feedback is available for this campaign yet.' },
        { status: 409 }
      );
    }

    const aspectMap = new Map<
      string,
      {
        name: string;
        mentions: number;
        positive: number;
        neutral: number;
        negative: number;
        evidence: Record<'positive' | 'neutral' | 'negative', string[]>;
      }
    >();

    for (const aspect of campaignAspects) {
      const name = aspect.name.trim();
      if (!name) continue;

      const key = name.toLowerCase();
      const aggregate = aspectMap.get(key) ?? {
        name: key,
        mentions: 0,
        positive: 0,
        neutral: 0,
        negative: 0,
        evidence: { positive: [], neutral: [], negative: [] },
      };

      aggregate.mentions += 1;
      aggregate[aspect.sentiment] += 1;

      const evidence = aspect.evidence.trim();
      if (
        evidence &&
        !aggregate.evidence[aspect.sentiment].includes(evidence)
      ) {
        aggregate.evidence[aspect.sentiment].push(evidence);
      }

      aspectMap.set(key, aggregate);
    }

    const aspects = Array.from(aspectMap.values())
      .map((aspect) => {
        const representativeEvidence: string[] = [];
        for (const category of ['negative', 'positive', 'neutral'] as const) {
          const example = aspect.evidence[category][0];
          if (example) representativeEvidence.push(example);
        }
        for (const category of ['negative', 'positive', 'neutral'] as const) {
          for (const example of aspect.evidence[category]) {
            if (representativeEvidence.length >= 3) break;
            if (!representativeEvidence.includes(example)) {
              representativeEvidence.push(example);
            }
          }
        }

        return {
          name: aspect.name,
          mentions: aspect.mentions,
          positive: aspect.positive,
          neutral: aspect.neutral,
          negative: aspect.negative,
          evidence: representativeEvidence,
        };
      })
      .sort((left, right) => right.mentions - left.mentions);

    const averageRating = campaignReviews.length
      ? Number(
          (
            campaignReviews.reduce(
              (total, review) => total + review.rating,
              0
            ) / campaignReviews.length
          ).toFixed(1)
        )
      : null;

    const insights = await generateCampaignInsights({
      campaign: {
        name: campaign.name,
        totalReviews: campaignReviews.length,
        analyzedReviews,
        pendingAnalysisReviews: campaignReviews.filter(
          (review) => review.analysisStatus === 'PENDING'
        ).length,
        failedAnalysisReviews: campaignReviews.filter(
          (review) => review.analysisStatus === 'FAILED'
        ).length,
        averageRating,
      },
      sentiment,
      aspects,
    });

    return NextResponse.json({ insights });
  } catch (error) {
    console.error('Campaign insight generation failed:', error);
    return NextResponse.json(
      { error: 'Unable to generate insights right now.' },
      { status: 500 }
    );
  }
}
