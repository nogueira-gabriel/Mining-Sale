export interface UrlscanSearchResult {
  results: UrlscanResult[];
  total: number;
  took: number;
  has_more: boolean;
}

export interface UrlscanResult {
  _id: string;
  task: {
    uuid: string;
    time: string;
    url: string;
    domain: string;
    apexDomain: string;
    method: string;
    source: string;
  };
  page: {
    url: string;
    domain: string;
    country: string;
    city: string;
    server: string;
    ip: string;
    apexDomainAgeDays?: number;
    title?: string;
  };
  stats: {
    requests: number;
    size: number;
    ipv6Percentage: number;
  };
  content?: {
    technologies?: string[];
  };
  result: string;
  screenshot: string;
  domSnapshot?: string;
  links?: {
    length: number;
    urls: string[];
  };
}

export interface UrlscanSubmitResult {
  message: string;
  uuid: string;
  result: string;
  api: string;
  visibility: string;
  options: any;
  url: string;
}

export interface SubmitOptions {
  visibility?: 'public' | 'unlisted' | 'private';
  tags?: string[];
  customagent?: string;
  referer?: string;
}
