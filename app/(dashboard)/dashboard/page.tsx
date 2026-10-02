import { CampaignDashboard } from '@/components/campaign-dashboard';
import { getCampaignSummaries } from '@/lib/data/campaigns';
import { getDashboardData } from '@/lib/data/dashboard';
import { getCurrentUserAndBusiness } from '@/lib/session';

export default async function DashboardPage() {
  // Get the User Business Id first
  const context = await getCurrentUserAndBusiness();
  if (!context?.business) return null;

  const [campaigns, stats] = await Promise.all([
    getCampaignSummaries(context.business.id),
    getDashboardData(context.business.id),
  ]);

  return <CampaignDashboard campaigns={campaigns} stats={stats} />;
}
