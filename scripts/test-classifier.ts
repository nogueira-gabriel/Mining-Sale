import { OfertaClassifier } from '@/packages/core/src/classifiers/OfertaClassifier';
import { UrlscanResult } from '@/packages/core/src/types/urlscan';
import { logger } from '@/packages/core/src/utils/logger';

const run = () => {
  const classifier = new OfertaClassifier();

  const mockScan: UrlscanResult = {
    _id: '123',
    task: {
      uuid: '123',
      time: new Date().toISOString(),
      url: 'https://pay.kiwify.com.br/123',
      domain: 'pay.kiwify.com.br',
      apexDomain: 'kiwify.com.br',
      method: 'api',
      source: 'manual',
    },
    page: {
      url: 'https://pay.kiwify.com.br/123',
      domain: 'pay.kiwify.com.br',
      country: 'BR',
      city: 'Sao Paulo',
      server: 'cloudflare',
      ip: '1.1.1.1',
      title: 'Curso de Marketing Digital',
    },
    stats: {
      requests: 50,
      size: 1000,
      ipv6Percentage: 0,
    },
    content: {
      technologies: ['Kiwify'],
    },
    result: 'https://urlscan.io/result/123',
    screenshot: 'https://urlscan.io/screenshots/123.png',
  };

  const result = classifier.classify(mockScan);
  logger.info('Classification Result:');
  console.log(JSON.stringify(result, null, 2));
};

run();
