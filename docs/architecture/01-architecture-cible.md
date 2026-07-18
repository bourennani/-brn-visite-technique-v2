# 01 — Architecture cible

## 1. Style architectural : le monolithe modulaire évolutif

Le cœur du système est un **monolithe modulaire** (*modular monolith*) :

- **Un seul artefact déployable** côté serveur (une application, une base de
  données logique), pour un coût d'exploitation minimal — adapté à une PME.
- **Des modules internes fortement cloisonnés**, un par contexte délimité, qui ne
  communiquent qu'à travers des **interfaces publiques** (contrats) et des
  **événements de domaine**.
- **Une frontière physique prête pour l'extraction** : le jour où un module doit
  devenir un service autonome (charge, équipe, cycle de vie), on le sort sans
  réécrire les autres, parce qu'il ne dépendait déjà que de contrats.

> On construit un monolithe **qui pourrait devenir microservices**, pas des
> microservices dès le premier jour. C'est le meilleur rapport valeur/risque/coût
> pour ce projet (principe P11).

### Pourquoi pas les microservices tout de suite

| Microservices immédiats | Monolithe modulaire |
|---|---|
| Coût d'infra et d'exploitation élevé (réseau, orchestration, observabilité distribuée). | Une base, un déploiement, une supervision simple. |
| Complexité distribuée (transactions réparties, latence, versions d'API multiples). | Transactions locales, refactoring facile entre modules. |
| Rentable à grande échelle / grandes équipes. | Rentable pour une PME et une petite équipe. |
| Frontières figées tôt, souvent mal placées. | Frontières apprises par l'usage, extraction quand elle est justifiée. |

## 2. Vue en couches

Le système se lit en **cinq couches**, du terminal jusqu'au stockage. La règle de
dépendance est stricte : **une couche ne dépend que de la couche immédiatement
inférieure**, jamais l'inverse. C'est la généralisation du graphe sans cycle de la
v2 (`catalogue → calc → store → ui → écrans → App`).

```
┌───────────────────────────────────────────────────────────────────────┐
│  COUCHE 1 — CLIENTS                                                     │
│  PWA web (bureau) · App mobile (terrain) · Portail client · Connecteurs │
└───────────────────────────────────────────────────────────────────────┘
                 │  HTTPS / contrats versionnés (REST + événements)
┌───────────────────────────────────────────────────────────────────────┐
│  COUCHE 2 — PASSERELLE / BFF (Backend For Frontend)                     │
│  Auth, autorisation, agrégation, limitation de débit, versionnage d'API │
└───────────────────────────────────────────────────────────────────────┘
                 │  appels de cas d'usage
┌───────────────────────────────────────────────────────────────────────┐
│  COUCHE 3 — MODULES MÉTIER (contextes délimités)                        │
│  Études · Finance · Chantiers · CRM · RH · Stock · SAV · Maintenance…   │
│  Chaque module : API publique + cœur métier pur + accès données privé   │
└───────────────────────────────────────────────────────────────────────┘
                 │  contrats internes + bus d'événements
┌───────────────────────────────────────────────────────────────────────┐
│  COUCHE 4 — SOCLE TRANSVERSE (plateforme)                               │
│  Identité · Événements/Outbox · Documents/Fichiers · Notifications ·    │
│  Recherche · Automatisations · IA · Journal d'audit                     │
└───────────────────────────────────────────────────────────────────────┘
                 │
┌───────────────────────────────────────────────────────────────────────┐
│  COUCHE 5 — PERSISTANCE                                                 │
│  PostgreSQL (vérité) · Object storage (médias/docs) · Cache · Index     │
│  Cache local terrain (IndexedDB) synchronisé                            │
└───────────────────────────────────────────────────────────────────────┘
```

### Anatomie interne d'un module (couche 3)

Chaque module métier a **toujours** la même structure interne, en trois anneaux
concentriques (architecture hexagonale / *ports & adapters*) :

```
        ┌─────────────────────────────────────────────┐
        │  API du module (le seul point d'entrée)      │  ← ce que les autres voient
        │  ┌───────────────────────────────────────┐   │
        │  │  Cas d'usage (application)            │   │  ← orchestration, transactions
        │  │  ┌─────────────────────────────────┐  │   │
        │  │  │  Domaine (cœur métier PUR)      │  │   │  ← entités, règles, calculs
        │  │  │  aucune I/O, déterministe       │  │   │     (déjà : calc.js, travaux.js)
        │  │  └─────────────────────────────────┘  │   │
        │  │  Ports (interfaces) ← Adaptateurs     │   │  ← DB, événements, autres modules
        │  └───────────────────────────────────────┘   │
        └─────────────────────────────────────────────┘
```

- **Domaine** : pur, testable sans base ni réseau. C'est là que vit le calcul de
  métré, la règle de marge, le calcul d'une situation de travaux, le calcul de
  paie. Portable client ↔ serveur.
- **Cas d'usage** : orchestre une transaction, émet les événements, applique les
  autorisations. « Accepter un devis », « Clôturer un pointage ».
- **API du module** : la surface publique. Les autres modules ne connaissent
  **que ça**. On peut réécrire tout l'intérieur sans les prévenir.
- **Ports/Adaptateurs** : la persistance (le `Store` de la v2 généralisé), le bus
  d'événements, les appels sortants. Remplaçables (Postgres aujourd'hui, autre
  chose demain) sans toucher au domaine.

