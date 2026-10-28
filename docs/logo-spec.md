# Atropos — Spécification du logo

Le logo actuel est provisoire. Ce document décrit ce qu’un logo de remplacement doit fournir pour s’intégrer à l’app sans toucher au code. Le concept et la palette viennent de [style-guide.md](style-guide.md), sections 3 et 9.

## 1. Contraintes

- Aucun nom, logo ni forme évoquant Claude ou Anthropic.
- Pas de texte dans le logo. Le nom « Atropos » est composé à côté, en Cinzel.
- Lisible à 16 px. En dessous de 32 px, une version simplifiée, le « glyphe », remplace le logo complet.
- Le glyphe est **monochrome et sans fond** : une seule forme, que l’app colore elle-même selon le thème.
- Contraste d’au moins 3:1 entre le logo et ce qui l’entoure, dans les deux thèmes et sur les deux barres des tâches de Windows (voir la section 5).

## 2. Les deux fichiers sources

Ce sont les deux seuls fichiers à remplacer. Tout le reste en est dérivé.

| Fichier                    | `viewBox`     | Contenu                                                                                                                                          |
| -------------------------- | ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `resources/icon.svg`       | `0 0 256 256` | Logo complet, avec son fond. Carré à coins arrondis, rayon de 56 sur 256. Les couleurs sont figées dans le fichier.                              |
| `resources/icon-glyph.svg` | `0 0 32 32`   | Glyphe seul, fond transparent. Toutes les couleurs valent `currentColor`, car le générateur et l’interface les remplacent par la couleur voulue. |

Règles pour les deux fichiers :

- Du SVG simple : des tracés, des formes et des groupes. Pas de texte, d’image intégrée, de filtre ni de police.
- Une marge d’au moins 1/16 du côté autour du dessin, pour qu’il ne touche pas le bord de l’icône ou du fond arrondi.
- Pour le glyphe, des traits d’au moins 2,5 unités sur 32. À 16 px, cela donne un trait de 1,25 px au minimum, sinon il devient flou.

## 3. Fichiers dérivés

`npm run icons` lance `scripts/generate-icons.mjs` avec l’Electron du projet, sans dépendance supplémentaire, et réécrit les fichiers suivants. Ils sont versionnés.

| Fichier               | Tailles                                               | Source                                  | Utilisé par                                                                                                                                                                                        |
| --------------------- | ----------------------------------------------------- | --------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `build/icon.ico`      | 16, 20, 24 px                                         | Glyphe en terre cuite sur onyx          | electron-builder : `Atropos.exe`, installateur, désinstallateur, raccourcis du menu Démarrer et du bureau, barre des tâches, Alt+Tab, « Applications et fonctionnalités », icône des notifications |
|                       | 32, 40, 48, 64, 128, 256 px                           | Logo complet                            | Mêmes usages, aux échelles 125 à 200 % et dans les grandes vues de l’Explorateur                                                                                                                   |
| `build/icon.png`      | 256 px                                                | Logo complet                            | Icône de repli d’electron-builder                                                                                                                                                                  |
| `resources/icon.png`  | 256 px                                                | Logo complet                            | Icône de la fenêtre (`BrowserWindow`), utile surtout en développement, où l’exécutable reste celui d’Electron                                                                                      |
| `resources/tray*.png` | 16, 20, 24, 32 px (`tray.png`, puis `@1.25x` à `@2x`) | Glyphe en terre cuite moyenne `#c06a1f` | Zone de notification                                                                                                                                                                               |

Dans le `.ico`, les entrées jusqu’à 128 px sont des bitmaps 32 bits, et l’entrée de 256 px est un PNG, car l’installateur NSIS refuse les petites entrées en PNG.

Les suffixes `@1.25x`, `@1.5x` et `@2x` correspondent aux échelles d’affichage de Windows (125, 150 et 200 %). Electron choisit lui-même le bon fichier.

L’icône de la zone de notification a une seule couleur pour les deux barres des tâches. Electron ne sait pas reconnaître une barre sombre quand Windows y affiche la couleur d’accentuation : avec deux variantes, l’app afficherait la variante claire sur une barre sombre.

## 4. Le logo dans l’interface

L’interface n’embarque pas de copie du logo. Elle affiche `resources/icon-glyph.svg` comme masque CSS (`mask-image`), coloré avec `--color-accent`. Le glyphe suit donc le thème sans fichier supplémentaire, et un nouveau glyphe apparaît dans l’app sans autre changement. C’est la raison pour laquelle il doit rester une forme monochrome.

| Emplacement                                    | Taille affichée                            | Couleur                                              |
| ---------------------------------------------- | ------------------------------------------ | ---------------------------------------------------- |
| En-tête actuel, puis barre latérale (tâche 15) | 2 rem, soit 32 px à 100 % et 64 px à 200 % | `--color-accent` : `#9a4a12` clair, `#e0913a` sombre |

Le glyphe est décoratif (`aria-hidden="true"`) : le nom « Atropos » écrit à côté porte l’information.

## 5. Contrastes à respecter

Le logo est un élément graphique : 3:1 au minimum. Valeurs du logo provisoire :

| Couple                                                                      | Contraste   |
| --------------------------------------------------------------------------- | ----------- |
| Glyphe `#c06a1f` sur barre des tâches claire (`#f3f3f3` / `#ffffff`)        | 3,6 / 4,0:1 |
| Glyphe `#c06a1f` sur barre des tâches sombre (`#101010` / `#202020`)        | 4,8 / 4,1:1 |
| Glyphe `#c06a1f` sur icône survolée, clair / sombre (`#e5e5e5` / `#2b2b2b`) | 3,1 / 3,6:1 |
| Terre cuite sur le fond onyx du logo complet                                | 7,4:1       |
| Os (`#f3e6d3`) sur le fond onyx du logo complet                             | 15,2:1      |
| Glyphe `--color-accent` sur le fond de page, clair / sombre                 | 5,0 / 7,8:1 |

Une nouvelle couleur pour l’icône de la zone de notification doit garder une luminance relative comprise entre 0,12 et 0,25 pour dépasser 3:1 sur les deux barres des tâches. Si un nouveau logo change ces couleurs, il faut modifier les constantes en tête de `scripts/generate-icons.mjs` et recalculer ces valeurs.

## 6. Remplacer le logo

1. Remplacer `resources/icon.svg` et `resources/icon-glyph.svg` en respectant leur `viewBox` et les règles de la section 2.
2. Lancer `npm run icons`. Si Windows bloque l’écriture d’Electron dans le dossier du projet (erreur `EBADF`, par exemple avec l’accès contrôlé aux dossiers), lancer `npm run icons -- --out <dossier temporaire>` puis copier `build/` et `resources/` dans le projet.
3. Vérifier le rendu à 16 et 32 px, puis l’icône de la zone de notification sur une barre des tâches claire et sur une sombre.
4. Relancer l’app (`npm run dev`) : l’en-tête et la zone de notification reprennent le nouveau glyphe.
5. Committer les deux sources et tous les fichiers dérivés ensemble.
