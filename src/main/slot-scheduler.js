import { powerMonitor } from "electron";
import { computeNextSlotStartMs } from "../core/time-slots.js";

// Windows timers can fire a few milliseconds early: waiting slightly past the
// slot start guarantees the task runs inside the new slot.
const SLOT_START_MARGIN_MS = 1000;

/**
 * @typedef {object} SlotScheduler
 * @property {() => Promise<void>} runNow Runs the task immediately, unless it is already running.
 * @property {() => void} stop Cancels the next run and stops reacting to the computer waking up.
 */

/**
 * Runs a task at the start of every six-minute slot (:00, :06, :12…),
 * and right away when the computer wakes up from sleep.
 * A run is skipped when the previous one has not finished yet.
 *
 * @param {() => Promise<void>} slotTask
 * @returns {SlotScheduler}
 */
export function startSlotScheduler(slotTask) {
  let nextRunTimeout;
  let isTaskRunning = false;

  async function runNow() {
    if (isTaskRunning) {
      return;
    }
    isTaskRunning = true;
    try {
      await slotTask();
    } catch (error) {
      console.error("Atropos slot task failed:", error);
    } finally {
      isTaskRunning = false;
    }
  }

  function scheduleNextRun() {
    const nowMs = Date.now();
    const delayMs =
      computeNextSlotStartMs(nowMs) - nowMs + SLOT_START_MARGIN_MS;
    nextRunTimeout = setTimeout(async () => {
      await runNow();
      scheduleNextRun();
    }, delayMs);
  }

  function handleComputerWakeUp() {
    clearTimeout(nextRunTimeout);
    runNow();
    scheduleNextRun();
  }

  powerMonitor.on("resume", handleComputerWakeUp);
  scheduleNextRun();

  return {
    runNow,
    stop() {
      clearTimeout(nextRunTimeout);
      powerMonitor.off("resume", handleComputerWakeUp);
    },
  };
}
