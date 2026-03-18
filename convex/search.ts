"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";

/**
 * Busca interativa na API do urlscan.io.
 *
 * O usuário digita um domínio base (ex: myshopify.com) e aplica filtros.
 * A action monta a query Elasticsearch, consulta a API em tempo real,
 * e devolve os resultados formatados para o frontend.
 */
export const searchUrlscan = action({
  args: {
    dominio: v.string(),
    idadeMinDias: v.optional(v.number()),
    idadeMaxDias: v.optional(v.number()),
    pais: v.optional(v.string()),
    dataRecente: v.optional(v.string()), // ex: "7d", "30d", "90d", "365d"
    size: v.optional(v.number()),
    searchAfter: v.optional(v.array(v.any())),
  },
  handler: async (_ctx, args) => {
    const apiKey = process.env.URLSCAN_API_KEY;
    if (!apiKey) {
      throw new Error("URLSCAN_API_KEY não configurada. Configure via: npx convex env set URLSCAN_API_KEY <chave>");
    }

    const dominio = args.dominio.trim().toLowerCase();
    if (!dominio) {
      throw new Error("Domínio é obrigatório");
    }

    // ── Montagem da query Elasticsearch ──────────────────────────
    const queryParts: string[] = [];

    // Busca pelo domínio base
    // Não usamos wildcard no início (*termo) pois a maioria das chaves urlscan não permite.
    // Usamos o termo direto, o que no Elasticsearch já faz uma busca por 'term'.
    if (!dominio.includes(".")) {
      queryParts.push(`${dominio}`);
    } else {
      queryParts.push(`page.domain:${dominio}`);
    }

    // Filtro de idade do domínio (Elasticsearch range syntax)
    if (args.idadeMinDias !== undefined || args.idadeMaxDias !== undefined) {
      const min = args.idadeMinDias ?? "*";
      const max = args.idadeMaxDias ?? "*";
      queryParts.push(`page.apexDomainAgeDays:[${min} TO ${max}]`);
    }

    // Filtro de país
    if (args.pais && args.pais !== "ALL") {
      queryParts.push(`page.country:${args.pais}`);
    }

    // Filtro de data (scans recentes)
    if (args.dataRecente) {
      queryParts.push(`date:>now-${args.dataRecente}`);
    }

    const query = queryParts.join(" AND ");
    // O limite da API pública para 'size' é 100. Valores maiores causam erro 400.
    const rawSize = 100;

    console.log(`[urlscan] Query: ${query} | RawSize: ${rawSize} | SearchAfter: ${args.searchAfter}`);

    // ── Requisição à API ─────────────────────────────────────────
    let url = `https://urlscan.io/api/v1/search/?q=${encodeURIComponent(query)}&size=${rawSize}`;
    
    if (args.searchAfter && args.searchAfter.length > 0) {
      const saString = args.searchAfter.join(",");
      url += `&search_after=${saString}`;
    }

    console.log(`[urlscan] Requesting URL: ${url}`);

    const response = await fetch(url, {
      headers: {
        "API-Key": apiKey,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[urlscan] Erro ${response.status}: ${errorText}`);
      throw new Error(`urlscan.io retornou erro ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    const results = data.results ?? [];

    console.log(`[urlscan] ${results.length} resultados encontrados para "${query}"`);

    // ── Formatação dos resultados ────────────────────────────────
    const formatted = results.map((item: any) => ({
      // Identificação
      taskUuid: item.task?.uuid ?? null,
      url: item.task?.url ?? "",
      dominio: item.page?.domain ?? "",
      titulo: item.page?.title ?? "",

      // Dados de idade
      domainAgeDays: item.page?.apexDomainAgeDays ?? null,

      // Geolocalização
      pais: item.page?.country ?? null,
      servidor: item.page?.server ?? null,
      ip: item.page?.ip ?? null,
      asn: item.page?.asnname ?? null,

      // Screenshot
      screenshotUrl: item.screenshot ?? null,

      // Estatísticas
      uniqIPs: item.stats?.uniqIPs ?? 0,
      totalLinks: item.stats?.totalLinks ?? 0,
      requests: item.stats?.requests ?? 0,
      dataBytes: item.stats?.dataLength ?? 0,

      // Datas
      dataAnalise: item.task?.time ?? null,

      // Link direto para o resultado no urlscan.io
      urlscanResultUrl: item.result ?? null,

      // Token para paginação (search_after)
      sortToken: item.sort ?? null,
    }));

    // Deduplicar por domínio (manter apenas o scan mais recente de cada)
    const deduplicado = new Map<string, (typeof formatted)[0]>();
    for (const item of formatted) {
      if (!deduplicado.has(item.dominio)) {
        deduplicado.set(item.dominio, item);
      }
    }

    // Pegar o token de ordenação do ÚLTIMO item da busca bruta (importante para paginação search_after)
    const lastRawItem = results[results.length - 1];
    const lastSortToken = lastRawItem?.sort ?? null;

    return {
      query,
      total: data.total ?? results.length,
      resultados: Array.from(deduplicado.values()),
      lastSortToken,
      // Se voltaram resultados e a busca bruta foi até o limite, provavelmente tem mais.
      hasMore: results.length === rawSize,
    };
  },
});
