import axios, { AxiosInstance } from 'axios';
import { UrlscanSearchResult, UrlscanSubmitResult, UrlscanResult, SubmitOptions } from '@/packages/core/src/types/urlscan';
import { logger } from '@/packages/core/src/utils/logger';

export class UrlscanClient {
  private client: AxiosInstance;

  constructor(apiKey: string) {
    this.client = axios.create({
      baseURL: 'https://urlscan.io/api/v1',
      headers: {
        'API-Key': apiKey,
        'Content-Type': 'application/json',
      },
    });
  }

  static queries = {
    // E-commerce
    lojasShopifyNovasBR: () =>
      'domain:myshopify.com AND page.country:BR AND page.apexDomainAgeDays:<60',

    lojasWooNovasBR: () =>
      'page.url:checkout AND page.country:BR AND page.apexDomainAgeDays:<60',

    // Infoprodutos — plataformas brasileiras
    paginasHotmart: () =>
      'domain:hotmart.com OR domain:go.hotmart.com AND date:>now-7d',

    paginasKiwify: () =>
      'domain:pay.kiwify.com.br AND date:>now-7d',

    paginasEduzz: () =>
      'domain:eduzz.com OR domain:sun.eduzz.com AND date:>now-7d',

    // SaaS — páginas de pricing e trial recentes
    saasPricingNovos: () =>
      'page.url:pricing AND page.apexDomainAgeDays:<365 AND page.country:BR',

    saasTrialNovos: () =>
      'page.title:"free trial" OR page.title:"teste grátis" AND page.apexDomainAgeDays:<365',

    // Páginas de captura e lançamento
    paginasCaptura: () =>
      'page.title:"inscreva-se" OR page.title:"garantir vaga" OR page.title:"lista de espera" AND date:>now-7d',

    // Alta atividade geral (sinal de tráfego pago)
    altaAtividade: (minLinks: number = 60) =>
      `links.length:>${minLinks} AND page.country:BR AND date:>now-3d`,

    // Domínios muito novos com tráfego (dropshipping ou lançamento)
    dominiosRecemCriados: () =>
      'page.apexDomainAgeDays:<30 AND page.country:BR AND links.length:>20',

    // Por tecnologia e país (using generic search since content.technologies is Pro)
    porTecnologia: (tech: string, country = 'BR') =>
      `"${tech}" AND page.country:${country}`,
  };

  async search(query: string, size: number = 100): Promise<UrlscanSearchResult> {
    try {
      const response = await this.client.get<UrlscanSearchResult>('/search/', {
        params: { q: query, size },
      });
      return response.data;
    } catch (error: any) {
      logger.error(`Urlscan search error: ${error.message}`);
      throw error;
    }
  }

  async submit(url: string, options?: SubmitOptions): Promise<UrlscanSubmitResult> {
    try {
      const response = await this.client.post<UrlscanSubmitResult>('/scan/', {
        url,
        ...options,
      });
      return response.data;
    } catch (error: any) {
      logger.error(`Urlscan submit error: ${error.message}`);
      throw error;
    }
  }

  async getResult(uuid: string): Promise<UrlscanResult> {
    try {
      const response = await this.client.get<UrlscanResult>(`/result/${uuid}/`);
      return response.data;
    } catch (error: any) {
      logger.error(`Urlscan getResult error: ${error.message}`);
      throw error;
    }
  }

  async waitForResult(uuid: string, maxWait: number = 60000): Promise<UrlscanResult> {
    const startTime = Date.now();
    const interval = 5000;

    while (Date.now() - startTime < maxWait) {
      try {
        const result = await this.getResult(uuid);
        if (result) return result;
      } catch (error: any) {
        if (error.response && error.response.status !== 404) {
          throw error;
        }
      }
      await new Promise((resolve) => setTimeout(resolve, interval));
    }
    throw new Error(`Timeout waiting for scan result ${uuid}`);
  }
}
