import { internalMutation, internalQuery, query } from "./_generated/server";
import { v } from "convex/values";

export const criar = internalMutation({
  args: {
    dominio: v.string(), urlOriginal: v.string(), titulo: v.optional(v.string()),
    domainAgeDays: v.optional(v.number()), pais: v.optional(v.string()),
    idioma: v.optional(v.string()), urlScreenshot: v.optional(v.string()),
    linksExternos: v.optional(v.number()), totalRequests: v.optional(v.number()),
    tecnologias: v.array(v.string()), scanUuid: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("paginas", {
      ...args, scoreEscala: 0, status: "ATIVA",
    });
  },
});

export const buscarPorDominio = internalQuery({
  args: { dominio: v.string() },
  handler: async (ctx, { dominio }) => {
    return await ctx.db.query("paginas").withIndex("by_dominio", (q) => q.eq("dominio", dominio)).first();
  },
});

export const listarPendentesClassificacao = internalQuery({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("paginas").withIndex("by_status", (q) => q.eq("status", "ATIVA")).take(50);
  },
});

export const listarDominiosRecentesAtivos = internalQuery({
  args: {},
  handler: async (ctx) => {
    const paginas = await ctx.db.query("paginas").withIndex("by_status", (q) => q.eq("status", "ATIVA")).collect();
    return paginas.filter((p) => (p.domainAgeDays ?? 999) < 7 && (p.linksExternos ?? 0) > 40);
  },
});

export const marcarComoClassificada = internalMutation({
  args: { id: v.id("paginas") },
  handler: async (ctx, { id }) => {
    await ctx.db.patch(id, { status: "CLASSIFICADA", classificadaEm: Date.now() });
  },
});

// Query pública para o dashboard
export const listar = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("paginas").order("desc").take(100);
  },
});

export const list = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 50;
    return await ctx.db.query("paginas").order("desc").take(limit);
  },
});

export const detail = query({
  args: {
    id: v.id("paginas"),
  },
  handler: async (ctx, args) => {
    const pagina = await ctx.db.get(args.id);
    if (!pagina) return null;

    const ofertas = await ctx.db
      .query("ofertas")
      .withIndex("by_pagina", (q) => q.eq("paginaId", pagina._id))
      .collect();

    return { ...pagina, ofertas, scans: [] };
  },
});

import { paginationOptsValidator } from "convex/server";

export const listarPaginado = query({
  args: {
    paginationOpts: paginationOptsValidator,
    idadeMin: v.optional(v.number()),
    idadeMax: v.optional(v.number()),
    dominioBusca: v.optional(v.string()),
    scoreMin: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let q = ctx.db.query("paginas").order("desc");

    if (args.idadeMin !== undefined) {
      q = q.filter((f) => f.gte(f.field("domainAgeDays"), args.idadeMin!));
    }
    if (args.idadeMax !== undefined) {
      q = q.filter((f) => f.lte(f.field("domainAgeDays"), args.idadeMax!));
    }
    if (args.scoreMin !== undefined) {
      q = q.filter((f) => f.gte(f.field("scoreEscala"), args.scoreMin!));
    }

    const resultado = await q.paginate(args.paginationOpts);

    let paginas = resultado.page;

    if (args.dominioBusca?.trim()) {
      const termo = args.dominioBusca.toLowerCase().trim();
      paginas = paginas.filter((p) => p.dominio.toLowerCase().includes(termo));
    }

    return { ...resultado, page: paginas };
  },
});

export const buscarPorDominioBase = query({
  args: { dominioBase: v.string() },
  handler: async (ctx, { dominioBase }) => {
    const termo = dominioBase.toLowerCase().trim();
    const todas = await ctx.db.query("paginas").collect();
    return todas
      .filter((p) => p.dominio.toLowerCase().includes(termo))
      .sort((a, b) => b.scoreEscala - a.scoreEscala)
      .slice(0, 500);
  },
});
