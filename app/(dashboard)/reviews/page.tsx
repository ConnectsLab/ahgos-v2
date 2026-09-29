import { getCurrentUserAndBusiness } from '@/lib/session';
import { getBusinessReviews } from '@/lib/data/reviews';
import { ReviewsView } from '@/components/reviews-view';

export default async function ReviewsPage() {
  const context = await getCurrentUserAndBusiness();
  if (!context?.business) return null;

  const reviews = await getBusinessReviews(context.business.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Reviews</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          All customer feedback and extracted topic sentiments.
        </p>
      </div>

      <ReviewsView initialReviews={reviews} />
    </div>
  );
}
