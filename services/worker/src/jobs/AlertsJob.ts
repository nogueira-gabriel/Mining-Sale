import { Job } from 'bullmq';
import { prisma } from '@/packages/database/src';
import { logger } from '@/packages/core/src/utils/logger';
import { AlertaTipo } from '@/packages/core/src/types/pagina';

export const processAlertsJob = async (job: Job) => {
  const { ofertaId, score, tendencia } = job.data;
  logger.info(`Processing alert for offer ${ofertaId}`);

  try {
    const oferta = await prisma.oferta.findUnique({
      where: { id: ofertaId },
    });

    if (!oferta) return;

    let tipo = AlertaTipo.NOVA_OFERTA;
    let mensagem = `Nova oferta detectada: ${oferta.nome}`;

    if (score > 70) {
      tipo = AlertaTipo.SCORE_ALTO;
      mensagem = `Oferta com score alto (${score}): ${oferta.nome}`;
    } else if (tendencia === 'SUBINDO') {
      tipo = AlertaTipo.TENDENCIA_ALTA;
      mensagem = `Oferta em tendência de alta: ${oferta.nome}`;
    }

    await prisma.alerta.create({
      data: {
        tipo,
        ofertaId,
        mensagem,
        metadata: { score, tendencia },
      },
    });
  } catch (error: any) {
    logger.error(`Error in Alerts Job: ${error.message}`);
  }
};
