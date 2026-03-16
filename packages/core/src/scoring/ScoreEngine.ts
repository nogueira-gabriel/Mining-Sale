import { UrlscanResult } from '../types/urlscan';
import { ClassificationResult, ModeloNegocio } from '../types/oferta';

export class ScoreEngine {
  calculate(scan: UrlscanResult, classification: ClassificationResult, trendsScore: number = 0, adsCount: number = 0): { score: number; sinais: any } {
    let score = 0;
    const sinais: any = {};

    // Sinais Universais
    const domainAge = scan.page.apexDomainAgeDays || 999;
    if (domainAge < 60) {
      score += 20;
      sinais['dominio_recente'] = { valor: domainAge, peso: 20 };
    }

    const linksLength = scan.links?.length || 0;
    if (linksLength > 50) {
      score += 15;
      sinais['muitos_links'] = { valor: linksLength, peso: 15 };
    }

    if (trendsScore > 0) {
      const weight = Math.min(25, trendsScore);
      score += weight;
      sinais['trends_crescendo'] = { valor: trendsScore, peso: weight };
    }

    if (adsCount > 0) {
      const weight = Math.min(25, adsCount * 5); // 5 points per ad, max 25
      score += weight;
      sinais['ads_ativos'] = { valor: adsCount, peso: weight };
    }

    const requests = scan.stats?.requests || 0;
    if (requests > 80) {
      score += 10;
      sinais['alta_requests'] = { valor: requests, peso: 10 };
    }

    const dom = (scan.domSnapshot || '').toLowerCase();
    if (dom.includes('urgente') || dom.includes('últimas horas') || dom.includes('acaba em')) {
      score += 5;
      sinais['elementos_urgencia'] = { valor: true, peso: 5 };
    }

    // Sinais Específicos
    if (classification.modeloNegocio === ModeloNegocio.INFOPRODUTO) {
      if (['Hotmart', 'Kiwify', 'Eduzz'].includes(classification.plataforma || '')) {
        score += 10;
        sinais['plataforma_conhecida'] = { valor: classification.plataforma, peso: 10 };
      }
      if (dom.includes('depoimento') || dom.includes('resultados')) {
        score += 5;
        sinais['depoimentos_detectados'] = { valor: true, peso: 5 };
      }
    }

    if (classification.modeloNegocio === ModeloNegocio.SAAS) {
      if (scan.page.url.includes('pricing')) {
        score += 10;
        sinais['pagina_pricing'] = { valor: true, peso: 10 };
      }
      if (['Stripe', 'Hotmart'].includes(classification.plataforma || '')) {
        score += 5;
        sinais['integracao_pagamento'] = { valor: classification.plataforma, peso: 5 };
      }
    }

    if (classification.modeloNegocio === ModeloNegocio.ECOMMERCE) {
      if (dom.includes('estoque limitado') || dom.includes('últimas unidades')) {
        score += 5;
        sinais['estoque_limitado'] = { valor: true, peso: 5 };
      }
      if (dom.includes('frete grátis')) {
        score += 5;
        sinais['frete_gratis'] = { valor: true, peso: 5 };
      }
    }

    if (classification.modeloNegocio === ModeloNegocio.EVENTO) {
      if (dom.includes('countdown') || dom.includes('timer')) {
        score += 10;
        sinais['contador_ativo'] = { valor: true, peso: 10 };
      }
      if (scan.content?.technologies?.includes('Facebook Pixel')) {
        score += 5;
        sinais['pixel_conversao'] = { valor: true, peso: 5 };
      }
    }

    // Cap at 100
    score = Math.min(100, score);

    return { score, sinais };
  }
}
