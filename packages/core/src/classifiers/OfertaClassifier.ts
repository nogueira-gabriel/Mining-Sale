import { UrlscanResult } from '../types/urlscan';
import { CategoriaOferta, ModeloNegocio, ClassificationResult } from '../types/oferta';

const REGRAS_CLASSIFICACAO = {
  INFOPRODUTO: {
    dominios: ['hotmart.com', 'kiwify.com.br', 'eduzz.com', 'monetizze.com.br'],
    tecnologias: ['Hotmart', 'Kiwify', 'Eduzz'],
    titulos: ['curso', 'mentoria', 'ebook', 'treinamento', 'método'],
  },
  SAAS: {
    urls: ['/pricing', '/planos', '/trial', '/signup'],
    titulos: ['software', 'plataforma', 'ferramenta', 'sistema', 'app'],
    tecnologias: ['Stripe', 'Intercom', 'Segment', 'Amplitude'],
  },
  ECOMMERCE_FISICO: {
    tecnologias: ['Shopify', 'WooCommerce', 'VTEX', 'Nuvemshop', 'Tray'],
    urls: ['/cart', '/checkout', '/produto', '/product'],
  },
  EVENTO_LANCAMENTO: {
    titulos: ['webinar', 'imersão', 'desafio', 'maratona', 'workshop', 'masterclass'],
    elementos: ['countdown', 'timer', 'vagas limitadas'],
  },
  ASSINATURA: {
    tecnologias: ['MemberKit', 'Kajabi', 'Circle'],
    titulos: ['assine', 'clube', 'comunidade', 'acesso mensal'],
  },
};

export class OfertaClassifier {
  classify(scan: UrlscanResult): ClassificationResult {
    const domain = scan.page.domain.toLowerCase();
    const url = scan.page.url.toLowerCase();
    const title = (scan.page.title || '').toLowerCase();
    const techs = scan.content?.technologies || [];
    const dom = (scan.domSnapshot || '').toLowerCase();

    // Check Infoproduto
    if (
      REGRAS_CLASSIFICACAO.INFOPRODUTO.dominios.some(d => domain.includes(d)) ||
      REGRAS_CLASSIFICACAO.INFOPRODUTO.tecnologias.some(t => techs.includes(t)) ||
      REGRAS_CLASSIFICACAO.INFOPRODUTO.titulos.some(t => title.includes(t))
    ) {
      return {
        categoria: CategoriaOferta.CURSO_ONLINE,
        modeloNegocio: ModeloNegocio.INFOPRODUTO,
        plataforma: techs.find(t => REGRAS_CLASSIFICACAO.INFOPRODUTO.tecnologias.includes(t)) || 'Desconhecida',
        confianca: 0.8,
      };
    }

    // Check SaaS
    if (
      REGRAS_CLASSIFICACAO.SAAS.urls.some(u => url.includes(u)) ||
      REGRAS_CLASSIFICACAO.SAAS.titulos.some(t => title.includes(t)) ||
      REGRAS_CLASSIFICACAO.SAAS.tecnologias.some(t => techs.includes(t))
    ) {
      return {
        categoria: CategoriaOferta.SAAS_B2B,
        modeloNegocio: ModeloNegocio.SAAS,
        plataforma: techs.find(t => REGRAS_CLASSIFICACAO.SAAS.tecnologias.includes(t)) || 'Custom',
        confianca: 0.7,
      };
    }

    // Check E-commerce
    if (
      REGRAS_CLASSIFICACAO.ECOMMERCE_FISICO.tecnologias.some(t => techs.includes(t)) ||
      REGRAS_CLASSIFICACAO.ECOMMERCE_FISICO.urls.some(u => url.includes(u))
    ) {
      return {
        categoria: CategoriaOferta.ECOMMERCE_FISICO,
        modeloNegocio: ModeloNegocio.ECOMMERCE,
        plataforma: techs.find(t => REGRAS_CLASSIFICACAO.ECOMMERCE_FISICO.tecnologias.includes(t)) || 'Custom',
        confianca: 0.9,
      };
    }

    // Check Evento/Lancamento
    if (
      REGRAS_CLASSIFICACAO.EVENTO_LANCAMENTO.titulos.some(t => title.includes(t)) ||
      REGRAS_CLASSIFICACAO.EVENTO_LANCAMENTO.elementos.some(e => dom.includes(e))
    ) {
      return {
        categoria: CategoriaOferta.EVENTO_WEBINAR,
        modeloNegocio: ModeloNegocio.EVENTO,
        confianca: 0.8,
      };
    }

    // Check Assinatura
    if (
      REGRAS_CLASSIFICACAO.ASSINATURA.tecnologias.some(t => techs.includes(t)) ||
      REGRAS_CLASSIFICACAO.ASSINATURA.titulos.some(t => title.includes(t))
    ) {
      return {
        categoria: CategoriaOferta.ASSINATURA_CONTEUDO,
        modeloNegocio: ModeloNegocio.ASSINATURA,
        plataforma: techs.find(t => REGRAS_CLASSIFICACAO.ASSINATURA.tecnologias.includes(t)) || 'Custom',
        confianca: 0.7,
      };
    }

    return {
      categoria: CategoriaOferta.OUTRO,
      modeloNegocio: ModeloNegocio.OUTRO,
      confianca: 0.3,
    };
  }
}
