import { Notification } from "electron";
import { computeWindowResetMs } from "../core/limit-window.js";
import {
  formatWeeklyAlertText,
  shouldSendWeeklyAlert,
} from "../core/weekly-alert.js";
import { getMessages } from "../shared/locales/index.js";

/** @typedef {import("../core/snapshot-journal.js").LimitSnapshot} LimitSnapshot */
/** @typedef {import("../core/settings.js").Settings} Settings */
/** @typedef {import("./database/sent-alerts-repository.js").SentAlertsRepository} SentAlertsRepository */

// Keeps the notification alive until Windows reports whether it could be shown.
let shownNotification = null;

/**
 * Opens the window whenever a notification of Atropos is clicked, including one left in
 * the Action Center by an earlier launch: the click handler of a single notification
 * only covers the notification while this launch still holds it.
 *
 * @param {() => void} onNotificationClicked
 */
export function handleNotificationClicks(onNotificationClicked) {
  Notification.handleActivation(() => onNotificationClicked());
}

/**
 * Shows a Windows notification when the weekly usage reaches the threshold,
 * at most once per weekly window and threshold. The alert is recorded before it is shown,
 * so a crash right after can never repeat it. When Windows refuses to show it, for example
 * because notifications are turned off, the record is dropped and the next slot tries again.
 *
 * @param {object} weeklyAlertCheck
 * @param {LimitSnapshot | null} weeklyAlertCheck.sevenDaySnapshot Latest snapshot of the weekly window.
 * @param {Settings} weeklyAlertCheck.settings
 * @param {SentAlertsRepository} weeklyAlertCheck.sentAlertsRepository
 * @param {number} weeklyAlertCheck.nowMs Unix timestamp, in milliseconds.
 * @returns {boolean} Whether a notification was shown.
 */
export function notifyWeeklyUsageIfNeeded({
  sevenDaySnapshot,
  settings,
  sentAlertsRepository,
  nowMs,
}) {
  if (sevenDaySnapshot === null || !Notification.isSupported()) {
    return false;
  }

  const sentAlert = {
    windowKind: sevenDaySnapshot.windowKind,
    thresholdPercentage: settings.weeklyAlertThresholdPercentage,
    windowResetsAt: new Date(
      computeWindowResetMs(sevenDaySnapshot),
    ).toISOString(),
  };
  const isAlertDue = shouldSendWeeklyAlert({
    sevenDaySnapshot,
    settings,
    hasAlertBeenSent: sentAlertsRepository.hasAlertBeenSent(sentAlert),
    nowMs,
  });
  if (!isAlertDue) {
    return false;
  }

  sentAlertsRepository.recordSentAlert(
    sentAlert,
    new Date(nowMs).toISOString(),
  );
  const messages = getMessages(settings.language);
  const { title, body } = formatWeeklyAlertText(
    sevenDaySnapshot,
    messages.weeklyAlert,
    {
      locale: messages.dateLocale,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
  );
  shownNotification = new Notification({ title, body });
  shownNotification.on("failed", (_event, failureReason) => {
    console.warn("Atropos weekly alert not delivered:", failureReason);
    sentAlertsRepository.forgetSentAlert(sentAlert);
  });
  shownNotification.show();
  return true;
}
