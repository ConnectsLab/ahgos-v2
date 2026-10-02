import { getCurrentUserAndBusiness } from '@/lib/session';
import { getCampaignSummaries } from '@/lib/data/campaigns';
import { CampaignsView } from '@/components/campaigns-view';

export default async function CampaignsPage() {
  const context = await getCurrentUserAndBusiness();
  if (!context) return null;
  if (!context.business) return null;

  const campaigns = await getCampaignSummaries(context.business.id);
  return <CampaignsView campaigns={campaigns} />;
}
