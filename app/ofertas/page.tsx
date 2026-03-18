"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { usePaginatedQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';

const ITEMS_PER_PAGE = 50;

export default function OfertasPage() {
  const { results, status, loadMore } = usePaginatedQuery(
    api.ofertas.listarPaginado,
    {},
    { initialNumItems: ITEMS_PER_PAGE }
  );

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Ofertas Monitoradas</h2>
        <span className="text-sm text-muted-foreground">
          {results.length} carregados
        </span>
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
                {results.length === 0 && status !== "LoadingFirstPage" && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                      Nenhuma oferta encontrada.
                    </td>
                  </tr>
                )}
                {results.map((oferta) => (
                  <tr key={oferta._id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                    <td className="p-4 align-middle font-medium">
                      <Link href={`/ofertas/${oferta._id}`} className="hover:underline">
                        {oferta.nome}
                      </Link>
                    </td>
                    <td className="p-4 align-middle">{oferta.categoria}</td>
                    <td className="p-4 align-middle">{oferta.plataforma || '-'}</td>
                    <td className="p-4 align-middle">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        oferta.score >= 80 ? 'bg-green-100 text-green-800' :
                        oferta.score >= 60 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {oferta.score}
                      </span>
                    </td>
                    <td className="p-4 align-middle">
                      <span className={`text-xs font-semibold ${
                        oferta.tendencia === 'SUBINDO' ? 'text-green-600' :
                        oferta.tendencia === 'CAINDO' ? 'text-red-600' :
                        'text-muted-foreground'
                      }`}>
                        {oferta.tendencia}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex flex-col items-center gap-2">
            {status === "CanLoadMore" && (
              <button
                onClick={() => loadMore(ITEMS_PER_PAGE)}
                className="w-full py-2 rounded-lg border border-border text-sm text-muted-foreground hover:bg-muted/30 transition-colors"
              >
                Carregar mais {ITEMS_PER_PAGE} resultados
              </button>
            )}

            {status === "LoadingMore" && (
              <p className="text-center text-sm text-muted-foreground">Carregando...</p>
            )}

            {status === "Exhausted" && results.length > 0 && (
              <p className="text-center text-sm text-muted-foreground">
                Todas as {results.length} ofertas foram carregadas.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
