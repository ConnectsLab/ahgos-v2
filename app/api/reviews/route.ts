import { analyzeReview } from '@/lib/llm/groq';
import { ReviewAnalysisSchema } from '@/lib/schema/review-schema';
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { businesses, campaigns, reviewAspects, reviews } from '@/lib/db/schema';
import { after } from 'next/server';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { businessId, campaignId, rating, text } = body;

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Review text is required' },
        { status: 400 }
      );
    }

    if (!Number.isInteger(businessId)) {
      return NextResponse.json(
        { error: 'A valid business is required' },
        { status: 400 }
      );
    }

    const business = await db.query.businesses.findFirst({
      where: eq(businesses.id, businessId),
      columns: { id: true },
    });

    if (!business) {
      return NextResponse.json(
        { error: 'Business not found' },
        { status: 404 }
      );
    }

    if (campaignId !== undefined) {
      if (!Number.isInteger(campaignId)) {
        return NextResponse.json(
          { error: 'A valid campaign is required' },
          { status: 400 }
        );
      }

      const campaign = await db.query.campaigns.findFirst({
        where: eq(campaigns.id, campaignId),
        columns: { businessId: true },
      });
      if (!campaign || campaign.businessId !== businessId) {
        return NextResponse.json(
          { error: 'Campaign not found' },
          { status: 404 }
        );
      }
    }

    // Store the review immediately
    const [review] = await db
      .insert(reviews)
      .values({
        businessId,
        campaignId: campaignId ?? null,
        rating,
        text,
        analysisStatus: 'PENDING',
      })
      .returning();

    // Run analysis after the response
    after(async () => {
      try {
        // Analyze with LLM
        const result = await analyzeReview(text);

        // Validate LLM response
        const analysis = ReviewAnalysisSchema.parse(result);

        // Update review with analysis result
        await db
          .update(reviews)
          .set({
            overallSentiment: analysis.overallSentiment,
            analysisStatus: 'DONE',
          })
          .where(eq(reviews.id, review.id));

        // Store aspects
        if (analysis.aspects.length > 0) {
          await db.insert(reviewAspects).values(
            analysis.aspects.map((aspect) => ({
              reviewId: review.id,
              name: aspect.name,
              sentiment: aspect.sentiment,
              evidence: aspect.evidence,
            }))
          );
        }
      } catch (error) {
        console.error('Review analysis failed:', error);

        // Mark analysis as failed
        await db
          .update(reviews)
          .set({
            analysisStatus: 'FAILED',
          })
          .where(eq(reviews.id, review.id));
      }
    });

    return NextResponse.json(
      {
        success: true,
        review,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Review submission error:', error);

    return NextResponse.json(
      {
        error: 'Failed to submit review',
      },
      { status: 500 }
    );
  }
}
