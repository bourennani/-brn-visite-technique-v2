# BRN PILOT — MASTER BLUEPRINT D'ARCHITECTURE — VERSION 1.1

> **Nature du document.** Document d'architecture fondateur, **sans code**,
> destiné à être **relu et validé avant le début du développement**. Il constitue
> la **référence** de tout le développement futur de *BRN Pilot*.
>
> **Ce document ne contient volontairement aucun code, aucune interface, aucune
> maquette.** Les schémas présentés sont des diagrammes d'architecture, pas des
> implémentations. Les listes d'entités et de champs sont un *dictionnaire de
> données* (documentation), pas un schéma exécutable.
>
> **Statut :** proposition d'architecture v1.1, **en relecture — non figée
> officiellement**.
> **Version :** 1.1.
> **Périmètre :** *BRN Pilot* (système d'exploitation du dirigeant / ERP de
> pilotage), application **distincte** de *BRN Visite Technique*.

---

## Note de version — de la v1.0 à la v1.1

La v1.1 intègre les évolutions demandées par la direction, **avant** que le
document ne devienne la référence officielle :

1. **Retrait du périmètre V1** des modules **SAV** et **Maintenance** (conservés
   comme **modules futurs**, chapitre 4.4).
2. **Ajout d'un module complet « Parc Véhicules »** (gestion de flotte) —
   chapitre 36.
3. **Ajout d'un module complet « Contraventions »** — chapitre 37.
4. **Ajout d'un « Espace Dirigeant » (cockpit)** avec **priorisation
   intelligente** des tâches — chapitre 38.
5. **Préparation architecturale** d'une **synchronisation future avec Apple
   Calendar** (rien n'est développé) — chapitre 40.
6. **Tableau de bord du dirigeant** organisé en zones **Entreprise / Dirigeant /
   Parc automobile** — chapitre 39.
7. **Mise à jour du moteur d'automatisation** (véhicules, contraventions, tâches,
   échéances, calendrier, alertes dirigeant) — chapitre 14.
8. **La Business Rules Bible devient un document fondateur obligatoire** : aucune
   règle métier importante n'est codée sans y être définie au préalable
   (principe P13, décision D30, gouvernance des documents fondateurs).
9. **Nouvelle philosophie produit** : *BRN Pilot* n'est pas seulement un ERP du
   bâtiment, c'est un **système d'exploitation du dirigeant** (chapitre 1.7).

La v1.1 intègre également les corrections issues de la revue critique de la v1.0 :
numérotation légale des documents financiers (15.6), mécanisme d'historisation
tranché (19.3, D21), construction des projections de pilotage (3.4, D22),
stratégie hors-ligne des rôles terrain (7.5, D24), signature électronique (16.4,
D25).

---

## Note liminaire — le prototype UX existant

Une première **expérimentation UX** du tableau de bord « Chantiers / Pilotage » a
été réalisée sous forme de prototype visuel (un fichier de démonstration, avec des
**données fictives**, non connecté aux données réelles).

Ce prototype : est conservé **uniquement** comme prototype visuel, démonstrateur
UX et exemple de présentation (cartes, graphiques, alertes) ; **ne constitue pas**
la base technique de *BRN Pilot* ; **ne préjuge pas** de l'architecture cible
décrite ici. Le présent document est la **seule** référence d'architecture.

---

## Sommaire

**Partie I — Architecture générale**
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

