import LimitsView from "./views/LimitsView.jsx";

function App() {
  return (
    <>
      <header className="app-header">
        <h1 className="app-header__title">Atropos</h1>
        <p className="app-header__subtitle">Claude Code usage limits</p>
      </header>
      <main className="app-main">
        <LimitsView />
      </main>
    </>
  );
}

export default App;
