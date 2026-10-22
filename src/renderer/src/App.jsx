import { useState } from "react";
import PreferencesControls from "./components/PreferencesControls.jsx";
import ViewNavigation from "./components/ViewNavigation.jsx";
import { useSettings } from "./hooks/useSettings.js";
import HistoryView from "./views/HistoryView.jsx";
import LimitsView from "./views/LimitsView.jsx";

function App() {
  const { settings, messages, changeSettings, hasSaveFailed } = useSettings();
  const [currentView, setCurrentView] = useState(
    /** @type {import("./components/ViewNavigation.jsx").ViewName} */ (
      "limits"
    ),
  );

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
      <ViewNavigation
        currentView={currentView}
        onViewChange={setCurrentView}
        navigationMessages={messages.navigation}
      />
      <main className="app-main">
        {currentView === "limits" ? (
          <LimitsView messages={messages} />
        ) : (
          <HistoryView messages={messages} />
        )}
      </main>
    </>
  );
}

export default App;
