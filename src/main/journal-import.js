import { readFile, rename, rm, stat, unlink } from "node:fs/promises";
import { dirname, join } from "node:path";
import { parseReadableJournalLines } from "../core/snapshot-journal.js";

/** @typedef {import("./database/limit-snapshots-repository.js").LimitSnapshotsRepository} LimitSnapshotsRepository */

const IMPORTING_JOURNAL_FILE_NAME = "limit-snapshots.importing.jsonl";
const FILE_LOCKED_ERROR_CODES = new Set(["EBUSY", "EPERM", "EACCES"]);

/**
 * Moves the journal aside, imports its snapshots into the database, then deletes it.
 * Moving it first lets the status line start a fresh journal during the import,
 * and keeps raw snapshots out of the journal once they are in the database.
 * A file left behind by an interrupted import is imported first.
 *
 * @param {string} journalPath
 * @param {LimitSnapshotsRepository} limitSnapshotsRepository
 * @returns {Promise<number>} Number of snapshots that were new to the database.
 */
export async function importJournal(journalPath, limitSnapshotsRepository) {
  const importingJournalPath = join(
    dirname(journalPath),
    IMPORTING_JOURNAL_FILE_NAME,
  );
  let importedSnapshotCount = 0;

  if (await isExistingFile(importingJournalPath)) {
    importedSnapshotCount += await importThenDeleteFile(
      importingJournalPath,
      limitSnapshotsRepository,
    );
  }

  const isJournalMoved = await moveJournalAside(
    journalPath,
    importingJournalPath,
  );
  if (isJournalMoved) {
    importedSnapshotCount += await importThenDeleteFile(
      importingJournalPath,
      limitSnapshotsRepository,
    );
  }

  return importedSnapshotCount;
}

/**
 * Deletes the journal and any file left by an interrupted import, so cleared snapshots never come back.
 *
 * @param {string} journalPath
 * @returns {Promise<void>}
 */
export async function discardJournalFiles(journalPath) {
  await Promise.all(
    [journalPath, join(dirname(journalPath), IMPORTING_JOURNAL_FILE_NAME)].map(
      (filePath) => rm(filePath, { force: true }),
    ),
  );
}

/**
 * @param {string} journalPath
 * @param {string} importingJournalPath
 * @returns {Promise<boolean>} `false` when there is no journal yet, or when the status line is writing it.
 */
async function moveJournalAside(journalPath, importingJournalPath) {
  try {
    await rename(journalPath, importingJournalPath);
    return true;
  } catch (error) {
    if (error.code === "ENOENT" || FILE_LOCKED_ERROR_CODES.has(error.code)) {
      return false;
    }
    throw error;
  }
}

/**
 * @param {string} filePath
 * @param {LimitSnapshotsRepository} limitSnapshotsRepository
 * @returns {Promise<number>}
 */
async function importThenDeleteFile(filePath, limitSnapshotsRepository) {
  const journalText = await readFile(filePath, "utf8");
  const journalLines = journalText
    .split("\n")
    .filter((journalLine) => journalLine.trim() !== "");

  const importedSnapshotCount = limitSnapshotsRepository.insertSnapshots(
    parseReadableJournalLines(journalLines),
  );
  await unlink(filePath);

  return importedSnapshotCount;
}

/**
 * @param {string} filePath
 * @returns {Promise<boolean>}
 */
async function isExistingFile(filePath) {
  try {
    return (await stat(filePath)).isFile();
  } catch (error) {
    if (error.code === "ENOENT") {
      return false;
    }
    throw error;
  }
}
