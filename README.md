# BRN Group — Application de visite technique

**Version 2.0.1**

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