## 3. Le socle transverse (couche 4)

Ce sont les services **communs à tous les modules**, développés une fois :

| Service socle | Rôle | Utilisé par |
|---|---|---|
| **Identité & accès** | Authentification (OIDC), utilisateurs, rôles, permissions, sessions. | Tous |
| **Journal d'événements / Outbox** | Enregistre et publie les événements de domaine de façon fiable. | Tous |
| **Documents & fichiers** | Stockage, versionnage, aperçu, signature des PDF, photos, croquis. | Études, Finance, Chantiers, SAV, Docs |
| **Notifications** | E-mail, push mobile, SMS, notifications in-app. | Tous |
| **Recherche** | Index plein-texte transverse (chantiers, clients, documents). | Tous |
| **Automatisations** | Moteur règles + workflows déclenché par les événements. | Tous |
| **IA** | Inférence, extraction, résumé, assistance. Branché sur événements et contrats. | Optionnel par module |
| **Audit** | Piste d'audit immuable : qui, quoi, quand, depuis où. | Tous |
| **Référentiels** | Catalogues partagés (corps d'état, unités, taux de TVA, jours fériés). | Tous |

## 4. Choix technologiques de référence

Les choix ci-dessous sont **la référence**. Un écart se justifie par un ADR.
Ils privilégient : standards ouverts, réversibilité, écosystème mûr, et
**continuité avec la v2** (React/TS) pour ne pas jeter le savoir-faire acquis.

### Front-end

| Élément | Choix | Justification |
|---|---|---|
| Langage | **TypeScript** | Sûreté des contrats à grande échelle. La v2 est en JS/JSX : migration progressive fichier par fichier (TS accepte le JS). |
| Framework web | **React** (continuité v2) | Déjà en place, écosystème mûr, PWA maîtrisée. |
| Build | **Vite** (continuité v2) | Déjà en place. |
| Style | **Tailwind** (continuité v2) | Déjà en place, palette BRN existante. |
| État distant | Client de requêtes avec cache (type *query cache*) + couche locale IndexedDB | Local-first (P4). |
| Mobile | **PWA d'abord**, puis app native (React Native / Capacitor) si besoin matériel | Voir chap. 09. |

### Back-end

| Élément | Choix de référence | Justification |
|---|---|---|
| Runtime / langage | **TypeScript sur Node.js** | Un seul langage front/back : le domaine pur (calc de métré) se partage littéralement entre client et serveur (P6). |
| Cadre applicatif | Un framework **modulaire** structurant (modules, injection de dépendances, découpage clair) — p. ex. NestJS | Impose la modularité de la couche 3. |
| Style d'API | **REST versionné** (`/v1`) documenté en **OpenAPI**, complété d'un flux **événements** | Simple, universel, outillé, interopérable avec les connecteurs. |
| Validation | Schémas partagés client/serveur (un seul schéma source) | Contrat unique, pas de divergence. |

> **Note sur le langage back.** Node/TS est la référence pour la continuité et le
> partage du domaine. Si un besoin de calcul lourd (optimisation de planning,
> gros traitements) apparaît, un service dédié dans un autre langage est
> légitime — mais c'est un ADR, pas un défaut.

### Données & infrastructure

| Élément | Choix de référence | Justification |
|---|---|---|
| Base relationnelle | **PostgreSQL** | Système de vérité. Transactions ACID, JSONB pour la souplesse, robuste, ouvert, réversible. |
| Stockage fichiers | **Object storage compatible S3** | Photos, croquis, PDF, pièces jointes. Séparé de la base (P : médias ≠ données). |
| Cache / files | Cache clé-valeur + file de messages (p. ex. Redis) | Sessions, file des événements, tâches asynchrones. |
| Recherche | Index plein-texte (Postgres FTS d'abord, moteur dédié si besoin) | Simplicité d'abord. |
| Cache local terrain | **IndexedDB** (continuité v2) | Hors-ligne (P4). |
| Hébergement | Cloud à standards ouverts, région **UE** | RGPD (chap. 05). |

## 5. Périmètre de déploiement

```
                    Internet (HTTPS uniquement)
                              │
                    ┌─────────┴─────────┐
                    │   Passerelle/BFF   │  ← auth, TLS, limitation débit
                    └─────────┬─────────┘
          ┌───────────────────┼───────────────────┐
          │                   │                   │
   ┌──────┴──────┐    ┌───────┴───────┐    ┌──────┴───────┐
   │  Monolithe   │    │  Travailleurs  │    │  Connecteurs  │
   │  modulaire   │    │  asynchrones   │    │  externes     │
   │  (API+modules)│   │ (events, IA,   │    │ (compta, banque│
   │              │    │  automations)  │    │  , calendrier) │
   └──────┬───────┘    └───────┬────────┘    └──────┬────────┘
          │                    │                    │
   ┌──────┴────────────────────┴────────────────────┴──────┐
   │  PostgreSQL  ·  Object storage (S3)  ·  Cache/File     │
   └───────────────────────────────────────────────────────┘
```

- L'**API** sert les requêtes synchrones (interfaces, mobile).
- Les **travailleurs asynchrones** consomment les événements : automatisations,
  IA, envois, synchronisations externes. Ils ne bloquent jamais l'utilisateur.
- Les **connecteurs** isolent le monde extérieur (comptabilité, banque, agenda) :
  une panne d'un partenaire n'affecte pas le cœur (chap. 06).

## 6. Comment cette cible se relie à la v2 actuelle

La v2 est déjà, à petite échelle, cette architecture :

| Concept cible | Déjà présent en v2 |
|---|---|
| Cœur métier pur | `src/lib/calc.js`, `src/lib/travaux.js` (recalcul déterministe) |
| Configuration ≠ code | `src/lib/catalogue.js`, `src/lib/profils.js` |
| Adaptateur de persistance (port) | objet `Store` dans `src/lib/store.js` |
| Local-first | IndexedDB + repli mémoire + service worker (PWA) |
| Migration douce | `migrerVisite`, `migrerRoom` |
| Couches sans cycle | `catalogue → calc → store → ui → écrans → App` |

La trajectoire (chap. 11) consiste à **extraire** ces briques vers le module
« Études & Métré » de l'ERP, en préservant exactement leur comportement, puis à
poser les autres modules **à côté**, jamais **par-dessus**.
