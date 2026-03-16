import { UrlscanClient } from '../services/worker/src/integrations/UrlscanClient';
import { logger } from '@/packages/core/src/utils/logger';

const run = async () => {
  const urlscan = new UrlscanClient(process.env.URLSCAN_API_KEY || '');
  const query = UrlscanClient.queries.lojasShopifyNovasBR();
  
  logger.info(`Running manual scan with query: ${query}`);
  try {
    const result = await urlscan.search(query, 5);
    logger.info(`Found ${result.total} results. Showing first 5:`);
    console.log(JSON.stringify(result.results, null, 2));
  } catch (error: any) {
    logger.error(`Error: ${error.message}`);
    if (error.response) {
      console.error(JSON.stringify(error.response.data, null, 2));
    }
  }
};

run();
