import { CampaignDashboard } from '@/components/campaign-dashboard';
import { CreateCampaign } from '@/components/create-campaign';
import { getCampaignSummaries } from '@/lib/data/campaigns';
import { getCurrentUserAndBusiness } from '@/lib/session';

export default async function DashboardPage() {
  // Get the User Business Id first
  const context = await getCurrentUserAndBusiness();
  if (!context?.business) return null;

  // Then fetch all the campaign from the user
  const campaigns = await getCampaignSummaries(context.business.id);
  return (
    <>
      {campaigns.length < 1 ? (
        <div>
          <CreateCampaign />
        </div>
      ) : (
        <CampaignDashboard campaigns={campaigns} />
      )}
    </>
  );
}
