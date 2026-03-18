"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FAIXAS_IDADE,
  PAISES,
  DATA_RECENTE,
  QUANTIDADE_RESULTADOS,
} from "@/lib/constants";
import { useState } from "react";
import { Search, Loader2 } from "lucide-react";

export type SearchParams = {
  dominio: string;
  idadeIdx: string;
  pais: string;
  dataRecente: string;
  size: string;
};

interface SearchFiltersProps {
  onSearch: (params: SearchParams) => void;
  isLoading: boolean;
}

export function SearchFilters({ onSearch, isLoading }: SearchFiltersProps) {
  const [params, setParams] = useState<SearchParams>({
    dominio: "",
    idadeIdx: "0", // index em FAIXAS_IDADE
    pais: "ALL",
    dataRecente: "",
    size: "50",
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(params);
  };

  return (
    <form onSubmit={handleSearch} className="flex flex-col gap-4 p-4 rounded-lg border border-border bg-card text-card-foreground shadow-sm">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {/* Dominio Base */}
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="dominio">Domínio / Plataforma</Label>
          <div className="flex w-full items-center space-x-2">
            <Input
              id="dominio"
              placeholder="Ex: myshopify.com, hotmart.com"
              value={params.dominio}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setParams({ ...params, dominio: e.target.value })}
              required
            />
          </div>
        </div>

        {/* Idade do domínio */}
        <div className="space-y-2">
          <Label>Idade do Domínio</Label>
          <Select
            value={params.idadeIdx}
            onValueChange={(val: string) => setParams({ ...params, idadeIdx: val })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Qualquer idade" />
            </SelectTrigger>
            <SelectContent>
              {FAIXAS_IDADE.map((faixa, idx) => (
                <SelectItem key={idx} value={idx.toString()}>
                  {faixa.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* País */}
        <div className="space-y-2">
          <Label>País (Servidor)</Label>
          <Select
            value={params.pais}
            onValueChange={(val: string) => setParams({ ...params, pais: val })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Qualquer país" />
            </SelectTrigger>
            <SelectContent>
              {PAISES.map((p) => (
                <SelectItem key={p.code} value={p.code}>
                  {p.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Data do Scan */}
        <div className="space-y-2">
          <Label>Data da Análise</Label>
          <Select
            value={params.dataRecente}
            onValueChange={(val: string) => setParams({ ...params, dataRecente: val })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Qualquer data" />
            </SelectTrigger>
            <SelectContent>
              {DATA_RECENTE.map((dr, idx) => (
                <SelectItem key={idx} value={dr.value}>
                  {dr.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/50">
        <div className="flex items-center space-x-2">
          <Label className="text-sm text-muted-foreground mr-2">Exibir resultados:</Label>
          <Select
            value={params.size}
            onValueChange={(val: string) => setParams({ ...params, size: val })}
          >
            <SelectTrigger className="w-[100px] h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {QUANTIDADE_RESULTADOS.map((qtd) => (
                <SelectItem key={qtd} value={qtd.toString()}>
                  {qtd}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button type="submit" disabled={isLoading || !params.dominio.trim()} className="w-full md:w-auto px-8">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Buscando na web...
            </>
          ) : (
            <>
              <Search className="mr-2 h-4 w-4" />
              Pesquisar
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
