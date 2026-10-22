import { app } from "electron";
import { join } from "path";
import { electronApp, optimizer } from "@electron-toolkit/utils";
import trayIconPath from "../../resources/icon.png?asset";
import {
  APPLICATION_DATA_FOLDER_NAME,
  buildJournalPath,
} from "../core/journal-location.js";
import {
  NO_LIMITS_RECORDED_TOOLTIP,
  formatTrayTooltip,
} from "../core/tray-text.js";
import { createLimitSnapshotsRepository } from "./database/limit-snapshots-repository.js";
import { openDatabase } from "./database/open-database.js";
import { maintainHistory } from "./history-maintenance.js";
import { createMainWindow, showMainWindow } from "./main-window.js";
import { startSlotScheduler } from "./slot-scheduler.js";
import { createApplicationTray } from "./tray.js";

const APPLICATION_USER_MODEL_ID = "dev.yoancuervo.atropos";
const DATABASE_FILE_NAME = "atropos.db";
const TRAY_TEXT_LOCALE = "en-GB";

app.setPath(
  "userData",
  join(app.getPath("appData"), APPLICATION_DATA_FOLDER_NAME),
);

/** @typedef {import("./database/limit-snapshots-repository.js").LimitSnapshotsRepository} LimitSnapshotsRepository */
/** @typedef {import("./tray.js").ApplicationTray} ApplicationTray */

/**
 * Imports the journal, purges old snapshots, then shows the latest weekly usage in the tray.
 *
 * @param {LimitSnapshotsRepository} limitSnapshotsRepository
 * @param {ApplicationTray} applicationTray
 * @returns {Promise<void>}
 */
async function refreshHistory(limitSnapshotsRepository, applicationTray) {
  await maintainHistory({
    journalPath: buildJournalPath(app.getPath("appData")),
    limitSnapshotsRepository,
    nowMs: Date.now(),
  });
  applicationTray.showTooltip(
    formatTrayTooltip(
      limitSnapshotsRepository.findLatestSnapshot("seven_day"),
      {
        locale: TRAY_TEXT_LOCALE,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
    ),
  );
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
  const mainWindow = createMainWindow();

  let slotScheduler;
  const applicationTray = createApplicationTray(
    trayIconPath,
    NO_LIMITS_RECORDED_TOOLTIP,
    {
      onOpenWindowRequested: () => showMainWindow(mainWindow),
      onRefreshRequested: () => slotScheduler.runNow(),
      onQuitRequested: () => app.quit(),
    },
  );
  slotScheduler = startSlotScheduler(() =>
    refreshHistory(limitSnapshotsRepository, applicationTray),
  );

  app.on("second-instance", () => showMainWindow(mainWindow));
  app.on("will-quit", () => {
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
