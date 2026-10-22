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
  navigation: {
    label: "Views",
    limits: "Limits",
    history: "History",
  },
  history: {
    title: "History",
    periodLabel: "Period",
    sevenDays: "7 days",
    thirtyDays: "30 days",
    loading: "Loading history…",
    loadError: "Atropos could not read the history.",
    retry: "Try again",
    empty: "No history recorded for this period yet.",
    chartTitle: "Usage over the last {dayCount} days",
    chartDescription:
      "Line chart of the weekly and session usage over the last {dayCount} days. The same data is in the table below.",
    sevenDaySeries: "Week",
    fiveHourSeries: "Session (5 hours)",
    tableToggle: "Show the data as a table",
    tableCaption: "Usage by day over the last {dayCount} days",
    dayColumn: "Day",
    fiveHourColumn: "Highest session usage",
    sevenDayColumn: "Weekly usage at end of day",
    noData: "No data",
    percentage: "{percentage}%",
  },
  comparison: {
    title: "Compared with last week",
    current: "This week",
    samePoint: "Last week at the same point",
    previousLast: "Last week, last recorded",
    notRecorded: "Not recorded",
    pointsLess: "{points} points less",
    onePointLess: "1 point less",
    pointsMore: "{points} points more",
    onePointMore: "1 point more",
    same: "Same as last week",
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
