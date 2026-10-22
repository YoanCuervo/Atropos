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
  tray: {
    open: "Ouvrir Atropos",
    refresh: "Actualiser",
    quit: "Quitter",
    tooltip:
      "Atropos · semaine {percentage}\u00a0% · réinit. {resetTime} · relevé {updateTime}",
    noLimitsTooltip: "Atropos · aucune limite relevée",
  },
};
