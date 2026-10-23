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
    settings: "Settings",
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
  settings: {
    title: "Settings",
  },
  alertSettings: {
    title: "Weekly alert",
    enabledLabel: "Notify me when the weekly usage reaches the threshold",
    thresholdLabel: "Threshold (%)",
    thresholdHint:
      "A whole number from {min} to {max}. One notification per week at most.",
    invalidThreshold: "Enter a whole number from {min} to {max}.",
  },
  historyClearing: {
    title: "History",
    explanation:
      "Atropos keeps the snapshots of the last 12 months on this computer only. Clearing deletes all of them, including those waiting to be imported.",
    button: "Clear history",
    cleared: "History cleared.",
    failed: "The history could not be cleared.",
  },
  statusLineSetup: {
    title: "Status line",
    explanation:
      "Atropos records your limits through the Claude Code status line. Atropos never edits your Claude Code settings: you add the status line yourself.",
    stepOpen: "Open the Claude Code settings file, ~/.claude/settings.json.",
    stepPaste:
      "Add the block below at the top level of the file, then save it.",
    stepUse:
      "Use Claude Code in a terminal, signed in with a Pro or Max plan. Limits appear here within six minutes.",
    desktopNote:
      "Only Claude Code in a terminal runs the status line: the desktop app does not record limits.",
    codeLabel: "Block to add to ~/.claude/settings.json",
    copyButton: "Copy",
    copied: "Copied.",
    copyFailed: "Copy failed: select the block and copy it by hand.",
    loadError: "Atropos could not prepare the block.",
  },
  clearDialog: {
    title: "Clear history",
    message: "Delete all recorded limits?",
    detail:
      "Every snapshot stored by Atropos on this computer is deleted. This cannot be undone.",
    cancel: "Cancel",
    confirm: "Clear history",
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
