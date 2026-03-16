import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  paginas: defineTable({
    dominio: v.string(),
    urlOriginal: v.string(),
    titulo: v.optional(v.string()),
    domainAgeDays: v.optional(v.number()),
    plataforma: v.optional(v.string()),
    tecnologias: v.array(v.string()),
    pais: v.optional(v.string()),
    idioma: v.optional(v.string()),
    urlScreenshot: v.optional(v.string()),
    linksExternos: v.optional(v.number()),
    totalRequests: v.optional(v.number()),
    scoreEscala: v.number(),
    status: v.union(
      v.literal("ATIVA"),
      v.literal("INATIVA"),
      v.literal("SUSPEITA")
    ),
  })
    .index("by_dominio", ["dominio"])
    .index("by_status", ["status"]),

  scans: defineTable({
    uuid: v.string(),
    url: v.string(),
    paginaId: v.optional(v.id("paginas")),
    taskMethod: v.optional(v.string()),
    resultado: v.optional(v.any()),
    screenshot: v.optional(v.string()),
    domSnapshot: v.optional(v.string()),
    linksJson: v.optional(v.any()),
    techJson: v.optional(v.any()),
    status: v.union(
      v.literal("PENDENTE"),
      v.literal("PROCESSANDO"),
      v.literal("CONCLUIDO"),
      v.literal("ERRO")
    ),
  })
    .index("by_uuid", ["uuid"])
    .index("by_paginaId", ["paginaId"]),

  ofertas: defineTable({
    nome: v.string(),
    descricao: v.optional(v.string()),
    categoria: v.union(
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
    ),
    subcategoria: v.optional(v.string()),
    urlOferta: v.string(),
    urlImagem: v.optional(v.string()),
    preco: v.optional(v.number()),
    modelo: v.union(
      v.literal("ECOMMERCE"),
      v.literal("INFOPRODUTO"),
      v.literal("SAAS"),
      v.literal("SERVICO"),
      v.literal("AFILIADO"),
      v.literal("ASSINATURA"),
      v.literal("EVENTO"),
      v.literal("OUTRO")
    ),
    plataforma: v.optional(v.string()),
    paginaId: v.id("paginas"),
    score: v.number(),
    tendencia: v.union(
      v.literal("SUBINDO"),
      v.literal("NEUTRO"),
      v.literal("CAINDO")
    ),
    adsCounts: v.number(),
    sinais: v.any(),
  })
    .index("by_paginaId", ["paginaId"])
    .index("by_score", ["score"])
    .index("by_categoria", ["categoria"])
    .index("by_paginaId_categoria", ["paginaId", "categoria"]),

  historicoScores: defineTable({
    paginaId: v.optional(v.id("paginas")),
    ofertaId: v.optional(v.id("ofertas")),
    score: v.number(),
    sinais: v.any(),
  })
    .index("by_ofertaId", ["ofertaId"])
    .index("by_paginaId", ["paginaId"]),

  alertas: defineTable({
    tipo: v.union(
      v.literal("NOVA_OFERTA"),
      v.literal("SCORE_ALTO"),
      v.literal("TENDENCIA_ALTA"),
      v.literal("PAGINA_NOVA"),
      v.literal("LANCAMENTO_DETECTADO")
    ),
    ofertaId: v.optional(v.id("ofertas")),
    mensagem: v.string(),
    metadata: v.optional(v.any()),
    lido: v.boolean(),
  })
    .index("by_lido", ["lido"])
    .index("by_ofertaId", ["ofertaId"]),

  tendenciasNicho: defineTable({
    keyword: v.string(),
    categoria: v.optional(
      v.union(
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
      )
    ),
    crescimento: v.number(),
    volume: v.number(),
    periodo: v.string(),
    fonte: v.string(),
  })
    .index("by_crescimento", ["crescimento"])
    .index("by_keyword", ["keyword"]),
});
