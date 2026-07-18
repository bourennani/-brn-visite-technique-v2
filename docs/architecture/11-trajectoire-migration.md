# 11 — Trajectoire de migration (de la PWA à l'ERP)

Ce chapitre répond à **la** question qui décide de la réussite : comment passer de
la PWA de visite technique (v2.4.1) à l'ERP complet **sans jamais rien casser ni
tout réécrire**. La réponse tient en une phrase :

> **On ne remplace pas la v2 : on la fait grandir. Chaque étape ajoute, aucune ne
> détruit. À tout moment, l'outil actuel continue de fonctionner.**

## 1. Point de départ (état réel v2.4.1)

- PWA React/Vite/Tailwind, **100 % locale** (IndexedDB + repli mémoire), installable
  iOS, hors-ligne.
- Domaine **déjà propre** : cœur pur (`calc.js`, `travaux.js`), configuration
  (`catalogue.js`, `profils.js`), adaptateur de persistance (`Store`), migration
  douce (`migrerVisite`/`migrerRoom`), graphe en couches sans cycle.
- **Aucune** dépendance serveur, **aucun** compte, **aucune** synchronisation.

C'est un point de départ **idéal** : le domaine est sain, seule la moitié
« plateforme » (serveur, comptes, synchro, autres modules) manque.

## 2. Les principes de la trajectoire

1. **L'ancien reste vivant.** Tant que le serveur n'est pas en place, la PWA
   locale continue exactement comme aujourd'hui.
2. **On extrait avant d'étendre.** On isole d'abord proprement le domaine
   « Études & Métré » derrière son API, **sans changer son comportement**, avant
   d'y brancher quoi que ce soit.
3. **Chaque vague est utile seule** (chap. 03). On ne livre jamais une
   demi-fonctionnalité qui attend la suivante.
4. **La donnée existante est importée sans perte** grâce à la migration douce déjà
   maîtrisée.

## 3. Les étapes (jalons)

### Étape A — Extraire le socle du domaine (aucun changement visible)

- Introduire **TypeScript** progressivement (TS accepte le JS : on migre fichier
  par fichier, en commençant par `calc.js`, `travaux.js`, `catalogue.js`,
  `profils.js` — le cœur pur, le plus rentable à typer).
- Formaliser l'**API du module Études** autour des fonctions existantes
  (`ouvragesDeVisite`, `calcPoste`, `calcRoom`…) : c'est déjà une surface propre.
- **Aucune** modification de comportement. Filet de sécurité : tests unitaires sur
  le cœur (P6) qui gèlent le comportement actuel **avant** de bouger quoi que ce
  soit.

**Livrable : la v2, identique pour l'utilisateur, mais typée et testée.**

### Étape B — Poser le socle serveur (sans débrancher le local)

- Mettre en place : Identité (OIDC), PostgreSQL, object storage, socle événements,
  API `/v1` (chap. 01, 04, 05).
- Faire évoluer le `Store` (l'adaptateur, déjà « le point d'accroche prévu pour
  brancher Supabase/Firebase » selon le README v2) pour **synchroniser** IndexedDB
  ↔ serveur (chap. 09), en mode **local-first** : le local reste primaire, le
  serveur devient la vérité durable.
- **Importer** les visites locales existantes via la migration douce, sans perte.

**Livrable : les visites sont sauvegardées côté serveur, multi-appareils, tout en
restant utilisables hors-ligne. Le multi-tenant (`org_id`) est en place (P8).**

### Étape C — Vague 1 : Finance (devis) + CRM léger

- Le module Finance **écoute** `Etude.MétréChiffréPrêt` et fabrique un devis à
  partir des ouvrages (`ouvragesDeVisite`) — le pont métré→chiffrage existe déjà
  côté données.
- CRM léger : l'opportunité et le compte, rattachés au Tiers.

**Livrable : de la visite au devis chiffré, sans ressaisie.**

### Étape D — Vague 2 : Chantiers (pilotage)

- `Finance.DevisAccepté` **crée** le chantier. Planning, avancement, premiers
  indicateurs de pilotage.

**Livrable : le dirigeant voit ses chantiers et leur avancement.**

### Étape E — Vagues 3-5 : RH, Stock, Facturation/Trésorerie, SAV, Maintenance, GED

- Chaque module se **greffe** en écoutant/émettant des événements, **sans toucher**
  aux modules déjà livrés. Le coût réel (RH + Stock) vient alimenter la marge
  réalisée du pilotage.

**Livrable progressif : le parcours complet « de la visite à la garantie ».**

### Transverses — introduits quand ils deviennent utiles

- **Mobile natif** : seulement si un besoin matériel l'exige (chap. 09).
- **IA** : dès qu'un module offre un bon cas d'usage à faible risque (chap. 07),
  en commençant par l'assistance au métré.
- **Automatisations** : dès la Finance (relance de devis) puis en s'étendant.
- **Connecteurs** : comptabilité et banque en priorité (valeur immédiate pour le
  dirigeant), le reste ensuite.

## 4. Règles de non-régression pendant toute la trajectoire

- **Le comportement du métré ne change pas** en migrant vers l'ERP : mêmes
  quantités, mêmes règles (marges non cumulées, plan de travail = somme des
  tronçons, traitement général ≠ réparations localisées — cf. README v2). Gelé par
  tests.
- **Aucune donnée existante réécrite en masse** : migration douce à la lecture
  (chap. 04 §7.2).
- **Chaque étape est réversible** : drapeaux de fonctionnalité (chap. 10 §2),
  migrations réversibles (chap. 04 §7.1).
- **À tout moment, on peut s'arrêter** : chaque étape laisse un système cohérent et
  utile. Il n'y a **pas** de point de non-retour où « il faut finir ou tout est
  cassé ».

## 5. Tableau de correspondance v2 → cible

| Élément v2 | Devient | Étape |
|---|---|---|
| `calc.js`, `travaux.js` | Cœur pur du module Études (typé, testé) | A |
| `catalogue.js`, `profils.js` | Configuration/référentiels du module Études, puis éditables (P7) | A → E |
| `Store` (IndexedDB + repli) | Cache local + adaptateur de synchronisation | B |
| `migrerVisite`/`migrerRoom` | Patron de migration douce généralisé à tous les modules | A → toutes |
| Rapport A4 (`Recap.jsx`, `PRINT_CSS`) | Premier producteur du module Documents | E |
| PWA / service worker | Client local-first du système multi-clients | B, chap. 09 |
| Champ `client.origine` | Donnée d'opportunité CRM | C |
| Estimations matière du métré | Besoins alimentant le Stock | E |

## 6. Ce qui garantit « plusieurs années sans refonte majeure »

- Le **domaine est déjà propre** et le restera (cœur pur, testé).
- Les modules sont **cloisonnés par contrat** : en ajouter un ne touche pas les
  autres (P2).
- La donnée est **rétro-compatible par discipline** (P1, migration douce,
  expand & contract).
- Les frontières sont **prêtes pour l'extraction** en services **si** la charge
  l'exige un jour (P11), sans dette payée d'avance.
- Les décisions sont **écrites** (ADR) : la connaissance ne repose pas sur des
  personnes.

> La refonte majeure arrive quand l'architecture n'anticipe pas le changement.
> Ici, **le changement est le cas nominal** : chaque module est un ajout prévu, pas
> une entorse.
