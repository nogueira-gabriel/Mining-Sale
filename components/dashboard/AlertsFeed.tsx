import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { fetchQuery } from 'convex/nextjs';
import { api } from '@/convex/_generated/api';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export async function AlertsFeed() {
  const alertas = await fetchQuery(api.alertas.listRecent, { limit: 10 });

  return (
    <Card className="col-span-3">
      <CardHeader>
        <CardTitle>Alertas Recentes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {alertas.map((alerta) => (
            <div key={alerta._id} className="flex items-center">
              <div className="ml-4 space-y-1">
                <p className="text-sm font-medium leading-none">{alerta.mensagem}</p>
                <p className="text-sm text-muted-foreground">
                  {formatDistanceToNow(new Date(alerta._creationTime), { addSuffix: true, locale: ptBR })}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
