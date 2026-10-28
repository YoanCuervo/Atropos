/**
 * @typedef {object} RingStroke
 * @property {number} circumference Length of the whole circle, for `stroke-dasharray`.
 * @property {number} dashOffset Length left unpainted, for `stroke-dashoffset`.
 */

/**
 * Paints a share of a circle drawn as an SVG stroke.
 *
 * @param {number} ratio Share to paint, clamped between 0 and 1.
 * @param {number} radius Radius of the circle, in SVG units.
 * @returns {RingStroke}
 */
export function computeRingStroke(ratio, radius) {
  const circumference = 2 * Math.PI * radius;
  const paintedRatio = Math.min(Math.max(ratio, 0), 1);
  return { circumference, dashOffset: circumference * (1 - paintedRatio) };
}
