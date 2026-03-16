import { StatsCards } from '@/components/dashboard/StatsCards';
import { CategoryDistribution } from '@/components/dashboard/CategoryDistribution';
import { TrendChart } from '@/components/dashboard/TrendChart';
import { AlertsFeed } from '@/components/dashboard/AlertsFeed';
import { fetchQuery } from 'convex/nextjs';
import { api } from '@/convex/_generated/api';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const categoryData = await fetchQuery(api.ofertas.categoryDistribution);
  const trendData = await fetchQuery(api.ofertas.trendData);

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      </div>
      <StatsCards />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <CategoryDistribution data={categoryData} />
        <AlertsFeed />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <TrendChart data={trendData} />
      </div>
    </div>
  );
}
