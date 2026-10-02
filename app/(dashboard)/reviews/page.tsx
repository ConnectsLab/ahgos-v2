import { getBusinessReviews } from '@/lib/data/reviews';
import { getCurrentUserAndBusiness } from '@/lib/session';
import { ReviewsTable } from '@/components/reviews-table';

export default async function ReviewsPage() {
  const context = await getCurrentUserAndBusiness();
  const businessId = context?.business?.id;

  if (!businessId) {
    return (
      <div className="space-y-7">
        <section className="space-y-2">
          <p className="text-xs font-semibold uppercase text-primary">
            Customer feedback
          </p>
          <h1 className="font-heading text-3xl font-semibold leading-tight text-foreground md:text-4xl">
            Reviews
          </h1>
          <p className="text-sm text-muted-foreground">
            No business is linked to this account yet.
          </p>
        </section>
      </div>
    );
  }

  const data = await getBusinessReviews(businessId);

  return (
    <div className="space-y-7">
      <section className="flex items-end justify-between gap-4">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase text-primary">
            Customer feedback
          </p>
          <h1 className="font-heading text-3xl font-semibold leading-tight text-foreground md:text-4xl">
            Reviews
          </h1>
          <p className="text-sm text-muted-foreground">
            Customer feedback from all campaigns.
          </p>
        </div>
        <div className="hidden border-l border-border/60 pl-5 text-right sm:block">
          <p className="font-serif text-2xl leading-none text-foreground">
            {data.length}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {data.length === 1 ? 'review' : 'reviews'}
          </p>
        </div>
      </section>
      <ReviewsTable reviews={data} />
    </div>
  );
}
