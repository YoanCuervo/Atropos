import AtroposLogo from "./AtroposLogo.jsx";
import GreekFretDivider from "./GreekFretDivider.jsx";
import UpdatedTimeTag from "./UpdatedTimeTag.jsx";

/** @typedef {import("../../../shared/locales/index.js").Messages} Messages */
/** @typedef {"limits" | "history" | "settings"} ViewName */

/** @type {readonly ViewName[]} */
const VIEW_NAMES = Object.freeze(["limits", "history", "settings"]);

/** @type {Readonly<Record<ViewName, string>>} */
const VIEW_ICON_PATHS = Object.freeze({
  limits: "M4 15a8 8 0 1 1 16 0 M12 15l4-5",
  history: "M4 4v16h16 M7 15l4-5 3 3 5-6",
  settings:
    "M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z M12 3v3 M12 18v3 M3 12h3 M18 12h3 M5.6 5.6l2.1 2.1 M16.3 16.3l2.1 2.1 M5.6 18.4l2.1-2.1 M16.3 7.7l2.1-2.1",
});

/**
 * The logo, the switch between the views, and when the limits were last recorded.
 *
 * @param {object} props
 * @param {ViewName} props.currentView
 * @param {(viewName: ViewName) => void} props.onViewChange
 * @param {string | null} props.lastRecordedAt ISO 8601 start of the latest slot, or `null` before the first one.
 * @param {Messages} props.messages Texts of the chosen language.
 */
function Sidebar({ currentView, onViewChange, lastRecordedAt, messages }) {
  const navigationMessages = messages.navigation;

  return (
    <aside className="sidebar">
      <h1 className="sidebar__title">
        <AtroposLogo />
        Atropos
      </h1>
      <nav
        className="sidebar__navigation"
        aria-label={navigationMessages.label}
      >
        <ul className="sidebar__list">
          {VIEW_NAMES.map((viewName) => (
            <li key={viewName}>
              <button
                type="button"
                className="sidebar__button"
                aria-current={viewName === currentView ? "page" : undefined}
                onClick={() => onViewChange(viewName)}
              >
                <svg
                  className="sidebar__icon"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d={VIEW_ICON_PATHS[viewName]} />
                </svg>
                {navigationMessages[viewName]}
              </button>
            </li>
          ))}
        </ul>
      </nav>
      <div className="sidebar__footer">
        <GreekFretDivider />
        {lastRecordedAt !== null && (
          <UpdatedTimeTag
            recordedAt={lastRecordedAt}
            updatedPrefix={messages.limits.updatedPrefix}
            dateLocale={messages.dateLocale}
          />
        )}
      </div>
    </aside>
  );
}

export default Sidebar;
