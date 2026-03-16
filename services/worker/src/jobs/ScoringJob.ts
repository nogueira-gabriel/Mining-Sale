import { Job } from 'bullmq';
import { ScoreEngine } from '@/packages/core/src/scoring/ScoreEngine';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '@/convex/_generated/api';
import { alertsQueue } from '../queues';
import { logger } from '@/packages/core/src/utils/logger';
import { MetaAdsClient } from '../integrations/MetaAdsClient';

const scoreEngine = new ScoreEngine();
const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
const metaAds = new MetaAdsClient(process.env.META_ACCESS_TOKEN || '');

export const processScoringJob = async (job: Job) => {
  const { scan, ofertaId, classification } = job.data;
  logger.info(`Scoring offer ${ofertaId}`);

  try {
    const domain = scan.page.domain;
    const adsCount = await metaAds.getActiveAdsCount(domain);

    const { score, sinais } = scoreEngine.calculate(scan, classification, 0, adsCount);

    const ofertaWithHistory = await convex.mutation(api.mutations.getOfertaWithHistory, {
      ofertaId,
    });

    if (!ofertaWithHistory) return;

    let tendencia = 'NEUTRO';
    if (ofertaWithHistory.historico.length > 0) {
      const lastScore = ofertaWithHistory.historico[0].score;
      if (score > lastScore + 5) tendencia = 'SUBINDO';
      else if (score < lastScore - 5) tendencia = 'CAINDO';
    }

    await convex.mutation(api.mutations.updateOfertaScore, {
      ofertaId,
      score,
      tendencia,
      sinais,
      adsCounts: adsCount,
    });

    if (score > 70 || tendencia === 'SUBINDO') {
      await alertsQueue.add('alert', { ofertaId, score, tendencia });
    }
  } catch (error: any) {
    logger.error(`Error in Scoring Job: ${error.message}`);
  }
};
