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
    "M10.26 5.01 L10.33 2.65 L13.67 2.65 L13.74 5.01 L15.71 5.83 L17.43 4.21 L19.79 6.57 L18.17 8.29 L18.99 10.26 L21.35 10.33 L21.35 13.67 L18.99 13.74 L18.17 15.71 L19.79 17.43 L17.43 19.79 L15.71 18.17 L13.74 18.99 L13.67 21.35 L10.33 21.35 L10.26 18.99 L8.29 18.17 L6.57 19.79 L4.21 17.43 L5.83 15.71 L5.01 13.74 L2.65 13.67 L2.65 10.33 L5.01 10.26 L5.83 8.29 L4.21 6.57 L6.57 4.21 L8.29 5.83Z M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0z",
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
    <header className="sidebar">
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
    </header>
  );
}

export default Sidebar;
