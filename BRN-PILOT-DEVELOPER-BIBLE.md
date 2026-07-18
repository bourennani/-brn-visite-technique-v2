# BRN PILOT — DEVELOPER BIBLE — VERSION 1.0

> **Nature du document.** Guide **officiel et normatif** de développement de *BRN
> Pilot*. Il **transforme** les décisions des 8 documents fondateurs en **règles
> concrètes** que tout développeur — humain ou agent IA — doit suivre pour
> contribuer **sans casser l'architecture, sans contourner les règles métier et
> sans provoquer de régression**.
>
> **Ce document ne contient aucun code fonctionnel, aucune table de production,
> aucune fonctionnalité métier.** Il définit **comment** on développera. Nous
> restons en phase de conception ; le développement du **premier lot** (§48) ne
> commence qu'après **revue globale du socle**.
>
> **Les 8 documents fondateurs** (présents sur cette branche) font autorité ; en cas
> de conflit, ils priment, et cette Bible s'y conforme :
> Master Blueprint · Business Rules · Data · Security · Product · Automation ·
> UX/UI · API.
>
> **Statut :** v1.0 — dernier document fondateur. Après lui : **revue globale**,
> puis **développement contrôlé du premier lot vertical**. Aucun nouveau document
> fondateur ne sera créé après celui-ci.

---

## Table des matières

**Partie A — Socle technique**
1. Objectif · 2. Stack technique · 3. Architecture du dépôt · 4. Couches ·
5. Domaines & modules

**Partie B — Conventions de code**
6. Nommage · 7. Types & validation · 8. Montants financiers · 9. Temps ·
10. Services de domaine · 11. Commandes & requêtes · 12. Événements ·
13. Automatisations · 14. IA Gateway · 15. RAG

**Partie C — Sécurité & données**
16. Auth & autorisation · 17. Multi-entreprise · 18. Base de données ·
19. Migrations · 20. Fichiers · 21. Erreurs · 22. Journalisation · 23. Observabilité

**Partie D — Qualité & tests**
24. Tests · 25. Données de test · 26. Qualité du code · 35. Performance ·
36. Accessibilité · 37. Internationalisation · 38. Documentation du code · 39. ADR

**Partie E — Livraison**
27. Git & GitHub · 28. Commits · 29. Pull Requests · 30. Code review · 31. CI/CD ·
32. Environnements · 33. Variables d'environnement · 34. Dépendances ·
40. Feature flags · 41. Compatibilité & dépréciation · 42. Sauvegardes ·
43. Réponse à incident

**Partie F — Discipline & gouvernance**
44. Prévention des régressions · 45. Definition of Ready · 46. Definition of Done ·
47. Règles pour les agents IA · 48. Premier lot de développement ·
49. Ordre de développement · 50. Traçabilité & clôture du socle

> **Conventions.** Règles `DEV-…`. Identifiants stables, jamais recyclés.

---

# Partie A — Socle technique

## 1. Objectif

Permettre à **tout contributeur** (développeur ou agent IA) d'ajouter de la valeur
à *BRN Pilot* **sans** : casser l'architecture, contourner les règles métier,
introduire une faille, ou provoquer une régression. Cette Bible définit
l'architecture du dépôt, les conventions, les responsabilités par couche, la
sécurité, la qualité, les tests, le versionnement, les migrations, la CI/CD, les
règles GitHub, les critères de validation, la prévention des régressions et les
conditions de mise en production.

## 2. Stack technique (recommandée & figée pour la V1)

> Critères : moderne, sécurisée, maintenable, adaptée à une **petite équipe**,
> évolutive, **peu coûteuse au démarrage**, compatible **Vercel + PostgreSQL**,
> **sans complexité d'entreprise inutile**. On capitalise sur les compétences déjà
> présentes (React/TypeScript/Tailwind/Vitest, hérités de *BRN Visite Technique*).

