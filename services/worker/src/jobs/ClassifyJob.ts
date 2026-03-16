import { Job } from 'bullmq';
import { OfertaClassifier } from '@/packages/core/src/classifiers/OfertaClassifier';
import { prisma } from '@/packages/database/src';
import { scoringQueue } from '../queues';
import { logger } from '@/packages/core/src/utils/logger';

const classifier = new OfertaClassifier();

export const processClassifyJob = async (job: Job) => {
  const { scan, paginaId } = job.data;
  logger.info(`Classifying page ${paginaId}`);

  try {
    const classification = classifier.classify(scan);

    let oferta = await prisma.oferta.findFirst({
      where: {
        paginaId,
        categoria: classification.categoria,
      },
    });

    if (!oferta) {
      oferta = await prisma.oferta.create({
        data: {
          nome: scan.page.title || scan.page.domain,
          categoria: classification.categoria,
          modelo: classification.modeloNegocio,
          plataforma: classification.plataforma,
          urlOferta: scan.page.url,
          urlImagem: scan.screenshot,
          paginaId,
          sinais: {},
        },
      });
      logger.info(`New offer created: ${oferta.id}`);
    } else {
      oferta = await prisma.oferta.update({
        where: { id: oferta.id },
        data: {
          atualizadoEm: new Date(),
        },
      });
    }

    await scoringQueue.add('score', { scan, ofertaId: oferta.id, classification });
  } catch (error: any) {
    logger.error(`Error in Classify Job: ${error.message}`);
  }
};
