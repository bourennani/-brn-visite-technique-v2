# 00 — Vision & principes directeurs

## 1. La vision

BRN Group est une **entreprise générale du bâtiment** : elle étudie, chiffre,
réalise, livre et entretient des chantiers. Aujourd'hui, le dirigeant pilote son
entreprise avec un logiciel de métré, des tableurs, une messagerie, un logiciel
comptable, et sa mémoire. L'information est **fragmentée** : le devis ne connaît
pas le métré, le chantier ne connaît pas la marge réelle, le SAV ne connaît pas
qui a posé quoi, la paie ne connaît pas les heures pointées sur le chantier.

L'ERP de pilotage a un objectif unique et mesurable :

> **Donner au dirigeant, à tout instant, une vision fiable et à jour de la santé
> de chaque chantier et de l'entreprise entière — de la première visite au dernier
> jour de garantie — sur une seule source de vérité.**

« Pilotage » est le mot-clé. Ce n'est pas un outil de saisie, c'est un outil de
**décision** : marge prévue vs réalisée, trésorerie projetée, charge des équipes,
retards, litiges, stock immobilisé. La saisie n'existe que pour nourrir la
décision.

## 2. Les qualités visées (exigences non fonctionnelles)

On conçoit pour ces qualités, dans cet ordre de priorité :

| Priorité | Qualité | Ce que ça impose |
|---|---|---|
| 1 | **Intégrité des données** | Aucune perte, aucune corruption, traçabilité totale. Une donnée de chantier vaut de l'argent et engage juridiquement. |
| 2 | **Évolutivité (extensibilité)** | Ajouter un module ne doit demander de toucher aucun module existant. C'est l'exigence centrale du projet. |
| 3 | **Disponibilité terrain** | Fonctionne hors-ligne, sur mobile, dans un sous-sol sans réseau. |
| 4 | **Sécurité & conformité** | RGPD, cloisonnement des rôles, secret des données clients et salariés. |
| 5 | **Maintenabilité** | Un développeur nouveau doit comprendre où poser son code en une journée. |
| 6 | **Performance perçue** | Interface instantanée (local-first), calculs lourds asynchrones. |
| 7 | **Coût maîtrisé** | Une TPE/PME du bâtiment : pas d'infrastructure surdimensionnée avant d'en avoir besoin. |

> **Arbitrage fondateur :** on privilégie *évolutivité + intégrité* sur
> *performance brute* et *sophistication technique*. On refuse la complexité qui
> ne sert pas une de ces qualités.

## 3. Les 12 principes directeurs

Ces principes sont la constitution du projet. Chacun est **actionnable** et
**vérifiable en revue de code**.

### P1 — On ne casse jamais l'existant

Déjà à l'œuvre dans la v2 (`migrerVisite`, `migrerRoom` dans `src/lib/store.js` :
on complète, on ne réécrit jamais). On le généralise :

- Toute modification de schéma est **additive** par défaut (nouveau champ, nouvelle
  table). Une suppression ou un renommage passe par une migration en deux temps
  (écriture double, puis bascule) documentée.
- Toute donnée écrite par une version doit rester **lisible** par la version
  suivante. Les migrations sont **idempotentes** et **réversibles**.
- Un contrat d'API publié ne change jamais de façon incompatible : on **versionne**
  (`/v1`, `/v2`), on ne casse pas `/v1`.

### P2 — Contextes délimités, couplage par contrat

Chaque domaine (Finance, Chantiers, CRM, RH, Stock, SAV, Maintenance, Documents)
est un **contexte délimité** au sens du *Domain-Driven Design*. Règle absolue :

- Un module **n'accède jamais directement** aux tables d'un autre module.
- Deux modules communiquent par **appel de contrat** (API interne typée) ou par
  **événement de domaine** (voir chap. 06).
- Chaque module possède ses données et son langage. Le mot « client » n'a pas le
  même sens exact en CRM (prospect/compte) et en Finance (tiers facturable) : on
  relie par identifiant, on ne fusionne pas les modèles.

### P3 — L'événement de domaine est la colonne vertébrale

Tout fait métier significatif (`DevisAccepté`, `ChantierDémarré`, `FactureÉmise`,
`HeuresPointées`, `StockSorti`, `TicketSAVOuvert`) émet un **événement immuable,
horodaté, attribué**. Les événements servent à : la piste d'audit, la
synchronisation entre modules, les automatisations, l'analytique, l'IA. On ne
recalcule pas l'histoire, on la rejoue.

### P4 — Local-first sur le terrain

Le poste de travail terrain (métreur, chef de chantier, technicien) tient un
**cache local complet** de ce dont il a besoin et travaille dessus sans réseau.
La synchronisation est **différée, robuste, avec résolution de conflits explicite**
(voir chap. 09). C'est l'ADN de la v2 (IndexedDB, service worker, repli mémoire),
érigé en règle.

### P5 — API-first, contrats explicites et versionnés

Aucune fonctionnalité n'existe sans contrat. Le contrat (schéma de données +
opérations) est **écrit avant** l'implémentation, versionné, testé. Le front web,
le mobile, les connecteurs externes et l'IA consomment **les mêmes contrats**.

