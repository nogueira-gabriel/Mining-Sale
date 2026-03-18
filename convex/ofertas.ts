import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const listar = query({
  args: {
    categoria: v.optional(v.string()),
    statusAds: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let ofertas = await ctx.db.query("ofertas").order("desc").collect();
    if (args.categoria) {
      ofertas = ofertas.filter((o) => o.categoria === args.categoria);
    }
    if (args.statusAds) {
      ofertas = ofertas.filter((o) => o.statusAds === args.statusAds);
    }
    return ofertas;
  },
});

export const buscar = query({
  args: { id: v.id("ofertas") },
  handler: async (ctx, { id }) => ctx.db.get(id),
});

export const criar = mutation({
  args: {
    nome: v.string(),
    categoria: v.string(),
    urlSite: v.string(),
    urlAds: v.optional(v.string()),
    plataforma: v.optional(v.string()),
    statusAds: v.string(),
    notas: v.optional(v.string()),
    urlscanResultUrl: v.optional(v.string()),
    screenshotUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("ofertas", {
      ...args,
      favoritado: false,
      criadoEm: Date.now(),
    });
  },
});

export const editar = mutation({
  args: {
    id: v.id("ofertas"),
    nome: v.optional(v.string()),
    categoria: v.optional(v.string()),
    urlSite: v.optional(v.string()),
    urlAds: v.optional(v.string()),
    plataforma: v.optional(v.string()),
    statusAds: v.optional(v.string()),
    notas: v.optional(v.string()),
    urlscanResultUrl: v.optional(v.string()),
    screenshotUrl: v.optional(v.string()),
  },
  handler: async (ctx, { id, ...campos }) => {
    await ctx.db.patch(id, campos);
  },
});

export const deletar = mutation({
  args: { id: v.id("ofertas") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  },
});

export const toggleFavorito = mutation({
  args: { id: v.id("ofertas") },
  handler: async (ctx, { id }) => {
    const oferta = await ctx.db.get(id);
    if (oferta) {
      await ctx.db.patch(id, { favoritado: !oferta.favoritado });
    }
  },
});
