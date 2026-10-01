import { getBusinessReviews } from '@/lib/data/reviews';
import { getCurrentUserAndBusiness } from '@/lib/session';
import { ReviewsTable } from '@/components/reviews-table';

export default async function ReviewsPage() {
  const context = await getCurrentUserAndBusiness();

  const data = await getBusinessReviews(context?.business?.id);

  console.log(data);

  return (
    <div className="space-y-3">
      {/* Header */}
      <section>
        <h1 className="md:text-3xl font-semibold text-xl">Reviews</h1>
        <p className="md:text-sm dark:text-gray-500 text-gray-600">
          Customer Feedback from all campaigns
        </p>
      </section>
      {/* Table */}
      <ReviewsTable reviews={data} />
    </div>
  );
}
