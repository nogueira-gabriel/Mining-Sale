import { createWorker } from './queues';
import { processDiscoveryJob } from './jobs/DiscoveryJob';
import { processClassifyJob } from './jobs/ClassifyJob';
import { processScoringJob } from './jobs/ScoringJob';
import { processAlertsJob } from './jobs/AlertsJob';
import { logger } from '@/packages/core/src/utils/logger';

const startWorkers = () => {
  logger.info('Starting workers...');

  createWorker('discoveryQueue', processDiscoveryJob);
  createWorker('classifyQueue', processClassifyJob);
  createWorker('scoringQueue', processScoringJob);
  createWorker('alertsQueue', processAlertsJob);

  logger.info('Workers started successfully.');
};

startWorkers();
