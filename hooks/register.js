import { atom, read, update } from "claude-code";
// src/core/errors.js
/**
* Base class of the errors raised when received data has a malformed field.
*/
var InvalidFieldError = class extends Error {
	/**
	* @param {string} subject What was being read, e.g. "rate limits".
	* @param {string} fieldPath Path of the malformed field, or a parenthesized name for the whole value.
	* @param {unknown} receivedValue Value found at that path.
	*/
	constructor(subject, fieldPath, receivedValue) {
		super(`Invalid ${subject} field "${fieldPath}": received ${JSON.stringify(receivedValue)}.`);
		this.fieldPath = fieldPath;
	}
};
var InvalidRateLimitsError = class extends InvalidFieldError {
	/**
	* @param {string} fieldPath e.g. "rate_limits.five_hour.resets_at", or "(payload)".
	* @param {unknown} receivedValue
	*/
	constructor(fieldPath, receivedValue) {
		super("rate limits", fieldPath, receivedValue);
		this.name = "InvalidRateLimitsError";
	}
};
var InvalidJournalLineError = class extends InvalidFieldError {
	/**
	* @param {string} fieldPath e.g. "resetsAt", or "(line)" when the whole line is unreadable.
	* @param {unknown} receivedValue
	*/
	constructor(fieldPath, receivedValue) {
		super("journal line", fieldPath, receivedValue);
		this.name = "InvalidJournalLineError";
	}
};
var MissingTemplateValueError = class extends Error {
	/**
	* @param {string} placeholderName Name of the placeholder that received no value, e.g. "percentage".
	*/
	constructor(placeholderName) {
		super(`No value given for the message placeholder "{${placeholderName}}".`);
		this.name = "MissingTemplateValueError";
		this.placeholderName = placeholderName;
	}
};
// src/core/message-template.js
var PLACEHOLDER_PATTERN = /\{(\w+)\}/g;
/**
* Replaces each `{name}` of a translated message with its value,
* e.g. "Resets {time}" and `{ time: "09:00" }` give "Resets 09:00".
*
* @param {string} messageTemplate
* @param {Record<string, string | number>} [values]
* @returns {string}
* @throws {MissingTemplateValueError} When a placeholder has no value.
*/
function fillMessageTemplate(messageTemplate, values = {}) {
	return messageTemplate.replace(PLACEHOLDER_PATTERN, (_placeholder, placeholderName) => {
		if (!Object.hasOwn(values, placeholderName)) throw new MissingTemplateValueError(placeholderName);
		return String(values[placeholderName]);
	});
}
// src/core/band-text.js
var MILLISECONDS_PER_MINUTE = 6e4;
var MINUTES_PER_HOUR = 60;
var HOURS_PER_DAY = 24;
var TOKENS_PER_THOUSAND = 1e3;
var MODEL_FAMILY_NAMES = Object.freeze([
	"Opus",
	"Sonnet",
	"Haiku",
	"Fable"
]);
/**
* @typedef {object} RemainingTimeMessages
* @property {string} remainingMinutes e.g. "{minutes}m".
* @property {string} remainingHours e.g. "{hours}h{minutes}".
* @property {string} remainingDays e.g. "{days}d {hours}h".
*/
/**
* Writes the time left before a window resets, as precisely as the band has room for.
*
* @param {number} remainingMs Negative once the window has reset.
* @param {RemainingTimeMessages} remainingTimeMessages Texts of the chosen language.
* @returns {string} e.g. "45m", "3h05" or "1d 4h".
*/
function formatRemainingTime(remainingMs, remainingTimeMessages) {
	const totalMinutes = Math.max(Math.floor(remainingMs / MILLISECONDS_PER_MINUTE), 0);
	const totalHours = Math.floor(totalMinutes / MINUTES_PER_HOUR);
	if (totalHours === 0) return fillMessageTemplate(remainingTimeMessages.remainingMinutes, { minutes: totalMinutes });
	if (totalHours < HOURS_PER_DAY) return fillMessageTemplate(remainingTimeMessages.remainingHours, {
		hours: totalHours,
		minutes: String(totalMinutes % MINUTES_PER_HOUR).padStart(2, "0")
	});
	return fillMessageTemplate(remainingTimeMessages.remainingDays, {
		days: Math.floor(totalHours / HOURS_PER_DAY),
		hours: totalHours % HOURS_PER_DAY
	});
}
/**
* @param {number} percentage From 0 to 100.
* @param {string} locale e.g. "fr-FR".
* @returns {string} e.g. "36%" or "36 %".
*/
function formatWholePercentage(percentage, locale) {
	return new Intl.NumberFormat(locale, {
		style: "percent",
		maximumFractionDigits: 0
	}).format(percentage / 100);
}
/**
* The sign is always written, so the pace is never told by colour alone.
*
* @param {number} percentagePoints e.g. 3.8 or -12.
* @param {string} locale
* @returns {string} e.g. "+3.8%" or "-12.0%".
*/
function formatSignedPercentage(percentagePoints, locale) {
	return new Intl.NumberFormat(locale, {
		style: "percent",
		minimumFractionDigits: 1,
		maximumFractionDigits: 1,
		signDisplay: "exceptZero"
	}).format(percentagePoints / 100);
}
/**
* @param {number} tokenCount
* @returns {string} e.g. "72k", or "850" under a thousand.
*/
function formatTokenCount(tokenCount) {
	return tokenCount >= TOKENS_PER_THOUSAND ? `${Math.round(tokenCount / TOKENS_PER_THOUSAND)}k` : String(tokenCount);
}
/**
* @param {string} modelId e.g. "claude-opus-5-5".
* @returns {string} The family name, e.g. "Opus", or the identifier itself when no family matches.
*/
function formatModelFamilyName(modelId) {
	const lowerCaseModelId = modelId.toLowerCase();
	return MODEL_FAMILY_NAMES.find((familyName) => lowerCaseModelId.includes(familyName.toLowerCase())) ?? modelId;
}
// src/core/limit-pace.js
/** @typedef {import("./rate-limits.js").LimitWindow} LimitWindow */
/** @typedef {import("./rate-limits.js").WindowKind} WindowKind */
/** @typedef {import("./snapshot-journal.js").LimitSnapshot} LimitSnapshot */
var MILLISECONDS_PER_HOUR = 36e5;
/** @type {Readonly<Record<WindowKind, number>>} */
var WINDOW_DURATIONS_MS = Object.freeze({
	five_hour: 5 * MILLISECONDS_PER_HOUR,
	seven_day: 168 * MILLISECONDS_PER_HOUR
});
/**
* Compares usage with a steady pace: the share of the window already elapsed
* minus the share used. Positive means usage is behind the pace, so there is margin left.
*
* @param {LimitWindow} limitWindow
* @param {number} nowMs
* @returns {number} Percentage points, e.g. 3.8 or -12.
*/
function computePaceDeltaPercentage(limitWindow, nowMs) {
	const windowDurationMs = WINDOW_DURATIONS_MS[limitWindow.windowKind];
	return Math.min(Math.max(windowDurationMs - (limitWindow.resetsAtMs - nowMs), 0), windowDurationMs) / windowDurationMs * 100 - limitWindow.usedPercentage;
}
// src/core/validation.js
/**
* @param {unknown} value
* @returns {value is Record<string, unknown>}
*/
function isPlainObject(value) {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}
/**
* @param {unknown} value
* @returns {value is number}
*/
function isNonNegativeFiniteNumber(value) {
	return typeof value === "number" && Number.isFinite(value) && value >= 0;
}
/**
* Tells whether a value is a timestamp written exactly as `Date.prototype.toISOString` writes it.
*
* @param {unknown} value
* @returns {value is string}
*/
function isIsoTimestamp(value) {
	if (typeof value !== "string") return false;
	const parsedDate = new Date(value);
	return !Number.isNaN(parsedDate.getTime()) && parsedDate.toISOString() === value;
}
// src/core/rate-limits.js
/** @typedef {"five_hour" | "seven_day"} WindowKind */
/** @type {readonly WindowKind[]} */
var WINDOW_KINDS = Object.freeze(["five_hour", "seven_day"]);
// src/core/session-rate-limits.js
/** @typedef {import("./rate-limits.js").RateLimits} RateLimits */
/** @typedef {import("./rate-limits.js").LimitWindow} LimitWindow */
/** @typedef {import("./rate-limits.js").WindowKind} WindowKind */
/**
* One rate-limit window as the Claude Code mods API reports it.
*
* @typedef {object} SessionRateLimit
* @property {string} kind e.g. "five_hour", "seven_day" or a gateway's "spend_limit".
* @property {number} percentUsed From 0 to 100.
* @property {string} [resetsAt] ISO 8601 timestamp.
*/
/**
* Reads the usage limits that `$.session.usage()` and `session.measure` give a mod,
* into the shape the status line produces. Windows other than the five-hour and
* weekly ones are ignored.
*
* @param {unknown} sessionRateLimits The `rateLimits` list of the mods API.
* @returns {RateLimits | null} `null` when neither window has a complete reading yet.
* @throws {InvalidRateLimitsError} When the list or one of its known windows is malformed.
*/
function readSessionRateLimits(sessionRateLimits) {
	if (!Array.isArray(sessionRateLimits)) throw new InvalidRateLimitsError("rateLimits", sessionRateLimits);
	const [fiveHour, sevenDay] = WINDOW_KINDS.map((windowKind) => readSessionLimitWindow(sessionRateLimits, windowKind));
	return fiveHour === null && sevenDay === null ? null : {
		fiveHour,
		sevenDay
	};
}
/**
* @param {unknown[]} sessionRateLimits
* @param {WindowKind} windowKind
* @returns {LimitWindow | null} `null` when the window is absent or has no reset time yet.
*/
function readSessionLimitWindow(sessionRateLimits, windowKind) {
	const windowPath = `rateLimits.${windowKind}`;
	const rawWindow = sessionRateLimits.find((candidate) => isPlainObject(candidate) && candidate.kind === windowKind);
	if (rawWindow === void 0 || rawWindow.resetsAt === void 0) return null;
	if (!isNonNegativeFiniteNumber(rawWindow.percentUsed)) throw new InvalidRateLimitsError(`${windowPath}.percentUsed`, rawWindow.percentUsed);
	if (!isIsoTimestamp(rawWindow.resetsAt)) throw new InvalidRateLimitsError(`${windowPath}.resetsAt`, rawWindow.resetsAt);
	return {
		windowKind,
		usedPercentage: rawWindow.percentUsed,
		resetsAtMs: Date.parse(rawWindow.resetsAt)
	};
}
// src/shared/locales/en.js
/**
* English texts, the default language. Each `{name}` is filled by `fillMessageTemplate`.
* Every other locale must have exactly the same keys and placeholders.
*/
var en_default = {
	languageName: "English",
	dateLocale: "en-GB",
	preferences: {
		title: "Display",
		languageLabel: "Language",
		themeLabel: "Theme",
		themes: {
			system: "System",
			light: "Light",
			dark: "Dark"
		},
		saveError: "The setting could not be saved."
	},
	limits: {
		title: "Limits",
		paceLabel: "Pace margin",
		remainingLabel: "Resets in",
		comparisonLabel: "Compared with last week",
		notRecorded: "Not recorded",
		loading: "Loading limits…",
		loadError: "Atropos could not read the limits.",
		retry: "Try again",
		emptyTitle: "No limits recorded yet",
		emptyText: "Limits are recorded by the Atropos mod in Claude Code. Open Claude Code and send a message: they appear here right after its reply.",
		fiveHourTitle: "Session (5 hours)",
		sevenDayTitle: "Week",
		fiveHourReset: "at {time}",
		updatedPrefix: "Updated"
	},
	usageLevels: {
		comfortable: "Comfortable",
		warning: "Watch",
		critical: "Critical"
	},
	gauge: {
		used: "{percentage}% used",
		resetsPrefix: "Resets",
		missing: "No data for this limit yet."
	},
	navigation: {
		label: "Views",
		skipToContent: "Skip to content",
		limits: "Limits",
		history: "History",
		settings: "Settings"
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
		chartDescription: "Line chart of the weekly and session usage over the last {dayCount} days. The same data is in the table below.",
		sevenDaySeries: "Week",
		fiveHourSeries: "Session (5 hours)",
		tableToggle: "Show the data as a table",
		tableCaption: "Usage by day over the last {dayCount} days",
		dayColumn: "Day",
		fiveHourColumn: "Highest session usage",
		sevenDayColumn: "Weekly usage at end of day",
		noData: "No data",
		percentage: "{percentage}%"
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
		same: "Same as last week"
	},
	settings: { title: "Settings" },
	alertSettings: {
		title: "Weekly alert",
		enabledLabel: "Notify me when the weekly usage reaches the threshold",
		thresholdLabel: "Threshold (%)",
		thresholdHint: "A whole number from {min} to {max}. One notification per week at most.",
		invalidThreshold: "Enter a whole number from {min} to {max}.",
		applyButton: "Apply",
		thresholdSaved: "Threshold saved."
	},
	historyClearing: {
		title: "History",
		explanation: "Atropos keeps the snapshots of the last 12 months on this computer only. Clearing deletes all of them, including those waiting to be imported.",
		button: "Clear history",
		cleared: "History cleared.",
		failed: "The history could not be cleared."
	},
	statusLineSetup: {
		title: "Status line",
		explanation: "The Atropos mod records your limits in Claude Code. The status line is a fallback for a terminal where the mod is not loaded. Atropos never edits your Claude Code settings: you add it yourself.",
		stepOpen: "Open the Claude Code settings file, ~/.claude/settings.json.",
		stepPaste: "Add the block below at the top level of the file, then save it.",
		stepUse: "Use Claude Code in a terminal, signed in with a Pro or Max plan. Limits appear here right after each reply.",
		desktopNote: "Only Claude Code in a terminal runs the status line. The desktop app records limits through the mod only.",
		codeLabel: "Block to add to ~/.claude/settings.json",
		copyButton: "Copy",
		copied: "Copied.",
		copyFailed: "Copy failed: select the block and copy it by hand.",
		loadError: "Atropos could not prepare the block."
	},
	about: {
		title: "About",
		versionLabel: "Version",
		versionUnknown: "Unknown",
		privacyNote: "Atropos keeps everything on this computer: no data is ever sent anywhere.",
		releasesLink: "See the releases (opens in your browser)",
		releasesHint: "Atropos never checks for updates by itself. Compare your version with the latest release and download its installer if needed."
	},
	clearDialog: {
		title: "Clear history",
		message: "Delete all recorded limits?",
		detail: "Every snapshot stored by Atropos on this computer is deleted. This cannot be undone.",
		cancel: "Cancel",
		confirm: "Clear history"
	},
	weeklyAlert: {
		title: "Atropos · weekly limit",
		body: "{percentage}% of your weekly limit is used. It resets {resetTime}."
	},
	band: {
		fiveHourLabel: "5h",
		sevenDayLabel: "Week",
		remainingMinutes: "{minutes}m",
		remainingHours: "{hours}h{minutes}",
		remainingDays: "{days}d {hours}h",
		logoAlt: "Atropos",
		contextBarAlt: "Context {percentage} full",
		limitBarAlt: "{label}: {percentage} used"
	},
	tray: {
		open: "Open Atropos",
		refresh: "Refresh now",
		quit: "Quit",
		tooltip: "Atropos · week {percentage}% · resets {resetTime} · updated {updateTime}",
		noLimitsTooltip: "Atropos · no limits recorded yet"
	}
};
// src/shared/locales/index.js
/** @typedef {typeof en} Messages */
/** @type {Readonly<Record<import("../../core/settings.js").Language, Messages>>} */
var MESSAGES_BY_LANGUAGE = Object.freeze({
	en: en_default,
	fr: {
		languageName: "Français",
		dateLocale: "fr-FR",
		preferences: {
			title: "Affichage",
			languageLabel: "Langue",
			themeLabel: "Thème",
			themes: {
				system: "Système",
				light: "Clair",
				dark: "Sombre"
			},
			saveError: "Le réglage n’a pas pu être enregistré."
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
			emptyText: "Les limites sont relevées par le mod Atropos dans Claude Code. Ouvrez Claude Code et envoyez un message : elles apparaissent ici dès sa réponse.",
			fiveHourTitle: "Session (5 heures)",
			sevenDayTitle: "Semaine",
			fiveHourReset: "à {time}",
			updatedPrefix: "Mis à jour"
		},
		usageLevels: {
			comfortable: "Confortable",
			warning: "Attention",
			critical: "Critique"
		},
		gauge: {
			used: "{percentage}\xA0% utilisés",
			resetsPrefix: "Réinitialisation",
			missing: "Pas encore de données pour cette limite."
		},
		navigation: {
			label: "Vues",
			skipToContent: "Aller au contenu",
			limits: "Limites",
			history: "Historique",
			settings: "Réglages"
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
			chartDescription: "Courbe de l’utilisation hebdomadaire et de la session sur les {dayCount} derniers jours. Les mêmes données figurent dans le tableau ci-dessous.",
			sevenDaySeries: "Semaine",
			fiveHourSeries: "Session (5 heures)",
			tableToggle: "Afficher les données en tableau",
			tableCaption: "Utilisation par jour sur les {dayCount} derniers jours",
			dayColumn: "Jour",
			fiveHourColumn: "Pic de la session",
			sevenDayColumn: "Semaine en fin de journée",
			noData: "Pas de données",
			percentage: "{percentage}\xA0%"
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
			same: "Identique à la semaine dernière"
		},
		settings: { title: "Réglages" },
		alertSettings: {
			title: "Alerte hebdomadaire",
			enabledLabel: "Me prévenir quand l’utilisation hebdomadaire atteint le seuil",
			thresholdLabel: "Seuil (%)",
			thresholdHint: "Un nombre entier de {min} à {max}. Une notification par semaine au plus.",
			invalidThreshold: "Saisissez un nombre entier de {min} à {max}.",
			applyButton: "Appliquer",
			thresholdSaved: "Seuil enregistré."
		},
		historyClearing: {
			title: "Historique",
			explanation: "Atropos conserve les relevés des 12 derniers mois sur cet ordinateur uniquement. L’effacement les supprime tous, y compris ceux en attente d’import.",
			button: "Effacer l’historique",
			cleared: "Historique effacé.",
			failed: "L’historique n’a pas pu être effacé."
		},
		statusLineSetup: {
			title: "Barre d’état",
			explanation: "Le mod Atropos relève vos limites dans Claude Code. La barre d’état sert de secours dans un terminal où le mod n’est pas chargé. Atropos ne modifie jamais vos réglages de Claude Code : c’est vous qui l’ajoutez.",
			stepOpen: "Ouvrez le fichier de réglages de Claude Code, ~/.claude/settings.json.",
			stepPaste: "Ajoutez le bloc ci-dessous au premier niveau du fichier, puis enregistrez-le.",
			stepUse: "Utilisez Claude Code dans un terminal, connecté avec un abonnement Pro ou Max. Les limites apparaissent ici après chaque réponse.",
			desktopNote: "Seul Claude Code dans un terminal lance la barre d’état. L’application de bureau relève les limites uniquement grâce au mod.",
			codeLabel: "Bloc à ajouter à ~/.claude/settings.json",
			copyButton: "Copier",
			copied: "Copié.",
			copyFailed: "La copie a échoué : sélectionnez le bloc et copiez-le à la main.",
			loadError: "Atropos n’a pas pu préparer le bloc."
		},
		about: {
			title: "À propos",
			versionLabel: "Version",
			versionUnknown: "Inconnue",
			privacyNote: "Atropos garde tout sur cet ordinateur : aucune donnée n’est jamais envoyée.",
			releasesLink: "Voir les versions (s’ouvre dans le navigateur)",
			releasesHint: "Atropos ne cherche jamais de mise à jour tout seul. Comparez votre version à la dernière publiée et téléchargez son installateur si besoin."
		},
		clearDialog: {
			title: "Effacer l’historique",
			message: "Supprimer toutes les limites relevées ?",
			detail: "Tous les relevés conservés par Atropos sur cet ordinateur sont supprimés. Cette action est définitive.",
			cancel: "Annuler",
			confirm: "Effacer l’historique"
		},
		weeklyAlert: {
			title: "Atropos · limite hebdomadaire",
			body: "Vous avez utilisé {percentage}\xA0% de votre limite hebdomadaire. Réinitialisation {resetTime}."
		},
		band: {
			fiveHourLabel: "5h",
			sevenDayLabel: "Semaine",
			remainingMinutes: "{minutes}\xA0min",
			remainingHours: "{hours}h{minutes}",
			remainingDays: "{days}j {hours}h",
			logoAlt: "Atropos",
			contextBarAlt: "Contexte rempli à {percentage}",
			limitBarAlt: "{label}\xA0: {percentage} utilisés"
		},
		tray: {
			open: "Ouvrir Atropos",
			refresh: "Actualiser",
			quit: "Quitter",
			tooltip: "Atropos · semaine {percentage}\xA0% · réinit. {resetTime} · relevé {updateTime}",
			noLimitsTooltip: "Atropos · aucune limite relevée"
		}
	}
});
/**
* @param {import("../../core/settings.js").Language} language
* @returns {Messages}
*/
function getMessages(language) {
	return MESSAGES_BY_LANGUAGE[language] ?? en_default;
}
// src/core/journal-location.js
/**
* Outside AppData on purpose: packaged apps such as Claude Desktop see a private copy
* of AppData, so a journal written there by the mod never reaches the Atropos app.
*/
var SHARED_FOLDER_NAME = ".atropos";
var JOURNAL_FILE_NAME = "limit-snapshots.jsonl";
// src/core/settings-location.js
var SETTINGS_FILE_NAME = "settings.json";
// src/core/settings.js
/** @typedef {"en" | "fr"} Language */
/** @typedef {"system" | "light" | "dark"} Theme */
/**
* @typedef {object} Settings
* @property {Language} language Language of the interface, the tray tooltip and the tray menu.
* @property {Theme} theme "system" follows the Windows setting.
* @property {boolean} isWeeklyAlertEnabled Whether a notification is sent when the weekly usage reaches the threshold.
* @property {number} weeklyAlertThresholdPercentage Whole percentage, from `MIN_ALERT_THRESHOLD_PERCENTAGE` to 100.
*/
/**
* @typedef {object} SettingsChange
* @property {Language} [language]
* @property {Theme} [theme]
* @property {boolean} [isWeeklyAlertEnabled]
* @property {number} [weeklyAlertThresholdPercentage]
*/
/** @type {readonly Language[]} */
var LANGUAGES = Object.freeze(["en", "fr"]);
/** @type {readonly Theme[]} */
var THEMES = Object.freeze([
	"system",
	"light",
	"dark"
]);
/** @type {Readonly<Settings>} */
var DEFAULT_SETTINGS = Object.freeze({
	language: "en",
	theme: "system",
	isWeeklyAlertEnabled: true,
	weeklyAlertThresholdPercentage: 80
});
/** @type {Readonly<Record<keyof Settings, (value: unknown) => boolean>>} */
var IS_VALID_VALUE_BY_SETTING = Object.freeze({
	language: (value) => LANGUAGES.includes(value),
	theme: (value) => THEMES.includes(value),
	isWeeklyAlertEnabled: (value) => typeof value === "boolean",
	weeklyAlertThresholdPercentage: (value) => isValidAlertThresholdPercentage(value)
});
/**
* @param {unknown} value
* @returns {value is number} Whether the value is a whole percentage from `MIN_ALERT_THRESHOLD_PERCENTAGE` to 100.
*/
function isValidAlertThresholdPercentage(value) {
	return Number.isInteger(value) && value >= 10 && value <= 100;
}
/**
* Reads the settings found in `settings.json`. The file may have been edited by hand,
* so each missing or invalid setting falls back to its default instead of failing.
*
* @param {unknown} storedSettings Parsed content of the file, of any shape.
* @returns {Settings} A new object holding only the known settings.
*/
function readStoredSettings(storedSettings) {
	const storedValues = isPlainObject(storedSettings) ? storedSettings : {};
	return Object.fromEntries(Object.entries(IS_VALID_VALUE_BY_SETTING).map(([settingName, isValidValue]) => [settingName, isValidValue(storedValues[settingName]) ? storedValues[settingName] : DEFAULT_SETTINGS[settingName]]));
}
// src/core/snapshot-journal.js
/** @typedef {import("./rate-limits.js").RateLimits} RateLimits */
/** @typedef {import("./rate-limits.js").WindowKind} WindowKind */
/**
* One line of the `limit-snapshots.jsonl` journal: the state of one limit window during one slot.
*
* @typedef {object} LimitSnapshot
* @property {string} slotStartedAt ISO 8601 UTC start of the six-minute slot.
* @property {WindowKind} windowKind
* @property {number} usedPercentage Share of the window already used, from 0 to 100.
* @property {string} resetsAt ISO 8601 UTC time when the window resets.
*/
/**
* Turns the rate limits read during a slot into one snapshot per window present.
*
* @param {RateLimits} rateLimits Result of `readRateLimits`.
* @param {number} slotStartMs Start of the slot, as returned by `computeSlotStartMs`.
* @returns {LimitSnapshot[]} Empty when no window is present.
*/
function createLimitSnapshots(rateLimits, slotStartMs) {
	const slotStartedAt = new Date(slotStartMs).toISOString();
	return [rateLimits.fiveHour, rateLimits.sevenDay].filter((limitWindow) => limitWindow !== null).map((limitWindow) => ({
		slotStartedAt,
		windowKind: limitWindow.windowKind,
		usedPercentage: limitWindow.usedPercentage,
		resetsAt: new Date(limitWindow.resetsAtMs).toISOString()
	}));
}
/**
* Writes a snapshot as a journal line, newline included, ready to be appended.
* Fields are always written in the same order, and nothing else is written.
*
* @param {LimitSnapshot} limitSnapshot
* @returns {string}
*/
function formatJournalLine(limitSnapshot) {
	const { slotStartedAt, windowKind, usedPercentage, resetsAt } = limitSnapshot;
	return `${JSON.stringify({
		slotStartedAt,
		windowKind,
		usedPercentage,
		resetsAt
	})}\n`;
}
/**
* Reads back a journal line written by `formatJournalLine`.
*
* @param {string} journalLine One line of the journal, with or without its newline.
* @returns {LimitSnapshot}
* @throws {InvalidJournalLineError} When the line is not valid JSON or a field is malformed.
*/
function parseJournalLine(journalLine) {
	const journalEntry = parseJson(journalLine);
	if (!isPlainObject(journalEntry)) throw new InvalidJournalLineError("(line)", journalLine);
	const { slotStartedAt, windowKind, usedPercentage, resetsAt } = journalEntry;
	if (!isIsoTimestamp(slotStartedAt)) throw new InvalidJournalLineError("slotStartedAt", slotStartedAt);
	if (!WINDOW_KINDS.includes(windowKind)) throw new InvalidJournalLineError("windowKind", windowKind);
	if (!isNonNegativeFiniteNumber(usedPercentage)) throw new InvalidJournalLineError("usedPercentage", usedPercentage);
	if (!isIsoTimestamp(resetsAt)) throw new InvalidJournalLineError("resetsAt", resetsAt);
	return {
		slotStartedAt,
		windowKind,
		usedPercentage,
		resetsAt
	};
}
/**
* @param {string} journalLine
* @returns {unknown}
* @throws {InvalidJournalLineError}
*/
function parseJson(journalLine) {
	try {
		return JSON.parse(journalLine);
	} catch {
		throw new InvalidJournalLineError("(line)", journalLine);
	}
}
/**
* Reads journal lines back into snapshots, skipping the lines that cannot be read.
* A single damaged line must not prevent the rest of the journal from being used.
*
* @param {string[]} journalLines
* @returns {LimitSnapshot[]}
*/
function parseReadableJournalLines(journalLines) {
	return journalLines.flatMap((journalLine) => {
		try {
			return [parseJournalLine(journalLine)];
		} catch (error) {
			if (error instanceof InvalidJournalLineError) return [];
			throw error;
		}
	});
}
/**
* Keeps the candidate snapshots whose slot and window are not recorded yet,
* so the journal holds at most one snapshot per slot and per window: the first one observed.
*
* @param {LimitSnapshot[]} candidateSnapshots Snapshots of the current slot.
* @param {LimitSnapshot[]} recordedSnapshots Snapshots already in the journal.
* @returns {LimitSnapshot[]}
*/
function selectSnapshotsToRecord(candidateSnapshots, recordedSnapshots) {
	const recordedSnapshotKeys = new Set(recordedSnapshots.map(createSnapshotKey));
	return candidateSnapshots.filter((candidateSnapshot) => !recordedSnapshotKeys.has(createSnapshotKey(candidateSnapshot)));
}
/**
* @param {LimitSnapshot} limitSnapshot
* @returns {string}
*/
function createSnapshotKey(limitSnapshot) {
	return `${limitSnapshot.slotStartedAt}|${limitSnapshot.windowKind}`;
}
// src/core/time-slots.js
var SLOT_DURATION_MS = 36e4;
/**
* Returns the start of the six-minute slot that contains a timestamp.
* Slots are aligned on the clock: :00, :06, :12 and so on, ten per hour.
*
* @param {number} timestampMs Unix timestamp, in milliseconds.
* @returns {number} Unix timestamp, in milliseconds, of the slot start.
*/
function computeSlotStartMs(timestampMs) {
	return Math.floor(timestampMs / SLOT_DURATION_MS) * SLOT_DURATION_MS;
}
// src/mod/atropos-files.js
/** @typedef {import("../core/rate-limits.js").RateLimits} RateLimits */
/** @typedef {import("../core/settings.js").Language} Language */
/**
* The mods API, `$`: the only way the mod reaches files and the environment.
*
* @typedef {import("claude-code").EngineInterface} ModsApi
*/
/**
* @param {ModsApi} $
* @param {string} fileName
* @returns {Promise<string | null>} Absolute path in `%USERPROFILE%\.atropos`, or `null` without `USERPROFILE`.
*/
async function resolveAtroposFilePath($, fileName) {
	const homePath = await $.env.get("USERPROFILE");
	return homePath === void 0 ? null : `${homePath}\\${SHARED_FOLDER_NAME}\\${fileName}`;
}
/**
* Follows the language chosen in the Atropos app; English when it has no settings yet.
*
* @param {ModsApi} $
* @returns {Promise<Language>}
*/
async function readAtroposLanguage($) {
	const settingsPath = await resolveAtroposFilePath($, SETTINGS_FILE_NAME);
	let storedSettings = {};
	if (settingsPath !== null && await $.fs.exists(settingsPath)) try {
		storedSettings = JSON.parse(await $.fs.read(settingsPath));
	} catch {
		storedSettings = {};
	}
	return readStoredSettings(storedSettings).language;
}
/**
* Adds the limits to the journal the Atropos app imports, at most once per
* six-minute slot and window, exactly as the status line does.
*
* @param {ModsApi} $
* @param {RateLimits} rateLimits
* @param {number} nowMs
* @returns {Promise<void>}
*/
async function recordLimitSnapshots($, rateLimits, nowMs) {
	const journalPath = await resolveAtroposFilePath($, JOURNAL_FILE_NAME);
	if (journalPath === null) return;
	const journalText = await $.fs.exists(journalPath) ? await $.fs.read(journalPath) : "";
	const snapshotsToRecord = selectSnapshotsToRecord(createLimitSnapshots(rateLimits, computeSlotStartMs(nowMs)), parseReadableJournalLines(journalText.split("\n")));
	if (snapshotsToRecord.length > 0) {
		const separator = journalText === "" || journalText.endsWith("\n") ? "" : "\n";
		await $.fs.write(journalPath, `${journalText}${separator}${snapshotsToRecord.map(formatJournalLine).join("")}`);
	}
}
// resources/icon-glyph.svg?raw
var icon_glyph_default = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 32 32\">\n  <g fill=\"none\" stroke=\"currentColor\" stroke-width=\"4\" stroke-linecap=\"round\" stroke-linejoin=\"round\">\n    <path d=\"M7.5 25 L16 7 L18.21 11.68\"/>\n    <path d=\"M21.27 18.16 L24.5 25\"/>\n  </g>\n</svg>\n";
// src/mod/band-graphics.js
/**
* The band draws its graphics as images, without knowing whether Claude shows
* a light or a dark theme, so each colour reaches 3:1 on both.
*/
var ACCENT_COLOR = "#c06a1f";
var NEUTRAL_FILL_COLOR = "#8a7b6c";
var TRACK_COLOR = "rgba(138, 123, 108, 0.35)";
var BAR_HEIGHT_PX = 6;
/**
* @typedef {"accent" | "neutral"} BarTone
*/
/**
* A rounded gauge whose filled part never shrinks below a dot, so 0 % still shows.
*
* @param {object} bar
* @param {number} bar.ratio From 0 to 1; clamped.
* @param {number} bar.widthPx
* @param {BarTone} bar.tone
* @returns {string} SVG markup.
*/
function buildBarSvg({ ratio, widthPx, tone }) {
	const filledWidthPx = Math.max(BAR_HEIGHT_PX, Math.round(Math.min(Math.max(ratio, 0), 1) * widthPx));
	const fillColor = tone === "accent" ? ACCENT_COLOR : NEUTRAL_FILL_COLOR;
	const radiusPx = BAR_HEIGHT_PX / 2;
	return `<svg xmlns="http://www.w3.org/2000/svg" width="${widthPx}" height="${BAR_HEIGHT_PX}" viewBox="0 0 ${widthPx} ${BAR_HEIGHT_PX}"><rect width="${widthPx}" height="${BAR_HEIGHT_PX}" rx="${radiusPx}" fill="${TRACK_COLOR}"/><rect width="${filledWidthPx}" height="${BAR_HEIGHT_PX}" rx="${radiusPx}" fill="${fillColor}"/></svg>`;
}
/**
* @returns {string} The Atropos glyph in the accent colour, as SVG markup.
*/
function buildLogoSvg() {
	return icon_glyph_default.replaceAll("currentColor", ACCENT_COLOR);
}
/**
* The terminal draws no SVG: the same gauge in block characters.
*
* @param {number} ratio From 0 to 1; clamped.
* @param {number} cellCount
* @returns {{ filled: string, empty: string }}
*/
function buildTerminalBarCells(ratio, cellCount) {
	const filledCellCount = Math.round(Math.min(Math.max(ratio, 0), 1) * cellCount);
	return {
		filled: "━".repeat(filledCellCount),
		empty: "━".repeat(cellCount - filledCellCount)
	};
}
// src/mod/register.jsx
/** @typedef {import("../core/rate-limits.js").LimitWindow} LimitWindow */
/** @typedef {import("../shared/locales/index.js").Messages} Messages */
/** @typedef {import("./atropos-files.js").ModsApi} ModsApi */
/**
* What the band shows, kept in the session state so every drawing reads the latest figures.
*
* @typedef {object} BandReading
* @property {string} modelId
* @property {{ tokens?: number, window: number }} context
* @property {number | null} costUsd
* @property {import("../core/rate-limits.js").RateLimits | null} rateLimits
* @property {import("../core/settings.js").Language} language
*/
var READING = atom({
	plugin: "atropos",
	key: "reading"
}, null);
var NOW_MS = atom({
	plugin: "atropos",
	key: "nowMs"
}, 0);
var CLOCK_TICK_MS = 6e4;
var TERMINAL_BAR_CELL_COUNT = 6;
/**
* Entry point Claude Code calls when it loads the mod.
*
* @type {import("claude-code").Register}
*/
function register(on) {
	on("session.start", async ($, e, next) => {
		const result = await next(e);
		await storeReading($, await $.session.usage());
		$.clock.every(CLOCK_TICK_MS, async () => {
			const nowMs = await $.clock.now();
			await update($, NOW_MS, () => nowMs);
		});
		return result;
	});
	on("session.measure", async ($, e, next) => {
		const reading = await storeReading($, e);
		if (reading.rateLimits !== null) await recordLimitSnapshots($, reading.rateLimits, await $.clock.now());
		return next(e);
	});
	on("ui.render", { component: "AbovePrompt" }, async ($, e, next) => {
		const reading = await read($, READING);
		if (reading === null || e.props.hasSurvey) return next(e);
		return renderBand({
			elements: $.ui.resolve(e),
			isTerminal: e.surface === "terminal",
			reading,
			nowMs: await read($, NOW_MS)
		});
	});
}
/**
* @param {ModsApi} $
* @param {{ context: BandReading["context"], rateLimits: unknown, cost?: { usd: number } }} usage
*   What `$.session.usage()` or `session.measure` reports.
* @returns {Promise<BandReading>}
*/
async function storeReading($, usage) {
	/** @type {BandReading} */
	const reading = {
		modelId: await $.session.model(),
		context: {
			tokens: usage.context.tokens,
			window: usage.context.window
		},
		costUsd: usage.cost?.usd ?? null,
		rateLimits: readRateLimitsOrNothing(usage.rateLimits),
		language: await readAtroposLanguage($)
	};
	const nowMs = await $.clock.now();
	await update($, READING, () => reading);
	await update($, NOW_MS, () => nowMs);
	return reading;
}
/**
* A malformed reading must never break Claude Code: the band then shows no limits.
*
* @param {unknown} sessionRateLimits
* @returns {import("../core/rate-limits.js").RateLimits | null}
*/
function readRateLimitsOrNothing(sessionRateLimits) {
	try {
		return readSessionRateLimits(sessionRateLimits);
	} catch {
		return null;
	}
}
/**
* @param {object} band
* @param {Record<string, Function>} band.elements The elements of the drawing surface.
* @param {boolean} band.isTerminal
* @param {BandReading} band.reading
* @param {number} band.nowMs
*/
function renderBand({ elements, isTerminal, reading, nowMs }) {
	const { Box, Text, Svg } = elements;
	const messages = getMessages(reading.language);
	const bandMessages = messages.band;
	const { context } = reading;
	const contextRatio = context.tokens === void 0 ? 0 : context.tokens / context.window;
	const limitWindows = [{
		label: bandMessages.fiveHourLabel,
		limitWindow: reading.rateLimits?.fiveHour
	}, {
		label: bandMessages.sevenDayLabel,
		limitWindow: reading.rateLimits?.sevenDay
	}].filter(({ limitWindow }) => limitWindow != null);
	return /* @__PURE__ */ h(Box, {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		gap: "md",
		flexWrap: "wrap"
	}, /* @__PURE__ */ h(Box, {
		flexDirection: "row",
		alignItems: "center",
		gap: "sm"
	}, !isTerminal && /* @__PURE__ */ h(Svg, {
		source: buildLogoSvg(),
		alt: bandMessages.logoAlt,
		width: 15,
		height: 15
	}), /* @__PURE__ */ h(Text, { dimColor: true }, formatModelFamilyName(reading.modelId)), renderBar({
		elements,
		isTerminal,
		ratio: contextRatio,
		widthPx: 36,
		tone: "neutral",
		alt: fillMessageTemplate(bandMessages.contextBarAlt, { percentage: formatWholePercentage(contextRatio * 100, messages.dateLocale) })
	}), /* @__PURE__ */ h(Text, { tabular: true }, formatTokenCount(context.tokens ?? 0), /* @__PURE__ */ h(Text, { dimColor: true }, " / ", formatTokenCount(context.window))), reading.costUsd !== null && /* @__PURE__ */ h(Text, {
		dimColor: true,
		tabular: true
	}, "$", reading.costUsd.toFixed(2))), limitWindows.map(({ label, limitWindow }) => renderLimitWindow({
		elements,
		isTerminal,
		label,
		limitWindow,
		nowMs,
		messages
	})));
}
/**
* @param {object} limitDisplay
* @param {Record<string, Function>} limitDisplay.elements
* @param {boolean} limitDisplay.isTerminal
* @param {string} limitDisplay.label e.g. "5h".
* @param {LimitWindow} limitDisplay.limitWindow
* @param {number} limitDisplay.nowMs
* @param {Messages} limitDisplay.messages
*/
function renderLimitWindow({ elements, isTerminal, label, limitWindow, nowMs, messages }) {
	const { Box, Text } = elements;
	const locale = messages.dateLocale;
	const paceDelta = computePaceDeltaPercentage(limitWindow, nowMs);
	const paceColor = paceDelta >= 0 ? "success" : "error";
	const usedPercentageText = formatWholePercentage(limitWindow.usedPercentage, locale);
	return /* @__PURE__ */ h(Box, {
		key: limitWindow.windowKind,
		flexDirection: "row",
		alignItems: "center",
		gap: "sm"
	}, /* @__PURE__ */ h(Text, { dimColor: true }, "│"), /* @__PURE__ */ h(Text, {
		dimColor: true,
		size: "footnote"
	}, label), renderBar({
		elements,
		isTerminal,
		ratio: limitWindow.usedPercentage / 100,
		widthPx: 44,
		tone: "accent",
		alt: fillMessageTemplate(messages.band.limitBarAlt, {
			label,
			percentage: usedPercentageText
		})
	}), /* @__PURE__ */ h(Text, {
		weight: "semibold",
		bold: true,
		tabular: true
	}, usedPercentageText), /* @__PURE__ */ h(Text, {
		color: paceColor,
		size: "footnote",
		tabular: true
	}, formatSignedPercentage(paceDelta, locale)), /* @__PURE__ */ h(Text, {
		dimColor: true,
		tabular: true
	}, "↻ ", formatRemainingTime(limitWindow.resetsAtMs - nowMs, messages.band)));
}
/**
* @param {object} barDisplay
* @param {Record<string, Function>} barDisplay.elements
* @param {boolean} barDisplay.isTerminal
* @param {number} barDisplay.ratio From 0 to 1.
* @param {number} barDisplay.widthPx
* @param {import("./band-graphics.js").BarTone} barDisplay.tone
* @param {string} barDisplay.alt What the gauge says, for a reader that cannot see it.
*/
function renderBar({ elements, isTerminal, ratio, widthPx, tone, alt }) {
	const { Svg, Text } = elements;
	if (isTerminal) {
		const { filled, empty } = buildTerminalBarCells(ratio, TERMINAL_BAR_CELL_COUNT);
		return /* @__PURE__ */ h(Text, null, /* @__PURE__ */ h(Text, { color: tone === "accent" ? "claude" : "text" }, filled), /* @__PURE__ */ h(Text, { dimColor: true }, empty));
	}
	return /* @__PURE__ */ h(Svg, {
		source: buildBarSvg({
			ratio,
			widthPx,
			tone
		}),
		alt,
		width: widthPx,
		height: 6
	});
}
export { register };
