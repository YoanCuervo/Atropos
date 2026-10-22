/**
 * Base class of the errors raised when received data has a malformed field.
 */
class InvalidFieldError extends Error {
  /**
   * @param {string} subject What was being read, e.g. "rate limits".
   * @param {string} fieldPath Path of the malformed field, or a parenthesized name for the whole value.
   * @param {unknown} receivedValue Value found at that path.
   */
  constructor(subject, fieldPath, receivedValue) {
    super(
      `Invalid ${subject} field "${fieldPath}": received ${JSON.stringify(receivedValue)}.`,
    );
    this.fieldPath = fieldPath;
  }
}

export class InvalidRateLimitsError extends InvalidFieldError {
  /**
   * @param {string} fieldPath e.g. "rate_limits.five_hour.resets_at", or "(payload)".
   * @param {unknown} receivedValue
   */
  constructor(fieldPath, receivedValue) {
    super("rate limits", fieldPath, receivedValue);
    this.name = "InvalidRateLimitsError";
  }
}

export class InvalidJournalLineError extends InvalidFieldError {
  /**
   * @param {string} fieldPath e.g. "resetsAt", or "(line)" when the whole line is unreadable.
   * @param {unknown} receivedValue
   */
  constructor(fieldPath, receivedValue) {
    super("journal line", fieldPath, receivedValue);
    this.name = "InvalidJournalLineError";
  }
}

export class InvalidHistoryRequestError extends InvalidFieldError {
  /**
   * @param {string} fieldPath e.g. "periodDayCount", or "(request)" when the whole request is unusable.
   * @param {unknown} receivedValue
   */
  constructor(fieldPath, receivedValue) {
    super("history request", fieldPath, receivedValue);
    this.name = "InvalidHistoryRequestError";
  }
}

export class InvalidSettingsChangeError extends InvalidFieldError {
  /**
   * @param {string} fieldPath e.g. "theme", or "(change)" when the whole change is unusable.
   * @param {unknown} receivedValue
   */
  constructor(fieldPath, receivedValue) {
    super("settings change", fieldPath, receivedValue);
    this.name = "InvalidSettingsChangeError";
  }
}

export class MissingTemplateValueError extends Error {
  /**
   * @param {string} placeholderName Name of the placeholder that received no value, e.g. "percentage".
   */
  constructor(placeholderName) {
    super(`No value given for the message placeholder "{${placeholderName}}".`);
    this.name = "MissingTemplateValueError";
    this.placeholderName = placeholderName;
  }
}
