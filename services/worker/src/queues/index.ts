import { Queue, Worker, Job, type ConnectionOptions } from 'bullmq';
import Redis from 'ioredis';
import { logger } from '@/packages/core/src/utils/logger';

const connection = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: null,
}) as unknown as ConnectionOptions;

export const discoveryQueue = new Queue('discoveryQueue', { connection });
export const classifyQueue = new Queue('classifyQueue', { connection });
export const scoringQueue = new Queue('scoringQueue', { connection });
export const alertsQueue = new Queue('alertsQueue', { connection });

export const createWorker = (queueName: string, processor: (job: Job) => Promise<any>) => {
  const worker = new Worker(queueName, processor, {
    connection,
    concurrency: parseInt(process.env.WORKER_CONCURRENCY || '3', 10),
  });

  worker.on('completed', (job) => {
    logger.info(`Job ${job.id} completed in ${queueName}`);
  });

  worker.on('failed', (job, err) => {
    logger.error(`Job ${job?.id} failed in ${queueName}: ${err.message}`);
  });

  return worker;
};
