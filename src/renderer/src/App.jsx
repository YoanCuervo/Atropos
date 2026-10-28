import { useState } from "react";
import AtroposLogo from "./components/AtroposLogo.jsx";
import ViewNavigation from "./components/ViewNavigation.jsx";
import { useSettings } from "./hooks/useSettings.js";
import HistoryView from "./views/HistoryView.jsx";
import LimitsView from "./views/LimitsView.jsx";
import SettingsView from "./views/SettingsView.jsx";

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
        <h1 className="app-header__title">
          <AtroposLogo />
          Atropos
        </h1>
        <p className="app-header__subtitle">{messages.app.subtitle}</p>
      </header>
      <ViewNavigation
        currentView={currentView}
        onViewChange={setCurrentView}
        navigationMessages={messages.navigation}
      />
      <main className="app-main">
        {currentView === "limits" && <LimitsView messages={messages} />}
        {currentView === "history" && <HistoryView messages={messages} />}
        {currentView === "settings" && (
          <SettingsView
            settings={settings}
            messages={messages}
            onSettingsChange={changeSettings}
            hasSaveFailed={hasSaveFailed}
          />
        )}
      </main>
    </>
  );
}

export default App;
