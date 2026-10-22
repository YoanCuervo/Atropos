import { appendFile, mkdir, open } from "node:fs/promises";
import { dirname, join } from "node:path";

const APPLICATION_DATA_FOLDER_NAME = "Atropos";
const JOURNAL_FILE_NAME = "limit-snapshots.jsonl";
const RECENT_JOURNAL_BYTE_COUNT = 4096;

export class MissingApplicationDataPathError extends Error {
  constructor() {
    super("The APPDATA environment variable is not set.");
    this.name = "MissingApplicationDataPathError";
  }
}

/**
 * @param {NodeJS.ProcessEnv} [environment]
 * @returns {string} Absolute path of `%APPDATA%\Atropos\limit-snapshots.jsonl`.
 * @throws {MissingApplicationDataPathError}
 */
export function resolveJournalPath(environment = process.env) {
  const applicationDataPath = environment.APPDATA;
  if (!applicationDataPath) {
    throw new MissingApplicationDataPathError();
  }
  return join(
    applicationDataPath,
    APPLICATION_DATA_FOLDER_NAME,
    JOURNAL_FILE_NAME,
  );
}

/**
 * Reads only the end of the journal: it grows for twelve months
 * while the status line runs every minute.
 *
 * @param {string} journalPath
 * @returns {Promise<string[]>} Complete lines, oldest first; empty when the journal does not exist yet.
 */
export async function readRecentJournalLines(journalPath) {
  let journalFile;
  try {
    journalFile = await open(journalPath, "r");
  } catch (error) {
    if (error.code === "ENOENT") {
      return [];
    }
    throw error;
  }

  try {
    const { size: journalByteCount } = await journalFile.stat();
    const readByteCount = Math.min(journalByteCount, RECENT_JOURNAL_BYTE_COUNT);
    const buffer = Buffer.alloc(readByteCount);
    await journalFile.read(
      buffer,
      0,
      readByteCount,
      journalByteCount - readByteCount,
    );

    const lines = buffer.toString("utf8").split("\n");
    const isFirstLineCut = readByteCount < journalByteCount;
    if (isFirstLineCut) {
      lines.shift();
    }
    return lines.filter((line) => line.trim() !== "");
  } finally {
    await journalFile.close();
  }
}

/**
 * Appends lines to the journal, creating its folder if needed.
 *
 * @param {string} journalPath
 * @param {string[]} journalLines Lines that already end with a newline.
 * @returns {Promise<void>}
 */
export async function appendJournalLines(journalPath, journalLines) {
  await mkdir(dirname(journalPath), { recursive: true });
  await appendFile(journalPath, journalLines.join(""), "utf8");
}
