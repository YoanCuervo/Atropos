import { useCallback, useEffect, useState } from "react";

/** @typedef {import("../../../main/ipc-handlers.js").LimitsOverview} LimitsOverview */

/**
 * @typedef {"loading" | "error" | "empty" | "ready"} LimitsOverviewStatus
 * - loading: the first answer has not arrived yet;
 * - error: the main process could not answer;
 * - empty: no snapshot has been recorded yet;
 * - ready: at least one window has a snapshot.
 */

/**
 * @typedef {object} LimitsOverviewState
 * @property {LimitsOverviewStatus} status
 * @property {LimitsOverview | null} limitsOverview
 * @property {() => Promise<void>} reloadLimitsOverview Asks the main process again, e.g. after an error.
 */

/**
 * Reads the latest limits from the main process, then follows the updates it sends after every slot.
 *
 * @returns {LimitsOverviewState}
 */
export function useLimitsOverview() {
  const [status, setStatus] = useState(
    /** @type {LimitsOverviewStatus} */ ("loading"),
  );
  const [limitsOverview, setLimitsOverview] = useState(
    /** @type {LimitsOverview | null} */ (null),
  );

  const showLimitsOverview = useCallback((receivedLimitsOverview) => {
    setLimitsOverview(receivedLimitsOverview);
    setStatus(hasAnySnapshot(receivedLimitsOverview) ? "ready" : "empty");
  }, []);

  const showRequestFailure = useCallback(() => {
    setStatus("error");
  }, []);

  const reloadLimitsOverview = useCallback(async () => {
    setStatus("loading");
    try {
      showLimitsOverview(await window.atropos.getLimitsOverview());
    } catch {
      showRequestFailure();
    }
  }, [showLimitsOverview, showRequestFailure]);

  useEffect(() => {
    let isMounted = true;

    window.atropos.getLimitsOverview().then(
      (receivedLimitsOverview) => {
        if (isMounted) {
          showLimitsOverview(receivedLimitsOverview);
        }
      },
      () => {
        if (isMounted) {
          showRequestFailure();
        }
      },
    );
    const stopFollowingUpdates =
      window.atropos.onLimitsUpdated(showLimitsOverview);

    return () => {
      isMounted = false;
      stopFollowingUpdates();
    };
  }, [showLimitsOverview, showRequestFailure]);

  return { status, limitsOverview, reloadLimitsOverview };
}

/**
 * @param {LimitsOverview} limitsOverview
 * @returns {boolean}
 */
function hasAnySnapshot(limitsOverview) {
  return limitsOverview.fiveHour !== null || limitsOverview.sevenDay !== null;
}
