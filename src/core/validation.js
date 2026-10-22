/**
 * @param {unknown} value
 * @returns {value is null | undefined}
 */
export function isMissing(value) {
  return value === undefined || value === null;
}

/**
 * @param {unknown} value
 * @returns {value is Record<string, unknown>}
 */
export function isPlainObject(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * @param {unknown} value
 * @returns {value is number}
 */
export function isNonNegativeFiniteNumber(value) {
  return typeof value === "number" && Number.isFinite(value) && value >= 0;
}

/**
 * @param {unknown} value
 * @returns {value is number}
 */
export function isPositiveFiniteNumber(value) {
  return typeof value === "number" && Number.isFinite(value) && value > 0;
}

/**
 * Tells whether a value is a timestamp written exactly as `Date.prototype.toISOString` writes it.
 *
 * @param {unknown} value
 * @returns {value is string}
 */
export function isIsoTimestamp(value) {
  if (typeof value !== "string") {
    return false;
  }
  const parsedDate = new Date(value);
  return (
    !Number.isNaN(parsedDate.getTime()) && parsedDate.toISOString() === value
  );
}
