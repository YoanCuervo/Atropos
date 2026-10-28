# Atropos — Charte graphique

## 1. Intention

Atropos est la Moire qui coupe le fil de la vie. L'app suit un fil qui s'use : les tokens de la fenêtre de 5 heures et de la semaine. L'identité visuelle vient de la céramique grecque. Un vase à figures rouges a fourni la palette, et un tableau de bord en grille de cartes a fourni la mise en page.

Trois règles priment sur tout le reste :

1. **Lisibilité d'abord.** Chaque couple texte et fond atteint au moins 4,5:1 et chaque élément d'interface au moins 3:1, dans les deux thèmes.
2. **La couleur ne porte jamais seule l'information.** Chaque état d'une jauge est aussi écrit en toutes lettres.
3. **Pas de décor qui coûte du contraste.** Pas d'effet verre, de flou ni de dégradé derrière du texte.

L'image de référence est une illustration de banque d'images. Seules ses couleurs sont reprises : l'image elle-même n'entre ni dans le dépôt ni dans l'app.

## 2. Les deux thèmes

Les deux thèmes reprennent les deux techniques de la céramique attique.

| Thème                     | Technique      | Carte principale                     |
| ------------------------- | -------------- | ------------------------------------ |
| Light, « figures rouges » | Fond parchemin | Onyx, avec le chiffre en terre cuite |
| Dark, « figures noires »  | Fond onyx      | Terre cuite, avec le texte en onyx   |

Le réglage de thème reste celui de la V1 : System par défaut, Light ou Dark. Les composants ne connaissent jamais le thème actif. Ils lisent uniquement les variables CSS, dont la valeur change avec le thème.

## 3. Palette de base

| Nom                | Valeur                | Origine                                      |
| ------------------ | --------------------- | -------------------------------------------- |
| Onyx               | `#141210`             | Vernis noir du vase                          |
| Onyx profond       | `#0b0a09`             | Fond du thème sombre                         |
| Engobe             | `#1f1c19`             | Surface du thème sombre                      |
| Onyx clair         | `#2a2622`             | Veines du marbre                             |
| Terre cuite        | `#e0913a`             | La figure                                    |
| Terre cuite foncée | `#c97a28`             | Ombres de la figure                          |
| Brun-rouge         | `#9a4a12`             | Contours de la figure, accent du thème clair |
| Brun               | `#4a2a0e`             | Texte secondaire sur terre cuite             |
| Ocre               | `#e9a75a`             | Rehauts                                      |
| Parchemin          | `#efe5d7`             | Fond du thème clair                          |
| Crème              | `#fffaf3`             | Surface du thème clair                       |
| Os                 | `#f3e6d3`             | Texte sur onyx                               |
| Argile pâle        | `#b8a892`             | Texte secondaire sur onyx                    |
| Olive              | `#4f6125` / `#7d9a4a` | L'olivier d'Athéna                           |
| Rouge d'engobe     | `#a3301e` / `#e0634a` | Rehauts rouges de la céramique               |
| Bleu égéen         | `#2f4f73` / `#a3b4c9` | Focus clavier                                |

## 4. Jetons CSS

Les noms existants de `app.css` sont conservés pour limiter la migration. Les jetons `emphasis` sont nouveaux : ils servent à la carte principale.

