import { app, shell, BrowserWindow } from "electron";
import { join } from "path";
import { electronApp, optimizer, is } from "@electron-toolkit/utils";
import {
  APPLICATION_DATA_FOLDER_NAME,
  buildJournalPath,
} from "../core/journal-location.js";
import { createLimitSnapshotsRepository } from "./database/limit-snapshots-repository.js";
import { openDatabase } from "./database/open-database.js";
import { maintainHistory } from "./history-maintenance.js";

const APPLICATION_USER_MODEL_ID = "dev.yoancuervo.atropos";
const DATABASE_FILE_NAME = "atropos.db";

app.setPath(
  "userData",
  join(app.getPath("appData"), APPLICATION_DATA_FOLDER_NAME),
);

function createMainWindow() {
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      preload: join(__dirname, "../preload/index.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  mainWindow.on("ready-to-show", () => {
    mainWindow.show();
  });

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: "deny" };
  });

  if (is.dev && process.env["ELECTRON_RENDERER_URL"]) {
    mainWindow.loadURL(process.env["ELECTRON_RENDERER_URL"]);
  } else {
    mainWindow.loadFile(join(__dirname, "../renderer/index.html"));
  }
}

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
