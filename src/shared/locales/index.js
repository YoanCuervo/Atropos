import en from "./en.js";
import fr from "./fr.js";

/** @typedef {typeof en} Messages */

/** @type {Readonly<Record<import("../../core/settings.js").Language, Messages>>} */
export const MESSAGES_BY_LANGUAGE = Object.freeze({ en, fr });

/**
 * @param {import("../../core/settings.js").Language} language
 * @returns {Messages}
 */
export function getMessages(language) {
  return MESSAGES_BY_LANGUAGE[language] ?? en;
}
