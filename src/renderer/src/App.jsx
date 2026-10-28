import { useState } from "react";
import { findLatestSnapshot } from "../../core/snapshot-journal.js";
import Sidebar from "./components/Sidebar.jsx";
import { useLimitsOverview } from "./hooks/useLimitsOverview.js";
import { useSettings } from "./hooks/useSettings.js";
import HistoryView from "./views/HistoryView.jsx";
import LimitsView from "./views/LimitsView.jsx";
import SettingsView from "./views/SettingsView.jsx";

function App() {
  const { settings, messages, changeSettings, hasSaveFailed } = useSettings();
  const limitsOverviewState = useLimitsOverview();
  const [currentView, setCurrentView] = useState(
    /** @type {import("./components/Sidebar.jsx").ViewName} */ ("limits"),
  );

  if (settings === null) {
    return null;
  }

  const { limitsOverview } = limitsOverviewState;
  const latestSnapshot =
    limitsOverview === null
      ? null
      : findLatestSnapshot([limitsOverview.fiveHour, limitsOverview.sevenDay]);

  return (
    <div className="app-layout">
      <Sidebar
        currentView={currentView}
        onViewChange={setCurrentView}
        lastRecordedAt={latestSnapshot?.slotStartedAt ?? null}
        messages={messages}
      />
      <main className="app-main">
        {currentView === "limits" && (
          <LimitsView
            limitsOverviewState={limitsOverviewState}
            messages={messages}
          />
        )}
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
    </div>
  );
}

export default App;
