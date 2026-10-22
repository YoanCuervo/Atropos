import { useCallback, useEffect, useState } from "react";
import { computeHistoryStartMs } from "../../../core/history-request.js";

/** @typedef {import("../../../core/snapshot-journal.js").LimitSnapshot} LimitSnapshot */

/**
 * @typedef {"loading" | "error" | "empty" | "ready"} LimitHistoryStatus
 * - loading: the first answer has not arrived yet;
 * - error: the main process could not answer;
 * - empty: no snapshot was recorded during the period;
 * - ready: at least one snapshot was recorded during the period.
 */

/**
 * @typedef {object} LimitHistory
 * @property {LimitSnapshot[]} fiveHourSnapshots Snapshots of the period, oldest first.
 * @property {LimitSnapshot[]} sevenDaySnapshots Snapshots of the period, oldest first.
 * @property {LimitSnapshot[]} comparisonSnapshots Weekly snapshots of the longest period, for the weekly comparison.
 * @property {number} startMs Start of the period, as a Unix timestamp in milliseconds.
 * @property {number} endMs When the history was read, as a Unix timestamp in milliseconds.
 */

/**
 * @typedef {object} LimitHistoryState
 * @property {LimitHistoryStatus} status
 * @property {LimitHistory | null} limitHistory
 * @property {() => void} reloadLimitHistory Asks the main process again, e.g. after an error.
 */

const COMPARISON_PERIOD_DAY_COUNT = 30;

/**
 * Reads the history of both windows over a period, then reads it again after every slot.
 *
 * @param {number} periodDayCount 7 or 30.
 * @returns {LimitHistoryState}
 */
export function useLimitHistory(periodDayCount) {
  const [status, setStatus] = useState(
    /** @type {LimitHistoryStatus} */ ("loading"),
  );
  const [limitHistory, setLimitHistory] = useState(
    /** @type {LimitHistory | null} */ (null),
  );
  const [reloadCount, setReloadCount] = useState(0);

  const reloadLimitHistory = useCallback(() => {
    setStatus("loading");
    setReloadCount((count) => count + 1);
  }, []);

  useEffect(() => {
    let isMounted = true;

    const showLimitHistory = (receivedLimitHistory) => {
      if (isMounted) {
        setLimitHistory(receivedLimitHistory);
        setStatus(hasAnySnapshot(receivedLimitHistory) ? "ready" : "empty");
      }
    };
    const showRequestFailure = () => {
      if (isMounted) {
        setStatus("error");
      }
    };
    const fetchLimitHistory = () =>
      readLimitHistory(periodDayCount).then(
        showLimitHistory,
        showRequestFailure,
      );

    fetchLimitHistory();
    const stopFollowingUpdates =
      window.atropos.onLimitsUpdated(fetchLimitHistory);

    return () => {
      isMounted = false;
      stopFollowingUpdates();
    };
  }, [periodDayCount, reloadCount]);

  return { status, limitHistory, reloadLimitHistory };
}

/**
 * @param {number} periodDayCount
 * @returns {Promise<LimitHistory>}
 */
async function readLimitHistory(periodDayCount) {
  const endMs = Date.now();
  const startMs = computeHistoryStartMs(endMs, periodDayCount);
  const [fiveHourSnapshots, comparisonSnapshots] = await Promise.all([
    window.atropos.getLimitHistory({
      windowKind: "five_hour",
      periodDayCount,
    }),
    window.atropos.getLimitHistory({
      windowKind: "seven_day",
      periodDayCount: COMPARISON_PERIOD_DAY_COUNT,
    }),
  ]);
  const startIso = new Date(startMs).toISOString();

  return {
    fiveHourSnapshots,
    sevenDaySnapshots: comparisonSnapshots.filter(
      (limitSnapshot) => limitSnapshot.slotStartedAt >= startIso,
    ),
    comparisonSnapshots,
    startMs,
    endMs,
  };
}

/**
 * @param {LimitHistory} limitHistory
 * @returns {boolean}
 */
function hasAnySnapshot(limitHistory) {
  return (
    limitHistory.fiveHourSnapshots.length > 0 ||
    limitHistory.sevenDaySnapshots.length > 0
  );
}
