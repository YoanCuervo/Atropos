import { app, nativeTheme } from "electron";
import { join } from "path";
import { electronApp, optimizer } from "@electron-toolkit/utils";
import trayIconPath from "../../resources/tray.png?asset";
import { mkdirSync } from "node:fs";
import {
  APPLICATION_DATA_FOLDER_NAME,
  buildJournalPath,
  buildLegacyJournalPath,
  buildSharedFolderPath,
} from "../core/journal-location.js";
import {
  buildLegacySettingsPath,
  buildSettingsPath,
} from "../core/settings-location.js";
import { formatStatusLineSettings } from "../core/status-line-setup.js";
import { formatTrayTooltip } from "../core/tray-text.js";
import { getMessages } from "../shared/locales/index.js";
import { createLimitSnapshotsRepository } from "./database/limit-snapshots-repository.js";
import { openDatabase } from "./database/open-database.js";
import { createSentAlertsRepository } from "./database/sent-alerts-repository.js";
import { confirmThenClearHistory } from "./history-clearing.js";
import { maintainHistory } from "./history-maintenance.js";
import { watchJournal } from "./journal-watcher.js";
import {
  readLimitsOverview,
  registerIpcHandlers,
  sendLimitsUpdate,
} from "./ipc-handlers.js";
import { createMainWindow, showMainWindow } from "./main-window.js";
import { createSettingsStore } from "./settings-store.js";
import { startSlotScheduler } from "./slot-scheduler.js";
import { resolveStatusLineCommandParts } from "./status-line-script.js";
import { createApplicationTray } from "./tray.js";
import {
  handleNotificationClicks,
  notifyWeeklyUsageIfNeeded,
} from "./weekly-alert.js";

const APPLICATION_USER_MODEL_ID = "dev.yoancuervo.atropos";
// Windows routes a click on a notification in the Action Center to this COM class id,
// as recorded in the Start menu shortcut. Electron draws a new one on every launch
// unless it is fixed, which leaves the shortcut pointing at a class nobody serves.
const TOAST_ACTIVATOR_CLSID = "{3120F106-854C-4AE1-B5FF-1AA869653C18}";
const DATABASE_FILE_NAME = "atropos.db";

app.setToastActivatorCLSID(TOAST_ACTIVATOR_CLSID);
app.setPath(
  "userData",
  join(app.getPath("appData"), APPLICATION_DATA_FOLDER_NAME),
);

/**
 * @returns {string[]} The shared journal, then the one older versions wrote in AppData.
 */
function listJournalPaths() {
  return [
    buildJournalPath(app.getPath("home")),
    buildLegacyJournalPath(app.getPath("appData")),
  ];
}

/** @typedef {import("./database/limit-snapshots-repository.js").LimitSnapshotsRepository} LimitSnapshotsRepository */
/** @typedef {import("./database/sent-alerts-repository.js").SentAlertsRepository} SentAlertsRepository */
/** @typedef {import("../core/snapshot-journal.js").LimitSnapshot} LimitSnapshot */
/** @typedef {import("./ipc-handlers.js").LimitsOverview} LimitsOverview */
/** @typedef {import("./settings-store.js").SettingsStore} SettingsStore */
/** @typedef {import("./tray.js").ApplicationTray} ApplicationTray */
/** @typedef {import("../core/settings.js").Settings} Settings */

/**
 * @typedef {object} RefreshTargets
 * @property {ApplicationTray} applicationTray
 * @property {import("electron").BrowserWindow} mainWindow
 * @property {SettingsStore} settingsStore
 * @property {SentAlertsRepository} sentAlertsRepository
 * @property {(sevenDaySnapshot: LimitSnapshot | null) => void} notifyWeeklyUsage
 */

/**
 * @param {ApplicationTray} applicationTray
 * @param {LimitsOverview} limitsOverview
 * @param {Settings} settings
 */
function showTrayTooltip(applicationTray, limitsOverview, settings) {
  const messages = getMessages(settings.language);
  applicationTray.showTooltip(
    formatTrayTooltip(limitsOverview.sevenDay, messages.tray, {
      locale: messages.dateLocale,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    }),
  );
}

/**
 * Applies the settings that live outside the interface. The theme goes through
 * `nativeTheme`, which also switches `prefers-color-scheme` in the interface.
 *
 * @param {Settings} settings
 * @param {ApplicationTray} applicationTray
 * @param {LimitSnapshotsRepository} limitSnapshotsRepository
 */
