import axios, { AxiosInstance } from 'axios';
import { logger } from '@/packages/core/src/utils/logger';

export class MetaAdsClient {
  private client: AxiosInstance;

  constructor(accessToken: string) {
    this.client = axios.create({
      baseURL: 'https://graph.facebook.com/v19.0',
      params: {
        access_token: accessToken,
      },
    });
  }

  /**
   * Search the Facebook Ads Library for active ads related to a specific domain or keyword.
   */
  async getActiveAdsCount(searchTerm: string, country: string = 'BR'): Promise<number> {
    try {
      const response = await this.client.get('/ads_archive', {
        params: {
          search_terms: searchTerm,
          ad_reached_countries: `['${country}']`,
          ad_active_status: 'ACTIVE',
          fields: 'id',
          limit: 100, // Just need to know if there are many ads, limit 100 is enough to get a count
        },
      });

      // The Graph API returns data array and a paging object
      const ads = response.data?.data || [];
      return ads.length;
    } catch (error: any) {
      if (error.response) {
        logger.error(`Meta Ads API error: ${JSON.stringify(error.response.data)}`);
      } else {
        logger.error(`Meta Ads API network error: ${error.message}`);
      }
      return 0; // Better return 0 safely so we don't crash jobs if token expires/limit is reached
    }
  }
}
