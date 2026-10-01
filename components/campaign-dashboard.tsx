'use client';

import type { CampaignSummary } from '@/lib/data/campaigns';
import { CampaignList } from '@/components/campaign-list';
import { CreateCampaign } from './create-campaign';

interface CampaignDashboardProps {
  campaigns: CampaignSummary[];
}

export function CampaignDashboard({ campaigns }: CampaignDashboardProps) {
  return (
    <div className="space-y-10">
      {/* Campaign List 
      <CampaignList campaigns={campaigns} /> */}
    </div>
  );
}
