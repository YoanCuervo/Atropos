/**
 * French texts. Percent signs follow a non-breaking space, as French typography requires.
 */
export default {
  languageName: "Français",
  dateLocale: "fr-FR",
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
    title: "Limites",
    paceLabel: "Avance sur le rythme",
    remainingLabel: "Réinitialisation dans",
    comparisonLabel: "Par rapport à la semaine dernière",
    notRecorded: "Non relevé",
    loading: "Chargement des limites…",
    loadError: "Atropos n’a pas pu lire les limites.",
    retry: "Réessayer",
    emptyTitle: "Aucune limite relevée pour l’instant",
    emptyText:
      "Les limites sont relevées par le mod Atropos dans Claude Code. Ouvrez Claude Code et envoyez un message : elles apparaissent ici dès sa réponse.",
    fiveHourTitle: "Session (5 heures)",
    sevenDayTitle: "Semaine",
    fiveHourReset: "à {time}",
    updatedPrefix: "Mis à jour",
  },
  usageLevels: {
    comfortable: "Confortable",
    warning: "Attention",
    critical: "Critique",
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
    settings: "Réglages",
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
  settings: {
    title: "Réglages",
  },
  alertSettings: {
    title: "Alerte hebdomadaire",
    enabledLabel:
      "Me prévenir quand l’utilisation hebdomadaire atteint le seuil",
    thresholdLabel: "Seuil (%)",
    thresholdHint:
      "Un nombre entier de {min} à {max}. Une notification par semaine au plus.",
    invalidThreshold: "Saisissez un nombre entier de {min} à {max}.",
  },
  historyClearing: {
    title: "Historique",
    explanation:
      "Atropos conserve les relevés des 12 derniers mois sur cet ordinateur uniquement. L’effacement les supprime tous, y compris ceux en attente d’import.",
    button: "Effacer l’historique",
    cleared: "Historique effacé.",
    failed: "L’historique n’a pas pu être effacé.",
  },
  statusLineSetup: {
    title: "Barre d’état",
    explanation:
      "Le mod Atropos relève vos limites dans Claude Code. La barre d’état sert de secours dans un terminal où le mod n’est pas chargé. Atropos ne modifie jamais vos réglages de Claude Code : c’est vous qui l’ajoutez.",
    stepOpen:
      "Ouvrez le fichier de réglages de Claude Code, ~/.claude/settings.json.",
    stepPaste:
      "Ajoutez le bloc ci-dessous au premier niveau du fichier, puis enregistrez-le.",
    stepUse:
      "Utilisez Claude Code dans un terminal, connecté avec un abonnement Pro ou Max. Les limites apparaissent ici après chaque réponse.",
    desktopNote:
      "Seul Claude Code dans un terminal lance la barre d’état. L’application de bureau relève les limites uniquement grâce au mod.",
    codeLabel: "Bloc à ajouter à ~/.claude/settings.json",
    copyButton: "Copier",
    copied: "Copié.",
    copyFailed:
      "La copie a échoué : sélectionnez le bloc et copiez-le à la main.",
    loadError: "Atropos n’a pas pu préparer le bloc.",
  },
  clearDialog: {
    title: "Effacer l’historique",
    message: "Supprimer toutes les limites relevées ?",
    detail:
      "Tous les relevés conservés par Atropos sur cet ordinateur sont supprimés. Cette action est définitive.",
    cancel: "Annuler",
    confirm: "Effacer l’historique",
  },
  weeklyAlert: {
    title: "Atropos · limite hebdomadaire",
    body: "Vous avez utilisé {percentage}\u00a0% de votre limite hebdomadaire. Réinitialisation {resetTime}.",
  },
  band: {
    fiveHourLabel: "5h",
    sevenDayLabel: "Semaine",
    remainingMinutes: "{minutes}\u00a0min",
    remainingHours: "{hours}h{minutes}",
    remainingDays: "{days}j {hours}h",
    logoAlt: "Atropos",
    contextBarAlt: "Contexte rempli à {percentage}",
    limitBarAlt: "{label}\u00a0: {percentage} utilisés",
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