| Besoin | Choix recommandé | Rôle | Raisons / Avantages | Limites | Alternatives rejetées | Remplacer si… |
|---|---|---|---|---|---|---|
| **Frontend / plein-pile** | **Next.js (App Router) + React + TypeScript** | App web, BFF, rendu | Un seul cadre front+back, natif Vercel, mûr, connu de l'équipe | Fonctions serverless mal adaptées aux tâches longues (→ worker séparé) | Vite SPA seul (pas de BFF), SvelteKit/Nuxt (moins connus) | Besoin d'un front totalement découplé du back |
| **Style** | **Tailwind CSS + jetons de design** | Mise en forme | Continuité, rapidité, cohérence via jetons (UX/UI Bible) | Discipline de jetons requise | CSS-in-JS lourd | — |
| **Validation** | **Zod (schémas partagés)** | Valider entrées/sorties | Un schéma = type + validation, partagé front/back | — | Validation ad hoc | — |
| **Backend applicatif** | **Next.js Route Handlers + Server Actions** (BFF) ; **couche domaine TypeScript agnostique** | API + orchestration | Simple, colocalisé, testable ; le domaine reste indépendant du framework (§4) | — | Framework back séparé (NestJS) : surcoût pour une PME | Extraction d'un service justifiée (Master Blueprint P11) |
| **Base de données** | **PostgreSQL managé** (serverless, ex. compatible Neon/Supabase) **+ pgvector** | Vérité + RAG | ACID, RLS multi-tenant, pgvector évite un système vectoriel séparé | Connexions serverless à gérer (pooling) | NoSQL (intégrité insuffisante), base cloud propriétaire (verrou) | Volume/charge dépassant Postgres (lointain) |
| **Accès données** | **Drizzle ORM (SQL-first, typé)** + migrations | Requêtes typées | Léger, SQL proche (facilite RLS/tenant), types stricts, migrations versionnées | Moins « magique » que Prisma | **Prisma** (plus lourd, RLS/serverless plus délicats) ; SQL brut non typé | Besoin d'un ORM plus productif validé par ADR |
| **Authentification** | **Fournisseur d'identité OIDC managé** (MFA intégré) | Auth déléguée | Aucun mot de passe maison, MFA/révocation/SSO futurs (Security C1) | Dépendance fournisseur (atténuée par OIDC standard) | Auth maison (surface d'attaque), clé statique | Besoin de souveraineté totale → OIDC auto-hébergé |
| **Stockage fichiers** | **Objet compatible S3** | Documents/photos | URLs signées, coût, scalabilité, séparé de la base | Gestion des accès à faire | Fichiers en base, disque local | — |
| **File d'attente / jobs** | **pg-boss (file sur PostgreSQL)** + **worker dédié** | Asynchrone | Un système de moins (réutilise Postgres), transactionnel, peu coûteux | Débit limité vs broker dédié ; **worker = process long, hors serverless** | Broker managé (surcoût), tout en serverless (inadapté au long) | Débit/volume élevé → broker managé (ADR) |
| **Tâches planifiées** | **Ordonnanceur (ex. Vercel Cron) déclenchant des jobs** | Récurrent | Simple, intégré ; le job réel tourne côté worker (idempotent) | Granularité de l'ordonnanceur | Cron maison non supervisé | — |
| **Cache** | **Minimal au départ** (mémoire courte / Postgres) ; **cache clé-valeur managé si besoin** | Performance | Éviter la complexité prématurée | À introduire au bon moment | Cache d'emblée (sur-ingénierie) | Besoin de perf mesuré (§35) |
| **Logs** | **Journal structuré (JSON)** | Traçabilité technique | Corrélation, exploitable | — | `console.log` non structuré | — |
| **Audit** | **Table d'audit immuable en PostgreSQL** | Conformité | Intègre, requêtable, cloisonné | — | Logs seuls (moins sûr) | — |
| **Observabilité** | **Traces/métriques compatibles OpenTelemetry + traqueur d'erreurs** | Supervision | Standard, portable | Coût à surveiller | Aucune observabilité (inacceptable) | — |
| **Tests** | **Vitest** (unité/domaine/intégration) + **Playwright** (E2E) | Qualité | Continuité (Vitest déjà en place), rapides | — | Jest (moins rapide sur ce socle) | — |
| **Déploiement** | **Vercel** (web) + **hébergement worker** (petit service/conteneur) + **Postgres/S3 managés** | Exploitation | Peu coûteux, simple, UE | Le **worker** ne vit pas sur Vercel (à héberger à part) | Kubernetes d'emblée (sur-ingénierie) | Charge justifiant une infra dédiée |
| **IA Gateway** | **Service interne TypeScript + adaptateurs fournisseurs** | IA multi-fournisseur | Indépendance (Claude/OpenAI/Gemini/local), contrôlé | — | Appel direct à un fournisseur depuis les modules | — |
| **RAG** | **pgvector (index dans PostgreSQL)** | Recherche augmentée | Simple, tenant-aware, un système de moins | Passage à l'échelle du vectoriel | Base vectorielle séparée (surcoût) | Volume vectoriel élevé (ADR) |
| **Emails & notifications (futur)** | **Abstraction fournisseur** (canaux e-mail/push) | Diffusion | Remplaçable, préparé sans être développé | — | Couplage à un fournisseur | — |

> **DEV-STACK-01 — Nuance Vercel + asynchrone.** Vercel convient au **web/BFF** ;
> les **tâches longues et le worker de file** tournent dans un **process dédié**
> (petit service hébergé). C'est un point d'architecture assumé, pas une entorse :
> l'application web reste sur Vercel, l'asynchrone à côté.
>
> **DEV-STACK-02 — Toute évolution de stack passe par un ADR** (§39).

## 3. Architecture du dépôt

> **DEV-REPO-01 — Dépôt distinct.** *BRN Pilot* est un **dépôt séparé** de *BRN
> Visite Technique*. Aucune base ni code partagé directement (Master Blueprint 23).

> **DEV-REPO-02 — Dépôt unique modulaire (pas de monorepo multi-paquets d'emblée).**
> On recommande **un seul dépôt Next.js structuré en modules internes** (monolithe
> modulaire). C'est le meilleur rapport simplicité/évolutivité pour une petite
> équipe. Un passage en **monorepo à paquets** (workspaces) n'est justifié que si un
> module doit être **publié/extrait** (mobile natif, service séparé) — décision par
> ADR.
>
> **Raisons :** un seul cycle de build/déploiement, refactoring facile, pas de
> surcoût de plomberie ; les frontières de modules sont **logiques** (dossiers +
> règles de dépendances vérifiées), prêtes à l'extraction si besoin.

**Structure de référence** (zones claires ; noms indicatifs) :

```
brn-pilot/
  app/                # Application web Next.js (App Router) — PRÉSENTATION
    (routes, pages, layouts)   # aucune règle métier ici
  app/api/            # Route Handlers — la surface API (BFF)
  src/
    ui/               # Composants visuels réutilisables (design system) — aucune logique métier
    modules/          # DOMAINES MÉTIER, un dossier par module (§5)
      <module>/
        domain/       # Domaine pur (règles, calculs, transitions) — sans I/O
        application/  # Cas d'usage (commandes/requêtes), orchestration
        api/          # Contrats exposés du module (interfaces publiques)
        events/       # Événements publiés/consommés du module
        persistence/  # Adaptateurs de données du module (privés)
    core/             # Socle transverse : types partagés, argent, temps, erreurs, résultat
    services/         # Services techniques (auth, stockage, files, notifications)
    integrations/     # Adaptateurs externes (compta, banque, calendrier, BRN Visite T.)
    ai/               # IA Gateway, adaptateurs fournisseurs, prompts versionnés, RAG
    validation/       # Schémas Zod partagés (entrée/sortie, DTO)
    types/            # Types transverses
    db/               # Schéma logique, accès, RLS
    db/migrations/    # Migrations versionnées
    workers/          # Traitements asynchrones (consommateurs de file, jobs planifiés)
  tests/              # Tests (unité/intégration/E2E/contrat), factories, fixtures
  docs/               # Documentation (les 8 bibles + ADR + guides)
  scripts/            # Scripts d'outillage (seed test, vérifs)
  config/             # Configuration (lint, format, CI, env.example)
```

> **DEV-REPO-03 — Aucune logique métier dans les composants visuels** (`src/ui`,
> `app/`). Un composant **affiche et saisit** ; il appelle l'API (Product P2/UX).
> Un calcul officiel dans un composant = **non conforme** (revue bloquante).

## 4. Couches de l'application

Huit couches, avec des **dépendances dirigées vers l'intérieur** (le domaine ne
dépend de rien de technique).