### P6 — Séparation stricte lecture / écriture des règles métier

Le **cœur métier** (calcul de métré, moteur de chiffrage, règles de marge, calcul
de paie) est **pur** : des fonctions déterministes, sans effet de bord, sans I/O.
Déjà le cas dans la v2 (`src/lib/calc.js`, `travaux.js` : le rapport relit le
« catalogue vivant » et recalcule via `calcPoste()`, il ne stocke pas d'agrégat
figé — cf. correctif 2.2.1). Cette pureté est ce qui rend le métier **testable,
rejouable et portable** (même code côté client et côté serveur).

### P7 — Configuration plutôt que code

Les catalogues (types de pièces, lots/corps d'état, ouvrages, pathologies,
appareillages, marges, profils métier) sont des **données de configuration**, pas
du code figé. La v2 le montre déjà : `catalogue.js`, `profils.js`. À terme ces
catalogues deviennent éditables par un administrateur métier **sans déploiement**.
Un nouveau corps d'état, une nouvelle marge, un nouveau type de bien = de la
donnée, pas une livraison.

### P8 — Multi-tenant par conception, mono-tenant en exploitation

Même si BRN Group est aujourd'hui **seul utilisateur**, chaque donnée porte dès
le premier jour un identifiant d'**organisation** (`org_id`). Coût nul aujourd'hui,
il rend possible demain : filiales, franchises, mode SaaS, cloisonnement d'un
sous-traitant. On ne rétro-ajoute jamais le multi-tenant : il se conçoit d'emblée.

### P9 — Sécurité et RGPD dans le socle

Chaque donnée a un **propriétaire**, une **base légale**, une **durée de
conservation**. Chaque accès est **authentifié, autorisé, journalisé**. Le
chiffrement au repos et en transit est la règle. Les données personnelles
(clients, salariés) sont **minimisées, cloisonnées, exportables et effaçables**.

### P10 — L'IA augmente, elle ne décide pas seule

L'IA (chap. 07) est une **couche d'augmentation** branchée sur les contrats et les
événements. Elle propose (pré-remplissage d'un métré depuis une photo, détection
d'anomalie de marge, résumé de chantier), un humain valide. Elle n'est **jamais**
dans le chemin critique d'une écriture métier engageante. Ses données
d'entraînement et d'inférence respectent la souveraineté (P9).

### P11 — Le monolithe modulaire d'abord

On démarre par un **monolithe modulaire** (un seul déployable, modules
cloisonnés en interne), pas par des microservices. On n'extrait un service que
lorsqu'une contrainte réelle l'exige (montée en charge isolée, équipe dédiée,
cycle de vie divergent). L'architecture est **prête** pour l'extraction (P2, P3)
mais ne la paie pas avant l'heure. C'est le principal levier de **maîtrise du
coût pour une PME**.

### P12 — Toute décision structurante est écrite

Un choix qui engage l'architecture pour des années s'écrit dans un **ADR**
(`adr/`). On documente le **contexte**, les **options**, la **décision** et ses
**conséquences**. Un ADR ne se supprime pas ; il se remplace. C'est la mémoire
longue du projet, indépendante des personnes.

## 4. Ce qu'on refuse explicitement (anti-objectifs)

Nommer ce qu'on ne fera **pas** protège l'architecture autant que nommer ce qu'on
fera :

- **Pas de microservices prématurés.** (voir P11)
- **Pas de couplage par base de données partagée** entre modules. Jamais un
  `JOIN` de la Finance vers les tables RH.
- **Pas de logique métier dans l'interface.** Le front affiche et saisit ; il ne
  décide pas d'une règle de marge ou d'un calcul de paie.
- **Pas de dépendance à un fournisseur cloud propriétaire irremplaçable.** On
  s'appuie sur des standards (PostgreSQL, S3, OIDC) pour préserver la
  réversibilité.
- **Pas de « big bang ».** L'ERP se construit module par module, chacun apportant
  de la valeur seul, sans attendre le suivant.
- **Pas de suppression physique** des données métier engageantes : on archive et
  on trace (*soft delete* + événement), on n'efface pas — sauf droit à l'effacement
  RGPD, qui est un processus tracé et non un `DELETE`.

## 5. Le fil rouge : de la visite à la garantie

Pour vérifier qu'une décision sert la vision, on la confronte au **parcours de
valeur** de l'entreprise. Toute l'architecture existe pour que cette chaîne soit
**continue et sans ressaisie** :

```
Prospect (CRM)
  → Visite technique + Métré (Études)      ← le module actuel, point de départ
    → Devis / Chiffrage (Finance)
      → Chantier planifié (Chantiers + RH + Stock)
        → Réalisation, pointage, achats, avancement
          → Facturation, situations, encaissement (Finance)
            → Réception, levée des réserves (Chantiers)
              → Garantie, SAV, Maintenance
```

À chaque flèche, **aucune donnée ne se ressaisit** : elle circule par contrat et
par événement. C'est le test de toute décision : « est-ce que ça fluidifie ce
parcours, ou est-ce que ça le fragmente ? »
