"use client";

import { FormEvent, useEffect, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const CATEGORIAS = ["Infoproduto", "E-commerce", "SaaS", "Serviço", "Afiliado", "Outro"];
const STATUS_ADS = ["Rodando", "Pausado", "Sem anúncio"];

type FormState = {
  nome: string;
  categoria: string;
  urlSite: string;
  urlAds: string;
  plataforma: string;
  statusAds: string;
  urlscanResultUrl: string;
  screenshotUrl: string;
  notas: string;
};

const initialForm: FormState = {
  nome: "",
  categoria: "Infoproduto",
  urlSite: "",
  urlAds: "",
  plataforma: "",
  statusAds: "Rodando",
  urlscanResultUrl: "",
  screenshotUrl: "",
  notas: "",
};

export function OfertaForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("id") as Id<"ofertas"> | null;

  const oferta = useQuery(api.ofertas.buscar, editId ? { id: editId } : "skip");
  const criar = useMutation(api.ofertas.criar);
  const editar = useMutation(api.ofertas.editar);

  const [form, setForm] = useState<FormState>(initialForm);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!oferta) return;

    setForm({
      nome: oferta.nome,
      categoria: oferta.categoria,
      urlSite: oferta.urlSite,
      urlAds: oferta.urlAds ?? "",
      plataforma: oferta.plataforma ?? "",
      statusAds: oferta.statusAds,
      urlscanResultUrl: oferta.urlscanResultUrl ?? "",
      screenshotUrl: oferta.screenshotUrl ?? "",
      notas: oferta.notas ?? "",
    });
  }, [oferta]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const payload = {
      nome: form.nome.trim(),
      categoria: form.categoria,
      urlSite: form.urlSite.trim(),
      urlAds: form.urlAds.trim() || undefined,
      plataforma: form.plataforma.trim() || undefined,
      statusAds: form.statusAds,
      notas: form.notas.trim() || undefined,
      urlscanResultUrl: form.urlscanResultUrl.trim() || undefined,
      screenshotUrl: form.screenshotUrl.trim() || undefined,
    };

    try {
      if (editId) {
        await editar({ id: editId, ...payload });
      } else {
        await criar(payload);
      }
      router.push("/ofertas");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-5 rounded-xl border bg-card p-6 shadow-sm">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="nome">Nome da oferta *</Label>
          <Input
            id="nome"
            required
            value={form.nome}
            onChange={(e) => setForm((prev) => ({ ...prev, nome: e.target.value }))}
            placeholder="Ex: Curso X"
          />
        </div>

        <div className="space-y-2">
          <Label>Categoria *</Label>
          <Select value={form.categoria} onValueChange={(categoria: string) => setForm((prev) => ({ ...prev, categoria }))}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIAS.map((categoria) => (
                <SelectItem key={categoria} value={categoria}>
                  {categoria}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Status de anúncios *</Label>
          <Select value={form.statusAds} onValueChange={(statusAds: string) => setForm((prev) => ({ ...prev, statusAds }))}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              {STATUS_ADS.map((status) => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="urlSite">URL do site *</Label>
          <Input
            id="urlSite"
            type="url"
            required
            value={form.urlSite}
            onChange={(e) => setForm((prev) => ({ ...prev, urlSite: e.target.value }))}
            placeholder="https://"
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="urlAds">URL de anúncios</Label>
          <Input
            id="urlAds"
            type="url"
            value={form.urlAds}
            onChange={(e) => setForm((prev) => ({ ...prev, urlAds: e.target.value }))}
            placeholder="Meta Ads Library, TikTok Ads, etc"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="plataforma">Plataforma</Label>
          <Input
            id="plataforma"
            value={form.plataforma}
            onChange={(e) => setForm((prev) => ({ ...prev, plataforma: e.target.value }))}
            placeholder="Ex: Shopify, Hotmart, Kiwify"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="urlscanResultUrl">URL do urlscan</Label>
          <Input
            id="urlscanResultUrl"
            type="url"
            value={form.urlscanResultUrl}
            onChange={(e) => setForm((prev) => ({ ...prev, urlscanResultUrl: e.target.value }))}
            placeholder="https://urlscan.io/result/..."
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="screenshotUrl">URL da screenshot</Label>
          <Input
            id="screenshotUrl"
            type="url"
            value={form.screenshotUrl}
            onChange={(e) => setForm((prev) => ({ ...prev, screenshotUrl: e.target.value }))}
            placeholder="https://urlscan.io/screenshots/..."
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="notas">Notas</Label>
          <textarea
            id="notas"
            value={form.notas}
            onChange={(e) => setForm((prev) => ({ ...prev, notas: e.target.value }))}
            className="min-h-28 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            placeholder="Anotações livres"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={isSaving}>
          {isSaving ? "Salvando..." : editId ? "Salvar alterações" : "Cadastrar oferta"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.push("/ofertas")}>
          Cancelar
        </Button>
      </div>

      <div className="rounded-lg border border-blue-500/30 bg-blue-500/10 p-4 text-sm text-blue-100">
        <strong>Dica:</strong> Use a aba Buscador para encontrar o domínio no urlscan.io. Ao clicar em &quot;ANALISAR&quot;
        em qualquer card, você obtém o link do resultado e a screenshot para preencher aqui.
      </div>
    </form>
  );
}
