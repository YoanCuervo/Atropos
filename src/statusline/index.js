import { readRateLimits } from "../core/rate-limits.js";
import {
  createLimitSnapshots,
  formatJournalLine,
  parseReadableJournalLines,
  selectSnapshotsToRecord,
} from "../core/snapshot-journal.js";
import {
  UNREADABLE_LIMITS_TEXT,
  formatStatusText,
} from "../core/status-text.js";
import { computeSlotStartMs } from "../core/time-slots.js";
import {
  appendJournalLines,
  readRecentJournalLines,
  resolveJournalPath,
} from "./journal-file.js";
import { readStandardInput } from "./standard-input.js";

const STATUS_TEXT_LOCALE = "en-GB";

/** @typedef {import("../core/rate-limits.js").RateLimits} RateLimits */

/**
 * @typedef {{ isReadable: true, rateLimits: RateLimits | null } | { isReadable: false }} StatusLineInput
 */

/**
 * Entry point run by Claude Code: shows the limits, then records them.
 * It always exits with code 0 so Claude Code keeps showing the status line.
 *
 * @returns {Promise<void>}
 */
async function runStatusLine() {
  const statusLineInput = await readStatusLineInput();
  if (!statusLineInput.isReadable) {
    process.stdout.write(UNREADABLE_LIMITS_TEXT);
    return;
  }

  const { rateLimits } = statusLineInput;

  process.stdout.write(
    formatStatusText(rateLimits, {
      locale: STATUS_TEXT_LOCALE,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    }),
  );

  if (rateLimits === null) {
    return;
  }
  try {
    await recordSnapshots(rateLimits, Date.now());
  } catch (error) {
    process.stderr.write(`Atropos could not record limits: ${error.message}\n`);
  }
}

/**
 * Reads and decodes the payload Claude Code writes on the standard input.
 *
 * @returns {Promise<StatusLineInput>}
 */
async function readStatusLineInput() {
  try {
    const statusLinePayload = JSON.parse(await readStandardInput());
    return { isReadable: true, rateLimits: readRateLimits(statusLinePayload) };
  } catch {
    return { isReadable: false };
  }
}

/**
 * @param {RateLimits} rateLimits
 * @param {number} nowMs
 * @returns {Promise<void>}
 */
async function recordSnapshots(rateLimits, nowMs) {
  const journalPath = resolveJournalPath();
  const candidateSnapshots = createLimitSnapshots(
    rateLimits,
    computeSlotStartMs(nowMs),
  );
  const recordedSnapshots = parseReadableJournalLines(
    await readRecentJournalLines(journalPath),
  );
  const snapshotsToRecord = selectSnapshotsToRecord(
    candidateSnapshots,
    recordedSnapshots,
  );

  if (snapshotsToRecord.length > 0) {
    await appendJournalLines(
      journalPath,
      snapshotsToRecord.map(formatJournalLine),
    );
  }
}

await runStatusLine();
