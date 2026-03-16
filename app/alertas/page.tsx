import { prisma } from '@/packages/database/src';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default async function AlertasPage() {
  const alertas = await prisma.alerta.findMany({
    take: 100,
    orderBy: { criadoEm: 'desc' },
    include: { oferta: true },
  });

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Central de Alertas</h2>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Todos os Alertas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative w-full overflow-auto">
            <table className="w-full caption-bottom text-sm">
              <thead className="[&_tr]:border-b">
                <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Tipo</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Mensagem</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Oferta</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Data</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody className="[&_tr:last-child]:border-0">
                {alertas.map((alerta) => (
                  <tr key={alerta.id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                    <td className="p-4 align-middle font-medium">{alerta.tipo}</td>
                    <td className="p-4 align-middle">{alerta.mensagem}</td>
                    <td className="p-4 align-middle">
                      {alerta.oferta ? (
                        <Link href={`/ofertas/${alerta.oferta.id}`} className="text-blue-500 hover:underline">
                          {alerta.oferta.nome}
                        </Link>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="p-4 align-middle">
                      {formatDistanceToNow(alerta.criadoEm, { addSuffix: true, locale: ptBR })}
                    </td>
                    <td className="p-4 align-middle">
                      {alerta.lido ? (
                        <span className="text-muted-foreground">Lido</span>
                      ) : (
                        <span className="text-emerald-500 font-bold">Novo</span>
                      )}
                    </td>
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
