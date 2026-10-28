import logoGlyphSource from "../../resources/icon-glyph.svg?raw";

/**
 * The band draws its graphics as images, without knowing whether Claude shows
 * a light or a dark theme, so each colour reaches 3:1 on both.
 */
const ACCENT_COLOR = "#c06a1f";
const NEUTRAL_FILL_COLOR = "#8a7b6c";
const TRACK_COLOR = "rgba(138, 123, 108, 0.35)";

const BAR_HEIGHT_PX = 6;
export const LIMIT_BAR_WIDTH_PX = 44;
export const CONTEXT_BAR_WIDTH_PX = 36;
export const LOGO_SIZE_PX = 15;

/**
 * @typedef {"accent" | "neutral"} BarTone
 */

/**
 * A rounded gauge whose filled part never shrinks below a dot, so 0 % still shows.
 *
 * @param {object} bar
 * @param {number} bar.ratio From 0 to 1; clamped.
 * @param {number} bar.widthPx
 * @param {BarTone} bar.tone
 * @returns {string} SVG markup.
 */
export function buildBarSvg({ ratio, widthPx, tone }) {
  const clampedRatio = Math.min(Math.max(ratio, 0), 1);
  const filledWidthPx = Math.max(
    BAR_HEIGHT_PX,
    Math.round(clampedRatio * widthPx),
  );
  const fillColor = tone === "accent" ? ACCENT_COLOR : NEUTRAL_FILL_COLOR;
  const radiusPx = BAR_HEIGHT_PX / 2;

  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${widthPx}" height="${BAR_HEIGHT_PX}" viewBox="0 0 ${widthPx} ${BAR_HEIGHT_PX}">` +
    `<rect width="${widthPx}" height="${BAR_HEIGHT_PX}" rx="${radiusPx}" fill="${TRACK_COLOR}"/>` +
    `<rect width="${filledWidthPx}" height="${BAR_HEIGHT_PX}" rx="${radiusPx}" fill="${fillColor}"/>` +
    `</svg>`
  );
}

/**
 * @returns {string} The Atropos glyph in the accent colour, as SVG markup.
 */
export function buildLogoSvg() {
  return logoGlyphSource.replaceAll("currentColor", ACCENT_COLOR);
}

/**
 * The terminal draws no SVG: the same gauge in block characters.
 *
 * @param {number} ratio From 0 to 1; clamped.
 * @param {number} cellCount
 * @returns {{ filled: string, empty: string }}
 */
export function buildTerminalBarCells(ratio, cellCount) {
  const filledCellCount = Math.round(
    Math.min(Math.max(ratio, 0), 1) * cellCount,
  );
  return {
    filled: "━".repeat(filledCellCount),
    empty: "━".repeat(cellCount - filledCellCount),
  };
}
