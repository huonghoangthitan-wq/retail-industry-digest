import { notFound } from "next/navigation";
import Link from "next/link";
import { getDigest, listDigestDates } from "@/lib/data";

export function generateStaticParams() {
  return listDigestDates().map((date) => ({ date }));
}

export default function ArchiveDigestPage({
  params,
}: {
  params: { date: string };
}) {
  const digest = getDigest(params.date);
  if (!digest) notFound();

  return (
    <article className="space-y-4">
      <Link href="/" className="text-sm text-blue-600 hover:underline">
        ← Về trang chủ
      </Link>

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
  );
}