| Couche | Peut contenir | Ne doit JAMAIS contenir | Dépendances autorisées | Interfaces | Tests |
|---|---|---|---|---|---|
| **Présentation** | Écrans, composants, état d'UI | Règle métier, calcul officiel, accès base | API (via contrats), UI, validation | Consomme l'API | Tests de rendu, E2E, accessibilité |
| **Application** (cas d'usage) | Orchestration, transactions, autorisation, émission d'événements | Détails d'infra (SQL, HTTP), calcul dupliqué | Domaine, ports (interfaces) | Commandes/Requêtes | Tests de cas d'usage |
| **Domaine** (cœur pur) | Entités, règles, calculs, transitions, scores | **Framework web, base de données, fournisseur IA**, I/O | Rien de technique (pur) | Fonctions/services purs | Tests unitaires massifs |
| **Infrastructure** | Implémentations techniques (auth, stockage, files) | Règle métier | Ports du domaine/application | Adaptateurs | Tests d'intégration |
| **Persistance** | Accès données, mapping, RLS, migrations | Règle métier | Base, ports | Dépôts (repositories) | Tests d'intégration base |
| **Intégrations** | Adaptateurs externes (anti-corruption) | Vocabulaire externe qui « fuit » dans le domaine | Ports, connecteurs | Adaptateurs | Tests avec doublures |
| **Automatisations** | Règles déclencheur→action, jobs | Calcul officiel (délègue au domaine) | Application, événements, files | Handlers de jobs | Tests d'automatisation |
| **IA** | Gateway, adaptateurs, prompts, RAG | Accès direct aux tables, chiffre officiel | Outils métier contrôlés (ports) | Interface IA | Tests avec réponses simulées |

> **DEV-LAYER-01 — Règle d'or.** Le **Domaine ne dépend pas** du framework web, de
> la base de données ni d'un fournisseur IA. Toute dépendance technique passe par un
> **port** (interface) implémenté à l'extérieur. Cela rend le métier **testable,
> portable et durable** (Master Blueprint 5.3).

## 5. Domaines & modules

Un dossier par module (§3). Pour chaque module : **responsabilité, frontières,
dépendances, événements publiés, événements consommés, interfaces exposées.**
**Aucune dépendance circulaire** (vérifiée par outillage, §26).

| Module | Responsabilité | Publie (ex.) | Consomme (ex.) |
|---|---|---|---|
| Entreprise | Organisation, paramètres | `org.*` | — |
| Utilisateurs | Comptes, rôles, permissions | `user.*`, `role.*` | — |
| Dirigeant | Cockpit, tâches, décisions, priorités | `task.*`, `decision.*` | **écoute tous** |
| Clients | Tiers/clients/prospects | `party.*` | `payment.recorded` |
| Chantiers | Chantiers, avancement, coût réel, marge, réception | `project.*` | `quote.accepted`, `expense.created`, `labor.workday-recorded` |
| Finance | Trésorerie, marge, projections | `finance.*` | `invoice.*`, `payment.*`, `expense.*` |
| Devis | Devis versionnés | `quote.*` | `visit.finalized` (connecteur) |
| Factures | Factures, avoirs, numérotation légale | `invoice.*` | `project.progress-validated` |
| Paiements | Encaissements, rapprochement | `payment.*` | `invoice.issued` |
| Dépenses | Dépenses, rattachements | `expense.*` | — |
| Fournisseurs | Tiers fournisseurs | `supplier.*` | — |
| Main-d'œuvre | Salariés, journées, paie (préparation) | `labor.*` | `project.started` |
| Véhicules | Parc, entretiens, coûts | `vehicle.*` | `expense.created` |
| Contraventions | Infractions (N4, audité) | `fine.*` | — |
| Documents | GED, versions, signature | `document.*` | événements produisant un document |
| Tâches | Tâches priorisées | `task.*` | **écoute tous** |
| Calendrier | Rendez-vous, sync | `calendar.*` | `visit.scheduled` |
| Alertes | Alertes/notifications | `alert.*` | échéances/seuils |
| Objectifs | Objectifs dirigeant | `objective.*` | — |
| Décisions | Décisions dirigeant | `decision.*` | — |
| Automatisations | Règles/workflows | — | **écoute tous** |
| IA | Copilote, agents, RAG | `ai.*` | événements (lecture) |
| Audit | Piste d'audit immuable | — | **écoute tous** (trace) |

> **DEV-MOD-01 — Communication inter-modules par contrat ou événement uniquement**
> (Master Blueprint P2/P3, API Bible). Un module n'importe jamais la persistance
> d'un autre.

---

# Partie B — Conventions de code

## 6. Conventions de nommage

Simples, cohérentes, **vérifiables automatiquement** (lint) :

| Élément | Convention |
|---|---|
| Dossiers / fichiers | `kebab-case` (ex. `project-service.ts`). |
| Composants React | `PascalCase` (fichier et symbole). |
| Fonctions / variables | `camelCase`. |
| Types / interfaces / classes | `PascalCase`. |
| Services / cas d'usage | Verbe métier explicite (`IssueInvoice`, `RecordPayment`). |
| Commandes | Impératif (`issue-invoice`, `start-project`). |
| Événements | `domaine.fait-au-passé` (ex. `invoice.issued`). |
| Tables | `snake_case` pluriel (`invoices`), préfixe de module si utile. |
| Colonnes | `snake_case` ; `id`, `org_id`, `created_at`, `revision`… (Data Bible A4). |
| Migrations | Horodatées + description (`20260101_create_invoices`). |
| Routes API | `/api/v1/<ressource>` ; commandes `…:action`. |
| Tests | `<sujet>.test.ts` / `<parcours>.e2e.ts`. |
| Branches Git | `feat/…`, `fix/…`, `docs/…`, `chore/…` + court libellé. |
| Commits | Convention type « conventional commits » (§28). |
| Pull Requests | Titre = même convention ; corps = gabarit (§29). |

## 7. Types & validation

- **DEV-TYPE-01 — TypeScript strict** partout ; **`any` interdit** sauf justification
  écrite et localisée.
- **DEV-TYPE-02 — Schémas Zod** comme **source unique** : ils produisent à la fois la
  **validation** et le **type**. Types distincts et explicites : **entrée** (requête),
  **sortie** (réponse/DTO), **domaine** (entités), **persistance** (lignes),
  **événements**, **montants** (§8).
- **DEV-TYPE-03 — Aucune donnée externe fiable avant validation** : requêtes,
  imports, webhooks, réponses IA, fichiers — **tout** est validé aux frontières
  (Security, API Bible).

## 8. Gestion des montants financiers

> **DEV-MONEY-01 — Une seule abstraction monétaire** (`Money`) pour **tous** les
> calculs : **entier en centimes + devise obligatoire**. **Aucun flottant** pour un
> montant officiel.

- **DEV-MONEY-02 — Règles centralisées** : TVA, pourcentages, **arrondis**, totaux,
  marges, conversions, prévisions vivent dans le **moteur financier** (module Finance
  / `core`), **jamais recodées** dans plusieurs modules. Chaque règle renvoie à un
  `CALC-…` de la Business Rules Bible.
- **DEV-MONEY-03 — Devise obligatoire** : un montant sans devise est invalide.
- **DEV-MONEY-04 — Arrondis explicites et testés** (par ligne / total / taux),
  conformes aux usages comptables (Business Rules 15.3).
- **DEV-MONEY-05 — L'interface n'effectue aucun calcul officiel** : elle affiche des
  montants calculés par le serveur (Product P14).

## 9. Gestion du temps

- **DEV-TIME-01 — Stockage/transport en UTC** (ISO 8601) ; **une seule source** de
  vérité temporelle. La **présentation locale** (fuseau) **ne modifie jamais** la
  valeur officielle.
- **DEV-TIME-02 — Fuseau de l'organisation** pour les calculs métier (échéances,
  jours ouvrés, horaires) ; documenté et paramétrable.
