import { Menu, Tray, nativeImage } from "electron";

const TRAY_ICON_SIZE_PX = 16;

/**
 * @typedef {object} TrayActions
 * @property {() => void} onOpenWindowRequested
 * @property {() => void} onRefreshRequested
 * @property {() => void} onQuitRequested
 */

/**
 * @typedef {object} ApplicationTray
 * @property {(tooltipText: string) => void} showTooltip
 * @property {() => void} destroy
 */

/**
 * Creates the icon next to the Windows clock: a left click opens the window,
 * a right click opens the menu.
 *
 * @param {string} iconPath
 * @param {string} initialTooltipText
 * @param {TrayActions} trayActions
 * @returns {ApplicationTray}
 */
export function createApplicationTray(
  iconPath,
  initialTooltipText,
  { onOpenWindowRequested, onRefreshRequested, onQuitRequested },
) {
  const trayIcon = nativeImage
    .createFromPath(iconPath)
    .resize({ width: TRAY_ICON_SIZE_PX, height: TRAY_ICON_SIZE_PX });
  const tray = new Tray(trayIcon);

  tray.setToolTip(initialTooltipText);
  tray.setContextMenu(
    Menu.buildFromTemplate([
      { label: "Open Atropos", click: onOpenWindowRequested },
      { label: "Refresh now", click: onRefreshRequested },
      { type: "separator" },
      { label: "Quit", click: onQuitRequested },
    ]),
  );
  tray.on("click", onOpenWindowRequested);

  return {
    showTooltip: (tooltipText) => tray.setToolTip(tooltipText),
    destroy: () => tray.destroy(),
  };
}
