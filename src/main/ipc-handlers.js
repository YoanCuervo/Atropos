import { ipcMain } from "electron";
import { is } from "@electron-toolkit/utils";
import {
  computeHistoryStartMs,
  parseHistoryRequest,
} from "../core/history-request.js";
import { IPC_CHANNELS } from "../shared/ipc-channels.js";

/** @typedef {import("./database/limit-snapshots-repository.js").LimitSnapshotsRepository} LimitSnapshotsRepository */
/** @typedef {import("../core/snapshot-journal.js").LimitSnapshot} LimitSnapshot */

/**
 * @typedef {object} LimitsOverview
 * @property {LimitSnapshot | null} fiveHour Latest snapshot of the five-hour window.
 * @property {LimitSnapshot | null} sevenDay Latest snapshot of the weekly window.
 */

export class UntrustedSenderError extends Error {
  /**
   * @param {string} senderUrl
   */
  constructor(senderUrl) {
    super(`Refused an IPC request from an untrusted page: ${senderUrl}`);
    this.name = "UntrustedSenderError";
  }
}

/**
 * @param {LimitSnapshotsRepository} limitSnapshotsRepository
 * @returns {LimitsOverview}
 */
export function readLimitsOverview(limitSnapshotsRepository) {
  return {
    fiveHour: limitSnapshotsRepository.findLatestSnapshot("five_hour"),
    sevenDay: limitSnapshotsRepository.findLatestSnapshot("seven_day"),
  };
}

/**
 * Answers the requests the interface may send through the preload.
 *
 * @param {LimitSnapshotsRepository} limitSnapshotsRepository
 */
export function registerIpcHandlers(limitSnapshotsRepository) {
  handleTrustedRequests(IPC_CHANNELS.getLimitsOverview, () =>
    readLimitsOverview(limitSnapshotsRepository),
  );

  handleTrustedRequests(IPC_CHANNELS.getLimitHistory, (rawHistoryRequest) => {
    const { windowKind, periodDayCount } =
      parseHistoryRequest(rawHistoryRequest);
    const historyStartIso = new Date(
      computeHistoryStartMs(Date.now(), periodDayCount),
    ).toISOString();

    return limitSnapshotsRepository.findSnapshotsSince(
      windowKind,
      historyStartIso,
    );
  });
}

/**
 * Sends the latest limits to the interface, if its window still exists.
 *
 * @param {import("electron").BrowserWindow} mainWindow
 * @param {LimitsOverview} limitsOverview
 */
export function sendLimitsUpdate(mainWindow, limitsOverview) {
  if (!mainWindow.isDestroyed()) {
    mainWindow.webContents.send(IPC_CHANNELS.limitsUpdated, limitsOverview);
  }
}

/**
 * Registers a request handler that only answers pages of the Atropos interface.
 *
 * @param {string} channel
 * @param {(...requestArguments: unknown[]) => unknown} handleRequest
 */
function handleTrustedRequests(channel, handleRequest) {
  ipcMain.handle(channel, (event, ...requestArguments) => {
    const senderUrl = event.senderFrame?.url ?? "";
    if (!isAtroposInterfaceUrl(senderUrl)) {
      throw new UntrustedSenderError(senderUrl);
    }
    return handleRequest(...requestArguments);
  });
}

/**
 * @param {string} pageUrl
 * @returns {boolean}
 */
function isAtroposInterfaceUrl(pageUrl) {
  if (!URL.canParse(pageUrl)) {
    return false;
  }
  const { origin, protocol } = new URL(pageUrl);

  if (is.dev && process.env["ELECTRON_RENDERER_URL"]) {
    return origin === new URL(process.env["ELECTRON_RENDERER_URL"]).origin;
  }
  return protocol === "file:";
}
