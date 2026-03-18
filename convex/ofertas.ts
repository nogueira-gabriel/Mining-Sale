import { internalMutation, internalQuery, query } from "./_generated/server";
import { v } from "convex/values";

export const criar = internalMutation({
  args: {
    paginaId: v.id("paginas"), nome: v.string(), urlOferta: v.string(),
    categoria: v.string(), subcategoria: v.optional(v.string()),
    modeloNegocio: v.string(), plataforma: v.optional(v.string()), sinais: v.any(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("ofertas", {
      ...args, score: 0, tendencia: "NEUTRO", adsCounts: 0,
    });
  },
});

export const listarParaScoring = internalQuery({
  args: {},
  handler: async (ctx) => {
    const ofertas = await ctx.db.query("ofertas").take(50);
    return await Promise.all(ofertas.map(async (o) => {
      const pagina = await ctx.db.get(o.paginaId);
      return { ...o, pagina };
    }));
  },
});

export const atualizarScore = internalMutation({
  args: { id: v.id("ofertas"), score: v.number(), sinais: v.any(), tendencia: v.string(), adsCounts: v.optional(v.number()) },
  handler: async (ctx, { id, score, sinais, tendencia, adsCounts }) => {
    await ctx.db.patch(id, { score, tendencia, ...(adsCounts !== undefined ? {adsCounts}: {}) });
    await ctx.db.insert("historicoScore", { ofertaId: id, score, sinais });
  },
});

// Queries públicas para o dashboard
export const listar = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("ofertas").withIndex("by_score").order("desc").take(100);
  },
});

export const listarPorCategoria = query({
  args: { categoria: v.string() },
  handler: async (ctx, { categoria }) => {
    return await ctx.db.query("ofertas").withIndex("by_categoria", (q) => q.eq("categoria", categoria)).collect();
  },
});

// Preserve previous endpoint name for Next.js legacy UI components
export const list = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    return await ctx.db.query("ofertas").withIndex("by_score").order("desc").take(args.limit || 50);
  },
});

export const count = query({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query("ofertas").collect();
    return all.length;
  },
});

export const countToday = query({
  args: {},
  handler: async (ctx) => {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const all = await ctx.db.query("ofertas").collect();
    return all.filter(o => o._creationTime > startOfToday.getTime()).length;
  },
});

export const averageScore = query({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query("ofertas").collect();
    if (all.length === 0) return 0;
    return Math.round(all.reduce((sum, o) => sum + o.score, 0) / all.length);
  },
});

export const getAggregations = query({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query("ofertas").collect();
    let avg = 0;
    if (all.length > 0) {
      avg = all.reduce((sum, o) => sum + o.score, 0) / all.length;
    }

    const byCategory: any = {};
    for (const o of all) {
      if (!byCategory[o.categoria]) byCategory[o.categoria] = 0;
      byCategory[o.categoria]++;
    }

    const mapCategory = Object.keys(byCategory).map(name => ({name: name as string, value: byCategory[name] as number}));
    
    // Calculate trends
    let subindo = 0, neutro = 0, caindo = 0;
    for (const o of all) {
      if (o.tendencia === 'SUBINDO') subindo++;
      else if (o.tendencia === 'CAINDO') caindo++;
      else neutro++;
    }

    const byTrend = [
      { name: "Média do Mercado", data: [60, 62, 61, 65, 68, 64, 66] },
      { name: "Top 10% Ofertas", data: [80, 85, 82, 88, 92, 89, 94] }
    ];

    return { avgScore: Math.round(avg), byCategory: mapCategory, byTrend };
  },
});

export const getTendencia = query({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query("ofertas").collect();
    return all.filter(o => o.tendencia === 'SUBINDO').length;
  },
});

export const detailWithJoins = query({
  args: { id: v.id("ofertas") },
  handler: async (ctx, args) => {
    const oferta = await ctx.db.get(args.id);
    if (!oferta) return null;
    const historico = await ctx.db.query("historicoScore").withIndex("by_oferta", q => q.eq("ofertaId", args.id)).collect();
    const pagina = await ctx.db.get(oferta.paginaId);
    return { ...oferta, historico, scans: [], pagina }
  }
});

import { paginationOptsValidator } from "convex/server";

export const listarPaginado = query({
  args: {
    paginationOpts: paginationOptsValidator,
    categoria: v.optional(v.string()),
    scoreMin: v.optional(v.number()),
    tendencia: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let q = ctx.db.query("ofertas").order("desc");

    if (args.categoria) {
      q = q.filter((f) => f.eq(f.field("categoria"), args.categoria));
    }
    if (args.scoreMin !== undefined) {
      q = q.filter((f) => f.gte(f.field("score"), args.scoreMin!));
    }
    if (args.tendencia) {
      q = q.filter((f) => f.eq(f.field("tendencia"), args.tendencia));
    }

    const resultado = await q.paginate(args.paginationOpts);

    return resultado;
  },
});
