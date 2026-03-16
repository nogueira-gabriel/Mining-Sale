export enum CategoriaOferta {
  ECOMMERCE_FISICO = 'ECOMMERCE_FISICO',
  ECOMMERCE_DIGITAL = 'ECOMMERCE_DIGITAL',
  CURSO_ONLINE = 'CURSO_ONLINE',
  MENTORIA = 'MENTORIA',
  EBOOK = 'EBOOK',
  COMUNIDADE = 'COMUNIDADE',
  SAAS_B2B = 'SAAS_B2B',
  SAAS_B2C = 'SAAS_B2C',
  SERVICO_AGENCIA = 'SERVICO_AGENCIA',
  SERVICO_FREELANCE = 'SERVICO_FREELANCE',
  AFILIADO = 'AFILIADO',
  ASSINATURA_CONTEUDO = 'ASSINATURA_CONTEUDO',
  EVENTO_WEBINAR = 'EVENTO_WEBINAR',
  OUTRO = 'OUTRO',
}

export enum ModeloNegocio {
  ECOMMERCE = 'ECOMMERCE',
  INFOPRODUTO = 'INFOPRODUTO',
  SAAS = 'SAAS',
  SERVICO = 'SERVICO',
  AFILIADO = 'AFILIADO',
  ASSINATURA = 'ASSINATURA',
  EVENTO = 'EVENTO',
  OUTRO = 'OUTRO',
}

export interface ClassificationResult {
  categoria: CategoriaOferta;
  subcategoria?: string;
  modeloNegocio: ModeloNegocio;
  plataforma?: string;
  confianca: number;
}
