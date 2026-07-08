export interface Article {
  title: string;
  url: string;
  source: string;
  publishedAt: string;
  summary?: string;
}

export interface ScoredArticle extends Article {
  relevanceScore: number;
  reason: string;
}

export interface Digest {
  date: string;
  headline: string;
  content: string;
  highlights: string[];
  sources: Array<{ title: string; url: string; source: string }>;
}

export interface SourceResult {
  name: string;
  ok: boolean;
  articleCount: number;
  error?: string;
}

export interface Status {
  lastRunAt: string;
  sourcesAttempted: number;
  sourcesSucceeded: number;
  articlesFound: number;
  articlesUsed: number;
  sourceResults: SourceResult[];
  errors: string[];
}
