# Spec 03 — Plan de construction de la Vague 0

Vague 0 = **poser le socle serveur et extraire Études & Métré, sans changer le
comportement métier** (chap. 11 §3, chap. 12 §3). Ce plan découpe le travail en
**lots** livrables, chacun avec ses **critères d'acceptation**. L'ordre respecte
les dépendances ; chaque lot laisse le système cohérent.

> **Règle d'or de la Vague 0** : à sa fin, le métreur fait **tout** ce qu'il
> faisait en v2 — mais ses données sont sauvegardées côté serveur, multi-appareils,
> et toujours utilisables hors-ligne. **Aucune fonction perdue, aucune quantité
> changée.**

## Définition de « terminé » (commune à tous les lots)

Un lot n'est **terminé** que si :

1. Le code respecte les principes (chap. 00 §3) — vérifié en revue.
2. Les **contrats** (spec 02) sont tenus et documentés en OpenAPI.
3. Les **tests** exigés du lot passent en CI (chap. 10 §4).
4. Les **migrations** sont réversibles et jouées en recette (chap. 04 §7).
5. La **doc** est à jour dans la même PR (chap. 12 §1).
6. Rien de l'existant v2 n'est cassé (tests de non-régression du cœur verts).

---

## Lot 0.1 — Filet de sécurité sur le cœur métier *(pré-requis absolu)*

> **État : LIVRÉ.** Outillage Vitest en place (`npm test`), **70 tests** verts sur
> le cœur pur : `src/lib/calc.test.js`, `travaux.test.js`, `profils.test.js`,
> `store.test.js`. Build et comportement métier inchangés.

**But** : geler le comportement métier **avant** de toucher à quoi que ce soit.

- Introduire l'outillage de tests + CI (lint déjà présent : `npm run lint`).
- Écrire des tests unitaires du **cœur pur** v2 tel quel : `calcZone`, `calcRoom`,
  `qVal`/`qValider`/`qPerime`, `ouvragesDeVisite`/`calcPoste`, marges (non-cumul),
  règles métier documentées (plan de travail = somme des tronçons ; traitement
  général ≠ réparations localisées).
- Cas limites reprenant les bugs historiques : quantité ≤ 0 / NaN / Infinity
  (`qValider` → null), poste orphelin, migration d'un poste v2.0 `{on,retenu}`.

**Acceptation** : couverture élevée du cœur ; ces tests deviennent le **contrat de
non-régression** pour toute la Vague 0. Aucun changement de comportement autorisé
sans mise à jour explicite et justifiée d'un test.

---

## Lot 0.2 — Migration progressive vers TypeScript (cœur d'abord)

**But** : typer sans réécrire (ADR-0006).

- Activer TS en interop JS (le JS reste valide).
- Typer en priorité `calc`, `travaux`, `catalogue`, `profils` (le cœur pur, le
  meilleur retour sur investissement).
- Extraire les **types du domaine** (`Study`, `Room`, `Ouvrage`, `Party`,
  états `auto|valide|manuel`) — ils serviront de **schéma partagé** client/serveur.

**Acceptation** : le cœur compile en TS strict ; les tests du lot 0.1 passent
inchangés ; aucun changement fonctionnel.

---

## Lot 0.3 — Socle serveur : identité, base, RLS

**But** : le sol technique (chap. 01, 04, 05).

- PostgreSQL + schémas `core`, `events`, `audit` (spec 01 §1–§3).
- `org_id` + **RLS** sur toutes les tables (spec 01 §5) ; rôles DB par module.
- Authentification **OIDC** ; `GET /v1/me` (spec 02 §1).
- Injection `app.org_id`/`app.user_id` par transaction dans la couche d'accès.
- Object storage S3 + endpoints Documents (spec 02 §4).

**Acceptation** : un utilisateur s'authentifie ; **test d'étanchéité** prouvant
qu'une requête ne franchit jamais `org_id` (ADR-0004) ; upload/download d'un
document fonctionne.

---

## Lot 0.4 — Module Études côté serveur (contrats + persistance)

**But** : servir l'ex-Visite par API (spec 02 §3).

- Schéma `etudes` (spec 01 §4) : `study` (`site` JSONB), `room` (`survey` JSONB),
  `ouvrage_projection`.
- Cas d'usage : créer/lire/mettre à jour/clôturer une étude ; ajouter/éditer/
  réordonner/supprimer une pièce ; lister les ouvrages (recalcul).
- **Réutiliser le cœur pur** (lot 0.2) côté serveur pour valider les invariants et
  régénérer la projection — **jamais** un recalcul divergent.
- Outbox : chaque mutation écrit son événement dans la même transaction ;
  publication `Etude.*` ; entrée `audit`.