- **DEV-TIME-03 — Échéances et délais** calculés par le domaine (jours ouvrés, fins de
  mois) selon des règles testées.
- **DEV-TIME-04 — Import Apple Calendar (futur)** : les instants importés sont
  normalisés en UTC + fuseau d'origine conservé ; dédoublonnage par identité stable.

## 10. Services de domaine

- **DEV-DOM-01 — Le domaine implémente** : calculs, transitions d'état, règles,
  validations, décisions déterministes, **scores de priorité**, **projections
  financières** — en fonctions **pures**, **déterministes**, **testées**.
- **DEV-DOM-02 — Chaque règle importante cite un identifiant** de la Business Rules
  Bible (`BR-…`, `CALC-…`, `PRI-…`, `ST-…`) en commentaire/nom. Une règle absente de
  la Bible **n'est pas codée** (on demande validation, §47).
- **DEV-DOM-03 — Éviter les fonctions géantes** et les règles dispersées : une règle
  = un endroit ; composition de petites fonctions nommées.

## 11. Commandes & requêtes

- **DEV-CQ-01 — Séparation légère Commande / Requête** (pas de CQRS lourd) :
  **Requêtes** (lecture, sans effet de bord) vs **Commandes** (écriture, effet,
  événement). On **n'introduit pas** de bus/event-sourcing complexe sans besoin
  prouvé (ADR).
- **DEV-CQ-02 — Une action métier n'est pas un `update` générique.** « Émettre une
  facture », « Réceptionner un chantier » sont des **commandes métier** portant état,
  validation et événement (API Bible §3, Partie D).

## 12. Événements métier

- **DEV-EVT-01 — Enveloppe standard** (Data/API/Automation) : `id`, `nom`, `version`,
  `horodatage`, `org`, `origine` (utilisateur/système + canal), `corrélation`,
  `données minimales`, `niveau de sensibilité`.
- **DEV-EVT-02 — Publication fiable** par **boîte d'envoi transactionnelle** (donnée
  + événement dans la même transaction) ; publication ensuite.
- **DEV-EVT-03 — Rejeu & idempotence** : livraison au moins une fois ; consommateurs
  **idempotents** par `id` ; erreurs → réessais/DLQ (§13) ; tout **journalisé**.
- **DEV-EVT-04 — Compatibilité** : évolution **additive** ; version incrémentée si
  rupture ; un type publié ne disparaît pas en silence.

## 13. Automatisations

- **DEV-AUTO-01 — Implémenter les workflows de l'Automation Bible** via : tâches
  planifiées, files, **retries**, **backoff**, **dead-letter queue**, **annulation**,
  **supervision**, **statut**, **validation humaine**.
- **DEV-AUTO-02 — Chaque exécution a un identifiant** et un statut (planifiée →
  … → réussie/échouée/partielle).
- **DEV-AUTO-03 — Aucune automatisation ne modifie silencieusement une donnée
  sensible** : action engageante → **validation humaine** (Automation A5) ; tout est
  tracé.

## 14. IA Gateway

- **DEV-AI-01 — Interface commune** + **adaptateurs fournisseurs** (Claude/OpenAI/
  Gemini/local) ; les modules parlent au **Gateway**, jamais à un fournisseur.
