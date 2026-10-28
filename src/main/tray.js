import { Menu, Tray } from "electron";

/**
 * @typedef {object} TrayActions
 * @property {() => void} onOpenWindowRequested
 * @property {() => void} onRefreshRequested
 * @property {() => void} onQuitRequested
 */

/**
 * @typedef {object} TrayMenuMessages
 * @property {string} open
 * @property {string} refresh
 * @property {string} quit
 */

/**
 * @typedef {object} ApplicationTray
 * @property {(tooltipText: string) => void} showTooltip
 * @property {(menuMessages: TrayMenuMessages) => void} showMenu Rebuilds the menu, e.g. after a language change.
 * @property {() => void} destroy
 */

/**
 * Creates the icon next to the Windows clock: a left click opens the window,
 * a right click opens the menu.
 *
 * @param {string} iconPath The 16 px icon; Electron loads the @1.25x to @2x files next to it.
 * @param {TrayActions} trayActions
 * @returns {ApplicationTray}
 */
export function createApplicationTray(
  iconPath,
  { onOpenWindowRequested, onRefreshRequested, onQuitRequested },
) {
  const tray = new Tray(iconPath);

  tray.on("click", onOpenWindowRequested);

  return {
    showTooltip: (tooltipText) => tray.setToolTip(tooltipText),
    showMenu: (menuMessages) =>
      tray.setContextMenu(
        Menu.buildFromTemplate([
          { label: menuMessages.open, click: onOpenWindowRequested },
          { label: menuMessages.refresh, click: onRefreshRequested },
          { type: "separator" },
          { label: menuMessages.quit, click: onQuitRequested },
        ]),
      ),
    destroy: () => tray.destroy(),
  };
}
