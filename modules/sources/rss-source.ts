import Parser from "rss-parser";
import type { Article } from "@/lib/types";
import type { Source } from "./types";

const parser = new Parser();

/**
 * Tạo 1 module nguồn tin từ 1 RSS feed. Dùng chung cho mọi nguồn RSS —
 * để thêm nguồn mới chỉ cần gọi hàm này với name + url, không cần viết
 * lại logic parse.
 */
export function createRssSource(name: string, feedUrl: string): Source {
  return {
    name,
    async fetchArticles(): Promise<Article[]> {
      const feed = await parser.parseURL(feedUrl);
      return (feed.items ?? []).map((item) => ({
        title: item.title ?? "(không có tiêu đề)",
        url: item.link ?? "",
        source: name,
        publishedAt: item.isoDate ?? item.pubDate ?? new Date().toISOString(),
        summary: item.contentSnippet ?? item.content,
      }));
    },
  };
}
