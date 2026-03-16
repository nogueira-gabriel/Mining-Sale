import { Job } from 'bullmq';
import { OfertaClassifier } from '@/packages/core/src/classifiers/OfertaClassifier';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '@/convex/_generated/api';
import { scoringQueue } from '../queues';
import { logger } from '@/packages/core/src/utils/logger';

const classifier = new OfertaClassifier();
const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export const processClassifyJob = async (job: Job) => {
  const { scan, paginaId } = job.data;
  logger.info(`Classifying page ${paginaId}`);

  try {
    const classification = classifier.classify(scan);

    // Check if oferta already exists
    const existing = await convex.mutation(api.mutations.getOfertaByPaginaAndCategoria, {
      paginaId,
      categoria: classification.categoria,
    });

    let ofertaId: string;

    if (!existing) {
      ofertaId = await convex.mutation(api.mutations.createOferta, {
        nome: scan.page.title || scan.page.domain,
        categoria: classification.categoria,
        modelo: classification.modeloNegocio,
        plataforma: classification.plataforma,
        urlOferta: scan.page.url,
        urlImagem: scan.screenshot,
        paginaId,
        sinais: {},
      });
      logger.info(`New offer created: ${ofertaId}`);
    } else {
      ofertaId = existing._id;
    }

    await scoringQueue.add('score', { scan, ofertaId, classification });
  } catch (error: any) {
    logger.error(`Error in Classify Job: ${error.message}`);
  }
};
