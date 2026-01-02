declare const RELEASEVERSION: string;
declare const RELEASEDATE: number;
declare const RELEASESHA: string;

export const version = {
  version: RELEASEVERSION.replace(/^v(\d)/, '$1') || 'dev',
  date: RELEASEDATE || Date.now(),
  sha: RELEASESHA || '',
};
