import { StatsCards } from '@/components/dashboard/StatsCards';
import { CategoryDistribution } from '@/components/dashboard/CategoryDistribution';
import { TrendChart } from '@/components/dashboard/TrendChart';
import { AlertsFeed } from '@/components/dashboard/AlertsFeed';
import { prisma } from '@/packages/database/src';
import { format, subDays } from 'date-fns';

export default async function DashboardPage() {
  // Fetch Category Distribution
  const categoryDataRaw = await prisma.oferta.groupBy({
    by: ['categoria'],
    _count: { id: true },
  });
  const categoryData = categoryDataRaw.map((item) => ({
    name: item.categoria,
    total: item._count.id,
  }));

  // Fetch Trend Data (Last 30 days)
  const thirtyDaysAgo = subDays(new Date(), 30);
  const trendDataRaw = await prisma.oferta.groupBy({
    by: ['criadoEm'],
    where: { criadoEm: { gte: thirtyDaysAgo } },
    _count: { id: true },
  });

  // Group by date
  const trendMap = new Map();
  for (let i = 0; i < 30; i++) {
    const date = format(subDays(new Date(), i), 'yyyy-MM-dd');
    trendMap.set(date, 0);
  }
  trendDataRaw.forEach((item) => {
    const date = format(item.criadoEm, 'yyyy-MM-dd');
    if (trendMap.has(date)) {
      trendMap.set(date, trendMap.get(date) + item._count.id);
    }
  });
  const trendData = Array.from(trendMap.entries())
    .map(([date, total]) => ({ date, total }))
    .reverse();

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
