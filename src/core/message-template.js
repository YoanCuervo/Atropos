import { MissingTemplateValueError } from "./errors.js";

const PLACEHOLDER_PATTERN = /\{(\w+)\}/g;

/**
 * Replaces each `{name}` of a translated message with its value,
 * e.g. "Resets {time}" and `{ time: "09:00" }` give "Resets 09:00".
 *
 * @param {string} messageTemplate
 * @param {Record<string, string | number>} [values]
 * @returns {string}
 * @throws {MissingTemplateValueError} When a placeholder has no value.
 */
export function fillMessageTemplate(messageTemplate, values = {}) {
  return messageTemplate.replace(
    PLACEHOLDER_PATTERN,
    (_placeholder, placeholderName) => {
      if (!Object.hasOwn(values, placeholderName)) {
        throw new MissingTemplateValueError(placeholderName);
      }
      return String(values[placeholderName]);
    },
  );
}
