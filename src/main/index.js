import { app } from "electron";
import { join } from "path";
import { electronApp, optimizer } from "@electron-toolkit/utils";
import {
  APPLICATION_DATA_FOLDER_NAME,
  buildJournalPath,
} from "../core/journal-location.js";
import { createLimitSnapshotsRepository } from "./database/limit-snapshots-repository.js";
import { openDatabase } from "./database/open-database.js";
import { maintainHistory } from "./history-maintenance.js";
import { createMainWindow } from "./main-window.js";

const APPLICATION_USER_MODEL_ID = "dev.yoancuervo.atropos";
const DATABASE_FILE_NAME = "atropos.db";

app.setPath(
  "userData",
  join(app.getPath("appData"), APPLICATION_DATA_FOLDER_NAME),
);

/**
 * @param {import("./database/limit-snapshots-repository.js").LimitSnapshotsRepository} limitSnapshotsRepository
 * @returns {Promise<void>}
 */
async function refreshHistory(limitSnapshotsRepository) {
  try {
    await maintainHistory({
      journalPath: buildJournalPath(app.getPath("appData")),
      limitSnapshotsRepository,
      nowMs: Date.now(),
    });
  } catch (error) {
    console.error("Atropos could not refresh the history:", error);
  }
}

app.whenReady().then(async () => {
  electronApp.setAppUserModelId(APPLICATION_USER_MODEL_ID);

  app.on("browser-window-created", (_, window) => {
    optimizer.watchWindowShortcuts(window);
  });

  const database = openDatabase(
    join(app.getPath("userData"), DATABASE_FILE_NAME),
  );
  app.on("will-quit", () => {
    database.close();
  });

  await refreshHistory(createLimitSnapshotsRepository(database));
  createMainWindow();
});

app.on("window-all-closed", () => {
  app.quit();
});
