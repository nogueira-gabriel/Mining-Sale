import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { prisma } from '@/packages/database/src';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export async function AlertsFeed() {
  const alertas = await prisma.alerta.findMany({
    take: 10,
    orderBy: { criadoEm: 'desc' },
  });

  return (
    <Card className="col-span-3">
      <CardHeader>
        <CardTitle>Alertas Recentes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {alertas.map((alerta) => (
            <div key={alerta.id} className="flex items-center">
              <div className="ml-4 space-y-1">
                <p className="text-sm font-medium leading-none">{alerta.mensagem}</p>
                <p className="text-sm text-muted-foreground">
                  {formatDistanceToNow(alerta.criadoEm, { addSuffix: true, locale: ptBR })}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
