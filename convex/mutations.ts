import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const upsertPagina = mutation({
  args: {
    dominio: v.string(),
    urlOriginal: v.string(),
    titulo: v.optional(v.string()),
    domainAgeDays: v.optional(v.number()),
    pais: v.optional(v.string()),
    tecnologias: v.array(v.string()),
    urlScreenshot: v.optional(v.string()),
    linksExternos: v.optional(v.number()),
    totalRequests: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("paginas")
      .withIndex("by_dominio", (q) => q.eq("dominio", args.dominio))
      .first();

    if (existing) {
      // Return existing ID (simply "touch")
      return existing._id;
    }

    return await ctx.db.insert("paginas", {
      dominio: args.dominio,
      urlOriginal: args.urlOriginal,
      titulo: args.titulo,
      domainAgeDays: args.domainAgeDays,
      pais: args.pais,
      tecnologias: args.tecnologias,
      urlScreenshot: args.urlScreenshot,
      linksExternos: args.linksExternos,
      totalRequests: args.totalRequests,
      scoreEscala: 0,
      status: "ATIVA",
    });
  },
});

export const createOferta = mutation({
  args: {
    nome: v.string(),
    categoria: v.string(),
    modelo: v.string(),
    plataforma: v.optional(v.string()),
    urlOferta: v.string(),
    urlImagem: v.optional(v.string()),
    paginaId: v.id("paginas"),
    sinais: v.any(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("ofertas", {
      nome: args.nome,
      categoria: args.categoria as any,
      modelo: args.modelo as any,
      plataforma: args.plataforma,
      urlOferta: args.urlOferta,
      urlImagem: args.urlImagem,
      paginaId: args.paginaId,
      score: 0,
      tendencia: "NEUTRO",
      adsCounts: 0,
      sinais: args.sinais,
    });
  },
});

export const updateOfertaScore = mutation({
  args: {
    ofertaId: v.id("ofertas"),
    score: v.number(),
    tendencia: v.string(),
    sinais: v.any(),
    adsCounts: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.ofertaId, {
      score: args.score,
      tendencia: args.tendencia as any,
      sinais: args.sinais,
      ...(args.adsCounts !== undefined ? { adsCounts: args.adsCounts } : {}),
    });

    // Create history entry
    await ctx.db.insert("historicoScores", {
      ofertaId: args.ofertaId,
      score: args.score,
      sinais: args.sinais,
    });
  },
});

export const createAlerta = mutation({
  args: {
    tipo: v.string(),
    ofertaId: v.optional(v.id("ofertas")),
    mensagem: v.string(),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("alertas", {
      tipo: args.tipo as any,
      ofertaId: args.ofertaId,
      mensagem: args.mensagem,
      metadata: args.metadata,
      lido: false,
    });
  },
});

export const getOfertaByPaginaAndCategoria = mutation({
  args: {
    paginaId: v.id("paginas"),
    categoria: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("ofertas")
      .withIndex("by_paginaId_categoria", (q) =>
        q.eq("paginaId", args.paginaId).eq("categoria", args.categoria as any)
      )
      .first();
  },
});

export const getOfertaWithHistory = mutation({
  args: {
    ofertaId: v.id("ofertas"),
  },
  handler: async (ctx, args) => {
    const oferta = await ctx.db.get(args.ofertaId);
    if (!oferta) return null;

    const historico = await ctx.db
      .query("historicoScores")
      .withIndex("by_ofertaId", (q) => q.eq("ofertaId", args.ofertaId))
      .order("desc")
      .take(1);

    return { ...oferta, historico };
  },
});
