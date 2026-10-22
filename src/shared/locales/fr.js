/**
 * French texts. Percent signs follow a non-breaking space, as French typography requires.
 */
export default {
  languageName: "Français",
  dateLocale: "fr-FR",
  app: {
    subtitle: "Limites d’utilisation de Claude Code",
  },
  preferences: {
    title: "Affichage",
    languageLabel: "Langue",
    themeLabel: "Thème",
    themes: {
      system: "Système",
      light: "Clair",
      dark: "Sombre",
    },
    saveError: "Le réglage n’a pas pu être enregistré.",
  },
  limits: {
    loading: "Chargement des limites…",
    loadError: "Atropos n’a pas pu lire les limites.",
    retry: "Réessayer",
    emptyTitle: "Aucune limite relevée pour l’instant",
    emptyText:
      "Les limites sont relevées par la barre d’état de Claude Code. Ouvrez Claude Code dans un terminal et envoyez un message : elles apparaissent ici en moins de six minutes.",
    fiveHourTitle: "Session (5 heures)",
    sevenDayTitle: "Semaine",
    fiveHourReset: "à {time}",
    updatedPrefix: "Mis à jour",
  },
  gauge: {
    used: "{percentage}\u00a0% utilisés",
    resetsPrefix: "Réinitialisation",
    missing: "Pas encore de données pour cette limite.",
  },
  navigation: {
    label: "Vues",
    limits: "Limites",
    history: "Historique",
  },
  history: {
    title: "Historique",
    periodLabel: "Période",
    sevenDays: "7 jours",
    thirtyDays: "30 jours",
    loading: "Chargement de l’historique…",
    loadError: "Atropos n’a pas pu lire l’historique.",
    retry: "Réessayer",
    empty: "Aucun historique relevé sur cette période pour l’instant.",
    chartTitle: "Utilisation sur les {dayCount} derniers jours",
    chartDescription:
      "Courbe de l’utilisation hebdomadaire et de la session sur les {dayCount} derniers jours. Les mêmes données figurent dans le tableau ci-dessous.",
    sevenDaySeries: "Semaine",
    fiveHourSeries: "Session (5 heures)",
    tableToggle: "Afficher les données en tableau",
    tableCaption: "Utilisation par jour sur les {dayCount} derniers jours",
    dayColumn: "Jour",
    fiveHourColumn: "Pic de la session",
    sevenDayColumn: "Semaine en fin de journée",
    noData: "Pas de données",
    percentage: "{percentage}\u00a0%",
  },
  comparison: {
    title: "Par rapport à la semaine dernière",
    current: "Cette semaine",
    samePoint: "Semaine dernière au même moment",
    previousLast: "Semaine dernière, dernier relevé",
    notRecorded: "Non relevé",
    pointsLess: "{points} points de moins",
    onePointLess: "1 point de moins",
    pointsMore: "{points} points de plus",
    onePointMore: "1 point de plus",
    same: "Identique à la semaine dernière",
  },
  tray: {
    open: "Ouvrir Atropos",
    refresh: "Actualiser",
    quit: "Quitter",
    tooltip:
      "Atropos · semaine {percentage}\u00a0% · réinit. {resetTime} · relevé {updateTime}",
    noLimitsTooltip: "Atropos · aucune limite relevée",
  },
};
