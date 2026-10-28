import { InvalidRateLimitsError } from "./errors.js";
import { WINDOW_KINDS } from "./rate-limits.js";
import {
  isIsoTimestamp,
  isNonNegativeFiniteNumber,
  isPlainObject,
} from "./validation.js";

/** @typedef {import("./rate-limits.js").RateLimits} RateLimits */
/** @typedef {import("./rate-limits.js").LimitWindow} LimitWindow */
/** @typedef {import("./rate-limits.js").WindowKind} WindowKind */

/**
 * One rate-limit window as the Claude Code mods API reports it.
 *
 * @typedef {object} SessionRateLimit
 * @property {string} kind e.g. "five_hour", "seven_day" or a gateway's "spend_limit".
 * @property {number} percentUsed From 0 to 100.
 * @property {string} [resetsAt] ISO 8601 timestamp.
 */

/**
 * Reads the usage limits that `$.session.usage()` and `session.measure` give a mod,
 * into the shape the status line produces. Windows other than the five-hour and
 * weekly ones are ignored.
 *
 * @param {unknown} sessionRateLimits The `rateLimits` list of the mods API.
 * @returns {RateLimits | null} `null` when neither window has a complete reading yet.
 * @throws {InvalidRateLimitsError} When the list or one of its known windows is malformed.
 */
export function readSessionRateLimits(sessionRateLimits) {
  if (!Array.isArray(sessionRateLimits)) {
    throw new InvalidRateLimitsError("rateLimits", sessionRateLimits);
  }

  const [fiveHour, sevenDay] = WINDOW_KINDS.map((windowKind) =>
    readSessionLimitWindow(sessionRateLimits, windowKind),
  );
  return fiveHour === null && sevenDay === null ? null : { fiveHour, sevenDay };
}

/**
 * @param {unknown[]} sessionRateLimits
 * @param {WindowKind} windowKind
 * @returns {LimitWindow | null} `null` when the window is absent or has no reset time yet.
 */
function readSessionLimitWindow(sessionRateLimits, windowKind) {
  const windowPath = `rateLimits.${windowKind}`;
  const rawWindow = sessionRateLimits.find(
    (candidate) => isPlainObject(candidate) && candidate.kind === windowKind,
  );

  if (rawWindow === undefined || rawWindow.resetsAt === undefined) {
    return null;
  }
  if (!isNonNegativeFiniteNumber(rawWindow.percentUsed)) {
    throw new InvalidRateLimitsError(
      `${windowPath}.percentUsed`,
      rawWindow.percentUsed,
    );
  }
  if (!isIsoTimestamp(rawWindow.resetsAt)) {
    throw new InvalidRateLimitsError(
      `${windowPath}.resetsAt`,
      rawWindow.resetsAt,
    );
  }

  return {
    windowKind,
    usedPercentage: rawWindow.percentUsed,
    resetsAtMs: Date.parse(rawWindow.resetsAt),
  };
}
