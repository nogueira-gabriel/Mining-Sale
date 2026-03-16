import { prisma } from '@/packages/database/src';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { format } from 'date-fns';

export default async function PaginasPage() {
  const paginas = await prisma.pagina.findMany({
    take: 50,
    orderBy: { criadoEm: 'desc' },
  });

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Páginas Descobertas</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {paginas.map((pagina) => (
          <Card key={pagina.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                <Link href={`/paginas/${pagina.id}`} className="hover:underline">
                  {pagina.dominio}
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-muted-foreground">
                <p>Plataforma: {pagina.plataforma || '-'}</p>
                <p>Score: {pagina.scoreEscala.toFixed(1)}</p>
                <p>Descoberta: {format(pagina.criadoEm, 'dd/MM/yyyy')}</p>
                <p>País: {pagina.pais || '-'}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
