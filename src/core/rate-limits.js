import { InvalidRateLimitsError } from "./errors.js";
import {
  isMissing,
  isNonNegativeFiniteNumber,
  isPlainObject,
  isPositiveFiniteNumber,
} from "./validation.js";

/** @typedef {"five_hour" | "seven_day"} WindowKind */

/**
 * @typedef {object} LimitWindow
 * @property {WindowKind} windowKind
 * @property {number} usedPercentage Share of the window already used, from 0 to 100.
 * @property {number} resetsAtMs Unix timestamp, in milliseconds, when the window resets.
 */

/**
 * @typedef {object} RateLimits
 * @property {LimitWindow | null} fiveHour
 * @property {LimitWindow | null} sevenDay
 */

const MILLISECONDS_PER_SECOND = 1000;

/**
 * Reads the usage limits from the JSON payload Claude Code sends to its status line.
 * Only the limit fields are read: session id, working directory and transcript path never leave this function.
 *
 * @param {unknown} statusLinePayload Payload already parsed from JSON.
 * @returns {RateLimits | null} `null` when the payload carries no rate limits.
 * @throws {InvalidRateLimitsError} When the payload or its rate limits are malformed.
 */
export function readRateLimits(statusLinePayload) {
  if (!isPlainObject(statusLinePayload)) {
    throw new InvalidRateLimitsError("(payload)", statusLinePayload);
  }

  const rawRateLimits = statusLinePayload.rate_limits;
  if (isMissing(rawRateLimits)) {
    return null;
  }
  if (!isPlainObject(rawRateLimits)) {
    throw new InvalidRateLimitsError("rate_limits", rawRateLimits);
  }

  return {
    fiveHour: readLimitWindow(rawRateLimits, "five_hour"),
    sevenDay: readLimitWindow(rawRateLimits, "seven_day"),
  };
}

/**
 * @param {Record<string, unknown>} rawRateLimits
 * @param {WindowKind} windowKind
 * @returns {LimitWindow | null}
 */
function readLimitWindow(rawRateLimits, windowKind) {
  const windowPath = `rate_limits.${windowKind}`;
  const rawWindow = rawRateLimits[windowKind];

  if (isMissing(rawWindow)) {
    return null;
  }
  if (!isPlainObject(rawWindow)) {
    throw new InvalidRateLimitsError(windowPath, rawWindow);
  }

  const usedPercentage = rawWindow.used_percentage;
  if (!isNonNegativeFiniteNumber(usedPercentage)) {
    throw new InvalidRateLimitsError(
      `${windowPath}.used_percentage`,
      usedPercentage,
    );
  }

  const resetsAtSeconds = rawWindow.resets_at;
  if (!isPositiveFiniteNumber(resetsAtSeconds)) {
    throw new InvalidRateLimitsError(
      `${windowPath}.resets_at`,
      resetsAtSeconds,
    );
  }

  return {
    windowKind,
    usedPercentage,
    resetsAtMs: resetsAtSeconds * MILLISECONDS_PER_SECOND,
  };
}
