import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { CampaignSummary } from '@/lib/data/campaigns';
import { Star } from 'lucide-react';

export function CampaignList({ campaigns }: { campaigns: CampaignSummary[] }) {
  console.log(campaigns);

  return (
    <div className="space-y-2">
      {/* Header */}
      <div>
        <p className="font-medium text-lg">Campaigns/Events</p>
      </div>
      <Table>
        <TableCaption>List of Campaigns.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Campaign/event</TableHead>
            <TableHead className="text-center">Avg Ratings</TableHead>
            <TableHead className="text-right">Highlights</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {campaigns.map((campaign) => (
            <TableRow key={campaign.id}>
              <TableCell>
                {new Date(campaign.createdAt).toLocaleDateString('en-GB', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </TableCell>
              <TableCell>{campaign.name}</TableCell>
              <TableCell className="text-center">
                {campaign.averageRating}
              </TableCell>
              <TableCell className="text-right line-clamp-1">
                {campaign.topics.join(', ')}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
