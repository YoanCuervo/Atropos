import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  buildLegacySettingsPath,
  buildSettingsPath,
} from "./settings-location.js";

const homePath = join("C:", "Users", "someone");

describe("buildSettingsPath", () => {
  it("places the settings in the shared folder", () => {
    expect(buildSettingsPath(homePath)).toBe(
      join(homePath, ".atropos", "settings.json"),
    );
  });
});

describe("buildLegacySettingsPath", () => {
  it("places the old settings in the Atropos folder of the application data", () => {
    const applicationDataPath = join(homePath, "AppData", "Roaming");

    expect(buildLegacySettingsPath(applicationDataPath)).toBe(
      join(applicationDataPath, "Atropos", "settings.json"),
    );
  });
});
