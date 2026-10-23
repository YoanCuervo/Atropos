import { win32 } from "node:path";
import { describe, expect, it } from "vitest";
import { formatStatusLineSettings } from "./status-line-setup.js";

describe("formatStatusLineSettings", () => {
  it("runs the script with node, with forward slashes in its path", () => {
    const scriptPath = win32.join("C:", "Atropos", "statusline", "index.js");

    expect(JSON.parse(formatStatusLineSettings(["node", scriptPath]))).toEqual({
      statusLine: {
        type: "command",
        command: "node C:/Atropos/statusline/index.js",
        refreshInterval: 60,
      },
    });
  });

  it("runs the launcher shipped with the installed app on its own", () => {
    const launcherPath = win32.join(
      "C:",
      "Users",
      "someone",
      "AppData",
      "Local",
      "Programs",
      "atropos",
      "resources",
      "statusline",
      "atropos-statusline.cmd",
    );

    expect(
      JSON.parse(formatStatusLineSettings([launcherPath])).statusLine.command,
    ).toBe(
      "C:/Users/someone/AppData/Local/Programs/atropos/resources/statusline/atropos-statusline.cmd",
    );
  });

  it("quotes a path that contains spaces", () => {
    const scriptPath = win32.join("C:", "Program Files", "Atropos", "index.js");

    expect(
      JSON.parse(formatStatusLineSettings(["node", scriptPath])).statusLine
        .command,
    ).toBe('node "C:/Program Files/Atropos/index.js"');
  });
});
