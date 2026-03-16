import { Job } from 'bullmq';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '@/convex/_generated/api';
import { logger } from '@/packages/core/src/utils/logger';

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export const processAlertsJob = async (job: Job) => {
  const { ofertaId, score, tendencia } = job.data;
  logger.info(`Processing alert for offer ${ofertaId}`);

  try {
    const oferta = await convex.query(api.ofertas.getById, { id: ofertaId });

    if (!oferta) return;

    let tipo = 'NOVA_OFERTA';
    let mensagem = `Nova oferta detectada: ${oferta.nome}`;

    if (score > 70) {
      tipo = 'SCORE_ALTO';
      mensagem = `Oferta com score alto (${score}): ${oferta.nome}`;
    } else if (tendencia === 'SUBINDO') {
      tipo = 'TENDENCIA_ALTA';
      mensagem = `Oferta em tendência de alta: ${oferta.nome}`;
    }

    await convex.mutation(api.mutations.createAlerta, {
      tipo,
      ofertaId,
      mensagem,
      metadata: { score, tendencia },
    });
  } catch (error: any) {
    logger.error(`Error in Alerts Job: ${error.message}`);
  }
};
