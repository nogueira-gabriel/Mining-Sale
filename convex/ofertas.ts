import { query } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 50;
    const ofertas = await ctx.db
      .query("ofertas")
      .withIndex("by_score")
      .order("desc")
      .take(limit);

    // Join with paginas
    const result = await Promise.all(
      ofertas.map(async (oferta) => {
        const pagina = await ctx.db.get(oferta.paginaId);
        return { ...oferta, pagina };
      })
    );
    return result;
  },
});

export const getById = query({
  args: { id: v.id("ofertas") },
  handler: async (ctx, args) => {
    const oferta = await ctx.db.get(args.id);
    if (!oferta) return null;

    const pagina = await ctx.db.get(oferta.paginaId);
    const historico = await ctx.db
      .query("historicoScores")
      .withIndex("by_ofertaId", (q) => q.eq("ofertaId", args.id))
      .collect();

    return { ...oferta, pagina, historico };
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
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const all = await ctx.db.query("ofertas").collect();
    return all.filter((o) => o._creationTime >= startOfDay.getTime()).length;
  },
});

export const averageScore = query({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query("ofertas").collect();
    if (all.length === 0) return 0;
    const sum = all.reduce((acc, o) => acc + o.score, 0);
    return sum / all.length;
  },
});

export const categoryDistribution = query({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query("ofertas").collect();
    const counts: Record<string, number> = {};
    for (const oferta of all) {
      counts[oferta.categoria] = (counts[oferta.categoria] || 0) + 1;
    }
    return Object.entries(counts).map(([name, total]) => ({ name, total }));
  },
});

export const trendData = query({
  args: {},
  handler: async (ctx) => {
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    const all = await ctx.db.query("ofertas").collect();
    const recent = all.filter((o) => o._creationTime >= thirtyDaysAgo);

    // Group by date
    const trendMap = new Map<string, number>();
    for (let i = 0; i < 30; i++) {
      const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      const date = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      trendMap.set(date, 0);
    }

    for (const oferta of recent) {
      const d = new Date(oferta._creationTime);
      const date = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      if (trendMap.has(date)) {
        trendMap.set(date, trendMap.get(date)! + 1);
      }
    }

    return Array.from(trendMap.entries())
      .map(([date, total]) => ({ date, total }))
      .reverse();
  },
});

export const listPaginated = query({
  args: {
    page: v.optional(v.number()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const page = args.page ?? 1;
    const limit = args.limit ?? 10;
    const all = await ctx.db
      .query("ofertas")
      .withIndex("by_score")
      .order("desc")
      .collect();

    const total = all.length;
    const start = (page - 1) * limit;
    const data = all.slice(start, start + limit);

    // Join with paginas
    const result = await Promise.all(
      data.map(async (oferta) => {
        const pagina = await ctx.db.get(oferta.paginaId);
        return { ...oferta, pagina };
      })
    );

    return {
      data: result,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  },
});
