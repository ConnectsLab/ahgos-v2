import { getCurrentUserAndBusiness } from '@/lib/session';
import { CollectFeedbackView } from '@/components/collect-feedback-view';
import { db } from '@/lib/db';
import { campaigns } from '@/lib/db/schema';
import { desc, eq } from 'drizzle-orm';

export default async function CollectPage() {
  const context = await getCurrentUserAndBusiness();
  if (!context) return null;
  if (!context.business) return null;

  const businessCampaigns = await db
    .select()
    .from(campaigns)
    .where(eq(campaigns.businessId, context.business.id))
    .orderBy(desc(campaigns.createdAt));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Collect Feedback
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Share your feedback link to collect reviews from your customers.
        </p>
      </div>

      <CollectFeedbackView
        business={{
          id: context.business.id,
          name: context.business.name,
          slug: context.business.slug,
        }}
        campaigns={businessCampaigns}
      />
    </div>
  );
}
