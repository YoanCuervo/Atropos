import { posix, win32 } from "node:path";

export const STATUS_LINE_REFRESH_INTERVAL_SECONDS = 60;

/**
 * Writes the `statusLine` block the user pastes into `~/.claude/settings.json`.
 * Atropos never writes that file itself: the user stays in control of Claude Code.
 *
 * @param {string[]} commandParts Program then arguments, paths as Windows writes them,
 *   e.g. `["node", "C:\Atropos\index.js"]`.
 * @returns {string} Pretty-printed JSON, e.g. `{ "statusLine": { "type": "command", ... } }`.
 */
export function formatStatusLineSettings(commandParts) {
  return JSON.stringify(
    {
      statusLine: {
        type: "command",
        command: commandParts.map(formatCommandPart).join(" "),
        refreshInterval: STATUS_LINE_REFRESH_INTERVAL_SECONDS,
      },
    },
    null,
    2,
  );
}

/**
 * Forward slashes work in both cmd and the Git Bash that Claude Code may use on Windows.
 *
 * @param {string} commandPart
 * @returns {string}
 */
function formatCommandPart(commandPart) {
  const portableCommandPart = commandPart.split(win32.sep).join(posix.sep);
  return portableCommandPart.includes(" ")
    ? `"${portableCommandPart}"`
    : portableCommandPart;
}
