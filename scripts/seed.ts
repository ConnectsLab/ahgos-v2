import dotenv from 'dotenv';
import { eq, inArray } from 'drizzle-orm';

dotenv.config({ path: '.env.local' });

import { db } from '../lib/db';
import {
  businesses,
  campaigns,
  reviewAspects,
  reviews,
  user,
} from '../lib/db/schema';

const TARGET_EMAIL = 'testing@ahgos.com';
const sentimentPool = ['positive', 'neutral', 'negative', 'mixed'] as const;
const aspectSentimentPool = ['positive', 'neutral', 'negative'] as const;
const aspectNames = [
  'onboarding',
  'support',
  'pricing',
  'speed',
  'dashboard',
  'usability',
  'checkout',
  'feature set',
] as const;

const reviewTemplates = [
  'The experience was smooth from first use to delivery and the workflow felt intuitive.',
  'Everything worked well overall, but there were a few friction points worth improving.',
  'We had a strong start, though some parts of the product felt a bit slow to learn.',
  'The product is promising and the team response time was solid. We would use it again.',
  'The onboarding process was easy, but support could be a little more proactive.',
  'The new feature set is helpful and the reporting tools are becoming more useful every week.',
  'The checkout flow is clear, but we still see some slow responses during peak usage.',
  'The implementation was quick and our team saw value right away from the dashboard.',
  'The experience was mostly positive, with a few rough edges in the setup process.',
  'We like the product direction and the functionality is improving with each release.',
] as const;

function buildRating(
  overallSentiment: (typeof sentimentPool)[number],
  index: number
) {
  if (overallSentiment === 'positive') return 4 + (index % 2);
  if (overallSentiment === 'negative') return 1 + (index % 2);
  if (overallSentiment === 'mixed') return 3;
  return 3 + (index % 2);
}

function buildText(campaignIndex: number, reviewIndex: number) {
  return `${reviewTemplates[(campaignIndex + reviewIndex) % reviewTemplates.length]} Review ${reviewIndex + 1} for ${campaignIndex + 1}.`;
}

async function ensureBusiness(userId: string) {
  const existingBusiness = (
    await db
      .select()
      .from(businesses)
      .where(eq(businesses.userId, userId))
      .limit(1)
  )[0];

  if (existingBusiness) {
    return existingBusiness;
  }

  const [createdBusiness] = await db
    .insert(businesses)
    .values({
      userId,
      name: 'Testing Business',
      type: 'Agency',
      slug: 'testing-business',
    })
    .returning();

  return createdBusiness;
}

async function resetCampaignData(businessId: number) {
  const campaignRows = await db
    .select({ id: campaigns.id })
    .from(campaigns)
    .where(eq(campaigns.businessId, businessId));

  if (campaignRows.length === 0) {
    return;
  }

  const campaignIds = campaignRows.map((campaign) => campaign.id);
  const reviewRows = await db
    .select({ id: reviews.id })
    .from(reviews)
    .where(inArray(reviews.campaignId, campaignIds));

  if (reviewRows.length) {
    await db.delete(reviewAspects).where(
      inArray(
        reviewAspects.reviewId,
        reviewRows.map((review) => review.id)
      )
    );
    await db.delete(reviews).where(inArray(reviews.campaignId, campaignIds));
  }

  await db.delete(campaigns).where(eq(campaigns.businessId, businessId));
}

async function seed() {
  console.log(`Looking up user ${TARGET_EMAIL}...`);

  const userRow = (
    await db.select().from(user).where(eq(user.email, TARGET_EMAIL)).limit(1)
  )[0];

  if (!userRow) {
    throw new Error(
      `No user found for ${TARGET_EMAIL}. Create the account first.`
    );
  }

  console.log(`Found user: ${userRow.id}`);

  const business = await ensureBusiness(userRow.id);
  await resetCampaignData(business.id);

  const campaignDefinitions = [
    { name: 'Spring Launch', slug: 'spring-launch' },
    { name: 'Retention Push', slug: 'retention-push' },
    { name: 'Brand Awareness', slug: 'brand-awareness' },
    { name: 'Customer Winback', slug: 'customer-winback' },
  ];

  for (const [
    campaignIndex,
    campaignDefinition,
  ] of campaignDefinitions.entries()) {
    const [createdCampaign] = await db
      .insert(campaigns)
      .values({
        businessId: business.id,
        name: campaignDefinition.name,
        slug: campaignDefinition.slug,
      })
      .returning();

    const reviewRows = Array.from({ length: 30 }, (_, reviewIndex) => {
      const sentiment =
        sentimentPool[(campaignIndex + reviewIndex) % sentimentPool.length];

      return {
        businessId: business.id,
        campaignId: createdCampaign.id,
        rating: buildRating(sentiment, reviewIndex),
        text: buildText(campaignIndex, reviewIndex),
        overallSentiment: sentiment,
        analysisStatus: 'DONE' as const,
        createdAt: new Date(
          Date.now() - (reviewIndex + 1) * 3600000 + campaignIndex * 86400000
        ),
      };
    });

    const insertedReviews = await db
      .insert(reviews)
      .values(reviewRows)
      .returning({
        id: reviews.id,
      });

    const aspectRows = insertedReviews.flatMap((review, reviewIndex) => {
      const nameA = aspectNames[(reviewIndex * 2) % aspectNames.length];
      const nameB = aspectNames[(reviewIndex * 2 + 1) % aspectNames.length];
      const sentimentA =
        aspectSentimentPool[
          (campaignIndex + reviewIndex) % aspectSentimentPool.length
        ];
      const sentimentB =
        aspectSentimentPool[
          (campaignIndex + reviewIndex + 1) % aspectSentimentPool.length
        ];

      return [
        {
          reviewId: review.id,
          name: nameA,
          sentiment: sentimentA,
          evidence: `${nameA} performed ${sentimentA === 'positive' ? 'well' : sentimentA === 'negative' ? 'poorly' : 'adequately'} in this campaign review.`,
        },
        {
          reviewId: review.id,
          name: nameB,
          sentiment: sentimentB,
          evidence: `${nameB} was mentioned as part of the feedback and matched the overall sentiment for this review.`,
        },
      ];
    });

    await db.insert(reviewAspects).values(aspectRows);
    console.log(`Inserted campaign ${campaignIndex + 1}: 30 reviews`);
  }

  console.log(
    `Seed complete: ${TARGET_EMAIL} now has 4 campaigns with 30 reviews each.`
  );
}

seed()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  });
