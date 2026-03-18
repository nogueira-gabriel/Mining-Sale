"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";

export const searchUrlscan = action({
  args: {
    query:        v.string(),
    idadeMinDias: v.optional(v.number()),
    idadeMaxDias: v.optional(v.number()),
    pais:         v.optional(v.string()),
    dataRecente:  v.optional(v.string()),
    size:         v.optional(v.number()),
    searchAfter:  v.optional(v.array(v.any())),
  },
  handler: async (_ctx, args) => {
    const apiKey = process.env.URLSCAN_API_KEY;
    if (!apiKey) throw new Error("URLSCAN_API_KEY não configurada.");

    const termo = args.query.trim();
    if (!termo) throw new Error("Query é obrigatória.");

    // ── Monta a query ──────────────────────────────────────────────
    const partes: string[] = [];

    // Se o usuário digitou um campo explícito (tem ":"), passa direto
    // Ex: page.title:"curso", ip:1.2.3.4, page.server:nginx
    if (termo.includes(":")) {
      partes.push(termo);
    } else {
      // Busca de domínio livre:
      // O campo `domain` (sem page.) captura QUALQUER domínio ou subdomínio
      // que apareceu durante o scan — tanto o domínio principal quanto
      // recursos externos. Isso garante que utmify.com.br encontre
      // app.utmify.com.br, www.utmify.com.br, etc.
      //
      // Usamos também page.domain para pegar scans onde o domínio
      // digitado É o domínio principal da página.
      partes.push(`(domain:${termo} OR page.domain:${termo})`);
    }

    // Filtro de idade — page.apexDomainAgeDays é integer, usa range [min TO max]
    // Nunca passar null — usar * para sem limite
    const minIdade = args.idadeMinDias;
    const maxIdade = args.idadeMaxDias;
    if (minIdade !== undefined || maxIdade !== undefined) {
      const min = minIdade !== undefined ? minIdade : "*";
      const max = maxIdade !== undefined ? maxIdade : "*";
      partes.push(`page.apexDomainAgeDays:[${min} TO ${max}]`);
    }

    // Filtro de país
    if (args.pais && args.pais !== "ALL") {
      partes.push(`page.country:${args.pais}`);
    }

    // Filtro de data do scan
    if (args.dataRecente) {
      partes.push(`date:>now-${args.dataRecente}`);
    }

    const queryFinal = partes.join(" AND ");
    const tamanho = Math.min(args.size ?? 50, 100);

    console.log(`[urlscan] Query: ${queryFinal}`);

    // ── Chama a API ────────────────────────────────────────────────
    let url = `https://urlscan.io/api/v1/search/?q=${encodeURIComponent(queryFinal)}&size=${tamanho}`;

    if (args.searchAfter && args.searchAfter.length > 0) {
      url += `&search_after=${args.searchAfter.join(",")}`;
    }

    const response = await fetch(url, {
      headers: { "API-Key": apiKey, "Content-Type": "application/json" },
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`urlscan.io erro ${response.status}: ${err}`);
    }

    const data = await response.json();
    const results: any[] = data.results ?? [];

    // ── Formata resultados ─────────────────────────────────────────
    const formatted = results.map((item: any) => ({
      taskUuid:         item.task?.uuid ?? null,
      url:              item.task?.url ?? "",
      dominio:          item.page?.domain ?? "",
      titulo:           item.page?.title ?? "",
      domainAgeDays:    item.page?.apexDomainAgeDays ?? null,
      pais:             item.page?.country ?? null,
      servidor:         item.page?.server ?? null,
      ip:               item.page?.ip ?? null,
      asn:              item.page?.asnname ?? null,
      screenshotUrl:    item.screenshot ?? null,
      uniqIPs:          item.stats?.uniqIPs ?? 0,
      totalRequests:    item.stats?.requests ?? 0,
      dataAnalise:      item.task?.time ?? null,
      urlscanResultUrl: item.result ?? null,
      sortToken:        item.sort ?? null,
    }));

    const lastSortToken = results[results.length - 1]?.sort ?? null;

    return {
      query:         queryFinal,
      total:         data.total ?? results.length,
      resultados:    formatted,
      lastSortToken,
      hasMore:       results.length === tamanho,
    };
  },
});
