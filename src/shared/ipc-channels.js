/**
 * The closed list of channels between the main process and the interface.
 * The preload exposes these channels only, and nothing else of Electron.
 */
export const IPC_CHANNELS = Object.freeze({
  getLimitsOverview: "limits:get-overview",
  getLimitHistory: "limits:get-history",
  limitsUpdated: "limits:updated",
});
