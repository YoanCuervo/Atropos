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

export class InvalidJournalLineError extends Error {
  /**
   * @param {string} fieldPath Name of the malformed field, or "(line)" when the whole line is unreadable.
   * @param {unknown} receivedValue Value found for that field.
   */
  constructor(fieldPath, receivedValue) {
    super(
      `Invalid journal line field "${fieldPath}": received ${JSON.stringify(receivedValue)}.`,
    );
    this.name = "InvalidJournalLineError";
    this.fieldPath = fieldPath;
  }
}