| Jeton                       | Light     | Dark      | Usage                                                 |
| --------------------------- | --------- | --------- | ----------------------------------------------------- |
| `--color-background`        | `#efe5d7` | `#0b0a09` | Fond de la page                                       |
| `--color-surface`           | `#fffaf3` | `#1f1c19` | Cartes ordinaires, barre latérale                     |
| `--color-border`            | `#e8dccb` | `#2a2622` | Séparateurs décoratifs                                |
| `--color-control-border`    | `#8a7b6c` | `#8f8172` | Bordure des champs et des boutons                     |
| `--color-text`              | `#1c1714` | `#f3e6d3` | Texte principal                                       |
| `--color-text-muted`        | `#5c4f43` | `#b8a892` | Texte secondaire                                      |
| `--color-accent`            | `#9a4a12` | `#e0913a` | Liens, logo, mise en avant ponctuelle                 |
| `--color-focus`             | `#2f4f73` | `#a3b4c9` | Contour du focus clavier                              |
| `--color-emphasis`          | `#141210` | `#e0913a` | Fond de la carte principale, élément actif du menu    |
| `--color-on-emphasis`       | `#f3e6d3` | `#141210` | Texte sur la carte principale                         |
| `--color-on-emphasis-muted` | `#b8a892` | `#4a2a0e` | Texte secondaire sur la carte principale              |
| `--color-emphasis-accent`   | `#e0913a` | `#141210` | Grand chiffre et barre de la carte principale         |
| `--color-emphasis-tile`     | `#2a2622` | `#c97a28` | Encadrés et rail de la barre dans la carte principale |
| `--color-on-emphasis-tile`  | `#f3e6d3` | `#141210` | Texte des encadrés                                    |
| `--color-gauge-track`       | `#e8dccb` | `#2a2622` | Rail des jauges sur une carte ordinaire               |
| `--color-gauge-comfortable` | `#4f6125` | `#7d9a4a` | État confortable                                      |
| `--color-gauge-warning`     | `#8a5a10` | `#e9a75a` | État à surveiller                                     |
| `--color-gauge-critical`    | `#a3301e` | `#e0634a` | État critique                                         |
| `--color-chart-seven-day`   | `#9a4a12` | `#e0913a` | Courbe hebdomadaire                                   |
| `--color-chart-five-hour`   | `#1c1714` | `#f3e6d3` | Courbe 5 h                                            |

### Contrastes vérifiés

| Couple                                        | Light | Dark |
| --------------------------------------------- | ----- | ---- |
| Texte sur fond                                | 14,3  | 16,1 |
| Texte secondaire sur surface                  | 7,6   | 7,3  |
| Accent sur fond                               | 5,0   | 7,8  |
| Texte sur la carte principale                 | 15,2  | 7,4  |
| Texte secondaire sur la carte principale      | 8,1   | 5,1  |
| Texte des encadrés                            | 12,2  | 5,6  |
| États des jauges sur surface (le plus faible) | 5,7   | 4,9  |
| Barre de la carte principale sur son rail     | 5,9   | 5,6  |
| Bordure des champs sur surface (3:1 demandé)  | 3,9   | 4,5  |
| Focus sur fond                                | 6,8   | 9,4  |

### Règles d'usage

- **Focus dans la carte principale :** le contour prend `--color-on-emphasis`, car `--color-focus` ne contraste pas assez avec la terre cuite.
- **État des jauges dans la carte principale :** la barre garde `--color-emphasis-accent`. L'état s'affiche dans une pastille onyx (`#141210`) dont le texte prend la valeur sombre de la couleur d'état. Cette pastille est lisible dans les deux thèmes, de 5,4:1 à 9,0:1.
- **Une seule carte principale par vue**, et au plus une seconde carte onyx ou terre cuite pour une action secondaire.
- **Pas d'opacité sur le texte.** Le texte secondaire a sa propre couleur.
- **Pas de texte secondaire dans un encadré.** `--color-on-emphasis-muted` sur `--color-emphasis-tile` tombe à 3,9:1 en sombre : les encadrés n’utilisent que `--color-on-emphasis-tile`.
- **Contrôle automatique :** `src/renderer/src/styles/theme-contrast.test.js` relit `app.css` et vérifie chaque couple dans `npm test`.

## 5. Typographie

| Rôle                  | Police                           | Taille    | Graisse |
| --------------------- | -------------------------------- | --------- | ------- |
| Logo et titres de vue | Cinzel, repli `Georgia, serif`   | 1,5 rem   | 500     |
| Grand chiffre         | `system-ui`, chiffres tabulaires | 2,25 rem  | 500     |
| Titre de carte        | `system-ui`                      | 1 rem     | 500     |
| Texte courant         | `system-ui`, `"Segoe UI"`        | 0,875 rem | 400     |
| Légende               | `system-ui`                      | 0,75 rem  | 400     |

Cinzel est sous licence SIL Open Font License. Elle est livrée en `.woff2` (latin, graisse 500) dans `src/renderer/src/assets/fonts/`, avec sa licence `OFL.txt`, et non comme paquet npm. Vite l’empaquette avec l’interface.

Les chiffres utilisent `font-variant-numeric: tabular-nums` pour ne pas bouger quand ils changent. Aucun texte en dessous de 0,75 rem.

## 6. Mise en page

