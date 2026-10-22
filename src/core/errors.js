export class InvalidRateLimitsError extends Error {
  /**
   * @param {string} fieldPath Path of the malformed field, e.g. "rate_limits.five_hour.resets_at".
   * @param {unknown} receivedValue Value found at that path.
   */
  constructor(fieldPath, receivedValue) {
    super(
      `Invalid rate limits field "${fieldPath}": received ${JSON.stringify(receivedValue)}.`,
    );
    this.name = "InvalidRateLimitsError";
    this.fieldPath = fieldPath;
  }
}
