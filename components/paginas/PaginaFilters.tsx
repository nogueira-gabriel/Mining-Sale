"use client";

import { useState } from "react";
import { FAIXAS_IDADE } from "@/lib/constants";

interface FiltrosPagina {
  idadeMin?: number;
  idadeMax?: number;
  dominioBusca: string;
  scoreMin?: number;
}

interface Props {
  onChange: (filtros: FiltrosPagina) => void;
}

export function PaginaFilters({ onChange }: Props) {
  const [dominioBusca, setDominioBusca] = useState("");
  const [faixaSelecionada, setFaixaSelecionada] = useState<number | null>(null);
  const [scoreMin, setScoreMin] = useState(0);

  function aplicarFaixa(index: number) {
    const faixa = FAIXAS_IDADE[index];
    setFaixaSelecionada(index);
    onChange({
      idadeMin: faixa.min,
      idadeMax: faixa.max ?? undefined,
      dominioBusca,
      scoreMin,
    });
  }

  function aplicarBuscaDominio(valor: string) {
    setDominioBusca(valor);
    const faixa = faixaSelecionada !== null ? FAIXAS_IDADE[faixaSelecionada] : null;
    onChange({
      idadeMin: faixa?.min,
      idadeMax: faixa?.max ?? undefined,
      dominioBusca: valor,
      scoreMin,
    });
  }

  return (
    <div className="flex flex-col gap-4 p-4 rounded-lg border border-border bg-card">

      {/* Busca por domínio base */}
      <div className="flex flex-col gap-1">
        <label className="text-sm text-muted-foreground">Buscar por domínio</label>
        <input
          type="text"
          placeholder="Ex: myshopify.com, hotmart.com, kiwify..."
          value={dominioBusca}
          onChange={(e) => aplicarBuscaDominio(e.target.value)}
          className="h-9 rounded-md border border-input bg-background px-3 text-sm"
        />
        {dominioBusca && (
          <span className="text-xs text-muted-foreground">
            Listando todos os sites que contêm <strong>{dominioBusca}</strong>
          </span>
        )}
      </div>

      {/* Filtro de idade — faixas predefinidas */}
      <div className="flex flex-col gap-2">
        <label className="text-sm text-muted-foreground">Idade do domínio</label>
        <div className="flex flex-wrap gap-2">
          {FAIXAS_IDADE.map((faixa, i) => (
            <button
              key={i}
              onClick={() => aplicarFaixa(i)}
              className={`px-3 py-1 rounded-full text-xs border transition-colors
                ${faixaSelecionada === i
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background text-muted-foreground border-border hover:border-primary"
                }`}
            >
              {faixa.label}
            </button>
          ))}
          {faixaSelecionada !== null && (
            <button
              onClick={() => { setFaixaSelecionada(null); onChange({ dominioBusca, scoreMin }); }}
              className="px-3 py-1 rounded-full text-xs border border-dashed border-muted-foreground text-muted-foreground"
            >
              Limpar
            </button>
          )}
        </div>
      </div>

      {/* Score mínimo */}
      <div className="flex flex-col gap-1">
        <label className="text-sm text-muted-foreground">
          Score mínimo: <strong>{scoreMin}</strong>
        </label>
        <input
          type="range"
          min={0}
          max={100}
          step={5}
          value={scoreMin}
          onChange={(e) => {
            const val = Number(e.target.value);
            setScoreMin(val);
            const faixa = faixaSelecionada !== null ? FAIXAS_IDADE[faixaSelecionada] : null;
            onChange({ idadeMin: faixa?.min, idadeMax: faixa?.max ?? undefined, dominioBusca, scoreMin: val });
          }}
          className="w-full"
        />
      </div>
    </div>
  );
}