**Acceptation** : les contrats spec 02 §3 passent les tests d'intégration ; verrou
optimiste (`409` sur `rev` périmée) et `422` sur quantité invalide vérifiés ;
`close` émet bien `VisiteClôturée` + `MétréChiffréPrêt`.

---

## Lot 0.5 — Synchronisation local-first

**But** : brancher la PWA v2 sur le serveur sans perdre le hors-ligne (ADR-0003,
chap. 09).

- Faire évoluer le `Store` v2 (déjà l'adaptateur prévu à cet effet) : IndexedDB
  reste primaire ; ajout d'une **file de mutations** et d'un **moteur de synchro**.
- Endpoints `POST /v1/sync/push` (idempotent, réponse par mutation) et
  `GET /v1/sync/pull?scope=mine` (spec 02 §5).
- Implémenter la **résolution de conflits par type** (chap. 09 §4) + un écran de
  réconciliation clair.

**Acceptation** : scénario hors-ligne bout-en-bout — saisir une étude complète
sans réseau, puis synchroniser sans perte ; conflit simulé sur deux appareils
résolu selon la stratégie du type ; aucune donnée écrasée en silence.

---

## Lot 0.6 — Import des données v2 existantes

**But** : reprendre l'historique local sans perte (spec 01 §6).

- Outil d'export IndexedDB (visites + blobs) depuis l'appareil.
- Import serveur appliquant `migrerVisite`/`migrerRoom` (idempotents) ; mapping
  `visite→study` (`chantier→site`), `rooms→room.survey`, blobs→documents.
- Idempotence par identifiant v2 conservé ; événement `Etude.Importée` + audit.

**Acceptation** : une base v2 réelle est importée ; **comparaison** avant/après
des ouvrages recalculés = **identiques** (invariant P1) ; réimport = zéro doublon.

---

## Lot 0.7 — Durcissement & exploitation

**But** : rendre la Vague 0 exploitable (chap. 10).

- Sauvegardes chiffrées **testées par restauration** (base + S3) ; RPO/RTO fixés
  avec la direction.
- Observabilité : logs corrélés (`correlationId`), métriques (files Outbox, échecs
  de synchro), alertes.
- Scan de secrets et de dépendances en CI ; registre RGPD des traitements initié
  (clients).
- Drapeaux de fonctionnalité pour activer le mode « serveur » progressivement.

**Acceptation** : une restauration de sauvegarde réussie en recette ; tableau de
supervision minimal en place ; aucun secret dans le dépôt.

---

## Ordonnancement & dépendances

```
0.1 Filet cœur ─▶ 0.2 TypeScript ─┬─▶ 0.4 Études serveur ─┬─▶ 0.5 Synchro ─▶ 0.6 Import ─▶ 0.7 Durcissement
                                  │                       │
                 0.3 Socle serveur┘ (parallèle à 0.2) ────┘
```

- **0.1 est bloquant** : rien ne bouge dans le métier sans filet.
- **0.3 (socle) et 0.2 (TS)** peuvent avancer en parallèle.
- **0.5 dépend de 0.4** ; **0.6 dépend de 0.5**.
- **0.7** s'amorce tôt (sauvegardes dès qu'il y a des données) et se clôt en fin.

## Ce que la Vague 0 **ne fait pas** (et c'est voulu)

Pour rester livrable et sans dérive de périmètre :

- Pas de Finance, CRM, Chantiers… (Vagues 1+). Les liens `opportunity_id`,
  `chantier_id` existent **vides** dans le schéma, prêts (chap. 04, additif).
- Pas de mobile natif (PWA suffit — chap. 09).
- Pas d'IA ni d'automatisations (branchables plus tard sur les événements déjà
  émis par le lot 0.4, **sans** modifier Études — P2).

## Porte de sortie de la Vague 0 (critère go/no-go pour la Vague 1)

On ne démarre la Vague 1 (Finance) que si **tous** ces points sont vrais :

1. Le métreur travaille en v2 **à l'identique**, données sauvegardées serveur.
2. Hors-ligne + synchronisation **prouvés** sans perte.
3. Import v2 **sans divergence** d'ouvrages (P1 tenu).
4. `Etude.MétréChiffréPrêt` **émis et observable** — la prise d'accroche de la
   Finance existe déjà, testée, avant même que la Finance soit écrite (ADR-0005).
5. Sauvegardes **restaurées** avec succès au moins une fois.

> Quand ces cinq points sont verts, la Finance se greffe en **écoutant un
> événement** — sans toucher une ligne du module Études. C'est la démonstration
> concrète que l'architecture tient sa promesse : **évoluer sans casser
> l'existant.**
