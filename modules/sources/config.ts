import type { Article, SourceResult } from "@/lib/types";
import type { Source } from "./types";
import cafef from "./cafef";
import vnexpress from "./vnexpress";
import vneconomy from "./vneconomy";
import cafebizBanle from "./cafebiz-banle";

/**
 * Đăng ký nguồn tin ở đây. Thêm nguồn mới: tạo 1 file trong modules/sources/
 * export default createRssSource(...), rồi import + thêm vào mảng này.
 */
export const sources: Source[] = [cafef, vnexpress, vneconomy, cafebizBanle];

export async function fetchAllArticles(): Promise<{
  articles: Article[];
  results: SourceResult[];
}> {
  const articles: Article[] = [];
  const results: SourceResult[] = [];

  for (const source of sources) {
    try {
      const items = await source.fetchArticles();
      articles.push(...items);
      results.push({ name: source.name, ok: true, articleCount: items.length });
    } catch (err) {
      results.push({
        name: source.name,
        ok: false,
        articleCount: 0,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  return { articles, results };
}
