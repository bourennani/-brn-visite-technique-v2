# 04 — Données & persistance

## 1. Le système de vérité

**PostgreSQL est la source unique de vérité** pour les données métier
structurées. Tout le reste (cache, index de recherche, cache local terrain, vues
analytiques) est **dérivé** et **reconstructible** à partir de lui.

| Nature de la donnée | Où elle vit | Reconstructible ? |
|---|---|---|
| Données métier structurées (étude, devis, chantier, pointage…) | **PostgreSQL** | — (c'est la vérité) |
| Fichiers binaires (photos, croquis, PDF) | **Object storage (S3)**, référencés en base | Non — sauvegardés à part |
| Journal d'événements | **PostgreSQL** (table append-only) | — (c'est l'histoire) |
| Index de recherche | Moteur d'index | Oui (réindexation) |
| Cache local terrain | **IndexedDB** sur l'appareil | Oui (resynchronisation) |
| Vues de pilotage / analytique | Projections | Oui (rejeu des événements) |

> **Conséquence opérationnelle :** une sauvegarde cohérente = base PostgreSQL +
> object storage. Tout le reste se régénère.

## 2. Multi-tenant dès le premier jour (P8)

Chaque ligne de chaque table métier porte une colonne **`org_id`** non nulle.
Aujourd'hui il n'y a qu'une organisation (BRN Group) ; demain il peut y en avoir
plusieurs (filiales, franchises, SaaS) **sans migration structurelle**.

- Isolation par **filtrage systématique `org_id`** appliqué au niveau de la couche
  d'accès (jamais laissé à l'appelant), renforcé par la **sécurité au niveau ligne**
  (Row-Level Security PostgreSQL) : même une requête fautive ne peut pas franchir
  la frontière d'organisation.
- Le `party_id` (Tiers), le `user_id`, tout identifiant est **relatif à une org**.
- Les référentiels ont deux niveaux : **globaux** (unités, TVA légale) et **propres
  à l'org** (catalogue de prix, corps d'état personnalisés).

## 3. Modèle de stockage par module

Chaque module possède son **schéma logique** (préfixe / espace de noms de tables).
Règle de cloisonnement (P2), appliquée **physiquement** :

- Un module n'a le droit d'écrire **que** dans ses tables.
- La lecture inter-module passe par l'**API du module**, pas par un `JOIN`
  transversal. On l'outille par des permissions de base de données par module
  (rôles PostgreSQL distincts), pour que la règle soit **impossible à violer par
  accident**, pas seulement déconseillée.
- Les seules données transverses partagées en lecture directe sont les
  **référentiels** et l'**annuaire des Tiers** (identités), en lecture seule.

```
Schémas logiques (exemples)
  core.*        organisations, tiers, utilisateurs, rôles, référentiels, documents
  events.*      journal d'événements + outbox (append-only)
  etudes.*      visites/études, pièces, ouvrages
  finance.*     devis, factures, situations, trésorerie, prix
  chantiers.*   chantiers, phases, avancement, réceptions
  crm.*         comptes, opportunités, interactions
  rh.*          salariés, pointages, absences
  stock.*       articles, mouvements, emplacements
  sav.*         tickets, interventions, garanties
  maint.*       contrats, équipements, plans préventifs
  audit.*       piste d'audit
```

## 4. Souplesse maîtrisée : relationnel + JSONB

Le bâtiment est un domaine **riche et variable** : une pièce cuisine n'a pas les
mêmes champs qu'une façade (la v2 le gère déjà par profils). On combine :

- **Colonnes relationnelles** pour ce qui est stable, requêté, chiffré, contraint
  (identifiants, montants, dates, statuts, liens). C'est là que vivent l'intégrité
  référentielle et les index.
- **Colonnes `JSONB`** pour le **détail métier variable** (le relevé d'une pièce,
  la configuration d'un profil, les options d'un ouvrage). Cela **préserve
  exactement** la structure imbriquée actuelle de la v2 (`room.sol`, `room.facade`,
  `room.cuisine`…) sans la fracturer en 40 tables prématurément.

> Règle : **on requête et on chiffre sur le relationnel, on décrit le métier fin
> en JSONB.** Un champ JSONB qui devient requêté/agrégé « remonte » en colonne
> relationnelle par migration additive (P1). On ne devine pas à l'avance : on
> promeut quand le besoin est réel.

## 5. Journal d'événements & Outbox

Le journal d'événements (`events.*`) est une table **append-only** (on n'y fait
que des `INSERT`). Il porte l'histoire métier (chap. 02 §4).

