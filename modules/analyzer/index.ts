import Anthropic from "@anthropic-ai/sdk";
import type { Article, ScoredArticle } from "@/lib/types";

const MODEL = "claude-sonnet-5";
const RELEVANCE_THRESHOLD = 6;

function extractJson(text: string): unknown {
  const match = text.match(/\[[\s\S]*\]/);
  if (!match) throw new Error("Analyzer: không tìm thấy JSON trong phản hồi");
  return JSON.parse(match[0]);
}

/**
 * Lọc trùng lặp + chấm điểm độ liên quan ngành bán lẻ bằng Claude.
 * Trả về danh sách bài đã lọc, sắp theo điểm giảm dần.
 */
export async function analyzeArticles(
  articles: Article[]
): Promise<ScoredArticle[]> {
  if (articles.length === 0) return [];

  const client = new Anthropic();

  const list = articles
    .map((a, i) => `${i}. [${a.source}] ${a.title}\n${a.summary ?? ""}`)
    .join("\n\n");

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 4096,
    system:
      "Bạn là biên tập viên chuyên ngành bán lẻ Việt Nam. Nhiệm vụ: đọc danh sách " +
      "bài báo, loại bỏ bài trùng nội dung (giữ 1 bài đại diện), và chấm điểm mức độ " +
      "liên quan tới ngành bán lẻ (0-10, 10 = rất liên quan: M&A, mở/đóng cửa hàng, " +
      "hành vi tiêu dùng, chính sách bán lẻ, đối thủ cạnh tranh, công nghệ bán lẻ; " +
      "0 = không liên quan). Trả lời DUY NHẤT bằng JSON array, mỗi phần tử dạng " +
      '{"index": number, "score": number, "reason": string}. Không thêm chữ nào khác.',
    messages: [{ role: "user", content: list }],
  });

  const text = response.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("");

  const scores = extractJson(text) as Array<{
    index: number;
    score: number;
    reason: string;
  }>;

  return scores
    .filter((s) => s.score >= RELEVANCE_THRESHOLD && articles[s.index])
    .map((s) => ({
      ...articles[s.index],
      relevanceScore: s.score,
      reason: s.reason,
    }))
    .sort((a, b) => b.relevanceScore - a.relevanceScore);
}
