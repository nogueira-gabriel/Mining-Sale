import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  ofertas: defineTable({
    nome: v.string(),
    categoria: v.string(),
    urlSite: v.string(),
    urlAds: v.optional(v.string()),
    plataforma: v.optional(v.string()),
    statusAds: v.string(),
    notas: v.optional(v.string()),
    urlscanResultUrl: v.optional(v.string()),
    screenshotUrl: v.optional(v.string()),
    favoritado: v.boolean(),
    criadoEm: v.number(),
  })
    .index("by_categoria", ["categoria"])
    .index("by_status", ["statusAds"])
    .index("by_favoritado", ["favoritado"]),
});
