import { dialog } from "electron";
import { discardJournalFiles } from "./journal-import.js";

/** @typedef {import("./database/limit-snapshots-repository.js").LimitSnapshotsRepository} LimitSnapshotsRepository */
/** @typedef {import("../shared/locales/index.js").Messages} Messages */

const CANCEL_BUTTON_INDEX = 0;
const CONFIRM_BUTTON_INDEX = 1;

/**
 * Asks for confirmation in a native dialog, then deletes every snapshot and the pending journal.
 * The confirmation lives in the main process, so the interface alone can never clear the history.
 *
 * @param {object} historyClearing
 * @param {import("electron").BrowserWindow} historyClearing.parentWindow
 * @param {Messages["clearDialog"]} historyClearing.clearDialogMessages
 * @param {LimitSnapshotsRepository} historyClearing.limitSnapshotsRepository
 * @param {string} historyClearing.journalPath
 * @returns {Promise<boolean>} Whether the user confirmed and the history was cleared.
 */
export async function confirmThenClearHistory({
  parentWindow,
  clearDialogMessages,
  limitSnapshotsRepository,
  journalPath,
}) {
  const { response } = await dialog.showMessageBox(parentWindow, {
    type: "warning",
    title: clearDialogMessages.title,
    message: clearDialogMessages.message,
    detail: clearDialogMessages.detail,
    buttons: [clearDialogMessages.cancel, clearDialogMessages.confirm],
    defaultId: CANCEL_BUTTON_INDEX,
    cancelId: CANCEL_BUTTON_INDEX,
    noLink: true,
  });
  if (response !== CONFIRM_BUTTON_INDEX) {
    return false;
  }

  await discardJournalFiles(journalPath);
  limitSnapshotsRepository.deleteAllSnapshots();
  return true;
}
