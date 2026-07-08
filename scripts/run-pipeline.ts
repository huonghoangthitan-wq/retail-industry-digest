import { fetchAllArticles } from "@/modules/sources/config";
import { analyzeArticles } from "@/modules/analyzer";
import { writeDigest } from "@/modules/writer";
import { publishDigest, publishStatus } from "@/modules/publisher";

function todayVN(): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Ho_Chi_Minh",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const get = (type: string) => parts.find((p) => p.type === type)?.value;
  return `${get("year")}-${get("month")}-${get("day")}`;
}

async function main() {
  const errors: string[] = [];
  const date = todayVN();

  console.log(`[pipeline] Bắt đầu chạy cho ngày ${date}`);

  const { articles, results } = await fetchAllArticles();
  for (const r of results) {
    if (!r.ok) errors.push(`${r.name}: ${r.error}`);
  }
  console.log(
    `[pipeline] Thu thập được ${articles.length} bài từ ${results.filter((r) => r.ok).length}/${results.length} nguồn`
  );

  let articlesUsed = 0;

  try {
    const scored = await analyzeArticles(articles);
    console.log(`[pipeline] ${scored.length} bài đạt ngưỡng liên quan`);

    if (scored.length > 0) {
      const digest = await writeDigest(date, scored);
      publishDigest(digest, articles);
      articlesUsed = digest.sources.length;
      console.log(`[pipeline] Đã ghi bản tóm tắt ngày ${date}`);
    } else {
      errors.push("Không có bài nào đạt ngưỡng liên quan ngành bán lẻ");
      console.log("[pipeline] Không có bài đạt ngưỡng, bỏ qua ghi digest");
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    errors.push(`Analyzer/Writer: ${message}`);
    console.error(`[pipeline] Lỗi khi phân tích/viết: ${message}`);
  }

  publishStatus({
    sourceResults: results,
    articlesFound: articles.length,
    articlesUsed,
    errors,
  });

  console.log(`[pipeline] Hoàn tất. ${errors.length} lỗi.`);
  if (errors.length > 0) {
    console.log(errors.map((e) => ` - ${e}`).join("\n"));
  }
}

main().catch((err) => {
  console.error("[pipeline] Lỗi không xử lý được:", err);
  process.exit(1);
});
