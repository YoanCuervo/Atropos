import DisplaySettings from "../components/DisplaySettings.jsx";
import HistoryClearing from "../components/HistoryClearing.jsx";
import StatusLineSetup from "../components/StatusLineSetup.jsx";
import WeeklyAlertSettings from "../components/WeeklyAlertSettings.jsx";

/** @typedef {import("../../../core/settings.js").Settings} Settings */
/** @typedef {import("../../../core/settings.js").SettingsChange} SettingsChange */
/** @typedef {import("../../../shared/locales/index.js").Messages} Messages */

/**
 * Display, weekly alert, history clearing and status line setup.
 *
 * @param {object} props
 * @param {Settings} props.settings
 * @param {Messages} props.messages Texts of the chosen language.
 * @param {(settingsChange: SettingsChange) => void} props.onSettingsChange
 * @param {boolean} props.hasSaveFailed Whether the last change could not be saved.
 */
function SettingsView({ settings, messages, onSettingsChange, hasSaveFailed }) {
  return (
    <section className="settings-view" aria-labelledby="settings-title">
      <h2 id="settings-title" className="settings-view__title">
        {messages.settings.title}
      </h2>
      {hasSaveFailed && (
        <p className="settings-view__error" role="alert">
          {messages.preferences.saveError}
        </p>
      )}
      <DisplaySettings
        settings={settings}
        preferencesMessages={messages.preferences}
        onSettingsChange={onSettingsChange}
      />
      <WeeklyAlertSettings
        settings={settings}
        alertMessages={messages.alertSettings}
        onSettingsChange={onSettingsChange}
      />
      <HistoryClearing clearingMessages={messages.historyClearing} />
      <StatusLineSetup setupMessages={messages.statusLineSetup} />
    </section>
  );
}

export default SettingsView;
