import { prisma } from '@/packages/database/src';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';

export default async function TendenciasPage() {
  const tendencias = await prisma.tendenciaNicho.findMany({
    take: 50,
    orderBy: { crescimento: 'desc' },
  });

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Tendências de Nicho</h2>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Palavras-chave em Alta</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative w-full overflow-auto">
            <table className="w-full caption-bottom text-sm">
              <thead className="[&_tr]:border-b">
                <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Keyword</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Categoria</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Crescimento (%)</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Volume</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Período</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Fonte</th>
                </tr>
              </thead>
              <tbody className="[&_tr:last-child]:border-0">
                {tendencias.map((tendencia) => (
                  <tr key={tendencia.id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                    <td className="p-4 align-middle font-medium">{tendencia.keyword}</td>
                    <td className="p-4 align-middle">{tendencia.categoria || '-'}</td>
                    <td className="p-4 align-middle text-emerald-500">+{tendencia.crescimento.toFixed(1)}%</td>
                    <td className="p-4 align-middle">{tendencia.volume}</td>
                    <td className="p-4 align-middle">{tendencia.periodo}</td>
                    <td className="p-4 align-middle">{tendencia.fonte}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
