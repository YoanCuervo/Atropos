import { watch } from "node:fs";
import { basename, dirname } from "node:path";

// The mod and the status line append a few lines in a row: waiting a moment
// imports them together instead of once per line.
const JOURNAL_SETTLE_DELAY_MS = 1000;

/**
 * @typedef {object} JournalWatcher
 * @property {() => void} stop Stops watching and cancels a pending call.
 */

/**
 * Calls back shortly after the journal changes, so a snapshot written by the mod or the
 * status line shows up right away instead of at the next six-minute slot.
 * The folder is watched rather than the file, because the import moves the journal aside.
 *
 * @param {string} journalPath
 * @param {() => void} onJournalChanged
 * @returns {JournalWatcher}
 */
export function watchJournal(journalPath, onJournalChanged) {
  const journalFileName = basename(journalPath);
  let settleTimeout;

  const folderWatcher = watch(dirname(journalPath), (_eventType, fileName) => {
    if (fileName !== journalFileName) {
      return;
    }
    clearTimeout(settleTimeout);
    settleTimeout = setTimeout(onJournalChanged, JOURNAL_SETTLE_DELAY_MS);
  });
  folderWatcher.on("error", (error) => {
    console.error("Atropos journal watcher failed:", error);
  });

  return {
    stop() {
      clearTimeout(settleTimeout);
      folderWatcher.close();
    },
  };
}