function applySettings(settings, applicationTray, limitSnapshotsRepository) {
  nativeTheme.themeSource = settings.theme;
  applicationTray.showMenu(getMessages(settings.language).tray);
  showTrayTooltip(
    applicationTray,
    readLimitsOverview(limitSnapshotsRepository),
    settings,
  );
}

/**
 * Imports the journal and purges old data, then shows the latest limits
 * in the tray tooltip, sends them to the interface and alerts when the weekly threshold is reached.
 *
 * @param {LimitSnapshotsRepository} limitSnapshotsRepository
 * @param {RefreshTargets} refreshTargets
 * @returns {Promise<void>}
 */
async function refreshHistory(
  limitSnapshotsRepository,
  {
    applicationTray,
    mainWindow,
    settingsStore,
    sentAlertsRepository,
    notifyWeeklyUsage,
  },
) {
  await maintainHistory({
    journalPaths: listJournalPaths(),
    limitSnapshotsRepository,
    sentAlertsRepository,
    nowMs: Date.now(),
  });

  const limitsOverview = readLimitsOverview(limitSnapshotsRepository);
  showTrayTooltip(applicationTray, limitsOverview, settingsStore.getSettings());
  sendLimitsUpdate(mainWindow, limitsOverview);
  notifyWeeklyUsage(limitsOverview.sevenDay);
}

async function startApplication() {
  electronApp.setAppUserModelId(APPLICATION_USER_MODEL_ID);

  app.on("browser-window-created", (_, window) => {
    optimizer.watchWindowShortcuts(window);
  });

  const database = openDatabase(
    join(app.getPath("userData"), DATABASE_FILE_NAME),
  );
  const limitSnapshotsRepository = createLimitSnapshotsRepository(database);
  const sentAlertsRepository = createSentAlertsRepository(database);
  mkdirSync(buildSharedFolderPath(app.getPath("home")), { recursive: true });
  const settingsStore = createSettingsStore(
    buildSettingsPath(app.getPath("home")),
    buildLegacySettingsPath(app.getPath("appData")),
  );
  const notifyWeeklyUsage = (sevenDaySnapshot) =>
    notifyWeeklyUsageIfNeeded({
      sevenDaySnapshot,
      settings: settingsStore.getSettings(),
      sentAlertsRepository,
      nowMs: Date.now(),
    });

  let slotScheduler;
  const applicationTray = createApplicationTray(trayIconPath, {
    onOpenWindowRequested: () => showMainWindow(mainWindow),
    onRefreshRequested: () => slotScheduler.runNow(),
    onQuitRequested: () => app.quit(),
  });
  applySettings(
    settingsStore.getSettings(),
    applicationTray,
    limitSnapshotsRepository,
  );
  registerIpcHandlers({
    limitSnapshotsRepository,
    settingsStore,
    onSettingsChanged: (settings) => {
      applySettings(settings, applicationTray, limitSnapshotsRepository);
      notifyWeeklyUsage(readLimitsOverview(limitSnapshotsRepository).sevenDay);
    },
    clearHistory: async () => {
      const isHistoryCleared = await confirmThenClearHistory({
        parentWindow: mainWindow,
        clearDialogMessages: getMessages(settingsStore.getSettings().language)
          .clearDialog,
        limitSnapshotsRepository,
        sentAlertsRepository,
        journalPaths: listJournalPaths(),
      });
      if (isHistoryCleared) {
        const limitsOverview = readLimitsOverview(limitSnapshotsRepository);
        showTrayTooltip(
          applicationTray,
          limitsOverview,
          settingsStore.getSettings(),
        );
        sendLimitsUpdate(mainWindow, limitsOverview);
      }
      return isHistoryCleared;
    },
    readStatusLineSettings: () =>
      formatStatusLineSettings(resolveStatusLineCommandParts()),
  });
  const mainWindow = createMainWindow();
  handleNotificationClicks(() => showMainWindow(mainWindow));
  slotScheduler = startSlotScheduler(() =>
    refreshHistory(limitSnapshotsRepository, {
      applicationTray,
      mainWindow,
      settingsStore,
      sentAlertsRepository,
      notifyWeeklyUsage,
    }),
  );

  const journalWatcher = watchJournal(
    buildJournalPath(app.getPath("home")),
    () => slotScheduler.runNow(),
  );

  app.on("second-instance", () => showMainWindow(mainWindow));
  app.on("will-quit", () => {
    journalWatcher.stop();
    slotScheduler.stop();
    applicationTray.destroy();
    database.close();
  });

  await slotScheduler.runNow();
}

const hasSingleInstanceLock = app.requestSingleInstanceLock();
if (hasSingleInstanceLock) {
  app.whenReady().then(startApplication);
} else {
  app.quit();
}