**Pattern Outbox** (garantit qu'on ne perd jamais un événement) :

1. Un cas d'usage écrit sa donnée métier **et** son événement dans la **même
   transaction** locale. Soit les deux réussissent, soit aucun.
2. Un processus de publication lit l'outbox et **publie** les événements vers le
   bus (les travailleurs asynchrones, les autres modules, l'IA, les connecteurs).
3. La publication est **au-moins-une-fois** ; les consommateurs sont **idempotents**
   (ils reconnaissent un événement déjà traité par son `id`).

Ce mécanisme est ce qui rend la promesse P3 (« l'écrit fait foi, la donnée est
tracée ») **fiable** et non « au mieux ».

## 6. Cycle de vie des documents et médias

Les fichiers (photos, croquis, PDF de rapport/devis/facture) vivent dans l'**object
storage**, jamais dans la base :

- La base stocke une **référence** (clé, type, taille, empreinte, version,
  propriétaire, `org_id`) — c'est déjà l'esprit du `blobKey` de la v2.
- Les **documents émis** (devis signé, facture, PV de réception) sont **immuables
  et versionnés** : on ne modifie jamais un PDF émis, on en émet une nouvelle
  version. Valeur juridique (chap. 02 §5, règle 3).
- **Compression et normalisation** à l'entrée (la v2 a déjà `compressImage`,
  `MAX_PHOTO_MB`) pour maîtriser le volume terrain.
- **Rétention** : chaque type de document a une durée de conservation légale
  (facture 10 ans, marché, etc.), pilotée par le module Documents.

## 7. Migrations : la discipline de non-régression

C'est le cœur de l'invariant P1. Toute évolution de schéma suit ce protocole :

### 7.1 Migrations de schéma (serveur)

- **Versionnées, ordonnées, idempotentes, jouées automatiquement** au déploiement.
- **Additives par défaut** : ajouter une colonne/table ne casse aucune version en
  cours d'exécution.
- **Renommage / suppression = expansion puis contraction** (« *expand & contract* ») :
  1. *Expand* : on ajoute le nouveau, on écrit dans les deux (ancien + nouveau).
  2. *Migrate* : on recopie l'historique, on bascule les lectures.
  3. *Contract* : une fois plus aucune version ne lit l'ancien, on le retire.
- **Réversibles** : chaque migration a son inverse testé.
- **Testées sur une copie de production** avant application.

### 7.2 Migrations de données applicatives (« migration douce »)

La v2 a inventé la bonne pratique (`migrerVisite`, `migrerRoom`) : **on complète à
la lecture, on ne réécrit jamais en masse.** On l'érige en règle :

- Une entité lue dans une version ancienne est **complétée en mémoire** des champs
  manquants (valeurs par défaut sûres), **sans réécriture destructive**.
- La réécriture n'a lieu qu'au **prochain enregistrement légitime** par
  l'utilisateur — jamais une migration de masse silencieuse qui toucherait des
  milliers de chantiers d'un coup.
- Ces fonctions de migration sont **idempotentes** (les rejouer ne change rien) et
  **testées** avec des données de chaque version passée.

> C'est ce qui permet de tenir « on ne casse jamais l'existant » **des années
> durant** : la donnée de 2026 s'ouvrira encore en 2032.

## 8. Intégrité, cohérence et concurrence

- **Transactions ACID** pour tout ce qui touche l'argent, le stock, la paie.
- **Cohérence éventuelle** (via événements) **entre** modules : le coût réel d'un
  chantier se met à jour peu après le pointage, pas dans la même transaction.
- **Contrôle de concurrence optimiste** : chaque agrégat porte une **version**
  (`rev`) ; une écriture concurrente périmée est **refusée**, pas écrasée. C'est
  aussi le socle de la résolution de conflits hors-ligne (chap. 09).
- **Suppression = archivage** (*soft delete* + événement), jamais `DELETE`
  physique sur une donnée engageante (anti-objectif chap. 00 §4). Exception : droit
  à l'effacement RGPD, processus tracé (chap. 05).

## 9. Analytique & pilotage

Le tableau de bord dirigeant (la raison d'être du projet) ne requête **jamais**
directement les tables transactionnelles des modules :

- Des **projections de lecture** (vues matérialisées / tables de projection)
  agrègent, alimentées par les événements. Elles sont **reconstructibles** par
  rejeu.
- Le calcul « marge prévue vs réalisée », « trésorerie projetée », « charge des
  équipes » est une **projection**, pas une requête ad hoc qui coupleraient
  Finance + RH + Stock + Chantiers (ce qui violerait P2).
- À terme, un **entrepôt analytique** séparé peut recevoir ces projections sans
  jamais peser sur la base transactionnelle.
