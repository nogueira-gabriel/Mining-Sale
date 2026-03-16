import { Job } from 'bullmq';
import { UrlscanClient } from '../integrations/UrlscanClient';
import { prisma } from '@/packages/database/src';
import { classifyQueue } from '../queues';
import { logger } from '@/packages/core/src/utils/logger';

const urlscan = new UrlscanClient(process.env.URLSCAN_API_KEY || '');

export const processDiscoveryJob = async (job: Job) => {
  logger.info('Starting Discovery Job');
  const queries = Object.values(UrlscanClient.queries);

  for (const queryFn of queries) {
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
        let pagina = await prisma.pagina.findUnique({
          where: { dominio: domain },
        });

        if (!pagina) {
          pagina = await prisma.pagina.create({
            data: {
              dominio: domain,
              urlOriginal: res.page.url,
              titulo: res.page.title,
              domainAgeDays: res.page.apexDomainAgeDays,
              pais: res.page.country,
              tecnologias: res.content?.technologies || [],
              urlScreenshot: res.screenshot,
              linksExternos: res.links?.length || 0,
              totalRequests: res.stats?.requests || 0,
            },
          });
          logger.info(`New page discovered: ${domain}`);
        } else {
          pagina = await prisma.pagina.update({
            where: { id: pagina.id },
            data: {
              atualizadoEm: new Date(),
            },
          });
        }

        await classifyQueue.add('classify', { scan: res, paginaId: pagina.id });
      }
    } catch (error: any) {
      logger.error(`Error in Discovery Job: ${error.message}`);
    }
  }
};
