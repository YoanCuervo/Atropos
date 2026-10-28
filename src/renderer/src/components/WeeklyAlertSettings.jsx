import { useState } from "react";
import { fillMessageTemplate } from "../../../core/message-template.js";
import {
  MAX_ALERT_THRESHOLD_PERCENTAGE,
  MIN_ALERT_THRESHOLD_PERCENTAGE,
  isValidAlertThresholdPercentage,
} from "../../../core/settings.js";

/** @typedef {import("../../../core/settings.js").Settings} Settings */
/** @typedef {import("../../../core/settings.js").SettingsChange} SettingsChange */
/** @typedef {import("../../../shared/locales/index.js").Messages} Messages */

const THRESHOLD_BOUNDS = {
  min: MIN_ALERT_THRESHOLD_PERCENTAGE,
  max: MAX_ALERT_THRESHOLD_PERCENTAGE,
};

/**
 * Whether to be notified, and from which weekly usage. The threshold is saved when the field
 * loses focus or on Enter, never on each keystroke, so a half-typed number is never saved.
 *
 * @param {object} props
 * @param {Settings} props.settings
 * @param {Messages["alertSettings"]} props.alertMessages
 * @param {(settingsChange: SettingsChange) => void} props.onSettingsChange
 */
function WeeklyAlertSettings({ settings, alertMessages, onSettingsChange }) {
  const [thresholdText, setThresholdText] = useState(
    String(settings.weeklyAlertThresholdPercentage),
  );
  const [isThresholdInvalid, setIsThresholdInvalid] = useState(false);

  const saveThreshold = () => {
    const thresholdPercentage = Number(thresholdText);
    if (
      thresholdText.trim() === "" ||
      !isValidAlertThresholdPercentage(thresholdPercentage)
    ) {
      setIsThresholdInvalid(true);
      return;
    }
    setIsThresholdInvalid(false);
    if (thresholdPercentage !== settings.weeklyAlertThresholdPercentage) {
      onSettingsChange({ weeklyAlertThresholdPercentage: thresholdPercentage });
    }
  };

  return (
    <section className="card settings-section" aria-labelledby="alert-title">
      <h3 id="alert-title" className="card__title settings-section__title">
        {alertMessages.title}
      </h3>
      <div className="settings-check">
        <input
          id="alert-enabled"
          type="checkbox"
          checked={settings.isWeeklyAlertEnabled}
          onChange={(event) =>
            onSettingsChange({ isWeeklyAlertEnabled: event.target.checked })
          }
        />
        <label htmlFor="alert-enabled">{alertMessages.enabledLabel}</label>
      </div>
      <div className="settings-field">
        <label className="settings-field__label" htmlFor="alert-threshold">
          {alertMessages.thresholdLabel}
        </label>
        <input
          id="alert-threshold"
          className="settings-field__control settings-field__control--number"
          type="number"
          inputMode="numeric"
          min={MIN_ALERT_THRESHOLD_PERCENTAGE}
          max={MAX_ALERT_THRESHOLD_PERCENTAGE}
          step={1}
          value={thresholdText}
          disabled={!settings.isWeeklyAlertEnabled}
          aria-invalid={isThresholdInvalid}
          aria-describedby={
            isThresholdInvalid
              ? "alert-threshold-error"
              : "alert-threshold-hint"
          }
          onChange={(event) => setThresholdText(event.target.value)}
          onBlur={saveThreshold}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              saveThreshold();
            }
          }}
        />
        {isThresholdInvalid ? (
          <p
            id="alert-threshold-error"
            className="settings-field__error"
            role="alert"
          >
            {fillMessageTemplate(
              alertMessages.invalidThreshold,
              THRESHOLD_BOUNDS,
            )}
          </p>
        ) : (
          <p id="alert-threshold-hint" className="settings-field__hint">
            {fillMessageTemplate(alertMessages.thresholdHint, THRESHOLD_BOUNDS)}
          </p>
        )}
      </div>
    </section>
  );
}

export default WeeklyAlertSettings;
