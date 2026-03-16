import { query } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 50;
    const all = await ctx.db.query("tendenciasNicho").collect();

    // Sort by crescimento descending
    all.sort((a, b) => b.crescimento - a.crescimento);
    return all.slice(0, limit);
  },
});
