export const FAIXAS_IDADE = [
  { label: "Qualquer idade",  min: 0,    max: null },
  { label: "< 7 dias",        min: 0,    max: 7    },
  { label: "< 1 mês",         min: 0,    max: 30   },
  { label: "1–3 meses",       min: 30,   max: 90   },
  { label: "> 3 meses",       min: 90,   max: null },
  { label: "> 6 meses",       min: 180,  max: null },
  { label: "> 1 ano",         min: 365,  max: null  },
  { label: "> 2 anos",        min: 730,  max: null  },
  { label: "> 5 anos",        min: 1825, max: null  },
] as const;

export const PAISES = [
  { code: "ALL", label: "Todos os países" },
  { code: "BR",  label: "Brasil" },
  { code: "US",  label: "Estados Unidos" },
  { code: "PT",  label: "Portugal" },
  { code: "GB",  label: "Reino Unido" },
  { code: "DE",  label: "Alemanha" },
  { code: "FR",  label: "França" },
  { code: "ES",  label: "Espanha" },
  { code: "CA",  label: "Canadá" },
  { code: "AU",  label: "Austrália" },
  { code: "MX",  label: "México" },
  { code: "CO",  label: "Colômbia" },
  { code: "AR",  label: "Argentina" },
  { code: "IN",  label: "Índia" },
] as const;

export const DATA_RECENTE = [
  { value: "",     label: "Qualquer data" },
  { value: "1d",   label: "Últimas 24 horas" },
  { value: "7d",   label: "Últimos 7 dias" },
  { value: "30d",  label: "Últimos 30 dias" },
  { value: "90d",  label: "Últimos 3 meses" },
  { value: "365d", label: "Último ano" },
] as const;

export const QUANTIDADE_RESULTADOS = [10, 25, 50, 100] as const;
