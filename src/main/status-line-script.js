import { app } from "electron";
import { join } from "path";

/**
 * Locates the status line script that Claude Code should run.
 * While developing it is the script of the repository; shipping it with the installer is part of packaging.
 *
 * @returns {string}
 */
export function resolveStatusLineScriptPath() {
  return join(app.getAppPath(), "src", "statusline", "index.js");
}
