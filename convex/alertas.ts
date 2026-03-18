import { internalMutation, query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const criar = internalMutation({
  args: {
    tipo: v.string(), ofertaId: v.optional(v.id("ofertas")),
    mensagem: v.string(), metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("alertas", { ...args, lido: false });
  },
});

export const listarNaoLidos = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("alertas").withIndex("by_lido", (q) => q.eq("lido", false)).order("desc").take(50);
  },
});

export const marcarComoLido = mutation({
  args: { id: v.id("alertas") },
  handler: async (ctx, { id }) => {
    await ctx.db.patch(id, { lido: true });
  },
});

export const list = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const list = await ctx.db.query("alertas").order("desc").take(args.limit ?? 50);
    return await Promise.all(
      list.map(async (a) => {
        let oferta = null;
        if (a.ofertaId) oferta = await ctx.db.get(a.ofertaId);
        return { ...a, oferta };
      })
    );
  }
});

export const unreadCount = query({
  args: {},
  handler: async (ctx) => {
    const l = await ctx.db.query("alertas").withIndex("by_lido", q => q.eq("lido", false)).collect();
    return l.length;
  }
});

export const countUnread = unreadCount;

export const recent = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const r = await ctx.db.query("alertas").order("desc").take(args.limit ?? 5);
    return await Promise.all(
      r.map(async (a) => {
        let oferta = null;
        if (a.ofertaId) oferta = await ctx.db.get(a.ofertaId);
        return { ...a, oferta };
      })
    );
  }
});
