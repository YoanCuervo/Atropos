/** @typedef {import("../../../shared/locales/index.js").Messages} Messages */
/** @typedef {"limits" | "history" | "settings"} ViewName */

/** @type {readonly ViewName[]} */
const VIEW_NAMES = Object.freeze(["limits", "history", "settings"]);

/**
 * Switches between the views of the window. The current one is marked for assistive technologies too.
 *
 * @param {object} props
 * @param {ViewName} props.currentView
 * @param {(viewName: ViewName) => void} props.onViewChange
 * @param {Messages["navigation"]} props.navigationMessages
 */
function ViewNavigation({ currentView, onViewChange, navigationMessages }) {
  return (
    <nav className="view-navigation" aria-label={navigationMessages.label}>
      <ul className="view-navigation__list">
        {VIEW_NAMES.map((viewName) => (
          <li key={viewName}>
            <button
              type="button"
              className="view-navigation__button"
              aria-current={viewName === currentView ? "page" : undefined}
              onClick={() => onViewChange(viewName)}
            >
              {navigationMessages[viewName]}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export default ViewNavigation;
