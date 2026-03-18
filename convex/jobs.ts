import { internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";

// ─── Discovery Job ───────────────────────────────────────────────
export const runDiscovery = internalAction(async (ctx) => {
  const apiKey = process.env.URLSCAN_API_KEY;
  if (!apiKey) throw new Error("URLSCAN_API_KEY não configurada no Convex");

  const queries = [
    // E-commerce
    "domain:myshopify.com AND page.country:BR AND page.apexDomainAgeDays:<60",
    "page.url:checkout AND page.country:BR AND page.apexDomainAgeDays:<60",
    "\"Nuvemshop\" AND page.country:BR",
    // Infoprodutos
    "domain:hotmart.com AND date:>now-7d",
    "domain:kiwify.com.br AND date:>now-7d",
    "domain:eduzz.com AND date:>now-7d",
    // SaaS
    "page.url:pricing AND page.apexDomainAgeDays:<365 AND page.country:BR",
    "page.title:\"teste grátis\" AND page.apexDomainAgeDays:<365",
    // Lançamentos
    "page.title:\"garantir vaga\" AND date:>now-7d",
    "page.title:\"lista de espera\" AND date:>now-7d",
    // Alta atividade
    "links.length:>60 AND page.country:BR AND date:>now-3d",
    "page.apexDomainAgeDays:<30 AND page.country:BR AND links.length:>20",
  ];

  let totalDescobertos = 0;
  let totalIgnorados = 0;

  for (const query of queries) {
    try {
      const response = await fetch(
        `https://urlscan.io/api/v1/search/?q=${encodeURIComponent(query)}&size=20`,
        { headers: { "API-Key": apiKey } }
      );

      if (!response.ok) {
        console.error(`Erro na query: ${query} — status ${response.status}`);
        continue;
      }

      const data = await response.json();
      const resultados = data.results ?? [];

      for (const item of resultados) {
        const dominio = item.page?.domain;
        if (!dominio) continue;

        const jaExiste = await ctx.runQuery(internal.paginas.buscarPorDominio, { dominio });

        if (jaExiste) {
          totalIgnorados++;
          continue;
        }

        await ctx.runMutation(internal.paginas.criar, {
          dominio,
          urlOriginal: item.task?.url ?? "",
          titulo: item.page?.title ?? null,
          domainAgeDays: item.page?.apexDomainAgeDays ?? null,
          pais: item.page?.country ?? null,
          idioma: item.page?.language ?? null,
          urlScreenshot: item.screenshot ?? null,
          linksExternos: item.stats?.uniqIPs ?? null, // Note: urlscan Search API might not have this, but keeping it per user prompt
          totalRequests: item.stats?.requests ?? null,
          tecnologias: item.meta?.processors?.technology?.data?.map((t: any) => t.name) ?? [],
          scanUuid: item.task?.uuid ?? null,
        });

        totalDescobertos++;
      }

      // Respeitar rate limit do plano gratuito (5 req/min) -> 13s wait
      await new Promise((r) => setTimeout(r, 13000));
    } catch (err) {
      console.error(`Falha na query "${query}":`, err);
    }
  }

  console.log(`Discovery concluído: ${totalDescobertos} novas, ${totalIgnorados} ignoradas`);
});

// ─── Classify Job ────────────────────────────────────────────────
export const runClassify = internalAction(async (ctx) => {
  const paginasPendentes = await ctx.runQuery(internal.paginas.listarPendentesClassificacao);

  for (const pagina of paginasPendentes) {
    try {
      const categoria = classificarPagina(pagina);

      await ctx.runMutation(internal.ofertas.criar, {
        paginaId: pagina._id,
        nome: pagina.titulo ?? pagina.dominio,
        urlOferta: pagina.urlOriginal,
        categoria: categoria.categoria,
        subcategoria: categoria.subcategoria,
        modeloNegocio: categoria.modeloNegocio,
        plataforma: categoria.plataforma,
        sinais: categoria.sinais,
      });

      await ctx.runMutation(internal.paginas.marcarComoClassificada, { id: pagina._id });
    } catch (err) {
      console.error(`Erro ao classificar página ${pagina.dominio}:`, err);
    }
  }
});

// ─── Scoring Job ─────────────────────────────────────────────────
export const runScoring = internalAction(async (ctx) => {
  const ofertas = await ctx.runQuery(internal.ofertas.listarParaScoring);
  
  const metaToken = process.env.META_ACCESS_TOKEN;

  for (const oferta of ofertas) {
    try {
      // Fetch Meta Ads Count if available
      let adsCount = 0;
      if (metaToken && oferta.pagina) {
        try {
          const res = await fetch(`https://graph.facebook.com/v19.0/ads_archive?search_terms=${encodeURIComponent(oferta.pagina.dominio)}&ad_reached_countries=['BR']&ad_active_status=ACTIVE&fields=id&limit=100&access_token=${metaToken}`);
          if (res.ok) {
            const data = await res.json();
            adsCount = data.data?.length || 0;
          }
        } catch (e: any) {
          console.error(`Erro Meta Ads ${oferta.nome}:`, e);
        }
      }

      const score = calcularScore(oferta, adsCount);

      await ctx.runMutation(internal.ofertas.atualizarScore, {
        id: oferta._id,
        score: score.total,
        sinais: score.detalhamento,
        tendencia: score.tendencia,
        adsCounts: adsCount,
      });

      if (score.total >= 70) {
        await ctx.runMutation(internal.alertas.criar, {
          tipo: "SCORE_ALTO",
          ofertaId: oferta._id,
          mensagem: `Oferta "${oferta.nome}" atingiu score ${score.total}`,
          metadata: score.detalhamento,
        });
      }
    } catch (err) {
      console.error(`Erro ao calcular score de ${oferta.nome}:`, err);
    }
  }
});

// ─── Alerts Job ──────────────────────────────────────────────────
export const runAlerts = internalAction(async (ctx) => {
  // Alertar sobre páginas com domínio < 7 dias e links > 40 (possível lançamento)
  const paginasNovas = await ctx.runQuery(internal.paginas.listarDominiosRecentesAtivos);

  for (const pagina of paginasNovas) {
    await ctx.runMutation(internal.alertas.criar, {
      tipo: "PAGINA_NOVA",
      ofertaId: undefined,
      mensagem: `Nova página descoberta: ${pagina.dominio} (${pagina.domainAgeDays} dias de vida)`,
      metadata: { domainAgeDays: pagina.domainAgeDays, linksExternos: pagina.linksExternos },
    });
  }
});

// ─── Classificador interno ───────────────────────────────────────
function classificarPagina(pagina: any) {
  const tecnologias: string[] = pagina.tecnologias ?? [];
  const titulo = (pagina.titulo ?? "").toLowerCase();
  const url = (pagina.urlOriginal ?? "").toLowerCase();
  const dominio = (pagina.dominio ?? "").toLowerCase();

  // Infoprodutos
  if (["hotmart.com", "kiwify.com.br", "eduzz.com", "monetizze.com.br"].some((d) => dominio.includes(d))) {
    return { categoria: "INFOPRODUTO", subcategoria: "Plataforma brasileira", modeloNegocio: "INFOPRODUTO", plataforma: dominio, sinais: { tipo: "dominio_plataforma" } };
  }
  if (["curso", "mentoria", "ebook", "treinamento", "método"].some((k) => titulo.includes(k))) {
    return { categoria: "CURSO_ONLINE", subcategoria: "Curso online", modeloNegocio: "INFOPRODUTO", plataforma: null, sinais: { tipo: "titulo_keyword" } };
  }

  // SaaS
  if (tecnologias.some((t) => ["Stripe", "Intercom", "Segment", "Amplitude"].includes(t))) {
    return { categoria: "SAAS_B2B", subcategoria: "SaaS com integração", modeloNegocio: "SAAS", plataforma: null, sinais: { tipo: "tecnologia_saas" } };
  }
  if (["/pricing", "/planos", "/trial"].some((p) => url.includes(p))) {
    return { categoria: "SAAS_B2C", subcategoria: "SaaS com pricing page", modeloNegocio: "SAAS", plataforma: null, sinais: { tipo: "url_saas" } };
  }

  // E-commerce
  if (tecnologias.some((t) => ["Shopify", "WooCommerce", "VTEX", "Nuvemshop", "Tray"].includes(t))) {
    const plataforma = tecnologias.find((t) => ["Shopify", "WooCommerce", "VTEX", "Nuvemshop", "Tray"].includes(t)) ?? null;
    return { categoria: "ECOMMERCE_FISICO", subcategoria: "Loja virtual", modeloNegocio: "ECOMMERCE", plataforma, sinais: { tipo: "tecnologia_ecommerce" } };
  }

  // Eventos e lançamentos
  if (["webinar", "imersão", "desafio", "maratona", "workshop", "masterclass", "garantir vaga", "lista de espera"].some((k) => titulo.includes(k))) {
    return { categoria: "EVENTO_WEBINAR", subcategoria: "Evento/Lançamento", modeloNegocio: "EVENTO", plataforma: null, sinais: { tipo: "titulo_evento" } };
  }

  // Assinaturas
  if (["assine", "clube", "comunidade", "acesso mensal"].some((k) => titulo.includes(k))) {
    return { categoria: "ASSINATURA_CONTEUDO", subcategoria: "Assinatura", modeloNegocio: "ASSINATURA", plataforma: null, sinais: { tipo: "titulo_assinatura" } };
  }

  return { categoria: "OUTRO", subcategoria: undefined, modeloNegocio: "OUTRO", plataforma: null, sinais: { tipo: "nao_classificado" } };
}

// ─── Score Engine interno ────────────────────────────────────────
function calcularScore(oferta: any, adsCount: number = 0) {
  const pagina = oferta.pagina ?? {};
  let total = 0;
  const detalhamento: Record<string, number> = {};

  // Domínio recente (< 60 dias)
  if (pagina.domainAgeDays !== null && pagina.domainAgeDays !== undefined && pagina.domainAgeDays < 60) {
    const pts = pagina.domainAgeDays < 14 ? 20 : pagina.domainAgeDays < 30 ? 15 : 10;
    detalhamento.dominio_recente = pts;
    total += pts;
  }

  // Muitos links externos
  if ((pagina.linksExternos ?? 0) > 50) {
    detalhamento.links_externos = 15;
    total += 15;
  }

  // Alto volume de requests (página pesada = produto com muitos recursos carregados)
  if ((pagina.totalRequests ?? 0) > 80) {
    detalhamento.alto_volume_requests = 10;
    total += 10;
  }

  // Plataforma reconhecida
  if (oferta.plataforma && ["Shopify", "WooCommerce", "Hotmart", "Kiwify"].includes(oferta.plataforma)) {
    detalhamento.plataforma_reconhecida = 15;
    total += 15;
  }

  // Meta Ads Ativos
  if (adsCount > 0) {
    const adsScore = Math.min(25, adsCount * 5); // 5 points per ad, max 25
    detalhamento.ads_ativos = adsScore;
    total += adsScore;
  }

  // Bônus por categoria
  if (oferta.modeloNegocio === "INFOPRODUTO") { detalhamento.bonus_infoproduto = 10; total += 10; }
  if (oferta.modeloNegocio === "SAAS")        { detalhamento.bonus_saas = 10;        total += 10; }
  if (oferta.modeloNegocio === "EVENTO")      { detalhamento.bonus_evento = 15;      total += 15; }

  const scoreAnterior = oferta.score ?? 0;
  const tendencia = total > scoreAnterior + 5 ? "SUBINDO" : total < scoreAnterior - 5 ? "CAINDO" : "NEUTRO";

  return { total: Math.min(total, 100), detalhamento, tendencia };
}
