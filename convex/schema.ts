import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  paginas: defineTable({
    dominio:        v.string(),
    urlOriginal:    v.string(),
    titulo:         v.optional(v.string()),
    domainAgeDays:  v.optional(v.number()),
    pais:           v.optional(v.string()),
    idioma:         v.optional(v.string()),
    urlScreenshot:  v.optional(v.string()),
    linksExternos:  v.optional(v.number()),
    totalRequests:  v.optional(v.number()),
    tecnologias:    v.array(v.string()),
    scanUuid:       v.optional(v.string()),
    scoreEscala:    v.number(),
    status:         v.string(), // "ATIVA" | "INATIVA" | "CLASSIFICADA"
    classificadaEm: v.optional(v.number()),
  })
    .index("by_dominio",        ["dominio"])
    .index("by_status",         ["status"])
    .index("by_score",          ["scoreEscala"]),

  ofertas: defineTable({
    paginaId:       v.id("paginas"),
    nome:           v.string(),
    descricao:      v.optional(v.string()),
    categoria:      v.string(),
    subcategoria:   v.optional(v.string()),
    modeloNegocio:  v.string(),
    plataforma:     v.optional(v.string()),
    urlOferta:      v.string(),
    urlImagem:      v.optional(v.string()),
    preco:          v.optional(v.number()),
    score:          v.number(),
    tendencia:      v.string(), // "SUBINDO" | "NEUTRO" | "CAINDO"
    adsCounts:      v.number(),
    sinais:         v.any(),
  })
    .index("by_pagina",         ["paginaId"])
    .index("by_score",          ["score"])
    .index("by_categoria",      ["categoria"])
    .index("by_modelo_negocio", ["modeloNegocio"])
    .index("by_paginaId_categoria", ["paginaId", "categoria"]), // For legacy UI

  historicoScore: defineTable({
    paginaId:  v.optional(v.id("paginas")),
    ofertaId:  v.optional(v.id("ofertas")),
    score:     v.number(),
    sinais:    v.any(),
  })
    .index("by_oferta",  ["ofertaId"])
    .index("by_pagina",  ["paginaId"]),

  alertas: defineTable({
    tipo:      v.string(), // "NOVA_OFERTA" | "SCORE_ALTO" | "TENDENCIA_ALTA" | "PAGINA_NOVA"
    ofertaId:  v.optional(v.id("ofertas")),
    mensagem:  v.string(),
    metadata:  v.optional(v.any()),
    lido:      v.boolean(),
  })
    .index("by_lido",    ["lido"])
    .index("by_tipo",    ["tipo"])
    .index("by_oferta",  ["ofertaId"]),

  tendenciasNicho: defineTable({
    keyword:    v.string(),
    categoria:  v.optional(v.union(
        v.literal("ECOMMERCE_FISICO"),
        v.literal("ECOMMERCE_DIGITAL"),
        v.literal("CURSO_ONLINE"),
        v.literal("MENTORIA"),
        v.literal("EBOOK"),
        v.literal("COMUNIDADE"),
        v.literal("SAAS_B2B"),
        v.literal("SAAS_B2C"),
        v.literal("SERVICO_AGENCIA"),
        v.literal("SERVICO_FREELANCE"),
        v.literal("AFILIADO"),
        v.literal("ASSINATURA_CONTEUDO"),
        v.literal("EVENTO_WEBINAR"),
        v.literal("OUTRO")
      )), // Maintain compatibility
    crescimento: v.number(),
    volume:     v.number(),
    periodo:    v.string(),
    fonte:      v.string(),
  })
    .index("by_keyword",    ["keyword"])
    .index("by_crescimento", ["crescimento"]),
});
