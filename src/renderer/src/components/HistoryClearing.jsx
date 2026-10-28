import { useState } from "react";

/** @typedef {import("../../../shared/locales/index.js").Messages} Messages */
/** @typedef {"idle" | "cleared" | "failed"} ClearingStatus */

/**
 * The button that clears the history. The main process asks for confirmation
 * in a native dialog before deleting anything.
 *
 * @param {object} props
 * @param {Messages["historyClearing"]} props.clearingMessages
 */
function HistoryClearing({ clearingMessages }) {
  const [clearingStatus, setClearingStatus] = useState(
    /** @type {ClearingStatus} */ ("idle"),
  );

  const clearHistory = async () => {
    try {
      const isHistoryCleared = await window.atropos.clearHistory();
      setClearingStatus(isHistoryCleared ? "cleared" : "idle");
    } catch {
      setClearingStatus("failed");
    }
  };

  return (
    <section className="card settings-section" aria-labelledby="clearing-title">
      <h3 id="clearing-title" className="card__title settings-section__title">
        {clearingMessages.title}
      </h3>
      <p className="settings-section__text">{clearingMessages.explanation}</p>
      <button
        type="button"
        className="settings-button settings-button--danger"
        onClick={clearHistory}
      >
        {clearingMessages.button}
      </button>
      <p className="settings-section__status" role="status">
        {clearingStatus === "cleared" && clearingMessages.cleared}
        {clearingStatus === "failed" && clearingMessages.failed}
      </p>
    </section>
  );
}

export default HistoryClearing;
