import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { prisma } from '@/packages/database/src';

export async function StatsCards() {
  const totalOfertas = await prisma.oferta.count();
  const novasHoje = await prisma.oferta.count({
    where: {
      criadoEm: {
        gte: new Date(new Date().setHours(0, 0, 0, 0)),
      },
    },
  });
  const scoreMedioResult = await prisma.oferta.aggregate({
    _avg: { score: true },
  });
  const scoreMedio = scoreMedioResult._avg.score || 0;
  const alertasNaoLidos = await prisma.alerta.count({
    where: { lido: false },
  });

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
