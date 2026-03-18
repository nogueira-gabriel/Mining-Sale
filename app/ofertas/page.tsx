"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Doc, Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ExternalLink, Pencil, Trash2, Star } from "lucide-react";

const CATEGORIAS = ["Infoproduto", "E-commerce", "SaaS", "Serviço", "Afiliado", "Outro"];
const STATUS_ADS = ["Rodando", "Pausado", "Sem anúncio"];

function statusBadgeClass(status: string) {
  if (status === "Rodando") return "bg-emerald-500/20 text-emerald-300 border-emerald-500/40";
  if (status === "Pausado") return "bg-amber-500/20 text-amber-300 border-amber-500/40";
  return "bg-muted text-muted-foreground border-border";
}

export default function OfertasPage() {
  const [categoria, setCategoria] = useState("ALL");
  const [statusAds, setStatusAds] = useState("ALL");

  const filtros = useMemo(
    () => ({
      categoria: categoria === "ALL" ? undefined : categoria,
      statusAds: statusAds === "ALL" ? undefined : statusAds,
    }),
    [categoria, statusAds],
  );

  const ofertas = useQuery(api.ofertas.listar, filtros);
  const deletar = useMutation(api.ofertas.deletar);
  const toggleFavorito = useMutation(api.ofertas.toggleFavorito);
  const ofertasList = useMemo(() => (ofertas ?? []) as Doc<"ofertas">[], [ofertas]);

  const categoriasDisponiveis = useMemo(() => {
    const dinamicas = new Set(ofertasList.map((o) => o.categoria));
    return Array.from(new Set([...CATEGORIAS, ...Array.from(dinamicas)])).sort();
  }, [ofertasList]);

  const handleDelete = async (id: Id<"ofertas">) => {
    const confirmou = window.confirm("Deseja realmente deletar esta oferta?");
    if (!confirmou) return;
    await deletar({ id });
  };

  if (ofertas === undefined) {
    return <div className="p-6">Carregando ofertas...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Minhas Ofertas</h1>
          <p className="text-muted-foreground">Catálogo manual das ofertas monitoradas.</p>
        </div>
        <Button asChild>
          <Link href="/ofertas/nova">Nova oferta</Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Categoria</p>
          <Select value={categoria} onValueChange={setCategoria}>
            <SelectTrigger>
              <SelectValue placeholder="Todas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todas</SelectItem>
              {categoriasDisponiveis.map((item) => (
                <SelectItem key={item} value={item}>
                  {item}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Status de anúncios</p>
          <Select value={statusAds} onValueChange={setStatusAds}>
            <SelectTrigger>
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todos</SelectItem>
              {STATUS_ADS.map((status) => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {ofertasList.length === 0 ? (
        <div className="rounded-xl border border-dashed p-10 text-center text-muted-foreground">
          Nenhuma oferta cadastrada. Adicione sua primeira oferta.
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {ofertasList.map((oferta) => (
            <article key={oferta._id} className="rounded-xl border bg-card shadow-sm overflow-hidden">
              {oferta.screenshotUrl ? (
                <div className="relative h-40 w-full">
                  <Image src={oferta.screenshotUrl} alt={oferta.nome} fill className="object-cover" unoptimized />
                </div>
              ) : null}

              <div className="space-y-4 p-4">
                <div className="space-y-2">
                  <h2 className="text-xl font-bold leading-tight">{oferta.nome}</h2>
                  <div className="flex flex-wrap gap-2 text-xs">
                    <span className="rounded-full border px-2.5 py-1">{oferta.categoria}</span>
                    <span className={`rounded-full border px-2.5 py-1 ${statusBadgeClass(oferta.statusAds)}`}>
                      {oferta.statusAds}
                    </span>
                  </div>
                  {oferta.plataforma && <p className="text-sm text-muted-foreground">Plataforma: {oferta.plataforma}</p>}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Button asChild size="sm" variant="secondary">
                    <a href={oferta.urlSite} target="_blank" rel="noreferrer">
                      Abrir site
                    </a>
                  </Button>

                  {oferta.urlAds ? (
                    <Button asChild size="sm" variant="outline">
                      <a href={oferta.urlAds} target="_blank" rel="noreferrer">
                        Ver anúncios
                      </a>
                    </Button>
                  ) : (
                    <Button size="sm" variant="outline" disabled>
                      Ver anúncios
                    </Button>
                  )}

                  {oferta.urlscanResultUrl ? (
                    <Button asChild size="sm" variant="outline" className="col-span-2">
                      <a href={oferta.urlscanResultUrl} target="_blank" rel="noreferrer">
                        Ver no urlscan <ExternalLink className="ml-1 h-3.5 w-3.5" />
                      </a>
                    </Button>
                  ) : null}
                </div>

                {oferta.notas && <p className="text-sm italic text-muted-foreground">{oferta.notas}</p>}

                <div className="flex items-center justify-end gap-2 pt-1">
                  <Button asChild variant="ghost" size="icon" title="Editar">
                    <Link href={`/ofertas/nova?id=${oferta._id}`}>
                      <Pencil className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    title="Deletar"
                    onClick={() => handleDelete(oferta._id)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    title="Favoritar"
                    onClick={() => toggleFavorito({ id: oferta._id })}
                    className={oferta.favoritado ? "text-yellow-300" : ""}
                  >
                    <Star className={`h-4 w-4 ${oferta.favoritado ? "fill-yellow-300" : ""}`} />
                  </Button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
