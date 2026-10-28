export const SLOT_DURATION_MS = 6 * 60 * 1000;

/**
 * Returns the start of the six-minute slot that contains a timestamp.
 * Slots are aligned on the clock: :00, :06, :12 and so on, ten per hour.
 *
 * @param {number} timestampMs Unix timestamp, in milliseconds.
 * @returns {number} Unix timestamp, in milliseconds, of the slot start.
 */
export function computeSlotStartMs(timestampMs) {
  return Math.floor(timestampMs / SLOT_DURATION_MS) * SLOT_DURATION_MS;
}

/**
 * Returns the start of the slot that follows the one containing a timestamp.
 *
 * @param {number} timestampMs Unix timestamp, in milliseconds.
 * @returns {number} Unix timestamp, in milliseconds, of the next slot start.
 */
export function computeNextSlotStartMs(timestampMs) {
  return computeSlotStartMs(timestampMs) + SLOT_DURATION_MS;
}
