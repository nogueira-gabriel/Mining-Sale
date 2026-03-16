import { Job } from 'bullmq';
import { UrlscanClient } from '../integrations/UrlscanClient';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '@/convex/_generated/api';
import { classifyQueue } from '../queues';
import { logger } from '@/packages/core/src/utils/logger';

const urlscan = new UrlscanClient(process.env.URLSCAN_API_KEY || '');
const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export const processDiscoveryJob = async (job: Job) => {
  logger.info('Starting Discovery Job');

  // Only use zero-argument query functions to avoid runtime errors
  const safeQueries = [
    UrlscanClient.queries.lojasShopifyNovasBR,
    UrlscanClient.queries.lojasWooNovasBR,
    UrlscanClient.queries.paginasHotmart,
    UrlscanClient.queries.paginasKiwify,
    UrlscanClient.queries.paginasEduzz,
    UrlscanClient.queries.saasPricingNovos,
    UrlscanClient.queries.saasTrialNovos,
    UrlscanClient.queries.paginasCaptura,
    UrlscanClient.queries.dominiosRecemCriados,
  ];

  for (const queryFn of safeQueries) {
    try {
      const query = queryFn();
      const result = await urlscan.search(query, 50);

      const uniqueDomains = new Map();
      for (const res of result.results) {
        if (!uniqueDomains.has(res.page.domain)) {
          uniqueDomains.set(res.page.domain, res);
        }
      }

      for (const [domain, res] of uniqueDomains) {
        const paginaId = await convex.mutation(api.mutations.upsertPagina, {
          dominio: domain,
          urlOriginal: res.page.url,
          titulo: res.page.title,
          domainAgeDays: res.page.apexDomainAgeDays,
          pais: res.page.country,
          tecnologias: res.content?.technologies || [],
          urlScreenshot: res.screenshot,
          linksExternos: res.links?.length || 0,
          totalRequests: res.stats?.requests || 0,
        });

        logger.info(`Page processed: ${domain}`);
        await classifyQueue.add('classify', { scan: res, paginaId });
      }
    } catch (error: any) {
      logger.error(`Error in Discovery Job: ${error.message}`);
    }
  }
};
