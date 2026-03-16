import { Job } from 'bullmq';
import { ScoreEngine } from '@/packages/core/src/scoring/ScoreEngine';
import { prisma } from '@/packages/database/src';
import { alertsQueue } from '../queues';
import { logger } from '@/packages/core/src/utils/logger';
import { Tendencia } from '@/packages/core/src/types/pagina';

const scoreEngine = new ScoreEngine();

export const processScoringJob = async (job: Job) => {
  const { scan, ofertaId, classification } = job.data;
  logger.info(`Scoring offer ${ofertaId}`);

  try {
    const { score, sinais } = scoreEngine.calculate(scan, classification);

    const oferta = await prisma.oferta.findUnique({
      where: { id: ofertaId },
      include: { historico: { orderBy: { criadoEm: 'desc' }, take: 1 } },
    });

    if (!oferta) return;

    let tendencia = Tendencia.NEUTRO;
    if (oferta.historico.length > 0) {
      const lastScore = oferta.historico[0].score;
      if (score > lastScore + 5) tendencia = Tendencia.SUBINDO;
      else if (score < lastScore - 5) tendencia = Tendencia.CAINDO;
    }

    await prisma.$transaction([
      prisma.historicoScore.create({
        data: {
          ofertaId,
          score,
          sinais,
        },
      }),
      prisma.oferta.update({
        where: { id: ofertaId },
        data: {
          score,
          tendencia,
          sinais,
          atualizadoEm: new Date(),
        },
      }),
    ]);

    if (score > 70 || tendencia === Tendencia.SUBINDO) {
      await alertsQueue.add('alert', { ofertaId, score, tendencia });
    }
  } catch (error: any) {
    logger.error(`Error in Scoring Job: ${error.message}`);
  }
};
