import { query } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 50;
    return await ctx.db
      .query("paginas")
      .order("desc")
      .take(limit);
  },
});

export const getById = query({
  args: { id: v.id("paginas") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getByDominio = query({
  args: { dominio: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("paginas")
      .withIndex("by_dominio", (q) => q.eq("dominio", args.dominio))
      .first();
  },
});

export const getWithOfertas = query({
  args: { id: v.id("paginas") },
  handler: async (ctx, args) => {
    const pagina = await ctx.db.get(args.id);
    if (!pagina) return null;

    const ofertas = await ctx.db
      .query("ofertas")
      .withIndex("by_paginaId", (q) => q.eq("paginaId", args.id))
      .collect();

    const scans = await ctx.db
      .query("scans")
      .withIndex("by_paginaId", (q) => q.eq("paginaId", args.id))
      .order("desc")
      .collect();

    return { ...pagina, ofertas, scans };
  },
});

export const count = query({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query("paginas").collect();
    return all.length;
  },
});
