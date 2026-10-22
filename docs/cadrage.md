# Atropos — Cadrage

Validé le 22 octobre 2026.

## 1. Objectif

Atropos suit en direct les limites d'utilisation de Claude Code : la fenêtre glissante de 5 heures et la limite hebdomadaire.

Le projet a deux briques :

1. **Une barre d'état Claude Code.** Elle affiche les limites dans Claude Code et enregistre un relevé toutes les 6 minutes.
2. **Une application de bureau Windows.** Elle conserve l'historique, affiche une icône près de l'horloge et prévient quand la limite hebdomadaire approche.

Le dépôt [Agent Burn](https://github.com/Melvynx/agent-burn) sert d'inspiration. Atropos n'en réutilise ni le code, ni le binaire, ni le nom, ni le logo.

## 2. Utilisateurs et contexte

- **Utilisateur :** le développeur lui-même, sous Windows, abonné à Claude Pro ou Max.
- **Public :** une vitrine de portfolio installable. Un recruteur doit pouvoir télécharger l'installateur et voir l'app fonctionner. Il n'y a pas de vrais utilisateurs à suivre, donc pas de mises à jour automatiques.
- **Échéance :** le plus vite possible. On garde un périmètre réduit sans jamais transiger sur la qualité du code.

## 3. Source des données

Claude Code transmet un JSON à la commande de sa barre d'état. C'est la seule source de données d'Atropos.

| Champ | Contenu |
|---|---|
| `rate_limits.five_hour.used_percentage` | pourcentage utilisé, de 0 à 100 |
| `rate_limits.five_hour.resets_at` | remise à zéro, en secondes Unix |
| `rate_limits.seven_day.used_percentage` | pourcentage utilisé, de 0 à 100 |
| `rate_limits.seven_day.resets_at` | remise à zéro, en secondes Unix |

- `rate_limits` n'est présent que pour les abonnés Pro et Max, et seulement après la première réponse de l'API dans la session. Son absence est un cas normal à gérer.
- La commande est relancée à chaque nouveau message, sur un minuteur `refreshInterval` et quand une fenêtre se remet à zéro.
- La configuration se fait dans `~/.claude/settings.json`, avec `statusLine: { type: "command", command: "..." }`.

### Pourquoi pas le jeton OAuth

Agent Burn lit le jeton dans `~/.claude/.credentials.json` et appelle `api.anthropic.com/api/oauth/usage`. La [page juridique de Claude Code](https://code.claude.com/docs/en/legal-and-compliance) interdit aux outils tiers de collecter ou de réutiliser les jetons de session Claude.ai. Atropos ne lit donc jamais ce fichier et n'appelle aucune API.

## 4. Architecture

```
Claude Code ──JSON (stdin)──▶ statusline/   affiche « 5h 42% · week 67% »
                                   │
                                   │ ajoute un relevé par créneau de 6 min
                                   ▼
                    %APPDATA%\Atropos\limit-snapshots.jsonl
                                   │
                                   │ importé à chaque créneau
                                   ▼
            main/ (Electron) ──▶ atropos.db (SQLite) ──▶ alertes, icône
                   │
                IPC (preload/)
                   ▼
            renderer/ (React)   limites, historique, réglages
```

**Couches, avec des dépendances dans un seul sens :**

- `core/` : logique pure, sans Electron ni effet de bord. Elle est utilisée par `statusline/` et par `main/`.
- `statusline/` : script Node lancé par Claude Code. Il lit l'entrée standard, écrit la sortie standard et ajoute des lignes au journal.
- `main/` : processus Electron. Il gère la base, l'import, la planification, l'icône près de l'horloge, les notifications et l'IPC.
- `preload/` : pont `contextBridge`. Il expose le strict minimum.
- `renderer/` : React, pour l'affichage uniquement. Il n'a aucun accès au système.
- `shared/` : les traductions, utilisées par `main/` et par `renderer/`.

Une couche n'importe jamais une couche de niveau supérieur.

**Créneaux de 6 minutes :** il y a 10 créneaux par heure, alignés sur l'horloge (:00, :06, :12…). On enregistre au plus un relevé par créneau et par type de fenêtre.

**Fichier d'échange JSONL :** le script de barre d'état tourne avec Node seul. Il ne peut donc pas charger `better-sqlite3`, qui est compilé pour Electron. Il ajoute plutôt une ligne à un fichier, et l'app l'importe. Les doublons sont écartés par une contrainte d'unicité dans la base.

## 5. Périmètre de la V1

**Inclus :**

- Barre d'état Claude Code : pourcentage 5 h et hebdo, avec l'heure de remise à zéro.
- Icône près de l'horloge avec le pourcentage hebdo dans l'info-bulle. Clic gauche pour ouvrir la fenêtre, menu par clic droit.
- Vue des limites actuelles : jauges et heures de remise à zéro.
- Vue de l'historique : courbe sur 7 et 30 jours, tableau équivalent pour l'accessibilité, comparaison avec la semaine précédente.
- Alerte hebdo : un seul seuil réglable, 80 % par défaut, désactivable, envoyée une seule fois par fenêtre hebdomadaire.
- Réglages : langue (anglais par défaut ou français), thème (System par défaut, Light ou Dark), alerte, effacement de l'historique, instructions d'activation de la barre d'état.
- Purge automatique des relevés de plus de 12 mois.

**Exclu de la V1 :** Codex, Cursor, le coût et les tokens (lecture des journaux et table de prix), les mises à jour automatiques et TypeScript.

**La V1 est terminée quand :**

- l'installateur `.exe` est publié sur GitHub Releases ;
- l'app tourne sur le PC du développeur depuis au moins deux semaines avec un historique réel ;
- le README contient des captures, un GIF de démonstration, le schéma d'architecture et une section « Privacy ».

## 6. Stack et justifications

| Rôle | Choix | Justification |
|---|---|---|
| Application de bureau | Electron | Tout en JavaScript, icône près de l'horloge et notifications natives |
| Outillage | electron-vite | Structure main / preload / renderer et rechargement à chaud |
| Interface | React | Composants et état, maîtrisés par le développeur |
| Langage | JavaScript avec JSDoc | Choix personnel. Les types sont vérifiés par VS Code dans `core/` |
| Historique | SQLite avec `better-sqlite3` | Un simple fichier, sans serveur, avec des requêtes préparées |
| Graphiques | Recharts | Composants React prêts à l'emploi |
| Alertes | `Notification` d'Electron | Notifications Windows natives |
| Installateur | electron-builder | Installateur NSIS `.exe` |
| Tests | Vitest | Tests de `core/` uniquement en V1 |
| Qualité | ESLint et Prettier | Réglages par défaut de Prettier : guillemets doubles, points-virgules, lignes de 80 caractères |
| Publication | GitHub Actions et Releases | Un tag `v*` construit et publie l'installateur |

## 7. Données

**Fichier d'échange** `%APPDATA%\Atropos\limit-snapshots.jsonl`, une ligne par relevé :

```json
{"slotStartedAt":"2026-10-22T14:06:00.000Z","windowKind":"seven_day","usedPercentage":67,"resetsAt":"2026-10-27T08:00:00.000Z"}
```

**Base** `%APPDATA%\Atropos\atropos.db` :

```sql
CREATE TABLE IF NOT EXISTS limit_snapshots (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  slot_started_at  TEXT NOT NULL,
  window_kind      TEXT NOT NULL CHECK (window_kind IN ('five_hour', 'seven_day')),
  used_percentage  REAL NOT NULL,
  resets_at        TEXT NOT NULL,
  UNIQUE (window_kind, slot_started_at)
);

CREATE TABLE IF NOT EXISTS sent_alerts (
  id                    INTEGER PRIMARY KEY AUTOINCREMENT,
  window_kind           TEXT    NOT NULL,
  threshold_percentage  INTEGER NOT NULL,
  window_resets_at      TEXT    NOT NULL,
  sent_at               TEXT    NOT NULL,
  UNIQUE (window_kind, threshold_percentage, window_resets_at)
);
```

**Réglages :** `%APPDATA%\Atropos\settings.json`, avec la langue, le thème, l'activation de l'alerte et son seuil.

**Règles :**

- Uniquement des requêtes préparées, jamais de SQL construit par concaténation.
- Les dates sont stockées en ISO 8601 UTC et affichées dans l'heure locale.

## 8. Charte de style

- Une fonction fait une seule chose. Son nom commence par un verbe et dit exactement ce qu'elle fait : `parseRateLimits`, `computeSlotStart`, `appendSnapshotLine`, `shouldSendWeeklyAlert`.
- Pas d'abréviations. Les unités figurent dans les noms (`resetsAtMs`, `usedPercentage`). Les booléens commencent par `is` ou `has`.
- La logique pure est séparée des effets de bord, qui restent aux bords du programme.
- Erreurs : des classes nommées. Exemple : `MissingRateLimitsError`.
- Une JSDoc avec les types sur chaque fonction publique de `core/`.
- HTML sémantique : `header`, `main`, `section` avec un titre, `<meter>` pour chaque jauge et `<time datetime>` pour chaque date. Pas de soupe de `div`.
- CSS : classes nommées en BEM (`limit-gauge__label`), couleurs et espacements en variables CSS, un jeu de valeurs pour le clair et un pour le sombre.
- Commentaires : autorisés pendant le développement. Ceux qui expliquent le code sont supprimés avant la fusion finale dans `main`. La JSDoc est conservée.

## 9. Sécurité

- Fenêtre créée avec `contextIsolation: true`, `nodeIntegration: false` et `sandbox: true`.
- Le preload n'expose qu'une liste fermée de canaux IPC.
- Aucun appel réseau dans l'app.

## 10. Accessibilité et RGPD

### Conclusions légales

- **Accessibilité :** aucune obligation légale. Le développeur est un particulier, ce n'est ni un organisme public ni une entreprise de plus de 250 M€, et l'app ne fournit aucun service visé par l'European Accessibility Act.
- **RGPD :** l'éditeur ne collecte ni ne transmet aucune donnée personnelle, puisque tout reste sur le poste de l'utilisateur. Le règlement serait à réexaminer si de la télémétrie était ajoutée.

Ces conclusions aident au cadrage et ne remplacent pas l'avis d'un juriste.

### Principes appliqués quand même, par choix

Ces principes sont permanents, indépendamment du risque légal.

**Accessibilité (critères RGAA vérifiables dans le code) :**

- tout est utilisable au clavier, avec un focus toujours visible ;
- contraste d'au moins 4,5:1 dans les deux thèmes ;
- la couleur n'est jamais le seul signal ;
- l'attribut `lang` suit la langue choisie ;
- chaque graphique a une alternative en tableau ;
- `prefers-reduced-motion` est respecté ;
- chaque contrôle a un libellé explicite.

**RGPD, protection des données dès la conception :**

- **Minimisation :** le JSON de la barre d'état contient aussi `session_id`, `cwd` et `transcript_path`. Atropos ne stocke que l'horodatage du créneau, le type de fenêtre, le pourcentage et l'heure de remise à zéro.
- Stockage local uniquement, aucune télémétrie, polices embarquées.
- Conservation limitée à 12 mois, avec purge automatique.
- Bouton « Clear history » dans les réglages.
- Section « Privacy » dans le README.

## 11. Interdits

- Lire `~/.claude/.credentials.json` ou appeler une API Anthropic.
- Modifier `~/.claude/projects/`.
- Modifier `~/.claude/settings.json` sans accord explicite. L'app affiche la configuration à copier, mais ne l'écrit pas elle-même.
- Copier du code d'Agent Burn sans conserver sa mention de licence MIT, ou réutiliser son nom ou son logo.
- Utiliser les noms ou logos Claude ou Anthropic dans le nom ou l'icône de l'app. Une mention factuelle dans le README, comme « works with Claude Code », est permise.

## 12. Points ouverts, à trancher pendant la tâche concernée

- **Lancement du script de barre d'état sur une machine sans Node :** deux pistes, Node installé ou l'exécutable d'Atropos lancé avec `ELECTRON_RUN_AS_NODE=1`. À trancher pendant la tâche d'empaquetage.
- **Construction du script de barre d'état :** il doit être livré avec les fichiers de `core/` dont il dépend.

## 13. Découpage de la V1

Une tâche correspond à une session et à une branche `feature/*` partie de `dev`.

| # | Tâche | Branche |
|---|---|---|
| 0 | Renommer le dossier en `Atropos`, `git init`, créer `main` et `dev`, `.gitignore` | — |
| 1 | Socle : générer le projet electron-vite (React, JS), régler Prettier par défaut, ESLint et Vitest, créer l'arborescence et les scripts npm | `feature/project-setup` |
| 2 | `core/` : lecture et validation de `rate_limits`, avec tests | `feature/core-rate-limits` |
| 3 | `core/` : créneaux de 6 minutes et format d'une ligne du journal, avec tests | `feature/core-time-slots` |
| 4 | Barre d'état : affichage, ajout au journal, activation manuelle dans `settings.json`. **La collecte des données commence ici.** | `feature/statusline` |
| 5 | Base : schéma, ouverture, import du journal, purge des relevés de plus de 12 mois | `feature/database` |
| 6 | Planificateur aligné sur les créneaux, icône près de l'horloge avec son info-bulle | `feature/tray` |
| 7 | IPC et preload : dernier relevé, historique, réglages, envoi des mises à jour | `feature/ipc` |
| 8 | Interface : structure de la page, vue des limites actuelles, états de chargement, d'erreur et sans données | `feature/limits-view` |
| 9 | Traductions anglais et français, thèmes System, Light et Dark | `feature/i18n-theme` |
| 10 | Vue historique : courbe, tableau équivalent, comparaison hebdomadaire | `feature/history-view` |
| 11 | Vue réglages : langue, thème, alerte, effacement de l'historique, aide à l'activation de la barre d'état | `feature/settings-view` |
| 12 | Alerte hebdo : décision dans `core/`, notification, table `sent_alerts` | `feature/weekly-alert` |
| 13 | Empaquetage : electron-builder, livraison de la barre d'état, test de l'installateur | `feature/packaging` |
| 14 | Workflow de publication GitHub Actions et première publication | `feature/release-workflow` |
| 15 | README : captures, GIF, schéma, section « Privacy » | `feature/readme` |
| 16 | Audit `/conform-rgaa`, puis corrections | `feature/accessibility-audit` |
| 17 | Audit `/conform-cnil`, puis corrections | `feature/privacy-audit` |
| 18 | Suppression des commentaires qui expliquent le code, fusion de `dev` dans `main`, tag `v1.0.0` | — |
