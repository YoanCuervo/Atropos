import { useEffect, useState } from "react";

/** @typedef {import("../../../shared/locales/index.js").Messages} Messages */
/** @typedef {"idle" | "copied" | "failed"} CopyStatus */

/**
 * How to turn the Claude Code status line on. Atropos shows the block to paste
 * and never writes the Claude Code settings itself.
 *
 * @param {object} props
 * @param {Messages["statusLineSetup"]} props.setupMessages
 */
function StatusLineSetup({ setupMessages }) {
  const [statusLineSettings, setStatusLineSettings] = useState(
    /** @type {string | null} */ (null),
  );
  const [hasLoadFailed, setHasLoadFailed] = useState(false);
  const [copyStatus, setCopyStatus] = useState(
    /** @type {CopyStatus} */ ("idle"),
  );

  useEffect(() => {
    let isMounted = true;

    window.atropos.getStatusLineSettings().then(
      (receivedStatusLineSettings) => {
        if (isMounted) {
          setStatusLineSettings(receivedStatusLineSettings);
        }
      },
      () => {
        if (isMounted) {
          setHasLoadFailed(true);
        }
      },
    );

    return () => {
      isMounted = false;
    };
  }, []);

  const copyStatusLineSettings = async () => {
    try {
      await navigator.clipboard.writeText(statusLineSettings);
      setCopyStatus("copied");
    } catch {
      setCopyStatus("failed");
    }
  };

  return (
    <section className="settings-section" aria-labelledby="status-line-title">
      <h3 id="status-line-title" className="settings-section__title">
        {setupMessages.title}
      </h3>
      <p className="settings-section__text">{setupMessages.explanation}</p>
      <ol className="settings-section__steps">
        <li>{setupMessages.stepOpen}</li>
        <li>{setupMessages.stepPaste}</li>
        <li>{setupMessages.stepUse}</li>
      </ol>
      <p className="settings-section__text">{setupMessages.desktopNote}</p>
      {hasLoadFailed && <p role="alert">{setupMessages.loadError}</p>}
      {statusLineSettings !== null && (
        <>
          <p id="status-line-code-label" className="settings-field__label">
            {setupMessages.codeLabel}
          </p>
          <pre
            className="settings-code"
            aria-labelledby="status-line-code-label"
            tabIndex={0}
          >
            <code>{statusLineSettings}</code>
          </pre>
          <button
            type="button"
            className="settings-button"
            onClick={copyStatusLineSettings}
          >
            {setupMessages.copyButton}
          </button>
          <p className="settings-section__status" role="status">
            {copyStatus === "copied" && setupMessages.copied}
            {copyStatus === "failed" && setupMessages.copyFailed}
          </p>
        </>
      )}
    </section>
  );
}

export default StatusLineSetup;
