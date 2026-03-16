import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { fetchQuery } from 'convex/nextjs';
import { api } from '@/convex/_generated/api';

export async function StatsCards() {
  const totalOfertas = await fetchQuery(api.ofertas.count);
  const novasHoje = await fetchQuery(api.ofertas.countToday);
  const scoreMedio = await fetchQuery(api.ofertas.averageScore);
  const alertasNaoLidos = await fetchQuery(api.alertas.countUnread);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total de Ofertas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalOfertas}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Novas Hoje</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{novasHoje}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Score Médio</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{scoreMedio.toFixed(1)}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Alertas Pendentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{alertasNaoLidos}</div>
        </CardContent>
      </Card>
    </div>
  );
}
