import type { Article } from "@/lib/types";

export interface Source {
  name: string;
  fetchArticles(): Promise<Article[]>;
}
