"use client";

import { useState } from "react";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { SearchFilters, SearchParams } from "@/components/buscador/SearchFilters";
import { FAIXAS_IDADE } from "@/lib/constants";
import { Globe, Calendar, Server, FileText, AlertCircle, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

type SearchResultItem = {
  dominio: string;
  url: string;
  titulo: string;
  domainAgeDays: number | null;
  pais: string | null;
  servidor: string | null;
  ip: string | null;
  asn: string | null;
  screenshotUrl: string | null;
  urlscanResultUrl: string | null;
  dataAnalise: string | null;
  sortToken: any[] | null;
};

export default function BuscadorPage() {
  const [resultados, setResultados] = useState<SearchResultItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [currentQuery, setCurrentQuery] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [cursorHistory, setCursorHistory] = useState<(any[] | null)[]>([null]);
  const [hasMore, setHasMore] = useState(false);
  const [lastParams, setLastParams] = useState<SearchParams | null>(null);

  const searchAction = useAction(api.search.searchUrlscan);

  const executeSearch = async (params: SearchParams, page: number, cursor: any[] | null) => {
    setLoading(true);
    setSearched(true);
    setErrorMsg(null);

    if (page === 1) setResultados([]);

    try {
      const idx = parseInt(params.idadeIdx, 10);
      const faixa = FAIXAS_IDADE[idx];

      const res = await searchAction({
        query: params.query,
        idadeMinDias: faixa.min > 0 || faixa.min === 0 ? faixa.min : undefined,
        idadeMaxDias: faixa.max !== null ? faixa.max : undefined,
        pais: params.pais,
        dataRecente: params.dataRecente || undefined,
        size: parseInt(params.size, 10),
        searchAfter: cursor || undefined,
      });

      setResultados(res.resultados as SearchResultItem[]);
      setTotal(res.total);
      setHasMore(res.hasMore);
      setCurrentQuery(res.query);
      setCurrentPage(page);
      setLastParams(params);

      const newHistory = [...cursorHistory];
      newHistory[page] = res.lastSortToken;
      setCursorHistory(newHistory);

      if (typeof window !== "undefined") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Erro desconhecido ao buscar.");
    } finally {
      setLoading(false);
    }
  };

  const handleNewSearch = (params: SearchParams) => {
    setCursorHistory([null]);
    executeSearch(params, 1, null);
  };

  const handleNextPage = () => {
    if (lastParams && !loading && hasMore) {
      const nextCursor = cursorHistory[currentPage];
      executeSearch(lastParams, currentPage + 1, nextCursor);
    }
  };

  const handlePrevPage = () => {
    if (lastParams && !loading && currentPage > 1) {
      const prevCursor = cursorHistory[currentPage - 2];
      executeSearch(lastParams, currentPage - 1, prevCursor);
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6 min-h-screen">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight">Buscador de Domínios</h1>
        <p className="text-muted-foreground">
          Pesquise qualquer domínio ou plataforma (ex: myshopify, hotmart, kiwify) com filtros de idade e país.
        </p>
      </div>

      <SearchFilters onSearch={handleNewSearch} isLoading={loading} />

      {errorMsg && (
        <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-500 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p>{errorMsg}</p>
        </div>
      )}

      {searched && !loading && resultados.length === 0 && !errorMsg && (
        <div className="p-12 text-center border border-border/50 border-dashed rounded-lg bg-muted/20">
          <h3 className="text-lg font-medium">Nenhum resultado encontrado</h3>
          <p className="text-muted-foreground mt-2">
            Não encontramos sites que correspondam a esta busca.
            Tente remover filtros de idade ou país.
          </p>
        </div>
      )}

      {resultados.length > 0 && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-sm text-muted-foreground">
            <div className="flex flex-col">
              <span className="font-medium text-foreground">Página {currentPage}</span>
              <span>Total aproximado: {total.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handlePrevPage} disabled={loading || currentPage === 1}>
                <ChevronLeft className="w-4 h-4 mr-1" /> Anterior
              </Button>
              <Button variant="outline" size="sm" onClick={handleNextPage} disabled={loading || !hasMore}>
                Próxima <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
            <code className="hidden xl:block text-[10px] bg-muted/50 px-2 py-1 rounded border border-border max-w-[300px] truncate">
              {currentQuery}
            </code>
          </div>

          <div className="relative min-h-[400px]">
            {loading && (
              <div className="absolute inset-x-0 top-0 z-50 h-[300px] bg-background/40 backdrop-blur-[2px] flex items-center justify-center rounded-xl">
                <div className="bg-card border shadow-lg p-6 rounded-lg flex flex-col items-center gap-3">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  <p className="text-sm font-semibold">Buscando na web...</p>
                </div>
              </div>
            )}

            <div
              className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 transition-opacity duration-300 ${
                loading ? "opacity-30" : "opacity-100"
              }`}
            >
              {resultados.map((item, i) => (
                <div
                  key={item.dominio + i}
                  className="group relative flex flex-col justify-between overflow-hidden rounded-xl border border-border bg-card shadow transition-all hover:shadow-md hover:border-primary/50"
                >
                  <div className="aspect-[16/9] w-full bg-muted relative overflow-hidden flex items-center justify-center border-b border-border/30">
                    {item.screenshotUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.screenshotUrl}
                        alt={item.dominio}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        loading="lazy"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = "none";
                          const parent = target.parentElement;
                          if (parent) {
                            const placeholder = document.createElement("div");
                            placeholder.className = "text-muted-foreground/30 text-[10px] p-4 text-center";
                            placeholder.innerText = "Screenshot indisponível";
                            parent.appendChild(placeholder);
                          }
                        }}
                      />
                    ) : (
                      <div className="text-muted-foreground/30 text-xs flex flex-col items-center gap-2">
                        <Globe className="w-8 h-8 opacity-20" />
                        <span>Sem imagem</span>
                      </div>
                    )}

                    {item.domainAgeDays !== null && (
                      <div className="absolute top-2 right-2 bg-black/80 backdrop-blur-sm text-white text-[10px] px-2 py-0.5 rounded font-bold border border-white/10 shadow-sm flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-emerald-400" />
                        {item.domainAgeDays}d
                      </div>
                    )}
                  </div>

                  <div className="p-4 flex flex-col gap-3 flex-1">
                    <h3 className="font-bold text-base leading-tight truncate text-primary" title={item.dominio}>
                      {item.dominio}
                    </h3>

                    <div className="grid grid-cols-1 gap-2 text-[11px] text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Globe className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                        <span className="truncate">
                          {item.pais || "???"} {item.ip ? `(${item.ip})` : ""}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Server className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                        <span className="truncate">{item.servidor || "Servidor oculto"}</span>
                      </div>
                      {item.dataAnalise && (
                        <div className="flex items-center gap-2 border-t border-border/30 pt-2">
                          <FileText className="w-3.5 h-3.5 shrink-0" />
                          <span>Visto em: {new Date(item.dataAnalise).toLocaleDateString("pt-BR")}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="px-4 py-3 border-t border-border/50 bg-muted/20 flex gap-2">
                    <a
                      href={item.url.startsWith("http") ? item.url : `http://${item.url}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 flex justify-center items-center gap-1.5 text-[10px] font-bold py-2 bg-secondary text-secondary-foreground hover:bg-secondary/70 rounded-md transition-colors"
                    >
                      ABRIR SITE
                    </a>
                    {item.urlscanResultUrl && (
                      <a
                        href={item.urlscanResultUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex-1 flex justify-center items-center gap-1.5 text-[10px] font-bold py-2 bg-primary/10 text-primary hover:bg-primary/20 rounded-md transition-colors border border-primary/20"
                      >
                        ANALISAR
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-center items-center gap-6 py-10">
            <Button variant="outline" onClick={handlePrevPage} disabled={loading || currentPage === 1} className="px-6">
              <ChevronLeft className="w-4 h-4 mr-2" /> Anterior
            </Button>
            <div className="font-bold">Página {currentPage}</div>
            <Button variant="outline" onClick={handleNextPage} disabled={loading || !hasMore} className="px-6">
              Próxima <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
