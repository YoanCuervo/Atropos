import { contextBridge, ipcRenderer } from "electron";
import { IPC_CHANNELS } from "../shared/ipc-channels.js";

/** @typedef {import("../main/ipc-handlers.js").LimitsOverview} LimitsOverview */
/** @typedef {import("../core/history-request.js").HistoryRequest} HistoryRequest */
/** @typedef {import("../core/snapshot-journal.js").LimitSnapshot} LimitSnapshot */
/** @typedef {import("../core/settings.js").Settings} Settings */
/** @typedef {import("../core/settings.js").SettingsChange} SettingsChange */

/**
 * The only functions of the main process the interface can reach, as `window.atropos`.
 */
const atroposApi = {
  /**
   * @returns {Promise<LimitsOverview>}
   */
  getLimitsOverview: () => ipcRenderer.invoke(IPC_CHANNELS.getLimitsOverview),

  /**
   * @param {HistoryRequest} historyRequest
   * @returns {Promise<LimitSnapshot[]>}
   */
  getLimitHistory: (historyRequest) =>
    ipcRenderer.invoke(IPC_CHANNELS.getLimitHistory, historyRequest),

  /**
   * @returns {Promise<Settings>}
   */
  getSettings: () => ipcRenderer.invoke(IPC_CHANNELS.getSettings),

  /**
   * @param {SettingsChange} settingsChange
   * @returns {Promise<Settings>} The settings once the change is saved.
   */
  updateSettings: (settingsChange) =>
    ipcRenderer.invoke(IPC_CHANNELS.updateSettings, settingsChange),

  /**
   * Opens a native confirmation dialog; nothing is deleted unless the user confirms there.
   *
   * @returns {Promise<boolean>} Whether the history was cleared.
   */
  clearHistory: () => ipcRenderer.invoke(IPC_CHANNELS.clearHistory),

  /**
   * @returns {Promise<string>} The `statusLine` block to paste into `~/.claude/settings.json`.
   */
  getStatusLineSettings: () =>
    ipcRenderer.invoke(IPC_CHANNELS.getStatusLineSettings),

  /**
   * @param {(limitsOverview: LimitsOverview) => void} handleLimitsUpdate
   * @returns {() => void} Stops listening.
   */
  onLimitsUpdated(handleLimitsUpdate) {
    const forwardLimitsUpdate = (_event, limitsOverview) =>
      handleLimitsUpdate(limitsOverview);

    ipcRenderer.on(IPC_CHANNELS.limitsUpdated, forwardLimitsUpdate);
    return () =>
      ipcRenderer.removeListener(
        IPC_CHANNELS.limitsUpdated,
        forwardLimitsUpdate,
      );
  },
};

contextBridge.exposeInMainWorld("atropos", atroposApi);
