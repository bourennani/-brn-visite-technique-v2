# BRN Group — Application de visite technique

**Version 2.4.1**

Application de relevé et de métré de chantier, utilisable **hors ligne** sur iPhone et iPad.
React + Vite + Tailwind, installable en PWA.

---

## Démarrage rapide

```bash
npm install
npm run dev      # http://localhost:5173
```

Pour produire la version de production :

```bash
npm run build    # génère dist/
npm run preview  # sert dist/ en local pour vérifier avant déploiement
```

> **Node 18 minimum** (Node 20 recommandé). Vérifiez avec `node -v`.

---

## Déploiement sur Vercel

### Option A — par le site (le plus simple)

1. Poussez le dossier sur un dépôt GitHub / GitLab.
2. Sur [vercel.com](https://vercel.com) → **Add New… → Project** → importez le dépôt.
3. Vercel détecte Vite automatiquement. Les réglages doivent être :
   - Framework Preset : **Vite**
   - Build Command : `npm run build`
   - Output Directory : `dist`
   - Install Command : `npm install`
4. **Deploy**. L'URL fournie est en HTTPS — c'est indispensable (voir plus bas).

Le fichier `vercel.json` fourni configure déjà ces valeurs, la réécriture des routes et le
cache. Vous n'avez normalement rien à changer.

### Option B — en ligne de commande

```bash
npm i -g vercel
vercel          # préproduction
vercel --prod   # production
```

---

## Installer sur iPhone / iPad

À faire **une fois le site déployé en HTTPS** :

1. Ouvrez l'URL dans **Safari** (obligatoire : Chrome iOS ne sait pas installer une PWA).
2. Bouton **Partager** → **Sur l'écran d'accueil**.
3. Lancez l'app depuis l'icône : elle s'ouvre en plein écran, sans barre de navigation.

Après la première visite, l'application fonctionne **sans réseau** : le service worker
précharge la totalité du bundle.

---

## Pourquoi HTTPS est obligatoire

Trois fonctions du chantier n'existent que sur une origine sécurisée :

| Fonction | Sans HTTPS |
|---|---|
| Stockage IndexedDB (visites, photos, croquis) | bascule en mémoire, tout est perdu au rechargement |
| Appareil photo (`capture="environment"`) | indisponible |
| Service worker / hors ligne | non enregistré |

`localhost` est considéré comme sécurisé : `npm run dev` fonctionne normalement.
Vercel fournit HTTPS automatiquement.

---

## Structure du projet

```
.
├── index.html                 # page hôte, métadonnées iOS plein écran
├── package.json
├── vite.config.js             # Vite + plugin PWA (manifeste + service worker)
├── tailwind.config.js         # palette BRN (dark/mid/light/pale/ink)
├── postcss.config.js
├── vercel.json                # build, réécritures SPA, cache
├── public/
│   ├── favicon.svg
│   ├── robots.txt             # site privé : indexation refusée
│   └── icons/                 # icônes PWA générées depuis le logo BRN
│       ├── icon-192.png
│       ├── icon-512.png
│       ├── icon-maskable-512.png
│       └── apple-touch-icon.png
└── src/
    ├── main.jsx               # point d'entrée + enregistrement du service worker
    ├── index.css              # Tailwind + réglages terrain (encoche, zoom iOS, impression)
    ├── App.jsx                # navigation, sauvegarde auto, liaison croquis ↔ métrés
    ├── lib/
    │   ├── catalogue.js       # types de pièces, formes, lots, catalogue électricité
    │   ├── calc.js            # moteur de métré + états de validation des quantités
    │   └── store.js           # IndexedDB (visites + photos), repli mémoire, fabriques
    ├── components/
    │   ├── ui.jsx             # primitives (boutons, champs, QtyBox 3 états)
    │   └── SketchPad.jsx      # croquis à modèle d'objets, cotation, bibliothèque
    └── screens/
        ├── Visites.jsx        # liste, infos générales, pièces, choix du type
        ├── Room.jsx           # métré, travaux, médias, notes, module électricité
        └── Recap.jsx          # récapitulatif chantier + rapport A4 imprimable
```

Le graphe de dépendances est en couches, sans cycle :
`catalogue → calc → store → ui → SketchPad → écrans → App`.

---

## Où se trouve quoi

| Besoin | Fichier |
|---|---|
| Ajouter un type de pièce | `src/lib/catalogue.js` → `TYPES` |
| Ajouter un lot ou un ouvrage | `src/lib/catalogue.js` → `LOTS` |
| Ajouter un appareillage électrique | `src/lib/catalogue.js` → `ELEC_CAT` |
| Changer une règle de métré | `src/lib/calc.js` → `calcRoom` |
| Changer les marges proposées | `src/lib/catalogue.js` → `MARGES` |
| Brancher une base distante | `src/lib/store.js` → objet `Store` |
| Mise en page du rapport | `src/screens/Recap.jsx` → `PRINT_CSS` |
| Couleurs de marque | `src/lib/catalogue.js` (G_DARK…) et `tailwind.config.js` |

---

## Sauvegarde des données

Tout est **local à l'appareil** : aucune donnée ne part sur un serveur.

- Visites, pièces, métrés → IndexedDB, base `brn_visites`
- Photos et croquis → blobs binaires dans la même base
- Croquis → enregistrés en **objets** (textes et cotes restent modifiables) + un PNG pour le rapport

L'objet `Store` (`src/lib/store.js`) expose une interface unique
(`listVisites`, `getVisite`, `saveVisite`, `putBlob`…). C'est le point d'accroche prévu
pour brancher Supabase ou Firebase sans toucher au reste de l'application.

> **Attention** : iOS peut purger le stockage d'un site web peu utilisé. Tant qu'aucune
> synchronisation distante n'est en place, exportez le récapitulatif (CSV) ou le rapport
> (PDF) après chaque visite importante.

---

## Rapport PDF

L'onglet **Rapport** produit une mise en page A4. Le bouton lance l'impression du
navigateur : choisissez **Enregistrer au format PDF**. Les notes internes sont masquées
par défaut et peuvent être affichées par une bascule.

---

## Mise à jour du service worker

`registerType: "autoUpdate"` : une nouvelle version est récupérée en arrière-plan, puis
appliquée au retour au premier plan de l'application (`src/main.jsx`). Aucune mise à jour
n'intervient pendant une saisie.

Si une version semble figée pendant un test : Réglages iOS → Safari → Effacer historique
et données, ou désinstallez puis réinstallez l'icône.

---

## Limitations connues

- Cotation automatique des murs : pièces **rectangulaires** uniquement.
- Liaison des cotes : formulaire → croquis (via « Tracer la pièce »). Le sens inverse
  (croquis → dimensions de la pièce) n'est pas branché.
- Pas d'export Word ; le PDF passe par l'impression navigateur.
- Les estimations de matériaux (plaques, rails, bandes…) sont indicatives.
- La duplication d'une visite ne copie pas les photos, volontairement.
- Pas de synchronisation multi-appareils.

---

## Historique des versions

### 2.4.1 — confort de lecture du rapport

Présentation seule. Aucun calcul, aucun ouvrage, aucune donnée, aucune
architecture touchés : `calc.js`, `travaux.js`, `catalogue.js`, `store.js`,
`profils.js`, `SketchPad.jsx`, `TravauxTab.jsx` et `Room.jsx` sont identiques à
la v2.4.0. Trois fichiers modifiés : `screens/Recap.jsx` (fonction `ReportScreen`
uniquement — l'écran de travail `RecapScreen` est inchangé),
`components/RapportBlocs.jsx`, `index.css`.

**Échelle typographique** — le corps du rapport passe de 9 px (6,75 pt à
l'impression) à 14 px (10,5 pt) ; le plancher passe de 7 px (5,25 pt) à 11 px
(8,25 pt). Titres de section et noms de pièce à 19 px, tableaux et valeurs
techniques à 13 px, légendes de photos à 12 px.

**Hiérarchie** — noms de pièce précédés d'un filet vert et détachés par un
double filet ; titres de section en 19 px sur filet épais ; sous-titres en
14 px espacés ; chiffres clés des bandeaux en 16 px monospace ; textes lus par
le client en `leading-relaxed`.

**Coupures de page** — `.rap-piece` interdisait toute coupure au milieu d'une
pièce. À taille de lecture, une pièce avec photos dépasse souvent la page :
la règle produisait des pages à moitié vides. Une pièce peut désormais se
couper ; ce sont les rubriques qui sont protégées (`.rap-piece > *`), un titre
de pièce ne reste jamais seul en bas de page (`.rap-titre`), et `orphans` /
`widows` empêchent les lignes isolées. Les marges `@page` (12 mm / 10 mm) sont
inchangées : la police n'est compensée par aucun resserrement.

### 2.4.0 — curage, électricité détaillée, saisie manuelle, croquis

Architecture inchangée. Aucune fonctionnalité retirée.

**Lot Curage** — deux prestations ajoutées : « Dépose de toile de verre » et
« Dépose de papier peint », en m², quantité reprise automatiquement de la surface
nette des murs (`mursNet`), sélectionnables pièce par pièce.

**Lot Électricité** — onze postes détaillés remplacent le comptage global :
prise simple / double / triple, prise spécialisée, interrupteur simple / double /
triple, point lumineux, spot, RJ45, courant faible. Chacun est alimenté par le
relevé électrique de la pièce. Le poste « Point électrique (total) » est conservé
pour les visites antérieures. Le rapport affiche le détail par pièce, jamais un
total à la place.

**Validation d'une quantité manuelle** — `TravauxTab.jsx` enregistrait la valeur
**à chaque frappe** (`onChange` appelait `manuelPoste`). La saisie passe désormais
par un brouillon local : rien n'est écrit tant que le bouton **Valider** n'est pas
cliqué (ou Entrée). Un indicateur signale « Saisie non enregistrée » puis la
quantité manuelle enregistrée avec le rappel du calcul automatique. Le bouton
« Revenir à la quantité calculée » reste à côté.

**Croquis** — correctif : l'effet de dimensionnement du canevas dépendait de
`render`, dont l'identité change à chaque sélection ; sélectionner une forme
**rétrécissait le canevas**, et toute forme située plus bas devenait inatteignable.
L'espace du bandeau d'édition est maintenant réservé en permanence (hauteur fixe),
donc la zone de dessin ne bouge plus jamais. Ajout d'un `ResizeObserver` (rotation
de tablette, fenêtre redimensionnée), qui ne réécrit le canevas que si les
dimensions ont réellement changé.

**Lot Revêtements de sol** — le type choisi au métré nomme les postes :
« Fourniture et pose de carrelage », « Dépose de sol PVC ». Liste complétée
(parquet contrecollé, sol PVC, lino) et champ **Autre** en saisie libre. Seule la
première lettre passe en minuscule, pour ne pas écrire « sol pvc ».

**Prestations manuelles** — lot Démolition : libellé, quantité, unité
(m², ml, m³, u, forfait, h, j), pièce et observation. Enregistrées dans la visite,
modifiables, supprimables, marquées « saisie manuelle » au rapport et jamais
recalculées.

**Compatibilité** — migration douce : `prestations` et `sol.revetementAutre`
initialisés à vide sur les visites antérieures, aucune donnée existante touchée.

### 2.3.1 — rapport d'expertise

Architecture inchangée. Seuls le rapport et sa mise en page évoluent.

**Informations techniques compactes** — nouvelle primitive `Bandeau` : les chiffres
clés s'affichent horizontalement sur une à deux lignes au lieu d'un tableau vertical.
Chaque case disparaît si sa valeur est vide ou nulle ; le bandeau entier disparaît
s'il ne reste aucune case. Contenu adapté au type de zone : pièce (sol, murs,
plafond, plinthes, hauteur, ouvertures, volume) ; façade (largeur, hauteur, surface
brute, ouvertures, surface nette, fenêtres, portes, tableaux, soubassement, bandeaux,
surface à traiter, pathologies) — jamais de sol, plafond ni plinthes.

**Relevé détaillé des interventions** — le « Quantitatif consolidé » est remplacé.
Chaque pièce porte désormais sa propre section « Interventions retenues », groupée
par lot, avec ses quantités propres. Aucune surface n'est fusionnée entre pièces.
La consolidation n'intervient qu'au **Récapitulatif général des interventions**,
en fin de rapport.

**Identité BRN GROUP** — en-tête premium : logo (`public/logo-brn.png`, extrait du
logo fourni), raison sociale, 204 avenue Gallieni 93140 Bondy, contact@brngroup.fr,
www.brn-group.fr.

**CSS d'impression** — correctif : `.no-print`, `.rap-piece` et `.rap-break` étaient
utilisées par l'écran Rapport depuis la v2.0 mais **n'avaient jamais été définies**.
Conséquences supprimées : les boutons de l'écran apparaissaient dans le PDF, et un
bloc de pièce pouvait être coupé entre deux pages. Ajout de `print-color-adjust: exact`
(sans quoi les navigateurs suppriment les fonds et les bandeaux perdent leur teinte),
d'un format `@page A4 portrait` et des règles anti-coupure.

### 2.3.0 — contexte, zones extérieures, rapport professionnel

Aucune modification d'architecture. Profils, calculs, ouvrages, métrés, IndexedDB,
PWA et hors ligne sont inchangés.

**Informations générales** — deux champs ajoutés dans la section « Projet » existante :
`demandeClient` (demande précise du client) et `contraintes` (contraintes ou souhaits
particuliers). Le champ historique `observations` n'est pas dupliqué : il est
simplement nommé « Observations générales BRN GROUP », son contenu et sa clé de
stockage sont conservés. Les trois sont repris dans le rapport client.

**Zones extérieures** — une façade n'est plus une pièce. Chaque type porte une
catégorie (`cat: "int" | "ext"`) et le sélecteur présente deux familles :
« Pièces » et « Zones extérieures ». Quatre types ajoutés : Façade avant,
Façade arrière, Pignon, Cour. Le profil métier reste piloté par le `typeId`.

**Rapport** — `src/components/RapportBlocs.jsx` :
- `BlocFacade` : nom, support, dimensions, ouvertures, dégradations, réparations
  localisées, finition, photos, observations. Aucune donnée intérieure.
- `BlocPiece` : nom, constat, informations techniques, ouvertures, électricité,
  cuisine (si profil cuisine), photos, observations.
- Règle `aValeur()` : ni « 0 », ni « Aucun », ni « Non renseigné », ni tiret.
  Une rubrique sans contenu disparaît entièrement.

**Compatibilité** — migration douce : les deux nouveaux champs sont initialisés à
vide sur les visites antérieures, aucune donnée existante n'est touchée.

### 2.2.1 — le rapport lit toujours les données à jour

**Symptôme** : le rapport ne reflétait pas les modifications de la visite.

**Cause** : `calcVisite()` construisait les ouvrages à partir de **copies figées**
stockées dans chaque poste au moment où il avait été coché — `t.label`, `t.unit`,
`t.autoKey`, `t.retenu`. Ces champs étaient écrits par l'ancien `toggleT` (v2.1).
Le nouvel onglet Travaux (v2.2) n'écrit plus que le choix du métreur
(`on`, `mode`, `val`, `marge`, `obs`) : les quatre champs lus par le rapport
n'existaient donc plus. Résultat : chaque poste sortait **sans libellé, sans unité
et à quantité 0**, et aucune modification de la visite ne pouvait le faire bouger.
Une quantité saisie manuellement (`t.val`) n'atteignait jamais le rapport, qui
cherchait `t.retenu`.

**Correctif** : l'agrégat figé est supprimé de `calcVisite()`. La source unique est
`ouvragesDeVisite()` (`src/lib/travaux.js`) : elle relit le **catalogue vivant** à
chaque appel et recalcule via `calcPoste()` — le même moteur que l'onglet Travaux.
Un poste ne stocke plus que le choix du métreur.

- Récap, rapport et compteurs sont branchés sur cette source unique.
- Indicateur « Rapport actualisé le … » + bouton « Actualiser le rapport ».
- Poste orphelin (métré source supprimé) : retiré s'il était automatique,
  conservé s'il portait une saisie manuelle — une saisie ne disparaît jamais en silence.

**Correctif annexe** : les marges §7 du sol visaient des postes inexistants
(`so_carrelage`, `so_parquet`, `so_pvc`…). Le catalogue n'a qu'un poste générique
« Revêtement de sol » : la marge suit désormais le **matériau choisi dans le métré**
(`MARGE_REVETEMENT`). Ces marges ne s'appliquaient à rien en 2.2.0.

### 2.2.0 — l'onglet Travaux se remplit tout seul

Chaque poste reprend le métré de la pièce. Le métreur vérifie, valide, ou corrige.

**Chaîne unique** : `métré net → marge du poste → quantité proposée → quantité retenue`.

**Règle de marge (important)** : le poste part du métré **net**. Les marges de
l'onglet Métré (sol, plinthes, faïence) servent à l'approvisionnement matière et
restent affichées là-bas, mais ne sont **pas** réappliquées dans les travaux.
Sans cette règle, un carrelage aurait porté 10 % (métré) × 10 % (poste) = 21 % de marge
silencieuse. La marge est modifiable poste par poste.

Marges par défaut : carrelage 10 %, parquet 8 %, PVC/plinthes 5 %, faïence 10 %,
crédence 10 %, peinture / enduit / plan de travail / façade 0 %.

- **4 statuts** : Automatique · À vérifier · Validé · Modifié manuellement.
- Une quantité validée ou saisie n'est **jamais** écrasée : si le métré source change,
  la nouvelle valeur calculée s'affiche en avertissement, sans remplacer.
- Bouton « Revenir à la quantité calculée » sur chaque poste.
- **46 correspondances** métré → poste (`src/lib/travaux.js`, table `ORIGINES`).
- **Cuisine** : un poste par largeur (« Fourniture et pose meuble bas 60 cm — 4 u »),
  et dépose du mobilier existant, générés depuis le module.
- **Façade** : traitement général et réparations localisées restent deux postes distincts.
- Filtrage par profil, recherche, favoris BRN GROUP, travaux récemment utilisés,
  bouton « Afficher tous les travaux ».
- Validation en masse par pièce, réinitialisation, compteur de postes à vérifier.
- Contrôles de cohérence (quantité nulle, meuble sans largeur, crédence sans hauteur,
  façade sans dimension, écart manuel > 25 %) : **avertissements uniquement**.
- Traçabilité par poste (source, date de validation, dernière modification, ancienne
  quantité), enregistrée dans IndexedDB.
- **Migration douce** : les anciennes visites s'ouvrent ; un poste au format v2.0
  (`{on, retenu}`) devient une saisie manuelle, sa quantité est préservée à l'identique.

Non traité (versions suivantes) : bibliothèque de prix, main-d'œuvre, marges
commerciales, nouveau rapport BRN GROUP.

### 2.1.0 — profils métier

Le **type de pièce** pilote désormais toute l'interface. Le profil est **dérivé du
`typeId`**, jamais stocké : les visites créées avant cette version héritent
automatiquement du bon profil, sans migration de données.

Profils : `interieur`, `cuisine`, `sanitaire`, `facade`, `toiture`, `exterieur`,
`technique` (voir `src/lib/profils.js`). Chacun décide des onglets, des rubriques
de métré, des équipements, des lots et des modules affichés.

- **Profil Façade** : onglet dédié. Masque sol, plafond, plinthes, faïence, doublage,
  peinture intérieure, prises et équipements intérieurs. Affiche dimensions
  (multi-façades, niveaux, façades identiques), support, accès, 23 pathologies avec
  unité (m²/ml/u/forfait), 27 travaux de façade et finitions. Les ouvertures restent
  et se déduisent de la surface.
- **Profil Cuisine** : onglet dédié. Mobilier séparé **Existant / Projet**, 21 types de
  meubles avec largeurs standard, plan de travail multi-tronçons, crédence multi-zones,
  équipements.
- **Filtrage des lots** + boutons « Afficher tous les lots » et « Ajouter
  exceptionnellement un autre lot » (stocké dans `room.lotsExceptionnels`).
- Ergonomie : recherche dans les catalogues, duplication d'élément, boutons +/−,
  champs obligatoires signalés en orange.

**Deux règles métier explicitement implémentées** :
- la longueur de plan de travail est la **somme des tronçons**, jamais déduite de la
  largeur des meubles ;
- le **traitement général** de façade et les **réparations localisées** sont deux
  quantités distinctes qui ne s'additionnent jamais.

Non traité (prévu en 2.2) : automatisation complète de l'onglet Travaux et nouveau
rapport BRN GROUP.

### 2.0.1 — correctif bloquant

**Symptôme** : page blanche au clic sur « Valider tous les métrés calculés ».

**Cause** : dans `src/lib/calc.js`, les trois constantes d'état étaient déclarées sur une
seule ligne (`export const AUTO = "auto", VALIDE = "valide", MANUEL = "manuel";`).
Une déclaration multi-déclarateurs n'expose de façon fiable que le premier identifiant à
l'outillage : `VALIDE` et `MANUEL` n'étaient donc ni exportés ni importés.

`Room.jsx` évaluait `x.mode === VALIDE` uniquement une fois une quantité passée en
« Validé » — d'où un plantage différé, invisible tant que tout restait en calcul
automatique. L'erreur survenant pendant le rendu, React démontait tout l'arbre : page blanche.

**Correctifs** :
- constantes déclarées séparément et importées explicitement ;
- `qValider()` renvoie `null` sur NaN, Infinity ou valeur ≤ 0 : aucune valeur invalide
  ne peut atteindre l'état ni IndexedDB ;
- `validerTout()` et `validerChantier()` : `try/catch`, journalisation détaillée,
  construction complète du résultat avant écriture (aucune validation partielle) ;
- `ErrorBoundary` global : écran de récupération avec rapport d'erreur copiable,
  au lieu d'une page blanche ;
- `src/vite-env.d.ts` : déclaration de `__APP_VERSION__` injectée au build.

### 2.0.0 — version initiale déployable

---

## Licence

Usage interne BRN Group.
