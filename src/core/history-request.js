import { InvalidHistoryRequestError } from "./errors.js";
import { WINDOW_KINDS } from "./rate-limits.js";
import { isPlainObject } from "./validation.js";

/** @typedef {import("./rate-limits.js").WindowKind} WindowKind */

/**
 * @typedef {object} HistoryRequest
 * @property {WindowKind} windowKind
 * @property {number} periodDayCount Number of days of history, one of `HISTORY_PERIOD_DAY_COUNTS`.
 */

/** @type {readonly number[]} */
export const HISTORY_PERIOD_DAY_COUNTS = Object.freeze([7, 30]);

const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;

/**
 * Checks a history request coming from the interface, which is never trusted as is.
 *
 * @param {unknown} rawRequest
 * @returns {HistoryRequest} A new object holding only the two expected fields.
 * @throws {InvalidHistoryRequestError} When the window kind or the period is not supported.
 */
export function parseHistoryRequest(rawRequest) {
  if (!isPlainObject(rawRequest)) {
    throw new InvalidHistoryRequestError("(request)", rawRequest);
  }

  const { windowKind, periodDayCount } = rawRequest;
  if (!WINDOW_KINDS.includes(windowKind)) {
    throw new InvalidHistoryRequestError("windowKind", windowKind);
  }
  if (!HISTORY_PERIOD_DAY_COUNTS.includes(periodDayCount)) {
    throw new InvalidHistoryRequestError("periodDayCount", periodDayCount);
  }

  return { windowKind, periodDayCount };
}

/**
 * @param {number} nowMs Unix timestamp, in milliseconds.
 * @param {number} periodDayCount
 * @returns {number} Unix timestamp, in milliseconds, of the start of the period.
 */
export function computeHistoryStartMs(nowMs, periodDayCount) {
  return nowMs - periodDayCount * MILLISECONDS_PER_DAY;
}
