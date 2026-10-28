import { InvalidJournalLineError } from "./errors.js";
import { WINDOW_KINDS } from "./rate-limits.js";
import {
  isIsoTimestamp,
  isNonNegativeFiniteNumber,
  isPlainObject,
} from "./validation.js";

/** @typedef {import("./rate-limits.js").RateLimits} RateLimits */
/** @typedef {import("./rate-limits.js").WindowKind} WindowKind */

/**
 * One line of the `limit-snapshots.jsonl` journal: the state of one limit window during one slot.
 *
 * @typedef {object} LimitSnapshot
 * @property {string} slotStartedAt ISO 8601 UTC start of the six-minute slot.
 * @property {WindowKind} windowKind
 * @property {number} usedPercentage Share of the window already used, from 0 to 100.
 * @property {string} resetsAt ISO 8601 UTC time when the window resets.
 */

/**
 * Turns the rate limits read during a slot into one snapshot per window present.
 *
 * @param {RateLimits} rateLimits Result of `readRateLimits`.
 * @param {number} slotStartMs Start of the slot, as returned by `computeSlotStartMs`.
 * @returns {LimitSnapshot[]} Empty when no window is present.
 */
export function createLimitSnapshots(rateLimits, slotStartMs) {
  const slotStartedAt = new Date(slotStartMs).toISOString();

  return [rateLimits.fiveHour, rateLimits.sevenDay]
    .filter((limitWindow) => limitWindow !== null)
    .map((limitWindow) => ({
      slotStartedAt,
      windowKind: limitWindow.windowKind,
      usedPercentage: limitWindow.usedPercentage,
      resetsAt: new Date(limitWindow.resetsAtMs).toISOString(),
    }));
}

/**
 * Writes a snapshot as a journal line, newline included, ready to be appended.
 * Fields are always written in the same order, and nothing else is written.
 *
 * @param {LimitSnapshot} limitSnapshot
 * @returns {string}
 */
export function formatJournalLine(limitSnapshot) {
  const { slotStartedAt, windowKind, usedPercentage, resetsAt } = limitSnapshot;
  const journalEntry = { slotStartedAt, windowKind, usedPercentage, resetsAt };

  return `${JSON.stringify(journalEntry)}\n`;
}

/**
 * Reads back a journal line written by `formatJournalLine`.
 *
 * @param {string} journalLine One line of the journal, with or without its newline.
 * @returns {LimitSnapshot}
 * @throws {InvalidJournalLineError} When the line is not valid JSON or a field is malformed.
 */
export function parseJournalLine(journalLine) {
  const journalEntry = parseJson(journalLine);
  if (!isPlainObject(journalEntry)) {
    throw new InvalidJournalLineError("(line)", journalLine);
  }

  const { slotStartedAt, windowKind, usedPercentage, resetsAt } = journalEntry;

  if (!isIsoTimestamp(slotStartedAt)) {
    throw new InvalidJournalLineError("slotStartedAt", slotStartedAt);
  }
  if (!WINDOW_KINDS.includes(windowKind)) {
    throw new InvalidJournalLineError("windowKind", windowKind);
  }
  if (!isNonNegativeFiniteNumber(usedPercentage)) {
    throw new InvalidJournalLineError("usedPercentage", usedPercentage);
  }
  if (!isIsoTimestamp(resetsAt)) {
    throw new InvalidJournalLineError("resetsAt", resetsAt);
  }

  return { slotStartedAt, windowKind, usedPercentage, resetsAt };
}

/**
 * @param {string} journalLine
 * @returns {unknown}
 * @throws {InvalidJournalLineError}
 */
function parseJson(journalLine) {
  try {
    return JSON.parse(journalLine);
  } catch {
    throw new InvalidJournalLineError("(line)", journalLine);
  }
}

/**
 * Reads journal lines back into snapshots, skipping the lines that cannot be read.
 * A single damaged line must not prevent the rest of the journal from being used.
 *
 * @param {string[]} journalLines
 * @returns {LimitSnapshot[]}
 */
export function parseReadableJournalLines(journalLines) {
  return journalLines.flatMap((journalLine) => {
    try {
      return [parseJournalLine(journalLine)];
    } catch (error) {
      if (error instanceof InvalidJournalLineError) {
        return [];
      }
      throw error;
    }
  });
}

/**
 * @param {(LimitSnapshot | null)[]} limitSnapshots Missing windows are `null`.
 * @returns {LimitSnapshot | null} The snapshot taken in the most recent slot, or `null` when there is none.
 */
export function findLatestSnapshot(limitSnapshots) {
  return limitSnapshots.reduce(
    (latest, candidate) =>
      candidate !== null &&
      (latest === null || candidate.slotStartedAt > latest.slotStartedAt)
        ? candidate
        : latest,
    null,
  );
}

/**
 * Keeps the candidate snapshots whose slot and window are not recorded yet,
 * so the journal holds at most one snapshot per slot and per window: the first one observed.
 *
 * @param {LimitSnapshot[]} candidateSnapshots Snapshots of the current slot.
 * @param {LimitSnapshot[]} recordedSnapshots Snapshots already in the journal.
 * @returns {LimitSnapshot[]}
 */
export function selectSnapshotsToRecord(candidateSnapshots, recordedSnapshots) {
  const recordedSnapshotKeys = new Set(
    recordedSnapshots.map(createSnapshotKey),
  );

  return candidateSnapshots.filter(
    (candidateSnapshot) =>
      !recordedSnapshotKeys.has(createSnapshotKey(candidateSnapshot)),
  );
}

/**
 * @param {LimitSnapshot} limitSnapshot
 * @returns {string}
 */
function createSnapshotKey(limitSnapshot) {
  return `${limitSnapshot.slotStartedAt}|${limitSnapshot.windowKind}`;
}
