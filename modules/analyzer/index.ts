import Anthropic from "@anthropic-ai/sdk";
import type { Article, ScoredArticle } from "@/lib/types";

const MODEL = "claude-sonnet-5";
const RELEVANCE_THRESHOLD = 6;
const BATCH_SIZE = 60;

function extractJson(text: string): unknown {
  const match = text.match(/\[[\s\S]*\]/);
  if (!match) throw new Error("Analyzer: không tìm thấy JSON trong phản hồi");
  return JSON.parse(match[0]);
}

function chunk<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
}

/**
 * Chấm điểm 1 lô bài (tối đa BATCH_SIZE bài) để tránh output JSON bị Claude
 * cắt cụt khi số lượng bài quá lớn so với max_tokens.
 */
async function scoreBatch(
  client: Anthropic,
  batch: Article[]
): Promise<Array<{ index: number; score: number }>> {
  const list = batch
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
      "0 = không liên quan). Trả lời DUY NHẤT bằng JSON array ngắn gọn, mỗi phần tử " +
      'dạng {"index": number, "score": number}. Không giải thích, không thêm chữ nào khác.',
    messages: [{ role: "user", content: list }],
  });

  const text = response.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("");

  return extractJson(text) as Array<{ index: number; score: number }>;
}

/**
 * Lọc trùng lặp + chấm điểm độ liên quan ngành bán lẻ bằng Claude.
 * Chia theo lô để tránh vượt max_tokens khi số bài lớn. Trả về danh sách
 * bài đã lọc, sắp theo điểm giảm dần.
 */
export async function analyzeArticles(
  articles: Article[]
): Promise<ScoredArticle[]> {
  if (articles.length === 0) return [];

  const client = new Anthropic();
  const batches = chunk(articles, BATCH_SIZE);
  const scored: ScoredArticle[] = [];

  for (let b = 0; b < batches.length; b++) {
    const batch = batches[b];
    const scores = await scoreBatch(client, batch);
    for (const s of scores) {
      const article = batch[s.index];
      if (article && s.score >= RELEVANCE_THRESHOLD) {
        scored.push({ ...article, relevanceScore: s.score, reason: "" });
      }
    }
  }

  return scored.sort((a, b) => b.relevanceScore - a.relevanceScore);
}
