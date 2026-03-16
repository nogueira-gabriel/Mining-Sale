# Sistema de Mineração de Ofertas Escaladas

Este é um sistema completo de mineração e análise de ofertas escaladas em qualquer mercado digital (e-commerce, infoprodutos, SaaS, serviços, etc.). O sistema utiliza a API do urlscan.io como motor principal de descoberta, cruzando dados com outras fontes para identificar o que está crescendo e sendo escalado.

## Tipos de Oferta Monitorados

- **E-commerce físico**: Lojas Shopify, WooCommerce, etc.
- **Infoprodutos**: Cursos, mentorias, ebooks em plataformas como Hotmart, Kiwify, Eduzz.
- **SaaS**: Ferramentas online com páginas de pricing ou trial.
- **Serviços digitais**: Agências, freelancers.
- **Afiliados**: Páginas de revisão, comparativos.
- **Assinaturas**: Newsletters, comunidades.
- **Eventos e lançamentos**: Webinars, desafios.

## Pré-requisitos e Instalação

1. Clone o repositório.
2. Instale as dependências com `npm install`.
3. Configure as variáveis de ambiente baseando-se no `.env.example`.
4. Suba os serviços de banco de dados e cache com Docker Compose:
   ```bash
   docker-compose up -d postgres redis
   ```
5. Execute as migrations do Prisma:
   ```bash
   npm run db:migrate
   ```
6. Inicie o ambiente de desenvolvimento (Next.js + Worker):
   ```bash
   npm run dev
   ```

## API Key do urlscan.io

Para utilizar o sistema, você precisa de uma API Key do [urlscan.io](https://urlscan.io/).
1. Crie uma conta gratuita.
2. Vá em Settings > API & Integrations e gere uma nova API Key.
3. Adicione a chave no seu arquivo `.env` como `URLSCAN_API_KEY`.
*Nota: O plano gratuito tem limites de requisições. O sistema está configurado para respeitar esses limites através do BullMQ.*

## Como funciona o Classificador de Ofertas

O `OfertaClassifier` analisa os resultados do urlscan.io (tecnologias, título, URL, links, domínio, texto visível) e aplica regras heurísticas para determinar a categoria e o modelo de negócio da oferta.

## Como funciona o Algoritmo de Scoring

O `ScoreEngine` calcula um score de 0 a 100 baseado em sinais universais (idade do domínio, quantidade de links, requests, etc.) e sinais específicos por categoria (presença de página de pricing, plataformas conhecidas, etc.).

## Adicionando um Novo Tipo de Oferta

1. Adicione a nova categoria no enum `CategoriaOferta` em `packages/core/src/types/oferta.ts` e no Prisma schema.
2. Crie uma nova query no `UrlscanClient.queries`.
3. Adicione regras de classificação no `OfertaClassifier`.
4. Adicione regras de pontuação no `ScoreEngine`.

## Guia de Extensão

Para plugar novas fontes de dados (ex: Meta Ads, Google Trends):
1. Crie a integração em `services/worker/src/integrations/`.
2. Atualize o `ScoringJob` para buscar dados dessa nova fonte.
3. Ajuste o `ScoreEngine` para considerar os novos sinais no cálculo do score.
