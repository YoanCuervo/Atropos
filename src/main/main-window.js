import { app, shell, BrowserWindow } from "electron";
import { join } from "path";
import { is } from "@electron-toolkit/utils";
import { isAtroposInterfaceUrl } from "./interface-url.js";

let isApplicationQuitting = false;

app.on("before-quit", () => {
  isApplicationQuitting = true;
});

/**
 * Creates the main window. Closing it only hides it: Atropos keeps running in the tray
 * until the user quits from the tray menu.
 *
 * @returns {BrowserWindow}
 */
export function createMainWindow() {
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

  mainWindow.on("close", (event) => {
    if (!isApplicationQuitting) {
      event.preventDefault();
      mainWindow.hide();
    }
  });

  mainWindow.webContents.on("will-navigate", (event, navigationUrl) => {
    if (!isAtroposInterfaceUrl(navigationUrl)) {
      event.preventDefault();
    }
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (isSecureWebUrl(url)) {
      shell.openExternal(url);
    }
    return { action: "deny" };
  });

  if (is.dev && process.env["ELECTRON_RENDERER_URL"]) {
    mainWindow.loadURL(process.env["ELECTRON_RENDERER_URL"]);
  } else {
    mainWindow.loadFile(join(__dirname, "../renderer/index.html"));
  }

  return mainWindow;
}

/**
 * Brings the main window back to the front, whether it was hidden or minimized.
 *
 * @param {BrowserWindow} mainWindow
 */
export function showMainWindow(mainWindow) {
  if (mainWindow.isMinimized()) {
    mainWindow.restore();
  }
  mainWindow.show();
  mainWindow.focus();
}

/**
 * Only secure web links may leave the app, to open in the default browser.
 *
 * @param {string} linkUrl
 * @returns {boolean}
 */
function isSecureWebUrl(linkUrl) {
  return URL.canParse(linkUrl) && new URL(linkUrl).protocol === "https:";
}