**Partie II — Spécifications des modules ajoutés en v1.1**
36. [Module Parc Véhicules](#36--module-parc-véhicules)
37. [Module Contraventions](#37--module-contraventions)
38. [Espace Dirigeant (cockpit) et priorisation intelligente](#38--espace-dirigeant-cockpit-et-priorisation-intelligente)
39. [Tableau de bord du dirigeant (zones)](#39--tableau-de-bord-du-dirigeant-zones)
40. [Préparation de la synchronisation Apple Calendar](#40--préparation-de-la-synchronisation-apple-calendar)

**Partie III — Gouvernance**
41. [Documents fondateurs du projet (les « bibles »)](#41--documents-fondateurs-du-projet-les-bibles)

> **Convention de lecture.** Pour chaque choix important : **solution
> recommandée**, **raisons**, **avantages**, **limites**, **alternatives
> rejetées**.

---

## 1 — Vision et périmètre du produit

### 1.1 Vision

*BRN Pilot* est le **système de pilotage** du dirigeant de BRN Group, entreprise
générale du bâtiment. Son but, mesurable :

> Qu'en ouvrant *BRN Pilot* chaque matin, le dirigeant sache **immédiatement** ce
> qui exige son attention, ce qui est urgent, ce qui peut attendre, et **où sont
> les risques** — pour son entreprise comme pour sa journée.

*BRN Pilot* n'est pas un outil de saisie : c'est un outil de **décision et de
priorisation**. La saisie n'existe que pour alimenter le pilotage.

### 1.2 Ce que BRN Pilot est

- Un **système d'exploitation du dirigeant** (chapitre 1.7) : il pilote
  l'entreprise **et** l'activité quotidienne du dirigeant.
- Un **logiciel métier** sécurisé, maintenable et évolutif, prévu pour vivre des
  années sans refonte majeure.
- Une application **distincte** de *BRN Visite Technique*, conçue pour
  **communiquer** avec elle plus tard via API/événements (chapitre 23).
- Un socle **multi-modules** livrés progressivement sans casser l'existant.

### 1.3 Ce que BRN Pilot n'est pas (anti-périmètre)

- **Pas** un logiciel comptable ou de paie **légal** (il les *alimente*).
- **Pas** une collection de fichiers indépendants : un **produit unique et
  cohérent**, une seule base, des contrats stables.
- **Pas** un clone de *BRN Visite Technique* : le métré reste là-bas ; *BRN Pilot*
  en consomme les résultats.

### 1.4 Périmètre fonctionnel V1 (haut niveau)

| Domaine | Rôle | Statut V1 |
|---|---|---|
| Espace Dirigeant (cockpit) | Tâches, décisions, validations, signatures, échéances, priorisation. | **V1** |
| Pilotage / Tableau de bord | Vision synthétique entreprise + dirigeant + parc. | **V1** |
| Finance | Devis, factures, situations, trésorerie, marge. | **V1** |
| Chantiers | Planning, avancement, coût réel, réception, garanties. | **V1** |
| CRM | Prospects, clients, affaires, pipeline. | **V1** |
| RH | Salariés, pointage, absences, préparation paie. | **V1** |
| Stock | Articles, mouvements, appro. | **V1** |
| **Parc Véhicules** | Gestion de flotte, entretiens, coûts, alertes. | **V1 (nouveau)** |
| **Contraventions** | Suivi des infractions, coûts, échéances. | **V1 (nouveau)** |
| Documents (GED) | Justificatifs, pièces jointes, modèles, signature. | **V1** |
| SAV | Après-vente, garanties. | **Futur (retiré de V1)** |
| Maintenance | Contrats récurrents, préventif. | **Futur (retiré de V1)** |

### 1.5 Contraintes produit structurantes

Auth sécurisée ; rôles/permissions ; **PostgreSQL** ; **séparation stricte**
présentation/logique/stockage ; journal d'audit ; historique des modifications ;
sauvegardes ; pièces jointes ; **import Excel/CSV** ; **calculs financiers
centralisés** ; automatisations fiables ; compatibilité ordinateur/tablette/
téléphone ; évolution **multi-entreprise** ; **communication future** avec *BRN
Visite Technique* ; **aucune donnée financière codée en dur dans l'interface** ;
**rattachement automatique des dépenses aux véhicules** (chapitre 36) .

### 1.6 Objectifs de qualité (par priorité)

| Priorité | Qualité | Ce que ça impose |
|---|---|---|
| 1 | Intégrité des données | Aucune perte, aucune corruption, traçabilité totale. |
| 2 | Sécurité et confidentialité | Auth forte, cloisonnement, RGPD, chiffrement. |
| 3 | Maintenabilité et évolutivité | Ajouter un module sans toucher les autres. |
| 4 | Fiabilité des calculs (financiers, priorisation, coûts) | Calculs centralisés, testés, jamais dans l'UI. |
| 5 | Clarté décisionnelle | Le dirigeant voit l'essentiel en un coup d'œil. |
| 6 | Disponibilité multi-support | Bureau, tablette, téléphone. |
| 7 | Coût d'exploitation maîtrisé | Infrastructure proportionnée à une PME. |

### 1.7 Philosophie — le système d'exploitation du dirigeant

*BRN Pilot* dépasse l'ERP du bâtiment. C'est le **poste de commandement** du
dirigeant. Il pilote :

- **l'entreprise** (chantiers, finances, marge, trésorerie, équipes, stock) ;
- **l'activité quotidienne** du dirigeant (tâches, rendez-vous, appels, relances) ;
- **les décisions** (ce qui est à valider, à signer, à trancher) ;
- **les véhicules** (flotte, entretiens, coûts, contraventions) ;
- **les finances** ;
- **les priorités** (qu'est-ce qui compte **maintenant**) ;
- **les obligations** (administratives, fiscales, échéances).

Conséquence architecturale : l'**Espace Dirigeant** (chapitre 38) et son **moteur
de priorisation** ne sont pas des gadgets, ce sont des **modules de premier rang**,
au même niveau que la Finance. Le **tableau de bord du dirigeant** (chapitre 39)
est l'écran d'entrée du produit : la première chose vue chaque matin.

Cette philosophie **ne change pas** les principes d'ingénierie (chapitre 2) : elle
en **élargit le périmètre**. Le dirigeant et sa journée deviennent des **objets
métier** à part entière, pilotés avec la même rigueur que les chantiers.

---

## 2 — Principes architecturaux

| # | Principe | Énoncé |
|---|---|---|
| P1 | Non-régression | On ne casse jamais l'existant : évolution rétro-compatible ou migration explicite, réversible et testée. |
| P2 | Séparation stricte des couches | Présentation, logique métier et stockage physiquement séparés. L'interface n'exécute aucune règle métier ni calcul. |
| P3 | Cloisonnement par module | Un module ne communique avec les autres que par contrat ou événement, jamais en accédant à leurs données. |
| P4 | Source de vérité unique | PostgreSQL est la vérité ; le reste est dérivé et reconstructible. |
| P5 | Traçabilité intégrale | Tout fait métier significatif est horodaté, attribué, conservé (audit + historique). |
| P6 | Calculs métier purs et centralisés | Règles métier (financières, coûts, priorisation) déterministes, sans effet de bord, centralisées, testées, uniques, jamais dans l'UI. |
| P7 | Configuration plutôt que code | Taux, barèmes, seuils, pondérations, catalogues, règles = **données** administrables. |
| P8 | Multi-entreprise par conception | Chaque donnée porte l'identifiant de son organisation dès le jour 1. |
| P9 | Sécurité et conformité dans le socle | Auth, autorisation, chiffrement, RGPD dans l'architecture, pas en option. |
| P10 | API-first et contrats versionnés | Aucune fonctionnalité sans contrat écrit et versionné. |
| P11 | Simplicité d'abord | On refuse la complexité qui ne sert aucune qualité visée. Monolithe modulaire avant microservices. |
| P12 | Décisions écrites | Toute décision structurante est consignée (ADR), datée, non supprimée. |
| **P13** | **Règles métier définies avant d'être codées** | **Aucune règle métier importante (financière, priorisation, alertes, coûts, échéances) n'est développée sans avoir été définie au préalable dans la Business Rules Bible (chapitre 41, décision D30).** |

> **Arbitrage fondateur :** on privilégie *intégrité + sécurité + évolutivité +
> clarté décisionnelle* sur *sophistication technique* et *performance brute*.

---

## 3 — Architecture fonctionnelle

### 3.1 Deux axes de valeur

*BRN Pilot* sert **deux parcours** complémentaires, sans ressaisie :

**Axe A — Le parcours de valeur de l'entreprise :**
```
Prospect / Affaire (CRM)
  → [Métré fourni par BRN Visite Technique]           ← via API / événements
    → Devis / Chiffrage (Finance)
      → Devis accepté → Chantier créé (Chantiers)
        → Réalisation : pointage (RH), achats & sorties (Stock), véhicules (Parc)
          → Avancement → Situations & factures (Finance)
            → Encaissement → Trésorerie & Marge (Pilotage)
              → Réception → Réserves → Garanties
```

**Axe B — Le pilotage quotidien du dirigeant :**
```
Chaque matin : le dirigeant ouvre BRN Pilot
  → Cockpit (Espace Dirigeant) : tâches priorisées, échéances, validations, signatures
    → alimenté automatiquement par TOUS les modules (finance, chantiers, parc,
       contraventions, obligations) via les événements
      → priorisation intelligente : urgence × importance × délai × impact
        → le dirigeant sait immédiatement quoi traiter, quoi déléguer, quoi différer
```

À chaque flèche : **la donnée circule par contrat et par événement, jamais
ressaisie.**

### 3.2 Vue fonctionnelle en couches

```
┌───────────────────────────────────────────────────────────────┐
│  PRÉSENTATION (ordinateur, tablette, téléphone)                 │
│  Affiche et saisit. N'exécute aucune règle métier. (P2)         │
│  Écran d'entrée : Tableau de bord du dirigeant (ch. 39)         │
└───────────────────────────────────────────────────────────────┘
                         │  API sécurisée, versionnée (P10)
┌───────────────────────────────────────────────────────────────┐
│  LOGIQUE MÉTIER (modules cloisonnés)                            │
│  Dirigeant · Finance · Chantiers · CRM · RH · Stock ·           │
│  Parc Véhicules · Contraventions                                │
│  + Calculs centralisés (financiers, coûts, priorisation) (P6)   │
│  + Moteur d'automatisation                                      │
└───────────────────────────────────────────────────────────────┘
                         │  contrats internes + événements
┌───────────────────────────────────────────────────────────────┐
│  SOCLE TRANSVERSE                                               │
│  Identité · Autorisation · Événements · Documents · Audit ·     │
│  Notifications · Recherche · Référentiels · Échéancier          │
└───────────────────────────────────────────────────────────────┘
                         │
┌───────────────────────────────────────────────────────────────┐
│  STOCKAGE : PostgreSQL (vérité) · Stockage fichiers · Cache     │
└───────────────────────────────────────────────────────────────┘
```

### 3.3 Domaines et responsabilités

| Domaine | Responsabilité | Ne fait pas |
|---|---|---|
| Espace Dirigeant | Centraliser et prioriser tâches, décisions, échéances, signatures du dirigeant. | Ne remplace pas les données des modules ; il les agrège et les priorise. |
| Pilotage / Tableau de bord | Présenter la santé entreprise + dirigeant + parc. | Ne saisit pas de données primaires (lit des projections). |
| Finance | Devis, factures, trésorerie, marge, calculs financiers. | Pas de compta légale. |
| Chantiers | Planning, avancement, coût réel, réception, garanties. | Ne calcule pas les prix. |
| CRM | Relation client, pipeline. | Ne facture pas. |
| RH | Salariés, pointage, absences. | Pas de paie légale. |
| Stock | Articles, mouvements, appro. | Pas de compta fournisseurs. |
| Parc Véhicules | Flotte, entretiens, coûts, alertes, documents véhicule. | Ne paie pas (émet des dépenses vers Finance). |
| Contraventions | Infractions, coûts, échéances, statistiques. | Ne conduit pas de politique RH disciplinaire (fournit les faits). |
| Documents | GED, justificatifs, modèles, signature. | Pas le stockage des données structurées. |

### 3.4 Projections de pilotage (précision v1.1 — décision D22)

> **Solution recommandée.** Le pilotage (chapitres 39, 31) lit des **tables de
> lecture (projections)** alimentées **par les événements** (chapitre 13), et non
> des requêtes directes croisant plusieurs modules.
> **Raisons.** Respecter le cloisonnement (P3), garantir des tableaux de bord
> rapides et cohérents, et pouvoir reconstruire une projection par rejeu.
> **Avantages.** Performance, cohérence, découplage, reconstructibilité.
> **Limites.** Cohérence **éventuelle** (léger décalage) à assumer dans l'UX ;
> logique de mise à jour des projections à maintenir.
> **Alternatives rejetées.** Requêtes ad hoc croisant les tables de plusieurs
> modules (violent P3, lentes, fragiles) ; recalcul total à chaque affichage
> (coûteux).

---

## 4 — Découpage des modules

### 4.1 Règle commune à tout module

- Il **possède ses données** ; personne ne lit/écrit dans ses tables directement.
- Il **expose une API** et **émet/écoute des événements**.
- Il **apporte de la valeur seul**.
- Il se **greffe sans modifier l'existant** (P1, P3).

### 4.2 Modules de la V1

| Module | Périmètre condensé | Dépend de |
|---|---|---|
| **Socle & Référentiels** | Organisation, tiers, identité, rôles, référentiels, documents, événements, audit, échéancier. | — |
| **Espace Dirigeant** | Tâches, décisions, validations, signatures, échéances, obligations, notes, priorisation. | Socle + écoute tous |
| **CRM** | Comptes, contacts, opportunités, pipeline. | Socle |
| **Finance** | Prix, devis, factures, situations, trésorerie, calculs financiers. | Socle, Chantiers, [Métré externe] |
| **Chantiers** | Planning, avancement, coût réel, réception, garanties. | Socle, Finance, RH, Stock, Parc |
| **RH** | Salariés, pointage, absences, variables de paie. | Socle |
| **Stock** | Articles, mouvements, emplacements, appro. | Socle, Finance |
| **Parc Véhicules** | Flotte, entretiens, coûts, alertes, documents (chapitre 36). | Socle, Finance, RH |
| **Contraventions** | Infractions, coûts, échéances, statistiques (chapitre 37). | Socle, Parc, RH |
| **Documents (GED)** | Fichiers, versions, modèles, signature. | Socle |
| **Pilotage** | Tableaux de bord, indicateurs, alertes (projections). | Tous (lecture) |
| **Automatisations** | Règles et workflows déclenchés par événements. | Tous |
| **IA (préparation)** | Couche d'assistance branchée sur événements/contrats. | Tous (optionnel) |

### 4.3 Frontière avec *BRN Visite Technique*

Application **partenaire**, pas un module : communication par **connecteur**
dédié (chapitre 23).

### 4.4 Modules futurs (hors périmètre V1)

| Module futur | Raison du report | Ce que l'architecture prévoit déjà |
|---|---|---|
| **SAV** | Retiré de la V1 pour concentrer l'effort sur le pilotage, la finance et le parc. | Les événements (réception, garanties) et le modèle de tiers permettront de l'ajouter **sans toucher l'existant** (P1, P3). |
| **Maintenance** | Idem. | Les contrats récurrents et les interventions se brancheront sur les événements et l'échéancier existants. |

> Ces modules restent **prévus** : leur retrait n'est pas un abandon mais un
> **séquencement**. Aucune décision de la V1 ne leur ferme la porte.

---

## 5 — Architecture technique

### 5.1 Style : monolithe modulaire évolutif

> **Solution recommandée.** Un **monolithe modulaire** : un seul déployable, des
> modules internes fortement cloisonnés, une base unique partitionnée logiquement
> par module. Frontières prêtes pour l'extraction en services **si** un besoin réel
> l'exige.
> **Raisons.** PME, petite équipe : priorité au coût et à la simplicité ; le
> cloisonnement apporte l'évolutivité sans le coût des microservices.
> **Avantages.** Coût minimal, transactions simples, refactoring facile,
> supervision simple, extraction future possible.
> **Limites.** Discipline de cloisonnement exigée ; un défaut de déploiement
> affecte tout (atténué par déploiements petits et fréquents).
> **Alternatives rejetées.** Microservices d'emblée (coût/complexité injustifiés) ;
> monolithe non modulaire (couplage total, refonte inévitable).

### 5.2 Vue de déploiement (cible)

```
                Internet (HTTPS uniquement)
                         │
                ┌────────┴────────┐
                │  Passerelle/API  │  auth, TLS, limitation de débit
                └────────┬────────┘
        ┌────────────────┼─────────────────┐
  ┌─────┴─────┐   ┌──────┴──────┐   ┌───────┴────────┐
  │ Application │  │ Travailleurs │  │  Connecteurs    │
  │ (API +      │  │ asynchrones  │  │ (compta, banque,│
  │  modules)   │  │ (événements, │  │  Apple Calendar,│
  │             │  │  automat., IA)│  │  BRN Visite T.) │
  └─────┬───────┘  └──────┬───────┘  └───────┬─────────┘
        │                 │                  │
  ┌─────┴─────────────────┴──────────────────┴─────┐
  │ PostgreSQL · Stockage fichiers · Cache/File     │
  └─────────────────────────────────────────────────┘
```

### 5.3 Anatomie interne d'un module

Trois anneaux (architecture hexagonale) : **Domaine** (cœur pur, déterministe,
sans I/O) ; **Application** (cas d'usage, transactions, autorisations,
événements) ; **Adaptateurs** (persistance, messagerie, appels sortants). L'API du
module est sa **seule** surface publique.

---

## 6 — Choix technologiques argumentés

> Choix **recommandés**, priorité aux standards ouverts et à la réversibilité.

### 6.1 Base de données
> **Recommandé :** **PostgreSQL**.
> **Raisons :** transactions ACID (argent, stock, coûts véhicules), intégrité,
> souplesse documentaire, standard ouvert, hébergeable en UE.
> **Avantages :** fiabilité, richesse, réversibilité, coût maîtrisé.
> **Limites :** exploitation sérieuse requise.
> **Alternatives rejetées :** NoSQL (intégrité/transactions insuffisantes) ; base
> propriétaire d'un cloud (verrouillage).

### 6.2 Langage et exécution serveur
> **Recommandé :** un langage **fortement typé**, écosystème mûr (question ouverte
> ch. 35, à trancher avec l'équipe).
> **Raisons/Avantages :** sûreté à l'échelle d'un ERP, maintenabilité, recrutement.
> **Limites :** un langage non typé démarrerait plus vite mais serait dangereux.
> **Alternatives rejetées :** non typé pour tout le back ; multiplier les langages
> sans nécessité.

### 6.3 Style d'API
> **Recommandé :** **REST versionnée**, contrat formel (spécification ouverte) +
> **flux d'événements**.
> **Raisons/Avantages :** universelle, outillée, interopérable, testable.
> **Limites :** discipline de versionnage.
> **Alternatives rejetées :** exposer la base (couplage fatal) ; tout asynchrone.

### 6.4 Stockage de fichiers
> **Recommandé :** **stockage objet compatible S3**, séparé de la base.
> **Raisons/Avantages :** coût, scalabilité, URLs signées, réversibilité —
> essentiel vu le volume de documents véhicules (cartes grises, contrôles, photos).
> **Limites :** gestion des accès et sauvegardes.
> **Alternatives rejetées :** fichiers en base ; disque local.

### 6.5 Hébergement
> **Recommandé :** cloud à **standards ouverts**, **région UE** (RGPD).
> **Alternatives rejetées :** hors UE ; services propriétaires irremplaçables.

---

## 7 — Architecture frontend

### 7.1 Rôle strict de la présentation (P2)
La présentation **affiche et saisit uniquement** : aucune règle métier, aucun
calcul financier, aucun calcul de priorisation. Toute valeur calculée provient de
l'API (« aucune donnée financière codée en dur dans l'interface »).

### 7.2 Compatibilité multi-support
> **Recommandé :** application web **responsive** (bureau, tablette, téléphone),
> installable (application web progressive) pour l'usage nomade.
> **Raisons/Avantages :** un seul socle, trois supports, coût maîtrisé — le
> dirigeant consulte son cockpit sur téléphone.
> **Limites :** fonctions matérielles avancées → décision native dédiée si besoin.
> **Alternatives rejetées :** trois applications natives distinctes ; bureau seul.

### 7.3 Organisation
Séparation présentation / état / accès (via API). Composants réutilisables (cartes,
tableaux, graphiques, alertes) — le prototype UX sert de **référence visuelle**.
Internationalisation prévue (formats montants/dates/langue).

### 7.4 Accessibilité et ergonomie
Lisibilité petit écran, cibles tactiles, contrastes, navigation clavier. Les écrans
de pilotage privilégient la **décision** (marge, retard, trésorerie, échéances,
alertes en avant). Cible qualité « premium » : viser un référentiel d'accessibilité
explicite (à formaliser dans l'UX/UI Bible).

### 7.5 Stratégie hors-ligne (précision v1.1 — décision D24)
> **Solution recommandée.** *BRN Pilot* est **principalement connecté** (cockpit,
> pilotage, finance). Pour les usages **nomades** (consultation du cockpit, ajout
> d'une tâche/note, relevé kilométrique ou dépense véhicule sur le terrain), on
> vise une **consultation hors-ligne + saisie différée** limitée à ces objets
> simples, synchronisée au retour du réseau. La saisie hors-ligne **complexe** (le
> métré) reste dans *BRN Visite Technique*.
> **Raisons.** Le dirigeant et les équipes ne sont pas toujours connectés ; mais
> l'essentiel de *BRN Pilot* est de la décision sur données consolidées (connecté).
> **Avantages.** Confort nomade sans la complexité d'un hors-ligne total.
> **Limites.** Un périmètre hors-ligne à délimiter précisément (question ch. 35).
> **Alternatives rejetées.** Hors-ligne total (complexité injustifiée pour du
> pilotage) ; tout-connecté strict (inconfort nomade).

---

## 8 — Architecture backend

### 8.1 Organisation en modules
Backend organisé en **modules métier** (chapitre 4), chacun en trois anneaux
(chapitre 5.3). Un module n'importe jamais les tables d'un autre : API interne ou
événements.

### 8.2 Séparation présentation / logique / stockage (P2)

| Couche | Responsabilité | Interdits |
|---|---|---|
| Présentation | Afficher, saisir. | Aucune règle, aucun calcul, aucun accès base. |
| Logique métier | Règles, calculs, transactions, autorisations. | Aucun rendu d'interface. |
| Stockage | Persister, restituer. | Aucune règle métier. |

### 8.3 Traitements asynchrones
> **Recommandé :** **file de messages** + **travailleurs asynchrones** pour tout ce
> qui ne doit pas bloquer l'utilisateur : automatisations, envois, imports
> volumineux, calculs d'alertes (échéances véhicules/contraventions), préparation
> IA, futures synchronisations (Apple Calendar).
> **Raisons/Avantages :** robustesse (réessais), réactivité, découplage.
> **Limites :** supervision de la file.
> **Alternatives rejetées :** tout synchrone.

### 8.4 Idempotence et fiabilité
Écritures sensibles avec **clé d'idempotence** ; consommateurs d'événements
**idempotents**.

---

## 9 — Architecture de la base de données

### 9.1 Source de vérité unique (P4)
PostgreSQL est la seule vérité ; fichiers au stockage objet ; caches, index et
projections sont dérivés et reconstructibles.

### 9.2 Multi-entreprise dès le premier jour (P8)
> **Solution recommandée.** Identifiant d'organisation **obligatoire** sur chaque
> table métier ; isolation à deux niveaux (couche d'accès + sécurité au niveau
> ligne).
> **Raisons/Avantages :** ouverture future (filiales, plusieurs sociétés, mode
> hébergé) sans refonte ; défense en profondeur.
> **Limites :** discipline (toutes requêtes/migrations respectent l'organisation).
> **Alternatives rejetées :** mono-entreprise d'abord (refonte garantie) ; une base
> par entreprise (exploitation lourde).

### 9.3 Cloisonnement physique par module
Chaque module a son **espace de tables** ; des **droits de base distincts par
module** rendent le cloisonnement (P3) impossible à violer par accident.

### 9.4 Souplesse maîtrisée
> **Recommandé :** **colonnes relationnelles** pour le stable/requêté/chiffré ;
> **colonnes documentaires** pour le détail variable (par exemple caractéristiques
> spécifiques d'un véhicule).
> **Alternatives rejetées :** tout relationnel rigide ; tout documentaire.

### 9.5 Invariants de données transverses
Identifiant d'organisation ; horodatages création/modification ; attribution ;
**numéro de révision** (verrou optimiste) ; **suppression logique** (archivage, pas
d'effacement, sauf droit à l'effacement RGPD tracé).

### 9.6 Historisation (précision v1.1 — décision D21)
> **Solution recommandée.** Un **historique des modifications par tables
> d'historique** (chaque changement d'une entité engageante conserve l'état
> précédent) **complété par les événements** pour l'audit. On ne va **pas** jusqu'à
> l'*event sourcing* complet.
> **Raisons.** Répondre à « qui a changé quoi, quand, valeur avant/après » sans la
> lourdeur de reconstruire tout l'état à partir d'un flux d'événements.
> **Avantages.** Simplicité, requêtes d'historique directes, coût maîtrisé pour une
> PME.
> **Limites.** Volume d'historique à gérer (rétention).
> **Alternatives rejetées.** *Event sourcing* complet (complexité et coût
> injustifiés) ; aucune historisation (inacceptable).

---

## 10 — Principales entités métier

> Dictionnaire de données de haut niveau (documentation). Champs indicatifs,
> précisés à la conception détaillée et dans la Data Bible.

### 10.1 Entités transverses (socle)

| Entité | Rôle |
|---|---|
| Organisation | L'entreprise (multi-entreprise). |
| Tiers (Party) | Personne ou entreprise, neutre, plusieurs rôles. |
| Rôle de tiers | client, fournisseur, sous-traitant, salarié. |
| Utilisateur | Compte d'accès. |
| Rôle / Permission | Droits + périmètre (attributs). |
| Référentiel | Données de configuration (unités, TVA, corps d'état, types d'infraction, seuils d'alerte…). |
| Document | Fichier justificatif (référence). |
| Événement | Fait métier. |
| Entrée d'audit | Trace de conformité. |
| **Échéance** | Objet transverse : une date-butoir typée (assurance, contrôle technique, contravention, obligation fiscale…), source des alertes et du cockpit. |

### 10.2 Entités métier (par module)

| Module | Entités racines |
|---|---|
| Espace Dirigeant | Tâche, Décision, Validation, DemandeDeSignature, Note, Objectif, Obligation. |
| CRM | Compte, Opportunité, Interaction. |
| Finance | Article de prix, Devis, Ligne de devis, Facture, Situation, Écriture de trésorerie, **Dépense**. |
| Chantiers | Chantier, Phase/Tâche, Réception, Réserve. |
| RH | Salarié, Pointage, Absence, Variable de paie. |
| Stock | Article, Emplacement, Mouvement, Réapprovisionnement. |
| **Parc Véhicules** | Véhicule, Entretien, Réparation, Pneu, Vidange, Batterie, Contrat (assurance/leasing), DocumentVéhicule, CoûtVéhicule (voir ch. 36). |
| **Contraventions** | Contravention, Contestation, Paiement (voir ch. 37). |
| Documents | Document, Version, Modèle. |

### 10.3 Notion pivot : le Tiers
Un **tiers** (personne/entreprise) joue plusieurs **rôles**. Identité unique
référencée par identifiant. Le **conducteur** d'un véhicule et l'auteur d'une
contravention sont des tiers (rôle salarié le plus souvent).

### 10.4 Notion pivot : l'Échéance
Toutes les dates-butoir (assurance, contrôle technique, entretien, vidange, pneus,
paiement/contestation d'une contravention, obligation fiscale, rendez-vous) sont
modélisées comme des **échéances** typées. Cela **unifie** les alertes et le
cockpit : une seule mécanique produit toutes les alertes d'échéance du produit.

---

## 11 — Relations entre les entités

### 11.1 Carte des relations (haut niveau)

```
Organisation 1───∞ Tiers 1───∞ RôleDeTiers
      ├─∞ Utilisateur ─∞ Rôle/Permission
      └─∞ Échéance (typée) ──→ Cockpit / Alertes

CRM:  Compte 1──∞ Opportunité ──∞ Devis ──∞ LigneDeDevis (Finance)
Finance: Devis accepté 1──1 Chantier (Chantiers)
Chantiers: Chantier 1──∞ Phase ; 1──∞ Réserve ; 1──∞ Situation ──→ Facture
RH:      Chantier 1──∞ Pointage ∞──1 Salarié(Tiers)
Stock:   Chantier 1──∞ Mouvement ∞──1 Article

Parc:    Véhicule 1──∞ Entretien / Réparation / Vidange / Pneu / Batterie
         Véhicule 1──∞ Contrat(assurance/leasing) 1──∞ Échéance
         Véhicule 1──∞ CoûtVéhicule ∞──1 Dépense (Finance)
         Véhicule ∞──1 ConducteurPrincipal(Tiers)

Contrav: Contravention ∞──1 Véhicule ; ∞──1 Conducteur(Tiers)
         Contravention 1──∞ Échéance(paiement/contestation) ; 1──1 Paiement

Dirigeant: Tâche/Décision/Validation/Signature ∞──1 (objet source : facture,
           contravention, échéance véhicule, obligation…) via référence + événement
Documents: (tout objet) 1──∞ Document (rattachement polymorphe)
```

### 11.2 Règles de relation (cloisonnement P3)
Relations **inter-modules** par **identifiant** (référence), pas par clé étrangère
physique traversant deux modules. Relations **intra-module** par clés étrangères.
Un document/une échéance se rattache à n'importe quel objet par (type, identifiant).

### 11.3 Rattachement automatique des dépenses aux véhicules
Toute **dépense** (Finance) portant un identifiant de véhicule est automatiquement
agrégée dans le **coût d'exploitation** du véhicule (chapitre 36.4), via événement
— sans double saisie, sans couplage direct entre Parc et Finance (chacun garde ses
données ; l'événement les relie).

### 11.4 Cohérence entre modules
Cohérence **immédiate** dans un agrégat (transaction) ; **éventuelle** entre
modules (événements).

---

## 12 — Architecture des API

### 12.1 Principes
> **Recommandé :** **API-first**, **REST versionnée** (`/v1`), spécification
> formelle.
> **Avantages :** contrat stable, documentation générable, tests de contrat,
> interopérabilité (mobile, connecteurs, Apple Calendar futur, *BRN Visite
> Technique*).
> **Alternatives rejetées :** API non versionnée ; endpoints non contractualisés.

### 12.2 Conventions transverses
Authentification par jeton (organisation/rôles dérivés du jeton) ; autorisation
**côté serveur** ; verrou optimiste (numéro de révision) ; idempotence ; pagination
par curseur ; format d'erreur unique ; versionnage sans rupture.

### 12.3 Familles d'endpoints (description fonctionnelle)

| Famille | Objet |
|---|---|
| Session | Contexte utilisateur (organisation, rôles, périmètre). |
| Tiers | Lister/créer/lire/mettre à jour ; rôles. |
| Dirigeant | Tâches, décisions, validations, signatures, échéances, obligations, notes ; file priorisée. |
| CRM | Comptes, opportunités, interactions. |
| Finance | Prix, devis, factures, situations, trésorerie, dépenses. |
| Chantiers | Créer depuis devis accepté ; avancement ; réception. |
| RH | Pointages, absences, variables de paie. |
| Stock | Articles, mouvements, réapprovisionnements. |
| Parc Véhicules | Véhicules, entretiens, réparations, pneus, vidanges, batteries, contrats, coûts, documents, alertes. |
| Contraventions | Contraventions, contestations, paiements, statistiques. |
| Documents | Autorisation d'envoi, confirmation, lecture, versionnement, signature. |
| Pilotage | Indicateurs et projections (lecture seule) par zone (entreprise/dirigeant/parc). |
| Imports/Exports | Déclencher/suivre un import Excel/CSV ; produire un export. |
| Calendrier (préparation) | Réservé à la future synchronisation Apple Calendar (chapitre 40). |

### 12.4 Sécurité des API
HTTPS uniquement, derrière la passerelle (limitation de débit, anti-abus).

---

## 13 — Architecture des événements métier

### 13.1 Rôle
Colonne vertébrale de la communication entre modules et avec l'extérieur :
synchronisation, audit, automatisations, pilotage (projections), cockpit, IA.

### 13.2 Nature
Fait **accompli, immuable, horodaté, attribué**. Nommage « Domaine.FaitAuPassé ».
Exemples v1.1 : *Devis accepté*, *Facture émise*, *Paiement reçu*, *Chantier
réceptionné*, *Dépense enregistrée*, **Véhicule ajouté**, **Entretien réalisé**,
**Échéance véhicule proche**, **Contravention enregistrée**, **Contravention à
payer**, **Tâche créée**, **Décision en attente**, **Signature demandée**,
**Obligation à échéance**.

### 13.3 Enveloppe standard
Identifiant ; type ; version de schéma ; organisation ; horodatage ; auteur (canal :
interface/mobile/automatisation/connecteur) ; agrégat ; identifiant de corrélation ;
identifiant de causalité ; contenu.

### 13.4 Fiabilité de publication
> **Recommandé :** **boîte d'envoi transactionnelle** (donnée + événement dans la
> même transaction ; publication fiable ensuite).
> **Avantages :** aucun événement perdu, rejouabilité, traçabilité.
> **Alternatives rejetées :** publier « au mieux » après la transaction.

### 13.5 Compatibilité dans le temps (P1)
Événements évoluent par **ajout** ; consommateurs tolérants ; version incrémentée
si rupture ; un type publié ne disparaît jamais en silence.

---

## 14 — Moteur d'automatisation

### 14.1 Rôle
Rendre *BRN Pilot* **actif** (il alerte, relance, prépare, priorise) sans coder en
dur les processus dans les modules.

### 14.2 Modèle : Déclencheur → Condition → Action

| Élément | Exemples (v1.1) |
|---|---|
| Déclencheur | Un événement (devis émis, dépense enregistrée) ; une **échéance** (assurance/contrôle technique/entretien/vidange/pneus à J-N ; obligation fiscale ; délai de paiement/contestation d'une contravention) ; un seuil (kilométrage d'entretien atteint, stock bas, marge sous objectif). |
| Condition | Montant > seuil ; retard > N jours ; échéance dans moins de N jours ; contravention non payée ; tâche non traitée. |
| Action | Notifier (dirigeant, responsable) ; **créer une tâche priorisée** dans le cockpit ; générer un document ; appeler un connecteur ; émettre un événement ; préparer un brouillon (assisté IA). |

### 14.3 Domaines couverts par les automatisations (v1.1)

| Domaine | Automatisations typiques |
|---|---|
| Finance | Relance de devis, alerte dépassement de marge, relance impayé, situation due. |
| Chantiers | Retard, réserve non levée, jalon franchi. |
| Stock | Seuil de réapprovisionnement atteint. |
| **Parc Véhicules** | Alertes **assurance, contrôle technique, entretien, vidange, pneus, échéances** de contrat (leasing/crédit) ; entretien dû au kilométrage. |
| **Contraventions** | Alerte de **délai de paiement**, de **délai de contestation** ; contravention non traitée ; récapitulatif de coût. |
| **Dirigeant** | Tâches créées automatiquement depuis les événements des autres modules, **priorisées** ; rappel des validations/signatures en attente ; **obligations administratives et fiscales** à échéance ; agrégation des **urgences** du jour. |
| Calendrier (futur) | À la connexion d'Apple Calendar : création d'échéances/tâches depuis les rendez-vous (chapitre 40). |

### 14.4 Gouvernance (fiabilité exigée)
> **Recommandé :** règles **configurables (données, pas code)**, **journalisées**,
> **idempotentes**, **anti-boucle**, **limitées en débit**, **testables à blanc**
> (simulation). Les actions **engageantes** passent par un **brouillon validé par
> un humain** ; l'exécution automatique est réservée aux actions sûres
> (notification, création de tâche) et activée explicitement.
> **Alternatives rejetées :** automatisations codées en dur ; exécution automatique
> sans garde-fou.

### 14.5 Articulation avec l'IA
Automatisation **déterministe** (squelette) + IA **probabiliste** (muscle
optionnel) + validation **humaine** pour tout acte engageant.

---

## 15 — Calculs financiers

### 15.1 Principe : moteur financier central, pur et testé (P6)
> **Solution recommandée.** Tous les calculs financiers (HT/TVA/TTC, remises,
> marges, situations, retenues de garantie, échéanciers, valorisations, **coûts
> d'exploitation des véhicules**, **coûts des contraventions**) sont réalisés par un
> **moteur centralisé**, déterministe, sans effet de bord, testé, unique.
> L'interface **n'effectue aucun calcul financier**.
> **Raisons/Avantages :** fiabilité, testabilité, cohérence, traçabilité, évolution
> en un seul endroit.
> **Limites :** frontière stricte + couverture de tests.
> **Alternatives rejetées :** calculs dans l'interface ; calculs recopiés.

### 15.2 Paramètres financiers = données (P7)
TVA, barèmes, marges, conditions de paiement, retenues, taux horaires, **barèmes de
contraventions**, **coûts kilométriques** : référentiels **administrables,
versionnés et datés**. Aucune valeur financière en dur dans l'interface.

### 15.3 Précision et arrondis
> **Recommandé :** montants en **valeurs exactes** (décimales), **règles d'arrondi
> explicites et documentées** conformes aux usages comptables français.
> **Alternatives rejetées :** virgule flottante.

### 15.4 Marge prévue vs réalisée
Marge **prévue** (chiffrage) et **réalisée projetée** (coût réel rapporté à
l'avancement), **calculées** (jamais saisies). La méthode de projection sera
précisée dans la Business Rules Bible (seuil d'avancement minimal, bornes) pour
éviter les fausses alertes en début de chantier.

### 15.5 Journalisation des calculs
Chaque calcul engageant (facture, situation) produit une **trace** (paramètres,
taux en vigueur, résultat).

### 15.6 Numérotation légale des documents financiers (précision v1.1 — décision D23)
> **Solution recommandée.** Les documents à valeur légale (**factures**, avoirs)
> reçoivent une **numérotation séquentielle, chronologique, continue et sans trou**,
> propre à chaque organisation, attribuée **au moment de l'émission** par le moteur
> financier (jamais par l'interface).
> **Raisons.** Obligation légale française ; une numérotation à trous ou
> réattribuable est un risque de conformité majeur.
> **Avantages.** Conformité, auditabilité, non-répudiation.
> **Limites.** Nécessite une gestion robuste des séquences (annulations, avoirs) —
> à préciser dans la Business Rules Bible.
> **Alternatives rejetées.** Numéro généré côté interface (risque de trous/
> doublons) ; numéro modifiable après émission (illégal).

---

## 16 — Gestion des fichiers et justificatifs

### 16.1 Principe
> **Recommandé :** fichiers (justificatifs, PDF, photos, **cartes grises, contrôles
> techniques, constats de contravention, photos de véhicules**) dans le **stockage
> objet** ; la base ne conserve qu'une **référence**.
> **Avantages :** scalabilité, coût, intégrité (empreinte), réversibilité.
> **Alternatives rejetées :** fichiers en base ; disque local.

### 16.2 Cycle de vie
Envoi direct vers le stockage objet puis enregistrement de la référence.
**Documents émis** (facture, PV) **immuables et versionnés**. Conservation légale
par type (facture : dix ans ; documents véhicules : durée de détention + délais
légaux). Normalisation/compression à l'entrée.

### 16.3 Sécurité des fichiers
Accès par autorisation, URLs signées temporaires, chiffrement au repos, empreinte
pour intégrité et dédoublonnage.

### 16.4 Signature électronique (précision v1.1 — décision D25)
> **Solution recommandée.** Prévoir une **capacité de signature électronique** pour
> les actes qui l'exigent (acceptation de devis, PV de réception, **documents à
> signer du cockpit dirigeant**). En V1, l'architecture **réserve la place** d'un
> **prestataire de signature externe** (connecteur, chapitre 23) ; le choix
> interne/prestataire qualifié est une **question à valider** (ch. 35).
> **Raisons.** L'Espace Dirigeant liste explicitement « signatures » et « documents
> à signer » ; la signature engage juridiquement.
> **Avantages.** Valeur probante, dématérialisation, traçabilité.
> **Limites.** Un vrai niveau de signature qualifiée implique un prestataire agréé
> (coût, intégration).
> **Alternatives rejetées.** Signature « image collée » sans valeur probante ;
> ignorer le besoin (le cockpit le requiert).

---

## 17 — Authentification

### 17.1 Principe
> **Recommandé :** **authentification déléguée** à un fournisseur d'identité
> standard (protocole ouvert). Aucun mot de passe stocké par *BRN Pilot*.
> **Avantages :** sécurité, second facteur, révocation, audit, SSO futur.
> **Limites :** dépendance atténuée par un protocole ouvert (réversible).
> **Alternatives rejetées :** mots de passe internes ; clé statique.

### 17.2 Exigences
Second facteur obligatoire pour les rôles à privilèges (direction, finance, RH) ;
sessions limitées, jetons courts + rafraîchissement, révocation ; jeton distinct et
révocable par appareil nomade.

---

## 18 — Gestion des rôles et permissions

### 18.1 Modèle : rôles + attributs
> **Recommandé :** **rôles** (qui) + **attributs** (sur quoi : organisation,
> chantiers/véhicules affectés, propriété, statut).
> **Avantages :** finesse, moindre privilège, cloisonnement.
> **Alternatives rejetées :** rôles seuls (trop grossiers) ; permissions
> individuelles (ingérables).

### 18.2 Rôles de référence (indicatifs)

| Rôle | Accès type |
|---|---|
| Direction | Tout ; cockpit dirigeant complet ; validation des actes engageants. |
| Conducteur de travaux | Chantiers, RH/Stock/Parc de ses chantiers, situations. |
| Commercial | CRM, devis (écriture limitée). |
| Comptable / ADV | Finance complète, lecture Chantiers/Parc. |
| RH | RH complet, cloisonné. |
| Magasinier | Stock. |
| Gestionnaire de flotte | Parc Véhicules, Contraventions. |
| Client (portail futur) | Ses chantiers/documents. |
| Sous-traitant (futur) | Ses lots/chantiers. |

### 18.3 Règle d'or
Autorisation **toujours vérifiée côté serveur** au niveau du cas d'usage. L'Espace
Dirigeant, très sensible, est **strictement réservé** à la direction (et à qui elle
délègue explicitement).

---

## 19 — Journal d'audit et traçabilité

### 19.1 Deux mécanismes
**Journal d'audit** (conformité/sécurité : qui/quoi/quand/où) et **historique des
modifications** (métier : avant/après par donnée).

### 19.2 Journal d'audit
> **Recommandé :** journal **immuable**, distinct des données, à accès restreint,
> conservé longtemps ; chaque action engageante y produit une entrée.
> **Alternatives rejetées :** aucune traçabilité ; audit mêlé aux données.

### 19.3 Historique des modifications (précision v1.1 — décision D21)
Mécanisme retenu : **tables d'historique** (état précédent conservé) **+
événements** pour l'audit, **sans event sourcing complet** (voir 9.6). On répond
toujours à « qui a changé cette valeur, quand, ancienne valeur ».

---

## 20 — Sécurité

### 20.1 Défense en profondeur

| Couche | Mesures |
|---|---|
| Réseau | HTTPS partout ; limitation de débit ; anti-abus. |
| Application | Validation des entrées côté serveur ; requêtes paramétrées ; moindre privilège. |
| Données | Chiffrement au repos et en transit ; isolation multi-entreprise (accès + niveau ligne). |
| Secrets | Aucun secret dans le code/dépôt ; coffre + rotation. |
| Identité | Auth déléguée, second facteur, révocation. |
| Journalisation | Sécurité (auth, élévations, accès aux données sensibles). |

### 20.2 Conformité RGPD
> **Recommandé :** RGPD **par conception** — minimisation, base légale/finalité,
> durées de conservation, accès/portabilité, **droit à l'effacement** (anonymisation
> tracée), cloisonnement renforcé RH **et données de conducteurs/contraventions**
> (données personnelles sensibles : infractions, points), hébergement UE, registre
> des traitements, sous-traitants contractualisés.
> **Note importante :** les données de **contraventions** (infractions, perte de
> points, identité du conducteur) sont **particulièrement sensibles** ; leur accès
> est strictement restreint (direction + gestionnaire de flotte) et journalisé.
> **Alternatives rejetées :** conformité ajoutée après coup.

### 20.3 Gestion des dépendances
Suivi des vulnérabilités, mises à jour, revue des nouvelles dépendances, chaîne
d'approvisionnement.

---

## 21 — Sauvegardes et restauration

### 21.1 Principe
> **Recommandé :** sauvegardes **automatiques, chiffrées, régulières** (base +
> stockage objet), **copie hors-site**, rétention définie, **restauration testée**.
> **Alternatives rejetées :** sauvegardes non testées ; base sans les fichiers.

### 21.2 Objectifs (à fixer avec la direction)
**RPO** (perte max) et **RTO** (temps de reprise) chiffrés ; plan de reprise
documenté et **répété** au moins une fois par an.

### 21.3 Réversibilité
Standards ouverts (PostgreSQL, stockage objet, protocole d'identité) pour exporter
et migrer à tout moment.

---

## 22 — Imports et exports

### 22.1 Imports Excel et CSV
> **Recommandé :** import **guidé, validé, traçable** : modèle fourni ;
> **prévisualisation** ; **validation ligne à ligne** avec rapport d'erreurs ;
> **asynchrone** pour les gros volumes ; **tracé** et **rejouable** sans doublon.
> Cas d'usage v1.1 : reprise du **parc de véhicules**, de l'**historique des
> contraventions**, des **clients/chantiers**, des **tableurs de coûts** existants.
> **Alternatives rejetées :** import sans validation ; import synchrone bloquant.

### 22.2 Exports
Exports **structurés** (Excel/CSV, PDF) des données et états de pilotage,
respectant l'autorisation, tracés pour les données personnelles.

### 22.3 Règle de sécurité
Import/export = opération **engageante** : autorisations, journalisation ; un montant
importé passe par le moteur financier, jamais directement en base.

---

## 23 — Intégration future avec BRN Visite Technique

### 23.1 Position de principe
Deux applications **distinctes**, communiquant **plus tard** par **API/événements**.
Aucun accès direct à la base de l'autre.

### 23.2 Mécanisme : connecteur dédié
> **Recommandé :** un **connecteur** traduisant le vocabulaire de *BRN Visite
> Technique* (visite, pièce, métré, ouvrage) vers celui de *BRN Pilot* (opportunité,
> chantier, ligne de devis), dans les deux sens.
> **Avantages :** couplage faible, remplaçabilité, pas de contamination de modèle.
> **Alternatives rejetées :** base partagée ; ressaisie manuelle.

### 23.3 Flux cible (haut niveau)
```
BRN Visite Technique          Connecteur          BRN Pilot
  Métré clôturé ── événement ─▶ traduit ── API ──▶ Devis pré-rempli → Chantier
```

### 23.4 Sécurité et fiabilité
Échanges authentifiés (identité de service à moindre privilège), chiffrés, tracés,
idempotents ; rejeu en cas de panne.

### 23.5 Le métré reste chez BRN Visite Technique
*BRN Pilot* **consomme** les résultats du métré ; il ne le réimplémente pas
(pas de double vérité). **Point à cadrer** : la réconciliation des **clients/tiers**
entre les deux applications (éviter les doublons) — question ch. 35.

---

## 24 — Préparation des fonctions IA

### 24.1 Position de principe
> **Recommandé :** IA en **couche d'augmentation** branchée sur événements et
> contrats, **hors** du chemin critique des écritures engageantes. L'IA **propose**,
> un humain **valide**.
> **Avantages :** valeur (pré-remplissage, résumés, détection d'anomalie, **aide à
> la priorisation du cockpit**) sans risque sur l'intégrité ; réversibilité.
> **Alternatives rejetées :** IA décisionnelle automatique sur actes engageants ;
> IA couplée au cœur.

### 24.2 Cas d'usage anticipés (indicatifs)
Aide au chiffrage ; détection d'anomalie de marge ; résumé de chantier ; classement
de documents ; **suggestion de priorisation et de formulation des tâches du
cockpit** ; **détection d'échéances dans des documents importés** ; assistant
conversationnel en **lecture seule** respectant les droits.

### 24.3 Souveraineté des données
Pas d'entraînement tiers sur données personnelles/stratégiques sans base légale ;
minimisation du contexte ; traitement UE privilégié ; journalisation ; dégradation
gracieuse (sans IA, tout fonctionne).

### 24.4 Ce que l'architecture prévoit dès maintenant
Des **événements riches** et des **contrats stables** suffisent : l'IA se branchera
plus tard **sans modifier les modules**. Aucune brique IA développée à ce stade.

---

## 25 — Gestion des erreurs

### 25.1 Principes
> **Recommandé :** erreurs **explicites, cohérentes, non silencieuses** : format
> unique (code, message, détails, identifiant de corrélation) ; distinction
> validation / métier / technique.
> **Alternatives rejetées :** erreurs opaques ; erreurs ignorées.

### 25.2 Robustesse
Résultat **complet avant écriture** (pas d'écriture partielle) ; **écran de
récupération** copiable ; traitements asynchrones avec **réessais** et **file
d'échec** analysable.

---

## 26 — Observabilité et journaux techniques

### 26.1 Trois piliers
**Journaux** structurés corrélés ; **métriques** techniques (latence, erreurs,
files, échecs de synchro) **et** métier (devis émis, marge, chantiers en retard,
**échéances véhicules/contraventions à venir**) ; **traces** de bout en bout.

### 26.2 Alertes techniques
File bloquée, connecteur en panne, échec de sauvegarde, taux d'erreur anormal,
synchro durablement en échec.

### 26.3 Distinction avec l'audit
Observabilité = exploitation technique ; audit = conformité. Séparés.

---

## 27 — Tests

### 27.1 Stratégie
> **Recommandé :** majorité de **tests unitaires** sur le **cœur métier pur**
> (moteur financier, **moteur de priorisation**, **calcul des coûts et des
> échéances véhicules**) ; **intégration** (API + base + événements) ; **contrat**
> (front/back/connecteurs vs spécification) ; **migration** (aller-retour) ;
> **bout-en-bout** minimal sur les parcours critiques ; **tests de performance** sur
> les projections de pilotage.
> **Alternatives rejetées :** tout en bout-en-bout ; ne pas tester le cœur.

### 27.2 Non-régression métier
Chaque anomalie corrigée est verrouillée par un **test qui la reproduit**.

---

## 28 — Environnements de développement, test et production

### 28.1 Trois environnements
Développement (données fictives) ; Recette (copie **anonymisée** de production,
tests de migration) ; Production (données réelles, RGPD).

### 28.2 Règles
> **Recommandé :** **isolation stricte** des environnements ; migration jouée
> **d'abord en recette** ; **intégration et déploiement continus** (lint, tests,
> sécurité, build, déploiement) ; **déploiements petits et fréquents** ; **drapeaux
> de fonctionnalité**.
> **Alternatives rejetées :** déploiement manuel sans recette ; grosses livraisons
> rares.

---

## 29 — Versionnement et migrations

### 29.1 Versionnement
Code (sémantique) ; API (versionnée, sans rupture publiée) ; événements (version par
type, additifs) ; base (migrations versionnées, ordonnées, automatiques).

### 29.2 Migrations sans rupture (P1)
> **Recommandé :** **additives par défaut** ; renommage/suppression **en trois
> temps** ; **réversibles** ; **idempotentes** ; testées sur copie de production.
> **Alternatives rejetées :** migrations destructives directes ; renommage brutal.

---

## 30 — Prévention des régressions

| Dispositif | Rôle |
|---|---|
| Tests de non-régression | Chaque bug verrouillé par un test. |
| Verrou optimiste | Écriture sur révision périmée refusée, jamais écrasée. |
| Contrats versionnés | API/événement publié jamais changé de façon incompatible. |
| Migrations réversibles | Toute évolution de schéma réversible et testée. |
| Revue de code obligatoire | Au moins un pair, grille des principes (chapitre 2). |
| Drapeaux de fonctionnalité | Activation progressive, désactivation rapide. |
| Intégration continue | Rien de fusionné sans lint/tests/analyses. |
| **Business Rules Bible** | **Une règle métier importante n'est codée qu'après avoir été définie et validée (P13).** |

Règle culturelle : graphe de dépendances **sans cycle** ; dette remboursée en
continu, jamais par « grande refonte ».

---

## 31 — Scalabilité et évolutivité

### 31.1 Évolutivité fonctionnelle (priorité)
Ajouter un module sans toucher les autres, via cloisonnement (P3), contrats (P10),
événements. L'ajout des modules Parc et Contraventions en v1.1 **valide** cette
capacité : ils se greffent sans modifier Finance ni Chantiers.

### 31.2 Scalabilité technique (proportionnée)
> **Recommandé :** commencer simple (une base, un déployable) ; scaler **quand un
> besoin réel apparaît** : lecture séparée pour le pilotage (projections), mise à
> l'échelle horizontale de l'application sans état, extraction d'un module en service
> seulement si justifié.
> **Alternatives rejetées :** distribué d'emblée ; conception non scalable.

### 31.3 Multi-entreprise
Prévu par conception (9.2), sans refonte.

---

## 32 — Analyse des risques

| Risque | Gravité | Prob. | Atténuation |
|---|---|---|---|
| Perte/corruption de données | Très élevée | Faible | Sauvegardes testées + hors-site + ACID + audit. |
| Fuite de données (clients, salariés, **conducteurs/infractions**) | Très élevée | Moyenne | Auth forte, autorisation serveur, chiffrement, RGPD, cloisonnement renforcé (20.2). |
| Calcul erroné (financier, coûts, priorisation) | Élevée | Moyenne | Moteurs centralisés, purs, testés ; rien dans l'UI. |
| Règle métier codée sans définition | Élevée | Moyenne | Business Rules Bible obligatoire (P13, D30). |
| Régression sur l'existant | Élevée | Moyenne | Tests de non-régression, contrats versionnés, migrations réversibles. |
| Couplage rampant entre modules | Élevée | Moyenne | Cloisonnement physique, revue, graphe sans cycle. |
| Automatisation agissant en masse à tort | Élevée | Faible | Simulation, journalisation, brouillon validé, limitation de débit. |
| Alertes trop nombreuses (fatigue du dirigeant) | Moyenne | **Élevée** | Priorisation intelligente, regroupement, seuils configurables (chapitre 38). |
| Sur-ingénierie | Moyenne | Moyenne | Simplicité, monolithe modulaire d'abord. |
| Périmètre qui gonfle (dérive du produit) | Moyenne | **Élevée** | Vagues livrables, modules futurs assumés, questions ch. 35 tranchées avant de coder. |
| Dépendance fournisseur | Moyenne | Moyenne | Standards ouverts, réversibilité. |

> **Risque mis en avant en v1.1 : la fatigue d'alerte.** Un « système
> d'exploitation du dirigeant » qui alerte trop devient du bruit. La **priorisation
> intelligente** (chapitre 38) est la parade : elle **hiérarchise** au lieu de tout
> remonter.

---

## 33 — Décisions d'architecture proposées

> Décisions soumises à validation. Une fois validées : décisions officielles (ADR),
> datées, non supprimables (P12).

| # | Décision | Résumé |
|---|---|---|
| D1 | Monolithe modulaire évolutif | Un déployable, modules cloisonnés. |
| D2 | PostgreSQL, source de vérité unique | ACID + souplesse documentaire. |
| D3 | Séparation stricte présentation/logique/stockage | Aucun calcul dans l'interface. |
| D4 | Multi-entreprise dès le jour 1 | Identifiant d'organisation + niveau ligne. |
| D5 | Couplage inter-modules par contrat et événements | Jamais d'accès direct aux données d'autrui. |
| D6 | API-first, REST versionnée + événements | Contrats stables, documentés, testés. |
| D7 | Moteurs de calcul centralisés, purs, testés | Financier, coûts, priorisation ; rien dans l'UI. |
| D8 | Authentification déléguée (protocole ouvert) | Pas de mot de passe maison, second facteur. |
| D9 | Rôles + attributs (autorisation serveur) | Moindre privilège, cloisonnement fin. |
| D10 | Audit immuable + historique des modifications | Traçabilité intégrale. |
| D11 | Stockage objet pour les fichiers | Séparé, versionné, immuable pour les actes émis. |
| D12 | Boîte d'envoi transactionnelle | Aucun événement perdu. |
| D13 | Moteur d'automatisation configurable et gouverné | Règles = données, simulation, garde-fous. |
| D14 | Sauvegardes chiffrées testées + plan de reprise | Base + fichiers, hors-site, restauration prouvée. |
| D15 | Imports Excel/CSV guidés, validés, asynchrones, idempotents | Reprise de l'existant sans corruption. |
| D16 | Intégration BRN Visite Technique par connecteur | Deux applications distinctes. |
| D17 | IA en couche d'augmentation (préparée) | Événements + contrats suffisent aujourd'hui. |
| D18 | Web responsive multi-support | Un socle, trois supports. |
| D19 | Migrations additives et réversibles | Non-régression dans le temps. |
| D20 | Hébergement UE, standards ouverts | RGPD et réversibilité. |
| **D21** | **Historisation par tables d'historique + événements** | Pas d'event sourcing complet (9.6, 19.3). |
| **D22** | **Projections de pilotage alimentées par événements** | Tableaux de bord rapides, cohérents, reconstructibles (3.4). |
| **D23** | **Numérotation légale séquentielle des documents financiers** | Continue, sans trou, à l'émission (15.6). |
| **D24** | **Hors-ligne limité aux usages nomades simples** | Consultation + saisie différée d'objets simples (7.5). |
| **D25** | **Signature électronique via prestataire (place réservée)** | Pour devis, PV, documents du cockpit (16.4). |
| **D26** | **Module Parc Véhicules complet** | Flotte, entretiens, coûts, alertes, documents (ch. 36). |
| **D27** | **Module Contraventions complet** | Infractions, coûts, échéances, statistiques (ch. 37). |
| **D28** | **Espace Dirigeant + moteur de priorisation intelligente** | Cockpit ; priorisation déterministe, pondérations = données (ch. 38). |
| **D29** | **Préparation de la synchronisation Apple Calendar** | Via connecteur ; rien développé maintenant (ch. 40). |
| **D30** | **Business Rules Bible obligatoire** | Aucune règle métier importante codée sans définition préalable (P13, ch. 41). |
| **D31** | **BRN Pilot = système d'exploitation du dirigeant** | Le dirigeant et sa journée sont des objets métier de premier rang (1.7). |
| **D32** | **Retrait de SAV et Maintenance du périmètre V1** | Conservés comme modules futurs (4.4). |

---

## 34 — Ordre recommandé de développement des modules

> **Principe :** chaque vague est **livrable et utile seule**, ne casse jamais la
> précédente (P1). L'ordre concilie les deux axes de valeur (chapitre 3.1).

| Vague | Contenu | Valeur livrée |
|---|---|---|
| **0** | Socle & Référentiels : organisation, tiers, identité, rôles, référentiels, documents, événements, audit, **échéancier**, base, sécurité, sauvegardes. | La fondation sécurisée et traçable, et la mécanique d'échéances qui nourrit toutes les alertes. |
| **1** | **Espace Dirigeant (cockpit)** de base : tâches, notes, échéances, obligations, priorisation ; **Tableau de bord du dirigeant** (zones, d'abord alimenté par ce qui existe). | Le dirigeant a immédiatement un poste de commandement, même avant que tous les modules existent. |
| **2** | CRM léger + Finance (devis, moteur financier, numérotation légale) + première automatisation. | De l'affaire au devis chiffré, sans ressaisie. |
| **3** | Chantiers (planning, avancement, coût réel) + enrichissement du tableau de bord (zone Entreprise). | Le pilotage : marge, retards, santé des chantiers. |
| **4** | **Parc Véhicules** + **Contraventions** + zone « Parc automobile » du tableau de bord. | Flotte et infractions pilotées ; coûts rattachés ; alertes d'échéances. |
| **5** | RH (pointage) + Stock + facturation/situations + trésorerie + connecteur comptable. | Coût réel complet, encaissement, trésorerie projetée. |
| **Transverses** | Imports Excel/CSV (dès la reprise de l'existant), automatisations avancées, **connecteur BRN Visite Technique**, **préparation Apple Calendar**, préparation IA. | Introduits dès qu'utiles, jamais en préalable bloquant. |

> **Justification du placement précoce de l'Espace Dirigeant (Vague 1).** La
> philosophie D31 en fait le cœur du produit ; il est en grande partie **autonome**
> (tâches, notes, échéances) et **s'enrichit** ensuite des événements des autres
> modules **sans être modifié**. Le dirigeant tire de la valeur dès la Vague 1.

### 34.1 Porte de validation entre vagues
On ne démarre une vague que si la précédente est livrée, testée, sauvegardée, sans
régression, et si ses événements sont émis et observables.

---

## 35 — Questions métier restant à valider

**Périmètre et frontières**
1. Comptabilité et paie **légales** externes (nourries par connecteur) en V1 ?
2. Portail **client/sous-traitant** attendu à moyen terme ?
3. Confirmation du **retrait de SAV/Maintenance** de la V1 (report assumé) ?

**Finance**
4. Règles d'**arrondi** et de TVA (par ligne/total/taux).
5. Modèle des **situations de travaux** (avancement, retenue de garantie, révision).
6. Structure de la **bibliothèque de prix** (déboursés, main-d'œuvre, marges).
7. Définition partagée de la **marge** (déboursé sec ? coût de revient complet ?).
8. Règles de **numérotation légale** (annulations, avoirs, séquences).

**Parc Véhicules**
9. Liste des **types d'entretien** et périodicités (au km et/ou dans le temps).
10. Délais d'**alerte** par échéance (assurance, contrôle technique, vidange, pneus).
11. Méthode de **coût d'exploitation** (postes inclus : carburant, entretien,
    assurance, leasing, contraventions ? coût au km ?).
12. **Leasing vs crédit** : quelles données et échéances suivre exactement ?

**Contraventions**
13. **Types d'infraction** et **barèmes** (montant, points) à référencer.
14. Processus de **contestation** (étapes, délais, justificatifs).
15. Règles d'**imputation** (qui paie : entreprise ou conducteur ?) et implications
    RH/RGPD.

**Espace Dirigeant / priorisation**
16. **Pondérations** de la priorisation (urgence, importance, délai, impact
    financier, impact opérationnel) : valeurs de départ et qui peut les régler.
17. Catégories d'**obligations administratives et fiscales** à suivre et leurs
    échéances types.
18. Quelles **validations/signatures** doivent obligatoirement passer par le
    dirigeant.

**Intégration et données**
19. **Volume/format** des données à reprendre par import (véhicules, contraventions,
    clients, coûts).
20. **Périmètre** d'échange avec *BRN Visite Technique* (métré → devis seulement ?)
    et **réconciliation des tiers**.
21. Périmètre exact de la future **synchronisation Apple Calendar** (lecture seule
    d'abord ?).

**Conformité et exploitation**
22. Objectifs chiffrés **RPO/RTO**.
23. **Durées de conservation** par type de document/donnée.
24. Choix du **langage/écosystème backend** définitif.
25. Niveau de **signature électronique** requis (simple, avancée, qualifiée) et
    prestataire.

**Organisation**
26. Périmètre de la **première mise en service** (quelle vague est le « minimum
    utile » pour la direction).

---

# Partie II — Spécifications des modules ajoutés en v1.1

## 36 — Module Parc Véhicules

### 36.1 Objectif
Un **véritable module de gestion de flotte** : chaque véhicule a une **fiche
complète**, un **historique**, des **coûts** et des **alertes automatiques**.

### 36.2 Décision de cadrage
> **Solution recommandée.** Un module autonome **Parc Véhicules**, propriétaire de
> ses données, qui **émet des dépenses vers Finance** et **des échéances vers le
> socle** (source des alertes et du cockpit), sans couplage direct.
> **Raisons.** Le parc est un domaine à part entière (coûts, conformité, sécurité) ;
> il doit être pilotable seul et alimenter le tableau de bord.
> **Avantages.** Cloisonnement, coûts consolidés, alertes unifiées via l'échéancier.
> **Limites.** Nécessite des référentiels dédiés (types d'entretien, seuils).
> **Alternatives rejetées.** Gérer les véhicules dans un tableur (pas d'alertes, pas
> de traçabilité) ; les diluer dans Finance (perte de la vision flotte).

### 36.3 Fiche véhicule (dictionnaire de données indicatif)

| Groupe | Champs |
|---|---|
| Identité | immatriculation, marque, modèle, année, type/catégorie, date de mise en circulation. |
| Usage | conducteur principal (tiers), affectation (chantier/service), kilométrage (relevés datés). |
| Énergie | carburant, consommation (référence et réelle calculée). |
| Contrats | assurance (assureur, police, échéance), **leasing ou crédit** (organisme, mensualité, échéances, terme). |
| Conformité | carte grise (document), **contrôle technique** (date, échéance, document). |
| Entretien | historique des **entretiens**, historique des **réparations**, **vidanges** (date, km), **pneus** (jeu, état, km, saison), **batterie** (date, état). |
| Coûts | **coûts d'exploitation** (agrégés depuis les dépenses, chapitre 36.4). |
| Pièces jointes | **documents** (carte grise, assurance, contrôle technique, factures) et **photos**. |

### 36.4 Coûts d'exploitation (calcul centralisé — P6)
Les **dépenses** (Finance) rattachées à un véhicule (carburant, entretien,
réparation, assurance, leasing, **contraventions**) sont **agrégées
automatiquement** (via événement, chapitre 11.3) en un **coût d'exploitation** par
véhicule et par période. Le calcul (coût total, coût au kilomètre, répartition par
poste) est réalisé par le **moteur de coûts centralisé**, jamais dans l'interface.

### 36.5 Alertes automatiques (via échéancier + automatisations)
Le module produit des **échéances typées** qui déclenchent des alertes :
**assurance**, **contrôle technique**, **entretien** (date et/ou kilométrage),
**vidange**, **pneus**, **échéances** de contrat (leasing/crédit). Délais d'alerte
**configurables** (référentiel, P7). Ces alertes remontent au **cockpit dirigeant**
et à la zone « Parc automobile » du tableau de bord.

### 36.6 Événements émis
*Véhicule ajouté/mis à jour*, *Relevé kilométrique enregistré*, *Entretien
réalisé*, *Réparation enregistrée*, *Dépense véhicule enregistrée*, *Échéance
véhicule proche*.

### 36.7 Sécurité et RGPD
Le conducteur est une donnée personnelle : accès restreint (direction,
gestionnaire de flotte, conducteur pour ses propres données), journalisé.

---

## 37 — Module Contraventions

### 37.1 Objectif
Un **véritable suivi des contraventions** : chaque infraction est tracée, chiffrée,
échéancée, et statistiquement analysée.

### 37.2 Décision de cadrage
> **Solution recommandée.** Un module autonome **Contraventions**, rattaché à un
> **véhicule** (Parc) et à un **conducteur** (tiers/RH), qui **émet des dépenses**
> (le montant) et des **échéances** (délais de paiement/contestation).
> **Raisons.** Sujet sensible (points, identité, délais légaux) exigeant traçabilité
> et cloisonnement.
> **Avantages.** Coûts et statistiques consolidés ; échéances qui ne se ratent pas ;
> conformité RGPD.
> **Limites.** Données personnelles sensibles → accès très restreint.
> **Alternatives rejetées.** Suivi dans un tableur (délais manqués, pas de
> statistiques) ; fusion avec le Parc (mélange de responsabilités et d'accès).

### 37.3 Fiche contravention (dictionnaire de données indicatif)

| Groupe | Champs |
|---|---|
| Rattachement | **véhicule**, **conducteur** (tiers). |
| Fait | **date**, **heure**, **lieu**, **type d'infraction** (référentiel). |
| Sanction | **montant**, **perte de points**. |
| Traitement | **statut** (à traiter, payée, contestée, classée), **paiement**, **contestation**. |
| Délais | **délai de paiement**, **délai de contestation** (échéances typées). |
| Pièces | **justificatifs** (avis, constat), **observations**. |

### 37.4 Production automatique
> **Recommandé :** le module produit automatiquement **alertes** (délais de
> paiement/contestation), **statistiques** (nombre, montants), **coût annuel**,
> **coût par véhicule**, **coût par conducteur**, **historique**, **échéances**.
> Tous ces chiffres sont **calculés** par le moteur de coûts centralisé, jamais
> saisis ni codés en dur dans l'interface.

### 37.5 Événements émis
*Contravention enregistrée*, *Contravention à payer* (échéance), *Contestation
déposée*, *Contravention classée*.

### 37.6 Sécurité et RGPD (renforcé)
Données **particulièrement sensibles** (infractions, points, identité). Accès
strictement restreint (direction, gestionnaire de flotte), journalisé. Imputation
au conducteur : règle métier à définir (Business Rules Bible) avec précautions
RGPD/droit du travail (question ch. 35).

---

## 38 — Espace Dirigeant (cockpit) et priorisation intelligente

### 38.1 Objectif
Le **poste de commandement personnel** du dirigeant : rassembler et **hiérarchiser**
tout ce qui requiert son attention, quelle qu'en soit la source.

### 38.2 Contenu
Tâches ; **décisions à prendre** ; **validations** ; **signatures** ; **appels** ;
**relances** ; **rendez-vous** ; **échéances** ; **obligations administratives et
fiscales** ; **documents à signer** ; **objectifs personnels** ; **notes**.

Ces objets sont soit **saisis** par le dirigeant, soit **créés automatiquement** par
les événements des autres modules (une facture impayée devient une relance à faire ;
un contrôle technique proche devient une tâche ; une contravention à payer devient
une échéance ; une obligation fiscale approche).

### 38.3 Priorisation intelligente (décision D28 — calcul centralisé P6)
> **Solution recommandée.** Un **moteur de priorisation** déterministe qui classe
> chaque tâche selon **cinq facteurs** — **urgence**, **importance**, **délai**,
> **impact financier**, **impact opérationnel** — via une **pondération
> configurable** (données, pas code, P7). Il produit :
> - une **matrice** urgence × importance (type Eisenhower) : *Faire maintenant /
>   Planifier / Déléguer / Différer* ;
> - un **score de priorité** global (combinaison pondérée des cinq facteurs) qui
>   **trie** les tâches dans chaque case ;
> - une **explication** (pourquoi cette tâche est prioritaire), pour la transparence.
>
> **Raisons.** Un dirigeant submergé a besoin qu'on **hiérarchise**, pas qu'on
> empile. La règle doit être **déterministe, explicable et réglable**.
> **Avantages.** Clarté décisionnelle (qualité n°5) ; cohérence ; transparence ;
> réglable sans redéploiement (pondérations = données).
> **Limites.** Les bons **poids** demandent du réglage métier (Business Rules Bible,
> question ch. 35) ; risque de fausse précision si mal calibré.
> **Alternatives rejetées.** Tri par simple date d'échéance (ignore l'impact) ;
> priorisation 100 % IA « boîte noire » (non explicable, non maîtrisée — l'IA pourra
> **suggérer**, pas décider seule, chapitre 24) ; priorité saisie à la main
> uniquement (ne passe pas à l'échelle).

### 38.4 Où vit le calcul
Le moteur de priorisation est un **calcul métier central** (comme le moteur
financier) : dans la logique métier, **pur**, **testé**, **jamais dans
l'interface**. L'interface **affiche** un ordre et une explication fournis par le
serveur.

### 38.5 Gouvernance des alertes (anti-fatigue)
Pour éviter la **fatigue d'alerte** (risque ch. 32), le cockpit **regroupe**
(plusieurs échéances d'un même véhicule = une entrée), **hiérarchise** (les urgences
à fort impact d'abord) et respecte des **seuils configurables**. Objectif : *une
poignée d'actions vraiment importantes*, pas une liste interminable.

### 38.6 Événements émis / écoutés
Écoute **tous** les événements porteurs d'une action pour le dirigeant
(impayé, échéance, réserve, contravention, obligation…). Émet *Tâche créée*,
*Décision prise*, *Validation accordée/refusée*, *Signature effectuée*.

### 38.7 Sécurité
Espace **strictement personnel** au dirigeant (et délégués explicites), accès
restreint et journalisé.

---

## 39 — Tableau de bord du dirigeant (zones)

### 39.1 Rôle
**Écran d'entrée** de *BRN Pilot* : en un coup d'œil, l'état de l'entreprise, la
journée du dirigeant, et le parc. Organisé en **trois zones**.

### 39.2 Zone ENTREPRISE
Trésorerie ; chiffre d'affaires ; marge ; bénéfice ; devis ; impayés ; chantiers ;
alertes.

### 39.3 Zone DIRIGEANT
Rendez-vous du jour ; tâches prioritaires ; appels ; validations ; signatures ;
urgences ; échéances.

### 39.4 Zone PARC AUTOMOBILE
Véhicules ; assurances ; contrôles techniques ; entretiens ; contraventions ; coût
du parc.

### 39.5 Principes de conception
> **Recommandé :** chaque zone lit des **projections** (chapitre 3.4), jamais les
> tables des modules directement ; **aucune donnée financière codée en dur** ; les
> chiffres sont **calculés** par les moteurs centraux. La hiérarchie visuelle met en
> avant **ce qui exige une action** (urgences, échéances proches, dérives).
> **Avantages :** cohérence, performance, respect du cloisonnement.
> **Limites :** cohérence éventuelle (léger décalage) à assumer.
> **Alternatives rejetées :** widgets interrogeant directement plusieurs modules
> (violent P3) ; chiffres figés dans l'interface (faux, non traçables).

### 39.6 Lien avec le prototype UX
Le prototype existant illustre **visuellement** la zone Entreprise et le style des
cartes/alertes. Il sert de **référence UX**, pas de base technique ; les zones
Dirigeant et Parc restent à concevoir dans l'**UX/UI Bible**.

---

## 40 — Préparation de la synchronisation Apple Calendar

### 40.1 Position de principe
> **Aucune synchronisation n'est développée maintenant.** On **prépare seulement
> l'architecture** pour brancher plus tard **Apple Calendar** et récupérer
> automatiquement **rendez-vous, déplacements, réunions, rappels**.

### 40.2 Mécanisme prévu (décision D29)
> **Solution recommandée.** Un **connecteur Calendrier** dédié (même principe qu'au
> chapitre 23) qui traduira les rendez-vous Apple Calendar en **échéances /
> rendez-vous** du cockpit, via un **protocole standard** (par exemple l'accès
> calendrier standardisé côté Apple), en commençant par une **lecture seule**.
> **Raisons.** Isoler le service externe ; permettre l'ajout sans toucher les
> modules ; réversibilité (un autre calendrier plus tard).
> **Avantages.** Couplage faible ; le cockpit se nourrit de l'agenda réel du
> dirigeant sans ressaisie.
> **Limites.** Dépendance à l'API Apple et à l'authentification associée (à cadrer le
> moment venu).
> **Alternatives rejetées.** Intégration directe dans un module (couplage) ;
> ressaisie manuelle des rendez-vous.

### 40.3 Ce qui rend cette future intégration possible dès maintenant
- L'entité **Échéance/Rendez-vous** (chapitre 10.4) est **déjà** le point d'accroche.
- Le **connecteur** est un patron déjà prévu (chapitre 23) et un **type de canal**
  d'événement (« connecteur ») est déjà dans l'enveloppe (chapitre 13.3).
- La famille d'endpoints **Calendrier** est **réservée** (chapitre 12.3).

Aucune ligne d'intégration n'est écrite : l'architecture **laisse la place**, c'est
tout.

---

# Partie III — Gouvernance

## 41 — Documents fondateurs du projet (les « bibles »)

### 41.1 Principe
Avant d'écrire la moindre ligne de code, *BRN Pilot* se dote d'un **corpus de
documents fondateurs**. Aucune règle métier importante n'est développée sans avoir
été définie au préalable (principe P13, décision D30).

### 41.2 Les documents fondateurs

| Document | Rôle | État |
|---|---|---|
| **Master Blueprint (Architecture)** | La présente référence : structure, principes, décisions. | En relecture (v1.1). |
| **UX/UI Bible** | Langage visuel, composants, écrans, ergonomie, accessibilité, zones du tableau de bord. | À produire. |
| **Data Bible** | Modèle de données détaillé, dictionnaire, historisation, projections, rétention. | À produire. |
| **Business Rules Bible** | **Toutes** les règles métier et automatismes centralisés (finance, marge, coûts, priorisation, alertes, contraventions, échéances). **Aucune règle importante codée sans y figurer.** | À produire. |
| **Automation Bible** | Catalogue des automatisations (déclencheurs, conditions, actions, garde-fous). | À produire. |
| **API Bible** | Contrats détaillés, conventions, versionnage, sécurité des API. | À produire. |
| **Security Bible** | Authentification, autorisation, RGPD, chiffrement, audit, secrets. | À produire. |
| **Developer Bible** | Conventions de code, structure des modules, tests, CI/CD, migrations, revue. | À produire. |

### 41.3 Ordre et dépendances (proposition)
1. **Master Blueprint** (socle de tout) — en cours.
2. **Business Rules Bible** et **Data Bible** (en parallèle : les règles et les
   données se répondent).
3. **API Bible** et **Security Bible** (une fois données et règles cadrées).
4. **Automation Bible** (s'appuie sur événements et règles).
5. **UX/UI Bible** (peut avancer tôt côté maquettes, se fige après les données).
6. **Developer Bible** (juste avant le code).

### 41.4 Règle d'or de gouvernance
> **Aucune ligne de code n'est écrite avant que les documents fondateurs concernés
> soient validés.** Un développement qui introduirait une règle métier absente de la
> Business Rules Bible est **non conforme** et refusé en revue (P13, D30).

---

## Fin du document

> **Rappel.** Document d'architecture fondateur **v1.1**, en **relecture — non
> figé officiellement**. Sans code, sans interface, sans maquette. Le prototype HTML
> existant est référencé **uniquement** comme expérimentation UX non connectée aux
> données réelles.
>
> Après validation, les décisions du chapitre 33 (D1 à D32) deviennent officielles,
> les questions du chapitre 35 sont tranchées, et la production des autres documents
> fondateurs (chapitre 41) peut commencer — avant toute écriture de code.
