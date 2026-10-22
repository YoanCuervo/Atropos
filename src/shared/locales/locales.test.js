import { describe, expect, it } from "vitest";
import { LANGUAGES } from "../../core/settings.js";
import { formatTrayTooltip } from "../../core/tray-text.js";
import en from "./en.js";
import { MESSAGES_BY_LANGUAGE, getMessages } from "./index.js";

const WINDOWS_TRAY_TOOLTIP_MAX_LENGTH = 127;
const PLACEHOLDER_PATTERN = /\{(\w+)\}/g;

/**
 * @param {object} messages
 * @param {string} [keyPrefix]
 * @returns {[string, string][]} Every text with its dotted key, e.g. ["tray.quit", "Quit"].
 */
function listMessageEntries(messages, keyPrefix = "") {
  return Object.entries(messages).flatMap(([key, value]) =>
    typeof value === "string"
      ? [[`${keyPrefix}${key}`, value]]
      : listMessageEntries(value, `${keyPrefix}${key}.`),
  );
}

/**
 * @param {string} messageTemplate
 * @returns {string[]}
 */
function listPlaceholders(messageTemplate) {
  return [...messageTemplate.matchAll(PLACEHOLDER_PATTERN)]
    .map(([, placeholderName]) => placeholderName)
    .sort();
}

describe("locales", () => {
  it("cover every supported language", () => {
    expect(Object.keys(MESSAGES_BY_LANGUAGE).sort()).toEqual(
      [...LANGUAGES].sort(),
    );
  });

  it.each(LANGUAGES)(
    "%s has the same keys and placeholders as English",
    (language) => {
      const englishEntries = listMessageEntries(en);
      const translatedEntries = new Map(
        listMessageEntries(MESSAGES_BY_LANGUAGE[language]),
      );

      expect([...translatedEntries.keys()].sort()).toEqual(
        englishEntries.map(([key]) => key).sort(),
      );
      for (const [key, englishText] of englishEntries) {
        expect(listPlaceholders(translatedEntries.get(key)), key).toEqual(
          listPlaceholders(englishText),
        );
      }
    },
  );

  it.each(LANGUAGES)(
    "%s keeps the tray tooltip within what Windows allows",
    (language) => {
      const messages = getMessages(language);
      const longestSnapshot = {
        slotStartedAt: "2026-10-22T12:06:00.000Z",
        windowKind: "seven_day",
        usedPercentage: 100,
        resetsAt: "2026-10-28T08:00:00.000Z",
      };

      expect(
        formatTrayTooltip(longestSnapshot, messages.tray, {
          locale: messages.dateLocale,
          timeZone: "Europe/Paris",
        }).length,
      ).toBeLessThanOrEqual(WINDOWS_TRAY_TOOLTIP_MAX_LENGTH);
    },
  );

  it("falls back to English for an unknown language", () => {
    expect(getMessages("de")).toBe(en);
  });
});
