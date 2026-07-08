import fs from "fs";
import path from "path";
import type { Digest, SourceResult, Status } from "@/lib/types";

const DATA_DIR = path.join(process.cwd(), "data");
const DIGESTS_DIR = path.join(DATA_DIR, "digests");
const RAW_DIR = path.join(DATA_DIR, "raw");
const STATUS_FILE = path.join(DATA_DIR, "status.json");

function ensureDirs() {
  for (const dir of [DATA_DIR, DIGESTS_DIR, RAW_DIR]) {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  }
}

export function publishDigest(digest: Digest, rawArticles: unknown): void {
  ensureDirs();
  fs.writeFileSync(
    path.join(DIGESTS_DIR, `${digest.date}.json`),
    JSON.stringify(digest, null, 2)
  );
  fs.writeFileSync(
    path.join(RAW_DIR, `${digest.date}.json`),
    JSON.stringify(rawArticles, null, 2)
  );
}

export function publishStatus(params: {
  sourceResults: SourceResult[];
  articlesFound: number;
  articlesUsed: number;
  errors: string[];
}): void {
  ensureDirs();
  const status: Status = {
    lastRunAt: new Date().toISOString(),
    sourcesAttempted: params.sourceResults.length,
    sourcesSucceeded: params.sourceResults.filter((r) => r.ok).length,
    articlesFound: params.articlesFound,
    articlesUsed: params.articlesUsed,
    sourceResults: params.sourceResults,
    errors: params.errors,
  };
  fs.writeFileSync(STATUS_FILE, JSON.stringify(status, null, 2));
}
