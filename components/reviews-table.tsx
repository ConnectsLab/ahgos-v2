import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ReviewWithAspects } from '@/lib/data/reviews';
import { MoreHorizontal, Star } from 'lucide-react';

export function ReviewsTable({ reviews }: { reviews: ReviewWithAspects[] }) {
  console.log(reviews);

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[100px]">Ratings</TableHead>
          <TableHead>Reviews</TableHead>
          <TableHead>Campaign</TableHead>
          <TableHead>Sentiment</TableHead>
          <TableHead className="text-right">Status</TableHead>
          <TableHead className="text-right">Date</TableHead>
          <TableHead className="text-right"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {reviews.map((review) => (
          <TableRow key={review.id}>
            <TableCell>
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-3 w-3 ${
                      i < review.rating
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-muted-foreground/30'
                    }`}
                  />
                ))}
              </div>
            </TableCell>
            <TableCell className="max-w-[400px]">
              <p className="line-clamp-1 text-sm font-normal text-foreground">
                {review.text}
              </p>
            </TableCell>
            <TableCell>{review.campaign.name}</TableCell>
            <TableCell className="line-clamp-1 md:w-25">
              {review.overallSentiment}
            </TableCell>
            <TableCell className="text-right">
              {review.analysisStatus}
            </TableCell>

            <TableCell>
              {new Date(review.createdAt).toLocaleDateString()}
            </TableCell>

            <TableCell className="text-right">
              <MoreHorizontal />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
