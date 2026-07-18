# 06 — Intégrations & synchronisation

Ce chapitre décrit **comment les choses se parlent** : entre modules, avec le
monde extérieur, et avec les appareils terrain. Trois mécanismes, une même
philosophie : **couplage par contrat, jamais par intrusion**.

## 1. API-first : le contrat avant le code

Toute fonctionnalité expose un **contrat** (P5) avant d'être écrite.

- **REST versionné** (`/v1/...`) documenté en **OpenAPI**, source unique consommée
  par le front web, le mobile, les connecteurs et l'IA.
- **Versionnage** : un contrat publié ne change jamais de façon incompatible. Une
  évolution incompatible crée `/v2` et laisse vivre `/v1` jusqu'à extinction
  documentée (P1).
- **Schémas partagés** client/serveur : un seul schéma de validation fait foi, pas
  de divergence entre ce que le front envoie et ce que le serveur attend.
- **Idempotence** des écritures sensibles (clé d'idempotence) : rejouer une requête
  perdue sur le réseau terrain ne crée pas de doublon.

## 2. Communication entre modules (interne)

Deux modes, choisis selon le besoin :

| Mode | Quand | Exemple |
|---|---|---|
| **Appel synchrone de contrat** | On a besoin d'une réponse immédiate et d'une cohérence forte. | Le devis (Finance) lit les ouvrages de l'étude via l'API du module Études. |
| **Événement asynchrone** | On réagit à un fait accompli, sans bloquer. | `Finance.DevisAccepté` → Chantiers crée le chantier, RH et Stock réagissent chacun de leur côté. |

> **Défaut : l'événement.** Le couplage synchrone crée des dépendances de
> disponibilité (si A est en panne, B l'est aussi). L'événement découple : chaque
> module réagit à son rythme, une panne temporaire se rattrape par rejeu.

## 3. Le bus d'événements & l'enveloppe standard

Tout événement respecte une **enveloppe** commune, stable dans le temps :

```
{
  "id":            "evt_…",           // identifiant unique (idempotence)
  "type":          "Finance.DevisAccepté",
  "version":       1,                  // version du schéma de cet événement
  "org_id":        "org_…",            // multi-tenant (P8)
  "occurredAt":    "2026-07-18T09:12:00Z",
  "actor":         { "userId": "…", "via": "web|mobile|automation|connector" },
  "aggregateId":   "devis_…",          // la racine concernée
  "correlationId": "corr_…",           // relie une chaîne d'un même parcours
  "causationId":   "evt_…",            // l'événement qui a causé celui-ci
  "payload":       { … }               // données métier de l'événement
}
```

- **`version`** : un événement évolue de façon additive ; les consommateurs
  tolèrent les champs inconnus (compatibilité ascendante).
- **`correlationId` / `causationId`** : ils reconstituent tout le fil « de la
  visite à la garantie » (chap. 00 §5) pour l'audit, le débogage et l'IA.
- **Livraison au-moins-une-fois + consommateurs idempotents** : on ne perd pas un
  événement, on ne le traite pas deux fois (chap. 04 §5, Outbox).

## 4. Connecteurs externes (synchronisations)

Le monde extérieur (comptabilité, banque, agenda, signature, cartographie,
fournisseurs) est **instable** : API qui changent, pannes, quotas. On l'isole
derrière des **connecteurs**, un par partenaire.

```
   Cœur ERP  ──port stable──▶  ┌────────────┐   ──API externe──▶  Partenaire
   (jamais au                  │ Connecteur  │   (instable,        (compta,
    courant du                 │ = adaptateur│    versionnée,       banque,
    partenaire)                │  anti-corruption│  faillible)      agenda…)
                               └────────────┘
```

Règles d'un connecteur (couche anti-corruption DDD) :

- Il **traduit** le modèle du partenaire vers/depuis le langage de l'ERP. Le
  vocabulaire du partenaire **n'entre jamais** dans le cœur.
- Il **encaisse les pannes** : file d'attente, réessais avec backoff, mode
  dégradé. Une API comptable indisponible ne bloque **jamais** l'émission d'une
  facture côté ERP ; la synchronisation se fait dès que le partenaire revient.
- Il est **remplaçable** : changer de logiciel comptable = réécrire un connecteur,
  pas toucher la Finance.
- Il porte ses **secrets** (jetons) de façon isolée et révocable (chap. 05 §5).

Connecteurs de référence à prévoir :

| Domaine | Rôle du connecteur |
|---|---|
| Comptabilité | Export des écritures (factures, paiements) vers l'expert-comptable / le logiciel comptable. |
| Banque | Agrégation des relevés pour le rapprochement et la trésorerie réelle. |
| Signature électronique | Signature des devis, PV de réception, contrats. |
| Agenda / messagerie | Rendez-vous de visite, planning, notifications. |
| Cartographie / itinéraires | Adresses de chantier, optimisation des tournées SAV. |
| Fournisseurs / matériaux | Prix, disponibilités, commandes (Stock). |
| Paie | Transmission des variables de paie (RH) au gestionnaire de paie. |

## 5. Synchronisation hors-ligne (terrain)

C'est l'exigence terrain (P4), déjà l'ADN de la v2. Vue d'ensemble ici, détail
au chapitre 09.

- L'appareil terrain détient un **cache local** (IndexedDB) de son périmètre
  (ses chantiers, ses visites, ses tickets) et **travaille dessus hors-ligne**.
- Les modifications locales forment une **file de changements** (mutations) datées
  et attribuées.
- Au retour du réseau, la file se **rejoue** vers le serveur ; les conflits sont
  résolus par une stratégie **explicite** (versions d'agrégat, dernier écrivain
  ou fusion selon le type de donnée — chap. 09 §4).
- Le serveur renvoie les changements survenus ailleurs : **synchronisation
  bidirectionnelle**.

> La synchronisation est un **mécanisme**, pas une condition d'usage : un métreur
> sans réseau saisit un métré complet ; un technicien SAV clôture une intervention
> dans un local sans couverture. Rien n'est perdu, tout se réconcilie.

## 6. Portail client & accès tiers

Le portail client et les accès sous-traitants consomment **les mêmes contrats
`/v1`**, avec un périmètre RBAC/ABAC restreint (chap. 05 §2) :

- Le client voit **ses** documents, **ses** situations, **l'avancement de son
  chantier** — rien d'autre.
- Le sous-traitant voit **ses lots** sur **ses chantiers**.
- Aucune API privée « spéciale portail » : la même surface, filtrée par
  autorisation. Moins de surface = moins de risque.

## 7. Règle d'or des intégrations

> **Le cœur ne connaît jamais l'extérieur.** Un module métier ne sait pas quel
> logiciel comptable, quelle banque, quel outil de signature est branché. Il émet
> des événements et expose des contrats. Ce sont les **connecteurs** qui savent —
> et eux seuls changent quand le monde extérieur change.

C'est cette règle qui rend l'ERP capable d'**intégrer de nouvelles
synchronisations externes pendant des années sans casser l'existant**.
