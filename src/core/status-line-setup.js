import { posix, win32 } from "node:path";

export const STATUS_LINE_REFRESH_INTERVAL_SECONDS = 60;

/**
 * Writes the `statusLine` block the user pastes into `~/.claude/settings.json`.
 * Atropos never writes that file itself: the user stays in control of Claude Code.
 *
 * @param {string} scriptPath Absolute path of the status line script, as Windows writes it.
 * @returns {string} Pretty-printed JSON, e.g. `{ "statusLine": { "type": "command", ... } }`.
 */
export function formatStatusLineSettings(scriptPath) {
  const portableScriptPath = scriptPath.split(win32.sep).join(posix.sep);
  const quotedScriptPath = portableScriptPath.includes(" ")
    ? `"${portableScriptPath}"`
    : portableScriptPath;

  return JSON.stringify(
    {
      statusLine: {
        type: "command",
        command: `node ${quotedScriptPath}`,
        refreshInterval: STATUS_LINE_REFRESH_INTERVAL_SECONDS,
      },
    },
    null,
    2,
  );
}
