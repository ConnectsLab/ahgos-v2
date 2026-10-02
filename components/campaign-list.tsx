import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { CampaignSummary } from '@/lib/data/campaigns';
import { formatDate } from '@/lib/utils';
import { MoreHorizontalIcon, ExternalLink } from 'lucide-react';
import { Button } from './ui/button';
import Link from 'next/link';

export function CampaignList({ campaigns }: { campaigns: CampaignSummary[] }) {
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
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {campaigns.map((campaign) => (
            <TableRow key={campaign.id}>
              <TableCell>
                {formatDate(campaign.createdAt, 'd MMM yyyy')}
              </TableCell>
              <TableCell>{campaign.name}</TableCell>
              <TableCell className="text-center">
                {campaign.averageRating}
              </TableCell>
              <TableCell className="text-right line-clamp-1">
                {campaign.topics.join(', ')}
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={
                      <Button variant="ghost" size="icon" className="size-8">
                        <MoreHorizontalIcon />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    }
                  />
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem className={'text-sm'}>
                      <Link
                        href={`/campaigns/${campaign.id}`}
                        className="flex items-center justify-between  w-full"
                      >
                        view
                        <ExternalLink
                          strokeWidth={1.0}
                          className="h-2 w-2 text-red-600"
                        />
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
