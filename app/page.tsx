import Link from "next/link";
import { getLatestDigest, getStatus, listDigestDates } from "@/lib/data";

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("vi-VN", {
    timeZone: "Asia/Ho_Chi_Minh",
    dateStyle: "long",
    timeStyle: "short",
  });
}

export default function HomePage() {
  const digest = getLatestDigest();
  const status = getStatus();
  const otherDates = listDigestDates().slice(1, 6);

  return (
    <div className="space-y-8">
      <div
        className={`rounded-md border px-4 py-3 text-sm ${
          status
            ? "border-emerald-200 bg-emerald-50 text-emerald-800"
            : "border-amber-200 bg-amber-50 text-amber-800"
        }`}
      >
        {status ? (
          <>
            Cập nhật lúc <strong>{formatDateTime(status.lastRunAt)}</strong> —{" "}
            {status.sourcesSucceeded}/{status.sourcesAttempted} nguồn thành
            công, {status.articlesUsed} bài được sử dụng.
            {status.errors.length > 0 && (
              <span className="block mt-1 text-amber-700">
                Có {status.errors.length} lỗi trong lần chạy này.
              </span>
            )}
          </>
        ) : (
          "Chưa có dữ liệu — pipeline chưa chạy lần nào."
        )}
      </div>

      {digest ? (
        <article className="space-y-4">
          <div>
            <p className="text-sm text-slate-500">{digest.date}</p>
            <h1 className="text-2xl font-bold">{digest.headline}</h1>
          </div>

          <div className="whitespace-pre-line leading-relaxed text-slate-800">
            {digest.content}
          </div>

          {digest.highlights.length > 0 && (
            <div>
              <h2 className="mb-2 text-sm font-semibold uppercase text-slate-500">
                Điểm chính
              </h2>
              <ul className="list-disc space-y-1 pl-5">
                {digest.highlights.map((h, i) => (
                  <li key={i}>{h}</li>
                ))}
              </ul>
            </div>
          )}

          <div>
            <h2 className="mb-2 text-sm font-semibold uppercase text-slate-500">
              Nguồn
            </h2>
            <ul className="space-y-1 text-sm">
              {digest.sources.map((s, i) => (
                <li key={i}>
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {s.title}
                  </a>{" "}
                  <span className="text-slate-400">({s.source})</span>
                </li>
              ))}
            </ul>
          </div>
        </article>
      ) : (
        <p className="text-slate-500">
          Chưa có bản tóm tắt nào. Chạy pipeline lần đầu để tạo dữ liệu.
        </p>
      )}

      {otherDates.length > 0 && (
        <div className="border-t border-slate-200 pt-4">
          <h2 className="mb-2 text-sm font-semibold uppercase text-slate-500">
            Xem lại
          </h2>
          <ul className="space-y-1 text-sm">
            {otherDates.map((date) => (
              <li key={date}>
                <Link
                  href={`/archive/${date}`}
                  className="text-blue-600 hover:underline"
                >
                  {date}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
