import { prisma } from '@/packages/database/src';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

export default async function OfertasPage() {
  const ofertas = await prisma.oferta.findMany({
    take: 50,
    orderBy: { score: 'desc' },
    include: { pagina: true },
  });

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Ofertas Monitoradas</h2>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Top Ofertas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative w-full overflow-auto">
            <table className="w-full caption-bottom text-sm">
              <thead className="[&_tr]:border-b">
                <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Nome</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Categoria</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Plataforma</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Score</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Tendência</th>
                </tr>
              </thead>
              <tbody className="[&_tr:last-child]:border-0">
                {ofertas.map((oferta) => (
                  <tr key={oferta.id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                    <td className="p-4 align-middle font-medium">
                      <Link href={`/ofertas/${oferta.id}`} className="hover:underline">
                        {oferta.nome}
                      </Link>
                    </td>
                    <td className="p-4 align-middle">{oferta.categoria}</td>
                    <td className="p-4 align-middle">{oferta.plataforma || '-'}</td>
                    <td className="p-4 align-middle">{oferta.score.toFixed(1)}</td>
                    <td className="p-4 align-middle">{oferta.tendencia}</td>
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
