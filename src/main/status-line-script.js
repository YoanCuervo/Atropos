import { app } from "electron";
import { join } from "path";

/**
 * The command Claude Code runs for the status line. Once installed, it is the launcher
 * shipped next to the app, which runs the bundled script with the Node.js built into
 * Atropos.exe. While developing, it is the script of the repository, run by Node.js.
 *
 * @returns {string[]} Program then arguments.
 */
export function resolveStatusLineCommandParts() {
  if (app.isPackaged) {
    return [
      join(process.resourcesPath, "statusline", "atropos-statusline.cmd"),
    ];
  }
  return ["node", join(app.getAppPath(), "src", "statusline", "index.js")];
}
