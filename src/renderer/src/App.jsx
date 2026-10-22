import PreferencesControls from "./components/PreferencesControls.jsx";
import { useSettings } from "./hooks/useSettings.js";
import LimitsView from "./views/LimitsView.jsx";

function App() {
  const { settings, messages, changeSettings, hasSaveFailed } = useSettings();

  if (settings === null) {
    return null;
  }

  return (
    <>
      <header className="app-header">
        <div className="app-header__identity">
          <h1 className="app-header__title">Atropos</h1>
          <p className="app-header__subtitle">{messages.app.subtitle}</p>
        </div>
        <PreferencesControls
          settings={settings}
          preferencesMessages={messages.preferences}
          onSettingsChange={changeSettings}
          hasSaveFailed={hasSaveFailed}
        />
      </header>
      <main className="app-main">
        <LimitsView messages={messages} />
      </main>
    </>
  );
}

export default App;
