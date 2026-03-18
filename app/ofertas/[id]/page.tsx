import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import { fetchQuery } from 'convex/nextjs';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';

export const dynamic = 'force-dynamic';

export default async function OfertaDetalhePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const oferta = await fetchQuery(api.ofertas.detailWithJoins, { id: id as Id<"ofertas"> });

  if (!oferta) {
    notFound();
  }

  const sinais = oferta.sinais as Record<string, any>;

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">{oferta.nome}</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Detalhes</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="font-medium text-muted-foreground">Categoria</dt>
                <dd>{oferta.categoria}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-medium text-muted-foreground">Plataforma</dt>
                <dd>{oferta.plataforma || '-'}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-medium text-muted-foreground">Score Atual</dt>
                <dd className="font-bold">{oferta.score.toFixed(1)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-medium text-muted-foreground">Tendência</dt>
                <dd>{oferta.tendencia}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Sinais Detectados</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              {sinais && Object.entries(sinais).map(([key, value]: [string, any]) => (
                <li key={key} className="flex justify-between border-b pb-2">
                  <span className="font-medium">{key.replace(/_/g, ' ')}</span>
                  <span className="text-muted-foreground">
                    Valor: {String(value?.valor)} | Peso: {value?.peso}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
      {oferta.urlImagem && (
        <Card>
          <CardHeader>
            <CardTitle>Screenshot</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative aspect-video w-full overflow-hidden rounded-md border">
              <Image
                src={oferta.urlImagem}
                alt={`Screenshot de ${oferta.nome}`}
                fill
                className="object-cover"
                unoptimized
              />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
