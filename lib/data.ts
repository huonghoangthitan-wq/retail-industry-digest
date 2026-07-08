import fs from "fs";
import path from "path";
import type { Digest, Status } from "./types";

const DATA_DIR = path.join(process.cwd(), "data");
const DIGESTS_DIR = path.join(DATA_DIR, "digests");
const STATUS_FILE = path.join(DATA_DIR, "status.json");

export function listDigestDates(): string[] {
  if (!fs.existsSync(DIGESTS_DIR)) return [];
  return fs
    .readdirSync(DIGESTS_DIR)
    .filter((f) => f.endsWith(".json"))
    .map((f) => f.replace(".json", ""))
    .sort((a, b) => b.localeCompare(a));
}

export function getDigest(date: string): Digest | null {
  const file = path.join(DIGESTS_DIR, `${date}.json`);
  if (!fs.existsSync(file)) return null;
  return JSON.parse(fs.readFileSync(file, "utf-8"));
}

export function getLatestDigest(): Digest | null {
  const dates = listDigestDates();
  if (dates.length === 0) return null;
  return getDigest(dates[0]);
}

export function getStatus(): Status | null {
  if (!fs.existsSync(STATUS_FILE)) return null;
  return JSON.parse(fs.readFileSync(STATUS_FILE, "utf-8"));
}
