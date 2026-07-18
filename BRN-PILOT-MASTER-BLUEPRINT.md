# BRN PILOT — MASTER BLUEPRINT D'ARCHITECTURE — VERSION 1.0

> **Nature du document.** Document d'architecture fondateur, **sans code**,
> destiné à être **relu et validé avant le début du développement**. Il constitue
> la **référence officielle** de tout le développement futur de *BRN Pilot*.
>
> **Ce document ne contient volontairement aucun code, aucune interface, aucune
> maquette.** Les schémas présentés sont des diagrammes d'architecture, pas des
> implémentations. Les listes d'entités et de champs sont un *dictionnaire de
> données* (documentation), pas un schéma exécutable.
>
> **Statut :** proposition d'architecture, en attente de validation.
> **Version :** 1.0 — à valider.
> **Périmètre :** *BRN Pilot* (ERP de pilotage), application **distincte** de
> *BRN Visite Technique*.

---

## Note liminaire — le prototype UX existant

Une première **expérimentation UX** du tableau de bord « Chantiers / Pilotage » a
été réalisée sous forme de prototype visuel (un fichier de démonstration, avec
des **données fictives**, non connecté aux données réelles).

Ce prototype :

- est conservé **uniquement** comme prototype visuel, démonstrateur UX et exemple
  de présentation (cartes, graphiques, alertes) ;
- **ne constitue pas** la base technique de *BRN Pilot* ;
- **ne préjuge pas** de l'architecture cible décrite ici.

Le présent document est la **seule** référence d'architecture. Toute décision de
conception se prend à partir d'ici, jamais à partir du prototype.

---

## Sommaire

