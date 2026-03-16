import { MetaAdsClient } from '../services/worker/src/integrations/MetaAdsClient';
import { logger } from '@/packages/core/src/utils/logger';

const run = async () => {
  const metaAds = new MetaAdsClient(process.env.META_ACCESS_TOKEN || '');
  const testDomain = 'hotmart.com';
  
  console.log(`Running Meta Ads check for domain: ${testDomain}`);
  try {
    const count = await metaAds.getActiveAdsCount(testDomain);
    console.log(`Found ${count} active ads for ${testDomain} (capped at 100 max per our query limit)`);
  } catch (error: any) {
    console.log(`Error: ${error.message}`);
  }
};

run();
