import { fillMessageTemplate } from "./message-template.js";

const MILLISECONDS_PER_MINUTE = 60 * 1000;
const MINUTES_PER_HOUR = 60;
const HOURS_PER_DAY = 24;
const TOKENS_PER_THOUSAND = 1000;
const MODEL_FAMILY_NAMES = Object.freeze(["Opus", "Sonnet", "Haiku", "Fable"]);

/**
 * @typedef {object} RemainingTimeMessages
 * @property {string} remainingMinutes e.g. "{minutes}m".
 * @property {string} remainingHours e.g. "{hours}h{minutes}".
 * @property {string} remainingDays e.g. "{days}d {hours}h".
 */

/**
 * Writes the time left before a window resets, as precisely as the band has room for.
 *
 * @param {number} remainingMs Negative once the window has reset.
 * @param {RemainingTimeMessages} remainingTimeMessages Texts of the chosen language.
 * @returns {string} e.g. "45m", "3h05" or "1d 4h".
 */
export function formatRemainingTime(remainingMs, remainingTimeMessages) {
  const totalMinutes = Math.max(
    Math.floor(remainingMs / MILLISECONDS_PER_MINUTE),
    0,
  );
  const totalHours = Math.floor(totalMinutes / MINUTES_PER_HOUR);

  if (totalHours === 0) {
    return fillMessageTemplate(remainingTimeMessages.remainingMinutes, {
      minutes: totalMinutes,
    });
  }
  if (totalHours < HOURS_PER_DAY) {
    return fillMessageTemplate(remainingTimeMessages.remainingHours, {
      hours: totalHours,
      minutes: String(totalMinutes % MINUTES_PER_HOUR).padStart(2, "0"),
    });
  }
  return fillMessageTemplate(remainingTimeMessages.remainingDays, {
    days: Math.floor(totalHours / HOURS_PER_DAY),
    hours: totalHours % HOURS_PER_DAY,
  });
}

/**
 * @param {number} percentage From 0 to 100.
 * @param {string} locale e.g. "fr-FR".
 * @returns {string} e.g. "36%" or "36 %".
 */
export function formatWholePercentage(percentage, locale) {
  return new Intl.NumberFormat(locale, {
    style: "percent",
    maximumFractionDigits: 0,
  }).format(percentage / 100);
}

/**
 * The sign is always written, so the pace is never told by colour alone.
 *
 * @param {number} percentagePoints e.g. 3.8 or -12.
 * @param {string} locale
 * @returns {string} e.g. "+3.8%" or "-12.0%".
 */
export function formatSignedPercentage(percentagePoints, locale) {
  return new Intl.NumberFormat(locale, {
    style: "percent",
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
    signDisplay: "exceptZero",
  }).format(percentagePoints / 100);
}

/**
 * @param {number} tokenCount
 * @returns {string} e.g. "72k", or "850" under a thousand.
 */
export function formatTokenCount(tokenCount) {
  return tokenCount >= TOKENS_PER_THOUSAND
    ? `${Math.round(tokenCount / TOKENS_PER_THOUSAND)}k`
    : String(tokenCount);
}

/**
 * @param {string} modelId e.g. "claude-opus-5-5".
 * @returns {string} The family name, e.g. "Opus", or the identifier itself when no family matches.
 */
export function formatModelFamilyName(modelId) {
  const lowerCaseModelId = modelId.toLowerCase();
  return (
    MODEL_FAMILY_NAMES.find((familyName) =>
      lowerCaseModelId.includes(familyName.toLowerCase()),
    ) ?? modelId
  );
}