1. [Vision et périmètre du produit](#1--vision-et-périmètre-du-produit)
2. [Principes architecturaux](#2--principes-architecturaux)
3. [Architecture fonctionnelle](#3--architecture-fonctionnelle)
4. [Découpage des modules](#4--découpage-des-modules)
5. [Architecture technique](#5--architecture-technique)
6. [Choix technologiques argumentés](#6--choix-technologiques-argumentés)
7. [Architecture frontend](#7--architecture-frontend)
8. [Architecture backend](#8--architecture-backend)
9. [Architecture de la base de données](#9--architecture-de-la-base-de-données)
10. [Principales entités métier](#10--principales-entités-métier)
11. [Relations entre les entités](#11--relations-entre-les-entités)
12. [Architecture des API](#12--architecture-des-api)
13. [Architecture des événements métier](#13--architecture-des-événements-métier)
14. [Moteur d'automatisation](#14--moteur-dautomatisation)
15. [Calculs financiers](#15--calculs-financiers)
16. [Gestion des fichiers et justificatifs](#16--gestion-des-fichiers-et-justificatifs)
17. [Authentification](#17--authentification)
18. [Gestion des rôles et permissions](#18--gestion-des-rôles-et-permissions)
19. [Journal d'audit et traçabilité](#19--journal-daudit-et-traçabilité)
20. [Sécurité](#20--sécurité)
21. [Sauvegardes et restauration](#21--sauvegardes-et-restauration)
22. [Imports et exports](#22--imports-et-exports)
23. [Intégration future avec BRN Visite Technique](#23--intégration-future-avec-brn-visite-technique)
24. [Préparation des fonctions IA](#24--préparation-des-fonctions-ia)
25. [Gestion des erreurs](#25--gestion-des-erreurs)
26. [Observabilité et journaux techniques](#26--observabilité-et-journaux-techniques)
27. [Tests](#27--tests)
28. [Environnements de développement, test et production](#28--environnements-de-développement-test-et-production)
29. [Versionnement et migrations](#29--versionnement-et-migrations)
30. [Prévention des régressions](#30--prévention-des-régressions)
31. [Scalabilité et évolutivité](#31--scalabilité-et-évolutivité)
32. [Analyse des risques](#32--analyse-des-risques)
33. [Décisions d'architecture proposées](#33--décisions-darchitecture-proposées)
34. [Ordre recommandé de développement des modules](#34--ordre-recommandé-de-développement-des-modules)
35. [Questions métier restant à valider](#35--questions-métier-restant-à-valider)

> **Convention de lecture.** Pour chaque choix important, le document indique :
> **la solution recommandée**, **les raisons**, **les avantages**, **les limites**
> et **les alternatives rejetées**.

---

## 1 — Vision et périmètre du produit

### 1.1 Vision

*BRN Pilot* est le **logiciel métier de pilotage** de BRN Group, entreprise
générale du bâtiment. Son but unique et mesurable :

> Donner à la direction, à tout instant, une **vision fiable, à jour et traçable**
> de la santé de chaque chantier et de l'entreprise — de la signature d'un devis
> au dernier jour de garantie — sur une **source de vérité unique**, sécurisée.

*BRN Pilot* n'est pas un outil de saisie de plus : c'est un outil de **décision**.
La saisie n'existe que pour alimenter le pilotage (marge prévue vs réalisée,
trésorerie projetée, charge des équipes, retards, litiges, stock immobilisé).

### 1.2 Ce que BRN Pilot est

- Un **logiciel métier** sécurisé, maintenable et évolutif, pensé pour vivre
  plusieurs années sans refonte majeure.
- Une application **distincte** de *BRN Visite Technique*, mais conçue pour
  **communiquer** avec elle ultérieurement via une API sécurisée et/ou un système
  d'événements (chapitre 23).
- Un socle **multi-modules** (finance, chantiers, CRM, RH, stock, SAV,
  maintenance, documents), livrés progressivement sans casser l'existant.

### 1.3 Ce que BRN Pilot n'est pas (anti-périmètre)

- **Pas** un logiciel comptable légal : il *alimente* la comptabilité de
  l'expert-comptable, il ne la remplace pas (au moins en version initiale).
- **Pas** un logiciel de paie légal : il *prépare* les variables de paie.
- **Pas** une collection de fichiers HTML indépendants : c'est un **produit
  unique et cohérent**, avec une seule base de données et des contrats stables.
- **Pas** un clone de *BRN Visite Technique* : le métré reste dans *BRN Visite
  Technique* ; *BRN Pilot* consomme ses résultats.

### 1.4 Périmètre fonctionnel cible (haut niveau)

| Domaine | Rôle dans le pilotage |
|---|---|
| Finance | Devis, factures, situations de travaux, trésorerie, marge. |
| Chantiers | Planning, avancement, coût réel, réception, garanties. |
| CRM | Prospects, clients, affaires, pipeline commercial. |
| RH | Salariés, pointage, absences, préparation de paie. |
| Stock | Articles, mouvements, approvisionnement. |
| SAV | Tickets après réception, suivi des garanties. |
| Maintenance | Contrats récurrents, interventions préventives. |
| Documents | GED, justificatifs, pièces jointes, modèles. |

### 1.5 Contraintes produit structurantes (rappel de la commande)

Le produit final devra notamment prévoir : authentification sécurisée ; rôles et
permissions ; base **PostgreSQL** ; **séparation stricte** présentation / logique
métier / stockage ; journal d'audit ; historique des modifications ; sauvegardes ;
gestion des pièces jointes ; **import Excel/CSV** ; **calculs financiers
centralisés** ; automatisations fiables ; compatibilité ordinateur / tablette /
téléphone ; évolution vers **plusieurs entreprises** ; **communication future**
avec *BRN Visite Technique* ; **aucune donnée financière codée en dur dans
l'interface**.

Chacune de ces contraintes est traitée dans un chapitre dédié et récapitulée au
chapitre 33 (décisions d'architecture).

### 1.6 Objectifs de qualité (exigences non fonctionnelles), par priorité

| Priorité | Qualité | Ce que ça impose |
|---|---|---|
| 1 | Intégrité des données | Aucune perte, aucune corruption, traçabilité totale. |
| 2 | Sécurité et confidentialité | Auth forte, cloisonnement, RGPD, chiffrement. |
| 3 | Maintenabilité et évolutivité | Ajouter un module sans toucher les autres. |
| 4 | Fiabilité des calculs financiers | Calculs centralisés, testés, jamais dans l'UI. |
| 5 | Disponibilité multi-support | Bureau, tablette, téléphone. |
| 6 | Performance perçue | Interface réactive, traitements lourds asynchrones. |
| 7 | Coût d'exploitation maîtrisé | Infrastructure proportionnée à une PME. |

---

## 2 — Principes architecturaux

Ces principes sont la **constitution** de *BRN Pilot*. Toute décision technique
s'y conforme ; un écart se justifie par une décision d'architecture écrite
(chapitre 33).

| # | Principe | Énoncé |
|---|---|---|
| P1 | Non-régression | On ne casse jamais l'existant : toute évolution est rétro-compatible ou accompagnée d'une migration explicite, réversible et testée. |
| P2 | Séparation stricte des couches | Présentation, logique métier et stockage sont **physiquement séparés**. L'interface n'exécute aucune règle métier ni calcul financier. |
| P3 | Cloisonnement par module | Chaque domaine est un module autonome qui ne communique avec les autres que par **contrat** (API interne) ou **événement**, jamais en accédant à leurs données. |
| P4 | Source de vérité unique | La base PostgreSQL est la vérité. Tout le reste (caches, index, vues) est dérivé et reconstructible. |
| P5 | Traçabilité intégrale | Tout fait métier significatif est horodaté, attribué et conservé (audit + historique). L'écrit fait foi. |
| P6 | Calculs métier purs et centralisés | Les règles métier (surtout financières) sont des fonctions déterministes, sans effet de bord, centralisées et testées — jamais dupliquées, jamais dans l'UI. |
| P7 | Configuration plutôt que code | Taux, barèmes, catalogues, règles paramétrables sont des **données** administrables, pas du code figé. |
| P8 | Multi-entreprise par conception | Chaque donnée porte l'identifiant de son organisation dès le premier jour, même en usage mono-entreprise. |
| P9 | Sécurité et conformité dans le socle | Auth, autorisation, chiffrement, RGPD ne sont pas des options : ils sont dans l'architecture. |
| P10 | API-first et contrats versionnés | Aucune fonctionnalité sans contrat écrit et versionné avant l'implémentation. |
| P11 | Simplicité d'abord | On refuse toute complexité qui ne sert pas une qualité visée (chapitre 1.6). Monolithe modulaire avant microservices. |
| P12 | Décisions écrites | Toute décision structurante est consignée (ADR), datée, jamais supprimée. |

> **Arbitrage fondateur :** on privilégie *intégrité + sécurité + évolutivité* sur
> *sophistication technique* et *performance brute*.

---

## 3 — Architecture fonctionnelle

### 3.1 Le parcours de valeur (fil rouge)

*BRN Pilot* existe pour rendre ce parcours **continu et sans ressaisie** :

```
Prospect / Affaire (CRM)
  → [Métré fourni par BRN Visite Technique]           ← via API / événements
    → Devis / Chiffrage (Finance)
      → Devis accepté → Chantier créé (Chantiers)
        → Réalisation : pointage (RH), achats & sorties (Stock), sous-traitance
          → Avancement → Situations de travaux & factures (Finance)
            → Encaissement → Trésorerie & Marge (Pilotage)
              → Réception → Réserves → Garanties
                → SAV & Maintenance
```

À chaque flèche : **la donnée circule par contrat et par événement, jamais
ressaisie.** C'est le critère de validation de toute décision fonctionnelle.

### 3.2 Vue fonctionnelle en couches

```
┌───────────────────────────────────────────────────────────────┐
│  PRÉSENTATION (multi-support : ordinateur, tablette, téléphone) │
│  Affiche et saisit. N'exécute aucune règle métier. (P2)         │
└───────────────────────────────────────────────────────────────┘
                         │  API sécurisée, versionnée (P10)
┌───────────────────────────────────────────────────────────────┐
│  LOGIQUE MÉTIER (modules cloisonnés)                            │
│  Finance · Chantiers · CRM · RH · Stock · SAV · Maintenance …   │
│  + Calculs financiers centralisés (P6) + Automatisations        │
└───────────────────────────────────────────────────────────────┘
                         │  contrats internes + événements
┌───────────────────────────────────────────────────────────────┐
│  SOCLE TRANSVERSE                                               │
│  Identité · Autorisation · Événements · Documents · Audit ·     │
│  Notifications · Recherche · Référentiels                        │
└───────────────────────────────────────────────────────────────┘
                         │
┌───────────────────────────────────────────────────────────────┐
│  STOCKAGE : PostgreSQL (vérité) · Stockage fichiers · Cache     │
└───────────────────────────────────────────────────────────────┘
```

### 3.3 Domaines et responsabilités fonctionnelles

| Domaine fonctionnel | Responsabilité | Ne fait pas |
|---|---|---|
| Pilotage / Tableau de bord | Agréger et présenter la santé de l'entreprise. | Ne saisit pas de données primaires ; il lit des projections. |
| Finance | Devis, factures, trésorerie, marge, calculs financiers. | Ne fait pas la compta légale. |
| Chantiers | Planning, avancement, coût réel, réception, garanties. | Ne calcule pas les prix (Finance). |
| CRM | Relation client, pipeline. | Ne facture pas. |
| RH | Salariés, pointage, absences. | Ne fait pas la paie légale. |
| Stock | Articles, mouvements, appro. | Ne gère pas la compta fournisseurs. |
| SAV / Maintenance | Après-vente, garanties, préventif. | Ne rouvre pas un chantier clôturé. |
| Documents | GED, justificatifs, modèles. | N'est pas le stockage des données structurées. |

---

## 4 — Découpage des modules

### 4.1 Règle commune à tout module

- Il **possède ses données** ; personne ne lit/écrit dans ses tables directement.
- Il **expose une API** (surface publique) et **émet/écoute des événements**.
- Il **apporte de la valeur seul** : livrable indépendamment du suivant.
- Il se **greffe sans modifier l'existant** (P1, P3).

### 4.2 Liste des modules

| Module | Périmètre condensé | Dépend de (contrats/événements) |
|---|---|---|
| **Socle & Référentiels** | Organisation, tiers, identité, rôles, référentiels (unités, TVA, corps d'état), documents, événements, audit. | — (fondation) |
| **CRM** | Comptes, contacts, opportunités, pipeline. | Socle |
| **Finance** | Bibliothèque de prix, devis, factures, situations, trésorerie, **calculs financiers**. | Socle, Chantiers, [Métré externe] |
| **Chantiers** | Planning, avancement, coût réel, réception, garanties. | Socle, Finance, RH, Stock |
| **RH** | Salariés, pointage, absences, variables de paie. | Socle |
| **Stock** | Articles, mouvements, emplacements, appro. | Socle, Finance |
| **SAV** | Tickets après réception, garanties. | Socle, Chantiers |
| **Maintenance** | Contrats récurrents, préventif. | Socle, SAV, Finance |
| **Documents (GED)** | Fichiers, versions, modèles, signature. | Socle |
| **Pilotage** | Tableaux de bord, indicateurs, alertes (lecture de projections). | Tous (en lecture, via projections) |
| **Automatisations** | Règles et workflows déclenchés par événements. | Tous |
| **IA (préparation)** | Couche d'assistance branchée sur événements/contrats. | Tous (optionnel) |

### 4.3 Frontière avec *BRN Visite Technique*

*BRN Visite Technique* n'est **pas** un module de *BRN Pilot* : c'est une
**application partenaire**. La communication passe par un **connecteur** dédié
(chapitre 23), jamais par un accès direct à ses données.

---

## 5 — Architecture technique

### 5.1 Style : monolithe modulaire évolutif

> **Solution recommandée.** Un **monolithe modulaire** : un seul déployable côté
> serveur, des modules internes fortement cloisonnés, une base de données unique
> mais partitionnée logiquement par module. Frontières prêtes pour l'extraction en
> services **si** un besoin réel l'exige un jour.
>
> **Raisons.** BRN Group est une PME avec une petite équipe : la priorité est la
> maîtrise du coût d'exploitation et de la complexité. Le cloisonnement par module
> apporte l'évolutivité sans le coût des microservices.
>
> **Avantages.** Coût d'infra minimal ; transactions locales simples ; refactoring
> facile entre modules ; supervision simple ; extraction future possible sans
> réécrire les autres modules.
>
> **Limites.** Exige une **discipline** de cloisonnement (sinon dérive vers un
> monolithe couplé) ; un défaut de déploiement affecte toute l'application (atténué
> par des déploiements petits et fréquents, chapitre 28).
>
> **Alternatives rejetées.**
> - *Microservices dès le départ* : coût opérationnel et complexité distribuée
>   injustifiés à ce stade ; frontières figées trop tôt.
> - *Monolithe non modulaire* : dérive vers un couplage total et une refonte
>   inévitable.

### 5.2 Vue de déploiement (cible)

```
                Internet (HTTPS uniquement)
                         │
                ┌────────┴────────┐
                │  Passerelle/API  │  auth, TLS, limitation de débit
                └────────┬────────┘
        ┌────────────────┼─────────────────┐
        │                │                 │
  ┌─────┴─────┐   ┌──────┴──────┐   ┌───────┴───────┐
  │ Application │  │ Travailleurs │  │  Connecteurs   │
  │ (API +      │  │ asynchrones  │  │  externes      │
  │  modules)   │  │ (événements, │  │ (compta, banque,│
  │             │  │  automat., IA)│  │  BRN Visite T.) │
  └─────┬───────┘  └──────┬───────┘  └───────┬────────┘
        │                 │                  │
  ┌─────┴─────────────────┴──────────────────┴─────┐
  │ PostgreSQL · Stockage fichiers · Cache/File     │
  └─────────────────────────────────────────────────┘
```

- **Application** : requêtes synchrones (interfaces, mobile).
- **Travailleurs asynchrones** : consomment les événements (automatisations, IA,
  envois, synchronisations). Ne bloquent jamais l'utilisateur.
- **Connecteurs** : isolent le monde extérieur ; une panne partenaire n'affecte
  pas le cœur.

### 5.3 Anatomie interne d'un module (séparation P2 appliquée au code)

Trois anneaux (architecture hexagonale — *ports & adaptateurs*) :

1. **Domaine** (cœur pur) : entités, règles, calculs déterministes, sans I/O.
2. **Application** (cas d'usage) : orchestre une transaction, applique les
   autorisations, émet les événements.
3. **Adaptateurs** : persistance (PostgreSQL), messagerie (événements), appels
   sortants. Remplaçables sans toucher au domaine.

L'API du module est sa **seule** surface publique.

---

## 6 — Choix technologiques argumentés

> Les choix ci-dessous sont **recommandés** et servent de référence. Un écart se
> justifie par une décision d'architecture (chapitre 33). Priorité aux **standards
> ouverts** et à la **réversibilité** (ne pas être prisonnier d'un fournisseur).

### 6.1 Base de données

> **Recommandé :** **PostgreSQL**.
> **Raisons :** transactions ACID (indispensables pour l'argent, le stock, la
> paie), intégrité référentielle forte, souplesse via colonnes documentaires,
> standard ouvert, hébergeable en Europe, écosystème mûr.
> **Avantages :** fiabilité, richesse fonctionnelle, réversibilité, coût maîtrisé.
> **Limites :** exige une exploitation sérieuse (sauvegardes, migrations,
> supervision).
> **Alternatives rejetées :** base documentaire NoSQL (intégrité et transactions
> insuffisantes pour des données financières) ; base propriétaire d'un cloud
> (verrouillage fournisseur).

### 6.2 Langage et exécution côté serveur

> **Recommandé :** un langage **fortement typé** avec un écosystème mûr pour les
> API métier (par exemple TypeScript/Node ou un langage équivalent de la même
> classe). Le choix définitif est une **question ouverte** (chapitre 35) à trancher
> avec l'équipe, selon ses compétences.
> **Raisons :** le typage protège des erreurs à l'échelle d'un ERP ; l'écosystème
> doit offrir un cadre modulaire, une couche d'accès aux données mûre et de bons
> outils de migration.
> **Avantages :** sûreté, maintenabilité, recrutement facilité.
> **Limites :** un langage non typé serait plus rapide à démarrer mais dangereux à
> l'échelle.
> **Alternatives rejetées :** langage non typé pour tout le back (risque de
> régressions silencieuses) ; multiplier les langages sans nécessité (coût de
> maintenance).

### 6.3 Style d'API

> **Recommandé :** **API REST versionnée**, décrite par un **contrat formel**
> (spécification ouverte type OpenAPI), complétée d'un **flux d'événements** pour
> l'asynchrone.
> **Raisons :** universelle, outillée, interopérable (connecteurs, mobile, futur
> lien avec *BRN Visite Technique*).
> **Avantages :** simplicité, documentation générable, tests de contrat.
> **Limites :** pour des besoins de requêtes très flexibles, une API à requêtes
> composables pourrait être ajoutée ultérieurement, sans remplacer REST.
> **Alternatives rejetées :** exposer directement la base (couplage fatal) ; tout
> en asynchrone (complexité inutile pour les lectures simples).

### 6.4 Stockage de fichiers

> **Recommandé :** **stockage objet compatible S3**, séparé de la base.
> **Raisons :** les binaires (justificatifs, PDF, photos) n'ont pas leur place
> dans une base relationnelle ; le stockage objet est économique et scalable.
> **Avantages :** coût, scalabilité, URLs signées temporaires, réversibilité.
> **Limites :** nécessite une gestion des accès et des sauvegardes propres.
> **Alternatives rejetées :** stocker les binaires en base (performances,
> sauvegardes lourdes) ; système de fichiers local (non scalable, non sauvegardé).

### 6.5 Hébergement

> **Recommandé :** hébergement cloud à **standards ouverts**, **région Union
> européenne** (RGPD).
> **Raisons :** conformité, réversibilité, proximité.
> **Avantages :** conformité réglementaire, portabilité.
> **Limites :** coût récurrent à surveiller.
> **Alternatives rejetées :** hébergement hors UE (risque RGPD) ; services
> propriétaires irremplaçables (verrouillage).

---

## 7 — Architecture frontend

### 7.1 Rôle strict de la présentation (P2)

> **Solution recommandée.** Une couche de présentation qui **affiche et saisit
> uniquement**. Elle ne contient **aucune règle métier ni calcul financier** :
> toute valeur financière affichée provient de l'API (calculs centralisés,
> chapitre 15). C'est la traduction directe de la contrainte « aucune donnée
> financière codée en dur dans l'interface ».

### 7.2 Compatibilité multi-support

> **Recommandé :** une application web **responsive** (adaptée bureau, tablette,
> téléphone), consommable également en mode installable (application web
> progressive) pour l'usage terrain.
> **Raisons :** un seul socle couvre les trois supports ; l'usage terrain (chef de
> chantier, technicien) exige la mobilité.
> **Avantages :** un seul développement, déploiement immédiat, coût maîtrisé.
> **Limites :** certaines fonctions matérielles avancées (scan intensif, capteurs)
> pourraient un jour justifier une application native — ce serait une décision
> dédiée, pas un préalable.
> **Alternatives rejetées :** développer d'emblée trois applications natives
> distinctes (coût triplé, redondance) ; interface bureau uniquement (exclut le
> terrain).

### 7.3 Organisation

- Séparation **présentation / état / accès aux données** (l'accès passe toujours
  par l'API, jamais par la base).
- **Composants réutilisables** et cohérents (cartes, tableaux, graphiques,
  alertes) — le prototype UX existant sert de **référence visuelle** pour ces
  éléments, sans en être l'implémentation.
- **Internationalisation prévue** dès le départ (format des montants, dates,
  langue), même si l'usage initial est en français.

### 7.4 Accessibilité et ergonomie

- Interface lisible sur petit écran, cibles tactiles suffisantes, contrastes
  respectés, navigation clavier.
- Les écrans de pilotage privilégient la **décision** : l'information critique
  (marge, retard, trésorerie, alertes) est mise en avant.

---

## 8 — Architecture backend

### 8.1 Organisation en modules

Le backend est organisé en **modules métier** (chapitre 4), chacun structuré en
trois anneaux (domaine / application / adaptateurs, chapitre 5.3). Un module
n'importe jamais les tables d'un autre : il appelle son **API interne** ou réagit
à ses **événements**.

### 8.2 Séparation présentation / logique / stockage (P2)

| Couche | Responsabilité | Interdits |
|---|---|---|
| Présentation | Afficher, saisir. | Aucune règle métier, aucun calcul, aucun accès base. |
| Logique métier | Règles, calculs, transactions, autorisations. | Aucun rendu d'interface. |
| Stockage | Persister et restituer. | Aucune règle métier. |

### 8.3 Traitements asynchrones

> **Recommandé :** une **file de messages** et des **travailleurs asynchrones**
> pour tout ce qui n'a pas à bloquer l'utilisateur : automatisations, envois
> (e-mail/notifications), synchronisations externes, préparation IA, imports
> volumineux.
> **Raisons :** robustesse (réessais), réactivité perçue, découplage.
> **Avantages :** l'utilisateur n'attend jamais un traitement long ; les pannes se
> rattrapent par rejeu.
> **Limites :** complexité opérationnelle (supervision de la file).
> **Alternatives rejetées :** tout synchrone (interface qui gèle, pertes en cas de
> panne d'un partenaire).

### 8.4 Idempotence et fiabilité

- Les écritures sensibles acceptent une **clé d'idempotence** : rejouer une
  requête perdue sur le réseau ne crée pas de doublon.
- Les consommateurs d'événements sont **idempotents** : un événement reçu deux
  fois n'est traité qu'une fois.

---

## 9 — Architecture de la base de données

### 9.1 Source de vérité unique (P4)

PostgreSQL est la **seule** source de vérité pour les données structurées. Les
fichiers vont au stockage objet (chapitre 16). Caches, index de recherche et vues
de pilotage sont **dérivés** et reconstructibles.

### 9.2 Multi-entreprise dès le premier jour (P8)

> **Solution recommandée.** Chaque table métier porte un **identifiant
> d'organisation** obligatoire. L'isolation est appliquée à deux niveaux : dans la
> couche d'accès (filtrage systématique) **et** par une **sécurité au niveau
> ligne** dans la base (une requête fautive ne peut pas franchir la frontière
> d'organisation).
>
> **Raisons.** Ré-ajouter le multi-entreprise plus tard serait une refonte totale.
> Le coût aujourd'hui est quasi nul.
>
> **Avantages.** Ouverture future (filiales, plusieurs sociétés, mode hébergé)
> sans refonte ; défense en profondeur.
>
> **Limites.** Toutes les requêtes et migrations doivent respecter l'identifiant
> d'organisation (discipline vérifiée par des tests d'étanchéité).
>
> **Alternatives rejetées.** Mono-entreprise maintenant, multi plus tard (refonte
> garantie) ; une base par entreprise (exploitation lourde, inadaptée à une PME).

### 9.3 Cloisonnement physique par module

Chaque module a son **espace de tables** (schéma logique). Des **droits de base
distincts par module** empêchent un module de lire/écrire dans les tables d'un
autre : le cloisonnement P3 devient **impossible à violer par accident**, pas
seulement déconseillé.

### 9.4 Souplesse maîtrisée

> **Recommandé :** **colonnes relationnelles** pour ce qui est stable, requêté,
> chiffré, contraint (identifiants, montants, dates, statuts, liens) ; **colonnes
> documentaires** pour le détail métier variable.
> **Raisons :** le bâtiment est un domaine riche et variable ; le relationnel
> garantit l'intégrité et les calculs, le documentaire évite de fracturer
> prématurément le modèle.
> **Avantages :** intégrité là où il faut, souplesse ailleurs.
> **Limites :** un champ documentaire qui devient requêté doit « remonter » en
> colonne relationnelle (migration additive).
> **Alternatives rejetées :** tout relationnel rigide (multiplication de tables) ;
> tout documentaire (perte d'intégrité et de calculs fiables).

### 9.5 Invariants de données transverses

Toute table métier porte : identifiant d'organisation ; horodatage de création et
de modification ; attribution (qui a créé/modifié) ; **numéro de révision** (verrou
optimiste, chapitre 30) ; **suppression logique** (on archive, on n'efface pas,
sauf droit à l'effacement RGPD qui est un processus tracé).

---

## 10 — Principales entités métier

> Dictionnaire de données de haut niveau (documentation, non exécutable). Les
> champs listés sont indicatifs et seront précisés au moment de la conception
> détaillée de chaque module.

### 10.1 Entités transverses (socle)

| Entité | Rôle | Champs clés (indicatifs) |
|---|---|---|
| **Organisation** | L'entreprise (multi-entreprise). | nom, identifiants légaux, paramètres. |
| **Tiers (Party)** | Personne ou entreprise, neutre. | type (personne/société), identité, contact, adresse. |
| **Rôle de tiers** | Rôle joué par un tiers. | tiers, rôle (client, fournisseur, sous-traitant, salarié). |
| **Utilisateur** | Compte d'accès. | identité fournisseur d'identité, org, actif. |
| **Rôle / Permission** | Droits applicatifs. | rôle, périmètre (attributs). |
| **Référentiel** | Données de configuration. | domaine (unité, TVA, corps d'état…), code, libellé. |
| **Document** | Fichier justificatif. | type, clé de stockage, empreinte, rattachement, version. |
| **Événement** | Fait métier. | type, agrégat, horodatage, auteur, contenu. |
| **Entrée d'audit** | Trace de conformité. | action, cible, auteur, date, contexte. |

### 10.2 Entités métier (par module)

| Module | Entités racines | Champs clés (indicatifs) |
|---|---|---|
| CRM | Compte, Opportunité, Interaction | tiers, étape, montant estimé, origine. |
| Finance | Article de prix, Devis, Ligne de devis, Facture, Situation, Écriture de trésorerie | montants HT/TVA/TTC, statut, échéance. |
| Chantiers | Chantier, Phase/Tâche, Réception, Réserve | budget, avancement, coût réel, dates. |
| RH | Salarié, Pointage, Absence, Variable de paie | heures, chantier rattaché, période. |
| Stock | Article, Emplacement, Mouvement, Réapprovisionnement | quantité, seuil, valorisation. |
| SAV | Ticket, Intervention, Garantie | chantier, type de garantie, échéance. |
| Maintenance | Contrat, Équipement, Intervention planifiée | périodicité, prochaine échéance. |
| Documents | Document, Version, Modèle | rattachement, conservation légale. |

### 10.3 Notion pivot : le Tiers

Un **tiers** est une personne physique ou morale, **neutre**, pouvant jouer
plusieurs **rôles** (client, fournisseur, sous-traitant, salarié). On ne duplique
jamais son identité : chaque module le référence par identifiant et lui rattache
ce qui le concerne. C'est la parade au piège classique « le client existe en
quatre exemplaires ».

---

## 11 — Relations entre les entités

### 11.1 Carte des relations (haut niveau)

```
Organisation 1───∞ Tiers 1───∞ RôleDeTiers
      │
      ├─∞ Utilisateur ─∞ Rôle/Permission
      │
CRM:  Compte 1───∞ Opportunité
                        │ (devis établi pour)
Finance: Opportunité 1──∞ Devis 1───∞ LigneDeDevis
                          │ (accepté ⇒ crée)
Chantiers: Devis 1───1 Chantier 1───∞ Phase/Tâche
                          │            └─∞ Réserve
              Chantier 1──∞ Situation ─→ Finance: Facture
RH:      Chantier 1───∞ Pointage ∞───1 Salarié
Stock:   Chantier 1───∞ Mouvement ∞───1 Article
SAV:     Chantier 1───∞ Ticket 1───∞ Intervention
                          └─∞ Garantie
Documents: (tout objet) 1───∞ Document (rattachement polymorphe)
```

### 11.2 Règles de relation (respectant le cloisonnement P3)

- Les relations **inter-modules** se font par **identifiant** (référence), pas par
  clé étrangère physique traversant deux modules. Exemple : un `Chantier`
  référence un `devis` par identifiant ; il ne partage pas la table des devis.
- Les relations **intra-module** peuvent utiliser des clés étrangères physiques
  (intégrité forte à l'intérieur d'un module).
- Un **document** se rattache à n'importe quel objet par un couple (type d'objet,
  identifiant) — rattachement polymorphe géré par le module Documents.

### 11.3 Cohérence entre modules

La cohérence **à l'intérieur** d'un agrégat est **immédiate** (transaction). La
cohérence **entre** modules est **éventuelle**, portée par les événements
(chapitre 13) : le coût réel d'un chantier se met à jour peu après un pointage,
pas dans la même transaction.

---

## 12 — Architecture des API

### 12.1 Principes

> **Recommandé :** **API-first** (le contrat est écrit et validé **avant**
> l'implémentation), **REST versionnée** (`/v1`), décrite par une **spécification
> formelle**.
> **Raisons :** contrat stable, documentation générable, tests de contrat,
> interopérabilité (mobile, connecteurs, *BRN Visite Technique*).
> **Avantages :** évolutivité sans rupture, découplage front/back.
> **Limites :** discipline de versionnage à tenir.
> **Alternatives rejetées :** API non versionnée (ruptures fatales) ; endpoints ad
> hoc non contractualisés (dérive).

### 12.2 Conventions transverses (documentaires)

- **Authentification** : jeton porteur issu du fournisseur d'identité ;
  l'organisation et les rôles sont **dérivés du jeton**, jamais fournis par le
  client.
- **Autorisation** : vérifiée **côté serveur** au niveau du cas d'usage. Une
  ressource hors périmètre renvoie « non trouvé » (non-divulgation).
- **Verrou optimiste** : les mises à jour transmettent le numéro de révision lu ;
  une révision périmée est **refusée**, jamais écrasée.
- **Idempotence** : les écritures sensibles acceptent une clé d'idempotence.
- **Pagination** par curseur ; **format d'erreur unique** (code, message, détails,
  identifiant de corrélation).
- **Versionnage** : un contrat publié ne change jamais de façon incompatible ; une
  évolution incompatible crée une nouvelle version et laisse vivre l'ancienne.

### 12.3 Familles d'endpoints (par module, description fonctionnelle)

| Famille | Objet (exemples de fonctions, décrits en langage naturel) |
|---|---|
| Session | Contexte de l'utilisateur courant (organisation, rôles, périmètre). |
| Tiers | Lister/créer/lire/mettre à jour un tiers ; ajouter un rôle. |
| CRM | Gérer comptes, opportunités, interactions. |
| Finance | Gérer articles de prix, devis, factures, situations, trésorerie. |
| Chantiers | Créer un chantier depuis un devis accepté ; suivre l'avancement ; réceptionner. |
| RH | Pointages, absences, variables de paie. |
| Stock | Articles, mouvements, réapprovisionnements. |
| SAV / Maintenance | Tickets, interventions, garanties, contrats. |
| Documents | Obtenir une autorisation d'envoi de fichier, confirmer, lire, versionner. |
| Pilotage | Lire les indicateurs et projections (lecture seule). |
| Imports/Exports | Déclencher et suivre un import Excel/CSV ; produire un export. |

> Ces descriptions sont **fonctionnelles** ; la spécification technique détaillée
> (méthodes, chemins, schémas) sera produite module par module, contrat par
> contrat, au moment de la conception détaillée.

### 12.4 Sécurité des API

Toutes les API sont en **HTTPS uniquement**, derrière la passerelle (limitation de
débit, protection anti-abus). Voir chapitre 20.

---

## 13 — Architecture des événements métier

### 13.1 Rôle

Les **événements de domaine** sont la colonne vertébrale de la communication
**entre modules** et avec l'extérieur. Ils servent : la synchronisation entre
modules, l'audit, les automatisations, le pilotage (projections), l'IA.

### 13.2 Nature d'un événement

Un événement est un **fait accompli, immuable, horodaté, attribué**. Nommage :
« Domaine.FaitAuPassé » (par exemple *Devis accepté*, *Chantier démarré*, *Heures
pointées*, *Facture émise*, *Paiement reçu*, *Chantier réceptionné*, *Ticket SAV
ouvert*).

### 13.3 Enveloppe standard (documentaire)

Chaque événement porte : identifiant unique ; type ; version de schéma ;
organisation ; horodatage ; auteur (avec le canal : interface / mobile /
automatisation / connecteur) ; agrégat concerné ; identifiant de corrélation
(reliant une chaîne d'événements d'un même parcours) ; identifiant de causalité
(l'événement qui a déclenché celui-ci) ; contenu métier.

### 13.4 Fiabilité de publication

> **Recommandé :** modèle **« boîte d'envoi transactionnelle »** — la donnée métier
> et l'événement sont écrits dans **la même transaction** ; un processus de
> publication publie ensuite l'événement de façon fiable.
> **Raisons :** garantir qu'on ne perd jamais un événement.
> **Avantages :** cohérence garantie, rejouabilité, traçabilité.
> **Limites :** légère complexité (processus de publication, dédoublonnage côté
> consommateur).
> **Alternatives rejetées :** publier l'événement « au mieux » après la
> transaction (risque de perte silencieuse).

### 13.5 Compatibilité dans le temps (P1)

Un événement évolue **par ajout** de champs ; les consommateurs tolèrent les
champs inconnus. Une évolution incompatible incrémente la version du type et
coexiste avec l'ancienne. Un type d'événement publié ne disparaît jamais en
silence.

---

## 14 — Moteur d'automatisation

### 14.1 Rôle

Transformer *BRN Pilot* d'un outil passif (on saisit, on consulte) en outil actif
(il alerte, relance, prépare, déclenche), **sans coder en dur** un processus métier
dans un module.

### 14.2 Modèle : Déclencheur → Condition → Action

| Élément | Exemples |
|---|---|
| Déclencheur | Un événement (devis émis), une échéance (chaque matin, 30 jours avant la fin de garantie), un seuil (stock bas). |
| Condition | Montant > seuil, chantier en retard, marge réalisée sous la marge prévue, devis sans réponse depuis N jours. |
| Action | Notifier, créer une tâche, générer un document, appeler un connecteur, émettre un événement, préparer un brouillon (assisté par IA). |

### 14.3 Gouvernance (fiabilité exigée)

> **Recommandé :** des règles **configurables (données, pas code)**,
> **journalisées**, **idempotentes**, **anti-boucle** (détection de cycle),
> **limitées en débit**, et **testables à blanc** (simulation). Les actions
> **engageantes** (envoi client, commande fournisseur) passent par un **brouillon
> validé par un humain** ; l'exécution entièrement automatique est réservée aux
> actions sûres (notification interne, création de tâche) et activée
> explicitement.
> **Raisons :** une automatisation agit en masse ; une erreur de règle peut faire
> beaucoup de dégâts.
> **Avantages :** puissance maîtrisée, auditabilité, réversibilité.
> **Limites :** coût de conception du moteur de règles.
> **Alternatives rejetées :** automatisations codées en dur dans les modules
> (rigides, non traçables) ; exécution automatique sans garde-fou (risque).

### 14.4 Articulation avec l'IA

L'**automatisation est déterministe** (le squelette) ; l'**IA est probabiliste**
(le muscle optionnel). On combine : une automatisation déclenche, l'IA enrichit
(par exemple rédige un brouillon), un humain valide. On ne remplace jamais une
règle métier claire par une inférence.

---

## 15 — Calculs financiers

> Chapitre critique : la contrainte « calculs financiers centralisés » et « aucune
> donnée financière codée en dur dans l'interface » y est traitée en priorité.

### 15.1 Principe : un moteur financier central, pur et testé (P6)

> **Solution recommandée.** Tous les calculs financiers (montants HT/TVA/TTC,
> remises, marges, situations de travaux, retenues de garantie, échéanciers,
> valorisations) sont réalisés par un **moteur financier centralisé** dans la
> logique métier : des fonctions **déterministes**, **sans effet de bord**,
> **testées**, **uniques** (jamais dupliquées). L'interface **n'effectue aucun
> calcul financier** : elle affiche des valeurs calculées par le serveur.
>
> **Raisons.** L'argent engage juridiquement et comptablement ; une règle
> dupliquée diverge tôt ou tard ; un calcul dans l'interface est invérifiable et
> non traçable.
>
> **Avantages.** Fiabilité, testabilité, cohérence entre tous les écrans et
> exports, traçabilité, évolution centralisée (changer une règle en un seul
> endroit).
>
> **Limites.** Impose une frontière stricte (aucune tentation de « petit calcul »
> côté interface) et une bonne couverture de tests.
>
> **Alternatives rejetées.** Calculs répartis dans l'interface (divergences,
> valeurs codées en dur, non-traçabilité) ; calculs recopiés dans plusieurs
> modules (double vérité).

### 15.2 Paramètres financiers = données, pas code (P7)

Taux de TVA, barèmes, marges par défaut, conditions de paiement, retenues de
garantie, taux horaires : ce sont des **référentiels administrables**, versionnés
et datés (on connaît le taux en vigueur à une date donnée). **Aucune valeur
financière n'est écrite en dur** dans le code de l'interface.

### 15.3 Précision et arrondis

> **Recommandé :** stockage et calcul des montants en **valeurs exactes**
> (décimales), avec des **règles d'arrondi explicites et documentées** (par ligne,
> par total, par taux de TVA), conformes aux usages comptables français.
> **Raisons :** les flottants introduisent des erreurs de centimes inacceptables.
> **Avantages :** exactitude, conformité, cohérence des totaux.
> **Limites :** rigueur nécessaire dans la définition des règles d'arrondi.
> **Alternatives rejetées :** calcul en virgule flottante (erreurs cumulées).

### 15.4 Marge prévue vs réalisée (indicateur central du pilotage)

Le moteur calcule, par chantier : la **marge prévue** (au chiffrage) et la **marge
réalisée projetée** (à partir du coût réel engagé rapporté à l'avancement). Ces
projections alimentent le pilotage (chapitre 3) et les alertes (chapitre 14). Elles
sont **calculées**, jamais saisies ni figées dans l'interface.

### 15.5 Journalisation des calculs

Chaque calcul financier engageant (émission de facture, situation) produit une
**trace** (paramètres utilisés, taux en vigueur, résultat) pour l'audit et la
reproductibilité.

---

## 16 — Gestion des fichiers et justificatifs

### 16.1 Principe

> **Recommandé :** les fichiers (justificatifs, PDF, photos, pièces jointes)
> vivent dans le **stockage objet** ; la base ne conserve qu'une **référence**
> (type, clé, taille, empreinte, propriétaire, organisation, version,
> rattachement).
> **Raisons :** séparer les binaires des données structurées (performances,
> sauvegardes, coût).
> **Avantages :** scalabilité, coût, intégrité (empreinte), réversibilité.
> **Limites :** gestion des accès (URLs signées temporaires) et des sauvegardes
> du stockage objet.
> **Alternatives rejetées :** fichiers en base (lourdeur) ; fichiers sur disque
> local (non sauvegardé, non scalable).

### 16.2 Cycle de vie

- **Envoi** : l'interface obtient une autorisation d'envoi et téléverse
  directement vers le stockage objet ; le serveur enregistre ensuite la référence
  et l'empreinte.
- **Documents émis** (devis signé, facture, PV de réception) : **immuables et
  versionnés** — on ne modifie jamais un document émis, on en émet une nouvelle
  version (valeur juridique).
- **Conservation** : chaque type de document a une **durée de conservation légale**
  (par exemple facture : dix ans) pilotée par le module Documents.
- **Normalisation** : compression et normalisation à l'entrée pour maîtriser le
  volume (surtout pour les photos terrain).

### 16.3 Sécurité des fichiers

Accès contrôlé par autorisation (mêmes règles que les données), URLs signées à
durée limitée, chiffrement au repos, empreinte pour l'intégrité et le
dédoublonnage.

---

## 17 — Authentification

### 17.1 Principe

> **Recommandé :** **authentification déléguée** à un fournisseur d'identité
> standard (protocole ouvert type OpenID Connect). *BRN Pilot* ne stocke **aucun
> mot de passe** : il fait confiance à un fournisseur d'identité qui gère
> l'inscription, la connexion et le second facteur.
> **Raisons :** la gestion « maison » des mots de passe est risquée et coûteuse ;
> un fournisseur standard offre le second facteur, la révocation, l'audit.
> **Avantages :** sécurité, moindre responsabilité, évolutivité (SSO d'entreprise
> possible plus tard).
> **Limites :** dépendance à un fournisseur d'identité (atténuée par le choix d'un
> protocole ouvert, donc réversible).
> **Alternatives rejetées :** gestion des mots de passe interne (surface d'attaque,
> conformité) ; authentification par simple clé statique (insuffisant).

### 17.2 Exigences

- **Second facteur obligatoire** pour les rôles à privilèges (direction,
  administration, finance, RH).
- **Sessions** à durée limitée, jetons courts + jeton de rafraîchissement,
  **révocation** possible à tout instant (perte d'un appareil terrain).
- **Appareils terrain** : jeton distinct, révocable par appareil.

---

## 18 — Gestion des rôles et permissions

### 18.1 Modèle : rôles + attributs

> **Recommandé :** un modèle combinant **rôles** (qui) et **attributs** (sur quoi) :
> le rôle donne des capacités, les attributs restreignent le périmètre
> (organisation, chantiers affectés, propriété de la donnée, statut).
> **Raisons :** un rôle seul est trop grossier (un conducteur voit RH de **ses**
> chantiers, pas de toute l'entreprise).
> **Avantages :** finesse, moindre privilège, cloisonnement.
> **Limites :** conception soignée des règles d'accès.
> **Alternatives rejetées :** rôles seuls (trop grossiers) ; permissions
> individuelles sans rôle (ingérable).

### 18.2 Rôles de référence (indicatifs)

| Rôle | Accès type |
|---|---|
| Direction | Tout, pilotage complet + validation des actes engageants. |
| Conducteur de travaux | Chantiers, RH et Stock de ses chantiers, situations. |
| Commercial | CRM, devis (écriture limitée). |
| Comptable / ADV | Finance complète, lecture Chantiers. |
| RH | RH complet, cloisonné. |
| Magasinier | Stock. |
| Technicien SAV | SAV, Maintenance, lecture Chantiers concernés. |
| Client (portail futur) | Uniquement ses chantiers/documents. |
| Sous-traitant (futur) | Périmètre restreint à ses lots/chantiers. |

### 18.3 Règle d'or

L'autorisation est **toujours vérifiée côté serveur** au niveau du cas d'usage.
L'interface masque pour le confort ; le serveur interdit pour la sécurité.

---

## 19 — Journal d'audit et traçabilité

### 19.1 Deux mécanismes complémentaires

| Mécanisme | Rôle | Contenu |
|---|---|---|
| **Journal d'audit** | Conformité et sécurité. | Qui a fait quoi, quand, depuis où, sur quelle donnée. |
| **Historique des modifications** | Métier. | Ce qui a changé sur une donnée, valeur avant/après, auteur, date. |

### 19.2 Journal d'audit

> **Recommandé :** un journal d'audit **immuable** (ajout seul), distinct des
> données métier, à accès restreint, conservé longtemps. Chaque action engageante
> (émission de devis, validation de facture, modification de paie, changement de
> droit, export de données personnelles, suppression logique) y produit une entrée.
> **Raisons :** obligation de rendre compte, sécurité, investigations.
> **Avantages :** traçabilité totale, non-répudiation.
> **Limites :** volume à gérer (rétention, archivage).
> **Alternatives rejetées :** aucune traçabilité (inacceptable) ; traçabilité
> mélangée aux données métier (moins sûre, moins claire).

### 19.3 Historique des modifications

Les entités engageantes conservent leur **historique** : on peut toujours répondre
à « qui a changé cette valeur, quand, et quelle était l'ancienne ». Reconstruit à
partir des événements et/ou d'un versionnement des enregistrements.

---

## 20 — Sécurité

### 20.1 Défense en profondeur

| Couche | Mesures |
|---|---|
| Réseau | HTTPS uniquement, y compris en interne ; limitation de débit ; protection anti-abus à la passerelle. |
| Application | Validation systématique des entrées côté serveur ; requêtes paramétrées ; moindre privilège. |
| Données | Chiffrement au repos et en transit ; isolation multi-entreprise (couche d'accès + sécurité au niveau ligne). |
| Secrets | Aucun secret dans le code ni le dépôt ; secrets injectés par l'environnement/un coffre, avec rotation. |
| Identité | Auth déléguée, second facteur, révocation (chapitre 17). |
| Journalisation | Journalisation de sécurité (tentatives d'authentification, élévations de droit, accès aux données sensibles). |

### 20.2 Conformité RGPD

> **Recommandé :** RGPD **par conception** — minimisation, base légale et finalité
> par catégorie de donnée, durées de conservation, droit d'accès et de portabilité,
> **droit à l'effacement** (processus tracé d'anonymisation, pas une suppression
> sauvage), cloisonnement renforcé des données RH, hébergement UE, registre des
> traitements, sous-traitants contractualisés.
> **Raisons :** obligation légale ; données de clients et de salariés.
> **Avantages :** conformité, confiance, réduction du risque.
> **Limites :** effort de conception et de documentation.
> **Alternatives rejetées :** conformité « ajoutée après » (dette et risque).

### 20.3 Gestion des dépendances

Suivi des vulnérabilités, mises à jour régulières, revue des nouvelles
dépendances, analyse de la chaîne d'approvisionnement logicielle.

---

## 21 — Sauvegardes et restauration

### 21.1 Principe

> **Recommandé :** sauvegardes **automatiques, chiffrées, régulières**, couvrant
> **la base PostgreSQL et le stockage objet**, avec **copie hors-site**, rétention
> définie, et **restauration testée** (une sauvegarde jamais restaurée n'existe
> pas).
> **Raisons :** l'intégrité des données est la qualité n°1 ; une perte de données
> serait catastrophique (juridique, financier).
> **Avantages :** résilience, continuité d'activité.
> **Limites :** coût de stockage et discipline de test.
> **Alternatives rejetées :** sauvegardes non testées (fausse sécurité) ;
> sauvegarde de la base seule sans les fichiers (restauration incomplète).

### 21.2 Objectifs à fixer avec la direction

- **Perte maximale acceptable (RPO)** : par exemple quelques minutes de données.
- **Temps de remise en service (RTO)** : par exemple quelques heures.
- **Plan de reprise documenté et répété** au moins une fois par an.

### 21.3 Réversibilité

Standards ouverts (PostgreSQL, stockage objet, protocole d'identité) pour pouvoir
**exporter et migrer** à tout moment, sans être prisonnier d'un fournisseur.

---

## 22 — Imports et exports

### 22.1 Imports Excel et CSV

> **Recommandé :** un mécanisme d'import **guidé, validé et traçable** : modèle de
> fichier fourni ; **prévisualisation** avant application ; **validation ligne à
> ligne** avec rapport d'erreurs ; import **asynchrone** pour les gros volumes ;
> chaque import **tracé** (qui, quand, quoi) et **rejouable** sans doublon
> (idempotence).
> **Raisons :** reprise de l'existant (tableurs actuels), saisie de masse, échanges
> avec des partenaires.
> **Avantages :** adoption facilitée, fiabilité, pas d'import « à l'aveugle ».
> **Limites :** effort de conception des validations et des correspondances de
> colonnes.
> **Alternatives rejetées :** import direct sans validation (corruption garantie) ;
> import synchrone bloquant (échec sur gros fichiers).

### 22.2 Exports

Exports **structurés** (Excel/CSV, PDF) des données et des états de pilotage,
respectant l'autorisation de l'utilisateur (on n'exporte que ce qu'on a le droit de
voir), et tracés lorsqu'ils portent sur des données personnelles.

### 22.3 Règle de sécurité

Un import ou un export est une **opération engageante** : il est soumis aux
autorisations, journalisé, et ne contourne jamais les règles métier (un montant
importé passe par le moteur financier, pas directement en base).

---

## 23 — Intégration future avec BRN Visite Technique

### 23.1 Position de principe

*BRN Visite Technique* et *BRN Pilot* sont **deux applications distinctes**. Elles
communiqueront **ultérieurement** via une **API sécurisée et/ou un système
d'événements**. *BRN Pilot* ne lit **jamais** directement la base de *BRN Visite
Technique*, et réciproquement.

### 23.2 Mécanisme recommandé : un connecteur dédié

> **Recommandé :** un **connecteur** (couche d'isolation) qui traduit le vocabulaire
> de *BRN Visite Technique* (visite, pièce, métré, ouvrage) vers celui de *BRN
> Pilot* (opportunité, chantier, ligne de devis), dans les deux sens, via l'API et
> les événements.
> **Raisons :** protéger chaque application des changements de l'autre ; permettre
> une évolution indépendante.
> **Avantages :** couplage faible, remplaçabilité, pas de contamination de modèle.
> **Limites :** léger travail de correspondance (mapping) à maintenir.
> **Alternatives rejetées :** base partagée entre les deux applications (couplage
> fatal, sécurité) ; copier-coller manuel des métrés (ressaisie, erreurs).

### 23.3 Flux d'intégration cible (haut niveau)

```
BRN Visite Technique                 Connecteur                 BRN Pilot
  Métré clôturé  ──── événement ────▶  traduit  ──── API ────▶  Devis pré-rempli
  (quantités,                          (mapping)                 (Finance)
   ouvrages)                                                     puis Chantier
```

### 23.4 Sécurité de l'intégration

Échanges authentifiés (identité de service dédiée, à moindre privilège),
chiffrés, tracés, idempotents. Une panne d'une application n'interrompt pas
l'autre : les événements se rattrapent par rejeu.

### 23.5 Le métré reste chez BRN Visite Technique

*BRN Pilot* ne réimplémente pas le moteur de métré : il **consomme** les résultats.
Cela préserve la spécialisation de chaque application et évite la double vérité.

---

## 24 — Préparation des fonctions IA

### 24.1 Position de principe

> **Recommandé :** préparer l'IA comme une **couche d'augmentation** branchée sur
> les **événements** et les **contrats**, **sans** la mettre dans le chemin critique
> d'une écriture engageante. L'IA **propose**, un humain **valide**.
> **Raisons :** l'IA évolue vite et reste faillible ; il ne faut pas en faire une
> dépendance dure d'un processus critique (finance, paie).
> **Avantages :** valeur ajoutée (pré-remplissage, résumés, détection d'anomalie)
> sans risque sur l'intégrité ; réversibilité (changer de fournisseur sans toucher
> au cœur).
> **Limites :** exige des garde-fous (validation humaine, journalisation, souvenir
> des versions de modèle).
> **Alternatives rejetées :** IA décisionnelle automatique sur des actes engageants
> (risque) ; IA fortement couplée au cœur (dette, dépendance).

### 24.2 Cas d'usage anticipés (indicatifs)

Aide au chiffrage (prix probable d'après l'historique), détection d'anomalie de
marge, résumé de chantier, classement automatique de documents, priorisation des
tickets SAV, assistant conversationnel en **lecture seule** respectant les droits
de l'utilisateur.

### 24.3 Souveraineté des données

Aucune donnée personnelle ou stratégique n'alimente l'entraînement d'un modèle
tiers sans base légale et garantie contractuelle ; minimisation du contexte envoyé ;
traitement en Europe privilégié ; journalisation des appels ; dégradation gracieuse
(sans IA, l'application fonctionne exactement pareil).

### 24.4 Ce que l'architecture prévoit **dès maintenant** (sans développer l'IA)

Il suffit que le socle produise des **événements riches et traçables** (chapitre
13) et des **contrats stables** (chapitre 12) : l'IA pourra s'y brancher plus tard
**sans modifier les modules existants**. Aucune brique IA n'est développée à ce
stade.

---

## 25 — Gestion des erreurs

### 25.1 Principes

> **Recommandé :** une gestion d'erreurs **explicite, cohérente et non
> silencieuse** : format d'erreur unique côté API (code, message lisible, détails,
> identifiant de corrélation) ; distinction claire entre erreurs **de validation**
> (fautes de saisie, corrigeables par l'utilisateur), erreurs **métier** (règle
> violée), et erreurs **techniques** (à journaliser et alerter).
> **Raisons :** une erreur avalée devient une corruption ou un support impossible.
> **Avantages :** diagnostic rapide, expérience utilisateur claire, support
> outillé (l'utilisateur communique l'identifiant de corrélation).
> **Limites :** rigueur de conception.
> **Alternatives rejetées :** erreurs génériques opaques ; erreurs ignorées.

### 25.2 Robustesse

- Les traitements engageants construisent le résultat **complet avant écriture**
  (pas d'écriture partielle).
- Les interfaces disposent d'un **écran de récupération** en cas d'erreur, avec un
  rapport copiable, plutôt qu'un écran blanc.
- Les traitements asynchrones **réessaient** avec temporisation croissante et
  finissent en **file d'échec** analysable si l'erreur persiste.

---

## 26 — Observabilité et journaux techniques

### 26.1 Trois piliers

| Pilier | Rôle |
|---|---|
| **Journaux (logs)** | Journaux structurés, corrélés par identifiant de corrélation (suivre un parcours complet à travers les modules). |
| **Métriques** | Santé technique (latence, erreurs, files en retard, échecs de synchronisation) **et** métier (devis émis, marge moyenne, chantiers en retard). |
| **Traces** | Suivre une requête/un événement de bout en bout pour diagnostiquer. |

### 26.2 Alertes techniques

Sur les signaux qui comptent : file d'événements bloquée, connecteur externe en
panne, échec de sauvegarde, taux d'erreur anormal, synchronisation durablement en
échec.

### 26.3 Distinction avec l'audit

L'observabilité sert l'**exploitation technique** ; le journal d'audit sert la
**conformité**. Les deux sont séparés (accès et rétention différents).

---

## 27 — Tests

### 27.1 Stratégie (pyramide adaptée)

> **Recommandé :** une majorité de **tests unitaires** sur le **cœur métier pur**
> (surtout le moteur financier, chapitre 15), des **tests d'intégration** (API +
> base + événements), des **tests de contrat** (le front, le back et les
> connecteurs respectent la spécification d'API), des **tests de migration**
> (migration **et** retour arrière rejoués), et un **petit nombre de tests
> bout-en-bout** sur les parcours critiques.
> **Raisons :** le cœur pur est le meilleur retour sur investissement (rapide,
> déterministe) ; les tests de contrat et de migration protègent l'évolutivité et
> la non-régression.
> **Avantages :** confiance, non-régression, documentation vivante.
> **Limites :** effort d'écriture et de maintenance des tests.
> **Alternatives rejetées :** tout tester en bout-en-bout (lent, fragile, coûteux) ;
> ne pas tester le cœur financier (inacceptable).

### 27.2 Non-régression métier

Chaque anomalie corrigée arrive avec un **test qui la reproduit** : la régression
ne peut pas revenir silencieusement (chapitre 30).

---

## 28 — Environnements de développement, test et production

### 28.1 Trois environnements

| Environnement | Rôle | Données |
|---|---|---|
| Développement | Travail quotidien. | Jeux de données fictifs. |
| Test / recette | Validation avant production, tests de migration. | Copie **anonymisée** de production. |
| Production | Exploitation réelle. | Données réelles (RGPD). |

### 28.2 Règles

> **Recommandé :** **isolation stricte** des environnements (secrets, bases et
> stockages jamais partagés) ; toute migration jouée **d'abord en recette** sur une
> copie de production ; **intégration et déploiement continus** (lint, tests,
> analyse de sécurité, build, déploiement) ; **déploiements petits et fréquents**
> avec retour arrière facile ; **drapeaux de fonctionnalité** pour activer un module
> progressivement.
> **Raisons :** réduire le risque, permettre des retours arrière, valider avant
> production.
> **Avantages :** fiabilité, cadence maîtrisée, sécurité.
> **Limites :** mise en place initiale de la chaîne.
> **Alternatives rejetées :** déploiement manuel sans recette (risque) ; grosses
> livraisons rares (risque concentré).

---

## 29 — Versionnement et migrations

### 29.1 Versionnement

- **Code** : versionnage sémantique (majeur / mineur / correctif).
- **API** : versionnée dans le contrat ; jamais de rupture sur une version publiée.
- **Événements** : version par type, évolutions additives.
- **Base** : migrations versionnées, ordonnées, rejouées automatiquement.

### 29.2 Migrations sans rupture (P1)

> **Recommandé :** migrations **additives par défaut** ; renommage/suppression en
> **trois temps** (ajouter le nouveau et écrire les deux, migrer, retirer l'ancien) ;
> **réversibles** (chaque migration a son inverse testé) ; **idempotentes** ;
> testées sur copie de production.
> **Raisons :** garantir que la donnée d'aujourd'hui reste lisible demain, sans
> interruption de service.
> **Avantages :** déploiement sans coupure, retour arrière possible.
> **Limites :** discipline (migrations en plusieurs étapes).
> **Alternatives rejetées :** migrations destructives directes (risque de perte,
> coupure) ; renommage brutal (casse les versions en cours).

---

## 30 — Prévention des régressions

### 30.1 Dispositifs

| Dispositif | Rôle |
|---|---|
| Tests de non-régression | Chaque bug corrigé est verrouillé par un test (chapitre 27). |
| Verrou optimiste | Une écriture basée sur une révision périmée est refusée, jamais écrasée (pas de perte silencieuse). |
| Contrats versionnés | Une API/un événement publié ne change jamais de façon incompatible (chapitres 12, 13, 29). |
| Migrations réversibles | Toute évolution de schéma est réversible et testée (chapitre 29). |
| Revue de code obligatoire | Au moins un pair, avec la grille des principes (chapitre 2) comme critère. |
| Drapeaux de fonctionnalité | Activation progressive et désactivation rapide en cas de problème. |
| Intégration continue | Rien n'est fusionné sans que lint, tests et analyses passent. |

### 30.2 Règle culturelle

Le graphe de dépendances entre modules reste **sans cycle** ; un module ne crée
jamais de dépendance circulaire. La dette technique se rembourse **en continu**,
jamais par une « grande refonte » (interdite par principe).

---

## 31 — Scalabilité et évolutivité

### 31.1 Évolutivité fonctionnelle (priorité)

L'évolutivité **fonctionnelle** — ajouter un module sans toucher les autres — est
assurée par le cloisonnement (P3), les contrats (P10) et les événements (chapitre
13). C'est l'axe le plus important pour une PME.

### 31.2 Scalabilité technique (proportionnée)

> **Recommandé :** commencer simple (une base, un déployable) et **scaler quand un
> besoin réel apparaît** : lecture séparée de l'écriture pour le pilotage
> (projections), mise à l'échelle horizontale de l'application sans état, extraction
> d'un module en service **seulement** si sa charge ou son cycle de vie le justifie.
> **Raisons :** ne pas payer une complexité de très grande échelle avant d'en avoir
> besoin.
> **Avantages :** coût maîtrisé aujourd'hui, portes ouvertes demain.
> **Limites :** certaines optimisations devront être introduites au bon moment
> (surveillance nécessaire).
> **Alternatives rejetées :** architecture massivement distribuée d'emblée (coût
> injustifié) ; conception qui interdit toute mise à l'échelle (impasse).

### 31.3 Multi-entreprise

L'évolution vers **plusieurs entreprises** est prévue par conception (chapitre 9.2)
sans refonte.

---

## 32 — Analyse des risques

| Risque | Gravité | Probabilité | Atténuation |
|---|---|---|---|
| Perte ou corruption de données | Très élevée | Faible | Sauvegardes testées + copie hors-site + transactions ACID + audit (ch. 21, 19). |
| Fuite de données personnelles/financières | Très élevée | Moyenne | Auth forte, autorisation serveur, chiffrement, RGPD, cloisonnement (ch. 17-20). |
| Calcul financier erroné ou divergent | Élevée | Moyenne | Moteur financier centralisé, pur, testé ; aucun calcul dans l'UI (ch. 15). |
| Régression sur l'existant lors d'une évolution | Élevée | Moyenne | Tests de non-régression, contrats versionnés, migrations réversibles (ch. 27-30). |
| Couplage rampant entre modules | Élevée | Moyenne | Cloisonnement physique (droits DB), revue, graphe sans cycle (ch. 4, 9, 30). |
| Automatisation qui agit en masse à tort | Élevée | Faible | Simulation, journalisation, brouillon validé, limitation de débit (ch. 14). |
| Dépendance à un fournisseur (verrouillage) | Moyenne | Moyenne | Standards ouverts, réversibilité, export possible (ch. 6, 21). |
| Sur-ingénierie (complexité prématurée) | Moyenne | Moyenne | Principe de simplicité, monolithe modulaire d'abord (ch. 2, 5, 31). |
| Intégration fragile avec BRN Visite Technique | Moyenne | Moyenne | Connecteur isolant, idempotence, rejeu (ch. 23). |
| Adoption insuffisante par les équipes | Moyenne | Moyenne | Ergonomie multi-support, imports pour reprise de l'existant, livraison par vagues utiles (ch. 7, 22, 34). |
| Indisponibilité d'un partenaire externe | Faible | Élevée | Connecteurs asynchrones, file d'attente, mode dégradé (ch. 5, 13). |

---

## 33 — Décisions d'architecture proposées

> Décisions structurantes soumises à validation. Une fois validées, elles
> deviennent des décisions officielles (ADR), datées et non supprimables (P12).

| # | Décision | Résumé |
|---|---|---|
| D1 | Monolithe modulaire évolutif | Un déployable, modules cloisonnés, microservices seulement si justifié (ch. 5). |
| D2 | PostgreSQL, source de vérité unique | Transactions ACID + souplesse documentaire (ch. 6, 9). |
| D3 | Séparation stricte présentation/logique/stockage | Aucune règle métier ni calcul financier dans l'interface (ch. 2, 8, 15). |
| D4 | Multi-entreprise dès le premier jour | Identifiant d'organisation partout + sécurité au niveau ligne (ch. 9). |
| D5 | Couplage inter-modules par contrat et événements | Jamais d'accès direct aux données d'un autre module (ch. 4, 12, 13). |
| D6 | API-first, REST versionnée + événements | Contrats stables, documentés, testés (ch. 12, 13). |
| D7 | Moteur financier centralisé, pur, testé | Calculs uniques, paramètres = données, aucune valeur en dur dans l'UI (ch. 15). |
| D8 | Authentification déléguée (protocole ouvert) | Pas de mot de passe maison, second facteur, révocation (ch. 17). |
| D9 | Rôles + attributs (autorisation serveur) | Moindre privilège, cloisonnement fin (ch. 18). |
| D10 | Audit immuable + historique des modifications | Traçabilité intégrale (ch. 19). |
| D11 | Stockage objet pour les fichiers | Séparé de la base, versionné, immuable pour les actes émis (ch. 16). |
| D12 | Boîte d'envoi transactionnelle pour les événements | Aucune perte d'événement (ch. 13). |
| D13 | Moteur d'automatisation configurable et gouverné | Règles = données, simulation, garde-fous (ch. 14). |
| D14 | Sauvegardes chiffrées testées + plan de reprise | Base + fichiers, hors-site, restauration prouvée (ch. 21). |
| D15 | Imports Excel/CSV guidés, validés, asynchrones, idempotents | Reprise de l'existant sans corruption (ch. 22). |
| D16 | Intégration BRN Visite Technique par connecteur | Deux applications distinctes, couplage faible (ch. 23). |
| D17 | IA en couche d'augmentation (préparée, non développée) | Événements riches + contrats stables suffisent aujourd'hui (ch. 24). |
| D18 | Web responsive multi-support (bureau/tablette/téléphone) | Un socle, trois supports ; natif seulement si besoin matériel (ch. 7). |
| D19 | Migrations additives et réversibles | Non-régression garantie dans le temps (ch. 29). |
| D20 | Hébergement UE, standards ouverts | Conformité RGPD et réversibilité (ch. 6, 20, 21). |

---

## 34 — Ordre recommandé de développement des modules

> **Principe :** chaque vague est **livrable et utile seule**, et ne casse jamais la
> précédente (P1). L'ordre suit le parcours de valeur (chapitre 3).

| Vague | Contenu | Valeur livrée |
|---|---|---|
| **0** | Socle & Référentiels : organisation, tiers, identité, rôles, référentiels, documents, événements, audit, base, sécurité, sauvegardes. | La fondation sécurisée et traçable. |
| **1** | CRM léger + Finance (devis) + moteur financier + première automatisation (relance de devis). | De l'affaire au devis chiffré, sans ressaisie. |
| **2** | Chantiers (planning, avancement, coût réel) + **Tableau de bord Pilotage**. | Le pilotage : marge, retards, santé des chantiers. |
| **3** | RH (pointage) + Stock. | Le coût réel alimente la marge réalisée. |
| **4** | Facturation / situations de travaux + Trésorerie + connecteur comptable. | Encaisser, projeter la trésorerie, nourrir l'expert-comptable. |
| **5** | SAV + Maintenance + GED complète. | Le cycle complet, de la vente à la garantie. |
| **Transverses** | Imports Excel/CSV, automatisations avancées, **connecteur BRN Visite Technique**, préparation IA. | Introduits progressivement, dès qu'ils deviennent utiles, jamais en préalable bloquant. |

> Le **prototype UX** existant sert de référence visuelle pour la Vague 2
> (tableau de bord), **sans** en être la base technique.

### 34.1 Porte de validation entre vagues

On ne démarre une vague que si la précédente est : livrée, testée, sauvegardée,
sans régression connue, et si ses événements sont émis et observables (pour que la
vague suivante puisse s'y brancher sans toucher l'existant).

---

## 35 — Questions métier restant à valider

> Ces points **doivent être tranchés avec la direction et les équipes** avant ou
> pendant la conception détaillée. Ils n'empêchent pas de valider l'architecture,
> mais ils en précisent des paramètres.

**Périmètre et frontières**
1. La comptabilité et la paie **légales** restent-elles externes (nourries par
   connecteur) en version initiale, comme proposé ?
2. Un **portail client** et/ou **sous-traitant** est-il attendu à moyen terme
   (cela confirme le modèle de rôles du chapitre 18) ?

**Finance**
3. Règles d'**arrondi** et de calcul de TVA à confirmer (par ligne, par total, par
   taux) selon les usages de BRN Group.
4. Modèle des **situations de travaux** (avancement, retenue de garantie, révision
   de prix) : quelles règles exactes ?
5. Structure de la **bibliothèque de prix** (déboursés, main-d'œuvre, marges) :
   quelle granularité ?
6. Définition partagée de la **marge** (sur déboursé sec ? coût de revient
   complet ?) pour un pilotage cohérent.

**Chantiers / RH / Stock**
7. Comment se mesure l'**avancement** d'un chantier (par lot, par tâche, par montant
   facturé) ?
8. Modalités du **pointage** terrain (par salarié, par tâche, validation par le
   conducteur) ?
9. Faut-il une **valorisation de stock** (méthode de valorisation) dès la première
   version ?

**Intégration et données**
10. Quel **volume et format** de données à reprendre par import (tableurs actuels) ?
11. Quel **périmètre exact** d'échange avec *BRN Visite Technique* en première
    intégration (uniquement le métré → devis, ou davantage) ?

**Conformité et exploitation**
12. Objectifs chiffrés de **RPO/RTO** (perte et temps de reprise acceptables) ?
13. **Durées de conservation** par type de document et de donnée (au-delà des
    minimums légaux) ?
14. Choix du **langage/écosystème backend** définitif (chapitre 6.2), selon les
    compétences de l'équipe.

**Organisation**
15. Périmètre de la **première mise en service** (quelle vague est le « minimum
    utile » pour la direction) ?

---

## Fin du document

> **Rappel.** Ce document est une **proposition d'architecture fondatrice**, à
> **relire et valider** avant tout développement. Il ne contient ni code, ni
> interface, ni maquette. Le prototype HTML existant est référencé **uniquement**
> comme expérimentation UX non connectée aux données réelles et **ne constitue pas**
> la base technique de *BRN Pilot*.
>
> Après validation, les décisions du chapitre 33 deviennent officielles et les
> questions du chapitre 35 sont tranchées ; la conception détaillée de chaque module
> peut alors commencer, module par module, dans l'ordre du chapitre 34.
