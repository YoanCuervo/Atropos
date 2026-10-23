import { describe, expect, it } from "vitest";
import { InvalidSettingsChangeError } from "./errors.js";
import {
  DEFAULT_SETTINGS,
  applySettingsChange,
  parseSettingsChange,
  readStoredSettings,
} from "./settings.js";

describe("readStoredSettings", () => {
  it("reads valid settings", () => {
    const storedSettings = {
      language: "fr",
      theme: "dark",
      isWeeklyAlertEnabled: false,
      weeklyAlertThresholdPercentage: 65,
    };

    expect(readStoredSettings(storedSettings)).toEqual(storedSettings);
  });

  it("reads a file written before the alert settings existed", () => {
    expect(readStoredSettings({ language: "fr", theme: "dark" })).toEqual({
      ...DEFAULT_SETTINGS,
      language: "fr",
      theme: "dark",
    });
  });

  it.each([
    ["nothing was stored", undefined],
    ["the file holds an array", ["fr"]],
    ["the file holds a string", "dark"],
  ])("falls back to the defaults when %s", (_case, storedSettings) => {
    expect(readStoredSettings(storedSettings)).toEqual(DEFAULT_SETTINGS);
  });

  it("replaces only the invalid settings with their defaults", () => {
    expect(
      readStoredSettings({
        language: "de",
        theme: "light",
        isWeeklyAlertEnabled: "yes",
        weeklyAlertThresholdPercentage: 70,
      }),
    ).toEqual({
      language: "en",
      theme: "light",
      isWeeklyAlertEnabled: true,
      weeklyAlertThresholdPercentage: 70,
    });
  });

  it("drops unknown settings", () => {
    expect(readStoredSettings({ ...DEFAULT_SETTINGS, sessionId: "x" })).toEqual(
      DEFAULT_SETTINGS,
    );
  });
});

describe("parseSettingsChange", () => {
  it("accepts a change of one setting", () => {
    expect(parseSettingsChange({ theme: "light" })).toEqual({
      theme: "light",
    });
  });

  it.each([10, 80, 100])(
    "accepts a threshold of %i%",
    (thresholdPercentage) => {
      expect(
        parseSettingsChange({
          weeklyAlertThresholdPercentage: thresholdPercentage,
        }),
      ).toEqual({ weeklyAlertThresholdPercentage: thresholdPercentage });
    },
  );

  it("accepts a change of both settings", () => {
    expect(parseSettingsChange({ language: "fr", theme: "system" })).toEqual({
      language: "fr",
      theme: "system",
    });
  });

  it.each([
    ["a change that is not an object", null, "(change)"],
    ["an empty change", {}, "(change)"],
    ["an unknown setting", { journalPath: "elsewhere" }, "journalPath"],
    ["an inherited property name", { toString: "en" }, "toString"],
    ["an unsupported language", { language: "de" }, "language"],
    ["an unsupported theme", { theme: "sepia" }, "theme"],
    [
      "an alert switch that is not a boolean",
      { isWeeklyAlertEnabled: 1 },
      "isWeeklyAlertEnabled",
    ],
    [
      "a threshold below the minimum",
      { weeklyAlertThresholdPercentage: 5 },
      "weeklyAlertThresholdPercentage",
    ],
    [
      "a threshold above 100",
      { weeklyAlertThresholdPercentage: 150 },
      "weeklyAlertThresholdPercentage",
    ],
    [
      "a threshold that is not whole",
      { weeklyAlertThresholdPercentage: 80.5 },
      "weeklyAlertThresholdPercentage",
    ],
    [
      "a threshold written as text",
      { weeklyAlertThresholdPercentage: "80" },
      "weeklyAlertThresholdPercentage",
    ],
  ])("refuses %s", (_case, rawChange, expectedFieldPath) => {
    expect(() => parseSettingsChange(rawChange)).toThrow(
      expect.objectContaining({
        name: InvalidSettingsChangeError.name,
        fieldPath: expectedFieldPath,
      }),
    );
  });
});

describe("applySettingsChange", () => {
  it("changes only the given settings and leaves the original untouched", () => {
    const settings = { language: "en", theme: "system" };

    expect(applySettingsChange(settings, { language: "fr" })).toEqual({
      language: "fr",
      theme: "system",
    });
    expect(settings).toEqual({ language: "en", theme: "system" });
  });
});
