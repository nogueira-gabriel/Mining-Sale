import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { fetchQuery } from 'convex/nextjs';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';

export const dynamic = 'force-dynamic';

export default async function PaginaDetalhePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const pagina = await fetchQuery(api.paginas.detail, { id: id as Id<"paginas"> });

  if (!pagina) {
    notFound();
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">{pagina.dominio}</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Detalhes da Página</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="font-medium text-muted-foreground">URL Original</dt>
                <dd className="truncate max-w-[200px]" title={pagina.urlOriginal}>
                  <a href={pagina.urlOriginal} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                    {pagina.urlOriginal}
                  </a>
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-medium text-muted-foreground">Título</dt>
                <dd className="truncate max-w-[200px]" title={pagina.titulo || ''}>{pagina.titulo || '-'}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-medium text-muted-foreground">Idade do Domínio (dias)</dt>
                <dd>{pagina.domainAgeDays || '-'}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-medium text-muted-foreground">País</dt>
                <dd>{pagina.pais || '-'}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-medium text-muted-foreground">Links Externos</dt>
                <dd>{pagina.linksExternos || '-'}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-medium text-muted-foreground">Total Requests</dt>
                <dd>{pagina.totalRequests || '-'}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Ofertas Encontradas</CardTitle>
          </CardHeader>
          <CardContent>
            {pagina.ofertas.length > 0 ? (
              <ul className="space-y-2 text-sm">
                {pagina.ofertas.map((oferta: any) => (
                  <li key={oferta._id} className="flex justify-between border-b pb-2">
                    <Link href={`/ofertas/${oferta._id}`} className="font-medium hover:underline">
                      {oferta.nome}
                    </Link>
                    <span className="text-muted-foreground">
                      {oferta.categoria} | Score: {oferta.score.toFixed(1)}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">Nenhuma oferta encontrada nesta página.</p>
            )}
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Tecnologias Detectadas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {pagina.tecnologias.map((tech: string) => (
              <span key={tech} className="inline-flex items-center rounded-md bg-secondary px-2.5 py-0.5 text-xs font-semibold text-secondary-foreground">
                {tech}
              </span>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
