import { discoveryQueue } from '../../worker/src/queues';
import { logger } from '@/packages/core/src/utils/logger';

const scheduleJobs = async () => {
  logger.info('Scheduling jobs...');

  await discoveryQueue.add('discovery', {}, {
    repeat: {
      every: parseInt(process.env.DISCOVERY_INTERVAL_HOURS || '6', 10) * 3600000,
    },
  });

  logger.info('Jobs scheduled successfully.');
};

scheduleJobs();
