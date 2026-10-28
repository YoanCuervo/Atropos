import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const TEXT_MINIMUM_RATIO = 4.5;
const GRAPHIC_MINIMUM_RATIO = 3;
const STATUS_PILL_BACKGROUND = "#141210";

/** Foreground token, background token, minimum ratio: every pair the interface draws. */
const TOKEN_PAIRS = [
  ["--color-text", "--color-background", TEXT_MINIMUM_RATIO],
  ["--color-text", "--color-surface", TEXT_MINIMUM_RATIO],
  ["--color-text-muted", "--color-background", TEXT_MINIMUM_RATIO],
  ["--color-text-muted", "--color-surface", TEXT_MINIMUM_RATIO],
  ["--color-accent", "--color-background", TEXT_MINIMUM_RATIO],
  ["--color-accent", "--color-surface", TEXT_MINIMUM_RATIO],
  ["--color-surface", "--color-text", TEXT_MINIMUM_RATIO],
  ["--color-surface", "--color-gauge-critical", TEXT_MINIMUM_RATIO],
  ["--color-gauge-critical", "--color-background", TEXT_MINIMUM_RATIO],
  ["--color-gauge-critical", "--color-surface", TEXT_MINIMUM_RATIO],
  ["--color-on-emphasis", "--color-emphasis", TEXT_MINIMUM_RATIO],
  ["--color-on-emphasis-muted", "--color-emphasis", TEXT_MINIMUM_RATIO],
  ["--color-on-emphasis-tile", "--color-emphasis-tile", TEXT_MINIMUM_RATIO],
  ["--color-emphasis-accent", "--color-emphasis", TEXT_MINIMUM_RATIO],
  ["--color-emphasis-accent", "--color-emphasis-tile", GRAPHIC_MINIMUM_RATIO],
  ["--color-gauge-comfortable", "--color-surface", TEXT_MINIMUM_RATIO],
  ["--color-gauge-warning", "--color-surface", TEXT_MINIMUM_RATIO],
  ["--color-gauge-comfortable", "--color-gauge-track", GRAPHIC_MINIMUM_RATIO],
  ["--color-gauge-warning", "--color-gauge-track", GRAPHIC_MINIMUM_RATIO],
  ["--color-gauge-critical", "--color-gauge-track", GRAPHIC_MINIMUM_RATIO],
  ["--color-control-border", "--color-surface", GRAPHIC_MINIMUM_RATIO],
  ["--color-control-border", "--color-background", GRAPHIC_MINIMUM_RATIO],
  ["--color-control-border", "--color-gauge-track", GRAPHIC_MINIMUM_RATIO],
  ["--color-focus", "--color-background", GRAPHIC_MINIMUM_RATIO],
  ["--color-focus", "--color-surface", GRAPHIC_MINIMUM_RATIO],
  ["--color-on-emphasis", "--color-emphasis", GRAPHIC_MINIMUM_RATIO],
  ["--color-chart-seven-day", "--color-surface", GRAPHIC_MINIMUM_RATIO],
  ["--color-chart-five-hour", "--color-surface", GRAPHIC_MINIMUM_RATIO],
];

/**
 * @param {string} hexColor "#rrggbb"
 * @returns {number}
 */
function computeRelativeLuminance(hexColor) {
  const [red, green, blue] = [1, 3, 5]
    .map((start) => parseInt(hexColor.slice(start, start + 2), 16) / 255)
    .map((channel) =>
      channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4,
    );
  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}

/**
 * @param {string} firstHexColor
 * @param {string} secondHexColor
 * @returns {number}
 */
function computeContrastRatio(firstHexColor, secondHexColor) {
  const [lighter, darker] = [firstHexColor, secondHexColor]
    .map(computeRelativeLuminance)
    .sort((first, second) => second - first);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * @param {string} cssBlock
 * @returns {Map<string, string>}
 */
function readColorTokens(cssBlock) {
  const tokens = new Map();
  for (const [, name, value] of cssBlock.matchAll(
    /(--color-[a-z-]+):\s*(#[0-9a-f]{6});/g,
  )) {
    tokens.set(name, value);
  }
  return tokens;
}

/**
 * The light tokens are in the first `:root` block, the dark ones in the
 * `prefers-color-scheme: dark` block.
 *
 * @returns {{ light: Map<string, string>, dark: Map<string, string> }}
 */
function readThemeTokens() {
  const css = readFileSync(
    fileURLToPath(new URL("./app.css", import.meta.url)),
    "utf8",
  );
  const darkStart = css.indexOf("@media (prefers-color-scheme: dark)");
  const lightBlock = css.slice(css.indexOf(":root {"), darkStart);
  const darkBlock = css.slice(darkStart, css.indexOf("\n}\n", darkStart));
  return {
    light: readColorTokens(lightBlock),
    dark: readColorTokens(darkBlock),
  };
}

const themeTokens = readThemeTokens();

describe.each(Object.entries(themeTokens))("%s theme", (themeName, tokens) => {
  it("defines every token used in a checked pair", () => {
    const tokenNames = TOKEN_PAIRS.flatMap(([foreground, background]) => [
      foreground,
      background,
    ]);
    expect(tokenNames.filter((name) => !tokens.has(name))).toEqual([]);
  });

  it.each(TOKEN_PAIRS)(
    "%s on %s reaches %s:1",
    (foreground, background, minimumRatio) => {
      const ratio = computeContrastRatio(
        tokens.get(foreground),
        tokens.get(background),
      );
      expect(ratio).toBeGreaterThanOrEqual(minimumRatio);
    },
  );
});

describe("status pill inside the main card", () => {
  it.each([
    "--color-gauge-comfortable",
    "--color-gauge-warning",
    "--color-gauge-critical",
  ])("dark %s on onyx reaches 4.5:1", (stateToken) => {
    const ratio = computeContrastRatio(
      themeTokens.dark.get(stateToken),
      STATUS_PILL_BACKGROUND,
    );
    expect(ratio).toBeGreaterThanOrEqual(TEXT_MINIMUM_RATIO);
  });
});
