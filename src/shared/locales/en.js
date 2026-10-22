/**
 * English texts, the default language. Each `{name}` is filled by `fillMessageTemplate`.
 * Every other locale must have exactly the same keys and placeholders.
 */
export default {
  languageName: "English",
  dateLocale: "en-GB",
  app: {
    subtitle: "Claude Code usage limits",
  },
  preferences: {
    title: "Display",
    languageLabel: "Language",
    themeLabel: "Theme",
    themes: {
      system: "System",
      light: "Light",
      dark: "Dark",
    },
    saveError: "The setting could not be saved.",
  },
  limits: {
    loading: "Loading limits…",
    loadError: "Atropos could not read the limits.",
    retry: "Try again",
    emptyTitle: "No limits recorded yet",
    emptyText:
      "Limits are recorded by the Claude Code status line. Open Claude Code in a terminal and send a message: they appear here within six minutes.",
    fiveHourTitle: "Session (5 hours)",
    sevenDayTitle: "Week",
    fiveHourReset: "at {time}",
    updatedPrefix: "Updated",
  },
  gauge: {
    used: "{percentage}% used",
    resetsPrefix: "Resets",
    missing: "No data for this limit yet.",
  },
  tray: {
    open: "Open Atropos",
    refresh: "Refresh now",
    quit: "Quit",
    tooltip:
      "Atropos · week {percentage}% · resets {resetTime} · updated {updateTime}",
    noLimitsTooltip: "Atropos · no limits recorded yet",
  },
};