- **DEV-AI-02 — Prompts versionnés** ; **outils internes autorisés** (l'IA agit via
  des **outils métier contrôlés**, jamais un accès direct aux tables) ; **contrôle
  des droits** (droits de l'utilisateur), **minimisation** des données, **timeout**,
  **quotas**, **coûts** journalisés, **fallback** (basculer/renvoyer déterministe).
- **DEV-AI-03 — Réponses simulées** pour les tests (l'IA est simulable ; les tests ne
  dépendent d'aucun fournisseur).
- **DEV-AI-04 — L'IA ne produit aucun chiffre officiel** ; elle reçoit les résultats
  du moteur (Business Rules IA-001).

## 15. RAG

- **DEV-RAG-01 — Pipeline** : ingestion → découpage → métadonnées (org, droits,
  version, sensibilité) → indexation (pgvector) → recherche → **citations** →
  réindexation ; suppression d'index à la suppression d'un document.
- **DEV-RAG-02 — Filtrage des droits AVANT et APRÈS la recherche** : on n'indexe/ne
  renvoie que ce que l'utilisateur peut voir ; cloisonnement **par entreprise**
  strict ; document confidentiel hors périmètre **exclu** ; consultations sensibles
  **journalisées** (Security, API Bible §43).

---

# Partie C — Sécurité & données

## 16. Authentification & autorisation (traduction de la Security Bible)

- **DEV-SEC-01 — Contrôle systématique côté serveur** : identité, entreprise, rôle,
  permissions, classification de la ressource — **à chaque requête** (Zero Trust).
- **DEV-SEC-02 — Aucun contrôle important uniquement côté frontend** : l'interface
  masque, le serveur interdit.
- **DEV-SEC-03 — MFA** pour les rôles à privilèges ; **sessions** limitées,
  **révocation**, **journal des connexions** ; **élévation de privilège** et
  **actions administratives** → ré-authentification + audit.
- **DEV-SEC-04 — Ressources sensibles** (Espace Dirigeant, Contraventions, RH,
  Finance) : accès restreint et audité ; non-divulgation (`ERR-NOT-FOUND`).

## 17. Multi-entreprise (cloisonnement)

- **DEV-TEN-01 — Contexte d'entreprise obligatoire** : chaque donnée métier porte
  `org_id` ; l'`org` est **dérivée du jeton**, jamais du client.
- **DEV-TEN-02 — Filtrage systématique** dans la couche d'accès **et** **sécurité au
  niveau ligne (RLS)** en base : la base **renforce** l'isolation, pas seulement le
  code.
- **DEV-TEN-03 — Tenant-aware partout** : **tâches asynchrones**, **cache**,
  **stockage**, **RAG** portent l'organisation ; aucune agrégation inter-entreprises.
- **DEV-TEN-04 — Tests anti-fuite** obligatoires (§24). Une **fuite inter-entreprise
  est un incident critique** (§43).

## 18. Base de données

- **DEV-DB-01 — Clés primaires** internes stables ; **identifiants publics** opaques
  préfixés (jamais l'ID interne exposé/devinable).
- **DEV-DB-02 — Relations, contraintes, index** explicites ; les **contraintes de
  base renforcent les règles critiques** (unicité de numéro de facture, non-nul
  `org_id`, cohérence des états) — **pas seulement le code**.
- **DEV-DB-03 — Historique & audit** : tables d'historique (état avant/après) et
  d'audit **immuables** (Data Bible A5, D21).
- **DEV-DB-04 — Soft delete limité** (archivage) ; **données immuables** pour les
  actes émis (facture) ; jamais d'effacement physique d'une donnée engageante (sauf
  RGPD tracé).
- **DEV-DB-05 — RLS** activée sur toutes les tables portant `org_id` (§17).

## 19. Migrations

- **DEV-MIG-01 — Versionnées, revues, testées** sur **copie anonymisée** ; jouées
  **d'abord en recette**.
- **DEV-MIG-02 — Additives par défaut** ; renommage/suppression en **plusieurs
  étapes** (expand → migrate → contract) ; **compatibilité progressive** (l'ancienne
  et la nouvelle version cohabitent le temps du déploiement).
- **DEV-MIG-03 — Rollback ou stratégie compensatoire** définie pour chaque
  migration ; **interdiction des changements destructifs directs en production**.
- **DEV-MIG-04 — Sauvegarde** avant migration sensible (§42).

## 20. Fichiers & documents

- **DEV-FILE-01 — Cycle** : **upload signé** → **quarantaine** → **validation**
  (type réel, taille, **hash**, **détection de doublon**) → **scan antivirus (futur)**
  → disponibilité → **accès temporaire signé** → archivage → **suppression encadrée**
  → **audit**.
- **DEV-FILE-02 — Aucun fichier utilisateur fiable** : jamais interprété/exécuté ;
  servi avec en-têtes sûrs ; classification héritée de l'objet (Security D3).

## 21. Gestion des erreurs

- **DEV-ERR-01 — Types d'erreurs** distincts : **domaine**, **validation**,
  **technique**, **intégration**, **temporaire** (réessayable), **définitive**.
- **DEV-ERR-02 — Traduction en réponse API** via l'enveloppe standard (`ERR-…`,
  message utilisateur, `retryable`, `correlationId`) ; **jamais** de détail interne
  sensible (pile, SQL, secret, chemin).
- **DEV-ERR-03 — Journalisation + corrélation** de chaque erreur ; construction
  complète avant écriture (pas d'effet partiel).

## 22. Journalisation

- **DEV-LOG-01 — Logs structurés** (JSON, corrélés). Quatre familles : **technique,
  audit métier, sécurité, automatisations/IA/imports/exports**.
- **DEV-LOG-02 — Jamais dans les logs** : mots de passe, jetons, secrets, coordonnées
  bancaires, contenu complet des documents, données personnelles excessives (N4).

## 23. Observabilité

- **DEV-OBS-01 — Métriques, traces, corrélation** ; erreurs, performance,
  disponibilité, **files**, base, stockage, intégrations, **coûts IA**.
- **DEV-OBS-02 — Alertes techniques** sur les signaux qui comptent (file bloquée,
  connecteur en panne, échec de sauvegarde, taux d'erreur) **sans fatigue d'alerte**
  (regroupement, seuils).

---

# Partie D — Qualité & tests

## 24. Tests

> **DEV-TEST-01 — Stratégie complète** (pyramide) : **unitaires**, **domaine**,
> **intégration**, **API**, **contrat**, **end-to-end**, **sécurité**,
> **autorisation**, **multi-entreprise (anti-fuite)**, **idempotence**,
> **concurrence**, **automatisation**, **import**, **IA simulés**, **responsive**,
> **accessibilité**.

- **DEV-TEST-02 — Couverture renforcée** sur : **règles financières**, **permissions**,
  **transitions d'état** (ce sont les zones à plus fort risque).
- **DEV-TEST-03 — Non-régression** : chaque bug corrigé arrive avec un **test qui le
  reproduit** (§44).
- **DEV-TEST-04 — Tests déterministes** : pas d'horloge/aléa réels dans le domaine ;
  temps/aléa injectés.

## 25. Données de test

- **DEV-FIX-01 — Factories & fixtures** : entreprises, clients, chantiers, montants
  **fictifs** ; **scénarios réalistes** (entreprise saine + un chantier problématique,
  cf. prototype).
- **DEV-FIX-02 — Interdiction d'utiliser des données réelles** en développement
  local ; la recette utilise une **copie anonymisée** (Security).

## 26. Qualité du code

- **DEV-QA-01 — Outils** : **formatage** automatique, **lint**, **typage strict**,
  **complexité** et **duplication** surveillées, contrôle des **imports** et
  **dépendances** (pas de cycle), **code mort**, **vulnérabilités**, **licences**,
  **détection de secrets**.
- **DEV-QA-02 — Le pipeline bloque une PR** en cas d'échec critique (lint/typage/
  tests/secrets/vulnérabilité) (§31).

## 35. Performance

- **DEV-PERF-01 — Objectifs** (à chiffrer et mesurer) : chargement, navigation,
  requêtes, listes volumineuses, graphiques, recherche, imports, fichiers, mobile,
  IA.
- **DEV-PERF-02 — Moyens** : pagination (curseur), index, cache **au bon moment**,
  calcul **asynchrone**, chargement progressif, **limitation des payloads**, mesures
  réelles (pas d'optimisation à l'aveugle).

## 36. Accessibilité

- **DEV-A11Y-01 — Règles techniques** (UX/UI Bible G2) : **HTML sémantique**,
  navigation **clavier**, **focus visible**, **labels**, lecteurs d'écran,
  **contrastes**, messages d'erreur accessibles, **réduction des animations**.
- **DEV-A11Y-02 — Tests automatisés + manuels** d'accessibilité.

## 37. Internationalisation

- **DEV-I18N-01 — Préparer l'i18n dès la V1** (même en français) : **textes
  centralisés** (pas de texte métier dispersé), formats de **date/devise/nombres**,
  messages d'erreur, fuseaux, contenu dynamique.

## 38. Documentation du code

- **DEV-DOC-01 — Documenter** : règle complexe, décision d'architecture, sécurité,
  calcul, intégration, limitation, contournement. **Citer les identifiants** des
  bibles concernées.
- **DEV-DOC-02 — Éviter** les commentaires qui répètent le code ; documenter le
  **pourquoi**, pas le **quoi**.

## 39. ADR

- **DEV-ADR-01 — Un ADR** pour toute décision structurante : **contexte, décision,
  alternatives, conséquences, statut, date**. Numéroté, immuable (remplacé, jamais
  supprimé). Rangé dans `docs/adr/`.

---

# Partie E — Livraison

## 27. Git & GitHub

- **DEV-GIT-01 — Branche principale (`main`) protégée** : **pas de push direct**,
  revue obligatoire, **checks obligatoires** verts avant fusion.
- **DEV-GIT-02 — Branches courtes** nommées (`feat/…`, `fix/…`, `docs/…`), fusionnées
  vite ; **historique propre**.
- **DEV-GIT-03 — Tags & releases** (versionnage sémantique) ; **changelog** tenu ;
  **rollback** possible (revert + redéploiement).
- **DEV-GIT-04 — Tout agent IA (Claude Code, etc.) travaille UNIQUEMENT sur une
  branche dédiée** ; jamais sur `main` ; jamais de PR sans autorisation explicite.

## 28. Commits

- **DEV-COMMIT-01 — Convention** type « conventional commits » (`feat:`, `fix:`,
  `docs:`, `chore:`, `test:`, `refactor:`).
- **DEV-COMMIT-02 — Un commit = un objectif** unique, compréhensible, sans mélange ;
  **référence** la fonctionnalité ou le document ; **aucun secret** ; **aucun
  fichier généré inutile** (build/artefacts ignorés).

## 29. Pull Requests

- **DEV-PR-01 — Gabarit** obligatoire : **objectif, périmètre, fichiers principaux,
  règles métier concernées (identifiants), risques, captures si interface,
  migrations, tests, sécurité, impact performance, procédure de retour arrière,
  checklist.**
- **DEV-PR-02 — PR trop volumineuse → découpée.** Une PR se relit en un temps
  raisonnable.

## 30. Code review

- **DEV-REVIEW-01 — Points de contrôle** : architecture, **règles métier**,
  **sécurité**, **autorisations**, **multi-entreprise**, performance, **tests**, UX,
  accessibilité, **données**, **migrations**, observabilité, documentation.
- **DEV-REVIEW-02 — La validation visuelle seule ne suffit jamais** : on vérifie le
  respect des bibles, pas seulement l'apparence.

## 31. CI/CD

- **DEV-CI-01 — Pipeline minimal** : **installation reproductible** → **lint** →
  **typage** → **tests** → **tests de contrat** → **analyse de sécurité** →
  **détection de secrets** → **build** → **aperçu de déploiement (preview)** →
  **validation des migrations** → **déploiement contrôlé**.
- **DEV-CI-02 — Aucun déploiement de production automatique** sans **stratégie
  explicite** (validation humaine, fenêtre, rollback prêt).

## 32. Environnements

- **DEV-ENV-01 — Environnements** : local, développement partagé, **preview** (par
  branche/PR), test, **staging**, production.
- **DEV-ENV-02 — Isolation stricte** : chaque environnement a ses **variables**,
  **base**, **stockage**, **secrets**, **données** propres. **Aucun** environnement de
  test n'utilise directement la production.

## 33. Variables d'environnement

- **DEV-VAR-01 — Nommage clair** ; **validation au démarrage** (l'app refuse de
  démarrer si une variable requise manque ou est invalide).
- **DEV-VAR-02 — Portée** : distinguer strictement **serveur** (secrets) et
  **client**. **Une variable sensible n'est jamais exposée** via un préfixe frontend
  (ex. `NEXT_PUBLIC_…`).
- **DEV-VAR-03 — Secrets** au coffre/plateforme, **jamais dans Git** ;
  **`.env.example`** sans valeur réelle ; **rotation**.

## 34. Dépendances

- **DEV-DEP-01 — Politique** : privilégier les bibliothèques **maintenues** ;
  **limiter** le nombre ; éviter les paquets redondants ; **vérifier les licences** ;
  **suivre les vulnérabilités** ; **verrouiller les versions** ; mises à jour
  régulières ; **validation avant changement majeur** (ADR si structurant).

## 40. Feature flags

- **DEV-FLAG-01 — Usage** : fonctionnalités incomplètes, **déploiement progressif**,
  IA, intégrations, fonctions sensibles, **test par entreprise**.
- **DEV-FLAG-02 — Pas de flag permanent sans suivi** : chaque flag a un propriétaire
  et une échéance de nettoyage.

## 41. Compatibilité & dépréciation

- **DEV-COMPAT-01 — Politique** : compatibilité ascendante par défaut ; **migrations**
  accompagnées ; **dépréciation** annoncée avec **avertissements** et **délai** ;
  **suivi des consommateurs** ; **tests** de compatibilité (API Bible §5).

## 42. Sauvegardes & restauration

- **DEV-BAK-01 — Procédures** : **fréquence**, **chiffrement**, **conservation**,
  **test de restauration**, **responsabilités**, **RPO**, **RTO**, **restauration
  partielle**, **incident**.
- **DEV-BAK-02 — Une sauvegarde non testée n'est pas fiable** : restauration exercée
  périodiquement (Security I1).

## 43. Réponse à incident

- **DEV-IR-01 — Processus** (Security I3) pour : fuite de données, compromission,
  perte de données, **erreur financière**, panne, intégration défaillante, **action
  IA incorrecte**, déploiement défectueux.
- **DEV-IR-02 — Étapes** : détection → confinement → correction → communication →
  audit → **retour d'expérience** (postmortem écrit, sans blâme).

---

# Partie F — Discipline & gouvernance

## 44. Prévention des régressions

> **DEV-REG-01 — Règle absolue.** **Aucune fonctionnalité stable n'est supprimée,
> remplacée ou simplifiée silencieusement.** (Product P11.)

Moyens : **tests de non-régression**, **changelog**, **comparaison avant/après**,
**validation des parcours critiques**, **version stable de référence**, **rollback**
prêt, **revue métier** pour tout changement de comportement. Toute suppression/
modification d'un comportement existant est **explicite, justifiée, tracée et
approuvée**.

## 45. Definition of Ready (DoR)

Une fonctionnalité **n'entre en développement** que si :

- le **besoin** est clair ; les **règles métier** sont identifiées (Business Rules) ;
- les **données** sont définies (Data Bible) ; les **permissions** sont définies
  (Security) ;
- l'**UX** est définie (UX/UI Bible) ; l'**API** est définie (API Bible) ;
- les **cas d'erreur** sont définis ; les **critères d'acceptation** sont **écrits** ;
- les **risques** sont évalués.

## 46. Definition of Done (DoD)

Une fonctionnalité **n'est terminée** que si :

- le **code** est développé ; les **tests** passent ; les **permissions** sont
  vérifiées ; l'**audit** fonctionne ; les **erreurs** sont gérées ;
- l'**UX** est validée ; le **responsive** est vérifié ; l'**accessibilité** est
  vérifiée ;
- la **documentation** est à jour ; **aucune régression** n'est détectée ; la
  **sécurité** est validée ; le **déploiement est réversible**.

## 47. Règles pour les agents IA de développement

> Applicables à Claude Code, ChatGPT ou tout autre agent contribuant au code.

- **DEV-AGENT-01 — Lire les bibles concernées** avant toute modification.
- **DEV-AGENT-02 — Afficher le plan** avant un changement important ; attendre le cas
  échéant.
- **DEV-AGENT-03 — Ne jamais inventer une règle métier** : si une règle manque, **la
  demander** (ne pas improviser, §DEV-DOM-02).
- **DEV-AGENT-04 — Ne pas modifier plusieurs domaines** sans nécessité ; périmètre
  minimal.
- **DEV-AGENT-05 — Ne jamais supprimer une fonction stable** (§44).
- **DEV-AGENT-06 — Vérifier le dépôt et la branche** ; travailler **uniquement sur une
  branche dédiée** ; jamais sur `main`.
- **DEV-AGENT-07 — Consulter le diff** avant de committer.
- **DEV-AGENT-08 — Exécuter les tests** (et le lint/typage) avant de proposer.
- **DEV-AGENT-09 — Signaler les incertitudes** honnêtement.
- **DEV-AGENT-10 — Ne jamais committer de secret.**
- **DEV-AGENT-11 — Ne jamais déployer en production sans autorisation.**
- **DEV-AGENT-12 — Documenter toute décision nouvelle** (ADR si structurant).
- **DEV-AGENT-13 — Demander validation** lorsqu'une règle ou une donnée manque.

## 48. Premier lot de développement (vertical minimal)

> **DEV-LOT0-01.** Le premier lot vérifie **les fondations** avant tout module
> métier. Périmètre **strictement limité** :

**Inclus :**
- **Initialisation propre** du dépôt *BRN Pilot* (structure §3, config, lint, format,
  typage).
- **Qualité & CI** (pipeline §31 : lint, typage, tests, secrets, build, preview).
- **Authentification** (OIDC déléguée, session, MFA pour la direction).
- **Entreprise** (organisation, contexte tenant `org_id` + RLS).
- **Utilisateur dirigeant** ; **rôles & permissions de base**.
- **Base PostgreSQL** (schéma socle : organisation, utilisateur, rôle, audit) +
  migrations versionnées.
- **Cockpit vide connecté** (écran d'entrée qui s'affiche, authentifié, tenant-aware,
  **sans données financières**).
- **Journal d'audit** (écriture + lecture restreinte).
- **Environnements local & preview** opérationnels.

**Exclus (explicitement) :**
- **Aucun module financier complet** ; **aucune donnée financière réelle**.
- **Aucune IA réelle** (au plus une place réservée d'AI Gateway simulé).
- **Aucune synchronisation Apple Calendar.**
- Aucun autre module métier.

**Objectif :** prouver que **les fondations tiennent** (sécurité, tenant, audit, CI,
environnements) avant d'ajouter la valeur métier.

## 49. Ordre de développement recommandé

> Par **tranches verticales utilisables** (pas par couches techniques
> interminables). L'exemple fourni est **challengé** et confirmé, avec une nuance.

| # | Tranche | Justification |
|---|---|---|
| 0 | **Fondation technique & sécurité** (le lot §48) | Rien ne se construit sans socle sûr, tenant-aware, audité, testé. |
| 1 | **Cockpit dirigeant & tâches** | La valeur n°1 (Product/UX) ; en grande partie autonome ; se remplit ensuite des événements des autres modules **sans être modifié**. |
| 2 | **Clients & chantiers** | Le cœur de l'activité ; base des coûts et de la marge. |
| 3 | **Dépenses & main-d'œuvre** | Alimentent le **coût réel** → la marge devient réelle. |
| 4 | **Factures & encaissements** | Encaisser ; numérotation légale ; échéances. |
| 5 | **Trésorerie & rentabilité** | Pilotage financier (projections, marge prévue vs réalisée). |
| 6 | **Véhicules & contraventions** | Modules autonomes ; échéances/coûts ; forte valeur dirigeant. |
| 7 | **Documents** | GED transverse ; renforce les autres modules. |
| 8 | **Automatisations** | Une fois assez d'événements émis, on active les workflows. |
| 9 | **IA** | Se branche sur des événements/contrats déjà stables (aucune modif des modules). |
| 10 | **Intégration BRN Visite Technique** | Connecteur : métré → devis, sans base partagée. |
| 11 | **Calendrier Apple** | En dernier (stratégie à trancher, connecteur préparé). |

> **DEV-ORDER-01 — Nuance.** Devis peut être livré **avec ou juste avant** les
> chantiers (le devis accepté crée le chantier). On ajuste finement à la
> planification, mais **la règle des tranches verticales prime** : chaque tranche
> est **utilisable seule** et ne casse pas la précédente (Product P18).

## 50. Traçabilité & clôture du socle documentaire

### 50.1 Traçabilité (extrait)

| Thème Developer | Developer Bible | Source fondatrice |
|---|---|---|
| Stack & dépôt | §2, §3 | Master Blueprint (architecture) |
| Couches & domaine pur | §4 | Master Blueprint 5.3 |
| Montants / temps | §8, §9 | Business Rules 15, API Bible §6 |
| Services de domaine (règles citées) | §10 | Business Rules (BR/CALC/PRI/ST) |
| Commandes & événements | §11, §12 | API Bible §3, Business Rules 13 |
| Auth / multi-entreprise / RLS | §16, §17, §18 | Security C, Master Blueprint 9.2 |
| Migrations | §19 | Master Blueprint 29 |
| Fichiers | §20 | Security D, API Bible §30 |
| Tests | §24 | Master Blueprint 27, API Bible §44 |
| CI/CD & environnements | §31, §32 | Master Blueprint 28, Security H |
| Régressions / DoR / DoD | §44–§46 | Product P11, Master Blueprint 30 |
| Agents IA | §47 | Product, Security, Automation |
| Ordre de développement | §49 | Master Blueprint 34, Product 34 |

### 50.2 Clôture du socle documentaire

> **DEV-CLOSE-01.** Avec la Developer Bible, le **socle documentaire est complet
> (8 documents fondateurs)**. **Aucun nouveau document fondateur n'est créé après
> celui-ci.**
>
> **Prochaines étapes (dans l'ordre) :**
> 1. **Revue globale du socle** (cohérence des 8 documents, décisions ouvertes à
>    trancher, validation par la direction).
> 2. **Développement contrôlé du premier lot vertical** (§48), sur une branche
>    dédiée, en respectant cette Bible.
>
> Le développement ne commence **qu'après** la revue globale et la validation.

---

## Fin du document

> **BRN PILOT — Developer Bible v1.0.** Le guide qui transforme les 8 documents
> fondateurs en règles concrètes de développement : stack, dépôt, couches, modules,
> conventions, sécurité, données, migrations, GitHub, CI/CD, tests, observabilité,
> performance, IA, automatisations, prévention des régressions, Definition of Ready /
> Done, règles pour les agents IA, premier lot et ordre de développement. **Sans
> code fonctionnel, sans table de production, sans fonctionnalité métier.**
>
> **Règle d'or.** On développe **par tranches verticales utilisables**, en citant
> les règles des bibles, sans casser l'existant, sans contourner la sécurité, sans
> calcul officiel hors du moteur, et **jamais** en production sans réversibilité.
>
> **Socle documentaire clos. Prochaine étape : revue globale, puis premier lot.**
