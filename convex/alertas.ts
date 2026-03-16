import { query } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 100;
    const alertas = await ctx.db
      .query("alertas")
      .order("desc")
      .take(limit);

    // Join with ofertas
    const result = await Promise.all(
      alertas.map(async (alerta) => {
        const oferta = alerta.ofertaId
          ? await ctx.db.get(alerta.ofertaId)
          : null;
        return { ...alerta, oferta };
      })
    );
    return result;
  },
});

export const listRecent = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 10;
    return await ctx.db
      .query("alertas")
      .order("desc")
      .take(limit);
  },
});

export const countUnread = query({
  args: {},
  handler: async (ctx) => {
    const unread = await ctx.db
      .query("alertas")
      .withIndex("by_lido", (q) => q.eq("lido", false))
      .collect();
    return unread.length;
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
      .query("alertas")
      .order("desc")
      .collect();

    const total = all.length;
    const start = (page - 1) * limit;
    const data = all.slice(start, start + limit);

    // Join with ofertas
    const result = await Promise.all(
      data.map(async (alerta) => {
        const oferta = alerta.ofertaId
          ? await ctx.db.get(alerta.ofertaId)
          : null;
        return { ...alerta, oferta };
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