- **Barre latérale** de 7,5 rem : le logo, les trois vues (Limits, History, Settings) et, en bas, l'état de la barre d'état de Claude Code.
- **Grille de cartes** dans la zone principale, en CSS Grid, avec un écart de `--space-small`. Elle passe à une colonne sous 40 rem de large.
- **Rayons :** 0,875 rem pour les cartes, 0,5 rem pour les encadrés, en pilule pour les boutons et les étiquettes.
- **Pas d'ombre portée.** Les plans se distinguent par la couleur de fond.
- **Fond :** une texture de marbre discrète est possible en `background-image` sur la page uniquement, jamais sous une carte. Elle disparaît avec `prefers-reduced-transparency` et en contraste élevé (`forced-colors`).

## 7. Composants

| Composant             | Fond               | Contenu                                                                    |
| --------------------- | ------------------ | -------------------------------------------------------------------------- |
| Carte principale      | `--color-emphasis` | Limite hebdomadaire : chiffre, `<meter>`, remise à zéro, trois encadrés    |
| Carte d'anneau        | `--color-surface`  | Fenêtre de 5 h : anneau SVG décoratif doublé d'un `<meter>`, remise à zéro |
| Carte de courbe       | `--color-surface`  | Historique 7 ou 30 jours, bouton « Show as table »                         |
| Élément de menu actif | `--color-emphasis` | Libellé et icône, `aria-current="page"`                                    |
| Étiquette d'heure     | `--color-emphasis` | « Updated 14:06 » dans un `<time datetime>`                                |
| Bouton secondaire     | transparent        | Bordure `--color-control-border`, en pilule                                |

L'anneau est purement décoratif (`aria-hidden="true"`). La valeur accessible reste portée par un `<meter>`.

## 8. Motif et mouvement

- **Frise grecque** en SVG répété, utilisée comme séparateur dans la barre latérale ou en pied de vue. Elle est décorative (`aria-hidden="true"`) et prend `--color-border`.
- **Animations** limitées au remplissage des jauges à leur mise à jour, en 300 ms au plus. Aucune animation avec `prefers-reduced-motion: reduce`.

## 9. Logo et icônes

**Concept :** des ciseaux qui coupent un fil, et ce fil forme l'arc d'une jauge.

- Tracé SVG simple, en terre cuite sur fond onyx pour l'icône de l'app.
- Lisible à 16 px pour l'icône près de l'horloge. Sous cette taille, seul l'arc est gardé.
- Variantes : `icon.svg` et `icon-glyph.svg` (sources), `icon.ico` (application, 16 à 256 px) et les PNG de la zone de notification, d’une seule couleur lisible sur les deux barres des tâches. Le détail est dans [logo-spec.md](logo-spec.md).
- Aucun nom, logo ni forme évoquant Claude ou Anthropic.

## 10. Bandeau du mod Claude Code

Le mod dessine une ligne au-dessus de la zone de saisie de Claude, dans l'app de bureau comme dans le terminal. Il ne connaît pas le thème de Claude, clair ou sombre : ses graphiques ont donc des couleurs fixes, lisibles sur les deux, et ses textes prennent les couleurs du thème de Claude.

| Élément              | Rendu                                                                                        |
| -------------------- | -------------------------------------------------------------------------------------------- |
| Glyphe               | `icon-glyph.svg` en terre cuite moyenne `#c06a1f`, 15 px                                     |
| Modèle               | Nom de la famille (« Opus »), couleur atténuée                                               |
| Contexte             | Barre arrondie de 36 × 6 px en gris `#8a7b6c`, puis « 72k / 200k », le total atténué         |
| Coût                 | « $0.24 », atténué                                                                           |
| Limite               | Libellé atténué, barre de 44 × 6 px en terre cuite `#c06a1f`, pourcentage en demi-gras       |
| Avance sur le rythme | Pastille cerclée, couleur `success` si positive et `error` si négative, signe toujours écrit |
| Temps restant        | « ↻ 3h05 » sous 24 h, « ↻ 1j 4h » au-delà, atténué                                           |

- **Avance sur le rythme :** part de la fenêtre déjà écoulée moins part utilisée. Positive, il reste de la marge.
- **Contrastes :** `#c06a1f` et `#8a7b6c` atteignent au moins 3,2:1 sur les fonds clairs et sombres de Claude. Le rail des barres est décoratif.
- **Terminal :** pas de SVG. Les barres deviennent des caractères `━`, et le glyphe disparaît.
- **Accessibilité :** chaque barre porte un texte alternatif qui donne sa valeur.

## 11. Hors V1

- **Carte « The thread » (« Le fil »)** : la date d'épuisement de la limite hebdomadaire au rythme actuel. Prévue en V1.1.
