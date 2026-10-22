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
    expect(readStoredSettings({ language: "fr", theme: "dark" })).toEqual({
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
    expect(readStoredSettings({ language: "de", theme: "light" })).toEqual({
      language: "en",
      theme: "light",
    });
  });

  it("drops unknown settings", () => {
    expect(
      readStoredSettings({ language: "fr", theme: "dark", sessionId: "x" }),
    ).toEqual({ language: "fr", theme: "dark" });
  });
});

describe("parseSettingsChange", () => {
  it("accepts a change of one setting", () => {
    expect(parseSettingsChange({ theme: "light" })).toEqual({
      theme: "light",
    });
  });

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
