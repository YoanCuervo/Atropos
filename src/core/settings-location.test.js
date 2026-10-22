import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { buildSettingsPath } from "./settings-location.js";

describe("buildSettingsPath", () => {
  it("places the settings in the Atropos folder of the application data", () => {
    const applicationDataPath = join("C:", "Users", "someone", "AppData");

    expect(buildSettingsPath(applicationDataPath)).toBe(
      join(applicationDataPath, "Atropos", "settings.json"),
    );
  });
});
