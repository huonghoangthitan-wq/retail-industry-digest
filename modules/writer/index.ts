import Anthropic from "@anthropic-ai/sdk";
import type { Digest, ScoredArticle } from "@/lib/types";

const MODEL = "claude-sonnet-5";
const MAX_SOURCE_ARTICLES = 15;

function extractJson(text: string): unknown {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("Writer: không tìm thấy JSON trong phản hồi");
  return JSON.parse(match[0]);
}

/**
 * Viết bản tóm tắt tiếng Việt hằng ngày từ danh sách bài đã được lọc/chấm điểm.
 */
export async function writeDigest(
  date: string,
  scoredArticles: ScoredArticle[]
): Promise<Digest> {
  const client = new Anthropic();
  const used = scoredArticles.slice(0, MAX_SOURCE_ARTICLES);

  const list = used
    .map((a, i) => `${i}. [${a.source}] ${a.title}\n${a.summary ?? ""}`)
    .join("\n\n");

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 2048,
    system:
      "Bạn là biên tập viên viết bản tin tóm tắt ngành bán lẻ Việt Nam mỗi sáng, " +
      "cho nhân viên nội bộ đọc trong 2-3 phút. Dựa trên danh sách bài báo được " +
      "cung cấp, viết bản tóm tắt súc tích, khách quan, không suy diễn ngoài nội " +
      "dung nguồn. Trả lời DUY NHẤT bằng JSON dạng " +
      '{"headline": string, "content": string, "highlights": string[]}. ' +
      "content là đoạn văn tóm tắt liền mạch (không markdown), highlights là 3-6 " +
      "gạch đầu dòng ngắn nêu điểm chính. Không thêm chữ nào khác ngoài JSON.",
    messages: [{ role: "user", content: list }],
  });

  const text = response.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("");

  const parsed = extractJson(text) as {
    headline: string;
    content: string;
    highlights: string[];
  };

  return {
    date,
    headline: parsed.headline,
    content: parsed.content,
    highlights: parsed.highlights,
    sources: used.map((a) => ({
      title: a.title,
      url: a.url,
      source: a.source,
    })),
  };
}
